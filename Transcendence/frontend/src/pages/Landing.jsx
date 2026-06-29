import { IconLayoutKanban } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/ui/Footer'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-primary-50">
      {/*Responsive*/}

      {/* Motif de points — classe custom dans App.css */}
      <div className="dot-pattern absolute inset-0 opacity-50 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 text-primary-500 font-medium text-lg">
          <IconLayoutKanban size={28} />
          TaskBoard
        </div>
        <span
          onClick={() => navigate('/login')}
          className="text-sm text-primary-800 opacity-70 cursor-pointer hover:opacity-100 transition-opacity"
        >
          Se connecter
        </span>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-1 items-center px-24 gap-16">

        {/* Gauche — illustration */}
        <div className="flex-1 flex justify-center">
          <img
            src="/src/assets/illustration.svg"
            alt="Illustration TaskBoard"
            className="w-170 h-170 object-contain"
          />
        </div>

        {/* Droite — texte + CTA */}
        <div className="flex-1 flex flex-col gap-5">
          <p className="text-6xl font-medium text-primary-900 leading-snug">
            Gérez vos projets,<br />ensemble.
          </p>
          <p className="text-base text-primary-700 leading-relaxed">
            Organisez vos tâches en équipe, suivez l'avancement en direct et communiquez sans quitter l'outil.
          </p>

          <div className="flex gap-3 flex-wrap">
            <span className="bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full">
              Kanban temps réel
            </span>
            <span className="bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full">
              Chat intégré
            </span>
            <span className="bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full">
              Gestion des rôles
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 w-fit bg-primary-700 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors"
          >
            Commencer gratuitement
          </button>

        </div>

      </div>
      <Footer />
    </div>
  )
}