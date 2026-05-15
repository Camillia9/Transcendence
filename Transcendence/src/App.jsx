// Gere les routes

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthLayout from './layouts/AuthLayout'
import Test from "./pages/test"

function App() {
  return (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Pages auth — centrées, sans navbar */}
        <Route element={<AuthLayout />}>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        {/* reste des routes... */}
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
  )
}

export default App