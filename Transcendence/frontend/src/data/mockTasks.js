export const mockTasks = [
  {
    id: 1,
    projectId: 4, // "Cette tache appartient au projet 4"
    title: "Créer la page login",
    priority: "urgent",
    column: "done",
    createdBy: "Alice", // Qui a cree la tache
    assignee: "Alice", // A qui a t-elle etait confie
    deadline: "2025-06-10",
    comments: []
  },
  {
    id: 2,
    projectId: 3,
    title: "Intégrer l'API projets",
    priority: "normal",
    column: "inprogress",
    createdBy: "Bob",
    assignee: "Bob",
    deadline: "2025-06-20",
    comments: []
  },
  {
    id: 3,
    projectId: 2,
    title: "Configurer la BDD",
    priority: "urgent",
    column: "todo",
    createdBy: "Alice",
    assignee: "Charlie",
    deadline: "2025-06-15",
    comments: []
  },
  {
    id: 4,
    projectId: 1, 
    title: "Mettre en place les WebSockets",
    priority: "normal",
    column: "todo",
    createdBy: "Charlie",
    assignee: "Alice",
    deadline: null,
    comments: []
  },
  {
    id: 5,
    projectId: 2,
    title: "Design du tableau Kanban",
    priority: "low",
    column: "waiting",
    createdBy: "David",
    assignee: "",
    deadline: "2027-06-25",
    comments: [
      { id: 1, author: "Alice", text: "En attente de la maquette Figma", date: "2025-05-01" }
    ]
  },
]