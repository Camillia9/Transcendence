import { useNavigate } from 'react-router-dom'
import { useState } from "react"
import Modal from "../components/ui/Modal"
import Button from '../components/ui/Button'
import Card from "../components/ui/Card"
import Avatar from "../components/ui/Avatar"
import Badge from "../components/ui/Badge"
import Logo from '../components/ui/Logo'

function test() {
//  const navigate = useNavigate()
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [loading, setLoading] = useState(false)

  const handleClick = () => {
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }
  

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      
      <h1 className="text-white text-6xl font-bold mb-8">
        TEST
      </h1>

      <Logo />

          {/*Usage basique*/}
      <Card>
        <h2>Mon titre</h2>
        <p>Du contenu quelconque</p>
      </Card>
      
      {/* Avec customisation*/}
      <Card className="bg-blue-50 col-span-2">
        <h2>Une grande card bleue</h2>
      </Card>

      {/* Avec photo */}
      <Avatar src="https://i.pravatar.cc/150" username="johndoe" size="lg" />

      {/* Sans photo */}
      <Avatar username="johndoe" size="md" />

      {/* tout petit */}
      <Avatar size="sm" />

      <Badge>Default</Badge>
      <Badge variant="green">En ligne</Badge>
      <Badge variant="red">Hors ligne</Badge>
      <Badge variant="yellow">AFK</Badge>
      <Badge variant="blue">Admin</Badge>

      {/* Avec une icône
	      mr-1 : petit espace entre txt et emoji */}
      <Badge variant="green">
        <span className="mr-1">🟢</span> En ligne
      </Badge>

		<Button onClick={() => setIsModalOpen(true)}>
        Ouvrir la modal
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modifier le profil"
      >
        <p className="text-gray-600">Le contenu de ta modal ici.</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button onClick={() => setIsModalOpen(false)}>Sauvegarder</Button>
        </div>
      </Modal>

      <Button
        onClick={handleClick}
        loading={loading}
      >
        Cliquer
      </Button>

    </div>

  )
}

export default test
