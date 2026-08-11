import { Router } from 'express';
import { authenticate } from '../../../shared/middleware/checkPermission.js';
import prisma from '../../../prisma/prisma.js';

const router = Router();

// GET /api/users — liste les utilisateurs qui partagent une organisation avec moi
router.get('/users', authenticate, async (req, res) => {
	try {
		const userId = req.user.userId;

		const myMemberships = await prisma.member.findMany({
			where: { userId },
			select: { orgId: true }
		});
		const orgIds = myMemberships.map(m => m.orgId);

		if (orgIds.length === 0)
			return res.json([]);

		const members = await prisma.member.findMany({
			where: {
				orgId: { in: orgIds },
				userId: { not: userId }
			},
			select: { userId: true }
		});
		const otherUserIds = [...new Set(members.map(m => m.userId))];

		const users = await prisma.user.findMany({
			where: { id: { in: otherUserIds } },
			select: { id: true, pseudo: true, avatar: true, email: true }
		});

		res.json(users);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// route pour retrouver un user par son pseudo pour avoir userId
router.get("/users/by-pseudo", authenticate, async (req, res) => {
	const pseudo = req.query.pseudo;
	if (!pseudo)
		return res.status(400).json({ error: "Pseudo required" });

	const user = await prisma.user.findUnique({
		where: {
			pseudo
		},
		select: {
			id: true,
			pseudo: true,
			avatar: true
		}
	});

	if (!user)
		return res.status(404).json({ error: "User not found" });

	return res.json(user);
})

export default router;