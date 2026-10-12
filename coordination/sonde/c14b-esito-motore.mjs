// Collaudo C-014b: esito di ogni episodio giocato dal motore (src/logica), senza browser.
// Uso: node coordination/sonde/c14b-esito-motore.mjs  → quale giocatore del motore raggiunge l'esito migliore.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const R = process.cwd();
const M = await import(join(R, 'src/logica/missione.ts'));
const { attenta, equilibrata } = await import(join(R, 'src/logica/bot.ts'));
const { creaCaso } = await import(join(R, 'src/logica/caso.ts'));
const { variabiliIniziali } = await import(join(R, 'src/logica/condizioni.ts'));
const dich = new Map(JSON.parse(readFileSync(join(R, 'data/stato.json'), 'utf8')).variabili.map((d) => [d.id, d]));
function gioca(m, g) {
  let s = M.iniziaMissione(m, variabiliIniziali(dich.values()), dich);
  while (!M.missioneFinita(m, s)) {
    s = M.schiera(m, s, g.schiera(m, s));
    for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich);
    s = M.chiudiOndata(m, s, dich);
  }
  return M.concludiMissione(m, s, dich).esito.id;
}
for (let i = 1; i <= 36; i++) {
  const id = `e${String(i).padStart(2, '0')}`;
  const m = JSON.parse(readFileSync(join(R, `data/missioni/${id}.json`), 'utf8'));
  const migliore = m.esiti[0].id;
  console.log(`${id} · esito migliore ${migliore} · attento ${gioca(m, attenta(creaCaso(1), dich))} · equilibrato ${gioca(m, equilibrata(creaCaso(1), dich))}`);
}
