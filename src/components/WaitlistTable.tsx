import { WaitlistRecord, WaitlistStatus } from '../types'

type Props = {
  records: WaitlistRecord[]
  loading: boolean
  onInvite: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_STYLES: Record<WaitlistStatus, string> = {
  waiting: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  invited: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  joined: 'bg-green-500/10 text-green-400 border-green-500/20',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3"><div className="skeleton h-4 w-6" /></td>
          <td className="px-4 py-3"><div className="skeleton h-4 w-24" /></td>
          <td className="px-4 py-3"><div className="skeleton h-4 w-36" /></td>
          <td className="px-4 py-3"><div className="skeleton h-4 w-16" /></td>
          <td className="px-4 py-3"><div className="skeleton h-5 w-16 rounded-full" /></td>
          <td className="px-4 py-3"><div className="skeleton h-4 w-20" /></td>
          <td className="px-4 py-3"><div className="skeleton h-8 w-20" /></td>
        </tr>
      ))}
    </>
  )
}

export default function WaitlistTable({ records, loading, onInvite, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-800/50 text-sm text-slate-400">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Signed Up</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {loading ? (
            <SkeletonRows />
          ) : records.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                No signups found
              </td>
            </tr>
          ) : (
            records.map((record, index) => (
              <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                <td className="px-4 py-3 text-sm">
                  {record.data.name || <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-slate-300">{record.data.email}</td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {record.data.referral_source || <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[record.data.status]}`}
                    role="status"
                    aria-label={`Status: ${record.data.status}`}
                  >
                    {record.data.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {formatDate(record.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {record.data.status === 'waiting' && (
                      <button
                        onClick={() => onInvite(record.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-500/20 transition-colors"
                      >
                        Invite
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(record.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-400 border border-slate-700 rounded-md hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
