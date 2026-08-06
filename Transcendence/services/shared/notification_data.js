// creer une notif pour les membres d'une orga sauf celui qui fait l'action
// par ex:
// Alice quitte l'organisation.
export async function notifyOrgaMembers(db, orgId, actorId, type, content, io = null) {
    // on recupere tous les membres sauf celui qui a fait l'action
    const membres = await db.member.findMany({
        where: {
            orgId,
            userId: {
                not: actorId
            },
        },
        select: {
            userId: true
        },
    });

    if (membres.length === 0)
        return;

    await db.notification.createMany({
        data: membres.map(m => ({
            actorId,
            userId: m.userId,
            type,
            content,
        })),
    });

    if (io) {
        for (const m of membres) {
            io.to(`user:${m.userId}`).emit('notification:new', {
                id: Date.now(),
                type,
                content,
                createdAt: new Date().toISOString(),
                isRead: false,
            });
        }
    }
}

// creer une notif pour tous les membres d'un projet sauf celui qui fait l'action

export async function notifyProjectMembers(db, projectId, actorId, type, content, io = null) {
    // on recupere tous les membres sauf celui qui a fait l'action
    const projectMembres = await db.projectMember.findMany({
        where: {
            projectId,
            userId: {
                not: actorId
            },
        },
        select: {
            userId: true
        },
    });

    if (projectMembres.length === 0)
        return;

    await db.notification.createMany({
        data: projectMembres.map(m => ({
            actorId,
            userId: m.userId,
            projectId,
            type,
            content,
        })),
    });

    if (io) {
        for (const m of projectMembres) {
            io.to(`user:${m.userId}`).emit('notification:new', {
                id: Date.now(),
                type,
                message: content,
                createdAt: new Date().toISOString(),
                isRead: false,
            });
        }
    }
}

// creer une seule notification
// par ex:
// Alice invite Bob.
// actorId = Alice
// userId = Bob
export async function notifyUser(db, userId, actorId, type, content, io = null, projectId = null, taskId = null) {
    const notif = await db.notification.create({
        data: {
            userId,
            actorId,
            type,
            content,
            ...(projectId !== null && { projectId }),
            ...(taskId !== null && { taskId }),
        },
    });

    if (io) {
        io.to(`user:${userId}`).emit('notification:new', {
            id: notif.id,
            type,
            content,
            createdAt: notif.createdAt.toISOString(),
            isRead: false,
        });
    }

    return notif;
}


// await prisma.notification.createMany({
//     data: membres.map(m => ({
//         actorId: req.user.userId,
//         userId: m.userId,
//         type: 'MemberLeft',
//         content: `${req.user.pseudo} a quitté l'organisation`
//     }))
// });


// await prisma.notification.createMany({
//     data: membres.map(m => ({
//         actorId: req.user.userId,
//         userId: m.userId,
//         projectId,
//         type: 'ProjectUpdated',
//         content: 'Le projet a été renommé'
//     }))
// });

// POST /organisations → créer l'organisation → éventuellement notification au créateur (ou aucune).
// DELETE /organisations/:orgId/me → quitter l'organisation → notifier les autres membres.
// PATCH /projects/:projectId → renommer le projet → notifier les membres du projet.
// PATCH /tasks/:id/assign → assigner une tâche → notifier uniquement l'utilisateur assigné.
// POST /comments → ajouter un commentaire → notifier les personnes concernées.

// dans une route
// await prisma.member.delete({
//     ...
// });

// await notifyOrganisationMembers(
//     req.orgId,
//     req.user.userId,
//     'MemberLeft',
//     `${req.user.pseudo} a quitté l'organisation`
// );