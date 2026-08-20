// Le back envoie en anglasi le statut, nous on le veux en FR pour pouvoir faire la traduction

export const STATUS_VALUES = ['Available', 'Busy', 'Away']

export default function formatStatus(statut) {
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

