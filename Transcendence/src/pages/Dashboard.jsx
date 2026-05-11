import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1 className="text-4xl font-bold">Dashboard 🎮</h1>
      <p className="mt-3 text-gray-400">Connecté en tant que <span className="text-white font-semibold">{user.email}</span></p>
      <button
        onClick={logout}
        className="mt-6 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition"
      >
        Se déconnecter
      </button>
    </div>
  )
}