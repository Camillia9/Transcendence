import { IconPencil, IconTrash } from "@tabler/icons-react"
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
		{/* stopPropagation: s'arrête au bouton edit, ne remonte pas aux parents en ouvrant une page */}
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

	  {/*En-tete: Nom + role*/}
      <div className="flex items-start justify-between pr-1">
        <h3
          onClick={() => navigate(`/projet/${project.id}`)}
          className="font-medium text-base leading-snug cursor-pointer hover:underline"
        >
          {project.name}
        </h3>
        {/* Transition au survol*/}
        <span className={`text-xs border rounded-full px-2 py-0.5 opacity-70 border-current whitespace-nowrap transition-all duration-200 ${hovered ? 'mr-12' : ''}`}>
          {project.role}
        </span>
      </div>

	  {/* Barre de progression */}
	  {/*Affiche les elemets de haut en bas*/}
      <div className="flex flex-col gap-1">
		{/*La barre de tache statique grise*/}
        <div className="w-full bg-black/10 rounded-full h-1.5">
		   {/*barre de progression (remplissage) */}
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
	  {/*2 blocs a gauche et a droite */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs opacity-60">
			{/*project.deadline : project.deadline: date brut. On la transfore en objet JS(new). Format en fr(toLocal())*/}
          📅 {new Date(project.deadline).toLocaleDateString('fr-FR')}
        </span>
		{/*On affiche seulement les 3 premier membres. On leurs cree un avatar chacun(map)*/}
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member, i) => (
            <div
              key={i}
              title={member}
              className="w-7 h-7 rounded-full bg-black/20 border-2 border-white flex items-center justify-center text-xs font-medium"
            >
			  {/*affiche 1ere lettres*/}
              {member[0]}
            </div>
          ))}
		  {/*4eme bulle compteur si +3 membres*/}
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

// FINI ProjectCard, modifier Home.jsx