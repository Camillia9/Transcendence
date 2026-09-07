import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import conversationsRouter from './routes/conversations.js';
import messagesRouter from './routes/messages.js';
import internalRouter from './routes/internal.routes.js';
import { initSockets } from './sockets/index.js';
import { healthHandler } from '../../shared/health.js';
import { metricsMiddleware } from '../../shared/metrics.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: '/socket.io/',
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

app.use(metricsMiddleware('chat'));
app.use(express.json());

app.get('/health', healthHandler('chat'));
app.get('/api/health', healthHandler('chat'));

app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/internal', internalRouter);

initSockets(io);

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`Chat service listening on http://localhost:${PORT}`);
});

// Graceful shutdown handler
const shutdown = (signal) => {
  console.log(`Chat service received ${signal}, shutting down gracefully…`);
  io.close();
  httpServer.close(() => {
    console.log('Chat service shut down complete.');
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
