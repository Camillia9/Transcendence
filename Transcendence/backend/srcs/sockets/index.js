import { authMiddleware } from './middleware.js'
import { registerChatHandlers } from './handlers/chat.js'
import { registerKanbanHandlers } from './handlers/kanban.js'
import { registerNotificationHandlers } from './handlers/notifications.js'
import { registerStatusHandlers } from './handlers/status.js'

export function initSockets(io) {
    io.use(authMiddleware)

    io.on('connection', (socket) => {
        console.log(`Connected : ${socket.user.username}`)
        registerChatHandlers(io, socket)
        registerKanbanHandlers(io, socket)
        registerNotificationHandlers(io, socket)
        registerStatusHandlers(io, socket)
    });
}