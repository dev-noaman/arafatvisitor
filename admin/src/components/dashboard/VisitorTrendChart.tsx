import { useMemo } from 'react'

interface TrendDataPoint {
  date: string
  count: number
}

interface VisitorTrendChartProps {
  data: TrendDataPoint[]
  isLoading?: boolean
  title?: string
  height?: number
}

export function VisitorTrendChart({
  data,
  isLoading = false,
  title = 'Visitor Trends (7 Days)',
  height = 300,
}: VisitorTrendChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null

    const maxCount = Math.max(...data.map((d) => d.count), 10)
    const barHeight = (count: number) => (count / maxCount) * (height - 60)

    return {
      maxCount,
      barHeight,
    }
  }, [data, height])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6" style={{ height: `${height}px` }}>
        <div className="h-full bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6" style={{ height: `${height}px` }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-end justify-between gap-2 h-64">
        {data.map((point, idx) => {
          const heightPercent = chartData
            ? (point.count / chartData.maxCount) * 100
            : 0
          const isToday = idx === data.length - 1

          return (
            <div key={`${point.date}-${idx}`} className="flex flex-col items-center flex-1">
              <div className="relative w-full flex justify-center mb-2">
                <div
                  className={`w-full max-w-8 rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer ${
                    isToday ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                  style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '4px' : '0' }}
                  title={`${point.date}: ${point.count} visitors`}
                />
              </div>
              <div className="text-xs text-gray-600 text-center whitespace-nowrap">
                {formatDate(point.date)}
              </div>
              <div className="text-xs font-semibold text-gray-900 text-center">
                {point.count}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span className="text-gray-600">Previous</span>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

export default VisitorTrendChart
