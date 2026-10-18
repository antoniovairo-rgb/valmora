import { readFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { datiD160, perverseRapide } from '../../../tools/misura-fiducia.mjs';
const { tolte } = JSON.parse(readFileSync('tests/dati/fiducia-d160.json', 'utf8'));
for (const semi of [200, 1000]) { for (const rosso of [false, true]) { globalThis.__NO_C16001 = rosso; const t = Date.now(); const p = perverseRapide(datiD160(leggiDati(), tolte), semi); console.log(semi, rosso ? 'rosso' : 'verde', p.length, (Date.now() - t) / 1000 + 's', rosso ? '' : p.map((o) => `${o.chiave} ${o.nominale} z${o.z}`).join(' | ')); } }
