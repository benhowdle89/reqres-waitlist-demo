import { useState, useEffect, useCallback } from 'react'
import { AppUserProfile, WaitlistStatus } from '../types'
import { useWaitlist } from '../hooks/useWaitlist'
import StatsBar from './StatsBar'
import WaitlistTable from './WaitlistTable'

type Props = {
  user: AppUserProfile | null
  onLogout: () => void
}

const STATUS_TABS: { label: string; value: WaitlistStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Waiting', value: 'waiting' },
  { label: 'Invited', value: 'invited' },
  { label: 'Joined', value: 'joined' },
]

export default function AdminDashboard({ user, onLogout }: Props) {
  const {
    records,
    meta,
    loading,
    error,
    params,
    setPage,
    setSearch,
    setStatusFilter,
    invite,
    remove,
    refresh,
  } = useWaitlist()

  const [searchInput, setSearchInput] = useState('')

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, setSearch])

  const handleInvite = useCallback((id: string) => {
    invite(id)
  }, [invite])

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Remove this signup from the waitlist?')) {
      remove(id)
    }
  }, [remove])

  const startIndex = (meta.page - 1) * meta.limit + 1
  const endIndex = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Waitlist Admin</h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-slate-400 hidden sm:inline">
                {user.email}
              </span>
            )}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-md hover:border-slate-600 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <StatsBar records={records} total={meta.total} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search signups</label>
            <input
              id="search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                params.status === tab.value
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <WaitlistTable
          records={records}
          loading={loading}
          onInvite={handleInvite}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {meta.total > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
            <span>
              {startIndex}–{endIndex} of {meta.total.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(meta.page - 1)}
                disabled={meta.page <= 1 || loading}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(meta.page + 1)}
                disabled={meta.page >= meta.pages || loading}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
