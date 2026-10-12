// Dati di prova per i dettagli delle mappe (D-095), finché nessuna missione vera li usa: copia data/ in
// out/dati-dettagli e mette in alcune missioni i dettagli di tests/resa/dati-dettagli/dettagli.json.
// Uso: node tools/dati-dettagli.mjs && VALMORA_DATI=out/dati-dettagli npx vite build --outDir out/dist-dettagli
//      poi node tools/foto.mjs out/foto-dettagli out/dist-dettagli out/dati-dettagli (o tools/foto-mappe.mjs)
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
const dest = 'out/dati-dettagli';
rmSync(dest, { recursive: true, force: true }); cpSync('data', dest, { recursive: true });
const voci = JSON.parse(readFileSync('tests/resa/dati-dettagli/dettagli.json', 'utf8'));
for (const [id, dettagli] of Object.entries(voci)) {
  const p = `${dest}/missioni/${id}.json`, m = JSON.parse(readFileSync(p, 'utf8'));
  m.mappa.dettagli = dettagli; writeFileSync(p, JSON.stringify(m, null, 1));
}
console.log(`dati di prova in ${dest}: ${Object.keys(voci).join(', ')}`);
