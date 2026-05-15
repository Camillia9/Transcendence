function Input({ placeholder, type, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none"
    />
  )
}

export default Input

// simple champ propre et réutilisable
// placeholder = le texte affichee dans l'input quand il est vide. ex: "Votre e-mail"
// type = definit le type HTML du champ. Ex: "text" :password" "number" etc. Ex, si type="password" les caracteres tape sont caches.
// value = ce qu'il y a actuellement dans l'input
// onChange = fonction appelle a chaque fois qu'on tape sur le clavier 