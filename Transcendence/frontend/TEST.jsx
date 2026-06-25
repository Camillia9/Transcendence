<Modal
  isOpen={!!newTaskColumn}
  onClose={handleCloseNewTask}
  title="Nouvelle tâche"
>
  {/* Titre */}
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-sm text-gray-500">Titre *</label>
    <Input
      type="text"
      placeholder="Ex: Créer la page login"
      value={newTaskTitle}
      onChange={(e) => {
        setNewTaskTitle(e.target.value)
        setNewTaskError('')
      }}
      light
    />
    {newTaskError && (
      <p className="text-red-400 text-xs mt-1">{newTaskError}</p>
    )}
  </div>

  {/* Priorité */}
  <div className="flex flex-col gap-2 mb-6">
    <label className="text-sm text-gray-500">Priorité</label>
    <label className="text-sm text-gray-500">Priorité</label>
<div className="flex gap-2">
  {PRIORITIES.map(p => (
    <button
      key={p.value}
      onClick={() => setNewTaskPriority(p.value)}
      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-opacity ${p.bg} ${p.text} ${
        newTaskPriority === p.value ? 'opacity-100' : 'opacity-40'
      }`}
    >
      {p.label}
    </button>
  ))}
</div>
  </div>

  {/* Boutons */}
  <div className="flex gap-2">
    <Button onClick={handleCloseNewTask}>
      Annuler
    </Button>
    <Button variant="dark" onClick={handleCreateTask}>
      Créer la tâche
    </Button>
  </div>

</Modal>