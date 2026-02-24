import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import LandingPage from './components/LandingPage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import BuiltWithBanner from './components/BuiltWithBanner'

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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {view === 'landing' && <LandingPage />}
        {view === 'admin' && !auth.session && (
          <AdminLogin
            loading={auth.loading}
            error={auth.error}
            codeRequested={auth.codeRequested}
            onRequestCode={auth.requestCode}
            onVerifyCode={auth.verifyCode}
            onClearError={auth.clearError}
          />
        )}
        {view === 'admin' && auth.session && (
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
