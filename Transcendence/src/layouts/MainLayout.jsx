import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Logo from '../components/ui/Logo'
import { IconBell, IconLanguage } from '@tabler/icons-react'

//function MainLayout() {
//  const { user, logout } = useAuth()
//  const navigate = useNavigate()
//  const [sidebarOpen, setSidebarOpen] = useState(true)

//  const handleLogout = () => {
//    logout()
//    navigate('/login')
//  }

//  return (
//    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">

//      {/* Navbar */}
//      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">

//        {/* Gauche — logo */}
//        <span
//          onClick={() => navigate('/')}
//          className="font-bold text-lg tracking-widest cursor-pointer text-black"
//        >
//          TaskBoard
//        </span>

//        {/* Centre — liens */}
//        <div className="flex items-center gap-6">
//          <span
//            onClick={() => navigate('/')}
//            className="text-gray-400 hover:text-white cursor-pointer transition-colors"
//          >
//            Accueil
//          </span>
//          <span
//            //onClick={() => navigate('/profil')}
//            className="text-gray-400 hover:text-white cursor-pointer transition-colors"
//          >
//            Profil
//          </span>
//        </div>

//        {/* Droite — utilisateur connecté */}
//        <div className="flex items-center gap-3">
//          <Badge variant="green">🟢 En ligne</Badge>
//          <Avatar username={user?.username} size="sm" /> {/*  le ? c'est l'optional chaining. Si user est null (pas encore chargé), ça retourne undefined au lieu de planter. Toujours utiliser ça quand tu accèdes aux données du contexte. */}
//          <span className="text-sm text-gray-300">{user?.username}</span>
//          <span
//            onClick={handleLogout} /* logout() vide le contexte, puis navigate('/login') redirige. Les deux ensemble, sinon l'utilisateur resterait sur une page protégée avec un user null. */
//            className="text-gray-500 hover:text-red-400 text-sm cursor-pointer transition-colors"
//          >
//            Déconnexion
//          </span>
//        </div>

//      </nav>

//      {/* Contenu de la page */}
//      <main className="p-6">
//        <Outlet />
//      </main>

//    </div>
//  )
//}

//export default MainLayout

function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/*Navbar du haut */}
      <nav className='bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between'>
        <Logo /> {/* qui sera a gauche. Tout le reste a droite:*/}
        
          {/*Cloche */}
          <div className='flex items-center gap-4'> {/*centre les elements horizontalement avec espace 4 entre chaque element*/}
            <button className='relative p-2 rounded-lg hover:bg-gray-100 transition-colors'>
              <IconBell size={20} className="text-gray-500"/>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" /> {/* Persistant pour l'instant. A modif plus tard pour qu'il apparaisse que lorsquil ya des notifs*/}
            </button>
          
            {/*Langue */}
            <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-500 font-medium'>
              <IconLanguage size={20} className='text-gray-500'/>
            </button>

            {/*Profil */}
            <div className="relative"> {/*relative car le menu deroulant absolute doit se positionner par raport a lui*/}
              {/* toogle ('!') sur le menu deroulant*/}
              <div 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Avatar username={user?.username} size="sm" /> {/*  le ? c'est l'optional chaining. Si user est null (pas encore chargé), ça retourne undefined au lieu de planter. Toujours utiliser ça quand tu accèdes aux données du contexte. */}
                <span className='text-sm text-gray-700'>{user?.username}</span>
              </div>
            </div>

            {/*CONTINUER ICI LE MENU DEROULANT */}

          </div>
      </nav>

      {/*Corps : sidebar + contenu */}
      {/*Le flex les met côte à côte, le flex-1 fait que ce bloc prend toute la hauteur restante sous la navbar.*/}
      <div className='flex flex-1'>
        {/*Sidebar */}
        <aside className='bg-white border-r border-gray-100 flex flex-col p-4'>
          sidebar
        </aside>

        {/*Contenu de la page */}
        <main className='flex-1 p-6'>
          <Outlet/>
        </main>
      </div>
    </div>
  )
}

export default MainLayout