import { readFileSync } from 'node:fs';
const { ris, modo } = JSON.parse(readFileSync(process.argv[2]));
const per = {}; for (const r of ris) if (r.striscia) { const k = `${r.w}×${r.h}`; const tipo = r.ep ? (r.scheda?.cls.includes('invito') ? 'invito' : 'scelto') : (r.invito ? 'invito:' + r.invito : 'senza'); ((per[k] ??= {})[tipo] ??= []).push(r); }
console.log(modo);
for (const [k, T] of Object.entries(per)) console.log(k, Object.entries(T).map(([t, L]) => `${t}[n=${L.length}] striscia ${Math.min(...L.map((r) => r.striscia.h))}..${Math.max(...L.map((r) => r.striscia.h))} sopra-teste ${Math.min(...L.map((r) => Math.min(...r.striscia.sopra)))}..${Math.max(...L.map((r) => Math.max(...r.striscia.sopra)))} mappa ${Math.min(...L.map((r) => r.mappa.h))}..${Math.max(...L.map((r) => r.mappa.h))} fondo ${Math.min(...L.map((r) => r.fondo))}..${Math.max(...L.map((r) => r.fondo))}`).join(' | '));
