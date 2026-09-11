// Le back envoie en anglais le statut ; côté frontend on traduit à l'affichage selon la langue active
export const STATUS_VALUES = ['Available', 'Busy', 'Away']

export function formatStatus(statut, t) {
  switch (statut) {
    case 'Available':
      return t('presence.available')
    case 'Busy':
      return t('presence.busy')
    case 'Away':
      return t('presence.away')
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

export function getDisplayStatus(friend, t) {
  // hors ligne : la pastille et le texte disent la même chose, peu importe le statut stocké
  if (!friend?.isOnline) {
    return { label: t('presence.offline'), dotClass: 'bg-red-400' }
  }
  // en ligne : on montre le vrai statut choisi
  return {
    label: formatStatus(friend.statut, t),
    dotClass: STATUS_DOT[friend.statut] ?? 'bg-red-400',
  }
}