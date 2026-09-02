import express from 'express';
import { checkPermissionOrga, authenticate, loadOrgMembership } from '../middleware/permissions.js';
import prisma from '../../../prisma/prisma.js';
import { notifyOrgaMembers, notifyUser } from '../utils/notifications.js';

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
                return res.status(409).json({ error: 'Organisation name already taken' });
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

router.get("/organisations", authenticate, async (req, res) => {
    try {
        const organisations = await prisma.member.findMany({
            where: {
                userId: req.user.userId
            },
            include: {
                organisation: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        pseudo: true,
                                        avatar: true
                                    }
                                }
                            }
                        },
                        invitations: {
                            where: {
                                status: "Pending"
                            },
                            include: {
                                invitedUser: {
                                    select: {
                                        id: true,
                                        pseudo: true,
                                        avatar: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                members: true,
                                invitations: {
                                    where: {
                                        status: "Pending"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        
        res.json(organisations.map(m => ({
            id: m.organisation.id,
            name: m.organisation.name,
            myRole: m.role,
            memberCount: m.organisation._count.members,
            members: m.organisation.members.map(member => ({
                id: member.id,
                userId: member.user.id,
                pseudo: member.user.pseudo,
                avatar: member.user.avatar,
                role: member.role
            })),
            pendingInvitationsCount: m.organisation._count.invitations,
            pendingInvitations: m.organisation.invitations.map(inv => ({
                id: inv.id,
                pseudo: inv.invitedUser.pseudo,
                avatar: inv.invitedUser.avatar
            }))
        })))

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
})

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
            const org = await prisma.$transaction(async (tx) => {
                const updatedOrg = await tx.organisation.update({
                    where: {
                        id: req.orgId
                    },
                    data: {
                        name: orgName
                    },
                });

                await notifyOrgaMembers(
                    tx,
                    req.orgId,
                    req.user.userId,
                    'OrgaUpdated',
                );

                return updatedOrg;
            });

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
            const { projectIds, memberIds } = await prisma.$transaction(async (tx) => {
                await notifyOrgaMembers(
                    tx,
                    req.orgId,
                    req.user.userId,
                    'OrgaDeleted',
                );

                const projects = await tx.project.findMany({
                    where: { orgId: req.orgId },
                    select: { id: true },
                });

                const members = await tx.member.findMany({
                    where: { orgId: req.orgId },
                    select: { userId: true },
                });

                // prisma gere la suppression en cascade grace aux onDelete: Cascade du schema
                await tx.organisation.delete({
                    where: {
                        id: req.orgId
                    }
                });

                return {
                    projectIds: projects.map(p => p.id),
                    memberIds: members.map(m => m.userId),
                };
            });

            const io = req.app.get('io');
            if (io) {
                for (const userId of memberIds) {
                    for (const projectId of projectIds) {
                        io.to(`user:${userId}`).emit('project:deleted', { projectId });
                    }
                }
            }

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
                const membre = await tx.member.findUnique({
                    where: { 
                        userId_orgId: {
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
                    null,
                    {
                        organisationId: req.orgId,
                    }
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

            let remainingMembers = [];
            let affectedProjectIds = [];
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

                const projectMemberships = await tx.projectMember.findMany({
                    where: {
                        userId: cible,
                        project: { orgId: req.orgId },
                    },
                    select: { projectId: true },
                });
                affectedProjectIds = projectMemberships.map((pm) => pm.projectId);

                if (affectedProjectIds.length > 0) {
                    await tx.task.updateMany({
                        where: {
                            projectId: { in: affectedProjectIds },
                            assignedToId: cible,
                        },
                        data: { assignedToId: null },
                    });

                    await tx.projectMember.deleteMany({
                        where: {
                            userId: cible,
                            projectId: { in: affectedProjectIds },
                        },
                    });
                }

                await notifyUser(
                    tx,
                    cible,
                    req.user.userId,
                    'RemovedFromOrga',
                    null,
                    {
                        organisationId: req.orgId,
                    }
                );

                await tx.member.delete({
                    where: {
                        userId_orgId: {
                            userId: cible,
                            orgId: req.orgId
                        }
                    },
                });

                await notifyOrgaMembers(
                    tx,
                    req.orgId,
                    req.user.userId,
                    'MemberRemoved',
                );

                remainingMembers = await tx.member.findMany({
                    where: { orgId: req.orgId },
                    select: { userId: true },
                });
            })

            const io = req.app.get('io');
            const payload = { orgId: req.orgId, removedUserId: cible };
            io.to(`user:${cible}`).emit('organisation:member-removed', payload);
            for (const m of remainingMembers) {
                io.to(`user:${m.userId}`).emit('organisation:member-removed', payload);
            }
            for (const projectId of affectedProjectIds) {
                io.to(`user:${cible}`).emit('project:member-removed', { projectId });
            }

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

            let remainingMembers = [];
            let affectedProjectIds = [];
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

                const projectMemberships = await tx.projectMember.findMany({
                    where: {
                        userId: req.user.userId,
                        project: { orgId: req.orgId },
                    },
                    select: { projectId: true },
                });
                affectedProjectIds = projectMemberships.map((pm) => pm.projectId);

                if (affectedProjectIds.length > 0) {
                    await tx.task.updateMany({
                        where: {
                            projectId: { in: affectedProjectIds },
                            assignedToId: req.user.userId,
                        },
                        data: { assignedToId: null },
                    });

                    await tx.projectMember.deleteMany({
                        where: {
                            userId: req.user.userId,
                            projectId: { in: affectedProjectIds },
                        },
                    });
                }

                await notifyOrgaMembers(
                    tx,
                    req.orgId,
                    req.user.userId,
                    'MemberLeftOrga',
                );

                await tx.member.delete({
                    where: {
                        userId_orgId: {
                            userId: req.user.userId,
                            orgId: req.orgId
                        }
                    }
                });

                remainingMembers = await tx.member.findMany({
                    where: { orgId: req.orgId },
                    select: { userId: true },
                });
            });

            const io = req.app.get('io');
            const payload = { orgId: req.orgId, removedUserId: req.user.userId };
            io.to(`user:${req.user.userId}`).emit('organisation:member-removed', payload);
            for (const m of remainingMembers) {
                io.to(`user:${m.userId}`).emit('organisation:member-removed', payload);
            }
            for (const projectId of affectedProjectIds) {
                io.to(`user:${req.user.userId}`).emit('project:member-removed', { projectId });
            }

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