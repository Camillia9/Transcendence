import { emitUserNotification } from '../../../shared/chatClient.js';

// creer une notif pour les membres d'une orga sauf celui qui fait l'action
export async function notifyOrgaMembers(db, orgId, actorId, type, _io = null) {
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

	const createdNotifications = await db.notification.createManyAndReturn({
		data: membres.map((member) => ({
			actorId,
			userId: member.userId,
			type,
		})),
		select: {
			id: true,
		},
	});

	const notifications = await db.notification.findMany({
		where: {
			id: {
				in: createdNotifications.map((notification) => notification.id),
			},
		},
		include: {
			actor: {
				select: {
					id: true,
					pseudo: true,
					avatar: true,
				},
			},
			task: {
				select: {
					id: true,
					title: true,
				},
			},
			project: {
				select: {
					id: true,
					title: true,
				},
			},
		},
	});

	await Promise.all(
		notifications.map((notification) =>
			emitUserNotification(notification.userId, {
				id: notification.id,
				type: notification.type,
				actor: notification.actor,
				task: notification.task,
				project: notification.project,
				createdAt: notification.createdAt.toISOString(),
				isRead: notification.isRead,
			}),
		),
	);
	return notifications;
}

export async function notifyProjectMembers(db, projectId, actorId, type, _io = null) {
	// cherche les membres du projet sauf celui qui fait l'action
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

	// creation des notif
	const createdNotifications = await db.notification.createManyAndReturn({
		data: projectMembres.map((member) => ({
			actorId,
			userId: member.userId,
			projectId,
			type,
		})),
		select: {
			id: true,
		},
	});

	// recupere les notif avec leur relation
	const notifications = await db.notification.findMany({
		where: {
			id: {
				in: createdNotifications.map((notification) => notification.id),
			},
		},
		include: {
			actor: {
				select: {
					id: true,
					pseudo: true,
					avatar: true,
				},
			},
			task: {
				select: {
					id: true,
					title: true,
				},
			},
			project: {
				select: {
					id: true,
					title: true,
				},
			},
		},
	});

	// envoie chaque notif en temps reel
	await Promise.all(
		notifications.map((notification) =>
			emitUserNotification(notification.userId, {
				id: notification.id,
				type: notification.type,
				actor: notification.actor,
				task: notification.task,
				project: notification.project,
				createdAt: notification.createdAt.toISOString(),
				isRead: notification.isRead,
			}),
		),
	);
	return notifications;
}

export async function notifyUser(db, userId, actorId, type, _io = null, projectId = null, taskId = null) {
	const notification = await db.notification.create({
		data: {
			userId,
			actorId,
			type,
			...(projectId !== null && { projectId }),
			...(taskId !== null && { taskId }),
		},
		include: {
			actor: {
				select: {
					id: true,
					pseudo: true,
					avatar: true,
				},
			},
			task: {
				select: {
					id: true,
					title: true,
				},
			},
			project: {
				select: {
					id: true,
					title: true,
				},
			},
		},
	});

	await emitUserNotification(userId, {
		id: notification.id,
		type: notification.type,
		actor: notification.actor,
		task: notification.task,
		project: notification.project,
		createdAt: notif.createdAt.toISOString(),
		isRead: notification.isRead,
	});

	return notification;
}
