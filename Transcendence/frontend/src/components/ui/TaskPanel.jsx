import { IconX, IconCalendar, IconUser } from "@tabler/icons-react"
import { PRIORITIES } from "../../data/priorities"
import Button from "./Button"

const COLUMN_OPTIONS = [
  { value: 'ToDo',        label: 'À faire'    },
  { value: 'Doing',  label: 'En cours'   },
  { value: 'Done',        label: 'Terminée'   },
  { value: 'Blocked',     label: 'En attente' },
]

function TaskPanel({task, userRole, currentUser, members, onClose, onUpdate, onDelete }) {
  if (!task) return null

  // On retourne la priorite de la tache. Si task.priority === 'urgent' ca retourne tout l'objet urgent
  const priority = PRIORITIES.find(p => p.value === task.priority)

  // Peut-on supp la tache ?
  const canDelete = userRole === 'Manager' || task.createdBy === currentUser

  // Pour que le manager puisse changer l'assignation d'une tache
  const canAssign = userRole === 'Manager'

  return (
    <>
      {/*Le fond semi-transparent*/}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      {/*Le panneau*/}
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/*Header*/}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 text-base">{task.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IconX size={18} className="text-gray-400"/>
          </button>
        </div>
        {/*Contenu Scrollable*/}
        <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
          {/*Champs Deadline*/}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Deadline</label>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <IconCalendar size={16} className="text-gray-400" />
                {task.deadline ? new Date(task.deadline).toLocaleDateString('fr-FR') : 'Aucune Deadline'}
              </div>
          </div>
          {/*Champs Assignation*/}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Assigne</label>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-900/20 flex items-center justify-center text-xs font-medium text-primary-900">
                {task.assignee?.[0]} 
              </div>
              {canAssign ? (
                <select
                // Champs select: affiche une selection de choix deroulante
                  value={task.assignee || ''} // si task.assignee = null : ''
                  onChange={(e) => onUpdate({...task, assignee: e.target.value || null})} // met a jour l'assignation instantanement. null si assignee = ''
                  className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1"
                >
                  <option value="">Non assigne</option> 
                  {members.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                // Cas 2: Le user ne voit pas les options de delection 
                <span className="text-sm text-gray-700">{task.assignee || 'Non assigne'}</span>
              )}
            </div>
          </div>
          {/*Champs modifiable ~ Priorite*/}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Priorite</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  onClick={() => onUpdate({...task, priority: p.value})}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-opacity ${p.bg} ${p.text} ${
                  task.priority === p.value ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {/*Menu deroulant ~ NameColonne*/}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Colonne</label>
            <select
              value={task.status}
              onChange={(e) => onUpdate({ ...task, column: e.target.value })}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none"
            >
              {COLUMN_OPTIONS.map(col => (
                <option key={col.value} value={col.value}>{col.label}</option>
              ))}
            </select>
          </div>
          {/*Champs de description*/}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 uppercase tracking-wide">Description</label>
            <textarea
              defaultValue={task.description ?? ''}
              onBlur={(e) => onUpdate({...task, description: e.target.value })}
              placeholder="Ajouter une description..."
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none resize-none h-24 placeholder-gray-300"
            />
          </div>
          {/*Champs 'supprimer la tache (Si possible)'*/}
          { canDelete && (
            <Button variant="danger" onClick={() => onDelete(task.id)}>
              Supprimer la tache
            </Button>
          )}

          {/*Champs commentaire QUE colonne en attente*/}
          {task.status === 'Blocked' && (
            <div className="flex flex-col gap-3">
              <label className="text-xs text-gray-400 uppercase tracking-wide">Commentaires</label>
              {task.comments.length === 0 && (
                <p className="text-xs text-gray-300">Aucun commentaire pour l'instant.</p>
              )}
              
              {task.comments.map(comment => (
                <div key={comment.id} className="flex flex-col gap-1 bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-900/20 flex items-center justify-center text-xs text-primary-900">
                      {comment.author[0]}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{comment.author}</span>
                    <span className="text-xs text-gray-300 ml-auto">{comment.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 pl-7">{comment.text}</p>
                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </>
  )

}

export default TaskPanel