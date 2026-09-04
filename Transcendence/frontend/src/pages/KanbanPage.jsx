import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next'
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { getPriorities } from "../data/priorities";
import { useParams, useNavigate } from "react-router-dom";
import { CURRENT_USER } from "../data/currentUser";
import { useAuth } from "../context/AuthContext";
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import TaskCard from "../components/ui/TaskCard"
import KanbanColumn from "../components/ui/KanbanColum"
import TaskPanel from "../components/ui/TaskPanel";
import Avatar from "../components/ui/Avatar"

import { useWorkspaceSocket } from "../context/SocketContext"
import { getTasks, updateTask, deleteTask, assignTask, moveTask, createTask, addComment, deleteComment } from "../api/tasks";
import { addProjectMember, getAvailableMembers, getProjectById, removeProjectMember, updateProjectMemberRole } from "../api/projects";
import { IconPlug, IconPlus, IconTrash, IconPencil } from "@tabler/icons-react";

function getColumns(t) {
  return [
    { id: "ToDo", label: t('kanban.columns.todo') },
    { id: "Doing", label: t('kanban.columns.doing') },
    { id: "Done", label: t('kanban.columns.done') },
    { id: "Blocked", label: t('kanban.columns.blocked') },
  ]
}

function KanbanPage() {
  const { t } = useTranslation()
  const COLUMNS = getColumns(t)
  const PRIORITIES = getPriorities(t)

  const { user } = useAuth()

  const socket = useWorkspaceSocket()
  const { id } = useParams()
  const projectId = Number(id)
  const navigate = useNavigate()

  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null) // null = panneau fermé. C'est la tache ouverte dans le taskPanel
  const [newTaskColumn, setNewTaskColumn] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Normal')
  const [newTaskError, setNewTaskError] = useState('')
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([]) // Le tableau contenant toutes les taches

  const [showMembers, setShowMembers] = useState(false) // modal ouverte ?
  const [availableMembers, setAvailableMembers] = useState([]) // gens de l'orga ajoutable

  const [memberToEdit, setMemberToEdit] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [memberError, setMemberError] = useState('') // Msg erreur pour dernier manager qui veut partir

  const projectRef = useRef(null)
  useEffect(() => {
    projectRef.current = project
  }, [project])

  useEffect(() => {
    if (!socket || !projectId) return
    socket.emit('project:join', { projectId })

    socket.on('task:moved', ({ taskId, toColumn }) => {
      loadTasks()
    })

    socket.on('task:created', (task) => {
      setTasks(prev => prev.some(t => t.id === task.id) ? prev : [task, ...prev])
    })

    socket.on('task:updated', (task) => {
      setTasks(prev => prev.some(t => t.id === task.id)
        ? prev.map(t => t.id === task.id ? task : t)
        : [...prev, task]
      )
      setSelectedTask(prev => prev && prev.id === task.id ? task : prev)
    })

    socket.on('task:deleted', ({ taskId }) => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
    })

    socket.on('task:comment-added', ({ taskId, comment }) => {
      const addComment = (t) => t.id === taskId
        ? { ...t, comments: (t.comments ?? []).some(c => c.id === comment.id) ? t.comments : [...(t.comments ?? []), comment] }
        : t
      setTasks(prev => prev.map(addComment))
      setSelectedTask(prev => prev ? addComment(prev) : prev)
    })

    socket.on('task:comment-updated', ({ taskId, comment }) => {
      const patchComment = (t) => t.id === taskId
        ? { ...t, comments: (t.comments ?? []).map(c => c.id === comment.id ? comment : c) }
        : t
      setTasks(prev => prev.map(patchComment))
      setSelectedTask(prev => prev ? patchComment(prev) : prev)
    })

    socket.on('task:comment-deleted', ({ taskId, commentId }) => {
      const removeComment = (t) => t.id === taskId
        ? { ...t, comments: (t.comments ?? []).filter(c => c.id !== commentId) }
        : t
      setTasks(prev => prev.map(removeComment))
      setSelectedTask(prev => prev ? removeComment(prev) : prev)
    })

    socket.on('project:member-role-updated', ({ projectId: updatedProjectId, member }) => {
      if (updatedProjectId !== projectId) return
      setProject(prev => prev ? {
        ...prev,
        projectMembers: (prev.projectMembers ?? []).map(m =>
          m.user.id === member.userId ? { ...m, role: member.role } : m
        ),
      } : prev)
    })

    socket.on('project:member-added', ({ projectId: addedProjectId, member }) => {
      if (addedProjectId !== projectId) return
      setProject(prev => prev ? {
        ...prev,
        projectMembers: (prev.projectMembers ?? []).some(m => m.user.id === member.userId)
          ? prev.projectMembers
          : [...prev.projectMembers, member],
      } : prev)
      setAvailableMembers(prev => prev.filter(u => u.id !== member.userId))
    })

    socket.on('project:member-removed', ({ projectId: removedProjectId, userId: removedUserId }) => {
      if (removedProjectId !== projectId) return

      if (removedUserId === user?.id) {
        socket.emit('project:leave', { projectId })
        alert(t('kanban.alerts.removedFromProject'))
        navigate('/home')
        return
      }

      const removedMembership = projectRef.current?.projectMembers?.find(m => m.user.id === removedUserId)

      setProject(prev => prev ? {
        ...prev,
        projectMembers: (prev.projectMembers ?? []).filter(m => m.user.id !== removedUserId),
      } : prev)

      if (removedMembership) {
        setAvailableMembers(prev => prev.some(u => u.id === removedUserId) ? prev : [...prev, removedMembership.user])
      }
    })

    socket.on('project:deleted', ({ projectId: deletedProjectId }) => {
      if (deletedProjectId !== projectId) return
      alert(t('kanban.alerts.projectDeleted'))
      navigate('/home')
    })

    socket.on('organisation:member-removed', ({ orgId, removedUserId }) => {
      if (removedUserId !== user?.id) return
      if (projectRef.current?.orgId !== orgId) return
      alert(t('kanban.alerts.removedFromOrg'))
      navigate('/home')
    })

    return () => {
      socket.emit('project:leave', { projectId })
      socket.off('task:moved')
      socket.off('task:created')
      socket.off('task:updated')
      socket.off('task:deleted')
      socket.off('task:comment-added')
      socket.off('task:comment-updated')
      socket.off('task:comment-deleted')
      socket.off('project:member-role-updated')
      socket.off('project:member-added')
      socket.off('project:member-removed')
      socket.off('project:deleted')
      socket.off('organisation:member-removed')
    }
  }, [socket, projectId])

  // Recupere les donnes de la task
  const loadTasks = async () => {
    try {
      const data = await getTasks(projectId)
      setTasks(data)
    } catch (error) {
      console.error('Impossible de charger les taches')
    }
  }

  async function loadProject() {
    try {
      const data = await getProjectById(projectId)
      setProject(data)
    } catch (error) {
      if (error.status === 404) {
        navigate('/home', { state: { message: t('kanban.alerts.projectNoLongerExists') } })
      } else {
        console.error('Impossible de charger le projet', error)
      }
    }
  }

  // Apelle ces fction aux chargements
  useEffect(() => {
    loadTasks()
    loadProject()
  }, [projectId]) // permet de recharger les taches si on navigue vers un autre projet

  const handleDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id
    const newColumn = over.id
    const task = tasks.find(t => t.id === taskId)
    if (!task) return;
    if (task.status === newColumn) return // meme colonne, rien a faire

    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: newColumn } : t
    ))
    
    try {
      await moveTask(projectId, taskId, newColumn)
       if (socket) {
      socket.emit('task:moved', { projectId, taskId, fromColumn: task.status, toColumn: newColumn })
    }
      await loadTasks()
    } catch (error) {
      console.error('Impossible de deplacer la tache', error)
      await loadTasks()
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      }
    })
  )

  const handleUpdateTask = async (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    setSelectedTask(updatedTask)

    try {
      await updateTask(projectId, updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        deadline: updatedTask.deadline,
      })
    } catch (error) {
      console.error('Impossible de modifier la tache', error)
    }
  }

  const handleCloseNewTask = () => {
    setNewTaskColumn(null)
    setNewTaskTitle('')
    setNewTaskPriority('Normal')
    setNewTaskError('')
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      setNewTaskError(t('kanban.errors.titleRequired'))
      return
    }
    if (newTaskTitle.trim().length > 20) {
      setNewTaskError(t('kanban.errors.titleTooLong'))
      return
    }
    try {
      const newTask = await createTask(projectId, {
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        description: null,
        deadline: null,
      })
      setTasks([newTask, ...tasks])
      handleCloseNewTask()
    } catch (error) {
      setNewTaskError(t('kanban.errors.createFailed'))
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(projectId, taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      setSelectedTask(null)
    } catch (error) {
      console.error('Impossible de supprimer la tache', error)
    }
  }

    const handleAssignTask = async (taskId, userId) => {
    try {
      await assignTask(projectId, taskId, userId)
      const data = await getTasks([projectId])
      setTasks(data)
      const fresh = data.find(t => t.id === taskId)
      if (fresh) setSelectedTask(fresh)
    } catch (error) {
      console.error('Impossible d\'assigner la tache', error)
    }
  }

  const handleAddComment = async (taskId, content) => {
    try {
      const saved = await addComment(projectId, taskId, content)

      const updated = {...selectedTask, comments: [...selectedTask.comments ?? [], saved] }
      setSelectedTask(updated)
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
    } catch (error) {
      console.error('Impossible d\'ajouter le commentaire', error)
    }
  }

  const handleDeleteComment = async (taskId, commentId) => {
    try {
      await deleteComment(projectId, taskId, commentId)

      const updated = {
        ...selectedTask,
        comments: (selectedTask.comments ?? []).filter(c => c.id !== commentId),
      }
      setSelectedTask(updated)
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
    } catch (error) {
      console.error('Impossible de supprimer le commentaire', error)
    }
  }

  async function openMembers() {
    setShowMembers(true)
    try {
      const data = await getAvailableMembers(projectId)
      setAvailableMembers(data)
    } catch (error) {
      console.error('Impossible de charger les membres disponibles', error)
    }
  }

  async function handleAddMember(userId) {
    try {
      await addProjectMember(projectId, userId)
      await loadProject()
      const data = await getAvailableMembers(projectId)
      setAvailableMembers(data)
    } catch (error) {
      console.error('Impossible d\'ajouter le membre', error)
    }
  }

  function getRemoveMemberErrorMessage(error, t) {
    if (error.message === 'Cannot remove the last manager of the project')
      return t('kanban.errors.lastManager')
    return t('kanban.errors.removeMemberFailed')
  }
  
  async function handleRemoveMember(userId) {
    try {
      setMemberError('') // nettoie le msg precedent
      await removeProjectMember(projectId, userId)
      // Si je me retire moi-meme on ne reload pas la page, juste on sort
      if (userId === user.id) {
        navigate('/home')
        return // Important
      }
      // Si je retire quelqu'un d'autres : reload page 
      await loadProject()
      await loadTasks()
      const data = await getAvailableMembers(projectId)
      setAvailableMembers(data)
    } catch (error) {
      setMemberError(getRemoveMemberErrorMessage(error, t))
    }
  }

  async function saveRole() {
    try {
      await updateProjectMemberRole(projectId, memberToEdit.userId, newRole)
      await loadProject()
      setMemberToEdit(null)
      setNewRole('')
    } catch (error) {
      console.error('Impossible de modifier le role du membre', error)
    }
  }

  if (!project) return <p>{t('common.loading')}</p>

  const memberships = project.projectMembers ?? []
  const members = memberships.map(m => m.user)
  const myRole = memberships.find(m => m.user.id === user?.id)?.role

  const visibleTasks = myRole=== 'Manager'
    ? tasks
    : tasks.filter(t => t.assignedToId === user?.id)


  return (

    <div className="flex flex-col gap-6">
      {/*En tete*/}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-primary-900">{project.title}</h1>

        {/*Bouton noouvelle tache et ajout de membres*/}
        <div className="flex gap-2">
          {myRole === 'Manager' && (
            <Button variant="outline" onClick={openMembers}>
              {t('kanban.membersButton')}
            </Button>
          )}
          <Button onClick={() => setNewTaskColumn('ToDo')}>
            + {t('kanban.newTask')}
          </Button>
        </div>

      </div>
      {/*Les colonnes */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = visibleTasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.position - b.position)
            return (
              <KanbanColumn key={col.id} col={col} colTasks={colTasks}>
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </KanbanColumn>
            )
          })}
        </div>

        {/*copie flottante qui suis la souris*/}
        <DragOverlay>
          {activeTask && (
            <div className="opacity-90 rotate-1 scale-105">
              <TaskCard task={activeTask} onClick={() => { }} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskPanel
        task={selectedTask}
        userRole={myRole}
        currentUser={user?.id}
        members={members}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onAssign={handleAssignTask}
        onDelete={handleDeleteTask}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      {/*Modal d'ajout d'une tache */}
      <Modal
        isOpen={!!newTaskColumn}
        onClose={handleCloseNewTask}
        title={t('kanban.newTaskModal.title')}
      >
        {/*Titre*/}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm text-gray-500">{t('kanban.taskTitleLabel')} *</label>
          <Input
            type="text"
            placeholder={t('kanban.taskTitlePlaceholder')}
            value={newTaskTitle}
            onChange={(e) => {
              setNewTaskTitle(e.target.value)
              setNewTaskError('')
            }}
            light
          />
          {newTaskError && (
            <p className="text-red-400 text-xs mt-1">{newTaskError}</p>
          )}
        </div>
        {/*Priorite*/}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm text-gray-500">{t('kanban.task.priorityLabel')}</label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                onClick={() => setNewTaskPriority(p.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-opacity ${p.bg} ${p.text} ${newTaskPriority === p.value ? 'opacity-100' : 'opacity-40'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {/*Boutons*/}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCloseNewTask}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreateTask}>
            {t('kanban.createTaskSubmit')}
          </Button>
        </div>
      </Modal>

      {/*Modal de la gestions des membres*/}
      <Modal
        isOpen={showMembers}
        onClose={() => { setShowMembers(false); setMemberError('') }}
        title={t('kanban.membersModal.title')}
      >
        {/*Membres actuels*/}
        <div className="flex flex-col gap-2 mb-6">
          <h3 className="text-sm font-medium text-gray-700">{t('kanban.currentMembers')}</h3>
          {memberError && (
            <p className="text-sm text-red-400">{memberError}</p>
          )}
          {memberships.map(m => (
            <div key={m.user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar src={m.user.avatar} username={m.user.pseudo} size="sm" />
                <span className="text-sm text-gray-700">{m.user.pseudo}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{m.role === 'Manager' ? t('kanban.roles.manager') : t('kanban.roles.user')}</span>

                <button
                  onClick={() => {
                    setMemberToEdit({
                      userId: m.user.id,
                      pseudo: m.user.pseudo,
                      role: m.role
                    })
                    setNewRole(m.role)
                  }}
                  className="text-gray-300 hover:text-primary-600 transition-colors"
                  title={t('kanban.editRoleModal.title')}
                >
                  <IconPencil size={16} />
                </button>

                <button
                  onClick={() => handleRemoveMember(m.user.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  title={t('kanban.removeMemberTooltip')}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/*Membres ajoutables*/}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-700">{t('kanban.addFromOrg')}</h3>
          {availableMembers.length === 0 ? (
            <p className="text-xs text-gray-400">{t('kanban.allMembersAdded')}</p>
          ) : (
            availableMembers.map(u => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={u.avatar} username={u.pseudo} size="sm" />
                  <span className="text-sm text-gray-700">{u.pseudo}</span>
                </div>
                <button
                  onClick={() => handleAddMember(u.id)}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                  title={t('common.add')}
                >
                  <IconPlug size={18} />
                </button>
              </div>
            ))
          )}

        </div>
        
            
      </Modal>

      {memberToEdit && (
        <Modal
          isOpen={!!memberToEdit}
          onClose={() => {
            setMemberToEdit(null)
            setNewRole('')
          }}
          title={t('kanban.editRoleModal.title')}
          >
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm text-gray-500">{t('kanban.memberLabel')}</label>
              <p className="text-sm text-gray-700">
                {memberToEdit.pseudo}
              </p>
            </div>

            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm text-gray-500">{t('kanban.roleLabel')}</label>

              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="User">{t('kanban.roles.user')}</option>
                <option value="Manager">{t('kanban.roles.manager')}</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMemberToEdit(null)
                  setNewRole('')
                }}
              >
                {t('common.cancel')}
              </Button>

              <Button
                variant="primary"
                onClick={saveRole}
              >
                {t('common.save')}
              </Button>
            </div>
          </Modal>
      )}

    </div>
  )
}

export default KanbanPage;