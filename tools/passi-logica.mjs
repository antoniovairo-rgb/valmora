// Passi della catena «logica» (e «build» per la completa). Ognuno restituisce l'elenco dei problemi.
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { controllaConfini, controllaSalvataggiReali, RIGHE_MAX } from './controlli-logica.mjs';
import { leggiSchemi, leggiDati } from './dati-disco.mjs';
// Moduli TypeScript del gioco: Node li esegue togliendo i tipi (Node ≥ 22.18; la CI usa 24).
import { validaDati } from '../src/dati/valida.ts';
import { migra, SAVE_VERSION } from '../src/salvataggi/salvataggio.ts';

const esegui = (cmd) => {
  try { execSync(cmd, { encoding: 'utf8', stdio: 'pipe' }); return []; } catch (e) {
    return `${e.stdout ?? ''}${e.stderr ?? ''}`.split('\n').filter((r) => r.trim()).slice(-25);
  }
};
const tracciatiENuovi = () => execSync('git ls-files --cached --others --exclude-standard', { encoding: 'utf8' })
  .split('\n').filter((p) => p && existsSync(p));
const SALVATAGGI = 'tests/salvataggi-reali';
const leggiSalvataggi = () => Object.fromEntries(readdirSync(SALVATAGGI).filter((n) => n.endsWith('.json'))
  .map((n) => [n, JSON.parse(readFileSync(`${SALVATAGGI}/${n}`, 'utf8'))]));

export const PASSI_LOGICA = {
  tipi: () => esegui('npx tsc --noEmit -p .'),
  confini: () => controllaConfini(Object.fromEntries(tracciatiENuovi().map((p) => [p, readFileSync(p, 'utf8')]))),
  schema: () => validaDati(leggiSchemi(), leggiDati()),
  test: () => esegui('npx vitest run'),
  'salvataggi-reali': () => controllaSalvataggiReali(SAVE_VERSION, leggiSalvataggi(), migra),
  'bracci-rossi-logica': () => {
    const ciechi = [];
    const lunga = 'x\n'.repeat(RIGHE_MAX + 1);
    if (!controllaConfini({ 'src/a.ts': lunga }).length) ciechi.push('confini/righe è cieco');
    if (!controllaConfini({ 'src/logica/a.ts': 'const x = Math.random();' }).length) ciechi.push('confini/Math.random è cieco');
    if (!controllaConfini({ 'src/logica/a.ts': "import { x } from '../resa/b.ts';" }).length) ciechi.push('confini/import resa è cieco');
    if (!validaDati(leggiSchemi(), { 'stato.json': { variabili: [] }, 'missioni/m.json': {} }).length) ciechi.push('schema è cieco');
    if (!controllaSalvataggiReali(2, {}, migra).length) ciechi.push('salvataggi-reali/copertura è cieco');
    if (!controllaSalvataggiReali(1, { 'v1-rotto.json': { save_version: 1 } }, migra).length) ciechi.push('salvataggi-reali/migrazione è cieco');
    return ciechi;
  },
  build: () => esegui('npx vite build'),
};
