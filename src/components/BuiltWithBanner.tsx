import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'reqres-waitlist-banner-dismissed'

export default function BuiltWithBanner() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    // Show banner on new sessions (sessionStorage, not localStorage)
    const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === '1'
    setDismissed(wasDismissed)
  }, [])

  if (dismissed) return null

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-brand-400">ReqRes</span>
          <span className="text-slate-400 hidden sm:inline">
            Built entirely on ReqRes - zero backend code
          </span>
          <span className="text-slate-400 sm:hidden">
            Zero backend code
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/benhowdle89/reqres-waitlist-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline"
          >
            Fork this app
          </a>
          <a
            href="https://reqres.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm font-medium bg-brand-600 hover:bg-brand-500 rounded-md text-white transition-colors"
          >
            Get your own backend
          </a>
          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
