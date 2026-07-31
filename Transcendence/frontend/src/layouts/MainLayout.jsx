import { IconPaletteFilled, IconBell, IconBulb, IconHome, IconLanguage, IconLayoutSidebar, IconMessageCircle, IconMessageCircle2, IconUsers, IconUserHeart } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NOTIF_ICONS } from "../data/notifIcons"
import { mockConversations } from "../data/mockConversations" 
import { timeAgo } from '../utils/timeAgo'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Logo from '../components/ui/Logo'
import Footer from '../components/ui/Footer'
import DesignSystem from '../pages/DesignSystem'
import { useSocket } from '../context/SocketContext'
import { getNotifs } from '../api/notifications'

function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [status, setStatus] = useState('online')       // 'online' ou 'offline'
  const [statusMenuOpen, setStatusMenuOpen] = useState(false) // gere l'ouverture de petit menu
  const unreadCount = notifications.filter(n => !n.read).length
  const unreadMessages = mockConversations.reduce((total, conv) => total + conv.unread, 0)
  // reduce parcourt les conversations en accumulant un total
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return
    socket.on('notification:new', (notif) => {
      setNotifications(prev => [notif, ...prev])
    })
    return () => socket.off('notification:new')
  }, [socket])

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifs()
        setNotifications(data)
      } catch (error) {
        console.error('Impossible de charger les notifications', error)
      }
    }
    loadNotifications()
  }, []) // Recharge une fois au demarage. Pas de boucle infini

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, read:true} : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({...notif, read: true})))
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setProfileMenuOpen(false)
      setNotifOpen(false)
    }
    if (profileMenuOpen || notifOpen)
      document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileMenuOpen, notifOpen])
  
  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col overflow-hidden">
      {/*Navbar du haut */}
      <nav className='bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between'>
        <Logo /> {/* qui sera a gauche. Tout le reste a droite:*/}
        
          {/*centre les elements horizontalement avec espace 4 entre chaque element*/}
          <div className='flex items-center gap-4'>

            {/*Cloche et son bouton rouge de notifs*/}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen) }}
                className='relative p-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <IconBell size={20} className="text-gray-500"/>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center bg-red-400 text-white text-[10px] font-semibold leading-none rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/*Panneau deroulant*/}
              {notifOpen && (
                <div className='absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-md w-80 flex flex-col overflow-hidden z-50'>
                  {/*En tete*/}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className='text-sm font-medium text-gray-700'>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAllAsRead()}}
                        className='text-xs text-primary-400 hover:text-primary-600 font-medium transition-colors'
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>

                  {/*Liste*/}
                  <div className='max-h-96 overflow-y-auto flex flex-col'>
                    {notifications.length === 0 ? (
                      <p className='px-4 py-6 text-sm text-gray-400 text-center'>Aucune notification</p>
                    ) : (
                      notifications.map(notif => {
                        const config = NOTIF_ICONS[notif.type]
                        const Icon = config?.icon
                        return(
                        <button
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id)
                          navigate(notif.link)
                          setNotifOpen(false)
                        }}
                        className="px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-b-0"
                        >
                          {Icon && <Icon size={18} className={`mt-0.5 shrink-0 ${config.color}`} />}
                          {/*Pastille bleu - Non lu*/}
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-primary-400'}`} />
                          <div className='flex flex-col'>
                            <span className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                              {notif.message}
                            </span>
                            <span className='text-xs text-gray-400 mt-0.5'>
                              {timeAgo(notif.createdAt)}
                            </span>

                          </div>
                        </button>
                        )
                      })
                    )}
                    </div>
                </div>
              )}
            </div>
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
                <Avatar username={user?.pseudo} size="sm" /> {/*  le ? c'est l'optional chaining. Si user est null (pas encore chargé), ça retourne undefined au lieu de planter. Toujours utiliser ça quand tu accèdes aux données du contexte. */}
                <span className='text-sm text-gray-700'>{user?.pseudo}</span>
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
      <div className='flex flex-1 min-h-0'>
        {/*Sidebar */}
        <aside className={`bg-white border-r border-gray-100 flex flex-col overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-14'}`}>
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

            <button
              onClick={() => navigate('/Organisation')}
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
            >
              <IconUsers size={18} className='shrink-0'/>
              {sidebarOpen && (
                <span>Organisations</span>
              )}
            </button>

            <button
              onClick={() => navigate('/friends')}
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
            >
              <IconUserHeart size={18} className='shrink-0'/>
              {sidebarOpen && (
                <span>Friends</span>
              )}
            </button>

          </div>

          <div className='flex flex-col gap-1 px-2 mt-auto mb-4'>
              <button
                onClick={() => navigate('/chat')}
                className='relative flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
              >
                {/* L'icône, avec le badge en pastille quand la sidebar est FERMÉE */}
                <div className="relative shrink-0">
                  <IconMessageCircle size={18} />
                  {/* Sidebar fermée + des non-lus → pastille rouge sur l'icône (comme la cloche) */}
                  {!sidebarOpen && unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-red-400 text-white text-[10px] font-semibold leading-none rounded-full">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
                
                {/* Le texte "Chat" + le compteur à droite quand la sidebar est OUVERTE */}
                {sidebarOpen && (
                  <>
                    <span>Chat</span>
                    {unreadMessages > 0 && (
                      <span className="ml-auto w-5 h-5 flex items-center justify-center bg-red-400 text-white text-[10px] font-semibold leading-none rounded-full">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </>
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

              <button
                className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
                onClick={() => navigate('/DesignSystem')}
              >
                <IconPaletteFilled size={18} className='shrink-0' />
                { sidebarOpen && (
                  <span>Design systeme</span>
                )}
              </button>

              <div className="relative">
              {/* Le bouton : le point prend la couleur du statut, le texte aussi */}
              <button
                onClick={(e) => { e.stopPropagation(); setStatusMenuOpen(!statusMenuOpen) }}
                className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
              >
                {/* Le point : vert si online, rouge si offline */}
                <span className={`w-4 h-4 rounded-full shrink-0 ${status === 'online' ? 'bg-green-400' : 'bg-red-400'}`} />
                { sidebarOpen && (
                  <span>{status === 'online' ? 'En ligne' : 'Hors ligne'}</span>
                )}
              </button>
              
              {/* Le menu déroulant, ouvert seulement si statusMenuOpen */}
              {statusMenuOpen && (
                <div className='absolute left-0 bottom-full mb-1 bg-white border border-gray-100 rounded-xl shadow-md w-40 flex flex-col overflow-hidden z-50'>
                  <button
                    onClick={(e) => { e.stopPropagation(); setStatus('online'); setStatusMenuOpen(false) }}
                    className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors'
                  >
                    <span className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
                    En ligne
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setStatus('offline'); setStatusMenuOpen(false) }}
                    className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors'
                  >
                    <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
                    Hors ligne
                  </button>
                </div>
              )}
            </div>

          </div>
        </aside>

        {/*Contenu de la page */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-auto flex flex-col">
          <div className='flex-1 p-6'>
            <Outlet/>
          </div>
          <Footer/>
        </main>
      </div>
    </div>
  )
}

export default MainLayout