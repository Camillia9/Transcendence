import { useState } from "react";
import { mockProjects } from "../data/mockProjet"
import ProjectCard from "../components/ui/ProjectCard";
import Button from "../components/ui/Button"
import Modal from "../components/ui/Modal"

function Home() {
  // L'etat: Le projet qu'on veut supp
  const [projectToDelete, setProjectToDelete] = useState(null)
  // Lorsqu'on appuie sur le crayon. A modifier
  const handleEdit = (project) => {
    console.log("Editer", project.name)
  }
  // Lorsqu'on appuie sur la ben. Elle ne supprime pas le projet, le memorise juste pour afficher le modal de confirmation
  const handleDelete = (project) => {
    setProjectToDelete(project)
  }
  // Lorsqu'on confirme vouloir supp le projet sur le modal
  const confirmDelete = () => {
    console.log("Supprimer", projectToDelete.name)
    setProjectToDelete(null)
  }

  return (
    <div className="flex flex-col gap-6">
        {/*Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-800"> Mes projets </h1>
        <Button variant="bleu"> + Nouveau Projet </Button>
      </div>
        {/*Grille responsive*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProjects.map(project => (
            <ProjectCard
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            key={project.id}
            />
          ))}
        </div>
        {/*Modal */}
          {projectToDelete && (
            <Modal
              isOpen={!!projectToDelete}
              onClose={() => setProjectToDelete(null)}
              title="Supprimer ce projet ?"
            >
              <p> {projectToDelete.name} sera supprime definitivement </p>
              <div className="flex gap-2">
                <Button onClick={() => setProjectToDelete(null)}> Annuler </Button>
                <Button variant="danger" onClick={confirmDelete}> Supprimer </Button>
              </div>
            </Modal>
          )}
    </div>
  )
}

export default Home