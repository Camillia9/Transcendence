export function getProgressColor(done, total) {
  // accent = liseré + barre (vif) · tint = fond carte (très pâle) · soft = fond badge/avatar (doux) · text = texte foncé
  if (total === 0)  return { accent: '#cbd5e1', tint: '#f8fafc', soft: '#e2e8f0', text: '#64748b' } // gris

  const pct = done / total

  if (pct === 0)    return { accent: '#cbd5e1', tint: '#f8fafc', soft: '#e2e8f0', text: '#64748b' } // gris — 0%
  if (pct < 0.33)   return { accent: '#f59e0b', tint: '#fffbeb', soft: '#fef3c7', text: '#92400e' } // ambre
  if (pct < 0.66)   return { accent: '#f97316', tint: '#fff7ed', soft: '#ffedd5', text: '#9a3412' } // orange
  if (pct < 1)      return { accent: '#22c55e', tint: '#f0fdf4', soft: '#dcfce7', text: '#15803d' } // vert
  return            { accent: '#16a34a', tint: '#ecfdf5', soft: '#d1fae5', text: '#166534' }        // vert profond — 100%
}