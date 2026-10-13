// Sonda C-017 (C17-06): tempo di ondataVincibile dopo ogni sconfitta del bot casuale (semi c17:<ep>:casuale:1…100), tutti gli episodi;
// in fondo, le sconfitte del bot peggiore della stagione 1. Uso: node coordination/sonde/c17-tempi.mjs
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, rispondi, schiera } from '../../src/logica/missione.ts';
import { casuale, peggiore } from '../../src/logica/bot.ts';
import { ondataVincibile } from '../../src/logica/ripartenza.ts';
const d = leggiDati("data"); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const gioca = (m, s, g) => { while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); } return { s, r: concludiMissione(m, s, dich) }; };
const L=[];
for (const m of Object.values(d).filter(x=>x?.stagione)) for (let seme=1;seme<=100;seme++){ const {s,r}=gioca(m,iniziaMissione(m,v0,dich),casuale(creaCaso(`c17:${m.id}:casuale:${seme}`),dich)); if(!r.esito.fallita) continue; const t0=performance.now(); const n=ondataVincibile(m,r,s,dich); L.push([performance.now()-t0,m.id,seme,n,r.rapporti.length]); }
L.sort((a,b)=>b[0]-a[0]); console.log(L.length, L.slice(0,12).map(x=>`${x[0].toFixed(0)}ms ${x[1]} s${x[2]} → ${x[3]}`).join('\n'));
const per={}; for(const x of L){(per[x[1]]??=[]).push(x[0]);} for(const [k,v] of Object.entries(per).sort()) console.log(k, 'max', Math.max(...v).toFixed(0), 'n', v.length);
// peggiore
for (const m of Object.values(d).filter(x=>x?.stagione===1)) { const {s,r}=gioca(m,iniziaMissione(m,v0,dich),peggiore(creaCaso(1),dich)); const t0=performance.now(); const n=ondataVincibile(m,r,s,dich); console.log('peggiore',m.id,n,(performance.now()-t0).toFixed(0)+'ms'); }
