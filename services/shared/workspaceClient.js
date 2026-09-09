const workspaceUrl = () => process.env.WORKSPACE_URL || 'http://workspace-service:3003';
const internalKey = () => process.env.INTERNAL_API_KEY;

async function workspaceFetch(path) {
	const res = await fetch(`${workspaceUrl()}${path}`, {
		headers: {
			'x-internal-key': internalKey(),
			Accept: 'application/json',
		},
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Workspace internal error ${res.status}: ${body}`);
	}

	return res.json();
}

/** @returns {Promise<number[]>} */
export async function getColleagueUserIds(userId) {
	const data = await workspaceFetch(`/internal/colleagues/${userId}`);
	return data.userIds || [];
}

/** @returns {Promise<boolean>} */
export async function usersShareOrganisation(userId, otherUserId) {
	const data = await workspaceFetch(
		`/internal/share-org?userId=${userId}&otherUserId=${otherUserId}`,
	);
	return Boolean(data.shared);
}
