import { useState, useEffect, useCallback } from 'react'
import { config } from '../config'
import { Session, AppUserProfile } from '../types'
import {
  requestMagicCode,
  verifyMagicCode,
  getCurrentUser,
  ApiError,
  friendlyError,
} from '../api'

const SESSION_KEY = 'reqres-waitlist-session'

type AuthState = {
  session: Session | null
  user: AppUserProfile | null
  loading: boolean
  error: string | null
  codeRequested: boolean
  requestCode: (email: string) => Promise<void>
  verifyCode: (code: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AppUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [codeRequested, setCodeRequested] = useState(false)

  // Validate existing session on mount
  useEffect(() => {
    const stored = loadSession()
    if (!stored) {
      setLoading(false)
      return
    }

    getCurrentUser(config, stored.token)
      .then((profile) => {
        setSession(stored)
        setUser(profile)
      })
      .catch(() => {
        clearSession()
      })
      .finally(() => setLoading(false))
  }, [])

  const requestCode = useCallback(async (email: string) => {
    setError(null)
    setLoading(true)
    try {
      await requestMagicCode(config, email)
      setCodeRequested(true)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyCode = useCallback(async (code: string) => {
    setError(null)
    setLoading(true)
    try {
      const sess = await verifyMagicCode(config, code)
      saveSession(sess)
      setSession(sess)

      const profile = await getCurrentUser(config, sess.token)
      setUser(profile)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid code. Please check and try again.')
      } else {
        setError(friendlyError(err))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    setUser(null)
    setCodeRequested(false)
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    session,
    user,
    loading,
    error,
    codeRequested,
    requestCode,
    verifyCode,
    logout,
    clearError,
  }
}
