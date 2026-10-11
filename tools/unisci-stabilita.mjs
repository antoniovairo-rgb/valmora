// Risolve il conflitto di merge su STABILITA.json unendo i giri dei due rami (senza doppioni, in ordine di data),
// poi rigenera docs/governo/governo.html. Uso: dentro un merge in conflitto, node tools/unisci-stabilita.mjs
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { generaGoverno } from './governo-html.mjs';

const leggi = (fase) => JSON.parse(execSync(`git show :${fase}:STABILITA.json`, { encoding: 'utf8', maxBuffer: 1 << 28 })).giri;
const visti = new Set();
const giri = [...leggi(2), ...leggi(3)].sort((a, b) => a.data.localeCompare(b.data))
  .filter((g) => { const k = `${g.catena}|${g.data}|${g.commit}`; if (visti.has(k)) return false; visti.add(k); return true; });
writeFileSync('STABILITA.json', JSON.stringify({ giri }, null, 2) + '\n');
execSync('git checkout --ours docs/governo/governo.html');
generaGoverno();
execSync('git add STABILITA.json docs/governo/governo.html');
console.log(`STABILITA.json: ${giri.length} giri uniti`);
