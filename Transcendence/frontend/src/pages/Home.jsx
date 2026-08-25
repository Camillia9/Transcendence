import { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom'
import ProjectCard from "../components/ui/ProjectCard";
import Button from "../components/ui/Button"
import Modal from "../components/ui/Modal"
import Input from "../components/ui/Input";
import { getHealth } from "../api/health";
import { getProjects, updateProject, deleteProject, createProject } from "../api/projects";
import { getMyOrganisations } from "../api/organisations";
import { useWorkspaceSocket } from "../context/SocketContext";

function Home() {
  // L'etat: Le projet qu'on veut supp
  const [projectToDelete, setProjectToDelete] = useState(null)
  // L'etat: Le projet qu'on veut add ou edit
  const [showNewProject, setShowNewProject] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)
  
  // Touts les etats utile pour le bouton "nouveau projet"
  const [newName, setNewName]       = useState('') // string
  const [newDeadline, setNewDeadline] = useState('') // string
  const [newMembers, setNewMembers] = useState('') // string
  const [newErrors, setNewErrors]   = useState({}) // Objet

  // etat pour lire le tableau et pouvoir le modifier
  const [projects, setProjects] = useState([])

  // Besoin des orgas pour creer un projet 
  const [organisations, setOrganisations] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState('')

  // Provisoire
  const navigate = useNavigate()
  
  // Lorsqu'on appuie sur le crayon. A modifier
  const handleEdit = (project) => {
    setProjectToEdit(project)
    setNewName(project.title)
    setNewDeadline(project.deadline ? project.deadline.slice(0, 10) : '')
    setShowNewProject(true)
  }
  // Lorsqu'on appuie sur la ben. Elle ne supprime pas le projet, le memorise juste pour afficher le modal de confirmation
  const handleDelete = (project) => {
    setProjectToDelete(project)
  }
  // Lorsqu'on confirme vouloir supp le projet sur le modal
  const confirmDelete = async () => {
    try {
      await deleteProject(projectToDelete.id)
      setProjects(projects.filter(p => p.id !== projectToDelete.id)) // garde tout le projets (le tableau) sauf celui-ci
      setProjectToDelete(null)
    } catch (error) {
      console.error('Impossible de supprimer le projet', error)
    }
  }

  const handleCloseNewProject = () => {
    // Reinitialise tout les etats lorsque le projet est cree ou qu'on ferme avant
    setNewName('')
    setNewDeadline('')
    setNewMembers('')
    setNewErrors({})
    setProjectToEdit(null) // remet le mode edition a null
    setShowNewProject(false) // ferme la modal
  }

  // vérifier les champs et retourner un objet avec les erreurs trouvées.
  const validateNewProject = () => {
    // errors est un objet ({}). Il peut stocker plusieurs strings.
    // ici il stockera les strings si les champs de newProject sont invalides
    const errors = {}

    // Si le nameProject ne contient rien ou que des espaces on stock l'erreur dans errors
    if (!newName.trim()) 
      errors.title = "Le nom du projet est obligatoire"

    if (!projectToEdit && !selectedOrgId)
      errors.org = "Choisis une organisation"

    if (newDeadline) { // Si on met une Deadline
      const today = new Date() // recupere plusieurs infos comme la date l'heure etc
      today.setHours(0, 0, 0, 0) // met l'heure a 0 (miniuit) ce jour-ci.
      const chosen = new Date(newDeadline) // transforme string en vrai date -> ("2026-06-01" => 1 juin 2026)
      if (chosen < today) // Si la date entre dans la deadline est inferieur a la date actuelle: erreur
        errors.deadline = "Deadline inferieur a aujourd'hui"
    }
    // return l'objet complet
    return errors
  }

  // Fonction appelle lorsqu'on soumet le formulaire du nouveauProjet
  const handleSubmitProject = async () => {
    /*Object.keys prend un objet et renvoie un tableau contenant les noms de ses proprietes
    // ex:  const errors = {
      name: "Le nom est obligatoire",
      email: "Email invalide",
      } 
      Object.keys(errors) = ["name", "email"]
      // */
    const errors = validateNewProject()
    if (Object.keys(errors).length > 0) {
      setNewErrors(errors)
      return
    }
    if (projectToEdit) {
      // MODE EDITION (remplace projet existant)
      // Updated : recopie tout le projet d'origine en modifiant seulelemt :
      try {
        const updated = await updateProject(projectToEdit.id, {
          title: newName.trim(),
          deadline: newDeadline || null
        })
        setProjects(projects.map(p =>
          p.id === projectToEdit.id ? { ...p, ...updated } : p // « pars de l'ancien projet complet, puis les écrase avec les champs revenus du back ».
        ))
        handleCloseNewProject()
      } catch (error) {
        setNewErrors({ global: "Impossible de modifier le projet" })
        return
      }
      // Sert a parcourir tout les projets pour modifier celui qu'on veut. 
    } else {
      try {
        await createProject(selectedOrgId, {
          title: newName.trim(),
          description: null,
          deadline: newDeadline || null,
        })
        const data = await getProjects()
        setProjects(data)
        handleCloseNewProject()
      } catch (error) {
        setNewErrors({ global: "Impossible de creer le projet" })
      }
    }
  }

  // BRANCHEMENT BACK/FRONT:
  // état local pour stocker ce que le back nous répond.
  // TEST de depart. A supp des qu'on aurra remplace les mock par de vraie donnees
  const [health, setHealth] = useState('...')

  // useEffect avec [] : s'execute une fois au montage.
  useEffect(() => {
    // fction asynchrone : "Fonction qui contient des attentes"
    async function checkBackend() {
      try {
        const data = await getHealth()
        setHealth(data.status)
      } catch (error) {
        // Si le back ne repond pas on le note plutot que de planter 
        setHealth('injoignable')
      }
    }
    checkBackend()
  }, [])

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects()
        setProjects(data)
      } catch(error) {
        console.error('Impossible de charger les projets', error)
      }
    }

    async function loadOrganisations() {
      try {
        const data = await getMyOrganisations()
        // DEBUG :
        //console.log('ORGAS HOME', data)
        setOrganisations(data)
      } catch (error) {
        console.error('Impossible de charger les organisations', error)
      }
    }

    loadProjects(), loadOrganisations()
  }, [])

  const workspaceSocket = useWorkspaceSocket()
  useEffect(() => {
    if (!workspaceSocket) return
    const handleMemberRemoved = ({ projectId }) => {
      setProjects(prev => prev.filter(p => p.id !== projectId))
    }
    const handleMemberAdded = (project) => {
      setProjects(prev => prev.some(p => p.id === project.id) ? prev : [project, ...prev])
    }
    workspaceSocket.on('project:member-removed', handleMemberRemoved)
    workspaceSocket.on('project:member-added', handleMemberAdded)
    return () => {
      workspaceSocket.off('project:member-removed', handleMemberRemoved)
      workspaceSocket.off('project:member-added', handleMemberAdded)
    }
  }, [workspaceSocket])

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-primary-700">
        État du backend :{' '}
        <Link to="/status" className="font-medium text-primary-800 underline-offset-2 hover:underline">
          {health}
        </Link>
      </p>
        {/*Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-primary-900"> Mes projets </h1>
        <Button onClick={() => setShowNewProject(true)}>
          + Nouveau Projet
        </Button>
      </div>
        {/*Grille responsive*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            key={project.id}
            />
          ))}
        </div>
        {/*Modal supprimer un projet */}
          {projectToDelete && (
            <Modal
              isOpen={!!projectToDelete}
              onClose={() => setProjectToDelete(null)}
              title="Supprimer ce projet ?"
            >
              <p> {projectToDelete.title} sera supprime definitivement </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setProjectToDelete(null)}> Annuler </Button>
                <Button variant="danger" onClick={confirmDelete}> Supprimer </Button>
              </div>
            </Modal>
          )}
          {/*Modal Cree un nouveau Projet OU edit un projet (utilisations de la meme modal)*/}
          <Modal
            isOpen={showNewProject}
            onClose={handleCloseNewProject}
            title={projectToEdit ? "Modifier le projet" : "Nouveau Projet"}
          >
            {/* Choix de l'organisation (création uniquement) */}
            {!projectToEdit && (
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-sm text-gray-500">
                  Organisation *
                </label>
                
                {organisations.filter(org => org.myRole === 'Admin').length === 0 ? (
                  // Si l'utilisateur n'est admin dans auccune orga :
                  <p className="text-sm text-gray-400">
                    Vous devez être admin d'une organisation pour créer un projet.
                  </p>
                ) : (
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none"
                  >
                    <option value="">Choisir une organisation</option>
                    {organisations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                )}

                {newErrors.org && (
                  <p className="text-red-400 text-sm mt-1">{newErrors.org}</p>
                )}
              </div>
            )}
            {/*Entree du NameProject */}
            <div className="flex flex-col gap-1 mb-4">
              {/*Label = tire du champs*/}
              <label className="text-sm text-gray-500"> 
                Nom du projet *
              </label>
              {/*Input = zone saisie */}
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom du projet"
                light
              />
              {newErrors.name && (
                <p className="text-red-400 text-sm mt-1">{newErrors.title}</p>
              )}
            </div>
            {/*Entree de la Deadline */}
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm text-gray-500">
                Deadline
              </label> 
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                light
              />
              {newErrors.deadline && (
                <p className="text-red-400 text-sm mt-1">{newErrors.deadline}</p>
              )}
            </div>

            {newErrors.global && (
              <p className="text-red-400 text-sm mb-2">{newErrors.global}</p>
            )}

            {/*Boutons Annuler/Cree le projet */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseNewProject}> Annuler </Button>
              <Button variant="primary" onClick={handleSubmitProject}>
                {projectToEdit ? "Enregistrer" : "Cree le projet"}
              </Button>
            </div>
          </Modal>
            
    </div>
  )
}

export default Home