export function registerKanbanHandlers(io, socket) {
    socket.on('project:join', ({ projectId }) => {
        socket.join(`project:${projectId}`)
    })

    socket.on('project:leave', ({ projectId }) => {
        socket.leave(`project:${projectId}`)
    })

    socket.on('task:moved', ({ projectId, taskId, fromColumn, toColumn }) => {
        socket.to(`project:${projectId}`).emit('task:moved', {
            taskId,
            fromColumn,
            toColumn,
            movedBy: { id: socket.user.id, username: socket.user.username },
        })
    })
}