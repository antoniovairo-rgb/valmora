// Sonda C-033 (sola lettura): seconda stella mancata con tensione_max 4 contro soglia 3: livello(3) = livello(4) = 2 («giallo»),
// quindi il verbale dice «non deve passare il giallo: è arrivata al giallo». Motore, ogni strategia × semi 1…N × 36 episodi.
// Uso: [N=200] node coordination/sonde/c33-stella.mjs <radice>
const R = process.argv[2];
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`); const { missioniDai } = await import(`${R}/tools/foto-bozze.mjs`); const { valutaEpisodio } = await import(`${R}/src/logica/episodi.ts`);
const { join } = await import('node:path'); const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const N = Number(process.env.N ?? 200); const r = {};
for (const st of Object.keys(B.STRATEGIE)) { const c = r[st] = { superati: 0, senzaSeconda: 0, tmax4: 0 };
  for (let seme = 1; seme <= N; seme++) for (const m of missioni) { const g = B.STRATEGIE[st](creaCaso(seme), dich); let s = M.iniziaMissione(m, v0, dich);
    while (!M.missioneFinita(m, s)) { s = M.schiera(m, s, g.schiera(m, s)); for (let k = M.chiamateAperte(m, s)[0]; k; k = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, k.id, g.scegli(m, s, k), dich); s = M.chiudiOndata(m, s, dich); }
    const e = M.concludiMissione(m, s, dich); const v = valutaEpisodio(m, e); if (v.fallita) continue; c.superati++;
    if (v.stelle < 2) { c.senzaSeconda++; if (e.variabili.tensione_max === 4) c.tmax4++; } } }
console.log(`semi 1…${N} × ${missioni.length} episodi`); for (const [k, v] of Object.entries(r)) console.log(`${k}: superati ${v.superati}, senza seconda stella ${v.senzaSeconda}, di cui con tensione_max 4 («giallo: giallo») ${v.tmax4}`);
