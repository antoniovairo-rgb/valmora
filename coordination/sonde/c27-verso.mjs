// C-027: verso dei cortei per ogni episodio e ondata, da folla.ts della build indicata (radice), senza browser.
// Due versi: «ondata» (cortei[].verso, i 70 tifosi di StratoPixi.tsx:85-118) e «chiamata» (dinamica PO-089 sul viale
// citato, StratoPixi.tsx:170: esce solo se spalti === 'deflusso').
// Uso: node coordination/sonde/c27-verso.mjs <radice> <uscita.json>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [radice = '.', uscita = 'c27-verso.json'] = process.argv.slice(2);
const { follaDellOndata } = await import(pathToFileURL(resolve(radice, 'src/resa/mappa/folla.ts')).href);
const dir = resolve(radice, 'data/missioni');
const righe = [];
for (const f of readdirSync(dir).filter((x) => /^e\d+\.json$/.test(x)).sort()) {
  const m = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
  const strade = new Set(m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => s.id));
  m.ondate.forEach((o, i) => {
    const fo = follaDellOndata(m, i + 1);
    const citate = [...new Set((o.chiamate ?? []).map((c) => c.settore).filter((s) => strade.has(s)))];
    righe.push({ ep: m.id ?? f.slice(0, 3), ondata: i + 1, spalti: fo.spalti,
      cortei: fo.cortei.map((c) => `${c.settore}>${c.verso}${c.club ? '@' + c.club : ''}`),
      chiamateSuStrada: citate.map((s) => `${s}>${fo.spalti === 'deflusso' ? 'esce' : 'entra'}`),
      eventiStrada: o.eventi.filter((e) => strade.has(e.settore)).map((e) => `${e.tipo}:${e.settore}${e.verso ? '/' + e.verso : ''}`) });
  });
}
writeFileSync(uscita, JSON.stringify(righe, null, 1));
console.log(`righe ${righe.length}, con cortei ${righe.filter((r) => r.cortei.length).length}, cortei ${righe.reduce((a, r) => a + r.cortei.length, 0)}`);
