const chatUrl = () => process.env.CHAT_URL || 'http://chat-service:3002';
const internalKey = () => process.env.INTERNAL_API_KEY;

/**
 * Ask chat-service to emit notification:new on user room.
 * Fire-and-forget friendly: logs errors, does not throw by default.
 */
export async function emitUserNotification(userId, notification) {
	try {
		const res = await fetch(`${chatUrl()}/internal/notify`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-key': internalKey(),
			},
			body: JSON.stringify({ userId, notification }),
		});

		if (!res.ok) {
			const body = await res.text();
			console.error(`Chat notify failed ${res.status}: ${body}`);
		}
	} catch (error) {
		console.error('Chat notify request failed:', error.message);
	}
}
