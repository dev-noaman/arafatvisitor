import { useEffect, useState } from 'react'

/**
 * Debounce hook - delays updating a value until after a specified delay
 * Useful for search inputs to avoid excessive API calls while typing
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export const useDebounce = <T,>(value: T, delay: number = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
