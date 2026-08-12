import { verifyToken } from './jwt.utils.js';

/**
 * Shared auth only — no organisation/project logic here.
 * Verifies Bearer JWT and sets req.user = { userId, ... }.
 */
export function authenticate(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer '))
		return res.status(401).json({ error: 'Unauthenticated' });

	try {
		const token = authHeader.split(' ')[1];
		req.user = verifyToken(token);
		next();
	} catch {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}
