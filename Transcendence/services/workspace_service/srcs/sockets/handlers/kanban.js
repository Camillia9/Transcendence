import prisma from '../../../../prisma/prisma.js'

export function registerKanbanHandlers(io, socket) {
    socket.on('project:join', async ({ projectId }) => {
        const id = Number(projectId)
        if (!Number.isInteger(id) || id <= 0) return

        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: socket.user.userId,
                    projectId: id,
                },
            },
        })

        if (!membership) return

        socket.join(`project:${id}`)
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