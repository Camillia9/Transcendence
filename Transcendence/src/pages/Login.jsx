import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate() // La demande pour avoir acces a un outil de navigation
  const { login } = useAuth()

  const [username, setUsername] = useState(''); // Verif input de l'username
  const [password, setPassword] = useState(''); // Verif input du password
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  // --- Validation ---
  // validate() verifie juste les champs et retourne un objet. Elle ne modifie rien
  const validate = () => {
    const newErrors = {}

    if (!username.trim())
      newErrors.username = "Le nom d'utilisateur est requis"

    if (!password)
      newErrors.password = "Le mot de passe est requis"
    else if (password.length < 6)
      newErrors.password = "Minimum 6 caractères"

    return newErrors
  }

  // --- Soumission ---
  const handleSubmit = async () => {
    const newErrors = validate()

    //  s'il y a au moins une erreur, on met à jour errors et on stoppe avec return. Le reste de handleSubmit ne s'exécute pas.
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    // Simule un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    login({ username }) // appelle la fonction de ton AuthContext pour stocker l'utilisateur connecté.
    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div className="bg-gray-900 p-10 rounded-2xl w-96">
      
      <h2 className="text-white text-3xl font-bold mb-8 text-center">
        Connexion
      </h2>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          // e c'est l'événement, e.target c'est l'input, e.target.value c'est ce qu'il contient.
        />
        {errors.username && (
          <p className="text-red-400 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      <div className="mb-6">
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) =>setPassword(e.target.value)}
          // e c'est l'événement, e.target c'est l'input, e.target.value c'est ce qu'il contient.
        />
        {errors.password && (
          <p className="text-red-400 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <Button onClick={handleSubmit} loading={loading}>
        Se connecter
      </Button>

      <p
        onClick={() => navigate('/signup')}
        className="text-gray-500 text-center mt-4 cursor-pointer hover:text-white"
      >
        Pas encore de compte ? S'inscrire
      </p>

      <p
        onClick={() => navigate('/')}
        className="text-gray-500 text-center mt-4 cursor-pointer hover:text-white"
      >
        ← Retour
      </p>

    </div>
  )
}

export default Login