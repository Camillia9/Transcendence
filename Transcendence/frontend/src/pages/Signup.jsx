import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signupRequest } from '../api/auth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'


function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [username, setUsername]               = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors]                   = useState({})
  const [loading, setLoading]                 = useState(false)

  // --- Validation ---
  const validate = () => {
    const newErrors = {}

    if (!username.trim())
      newErrors.username = "Le nom d'utilisateur est requis"
    else if (username.length < 3)
      newErrors.username = "Minimum 3 caractères"

    if (!email.trim())
      newErrors.email = "L'email est requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Format d'email invalide"

    if (!password)
      newErrors.password = "Le mot de passe est requis"
    else if (password.length < 6)
      newErrors.password = "Minimum 6 caractères"

    if (!confirmPassword)
      newErrors.confirmPassword = "Confirme ton mot de passe"
    else if (confirmPassword !== password)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"

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

    try {
      // Appel API : envoie les champs d'inscription, reçoit { token, user }
      const data = await signupRequest({ pseudo: username, email, password })

      localStorage.setItem('token', data.token)
      login(data.user)
      navigate('/home')
    } catch (error) {
      setErrors({ global: "Impossible de créer le compte. Cet email est peut-être déjà utilisé." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Inscription"
      subtitle="Crée ton compte"
      swapText="Déjà inscrit ? Se connecter"
      swapTo="/login"
    >
      <div className="flex flex-col gap-3 w-full">

        {/* Nom d'utilisateur */}
        <div>
          <Input
            variant="auth"
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Input
            variant="auth"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <Input
            variant="auth"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirmation */}
        <div>
          <Input
            variant="auth"
            type="password"
            placeholder="Confirme le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {errors.global && (
          <p className="text-red-500 text-sm text-center">{errors.global}</p>
        )}

        <Button onClick={handleSubmit} loading={loading}>
          Créer mon compte
        </Button>

      </div>
    </AuthCard>
  )
}

export default Signup









//function Signup() {
//  const navigate = useNavigate()
//  const { login } = useAuth()

//  const [username, setUsername]               = useState('')
//  const [email, setEmail]                     = useState('')
//  const [password, setPassword]               = useState('')
//  const [confirmPassword, setConfirmPassword] = useState('')
//  const [errors, setErrors]                   = useState({})
//  const [loading, setLoading]                 = useState(false)

//  // --- Validation ---
//  const validate = () => {
//    const newErrors = {}

//    if (!username.trim())
//      newErrors.username = "Le nom d'utilisateur est requis"
//    else if (username.length < 3)
//      newErrors.username = "Minimum 3 caractères"

//    if (!email.trim())
//      newErrors.email = "L'email est requis"
//    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) /*vérifie qu'il y a un @ et un . au bon endroit*/
//      newErrors.email = "Format d'email invalide"

//    if (!password)
//      newErrors.password = "Le mot de passe est requis"
//    else if (password.length < 6)
//      newErrors.password = "Minimum 6 caractères"

//    if (!confirmPassword)
//      newErrors.confirmPassword = "Confirme ton mot de passe"
//    else if (confirmPassword !== password)
//      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"

//    return newErrors
//  }

//  // --- Soumission ---
//  const handleSubmit = async () => {
//    const newErrors = validate()

//    if (Object.keys(newErrors).length > 0) {
//      setErrors(newErrors)
//      return
//    }

//    setLoading(true)
//    setErrors({})

//    // Simule un appel API
//    await new Promise(resolve => setTimeout(resolve, 1000))

//    login({ username, email }) /* stock le username et l'email avec AuthContext */
//    navigate('/dashboard')
//    setLoading(false)
//  }

//  return (
//    <div className="bg-gray-900 p-10 rounded-2xl w-96">

//      <h2 className="text-white text-3xl font-bold mb-8 text-center">
//        Inscription
//      </h2>

//      {/* Username */}
//      <div className="mb-4">
//        <Input
//          type="text"
//          placeholder="Nom d'utilisateur"
//          value={username}
//          onChange={(e) => setUsername(e.target.value)}
//        />
//        {errors.username && (
//          <p className="text-red-400 text-sm mt-1">{errors.username}</p>
//        )}
//      </div>

//      {/* Email */}
//      <div className="mb-4">
//        <Input
//          type="email"
//          placeholder="Email"
//          value={email}
//          onChange={(e) => setEmail(e.target.value)}
//        />
//        {errors.email && (
//          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
//        )}
//      </div>

//      {/* Password */}
//      <div className="mb-4">
//        <Input
//          type="password"
//          placeholder="Mot de passe"
//          value={password}
//          onChange={(e) => setPassword(e.target.value)}
//        />
//        {errors.password && (
//          <p className="text-red-400 text-sm mt-1">{errors.password}</p>
//        )}
//      </div>

//      {/* Confirm password */}
//      <div className="mb-6">
//        <Input
//          type="password"
//          placeholder="Confirme le mot de passe"
//          value={confirmPassword}
//          onChange={(e) => setConfirmPassword(e.target.value)}
//        />
//        {errors.confirmPassword && (
//          <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
//        )}
//      </div>

//      <Button onClick={handleSubmit} loading={loading}>
//        Créer mon compte
//      </Button>

//      <p
//        onClick={() => navigate('/login')}
//        className="text-gray-500 text-center mt-4 cursor-pointer hover:text-white"
//      >
//        Déjà un compte ? Se connecter
//      </p>

//    </div>
//  )
//}

//export default Signup