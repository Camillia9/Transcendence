export function registerNotificationHandlers(io, socket) {
	socket.join(`user:${socket.user.userId}`)
}

export function sendNotification(io, userId, { type, message, link }) {
	io.to(`user:${userId}`).emit('notification:new', {
		id: Date.now(),
		type,
		message,
		link,
		createdAt: new Date().toISOString(),
		read: false,
	})
}
