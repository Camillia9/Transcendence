import { IconMessageCircle } from "@tabler/icons-react";
import { useDraggable } from "@dnd-kit/core";
import { useRef } from "react";
import { PRIORITIES } from "../../data/priorities";

function TaskCard({ task, onClick }) {
  const priority = PRIORITIES.find(p => p.value === task.priority)

  const isDeadlinePast = task.deadline ? new Date(task.deadline) < new Date() : false
  //false: pas de retard, true retard

  // Carte qui bouge
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-xl p-3 flex flex-col gap-3 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'opacity-50 shadow-xl' : 'hover:shadow-md'
      }`}
    >
      {/*Badge de priorite */}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${priority.bg} ${priority.text}`}>
        {priority.label}
      </span>

      {/*Titre */}
      <p className="text-sm text-gray-700 leading-snug">{task.title}</p>

      {/*Pied de la carte (Gauche)*/}
      <div className="flex items-center justify-between mt-auto">
        {task.deadline ? (
          <span className={`text-xs ${isDeadlinePast ? 'text-red-400' : 'text-gray-400'}`}>
            📅 {new Date(task.deadline).toLocaleDateString('fr-FR')}
          </span>
        ) : (
          <span/>
        )}

        {/*Droite*/}
        <div className="flex items-center gap-2">
          {/*Icone commentaire */}
          {task.column === 'waiting' && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <IconMessageCircle size={14} />
              {task.comments.length}
            </span>
          )}

          {/*Avatar */}
          {task.assignee && (
            <div
              title={task.assignee}
              className="w-6 h-6 rounded-full bg-primary-900/20 flex items-center justify-center text-xs font-medium text-primary-900"
            >
              {task.assignee[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard