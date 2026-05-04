import { createClient } from '@supabase/supabase-js'

function supabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function getSupabase() {
  if (!supabaseConfigured()) return null
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function validateSyncId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(id)
}

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

export default async function handler(req, res) {
  const raw = req.query.syncId
  const syncId = Array.isArray(raw) ? raw[0] : raw

  if (!validateSyncId(syncId)) {
    res.status(400).json({ error: 'invalid_sync_id' })
    return
  }

  const supabase = getSupabase()
  if (!supabase) {
    res.status(503).json({ error: 'missing_supabase_config' })
    return
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('payload')
        .eq('id', syncId)
        .maybeSingle()

      if (error) {
        res.status(500).json({ error: 'read_failed', detail: error.message })
        return
      }
      const payload = data?.payload
      if (payload == null) {
        res.status(200).json({})
        return
      }
      if (typeof payload !== 'object' || Array.isArray(payload)) {
        res.status(500).json({ error: 'corrupt_data' })
        return
      }
      res.status(200).json(payload)
    } catch {
      res.status(500).json({ error: 'read_failed' })
    }
    return
  }

  if (req.method === 'PUT') {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body || '{}')
      } catch {
        res.status(400).json({ error: 'invalid_json' })
        return
      }
    }
    if (!validateOwnedPayload(body)) {
      res.status(400).json({ error: 'invalid_payload' })
      return
    }
    const str = JSON.stringify(body)
    if (str.length > 200000) {
      res.status(413).json({ error: 'payload_too_large' })
      return
    }
    try {
      const { error } = await supabase.from('collections').upsert(
        {
          id: syncId,
          payload: body,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      if (error) {
        res.status(500).json({ error: 'write_failed', detail: error.message })
        return
      }
      res.status(204).end()
    } catch {
      res.status(500).json({ error: 'write_failed' })
    }
    return
  }

  res.setHeader('Allow', 'GET, PUT')
  res.status(405).json({ error: 'method_not_allowed' })
}
