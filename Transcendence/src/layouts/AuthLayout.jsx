import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Outlet />
    </div>
  )
}

export default AuthLayout

// Outlet = l’endroit où React Router affiche la page enfant. Explications dans .txt