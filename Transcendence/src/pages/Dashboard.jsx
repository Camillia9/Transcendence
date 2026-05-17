import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <Card className="flex items-center gap-4">
        <Avatar username={user?.username} size="lg" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Bonjour, {user?.username} 👋
          </h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard