import { IconPaletteFilled, IconBell, IconHome, IconLayoutSidebar, IconMessageCircle, IconUsers, IconUserHeart } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NOTIF_ICONS } from "../data/notifIcons"
import { timeAgo } from '../utils/timeAgo'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Logo from '../components/ui/Logo'
import Footer from '../components/ui/Footer'
import { useSocket } from '../context/SocketContext'
import { getNotifs, markNotifRead, markAllNotifsRead } from '../api/notifications'
import { getUnreadCount } from '../api/conversations'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'
import { updateProfile } from '../api/users'
import { STATUS_DOT, STATUS_VALUES, formatStatus } from '../utils/status'
import { useTranslation } from 'react-i18next'

function MainLayout() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [statut, setStatut] = useState(user?.statut ?? 'Available')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.isRead).length
  const [unreadMessages, setUnreadMessages] = useState(0)
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return
    socket.on('notification:new', (notif) => {
      setNotifications(prev => [notif, ...prev])
    })
    socket.on('messages:unread-count', ({ count }) => {
      setUnreadMessages(count)
    })
    return () => {
      socket.off('notification:new')
      socket.off('messages:unread-count')
    }
  }, [socket])

  useEffect(() => {
    async function loadUnreadCount() {
      try {
        const { count } = await getUnreadCount()
        setUnreadMessages(count)
      } catch (error) {
        console.error('Impossible de charger les messages non lus', error)
      }
    }
    loadUnreadCount()
  }, [])

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifs()
        setNotifications(data ?? [])
      } catch (error) {
        console.error('Impossible de charger les notifications', error)
      }
    }
    loadNotifications()
  }, [])
  
  useEffect(() => {
    const handleClickOutside = () => {
      setProfileMenuOpen(false)
      setNotifOpen(false)
    }
    if (profileMenuOpen || notifOpen)
      document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [profileMenuOpen, notifOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const markAsRead = async (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? {...notif, isRead: true} : notif
    ))
    try { await markNotifRead(id) } catch {}
  }

  const markAllAsRead = async () => {
    setNotifications(notifications.map(notif => ({...notif, isRead: true})))
    try { await markAllNotifsRead() } catch {}
  }

  async function handleStatutChange(value) {
    setStatut(value)
    setStatusMenuOpen(false)
    try {
      await updateProfile({ statut: value })
    } catch (e) {
      console.error('Maj statut echouee', e)
      setStatut(statut)
    }
  }

  function formatNotification(notif) {
    const actor = notif.actor?.pseudo
    switch (notif.type) {
      case 'Assignment':
        return notif.task?.title
          ? t('mainLayout.notifications.assignmentWithTask', { actor, title: notif.task.title })
          : t('mainLayout.notifications.assignment', { actor })
      case 'InvitationSent':
        return t('mainLayout.notifications.invitationSent', { actor })
      case 'InvitationAccepted':
        return t('mainLayout.notifications.invitationAccepted', { actor })
      case 'InvitationDeclined':
        return t('mainLayout.notifications.invitationDeclined', { actor })
      case 'ProjectDeleted':
        return t('mainLayout.notifications.projectDeleted', { actor })
      case 'RemovedFromOrga':
        return t('mainLayout.notifications.removedFromOrga', { actor })
      case 'RemovedFromProject':
        return notif.project?.title
          ? t('mainLayout.notifications.removedFromProjectWithTitle', { actor, title: notif.project.title })
          : t('mainLayout.notifications.removedFromProject', { actor })
      case 'OrgaUpdated':
        return t('mainLayout.notifications.orgaUpdated', { actor })
      case 'MemberRemoved':
        return t('mainLayout.notifications.memberRemoved', { actor })
      case 'ProjectUpdated':
        return notif.project?.title
          ? t('mainLayout.notifications.projectUpdatedWithTitle', { actor, title: notif.project.title })
          : t('mainLayout.notifications.projectUpdated', { actor })
      case 'OrgaDeleted':
        return t('mainLayout.notifications.orgaDeleted', { actor })
      case 'RoleChanged':
        return notif.organisation?.name
          ? t('mainLayout.notifications.roleChangedWithOrg', { actor, orgName: notif.organisation.name })
          : t('mainLayout.notifications.roleChanged', { actor })
      case 'InvitationCancelled':
        return notif.organisation?.name
          ? t('mainLayout.notifications.invitationCancelledWithOrg', { actor, orgName: notif.organisation.name })
          : t('mainLayout.notifications.invitationCancelled', { actor })
      case 'DeplacementTache':
        return notif.task?.title
          ? t('mainLayout.notifications.taskMovedWithTitle', { actor, title: notif.task.title })
          : t('mainLayout.notifications.taskMoved', { actor })
      case 'MemberLeftOrga':
        return notif.organisation?.name
          ? t('mainLayout.notifications.memberLeftOrgaWithOrg', { actor, orgName: notif.organisation.name })
          : t('mainLayout.notifications.memberLeftOrga', { actor })
      case 'ProjectRoleUpdated':
        return notif.project?.name
          ? t('mainLayout.notifications.projectRoleUpdatedWithTitle', { actor, title: notif.project.title })
          : t('mainLayout.notifications.projectRoleUpdated', { actor })
      default:
        return t('mainLayout.notifications.default')
    }
  }

  function getNotificationLink(notif) {
    switch (notif.type) {
      case 'Assignment':
      case 'DeplacementTache': {
        const projectId = notif.projectId ?? notif.project?.id
        return projectId ? `/projet/${projectId}` : null
      }

      case 'ProjectDeleted':
      case 'RemovedFromProject':
        return '/home'

      case 'RemovedFromOrga':
      case 'RoleChanged':
      case 'InvitationSent':
      case 'InvitationAccepted':
      case 'InvitationDeclined':
      case 'InvitationCancelled':
      case 'MemberLeftOrga':
      case 'MemberRemoved':
      case 'OrgaUpdated':
      case 'ProjectRoleUpdated':
        return '/Organisation'

      default:
        return null
    }
  }
  
  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col overflow-hidden">
      <nav className='bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between'>
        <Logo />
        
          <div className='flex items-center gap-4'>

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

              {notifOpen && (
                <div className='absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-md w-80 flex flex-col overflow-hidden z-50'>
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className='text-sm font-medium text-gray-700'>{t('mainLayout.notificationsTitle')}</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markAllAsRead()}}
                        className='text-xs text-primary-400 hover:text-primary-600 font-medium transition-colors'
                      >
                        {t('mainLayout.markAllRead')}
                      </button>
                    )}
                  </div>

                  <div className='max-h-96 overflow-y-auto flex flex-col'>
                    {notifications.length === 0 ? (
                      <p className='px-4 py-6 text-sm text-gray-400 text-center'>{t('mainLayout.noNotifications')}</p>
                    ) : (
                      notifications.map(notif => {
                        const config = NOTIF_ICONS[notif.type]
                        const Icon = config?.icon
                        return(
                        <button
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id)
                          const link = getNotificationLink(notif)
                          if (link) navigate(link)
                          setNotifOpen(false)
                        }}
                        className="px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-b-0"
                        >
                          {Icon && <Icon size={18} className={`mt-0.5 shrink-0 ${config.color}`} />}
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-primary-400'}`} />
                          <div className='flex flex-col'>
                            <span className={`text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                              {formatNotification(notif)}
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
            <LanguageSwitcher/>

            <div className="relative">
              <div 
                onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(!profileMenuOpen)}}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Avatar src={user?.avatar} username={user?.pseudo} size="sm" />
                <span className='text-sm text-gray-700'>{user?.pseudo}</span>
              </div>
              {profileMenuOpen && (
                <div className='absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-md w-48 flex flex-col overflow-hidden z-50'>
                  <button
                    className='px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors'
                    onClick={() => { navigate('/profil'); setProfileMenuOpen(false)}}
                  >
                    {t('mainLayout.editProfile')}
                  </button>
                  <button
                    className='px-4 py-3 text-sm text-red-400 hover:bg-red-50 text-left transition-colors'
                    onClick={() => { handleLogout(); setProfileMenuOpen(false)}}
                  >
                    {t('mainLayout.logout')}
                  </button>
                </div>
              )}

            </div>

          </div>
      </nav>

      <div className='flex flex-1 min-h-0'>
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
                  <span>{t('mainLayout.sidebar.home')}</span>
                )}
            </button>

            <button
              onClick={() => navigate('/Organisation')}
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
            >
              <IconUsers size={18} className='shrink-0'/>
              {sidebarOpen && (
                <span>{t('mainLayout.sidebar.organisations')}</span>
              )}
            </button>

            <button
              onClick={() => navigate('/friends')}
              className='flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
            >
              <IconUserHeart size={18} className='shrink-0'/>
              {sidebarOpen && (
                <span>{t('mainLayout.sidebar.friends')}</span>
              )}
            </button>

          </div>

          <div className='flex flex-col gap-1 px-2 mt-auto mb-4'>
              <button
                onClick={() => navigate('/chat')}
                className='relative flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
              >
                <div className="relative shrink-0">
                  <IconMessageCircle size={18} />
                  {!sidebarOpen && unreadMessages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-red-400 text-white text-[10px] font-semibold leading-none rounded-full">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </div>
                
                {sidebarOpen && (
                  <>
                    <span>{t('mainLayout.sidebar.chat')}</span>
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
                onClick={() => navigate('/designsystem')}
              >
                <IconPaletteFilled size={18} className='shrink-0' />
                { sidebarOpen && (
                  <span>{t('mainLayout.sidebar.designSystem')}</span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setStatusMenuOpen(!statusMenuOpen) }}
                  className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm'
                >
                  <span className={`w-4 h-4 rounded-full shrink-0 ${STATUS_DOT[statut] ?? 'bg-gray-300'}`} />
                  {sidebarOpen && <span>{formatStatus(statut, t)}</span>}
                </button>

                {statusMenuOpen && (
                  <div className='absolute left-0 bottom-full mb-1 bg-white border border-gray-100 rounded-xl shadow-md w-40 flex flex-col overflow-hidden z-50'>
                    {STATUS_VALUES.map(value => (
                      <button
                        key={value}
                        onClick={(e) => { e.stopPropagation(); handleStatutChange(value) }}
                        className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left transition-colors'
                      >
                        <span className={`w-3 h-3 rounded-full shrink-0 ${STATUS_DOT[value]}`} />
                        {sidebarOpen && formatStatus(value, t)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

          </div>
        </aside>

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