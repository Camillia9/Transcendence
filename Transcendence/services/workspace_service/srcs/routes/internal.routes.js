import { Router } from 'express';
import prisma from '../../../prisma/prisma.js';
import { requireInternalKey } from '../../../shared/internalAuth.js';

const router = Router();

router.use(requireInternalKey);

/**
 * GET /internal/colleagues/:userId
 * Returns userIds that share at least one organisation with :userId (excluding self).
 */
router.get('/colleagues/:userId', async (req, res) => {
	try {
		const userId = Number(req.params.userId);
		if (!Number.isInteger(userId) || userId <= 0)
			return res.status(400).json({ error: 'Invalid userId' });

		const myMemberships = await prisma.member.findMany({
			where: { userId },
			select: { orgId: true },
		});
		const orgIds = myMemberships.map((m) => m.orgId);

		if (orgIds.length === 0)
			return res.json({ userIds: [] });

		const members = await prisma.member.findMany({
			where: {
				orgId: { in: orgIds },
				userId: { not: userId },
			},
			select: { userId: true },
		});

		const userIds = [...new Set(members.map((m) => m.userId))];
		return res.json({ userIds });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Database error' });
	}
});

/**
 * GET /internal/share-org?userId=&otherUserId=
 * True if both users share at least one organisation.
 */
router.get('/share-org', async (req, res) => {
	try {
		const userId = Number(req.query.userId);
		const otherUserId = Number(req.query.otherUserId);

		if (!Number.isInteger(userId) || userId <= 0
			|| !Number.isInteger(otherUserId) || otherUserId <= 0)
			return res.status(400).json({ error: 'Invalid user ids' });

		if (userId === otherUserId)
			return res.json({ shared: true });

		const myOrgs = await prisma.member.findMany({
			where: { userId },
			select: { orgId: true },
		});
		const orgIds = myOrgs.map((m) => m.orgId);

		if (orgIds.length === 0)
			return res.json({ shared: false });

		const shared = await prisma.member.findFirst({
			where: {
				userId: otherUserId,
				orgId: { in: orgIds },
			},
			select: { orgId: true },
		});

		return res.json({ shared: Boolean(shared) });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Database error' });
	}
});

export default router;
