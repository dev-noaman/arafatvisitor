import { useEffect, useRef, useCallback } from 'react'

interface UseIdleTimeoutOptions {
  timeoutMinutes?: number
  warningSeconds?: number
  onTimeout: () => void
  onWarning?: (secondsRemaining: number) => void
}

export const useIdleTimeout = ({
  timeoutMinutes = 2,
  warningSeconds = 30,
  onTimeout,
  onWarning,
}: UseIdleTimeoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningTimeoutRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())

  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = warningSeconds * 1000

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }

    // Set warning timer
    if (onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning(warningSeconds)
      }, timeoutMs - warningMs)
    }

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      onTimeout()
    }, timeoutMs)
  }, [timeoutMs, warningMs, warningSeconds, onTimeout, onWarning])

  useEffect(() => {
    // Initialize timer
    resetTimer()

    // Track user activity events
    const events = ['mousedown', 'keydown', 'touchstart', 'click']
    const handleActivity = () => {
      resetTimer()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
    }
  }, [resetTimer])

  return { resetTimer }
}
