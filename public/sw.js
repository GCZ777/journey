/* Journey service worker: keeps the app shell, photos and lookups cached
   so pages open fast and still show something offline. */
const V = 'journey-v2';
const IMG = 'journey-img';
const DATA = 'journey-data';
const CORE = ['/', '/favicon.svg', '/journey-logo.svg', '/journey-icon.svg', '/icon-192.png', '/site.webmanifest'];
const IMG_MAX = 300;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![V, IMG, DATA].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function trim(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}
async function cacheFirst(req, name) {
  const c = await caches.open(name), hit = await c.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) { c.put(req, res.clone()); trim(name, IMG_MAX); }
    return res;
  } catch (e) { return hit || Response.error(); }
}
async function staleWhileRevalidate(req, name) {
  const c = await caches.open(name), hit = await c.match(req);
  const net = fetch(req).then(res => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}
async function networkFirst(req) {
  const c = await caches.open(V);
  try { const res = await fetch(req); if (res && res.ok) c.put('/', res.clone()); return res; }
  catch (e) { return (await c.match('/')) || Response.error(); }
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (/googleapis\.com\/maps|maps\.gstatic\.com|maps\.googleapis/.test(u.href)) return; // never cache Google Maps
  if (req.mode === 'navigate') { e.respondWith(networkFirst(req)); return; }
  if (req.destination === 'image' || /upload\.wikimedia\.org/.test(u.hostname)) { e.respondWith(cacheFirst(req, IMG)); return; }
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) { e.respondWith(cacheFirst(req, V)); return; }
  if (/wikipedia\.org$/.test(u.hostname) || /open-meteo\.com$/.test(u.hostname)) { e.respondWith(staleWhileRevalidate(req, DATA)); return; }
  if (u.origin === location.origin) { e.respondWith(staleWhileRevalidate(req, V)); }
});
