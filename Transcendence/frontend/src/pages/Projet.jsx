import { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { mockTasks } from "../data/mockTasks";
import TaskCard from "../components/ui/TaskCard"
import KanbanColumn from "../components/ui/KanbanColum"

const COLUMNS = [
  { id: "todo", label: "À faire" },
  { id: "inprogress", label: "En cours" },
  { id: "done", label: "Terminée" },
  { id: "waiting", label: "En attente" },
];

function Projet() {
  const [tasks, setTasks] = useState(mockTasks)
  const [activeTask, setActiveTask] = useState(null)

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


  return (
    <div className="flex flex-col gap-6 min-w-fit">
      {/*En tete*/}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-800">Nom du projet</h1>
      </div>

      {/*Les colonnes */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.column === col.id);
            return (
              <KanbanColumn key={col.id} col={col} colTasks={colTasks}>
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => console.log('click', task.title)}
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
    </div>
  )
}

export default Projet;
