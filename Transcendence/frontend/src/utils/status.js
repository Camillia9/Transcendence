// Le back envoie en anglasi le statut, nous on le veux en FR pour pouvoir faire la traduction

export const STATUS_VALUES = ['Available', 'Busy', 'Away']

export function formatStatus(statut) {
  switch (statut) {
    case 'Available':
      return 'Disponible'
    case 'Busy':
      return 'Occupé'
    case 'Away':
      return 'Absent'
    default:
      return statut   // valeur inconnue : on affiche le brut plutôt que rien
  }
}

// couleur de pastille par statut (uniquement quand en ligne)
export const STATUS_DOT = {
  Available: 'bg-green-400',
  Busy: 'bg-orange-400',
  Away: 'bg-gray-400',
}

export function getDisplayStatus(friend) {
  // hors ligne : la pastille et le texte disent la même chose, peu importe le statut stocké
  if (!friend?.isOnline) {
    return { label: 'Hors ligne', dotClass: 'bg-red-400' }
  }
  // en ligne : on montre le vrai statut choisi
  return {
    label: formatStatus(friend.statut),
    dotClass: STATUS_DOT[friend.statut] ?? 'bg-red-400',
  }
}