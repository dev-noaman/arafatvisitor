import React, { useState } from 'react'
import { FileDropzone } from './FileDropzone'

interface ImportPreviewRow {
  rowNumber: number
  valid: boolean
  error?: string
  data?: Record<string, unknown>
}

interface ImportModalProps {
  isOpen: boolean
  title?: string
  description?: string
  isLoading?: boolean
  onFileSelected: (file: File) => Promise<ImportPreviewRow[]>
  onConfirm: (validRows: Record<string, unknown>[]) => Promise<void>
  onCancel: () => void
}

export function ImportModal({
  isOpen,
  title = 'Import Data',
  description = 'Select a CSV or Excel file to import',
  isLoading = false,
  onFileSelected,
  onConfirm,
  onCancel,
}: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload')
  const [previewData, setPreviewData] = useState<ImportPreviewRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)
    setIsProcessing(true)

    try {
      const preview = await onFileSelected(file)
      setPreviewData(preview)
      setStep('preview')
    } catch (err) {
      setError((err as Error).message || 'Failed to parse file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const validRows = previewData
        .filter((row) => row.valid && row.data)
        .map((row) => row.data) as Record<string, unknown>[]

      if (validRows.length === 0) {
        throw new Error('No valid rows to import')
      }

      await onConfirm(validRows)
      handleClose()
    } catch (err) {
      setError((err as Error).message || 'Import failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setStep('upload')
    setPreviewData([])
    setError(null)
    onCancel()
  }

  const validCount = previewData.filter((r) => r.valid).length
  const invalidCount = previewData.filter((r) => !r.valid).length

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}

        {/* Step indicator */}
        <div className="flex gap-4 mb-6 pb-4 border-b border-gray-200">
          {['upload', 'preview', 'confirm'].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 text-sm font-medium ${
                step === s ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {['upload', 'preview', 'confirm'].indexOf(s) + 1}
              </div>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div>
            <FileDropzone
              onFileSelect={handleFileSelect}
              isLoading={isProcessing || isLoading}
              label="Drop file here or click to browse"
              description="Supported formats: CSV (.csv), Excel (.xlsx)"
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && previewData.length > 0 && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">{validCount}</span> valid row(s),{' '}
                <span className="font-semibold">{invalidCount}</span> invalid row(s)
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {previewData.map((row) => (
                <div
                  key={row.rowNumber}
                  className={`p-3 rounded border ${
                    row.valid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    Row {row.rowNumber}
                    {row.valid ? (
                      <span className="ml-2 text-green-600">✓ Valid</span>
                    ) : (
                      <span className="ml-2 text-red-600">✗ Invalid</span>
                    )}
                  </p>
                  {row.error && (
                    <p className="text-xs text-red-600 mt-1">{row.error}</p>
                  )}
                </div>
              ))}
            </div>

            {invalidCount > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                Please review invalid rows. Only valid rows will be imported.
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
              <p className="text-sm text-blue-800">
                Ready to import <span className="font-semibold">{validCount}</span> record(s)?
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isProcessing || isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('upload')}
                disabled={isProcessing || isLoading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Back
              </button>
              {validCount > 0 && (
                <button
                  onClick={() => setStep('confirm')}
                  disabled={isProcessing || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
              )}
            </>
          )}

          {step === 'confirm' && (
            <button
              onClick={handleConfirm}
              disabled={isProcessing || isLoading || validCount === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isProcessing ? 'Importing...' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportModal
