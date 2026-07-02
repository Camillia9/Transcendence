const handleSubmitProject = () => {
  const errors = validateNewProject()
  if (Object.keys(errors).length > 0) {
    setNewErrors(errors)
    return
  }

  if (projectToEdit) {
    // MODE ÉDITION : on remplace le projet existant
    const updated = {
      ...projectToEdit,                // garde id, role, tasks... inchangés
      name: newName.trim(),
      deadline: newDeadline || null,
      members: newMembers ? newMembers.split(',').map(m => m.trim()).filter(m => m !== '') : [],
    }
    setProjects(projects.map(p => p.id === projectToEdit.id ? updated : p))
  } else {
    // MODE CRÉATION : ton code existant, inchangé
    const newProject = {
      id: Date.now(),
      name: newName.trim(),
      deadline: newDeadline || null,
      tasks: { done: 0, total: 0 },
      members: newMembers ? newMembers.split(',').map(m => m.trim()).filter(m => m !== '') : [],
      role: 'Manager'
    }
    setProjects([newProject, ...projects])
  }

  handleCloseNewProject()
}