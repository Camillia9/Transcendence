// Ce fichier simule exactement ce que l'API de Dev 2 renverra plus tard.
// Quand le back sera prêt, tu remplaceras juste l'import par un vrai appel fetch.

export const mockProjects = [
  {
    id: 1,
    name: "Refonte site web",
    deadline: "2025-06-15",
    tasks: { done: 8, total: 12 },
    members: ["Alice", "Bob", "Charlie"],
    role: "Manager",
  },
  {
    id: 2,
    name: "App mobile",
    deadline: "2025-07-01",
    tasks: { done: 2, total: 10 },
    members: ["Alice", "David"],
    role: "Manager",
  },
  {
    id: 3,
    name: "Dashboard analytics",
    deadline: "2025-05-30",
    tasks: { done: 5, total: 5 },
    members: ["Bob"],
    role: "User",
  },
  {
    id: 4,
    name: "Système de notifications",
    deadline: "2025-08-20",
    tasks: { done: 0, total: 8 },
    members: ["Alice", "Charlie", "Eve", "Frank"],
    role: "User",
  },
]