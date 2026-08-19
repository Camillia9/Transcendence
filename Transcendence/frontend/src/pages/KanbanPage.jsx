import { useState, useEffect } from "react";
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { PRIORITIES } from "../data/priorities";
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
import { addProjectMember, getAvailableMembers, getProjectById, removeProjectMember } from "../api/projects";
import { IconPlug, IconPlus, IconTrash } from "@tabler/icons-react";

const COLUMNS = [
  { id: "ToDo", label: "À faire" },
  { id: "Doing", label: "En cours" },
  { id: "Done", label: "Terminée" },
  { id: "Blocked", label: "En attente" },
];

function KanbanPage() {

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

  useEffect(() => {
    if (!socket || !projectId) return
    socket.emit('project:join', { projectId })

    socket.on('task:moved', ({ taskId, toColumn }) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: toColumn } : t))
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

    socket.on('project:member-removed', ({ projectId: removedProjectId }) => {
      if (removedProjectId !== projectId) return
      socket.emit('project:leave', { projectId })
      alert("Vous faites plus partie de ce projet")
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
      socket.off('project:member-removed')
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
      console.error('Impossible de charger le projet', error)
    }
  }

  // Apelle ces fction aux chargements
  useEffect(() => {
    loadTasks()
    loadProject()
  }, [projectId]) // permet de recharger les taches si on navigue vers un autre projet

  //useEffect(() => {
  //  loadProject()
  //}, [projectId])


  // TEMPORAIRE DEBUG
  //console.log(selectedTask)

  // Fction helper 
  //const getNextPosition = (projId, column) =>
  //  tasks.filter(t => t.projectId === projId && t.status === column).length

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

      // Calcule de la prochiane position loesqu'on bouge ~ jsp si elle sera utilse plus tard
    //const nextPosition = getNextPosition(projectId, newColumn)

    // Met a jour directement la position des cartes lorsqu'une est bouge
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: newColumn } : t
    ))
    
    // le back calcule lui-meme la position
    try {
      await moveTask(projectId, taskId, newColumn)
       if (socket) {
      socket.emit('task:moved', { projectId, taskId, fromColumn: task.status, toColumn: newColumn })
    }
      await loadTasks() // Apres chaque move, recupere nouvelle donnes du back qui calcule les nouvelles positions
    } catch (error) {
      console.error('Impossible de deplacer la tache', error)
      await loadTasks() // Si erreur, on resynchronise direct, la carte ne se deplace plus visuellement
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

  // Maj de la tache depuis le paneau (panel)
  const handleUpdateTask = async (updatedTask) => {
    // MaJ imediate a l'ecran
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    setSelectedTask(updatedTask)

    // On envoie au back uniquement les champs que la route accepte
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

  // Remettre tout au propre lorsqu'on a fini de cree la tache
  const handleCloseNewTask = () => {
    setNewTaskColumn(null)
    setNewTaskTitle('')
    setNewTaskPriority('Normal')
    setNewTaskError('')
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      setNewTaskError('Le titre est obligatoire')
      return
    }
    //const nextPosition = getNextPosition(projectId, newTaskColumn)
    try {
      // On envoie uniquement ce que la route accepte
      const newTask = await createTask(projectId, {
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        description: null,
        deadline: null,
      })
      // le back renvoie la task complete
      setTasks([newTask, ...tasks])
      handleCloseNewTask()
    } catch (error) {
      setNewTaskError('Impossible de creer la tache')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(projectId, taskId)
      setTasks(tasks.filter(t => t.id !== taskId)) // On retire la tache du state
      setSelectedTask(null) // et on ferme le panneau
    } catch (error) {
      console.error('Impossible de supprimer la tache', error)
    }
  }

    const handleAssignTask = async (taskId, userId) => {
    try {
      await assignTask(projectId, taskId, userId) // la tache complete
      const data = await getTasks([projectId]) // recup la tache avec get pour avoir le resultats sans refresh
      setTasks(data)
      const fresh = data.find(t => t.id === taskId)
      if (fresh) setSelectedTask(fresh)
    } catch (error) {
      console.error('Impossible d\'assigner la tache', error)
    }
  }

  const handleAddComment = async (taskId, content) => {
    try {
      const saved = await addComment(projectId, taskId, content) // commentaire complet avec .user

      // On l'ajoute a la tache ouverte
      const updated = {...selectedTask, comments: [...selectedTask.comments ?? [], saved] } // on modifie que le commentaire, on laisse les autres inchange
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

  // Bouton pour afficher modal d'ajouts
  async function openMembers() {
    setShowMembers(true)
    try {
      const data = await getAvailableMembers(projectId)
      setAvailableMembers(data)
    } catch (error) {
      console.error('Impossible de charger les membres disponibles', error)
    }
  }

  // Ajouter ces personnes
  async function handleAddMember(userId) {
    try {
      await addProjectMember(projectId, userId)
      await loadProject() // rafraichit les membres actuels
      const data = await getAvailableMembers(projectId)
      setAvailableMembers(data) // rafraichit les personnes dispo
    } catch (error) {
      console.error('Impossible d\'ajouter le membre', error)
    }
  }

  // Supprimer les membres
  async function handleRemoveMember(userId) {
    try {
      await removeProjectMember(projectId, userId)
      await loadProject()
      await loadTasks()
      const data = await getAvailableMembers(projectId)
      setAvailableMembers(data)
    } catch (error) {
      console.error('Impossible de retirer le membre', error)
    }
  }

  // Comme les projets s'affichent avec une fonction asynchrone, useState est null au depart. Alors y'a un temps avant de s'affichier.
  // Si on ne met pas cela, ca plante. 
  if (!project) return <p>Chargement…</p>

  // Affiche la tache seulement au Mananger ou a la personne assignee (pour l'instant CUREENT_USER, A MODIF AVEC BACK)
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
              Membres
            </Button>
          )}
          <Button onClick={() => setNewTaskColumn('ToDo')}>
            + Nouvelle tache
          </Button>
        </div>

      </div>
      {/*Les colonnes */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => { // Fabrication de mes 4 colonnes une par une. Ce qui suis s'execute 4 fois (todo, doing etc)
            const colTasks = visibleTasks
              .filter((t) => t.status === col.id) // Parrcourt les taches visible et affiche que celle qui correspondent a sa colonne 
              .sort((a, b) => a.position - b.position) // Range l'ordre des cartes. Si a est negatif -> au dessus, positif -> en dessous
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
        title="Nouvelle tache"
      >
        {/*Titre*/}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm text-gray-500">Titre *</label>
          <Input
            type="text"
            placeholder="Ex: Creation de la page login"
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
          <label className="text-sm text-gray-500">Priorite</label>
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
            Annuler
          </Button>
          <Button onClick={handleCreateTask}>
            Cree la tache
          </Button>
        </div>
      </Modal>

      {/*Modal de la gestions des membres*/}
      <Modal
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
        title="Membres du projet"
      >
        {/*Membres actuels*/}
        <div className="flex flex-col gap-2 mb-6">
          <h3 className="text-sm font-medium text-gray-700">Membres actuels</h3>
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar src={m.avatar} username={m.pseudo} size="sm" />
                <span className="text-sm text-gray-700">{m.pseudo}</span>
              </div>
              <button
                onClick={() => handleRemoveMember(m.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
                title="Retirer"
              >
                <IconTrash size={16} />
              </button>
            </div>
          ))}
        </div>

        {/*Membres ajoutables*/}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-700">Ajouter depuis l'organisation</h3>
          {availableMembers.length === 0 ? (
            <p className="text-xs text-gray-400">Tous les membres de l'organisation sont déjà dans le projet.</p>
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
                  title="Ajouter"
                >
                  <IconPlug size={18} />
                </button>
              </div>
            ))
          )}

        </div>
        
            
      </Modal>

    </div>
  )
}

export default KanbanPage;
