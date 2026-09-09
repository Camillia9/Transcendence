import { twMerge } from "tailwind-merge"

function Card({ children, className = "" }) {
  return (
    <div className={twMerge(
      "bg-white rounded-2xl border border-gray-100 shadow-sm p-6",
      className
    )}>
      {children}
    </div>
  )
}

export default Card

// Une Card sert à regrouper du contenu dans un bloc visuel propre et stylé.
// C'est juste de l'UI

// className="" : Valeur par defaut vide pour pouvoir customiser au cas par cas depuis l'exterieur

// twMerge sert a eviter les conflits de classe. Si pas de className on met la couleur indiques, sinon on prend la couleur du className. Les classe custom gagnent toujouts