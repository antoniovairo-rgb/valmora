// C-053 punto 2: estrae tutte le carte (testo + commento + opzioni + risposte) e le varianti, già risolte sui testi.
import { writeFileSync } from 'node:fs';
import * as L from './c053-lib.mjs';
const out = [], righe = [];
for (const m of L.missioni) {
  const f = L.dati[`imprevisti/${m.id}.json`]; if (!f) continue;
  const voci = [...f.imprevisti.map((i, k) => { const n = f.imprevisti.slice(0, k).filter((x) => x.ondata === i.ondata).length; return ({ tipo: n === 0 ? 'classica' : `carta${n}`, ondata: i.ondata, c: i.chiamata, finestra: i.finestra, dopo: i.dopo }); }), ...(f.varianti ?? []).map((v) => ({ tipo: `variante di ${v.di}`, ondata: v.ondata, c: v.chiamata }))];
  for (const v of voci) {
    const c = v.c, tt = (k) => L.tx(k);
    const rec = { ep: m.id, stagione: m.stagione, ondata: v.ondata, tipo: v.tipo, id: c.id, fonte: c.fonte, settore: c.settore, finestra: v.finestra ?? null, dopo: v.dopo ?? null, testo: tt(c.testo), commento: c.commento ? tt(c.commento) : null,
      opzioni: c.opzioni.map((o) => ({ id: o.id, testo: tt(o.testo), costo: o.costo ? tt(o.costo) : null, risposta: tt(o.risposta) })) };
    out.push(rec);
    righe.push(`### ${m.id} ond.${v.ondata} · ${v.tipo} · ${c.id}${v.finestra ? ` · finestra ${v.finestra}` : ''}\n${rec.testo}\n> ${rec.commento ?? ''}\n` + rec.opzioni.map((o) => `- **${o.testo}** (${o.costo ?? ''}) → ${o.risposta}`).join('\n') + '\n');
  }
}
writeFileSync('coordination/collaudi/c053/dati/testi-nuovi.json', JSON.stringify(out));
writeFileSync(process.argv[2] ?? '/tmp/testi-nuovi.md', righe.join('\n'));
const conta = {}; out.forEach((r) => { const k = r.tipo.startsWith('variante') ? 'varianti' : r.tipo === 'classica' ? 'classiche' : 'carte nuove'; conta[k] = (conta[k] ?? 0) + 1; });
console.log(conta, 'mancanti [[…]]:', JSON.stringify(out).match(/\[\[[^\]]*\]\]/g)?.length ?? 0);
