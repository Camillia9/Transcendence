const handleDragEnd = (event) => {
  const { active, over } = event

  // Si on lâche en dehors d'une colonne → on ne fait rien
  if (!over) return

  // Si on lâche sur la même colonne → on ne fait rien
  const taskId = active.id
  const newColumn = over.id
  const task = tasks.find(t => t.id === taskId)
  if (task.column === newColumn) return

  // Met à jour la colonne de la tâche
  setTasks(tasks.map(t =>
    t.id === taskId
      ? { ...t, column: newColumn }
      : t
  ))
}