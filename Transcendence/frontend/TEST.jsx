{/* Cloche */}
<div className="relative">
  <button
    onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen) }}
    className='relative p-2 rounded-lg hover:bg-gray-100 transition-colors'
  >
    <IconBell size={20} className="text-gray-500" />
    {unreadCount > 0 && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
    )}
  </button>

  {/* Le panneau, affiché seulement si notifOpen */}
  {notifOpen && (
    <div className='absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-md w-80 flex flex-col overflow-hidden z-50'>
      {/* En-tête */}
      <div className='px-4 py-3 border-b border-gray-100 flex items-center justify-between'>
        <span className='text-sm font-medium text-gray-700'>Notifications</span>
        {unreadCount > 0 && (
          <span className='text-xs text-gray-400'>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Liste */}
      <div className='max-h-96 overflow-y-auto flex flex-col'>
        {notifications.length === 0 ? (
          <p className='px-4 py-6 text-sm text-gray-400 text-center'>Aucune notification</p>
        ) : (
          notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => { navigate(notif.link); setNotifOpen(false) }}
              className='px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-b-0'
            >
              {/* pastille bleue = non-lu */}
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-blue-400'}`} />
              <span className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                {notif.message}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )}
</div>