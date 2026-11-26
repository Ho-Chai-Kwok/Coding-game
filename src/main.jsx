import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

// After a new deploy, a tab opened on the old version still asks for the
// old hashed chunk files, which no longer exist, so opening a lazy-loaded
// screen would crash. Vite fires this event when that happens: reload once
// to pick up the new version (guarded so a real outage can't loop).
window.addEventListener('vite:preloadError', (event) => {
  let last = 0
  try { last = Number(sessionStorage.getItem('cq-chunk-reload') || 0) } catch { /* storage blocked */ }
  if (Date.now() - last < 30000) return
  try { sessionStorage.setItem('cq-chunk-reload', String(Date.now())) } catch { /* storage blocked */ }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
)
