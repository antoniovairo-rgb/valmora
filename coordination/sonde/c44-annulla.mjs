// C-044: «Annulla» dopo una risposta (PO-142, D-198), in tempo reale (niente __VALMORA_SECONDO_MS). Misura: quanto resta il pulsante
// dopo il tocco, i valori del conto, e che cosa succede se si annulla (la risposta non si salva, le opzioni tornano toccabili).
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { salvataggioTutti } from '../../tools/foto-bozze.mjs';
import { partenzeAttente } from '../../tools/foto-schieramenti.mjs';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, schiera } from '../../src/logica/missione.ts';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const ms = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x);
const st = partenzeAttente('data').find((x) => x.m.id === 'e01' && x.n === 1); const s = schiera(st.m, st.s, st.d); const c = chiamateAperte(st.m, s)[0];
const sal = JSON.stringify({ ...salvataggioTutti(ms, v0), missioni_concluse: [], episodi: {}, in_corso: s });
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = [];
try {
  for (const modo of ['lascia scadere', 'annulla a 1 s']) for (let prova = 0; prova < 3; prova++) {
    const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce' });
    await p.goto(url); await p.evaluate(([k, x]) => localStorage.setItem(k, x), ['valmora-salvataggio', sal]); await p.reload();
    await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector(`[data-messaggio="chiamata-${c.id}"]`); await p.waitForTimeout(800);
    const opz = c.opzioni[0].id;
    await p.evaluate(() => { const t0 = performance.now(); globalThis.__tr = []; const f = () => { const e = document.querySelector('[data-conto]'); globalThis.__tr.push([Math.round(performance.now() - t0), e ? e.dataset.conto : null, !!document.querySelector('[data-azione="continua"]')]); if (performance.now() - t0 < 6000) requestAnimationFrame(f); }; f(); });
    await p.click(`[data-opzione="${opz}"]`);
    if (modo === 'annulla a 1 s') { await p.waitForTimeout(1000); await p.click('[data-annulla]'); }
    await p.waitForTimeout(5000);
    const r = await p.evaluate(() => { const tr = globalThis.__tr; const prima = tr.find((x) => x[1] !== null), ultimo = [...tr].reverse().find((x) => x[1] !== null), cont = tr.find((x) => x[2]); return { primoConto: prima, ultimoConto: ultimo, valori: [...new Set(tr.map((x) => x[1]).filter(Boolean))], comparsaContinua: cont?.[0] ?? null, opzioniToccabili: [...document.querySelectorAll('.opzione:not([data-esaurita])')].filter((o) => !o.disabled).length }; });
    const salvata = await p.evaluate(([k, id]) => JSON.parse(localStorage.getItem(k)).in_corso?.risposte?.[id] ?? null, ['valmora-salvataggio', c.id]);
    out.push({ modo, prova, ...r, salvata }); await p.close();
  }
} finally { await b.close(); srv.close(); }
console.log(`chiamata ${c.id}, opzione ${c.opzioni[0].id}`); for (const o of out) console.log(JSON.stringify(o));
