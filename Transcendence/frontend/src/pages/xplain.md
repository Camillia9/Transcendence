## Projet

<DndContext onDragEnd={handleDragEnd}>...</DndContext>

But: Le drag&drop
- DndContext — c'est le chef d'orchestre. Il englobe tout le Kanban et coordonne ce qui se passe quand on glisse quelque chose.
- useDroppable — c'est une colonne qui dit "je peux recevoir des cartes"
- useDraggable — c'est une carte qui dit "je peux être glissée"

Quand on lâches une carte sur une colonne, le DndContext déclenche un événement onDragEnd qui te dit : "la carte X a été déposée sur la colonne Y". On décides ensuite quoi faire avec cette info — dans notre cas, mettre à jour le state tasks.

*La fonction*
const handleDragEnd = (event) => {
  const { active, over } = event

  // Si on lâche en dehors d'une colonne → on ne fait rien
  if (!over) return

  // Si on lâche sur la même colonne → on ne fait rien
  const task = tasks.find(t => t.id === taskId)
  if (task.column === newColumn) return

  // Met à jour la colonne de la tâche
  setTasks(tasks.map(t =>
    t.id === taskId
      ? { ...t, column: newColumn }
      : t
  ))
}

Quand on lâches une carte, dnd-kit appelle cette fonction avec un objet event qui contient plein d'infos. Les deux qui nous intéressent :
active → l'élément qu'on déplace (la carte attrapée). active.id = l'identifiant de cette carte.
over → l'élément survolé au moment du lâcher (la colonne de destination). over.id = l'identifiant de cette colonne.
On les extrait par destructuring : const { active, over } = event.

- active.id — l'id de la carte qu'on vient de lâcher.
- over.id — l'id de la colonne sur laquelle on a lâché.
- tasks.find(t => t.id === taskId) — on retrouve la tâche dans le state pour vérifier sa colonne actuelle.
- tasks.map(t => t.id === taskId ? { ...t, column: newColumn } : t) — on parcourt toutes les tâches. Si c'est la tâche déplacée, on crée une copie avec la nouvelle colonne (...t garde tout le reste intact). Sinon on retourne la tâche inchangée.

<KanbanColumn></Kanbancolumn> 

- key={col.id} → l'identifiant unique (toujours sur l'élément du .map())
- col={col} → la colonne (pour son label, son id)
- colTasks={colTasks} → les tâches filtrées (pour le compteur)