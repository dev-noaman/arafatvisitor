import { useState, useRef } from 'react'
import { api } from '@/services/api'

interface ImportResult {
  totalProcessed: number
  inserted: number
  skipped: number
  rejected: number
  rejectedRows: Array<{ rowNumber: number; reason: string }>
  usersCreated?: number
  usersSkipped?: number
}

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const ext = file.name.toLowerCase().split('.').pop()
      if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)')
        return
      }
      setSelectedFile(file)
      setError(null)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const ext = selectedFile.name.toLowerCase().split('.').pop()

      if (ext === 'csv') {
        // Read CSV as text
        const text = await selectedFile.text()
        const response = await api.post<ImportResult>('/admin/api/hosts/import', {
          csvContent: text,
        })
        setResult(response)
      } else {
        // Read XLSX as base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
        const response = await api.post<ImportResult>('/admin/api/hosts/import', {
          xlsxContent: base64,
        })
        setResult(response)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to import hosts')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (result && result.inserted > 0) {
      onSuccess()
    }
    setSelectedFile(null)
    setResult(null)
    setError(null)
    onClose()
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Bulk Import Hosts</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!result ? (
            <>
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV or Excel File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 mb-1">
                      {selectedFile ? (
                        <span className="text-blue-600 font-medium">{selectedFile.name}</span>
                      ) : (
                        'Click to upload or drag and drop'
                      )}
                    </p>
                    <p className="text-sm text-gray-500">CSV or Excel file (.csv, .xlsx, .xls)</p>
                  </label>
                </div>
              </div>

              {/* Expected Format */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Expected Columns:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Name</span> - Host name (required)</p>
                  <p><span className="font-medium">Company</span> - Company name (required)</p>
                  <p><span className="font-medium">Email Address</span> - Email (required)</p>
                  <p><span className="font-medium">Phone Number</span> - Phone (optional)</p>
                  <p><span className="font-medium">Location</span> - Arafat - Barwa Towers / Arafat - Element Hotel / Arafat - Marina 50 Tower</p>
                  <p><span className="font-medium">Status</span> - Active / Inactive</p>
                  <p><span className="font-medium">ID</span> - External ID (optional, for updates)</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Results */
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.totalProcessed}</p>
                  <p className="text-sm text-blue-800">Total Processed</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{result.inserted}</p>
                  <p className="text-sm text-green-800">Added</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
                  <p className="text-sm text-yellow-800">Skipped (existing)</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{result.rejected}</p>
                  <p className="text-sm text-red-800">Rejected</p>
                </div>
              </div>

              {/* Rejected Rows */}
              {result.rejectedRows.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-3">
                    Rejected Rows ({result.rejectedRows.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-red-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-red-800">Row</th>
                          <th className="px-3 py-2 text-left text-red-800">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rejectedRows.map((row, idx) => (
                          <tr key={idx} className="border-t border-red-200">
                            <td className="px-3 py-2 text-red-700">{row.rowNumber}</td>
                            <td className="px-3 py-2 text-red-700">{row.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {result.inserted > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700">
                    Successfully imported {result.inserted} host{result.inserted !== 1 ? 's' : ''}!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          {!result ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Import Another
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
