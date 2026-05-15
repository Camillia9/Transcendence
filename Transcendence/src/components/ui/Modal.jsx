import { useEffect } from "react"
import { twMerge } from "tailwind-merge"

function Modal({ isOpen, onClose, title, children, className = "" }) {

  // Si le modal n’est pas ouvert → on ne fait rien
  useEffect(() => {
    if (!isOpen) return

    // Si on appuie sur ESC: on ferme le modal
    const handleKey = (e) => {
      if (e.key === "Escape") onClose()
    }

    // quand le modal s’ouvre → on écoute le clavier
    // quand il se ferme → on nettoie l’écouteur
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  // Si le modal est ferme, n’affiche rien du tout
  if (!isOpen) return null

  return (
    <div
      /* Assombrir l'eran lorsque le PopUp est ouvert. onClick: si on clique sur le fond, ca ferme l'onglet */
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        /* La fenetre PopUp. onClick: empeche la fermeture lorsqu'on clique DANS le modal */
        className={twMerge("bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4", className)}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header, permet d'orga les elemets du modal*/}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        {children}

      </div>
    </div>
  )
}

export default Modal

// Modal est une fenetre qui s'ouvre par dessus le reste de la page. Elle bloque l'interaction avec le fond jusqu'à ce que tu la fermes.
// Elle servira pour "Modifier le profil", confirmer une action, etc

//isOpen → dit si le modal est visible ou non
//onClose → fonction pour fermer le modal
//title → titre affiché en haut
//children → contenu à l’intérieur
//className → styles personnalisés

