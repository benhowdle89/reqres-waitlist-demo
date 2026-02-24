import { useState, useRef, useEffect } from 'react'

type Props = {
  loading: boolean
  error: string | null
  codeRequested: boolean
  onRequestCode: (email: string) => Promise<void>
  onVerifyCode: (code: string) => Promise<void>
  onClearError: () => void
}

export default function AdminLogin({
  loading,
  error,
  codeRequested,
  onRequestCode,
  onVerifyCode,
  onClearError,
}: Props) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first code input when code step appears
  useEffect(() => {
    if (codeRequested) {
      inputRefs.current[0]?.focus()
    }
  }, [codeRequested])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    onClearError()
    await onRequestCode(email.trim().toLowerCase())
  }

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        onVerifyCode(fullCode)
      }
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newCode = [...code]
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || ''
    }
    setCode(newCode)

    if (pasted.length === 6) {
      onVerifyCode(pasted)
    } else {
      inputRefs.current[pasted.length]?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
          <p className="text-slate-400 text-sm">
            {codeRequested
              ? `We sent a code to ${email}`
              : 'Enter your admin email to get a login code'}
          </p>
        </div>

        {!codeRequested ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="sr-only">Email address</label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourapp.com"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              className="flex justify-center gap-2"
              onPaste={handleCodePaste}
              role="group"
              aria-label="Verification code"
            >
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  disabled={loading}
                  aria-label={`Digit ${i + 1}`}
                  className="w-12 h-14 text-center text-xl font-mono bg-slate-800 border border-slate-700 rounded-lg text-white code-input transition-shadow disabled:opacity-50"
                />
              ))}
            </div>

            {loading && (
              <p className="text-center text-sm text-slate-400">Verifying...</p>
            )}

            <button
              onClick={() => {
                setCode(['', '', '', '', '', ''])
                onClearError()
                onRequestCode(email.trim().toLowerCase())
              }}
              disabled={loading}
              className="w-full text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Didn't get a code? Send again
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="#/"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            &larr; Back to waitlist
          </a>
        </div>
      </div>
    </div>
  )
}
