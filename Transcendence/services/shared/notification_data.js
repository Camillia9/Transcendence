// creer une notif pour les membres d'une orga sauf celui qui fait l'action
// par ex:
// Alice quitte l'organisation.
export async function notifyOrgaMembers(db, orgId, actorId, type, content) {
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
            orgId,
            type,
            content,
        })),
    });
}

// creer une notif pour tous les membres d'un projet sauf celui qui fait l'action

export async function notifyProjectMembers(db, projectId, actorId, type, content) {
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
}

// creer une seule notification
// par ex:
// Alice invite Bob.
// actorId = Alice
// userId = Bob
export async function notifyUser(db, userId, actorId, type, content) {
    return db.notification.create({
        data: {
            userId,
            actorId,
            type,
            content,
            projectId,
            taskId,
        },
    });
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