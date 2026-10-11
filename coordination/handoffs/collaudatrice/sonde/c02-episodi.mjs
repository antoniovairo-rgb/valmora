// Sonda C-02 · registro degli episodi (src/logica/episodi.ts, D-062). Uso: node coordination/handoffs/collaudatrice/sonde/c02-episodi.mjs
import { registra, superato, variabiliDiPartenza } from '../../../../src/logica/episodi.ts';
const seq = [{ fallita: true, stelle: 0 }, { fallita: false, stelle: 2 }, { fallita: false, stelle: 1 }, { fallita: false, stelle: 3 }, { fallita: false, stelle: 3 }, { fallita: true, stelle: 0 }];
let reg = {};
seq.forEach((r, i) => {
  const out = registra(reg, 'e01', { credito: 5, giro: 0 }, { esito: 'x', ...r }, { credito: 10 - i, giro: i });
  reg = out.registro;
  console.log(`tentativo ${i + 1} (${r.fallita ? 'fallito' : r.stelle + '★'}): migliore=${out.migliore} · registro migliore ${JSON.stringify(reg.e01.migliore?.stelle ?? null)} · tentativi ${reg.e01.tentativi} · variabili_dopo ${JSON.stringify(reg.e01.variabili_dopo)} · superato ${superato(reg, 'e01')}`);
});
console.log(`partenza del rigioco: ${JSON.stringify(variabiliDiPartenza(reg, 'e01', { credito: 99 }))} · episodio mai giocato: ${JSON.stringify(variabiliDiPartenza(reg, 'e02', { credito: 99 }))}`);
