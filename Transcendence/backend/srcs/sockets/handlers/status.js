export function registerStatusHandlers(io, socket) {
	const userId = socket.user.userId

	socket.broadcast.emit('user:status', { userId, status: 'online' })

	socket.on('disconnect', () => {
		io.emit('user:status', { userId, status: 'offline' })
	})
}
