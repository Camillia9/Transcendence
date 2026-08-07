// crypto = module integrer a Node.js qui permet de generer des chaines de caracteres aleatoires tres difficile a deviner
import express from 'express';

import { checkPermissionOrga, authenticate, loadOrgMembership, loadInvitation } from '../../../shared/middleware/checkPermission.js';
// import { fakeDB, newId } from '../fakeDB.js';
import prisma from '../../../prisma/prisma.js';
import { notifyUser } from '../../../shared/notification_data.js';

const router = express.Router();

// router.post('/organisation/inviter') = route pour inviter qq1
// Avant d'exécuter la fonction, Express vérifie si l'utilisateur possède la permission inviter
// async (req, res) => { -> cette fonction sera executer lorsque la requete est recue
// const { userId } = req.body; = recupere l'id de user
// const { orgId } = req.user; = recupere l'orga
router.post('/organisations/:orgId/invitations', authenticate, loadOrgMembership, checkPermissionOrga('invit_member'),
    async (req, res) => {
        try {
            const userId = Number(req.body.userId);

            if (!Number.isInteger(userId) || userId <= 0)
                return res.status(400).json({ error: 'Invalid user id' });

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user)
                return res.status(404).json({ error: 'User not found' });

            if (userId === req.user.userId)
                return res.status(400).json({ error: 'You cannot invite yourself' });

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

            const pendingInvitation = await prisma.invitation.findFirst({
                where: {
                    invitedUserId: userId,
                    orgId: req.orgId,
                    status: 'Pending',
                },
            });

            if (pendingInvitation)
                return res.status(409).json({ error: 'Invitation already pending' });

            await prisma.$transaction(async (tx) => {
                const invitation = await tx.invitation.create({
                    data: {
                        inviterId: req.user.userId,
                        invitedUserId: userId,
                        orgId: req.orgId,
                    },
                });

                // await notifyUser(
                //     tx,
                //     userId,
                //     req.user.userId,
                //     'InvitationSent',
                //     `invited you to join the organisation ${req.orgMembership.organisation.name}`,
                //     req.app.get('io'),
                // );
            });

            return res.json({
                message: 'Invitation sent',
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);


// voir tte mes invitations en attente
router.get('/invitations', authenticate,
    async (req, res) => {
        try {
            // rechercher l'invitation
            const invitations = await prisma.invitation.findMany({
                where: {
                    invitedUserId: req.user.userId,
                    status: 'Pending',
                },
                include: {
                    inviter: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            return res.json(invitations);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);


// rejoindre une organisation en acceptant une invitation
router.patch('/invitations/:id/accept', authenticate, loadInvitation,
    async (req, res) => {
        try {
            if (req.invitation.invitedUserId !== req.user.userId)
                return res.status(403).json({ error: 'Not your invitation' });

            if (req.invitation.status !== 'Pending')
                return res.status(400).json({ error: 'Invitation already processed' });

            const alreadyMember = await prisma.member.findUnique({
                where: {
                    userId_orgId: {
                        userId: req.user.userId,
                        orgId: req.invitation.orgId,
                    },
                },
            });

            if (alreadyMember)
                return res.status(409).json({ error: 'User is already a member' });

            // ajouter le membre + modifier le status de l'invitation
            await prisma.$transaction(async (tx) => {
                await tx.member.create({
                    data: {
                        userId: req.user.userId,
                        orgId: req.invitation.orgId,
                        role: 'Member',
                    },
                });

                await tx.invitation.update({
                    where: {
                        id: req.invitation.id,
                    },
                    data: {
                        status: 'Accepted',
                        acceptedAt: new Date(),
                    },
                });

                await notifyUser(
                    tx,
                    req.invitation.inviterId,
                    req.user.userId,
                    'InvitationAccepted',
                    `accepted your invitation to join the organisation ${req.invitation.organisation.name}`,
                    req.app.get('io'),
                );
            });

            return res.json({ message: 'Invitation accepted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// refuser une invitation
router.patch('/invitations/:id/decline', authenticate, loadInvitation,
    async (req, res) => {
        try {
            if (req.invitation.invitedUserId !== req.user.userId)
                return res.status(403).json({ error: 'Not your invitation' });

            if (req.invitation.status !== 'Pending')
                return res.status(400).json({ error: 'Invitation already processed' });

            await prisma.$transaction(async (tx) => {
                await tx.invitation.update({
                    where: {
                        id: req.invitation.id,
                    },
                    data: {
                        status: 'Declined',
                    },
                 });

                await notifyUser(
                    tx,
                    req.invitation.inviterId,
                    req.user.userId,
                    'InvitationDeclined',
                    `refused your invitation to join the organisation ${req.invitation.organisation.name}`,
                    req.app.get('io'),
                );
            });

            return res.json({ message: 'Invitation declined' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// annuler une invitation par l'admin
router.delete('/organisations/:orgId/invitations/:id', authenticate, loadOrgMembership, checkPermissionOrga('invit_member'), loadInvitation,
    async (req, res) => {
        try {
            if (req.invitation.status !== 'Pending')
                return res.status(400).json({ error: 'Invitation already processed' });

            if (req.invitation.orgId !== req.orgId)
                return res.status(404).json({ error: 'Invitation not found' });

            await prisma.$transaction(async (tx) => {
                await tx.invitation.delete({
                    where: {
                        id: req.invitation.id,
                    },
                });

                await notifyUser(
                    tx,
                    req.invitation.invitedUserId,
                    req.user.userId,
                    'InvitationCancelled',
                    `cancelled your invitation to join the organisation ${req.invitation.organisation.name}`,
                    req.app.get('io'),
                );
            });

            return res.json({ message: 'Welcome to the organisation' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;
