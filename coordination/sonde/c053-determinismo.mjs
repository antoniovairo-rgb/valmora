// C-053 punti 3b e 4: stessa partita salvata, stesso episodio, stesso tentativo → stessa sequenza (testi letti compresi).
// A: di fila · B: con ricarica della pagina prima di ogni schieramento e di ogni chiamata · C: browser nuovo, di fila
// Poi: da una sconfitta salvata, «Riparti» e «Ricomincia» due volte in contesti diversi.
// Uso: node coordination/sonde/c053-determinismo.mjs e09 [seme]
import { writeFileSync } from 'node:fs';
import * as L from './c053-lib.mjs';
const id = process.argv[2], seme = Number(process.argv[3] ?? 7), m = L.missioni.find((x) => x.id === id);
const firma = (r, da = 1) => r.filter((x) => x.ondata >= da).map((x) => `${x.ondata}:${x.id}|${x.seme}|${x.letto?.testo}|${x.scelta}|${x.risposta}`);
const confronta = (a, b) => { if (a.length !== b.length) return `lunghezze ${a.length} / ${b.length}`; const i = a.findIndex((x, k) => x !== b[k]); return i < 0 ? 'uguali' : `prima differenza alla chiamata ${i}: «${a[i].slice(0, 90)}» / «${b[i].slice(0, 90)}»`; };
const gioca = async (browser, url, salvataggio, opz = {}) => {
  const p = await L.nuovaPagina(browser, url, 375, 667, salvataggio);
  if (!opz.dopoRiparti) await L.apriEpisodio(p, m);
  const visti = new Set(); let ricariche = 0;
  const ferma = opz.ricarica ? async (q, pg) => { const chiave = q + ':' + (await pg.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('valmora-salvataggio')).in_corso?.risposte ?? {}) + (document.querySelector('[data-messaggio]')?.dataset.messaggio ?? '')));
      if ((q === 'chiamata' || q === 'schieramento') && !visti.has(chiave)) { visti.add(chiave); await pg.waitForTimeout(500); await pg.reload(); await L.lento(pg); await pg.getByRole('button', { name: 'Riprendi' }).click(); await L.lento(pg); await pg.waitForTimeout(300); ricariche++; } return false; } : null;
  const r = await L.giocaEpisodio(p, m, { ferma, strategia: opz.strategia });
  const s = await L.stato(p);
  return { r, ricariche, tent: s.episodi[id]?.tentativi, esito: s.episodi[id]?.migliore?.esito, errori: p.errori, p };
};
const base = L.salvataggioPrima(id, { seme });
const A1 = await L.avvia(), A2 = await L.avvia();
const a = await gioca(A1.browser, A1.url, base), b = await gioca(A1.browser, A1.url, base, { ricarica: true }), c = await gioca(A2.browser, A2.url, base);
const out = { episodio: id, semeSalvataggio: seme, seme_episodio: a.r[0]?.seme, chiamate: a.r.length, ricaricheB: b.ricariche, A_vs_B: confronta(firma(a.r), firma(b.r)), A_vs_C: confronta(firma(a.r), firma(c.r)), errori: [...a.errori, ...b.errori, ...c.errori], esiti: [a.esito, b.esito, c.esito], tent: [a.tent, b.tent, c.tent] };
console.log(JSON.stringify(out));
// sconfitta → Riparti / Ricomincia in due contesti
const f = await gioca(A1.browser, A1.url, base, { strategia: 'peggiore' });
const sconf = await f.p.evaluate((k) => localStorage.getItem(k), L.CHIAVE), sv = JSON.parse(sconf);
out.sconfitta = { scena: await L.scenaDi(f.p), sconfitta_seme: sv.sconfitta?.seme ?? null, in_corso: !!sv.in_corso, riparti: await f.p.locator('[data-azione="riparti"]').count() };
for (const azione of ['riparti', 'rigioca']) {
  const giri = [];
  for (const A of [A1, A2, A1]) {
    const p = await L.nuovaPagina(A.browser, A.url, 375, 667, null);
    await p.evaluate(([k, v]) => localStorage.setItem(k, v), [L.CHIAVE, sconf]); await p.reload(); await L.lento(p);
    await p.getByRole('button', { name: 'Riprendi' }).click(); await L.lento(p);
    if (!(await p.locator(`[data-azione="${azione}"]`).count())) { giri.push({ nessun: azione }); await p.close(); continue; }
    await p.click(`[data-azione="${azione}"]`); await L.lento(p);
    const r = await L.giocaEpisodio(p, m, { strategia: 'peggiore' });
    giri.push({ r: firma(r, azione === 'riparti' ? r[0]?.ondata : 1), seme: r[0]?.seme }); await p.close();
  }
  out[azione] = { semi: giri.map((g) => g.seme ?? g.nessun), uguali_1_2: giri[0].r && giri[1].r ? confronta(giri[0].r, giri[1].r) : 'n/d', uguali_1_3: giri[0].r && giri[2].r ? confronta(giri[0].r, giri[2].r) : 'n/d' };
}
console.log(JSON.stringify(out.sconfitta), JSON.stringify(out.riparti), JSON.stringify(out.rigioca));
writeFileSync(`coordination/collaudi/c053/dati/determinismo-${id}-${seme}.json`, JSON.stringify(out, null, 1));
await A1.chiudi(); await A2.chiudi();
