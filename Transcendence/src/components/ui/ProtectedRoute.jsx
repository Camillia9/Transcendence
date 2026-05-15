import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  // Si pas connecté → redirige vers /login
  if (!user) return <Navigate to="/login" replace />

  // Sinon → affiche la page demandée
  return children
}

// Garde de route. Ex: “Si l’utilisateur n’est pas connecté → je le redirige vers /login. Sinon → je lui montre la page”
// Navigate permet de rediriger automatiquement vers une autre route.
// useAuth recupere l'utilisateur connecte
// children = tout ce qui est à l’intérieur de la route protégée.
// Exemple: ici children = <Dashboard />
/*{<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>}*/