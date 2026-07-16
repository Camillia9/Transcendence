import { Strategy as GitHubStrategy } from 'passport-github2';
import { generateToken } from './jwt.utils.js';
import prisma from '../prisma.js';
import { use } from 'passport';
// import { fakeDB, newId } from '../fakeDB.js';

const gitHubStrategy = new GitHubStrategy (
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        try{
            const email = profile.emails?.[0]?.value ?? `${profile.username}@github.com`;
            const pseudo = profile.displayName || profile.username;
            const avatar = profile.photos?.[0]?.value ?? null;

            // recherche de l'utilisateur
            let user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            // creation si inexistant
            if (!user) {
                user = await prisma.user.create ({
                    data: {
                        pseudo,
                        email,
                        firstname: "",
                        lastname: "",
                        passwordHash: null,
                        avatar,
                    },
                });
            }
            // let user = fakeDB.users.find(u => u.email === email);

            // if (!user) {
            //     const userId = newId();
            //     fakeDB.users.push({ id: userId, pseudo, email, passwordHash: null, avatar, createdAt: new Date() });

            //     user = fakeDB.users.find(u => u.id === userId);
            // }

            const token = generateToken( user );
            done(null, { token, user: { id: user.id, pseudo: user.pseudo, email: user.email, avatar: user.avatar, }, });
            } catch (error) {
                done (error, null);
            }
        }
);

export default gitHubStrategy;