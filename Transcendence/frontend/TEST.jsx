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