import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#ddeeff] flex items-center justify-center">
      {/* Motif de points — classe custom dans App.css */}
      <div className="dot-pattern absolute inset-0 opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout

// Outlet = l’endroit où React Router affiche la page enfant. Explications dans .txt