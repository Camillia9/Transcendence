import { createContext, useContext, useState } from 'react'

// 1. On crée la "prise murale", une "boite vie" au depart
const AuthContext = createContext(null)

// Au démarrage : on relit le localStorage
// Si un user y est stocké, on le récupère directement
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { {/* on passe une fonction d'initilisation que React execute QU'UNE seul fois au demarrage pour calculer la valeur initilale */}
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  function login(userData) {
    setUser(userData) // on stocke l'utilisateur
	localStorage.setItem('user', JSON.stringify(userData)) // on sauvegarde
  }

  function logout() {
    setUser(null)
	localStorage.removeItem('user') // on efface l'utilisateur
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
// On save avec localStorage pour retrouver toutes nos infos apres un refresh. Sans cela on repart de zero a la page login
// le Context API C’est ce qui permet de partager des données “globales” (comme l’utilisateur connecté) sans passer de props partout.
// Props = arguments d'un composant React
