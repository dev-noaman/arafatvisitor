interface BarChartProps {
  title: string
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  isLoading?: boolean
  maxValue?: number
}

export default function BarChart({ title, data, isLoading, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 0)
  const scale = max > 0 ? 100 / max : 1

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No data available</div>
      ) : (
        <div className="space-y-6">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex items-end justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    item.color || colors[index % colors.length]
                  }`}
                  style={{ width: `${item.value * scale}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
