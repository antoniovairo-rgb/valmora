// Sonda C-029 (sola lettura): D-129 nel gioco giocato dal motore. Ogni episodio × 4 strategie × semi 1…N: per ogni chiamata
// che il motore apre davvero (chiamateAperte), urgenza secondo D-129 ricalcolata qui in modo indipendente (eventi della
// stessa ondata sullo stesso settore, «se» valutato sulle variabili della partita in quel momento, pressione ≥ 4) e,
// per confronto, secondo D-126 c (un evento qualsiasi). Conta chiamate mostrate (con ripetizioni) e chiamate distinte.
// Uso: node coordination/sonde/c29-urgenza-logica.mjs [N=200] [uscita.json]
import { writeFileSync } from 'node:fs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali, valuta } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, rispondi, schiera } from '../../src/logica/missione.ts';
import { STRATEGIE } from '../../src/logica/bot.ts';
const N = Number(process.argv[2] ?? 200); const OUT = process.argv[3];
const dati = leggiDati('data'); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.id.localeCompare(b.id));
const ondataDi = (m, c) => m.ondate.find((o) => o.chiamate?.some((x) => x.id === c.id));
const ev = (m, c, v) => (ondataDi(m, c)?.eventi ?? []).filter((e) => c.settore && e.settore === c.settore && (!e.se || valuta(e.se, v)));
const per = {}; const distinte = new Map(); let mostrate = 0, urg129 = 0, urg126 = 0; const blocchi = [];
for (const m of missioni) { const r = per[m.id] = { mostrate: 0, u129: 0, u126: 0, distinte: new Set(), distU: new Set(), dati: m.ondate.reduce((a, o) => a + (o.chiamate?.length ?? 0), 0) };
  for (const [nome, S] of Object.entries(STRATEGIE)) for (let seme = 1; seme <= N; seme++) { try {
    const g = S(creaCaso(seme), dich); let s = iniziaMissione(m, v0, dich); let giri = 0;
    while (!missioneFinita(m, s) && giri++ < 50) { s = schiera(m, s, g.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0], k = 0; c && k < 100; c = chiamateAperte(m, s)[0], k++) {
        const e = ev(m, c, s.variabili); const a = e.some((x) => x.pressione >= 4), b = e.length > 0;
        mostrate++; r.mostrate++; if (a) { urg129++; r.u129++; r.distU.add(c.id); } if (b) { urg126++; r.u126++; }
        r.distinte.add(c.id); const k2 = `${m.id}/${c.id}`; const d = distinte.get(k2) ?? { volte: 0, urgenti: 0, pressioni: new Set(), settore: c.settore ?? null }; d.volte++; if (a) d.urgenti++; for (const x of e) d.pressioni.add(x.pressione); distinte.set(k2, d);
        s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); }
      s = chiudiOndata(m, s, dich); }
    if (!missioneFinita(m, s)) blocchi.push(`${m.id} ${nome} ${seme}`);
  } catch (x) { blocchi.push(`${m.id} ${nome} ${seme}: ${x.message}`); } } }
const pc = (a, b) => `${(100 * a / b).toFixed(1)} %`;
console.log(`semi ${N} × ${Object.keys(STRATEGIE).length} strategie × ${missioni.length} episodi; blocchi ${blocchi.length}`);
console.log(`chiamate mostrate (con ripetizioni): ${mostrate}; urgenti D-129 ${urg129} (${pc(urg129, mostrate)}); con D-126 c sarebbero ${urg126} (${pc(urg126, mostrate)})`);
const dist = [...distinte.values()]; const sempre = dist.filter((d) => d.urgenti === d.volte).length, mai = dist.filter((d) => !d.urgenti).length, aVolte = dist.length - sempre - mai;
console.log(`chiamate distinte mostrate ${dist.length}/498: urgenti sempre ${sempre}, mai ${mai}, a volte (dipende da «se») ${aVolte}; senza settore ${dist.filter((d) => !d.settore).length}`);
console.log('episodio | chiamate nei dati | distinte mostrate | urgenti distinte | mostrate | urgenti D-129 | D-126 c');
for (const [id, r] of Object.entries(per)) console.log(`${id} | ${r.dati} | ${r.distinte.size} | ${r.distU.size} | ${r.mostrate} | ${r.u129} (${pc(r.u129, r.mostrate)}) | ${r.u126} (${pc(r.u126, r.mostrate)})`);
if (OUT) writeFileSync(OUT, JSON.stringify({ N, mostrate, urg129, urg126, blocchi, distinte: Object.fromEntries([...distinte].map(([k, d]) => [k, { ...d, pressioni: [...d.pressioni] }])), per: Object.fromEntries(Object.entries(per).map(([k, r]) => [k, { ...r, distinte: r.distinte.size, distU: r.distU.size }])) }));
