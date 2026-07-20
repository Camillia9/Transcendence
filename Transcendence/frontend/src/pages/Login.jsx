import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
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

    // Simule un appel API — remplacé plus tard par le vrai back
    await new Promise(resolve => setTimeout(resolve, 1000))

    login({ username: identifier}) // placeholder — le vrai user viendra du back
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

        <Button onClick={handleSubmit} loading={loading}>
          Se connecter
        </Button>

      </div>
    </AuthCard>
  )
}

export default Login






  //  return (
  //    <Card className="w-96 flex flex-col items-center gap-6 p-10">
      
  //      {/* Logo */}
  //            <Logo />
  
  //      {/* Titre */}
  //      <div className="text-center">
  //        <h2 className="text-2xl font-medium text-primary-900">Connexion</h2>
  //        <p className="text-sm text-primary-700 mt-1">
  //          Choisis ton moyen de connexion</p>
  //      </div>
  
  //      {/* Boutons OAuth */}
  //      <div className="flex flex-col gap-3 w-full">
  
  //        <Button variant="ghost" onClick={handleGoogle}>
  //          <span className="flex items-center justify-center gap-2">
  //            <IconBrandGoogle size={18} />
  //            Continuer avec Google
  //          </span>
  //        </Button>
  
  //        <Button variant='ghost' onClick={handleGithub}>
  //          <span className="flex items-center justify-center gap-2">
  //            <IconBrandGithub size={18} />
  //            Continuer avec GitHub
  //          </span>
  //        </Button>
  
  //      </div>
  
  //      {/* Note */}
  //      <p className="text-xs text-center text-primary-700">
  //        Première fois ? Un compte sera créé automatiquement.
  //      </p>
  
  //      {/* Retour */}
  //      <p
  //        onClick={() => navigate('/')}
  //        className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
  //      >
  //        ← Retour
  //      </p>
  
  //      {/*A retirer - Nav. Home*/}
  //      <p
  //        onClick={() => navigate('/home')} 
  //        className='text-2xl text-black'>
  //          HOME
  //      </p>
  
  //    </Card>
  //  )
//}