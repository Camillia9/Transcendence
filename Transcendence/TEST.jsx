import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { getProgressColor } from '../../utils/progressColor'

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const { bg, text } = getProgressColor(project.tasks.done, project.tasks.total)
  const pct = project.tasks.total === 0
    ? 0
    : Math.round((project.tasks.done / project.tasks.total) * 100)

  return (
    <div
      style={{ backgroundColor: bg, color: text }}
      className="rounded-2xl p-5 flex flex-col gap-4 min-h-[160px] relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* Icônes au survol */}
      {hovered && (
        <div className="absolute top-3 right-3 flex gap-1">

          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project) }}
            className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 transition-colors"
          >
            <IconPencil size={14} />
          </button>

          {project.role === 'Admin' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(project) }}
              className="p-1.5 rounded-lg bg-red-400/20 hover:bg-red-400/40 transition-colors"
            >
              <IconTrash size={14} />
            </button>
          )}

        </div>
      )}

      {/* En-tête : nom cliquable + badge rôle */}
      <div className="flex items-start justify-between pr-10">
        <h3
          onClick={() => navigate(`/projet/${project.id}`)}
          className="font-medium text-base leading-snug cursor-pointer hover:underline"
        >
          {project.name}
        </h3>
        <span className="text-xs border rounded-full px-2 py-0.5 opacity-70 border-current whitespace-nowrap">
          {project.role}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="flex flex-col gap-1">
        <div className="w-full bg-black/10 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-current opacity-60 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs opacity-70">
          {project.tasks.done}/{project.tasks.total} tâches — {pct}%
        </span>
      </div>

      {/* Pied : deadline + membres */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs opacity-60">
          📅 {new Date(project.deadline).toLocaleDateString('fr-FR')}
        </span>
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member, i) => (
            <div
              key={i}
              title={member}
              className="w-7 h-7 rounded-full bg-black/20 border-2 border-white flex items-center justify-center text-xs font-medium"
            >
              {member[0]}
            </div>
          ))}
          {project.members.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-black/20 border-2 border-white flex items-center justify-center text-xs">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}



// MA VERSION 

import { IconPencil } from "@tabler/icons-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getProgressColor } from "../../utils/progressColor"

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false) // Gere le survol
  const { bg, text } = getProgressColor(project.tasks.done, project.tasks.total)
  const pct = project.tasks.total === 0 ? 0 : Math.round(project.tasks.done / project.tasks.total * 100)
  return (
    <div
      style={{backgroundColor: bg, color: text}}
      className="rounded-2xl p-5 flex flex-col gap-4 min-h-[160px] relative"
      
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/*Icones au survol*/}
      {hovered && 
      <div className="absolute top-3 right-3 flex gap-1">
        <button
        onClick={(e) => { e.stopPropagation(); onEdit(project)}}
        className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 transition-colors">
          <IconPencil size={14}/>
        </button>

        {project.role === 'Admin' && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project) }}
            className="p-1.5 rounded-lg bg-red-400/20 hover:bg-red-400/40 transition-colors">
            <IconTrash size={14} />
          </button>
        )}
      </div>}

    </div>


  )
}