import { useTranslation } from 'react-i18next'
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

function getStatusColors(t) {
  return [
    { name: t('designSystem.colorNames.red'), className: 'bg-red-400', usage: t('presence.offline') },
    { name: t('designSystem.colorNames.green'), className: 'bg-green-400', usage: t('presence.available') },
    { name: t('designSystem.colorNames.orange'), className: 'bg-orange-400', usage: t('presence.busy') },
    { name: t('designSystem.colorNames.gray'), className: 'bg-gray-400', usage: t('presence.away') },
  ]
}

function getProgressStates(t) {
  return [
    { name: '0 %',     hex: '#cbd5e1', label: t('designSystem.progressLabels.gray') },
    { name: '1–32 %',  hex: '#f59e0b', label: t('designSystem.progressLabels.amber') },
    { name: '33–65 %', hex: '#f97316', label: t('designSystem.progressLabels.orange') },
    { name: '66–99 %', hex: '#22c55e', label: t('designSystem.progressLabels.green') },
    { name: '100 %',   hex: '#16a34a', label: t('designSystem.progressLabels.deepGreen') },
  ]
}

function getTypography(t) {
  return [
    { role: t('designSystem.typographyRoles.display'), className: 'text-6xl font-medium', sample: 'TaskBoard' },
    { role: t('designSystem.typographyRoles.pageTitle'), className: 'text-2xl font-medium', sample: t('designSystem.typographySamples.pageTitle') },
    { role: t('designSystem.typographyRoles.sectionTitle'), className: 'text-lg font-semibold', sample: t('designSystem.typographySamples.sectionTitle') },
    { role: t('designSystem.typographyRoles.cardTitle'), className: 'text-base font-medium', sample: t('designSystem.typographySamples.cardTitle') },
    { role: t('designSystem.typographyRoles.body'), className: 'text-sm', sample: t('designSystem.typographySamples.body') },
    { role: t('designSystem.typographyRoles.metadata'), className: 'text-xs text-gray-400', sample: t('designSystem.typographySamples.metadata') },
  ]
}

function getIconSizes(t) {
  return [
    { size: 28, role: t('designSystem.iconRoles.logo'), Icon: IconLayoutKanban },
    { size: 20, role: t('designSystem.iconRoles.notifications'), Icon: IconBell },
    { size: 18, role: t('designSystem.iconRoles.mainMenu'), Icon: IconHome },
    { size: 18, role: t('designSystem.iconRoles.organisations'), Icon: IconUsers },
    { size: 14, role: t('designSystem.iconRoles.action'), Icon: IconPencil },
    { size: 14, role: t('designSystem.iconRoles.action'), Icon: IconTrash },
  ]
}

export default function DesignSystem() {
  const { t } = useTranslation()
  const STATUS_COLORS = getStatusColors(t)
  const PROGRESS_STATES = getProgressStates(t)
  const TYPOGRAPHY = getTypography(t)
  const ICON_SIZES = getIconSizes(t)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-medium text-gray-800 mb-1">{t('designSystem.title')}</h1>
      <p className="text-sm text-gray-500 mb-10">
        {t('designSystem.description')}
      </p>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('designSystem.sections.brandColor', { token: t('designSystem.tokenNames.primary') })}</h2>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_SHADES.map(shade => (
            <div key={shade.name} className="flex flex-col items-center gap-1">
              <div className={`w-16 h-16 rounded-lg border border-gray-100 ${shade.className}`} />
              <span className="text-xs text-gray-500">{shade.name}</span>
            </div>
          ))}
        </div>
      </section>

	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('designSystem.sections.surfaceColor')}</h2>
	      <div className="flex flex-col items-center gap-1 w-16">
	        <div className="w-16 h-16 rounded-lg border border-gray-100 bg-surface" />
	        <span className="text-xs text-gray-500">{t('designSystem.tokenNames.surface')}</span>
	      </div>
	    </section>

	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('designSystem.sections.grayColor')}</h2>
	      <div className="flex flex-wrap gap-2">
	        {GRAY_SHADES.map(shade => (
	          <div key={shade.name} className="flex flex-col items-center gap-1">
	            <div className={`w-16 h-16 rounded-lg border border-gray-100 ${shade.className}`} />
	            <span className="text-xs text-gray-500">{shade.name}</span>
	          </div>
	        ))}
	      </div>
	    </section>
        
	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('designSystem.sections.statusColors')}</h2>
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
        
	    <section className="mb-12">
	      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('designSystem.sections.progressStates')}</h2>
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

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('designSystem.sections.typography')}</h2>
        <div className="flex flex-col gap-5">
          {TYPOGRAPHY.map(item => (
            <div key={item.role} className="flex items-baseline gap-4 border-b border-gray-50 pb-4 last:border-b-0">
              <div className="w-40 shrink-0">
                <p className="text-sm font-medium text-gray-700">{item.role}</p>
                <p className="text-xs text-gray-400 font-mono">{item.className}</p>
              </div>
              <p className={`${item.className} text-gray-800`}>
                {item.sample}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('designSystem.sections.icons')}</h2>
        <p className="text-sm text-gray-500 mb-5">
          {t('designSystem.iconsLibraryPrefix')} <span className="font-mono text-xs">@tabler/icons-react</span>.
          {' '}{t('designSystem.iconsColorNote')}
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

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4"> {t('designSystem.sections.components')}</h2>
              
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('designSystem.componentNames.button')}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">{t('designSystem.variantNames.primary')}</Button>
            <Button variant="outline">{t('designSystem.variantNames.outline')}</Button>
            <Button variant="ghost">{t('designSystem.variantNames.ghost')}</Button>
            <Button variant="danger">{t('designSystem.variantNames.danger')}</Button>
          </div>
        </div>
              
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('designSystem.componentNames.badge')}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{t('designSystem.roleNames.admin')}</Badge>
            <Badge>{t('designSystem.badgeMembersExample')}</Badge>
            <Badge>{t('designSystem.roleNames.manager')}</Badge>
            <Badge>{t('designSystem.roleNames.user')}</Badge>
          </div>
        </div>
              
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('designSystem.componentNames.avatar')}</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar username="Camillia" size="sm" />
            <Avatar username="Nico" size="md" />
          </div>
        </div>
              
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('designSystem.componentNames.input')}</h3>
          <div className="max-w-sm">
            <Input placeholder={t('designSystem.inputPlaceholder')} />
          </div>
        </div>
              
      </section>

    </div>
	)
}