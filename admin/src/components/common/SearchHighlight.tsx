import React from 'react'

interface SearchHighlightProps {
  text: string
  query?: string
  className?: string
  highlightClassName?: string
}

export function SearchHighlight({
  text,
  query = '',
  className = '',
  highlightClassName = 'bg-yellow-200 font-semibold',
}: SearchHighlightProps) {
  if (!query || !text) {
    return <span className={className}>{text}</span>
  }

  // Escape special regex characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, idx) => (
        <span
          key={idx}
          className={
            part.toLowerCase() === query.toLowerCase() ? highlightClassName : undefined
          }
        >
          {part}
        </span>
      ))}
    </span>
  )
}

export default SearchHighlight
