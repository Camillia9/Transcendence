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
    console.log('carte deplacee:', active.id, '-> colonne:', over?.id)
}

Quand on lâches une carte, dnd-kit appelle cette fonction avec un objet event qui contient plein d'infos. Les deux qui nous intéressent :
active → l'élément qu'on déplace (la carte attrapée). active.id = l'identifiant de cette carte.
over → l'élément survolé au moment du lâcher (la colonne de destination). over.id = l'identifiant de cette colonne.
On les extrait par destructuring : const { active, over } = event.

Pourquoi over?.id et pas over.id ?
Parce que si on lâches la carte en dehors de toute colonne (dans le vide), over vaut null. Faire null.id → crash. L'optional chaining ?. renvoie undefined au lieu de planter — comme pour user?.username. 

<KanbanColumn></Kanbancolumn> 

- key={col.id} → l'identifiant unique (toujours sur l'élément du .map())
- col={col} → la colonne (pour son label, son id)
- colTasks={colTasks} → les tâches filtrées (pour le compteur)