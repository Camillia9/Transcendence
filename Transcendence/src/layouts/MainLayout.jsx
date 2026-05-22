import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'

function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white text-blue-600">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">

        {/* Gauche — logo */}
        <span
          onClick={() => navigate('/')}
          className="font-bold text-lg tracking-widest cursor-pointer text-black"
        >
          TRANSCENDENCE
        </span>

        {/* Centre — liens */}
        <div className="flex items-center gap-6">
          <span
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            Accueil
          </span>
          <span
            //onClick={() => navigate('/profil')}
            className="text-gray-400 hover:text-white cursor-pointer transition-colors"
          >
            Profil
          </span>
        </div>

        {/* Droite — utilisateur connecté */}
        <div className="flex items-center gap-3">
          <Badge variant="green">🟢 En ligne</Badge>
          <Avatar username={user?.username} size="sm" /> {/*  le ? c'est l'optional chaining. Si user est null (pas encore chargé), ça retourne undefined au lieu de planter. Toujours utiliser ça quand tu accèdes aux données du contexte. */}
          <span className="text-sm text-gray-300">{user?.username}</span>
          <span
            onClick={handleLogout} /* logout() vide le contexte, puis navigate('/login') redirige. Les deux ensemble, sinon l'utilisateur resterait sur une page protégée avec un user null. */
            className="text-gray-500 hover:text-red-400 text-sm cursor-pointer transition-colors"
          >
            Déconnexion
          </span>
        </div>

      </nav>

      {/* Contenu de la page */}
      <main className="p-6">
        <Outlet />
      </main>

    </div>
  )
}

export default MainLayout