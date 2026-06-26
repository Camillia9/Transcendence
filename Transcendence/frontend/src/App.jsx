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
import LegalPage from './pages/LegalPage'
import { privacyPolicy, termsOfService } from './data/legalContent'

function App() {
  return (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/"  element={<Landing />} />
        <Route path="/privacy" element={<LegalPage content={privacyPolicy}/>} />
        <Route path="/terms" element={<LegalPage content={termsOfService}/>} />
        {/* Pages auth — centrées, sans navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login"  element={<Login />} />
        </Route>
    		{/* Pages protégées — avec navbar + vérif connexion (avec ProtectedRoute) */}
    		<Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/projet" element={<Projet />} />
          <Route path="/Organisation" element={<Organisation />} />
          <Route path="/profil" element={<Profil />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/test" element={<Test />} />
            <Route path="/dashboard" element={<Dashboard />} />
        	</Route>
      	</Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  )
}

export default App