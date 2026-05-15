import { createContext, useContext, useState } from 'react'

// 1. On crée la "prise murale", une "boite vie" au depart
const AuthContext = createContext(null)

// 2. Le Provider = le composant qui enveloppe toute l'app, qui va remplir la boite
//    et rend l'info disponible partout
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // null = pas connecté

  function login(userData) {
    setUser(userData) // on stocke l'utilisateur
  }

  function logout() {
    setUser(null) // on efface l'utilisateur
  }

// Ceci fait: “tout ce qui est dans children peut accéder à ces données”
// value={{...}}, c'est ce que tu partages globalement
// Grace a ca, toute mon app peut acceder a user login logout sans passer de props
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

// ce fichier sert à créer un contexte global d’authentification qui permet de partager l’état de l’utilisateur (connecté ou non) et les fonctions login/logout dans toute l’application sans passer de props entre les composants.
// le Context API C’est ce qui permet de partager des données “globales” (comme l’utilisateur connecté) sans passer de props partout.
// Props = arguments d'un composant React
