import fs from 'node:fs';
const out = process.argv[2];
for (let n = 1; n <= 36; n++) {
  const id = `e${String(n).padStart(2, '0')}`;
  const m = JSON.parse(fs.readFileSync(`data/missioni/${id}.json`, 'utf8'));
  const t = JSON.parse(fs.readFileSync(`data/testi/it/${id}.json`, 'utf8'));
  const tx = (k) => (typeof k === 'string' && k.startsWith('testi:') ? t[k.slice(6)] ?? `?${k}` : k);
  const L = [`# ${id} ${tx(m.titolo)}`];
  for (const b of m.briefing ?? []) L.push(`BRIEF [${b.fonte} vera=${b.vera}] ${tx(b.testo)}`);
  m.ondate.forEach((o, i) => {
    L.push(`\n## ondata ${i + 1}: ${tx(o.titolo) ?? ''}`);
    for (const c of o.chiamate ?? []) {
      const extra = [c.se && `se=${JSON.stringify(c.se)}`, c.dopo && `dopo=${JSON.stringify(c.dopo)}`, c.senza && `senza=${JSON.stringify(c.senza)}`].filter(Boolean).join(' ');
      L.push(`CHIAMATA ${c.id} [${c.fonte}, settore ${c.settore ?? '-'}] ${extra}\n  «${tx(c.testo)}»`);
      for (const op of c.opzioni) {
        const ex = [op.se && `se=${JSON.stringify(op.se)}`, op.dopo && `dopo=${JSON.stringify(op.dopo)}`].filter(Boolean).join(' ');
        const eff = op.effetti.map((e) => JSON.stringify(e)).join(',');
        L.push(`  - ${c.id}/${op.id} ${ex}: ${tx(op.testo)} | costo: ${tx(op.costo) ?? ''} | risposta: ${tx(op.risposta) ?? ''} | eff: ${eff}`);
      }
    }
  });
  fs.writeFileSync(`${out}/${id}.txt`, L.join('\n'));
}
