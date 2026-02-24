import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LandingPage from './components/LandingPage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import BuiltWithBanner from './components/BuiltWithBanner'

const ADMIN_ENABLED = import.meta.env.VITE_ADMIN_ENABLED !== 'false'

type View = 'landing' | 'admin'

function getViewFromHash(): View {
  return window.location.hash.startsWith('#/admin') ? 'admin' : 'landing'
}

export default function App() {
  const [view, setView] = useState<View>(getViewFromHash)
  const auth = useAuth()

  useEffect(() => {
    const onHashChange = () => setView(getViewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const showAdmin = view === 'admin' && ADMIN_ENABLED

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {view === 'landing' && <LandingPage />}
        {view === 'admin' && !ADMIN_ENABLED && (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center animate-fade-in">
              <h1 className="text-2xl font-bold mb-3">Admin Login</h1>
              <p className="text-slate-400 text-sm mb-4">Admin access is disabled on this public demo.</p>
              <span className="inline-block px-2.5 py-1 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded mb-6">
                Disabled for demo
              </span>
              <p className="text-slate-500 text-sm">
                <a href="https://github.com/benhowdle89/reqres-waitlist-demo" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300">Fork this app</a> to enable admin on your own deployment.
              </p>
              <div className="mt-8">
                <a href="#/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">&larr; Back to waitlist</a>
              </div>
            </div>
          </div>
        )}
        {showAdmin && !auth.session && (
          <AdminLogin
            loading={auth.loading}
            error={auth.error}
            codeRequested={auth.codeRequested}
            onRequestCode={auth.requestCode}
            onVerifyCode={auth.verifyCode}
            onClearError={auth.clearError}
          />
        )}
        {showAdmin && auth.session && (
          <AdminDashboard
            user={auth.user}
            onLogout={auth.logout}
          />
        )}
      </div>
      <BuiltWithBanner />
    </div>
  )
}
