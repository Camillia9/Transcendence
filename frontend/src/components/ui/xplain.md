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
  {task.status === 'waiting' && (
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
   isOver ? 'bg-primary-50' : 'bg-gray-100'

-> Lorsqu'on survole une colonne on changle la couleur

*en-tete*

flex items-center justify-between: enfant cote a cote horizontalement de gauche a droite avec le max d'espace entre eux

flex items-center gap-2 : nom et compteur cote a cote centre avec petit espace entre eux 2


*zone de depot*
ref={setNodeRef} : C'est ici que dnd-kit "accroche" la zone de dépôt. Le min-h-25 est important : il garantit que même une colonne vide a une hauteur cliquable où déposer une carte. Sans ça, impossible de déposer dans une colonne vide !

children c'est le contenu que le parent met entre les balises <KanbanColumn>...</KanbanColumn>


## TaskPanel

PRIORITY_OPTIONS[] : Tableau d'objets
  - value → la valeur technique stockée dans la donnée ('urgent', 'low'...) — comme l'id de COLUMNS
  - label → le texte affiché à l'humain ('Urgent', 'Faible')
  - bg / text → les couleurs du badge selon la priorité 

COLUMN_OPTIONS[] : Tableau d'objets
value et label

⚠️ Les value : elles doivent correspondre exactement à ce qu'il y a dans tes données ('todo', 'inprogress'...), pas du texte français. Sinon le lien avec les tâches ne se fera pas.

PROPS TaskPanel({task, onClose, onUpdate})
- task → la tâche à afficher (ou null si aucune sélectionnée pour eviter les casses)
- onClose → fonction pour fermer le panneau
- onUpdate → fonction appelée quand on modifie un champ

*le return()*

<>...</> : Le Fragment regroupe plusieurs element parents cote a cote (ici le fond semi transparent et le panneau) au lieu de l'entourer de <div>

Tailwind fond sm-transparent :
- fixed inset-0 → couvre tout l'écran (collé aux 4 bords)
- bg-black/20 → noir à 20% d'opacité → assombrit légèrement le fond
- z-40 → passe au-dessus du contenu de la page
- onClick={onClose} → cliquer sur le fond ferme le panneau (comme une modale)

Tailwind Panneau :

- fixed top-0 right-0 h-full → collé en haut à droite, toute la hauteur de l'écran
- w-96 → largeur fixe (384px)
- bg-white shadow-xl → fond blanc avec grosse ombre (effet "au-dessus")
- z-50 → encore plus haut que le fond (z-40), donc le panneau est par-dessus le voile sombre
- flex flex-col → empile le header et le contenu verticalement

Contenu Scrollable :

- flx flx-col gap-5 → empile les champs verticalement avec de l'espace entre eux
- p-6 → de la marge intérieure pour que ça respire
- overflow-y-auto flex-1 → permet de scroller si ça déborde

- flex flex-col gap-2 → label au-dessus, contenu en dessous
- uppercase tracking-wide → texte en MAJUSCULES avec un peu d'espacement entre les lettres (style "étiquette")

*Champs assignation*
- {task.assignee?.[0]} - optional chaining. Si assignee existe, prend sa première lettre [0]. Si assignee est null, renvoie undefined au lieu de planter.
- {task.assignee || 'Non assigné'} - nullish coalescing. 
"affiche task.assignee, mais s'il est null/undefined/"", affiche 'Non assigné' à la place".

*MEnu deroulant Colonne*
- <select> : Lise deroulante
    - value={task.status} → le menu affiche la colonne        actuelle de la tâche
    - onChange → quand on choisit une autre option, on appelle onUpdate avec la tâche modifiée, on écrase la colonne
    - e.target.value → la valeur de l'option choisie dans le menu.

- <option> : Choix disponible (ici "a faire" etc)
    - value={col.value} → la valeur technique ('todo', 'done'...) — c'est ce qui sera stocké
    - {col.label} → le texte affiché à l'humain ('À faire', 'Terminée'...)

*Champs de description*
- <Textarea> : zone multi-ligne
--> Si on utilisait value + onChange (comme les autres champs), chaque lettre tapée déclencherait onUpdate → mise à jour de l'état tasks dans le parent → re-rendu de tout le Kanban à chaque frappe.

Solution : defaultValue + onBlur
  - defaultValue → donne la valeur initiale du textarea puis React ne surveille pas chaque frappe.
  - onBlur → se déclenche quand le champ perd le focus (l'utilisateur clique ailleurs, sort du champ). C'est seulement à ce moment-là qu'on appelle onUpdate, une seule fois, avec le texte final.

- defaultValue={task.description ?? ''} : si la tâche n'a pas de description (undefined), on met une chaîne vide pour éviter un textarea qui afficherait "undefined".
- resize-none h-24 : empeche l'utilisateur d'agrandir le textarea a la main. 


*Champs commentaire*
Si colonne waiting, checker si ya commentaires. Affichier le. Snon "aucun comentaire pour l'instant"

On parcourt tout les commentaire du tableau task.comment.

- key={comment.id} → l'identifiant unique du .map() (toujours nécessaire)
- flex flex-col gap-1 → empile la ligne d'en-tête et le texte verticalement
- bg-gray-50 rounded-xl p-3 → fond gris clair arrondi avec du padding → l'aspect "bulle de commentaire"

<div className="flex items-center gap-2"> : 3 elements alligne horizontalement 
  - Avatar : {comment.author[0]}
  - Nom : {comment.author}
  - Date : {comment.date}

{comment.text} → le contenu du commentaire.


## Footer

balise en bas de la page avec 2 zones : 
À gauche : le copyright
À droite : les liens légaux (Privacy + Terms)

© {new Date().getFullYear()} TaskBoard 
--> Copyright dynamique. Recupere l'annee actuelle tout les ans. Donc maj auto de la date

Tailwind:
flex flex-col sm:flex-row → le responsive :
Par défaut (mobile) → flex--col = copyright et liens empilés verticalement
À partir de sm: (écran ≥ 640px) → flex--row = côte à côte horizontalement

<Link to="/privacy" className="...">
On utilise <Link> de React Router, pas <a href>. La différence :
<a href> → recharge toute la page (le navigateur refait une requête complète)
<Link to> → navigation instantanée côté client, sans rechargement (React Router change juste le composant affiché)