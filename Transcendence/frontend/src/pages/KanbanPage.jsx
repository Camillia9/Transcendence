import { useState, useEffect } from "react";
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { mockProjects } from "../data/mockProjet";
import { PRIORITIES } from "../data/priorities";
import { useParams } from "react-router-dom";
import { CURRENT_USER } from "../data/currentUser";
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import TaskCard from "../components/ui/TaskCard"
import KanbanColumn from "../components/ui/KanbanColum"
import TaskPanel from "../components/ui/TaskPanel";

import { useSocket } from "../context/SocketContext"
import { getTasks } from "../api/tasks";
import { getProjectById } from "../api/projects";

const COLUMNS = [
  { id: "todo", label: "À faire" },
  { id: "inprogress", label: "En cours" },
  { id: "done", label: "Terminée" },
  { id: "waiting", label: "En attente" },
];

function KanbanPage() {

  const socket = useSocket()
  const { id } = useParams()
  const projectId = Number(id)

  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null) // null = panneau fermé. Une tâche = panneau ouvert avec ses détails.
  const [newTaskColumn, setNewTaskColumn] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('normal')
  const [newTaskError, setNewTaskError] = useState('')
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!socket || !projectId) return
    socket.emit('project:join', { projectId })

    socket.on('task:moved', ({ taskId, toColumn }) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: toColumn } : t))
    })

    return () => {
      socket.emit('project:leave', { projectId })
      socket.off('task:moved')
    }
  }, [socket, projectId])

  // Utilise l'API pour les tachs plutot que le mock
  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks(projectId)
        setTasks(data)
      } catch (error) {
        console.error('Impossible de charger les taches')
      }
    }
    loadTasks()
  }, [projectId]) // permet de recharger les taches si on navigue vers un autre projet

  useEffect(() => {
    async function loadProject() {
      try {
        const data = await getProjectById(projectId)
        setProject(data)
      } catch (error) {
        console.error('Impossible de charger le projet', error)
      }
    }
    loadProject()
  }, [projectId])


  // TEMPORAIRE 
  console.log(selectedTask)

  const handleDragStart = (event) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id
    const newColumn = over.id
    const task = tasks.find(t => t.id === taskId)
    if (task.column === newColumn) return

    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, column: newColumn } : t
    ))

    if (socket) {
      socket.emit('task:moved', { projectId, taskId, fromColumn: task.column, toColumn: newColumn })
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
  const handleUpdateTask = (updateTask) => {
    setTasks(tasks.map(t => t.id === updateTask.id ? updateTask : t))
    setSelectedTask(updateTask)
  }

  // Remettre tout au propre lorsqu'on a fini de cree la tache
  const handleCloseNewTask = () => {
    setNewTaskColumn(null)
    setNewTaskTitle('')
    setNewTaskPriority('normal')
    setNewTaskError('')
  }

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      setNewTaskError('Le titre est obligatoire')
      return
    }

    const newTask = {
      id: Date.now(),
      projectId: projectId,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      column: newTaskColumn,
      createdBy: CURRENT_USER,
      assignee: CURRENT_USER,
      deadline: null,
      comments: [],
    }
    setTasks([newTask, ...tasks])
    handleCloseNewTask()
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId)) // On retire la tache du state
    setSelectedTask(null) // et on ferme le panneau
  }

  // Comme les projets s'affichent avec une fonction asynchrone, useState est null au depart. Alors y'a un temps avant de s'affichier.
  // Si on ne met pas cela, ca plante. 
  if (!project) return <p>Chargement…</p>
  
  // Affiche la tache seulement au Mananger ou a la personne assignee (pour l'instant CUREENT_USER, A MODIF AVEC BACK)
  const visibleTasks = project.role === 'Manager' ?
    tasks : tasks.filter(t => t.assignee === CURRENT_USER)


  return (

    <div className="flex flex-col gap-6 min-w-fit">
      {/*En tete*/}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-primary-900">{project.name}</h1>
      </div>
      {/*Les colonnes */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = visibleTasks.filter((t) => t.column === col.id);
            return (
              <KanbanColumn key={col.id} col={col} colTasks={colTasks} onAddTask={() => setNewTaskColumn(col.id)}>
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
        userRole={project.role}
        currentUser={CURRENT_USER}
        members={project.members}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
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
    </div>
  )
}

export default KanbanPage;
