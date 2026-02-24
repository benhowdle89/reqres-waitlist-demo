import { WaitlistRecord } from '../types'

type Props = {
  records: WaitlistRecord[]
  total: number
}

export default function StatsBar({ records: _records, total }: Props) {
  // Stats are computed from server-side totals where possible.
  // For status breakdowns, we'd need separate queries or full data.
  // For this demo, we show the total from pagination meta.

  const stats = [
    {
      label: 'Total Signups',
      value: total,
      color: 'text-white',
      bg: 'bg-slate-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} rounded-lg p-4 border border-slate-700`}
        >
          <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
