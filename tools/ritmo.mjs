// Misura del ritmo della campagna (D-092). Uso: node tools/ritmo.mjs — esce 1 se una stagione ha troppi episodi di stadio di fila.
import { leggiDati } from './dati-disco.mjs';
import { controllaRitmo, diStadio } from '../src/dati/ritmo.ts';
const ms = Object.entries(leggiDati()).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
for (const st of [...new Set(ms.map((m) => m.stagione))]) console.log(`stagione ${st}: ${ms.filter((m) => m.stagione === st).map((m) => `${m.id}${diStadio(m) ? 'S' : 'C'}`).join(' ')}`);
const p = controllaRitmo(ms); for (const x of p) console.log('✗ ' + x);
process.exit(p.length ? 1 : 0);
