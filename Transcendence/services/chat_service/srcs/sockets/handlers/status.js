import prisma from '../../../../prisma/prisma.js';

async function getWatchers(userId) {
	const watchers = await prisma.friend.findMany({
		where: { friendId: userId },
		select: { userId: true },
	});
	return watchers.map(w => w.userId);
}

export function registerStatusHandlers(io, socket) {
	const userId = socket.user.userId

	updateOnlineStatus(true)

	socket.on('disconnect', () => {
		updateOnlineStatus(false)
	})

	async function updateOnlineStatus(isOnline) {
		try {
			const user = await prisma.user.update({
				where: { id: userId },
				data: { isOnline },
				select: { statut: true },
			})

			const watcherIds = await getWatchers(userId)
			watcherIds.forEach(watcherId => {
				io.to(`user:${watcherId}`).emit('user:status', { userId, isOnline, statut: user.statut })
			})
		} catch (e) {
			console.error('Impossible de mettre a jour le statut en ligne', e)
		}
	}
}
