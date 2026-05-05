import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const LEGACY_OWNED = 'wc2026_owned'

function validateOwnedPayload(obj) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false
  const keys = Object.keys(obj)
  if (keys.length > 1200) return false
  for (const k of keys) {
    if (typeof k !== 'string' || k.length < 2 || k.length > 12) return false
    if (!/^[A-Za-z0-9._-]+$/.test(k)) return false
    const v = obj[k]
    if (v !== true && v !== false) return false
  }
  return true
}

/**
 * @param {string} userId - auth.users.id (UUID)
 */
export function useStickers(userId) {
  const [owned, setOwned] = useState({})
  const [albumStatus, setAlbumStatus] = useState('loading')
  const [albumError, setAlbumError] = useState(null)
  const saveTimerRef = useRef(null)

  const loadAlbum = useCallback(async () => {
    if (!userId || !supabase) {
      setAlbumStatus('error')
      setAlbumError('no_client')
      return
    }
    setAlbumStatus('loading')
    setAlbumError(null)
    try {
      const { data, error: qerr } = await supabase
        .from('albums')
        .select('payload')
        .eq('user_id', userId)
        .maybeSingle()

      if (qerr) throw qerr

      let next =
        data?.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)
          ? data.payload
          : {}

      try {
        const legacyRaw = localStorage.getItem(LEGACY_OWNED)
        if (legacyRaw) {
          const legacy = JSON.parse(legacyRaw)
          const legacyOk =
            legacy && typeof legacy === 'object' && !Array.isArray(legacy) && validateOwnedPayload(legacy)
          if (legacyOk) {
            if (Object.keys(next).length === 0 && Object.keys(legacy).length > 0) {
              const { error: uperr } = await supabase.from('albums').upsert(
                {
                  user_id: userId,
                  payload: legacy,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
              )
              if (!uperr) {
                next = legacy
                localStorage.removeItem(LEGACY_OWNED)
              }
            } else {
              localStorage.removeItem(LEGACY_OWNED)
            }
          }
        }
      } catch {
        /* ignorar migração legacy */
      }

      setOwned(next)
      setAlbumStatus('ready')
    } catch (e) {
      setAlbumError(e?.message || 'load_failed')
      setAlbumStatus('error')
      let local = {}
      try {
        const raw = localStorage.getItem(LEGACY_OWNED)
        if (raw) local = JSON.parse(raw)
      } catch {
        local = {}
      }
      setOwned(typeof local === 'object' && local && !Array.isArray(local) ? local : {})
    }
  }, [userId])

  useEffect(() => {
    loadAlbum()
  }, [loadAlbum])

  const flushSave = useCallback(
    async (payload) => {
      if (!userId || !supabase) return
      if (!validateOwnedPayload(payload)) return
      try {
        const { error } = await supabase.from('albums').upsert(
          {
            user_id: userId,
            payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        if (error) {
          setAlbumError(error.message)
        } else {
          setAlbumError(null)
        }
      } catch (e) {
        setAlbumError(e?.message || 'save_failed')
      }
    },
    [userId]
  )

  const scheduleSave = useCallback(
    (payload) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null
        flushSave(payload)
      }, 500)
    },
    [flushSave]
  )

  const toggle = useCallback(
    (code) => {
      setOwned((prev) => {
        const next = { ...prev, [code]: !prev[code] }
        if (!validateOwnedPayload(next)) return prev
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave]
  )

  const isOwned = useCallback((code) => Boolean(owned[code]), [owned])

  const countOwned = useCallback(
    (codes) => codes.filter((c) => owned[c]).length,
    [owned]
  )

  const reloadAlbum = useCallback(() => loadAlbum(), [loadAlbum])

  return {
    owned,
    toggle,
    isOwned,
    countOwned,
    albumStatus,
    albumError,
    reloadAlbum,
  }
}
