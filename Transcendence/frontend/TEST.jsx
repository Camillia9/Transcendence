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