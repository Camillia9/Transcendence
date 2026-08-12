import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="px-6 py-3">
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-gray-400">
        <Link to="/privacy" className="hover:text-gray-600 transition-colors">
          Confidentialité
        </Link>
        <span className="text-gray-300">·</span>
        <Link to="/terms" className="hover:text-gray-600 transition-colors">
          Conditions d'utilisation
        </Link>
        <span className="text-gray-300">·</span>
        <Link to="/status" className="hover:text-gray-600 transition-colors">
          Statut
        </Link>
        <span className="text-gray-300">·</span>
        <span>© {new Date().getFullYear()} TaskBoard</span>
      </div>
    </footer>
  )
}

export default Footer