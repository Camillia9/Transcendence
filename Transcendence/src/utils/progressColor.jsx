export function getProgressColor(done, total) {
  // Évite la division par zéro si pas de tâches
  if (total === 0) return { bg: '#f3f4f6', text: '#6b7280' }

  const pct = done / total // 0 à 1

  if (pct === 0)   return { bg: '#f3f4f6', text: '#6b7280' } // gris  — 0%
  if (pct < 0.33)  return { bg: '#fef9c3', text: '#854d0e' } // jaune — 1% à 32%
  if (pct < 0.66)  return { bg: '#ffedd5', text: '#9a3412' } // orange — 33% à 65%
  if (pct < 1)     return { bg: '#dcfce7', text: '#166534' } // vert clair — 66% à 99%
  return           { bg: '#bbf7d0', text: '#14532d' }        // vert foncé — 100%
}
