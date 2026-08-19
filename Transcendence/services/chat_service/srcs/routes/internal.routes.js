import { Router } from 'express';
import { requireInternalKey } from '../../../shared/internalAuth.js';

const router = Router();

router.use(requireInternalKey);

/**
 * POST /internal/notify
 * Emits notification:new on the chat socket user room.
 * Body: { userId, notification: { id, type, content, createdAt, isRead } }
 */
router.post('/notify', (req, res) => {
	try {
		const { userId, notification } = req.body;
		const uid = Number(userId);

		if (!Number.isInteger(uid) || uid <= 0 || !notification)
			return res.status(400).json({ error: 'userId and notification required' });

		const io = req.app.get('io');
		if (io) {
			io.to(`user:${uid}`).emit('notification:new', notification);
		}

		return res.json({ ok: true });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Emit failed' });
	}
});

router.post('/emit', (req, res) => {
	try {
		const { userIds, event, payload } = req.body;

		if (!Array.isArray(userIds) || !event)
			return res.status(400).json({ error: 'userIds and event required' });

		const io = req.app.get('io');
		if (io) {
			userIds.forEach((uid) => {
				const id = Number(uid);
				if (Number.isInteger(id) && id > 0)
					io.to(`user:${id}`).emit(event, payload);
			});
		}

		return res.json({ ok: true });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Emit failed' });
	}
});

export default router;
