import { IconBell, IconHome, IconUsers, IconPencil, IconTrash, IconLayoutKanban } from '@tabler/icons-react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Input from '../components/ui/Input'

const PRIMARY_SHADES = [
  { name: '50',  className: 'bg-primary-50'  },
  { name: '100', className: 'bg-primary-100' },
  { name: '200', className: 'bg-primary-200' },
  { name: '300', className: 'bg-primary-300' },
  { name: '400', className: 'bg-primary-400' },
  { name: '500', className: 'bg-primary-500' },
  { name: '600', className: 'bg-primary-600' },
  { name: '700', className: 'bg-primary-700' },
  { name: '800', className: 'bg-primary-800' },
  { name: '900', className: 'bg-primary-900' },
]

const GRAY_SHADES = [
  { name: '50', className: 'bg-gray-50' },
  { name: '100', className: 'bg-gray-100' },
  { name: '200', className: 'bg-gray-200' },
  { name: '400', className: 'bg-gray-400' },
  { name: '500', className: 'bg-gray-500' },
  { name: '600', className: 'bg-gray-600' },
  { name: '700', className: 'bg-gray-700' },
  { name: '800', className: 'bg-gray-800' },
]

const STATUS_COLORS = [
  { name: 'Rouge', className: 'bg-red-400',   usage: 'Hors ligne' },
  { name: 'Vert', className: 'bg-green-400', usage: 'Disponible' },
  { name: 'Orange', className: 'bg-orange-400', usage: 'Occupé' },
  { name: 'Gris', className: 'bg-gray-400', usage: 'Absent' },
]

// Reprend les familles de getProgressColor (avancement projet)
const PROGRESS_STATES = [
  { name: '0 %',     hex: '#cbd5e1', label: 'gris' },
  { name: '1–32 %',  hex: '#f59e0b', label: 'ambre' },
  { name: '33–65 %', hex: '#f97316', label: 'orange' },
  { name: '66–99 %', hex: '#22c55e', label: 'vert' },
  { name: '100 %',   hex: '#16a34a', label: 'vert profond' },
]

const TYPOGRAPHY = [
  { role: 'Display',          className: 'text-6xl font-medium',  sample: 'TaskBoard' },
  { role: 'Titre de page',    className: 'text-2xl font-medium',  sample: 'Mes projets' },
  { role: 'Titre de section', className: 'text-lg font-semibold', sample: 'Paramètres du compte' },
  { role: 'Titre de carte',   className: 'text-base font-medium', sample: 'Refonte site web' },
  { role: 'Corps',            className: 'text-sm',               sample: 'Texte courant, labels et boutons.' },
  { role: 'Métadonnée',       className: 'text-xs text-gray-400', sample: 'Mis à jour il y a 2 h' },
]

const ICON_SIZES = [
  { size: 28, role: 'Logo',           Icon: IconLayoutKanban },
  { size: 20, role: 'Notifications',     Icon: IconBell },
  { size: 18, role: 'Menu principal',     Icon: IconHome },
  { size: 18, role: 'Organisations',  Icon: IconUsers },
  { size: 14, role: 'Action',         Icon: IconPencil },
  { size: 14, role: 'Action',         Icon: IconTrash },
]

export default function DesignSystem() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-medium text-gray-800 mb-1">Design System</h1>
      <p className="text-sm text-gray-500 mb-10">
        Fondations visuelles de TaskBoard — couleurs, typographie, icônes et composants.
      </p>

      {/* ---- COULEURS ---- */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Couleur de marque — primary</h2>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_SHADES.map(shade => (
            <div key={shade.name} className="flex flex-col items-center gap-1">
              <div className={`w-16 h-16 rounded-lg border border-gray-100 ${shade.className}`} />
              <span className="text-xs text-gray-500">{shade.name}</span>
            </div>
          ))}
        </div>
      </section>

	    {/* surface */}
	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">Couleur de surface</h2>
	      <div className="flex flex-col items-center gap-1 w-16">
	        <div className="w-16 h-16 rounded-lg border border-gray-100 bg-surface" />
	        <span className="text-xs text-gray-500">surface</span>
	      </div>
	    </section>

	    {/* gris */}
	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">Gris (texte & surfaces)</h2>
	      <div className="flex flex-wrap gap-2">
	        {GRAY_SHADES.map(shade => (
	          <div key={shade.name} className="flex flex-col items-center gap-1">
	            <div className={`w-16 h-16 rounded-lg border border-gray-100 ${shade.className}`} />
	            <span className="text-xs text-gray-500">{shade.name}</span>
	          </div>
	        ))}
	      </div>
	    </section>
        
	    {/* sémantiques */}
	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">Couleurs des status</h2>
	      <div className="flex flex-wrap gap-6">
	        {STATUS_COLORS.map(color => (
	          <div key={color.name} className="flex items-center gap-3">
	            <div className={`w-12 h-12 rounded-lg border border-gray-100 ${color.className}`} />
	            <div className="flex flex-col">
	              <span className="text-sm font-medium text-gray-700">{color.name}</span>
	              <span className="text-xs text-gray-400">{color.usage}</span>
	            </div>
	          </div>
	        ))}
	      </div>
	    </section>
        
	    {/* couleurs d'état projet */}
	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">États d'avancement (cartes projet)</h2>
	      <div className="flex flex-wrap gap-4">
	        {PROGRESS_STATES.map(state => (
	          <div key={state.name} className="flex flex-col items-center gap-1">
	            <div
	              className="w-16 h-16 rounded-lg border border-gray-100"
	              style={{ backgroundColor: state.hex }}
	            />
	            <span className="text-xs text-gray-600">{state.name}</span>
	            <span className="text-xs text-gray-400">{state.label}</span>
	          </div>
	        ))}
	      </div>
	    </section>

      {/* ---- TYPOGRAPHIE ---- */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Typographie</h2>
        <div className="flex flex-col gap-5">
          {TYPOGRAPHY.map(item => (
            <div key={item.role} className="flex items-baseline gap-4 border-b border-gray-50 pb-4 last:border-b-0">
              {/* colonne gauche : le rôle + les classes */}
              <div className="w-40 shrink-0">
                <p className="text-sm font-medium text-gray-700">{item.role}</p>
                <p className="text-xs text-gray-400 font-mono">{item.className}</p>
              </div>
              {/* colonne droite : l'exemple rendu à sa vraie taille */}
              <p className={`${item.className} text-gray-800`}>
                {item.sample}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- ICÔNES ---- */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Icônes</h2>
        <p className="text-sm text-gray-500 mb-5">
          Librairie unique : <span className="font-mono text-xs">@tabler/icons-react</span>.
          Couleur héritée du texte parent.
        </p>
        <div className="flex flex-wrap gap-6">
          {ICON_SIZES.map(({ size, role, Icon }, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg border border-gray-100 flex items-center justify-center text-gray-600">
                <Icon size={size} />
              </div>
              <span className="text-xs text-gray-700">{size}px</span>
              <span className="text-xs text-gray-400">{role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- COMPOSANTS ---- */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"> Quelques composants</h2>
              
        {/* Button — ses variantes */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Button</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>
              
        {/* Badge */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Badge</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Admin</Badge>
            <Badge>Membres</Badge>
            <Badge>Manager</Badge>
            <Badge>User</Badge>
          </div>
        </div>
              
        {/* Avatar */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Avatar</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar username="Camillia" size="sm" />
            <Avatar username="Nico" size="md" />
          </div>
        </div>
              
        {/* Input */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Input</h3>
          <div className="max-w-sm">
            <Input placeholder="Exemple de champ…" />
          </div>
        </div>
              
      </section>

    </div>
	)
}