// Sonda C-015 (collaudo, sola lettura): e36 da ogni fascicolo × fiducia d'ingresso, con i 4 bot e 200 semi del casuale.
// Uso: node coordination/sonde/c15-logica.mjs [radice]
// Misura: quali esiti (12 versioni + degenerato) escono, con quante stelle, e il colore (tono) del titolo del verbale.
import { join, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.');
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { valutaEpisodio } = await import(`${R}/src/logica/episodi.ts`); const { tono } = await import(`${R}/src/resa/partita.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const iniziali = Object.fromEntries([...dich.values()].map((d) => [d.id, d.iniziale]));
const m = dati['missioni/e36.json'];
const gioca = (g, v) => { let s = M.iniziaMissione(m, v, dich); const f0 = s.variabili.credito;
  while (!M.missioneFinita(m, s)) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); }
  const e = M.concludiMissione(m, s, dich); return { e, r: valutaEpisodio(m, e), f0 }; };
const visti = new Map(); let minIngresso = Infinity;
for (const fascicolo of ['nessuno', 'procura', 'stampa', 'comando']) for (let credito = 0; credito <= 10; credito++) {
  const v = { ...iniziali, fascicolo, credito };
  for (const nome of ['attenta', 'equilibrata', 'peggiore']) { const x = gioca(B[nome](creaCaso(1), dich), v); minIngresso = Math.min(minIngresso, x.f0); const k = x.e.esito.id; const q = visti.get(k) ?? { n: 0, stelle: new Set(), da: new Set() }; q.n++; q.stelle.add(x.r.stelle); q.da.add(`${fascicolo}/${credito}`); visti.set(k, q); }
  for (let seme = 1; seme <= 200; seme++) { const x = gioca(B.casuale(creaCaso(seme), dich), v); minIngresso = Math.min(minIngresso, x.f0); const k = x.e.esito.id; const q = visti.get(k) ?? { n: 0, stelle: new Set(), da: new Set() }; q.n++; q.stelle.add(x.r.stelle); q.da.add(`${fascicolo}/${credito}`); visti.set(k, q); }
}
console.log(`partite: ${[...visti.values()].reduce((a, q) => a + q.n, 0)} · fiducia minima vista a inizio e36: ${minIngresso} (D-105: 2)`);
for (const e of m.esiti) { const q = visti.get(e.id); console.log(`${e.id.padEnd(20)} tono ${tono(m, e).padEnd(5)} · ${q ? `${q.n} partite · stelle ${[...q.stelle].sort().join(',')} · fascicolo/fiducia d'ingresso es. ${[...q.da].slice(0, 3).join(' ')}` : 'MAI raggiunto'}`); }

// C15 – testimone di e18: «auto con scorta» (protetto) e poi «Conferma» alla stampa → che valore resta, e cosa legge e19?
{ const e18 = dati['missioni/e18.json']; const e19 = dati['missioni/e19.json']; const att = B.attenta(creaCaso(1), dich);
  const forza = { con_o_senza: 'auto_scorta', qualcuno_ha_parlato: 'conferma18' };
  let s = M.iniziaMissione(e18, iniziali, dich); const ordine = [];
  while (!M.missioneFinita(e18, s)) { s = M.schiera(e18, s, att.schiera(e18, s)); for (let c = M.chiamateAperte(e18, s)[0]; c; c = M.chiamateAperte(e18, s)[0]) { const o = forza[c.id] ?? att.scegli(e18, s, c); if (forza[c.id]) ordine.push(`o${s.ondata}.${c.id}=${o}→testimone ${M.rispondi(e18, s, c.id, o, dich).variabili.testimone}`); s = M.rispondi(e18, s, c.id, o, dich); } s = M.chiudiOndata(e18, s, dich); }
  const fine = M.concludiMissione(e18, s, dich); console.log(`\ne18 forzato: ${ordine.join(' · ')} · esito ${fine.esito.id} · testimone a fine episodio: ${fine.variabili.testimone}`);
  let t = M.iniziaMissione(e19, fine.variabili, dich); const viste = [];
  while (!M.missioneFinita(e19, t)) { t = M.schiera(e19, t, att.schiera(e19, t)); for (let c = M.chiamateAperte(e19, t)[0]; c; c = M.chiamateAperte(e19, t)[0]) { viste.push(c.id); t = M.rispondi(e19, t, c.id, att.scegli(e19, t, c), dich); } t = M.chiudiOndata(e19, t, dich); }
  console.log(`e19 dopo: chiamate sul testimone viste: ${viste.filter((x) => x.startsWith('testimone')).join(',') || 'nessuna'}`); }
