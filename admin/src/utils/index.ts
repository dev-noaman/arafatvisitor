import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and tailwind-merge
 * This is useful for combining Tailwind CSS classes with conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 * @param date - The date to format
 * @param format - The format string (default: 'MMM DD, YYYY')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = 'MMM DD, YYYY'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')

  return format
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('D', day.toString())
    .replace('MMM', month)
    .replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'))
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2))
    .replace('HH', hours.toString().padStart(2, '0'))
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

/**
 * Formats a phone number to a readable format
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * Truncates text to a specified length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Formats a number with commas for thousands
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}
