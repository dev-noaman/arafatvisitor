import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize API config for kiosk (backend URL)
if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('vms_config')) {
  sessionStorage.setItem(
    'vms_config',
    JSON.stringify({ apiBase: 'http://localhost:3000', location: 'Barwa Towers' })
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
