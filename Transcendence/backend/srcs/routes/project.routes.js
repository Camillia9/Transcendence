import express from 'express';
import { authenticate, loadMembership, checkPermissionProject, loadProject, checkPermissionOrga } from '../middleware/checkPermission.js';
import { fakeDB, newId } from '../fakeDB.js';

const router = express.Router();

// creer un projet
router.post('/organisations/:orgId/projects', authenticate, loadMembership, checkPermissionProject('create_project'),
    (req, res) => {
        const { name, description } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Project name required' });

        const project = {
            id: newId(),
            name,
            description: description || '',
            createdBy: req.user.userId,
            createdAt: new Date()
        };

        fakeDB.projets.push(project);

        // ajoute le createur comme membre du projet
        fakeDB.projectMembers.push({
            projectId: project.id,
            userId: req.user.userId,
            role: 'Manager'
        });

        res.status(201).json(project);
    }
);

// voir toutes les projets accessibles par l'utilisateur
router.get('/projects', authenticate, checkPermissionProject('view_project'),
    (req, res) => {
        const projectIds = fakeDB.projectMembers
            .filter(pm => pm.userId === req.user.userId)
            .map(pm => pm.projectId);

        const projects = fakeDB.projets.filter(p => projectIds.includes(p.id));

    res.json(projects);
});

// voir un projet precis
router.get('/projects/:projectId', authenticate, loadProject, checkPermissionProject('view_project'),
    (req, res) => {
        // req.project : propriete partager entre tt les middlewares et la route
        res.json(req.project);
    }
);

// modifier un projet
router.patch('/projects/:projectId', authenticate, loadProject, checkPermissionProject('edit_project'),
    (req, res) => {
    const { name, description } = req.body;

    if (name)
        req.project.name = name;

    if (description)
        req.project.description = description;

    res.json({
        message: 'Project updated',
        project: req.project
    });
});

// supprimer un projet
router.delete('/projects/:projectId', authenticate, loadProject, checkPermissionProject('delete_project'),
    (req, res) => {
        const projectId = req.project.id;

        // supprime le projet
        fakeDB.projets = fakeDB.projets.filter(p => p.id !== projectId);

        // supprime les tasks lier
        fakeDB.tasks = fakeDB.tasks.filter(t => t.projectId !== projectId);

        // supprime les membres du projet
        fakeDB.projectMembers = fakeDB.projectMembers.filter(pm => pm.projectId !== projectId);

        res.json({ message: 'Project deleted' });
    }
);

export default router;
