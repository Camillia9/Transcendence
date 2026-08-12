import { buildServiceHealth } from './health.js';

/**
 * Aggregates health of identity + chat + workspace for the status page.
 * Mounted on identity-service as GET /api/status
 */
export async function buildSystemStatus() {
	const checkedAt = new Date().toISOString();
	const chatUrl = process.env.CHAT_URL || 'http://chat-service:3002';
	const workspaceUrl = process.env.WORKSPACE_URL || 'http://workspace-service:3003';

	const [identity, chat, workspace] = await Promise.all([
		buildServiceHealth('identity'),
		fetchServiceHealth(`${chatUrl}/health`, 'chat'),
		fetchServiceHealth(`${workspaceUrl}/health`, 'workspace'),
	]);

	const services = { identity, chat, workspace };
	const values = Object.values(services);
	const allOk = values.every((s) => s.status === 'ok');
	const allDown = values.every((s) => s.status === 'error');

	let status = 'ok';
	if (allDown) status = 'down';
	else if (!allOk) status = 'degraded';

	return { status, checkedAt, services };
}

async function fetchServiceHealth(url, serviceName) {
	const started = Date.now();
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
		const body = await res.json().catch(() => ({}));
		return {
			status: res.ok && body.status === 'ok' ? 'ok' : 'error',
			service: serviceName,
			db: Boolean(body.db),
			latencyMs: body.latencyMs ?? Date.now() - started,
			checkedAt: body.checkedAt || new Date().toISOString(),
			...(body.error && { error: body.error }),
			...(!res.ok && !body.error && { error: `HTTP ${res.status}` }),
		};
	} catch (error) {
		return {
			status: 'error',
			service: serviceName,
			db: false,
			latencyMs: Date.now() - started,
			checkedAt: new Date().toISOString(),
			error: error.message || 'Unreachable',
		};
	}
}
