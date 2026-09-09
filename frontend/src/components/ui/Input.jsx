import { useId } from 'react'

function Input({ id, name, placeholder, type, value, onChange, variant = "light", maxLength }) {
  const autoId = `field-${useId().replace(/:/g, '')}`
  const fieldId = id ?? autoId
  const variants = {
    light: "bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary-600",
    auth:  "bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-100 placeholder-gray-600",
  }

  return (
    <input
      id={fieldId}
      name={name ?? fieldId}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className={`w-full px-4 py-3 rounded-lg outline-none transition-colors ${variants[variant]}`}
    />
  )
}

export default Input
// simple champ propre et réutilisable
// placeholder = le texte affichee dans l'input quand il est vide. ex: "Votre e-mail"
// type = definit le type HTML du champ. Ex: "text" :password" "number" etc. Ex, si type="password" les caracteres tape sont caches.
// value = ce qu'il y a actuellement dans l'input
// onChange = fonction appelle a chaque fois qu'on tape sur le clavier
// light = Si fond clair, texte fonce, sinon inverse
