import express from 'express';
import { authenticate } from '../../../shared/auth.middleware.js';
import prisma from '../../../prisma/prisma.js';

const router = express.Router();

// GET /api/notifications — toutes les notifs de l'utilisateur connecte
router.get('/notifications', authenticate, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: {
                        id: true,
                        pseudo: true,
                        avatar: true,
                    },
                },
            },
        });

        return res.json(notifications);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// PATCH /api/notifications/:id/read — marquer une notif comme lue
router.patch('/notifications/:id/read', authenticate, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0)
            return res.status(400).json({ error: 'Invalid notification id' });

        const notif = await prisma.notification.findUnique({ where: { id } });
        if (!notif || notif.userId !== req.user.userId)
            return res.status(404).json({ error: 'Notification not found' });

        await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return res.json({ message: 'Notification marked as read' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

// PATCH /api/notifications/read-all — marquer toutes les notifs comme lues
router.patch('/notifications/read-all', authenticate, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.userId, isRead: false },
            data: { isRead: true },
        });

        return res.json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Database error' });
    }
});

export default router;
