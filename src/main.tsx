import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize API config for kiosk (backend URL)
// Use current origin for API when not on localhost (production), else localhost:3000
if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('vms_config')) {
  const isLocal = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname)
  const apiBase = isLocal ? 'http://localhost:3000' : window.location.origin
  sessionStorage.setItem(
    'vms_config',
    JSON.stringify({ apiBase, location: 'Barwa Towers' })
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
