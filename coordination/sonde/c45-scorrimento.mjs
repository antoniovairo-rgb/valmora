// C-045: dal registro della partita giocata (partita.jsonl, scritto da c45-giocatore.mjs) conta scene e scorrimento verticale.
// Uso: node coordination/sonde/c45-scorrimento.mjs coordination/handoffs/collaudo/C-045/foto/partita.jsonl
import { readFileSync } from 'node:fs';
const righe = readFileSync(process.argv[2], 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const sc = righe.filter((r) => r.etichetta && r.scroll_y !== undefined && !['tocca', 'misura', 'riprendi', 'riepilogo-schieramento', 'riepilogo'].includes(r.etichetta));
const per = {};
for (const r of sc) { const k = r.etichetta.replace('-IMPREVISTO', ' (imprevisto)'); (per[k] ??= []).push(r.scroll_y); }
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
for (const [k, a] of Object.entries(per).sort()) console.log(`${k.padEnd(24)} n=${String(a.length).padStart(3)} min=${Math.min(...a)} mediana=${med(a)} max=${Math.max(...a)} con scorrimento>0: ${a.filter((x) => x > 0).length}`);
const ch = sc.filter((r) => r.etichetta.startsWith('chiamata'));
console.log(`chiamate viste: ${ch.length}; imprevisti: ${ch.filter((r) => r.etichetta.includes('IMPREV')).length}; con scorrimento >= 300 px: ${ch.filter((r) => r.scroll_y >= 300).length}`);
console.log(`errori di console/pagina nel registro: ${righe.filter((r) => r.ERRORE_CONSOLE || r.ERRORE_PAGINA).length}; larghezza scorrimento orizzontale (sw>w): ${sc.filter((r) => r.sw > r.w).length}`);
console.log(`episodi nel registro: ${[...new Set(righe.filter((r) => r.ep).map((r) => r.ep))].join(', ')}`);
