import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

// Garde de route. Ex: “Si l’utilisateur n’est pas connecté → je le redirige vers /login. Sinon → je lui montre la page”
// Navigate permet de rediriger automatiquement vers une autre route.
// useAuth recupere l'utilisateur connecte
// outlet = tout ce qui est à l’intérieur de la route protégée.
// Exemple: ici Outlet = <Dashboard />
/*{<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>}*/