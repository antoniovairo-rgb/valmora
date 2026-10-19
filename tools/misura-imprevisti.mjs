// PO-022 (D-190): misura prima/dopo degli imprevisti. Per ogni episodio e strategia del bot: fallite (0★), stelle medie,
// 3★; «prima» = rosso __NO_S14I01 (nessun innesto). Uso: node tools/misura-imprevisti.mjs [semi] [e01,e02,…]
import { leggiDati } from './dati-disco.mjs';
import { giraBot } from './bot.mjs';

const semi = Number(process.argv[2] ?? 1000);
const solo = process.argv[3]?.split(',');
const g = globalThis;
const filtra = (d) => Object.fromEntries(Object.entries(d).filter(([k, m]) => !k.startsWith('missioni/') || !solo || solo.includes(m.id)));
const giro = (rosso) => { if (rosso) g.__NO_S14I01 = true; else delete g.__NO_S14I01; const d = filtra(leggiDati()); delete g.__NO_S14I01; return giraBot(d, semi); };
const prima = giro(true), dopo = giro(false);
const riga = (r) => {
  const n = Object.values(r.stelle).reduce((a, b) => a + b, 0);
  const media = Object.entries(r.stelle).reduce((a, [k, v]) => a + Number(k) * v, 0) / n;
  return { fallite: (100 * r.stelle[0]) / n, media, tre: (100 * r.stelle[3]) / n };
};
const f = (x) => x.toFixed(1).replace('.', ',');
console.log(`Semi: ${semi}. «prima» = __NO_S14I01 (senza imprevisti), «dopo» = con gli imprevisti di data/imprevisti/.\n`);
console.log('| episodio | strategia | fallite prima → dopo | stelle medie prima → dopo | 3★ prima → dopo |\n|---|---|---|---|---|');
for (const a of dopo) {
  if (a.strategia.includes('[')) continue; // solo la partenza iniziale (le combinazioni D-106 restano nel passo bot)
  const b = prima.find((x) => x.missione === a.missione && x.strategia === a.strategia);
  const x = riga(b), y = riga(a);
  console.log(`| ${a.missione} | ${a.strategia} | ${f(x.fallite)}% → ${f(y.fallite)}% | ${x.media.toFixed(2).replace('.', ',')} → ${y.media.toFixed(2).replace('.', ',')} | ${f(x.tre)}% → ${f(y.tre)}% |`);
}
const blocchi = dopo.reduce((s, r) => s + r.blocchi.length, 0);
console.log(`\nBlocchi (eccezioni o nessun esito) con gli imprevisti: ${blocchi}`);
