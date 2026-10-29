// C-054 · idea C sul motore: giocando SEMPRE l'opzione «comoda» (quella con effetti_dopo, se c'è fra le valide), ogni morso arriva
// una volta sola, all'ondata giusta (scelta + 1, o l'ultima), col testo della scelta fatta. Uso: node c054-dopo.mjs [semi=100] [rosso=0|1]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, opzioniValide } from '../../src/logica/missione.ts';
const semi = Number(process.argv[2] ?? 100); if (process.argv[3] === '1') globalThis.__NO_C241C01 = true;
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const v0 = variabiliIniziali(dich.values());
let comode = 0, attesi = 0, arrivati = 0, doppi = 0, fuoriOndata = 0, inUltima = 0, senzaScelta = 0, partite = 0, maxMorsiUnaChiusura = 0;
const perOndata = {}; const lunghezze = [];
for (const m of missioni) for (let seme = 1; seme <= semi; seme++) {
  const g = attenta(creaCaso(seme), dich), r = creaCaso(seme * 13 + 5);
  let s = iniziaMissione(m, v0, dich, seme); const fatte = []; partite++;
  while (!missioneFinita(m, s)) {
    const n = s.ondata; s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      const ok = opzioniValide(c, s, m), com = ok.filter((o) => o.effetti_dopo), o = com.length ? com[0] : r.scegli(ok);
      if (o.effetti_dopo) { comode++; fatte.push({ n, c: c.id, o: o.id, testo: o.effetti_dopo.rapporto, ritardo: o.effetti_dopo.ondate }); }
      s = rispondi(m, s, c.id, o.id, dich);
    }
    s = chiudiOndata(m, s, dich);
  }
  // rapporti per ondata
  const rap = s.rapporti ?? []; const N = m.ondate.length;
  maxMorsiUnaChiusura = Math.max(maxMorsiUnaChiusura, ...rap.map((x) => x.radio?.length ?? 0));
  for (const f of fatte) {
    const giusta = Math.min(f.n + f.ritardo, N); attesi++;
    const dove = rap.map((x, i) => [i + 1, (x.radio ?? []).filter((t) => t === f.testo).length]).filter(([, k]) => k);
    const tot = dove.reduce((a, [, k]) => a + k, 0);
    if (tot === 0) senzaScelta++; else { arrivati++; if (tot > 1) doppi++; if (!dove.some(([i]) => i === giusta)) fuoriOndata++; if (giusta === N && f.n === N) inUltima++; }
    const key = `scelta_o${f.n}→morso_o${giusta}`; perOndata[key] = (perOndata[key] ?? 0) + 1;
  }
}
console.log(JSON.stringify({ rosso: !!globalThis.__NO_C241C01, partite, scelteComode: comode, morsiAttesi: attesi, arrivati, mancanti: senzaScelta, doppi, fuoriOndataGiusta: fuoriOndata, sceltaNellUltimaOndata: inUltima, maxMorsiInUnaChiusura: maxMorsiUnaChiusura, perOndata }, null, 1));
