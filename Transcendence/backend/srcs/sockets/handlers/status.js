export function registerStatusHandlers(io, socket) {
	const { id, username } = socket.user

	socket.broadcast.emit('user:status', { userId: id, username, status: 'online' })

	socket.on('disconnect', () => {
		io.emit('user:status', { userId: id, username, status: 'offline' })
	})
}
