import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { signupRequest } from '../api/auth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'

function Signup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()

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
      newErrors.username = t('signup.errors.usernameRequired')
    else if (username.length < 3)
      newErrors.username = t('signup.errors.usernameTooShort')

    if (!email.trim())
      newErrors.email = t('signup.errors.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = t('signup.errors.emailInvalid')

    if (!password)
      newErrors.password = t('signup.errors.passwordRequired')
    else if (password.length < 6)
      newErrors.password = t('signup.errors.passwordTooShort')

    if (!confirmPassword)
      newErrors.confirmPassword = t('signup.errors.confirmPasswordRequired')
    else if (confirmPassword !== password)
      newErrors.confirmPassword = t('signup.errors.passwordMismatch')

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
      const msg = error.message
      if (msg === 'Pseudo already used'){
        setErrors({ username: t('signup.errors.usernameTaken') })
      } else if (msg === 'Email already used') {
        setErrors({ email: t('signup.errors.emailTaken') })
      } else {
        setErrors({ global: t('signup.errors.generic') })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={t('signup.title')}
      subtitle={t('signup.subtitle')}
      swapText={t('signup.swapText')}
      swapTo="/login"
    >
      <div className="flex flex-col gap-3 w-full">

        {/* Nom d'utilisateur */}
        <div>
          <Input
            variant="auth"
            type="text"
            placeholder={t('signup.usernamePlaceholder')}
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
            placeholder={t('signup.emailPlaceholder')}
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
            placeholder={t('signup.passwordPlaceholder')}
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
            placeholder={t('signup.confirmPasswordPlaceholder')}
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
          {t('signup.submit')}
        </Button>

      </div>
    </AuthCard>
  )
}

export default Signup
