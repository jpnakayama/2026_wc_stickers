import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function dismissAppSplash() {
  const el = document.getElementById('app-splash')
  if (!el) return
  el.classList.add('app-splash--hide')
  let removed = false
  const done = () => {
    if (removed) return
    removed = true
    el.remove()
  }
  el.addEventListener('transitionend', done, { once: true })
  setTimeout(done, 500)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

requestAnimationFrame(() => {
  requestAnimationFrame(dismissAppSplash)
})

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
