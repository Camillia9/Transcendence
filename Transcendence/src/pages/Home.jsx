import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockProjects } from '../data/mockProjet'
import Button from '../components/ui/Button'
import Card from "../components/ui/Card"
import Avatar from "../components/ui/Avatar"
import Badge from "../components/ui/Badge"
import ProjectCard from '../components/ui/ProjectCard'
import {getProgressColor} from "../utils/progressColor"

function Home() {
    const navigate = useNavigate()
    const [openId, setOpenId] = useState(null)
    const clickTimer = useRef(null)

  const handleClick = (id) => {
  // Si un clic est déjà en attente → c'est un double clic
  if (clickTimer.current) {
    clearTimeout(clickTimer.current)
    clickTimer.current = null
    navigate(`/projet/${id}`)
    return
  }
  // Sinon on attend 250ms pour voir si un 2ème clic arrive
  clickTimer.current = setTimeout(() => {
    clickTimer.current = null
    setOpenId(openId === id ? null : id)
  }, 250)
}

  return (
    <div className="flex flex-col gap-6">

      {/*En-tete*/}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-800">
          Mes projets
        </h1>
        <Button variant="bleu">
          + Nouveau projet
        </Button>
      </div>

      {/*Grille - Gradient couelur project*/}
      <div className="grid grid-cols-3 gap-4">
              {mockProjects.map(project => (
                <div key={project.id} className="relative flex flex-col gap-2">
      
                  <ProjectCard
                    project={project}
                    onClick={() => handleClick(project.id)}
                  />
      
                  {/* Dropdown — visible uniquement si openId correspond */}
                  {openId === project.id && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-md p-4 flex flex-col gap-3 text-sm text-gray-700 z-10">
      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deadline</span>
                        <span>{new Date(project.deadline).toLocaleDateString('fr-FR')}</span>
                      </div>
      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tâches</span>
                        <span>{project.tasks.done} / {project.tasks.total} terminées</span>
                      </div>
      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Membres</span>
                        <span>{project.members.length} personnes</span>
                      </div>
      
                      <div className="flex gap-2 mt-1">
                        <button className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs hover:bg-gray-50 transition-colors">
                          Modifier
                        </button>
                        {/* Croix suppression — visible Admin uniquement */}
                        {project.role === 'Admin' && (
                          <button className="flex-1 border border-red-200 text-red-400 rounded-lg py-1.5 text-xs hover:bg-red-50 transition-colors">
                            Supprimer
                          </button>
                        )}
                      </div>
      
                    </div>
                  )}
      
                </div>
              ))}
            </div>
      
          </div>

  )
}

export default Home