import { Outlet } from 'react-router-dom'
import Footer from '../components/ui/Footer'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#ddeeff] flex flex-col relative">
      {/* Motif de points — classe custom dans App.css */}
      <div className="dot-pattern absolute inset-0 opacity-50 pointer-events-none" />
      {/* Zone centrale : prend tout l'espace dispo et centre la carte dedans */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <Outlet />
      </div>
      {/* Footer collé en bas, au-dessus du motif de points */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

export default AuthLayout

// Outlet = l’endroit où React Router affiche la page enfant. Explications dans .txt