import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

const SOCKET_URL = 'https://localhost:8443'

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [workspaceSocket, setWorkspaceSocket] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!user || !token) {
      setSocket(null)
      setWorkspaceSocket(null)
      return
    }

    // Chat = messagerie + status + rooms notif user
    const chat = io(SOCKET_URL, {
      path: '/socket.io/',
      auth: { token },
    })
    setSocket(chat)

    // Workspace = kanban (project/task events)
    const workspace = io(SOCKET_URL, {
      path: '/workspace/socket.io/',
      auth: { token },
    })
    setWorkspaceSocket(workspace)

    return () => {
      chat.disconnect()
      workspace.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, workspaceSocket }}>
      {children}
    </SocketContext.Provider>
  )
}

/** Socket chat (messages, status, notifications rooms) */
export function useSocket() {
  return useContext(SocketContext)?.socket ?? null
}

/** Socket workspace (kanban) */
export function useWorkspaceSocket() {
  return useContext(SocketContext)?.workspaceSocket ?? null
}
