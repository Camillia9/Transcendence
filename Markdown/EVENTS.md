# WebSocket — Liste des événements (Dev 3)

Serveur : Socket.io sur `http://localhost:3000`  
Auth : token JWT à passer dans `socket.handshake.auth.token`

```js
const socket = io('http://localhost:3000', {
  auth: { token: '<JWT>' }
})
```

---

## Kanban — `/projet/:id`

> Rejoindre la room du projet dès que la page est ouverte.

| Client → Serveur | Payload | Description |
|---|---|---|
| `project:join` | `{ projectId: number }` | Rejoindre la room du projet |
| `project:leave` | `{ projectId: number }` | Quitter la room du projet |
| `task:moved` | `{ projectId, taskId, fromColumn, toColumn }` | Diffuse le déplacement aux autres membres |

| Serveur → Client | Payload | Description |
|---|---|---|
| `task:moved` | `{ taskId, fromColumn, toColumn, movedBy: { id, username } }` | Une tâche a été déplacée par quelqu'un d'autre |

**Exemple (Dev 2 — émettre un déplacement) :**
```js
socket.emit('task:moved', {
  projectId: 42,
  taskId: 7,
  fromColumn: 'todo',
  toColumn: 'doing'
})
```

**Exemple (Dev 1 — écouter les déplacements) :**
```js
socket.on('task:moved', ({ taskId, toColumn, movedBy }) => {
  // mettre à jour le board localement
})
```

---

## Chat — panneau flottant

> Rejoindre la room de conversation dès que le panneau est ouvert.

| Client → Serveur | Payload | Description |
|---|---|---|
| `conversation:join` | `{ conversationId: number }` | Rejoindre la room de la conversation |
| `conversation:leave` | `{ conversationId: number }` | Quitter la room |
| `message:send` | `{ conversationId, content: string }` | Envoyer un message |
| `typing:start` | `{ conversationId: number }` | L'utilisateur commence à taper |
| `typing:stop` | `{ conversationId: number }` | L'utilisateur arrête de taper |

| Serveur → Client | Payload | Description |
|---|---|---|
| `message:new` | `{ conversationId, content, sender: { id, username }, createdAt }` | Nouveau message reçu |
| `typing:update` | `{ username: string, isTyping: boolean }` | Quelqu'un tape (ou a arrêté) |

**Exemple (Dev 1 — envoyer et recevoir) :**
```js
socket.emit('conversation:join', { conversationId: 1 })

socket.emit('message:send', { conversationId: 1, content: 'Salut !' })

socket.on('message:new', ({ content, sender }) => {
  // afficher le message dans le fil
})

socket.on('typing:update', ({ username, isTyping }) => {
  // afficher/masquer "X est en train d'écrire..."
})
```

---

## Notifications — prêt

> Chaque user rejoint automatiquement sa room privée `user:<id>` à la connexion.

| Serveur → Client | Payload | Description |
|---|---|---|
| `notification:new` | `{ id, type, message, link, createdAt, read }` | Nouvelle notification en temps réel |

**Dev 2 — pour envoyer une notif depuis une route REST :**
```js
import { sendNotification } from '../sockets/handlers/notifications.js'

// Exemple : après une assignation
sendNotification(io, userId, {
  type: 'task_assigned',
  message: 'Tu as été assigné à "Créer la page login"',
  link: '/projet/42'
})
```

**Dev 1 — pour écouter les notifs :**
```js
socket.on('notification:new', (notif) => {
  // afficher la cloche + incrémenter le compteur
})

---

## Statut en ligne — (à venir)

> Déclenché automatiquement à la connexion/déconnexion socket.

| Serveur → Client | Payload | Description |
|---|---|---|
| `user:status` | `{ userId: number, status: 'online' \| 'offline' }` | Changement de statut d'un ami |

*Dev 5 a besoin de cet événement pour afficher le statut en ligne.*
