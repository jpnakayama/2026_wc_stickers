import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'wc2026_theme'

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function applyMetaTheme(theme) {
  const meta = document.getElementById('meta-theme-color')
  if (!meta) return
  meta.setAttribute('content', theme === 'light' ? '#eef0f5' : '#0f1117')
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStoredTheme)

  const setTheme = useCallback((next) => {
    const t = next === 'light' ? 'light' : 'dark'
    setThemeState(t)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignorar */
    }
    applyMetaTheme(theme)
  }, [theme])

  return { theme, setTheme }
}
