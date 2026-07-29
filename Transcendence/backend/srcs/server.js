// Fichier permet de creer le server HTTP (Express)
// Attache socket.io dessus (meme port, meme serveur)
// Branche les routes REST
// Init les sockets
// Lance l'ecoute sur le port

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import passport from 'passport';

import googleStrategy from './auth/google.strategy.js';
import gitHubStrategy from './auth/github.strategy.js';

import { initSockets } from './sockets/index.js';
import conversationsRouter from './routes/conversations.js';
import messagesRouter from './routes/messages.js';

import authRouter from './routes/auth.routes.js';
import orgaRouter from './routes/organisation.routes.js';
import invitationRouter from './routes/invitation.routes.js';
import projectRouter from './routes/project.routes.js';
import taskRouter from './routes/task.routes.js';
import userRouter from './routes/user.routes.js'

// Express gere les requetes HTTP classiques (GET, POST, etc.)
const app = express()

// Autorise le front (origine 5173) à appeler les routes REST du back.
// elle dit à Express « pour toutes les routes, ajoute l'en-tête d'autorisation Access-Control-Allow-Origin pointant vers le front ».
app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}))

// Permet de lire le corps JSON des requetes entrantes (req.body)
app.use(express.json())

// // Passport OAuth
passport.use(googleStrategy);
passport.use(gitHubStrategy);

// // Routes REST authentification / organisation
app.use('/api', authRouter);
// app.use('/api', orgaRouter);
// app.use('/api', invitationRouter);
app.use('/api', projectRouter);
app.use('/api', taskRouter);
app.use('/api', userRouter);
// Serveur HTTP brut
//0695428562
const httpServer = createServer(app);

// Serveur Socket.io, on l'attache au meme httpServer -> un seul port pour REST + WebSockets
const io = new Server(httpServer, {
	cors: {
		origin: process.env.FRONTEND_URL || 'http://localhost:5173',
		// origin : '*',
		methods: ['GET', 'POST'],
	},
});

// Routes REST, toutes les URL /api/conversations/* sont geres par conversationsRouter
app.use('/api/conversations', conversationsRouter);

// Toutes les URLs /api/messages/* sont geres par messagesRouter
app.use('/api/messages', messagesRouter);

// Route "santé" : confirme que le serveur répond. Ne dépend de rien (ni base, ni logique).
app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Initialisation des WebSockets, on passe `io` pour que les handlers puissent emettre vers des rooms
initSockets(io);

// Demarer
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
	console.log(`Server launching on http://localhost:${PORT}`);
});