// Diagnosi C-014b: registrazione AUTOMATICA del service worker (nessuna chiamata manuale), su localhost, 10 s.
import { avviaServer, apriBrowser, attendiScena } from './c14b-lib.mjs';
const { srv, url } = await avviaServer(); const b = await apriBrowser();
const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, serviceWorkers: 'allow' });
const p = await ctx.newPage();
await p.goto(url.replace('127.0.0.1', 'localhost')); console.log('scena:', await attendiScena(p, ['titolo'], 8000));
const campioni = [];
for (let i = 0; i < 20; i++) { campioni.push(await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)); await new Promise((r) => setTimeout(r, 500)); }
console.log('registrazioni campionate ogni 500 ms per 10 s:', campioni.join(' '));
await b.close(); srv.close();
