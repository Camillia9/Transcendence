import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from "../components/ui/Card"
import Avatar from "../components/ui/Avatar"
import Badge from "../components/ui/Badge"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      
      <h1 className="text-white text-6xl font-bold mb-8">
        TRANSCENDENCE
      </h1>
      
      <Button onClick={() => navigate('/login')}>
        Commencer
      </Button>

    </div>

  )
}

export default Home