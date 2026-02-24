import { useState } from 'react'
import type { SignupData } from '../types'

const REFERRAL_OPTIONS = [
  { value: '', label: 'Select an option...' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'hacker_news', label: 'Hacker News' },
  { value: 'friend', label: 'A friend' },
  { value: 'search', label: 'Google search' },
  { value: 'other', label: 'Other' },
]

type Props = {
  onSubmit: (data: SignupData) => Promise<void>
  loading: boolean
}

export default function SignupForm({ onSubmit, loading }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [referralSource, setReferralSource] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    await onSubmit({
      email: email.trim().toLowerCase(),
      name: name.trim() || undefined,
      referral_source: referralSource || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
          Email address <span className="text-brand-400">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
          Name <span className="text-slate-500">(optional)</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="referral" className="block text-sm font-medium text-slate-300 mb-1">
          How did you hear about us? <span className="text-slate-500">(optional)</span>
        </label>
        <select
          id="referral"
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
          disabled={loading}
        >
          {REFERRAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Joining...
          </span>
        ) : (
          'Join the Waitlist'
        )}
      </button>
    </form>
  )
}
