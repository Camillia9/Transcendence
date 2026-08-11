import prisma from '../../../prisma/prisma.js';

// Re-export shared JWT auth so workspace routes have one import point
export { authenticate } from '../../../shared/auth.middleware.js';

const ORGA_PERMISSIONS = {
	Admin: ['view_member', 'edit_orga', 'delete_orga', 'change_role', 'delete_member', 'invit_member', 'create_project'],
	Member: ['view_member'],
};

const PROJECT_PERMISSIONS = {
	Manager: ['create_task', 'view_task', 'edit_task', 'move_task', 'delete_task', 'assign_task', 'view_project', 'edit_project', 'delete_project'],
	User: ['create_task', 'view_task', 'edit_task', 'move_task', 'delete_task', 'view_project'],
};

export async function loadOrgMembership(req, res, next) {
	try {
		const orgId = Number(req.params.orgId);
		if (!Number.isInteger(orgId) || orgId <= 0)
			return res.status(400).json({ error: 'Invalid organisation id' });

		const membre = await prisma.member.findUnique({
			where: {
				userId_orgId: {
					userId: req.user.userId,
					orgId: orgId,
				},
			},
			include: {
				organisation: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!membre)
			return res.status(403).json({ error: 'Not member of this organisation' });

		req.orgMembership = membre;
		req.orgId = orgId;
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Database error' });
	}
}

export async function loadProject(req, res, next) {
	try {
		const projectId = Number(req.params.projectId);
		if (!Number.isInteger(projectId) || projectId <= 0)
			return res.status(400).json({ error: 'Invalid project id' });

		const project = await prisma.project.findUnique({
			where: { id: projectId },
		});

		if (!project)
			return res.status(404).json({ error: 'Project not found' });

		const projectMember = await prisma.projectMember.findUnique({
			where: {
				userId_projectId: {
					userId: req.user.userId,
					projectId: project.id,
				},
			},
		});

		if (!projectMember)
			return res.status(403).json({ error: 'User is not part of this project' });

		req.project = project;
		req.projectMembership = projectMember;
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Database error' });
	}
}

export async function loadTask(req, res, next) {
	try {
		const taskId = Number(req.params.taskId);

		if (!Number.isInteger(taskId) || taskId <= 0)
			return res.status(400).json({ error: 'Invalid taskId' });

		const task = await prisma.task.findUnique({ where: { id: taskId } });

		if (!task || task.projectId !== req.project.id)
			return res.status(404).json({ error: 'Task not found' });

		req.task = task;
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Database error' });
	}
}

export async function loadInvitation(req, res, next) {
	try {
		const invitationId = Number(req.params.id);

		if (!Number.isInteger(invitationId) || invitationId <= 0)
			return res.status(400).json({ error: 'Invalid invitation id' });

		const invitation = await prisma.invitation.findUnique({
			where: { id: invitationId },
			include: {
				organisation: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!invitation)
			return res.status(404).json({ error: 'Invitation not found' });

		req.invitation = invitation;
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Database error' });
	}
}

export async function loadComment(req, res, next) {
	try {
		const commentId = Number(req.params.commentId);

		if (!Number.isInteger(commentId) || commentId <= 0)
			return res.status(400).json({ error: 'Invalid comment id' });

		const comment = await prisma.comment.findFirst({
			where: {
				id: commentId,
				taskId: req.task.id,
			},
			include: {
				user: {
					select: {
						id: true,
						pseudo: true,
						avatar: true,
					},
				},
			},
		});

		if (!comment)
			return res.status(404).json({ error: 'Comment not found' });

		req.comment = comment;
		next();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Database error' });
	}
}

export function checkPermissionOrga(action) {
	return (req, res, next) => {
		if (!req.orgMembership)
			return res.status(500).json({ error: 'Membership not loaded' });

		const permissions = ORGA_PERMISSIONS[req.orgMembership.role] ?? [];
		if (!permissions.includes(action))
			return res.status(403).json({ error: 'Access denied' });

		next();
	};
}

export function checkPermissionProject(action) {
	return (req, res, next) => {
		if (!req.projectMembership)
			return res.status(500).json({ error: 'Membership not loaded' });

		const permissions = PROJECT_PERMISSIONS[req.projectMembership.role] ?? [];
		if (!permissions.includes(action))
			return res.status(403).json({ error: 'Access denied' });

		next();
	};
}

export function canManageTask(req, res, next) {
	if (!req.task)
		return res.status(500).json({ error: 'Task not loaded' });

	if (req.projectMembership.role === 'Manager')
		return next();

	if (req.task.createdById !== req.user.userId && req.task.assignedToId !== req.user.userId)
		return res.status(403).json({ error: 'Not allowed' });

	next();
}
