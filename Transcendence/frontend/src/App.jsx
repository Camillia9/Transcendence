// Gere les routes

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profil from './pages/Profil'
import Landing from './pages/Landing'
import Projet from './pages/Projet'
import Organisation from './pages/Organisation'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Test from "./pages/test"
import './App.css'

function App() {
  return (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/"  element={<Landing />} />
        {/* Pages auth — centrées, sans navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login"  element={<Login />} />
        </Route>
    		{/* Pages protégées — avec navbar + vérif connexion (avec ProtectedRoute) */}
    		<Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/projet" element={<Projet />} />
          <Route path="/Organisation" element={<Organisation />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/test" element={<Test />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profil" element={<Profil />} />
        	</Route>
      	</Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  )
}

export default App