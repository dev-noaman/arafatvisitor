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

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBase()
  if (!base) throw new Error('API not configured')
  
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  
  const res = await fetch(`${base}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || 'Request failed')
  }
  return res.json()
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
