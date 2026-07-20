import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { loginRequest } from '../api/auth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'

function Login() {
  const navigate = useNavigate() // La demande pour avoir acces a un outil de navigation
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!identifier.trim())
      newErrors.identifier = "Ton nom d'utilisateur ou email est requis"

    if (!password)
      newErrors.password = "Le mot de passe est requis"

    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Appel API : envoie identifiant + mot de passe, reçoit { token, user }
      const data = await loginRequest({ identifier, password })

      // 1. On range le token dans le navigateur → le "bracelet" de client.js
      localStorage.setItem('token', data.token)

      // 2. On mémorise l'utilisateur dans l'app (AuthContext)
      login(data.user)

      // 3. On entre dans l'app
      navigate('/home')
    } catch (error) {
      // Le back a refusé (mauvais identifiants, ou serveur injoignable)
      setErrors({ global: "Identifiant ou mot de passe incorrect" })
    } finally {
      setLoading(false)
    }
  }


  return (
    <AuthCard
      title="Connexion"
      subtitle="Content de te revoir"
      swapText="Pas encore de compte ? S'inscrire"
      swapTo="/signup"
    >
      <div className="flex flex-col gap-3 w-full">

        {/* Identifiant */}
        <div>
          <Input
            variant='auth'
            type="text"
            placeholder="Nom d'utilisateur ou email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            light
          />
          {errors.identifier && (
            <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <Input
            variant='auth'
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {errors.global && (
          <p className="text-red-500 text-sm text-center">{errors.global}</p>
        )}

        <Button onClick={handleSubmit} loading={loading}>
          Se connecter
        </Button>

      </div>
    </AuthCard>
  )
}

export default Login