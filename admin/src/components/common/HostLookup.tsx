import { useState, useRef, useEffect } from 'react'
import type { Host } from '@/types'

interface HostLookupProps {
  hosts: Host[]
  value: string
  onChange: (hostId: string) => void
  disabled?: boolean
  isLoading?: boolean
  error?: string
}

export default function HostLookup({ hosts, value, onChange, disabled, isLoading, error }: HostLookupProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Sync display text when value changes (e.g. on edit)
  useEffect(() => {
    if (value) {
      const host = hosts.find((h) => String(h.id) === String(value))
      if (host) {
        setQuery(host.company)
      }
    } else {
      setQuery('')
    }
  }, [value, hosts])

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

  const isSelected = hosts.some((h) => h.company === query && String(h.id) === String(value))

  const filtered = query && !isSelected
    ? hosts.filter((h) =>
        h.company.toLowerCase().includes(query.toLowerCase()) ||
        h.name.toLowerCase().includes(query.toLowerCase())
      )
    : hosts

  const handleSelect = (host: Host) => {
    onChange(String(host.id))
    setQuery(host.company)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
    if (!e.target.value) {
      onChange('')
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={isLoading ? 'Loading hosts...' : 'Search by company or host name...'}
        disabled={disabled || isLoading}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      {/* Search icon */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.slice(0, 50).map((host) => (
            <li
              key={host.id}
              onClick={() => handleSelect(host)}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm ${
                String(host.id) === String(value) ? 'bg-blue-50 font-medium' : ''
              }`}
            >
              <span>{host.company}</span>
              {host.name !== host.company && (
                <span className="text-gray-400 ml-1">— {host.name}</span>
              )}
            </li>
          ))}
          {filtered.length > 50 && (
            <li className="px-3 py-2 text-xs text-gray-400 text-center">
              Type to narrow down {filtered.length} results...
            </li>
          )}
        </ul>
      )}
      {isOpen && query && filtered.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-3 text-sm text-gray-500 text-center">
          No company found matching "{query}"
        </div>
      )}
    </div>
  )
}
