// PO-093: elenco per la rilettura umana. Per ogni fonte del briefing e ogni chiamata: episodio, fonte, settore
// che la mappa accende (o «—») e testo. Non decide nulla: il significato del testo lo giudica chi legge.
// Uso: node tools/fonti-settori.mjs [episodio] > elenco.txt
import { leggiDati } from './dati-disco.mjs';

const dati = leggiDati('data');
const testi = Object.assign({}, ...Object.entries(dati).filter(([k]) => k.startsWith('testi/it/')).map(([, x]) => x));
const testo = (k) => (k?.startsWith('testi:') ? testi[k.slice(6)] ?? `[[${k}]]` : k ?? '');
const solo = process.argv[2];
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m)
  .filter((m) => !solo || m.id === solo).sort((a, b) => a.episodio - b.episodio);
for (const m of missioni) {
  const nome = (id) => (id ? `${id} («${testi[`settore.${id}`] ?? id}»)` : '—');
  console.log(`\n== ${m.id}`);
  m.briefing.forEach((b, i) => console.log(`briefing[${i}] ${b.fonte} → ${nome(b.settore)}\n   ${testo(b.testo)}`));
  m.ondate.forEach((o, n) => o.chiamate.forEach((c) => console.log(`ondata ${n + 1} ${c.id} ${c.fonte} → ${nome(c.settore)}\n   ${testo(c.testo)}`)));
}
