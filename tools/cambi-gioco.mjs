// PO-128: dice alla CI se un push tocca qualcosa oltre ai documenti. Stampa «gioco=true|false» per $GITHUB_OUTPUT.
// Uso: node tools/cambi-gioco.mjs <commit-prima> <commit-dopo>. Nel dubbio (ramo nuovo, commit sconosciuto) «true».
import { execSync } from 'node:child_process';

/** Percorsi che non cambiano il gioco né gli strumenti: solo documenti, coordinamento e registro delle catene. */
export const solodocumenti = (p) => p.startsWith('docs/') || p.startsWith('coordination/') || p === 'STABILITA.json';

/** true se almeno un file cambiato non è solo documento (o se l'elenco è vuoto: nel dubbio si prova). */
export const toccaGioco = (file) => !file.length || file.some((p) => !solodocumenti(p));

if (import.meta.url === `file://${process.argv[1]}`) {
  const [prima, dopo] = process.argv.slice(2);
  let gioco = true;
  if (prima && !/^0+$/.test(prima)) {
    try { gioco = toccaGioco(execSync(`git diff --name-only ${prima} ${dopo}`, { encoding: 'utf8' }).split('\n').filter(Boolean)); } catch { gioco = true; }
  }
  console.log(`gioco=${gioco}`);
}
