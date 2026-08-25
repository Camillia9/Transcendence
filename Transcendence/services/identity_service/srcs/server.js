import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';

import googleStrategy from './auth/google.strategy.js';
import githubStrategy from './auth/github.strategy.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import friendRouter from './routes/friend.routes.js';
import profilRouter from './routes/profil.routes.js';
import notificationRouter from './routes/notification.routes.js';
import { healthHandler } from '../../shared/health.js';
import { buildSystemStatus } from '../../shared/systemStatus.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://localhost:8443',
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

passport.use(googleStrategy);
passport.use(githubStrategy);

app.get('/health', healthHandler('identity'));
app.get('/api/health', healthHandler('identity'));

app.get('/api/status', async (_req, res) => {
  const payload = await buildSystemStatus();
  const code = payload.status === 'ok' ? 200 : 503;
  return res.status(code).json(payload);
});

app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', friendRouter);
app.use('/api', profilRouter);
app.use('/api', notificationRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Identity service listening on http://localhost:${PORT}`);
});
