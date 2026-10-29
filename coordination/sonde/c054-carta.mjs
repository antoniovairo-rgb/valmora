// C-054 · C53-01: su molte ondate con carta nuova, la carta non arriva mai per ultima. Gioca il motore (src/logica) con scelte a caso
// fra le opzioni valide. Uso: node coordination/sonde/c054-carta.mjs [semi=300] [rosso=0|1]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, opzioniValide } from '../../src/logica/missione.ts';
const semi = Number(process.argv[2] ?? 300); if (process.argv[3] === '1') globalThis.__NO_C246I01 = true;
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const v0 = variabiliIniziali(dich.values());
let ondate = 0, conCarta = 0, ultima = 0, sola = 0, assente = 0, posizioni = {}, esempiUltima = [];
for (const m of missioni) for (let seme = 1; seme <= semi; seme++) {
  const g = attenta(creaCaso(seme), dich), r = creaCaso(seme * 7 + 1);
  let s = iniziaMissione(m, v0, dich, seme);
  while (!missioneFinita(m, s)) {
    const n = s.ondata, o = m.ondate[n - 1], haMazzo = (o.chiamate ?? []).some((c) => c.imprevisto);
    s = schiera(m, s, g.schiera(m, s));
    const seq = [];
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      const ok = opzioniValide(c, s, m); seq.push(c.imprevisto ? '*' + c.id : c.id);
      s = rispondi(m, s, c.id, r.scegli(ok).id, dich);
      if (seq.length > 30) throw new Error('troppe chiamate ' + m.id + ' ' + n);
    }
    ondate++;
    if (haMazzo) {
      const i = seq.findIndex((x) => x[0] === '*');
      if (i < 0) { assente++; } else {
        conCarta++; posizioni[`${i + 1}/${seq.length}`] = (posizioni[`${i + 1}/${seq.length}`] ?? 0) + 1;
        if (seq.length === 1) sola++; else if (i === seq.length - 1) { ultima++; if (esempiUltima.length < 5) esempiUltima.push(`${m.id} o${n} seme ${seme}: ${seq.join(' ')}`); }
      }
    }
    s = chiudiOndata(m, s, dich);
  }
}
console.log(JSON.stringify({ rosso: !!globalThis.__NO_C246I01, semi, missioni: missioni.length, ondateGiocate: ondate, ondateConCarta: conCarta, cartaPerUltima_conAltreChiamate: ultima, cartaDaSola: sola, mazzoMaCartaNonArrivata: assente, esempiUltima, posizioni }, null, 1));
