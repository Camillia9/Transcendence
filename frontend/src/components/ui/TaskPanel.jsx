import { IconX, IconCalendar, IconUser, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { useTranslation } from 'react-i18next'
import { getPriorities } from "../../data/priorities"
import Button from "./Button"

const LOCALE_MAP = { fr: 'fr-FR', en: 'en-US', cn: 'zh-CN' }

function TaskPanel({task, userRole, currentUser, members, onClose, onUpdate, onAssign, onDelete, onAddComment, onDeleteComment }) {
  const { t, i18n } = useTranslation()
  const locale = LOCALE_MAP[i18n.language] || 'fr-FR'
  const [newComment, setNewComment] = useState('')

  if (!task) return null

  const PRIORITIES = getPriorities(t)
  const priority = PRIORITIES.find(p => p.value === task.priority)
  
  const assignee = task.assignedTo

  const canEdit = userRole === 'Manager' || task.assignedToId === currentUser

  const canDelete = userRole === 'Manager' || task.assignedToId === currentUser

  const canAssign = userRole === 'Manager'

  const creator = task.createdBy

  async function submitComment() {
    if (!newComment.trim()) return
    await onAddComment(task.id, newComment.trim())
    setNewComment('')
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 text-base">{task.title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IconX size={18} className="text-gray-400"/>
          </button>
        </div>
        <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
          <div className="flex flex-col gap-2">
            <label htmlFor="task-deadline" className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.deadlineLabel')}</label>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <IconCalendar size={16} className="text-gray-400" />
              <input
                id="task-deadline"
                name="deadline"
                type="date"
                value={task.deadline ? task.deadline.slice(0, 10) : ''}
                onChange={(e) => onUpdate({ ...task, deadline: e.target.value || null })}
                disabled={!canEdit}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-700 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {canAssign ? (
              <label htmlFor="task-assignee" className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.assigneeLabel')}</label>
            ) : (
              <p className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.assigneeLabel')}</p>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-900/20 flex items-center justify-center text-xs font-medium text-primary-900">
                {assignee?.pseudo?.[0]} 
              </div>
              {canAssign ? (
                <select
                  id="task-assignee"
                  name="assignee"
                  value={task.assignedToId ?? ''}
                  onChange={(e) => onAssign(task.id, e.target.value ? Number(e.target.value) : null)}
                  className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1"
                >
                  <option value="">{t('kanban.task.unassigned')}</option> 
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.pseudo}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-gray-700">{assignee?.pseudo || t('kanban.task.unassigned')}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.priorityLabel')}</p>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  onClick={() => canEdit && onUpdate({...task, priority: p.value})}
                  disabled={!canEdit}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-opacity ${p.bg} ${p.text} ${
                  task.priority === p.value ? 'opacity-100' : 'opacity-40'
                  } ${!canEdit ? 'cursor-not-allowed' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="task-description" className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.descriptionLabel')}</label>
            <textarea
              id="task-description"
              name="description"
              defaultValue={task.description ?? ''}
              onBlur={(e) => canEdit && onUpdate({...task, description: e.target.value })}
              placeholder={t('kanban.task.descriptionPlaceholder')}
              disabled={!canEdit}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none resize-none h-24 placeholder-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          { canDelete && (
            <Button variant="danger" onClick={() => onDelete(task.id)}>
              {t('kanban.task.deleteTask')}
            </Button>
          )}

          {task.status === 'Blocked' && (
            <div className="flex flex-col gap-3">
              <label htmlFor="task-comment" className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.commentPlaceholder')}</label>
              <textarea
                id="task-comment"
                name="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('kanban.task.commentPlaceholder')}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none resize-none h-16 placeholder-gray-300"
              />
              <Button onClick={submitComment} className="self-end">
                {t('kanban.task.sendComment')}
              </Button>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.commentsLabel')}</p>
              {(task.comments ?? []).length === 0 && (
                <p className="text-xs text-gray-300">{t('kanban.task.noComments')}</p>
              )}
              
              {(task.comments ?? []).map(comment => (
                <div key={comment.id} className="flex flex-col gap-1 bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary-900/20 flex items-center justify-center text-xs text-primary-900">
                      {comment.user.pseudo[0]}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{comment.user.pseudo}</span>
                    <span className="text-xs text-gray-300 ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString(locale)}
                    </span>
                    {comment.user.id === currentUser && (
                      <button
                        onClick={() => onDeleteComment(task.id, comment.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        title={t('common.delete')}
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 pl-7">{comment.content}</p>
                </div>
              ))}

            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{t('kanban.task.createdByLabel')}</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-7 h-7 rounded-full bg-primary-900/20 flex items-center justify-center text-xs font-medium text-primary-900">
                {creator?.pseudo?.[0] ?? '?'}
              </div>
              <span>{creator?.pseudo ?? t('kanban.task.unknownCreator')}</span>
            </div>
          </div>
          
        </div>
      </div>
    </>
  )

}

export default TaskPanel