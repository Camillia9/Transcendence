import express from 'express';
import { authenticate, loadOrgMembership, checkPermissionOrga, checkPermissionProject, loadProject} from '../middleware/permissions.js';
import prisma from '../../../prisma/prisma.js';
import { notifyProjectMembers, notifyUser } from '../utils/notifications.js';

const router = express.Router();

// creer un projet
router.post('/organisations/:orgId/projects', authenticate, loadOrgMembership, checkPermissionOrga('create_project'),
    async (req, res) => {
        try {
            const { title, description, deadline } = req.body;
            if (!title)
                return res.status(400).json({ error: 'Project title required' });

            // transaction: cree un projet et ajouter le createur comme manager
            const { project } = await prisma.$transaction(async (tx) => {
                const project = await tx.project.create({
                    data: {
                        title,
                        description: description || null,
                        deadline: deadline ? new Date(deadline) : null,
                        orgId: req.orgId,
                    },
                });

                await tx.projectMember.create({
                    data: {
                        userId: req.user.userId,
                        projectId: project.id,
                        role: 'Manager',
                    },
                });
                return { project };
            });

            return res.status(201).json(project);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// voir toutes les projets accessibles par l'utilisateur
// peut etre rajouter orderBy: { createdAt: 'desc' } ou orderBy: { title: 'asc'}
router.get('/projects', authenticate,
    async (req, res) => {
        try {
            const projects = await prisma.project.findMany({
                where: {
                    projectMembers: {
                        some: {
                            userId: req.user.userId
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    projectMembers: {
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
                    tasks: {
                        select: {
                            status: true
                        }
                    }
                }
            });

            return res.json(projects);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
});

// voir un projet precis
// select : choisit les champs qu'on veut recuperer
// include: ajoute des relations en gardant les champs du modele principal
router.get('/projects/:projectId', authenticate, loadProject, checkPermissionProject('view_project'),
    async (req, res) => {
        try {
            const project = await prisma.project.findUnique({
                where: {
                    id: req.project.id
                },
                include: {
                    projectMembers: {
                        select: {
                            role: true,
                            user: {
                                select: {
                                    id: true,
                                    pseudo: true,
                                    avatar: true,
                                    statut: true,
                                }
                            }
                        }
                    },
                    tasks: {
                        orderBy: [
                            { status: 'asc' },
                            { position: 'asc' }
                        ],
                        include: {
                            comments: {
                                orderBy: {
                                    createdAt: 'asc'
                                },
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            pseudo: true,
                                            avatar: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            // req.project : propriete partager entre tt les middlewares et la route
            return res.json(project);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// modifier un projet
router.patch('/projects/:projectId', authenticate, loadProject, checkPermissionProject('edit_project'),
    async (req, res) => {
        try {
            const { title, description, deadline } = req.body;

            if (title !== undefined && (!title || !title.trim())) {
                return res.status(400).json({ error: 'Project title required'});
            }

            // ... = ajoute cette propriete
            const project = await prisma.$transaction(async (tx) => {
                const updatedProject = await tx.project.update({
                    where: {
                        id: req.project.id
                    },
                    data: {
                        ...(title !== undefined && { title }),
                        ...(description !== undefined && { description }),
                        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
                    },
                });

                await notifyProjectMembers(
                    tx,
                    req.project.id,
                    req.user.userId,
                    'ProjectUpdated',
                    req.app.get('io')
                );

                return updatedProject;
            });

            return res.json({
                message: 'Project updated',
                project
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
});

// supprimer un projet
router.delete('/projects/:projectId', authenticate, loadProject, checkPermissionProject('delete_project'),
    async (req, res) => {
        try {
            const memberIds = await prisma.$transaction(async (tx) => {
                await notifyProjectMembers(
                    tx,
                    req.project.id,
                    req.user.userId,
                    'ProjectDeleted',
                    // `${req.user.pseudo} deleted the project ${req.project.title}`,
                    req.app.get('io')
                );

                const members = await tx.projectMember.findMany({
                    where: { projectId: req.project.id },
                    select: { userId: true },
                });

                await tx.project.delete({
                    where: {
                        id: req.project.id
                    }
                });

                return members.map(m => m.userId);
            });

            const io = req.app.get('io');
            if (io) {
                for (const userId of memberIds) {
                    io.to(`user:${userId}`).emit('project:deleted', { projectId: req.project.id });
                }
            }

            return res.json({ message: 'Project deleted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);


// ajouter un membre a un projet
router.post('/projects/:projectId/members', authenticate, loadProject, checkPermissionProject('edit_project'),
    async(req, res) => {
        try{
            const { userId, role = 'User' } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'userId required'});
            }

            const targetUserId = Number(userId);
            if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
                return res.status(400).json({ error: 'Invalid userId' });
            }

            // verifier que le role est valide
            if (!['User', 'Manager'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            // verifier que l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: {
                    id: targetUserId
                },
                select: {
                    id: true,
                    pseudo: true,
                    avatar: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // verifier que le user qu'on ajoute appartient a l'orga
            const orgMembership = await prisma.member.findUnique({
                where: {
                    userId_orgId: {
                        userId: targetUserId,
                        orgId: req.project.orgId
                    }
                }
            });

            if (!orgMembership) {
                return res.status(403).json({ error: 'User is not a member of this organisation' });
            }

            // verifier qu'il n'est pas deja membre du projet
            const existingMember = await prisma.projectMember.findUnique({
                where: {
                    userId_projectId: {
                        projectId: req.project.id,
                        userId: targetUserId
                    }
                }
            });

            if (existingMember) {
                return res.status(409).json({ error: 'User is already a member of this project' });
            }

            // ajouter le membre
            const member = await prisma.projectMember.create({
                data: {
                    projectId: req.project.id,
                    userId: targetUserId,
                    role
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true
                        }
                    }
                }
            });

            const project = await prisma.project.findUnique({
                where: { id: req.project.id },
                include: {
                    projectMembers: {
                        include: {
                            user: {
                                select: { id: true, pseudo: true, avatar: true }
                            }
                        }
                    },
                    tasks: {
                        select: { status: true }
                    }
                }
            });
            req.app.get('io').to(`user:${targetUserId}`).emit('project:member-added', project);

            return res.status(201).json(member);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    });


// retirer un membre d'un projet
router.delete('/projects/:projectId/members/:userId', authenticate, loadProject, checkPermissionProject('edit_project'), 
    async (req, res) => {
        try{
            const userId = Number(req.params.userId);

            if (!Number.isInteger(userId) || userId <= 0)
            return res.status(400).json({ error: 'Invalid userId' });

            // verifier que le membre existe dans le projet
            const member = await prisma.projectMember.findUnique({
                where: {
                    userId_projectId: {
                        projectId: req.project.id,
                        userId
                    }
                }
            });

            if (!member) {
                return res.status(404).json({ error: 'User is not a member of this project' });
            }
            
            // verifier que ce n'est pas le dernier manager du projet
            if (member.role === 'Manager') {
                const nbManager = await prisma.projectMember.count({
                    where: {
                        projectId: req.project.id,
                        role: 'Manager'
                    }
                });

                if (nbManager <= 1) {
                    return res.status(400).json({ error: 'Cannot remove the last manager of the project' });
                }
            }

            await prisma.$transaction(async (tx) => {
                // desassigner ttes les taches de ce membre
                await tx.task.updateMany({
                    where: {
                        projectId: req.project.id,
                        assignedToId: userId,
                    },
                    data: {
                        assignedToId: null,
                    },
                });
                // retirer le membre du projet
                await tx.projectMember.delete({
                    where: {
                        userId_projectId: {
                            projectId: req.project.id,
                            userId
                        }
                    }
                });
                // notifier a la personne retirer
                await notifyUser(
                    tx,
                    userId,
                    req.user.userId,
                    'RemovedFromProject',
                    req.app.get('io'),
                    {
                        projectId: req.project.id
                    }
                );
            });

            req.app.get('io').to(`user:${userId}`).emit('project:member-removed', { projectId: req.project.id });

            return res.json({ message: 'Member removed from project' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    });

router.patch('/projects/:projectId/members/:userId', authenticate, loadProject, checkPermissionProject('edit_project'),
    async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            const { role } = req.body;

            if (!Number.isInteger(userId) || userId <= 0)
            return res.status(400).json({ error: 'Invalid userId' });

            if (!['User', 'Manager'].includes(role))
                return res.status(400).json({ error: 'Invalid role' });

            // verifier que le membre existe dans le projet
            const member = await prisma.projectMember.findUnique({
                where: {
                    userId_projectId: {
                        projectId: req.project.id,
                        userId
                    }
                },
                select: {
                    role: true
                }
            });

            if (!member) {
                return res.status(404).json({ error: 'User is not a member of this project' });
            }

            // si le role n'a pas changer
            if (member.role === role)
                return res.json(member);
            
            // verifier que ce n'est pas le dernier manager du projet
            if (member.role === 'Manager' && role === 'User') {
                const nbManager = await prisma.projectMember.count({
                    where: {
                        projectId: req.project.id,
                        role: 'Manager'
                    }
                });

                if (nbManager <= 1) {
                    return res.status(400).json({ error: 'Cannot remove the last manager of the project' });
                }
            }

            const updatedMember = await prisma.$transaction(async (tx) => {
                const updated = await tx.projectMember.update({
                    where: {
                        userId_projectId: {
                            projectId: req.project.id,
                            userId
                        }
                    },
                    data: {
                        role
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                pseudo: true,
                                avatar: true
                            }
                        }
                    }
                });
                // notifier a la personne
                await notifyUser(
                    tx,
                    userId,
                    req.user.userId,
                    'ProjectRoleUpdated',
                    req.app.get('io'),
                    {
                        projectId: req.project.id,
                        role
                    }
                );
                return updated;
            });

            req.app.get('io').to(`user:${userId}`).emit('project:member-role-updated', { projectId: req.project.id, member: updatedMember });

            return res.json({ message: 'Member role updated', member: updatedMember });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    });

// lister les membres de l'orga qui ne sont pas dans le projet
router.get('/projects/:projectId/available-members', authenticate, loadProject, checkPermissionProject('edit_project'),
    async (req, res) => {
        try {
            const members = await prisma.member.findMany({
                where: {
                    orgId: req.project.orgId,
                    user: {
                        projectMembers: {
                            none: {
                                projectId: req.project.id
                            }
                        }
                    }
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true
                        }
                    }
                }
            });

            return res.json(members.map(member => member.user));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    });

export default router;
