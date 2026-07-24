import express from 'express';
import { authenticate, loadOrgMembership, checkPermissionOrga, checkPermissionProject, loadProject} from '../../../shared/checkPermission.js';
import prisma from '../../../shared/prisma.js';

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
                }
            });

            return res.json(projects);

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
            return res.json(req.project);

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
            await prisma.project.delete({ where: { id: req.project.id } });

            return res.json({ message: 'Project deleted' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;
