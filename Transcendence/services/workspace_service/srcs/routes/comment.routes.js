import express from 'express';
import { authenticate, loadProject, loadTask, checkPermissionProject, canManageTask, loadComment } from '../../../shared/middleware/checkPermission.js';
import prisma from '../../../prisma/prisma.js';

const router = express.Router();

router.post('/projects/:projectId/tasks/:taskId/comments', authenticate, loadProject, loadTask,
    async (req, res) => {
        try {
            const { content } = req.body;

            if (!content || content.trim().length === 0)
                return res.status(400).json({ error: 'Comment content required' });

            const comment = await prisma.comment.create({
                data: {
                    content,
                    userId: req.user.userId,
                    taskId: req.task.id,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true,
                        }
                    }
                }
            });

            return res.status(201).json(comment);

        } catch(error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

router.get('/projects/:projectId/tasks/:taskId/comments', authenticate, loadProject, loadTask,
    async (req, res) => {
        try {
            const comments = await prisma.comment.findMany({
                where: {
                    taskId: req.task.id,
                },
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true,
                        },
                    },
                },
            });

            return res.json(comments);

        } catch(error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

router.patch('/projects/:projectId/tasks/:taskId/comments/:commentId', authenticate, loadProject, loadTask, loadComment,
    async (req, res) => {
        try {
            if (req.comment.userId !== req.user.userId)
                return res.status(403).json({ error: 'You cannot edit this comment' });

            const { content } = req.body;

            if (!content || content.trim().length === 0)
                return res.status(400).json({ error: 'Comment content required' });

            const updatedComment = await prisma.comment.update({
                where: {
                    id: req.comment.id,
                },
                data: {
                    content,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            pseudo: true,
                            avatar: true,
                        }
                    }
                }
            });

            return res.json({
                message: 'Comment updated',
                comment: updatedComment,
            });

        } catch(error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

router.delete('/projects/:projectId/tasks/:taskId/comments/:commentId', authenticate, loadProject, loadTask, loadComment,
    async (req, res) => {
        try {
            if (req.comment.userId !== req.user.userId)
                return res.status(403).json({ error: 'You cannot delete this comment' });

            await prisma.comment.delete({
                where: {
                    id: req.comment.id,
                },
            });

            return res.json({ message: 'Comment deleted' });

        } catch(error) {
            console.error(error);
            return res.status(500).json({ error: 'Database error' });
        }
    }
);

export default router;