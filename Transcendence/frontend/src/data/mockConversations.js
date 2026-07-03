import { CURRENT_USER } from './currentUser'

export const mockConversations = [
  {
    id: 1,
    name: "Alice",          // conversation privée → le nom de l'autre personne
    type: "private",
    messages: [
      { id: 1, author: "Alice", text: "Salut, tu as vu la maquette ?", time: "09:12" },
      { id: 2, author: CURRENT_USER, text: "Oui, je regarde ça", time: "09:15" },
    ],
  },
  {
    id: 2,
    name: "Équipe Frontend",   // conversation de groupe → un nom de groupe
    type: "group",
    messages: [
      { id: 1, author: "Bob", text: "Le Kanban est prêt côté front", time: "10:30" },
      { id: 2, author: "Charlie", text: "Nickel, je teste", time: "10:31" },
    ],
  },
  {
    id: 3,
    name: "Bob",
    type: "private",
    messages: [
      { id: 1, author: "Bob", text: "On se cale un point cet aprem ?", time: "11:00" },
    ],
  },
]