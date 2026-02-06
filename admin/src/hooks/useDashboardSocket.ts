import { useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface DashboardEvent {
  type: 'visitor:checkin' | 'visitor:approved' | 'visitor:rejected' | 'visitor:checkout' | 'delivery:received' | 'delivery:pickedup' | 'dashboard:refresh'
  data: any
}

type EventHandler = (event: DashboardEvent) => void

export const useDashboardSocket = (onEvent?: EventHandler) => {
  const socketRef = useRef<Socket | null>(null)
  const handlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  useEffect(() => {
    // Get JWT token from cookie or header
    // Note: The actual token is stored in httpOnly cookie, so we need to get a new one
    // For WebSocket connection, we'll need to implement a way to pass JWT
    // This could be done via query params or by making a request to get the token

    // Initialize WebSocket connection
    const socketUrl = process.env.NODE_ENV === 'production'
      ? 'https://arafatvisitor.cloud'
      : 'http://localhost:3000'

    socketRef.current = io(socketUrl, {
      namespace: '/dashboard',
      auth: (cb) => {
        // Send the JWT token in the auth callback
        // In production, the token is in httpOnly cookie, so we pass a placeholder
        // The server will validate via the cookie
        cb({ token: 'cookie-based-auth' })
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    const socket = socketRef.current

    // Connect event
    socket.on('connect', () => {
      console.log('Dashboard WebSocket connected')
    })

    // Disconnect event
    socket.on('disconnect', () => {
      console.log('Dashboard WebSocket disconnected')
    })

    // Register event listeners
    const events = [
      'visitor:checkin',
      'visitor:approved',
      'visitor:rejected',
      'visitor:checkout',
      'delivery:received',
      'delivery:pickedup',
      'dashboard:refresh',
    ]

    events.forEach((event) => {
      socket.on(event, (data) => {
        const eventPayload: DashboardEvent = { type: event as any, data }
        if (onEvent) {
          onEvent(eventPayload)
        }

        // Call registered handlers for this event
        const handlers = handlersRef.current.get(event)
        if (handlers) {
          handlers.forEach((handler) => handler(data))
        }
      })
    })

    // Error event
    socket.on('error', (error) => {
      console.error('Dashboard WebSocket error:', error)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [onEvent])

  // Utility function to register event handlers
  const addEventListener = useCallback((event: string, handler: (data: any) => void) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set())
    }
    handlersRef.current.get(event)!.add(handler)

    return () => {
      const handlers = handlersRef.current.get(event)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }, [])

  return {
    socket: socketRef.current,
    addEventListener,
  }
}
