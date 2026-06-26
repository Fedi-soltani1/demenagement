// Service worker minimal de l'espace agent (PWA installable).
// Rôle : satisfaire le critère d'installabilité (manifest + SW avec handler fetch)
// et fournir un cache "app shell" léger pour un démarrage rapide hors-ligne.
const CACHE = 'dt-agents-v2'
const SHELL = ['/agent', '/agent-icon-192.png', '/agent-icon-512.png']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => undefined))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // On ne gère que les navigations GET de l'espace agent — réseau d'abord,
  // repli sur le cache si hors-ligne. Le reste passe au navigateur normalement.
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/agent')) return

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy).catch(() => undefined))
        return res
      })
      .catch(() => caches.match(request).then((r) => r ?? caches.match('/agent')))
  )
})
