// Fichier permettant de créer le serveur HTTP (Express)
// Attache Socket.IO dessus, branche les routes REST, initialise les sockets et démarre l'écoute

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { initSockets } from './sockets/index.js';
import bffRouter from './bff/router.js';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.use(express.json());

app.use(bffRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

initSockets(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server launching on http://localhost:${PORT}`);
});
