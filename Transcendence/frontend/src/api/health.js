const BASE_URL = '/api'

/**
 * Health / status can return 503 when degraded — still parse the body.
 */
async function fetchHealthJson(path) {
	const response = await fetch(`${BASE_URL}${path}`, {
		headers: { 'Content-Type': 'application/json' },
	})
	const data = await response.json().catch(() => ({}))
	return { ok: response.ok, statusCode: response.status, data }
}

// export async function getHealth() {
// 	const { data } = await fetchHealthJson('/health')
// 	return data
// }

export async function getSystemStatus() {
	const { data } = await fetchHealthJson('/status')
	return data
}
