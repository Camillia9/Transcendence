import express from 'express';

import { authenticate, loadProject, loadTask, checkPermissionProject, canManageTask } from '../middleware/checkPermission.js';

import prisma from '../prisma.js';
// import { fakeDB, newId } from '../fakeDB.js';

const router = express.Router();

// creer une task dans un projet
router.post('/projects/:projectId/tasks', authenticate, loadProject, checkPermissionProject('create_task'),
    async (req, res) => {
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
        // const task = {
        //     id: newId(),
        //     title,
        //     description: description || '',
        //     projectId: req.project.id,
        //     userId: req.user.userId,
        //     assignedTo: null,
        //     status: 'todo',
        //     createdAt: new Date()
        // };

        // fakeDB.tasks.push(task);

        res.status(201).json(task);
    }
);

// voir toutes les tasks d'un projet regrouper par colonne status pour mieux afficher
router.get('/projects/:projectId/tasks', authenticate, loadProject, checkPermissionProject('view_task'),
    async (req, res) => {
        const tasks = await prisma.task.findMany({
            where: { projectId: req.project.id },
            orderBy: [{ status: 'asc' }, { position: 'asc' }],
        })
        // const tasks = fakeDB.tasks.filter(t => t.projectId === req.project.id);

        res.json(tasks);
    }
);

// voir une task precise
router.get('/projects/:projectId/tasks/:taskId', authenticate, loadProject,
    (req, res) => {
        const task = fakeDB.tasks.find(
            t =>
                t.id === Number(req.params.taskId) &&
                t.projectId === Number(req.params.projectId)
        );
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        
        res.json(task);
    }
);

// modifier une task
router.patch('/projects/:projectId/tasks/:taskId', authenticate, loadProject, checkPermissionProject('edit_task'), canManageTask,
    async (req, res) => {
        // const task = req.task;

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

        res.json({
            message: 'Task updated',
            task
        });
    }
);

// move task
router.patch('/projects/:projectId/tasks/:taskId/move', authenticate, loadProject, checkPermissionProject('move_task'), canManageTask,
    async (req, res) => {
        const { status, position }= req.body;
        const task = req.task;
        
        const allowed = ['todo', 'doing', 'done'];
        
        if (!allowed.includes(status))
            return res.status(400).json({ error: 'Invalid status' });

        task.status = status;

        res.json({
            message: 'Task moved',
            task
        });
    }
);

// assigner task
router.patch('/projects/:projectId/tasks/:taskId/assign', authenticate, loadProject, loadTask, checkPermissionProject('assign_task'),
    async (req, res) => {
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
    }
);

// desassigner un utilisateur d'une tache a faire 
// DELETE /projects/:projectId/tasks/:taskId/assign/:userId

// supprimer task
router.delete('/projects/:projectId/tasks/:taskId', authenticate, loadProject, checkPermissionProject('delete_task'), canManageTask,
    async (req, res) => {

        await prisma.task.delete({ where: { id: req.task.id }});

        res.json({ message: 'Task deleted' });
    }
);

export default router;
