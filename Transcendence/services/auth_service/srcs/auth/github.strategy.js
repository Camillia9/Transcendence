import { Strategy as GitHubStrategy } from 'passport-github2';
import { generateToken } from '../../../shared/jwt.utils.js';
import prisma from '../../../prisma/prisma.js';

const gitHubStrategy = new GitHubStrategy (
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try{
            const githubId = profile.id;
            const email = profile.emails?.[0]?.value ?? null;
            const pseudo = profile.displayName || profile.username || `github_${githubId}`;
            const avatar = profile.photos?.[0]?.value ?? null;

            // recherche de l'utilisateur par githubId
            let user = await prisma.user.findUnique({
                where: {
                    githubId,
                },
            });

            //verifie qu'il n'a pas deja un compte creer avec un email
            // si oui, rajoute le githubId au user
            if (!user && email) {
                user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                });

                if (user && !user.githubId) {
                    user = await prisma.user.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            githubId,
                        },
                    });
                }
            }

            // creation si inexistant
            if (!user) {
                let pseudoFinal = pseudo;
                let count = 1;

                while (await prisma.user.findUnique({ where: { pseudo: pseudoFinal }})) {
                    pseudoFinal = `${pseudo}_${count}`;
                    count++;
                }

                user = await prisma.user.create ({
                    data: {
                        pseudo: pseudoFinal,
                        email,
                        githubId,
                        passwordHash: null,
                        avatar,
                    },
                });
            }

            if (user.twoFactorEnabled) {
                return done (null, {
                    twoFactorRequired: true,
                    user: {
                        id: user.id,
                        pseudo: user.pseudo,
                        email: user.email,
                        avatar: user.avatar
                    }
                });
            }

            const token = generateToken( user );

            return done(null, { token, user: { id: user.id, pseudo: user.pseudo, email: user.email, avatar: user.avatar, }, });

            } catch (error) {
                return done (error, null);
            }
        }
);

export default gitHubStrategy;