import { IconPencil, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getProgressColor } from "../../utils/progressColor"

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false) // Gere le survol

  const done  = project.tasks?.done  ?? 0
  const total = project.tasks?.total ?? 0
  const { accent, tint, soft, text } = getProgressColor(done, total)
  const pct = total === 0 ? 0 : Math.round(done / total * 100)

  const members = project.members ?? []

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 min-h-40 relative border-l-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ backgroundColor: tint, borderLeftColor: accent }}   /* l'accent latéral = couleur d'avancement */
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/*Icones au survol pour le manager*/}
      {/* stopPropagation: s'arrête au bouton edit, ne remonte pas aux parents en ouvrant une page */}
      {hovered && project.role === 'Manager' && (
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project)}}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
            <IconPencil size={14}/>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project) }}
            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
            <IconTrash size={14} />
          </button>
        </div>
      )}
        

	  {/*En-tete: Nom + role*/}
      <div className="flex items-start justify-between pr-1">
        <h3
        onClick={() => navigate(`/projet/${project.id}`)}
          className="font-medium text-base leading-snug cursor-pointer hover:underline"
          style={{ color: text }}
        >
          {project.title}
        </h3>
        {/* Transition au survol*/}
        <span
          className={`text-xs rounded-full px-2 py-0.5 whitespace-nowrap transition-all duration-200 ${hovered && project.role === 'Manager' ? 'mr-12' : ''}`}
          style={{ backgroundColor: soft, color: text }}
        >
          {project.role}
        </span>
      </div>

	  {/* Barre de progression */}
	  {/*Affiche les elemets de haut en bas*/}
      <div className="flex flex-col gap-1">
		{/*La barre de tache statique grise*/}
        <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#00000010' }}>
		   {/*barre de progression (remplissage) */}
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: accent }}  /* remplissage = couleur d'avancement */
          />
        </div>
        <span className="text-xs" style={{ color: text }}>
          {done}/{total} tâches — {pct}%
        </span>
      </div>

      {/* Pied : deadline + membres */}
	  {/*2 blocs a gauche et a droite */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-400">
          {project.deadline
          ? `📅 {new Date(project.deadline).toLocaleDateString('fr-FR')}`
          : '📅 Aucune échéance'}
			{/*project.deadline : project.deadline: date brut. On la transfore en objet JS(new). Format en fr(toLocal())*/}
        </span>
		{/*On affiche seulement les 3 premier membres. On leurs cree un avatar chacun(map)*/}
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((member, i) => (
            <div
              key={i}
              title={member}
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: soft, color: text }}
            >
              {member[0]}
            </div>
          ))}
          {members.length > 3 && (
            <div
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs"
              style={{ backgroundColor: soft, color: text }}
            >
              +{members.length - 3}
            </div>
          )}
        </div>
      </div>

    </div>

  )
}
