import { useState, useRef, useEffect } from 'react'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  error?: string
  emptyMessage?: string
  maxVisible?: number
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Type to search...',
  disabled = false,
  isLoading = false,
  error,
  emptyMessage = 'No results found',
  maxVisible = 50,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  // Sync display when value changes (e.g. on edit)
  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.label)
    } else {
      setQuery('')
    }
  }, [value, selectedOption?.label])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered =
    query && !(selectedOption?.label === query)
      ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : options

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.value)
    setQuery(option.label)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
    if (!e.target.value) {
      onChange('')
    }
  }

  const handleFocus = () => {
    setIsOpen(true)
    if (!value) setQuery('')
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={isLoading ? 'Loading...' : placeholder}
        disabled={disabled || isLoading}
        readOnly={options.length === 0 && !isLoading}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.slice(0, maxVisible).map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm ${
                option.value === value ? 'bg-blue-50 font-medium' : ''
              }`}
            >
              {option.label}
            </li>
          ))}
          {filtered.length > maxVisible && (
            <li className="px-3 py-2 text-xs text-gray-400 text-center">
              Type to narrow down {filtered.length} results...
            </li>
          )}
        </ul>
      )}
      {isOpen && query && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-3 text-sm text-gray-500 text-center">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
