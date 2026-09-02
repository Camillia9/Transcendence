// Gere les routes

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profil from './pages/Profil'
import Landing from './pages/Landing'
import KanbanPage from './pages/KanbanPage'
import Organisation from './pages/Organisation'
import Chat from './pages/Chat'
import FriendsPage from './pages/FriendsPage'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Test from "./pages/test"
import './App.css'
import LegalPage from './pages/LegalPage'
import DesignSystem from './pages/DesignSystem'
import StatusPage from './pages/StatusPage'
import { SocketProvider } from './context/SocketContext'
import OAuthSuccess from './components/ui/OAuthSuccess'

function App() {
return (
<AuthProvider>
<SocketProvider>
<BrowserRouter>
<Routes>
<Route path="/" element={<Landing />} />
<Route path="/status" element={<StatusPage />} />
<Route path="/privacy" element={<LegalPage type="privacy" />} />
<Route path="/terms" element={<LegalPage type="terms" />} />
{/* Pages auth — centrées, sans navbar */}
<Route element={<AuthLayout />}>
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/oauth-success" element={<OAuthSuccess />} />
</Route>
{/* Pages protégées — avec navbar + vérif connexion (avec ProtectedRoute) */}
<Route element={<ProtectedRoute />}>
<Route element={<MainLayout />}>
<Route path="/home" element={<Home />} />
<Route path="/projet/:id" element={<KanbanPage />} />
<Route path="/Organisation" element={<Organisation />} />
<Route path="/profil" element={<Profil />} />
<Route path="/designsystem" element={<DesignSystem />} />
<Route path="/chat" element={<Chat />} />
<Route path="/friends" element={<FriendsPage />} />
</Route>
</Route>
</Routes>
</BrowserRouter>
</SocketProvider>
</AuthProvider>
  )
}

export default App
