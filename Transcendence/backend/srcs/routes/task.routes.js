import express from 'express';
import { authenticate, loadProject, loadTask, checkPermissionProject, canManageTask } from '../middleware/checkPermission.js';
import prisma from '../prisma.js';

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

            const task = await prisma.task.create({
                data: {
                    title,
                    description: description || null,
                    priority: validPriority,
                    status: 'ToDo',
                    position,
                    deadline: deadline? new Date(deadline): null,
                    projectId: req.project.id,
                    createdById: req.user.userId,
                },
            });

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
    (req, res) => {
        return res.json(req.task);
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
            });

            // if (title)
            //     task.title = title;

            // if (description)
            //     task.description = description;

            // const allowedStatus = ['todo', 'doing', 'done'];

            // if (status && allowedStatus.includes(status)){
            //     task.status = status;
            // }

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
// rajouter verif si la position est trop grande par rapport a ce qu'il y a de base, par ex on me dit position 50 alors que yavait que 5 taches
router.patch('/projects/:projectId/tasks/:taskId/move', authenticate, loadProject, loadTask, checkPermissionProject('move_task'), canManageTask,
    async (req, res) => {
        try {
            const { status, position }= req.body;

            if (!Number.isInteger(position) || position < 0)
                return res.status(400).json({ error: 'Invalid position' });
            
            const allowed = ['ToDo', 'Doing', 'Blocked', 'Done'];
            
            if (!allowed.includes(status))
                return res.status(400).json({ error: 'Invalid status' });

            const oldStatus = req.task.status;
            const oldPosition = req.task.position;

            // rien ne change 
            if (oldStatus === status && oldPosition === position)
                return res.json({
                    message: 'Task already in this position',
                    task: req.task,
                });

            const updatedTask = await prisma.$transaction(async (tx) => {
                // cas 1: deplacement dans la meme colonne
                if (oldStatus === status) {
                    // Descendre la tâche
                    if (position > oldPosition) {
                        await tx.task.updateMany({
                            where: {
                                projectId: req.project.id,
                                status,
                                position: {
                                    gt: oldPosition,
                                    lte: position,
                                },
                            },
                            data: {
                                position: {
                                    decrement: 1,
                                },
                            },
                        });
                    }

                    // Monter la tâche
                    else if (position < oldPosition) {
                        await tx.task.updateMany({
                            where: {
                                projectId: req.project.id,
                                status,
                                position: {
                                    gte: position,
                                    lt: oldPosition,
                                },
                            },
                            data: {
                                position: {
                                    increment: 1,
                                },
                            },
                        });
                    }
                }

                // Cas 2 : changement de colonne
                else {

                    // Refermer le trou dans l'ancienne colonne
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

                    // Décaler les tâches de la nouvelle colonne
                    await tx.task.updateMany({
                        where: {
                            projectId: req.project.id,
                            status,
                            position: {
                                gte: position,
                            },
                        },
                        data: {
                            position: {
                                increment: 1,
                            },
                        },
                    });
                }

                // Mettre à jour la tâche déplacée
                return await tx.task.update({
                    where: {
                        id: req.task.id,
                    },
                    data: {
                        status,
                        position,
                    },
                });

            });

            // const updatedTask = await prisma.task.update({
            //     where: { id: req.task.id },
            //     data: {
            //         status,
            //         position,
            //     },
            // });

            return res.json({
                message: 'Task moved',
                task: updatedTask,
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
            const userId = Number(req.body.userId);

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

            // assigne la tache et recupere la tache modifier
            const updatedTask = await prisma.$transaction(async (tx) => {
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
                    },
                });

                // cree une notification
                await tx.notification.create({
                    data: {
                        type: 'Assignment',
                        content: `You have been assigned to the task "${task.title}"`,
                        userId,
                        projectId: req.project.id,
                        taskId: task.id,
                    },
                });
                return task;
            });

            return res.status(200).json ({
                message: 'Task assigned',
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
            await prisma.task.delete({ where: { id: req.task.id }});

            return res.json({ message: 'Task deleted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;
