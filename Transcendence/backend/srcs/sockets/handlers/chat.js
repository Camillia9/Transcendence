export function registerChatHandlers(io, socket) {
    const user = socket.user

    socket.on('conversation:join', ({ conversationId }) => {
        socket.join(`conversation:${conversationId}`)
    })

    socket.on('conversation:leave', ({ conversationId }) => {
        socket.leave(`conversation:${conversationId}`)
    })

    socket.on('message:send', ({ conversationId, content }) => {
        // TODO : sauvegarder dans la database (besoin du dev 2 je crois). Message non sauvegarder = evoyer a un utilisateur non connecte, apres qu'il soit connecte, ne recoit pas le message
        const message = {
            conversationId,
            content,
            sender: { id: user.id, username: user.username },
            createdAt: new Date().toISOString(),
        }
        io.to(`conversation:${conversationId}`).emit('message:new', message)
    })

    socket.on('typing:start', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:update', { username: user.username, isTyping: true })
    })

    socket.on('typing:stop', ({ conversationId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing:update', { username: user.username, isTyping: false })
    })
}
