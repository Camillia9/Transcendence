import express from 'express';
import { authenticate, loadProject, loadTask, checkPermissionProject, canManageTask } from '../middleware/permissions.js';
import prisma from '../../../prisma/prisma.js';
import { emitUserNotification } from '../../../shared/chatClient.js';

const router = express.Router();

// creer une task dans un projet
router.post('/projects/:projectId/tasks', authenticate, loadProject, checkPermissionProject('create_task'),
    async (req, res) => {
        try{
            const { title, description, priority, deadline } = req.body;
            if (!title)
                return res.status(400).json({ error: 'Title required' });

            const lastTask = await prisma.task.findFirst({
                where: { projectId: req.project.id, status: 'ToDo' },
                orderBy: { position: 'desc' },
            });

            let position = 0;
            if (lastTask) {
                position = lastTask.position + 1;
            }

            let validPriority = 'Normal';
            if (['Low', 'Normal', 'Urgent'].includes(priority)) {
                validPriority = priority;
            }

            let assignedToId;

            if (req.projectMembership.role === 'Manager')
                assignedToId = null;
            else
                assignedToId = req.user.userId;

            const task = await prisma.task.create({
                data: {
                    title,
                    description: description || null,
                    priority: validPriority,
                    status: 'ToDo',
                    position,
                    deadline: deadline ? new Date(deadline): null,
                    projectId: req.project.id,
                    createdById: req.user.userId,
                    assignedToId,
                },
                include: {
                    assignedTo: true,
                    createdBy: true,
                }
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`project:${req.project.id}`).emit('task:created', task);
            }

            return res.status(201).json(task);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// voir toutes les tasks d'un projet regrouper par colonne status pour mieux afficher
router.get('/projects/:projectId/tasks', authenticate, loadProject, checkPermissionProject('view_task'),
    async (req, res) => {
        try {
            const tasks = await prisma.task.findMany({
                where: { projectId: req.project.id },
                orderBy: [{ status: 'asc' }, { position: 'asc' }],
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true
                        }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            pseudo: true
                        }
                    },
                    comments: {
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
            })

            return res.json(tasks);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// voir une task precise
router.get('/projects/:projectId/tasks/:taskId', authenticate, loadProject, loadTask, checkPermissionProject('view_task'),
    async (req, res) => {
        try {
            const task = await prisma.task.findUnique({
                where: {
                    id: req.task.id
                },
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true
                        }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            pseudo: true
                        }
                    },
                    comments: {
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
            });

            return res.json(task);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// modifier une task
router.patch('/projects/:projectId/tasks/:taskId', authenticate, loadProject, loadTask, checkPermissionProject('edit_task'), canManageTask,
    async (req, res) => {
        try {
            const { title, description, priority, deadline } = req.body;

            let validPriority;
            if (priority && ['Low', 'Normal', 'Urgent'].includes(priority)) {
                validPriority = priority;
            } else {
                validPriority = undefined;
            }

            const task = await prisma.task.update({
                where: { id: req.task.id },
                data: {
                    ...(title !== undefined && { title }),
                    ...(description !== undefined && { description }),
                    ...(validPriority !== undefined && { priority: validPriority }),
                    ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
                },
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true
                        }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            pseudo: true
                        }
                    },
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
            });

            req.app.get('io').to(`project:${req.project.id}`).emit('task:updated', task);

            return res.json({
                message: 'Task updated',
                task
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// move task
router.patch('/projects/:projectId/tasks/:taskId/move', authenticate, loadProject, loadTask, checkPermissionProject('move_task'), canManageTask,
    async (req, res) => {
        try {
            const { status }= req.body;

            const allowed = ['ToDo', 'Doing', 'Blocked', 'Done'];

            if (!allowed.includes(status))
                return res.status(400).json({ error: 'Invalid status' });

            // rien ne change, on est sur la meme colonne
            if (status === req.task.status)
                return res.json({
                    message: 'Task already in this column',
                    task: req.task,
                });

            const oldStatus = req.task.status;
            const oldPosition = req.task.position;
            const TEMP_POSITION = -1;

            // changement de colonne
            const updatedTask = await prisma.$transaction(async (tx) => {
                // sort temporairement la tache de la colonne en mettant a position -1
                await tx.task.update({
                    where: {
                        id: req.task.id,
                    },
                    data: {
                        position: TEMP_POSITION,
                    },
                });

                // Refermer le trou dans l'ancienne colonne
                // gt = greater than
                await tx.task.updateMany({
                    where: {
                        projectId: req.project.id,
                        status: oldStatus,
                        position: {
                            gt: oldPosition,
                        },
                    },
                    data: {
                        position: {
                            decrement: 1,
                        },
                    },
                });

                // recuperer la derniere position de la nouvelle colonne
                const newPosition = await tx.task.count({
                    where: {
                        projectId: req.project.id,
                        status,
                    },
                });

                // Mettre à jour la tâche déplacée
                // on met un return pour quitter transaction et pour envoyer le resultat de transaction
                const task =  await tx.task.update({
                    where: {
                        id: req.task.id,
                    },
                    data: {
                        status,
                        position: newPosition,
                    },
                });

                // creer une notif pour les managers, et manager qui bouge sa propre tache ne recoit pas de notif
                const managers = await tx.projectMember.findMany({
                    where: {
                        projectId: req.project.id,
                        role: 'Manager',
                        userId: {
                            not: req.user.userId,
                        },
                    },
                    select: {
                        userId: true,
                    },
                });

                let notifications = [];
                if (managers.length > 0) {
                    const created = await tx.notification.createManyAndReturn({
                        data: managers.map(manager => ({
                            type: 'DeplacementTache',
                            actorId: req.user.userId,
                            userId: manager.userId,
                            projectId: req.project.id,
                            taskId: task.id,
                        })),
                        select: { id: true },
                    });

                    notifications = await tx.notification.findMany({
                        where: { id: { in: created.map(n => n.id) } },
                        include: {
                            actor: { select: { id: true, pseudo: true, avatar: true } },
                            task: { select: { id: true, title: true } },
                            project: { select: { id: true, title: true } },
                        },
                    });
                }
                return { task, notifications };
            });

            await Promise.all(
                updatedTask.notifications.map(notification =>
                    emitUserNotification(notification.userId, {
                        id: notification.id,
                        type: notification.type,
                        actor: notification.actor,
                        task: notification.task,
                        project: notification.project,
                        createdAt: notification.createdAt.toISOString(),
                        isRead: notification.isRead,
                    })
                )
            );

            return res.json({
                message: 'Task moved',
                task: updatedTask.task,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// assigner task
router.patch('/projects/:projectId/tasks/:taskId/assign', authenticate, loadProject, loadTask, checkPermissionProject('assign_task'),
    async (req, res) => {
        try {
            // soit on ecrit const { userId } = req.body; ou const userId = req.body.userId;
            const { userId } = req.body;

            if (userId !== null && userId !== undefined) {
                if (!Number.isInteger(userId) || userId <= 0)
                    return res.status(400).json({ error: 'Invalid userId' });

                // verifie que l'utilisateur assigner existe
                const user = await prisma.user.findUnique({ where: { id: userId }, });
                if (!user)
                    return res.status(404).json({ error: 'User not found' });

                // verifie que l'utilisateur assigner appartient au projet
                const projectMember = await prisma.projectMember.findUnique({
                    where: {
                        userId_projectId: {
                            userId,
                            projectId: req.project.id,
                        },
                    },
                });

                if (!projectMember)
                    return res.status(403).json({ error: 'User is not a member of this project' });
            }

            // assigne la tache et recupere la tache modifier
            const { updatedTask, notification } = await prisma.$transaction(async (tx) => {
                const task = await tx.task.update({
                    where: {
                        id: req.task.id,
                    },
                    data: {
                        assignedToId: userId,
                    },
                    include: {
                        assignedTo: {
                            select: {
                                id: true,
                                pseudo: true,
                                avatar: true,
                            },
                        },
                        createdBy: {
                            select: {
                                id: true,
                                pseudo: true
                            },
                        },
                    },
                });

                let notification = null;
                if (userId !== null && userId !== undefined && userId !== req.user.userId) {
                    // cree une notification
                    notification = await tx.notification.create({
                        data: {
                            type: 'Assignment',
                            // content: `You have been assigned to the task "${task.title}"`,
                            actorId: req.user.userId,
                            userId,
                            projectId: req.project.id,
                            taskId: task.id,
                        },
                        include: {
                            actor: {
                                select: {
                                    id: true,
                                    pseudo: true,
                                    avatar: true,
                                },
                            },
                            task: {
                                select: {
                                    id: true,
                                    title: true,
                                },
                            },
                            project: {
                                select: {
                                    id: true,
                                    title: true,
                                },
                            },
                        },
                    });
                }

                return { updatedTask: task, notification };
            });

            // Diffuse la tache mise a jour a tous les clients connectes sur ce projet
            // (sans ca, le Kanban des autres onglets/utilisateurs ne bouge qu'au refresh)
            const io = req.app.get('io');
            if (io) {
                io.to(`project:${req.project.id}`).emit('task:updated', updatedTask);
            }

            // Notifie en temps reel via chat (rooms user:* sont sur chat-service)
            if (notification) {
                await emitUserNotification(notification.userId, {
                    id: notification.id,
                    type: notification.type,
                    actor: notification.actor,
                    task: notification.task,
                    project: notification.project,
                    createdAt: notification.createdAt.toISOString(),
                    isRead: notification.isRead,
                });
            }

            return res.status(200).json ({
                message: 'Task assignment updated',
                task: updatedTask,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// desassigner un utilisateur d'une tache a faire
// DELETE /projects/:projectId/tasks/:taskId/assign/:userId

// supprimer task
router.delete('/projects/:projectId/tasks/:taskId', authenticate, loadProject, loadTask, checkPermissionProject('delete_task'), canManageTask,
    async (req, res) => {
        try {
            await prisma.$transaction(async (tx) => {
                await tx.task.delete({
                    where: { id: req.task.id }
                });

                await tx.task.updateMany({
                    where: {
                        projectId: req.project.id,
                        status: req.task.status,
                        position: {
                            gt: req.task.position,
                        },
                    },
                    data: {
                        position: {
                            decrement: 1,
                        },
                    },
                });
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`project:${req.project.id}`).emit('task:deleted', { taskId: req.task.id });
            }

            return res.json({ message: 'Task deleted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;