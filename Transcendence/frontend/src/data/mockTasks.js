import { mockUsers } from "./mockUsers";

// Rappel des ids : 1 = Alice, 2 = Bob, 3 = Charlie, 4 = David
export const mockTasks = [
  {
    id: 1,
    projectId: 4,
    title: "Créer la page login",
    priority: "Urgent",
    status: "Done",
    position: 0,
    createdBy: 1,
    assignedToId: 1,
    deadline: "2025-06-10",
    comments: []
  },
  {
    id: 2,
    projectId: 3,
    title: "Intégrer l'API projets",
    priority: "Normal",
    status: "Doing",
    position: 0,
    createdBy: 2,
    assignedToId: 4,
    deadline: "2025-06-20",
    comments: []
  },
  {
    id: 3,
    projectId: 2,
    title: "Configurer la base de données",
    priority: "Urgent",
    status: "ToDo",
    position: 0,
    createdBy: 1,
    assignedToId: 3,
    deadline: "2025-06-15",
    comments: []
  },
  {
    id: 4,
    projectId: 1,
    title: "Mettre en place les WebSockets",
    priority: "Normal",
    status: "ToDo",
    position: 0,
    createdBy: 3,
    assignedToId: 2,
    deadline: null,
    comments: []
  },
  {
    id: 5,
    projectId: 1,
    title: "Design du tableau Kanban",
    priority: "Low",
    status: "Blocked",
    position: 0,
    createdBy: 4,
    assignedToId: null,
    deadline: "2027-06-25",
    comments: [
      {
        id: 1,
        author: "Alice",
        text: "En attente de la maquette Figma",
        date: "2025-05-01"
      }
    ]
  },
  {
    id: 6,
    projectId: 2,
    title: "Créer la page profil",
    priority: "Normal",
    status: "Doing",
    position: 0,
    createdBy: 2,
    assignedToId: 1,
    deadline: "2025-07-01",
    comments: []
  },
  {
    id: 7,
    projectId: 4,
    title: "Ajouter les notifications temps réel",
    priority: "Urgent",
    status: "ToDo",
    position: 0,
    createdBy: 3,
    assignedToId: 4,
    deadline: "2025-06-30",
    comments: []
  },
  {
    id: 8,
    projectId: 3,
    title: "Optimiser les requêtes SQL",
    priority: "Normal",
    status: "Blocked",
    position: 0,
    createdBy: 1,
    assignedToId: 3,
    deadline: "2025-07-08",
    comments: []
  },
  {
    id: 9,
    projectId: 1,
    title: "Corriger le bug du chat",
    priority: "Urgent",
    status: "Doing",
    position: 0,
    createdBy: 4,
    assignedToId: 2,
    deadline: "2025-06-18",
    comments: []
  },
  {
    id: 10,
    projectId: 2,
    title: "Refaire le responsive mobile",
    priority: "Low",
    status: "ToDo",
    position: 1,
    createdBy: 1,
    assignedToId: 4,
    deadline: "2025-07-15",
    comments: []
  },
  {
    id: 11,
    projectId: 4,
    title: "Créer les composants UI",
    priority: "Normal",
    status: "Done",
    position: 1,
    createdBy: 2,
    assignedToId: 3,
    deadline: "2025-06-12",
    comments: []
  },
  {
    id: 12,
    projectId: 3,
    title: "Ajouter le système d'amis",
    priority: "Urgent",
    status: "ToDo",
    position: 0,
    createdBy: 3,
    assignedToId: 1,
    deadline: "2025-07-02",
    comments: []
  },
  {
    id: 13,
    projectId: 1,
    title: "Mettre en place le dark mode",
    priority: "Low",
    status: "Blocked",
    position: 1,
    createdBy: 4,
    assignedToId: null,
    deadline: "2025-08-01",
    comments: []
  },
  {
    id: 14,
    projectId: 2,
    title: "Sécuriser les routes backend",
    priority: "Urgent",
    status: "Doing",
    position: 1,
    createdBy: 1,
    assignedToId: 2,
    deadline: "2025-06-28",
    comments: []
  },
  {
    id: 15,
    projectId: 4,
    title: "Créer la page paramètres",
    priority: "Normal",
    status: "ToDo",
    position: 1,
    createdBy: 3,
    assignedToId: 4,
    deadline: "2025-07-11",
    comments: []
  },
  {
    id: 16,
    projectId: 3,
    title: "Déployer le serveur de test",
    priority: "Urgent",
    status: "Done",
    position: 0,
    createdBy: 2,
    assignedToId: 3,
    deadline: "2025-06-05",
    comments: []
  },
  {
    id: 17,
    projectId: 1,
    title: "Ajouter les avatars utilisateurs",
    priority: "Low",
    status: "ToDo",
    position: 1,
    createdBy: 1,
    assignedToId: 4,
    deadline: "2025-07-20",
    comments: []
  },
  {
    id: 18,
    projectId: 2,
    title: "Créer les tests API",
    priority: "Normal",
    status: "Doing",
    position: 2,
    createdBy: 4,
    assignedToId: 2,
    deadline: "2025-06-26",
    comments: []
  },
  {
    id: 19,
    projectId: 4,
    title: "Ajouter la recherche globale",
    priority: "Normal",
    status: "Blocked",
    position: 0,
    createdBy: 3,
    assignedToId: null,
    deadline: "2025-07-22",
    comments: []
  },
  {
    id: 20,
    projectId: 3,
    title: "Améliorer les performances frontend",
    priority: "Urgent",
    status: "ToDo",
    position: 1,
    createdBy: 2,
    assignedToId: 1,
    deadline: "2025-07-05",
    comments: []
  }
];