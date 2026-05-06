/* Aumentar CACHE (ex. v6) após mudanças grandes em HTML/imagens em /public para forçar atualização nos clientes. */
const CACHE = 'copa2026-v5'
const PRECACHE = ['/', '/index.html']

function isHttpGet(request) {
  if (request.method !== 'GET') return false
  try {
    const url = new URL(request.url)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isCacheableResponse(res) {
  return res && res.status === 200 && res.type === 'basic'
}

/** Online: rede primeiro (HTML/rotas sempre frescos); offline: shell em cache. */
async function networkFirst(request) {
  const cache = await caches.open(CACHE)
  try {
    const res = await fetch(request)
    if (isCacheableResponse(res)) {
      await cache.put(request, res.clone())
    }
    return res
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    throw new Error('offline')
  }
}

/** Mostra cache já guardado; em paralelo tenta rede para atualizar a próxima visita. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)

  if (cached) {
    fetch(request)
      .then((res) => {
        if (isCacheableResponse(res)) cache.put(request, res.clone()).catch(() => {})
      })
      .catch(() => {})
    return cached
  }

  const res = await fetch(request)
  if (isCacheableResponse(res)) await cache.put(request, res.clone()).catch(() => {})
  return res
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  if (!isHttpGet(e.request)) return
  let reqUrl
  try {
    reqUrl = new URL(e.request.url)
  } catch {
    return
  }
  if (reqUrl.origin !== self.location.origin) return

  if (e.request.mode === 'navigate') {
    e.respondWith(
      networkFirst(e.request).catch(() => caches.match('/index.html'))
    )
    return
  }

  e.respondWith(staleWhileRevalidate(e.request))
})
