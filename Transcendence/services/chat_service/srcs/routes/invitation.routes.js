// crypto = module integrer a Node.js qui permet de generer des chaines de caracteres aleatoires tres difficile a deviner
import crypto from 'crypto';
import express from 'express';

import { checkPermissionOrga, authenticate, loadOrgMembership } from '../../../shared/middleware/checkPermission.js';
// import { fakeDB, newId } from '../fakeDB.js';
import prisma from '../../../prisma/prisma.js';

const router = express.Router();

// router.post('/organisation/inviter') = route pour inviter qq1
// Avant d'exécuter la fonction, Express vérifie si l'utilisateur possède la permission inviter
// async (req, res) => { -> cette fonction sera executer lorsque la requete est recue
// const { email } = req.body; = recupere l'email
// const { orgId } = req.user; = recupere l'orga
router.post('/organisations/:orgId/invitations', authenticate, loadOrgMembership, checkPermissionOrga('invit_member'),
    async (req, res) => {
        try {
            const { email } = req.body;
            if (!email)
                return res.status(400).json({ error: 'Email required '});

            const user = await prisma.user.findUnique({
                where: { email, },
            });

            if (user) {
                const alreadyMember = await prisma.member.findUnique({
                    where: {
                        userId_orgId: {
                            userId: user.id,
                            orgId: req.orgId,
                        },
                    },
                });
                if (alreadyMember)
                    return res.status(409).json({ error: 'User is already a member'});
            }

            // creation de l'identifiant de l'invitation
            // Date.now() = donne l'heure actuelle en millisecondes
            const inviteToken = crypto.randomBytes(32).toString('hex');
            const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);//24h

            const invitation = await prisma.invitation.create({
                data: {
                    email,
                    token: inviteToken,
                    expireAt: expiration,
                    organisation: req.orgId,
                },
            });

            // envoyer l'email (utiliser nodemailer)
            // Le lien : https://taskboard.app/rejoindre/${inviteToken}

            return res.json({
                message: `Invitation sent to ${email}`,
                token: invitation.inviteToken,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// rejoindre une organisation
router.post('/organisations/rejoindre/:token', authenticate,
    async (req, res) => {
        try {
            // recuperer le token dans l'URL
            const { token } = req.params;

            // rechercher l'invitation
            const invitation = await prisma.invitation.findUnique({
                where: {
                    token,
                },
            });

            if (!invitation)
                return res.status(404).json({ error: 'Invitation not found' });

            // verifier que l'invitation n'a pas expirer
            if (invitation.expireAt < new Date())
                return res.status(400).json({ error: 'Invitation expired' });

            // recuperer l'utilisateur connecter
            const user = await prisma.user.findUnique({
                where: {
                    id: req.user.userId,
                },
            });

            if(!user)
                return res.status(404).json({ error: 'User not found' });

            // verifier que l'email correspond
            if (user.email !== invitation.email)
                return res.status(403).json({ error: 'This invitation is not for you' });

            // verifier qu'il n'est pas deja membre de l'orga (au cas ou si envoie plusieurs invit)
            const alreadyMember = await prisma.member.findUnique({
                where: {
                    userId_orgId: {
                        userId: user.id,
                        orgId: invitation.organisation,
                    },
                },
            });

            if (alreadyMember)
                return res.status(409).json({ error: 'User is already a member'});

            // ajouter le membre + supprimer l'invitation
            await prisma.$transaction(async (tx) => {
                await tx.member.create({
                    data: {
                        userId: user.id,
                        orgId: invitation.organisation,
                        role: 'Member',
                    },
                });

                await tx.invitation.delete({
                    where: {
                        id: invitation.id,
                    },
                });
            });

            return res.json({ message: 'Welcome to the organisation' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;


// // valider l'invitation quand l'utilisateur clique le lien
// // :token = signifie que cette partie de l'url est une variable
// router.get('/organisation/rejoindre/:token', async (req, res) => {
//     // prisma recherche dans la base une invitation dont le token correspond
//     const invitation = await prisma.invitation.findUnique({
//         where: { token: req.params.token }
//     });
//     if (!invitation || invitation.expireAt < new Date())
//         return res.status(400).json({ error: 'Invalid ou expired invitation'});
//     // si tt est valide, une ligne est ajouter dans la table des membres
//     await prisma.membre.create({
//         data: { userId: req.user.id, organisationId: invitation.orgId, role: 'User'}
//     });
//     res.json({ message: 'You join the organisation' });
// });
