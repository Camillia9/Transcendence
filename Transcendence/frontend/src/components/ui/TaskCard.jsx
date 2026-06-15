import { IconMessageCircle } from "@tabler/icons-react";
import { useDraggable } from "@dnd-kit/core";

const PRIORITY = {
	urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-600' },
	normal: { label: 'Normal', bg: 'bg-orange-100', text: 'text-orange-500' },
	low:    { label: 'Faible', bg: 'bg-gray-100', text: 'text-gray-500' },
}

function TaskCard({ task, onClick }) {
  const priority = PRIORITY[task.priority]

  const isDeadlinePast = task.deadline ? new Date(task.deadline) < new Date() : false
  //false: pas de retard, true retard

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
     zIndex: 999,
  } : {}

  return (
    <div
      ref={setNodeRef}
      style={style}
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
              className="w-6 h-6 rounded-full bg-[#1a3a5c]/20 flex items-center justify-center text-xs font-medium text-[#1a3a5c]"
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