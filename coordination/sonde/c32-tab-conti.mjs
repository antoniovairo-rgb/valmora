// Sonda C-032: dalle uscite di c28-tastiera.mjs, quanti Tab servono per ogni azione (mediana, p90, massimo) e, in
// particolare, per l'azione che segue un fuoco perso (sul body), e dove resta il fuoco dopo le azioni.
// Uso: node coordination/sonde/c32-tab-conti.mjs <uscita.json> […]
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) { const A = JSON.parse(readFileSync(f, 'utf8')).AZ;
  const q = (t, x) => t[Math.floor(x * (t.length - 1))]; const t = A.map((a) => a.tab).sort((a, b) => a - b);
  const dopo = []; for (let i = 1; i < A.length; i++) if (A[i - 1].fuocoDopo === 'body') dopo.push(A[i].tab); dopo.sort((a, b) => a - b);
  const dove = new Map(); for (const a of A) dove.set(a.fuocoDopo, (dove.get(a.fuocoDopo) ?? 0) + 1);
  console.log(`${f}: azioni ${A.length}, Tab ${t.reduce((a, b) => a + b, 0)}, per azione mediana ${q(t, 0.5)} p90 ${q(t, 0.9)} max ${t.at(-1)}; dopo un fuoco perso n ${dopo.length} mediana ${q(dopo, 0.5)} max ${dopo.at(-1)}; fuoco dopo l'azione: ${[...dove].map(([k, v]) => `${k} ${v}`).join(', ')}`); }
