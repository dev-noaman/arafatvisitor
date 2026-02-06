/**
 * VMS Kiosk API client.
 * When vms_config.apiBase is set, uses real backend; otherwise falls back to empty/simulated behavior.
 */

export type Host = {
  id: string
  name: string
  company: string
  email?: string
  phone: string
}

export type Visitor = {
  name: string
  company: string
  phone?: string
  email?: string
}

export type VisitSession = {
  sessionId: string
  visitor: Visitor
  host?: Host
  purpose: string
  checkInTime?: string
  checkOutTime?: string
  status?: 'active' | 'completed'
}

export type CreateVisitResponse = {
  sessionId: string
  visitor: Visitor
  qrCode?: string
}

export type Delivery = {
  id: string
  sender: string
  recipient: string
  recipientId?: string
  description: string
  status: 'pending' | 'received'
  createdAt: string
  receivedAt?: string
}

let authToken: string | null = null

function getConfig() {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem('vms_config')
  return raw ? JSON.parse(raw) : null
}

function getApiBase(): string | null {
  // Use environment variable first, then sessionStorage config
  const envBase = import.meta.env.VITE_API_BASE
  if (envBase) return envBase
  const config = getConfig()
  return config?.apiBase ?? null
}

export function getAdminUrl(): string {
  // Use VITE_ADMIN_URL if set, otherwise derive from API base
  const envAdminUrl = import.meta.env.VITE_ADMIN_URL
  if (envAdminUrl) return envAdminUrl
  
  // Derive admin URL from API base (e.g., https://domain.com/api -> https://domain.com/admin)
  const apiBase = getApiBase()
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, '/admin')
  }
  return 'http://localhost:3000/admin'
}

export function getAuthToken(): string | null {
  return authToken ?? sessionStorage.getItem('vms_token')
}

export function setAuthToken(token: string | null) {
  authToken = token
  if (token) {
    sessionStorage.setItem('vms_token', token)
  } else {
    sessionStorage.removeItem('vms_token')
  }
}

export async function getVisitPass(sessionId: string): Promise<any> {
  const base = getApiBase()
  // If no API base, return mock data for testing/demo
  if (!base) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          sessionId,
          visitor: {
            name: "Mohamed Ali",
            company: "Mock Company",
            email: "visitor@example.com"
          },
          host: {
            name: "Ahmed Hassan",
            company: "Arafat Group",
            location: "BARWA_TOWERS"
          },
          location: "BARWA_TOWERS",
          status: "APPROVED",
          checkInTimestamp: new Date().toISOString(),
          expectedDate: new Date().toISOString(),
          id: "123456"
        })
      }, 500)
    })
  }

  const response = await fetch(`${base}/visits/pass/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch visit pass')
  }

  return response.json()
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  const base = getApiBase()
  if (!base) throw new Error('API not configured')

  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const maxRetries = 3
  const retryDelays = [1000, 3000, 5000] // Exponential backoff: 1s, 3s, 5s

  try {
    // Check if browser is online
    if (!navigator.onLine) {
      throw new Error('Network is offline. Please check your connection.')
    }

    const res = await fetch(`${base}${endpoint}`, { ...options, headers })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(error.message || 'Request failed')
    }
    return res.json()
  } catch (error) {
    const isNetworkError = error instanceof TypeError || (error instanceof Error &&
      (error.message.includes('Failed to fetch') ||
       error.message.includes('Network') ||
       error.message.includes('offline')))

    // Retry on network errors up to max retries
    if (isNetworkError && retryCount < maxRetries) {
      const delay = retryDelays[retryCount]
      console.warn(`Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`)

      // Show toast notification for retries
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const event = new CustomEvent('networkRetry', {
          detail: { message: `Network error. Retrying... (${retryCount + 1}/${maxRetries})` }
        })
        window.dispatchEvent(event)
      }

      await new Promise(resolve => setTimeout(resolve, delay))
      return apiFetch<T>(endpoint, options, retryCount + 1)
    }

    // Final error message
    if (isNetworkError && retryCount >= maxRetries) {
      throw new Error('Unable to connect. Please check your network connection.')
    }

    throw error
  }
}

export async function login(email: string, password: string): Promise<{ token: string; role: string; user: { name: string; email: string; role: string } }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function fetchHosts(): Promise<Host[]> {
  return apiFetch('/hosts')
}

export async function createVisit(data: {
  visitorName?: string
  visitorCompany?: string
  visitorPhone?: string
  visitorEmail?: string
  hostId?: string
  purpose?: string
  location?: string
  sessionId?: string
  visitor?: Visitor
  host?: Host
}): Promise<CreateVisitResponse> {
  return apiFetch('/visits', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getVisit(id: string): Promise<VisitSession> {
  return apiFetch(`/visits/${id}`)
}

export async function fetchActiveVisits(): Promise<VisitSession[]> {
  return apiFetch('/visits?status=active')
}

export async function checkoutVisit(id: string): Promise<void> {
  await apiFetch(`/visits/${id}/checkout`, { method: 'POST' })
}

export async function fetchDeliveries(status?: string): Promise<Delivery[]> {
  const query = status ? `?status=${status}` : ''
  return apiFetch(`/deliveries${query}`)
}

export async function createDelivery(data: {
  sender?: string
  recipientId?: string
  recipient?: string
  description?: string
  courier?: string
  hostId?: string
  notes?: string
}): Promise<Delivery> {
  return apiFetch('/deliveries', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function receiveDelivery(id: string): Promise<void> {
  await apiFetch(`/deliveries/${id}/receive`, { method: 'POST' })
}

// Lookup types
export type LookupItem = {
  id: number
  code: string
  label: string
  active: boolean
  sortOrder: number
}

export async function fetchPurposeLookups(): Promise<LookupItem[]> {
  return apiFetch('/lookups/purposes')
}

export async function fetchDeliveryTypeLookups(): Promise<LookupItem[]> {
  return apiFetch('/lookups/delivery-types')
}
