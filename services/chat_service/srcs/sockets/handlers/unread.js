import prisma from '../../../../prisma/prisma.js';

export async function getUnreadCount(userId) {
	return await prisma.message.count({
		where: {
			userId: { not: userId },
			conversation: { conversationMembers: { some: { userId } } },
			reads: { none: { userId } },
		},
	});
}

export async function emitUnreadCount(io, userId) {
	const count = await getUnreadCount(userId);
	io.to(`user:${userId}`).emit('messages:unread-count', { count });
}
