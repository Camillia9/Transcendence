import { emitUserNotification } from '../../../shared/chatClient.js';

// creer une notif pour les membres d'une orga sauf celui qui fait l'action
export async function notifyOrgaMembers(db, orgId, actorId, type, content, _io = null) {
	const membres = await db.member.findMany({
		where: {
			orgId,
			userId: { not: actorId },
		},
		select: { userId: true },
	});

	if (membres.length === 0)
		return;

	await db.notification.createMany({
		data: membres.map((m) => ({
			actorId,
			userId: m.userId,
			type,
		})),
	});

	const createdAt = new Date().toISOString();
	await Promise.all(
		membres.map((m) =>
			emitUserNotification(m.userId, {
				id: Date.now(),
				type,
				createdAt,
				isRead: false,
			}),
		),
	);
}

export async function notifyProjectMembers(db, projectId, actorId, type, content, _io = null) {
	const projectMembres = await db.projectMember.findMany({
		where: {
			projectId,
			userId: { not: actorId },
		},
		select: { userId: true },
	});

	if (projectMembres.length === 0)
		return;

	await db.notification.createMany({
		data: projectMembres.map((m) => ({
			actorId,
			userId: m.userId,
			projectId,
			type,
		})),
	});

	const createdAt = new Date().toISOString();
	await Promise.all(
		projectMembres.map((m) =>
			emitUserNotification(m.userId, {
				id: Date.now(),
				type,
				createdAt,
				isRead: false,
			}),
		),
	);
}

export async function notifyUser(db, userId, actorId, type, content, _io = null, projectId = null, taskId = null) {
	const notif = await db.notification.create({
		data: {
			userId,
			actorId,
			type,
			...(projectId !== null && { projectId }),
			...(taskId !== null && { taskId }),
		},
	});

	await emitUserNotification(userId, {
		id: notif.id,
		type,
		createdAt: notif.createdAt.toISOString(),
		isRead: false,
	});

	return notif;
}
