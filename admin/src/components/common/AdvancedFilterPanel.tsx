import { useState } from 'react'

export interface FilterOption {
  id: string
  label: string
  value: string | number | boolean | Date
}

export interface FilterField {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange'
  options?: FilterOption[]
  placeholder?: string
}

export interface FilterConfig {
  [fieldId: string]: string | number | boolean | Date | null | undefined
}

interface AdvancedFilterPanelProps {
  isOpen: boolean
  fields: FilterField[]
  activeFilters: FilterConfig
  isLoading?: boolean
  onApply: (filters: FilterConfig) => void
  onClear: () => void
  onClose: () => void
}

export function AdvancedFilterPanel({
  isOpen,
  fields,
  activeFilters,
  isLoading = false,
  onApply,
  onClear,
  onClose,
}: AdvancedFilterPanelProps) {
  const [filters, setFilters] = useState<FilterConfig>(activeFilters)

  const handleChange = (fieldId: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleApply = () => {
    // Remove empty filters
    const cleanFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      },
      {} as FilterConfig
    )
    onApply(cleanFilters)
  }

  const handleClear = () => {
    setFilters({})
    onClear()
  }

  const activeFilterCount = Object.values(activeFilters).filter((v) => v).length

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 bg-white shadow-lg w-80 z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded">
                {activeFilterCount}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>

                {field.type === 'text' && (
                  <input
                    id={field.id}
                    type="text"
                    value={String(filters[field.id] || '')}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                )}

                {field.type === 'select' && field.options && (
                  <select
                    id={field.id}
                    value={String(filters[field.id] || '')}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">All</option>
                    {field.options.map((opt) => (
                      <option key={opt.id} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'date' && (
                  <input
                    id={field.id}
                    type="date"
                    value={String(filters[field.id] || '')}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                )}

                {field.type === 'daterange' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={String(filters[`${field.id}_from`] || '')}
                      onChange={(e) => handleChange(`${field.id}_from`, e.target.value)}
                      placeholder="From"
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <input
                      type="date"
                      value={String(filters[`${field.id}_to`] || '')}
                      onChange={(e) => handleChange(`${field.id}_to`, e.target.value)}
                      placeholder="To"
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}

export default AdvancedFilterPanel
