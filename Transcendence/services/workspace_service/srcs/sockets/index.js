import { authMiddleware } from './middleware.js'
import { registerKanbanHandlers } from './handlers/kanban.js'

export function initSockets(io) {
	io.use(authMiddleware)

	io.on('connection', (socket) => {
		console.log(`Workspace socket connected : user ${socket.user.userId}`)
		socket.join(`user:${socket.user.userId}`)
		registerKanbanHandlers(io, socket)
	})
}
