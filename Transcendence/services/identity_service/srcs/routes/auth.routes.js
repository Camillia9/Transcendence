// importe express qui est un framework Node.js pour créer des API (un serveur web)
// passport : bibliothèque qui gère l'authentification (ici avec Google).
// express.Router() : permet de regrouper les routes dans un fichier séparé.
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

import googleStrategy from '../auth/google.strategy.js';
import gitHubStrategy from '../auth/github.strategy.js';
import { generateToken } from '../../../shared/jwt.utils.js';
import prisma from '../../../prisma/prisma.js';
import { authenticate } from '../../../shared/auth.middleware.js';

import passport from 'passport';

const router = express.Router();

// inscription email + mot de passe
router.post('/auth/register', async (req, res) => {
    try{
    const { pseudo, email, password } = req.body;

    if (!pseudo || !email || !password)
        return res.status(400).json({ error: 'pseudo, email and password are required' });

    // regex simple (= regular expression / respecte la forme) qui va verifier juste qqch@qqch.qqch
    const pseudoTrimmed = pseudo.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   if (!emailRegex.test(email))
        return res.status(400).json({ error: 'Invalid email format' });

    if (email.length > 254)
        return res.status(400).json({ error: 'Email must be at most 254 characters' });

    if (pseudoTrimmed.length < 3)
        return res.status(400).json({ error: 'Username must be at least 3 characters' });

    if (pseudoTrimmed.length > 20)
        return res.status(400).json({ error: 'Username must be at most 20 characters' });

    if (password.length < 6)
        return res.status(400).json({ error: 'Password must be at least 6 characters' });

    if (password.length > 30)
        return res.status(400).json({ error: 'Password must be at most 30 characters' });

    const [emailAlreadyExist, pseudoAlreadyExist] = await Promise.all([
        prisma.user.findUnique({ where: { email }}),
        prisma.user.findUnique({ where: { pseudo: pseudoTrimmed }}),
    ]);
    // verfier que l'email et le pseudo n'existent pas deja car doit etre unique selon le schema prisma
    if (emailAlreadyExist)
        return res.status(409).json({ error: 'Email already used' });
    if (pseudoAlreadyExist)
         return res.status(409).json({ error: 'Pseudo already used' });

    // hash le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);


        const user = await prisma.user.create({
            data: {
                pseudo: pseudoTrimmed,
                email,
                passwordHash,
            },
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Account successfully created',
            token,
            user: { id: user.id, pseudo: user.pseudo, email: user.email, avatar: user.avatar, hasPassword: !!user.passwordHash },
        });
    } catch (err) {
        if (err.code === 'P2002' )
            return res.status(409).json({ error: 'Email or pseudo already used'});
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// connexion email ou pseudo + mot de passe
router.post('/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password)
            return res.status(400).json({ error: 'Identifier and password needed'});

        const identifierTrimmed = identifier.trim()

        // chercher le user par email ou pseudo
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifierTrimmed },
                    { pseudo: identifierTrimmed },
                ],
            }
        });

        if (!user || !user.passwordHash)
            return res.status(401).json({ error: 'Incorrect email or password'});

        // compare le mot de passe avec le hash
        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) {
            return res.status(401).json({ error: 'Incorrect password'});
        }

        if (user.twoFactorEnabled) {
            return res.json({
                twoFactorRequired: true,
                userId: user.id
            });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: { id: user.id, pseudo: user.pseudo, email: user.email, avatar: user.avatar, hasPassword: !!user.passwordHash }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// connexion google oauth
// express appelle passport.authenticate('google') mais passport ne connecte pas encore l'utilisateur, il le redirige vers google
// l'option scope: ['profile', 'email'] = demande a google l'autorisation d'acceder au profil et a l'adresse email
// s'il accepte, google redirige vers /auth/google/callback
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email']}));


// demande a passport de verifier que google a bien authentifier l'utilisateur
// si tout se passe bien, req.user est rempli, sinon /login est afficher
// on recupere const { token, user } = req.user;
router.get('/auth/google/callback',
    passport.authenticate('google', { session:false, failureRedirect: '/login'}),
    (req, res) => {

        const { token, user } = req.user;
        // rediriger vers le front avec le token dans l'URL
        res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    }
);


// connexion Github oauth
router.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/auth/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {

        const { token, user } = req.user;

        res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`);
    }
);


// deconnexion
// le front supprime juste son token du localstorage, on confirme juste cote back
router.post('/auth/logout', (req, res) => {
    res.json({ message: 'Successfully logged out'});
});


// activer la 2FA
router.post('/auth/2fa/setup', authenticate, async (req, res) => {
    try {
        const secret = generateSecret();

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        await prisma.user.update({
            where: {
                id: req.user.userId
            },
            data: {
                twoFactorSecret: secret
            }
        });

        const otpauth = generateURI({
            issuer: 'Transcendence',
            label: user.email,
            secret
        });

        const qrCode = await QRCode.toDataURL(otpauth);

        return res.json({ qrCode });

    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
    }
});

// verifier l'activation
router.post('/auth/2fa/verify', authenticate, async(req, res) => {
    try {
        const { code } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        if (!user.twoFactorSecret)
            return res.status(400).json({ error: "2FA not configured" });

        const result = await verify({
            token: code,
            secret: user.twoFactorSecret
        });

        if (!result.valid)
            return res.status(400).json({ error: "Invalid code" });

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                twoFactorEnabled: true
            }
        });

        return res.json({ message: "2FA enabled" });

    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
    }
});

// validation
router.post('/auth/login/2fa', async(req, res) => {
    try {
        const { userId, code} = req.body;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        if (!user.twoFactorSecret)
            return res.status(400).json({ error: "2FA not configured" });

        if (!user.twoFactorEnabled)
            return res.status(400).json({ error: "2FA is not enabled" });

        const result = await verify({
            token: code,
            secret: user.twoFactorSecret
        });

        if (!result.valid)
            return res.status(401).json({ error: 'Invalid code' });

        const token = generateToken(user);

        return res.json({
            token,
            user: { id: user.id, pseudo: user.pseudo, email: user.email, avatar: user.avatar, hasPassword: !!user.passwordHash }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// desactivation de la 2fa avec demande de mdp
router.post('/auth/2fa/disable', authenticate, async(req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }

        // recupere le user connecter
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.userId
            }
        });

        if (!user)
            return res.status(404).json({ error: 'User not found' });

        // verifie que le 2fa est activer
        if (!user.twoFactorEnabled)
            return res.status(400).json({ error: "2FA is not enabled" });

        // verifier que le compte possede un mdp car si utilise google/gitHub, ya pas
        if (!user.passwordHash) {
            return res.status(400).json({ error: 'Password authentication is not available for this account' });
        }

        // verifie le mdp
        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // desactiver le 2fa et supprimer le secret
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                twoFactorEnabled: false,
                twoFactorSecret: null
            }
        });

        return res.json({ message: '2FA disabled' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
})

export default router;