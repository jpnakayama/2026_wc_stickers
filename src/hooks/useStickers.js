import { useState, useCallback } from 'react'

const STORAGE_KEY = 'wc2026_owned'

export function useStickers() {
  const [owned, setOwned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  })

  const toggle = useCallback((code) => {
    setOwned((prev) => {
      const next = { ...prev, [code]: !prev[code] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isOwned = useCallback((code) => Boolean(owned[code]), [owned])

  const countOwned = useCallback(
    (codes) => codes.filter((c) => owned[c]).length,
    [owned]
  )

  return { owned, toggle, isOwned, countOwned }
}
