// C-053 punto 2: scorrimento di chiamata e risposta per le carte nuove e le varianti, letto sulla resa vera.
// Uso: node coordination/sonde/c053-scorrimento.mjs <LxA> <tutte|campione> [foto=0|1]
// Ogni carta si porta nella scena «chiamata» da un salvataggio costruito col motore (seme scelto perché la carta compaia, ondata
// giocata dal bot attento fino a quella carta); poi per ogni opzione: tocco, «Conferma», scena «risposta».
import { mkdirSync, writeFileSync } from 'node:fs';
import * as L from './c053-lib.mjs';
import * as M from '../../src/logica/missione.ts';
import { chiamateDellaPartita } from '../../src/logica/partita.ts';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';

const [vp, quali = 'campione', conFoto = '0'] = process.argv.slice(2), [W, H] = vp.split('x').map(Number);
const R = JSON.parse((await import('node:fs')).readFileSync('coordination/collaudi/c053/dati/testi-nuovi.json', 'utf8'));
const nuove = R.filter((r) => (quali === 'classiche' ? r.tipo === 'classica' : r.tipo !== 'classica'));
const lung = (r) => r.testo.length + (r.commento ?? '').length + r.opzioni.reduce((a, o) => a + o.testo.length + (o.costo ?? '').length, 0);
const piuLunghe = [...nuove].sort((a, b) => lung(b) - lung(a)).slice(0, 20).map((r) => `${r.ep}/${r.id}`);
const sceltiRegolari = nuove.filter((_, i) => i % 12 === 0).map((r) => `${r.ep}/${r.id}`);
const campione = new Set([...piuLunghe, ...sceltiRegolari]);
const SOLO = process.env.C053_SOLO?.split(',');
const fotoSet = new Set(SOLO ?? piuLunghe.slice(0, 5));
const daFare = SOLO ? nuove.filter((r) => SOLO.includes(`${r.ep}/${r.id}`)) : quali === 'tutte' ? nuove : nuove.filter((r) => campione.has(`${r.ep}/${r.id}`));

/** Stato di gioco della missione fermo sulla carta: primo seme in cui compare, ondate precedenti e chiamate prima di lei risolte dal bot. */
function statoSuCarta(m, r, vars) {
  const bot = attenta(creaCaso('c053-scorr'), L.dich);
  for (let seme = 1; seme < 400; seme++) {
    const o = m.ondate.find((x) => x.n === r.ondata);
    if (!chiamateDellaPartita(m, o, seme).some((c) => c.id === r.id)) continue;
    let s = M.iniziaMissione(m, vars, L.dich, seme);
    while (s.ondata < r.ondata) { s = M.schiera(m, s, bot.schiera(m, s, L.dich)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, bot.scegli(m, s, c), L.dich); s = M.chiudiOndata(m, s, L.dich); }
    s = M.schiera(m, s, bot.schiera(m, s, L.dich));
    for (let c = M.chiamateAperte(m, s)[0]; c && c.id !== r.id; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, bot.scegli(m, s, c), L.dich);
    const aperta = M.chiamateAperte(m, s)[0];
    if (aperta?.id === r.id) return { s, seme };
  }
  return null;
}

const misura = (p) => p.evaluate(() => {
  const d = document.scrollingElement, sc = document.querySelector('.scena');
  const fuori = [...document.querySelectorAll('.scena *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1); }).length;
  const tagliati = [...document.querySelectorAll('.scena .opzione, .scena .messaggio, .scena p')].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
  const opz = document.querySelector('.scena .opzione')?.getBoundingClientRect();
  return { ecc: d.scrollHeight - innerHeight, largh: d.scrollWidth - d.clientWidth, fuori, tagliati, scena: sc?.dataset.scena, messaggio: document.querySelector('[data-messaggio]')?.dataset.messaggio ?? null, opzioniSottoPiega: opz ? Math.round(opz.bottom - innerHeight) : null };
});

const A = await L.avvia();
const cartellaFoto = 'coordination/collaudi/c053/scorrimento'; if (conFoto === '1') mkdirSync(cartellaFoto, { recursive: true });
const out = [], senza = [];
const sal = new Map();
for (const r of daFare) {
  const m = L.missioni.find((x) => x.id === r.ep);
  if (!sal.has(r.ep)) sal.set(r.ep, L.salvataggioPrima(r.ep));
  const base = sal.get(r.ep), ris = statoSuCarta(m, r, base.variabili);
  if (!ris) { senza.push(`${r.ep}/${r.id}`); continue; }
  const grezzo = JSON.stringify({ ...base, in_corso: ris.s });
  const p = out.pagina ?? (out.pagina = await L.nuovaPagina(A.browser, A.url, W, H, null));
  const carica = async () => { await p.evaluate(([k, v]) => localStorage.setItem(k, v), [L.CHIAVE, grezzo]); await p.reload(); await L.lento(p); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('[data-opzione]', { timeout: 8000 }); await L.lento(p); await p.waitForTimeout(250); };
  const rec = { ep: r.ep, id: r.id, tipo: r.tipo, ondata: r.ondata, seme: ris.seme, righe: lung(r), vp, risposte: [] };
  try {
    await carica(); rec.chiamata = await misura(p);
    if (conFoto === '1' && (fotoSet.has(`${r.ep}/${r.id}`))) await p.screenshot({ path: `${cartellaFoto}/${vp}-${r.ep}-${r.id}-chiamata.png`, fullPage: true });
    for (const o of r.opzioni) {
      await carica();
      await p.click(`[data-opzione="${o.id}"]`); await p.waitForTimeout(100); await p.click('[data-conferma]'); await p.waitForSelector('.scena[data-scena="risposta"]', { timeout: 8000 }); await L.lento(p); await p.waitForTimeout(350);
      const mis = { opzione: o.id, ...(await misura(p)), lungRisposta: o.risposta.length };
      rec.risposte.push(mis);
      if (conFoto === '1' && fotoSet.has(`${r.ep}/${r.id}`)) await p.screenshot({ path: `${cartellaFoto}/${vp}-${r.ep}-${r.id}-risposta-${o.id}.png`, fullPage: true });
    }
  } catch (e) { rec.errore = String(e.message).split('\n')[0]; }
  out.push(rec);
  process.stdout.write(`${r.ep}/${r.id}: chiamata ${rec.chiamata?.ecc} | risposte ${rec.risposte.map((x) => x.ecc).join(',')}${rec.errore ? ' ERR ' + rec.errore : ''}\n`);
}
const pg = out.pagina; delete out.pagina;
writeFileSync(`coordination/collaudi/c053/dati/scorrimento-${vp}-${SOLO ? 'solo' : quali}.json`, JSON.stringify({ vp, quali, senzaSeme: senza, carte: out, errori: pg?.errori ?? [] }));
console.log('senza seme:', senza, 'errori pagina:', pg?.errori);
await A.chiudi();
