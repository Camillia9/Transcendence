import { useState } from "react";
import { mockTasks } from "../data/mockTasks";

const COLUMNS = [
  { id: "todo", label: "À faire" },
  { id: "inprogress", label: "En cours" },
  { id: "done", label: "Terminée" },
  { id: "waiting", label: "En attente" },
];

function Projet() {
  const [tasks, setTasks] = useState(mockTasks)

  return (
    <div className="flex flex-col gap-6 min-w-fit">
      {/*En tete*/}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-800">Nom du projet</h1>
      </div>

      {/*Les colonnes */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.id);
          return (
            <div
              key={col.id}
              className="bg-gray-100 rounded-2xl p-4 flex flex-col gap-3 min-w-70"
            >

              {/*En-tete colonne */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 text-sm">
                    {col.label}
                  </span>
                  <span className="bg-gray-200 text-gray-500 text-xs rounded-full px-2 py-0.5">
                    {colTasks.length}{" "}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 text-lg leading-none">
                  +
                </button>
              </div>

              {/*Cartes */}
              <div className="flex flex-col gap-2">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl p-3 text-sm text-gray-700"
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Projet;
