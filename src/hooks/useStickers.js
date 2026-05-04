import { useState, useCallback, useEffect, useRef } from 'react'
import { validateSyncIdInput } from '../utils/syncId'

const SYNC_KEY = 'wc2026_sync_id'
const LEGACY_OWNED = 'wc2026_owned'

function apiBase() {
  const b = import.meta.env.VITE_API_BASE
  return typeof b === 'string' && b.length > 0 ? b.replace(/\/$/, '') : ''
}

function collectionUrl(syncId) {
  const id = encodeURIComponent(syncId)
  return `${apiBase()}/api/collection/${id}`
}

function generateSyncId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`
}

export function useStickers() {
  const [owned, setOwned] = useState({})
  const [syncId, setSyncId] = useState(null)
  const [syncStatus, setSyncStatus] = useState('loading')
  const [syncError, setSyncError] = useState(null)

  const modeRef = useRef('server')
  const syncIdRef = useRef(null)
  const saveTimerRef = useRef(null)

  const persistLocalLegacy = useCallback((data) => {
    try {
      localStorage.setItem(LEGACY_OWNED, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [])

  const loadFromServer = useCallback(
    async (sid, options = {}) => {
      const { migrateLegacy = true } = options
      setSyncStatus('loading')
      setSyncError(null)
      try {
        const r = await fetch(collectionUrl(sid))
        if (r.status === 503) {
          modeRef.current = 'local'
          let local = {}
          try {
            const raw = localStorage.getItem(LEGACY_OWNED)
            if (raw) local = JSON.parse(raw)
          } catch {
            local = {}
          }
          setOwned(local)
          setSyncStatus('local_fallback')
          return
        }
        if (!r.ok) {
          throw new Error(`http_${r.status}`)
        }
        const data = await r.json()
        let next = data && typeof data === 'object' && !Array.isArray(data) ? data : {}

        if (migrateLegacy) {
          try {
            const legacyRaw = localStorage.getItem(LEGACY_OWNED)
            if (!legacyRaw) {
              /* noop */
            } else {
              const legacy = JSON.parse(legacyRaw)
              const legacyKeys =
                legacy && typeof legacy === 'object' && !Array.isArray(legacy)
                  ? Object.keys(legacy)
                  : []
              if (legacyKeys.length > 0) {
                if (Object.keys(next).length === 0) {
                  const put = await fetch(collectionUrl(sid), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(legacy),
                  })
                  if (put.ok || put.status === 204) {
                    next = legacy
                    localStorage.removeItem(LEGACY_OWNED)
                  }
                } else {
                  localStorage.removeItem(LEGACY_OWNED)
                }
              }
            }
          } catch {
            /* ignore */
          }
        }

        modeRef.current = 'server'
        setOwned(next)
        setSyncStatus('ready')
      } catch (e) {
        modeRef.current = 'local'
        let local = {}
        try {
          const raw = localStorage.getItem(LEGACY_OWNED)
          if (raw) local = JSON.parse(raw)
        } catch {
          local = {}
        }
        setOwned(local)
        setSyncError(e?.message || 'network')
        setSyncStatus('local_fallback')
      }
    },
    []
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let sid
      try {
        sid = localStorage.getItem(SYNC_KEY)
      } catch {
        sid = null
      }
      if (!sid) {
        sid = generateSyncId()
        try {
          localStorage.setItem(SYNC_KEY, sid)
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return
      syncIdRef.current = sid
      setSyncId(sid)
      await loadFromServer(sid, { migrateLegacy: true })
    })()
    return () => {
      cancelled = true
    }
  }, [loadFromServer])

  const flushSave = useCallback(async (sid, payload) => {
    if (modeRef.current !== 'server') return
    try {
      const r = await fetch(collectionUrl(sid), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok && r.status !== 204) {
        setSyncError(`save_${r.status}`)
      } else {
        setSyncError(null)
      }
    } catch (e) {
      setSyncError(e?.message || 'save_failed')
    }
  }, [])

  const scheduleSave = useCallback(
    (payload) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null
        const sid = syncIdRef.current
        if (sid) flushSave(sid, payload)
      }, 500)
    },
    [flushSave]
  )

  const toggle = useCallback(
    (code) => {
      setOwned((prev) => {
        const next = { ...prev, [code]: !prev[code] }
        if (modeRef.current === 'local') {
          persistLocalLegacy(next)
        } else {
          scheduleSave(next)
        }
        return next
      })
    },
    [persistLocalLegacy, scheduleSave]
  )

  const isOwned = useCallback((code) => Boolean(owned[code]), [owned])

  const countOwned = useCallback(
    (codes) => codes.filter((c) => owned[c]).length,
    [owned]
  )

  const applySyncId = useCallback(
    async (newId) => {
      const trimmed = String(newId).trim()
      if (!validateSyncIdInput(trimmed)) return false
      try {
        localStorage.setItem(SYNC_KEY, trimmed)
      } catch {
        return false
      }
      syncIdRef.current = trimmed
      setSyncId(trimmed)
      await loadFromServer(trimmed, { migrateLegacy: true })
      return true
    },
    [loadFromServer]
  )

  const reloadCollection = useCallback(() => {
    const sid = syncIdRef.current
    return sid ? loadFromServer(sid, { migrateLegacy: false }) : Promise.resolve()
  }, [loadFromServer])

  return {
    owned,
    toggle,
    isOwned,
    countOwned,
    syncId,
    syncStatus,
    syncError,
    applySyncId,
    reloadCollection,
  }
}
