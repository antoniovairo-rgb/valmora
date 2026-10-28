// Service worker di Varcalda (PO-049): il gioco installato funziona anche offline.
// Rete prima (così una versione nuova arriva subito), copia in cache come riserva quando la rete manca.
// S-22 (C14-01, pagina bianca offline):
//  (a) all'installazione entra in cache TUTTA la build, compresi i moduli caricati a richiesta (StratoCitta,
//      StratoPixi…): l'elenco FILE e la VERSIONE li scrive il build (vite.config.ts, «precache») qui sotto;
//  (b) senza rete, la pagina si dà solo alle navigazioni: mai index.html al posto di uno script;
//  (d) all'attivazione si tolgono le cache delle build vecchie.
// Rossi (dal parametro «rossi» con cui la pagina registra il worker): C14O01 = in cache solo i file citati
// dalla pagina, come prima; C14O02 = pagina per ogni richiesta fallita e cache vecchie tenute, come prima;
// C28W01 = una risposta di errore della rete vince sulla cache, come prima (C16-03).
const VERSIONE = /*VERSIONE*/'sviluppo'/*VERSIONE*/;
const FILE = /*FILE*/[]/*FILE*/;
const ROSSI = (new URL(self.location.href).searchParams.get('rossi') ?? '').split(',');
const CACHE = `varcalda-${VERSIONE}`;

self.addEventListener('install', (e) => e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  let file = FILE;
  if (ROSSI.includes('C14O01') || !file.length) {
    const pagina = await (await fetch('./', { cache: 'no-store' })).text();
    file = [...pagina.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css|png|svg|webmanifest|woff2))"/g)].map((x) => './' + x[1]);
  }
  await c.addAll([...new Set(['./', './manifest.webmanifest', './icone/icona-192.png', './icone/icona-512.png', ...file])]); // addAll rifiuta i doppioni
  await self.skipWaiting();
})()));

self.addEventListener('activate', (e) => e.waitUntil((async () => {
  if (!ROSSI.includes('C14O02')) for (const n of await caches.keys()) if (/^(valmora|varcalda)-/.test(n) && n !== CACHE) await caches.delete(n);
  await self.clients.claim();
})()));

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(async (risposta) => {
    // C16-03: online durante un rilascio, un file della build vecchia risponde 404 dal server ma è in cache: si usa
    // la cache (rosso C28W01: si restituisce il 404 come prima)
    if (!risposta.ok && !ROSSI.includes('C28W01')) { const x = await caches.match(r, { ignoreSearch: true }); if (x) return x; }
    // solo se la cache di questa build c'è ancora: un worker vecchio, mentre arriva il nuovo, non la ricrea (d)
    if (risposta.ok) { const copia = risposta.clone(); caches.has(CACHE).then((c) => c && caches.open(CACHE).then((x) => x.put(r, copia))); }
    return risposta;
  }).catch(async () => {
    const x = await caches.match(r, { ignoreSearch: true });
    if (x) return x;
    if (r.mode === 'navigate' || ROSSI.includes('C14O02')) return (await caches.match('./')) ?? Response.error();
    return Response.error(); // uno script che manca resta un errore (la pagina mostra «Riprova»), non una pagina HTML
  }));
});
