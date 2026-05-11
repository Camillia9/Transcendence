import { createContext, useContext, useState } from 'react'

// 1. On crée la "prise murale"
const AuthContext = createContext(null)

// 2. Le Provider = le composant qui enveloppe toute l'app
//    et rend l'info disponible partout
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // null = pas connecté

  function login(userData) {
    setUser(userData) // on stocke l'utilisateur
  }

  function logout() {
    setUser(null) // on efface l'utilisateur
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Hook custom : au lieu d'écrire useContext(AuthContext) partout,
//    on écrit juste useAuth() — plus propre
export function useAuth() {
  return useContext(AuthContext)
}