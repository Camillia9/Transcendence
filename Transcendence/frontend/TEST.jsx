import { createContext, useContext, useState, useEffect } from 'react'
import { useSocket } from './SocketContext'   // adapte le chemin à ton useSocket

// ─── 1. CRÉER le contexte ───
// Un "contexte" = un canal par lequel une donnée traverse tout l'arbre de
// composants sans passer par les props. On crée le canal ici (vide au départ).
const StatusContext = createContext()

// ─── 2. FOURNIR la donnée (le Provider) ───
// Ce composant enveloppera ton app. Il écoute le socket et maintient les statuts.
export function StatusProvider({ children }) {
  const socket = useSocket()

  // L'état central : un objet { username: "online" | "offline" }.
  // Vide au départ, il se remplit au fil des annonces du socket.
  const [statuses, setStatuses] = useState({})

  useEffect(() => {
    if (!socket) return   // le socket n'est pas encore prêt → on attend

    // Quand le back annonce un changement de statut (connexion OU déconnexion),
    // il envoie { userId, username, status }. On met à jour NOTRE objet.
    const handleStatus = ({ username, status }) => {
      // On repart de l'état précédent (prev) et on met à jour UNE clé :
      // celle de l'utilisateur concerné. Les autres restent intactes.
      setStatuses(prev => ({ ...prev, [username]: status }))
    }

    socket.on('user:status', handleStatus)

    // Nettoyage : quand ce Provider disparaît (ou que le socket change),
    // on se désabonne pour ne pas empiler les écouteurs. Même réflexe que
    // ton useEffect de notifications dans MainLayout.
    return () => socket.off('user:status', handleStatus)
  }, [socket])

  return (
    <StatusContext.Provider value={statuses}>
      {children}
    </StatusContext.Provider>
  )
}

// ─── 3. CONSOMMER la donnée (le hook) ───
// Un raccourci pour que n'importe quel composant lise les statuts en une ligne :
//   const statuses = useStatus()
export function useStatus() {
  return useContext(StatusContext)
}