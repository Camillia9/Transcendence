import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import conversationsRouter from './routes/conversations.js';
import messagesRouter from './routes/messages.js';
import invitationRouter from './routes/invitation.routes.js';
import { initSockets } from './sockets/index.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chat' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'chat' });
});

app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api', invitationRouter);

initSockets(io);

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`Chat service listening on http://localhost:${PORT}`);
});
