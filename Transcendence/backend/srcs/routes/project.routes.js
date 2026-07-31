import express from 'express';
import { authenticate, loadOrgMembership, checkPermissionOrga, checkPermissionProject, loadProject} from '../middleware/checkPermission.js';
import prisma from '../prisma.js';
import { notifyProjectMembers } from '../service/notification.js';

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

            // ... = ajoute cette propriete
            const project = await prisma.$transaction(async (tx) => {

                const updatedProject = await tx.project.update({
                    where: { id: req.project.id },
                    data: {
                        ...(title !== undefined && { title }),
                        ...(description !== undefined && { description }),
                        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
                    },
                });
            
                // if (name)
                //     req.project.name = name;
            
                // if (description)
                //     req.project.description = description;
            
                await notifyProjectMembers(
                    tx,
                    req.project.id,
                    req.user.userId,
                    'ProjectUpdated',
                    `${req.user.pseudo} updated the project ${updatedProject.title}`
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
            await prisma.$transaction(async (tx) => {
                await notifyProjectMembers(
                    tx,
                    req.project.id,
                    req.user.userId,
                    'ProjectDeleted',
                    `${req.user.pseudo} deleted the project ${req.project.title}`
                );

                await tx.project.delete({ where: { id: req.project.id } });
            })

            return res.json({ message: 'Project deleted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;
