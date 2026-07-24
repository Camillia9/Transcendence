import { Router } from 'express';
import { authenticate } from '../../../shared/checkPermission.js';
import prisma from '../../../shared/prisma.js';

const router = Router();

// GET /api/conversations — liste les conversations
router.get('/', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const convos = await prisma.conversation.findMany({
			where: { conversationMembers: { some: { userId } } },
			include: {
				conversationMembers: {
					include: { user: { select: { id: true, pseudo: true, avatar: true } } }
				},
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					include: { user: { select: { id: true, pseudo: true } } }
				}
			}
		});
		res.json(convos);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// POST /api/conversations — cree une conversation
router.post('/', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const { participantIds, name, type } = req.body;

		if (!Array.isArray(participantIds) || participantIds.length === 0)
			return res.status(400).json({ error: 'participantIds is required' });

		const allParticipants = [...new Set([userId, ...participantIds.map(Number)])];
		const convType = (type === 'Group' || type === 'group') ? 'Group' : 'Private';

		if (convType === 'Private' && allParticipants.length !== 2)
			return res.status(400).json({ error: 'A private conversation requires exactly 2 participants' });

		const creatorOrgs = await prisma.member.findMany({
			where: { userId },
			select: { orgId: true }
		});
		const creatorOrgIds = creatorOrgs.map(m => m.orgId);

		for (const pid of participantIds.map(Number)) {
			if (pid === userId) continue;
			const sharedOrg = await prisma.member.findFirst({
				where: { userId: pid, orgId: { in: creatorOrgIds } }
			});
			if (!sharedOrg)
				return res.status(403).json({ error: `User ${pid} does not share an organisation with you` });
		}

		if (convType === 'Private') {
			const otherId = participantIds.map(Number).find(id => id !== userId) ?? participantIds[0];
			const existing = await prisma.conversation.findFirst({
				where: {
					type: 'Private',
					AND: [
						{ conversationMembers: { some: { userId } } },
						{ conversationMembers: { some: { userId: Number(otherId) } } }
					]
				},
				include: {
					conversationMembers: {
						include: { user: { select: { id: true, pseudo: true, avatar: true } } }
					}
				}
			});
			if (existing) return res.json(existing);
		}

		const convo = await prisma.conversation.create({
			data: {
				type: convType,
				name: convType === 'Group' ? (name || 'Group') : null,
				conversationMembers: {
					create: allParticipants.map(uid => ({ userId: uid }))
				}
			},
			include: {
				conversationMembers: {
					include: { user: { select: { id: true, pseudo: true, avatar: true } } }
				}
			}
		});

		res.status(201).json(convo);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// GET /api/conversations/:id — recuperer une conversation specifique
router.get('/:id', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const convoId = Number(req.params.id);

		const convo = await prisma.conversation.findUnique({
			where: { id: convoId },
			include: {
				conversationMembers: {
					include: { user: { select: { id: true, pseudo: true, avatar: true } } }
				}
			}
		});

		if (!convo)
			return res.status(404).json({ error: 'Conversation not found' });

		const isMember = convo.conversationMembers.some(m => m.userId === userId);
		if (!isMember)
			return res.status(403).json({ error: 'Access denied' });

		res.json(convo);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

export default router;
