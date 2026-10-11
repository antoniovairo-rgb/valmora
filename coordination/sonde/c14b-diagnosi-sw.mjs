// Diagnosi C-014b: perché il service worker non risulta registrato su localhost (misura, non correzione).
import { avviaServer, apriBrowser, attendiScena } from './c14b-lib.mjs';
const { srv, url } = await avviaServer(); const b = await apriBrowser();
const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, serviceWorkers: 'allow' });
const p = await ctx.newPage(); const errori = []; p.on('console', (x) => errori.push(`${x.type()}: ${x.text()}`)); p.on('pageerror', (e) => errori.push(`pageerror: ${e.message}`));
const urlL = url.replace('127.0.0.1', 'localhost');
await p.goto(urlL); console.log('scena prima pagina:', await attendiScena(p, ['titolo'], 8000));
console.log('href:', await p.evaluate(() => location.href), '· secure:', await p.evaluate(() => window.isSecureContext));
console.log('sw.js:', JSON.stringify(await p.evaluate(async () => { const r = await fetch('./sw.js'); return { stato: r.status, tipo: r.headers.get('content-type') }; })));
console.log('register:', JSON.stringify(await p.evaluate(() => navigator.serviceWorker.register('./sw.js').then((r) => ({ ok: r.scope }), (e) => ({ errore: String(e) })))));
await new Promise((r) => setTimeout(r, 2000));
console.log('registrazioni dopo register:', JSON.stringify(await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map((r) => ({ scope: r.scope, attivo: !!r.active, installing: !!r.installing, waiting: !!r.waiting })))));
console.log('console:', JSON.stringify(errori.slice(0, 5)));
await b.close(); srv.close();
