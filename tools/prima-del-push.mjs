// Controllo prima del push (PO-100): i passi veloci della catena «logica» che la CI di GitHub boccia più spesso.
// Il 13/10, su 22 run rosse in 13 ore, 3 venivano da push fatti senza la catena logica: tipi (16055e0, 7a003c0) e
// testi oltre i 140 caratteri (8c68c8f). Questi passi girano in pochi secondi e non scrivono nulla nel repository.
// Uso: node tools/prima-del-push.mjs   (lo chiama .githooks/pre-push; attivazione: git config core.hooksPath .githooks)
import { PASSI_LOGICA } from './passi-logica.mjs';

const PASSI = ['tipi', 'confini', 'schema', 'storia'];
let rossi = 0;
for (const nome of PASSI) {
  const t0 = Date.now();
  const errori = await PASSI_LOGICA[nome]();
  const s = ((Date.now() - t0) / 1000).toFixed(1);
  if (errori.length) { rossi++; console.log(`✘ ${nome} (${s} s)`); for (const e of errori.slice(0, 15)) console.log(`    ${e}`); }
  else console.log(`✔ ${nome} (${s} s)`);
}
if (rossi) { console.log('\nPush fermato: correggi e riprova (la CI sarebbe rossa).'); process.exit(1); }
