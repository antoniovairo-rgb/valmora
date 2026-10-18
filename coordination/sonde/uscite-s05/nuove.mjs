import { leggiDati } from '../../../tools/dati-disco.mjs';
import { misura, perversa } from '../../../tools/misura-fiducia.mjs';
const r = misura(leggiDati(), 1000);
for (const o of r.opzioni.filter(perversa)) console.log(o.chiave, o.nominale, 'z', o.z, o.falliteSe, '/', o.falliteAltre);
