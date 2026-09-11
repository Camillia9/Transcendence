import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import { useLegalContent } from '../data/useLegalContent'

function LegalPage({ type }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { privacyPolicy, termsOfService } = useLegalContent()
  const content = type === 'privacy' ? privacyPolicy : termsOfService

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1)
    } else {
      navigate("/")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <button onClick={handleBack} className="cursor-pointer">
          <Logo />
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{content.title}</h1>
        <p className="text-sm text-gray-400 mb-10">{t('legal.lastUpdated', { date: content.lastUpdated })}</p>

        {content.sections.map((section, i) => (
          <section key={i} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{section.heading}</h2>

            {section.blocks.map((block, j) => {
              if (block.type === 'p') {
                return (
                  <p key={j} className="text-sm text-gray-600 leading-relaxed mb-3">
                    {block.text}
                  </p>
                )
              }
              if (block.type === 'ul') {
                return (
                  <ul key={j} className="list-disc pl-5 mb-3 flex flex-col gap-1.5">
                    {block.items.map((item, k) => (
                      <li key={k} className="text-sm text-gray-600 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )
              }
              return null
            })}
          </section>
        ))}
      </main>
    </div>
  )
}

export default LegalPage
