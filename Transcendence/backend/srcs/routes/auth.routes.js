// require('dotenv').config(); = charge les variables d'environnement contenues dans le .env
// importe express qui est un framework Node.js pour créer des API (un serveur web)
// passport : bibliothèque qui gère l'authentification (ici avec Google).
// express.Router() : permet de regrouper les routes dans un fichier séparé.
import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

import googleStrategy from '../auth/google.strategy.js';
import gitHubStrategy from '../auth/github.strategy.js';
import { generateToken } from '../auth/jwt.utils.js';
import prisma from '../prisma.js';
import { authenticate } from '../middleware/checkPermission.js';

const router = express.Router();

// inscription email + mot de passe
// POST /auth/register
// Body : { pseudo, email, password}
router.post('/auth/register', async (req, res) => {
    try{
        const { pseudo, email, password } = req.body;
        
        // peut etre rajouter mettre le mail et pseudo en minuscule pour normaliser ici et dans login
        if (!pseudo || !email || !password)
            return res.status(400).json({ error: 'pseudo, email and password are required' });
    
        // soit utilise une biblio avec un validateur d'email comme zod, joi ou validator.js
        // soit on veut pas rajouter de dependance et on fait un regex simple (= regular expression / respecte la forme) qui va verifier juste qqch@qqch.qqch
        // ^ → début de la chaîne.
        // [^\s@]+ → un ou plusieurs caractères qui ne sont ni un espace (\s) ni @.
        // $ → fin de la chaîne.
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!emailRegex.test(email))
            return res.status(400).json({ error: 'Invalid email format' });
    
        if (pseudo.length < 3)
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
    
        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        
        const [emailAlreadyExist, pseudoAlreadyExist] = await Promise.all([
            prisma.user.findUnique({ where: { email }}),
            prisma.user.findUnique({ where: { pseudo }}),
        ]);
        // verfier que l'email et le pseudo n'existent pas deja car doit etre unique selon le schema prisma
        if (emailAlreadyExist)
            return res.status(409).json({ error: 'Email already used' });
        if (pseudoAlreadyExist)
             return res.status(409).json({ error: 'Pseudo already used' });
    
        // chiffrer le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

  
        const user = await prisma.user.create({
            data: {
                pseudo,
                email,
                passwordHash,
            },
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Account successfully created',
            token,
            user: { id: user.id, pseudo: user.pseudo, email: user.email },
        });
    } catch (err) {
        // quand ya une erreur, ca cree automatiquement une variable avec le catch et on met le nom qu'on veut ici err
        if (err.code === 'P2002' )
            return res.status(409).json({ error: 'Email or pseudo already used'});
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// connexion email + mot de passe
// POST /auth/login
// Body : { identifier, password }
// en fait on veut se co par email ou pseudo a faire
router.post('/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password)
            return res.status(400).json({ error: 'Identifier and password needed'});

        // chercher le user par email ou pseudo
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { pseudo: identifier },
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
            user: { id: user.id, pseudo: user.pseudo, email: user.email }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// connexion google oauth
// GET /auth/google -> redirige vers google
// GET /auth/google/callback -> google rappelle ici

// lancer la connexion google
// quand qq1 fait une requete GET /auth/google, on execute le code qui suit cad express appelle passport.authenticate('google')
// mais passport ne connecte pas encore l'utilisateur, il le redirige vers google
// utilise googleStrategy car 'google' est le name definit par defaut dans googleStrategy
// l'option scope: ['profile', 'email'] = demande a google l'autorisation d'acceder au profil et a l'adresse email
// s'il accepte, google redirige vers /auth/google/callback
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email']}));

// router.get('/auth/google/callback' = Cette route est appelée uniquement par Google après que l'utilisateur a accepté
// refait passport.authenticate car passport doit recuperer les donnees envoyer par google, verifier que tt est correct et appeler la fonction async
// session:false = ne cree pas de session car par defaut passport cree une session, mais ici pas de session car on utilise a la place JWT
// failureRedirect: '/login' = si google refuse la connexion, redirige vers /login
// passport.authenticate(
//     'google',
//     {
//         session:false,
//         failureRedirect:'/login'
//     }
// )
// cette fonction demande a passport de verifier que google a bien authentifier l'utilisateur
// si tout se passe bien, req.user est rempli, sinon /login est afficher
// (req, res) => { -> Cette fonction n'est exécutée que si Passport a réussi.
// on recupere const { token, user } = req.user;
// res.json({ -> reponse en json envoyer au front
router.get('/auth/google/callback',
    passport.authenticate('google', { session:false, failureRedirect: '/login'}), 
    (req, res) => {
        if (req.user.twoFactorRequired) {
            return res.json({
                twoFactorRequired: true,
                userId: req.user.user.id
            });
        }

        const { token, user } = req.user;
        // en prod : rediriger vers le front avec le token dans l'URL
        res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
        
        return res.json({ token, user });
        // renvoyer le token au front (dev 1 lit ca)
    }
);


// connexion Github oauth
router.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/auth/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        if (req.user.twoFactorRequired) {
            return res.json({
                twoFactorRequired: true,
                userId: req.user.user.id
            });
        }

        const { token, user } = req.user;
        res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
        
        return res.json({ token, user });
    }
);


// deconnexion
// POST /auth/logout
// le front supprime juste son token, mais on confirme cote back

// logout : cote front, dev1 supprime juste le token du localstorage
// quand le front fait POST /logout, on repond juste disconnected.
// pour se deconnecter, il suffira de supprimer le token coter client
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

        const valid = await verify({
            token: code,
            secret: user.twoFactorSecret
        });

        if (!valid)
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

        const valid = await verify({
            token: code,
            secret: user.twoFactorSecret
        });

        if (!valid)
            return res.status(401).json({ error: 'Invalid code' });

        const token = generateToken(user);

        return res.json({
            token,
            user: { id: user.id, pseudo: user.pseudo, email: user.email }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// desactivation de la 2fa avec demande de mdp
router.post('/auth/2fa/disable', async(req, res) => {

})

// on exporte tte ces routes pour pouvoir les utiliser dans le serveur principal
export default router;