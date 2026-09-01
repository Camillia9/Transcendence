import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import { getSystemStatus } from '../api/health'

const SERVICE_LABELS = {
  identity: 'Identity service',
  chat: 'Chat service',
  workspace: 'Workspace service',
}

const OVERALL_LABELS = {
  ok: 'Tous les services sont opérationnels',
  degraded: 'Certains services sont en panne',
  down: 'Tous les services sont indisponibles',
}

function statusTone(status) {
  if (status === 'ok') return 'ok'
  if (status === 'degraded') return 'warn'
  return 'err'
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.6-6.2" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

function StatusPage() {
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showUpdated, setShowUpdated] = useState(false)
  const [updatedFading, setUpdatedFading] = useState(false)

  const refresh = useCallback(async ({ manual = false } = {}) => {
    if (manual) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await getSystemStatus()
      setPayload(data)
      if (manual) {
        setUpdatedFading(false)
        setShowUpdated(true)
      }
    } catch (err) {
      setError(err.message || 'Impossible de joindre l’API de statut')
      setPayload(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!showUpdated) return undefined
    const fadeId = window.setTimeout(() => setUpdatedFading(true), 1200)
    const hideId = window.setTimeout(() => {
      setShowUpdated(false)
      setUpdatedFading(false)
    }, 1800)
    return () => {
      window.clearTimeout(fadeId)
      window.clearTimeout(hideId)
    }
  }, [showUpdated])

  useEffect(() => {
    refresh()
    const id = setInterval(() => refresh(), 15000)
    return () => clearInterval(id)
  }, [refresh])

  const overall = payload?.status || (error ? 'down' : null)
  const tone = overall ? statusTone(overall) : null
  const isBusy = loading || refreshing

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* En-tête simple avec retour à l'accueil */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link to="/home">
          <Logo />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12"> 
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Statut des services</h1>

        <div
          className={[
            'mb-6 rounded-2xl border px-5 py-4 transition-colors',
            tone === 'ok' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
            tone === 'warn' && 'border-amber-200 bg-amber-50 text-amber-950',
            tone === 'err' && 'border-rose-200 bg-rose-50 text-rose-950',
            !tone && 'border-primary-100 bg-white text-primary-800',
          ].filter(Boolean).join(' ')}
        >
          {loading && !payload ? (
            <p className="text-sm">Chargement…</p>
          ) : error && !payload ? (
            <p className="text-sm font-medium">{error}</p>
          ) : (
            <>
              <p className="text-base font-semibold">
                {OVERALL_LABELS[overall] || 'Statut inconnu'}
              </p>
              {payload?.checkedAt && (
                <p className="mt-1 text-xs opacity-70">
                  Dernière vérification : {new Date(payload.checkedAt).toLocaleString()}
                  {showUpdated && (
                    <span
                      className={[
                        'ml-2 font-medium text-emerald-700 transition-opacity duration-500',
                        updatedFading ? 'opacity-0' : 'opacity-100',
                      ].join(' ')}
                    >
                      · Mis à jour
                    </span>
                  )}
                </p>
              )}
            </>
          )}
        </div>

        <ul
          className={[
            'space-y-3 transition-opacity duration-200',
            refreshing ? 'opacity-55' : 'opacity-100',
          ].join(' ')}
          aria-busy={isBusy}
        >
          {['identity', 'chat', 'workspace'].map((key) => {
            const svc = payload?.services?.[key]
            const ok = svc?.status === 'ok'
            return (
              <li
                key={key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-primary-100 bg-white/90 px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-primary-900">
                    {SERVICE_LABELS[key]}
                  </p>
                  <p className="mt-0.5 text-xs text-primary-600/80">
                    {svc
                      ? `Base de données : ${svc.db ? 'ok' : 'ko'}`
                      : loading
                        ? '…'
                        : 'Aucune donnée'}
                  </p>
                  {svc?.error && (
                    <p className="mt-1 text-xs text-rose-600">{svc.error}</p>
                  )}
                </div>
                <span
                  className={[
                    'inline-flex min-w-18 justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    ok
                      ? 'bg-emerald-100 text-emerald-800'
                      : svc
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-primary-50 text-primary-500',
                  ].join(' ')}
                >
                  {svc ? (ok ? 'up' : 'down') : '—'}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-4 text-xs text-primary-600/70">
          <span>Rafraîchissement auto toutes les 15 s</span>
          <button
            type="button"
            onClick={() => refresh({ manual: true })}
            disabled={refreshing}
            aria-busy={refreshing}
            className={[
              'inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-1.5 font-medium text-primary-800 shadow-sm transition',
              'hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98]',
              'disabled:cursor-wait disabled:opacity-70',
              refreshing ? 'ring-2 ring-primary-200' : '',
            ].join(' ')}
          >
            <RefreshIcon spinning={refreshing} />
            {refreshing ? 'Actualisation…' : 'Actualiser'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default StatusPage
