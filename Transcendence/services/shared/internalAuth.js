/**
 * Protects /internal/* routes — only for service-to-service calls
 * on the Docker backend network (not exposed via nginx).
 */
export function requireInternalKey(req, res, next) {
	const expected = process.env.INTERNAL_API_KEY;
	if (!expected) {
		console.error('INTERNAL_API_KEY is not defined');
		return res.status(500).json({ error: 'Internal API misconfigured' });
	}

	const key = req.headers['x-internal-key'];
	if (!key || key !== expected)
		return res.status(403).json({ error: 'Forbidden' });

	next();
}
