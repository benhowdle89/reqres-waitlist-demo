import { useState, useEffect, useCallback } from 'react'
import { config } from '../config'
import { SignupData } from '../types'
import {
  checkExistingSignup,
  joinWaitlist,
  getWaitlistPosition,
  getWaitlistTotal,
  friendlyError,
} from '../api'
import SignupForm from './SignupForm'

type SuccessInfo = {
  position: number
  alreadySignedUp?: boolean
}

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessInfo | null>(null)
  const [totalSignups, setTotalSignups] = useState<number | null>(null)

  useEffect(() => {
    getWaitlistTotal(config)
      .then(setTotalSignups)
      .catch(() => {})
  }, [])

  const handleSubmit = useCallback(async (data: SignupData) => {
    setError(null)
    setLoading(true)
    try {
      // Check for duplicate email
      const existing = await checkExistingSignup(config, data.email)
      if (existing) {
        const position = await getWaitlistPosition(config, existing.created_at)
        setSuccess({ position, alreadySignedUp: true })
        return
      }

      // Create new signup
      const record = await joinWaitlist(config, data)
      const position = await getWaitlistPosition(config, record.created_at)
      setSuccess({ position })
      setTotalSignups((prev) => (prev !== null ? prev + 1 : null))
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900/20 -z-10" />

      <div className="text-center max-w-2xl mx-auto animate-fade-in">
        {/* Signup counter */}
        {totalSignups !== null && totalSignups > 0 && !success && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            {totalSignups.toLocaleString()} {totalSignups === 1 ? 'person has' : 'people have'} joined
          </div>
        )}

        {!success ? (
          <>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
              Join the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                Waitlist
              </span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
              Be the first to know when we launch. Get early access and help shape the product.
            </p>

            <div className="flex justify-center">
              <SignupForm onSubmit={handleSubmit} loading={loading} />
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="animate-fade-in">
            {/* Success checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="checkmark-animate" />
                </svg>
              </div>
            </div>

            {success.alreadySignedUp ? (
              <>
                <h2 className="text-3xl font-bold mb-2">You're already on the list!</h2>
                <p className="text-xl text-brand-400 font-semibold mb-2">
                  You're #{success.position}
                </p>
                <p className="text-slate-400">We'll be in touch soon.</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-2">You're in!</h2>
                <p className="text-xl text-brand-400 font-semibold mb-2">
                  You're #{success.position} on the list
                </p>
                <p className="text-slate-400">We'll email you when it's your turn.</p>
              </>
            )}
          </div>
        )}

        {/* Admin link */}
        <div className="mt-16">
          {import.meta.env.VITE_ADMIN_ENABLED !== 'false' ? (
            <a
              href="#/admin"
              className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
            >
              Admin
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              Admin
              <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                Disabled for demo
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
