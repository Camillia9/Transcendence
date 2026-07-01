export function registerNotificationHandlers(io, socket) { // user join un message privee pour recevoir le message du notification sinon ca part dans le vide
	socket.join(`user:${socket.user.id}`)
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
