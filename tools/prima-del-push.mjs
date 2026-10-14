// Controllo prima del push (PO-100): i passi veloci della catena «logica» che la CI di GitHub boccia più spesso.
// Il 13/10, su 22 run rosse in 13 ore, 3 venivano da push fatti senza la catena logica: tipi (16055e0, 7a003c0) e
// testi oltre i 140 caratteri (8c68c8f). Questi passi girano in pochi secondi e non scrivono nulla nel repository.
// Uso: node tools/prima-del-push.mjs   (lo chiama .githooks/pre-push; attivazione: git config core.hooksPath .githooks)
import { execSync } from 'node:child_process';
import { PASSI_LOGICA } from './passi-logica.mjs';

// Se il push porta modifiche a dati delle missioni o alla logica, si aggiunge «bot» (difficoltà D-108, soft-lock):
// il 13/10 tre run rosse (f713f2e, 544e986, 6d1dd15) venivano da un dato di e04 che passava i passi veloci (2 min in più).
const base = (() => { try { return execSync('git merge-base HEAD @{upstream}', { encoding: 'utf8', stdio: 'pipe' }).trim(); } catch { return null; } })();
const toccati = base ? execSync(`git diff --name-only ${base} HEAD`, { encoding: 'utf8' }).split('\n') : ['data/missioni/'];
const pesante = toccati.some((f) => f.startsWith('data/missioni/') || f.startsWith('data/stato') || f.startsWith('src/logica/'));
// E se cambiano dati, codice o test, anche «test» (30 s): il 13/10 una riga «i» di 91 caratteri è passata (bf777c9).
const codice = toccati.some((f) => /^(data|src|tests)\//.test(f));
const PASSI = ['tipi', 'confini', 'schema', 'storia', ...(codice ? ['test'] : []), ...(pesante ? ['bot'] : [])];
let rossi = 0;
for (const nome of PASSI) {
  const t0 = Date.now();
  const errori = await PASSI_LOGICA[nome]();
  const s = ((Date.now() - t0) / 1000).toFixed(1);
  if (errori.length) { rossi++; console.log(`✘ ${nome} (${s} s)`); for (const e of errori.slice(0, 15)) console.log(`    ${e}`); }
  else console.log(`✔ ${nome} (${s} s)`);
}
if (rossi) { console.log('\nPush fermato: correggi e riprova (la CI sarebbe rossa).'); process.exit(1); }
