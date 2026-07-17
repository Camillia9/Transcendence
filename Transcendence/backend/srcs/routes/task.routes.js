import express from 'express';

import { authenticate, loadProject, checkPermissionProject, canManageTask } from '../middleware/checkPermission.js';

import { fakeDB, newId } from '../fakeDB.js';

const router = express.Router();

// creer une task dans un projet
router.post('/projects/:projectId/tasks', authenticate, loadProject, checkPermissionProject('create_task'),
    (req, res) => {
        const { title, description } = req.body;
        if (!title)
            return res.status(400).json({ error: 'Title required' });

        const task = {
            id: newId(),
            title,
            description: description || '',
            projectId: req.project.id,
            userId: req.user.userId,
            assignedTo: null,
            status: 'todo',
            createdAt: new Date()
        };

        fakeDB.tasks.push(task);

        res.status(201).json(task);
    }
);

// voir toutes les tasks d'un projet
router.get('/projects/:projectId/tasks', authenticate, loadProject, checkPermissionProject('view_task'),
    (req, res) => {
        const tasks = fakeDB.tasks.filter(t => t.projectId === req.project.id);

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
    (req, res) => {
        const task = req.task;

        const { title, description, status } = req.body;
        
        if (title)
            task.title = title;

        if (description)
            task.description = description;

        const allowedStatus = ['todo', 'doing', 'done'];
        
        if (status && allowedStatus.includes(status)){
            task.status = status;
        }

        res.json({
            message: 'Task updated',
            task
        });
    }
);

// move task
router.patch('/projects/:projectId/tasks/:taskId/move', authenticate, loadProject, checkPermissionProject('move_task'), canManageTask,
    (req, res) => {
        const task = req.task;

        const { status } = req.body;
        
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
router.patch('/projects/:projectId/tasks/:taskId/assign', authenticate, loadProject, checkPermissionProject('assign_task'),
    (req, res) => {
        const task = fakeDB.tasks.find(
            t =>
                t.id === Number(req.params.taskId) &&
                t.projectId === Number(req.params.projectId)
        );

        if (!task)
            return res.status(404).json({ error: 'Task not found' });

        const { userId } = req.body;

        const userExists = fakeDB.users.find(u => u.id === userId);

        if (!userExists)
            return res.status(404).json({ error: 'User not found' });

        task.assignedTo = userId;

        res.json({
            message: 'Task assigned',
            task
        });
    }
);

// supprimer task
router.delete('/projects/:projectId/tasks/:taskId', authenticate, loadProject, checkPermissionProject('delete_task'), canManageTask,
    (req, res) => {

        fakeDB.tasks = fakeDB.tasks.filter(
            t => t.id !== req.task.id
        );

        res.json({ message: 'Task deleted' });
    }
);

export default router;
