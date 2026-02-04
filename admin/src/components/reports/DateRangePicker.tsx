import { useState } from 'react'

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void
  isLoading?: boolean
}

export default function DateRangePicker({ onDateRangeChange, isLoading }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })

  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate)
    }
  }

  const handlePreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    setStartDate(startStr)
    setEndDate(endStr)
    onDateRangeChange(startStr, endStr)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date Range</h3>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handlePreset(7)}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePreset(30)}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handlePreset(90)}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Last 90 Days
          </button>
          <button
            onClick={() => handlePreset(365)}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Last Year
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Loading...' : 'Apply'}
        </button>
      </div>
    </div>
  )
}
