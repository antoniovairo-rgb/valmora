// Sonda C-036 (sola lettura, dati): opzioni che impegnano un'unità (riserva < 0) e i cui effetti su settori non toccano
// il settore della chiamata. Il bollino dell'unità mostra «<unità> · <settore della chiamata>» (src/resa/effetti-opzione.tsx:21),
// mentre il testo e gli effetti la mandano altrove. Uso: node coordination/sonde/c36-bollini-unita.mjs [radice]
import { readFileSync, readdirSync } from 'node:fs'; import { join } from 'node:path';
const R = process.argv[2] ?? '.'; const T = {}; for (const f of readdirSync(join(R, 'data/testi/it'))) Object.assign(T, JSON.parse(readFileSync(join(R, 'data/testi/it', f), 'utf8')));
const t = (k) => T[k] ?? T[k + '@f'] ?? k; let n = 0, tot = 0;
for (const f of readdirSync(join(R, 'data/missioni')).sort()) { const m = JSON.parse(readFileSync(join(R, 'data/missioni', f), 'utf8'));
  m.ondate.forEach((o, i) => o.chiamate.forEach((c) => c.opzioni.forEach((x) => {
    if (!x.effetti.some((e) => 'riserva' in e && e.valore < 0) || !c.settore) return; tot++;
    const sett = [...new Set(x.effetti.flatMap((e) => ('pressione' in e ? [e.pressione] : 'tensione' in e ? [e.tensione] : [])))];
    if (!sett.length || sett.includes(c.settore)) return; n++;
    console.log(`${m.id} o${i + 1} ${c.id}/${x.id}: bollino «· ${t(`settore.${c.settore}`)}», effetti su ${sett.map((s) => t(`settore.${s}`)).join(', ')} — «${t(`${m.id}.op.${x.id}`)}»`); })));
}
console.log(`opzioni con unità impegnata e settore: ${tot}; bollino in un settore che l'opzione non tocca: ${n}`);
