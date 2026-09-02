import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="px-6 py-3">
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-gray-400">
        <Link to="/privacy" className="hover:text-gray-600 transition-colors">
          {t('footer.privacy')}
        </Link>
        <span className="text-gray-300">·</span>
        <Link to="/terms" className="hover:text-gray-600 transition-colors">
          {t('footer.terms')}
        </Link>
        <span className="text-gray-300">·</span>
        <Link to="/status" className="hover:text-gray-600 transition-colors">
          {t('footer.status')}
        </Link>
        <span className="text-gray-300">·</span>
        <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  )
}

export default Footer