import React, { useRef, useState } from 'react'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  isLoading?: boolean
  label?: string
  description?: string
}

export function FileDropzone({
  onFileSelect,
  accept = '.csv,.xlsx',
  maxSize = 10 * 1024 * 1024, // 10MB default
  isLoading = false,
  label = 'Drop file here or click to browse',
  description = 'Supported formats: CSV, Excel',
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setError(null)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      validateAndSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files[0]) {
      validateAndSelect(files[0])
    }
  }

  const validateAndSelect = (file: File) => {
    setError(null)

    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${formatBytes(maxSize)} limit`)
      return
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    const acceptedFormats = accept.split(',').map((fmt) => fmt.trim())

    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Invalid file format. Accepted: ${accept}`)
      return
    }

    onFileSelect(file)
  }

  const handleClick = () => {
    if (!isLoading && inputRef.current) {
      inputRef.current.click()
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={isLoading}
        className="hidden"
      />

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <svg
          className={`w-12 h-12 ${
            isDragActive ? 'text-blue-500' : error ? 'text-red-500' : 'text-gray-400'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      {/* Text */}
      <p className={`font-semibold ${isDragActive ? 'text-blue-600' : error ? 'text-red-600' : 'text-gray-700'}`}>
        {label}
      </p>

      {!error && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Maximum file size: {formatBytes(maxSize)}
      </p>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export default FileDropzone
