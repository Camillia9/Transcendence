import { twMerge } from "tailwind-merge"

function Avatar({ src, username, size = "md", className = "" }) {

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  }

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "?"

  const base = "rounded-full flex items-center justify-center font-semibold overflow-hidden bg-indigo-500 text-white"

  return (
    <div className={twMerge(base, sizes[size], className)}>
      {src
        ? <img src={src} referrerPolicy="no-referrer" alt={username} className="w-full h-full object-cover" />
        : <span>{initials}</span>
      }
    </div>
  )
}

export default Avatar

// C'est la pp de l'utilisateur. Si pas de PP, affiche initiale.

// src = URL de la photo. Si elle n'est pas fournie, on tombe dans le fallback
	// fallback: ce qui s’affiche quand l’image ne peut pas être utilisée.
// username = pseudo : Sert à deux choses : les initiales en fallback, et le alt sur l'image pour l'accessibilité.
	// alt sur image : permet de lire "image de [username]", si elle ne charge pas on verra le texte a la place, et en bonus (SEO) Google comprend mieux l'image
// size = prop qui contrôle la taille de l’avatar
// Initials = recupere les deux premiere lettre du pseudo et les met en MaJ. Si pas de username -> met '?'
// base = cree le cercle de l'avatar
// className={twMerge(base, sizes[size], className) : combine les 3 choses
// className="w-full h-full object-cover" : prend  toute la place, garde les proportions, crop proprement