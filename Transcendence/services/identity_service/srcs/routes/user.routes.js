import { Router } from 'express';
import { authenticate } from '../../../shared/auth.middleware.js';
import prisma from '../../../prisma/prisma.js';
import { getColleagueUserIds } from '../../../shared/workspaceClient.js';

const router = Router();

// GET /api/users — collègues d'orga (via API interne workspace, pas d'accès direct Member)
router.get('/users', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;
		const otherUserIds = await getColleagueUserIds(userId);

		if (otherUserIds.length === 0)
			return res.json([]);

		const users = await prisma.user.findMany({
			where: { id: { in: otherUserIds } },
			select: { id: true, pseudo: true, avatar: true, email: true },
		});

		res.json(users);
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: e.message });
	}
});

router.get('/users/by-pseudo', authenticate, async (req, res) => {
	const pseudo = req.query.pseudo;
	if (!pseudo)
		return res.status(400).json({ error: 'Pseudo required' });

	const user = await prisma.user.findUnique({
		where: { pseudo },
		select: {
			id: true,
			pseudo: true,
			avatar: true,
		},
	});

	if (!user)
		return res.status(404).json({ error: 'User not found' });

	return res.json(user);
});

export default router;
