import { Outlet, Link } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex gap-6">
        <Link to="/" className="font-semibold hover:text-blue-400 transition">Accueil</Link>
        <Link to="/about" className="font-semibold hover:text-blue-400 transition">À propos</Link>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}