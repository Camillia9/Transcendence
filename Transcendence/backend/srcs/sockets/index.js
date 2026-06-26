import { authMiddleware } from './middleware.js'

export function initSockets(io) {
    io.use(authMiddleware)

    io.on('connection', (socket) => {
        console.log(`Connected : ${socket.user.username}`)
        // registerChatHandlers(io, socket)
        // registerKanbanHandlers(io, socket)
    });
}