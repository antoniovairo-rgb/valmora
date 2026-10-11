// Service worker di Valmora (PO-049): il gioco installato funziona anche offline.
// Rete prima (così una versione nuova arriva subito), copia in cache come riserva quando la rete manca.
const CACHE = 'valmora-v1';
// All'installazione: la pagina, il manifest, le icone e i file che la pagina carica (nomi con l'impronta della build).
self.addEventListener('install', (e) => e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  const pagina = await (await fetch('./', { cache: 'no-store' })).text();
  const file = [...pagina.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css|png|svg|webmanifest|woff2))"/g)].map((x) => './' + x[1]);
  await c.addAll([...new Set(['./', './manifest.webmanifest', './icone/icona-192.png', './icone/icona-512.png', ...file])]); // addAll rifiuta i doppioni
  await self.skipWaiting();
})()));
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then((risposta) => {
    if (risposta.ok) { const copia = risposta.clone(); caches.open(CACHE).then((c) => c.put(r, copia)); }
    return risposta;
  }).catch(() => caches.match(r).then((x) => x ?? caches.match('./'))));
});
