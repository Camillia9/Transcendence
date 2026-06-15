import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
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

  const handleDragEnd = (event) => {
    const { active, over } = event
    console.log('carte deplacee:', active.id, '-> colonne:', over?.id)
  }

  return (
    <div className="flex flex-col gap-6 min-w-fit">
      {/*En tete*/}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-800">Nom du projet</h1>
      </div>

      {/*Les colonnes */}
      <DndContext onDragEnd={handleDragEnd}>
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
      </DndContext>
    </div>
  )
}

export default Projet;
