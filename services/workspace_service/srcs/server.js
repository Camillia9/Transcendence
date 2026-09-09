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
import { healthHandler } from '../../shared/health.js';
import { metricsMiddleware } from '../../shared/metrics.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: '/workspace/socket.io/',
  cors: {
    origin: process.env.APP_URL || 'https://localhost:8443',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({
  origin: process.env.APP_URL || 'https://localhost:8443',
  credentials: true,
}));

app.use(metricsMiddleware('workspace'));
app.use(express.json());

app.get('/health', healthHandler('workspace'));
app.get('/api/health', healthHandler('workspace'));

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

// Graceful shutdown handler
const shutdown = (signal) => {
  console.log(`Workspace service received ${signal}, shutting down gracefully…`);
  io.close();
  httpServer.close(() => {
    console.log('Workspace service shut down complete.');
    process.exit(0);
  });
  // Force shutdown after 5 seconds
  setTimeout(() => {
    console.error('Forced shutdown after 5 seconds');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
