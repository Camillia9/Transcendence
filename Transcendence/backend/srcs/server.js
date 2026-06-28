// Fichier permet de creer le server HTTP (Express)
// Attache socket.io dessus (meme port, meme serveur)
// Branche les routes REST
// Init les sockets
// Lance l'ecoute sur le port

import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { initSockets } from './sockets/index.js'
import conversationsRouter from './routes/conversations.js'
import messagesRouter from './routes/messages.js'

// Express gere les requetes HTTP classiques (GET, POST, etc.)
const app = express()

// Permet de lire le corps JSON des requetes entrantes (req.body)
app.use(express.json())

// Serveur HTTP brut
const httpServer = createServer(app)

// Serveur Socket.io, on l'attache au meme httpServer -> un seul port pour REST + WebSockets
const io = new Server(httpServer, {
	cors: {
		origin: process.env.FRONTEND_URL || 'http://localhost:5173',
		// origin : '*',
		methods: ['GET', 'POST'],
	},
})

// Routes REST, toutes les URL /api/conversations/* sont geres par conversationsRouter
app.use('/api/conversations', conversationsRouter)

// Toutes les URLs /api/messages/* sont geres par messagesRouter
app.use('/api/messages', messagesRouter)

// Initialisation des WebSockets, on passe `io` pour que les handlers puissent emettre vers des rooms
initSockets(io)

// Demarer
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
	console.log(`Server launching on http://localhost:${PORT}`)
})