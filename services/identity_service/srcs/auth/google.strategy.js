import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// prend la propriete Strategy et stocke la dans une variable appelee GoogleStrategy

import { generateToken } from '../../../shared/jwt.utils.js';

import prisma from '../../../prisma/prisma.js';

// callbackURL: l'adressse ou google renvoie l'utilisateur apres la connexion
const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.APP_URL}/api/auth/google/callback`,
    },

    // accessToken = jeton donner par google qui permet d'acceder aux API google
    // done() = fonction de Passport qui dit que la connexion est terminer
    async (accessToken, refreshToken, profile, done) => {
        try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value ?? null;
            const pseudo = profile.displayName || `google_${googleId}`;
            const avatar = profile.photos?.[0]?.value ?? null;

            // cherche si le user existe deja
            let user = await prisma.user.findUnique({
                where: {
                    googleId,
                },
            });

            if (!user && email) {
                user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                });

                if (user && !user.googleId) {
                    user = await prisma.user.update({
                        where: {
                            id : user.id,
                        },
                        data: {
                            googleId,
                        },
                    });
                }
            }

            // ?. = operateur d'acces optionnel
            // si photos[0] existe, prends value, sinon renvoie undefined sans provoquer d'erreur
            // sans ?., l'utilisateur n'avait pas de photo, le programme planterait
            if (!user)
            {
                // premiere connexion : creer user

                // le pseudo doit etre unique, donc si par ex john existe, on va creer john_1 automatiquement
                let pseudoFinal = pseudo;
                let count = 1;

                while (await prisma.user.findUnique({ where: { pseudo: pseudoFinal }})) {
                    pseudoFinal = `${pseudo}_${count}`;
                    count++;
                }

                user = await prisma.user.create({
                    data: {
                        pseudo: pseudoFinal,
                        email,
                        googleId,
                        passwordHash: null,
                        avatar,
                    },
                });
            }

            const token = generateToken( user );

            // // finir la connexion : passport attend qu'on appelle done (...)
            // // 1er parametre est l'erreur donc null si tout s'est bien passer
            // // 2eme parametre contient ce qu'on veut renvoyer, ici token et user mais pas tout le user juste ce qu'on veut
            return done(null, { token, user: { id: user.id, pseudo: user.pseudo, email: user.email, avatar: user.avatar, statut: user.statut, hasPassword: !!user.passwordHash, } });

            } catch (error) {
                return done (error, null);
            }
})

export default googleStrategy;