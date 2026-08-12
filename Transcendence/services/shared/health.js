import prisma from '../prisma/prisma.js';

/**
 * Returns { status, service, db, latencyMs, checkedAt }
 * status = 'ok' | 'error'
 */
export async function buildServiceHealth(serviceName) {
	const checkedAt = new Date().toISOString();
	const started = Date.now();

	try {
		await prisma.$queryRaw`SELECT 1`;
		return {
			status: 'ok',
			service: serviceName,
			db: true,
			latencyMs: Date.now() - started,
			checkedAt,
		};
	} catch (error) {
		return {
			status: 'error',
			service: serviceName,
			db: false,
			latencyMs: Date.now() - started,
			checkedAt,
			error: error.message || 'Database unreachable',
		};
	}
}

/** Express handler factory for /health and /api/health */
export function healthHandler(serviceName) {
	return async (_req, res) => {
		const health = await buildServiceHealth(serviceName);
		const code = health.status === 'ok' ? 200 : 503;
		return res.status(code).json(health);
	};
}
