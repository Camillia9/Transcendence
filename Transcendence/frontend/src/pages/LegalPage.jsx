import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import { useNavigate, useLocation } from 'react-router-dom';

function LegalPage({ content }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);          // on revient là où on était
    } else {
      navigate("/");         // arrivée directe → fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* En-tête simple avec retour à l'accueil */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <button onClick={handleBack} className="cursor-pointer">
          <Logo />
        </button>
      </header>

      {/* Contenu centré, largeur de lecture confortable */}
      <main className="max-w-3xl mx-auto px-6 py-12"> 
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{content.title}</h1>
        <p className="text-sm text-gray-400 mb-10">Dernière mise à jour : {content.lastUpdated}</p>

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
              return null  // type inconnu : on n'affiche rien plutôt que de planter
            })}
          </section>
        ))}
      </main>
    </div>
  )
}

export default LegalPage