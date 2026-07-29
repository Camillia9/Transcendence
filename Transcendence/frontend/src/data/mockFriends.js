// Forme identique à GET /friends : une ligne Friend, le user sous .friend
export const mockFriends = [
  { id: 1, userId: 42, friendId: 7,  createdAt: "2026-07-20T10:00:00.000Z",
    friend: { id: 7,  pseudo: "alice",   avatar: null, statut: "Available", isOnline: true } },
  { id: 2, userId: 42, friendId: 12, createdAt: "2026-07-21T10:00:00.000Z",
    friend: { id: 12, pseudo: "bob",     avatar: null, statut: "Away",    isOnline: false } },
  { id: 3, userId: 42, friendId: 19, createdAt: "2026-07-22T10:00:00.000Z",
    friend: { id: 19, pseudo: "charlie", avatar: null, statut: "Available", isOnline: true } },
  { id: 4, userId: 42, friendId: 23, createdAt: "2026-07-23T10:00:00.000Z",
    friend: { id: 23, pseudo: "diana",   avatar: null, statut: "Busy",     isOnline: false } },
  { id: 5, userId: 42, friendId: 31, createdAt: "2026-07-24T10:00:00.000Z",
    friend: { id: 31, pseudo: "eve",     avatar: null, statut: "Available", isOnline: true } },
  { id: 6, userId: 42, friendId: 38, createdAt: "2026-07-25T10:00:00.000Z",
    friend: { id: 38, pseudo: "frank",   avatar: null, statut: "Absent",      isOnline: false } },
]