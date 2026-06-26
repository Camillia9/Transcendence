export function timeAgo(isoDate) {
  const now = new Date()
  const date = new Date(isoDate)
  const seconds = Math.floor((now - date) / 1000)  // écart en secondes

  if (seconds < 60) return "à l'instant"

  const minutes = Math.floor(seconds / 60) // Math.floor()arrondit vers le plus petit(2,9h = 2h)
  if (minutes < 60) return `il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`

  const days = Math.floor(hours / 24)
  if (days === 1) return "hier"
  if (days < 7) return `il y a ${days} j`

  // au-delà d'une semaine : on affiche la vraie date
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}