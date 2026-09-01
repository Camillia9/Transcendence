import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// prend la propriete Strategy et stocke la dans une variable appelee GoogleStrategy
// meme chose que d'ecrire :
// const passportGoogle = require('passport-google-oauth20')
// const GoogleStrategy = passportGoogle.Strategy;

// Écriture	                                            Signification
// const { nom } = objet;	                            Prend la propriété nom de objet.
// const { Strategy } = require(...);	                Prend la propriété Strategy renvoyée par require().
// const { Strategy: GoogleStrategy } = require(...);	Prend Strategy et la renomme en GoogleStrategy.
import { generateToken } from '../../../shared/jwt.utils.js';

import prisma from '../../../prisma/prisma.js';

// module.exports = ce que ce fichier fournit aux autres fichiers
// callbackURL: l'adressse ou google renvoie l'utilisateur apres la connexion (google veut un chemin absolu et accepte pas relatif)
const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },

    // accessToken = jeton donner par google qui permet d'acceder aux API google
    // refreshToken = sert a demander un nouveau accessToken lorsqu'il expire
    // profile = contient les informations de l'utilisateur
    // done() = fonction de Passport qui dit que la connexion est terminer
    // async : indique qu'une fonction peut effectuer des operations qui prennent du temps
    // await : attend que l'operation soit terminer avant de continuer
    // await ne peut etre utiliser que dans une fonction async
    async (accessToken, refreshToken, profile, done) => {
        try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value ?? null;
            const pseudo = profile.displayName || `google_${googleId}`;
            const avatar = profile.photos?.[0]?.value ?? null;

            // let = cree une variable mais constrairement a const, sa valeur pourra changer plus tard
            // where: { email } equivaut a :
            // SELECT *
            // FROM User
            // WHERE email = 'jean@gmail.com'

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
            return done(null, { token, user: { id: user.id, pseudo: user.pseudo, email: user.email, avatar: user.avatar, hasPassword: !!user.passwordHash, } });

            } catch (error) {
                return done (error, null);
            }
})

export default googleStrategy;


// a rajouter une fonction qui normalise le pseudo
// si ya des caracteres speciaux, on enleve
// si le pseudo existe deja, on rajoute un chiffre apres juste jusqu'a qu'il existe plus
// par ex
// import { Prisma } from '@prisma/client';

// function normalizePseudo(name) {
//   return name
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '') // retire les accents
//     .replace(/[^\w]/g, '')            // garde lettres/chiffres/_
//     .toLowerCase()
//     .slice(0, 20);
// }

// async function createGoogleUser({ email, displayName, avatar }) {
//   const basePseudo = normalizePseudo(displayName) || 'user';

//   let attempt = 0;

//   while (true) {
//     const pseudo = attempt === 0
//       ? basePseudo
//       : `${basePseudo}${attempt}`;

//     try {
//       const user = await prisma.user.create({
//         data: {
//           pseudo,
//           firstname: '',
//           lastname: '',
//           email,
//           passwordHash: null,
//           avatar,
//         },
//       });

//       return user; // succès
//     } catch (e) {
//       // P2002 = contrainte unique violée
//       if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
//         attempt++;
//         continue; // on réessaie avec un autre pseudo
//       }

//       throw e; // autre erreur
//     }
//   }
// }