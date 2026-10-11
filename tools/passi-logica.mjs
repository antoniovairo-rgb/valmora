// Passi della catena «logica» (e «build» per la completa). Ognuno restituisce l'elenco dei problemi.
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { controllaConfini, controllaSalvataggiReali, RIGHE_MAX } from './controlli-logica.mjs';
import { leggiSchemi, leggiDati } from './dati-disco.mjs';
// Moduli TypeScript del gioco: Node li esegue togliendo i tipi (Node ≥ 22.18; la CI usa 24).
import { validaDati } from '../src/dati/valida.ts';
import { migra, SAVE_VERSION } from '../src/salvataggi/salvataggio.ts';
import { giraBot } from './bot.mjs';

// Bot: 0 blocchi su tutti i semi, e ogni esito di ogni missione raggiunto da almeno una strategia.
export function controllaBot(rapporto, dati) {
  const p = rapporto.flatMap((r) => r.blocchi.slice(0, 3).map((b) => `${r.missione} · ${r.strategia}: ${b}`));
  for (const [k, m] of Object.entries(dati).filter(([k]) => k.startsWith('missioni/'))) {
    for (const e of m.esiti) if (!rapporto.some((r) => r.missione === m.id && r.esiti[e.id])) p.push(`${k}: esito «${e.id}» mai raggiunto dai bot`);
  }
  return p;
}

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
  bot: () => { const d = leggiDati(); return controllaBot(giraBot(d, 1000), d); },
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
    const d = leggiDati(); const m = structuredClone(d['missioni/e01.json']);
    m.esiti.at(-1).se = { var: 'tensione_max', al_massimo: -1 };
    if (!controllaBot(giraBot({ ...d, 'missioni/e01.json': m }, 20), d).length) ciechi.push('bot/soft-lock è cieco');
    const m2 = structuredClone(d['missioni/e01.json']); m2.esiti.push({ ...m2.esiti[0], id: 'irraggiungibile' });
    if (!controllaBot(giraBot({ ...d, 'missioni/e01.json': m2 }, 20), { ...d, 'missioni/e01.json': m2 }).length) ciechi.push('bot/esito irraggiungibile è cieco');
    return ciechi;
  },
  build: () => esegui('npx vite build'),
};
