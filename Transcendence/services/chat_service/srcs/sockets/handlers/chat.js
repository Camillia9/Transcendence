import prisma from '../../../../prisma/prisma.js';
import { emitUnreadCount } from './unread.js';

export function registerChatHandlers(io, socket) {
    const userId = socket.user.userId

    joinAllConversations()

    async function joinAllConversations() {
        try {
            const memberships = await prisma.conversationMember.findMany({
                where: { userId },
                select: { conversationId: true }
            })
            memberships.forEach(m => socket.join(`conversation:${m.conversationId}`))
        } catch (e) {
            console.error('Impossible de rejoindre les conversations', e)
        }
    }

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

            const otherMembers = await prisma.conversationMember.findMany({
                where: { conversationId, NOT: { userId } },
                select: { userId: true }
            })
            otherMembers.forEach(({ userId: recipientId }) => emitUnreadCount(io, recipientId))
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
