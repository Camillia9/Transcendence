import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/checkPermission.js';
import prisma from '../../../prisma/prisma.js';

const router = Router();

// GET /api/messages/:conversationId — liste les messages d'une conversation
router.get('/:conversationId', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const convoId = Number(req.params.conversationId);

        const member = await prisma.conversationMember.findUnique({
            where: { userId_conversationId: { userId, conversationId: convoId } }
        });
        if (!member)
            return res.status(403).json({ error: 'Access denied' });

        const messages = await prisma.message.findMany({
            where: { conversationId: convoId },
            include: { user: { select: { id: true, pseudo: true, avatar: true } } },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/messages/:conversationId — envoie un message dans une conversation
router.post('/:conversationId', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const convoId = Number(req.params.conversationId);
        const { content } = req.body;

        if (!content || !content.trim())
            return res.status(400).json({ error: 'content is required' });

        const member = await prisma.conversationMember.findUnique({
            where: { userId_conversationId: { userId, conversationId: convoId } }
        });
        if (!member)
            return res.status(403).json({ error: 'Access denied' });

        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                userId,
                conversationId: convoId,
            },
            include: { user: { select: { id: true, pseudo: true, avatar: true } } }
        });

        const io = req.app.get('io');
        io.to(`conversation:${convoId}`).emit('message:new', message);

        res.status(201).json(message);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
