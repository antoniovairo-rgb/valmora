// C-053 punto 1: lo stesso episodio giocato più volte con la resa vera, da capo («Ricomincia») e con «Riparti».
// Uso: node coordination/sonde/c053-varieta.mjs e01 [dafare=3]
import { writeFileSync } from 'node:fs';
import * as L from './c053-lib.mjs';
const id = process.argv[2], n = Number(process.argv[3] ?? 3);
const m = L.missioni.find((x) => x.id === id);
const A = await L.avvia();
const p = await L.nuovaPagina(A.browser, A.url, 375, 667, L.salvataggioPrima(id));
const sintesi = (r, da = 1) => r.filter((x) => x.ondata >= da).map((x) => `${x.ondata}${x.imprevisto ? '*' : ''}${x.variante ? '~' : ''}:${x.id}`).join(' ');
const giri = [];
const fallita = async () => (await p.locator('[data-fallita]').count()) > 0;
await L.apriEpisodio(p, m);
let ultimo = Date.now();
for (let k = 0; k < n; k++) {
  const tent = (await L.stato(p))?.episodi?.[id]?.tentativi ?? 0, seme = (await L.stato(p))?.in_corso?.seme;
  const r = await L.giocaEpisodio(p, m, { strategia: 'peggiore' });
  const fine = await L.stato(p);
  giri.push({ modo: k === 0 ? 'primo' : 'da capo (Ricomincia)', tent, seme, fallita: await fallita(), chiamate: r, ms: Date.now() - ultimo });
  console.log(giri.at(-1).modo, 'tent', tent, 'seme', seme, 'fallita', giri.at(-1).fallita, giri.at(-1).ms + 'ms\n  ', sintesi(r));
  ultimo = Date.now();
  if (!(await fallita())) { console.log('  non fallita: Rigioca dalla città'); await L.tocca(p, '[data-azione="citta"]'); await L.lento(p); await L.tocca(p, `[data-stagione="${m.stagione}"]`); await p.locator(`[data-episodio="${id}"] .settore-punto`).click(); await p.click('[data-azione="avvia-episodio"]'); await L.lento(p); await L.tocca(p, '[data-azione="conferma-rigioca"]'); await L.lento(p); continue; }
  await p.click('[data-azione="rigioca"]'); await L.lento(p);
}
// Riparti: dall'ultima sconfitta, quante volte serve
for (let k = 0; k < n; k++) {
  if (!(await L.scenaDi(p) === 'verbale' && await fallita())) { // porta a una sconfitta
    const r0 = await L.giocaEpisodio(p, m, { strategia: 'peggiore' });
    if (!(await fallita())) { console.log('  Riparti: episodio non fallito, salto'); break; }
  }
  if (!(await p.locator('[data-azione="riparti"]').count())) { console.log('  nessun «Riparti»'); break; }
  const da = Number(await p.getAttribute('[data-azione="riparti"]', 'data-ondata'));
  await p.click('[data-azione="riparti"]'); await L.lento(p);
  const sv = await L.stato(p);
  const r = await L.giocaEpisodio(p, m, { strategia: 'peggiore' });
  giri.push({ modo: `Riparti dall'ondata ${da}`, tent: sv.episodi[id]?.tentativi, seme: sv.in_corso?.seme, fallita: await fallita(), chiamate: r });
  console.log(`Riparti dall'ondata ${da}, seme ${sv.in_corso?.seme}\n  `, sintesi(r, da));
}
console.log('errori pagina:', p.errori);
writeFileSync(`coordination/collaudi/c053/dati/varieta-${id}.json`, JSON.stringify(giri.map((g) => ({ ...g, chiamate: g.chiamate.map((c) => ({ ...c, letto: undefined })) }))));
writeFileSync(`coordination/collaudi/c053/dati/varieta-${id}-testi.json`, JSON.stringify(giri.map((g) => g.chiamate.map((c) => ({ ondata: c.ondata, id: c.id, imp: c.imprevisto, var: c.variante, letto: c.letto?.testo, risposta: c.risposta })))));
await A.chiudi();
