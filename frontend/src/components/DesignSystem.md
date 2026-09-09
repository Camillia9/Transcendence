# Design System — TaskBoard (Frontend)

Ce document décrit les fondations visuelles de l'interface : couleurs, typographie,
icônes et composants. Objectif : garantir une cohérence visuelle entre les
contributions des différents développeurs.

---

## 🎨 Couleurs

### Couleur de marque — `primary`
Bleu marine, défini comme token dans `src/index.css` (`@theme`). Toute l'identité
de l'application en découle (boutons, navigation, logo, accents).

| Token | Usage |
|---|---|
| `primary-50` / `100` | fonds très clairs, tags, survols |
| `primary-500` / `600` | boutons, éléments interactifs |
| `primary-700` / `900` | textes accentués, états foncés, avatars |

> Pour changer la teinte de marque : modifier les variables `--color-primary-*`
> dans `@theme`. Aucun autre fichier à toucher — tous les composants suivent.

### Couleur de surface — `surface`
Token dédié au fond des pages publiques (Landing, Login) : `--color-surface`.
Utilisé via `bg-surface`.

### Gris (échelle Tailwind native)
Utilisés tels quels pour toute la hiérarchie de texte et les surfaces.

| Classe | Usage |
|---|---|
| `text-gray-800` | titres |
| `text-gray-600` / `700` | texte courant |
| `text-gray-400` / `500` | texte secondaire, légendes |
| `bg-gray-50` / `100` | fonds, survols |
| `border-gray-100` / `200` | séparateurs |

### Couleurs sémantiques
Réservées au sens, jamais décoratives.

| Couleur | Usage |
|---|---|
| `red-400` / `500` | danger, suppression, déconnexion |
| `green-400` | succès, statut « en ligne » |

### Couleurs d'état des projets
Les cartes projet sont colorées selon leur avancement, via la fonction
`getProgressColor()` (`src/utils/progressColor.jsx`). Chaque état renvoie 4 nuances
(`accent`, `tint`, `soft`, `text`) appliquées au liseré, au fond, aux badges et au texte.

| Avancement | Famille |
|---|---|
| 0 % | gris |
| 1–32 % | ambre |
| 33–65 % | orange |
| 66–99 % | vert |
| 100 % | vert profond |

> **Règle de cohérence** : l'application est *bleue* (marque) ;
> les *données* (cartes projet) sont *multicolores* selon leur état.

---

## 🔤 Typographie

| Rôle | Classes | Usage |
|---|---|---|
| Display | `text-6xl font-medium` | accroche Landing |
| Titre de page | `text-2xl font-medium` | « Mes projets », « Connexion » |
| Titre de section | `text-lg font-semibold` | headings (modales, pages légales) |
| Titre de carte | `text-base font-medium` | nom de projet, titre de tâche |
| Corps | `text-sm` | texte courant, labels, boutons |
| Métadonnée | `text-xs text-gray-400` | dates, compteurs, légendes |
| Marque | `text-lg font-medium` | « TaskBoard » (logo) — cas à part |

---

## ✨ Icônes

Librairie unique : **Tabler Icons** (`@tabler/icons-react`).

| Taille | Usage |
|---|---|
| `size={28}` | logo |
| `size={20}` | barre de navigation (cloche, langue, toggle) |
| `size={18}` | taille par défaut (menus, cartes, contenus) |
| `size={14}`–`{16}` | petites icônes d'action (éditer, supprimer) |

Couleur : héritée du texte parent (`currentColor`). Gris au repos, `primary` pour
la marque, sémantique selon le contexte.

---

## 🧩 Composants

Composants réutilisables dans `src/components/ui/` :

`Button` · `Card` · `Input` · `Modal` · `Avatar` · `Badge` · `Logo` · `Footer`
· `ProjectCard` · `TaskCard` · `TaskPanel` · `KanbanColumn`

Chaque composant respecte les tokens ci-dessus (aucune couleur ni taille en dur).