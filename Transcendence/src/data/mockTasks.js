export const mockTasks = [
  {
    id: 1,
    title: "Créer la page login",
    priority: "urgent",
    column: "done",
    assignee: "Alice",
    deadline: "2025-06-10",
    comments: []
  },
  {
    id: 2,
    title: "Intégrer l'API projets",
    priority: "normal",
    column: "inprogress",
    assignee: "Bob",
    deadline: "2025-06-20",
    comments: []
  },
  {
    id: 3,
    title: "Configurer la BDD",
    priority: "urgent",
    column: "todo",
    assignee: "Charlie",
    deadline: "2025-06-15",
    comments: []
  },
  {
    id: 4,
    title: "Mettre en place les WebSockets",
    priority: "normal",
    column: "todo",
    assignee: "Alice",
    deadline: null,
    comments: []
  },
  {
    id: 5,
    title: "Design du tableau Kanban",
    priority: "low",
    column: "waiting",
    assignee: "Bob",
    deadline: "2025-06-25",
    comments: [
      { id: 1, author: "Alice", text: "En attente de la maquette Figma", date: "2025-05-01" }
    ]
  },
]