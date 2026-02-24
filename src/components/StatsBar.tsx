type Props = {
  total: number
  statusCounts: { waiting: number; invited: number; joined: number }
}

export default function StatsBar({ total, statusCounts }: Props) {
  const stats = [
    {
      label: 'Total',
      value: total,
      color: 'text-white',
    },
    {
      label: 'Waiting',
      value: statusCounts.waiting,
      color: 'text-yellow-400',
    },
    {
      label: 'Invited',
      value: statusCounts.invited,
      color: 'text-blue-400',
    },
    {
      label: 'Joined',
      value: statusCounts.joined,
      color: 'text-green-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-slate-800 rounded-lg p-4 border border-slate-700"
        >
          <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
