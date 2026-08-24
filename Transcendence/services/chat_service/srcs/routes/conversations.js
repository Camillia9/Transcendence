import { Router } from 'express';
import { authenticate } from '../../../shared/auth.middleware.js';
import prisma from '../../../prisma/prisma.js';
import { usersShareOrganisation } from '../../../shared/workspaceClient.js';
import { getUnreadCount, emitUnreadCount } from '../sockets/handlers/unread.js';

const router = Router();

// GET /api/conversations/unread-count — nombre total de messages non lus
router.get('/unread-count', authenticate, async (req, res) => {
	try {
		const count = await getUnreadCount(req.user.userId);
		res.json({ count });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// GET /api/conversations — liste les conversations
router.get('/', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const convos = await prisma.conversation.findMany({
			where: { conversationMembers: { some: { userId } } },
			include: {
				conversationMembers: {
					include: { user: { select: { id: true, pseudo: true, avatar: true } } },
				},
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					include: { user: { select: { id: true, pseudo: true } } },
				},
			},
		});

		const unreadCounts = await prisma.message.groupBy({
			by: ['conversationId'],
			where: {
				conversationId: { in: convos.map((c) => c.id) },
				userId: { not: userId },
				reads: { none: { userId } },
			},
			_count: { id: true },
		});
		const unreadByConvo = new Map(unreadCounts.map((u) => [u.conversationId, u._count.id]));

		const convosWithUnread = convos.map((c) => ({
			...c,
			unreadCount: unreadByConvo.get(c.id) ?? 0,
		}));

		res.json(convosWithUnread);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// POST /api/conversations — cree une conversation
router.post('/', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const { participantIds, name, type } = req.body;
		const io = req.app.get('io');

		if (!Array.isArray(participantIds) || participantIds.length === 0)
			return res.status(400).json({ error: 'participantIds is required' });

		const allParticipants = [...new Set([userId, ...participantIds.map(Number)])];
		const convType = (type === 'Group' || type === 'group') ? 'Group' : 'Private';

		if (convType === 'Private' && allParticipants.length !== 2)
			return res.status(400).json({ error: 'A private conversation requires exactly 2 participants' });

		for (const pid of participantIds.map(Number)) {
			if (pid === userId) continue;
			const shared = await usersShareOrganisation(userId, pid);
			if (!shared)
				return res.status(403).json({ error: `User ${pid} does not share an organisation with you` });
		}

		if (convType === 'Private') {
			const otherId = participantIds.map(Number).find((id) => id !== userId) ?? participantIds[0];
			const existing = await prisma.conversation.findFirst({
				where: {
					type: 'Private',
					AND: [
						{ conversationMembers: { some: { userId } } },
						{ conversationMembers: { some: { userId: Number(otherId) } } },
					],
				},
				include: {
					conversationMembers: {
						include: { user: { select: { id: true, pseudo: true, avatar: true } } },
					},
				},
			});
			if (existing) {
				io.in(`user:${userId}`).socketsJoin(`conversation:${existing.id}`);
				io.in(`user:${Number(otherId)}`).socketsJoin(`conversation:${existing.id}`);
				io.to(`user:${userId}`).to(`user:${Number(otherId)}`).emit('conversation:new', existing);
				return res.json(existing);
			}
		}

		const convo = await prisma.conversation.create({
			data: {
				type: convType,
				name: convType === 'Group' ? (name || 'Group') : null,
				conversationMembers: {
					create: allParticipants.map((uid) => ({ userId: uid })),
				},
			},
			include: {
				conversationMembers: {
					include: { user: { select: { id: true, pseudo: true, avatar: true } } },
				},
			},
		});

		allParticipants.forEach((uid) => {
			io.in(`user:${uid}`).socketsJoin(`conversation:${convo.id}`);
			io.to(`user:${uid}`).emit('conversation:new', convo);
		});

		res.status(201).json(convo);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// GET /api/conversations/:id
router.get('/:id', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const convoId = Number(req.params.id);

		const convo = await prisma.conversation.findUnique({
			where: { id: convoId },
			include: {
				conversationMembers: {
					include: { user: { select: { id: true, pseudo: true, avatar: true } } },
				},
			},
		});

		if (!convo)
			return res.status(404).json({ error: 'Conversation not found' });

		const isMember = convo.conversationMembers.some((m) => m.userId === userId);
		if (!isMember)
			return res.status(403).json({ error: 'Access denied' });

		res.json(convo);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// PATCH /api/conversations/:id/read — marque les messages de la conversation comme lus
router.patch('/:id/read', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const convoId = Number(req.params.id);

		const member = await prisma.conversationMember.findUnique({
			where: { userId_conversationId: { userId, conversationId: convoId } },
		});
		if (!member)
			return res.status(403).json({ error: 'Access denied' });

		const unread = await prisma.message.findMany({
			where: { conversationId: convoId, userId: { not: userId }, reads: { none: { userId } } },
			select: { id: true },
		});

		if (unread.length > 0) {
			await prisma.messageRead.createMany({
				data: unread.map((m) => ({ messageId: m.id, userId })),
				skipDuplicates: true,
			});
		}

		const io = req.app.get('io');
		await emitUnreadCount(io, userId);

		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;
