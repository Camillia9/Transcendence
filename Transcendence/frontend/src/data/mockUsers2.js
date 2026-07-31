// src/data/mockUsers.js
// Forme PLATE, identique à GET /users/search
export const mockUsers = [
  // déjà amis (dans mockFriends) → testeront "Supprimer"
  { id: 7,   pseudo: "alice",   avatar: null, statut: "Available", isOnline: true },
  { id: 12,  pseudo: "bob",     avatar: null, statut: "Away",      isOnline: false },
  // inconnus → testeront "Ajouter"
  { id: 100, pseudo: "alicia",  avatar: null, statut: "Available", isOnline: true },
  { id: 101, pseudo: "alan",    avatar: null, statut: "Busy",      isOnline: false },
  { id: 102, pseudo: "hannah",  avatar: null, statut: "Available", isOnline: true },
  { id: 103, pseudo: "georges", avatar: null, statut: "Away",      isOnline: false },
]

export function searchUsers(query) {
  const q = query.toLowerCase()
  return mockUsers
    .filter(u => u.pseudo.toLowerCase().includes(q))
    .slice(0, 20)
}