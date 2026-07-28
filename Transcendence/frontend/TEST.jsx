const handleSubmitProject = async () => {
  const errors = validateNewProject()
  if (Object.keys(errors).length > 0) {
    setNewErrors(errors)
    return
  }

  if (projectToEdit) {
    // MODE EDITION
    try {
      const updated = await updateProject(projectToEdit.id, {
        title: newName.trim(),
        deadline: newDeadline || null,
      })
      // updated est "à plat" : on fusionne pour garder membres et tâches
      setProjects(projects.map(p =>
        p.id === projectToEdit.id ? { ...p, ...updated } : p
      ))
    } catch (error) {
      setNewErrors({ global: "Impossible de modifier le projet" })
      return
    }
  } else {
    // ... ta création locale, on n'y touche pas (étape 4)
  }

  handleCloseNewProject()
}

const handleUpdateTask = async (updatedTask) => {
  // 1. Mise à jour immédiate de l'écran (ressenti instantané)
  setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
  setSelectedTask(updatedTask)

  // 2. On envoie au back UNIQUEMENT les champs que la route accepte
  try {
    await updateTask(projectId, updatedTask.id, {
      title: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      deadline: updatedTask.deadline,
    })
  } catch (error) {
    console.error('Impossible de modifier la tache', error)
  }
}

const handleDeleteTask = async (taskId) => {
  try {
    await deleteTask(projectId, taskId)
    setTasks(tasks.filter(t => t.id !== taskId)) // on retire de l'écran
    setSelectedTask(null)                        // et on ferme le panneau
  } catch (error) {
    console.error('Impossible de supprimer la tache', error)
  }
}