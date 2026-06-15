## TaskCard

const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
  id: task.id,
})
--> useDraggable rend la carte bougeable
- attributes + listeners → les propriétés/écouteurs qui rendent l'élément attrapable (gestion de la souris, accessibilité clavier...)
- setNodeRef → comme pour droppable, la référence à brancher sur la carte (ref={setNodeRef})
- isDragging → booléen, true pendant qu'on déplace cette carte


Le return() :
Le spread : {...atributes} {...listeners}
- {...listners} :  contient les écouteurs d'événements souris : "quand on appuie ici", "quand on bouge", "quand on relâche". Ce sont eux qui détectent physiquement le glisser.
- {...atributes} : contient des attributs d'accessibilité (pour le clavier, les lecteurs d'écran).
--> Le ... (spread) "déverse" toutes ces propriétés sur ta div d'un coup. Au lieu d'écrire :
<div onMouseDown={listeners.onMouseDown} role={attributes.role} ...>
On ecrit juste :
<div {...listeners} {...attributes}>  // tout d'un coup

{/*Pied de la carte*/}
    <div className="flex items-center justify-between mt-auto">
      {task.deadline ? (
        <span className={`text-xs ${isDeadlinePast ? 'text-red-400' : 'text-gray-400'}`}>
          📅 {new Date(task.deadline).toLocaleDateString('fr-FR')}
        </span>
      ) : (
        <span/>
      )}
    </div>

Tailwind :
// justify-between → deadline à gauche, le reste à droite.
// mt-auto → pousse ce pied tout en bas de la carte.

Explain: 
Si deadline existe → on l'affiche, en rouge si dépassée (isDeadlinePast), sinon en gris
Sinon → un <span /> vide, juste pour occuper la place à gauche et que justify-between pousse l'avatar à droite


{/*Icone commentaire*/}
  {task.column === 'waiting' && (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <IconMessageCircle size={14} />
      {task.comments.length}
    </span>
  )}
</div>

Explain:
Icone commentaire que pour les taches "en attente". 
On met une bulle avec le nb de commentaire dedans.

{/*Avatar*/}
{task.assignee && (
  <div
    title="{task.assignee"
    className="w-6 h-6 rounded-full bg-[#1a3a5c]/20 flex items-center justify-center text-xs font-medium text-[#1a3a5c]"
  >
    {task.assignee[0]}
  </div>
)}

Explain:
Si une personne est assignee a une tache:
- title={task.assignee} → l'attribut title affiche une infobulle au survol. Si tu survoles l'avatar "A", ça montre "Alice". Pratique quand on n'affiche que l'initiale.
- {task.assignee[0]} → on prend juste la première lettre du nom. "Alice"[0] donne "A". C'est un avatar minimaliste avec l'initiale.

## KanbanColumn

Son but : utiliser useDroppable (colonne recevant)

Ses arguments:
- col:
- colTask: 
- children:

```
const { setNodeRef, isOver } = useDroppable({id: col.id })

-> on passe un id (celui de la colonne) pour que dndContext l'enregiste comme zone de depot. (L'id doit correpondre a ce qu'on utilise dans mockTasks (todo, inprogress...))
-> setNodeRef c'est comme dire a dndKit "voici la zone exacte où on peut déposer". On le branchera avec ref={setNodeRef}
-> isOver un booleen. true = une carte survole cette colonne. Pratique pour retour visuel. 

```
 className={`rounded-2xl p-4 flex flex-col gap-3 min-w-70 w-70 transition-colors ${
   isOver ? 'bg-blue-50' : 'bg-gray-100'

-> Lorsqu'on survole une colonne on changle la couleur

*en-tete*

flex items-center justify-between: enfant cote a cote horizontalement de gauche a droite avec le max d'espace entre eux

flex items-center gap-2 : nom et compteur cote a cote centre avec petit espace entre eux 2


*zone de depot*
ref={setNodeRef} : C'est ici que dnd-kit "accroche" la zone de dépôt. Le min-h-25 est important : il garantit que même une colonne vide a une hauteur cliquable où déposer une carte. Sans ça, impossible de déposer dans une colonne vide !

children c'est le contenu que le parent met entre les balises <KanbanColumn>...</KanbanColumn>