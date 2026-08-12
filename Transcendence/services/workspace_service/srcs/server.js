import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import organisationRouter from './routes/organisation.routes.js';
import invitationRouter from './routes/invitation.routes.js';
import projectRouter from './routes/project.routes.js';
import taskRouter from './routes/task.routes.js';
import commentRouter from './routes/comment.routes.js';
import internalRouter from './routes/internal.routes.js';
import { initSockets } from './sockets/index.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: '/workspace/socket.io/',
  cors: {
    origin: process.env.FRONTEND_URL || 'https://localhost:8443',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://localhost:8443',
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'workspace' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'workspace' });
});

app.use('/api', organisationRouter);
app.use('/api', invitationRouter);
app.use('/api', projectRouter);
app.use('/api', taskRouter);
app.use('/api', commentRouter);
app.use('/internal', internalRouter);

initSockets(io);

const PORT = process.env.PORT || 3003;

httpServer.listen(PORT, () => {
  console.log(`Workspace service listening on http://localhost:${PORT}`);
});
