import { IconMessageCircle } from "@tabler/icons-react";
import { useDraggable } from "@dnd-kit/core";
import { useRef } from "react";
import { useTranslation } from 'react-i18next'
import { getPriorities } from "../../data/priorities";

const LOCALE_MAP = { fr: 'fr-FR', en: 'en-US', cn: 'zh-CN' }

function TaskCard({ task, onClick }) {
  const { t, i18n } = useTranslation()
  const locale = LOCALE_MAP[i18n.language] || 'fr-FR'
  const PRIORITIES = getPriorities(t)
  const priority = PRIORITIES.find(p => p.value === task.priority)

  const isDeadlinePast = task.deadline ? new Date(task.deadline) < new Date() : false

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })

  const assignee = task.assignedTo
  
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
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${priority.bg} ${priority.text}`}>
        {priority.label}
      </span>

      <p className="text-sm text-gray-700 leading-snug">{task.title}</p>

      <div className="flex items-center justify-between mt-auto">
        {task.deadline ? (
          <span className={`text-xs ${isDeadlinePast ? 'text-red-400' : 'text-gray-400'}`}>
            📅 {new Date(task.deadline).toLocaleDateString(locale)}
          </span>
        ) : (
          <span/>
        )}

        <div className="flex items-center gap-2">
          {task.status === 'Blocked' && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <IconMessageCircle size={14} />
              {(task.comments ?? []).length}
            </span>
          )}

          {assignee && (
            <div
              title={assignee.pseudo}
              className="w-6 h-6 rounded-full bg-primary-900/20 flex items-center justify-center text-xs font-medium text-primary-900"
            >
              {assignee.pseudo[0]}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard