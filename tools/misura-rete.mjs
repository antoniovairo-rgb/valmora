// PO-145 (D-217): misura per la privacy policy. Ogni richiesta di rete del browser durante il giro di tools/foto.mjs
// (home, crediti, nuova partita, guida, città, e01-e03 giocati fino al verbale, ripresa dopo ricarica, archivio) e del
// guardiano della home; poi conta quelle verso host diversi dal server locale della build.
// Uso: node tools/misura-rete.mjs [build] [larghezze]   (predefinite: dist, 360). Stampa un JSON; esce 1 se c'è
// almeno una richiesta esterna. Le foto vanno in out/rete (non servono: il giro di foto.mjs le scatta comunque).
import { chromium } from 'playwright-core';

const [build = 'dist', larghezze = '360'] = process.argv.slice(2);
process.env.VALMORA_LARGHEZZE = larghezze;
const richieste = [];
const segui = (pagina) => pagina.on('request', (r) => richieste.push({ url: r.url(), tipo: r.resourceType() }));
const lancia = chromium.launch.bind(chromium);
chromium.launch = async (...a) => {
  const b = await lancia(...a);
  const pagina = b.newPage.bind(b), contesto = b.newContext.bind(b);
  b.newPage = async (...x) => { const p = await pagina(...x); segui(p); return p; };
  b.newContext = async (...x) => { const c = await contesto(...x); c.on('page', segui); return c; };
  return b;
};
const { giraFoto } = await import('./foto.mjs');
const giri = await giraFoto('out/rete', build);
const host = (u) => { try { return new URL(u).hostname; } catch { return '?'; } };
const locali = new Set(['127.0.0.1', 'localhost', '']);
const esterne = richieste.filter((r) => /^(https?|wss?):/.test(r.url) && !locali.has(host(r.url)));
const interrotti = giri.flatMap((g) => g.attesi.filter((x) => !x.ok && /giro interrotto/.test(x.cosa)).map((x) => x.cosa));
console.log(JSON.stringify({
  build, larghezze, richieste: richieste.length, schemi: [...new Set(richieste.map((r) => r.url.split(':')[0]))],
  host: [...new Set(richieste.map((r) => host(r.url)))], esterne: esterne.length, elenco_esterne: esterne.slice(0, 50), interrotti,
}, null, 2));
process.exit(esterne.length ? 1 : 0);
