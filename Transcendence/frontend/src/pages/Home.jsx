import { useState } from "react";
import { mockProjects } from "../data/mockProjet"
import { useNavigate } from 'react-router-dom'
import ProjectCard from "../components/ui/ProjectCard";
import Button from "../components/ui/Button"
import Modal from "../components/ui/Modal"
import Input from "../components/ui/Input";

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

  // etat pour lire le tableau mock et pouvoir le modifier
  const [projects, setProjects] = useState(mockProjects)

  // Provisoire
  const navigate = useNavigate()
  
  // Lorsqu'on appuie sur le crayon. A modifier
  const handleEdit = (project) => {
    setProjectToEdit(project)
    setNewName(project.name)
    setNewDeadline(project.deadline || '')
    setNewMembers(project.members.join(', ')) // join() modie le tableau ["alice", "bob"] en ["alice, bob"]. Inverse de split
    setShowNewProject(true)
  }
  // Lorsqu'on appuie sur la ben. Elle ne supprime pas le projet, le memorise juste pour afficher le modal de confirmation
  const handleDelete = (project) => {
    setProjectToDelete(project)
  }
  // Lorsqu'on confirme vouloir supp le projet sur le modal
  const confirmDelete = () => {
    setProjects(projects.filter(p => p.id !== projectToDelete.id)) // garde tout le projets (le tableau) sauf celui-ci
    setProjectToDelete(null)
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
      errors.name = "Le nom du projet est obligatoire"

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
  const handleSubmitProject = () => {
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
      const updated = {
        ...projectToEdit,
        name: newName.trim(),
        deadline: newDeadline || null,
        members: newMembers ? newMembers.split(',').map(m => m.trim()).filter(m => m !== '') : [],
      }
      setProjects(projects.map(p => p.id === projectToEdit.id ? updated : p))
      // Sert a parcourir tout les projets pour modifier celui qu'on veut. 
    } else {
      // Cree l'objet du nouveau projet (Localement. Remplacer par un appel API)
      const newProject = {
        id: Date.now(), // Date.now() renvoie le nb de ms ecoule depuis 1970. Sert ici a avoir des ID forcement differents'
        name: newName.trim(), // recupere le name en retirant tout les espaces autour
        deadline: newDeadline || null, // Utilise deadline si existante, sinon = null
        tasks: { done: 0, total: 0 }, // on commence avec 0 taches
        members: newMembers ? newMembers.split(',').map(m => m.trim()).filter(m => m !== '') : [],
        // Si newMembers n'est pas une chaine vide (donc continent des memnres) :
        // split(): on tansforme la string de membres en tableau ("John, Eliott, ML" ==> ["John", " Eliott", " ML"])
        // map() : parcourt chaque element du tableau et les transforme. Ici trim donc supprime les espaces
        // filter() : garde seulement les elements respectant la condition. Ici supp les chaines vides
        // Sinon elle est vide donc cree un tableau vide
        role: 'Manager' // Celui qui cree le projet est forcement Manager
      }
      setProjects([newProject, ...projects]) // creation newTableau sans toucher aux autres
    }
    handleCloseNewProject()

  }

  return (
    <div className="flex flex-col gap-6">
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
              <p> {projectToDelete.name} sera supprime definitivement </p>
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
                <p className="text-red-400 text-sm mt-1">{newErrors.name}</p>
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

            {/*Entree des membres */}
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm text-gray-500">
                Ajout de membres (separation par virgule !)
              </label>
              <Input
                type="text"
                value={newMembers}
                onChange={(e) => setNewMembers(e.target.value)}
                placeholder="Clara, Vincent, Remy"
                light
              />
            </div>

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