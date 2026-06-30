export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const { bg, text } = getProgressColor(project.tasks.done, project.tasks.total)
  const pct = project.tasks.total === 0 ? 0 : Math.round(project.tasks.done / project.tasks.total * 100)

  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col gap-4 min-h-40 relative border-l-4 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeftColor: bg }}   /* l'accent latéral = couleur d'avancement */
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* Icônes au survol */}
      {hovered &&
      <div className="absolute top-3 right-3 flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(project) }}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
          <IconPencil size={14} />
        </button>
        {project.role === 'Admin' && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project) }}
            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
            <IconTrash size={14} />
          </button>
        )}
      </div>}

      {/* En-tête : Nom + rôle */}
      <div className="flex items-start justify-between pr-1">
        <h3
          onClick={() => navigate(`/projet/${project.id}`)}
          className="font-medium text-base leading-snug cursor-pointer hover:underline text-gray-800"
        >
          {project.name}
        </h3>
        <span className={`text-xs rounded-full px-2 py-0.5 whitespace-nowrap transition-all duration-200 bg-primary-100 text-primary-700 ${hovered ? 'mr-12' : ''}`}>
          {project.role}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="flex flex-col gap-1">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: bg }}  /* remplissage = couleur d'avancement */
          />
        </div>
        <span className="text-xs text-gray-500">
          {project.tasks.done}/{project.tasks.total} tâches — {pct}%
        </span>
      </div>

      {/* Pied : deadline + membres */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-400">
          📅 {new Date(project.deadline).toLocaleDateString('fr-FR')}
        </span>
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member, i) => (
            <div
              key={i}
              title={member}
              className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 border-2 border-white flex items-center justify-center text-xs font-medium"
            >
              {member[0]}
            </div>
          ))}
          {project.members.length > 3 && (
            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 border-2 border-white flex items-center justify-center text-xs">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}