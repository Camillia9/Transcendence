import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { loginRequest } from '../api/auth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthCard from '../components/ui/AuthCard'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!identifier.trim())
      newErrors.identifier = t('login.errors.identifierRequired')

    if (!password)
      newErrors.password = t('login.errors.passwordRequired')

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
      const data = await loginRequest({ identifier, password })
      localStorage.setItem('token', data.token)
      login(data.user)
      navigate('/home')
    } catch (error) {
      setErrors({ global: t('login.errors.invalidCredentials') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      swapText={t('login.swapText')}
      swapTo="/signup"
    >
      <div className="flex flex-col gap-3 w-full">

        {/* Identifiant */}
        <div>
          <Input
            variant='auth'
            type="text"
            placeholder={t('login.identifierPlaceholder')}
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
            placeholder={t('login.passwordPlaceholder')}
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
          {t('login.submit')}
        </Button>

      </div>
    </AuthCard>
  )
}

export default Login