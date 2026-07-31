import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

function Profil() {
  const { user, login } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.pseudo || '')

  const handleSave = () => {
    login({ ...user, username: newUsername })
    setIsModalOpen(false)
  }

  console.log(user)   // dans MainLayout ou Profil

  return (
    <div className="max-w-md mx-auto py-10 px-4">

      <Card className="flex items-center gap-4">
        <Avatar username={user?.pseudo} size="lg" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user?.pseudo}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setIsModalOpen(true)}>Modifier</Button>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modifier le profil"
      >
        <Input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Nouveau pseudo"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
      </Modal>

    </div>
  )
}

export default Profil