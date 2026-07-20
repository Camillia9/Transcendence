import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)

  // --- Validation ---
  const validate = () => {
    const newErrors = {}

    if (!identifier.trim())
      newErrors.identifier = "Ton nom d'utilisateur ou email est requis"

    if (!password)
      newErrors.password = "Le mot de passe est requis"

    return newErrors
  }

  // --- Soumission ---
  const handleSubmit = async () => {
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    // Simule un appel API — remplacé plus tard par le vrai back
    await new Promise(resolve => setTimeout(resolve, 1000))

    login({ username: identifier }) // placeholder — le vrai user viendra du back
    navigate('/home')
    setLoading(false)
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
            type="text"
            placeholder="Nom d'utilisateur ou email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {errors.identifier && (
            <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <Button onClick={handleSubmit} loading={loading}>
          Se connecter
        </Button>

      </div>
    </AuthCard>
  )
}

export default Login



function Input({ placeholder, type, value, onChange, variant = "light" }) {
  const variants = {
    light: "bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary-600",
    auth:  "bg-white border border-gray-300 text-primary-900 placeholder-gray-500 focus:border-primary-600",
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-lg outline-none transition-colors ${variants[variant]}`}
    />
  )
}

export default Input