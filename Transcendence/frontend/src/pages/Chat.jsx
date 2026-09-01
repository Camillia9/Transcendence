import { IconUser, IconUsers, IconSend, IconMessage2, IconPlus, IconCheck, IconSearch } from '@tabler/icons-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getConversations, getMessages, createConversation, markConversationRead } from '../api/conversations'
import { getUsers } from '../api/users'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

// Transforme un message brut du back en message prêt pour l'affichage.
function toUiMsg(msg) {
  return {
    id: msg.id,
    author: msg.user?.pseudo ?? String(msg.userId),
    text: msg.content,
    time: new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
}

// Transforme une conversation brute du back en conversation prête pour l'UI.
// Utilisée au chargement, à la réception socket et à la création (d'où l'extraction).
function normalizeConversation(convo, userId, fallbackType = 'private') {
  const other = convo.conversationMembers?.find(m => m.userId !== userId)
  return {
    ...convo,
    name: convo.name ?? other?.user?.pseudo ?? 'Inconnu',
    type: convo.type?.toLowerCase() ?? fallbackType,
    messages: (convo.messages ?? []).map(toUiMsg),
  }
}

function Chat() {
  // State
  const [conversations, setConversations] = useState([]) // Liste complete des conversations
  const [activeId, setActiveId] = useState(null)   // conversation ouverte
  const [draft, setDraft] = useState('')           // message en cours de saisie
  const [otherUsers, setOtherUsers] = useState([]) // tous les users sauf moi

  // State de la modale "nouvelle conversation"
  const [showNewConv, setShowNewConv] = useState(false)
  const [selectedIds, setSelectedIds] = useState([]) // users cochés (multi-sélection)
  const [userSearch, setUserSearch] = useState('')
  const [groupName, setGroupName] = useState('')

  // Contexte & refs
  const socket = useSocket()
  const { user } = useAuth()
  const bottomRef = useRef(null) // point de repère en bas du fil, pour l'auto-scroll

  // Valeurs dérivées (recalculées à chaque rendu)
  const activeConversation = conversations.find(c => c.id === activeId)
  const convType = selectedIds.length > 1 ? 'group' : 'private' // 1 = privé, 2+ = groupe
  const filteredUsers = otherUsers.filter(u =>
    u.pseudo.toLowerCase().includes(userSearch.toLowerCase())
  )

  // Handlers

  // Ajoute un message à la bonne conversation. On passe par prev => ... pour
  // toujours partir de l'état le plus à jour (messages qui arrivent en rafale).
  const receiveMessage = (conversationId, message) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, message] }
        : c
    ))
  }

  const handleSend = () => {
    if (!draft.trim()) return
    const text = draft.trim()

    if (socket) {
      // Le message reviendra via l'event 'message:new' (source de vérité)
      socket.emit('message:send', { conversationId: activeId, content: text })
    } else {
      // Fallback sans socket : on l'affiche localement
      receiveMessage(activeId, {
        id: Date.now(),
        author: user?.pseudo ?? 'Moi',
        text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      })
    }
    setDraft('')
  }

  const toggleUser = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id]
    setSelectedIds(next)
    if (next.length < 2) setGroupName('') // repassé en privé : plus de nom de groupe
  }

  const handleCloseNewConv = () => {
    setShowNewConv(false)
    setSelectedIds([])
    setUserSearch('')
    setGroupName('')
  }

  const handleCreateConversation = async () => {
    try {
      const convo = await createConversation(selectedIds, convType, groupName)
      const normalized = normalizeConversation(convo, user?.id, convType)
      setConversations(prev =>
        prev.some(c => c.id === normalized.id) ? prev : [normalized, ...prev]
      )
      setActiveId(normalized.id)
      handleCloseNewConv()
    } catch (e) {
      console.error('Impossible de créer la conversation', e)
    }
  }

  // Effects

  // Chargement initial des conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getConversations()
        const normalized = data.map(c => normalizeConversation(c, user?.id))
        setConversations(normalized)
        if (normalized.length > 0) setActiveId(normalized[0].id)
      } catch (error) {
        console.error('Impossible de charger les conversations', error)
      }
    }
    loadConversations()
  }, [])

  // Liste des utilisateurs (pour la modale), sans moi
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers()
        setOtherUsers(data.filter(u => u.id !== user?.id))
      } catch (e) {
        console.error('Impossible de charger les utilisateurs', e)
      }
    }
    loadUsers()
  }, [user])

  // Chargement des messages de la conversation ouverte + marquage comme lu
  useEffect(() => {
    if (!activeId) return
    async function loadMessages() {
      try {
        const data = await getMessages(activeId)
        setConversations(prev => prev.map(c =>
          c.id === activeId ? { ...c, messages: data.map(toUiMsg) } : c
        ))
        await markConversationRead(activeId)
        setConversations(prev => prev.map(c =>
          c.id === activeId ? { ...c, unreadCount: 0 } : c
        ))
      } catch (e) {
        console.error('Impossible de charger les messages', e)
      }
    }
    loadMessages()
  }, [activeId])

  // Écoute temps réel : nouveaux messages + nouvelles conversations
  useEffect(() => {
    if (!socket) return

    socket.on('message:new', (msg) => {
      receiveMessage(msg.conversationId, toUiMsg(msg))
      const fromSomeoneElse = msg.userId !== user?.id
      if (msg.conversationId === activeId && fromSomeoneElse) {
        markConversationRead(msg.conversationId).catch(() => {})
      } else if (fromSomeoneElse) {
        // message dans une autre conv : +1 sur le badge non-lu
        setConversations(prev => prev.map(c =>
          c.id === msg.conversationId ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 } : c
        ))
      }
    })

    socket.on('conversation:new', (convo) => {
      const normalized = normalizeConversation(convo, user?.id)
      setConversations(prev =>
        prev.some(c => c.id === normalized.id) ? prev : [normalized, ...prev]
      )
      socket.emit('conversation:join', { conversationId: normalized.id })
    })

    return () => {
      socket.off('message:new')
      socket.off('conversation:new')
    }
  }, [socket, user, activeId])

  // Auto-scroll : redescend en bas quand un message arrive (la longueur change)
  // ou quand on ouvre une autre conversation. Pas de variable "messages" isolée :
  // les messages vivent dans activeConversation.messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length, activeId])

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* COLONNE GAUCHE : liste des conversations */}
      <div className="w-72 flex flex-col border-r border-gray-100 pr-2">
        <button
          onClick={() => setShowNewConv(true)}
          className="flex items-center justify-center gap-2 mb-2 px-3 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <IconPlus size={16} />
          Nouvelle conversation
        </button>

        {/* La liste des conversations (seule elle scrolle) */}
        <div className="flex flex-col gap-1 overflow-y-auto">
          {conversations.map(conv => {
            const lastMessage = conv.messages[conv.messages.length - 1]
            const isActive = conv.id === activeId

            return (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-l-4 transition-colors ${isActive
                  ? 'bg-primary-900/5 border-primary-600'
                  : 'border-transparent hover:bg-gray-100'
                  }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-900/15 flex items-center justify-center text-sm font-medium text-primary-900 shrink-0">
                  {conv.name[0]}
                </div>
                
                {/* Bloc texte : nom + aperçu. */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {conv.type === 'group'
                        ? <IconUsers size={14} className="text-gray-400 shrink-0" />
                        : <IconUser size={14} className="text-gray-400 shrink-0" />}
                      <p className="text-sm font-medium text-gray-800 truncate">{conv.name}</p>
                    </div>
                    <div className='flex items-center gap-1.5 shrink-0'>
                      {lastMessage && (
                        <span className="text-xs text-gray-400 shrink-0">{lastMessage.time}</span>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="min-w-5 h-5 flex items-center justify-center bg-primary-600 text-white text-[10px] font-semibold rounded-full px-1">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ligne du bas : aperçu du dernier message, ou "Aucun message" si vide */}
                  <p className="text-xs text-gray-400 truncate">
                    {lastMessage?.text || 'Aucun message'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* COLONNE DROITE : conversation ouverte  */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* En-tête */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-primary-900/15 flex items-center justify-center text-sm font-medium text-primary-900 shrink-0">
                {activeConversation.name[0]}
              </div>
              <div>
                <h2 className="text-lg font-medium text-primary-900 leading-tight">
                  {activeConversation.name}
                </h2>
                <p className="text-xs text-gray-400">
                  {activeConversation.type === 'group' ? 'Conversation de groupe' : 'Conversation privée'}
                </p>
              </div>
            </div>

            {/* Fil de messages */}
            <div className="flex-1 flex flex-col gap-3 py-4 overflow-y-auto">
              {activeConversation.messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                  <IconMessage2 size={40} className="text-gray-200" />
                  <p className="text-sm text-gray-400">Aucun message pour l'instant</p>
                  <p className="text-xs text-gray-300">Envoie le premier message !</p>
                </div>
              ) : (
                activeConversation.messages.map(msg => {
                  const isMine = msg.author === user?.pseudo
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-xs ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      {!isMine && activeConversation.type === 'group' && (
                        <span className="text-xs text-gray-400 mb-0.5 px-1">{msg.author}</span>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm ${isMine
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-300 mt-0.5 px-1">{msg.time}</span>
                    </div>
                  )
                })
              )}
              {/* Repère d'auto-scroll : doit rester le dernier enfant du conteneur scrollable */}
              <div ref={bottomRef} />
            </div>

            {/* Champ d'envoi */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Écris un message..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-600 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim()}
                className="flex items-center gap-1.5 bg-primary-600 text-white rounded-xl px-4 text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <IconSend size={16} />
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <p className="m-auto text-sm text-gray-400">Sélectionne une conversation</p>
        )}
      </div>

      {/* MODALE : nouvelle conversation */}
      <Modal
        isOpen={showNewConv}
        onClose={handleCloseNewConv}
        title="Nouvelle conversation"
      >
        {/*Champs de recherche*/}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 mb-3">
          <IconSearch size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="flex-1 text-sm focus:outline-none"
          />
        </div>

        {/* Liste des utilisateurs, cliquable */}
        <div className="max-h-64 overflow-y-auto flex flex-col gap-1 mb-3">
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun utilisateur trouvé</p>
          ) : (
            filteredUsers.map(u => {
              const isSelected = selectedIds.includes(u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-primary-900/5' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Avatar initiale */}
                  <div className="w-8 h-8 rounded-full bg-primary-900/15 flex items-center justify-center text-xs font-medium text-primary-900 shrink-0">
                    {u.pseudo[0]}
                  </div>
                  <span className="flex-1 text-sm text-gray-800">{u.pseudo}</span>
                  {isSelected && <IconCheck size={16} className="text-primary-600 shrink-0" />}
                </button>
              )
            })
          )}
        </div>

        {/* Nom du groupe : seulement si 2+ personnes sélectionnées */}
        {convType === 'group' && (
          <div className="flex flex-col gap-1 mb-3">
            <label className="text-sm text-gray-500">Nom du groupe</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Équipe Frontend"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-600"
            />
          </div>
        )}
        {/* Boutons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCloseNewConv}>Annuler</Button>
          <Button
            variant="primary"
            onClick={handleCreateConversation}
            disabled={selectedIds.length === 0}
          >
            {convType === 'group' ? 'Créer le groupe' : 'Démarrer la conversation'}
          </Button>
        </div>
      </Modal>

    </div>
  )
}

export default Chat
