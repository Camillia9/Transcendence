import { useState } from "react";
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { mockTasks } from "../data/mockTasks";
import { PRIORITIES } from "../data/priorities";
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import TaskCard from "../components/ui/TaskCard"
import KanbanColumn from "../components/ui/KanbanColum"
import TaskPanel from "../components/ui/TaskPanel";

const COLUMNS = [
  { id: "todo", label: "À faire" },
  { id: "inprogress", label: "En cours" },
  { id: "done", label: "Terminée" },
  { id: "waiting", label: "En attente" },
];

function Projet() {
  const [tasks, setTasks] = useState(mockTasks)
  const [activeTask, setActiveTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null) // null = panneau fermé. Une tâche = panneau ouvert avec ses détails.
  const [newTaskColumn, setNewTaskColumn] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('normal')
  const [newTaskError, setNewTaskError] = useState('')

  
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
      t.id === taskId ? {...t, column: newColumn } : t
    ))
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint:{
        delay:200,
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
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      column: newTaskColumn,
      assignee: null,
      deadline: null,
      comments: [],
    }
    setTasks([newTask, ...tasks])
    handleCloseNewTask()
  }

  return (
    <div className="flex flex-col gap-6 min-w-fit">
      {/*En tete*/}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-800">Nom du projet</h1>
      </div>

      {/*Les colonnes */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.column === col.id);
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
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
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
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-opacity ${p.bg} ${p.text} ${
                  newTaskPriority === p.value ? 'opacity-100' : 'opacity-40'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {/*Boutons*/}
        <div className="flex gap-2">
          <Button onClick={handleCloseNewTask}>
            Annuler
          </Button>
          <Button variant="dark" onClick={handleCreateTask}>
            Cree la tache
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Projet;
