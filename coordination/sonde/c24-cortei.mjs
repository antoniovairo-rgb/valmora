// Sonda C-024 (sola lettura): C23-01, corteo della chiamata col club dell'evento, su TUTTE le chiamate con corteo,
// misurato sui pixel. Braccio «normale»: ogni chiamata raggiungibile aperta a 412×915 scala 2 con riduci movimento
// (cortei fermi); si leggono data-dinamica e data-dinamica-colori. Per le chiamate con dinamica «corteo» si fotografa
// la sola mappa (PNG) anche coi bracci C32D01 (niente corteo della chiamata) e C53D01 (rosso di C23-01): la
// differenza normale − C32D01 sono i pixel del corteo della chiamata, contati per colore (club e grigi, ±TOL).
// Atteso dai dati (indipendente dal codice): club di un evento dell'ondata su quella strada → club della strada →
// curva omonima → neutro.
// Uso: node coordination/sonde/c24-cortei.mjs <radice> <foto> · env SEMI=20 EP= TOL=14
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'; import { join } from 'node:path';
import { R, statiChiamate, avvia, apriChiamata, club } from './c24-comune.mjs';
const DIR = process.argv[3] ?? 'docs/foto/c24'; mkdirSync(DIR, { recursive: true });
const EP = process.env.EP?.split(','); const SEMI = Number(process.env.SEMI ?? 20); const TOL = Number(process.env.TOL ?? 14);
const tok = Object.fromEntries([...readFileSync(join(R, 'src/resa/token.css'), 'utf8').matchAll(/(--mappa-[a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1], x[2]]));
const COL = { ...Object.fromEntries(Object.values(club).flatMap((c) => [[`${c.id}.1`, c.colori.primario], [`${c.id}.2`, c.colori.secondario]])), 'neutro.1': tok['--mappa-folla-2'], 'neutro.2': tok['--mappa-folla-3'] };
const { stati, tutte } = statiChiamate({ SEMI, EP });
const atteso = (m, n, strada) => {
  const ev = m.ondate[n - 1].eventi.find((e) => e.settore === strada && e.club); if (ev) return { club: ev.club, perche: `evento ${ev.id}` };
  const s = m.mappa.settori.find((x) => x.id === strada); if (s?.club) return { club: s.club, perche: 'strada' };
  const cu = m.mappa.settori.find((c) => c.tipo === 'curva' && c.id === `curva_${strada.replace(/^[a-z]+_/, '')}`); if (cu?.club) return { club: cu.club, perche: 'curva omonima' };
  return { club: 'neutro', perche: 'neutro' };
};
const { b, pagina, errori, chiudi } = await avvia();
const conta = await b.newPage();
const contaPixel = (png) => conta.evaluate(async ([b64, COL, TOL]) => {
  const im = new Image(); im.src = `data:image/png;base64,${b64}`; await im.decode();
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data; const rgb = Object.entries(COL).map(([k, h]) => [k, [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))]);
  const n = Object.fromEntries(rgb.map(([k]) => [k, 0]));
  for (let i = 0; i < d.length; i += 4) for (const [k, q] of rgb) if (Math.abs(d[i] - q[0]) <= TOL && Math.abs(d[i + 1] - q[1]) <= TOL && Math.abs(d[i + 2] - q[2]) <= TOL) n[k]++;
  return n;
}, [png.toString('base64'), COL, TOL]);
const RIS = new Map(); let lista = null;
for (const braccio of ['normale', 'C32D01', 'C53D01']) {
  const p = await pagina({ w: 412, h: 915, scala: 2, rossi: braccio === 'normale' ? [] : [braccio], etichetta: braccio });
  for (const [k, x] of stati) {
    if (lista && !lista.includes(k)) continue;
    try { await apriChiamata(p, x, 600); } catch (e) { console.error(`${braccio} ${k}: ${e.message.slice(0, 60)}`); continue; }
    const a = await p.evaluate(() => { const m = document.querySelector('.mappa'); return { dinamica: m?.dataset.dinamica ?? '', dc: m?.dataset.dinamicaColori ?? '', cortei: m?.dataset.coloriCortei ?? '', folla: m?.dataset.folla ?? '' }; });
    const r = RIS.get(k) ?? { k, n: x.n, m: x.m }; r[braccio] = a;
    if (a.dinamica.startsWith('corteo:') || (lista && lista.includes(k))) {
      r[`px_${braccio}`] = await contaPixel(await p.locator('.mappa').first().screenshot({ type: 'png' }));
      if (braccio === 'normale') await p.locator('.mappa').first().screenshot({ path: `${DIR}/cortei-412x2-${k.replace(':', '-')}.jpg`, type: 'jpeg', quality: 80 });
      if (braccio === 'C53D01' && ['e28:ospiti_in_auto', 'e15:mille'].includes(k)) await p.locator('.mappa').first().screenshot({ path: `${DIR}/cortei-412x2-${k.replace(':', '-')}-rosso.jpg`, type: 'jpeg', quality: 80 });
    }
    RIS.set(k, r);
  }
  await p.close();
  if (!lista) lista = [...RIS.values()].filter((r) => r.normale?.dinamica.startsWith('corteo:')).map((r) => r.k);
}
const righe = [];
for (const k of lista) {
  const r = RIS.get(k); const strada = r.normale.dinamica.split(':')[1]; const at = atteso(r.m, r.n, strada);
  const diff = (a, b) => Object.fromEntries(Object.keys(COL).map((c) => [c, (r[a]?.[c] ?? 0) - (r[b]?.[c] ?? 0)]));
  const dv = diff('px_normale', 'px_C32D01'), dr = diff('px_C53D01', 'px_C32D01');
  // colore dominante del corteo della chiamata: somma primario+secondario per club (il secondario Cinderwick #1a1a1a coincide col nero della mappa: si guarda il primario)
  const perClub = (d) => Object.fromEntries([...Object.keys(club), 'neutro'].map((c) => [c, d[`${c}.1`] ?? 0]));
  const dom = (d) => Object.entries(perClub(d)).sort((a, b) => b[1] - a[1])[0];
  const [cv, nv] = dom(dv), [cr, nr] = dom(dr);
  const attesoPrim = at.club === 'neutro' ? 'neutro' : at.club;
  righe.push({ k, strada, atteso: at, dichiarato: r.normale.dc, dominante: cv, px: nv, pxAtteso: dv[`${attesoPrim}.1`], rossoDominante: cr, rossoPx: nr, ok: cv === attesoPrim && nv >= 40, dv, dr });
}
if (process.env.USCITA) writeFileSync(process.env.USCITA, JSON.stringify(righe));
const nomeClub = (id) => (id === 'neutro' ? 'neutro' : id.split('_')[0]);
console.log(`chiamate aperte ${RIS.size}/${tutte.length}; con corteo della chiamata ${lista.length}`);
for (const r of righe) console.log(`${r.ok ? 'ok ' : 'NO '} ${r.k} ${r.strada}: atteso ${nomeClub(r.atteso.club)} (${r.atteso.perche}) · data-dinamica-colori ${r.dichiarato} · pixel del corteo: dominante ${nomeClub(r.dominante)} ${r.px} px (atteso ${r.pxAtteso} px) · rosso C53D01: ${nomeClub(r.rossoDominante)} ${r.rossoPx} px`);
const daEvento = righe.filter((r) => r.atteso.perche.startsWith('evento'));
console.log(`coerenti ${righe.filter((r) => r.ok).length}/${righe.length}; con club dall'evento ${daEvento.length}, coerenti ${daEvento.filter((r) => r.ok).length}; il rosso C53D01 cambia colore in ${daEvento.filter((r) => r.rossoDominante !== r.dominante).length}/${daEvento.length} di queste`);
console.log(`errori di console ${errori.length} ${[...new Set(errori)].slice(0, 3).join(' | ')}`);
await chiudi();
