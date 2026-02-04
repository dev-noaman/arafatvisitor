interface SummaryCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  isLoading?: boolean
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
}

const iconBgClasses = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  orange: 'bg-orange-100',
  red: 'bg-red-100',
  purple: 'bg-purple-100',
}

export default function SummaryCard({
  title,
  value,
  icon,
  color,
  isLoading,
}: SummaryCardProps) {
  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          {isLoading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-current opacity-25"></div>
          ) : (
            <p className="mt-2 text-3xl font-bold">{value}</p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${iconBgClasses[color]}`}>{icon}</div>
      </div>
    </div>
  )
}
