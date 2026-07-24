import express from 'express';
import authRoutes from '../services/auth/routes/auth.routes.js';
import organizationRoutes from '../services/organization/routes/organization.routes.js';
import invitationRoutes from '../services/organization/routes/invitation.routes.js';
import projectRoutes from '../services/projects/routes/project.routes.js';
import taskRoutes from '../services/projects/routes/task.routes.js';
import conversationsRoutes from '../services/messaging/routes/conversations.routes.js';
import messagesRoutes from '../services/messaging/routes/messages.routes.js';

const router = express.Router();

router.use(authRoutes);
router.use(organizationRoutes);
router.use(invitationRoutes);
router.use(projectRoutes);
router.use(taskRoutes);
router.use(conversationsRoutes);
router.use(messagesRoutes);

export default router;
