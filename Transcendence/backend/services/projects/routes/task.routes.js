import express from 'express';
import { authenticate, loadProject, loadTask, checkPermissionProject, canManageTask } from '../../../shared/checkPermission.js';
import prisma from '../../../shared/prisma.js';

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

            // changement de colonne
            const updatedTask = await prisma.$transaction(async (tx) => {
                // Refermer le trou dans l'ancienne colonne
                // gt = greater than
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

                // recuperer la derniere position de la nouvelle colonne
                const count = await tx.task.count({
                    where: {
                        projectId: req.project.id,
                        status,
                    },
                });

                // Mettre à jour la tâche déplacée
                // on met un return pour quitter transaction et pour envoyer le resultat de transaction
                return tx.task.update({
                    where: {
                        id: req.task.id,
                    },
                    data: {
                        status,
                        position: count,
                    },
                });

            });

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

            return res.json({ message: 'Task deleted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;
