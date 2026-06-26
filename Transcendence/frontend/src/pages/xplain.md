## Projet

<DndContext onDragEnd={handleDragEnd}>...</DndContext>

But: Le drag&drop
- DndContext — c'est le chef d'orchestre. Il englobe tout le Kanban et coordonne ce qui se passe quand on glisse quelque chose.
- useDroppable — c'est une colonne qui dit "je peux recevoir des cartes"
- useDraggable — c'est une carte qui dit "je peux être glissée"


Quand on lâches une carte sur une colonne, le DndContext déclenche un événement onDragEnd qui te dit : "la carte X a été déposée sur la colonne Y". On décides ensuite quoi faire avec cette info — dans notre cas, mettre à jour le state tasks.

*La fonction*

const handleDragStart = (event) => {
  const task = tasks.find(t => t.id === event.active.id)
  setActiveTask(task)
}
--> au début du glissement, on mémorise la tâche active dans activeTask. Le DragOverlay l'utilise pour savoir quoi afficher.

const handleDragEnd = (event) => {
  const { active, over } = event
   setActiveTask(null) // Dans tout les cas on remet a null

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


*fct const sensors()*
Qu'est-ce qu'un sensor ? : Un capteur c'est ce qui détecte l'intention de drag. Les sensors permettent de configurer quand un drag doit vraiment démarrer, et non directement au clic.

useSensor (singulier) → configure un capteur précis
useSensors (pluriel) → regroupe plusieurs capteurs en un seul ensemble qu'on passera au DndContext
Ici on configure deux capteurs (souris + tactile) et on les combine. Logique : un seul appel pour tout regrouper.

MouseSensor gere le drag a la souris (le drag ne demarre que si la souris a bouge de 8px)

TouchSensor gere le drag au tactile (tablette, tel) mais comment distinguer le drag d'un scroll au doigt ?
- delay : il faut maintenir au doigt pour que le drag s'active
- tolerance : Pendant ce maintient le doigt peux bouger jusqua 5px. Au dela -> scroll.

*fct handleCl*


<KanbanColumn></Kanbancolumn> 

- key={col.id} → l'identifiant unique (toujours sur l'élément du .map())
- col={col} → la colonne (pour son label, son id)
- colTasks={colTasks} → les tâches filtrées (pour le compteur)

Au lieu de glisser directement la carte originale <DragOverlay> affiche une copie flottante au-dessus de tout pendant le glissement. Il est géré par @dnd-kit directement, donc il ne crée pas de scroll. 


## LegalPages

LegalPage est un composant réutilisable qui sert pour deux pages (Privacy Policy ET Terms of Service). Au lieu d'écrire deux fichiers quasi identiques, tu fais un composant qui reçoit son content en prop. Privacy lui passe son contenu, Terms le sien. Le composant ne fait que mettre en forme.

La double boucle : 
content.sections.map(...)      → pour chaque section
  section.blocks.map(...)  → pour chaque bloc de la section

Le rendu :
if (block.type === 'p')  → rend un paragraphe
if (block.type === 'ul') → rend une liste à puces
return null              → si type inconnu, on ignore, on affaiche rien au lieu de planter

Tailwind :
<main className="max-w-3xl mx-auto px-6 py-12">  : Evite que le texte s'affiche sur tout l'ecran. Largeur confortable et centree. 
leading-relaxed : Augmente l'interligne du text
list-disc pl-5 sur le <ul> → list-disc remet les puces (•) que Tailwind enlève par défaut, pl-5 décale la liste vers la droite pour que les puces aient de la place.