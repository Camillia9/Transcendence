import express from 'express';
import { checkPermissionOrga, authenticate, loadOrgMembership } from '../../../shared/middleware/checkPermission.js';
import prisma from '../../../prisma/prisma.js';
import { notifyOrgaMembers, notifyUser } from '../../../shared/notification_data.js';

const router = express.Router();

// creer une organisation
router.post('/organisations', authenticate,
    async (req, res) => {
        try {
            // le front envoie {"orgName": "Mon entreprise"} donc on recupere cet info
            const { orgName } = req.body;
            if (!orgName)
                return res.status(400).json({ error: 'Organisation name required' });

            const orgaAlreadyExist = await prisma.organisation.findUnique({ where: { name: orgName }});
            if (orgaAlreadyExist)
                return res.status(409).json({ error: 'Organisation name already taken' });

            // transaction : creer l'orga et ajoute le createur en admin en 1 seul operation
            // si l'une echoue, les 2 sont annulees
            const { org } = await prisma.$transaction(async (tx) => {
                const org = await tx.organisation.create({ data: { name: orgName } });

                await tx.member.create({
                    data: {
                        userId: req.user.userId,
                        orgId: org.id,
                        role: 'Admin',
                    },
                });
                return { org };
            });

            return res.status(201).json({ message: 'The organisation is created', organisation: org });

        } catch (error) {
            console.error(error);
            //protection si 2 utilisateurs cree au meme moment et un passe le orgaAlreadyExist
            if (error.code == 'P2002')
                return res.status(400).json({ error: 'Organisation name required' });
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// voir mon organisation
// GET /organisations/:orgId
// accessible a tous les membres connecter et on sait que l'utilisateur appartient a cette orga car loadmembership verifier
router.get('/organisations/:orgId', authenticate, loadOrgMembership, checkPermissionOrga('view_member'),
    async (req, res) => {
        try {
            const org = await prisma.organisation.findUnique({
                where: {id: req.orgId},
            });

            if (!org)
                return res.status(404).json({ error: 'Organisation not found' });

            return res.json(org);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// modifier mon organisation
router.patch('/organisations/:orgId', authenticate, loadOrgMembership, checkPermissionOrga('edit_orga'),
    async (req, res) => {
        try {
            const { orgName } = req.body;
            if (!orgName)
                return res.status(400).json({ error: 'Organisation name required' });

            // verifie qu'une autre organisation ne possede pas deja ce nom
            const orgaAlreadyExist = await prisma.organisation.findUnique({ where: { name: orgName, }, });

            if (orgaAlreadyExist && orgaAlreadyExist.id !== req.orgId)
                return res.status(409).json({ error: 'Organisation name already taken' });

            // where pour dire de trouver l'organisation dont l'id correspond a req.orgId
            // data pour dire quel colonne a modifier
            const org = await prisma.organisation.update({
                where: { id: req.orgId },
                data: { name: orgName },
            })

            return res.json({
                message: 'Organisation updated',
                organisation: org
            });

        } catch (error) {
            console.error(error);
            if (error.code === 'P2002')
                return res.status(409).json({ error: 'Organisation name already taken' });
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// supprimer mon organisation et donc de ses membres aussi
router.delete('/organisations/:orgId', authenticate, loadOrgMembership, checkPermissionOrga('delete_orga'),
    async (req, res) => {
        try {
            // prisma gere la suppression en cascade grace aux onDelete: Cascade du schema
            await prisma.organisation.delete({ where: { id: req.orgId }});

            return res.json({ message: 'Organisation deleted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// voir les membres d'une organisation
router.get('/organisations/:orgId/membres', authenticate, loadOrgMembership, checkPermissionOrga('view_member'),
    async (req, res) => {
        try {
            const membres = await prisma.member.findMany({
                where: { orgId: req.orgId },
                include: {
                    user: {
                        select: { id: true, pseudo: true, email: true, avatar: true },
                    },
                },
            });

            // formater pour le front
            // map() parcourt chaque membre
            const result = membres.map(m => ({
                id : m.user.id,
                pseudo: m.user.pseudo,
                email: m.user.email,
                avatar: m.user.avatar,
                role: m.role,
            }));

            return res.json(result);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// changer un role, par ex tu passes de admin a membre
router.patch('/organisations/:orgId/membres/:userId', authenticate, loadOrgMembership, checkPermissionOrga('change_role'),
    async (req, res) => {
        try {
            // cherche quel utilisateur on veut modifier avec req.params.userId (en recuperant sur l'URL)
            // on utilise Number() car l'URL est en char et on veut un num
            const cible = Number(req.params.userId);
            if (!Number.isInteger(cible) || cible <= 0)
                return res.status(400).json({ error: 'Invalid user id' });

            const { role } = req.body;
            const roles = [
                'Admin',
                'Member'
            ];

            if (!roles.includes(role))
                return res.status(400).json({ error: 'Invalid role' });

            const updated = await prisma.$transaction(async (tx) => {
                // verifier que la cible est bien dans l'orga
                const membre = await prisma.member.findUnique({
                    where: { userId_orgId:
                        {
                            userId: cible,
                            orgId: req.orgId
                        }
                    },
                });

                if (!membre)
                    throw new Error('MEMBER_NOT_FOUND');

                // verifie qu'il y a tjs au moins 1 admin sur l'orga
                if (membre.role === 'Admin' && role !== 'Admin') {
                    const nbAdmins = await tx.member.count({
                        where: {
                            orgId: req.orgId,
                            role: 'Admin'},
                    });

                    if (nbAdmins === 1)
                        throw new Error('LAST_ADMIN');
                }

                const updated = await tx.member.update({
                    where: {
                        userId_orgId: {
                            userId: cible,
                            orgId: req.orgId
                        }
                    },
                    data: {
                        role
                    },
                });

                await notifyUser(
                    tx,
                    cible,
                    req.user.userId,
                    'RoleChanged',
                    `${req.user.pseudo} changed your role to ${role}`,
                    req.app.get('io')
                );
                return updated;
            });

            return res.json({
                message: 'Role updated',
                membre: updated
            });

        } catch (error) {
            if (error.message === 'LAST_ADMIN') {
                return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            }

            if (error.message === 'MEMBER_NOT_FOUND') {
                return res.status(404).json({ error: 'Member not found' });
            }

            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// supprimer un membre d'une orga (seul les admins peuvent)
router.delete('/organisations/:orgId/membres/:userId', authenticate, loadOrgMembership, checkPermissionOrga('delete_member'),
    async (req, res) => {
        try {
            const cible = Number(req.params.userId);
            if (!Number.isInteger(cible) || cible <= 0)
                return res.status(400).json({ error: 'Invalid user id' });

            await prisma.$transaction(async (tx) => {
                const membre = await tx.member.findUnique({
                    where: { userId_orgId: {
                        userId: cible,
                        orgId: req.orgId
                        }
                    },
                });

                if (!membre)
                    throw new Error('MEMBER_NOT_FOUND');

                // verifie qu'il y a tjs au moins 1 admin dans l'orga
                if (membre.role === 'Admin') {
                    const nbAdmins = await tx.member.count({
                        where: {
                            orgId: req.orgId,
                            role: 'Admin'
                        },
                    });

                    if (nbAdmins === 1)
                        throw new Error('LAST_ADMIN');
                }

                await notifyUser(
                    tx,
                    cible,
                    req.user.userId,
                    'RemovedFromOrga',
                    `You were removed from the organisation ${req.orgMembership.organisation.name}`,
                    req.app.get('io')
                );

                await notifyOrgaMembers(
                    tx,
                    req.orgId,
                    req.user.userId,
                    'MemberRemoved',
                    `${req.user.pseudo} removed a member from the organisation ${req.orgMembership.organisation.name}`,
                    req.app.get('io')
                );

                await tx.member.delete({
                    where: {
                        userId_orgId: {
                            userId: cible,
                            orgId: req.orgId
                        }
                    },
                });
            })

            return res.json({ message: 'Member deleted' });

        } catch (error) {
            if (error.message === 'LAST_ADMIN') {
                return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            }

            if (error.message === 'MEMBER_NOT_FOUND') {
                return res.status(404).json({ error: 'Member not found' });
            }

            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// quitter une orga soi meme
router.delete('/organisations/:orgId/me', authenticate, loadOrgMembership,
    async (req, res) => {
        try {
            const membre = req.orgMembership;

            // verifie qu'il y a tjs au moins 1 admin dans l'orga
            await prisma.$transaction(async (tx) => {
                if (membre.role === 'Admin') {
                    const nbAdmins = await tx.member.count({
                        where: {
                            orgId: req.orgId,
                            role: 'Admin'
                        },
                    });

                    if (nbAdmins === 1)
                        throw new Error('LAST_ADMIN');
                }

                await notifyOrgaMembers(
                    tx,
                    req.orgId,
                    req.user.userId,
                    'MemberLeftOrga',
                    `${req.user.pseudo} left the organisation ${req.orgMembership.organisation.name}`,
                    req.app.get('io')
                );

                await tx.member.delete({
                    where: {
                        userId_orgId: {
                            userId: req.user.userId,
                            orgId: req.orgId
                        }
                    }
                });
            });

            return res.json({ message: 'You left the organisation' });

        } catch (error) {
            if (error.message === 'LAST_ADMIN') {
                return res.status(400).json({ error: 'An organisation must always have at least one Admin' });
            }

            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;