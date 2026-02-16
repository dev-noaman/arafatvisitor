/**
 * Notification services for visitor management
 */

function getApiBase(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  const raw = sessionStorage.getItem('vms_config')
  const config = raw ? JSON.parse(raw) : null
  return config?.apiBase ?? null
}

function getAuthToken(): string | null {
  return localStorage.getItem('vms_token')
}

export async function sendHostEmail(
  email: string,
  subject: string,
  html: string
): Promise<void> {
  const base = getApiBase()
  if (!base) {
    console.log('Email notification (simulated):', { email, subject, html })
    return
  }

  const token = getAuthToken()
  await fetch(`${base}/notifications/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ email, subject, html }),
  })
}

export async function sendHostWhatsApp(
  phone: string,
  message: string
): Promise<void> {
  const base = getApiBase()
  if (!base) {
    console.log('WhatsApp notification (simulated):', { phone, message })
    return
  }

  const token = getAuthToken()
  await fetch(`${base}/notifications/whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ phone, message }),
  })
}
