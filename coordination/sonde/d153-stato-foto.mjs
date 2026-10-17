// Stato reale per la foto D-153: partita del bot casuale su e28 fino alla chiamata con una risposta esaurita.
import fs from 'node:fs';
import { leggiDati } from './tools/dati-disco.mjs';
import { variabiliIniziali } from './src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, opzioniEsaurite, opzioniValide, rispondi, schiera } from './src/logica/missione.ts';
import { casuale } from './src/logica/bot.ts';
import { creaCaso } from './src/logica/caso.ts';
import { SAVE_VERSION } from './src/salvataggi/salvataggio.ts';
const ep = process.argv[2] ?? 'e28';
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const m = d[`missioni/${ep}.json`];
for (let seme = 1; seme < 500; seme++) {
  const caso = creaCaso(`foto:${seme}`); const g = casuale(caso, dich); let s = iniziaMissione(m, v0, dich);
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      if (opzioniEsaurite(c, s, m).length && opzioniValide(c, s, m).length >= 1) {
        const { partenze, ...senza } = s;
        const ordine = Object.values(d).filter((x) => x?.ondate).sort((a, b) => a.stagione - b.stagione || a.episodio - b.episodio).map((x) => x.id);
        const prima = ordine.slice(0, ordine.indexOf(ep));
        const sal = { save_version: SAVE_VERSION, game_version: 'foto', seme: 1, caso: 1, variabili: { ...s.variabili }, missioni_concluse: prima,
          episodi: Object.fromEntries(prima.map((x) => [x, { migliore: { esito: 'contenuto_a_fatica', fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: v0, variabili_dopo: v0 }])), genere: 'm', rapporto_aperto: null, in_corso: { ...s, partenze } };
        fs.writeFileSync(process.argv[3], JSON.stringify(sal));
        console.log(`seme ${seme} ondata ${s.ondata} ${c.id}: valide ${opzioniValide(c, s, m).map((o) => o.id)} esaurite ${opzioniEsaurite(c, s, m).map((o) => o.id)}`);
        process.exit(0);
      }
      s = rispondi(m, s, c.id, caso.scegli(opzioniValide(c, s, m)).id, dich);
    }
    s = chiudiOndata(m, s, dich);
  }
}
