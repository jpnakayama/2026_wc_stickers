import { Redis } from '@upstash/redis'

const KEY_PREFIX = 'wc2026:collection:'

function redisConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  )
}

function getRedis() {
  return Redis.fromEnv()
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

  if (!redisConfigured()) {
    res.status(503).json({ error: 'missing_redis_config' })
    return
  }

  const redis = getRedis()
  const key = `${KEY_PREFIX}${syncId}`

  if (req.method === 'GET') {
    try {
      const rawVal = await redis.get(key)
      if (rawVal == null || rawVal === '') {
        res.status(200).json({})
        return
      }
      const parsed =
        typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        res.status(500).json({ error: 'corrupt_data' })
        return
      }
      res.status(200).json(parsed)
    } catch (e) {
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
      await redis.set(key, str)
      res.status(204).end()
    } catch {
      res.status(500).json({ error: 'write_failed' })
    }
    return
  }

  res.setHeader('Allow', 'GET, PUT')
  res.status(405).json({ error: 'method_not_allowed' })
}
