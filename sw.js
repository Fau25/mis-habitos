// Service worker de Hábitos
const CACHE = 'habitos-20261110.1513' // lo pone la compilación (vite.config.js)
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icono-180.png', 'icono-192.png', 'icono-512.png']
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: 'reload' })))))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('habitos-') && k !== CACHE).map((k) => caches.delete(k)))))
  self.clients.claim()
})
// Red primero (con la caché del navegador saltada) y copia guardada si no hay conexión
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => {
    const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); return r
  }).catch(() => caches.match(e.request, { ignoreSearch: true })))
})
