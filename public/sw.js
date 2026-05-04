const CACHE = 'copa2026-v3'
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

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached

      return fetch(e.request).then((res) => {
        if (
          res &&
          res.status === 200 &&
          res.type === 'basic' &&
          isHttpGet(e.request)
        ) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => {
            c.put(e.request, clone).catch(() => {
              /* ignorar: scheme não suportado, quota, etc. */
            })
          })
        }
        return res
      })
    })
  )
})
