interface SettingsCardProps {
  title: string
  description: string
  icon: React.ReactNode
  status: 'configured' | 'incomplete' | 'empty'
  statusColor: string
  children: React.ReactNode
}

export default function SettingsCard({
  title,
  description,
  icon,
  status,
  statusColor,
  children,
}: SettingsCardProps) {
  const statusTexts = {
    configured: { text: 'Configured', bg: 'bg-green-50', border: 'border-green-200' },
    incomplete: { text: 'Incomplete', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    empty: { text: 'Not Configured', bg: 'bg-gray-50', border: 'border-gray-200' },
  }

  const { text, bg, border } = statusTexts[status]

  return (
    <div className={`rounded-lg border p-6 ${bg} ${border}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-white ${statusColor}`}>{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              status === 'configured'
                ? 'bg-green-200 text-green-800'
                : status === 'incomplete'
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-gray-200 text-gray-800'
            }`}
          >
            {text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
