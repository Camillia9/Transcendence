import { IconMessageCircle } from "@tabler/icons-react";

const PRIORITY = {
	urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-600' },
	normal: { label: 'Normal', bg: 'bg-orange-100', text: 'text-orange-500' },
	low:    { label: 'Faible', bg: 'bg-gray-100', text: 'text-gray-500' },
}

function TaskCard({ task, onClick }) {
  const priority = PRIORITY[task.priority]

  const isDeadlinePast = task.deadline ? new Date(task.deadline) < new Date() : false

  return (
    <div
      onClick={onclick}
      className="bg-white rounded-xl p-3 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/*Badge de priorite */}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${priority.bg} ${priority.text}`}>
        {priority.label}
      </span>

      {/*Titre */}
      {/*CONTINUER ICI */}

    </div>
  )
}