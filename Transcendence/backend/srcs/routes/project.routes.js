import express from 'express';
import { authenticate, loadOrgMembership, checkPermissionProject, loadProject} from '../middleware/checkPermission.js';
// import { fakeDB, newId } from '../fakeDB.js';
import prisma from '../prisma.js';

const router = express.Router();

// creer un projet
router.post('/organisations/:orgId/projects', authenticate, loadOrgMembership, checkPermissionProject('create_project'),
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

            // const project = {
            //     id: newId(),
            //     name,
            //     description: description || '',
            //     createdBy: req.user.userId,
            //     createdAt: new Date()
            // };

            // fakeDB.projets.push(project);

            // // ajoute le createur comme membre du projet
            // fakeDB.projectMembers.push({
            //     projectId: project.id,
            //     userId: req.user.userId,
            //     role: 'Manager'
            // });

            res.status(201).json(project);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

// voir toutes les projets accessibles par l'utilisateur
router.get('/projects', authenticate,
    async (req, res) => {
        try {
            const projects = await prisma.project.findMany({
                where: { 
                    members: {
                        some: {
                            userId: req.user.userId
                        }
                    }
                }
            });

            // const projectIds = fakeDB.projectMembers
            //     .filter(pm => pm.userId === req.user.userId)
            //     .map(pm => pm.projectId);

            // const projects = fakeDB.projets.filter(p => projectIds.includes(p.id));

            res.json(projects);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
});

// voir un projet precis
router.get('/projects/:projectId', authenticate, loadProject, checkPermissionProject('view_project'),
    async (req, res) => {
        try {
            // req.project : propriete partager entre tt les middlewares et la route
            res.json(req.project);
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
            const project = await prisma.project.update({
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
        
            res.json({
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
            const projectId = req.project.id;

            await prisma.project.delete({ where: { id: req.project.id } });

            // // supprime le projet
            // fakeDB.projets = fakeDB.projets.filter(p => p.id !== projectId);

            // // supprime les tasks lier
            // fakeDB.tasks = fakeDB.tasks.filter(t => t.projectId !== projectId);

            // // supprime les membres du projet
            // fakeDB.projectMembers = fakeDB.projectMembers.filter(pm => pm.projectId !== projectId);

            res.json({ message: 'Project deleted' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;
