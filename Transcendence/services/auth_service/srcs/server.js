import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';

import googleStrategy from './auth/google.strategy.js';
import githubStrategy from './auth/github.strategy.js';

import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import friendRouter from './routes/friend.routes.js';
import organisationRouter from './routes/organisation.routes.js';
import profilRouter from './routes/profil.routes.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

passport.use(googleStrategy);
passport.use(githubStrategy);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', friendRouter);
app.use('/api', organisationRouter);
app.use('/api', profilRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Auth service listening on http://localhost:${PORT}`);
});
