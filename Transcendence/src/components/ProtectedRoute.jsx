import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  // Si pas connecté → redirige vers /login
  if (!user) return <Navigate to="/login" replace />

  // Sinon → affiche la page demandée
  return children
}