import { useState } from 'react'

export type ExportFormat = 'csv' | 'excel' | 'json'

interface ExportModalProps {
  isOpen: boolean
  title?: string
  description?: string
  isLoading?: boolean
  formats?: ExportFormat[]
  defaultFormat?: ExportFormat
  onConfirm: (format: ExportFormat, filename: string) => Promise<void>
  onCancel: () => void
}

export function ExportModal({
  isOpen,
  title = 'Export Data',
  description = 'Choose the export format and filename',
  isLoading = false,
  formats = ['csv', 'excel', 'json'],
  defaultFormat = 'csv',
  onConfirm,
  onCancel,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(defaultFormat)
  const [filename, setFilename] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)

    if (!filename.trim()) {
      setError('Please enter a filename')
      return
    }

    setIsProcessing(true)

    try {
      const extension = selectedFormat === 'excel' ? 'xlsx' : selectedFormat === 'json' ? 'json' : 'csv'
      const fullFilename = filename.includes('.') ? filename : `${filename}.${extension}`
      await onConfirm(selectedFormat, fullFilename)
      handleClose()
    } catch (err) {
      setError((err as Error).message || 'Export failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setSelectedFormat(defaultFormat)
    setFilename('')
    setError(null)
    onCancel()
  }

  if (!isOpen) {
    return null
  }

  const formatDescriptions: Record<ExportFormat, { label: string; description: string }> = {
    csv: {
      label: 'CSV',
      description: 'Comma-separated values, compatible with Excel and Google Sheets',
    },
    excel: {
      label: 'Excel',
      description: 'Microsoft Excel format (.xlsx) with formatting',
    },
    json: {
      label: 'JSON',
      description: 'JavaScript Object Notation format for programmatic access',
    },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="space-y-2">
            {formats.map((format) => (
              <label key={format} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value={format}
                  checked={selectedFormat === format}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                  disabled={isProcessing || isLoading}
                  className="w-4 h-4 text-blue-600 cursor-pointer disabled:opacity-50"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDescriptions[format].label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDescriptions[format].description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filename Input */}
        <div className="mb-6">
          <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-2">
            Filename
          </label>
          <div className="flex gap-2">
            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => {
                setFilename(e.target.value)
                setError(null)
              }}
              placeholder="export"
              disabled={isProcessing || isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <span className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm border border-gray-300">
              .{selectedFormat === 'excel' ? 'xlsx' : selectedFormat === 'json' ? 'json' : 'csv'}
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-sm text-blue-800">
            The exported file will contain all filtered records with current sorting and filters applied.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isProcessing || isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isProcessing ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
