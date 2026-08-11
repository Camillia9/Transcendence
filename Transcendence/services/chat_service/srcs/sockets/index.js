import { authMiddleware } from './middleware.js'
import { registerChatHandlers } from './handlers/chat.js'
import { registerNotificationHandlers } from './handlers/notifications.js'
import { registerStatusHandlers } from './handlers/status.js'

// Chat = messagerie + bus realtime user (notif rooms, status).
// Kanban vit dans workspace_service.
export function initSockets(io) {
    io.use(authMiddleware)

    io.on('connection', (socket) => {
        console.log(`Chat socket connected : user ${socket.user.userId}`)
        socket.join(`user:${socket.user.userId}`)
        registerChatHandlers(io, socket)
        registerNotificationHandlers(io, socket)
        registerStatusHandlers(io, socket)
    });
}
