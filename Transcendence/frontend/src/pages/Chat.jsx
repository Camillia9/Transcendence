// ═══════════════════════════════════════════════════════════════════════════
//  Chat.jsx — La page de messagerie
// ═══════════════════════════════════════════════════════════════════════════
//
//  Vue d'ensemble : cette page affiche une messagerie à deux colonnes.
//    - À GAUCHE  : la liste de toutes les conversations (Alice, Bob, un groupe…)
//    - À DROITE  : la conversation actuellement ouverte, avec ses messages
//                  et un champ pour en écrire un nouveau.
//
//  Toute la logique repose sur 3 "states" (des données que React surveille :
//  quand elles changent, React redessine l'écran automatiquement).
// ═══════════════════════════════════════════════════════════════════════════

import { IconUser, IconUsers, IconSend, IconMessage2, IconPlus, IconCheck, IconSearch } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
// useState = l'outil de React pour créer une "donnée surveillée".
// Chaque fois qu'on la modifie (via sa fonction set...), l'écran se redessine.

import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getConversations, getMessages, createConversation, markConversationRead } from '../api/conversations'
import { getUsers } from '../api/users'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

function toUiMsg(msg) {
  return {
    id: msg.id,
    author: msg.user?.pseudo ?? String(msg.userId),
    text: msg.content,
    time: new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
}

function Chat() {

  // ─────────────────────────────────────────────────────────────────────────
  //  LES 3 STATES (les 3 données que React surveille)
  // ─────────────────────────────────────────────────────────────────────────

  // STATE 1 — La liste complète des conversations.
  // On la met dans un state (au lieu de lire mockConversations directement)
  // PARCE QU'ON VA LA MODIFIER : à chaque message envoyé, on ajoute une ligne
  // à une conversation. Sans state, l'écran ne se redessinerait pas.
  //   - conversations       = la valeur actuelle (on la LIT)
  //   - setConversations    = la fonction pour la changer (on l'APPELLE)
  //   - useState([])        = la valeur de DÉPART (donc null: tableau vide)
  const [conversations, setConversations] = useState([])

  // STATE 2 — L'id de la conversation actuellement ouverte.
  // ATTENTION au choix : on stocke juste l'IDENTIFIANT (un nombre, ex: 1),
  // PAS la conversation entière. Pourquoi ? Parce que si on stockait la
  // conversation entière, on en aurait DEUX copies (celle-ci + celle dans
  // "conversations"), et il faudrait les garder synchronisées → source de bugs.
  // En ne gardant que l'id, il n'y a qu'une seule vérité : "conversations".
  // On part avec null car (comme fonction asynchrone) Au premier rendu, conversations vaut [] (tableau vide).
  const [activeId, setActiveId] = useState(null)

  // STATE 3 — Le texte en train d'être tapé dans le champ du bas.
  // "draft" = brouillon. Il se remplit lettre par lettre quand tu tapes,
  // et se vide quand tu envoies.
  const [draft, setDraft] = useState('')

  const [showNewConv, setShowNewConv] = useState(false)  // modale ouverte ?
  const [selectedIds, setSelectedIds] = useState([])     // ids des gens cochés (tableau = multi-sélection)
  const [userSearch, setUserSearch] = useState('')       // texte de recherche
  const [groupName, setGroupName] = useState('')         // nom du groupe (si 2+ sélectionnés)

  const socket = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    if (!socket) return
  
    socket.on('message:new', (msg) => {
      receiveMessage(msg.conversationId, toUiMsg(msg))
      if (msg.conversationId === activeId && msg.userId !== user?.id)
        markConversationRead(msg.conversationId).catch(() => {})
    })
  
    socket.on('conversation:new', (convo) => {
      const other = convo.conversationMembers?.find(m => m.userId !== user?.id)
      const normalized = {
        ...convo,
        name: convo.name ?? other?.user?.pseudo ?? 'Inconnu',
        type: convo.type?.toLowerCase() ?? 'private',
        messages: (convo.messages ?? []).map(toUiMsg)
      }
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

  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getConversations()
        const normalized = data.map(c => {
          const other = c.conversationMembers?.find(m => m.userId !== user?.id)
          return {
            ...c,
            name: c.name ?? other?.user?.pseudo ?? 'Inconnu',
            type: c.type?.toLowerCase() ?? 'private',
            messages: (c.messages ?? []).map(toUiMsg)
          }
        })
        setConversations(normalized)
        if (normalized.length > 0) setActiveId(normalized[0].id)
      } catch (error) {
        console.log('Impossible de charger les conversations', error)
      }
    }
    loadConversations()
  }, [])

  useEffect(() => {
    if (!activeId) return
    async function loadMessages() {
      try {
        const data = await getMessages(activeId)
        setConversations(prev => prev.map(c =>
          c.id === activeId ? { ...c, messages: data.map(toUiMsg) } : c
        ))
        await markConversationRead(activeId)
      } catch (e) {
        console.error('Impossible de charger les messages', e)
      }
    }
    loadMessages()
  }, [activeId])

  // On a l'id de la conversation active (STATE 2), mais pour l'AFFICHER il nous
  // faut la conversation COMPLÈTE. On la retrouve dans la liste avec .find() :
  // "parcours les conversations, donne-moi celle dont l'id === activeId".
  // Ceci se recalcule tout seul à chaque redessin — donc si activeId change
  // (clic sur une autre conv) ou si conversations change (nouveau message),
  // activeConversation est toujours à jour automatiquement.
  const activeConversation = conversations.find(c => c.id === activeId)

  // La liste des utilisateurs (mock pour l'instant), sans MOI (on ne se parle pas à soi-même)
  const [otherUsers, setOtherUsers] = useState([])
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

  // Filtrée par la recherche : on garde ceux dont le pseudo contient le texte tapé
  const filteredUsers = otherUsers.filter(u =>
    u.pseudo.toLowerCase().includes(userSearch.toLowerCase())
  )

  // Le TYPE est déduit du nombre de sélectionnés : 1 → privé, 2+ → groupe
  const convType = selectedIds.length > 1 ? 'group' : 'private'

  // Cocher / décocher un utilisateur dans la sélection
  const toggleUser = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)   // on retire
      : [...selectedIds, id]                // on ajoute
    
    setSelectedIds(next)
    
    // Si après ce changement on est repassé sous 2 personnes,
    // le mode "groupe" n'a plus lieu d'être → on efface le nom.
    if (next.length < 2) setGroupName('')
  }

  // Fermer la modale et tout réinitialiser
  const handleCloseNewConv = () => {
    setShowNewConv(false)
    setSelectedIds([])
    setUserSearch('')
    setGroupName('')
  }

  // TEMPORAIRE — on branchera le vrai back à l'étape 2
  const handleCreateConversation = async () => {
    try {
      const convo = await createConversation(selectedIds, convType, groupName)
      const other = convo.conversationMembers?.find(m => m.userId !== user?.id)
      const normalized = {
        ...convo,
        name: convo.name ?? other?.user?.pseudo ?? 'Inconnu',
        type: convo.type?.toLowerCase() ?? convType,
        messages: (convo.messages ?? []).map(toUiMsg)
      }
      setConversations(prev =>
        prev.some(c => c.id === normalized.id) ? prev : [normalized, ...prev]
      )
      setActiveId(normalized.id)
      handleCloseNewConv()
    } catch (e) {
      console.error('Impossible de creer la conversation', e)
    }
  }


  // ─────────────────────────────────────────────────────────────────────────
  //  FONCTION 1 — receiveMessage : AJOUTER UN MESSAGE À L'ÉCRAN
  // ─────────────────────────────────────────────────────────────────────────
  //
  //  C'EST LA FONCTION LA PLUS IMPORTANTE POUR DEV 3.
  //
  //  Son rôle : recevoir un message et l'ajouter à la bonne conversation.
  //  Elle prend 2 informations :
  //    - conversationId : DANS QUELLE conversation ranger le message
  //    - message        : le message lui-même (un objet {id, author, text, time})
  //
  //  Pourquoi une fonction séparée, et pas directement dans "envoyer" ?
  //  Parce qu'avec un WebSocket, les messages arrivent de DEUX origines :
  //    1. les messages que J'écris et que le serveur me renvoie
  //    2. les messages que les AUTRES écrivent et que le serveur me pousse
  //  Les deux doivent atterrir au même endroit : ICI. Donc on centralise
  //  "ajouter un message à l'écran" dans une seule fonction réutilisable.
  //
  const receiveMessage = (conversationId, message) => {
    // On reconstruit la liste des conversations :
    //   - la conversation ciblée (id === conversationId) est recopiée
    //     à l'identique { ...c } MAIS avec un message de plus dans ses messages
    //     [...c.messages, message] = "tous les anciens messages, PUIS le nouveau"
    //   - toutes les AUTRES conversations sont laissées telles quelles (: c)
    //
    // Note : on écrit "prev =>" au lieu d'utiliser "conversations" directement.
    // "prev" = la version la plus à jour de la liste au moment du calcul.
    // C'est une sécurité : quand des messages arrivent très vite du réseau
    // (plusieurs en même temps), ça garantit qu'on n'en perd aucun en route.
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, message] }  // la bonne conv : +1 message
        : c                                             // les autres : inchangées
    ))
  }


  // ─────────────────────────────────────────────────────────────────────────
  //  FONCTION 2 — handleSend : ENVOYER LE MESSAGE QUE JE VIENS DE TAPER
  // ─────────────────────────────────────────────────────────────────────────
  //
  //  Appelée quand je clique "Envoyer" ou que j'appuie sur Entrée.
  //
  const handleSend = () => {

    // Garde-fou : si le brouillon est vide (ou juste des espaces), on ne fait
    // rien. .trim() enlève les espaces autour ; une chaîne vide "" est "fausse"
    // pour le if, donc !draft.trim() = "si le message est vide, on sort".
    if (!draft.trim()) return

    // On fabrique l'objet message à partir de ce que j'ai tapé.
    const newMessage = {
      id: Date.now(),
      author: user?.pseudo ?? 'Moi',
      text: draft.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }

    if (socket) {
      socket.emit('message:send', { conversationId: activeId, content: newMessage.text })
    } else {
      receiveMessage(activeId, newMessage) // fallback sans socket
    }
    // receiveMessage(activeId, newMessage)
    //
    // ═══════════════════════════════════════════════════════════════════════

    // On vide le champ de saisie pour la prochaine frappe.
    setDraft('')
  }


  // ─────────────────────────────────────────────────────────────────────────
  //  L'AFFICHAGE (le JSX = le "HTML" de React)
  // ─────────────────────────────────────────────────────────────────────────
  return (

    // Conteneur principal : deux colonnes côte à côte (flex), hauteur fixée
    // à "l'écran moins 8rem" pour que ça tienne sans faire déborder la page.
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* ═══ COLONNE GAUCHE : la liste des conversations ═══ */}
      <div className="w-72 flex flex-col border-r border-gray-100 pr-2">

        {/* Bouton nouvelle conversation (fixe en haut) */}
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
            // On calcule 2 valeurs AVANT de dessiner (d'où les { } et le return explicite) :
            const lastMessage = conv.messages[conv.messages.length - 1]  // le dernier message
            const isActive = conv.id === activeId                        // cette conv est-elle ouverte ?

            return (
              <div
                key={conv.id} // React exige un "key" unique par élément d'une liste (ça l'aide à suivre qui est qui quand ça change)
                onClick={() => setActiveId(conv.id)} // AU CLIC sur une conversation : on change activeId pour son id. activeConversation se recalcule → la colonne droite change.
                // border-l-4 = barre d'accent à gauche, comme sur ProjectCard.
                // Active → fond navy très léger + barre navy. Sinon → barre invisible + survol gris.
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-l-4 transition-colors ${isActive
                  ? 'bg-primary-900/5 border-primary-600'
                  : 'border-transparent hover:bg-gray-100'
                  }`}
              >
                {/* Avatar : l'initiale sur fond navy clair (même style que tes tâches).
                    shrink-0 = "ne rétrécis jamais", sinon l'avatar s'écraserait. */}
                <div className="w-10 h-10 rounded-full bg-primary-900/15 flex items-center justify-center text-sm font-medium text-primary-900 shrink-0">
                  {conv.name[0]}
                </div>

                {/* Bloc texte : nom + aperçu. min-w-0 est OBLIGATOIRE ici (explication plus bas). */}
                <div className="flex-1 min-w-0">

                  {/* Ligne du haut : nom (avec icône) à gauche, heure à droite */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Icône selon le type : groupe = plusieurs personnes, privé = une seule */}
                      {conv.type === 'group'
                        ? <IconUsers size={14} className="text-gray-400 shrink-0" />
                        : <IconUser size={14} className="text-gray-400 shrink-0" />}
                      <p className="text-sm font-medium text-gray-800 truncate">{conv.name}</p>
                    </div>
                    {/* L'heure du dernier message (si la conv a au moins un message) */}
                    {lastMessage && (
                      <span className="text-xs text-gray-400 shrink-0">{lastMessage.time}</span>
                    )}
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

      {/* ═══ COLONNE DROITE : la conversation ouverte ═══ */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* --- En-tête : le nom de la conversation active --- */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              {/* Avatar, même style que dans la liste */}
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

            {/* --- Le fil de messages --- */}
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
            </div>

            {/* --- Le champ d'envoi (en bas) --- */}
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

      <Modal
        isOpen={showNewConv}
        onClose={handleCloseNewConv}
        title="Nouvelle conversation"
      >
        {/* Champ de recherche */}
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
                  {/* Coche si sélectionné */}
                  {isSelected && <IconCheck size={16} className="text-primary-600 shrink-0" />}
                </button>
              )
            })
          )}
        </div>

        {/* Nom du groupe : apparaît SEULEMENT si 2+ personnes sélectionnées */}
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