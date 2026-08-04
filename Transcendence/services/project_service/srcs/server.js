import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import projectRouter from './routes/project.routes.js';
import taskRouter from './routes/task.routes.js';
import commentRouter from './routes/comment.routes.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'project' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'project' });
});

app.use('/api', projectRouter);
app.use('/api', taskRouter);
app.use('/api', commentRouter);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Project service listening on http://localhost:${PORT}`);
});
