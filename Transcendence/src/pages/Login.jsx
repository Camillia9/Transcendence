import { useState } from 'react'
import InputField from '../components/InputField'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// --- Fonctions de validation ---
function validate(fields, isSignup) {
  const errors = {}

  if (!fields.email.includes('@') || !fields.email.includes('.'))
    errors.email = 'Email invalide'

  if (fields.password.length < 8)
    errors.password = 'Minimum 8 caractères'

  if (isSignup) {
    if (fields.username.trim().length < 3)
      errors.username = 'Minimum 3 caractères'
    if (fields.password !== fields.confirm)
      errors.confirm = 'Les mots de passe ne correspondent pas'
  }

  return errors
}

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [fields, setFields] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Met à jour un champ et revalide en direct
  function handleChange(field, value) {
    const updated = { ...fields, [field]: value }
    setFields(updated)
    if (submitted) setErrors(validate(updated, isSignup))
  }

  function handleSubmit() {
	setSubmitted(true)
	const errs = validate(fields, isSignup)
	setErrors(errs)
	if (Object.keys(errs).length === 0) {
		login({ email: fields.email })  // simule un login (sera remplacé par l'API)
		navigate('/dashboard')           // redirige vers le dashboard
  }
}

  function switchMode() {
    setIsSignup(!isSignup)
    setErrors({})
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md flex flex-col gap-6 shadow-xl">

        {/* Titre */}
        <h1 className="text-2xl font-bold text-white text-center">
          {isSignup ? 'Créer un compte' : 'Connexion'}
        </h1>

        {/* Champs */}
        {isSignup && (
          <InputField
            label="Nom d'utilisateur"
            type="text"
            value={fields.username}
            onChange={e => handleChange('username', e.target.value)}
            error={errors.username}
          />
        )}
        <InputField
          label="Email"
          type="email"
          value={fields.email}
          onChange={e => handleChange('email', e.target.value)}
          error={errors.email}
        />
        <InputField
          label="Mot de passe"
          type="password"
          value={fields.password}
          onChange={e => handleChange('password', e.target.value)}
          error={errors.password}
        />
        {isSignup && (
          <InputField
            label="Confirmer le mot de passe"
            type="password"
            value={fields.confirm}
            onChange={e => handleChange('confirm', e.target.value)}
            error={errors.confirm}
          />
        )}

        {/* Bouton */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition"
        >
          {isSignup ? "S'inscrire" : 'Se connecter'}
        </button>

        {/* Switch login/signup */}
        <p className="text-gray-400 text-sm text-center">
          {isSignup ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <button onClick={switchMode} className="text-blue-400 hover:underline">
            {isSignup ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>

      </div>
    </div>
  )
}