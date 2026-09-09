import { twMerge } from "tailwind-merge"

function Badge({ children, variant = "default", className = "" }) {

  const variants = {
    grey: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    red:  "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue:    "bg-primary-100 text-primary-700",
  }

  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"

  return (
    <span className={twMerge(base, variants[variant], className)}>
      {children}
    </span>
  )
}

export default Badge

// Badge = Un petit tag coloré qui communique un statut ou une catégorie en un coup d'œil.

// Base: permet d'ajouter une icône à côté du texte si besoin, ils s'aligneront proprement. — donne la forme pilule caractéristique des badges.