import prisma from '../../shared/prisma.js';

export function registerChatHandlers(io, socket) {
    const userId = socket.user.userId

    socket.on('conversation:join', ({ conversationId }) => {
        socket.join(`conversation:${conversationId}`)
    })

    socket.on('conversation:leave', ({ conversationId }) => {
        socket.leave(`conversation:${conversationId}`)
    })

    socket.on('message:send', async ({ conversationId, content }) => {
        if (!content || !content.trim()) return

        try {
            const message = await prisma.message.create({
                data: {
                    content: content.trim(),
                    userId,
                    conversationId,
                },
                include: { user: { select: { id: true, pseudo: true, avatar: true } } }
            })

            io.to(`conversation:${conversationId}`).emit('message:new', message)
        } catch (e) {
            socket.emit('error', { message: e.message })
        }
    })

    socket.on('typing:start', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:update', { userId, isTyping: true })
    })

    socket.on('typing:stop', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:update', { userId, isTyping: false })
    })
}

