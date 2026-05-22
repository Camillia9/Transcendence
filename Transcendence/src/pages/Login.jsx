import { useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'
import { IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react'

function Login() {
  const navigate = useNavigate() // La demande pour avoir acces a un outil de navigation
  
    const handleGoogle = () => {
    // À brancher avec Dev 4 — OAuth Google
    console.log('Google OAuth')
  }

  const handleGithub = () => {
    // À brancher avec Dev 4 — OAuth GitHub
    console.log('GitHub OAuth')
  }

  return (
    <Card className="w-96 flex flex-col items-center gap-6 p-10">
    
      {/* Logo */}
            <Logo />

      {/* Titre */}
      <div className="text-center">
        <h2 className="text-2xl font-medium text-[#0c2d4a]">Connexion</h2>
        <p className="text-sm text-[#3a5a7a] mt-1">
          Choisis ton moyen de connexion</p>
      </div>

      {/* Boutons OAuth */}
      <div className="flex flex-col gap-3 w-full">

        <Button variant="outline" onClick={handleGoogle}>
          <span className="flex items-center justify-center gap-2">
            <IconBrandGoogle size={18} />
            Continuer avec Google
          </span>
        </Button>

        <Button variant="dark" onClick={handleGithub}>
          <span className="flex items-center justify-center gap-2">
            <IconBrandGithub size={18} />
            Continuer avec GitHub
          </span>
        </Button>

      </div>

      {/* Note */}
      <p className="text-xs text-center text-[#3a5a7a]">
        Première fois ? Un compte sera créé automatiquement.
      </p>

      {/* Retour */}
      <p
        onClick={() => navigate('/')}
        className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
      >
        ← Retour
      </p>

      {/*A retirer - Nav. Home*/}
      <p
        onClick={() => navigate('/home')} 
        className='text-2xl text-black'>
          HOME
      </p>

    </Card>
  )
}

export default Login