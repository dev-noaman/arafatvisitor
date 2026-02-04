import React from 'react'

interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  isLoading?: boolean
  actions: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'primary' | 'danger' | 'secondary'
    disabled?: boolean
  }>
  onSelectAll: () => void
  onClearSelection: () => void
  onSelectNone?: () => void
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  isLoading = false,
  actions,
  onSelectAll,
  onClearSelection,
  onSelectNone,
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-40 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Selection info and controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedCount === totalCount && totalCount > 0}
              onChange={(e) => (e.target.checked ? onSelectAll() : onClearSelection())}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50"
              aria-label="Select all"
            />
            <span className="font-semibold text-gray-900">
              {selectedCount === totalCount && totalCount > 0
                ? `All ${totalCount} selected`
                : `${selectedCount} of ${totalCount} selected`}
            </span>
          </div>

          {selectedCount < totalCount && selectedCount > 0 && (
            <button
              onClick={onSelectAll}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 underline"
            >
              Select all {totalCount}
            </button>
          )}

          {selectedCount > 0 && (
            <button
              onClick={onSelectNone || onClearSelection}
              disabled={isLoading}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => (
            <button
              key={`action-${idx}`}
              onClick={action.onClick}
              disabled={isLoading || action.disabled}
              className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${
                action.variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : action.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
              title={action.label}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BulkActionBar
