import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// prend la propriete Strategy et stocke la dans une variable appelee GoogleStrategy
// meme chose que d'ecrire : 
// const passportGoogle = require('passport-google-oauth20')
// const GoogleStrategy = passportGoogle.Strategy;

// Écriture	                                            Signification
// const { nom } = objet;	                            Prend la propriété nom de objet.
// const { Strategy } = require(...);	                Prend la propriété Strategy renvoyée par require().
// const { Strategy: GoogleStrategy } = require(...);	Prend Strategy et la renomme en GoogleStrategy.
import { generateToken } from './jwt.utils.js';

import { fakeDB, newId } from '../fakeDB.js';
// besoin des modeles Prisma fournis par dev5 pour acceder a la base de donnees
// const { PrismaCLient } = require('@prisma/client');
// const prisma = new PrismaCLient();

// module.exports = ce que ce fichier fournit aux autres fichiers
// callbackURL: l'adressse ou google renvoie l'utilisateur apres la connexion
const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
    },

    // accessToken = jeton donner par google qui permet d'acceder aux API google
    // refreshToken = sert a demander un nouveau accessToken lorsqu'il expire
    // profile = contient les informations de l'utilisateur
    // done() = fonction de Passport qui dit que la connexion est terminer
    // async : indique qu'une fonction peut effectuer des operations qui prennent du temps
    // await : attend que l'operation soit terminer avant de continuer
    // await ne peut etre utiliser que dans une fonction async
    async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const pseudo = profile.displayName;
        const avatar = profile.photos[0]?.value ?? null;

        // chercher le user (remplacer par Prisma quand dev5 est pret)
        // let = cree une variable mais constrairement a const, sa valeur pourra changer plus tard
        // where: { email } equivaut a :
        // SELECT *
        // FROM User
        // WHERE email = 'jean@gmail.com'
        // des que la base sera prete, on met ca et on supprime les 2 autres let
        // let user = await prisma.user.findUnique({ where: { email } });
        // Parcours le tableau fakeDB.membres et retourne le premier membre dont le userId est égal à l'identifiant (id) de l'utilisateur trouvé précédemment. Si aucun utilisateur n'a été trouvé (user vaut undefined), alors user?.id renvoie simplement undefined au lieu de provoquer une erreur.
        let user = fakeDB.users.find(u => u.email === email);

        // ?. = operateur d'acces optionnel
        // si photos[0] existe, prends value, sinon renvoie undefined sans provoquer d'erreur
        // sans ?., l'utilisateur n'avait pas de photo, le programme planterait
        if (!user)
        {
            // premiere connexion : creer user
            const userId = newId();
            fakeDB.users.push({ id: userId, pseudo, email, passwordHash: null, avatar, createdAt: new Date() });
        
            user = fakeDB.users.find(u => u.id === userId);
        }

        const token = generateToken( user );
        return done(null, { token, user: { id: user.id, pseudo, email } });

        //     const org = await prisma.organisation.create({ data: { nom: `Org de ${profile.displayName}`} });
        //     user = await prisma.user.create({
        //         data: {
        //             email,
        //             pseudo: profile.displayName,
        //             avatar: profile.photos[0]?.value,
        //             membres: { create: { organisationId: org.id, role: 'Admin'} },
        //         },
        //         // par defaut Prisma renvoie seulement l'utilisateur et avec include, on demande aussi les membres
        //         include: { membres: true },
        //     });
        // }

        // // recupere son role
        // const membre = user.membres[0];
        // const token = generateToken({ id: user.id, role: membre.role, orgId: membre.organisationId});

        // // finir la connexion : passport attend qu'on appelle done (...)
        // // 1er parametre est l'erreur donc null si tout s'est bien passer 
        // // 2eme parametre contient ce qu'on veut renvoyer, ici user et token
        // done(null, { user, token });
    }
);

export default googleStrategy;