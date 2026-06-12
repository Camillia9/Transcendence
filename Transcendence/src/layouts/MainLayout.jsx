import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Logo from '../components/ui/Logo'
import { IconBell, IconBulb, IconHome, IconLanguage, IconLayoutSidebar, IconMessageCircle, IconMessageCircle2 } from '@tabler/icons-react'

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
    navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = () => setProfileMenuOpen(false)
    if (profileMenuOpen)
      document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileMenuOpen])
  
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
                onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(!profileMenuOpen)}}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Avatar username={user?.username} size="sm" /> {/*  le ? c'est l'optional chaining. Si user est null (pas encore chargé), ça retourne undefined au lieu de planter. Toujours utiliser ça quand tu accèdes aux données du contexte. */}
                <span className='text-sm text-gray-700'>{user?.username}</span>
              </div>
              {profileMenuOpen && (
                <div className='absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-md w-48 flex flex-col overflow-hidden z-50'>
                  <button
                    className='px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors'
                    onClick={() => { navigate('/profil'); setProfileMenuOpen(false)}}
                  >
                    Editer le profil
                  </button>
                  <button
                    className='px-4 py-3 text-sm text-red-400 hover:bg-red-50 text-left transition-colors'
                    onClick={() => { handleLogout(); setProfileMenuOpen(false)}}
                  >
                    Deconnexion
                  </button>
                </div>
              )}

            </div>

          </div>
      </nav>

      {/*Corps : sidebar + contenu */}
      {/*Le flex les met côte à côte, le flex-1 fait que ce bloc prend toute la hauteur restante sous la navbar.*/}
      <div className='flex flex-1'>
        {/*Sidebar */}
        <aside className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-14'}`}>
          <button
            className='p-4 hover:bg-gray-100 transition-colors self-start'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <IconLayoutSidebar size={20} className='text-gray-500'/>
          </button>

          <div className='flex flex-col gap-1 px-2'>
            <button
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
              onClick={() => navigate('/home')}
            >
              <IconHome size={18} className='shrink-0'/>
                { sidebarOpen && (
                  <span> Home </span>
                )}
            </button>
          </div>

          <div className='flex flex-col gap-1 px-2 mt-auto mb-4'>
              <button
                className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
              >
                <IconMessageCircle size={18} className='shrink-0'/>
                { sidebarOpen && (
                  <span>Chat</span>
                )}
              </button>
              <button
                className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
              >
                <IconBulb size={18} className='shrink-0'/>
                { sidebarOpen && (
                  <span>Tutoriel</span>
                )}
              </button>
              <button className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'>
                <span className="w-4 h-4 rounded-full bg-green-400 shrink-0" />
                { sidebarOpen && (
                  <span>En ligne</span>
                )}
              </button>
          </div>
        </aside>

        {/*Contenu de la page */}
        <main className="flex-1 p-6 min-w-0 overflow-x-auto">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}

export default MainLayout