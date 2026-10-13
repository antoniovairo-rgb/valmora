// Sonda C-017 (credibilità): copione di ogni episodio in ordine di gioco, con condizioni («se») ed effetti di ogni
// opzione, per cercare i testi che contraddicono una scelta fatta prima (PO-086). Non giudica: stampa.
// Uso: node coordination/sonde/c17-copione.mjs [e01,e02,…] > copione.txt
import { leggiDati } from '../../tools/dati-disco.mjs';

const dati = leggiDati('data');
const testi = Object.assign({}, ...Object.entries(dati).filter(([k]) => k.startsWith('testi/it/')).map(([, x]) => x));
const t = (k) => (typeof k === 'string' && k.startsWith('testi:') ? testi[k.slice(6)] ?? `[[${k}]]` : k ?? '');
const solo = process.argv[2]?.split(',');
const se = (c) => (c && Object.keys(c).length ? ` [se ${JSON.stringify(c)}]` : '');
const eff = (es) => es.map((e) => Object.entries(e).map(([k, v]) => `${k}:${v}`).join(' ')).join(' · ');
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m)
  .filter((m) => (solo ? solo.includes(m.id) : m.stagione === 1)).sort((a, b) => a.episodio - b.episodio);
for (const m of missioni) {
  console.log(`\n==== ${m.id} «${t(m.titolo)}» disponibile${se(m.disponibile_se) || ' sempre'}`);
  for (const k of Object.keys(testi).filter((k) => k.startsWith(`${m.id}.intro`))) console.log(`intro ${k}: ${testi[k]}`);
  m.briefing.forEach((b, i) => console.log(`briefing[${i}] ${b.fonte} (${b.affidabilita}, vera=${b.vera}) → ${b.settore ?? '—'}: ${t(b.testo)}`));
  console.log(`settori: ${m.mappa.settori.map((s) => `${s.id}(${s.tipo})`).join(', ')}`);
  for (const o of m.ondate) {
    console.log(`-- ondata ${o.n} «${t(o.titolo)}»`);
    for (const e of o.eventi) console.log(`   evento ${e.id} ${e.tipo} @${e.settore} p${e.pressione}${se(e.se)}`);
    for (const c of o.chiamate ?? []) {
      console.log(`   CHIAMATA ${c.id} (${c.fonte} → ${c.settore ?? '—'})${se(c.se)}: ${t(c.testo)}`);
      if (c.commento) console.log(`      vice: ${t(c.commento)}`);
      for (const x of c.opzioni) console.log(`      > ${x.id}${se(x.se)}: ${t(x.testo)} | costo: ${t(x.costo)} | effetti: ${eff(x.effetti)}\n          risposta: ${t(x.risposta)}`);
    }
  }
  for (const e of m.esiti) console.log(`ESITO ${e.id}${e.fallita ? ' (fallita)' : ''}${se(e.se)} effetti: ${eff(e.effetti)}\n   verbale: ${t(e.verbale)}`);
  console.log(`stelle due ${JSON.stringify(m.stelle.due)} tre ${JSON.stringify(m.stelle.tre)}`);
  const resto = Object.keys(testi).filter((k) => k.startsWith(`${m.id}.`) && !k.includes('.op.') && !k.includes('.ch.') && !k.includes('.info') && !k.includes('.intro') && !k.includes('.ondata') && !k.includes('verbale_') && k !== `${m.id}.titolo`);
  for (const k of resto) console.log(`altro ${k}: ${testi[k]}`);
}
