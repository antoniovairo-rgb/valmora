// Sonda C-024 (sola lettura): PO-085 (D-120, D-122), spicchio d'orologio dell'urgenza come bollino. Ogni chiamata
// raggiungibile aperta nell'interfaccia a 360×760, 375×667, 412×915, due bracci (verde e rosso C51O01 = senza
// orologio). Misura: posto del bollino (angolo di quale elemento), parte dell'avatar e del suo glifo coperta, testi o
// comandi sotto il bollino, parte del bollino fuori dal fumetto e cosa c'è sotto, altezza del fumetto e del documento
// nei due bracci, gruppo dell'evento della vignetta (per la coerenza con «l'urgenza vera»). Prova anche lo
// scorrimento: fumetto appena sotto la barra fissa in alto, chi sta sopra al centro del bollino.
// Uso: node coordination/sonde/c24-orologio.mjs <radice> <foto> · env SEMI=20 EP= LARGHEZZE=
import { mkdirSync, writeFileSync } from 'node:fs';
import { statiChiamate, avvia, apriChiamata } from './c24-comune.mjs';
const DIR = process.argv[3] ?? 'docs/foto/c24'; mkdirSync(DIR, { recursive: true });
const EP = process.env.EP?.split(','); const SEMI = Number(process.env.SEMI ?? 20);
const LARG = (process.env.LARGHEZZE ?? '360x760,375x667,412x915').split(',').map((x) => x.split('x').map(Number));
const { stati, partite, blocchi, tutte, mai } = statiChiamate({ SEMI, EP });
console.log(`partite ${partite}, blocchi ${blocchi}; chiamate raggiunte ${stati.size}/${tutte.length}; mai: ${mai.join(' ') || 'nessuna'}`);
const { pagina, errori, chiudi } = await avvia();
const FOTO = new Set((process.env.FOTO ?? 'e01:corteo_partito,e18:telefonata,e07:quaranta_pulmini,e28:ospiti_in_auto,e15:mille').split(','));
const misura = (p) => p.evaluate(() => {
  const m = document.querySelector('.scena[data-scena="chiamata"] .messaggio.ultimo'); if (!m) return null;
  const R = (e) => e.getBoundingClientRect(); const ar = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const o = m.querySelector('[data-urgenza]'), av = m.querySelector('.avatar'), ic = av?.querySelector('svg'), chi = m.querySelector('.chi'), tim = m.querySelector('.timbro');
  const se = document.scrollingElement; const base = { doc: se.scrollHeight, msg: Math.round(R(m).height), chi: Math.round(R(chi).height), evento: m.querySelector('svg.vignetta')?.dataset.evento ?? null, timbro: tim?.textContent ?? null };
  if (!o) return { ...base, c: false };
  const a = R(o), mr = R(m), avr = av ? R(av) : null, icr = ic ? R(ic) : null, tr = tim ? R(tim) : null;
  const proprio = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const sotto = [...document.querySelectorAll('body *')].filter((e) => e !== o && !e.contains(o) && !e.closest('svg') && e.getClientRects().length && (e.matches('button, a') || proprio(e)) && ar(a, R(e)) > 0.5).map((e) => e.textContent.trim().slice(0, 20));
  // fuori dal fumetto: punti ogni 2 px nel bollino fuori dal rettangolo del messaggio; cosa c'è sotto (bollino nascosto)
  o.style.visibility = 'hidden'; let fuori = 0, tot = 0; const sottoFuori = {};
  for (let y = a.top + 1; y < a.bottom; y += 2) for (let x = a.left + 1; x < a.right; x += 2) { tot++; if (x < mr.left || x > mr.right || y < mr.top || y > mr.bottom) { fuori++; const t = document.elementFromPoint(x, y); const k = t ? (t.closest('.messaggio') && t.closest('.messaggio') !== m ? 'altro messaggio' : t.closest('header, .testata, .barra') ? 'testata' : (t.className?.baseVal ?? t.className ?? t.tagName).toString().split(' ')[0] || t.tagName) : 'nulla'; sottoFuori[k] = (sottoFuori[k] ?? 0) + 1; } }
  o.style.visibility = '';
  const angolo = avr ? `${Math.round(a.left - avr.left)},${Math.round(a.top - avr.top)} dall'avatar` : '?';
  return { ...base, c: true, bw: Math.round(a.width), bh: Math.round(a.height), angolo, xMsg: Math.round(a.left - mr.left), destra: a.left > mr.left + mr.width / 2,
    avatarCoperto: avr ? ar(a, avr) / (avr.width * avr.height) : null, glifoCoperto: icr ? ar(a, icr) / (icr.width * icr.height) : null,
    timbroDist: tr ? Math.round(tr.left - a.right) : null, sotto, fuori: tot ? fuori / tot : 0, sottoFuori, dentro: a.left >= 0 && a.right <= innerWidth };
});
// scorrimento: il fumetto portato appena sotto la barra fissa; chi sta sopra al centro del bollino
const scorri = (p) => p.evaluate(async () => {
  const m = document.querySelector('.scena[data-scena="chiamata"] .messaggio.ultimo'), o = m?.querySelector('[data-urgenza]'); if (!o) return null;
  const fissi = [...document.querySelectorAll('body *')].filter((e) => ['sticky', 'fixed'].includes(getComputedStyle(e).position) && e.getClientRects().length && e.getBoundingClientRect().top < 5 && e.getBoundingClientRect().height > 20);
  const barra = fissi.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]; if (!barra) return { barra: false };
  const giu = barra.getBoundingClientRect().bottom; const a = o.getBoundingClientRect();
  scrollBy(0, a.top + a.height / 2 - (giu - 4)); await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  const b = o.getBoundingClientRect(); const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
  if (cy > barra.getBoundingClientRect().bottom || cy < barra.getBoundingClientRect().top) { scrollTo(0, 0); return { barra: true, provato: false }; }
  const t = document.elementFromPoint(cx, cy); const r = { barra: true, provato: true, sopra: t === o || o.contains(t) ? 'bollino' : barra.contains(t) ? 'barra' : (t?.className?.toString() ?? '?') };
  scrollTo(0, 0); return r;
});
const RIS = [];
for (const [w, h] of LARG) for (const braccio of ['verde', 'C51O01']) {
  const p = await pagina({ w, h, rossi: braccio === 'verde' ? [] : [braccio], etichetta: braccio });
  for (const [k, x] of stati) {
    try { await apriChiamata(p, x, 150); } catch (e) { RIS.push({ k, w, braccio, errore: e.message.slice(0, 60) }); continue; }
    const r = await misura(p); const s = braccio === 'verde' ? await scorri(p) : null; RIS.push({ k, w, braccio, ...r, scorri: s });
    if (FOTO.has(k)) { await p.screenshot({ path: `${DIR}/orologio-${w}-${k.replace(':', '-')}${braccio === 'verde' ? '' : '-rosso'}.jpg`, type: 'jpeg', quality: 80 });
      if (braccio === 'verde' && w === 360) await p.locator('.scena[data-scena="chiamata"] .messaggio.ultimo .chi').screenshot({ path: `${DIR}/orologio-zoom-${k.replace(':', '-')}.png` }).catch(() => {}); }
  }
  await p.close();
}
if (process.env.USCITA) writeFileSync(process.env.USCITA, JSON.stringify(RIS));
for (const [w] of LARG) {
  const v = RIS.filter((r) => r.w === w && r.braccio === 'verde' && !r.errore), ro = new Map(RIS.filter((r) => r.w === w && r.braccio === 'C51O01' && !r.errore).map((r) => [r.k, r]));
  const con = v.filter((r) => r.c); const piuAlte = v.filter((r) => ro.has(r.k) && (r.msg !== ro.get(r.k).msg || r.doc !== ro.get(r.k).doc));
  const st = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? `min ${s[0].toFixed(2)} mediana ${s[s.length >> 1].toFixed(2)} max ${s.at(-1).toFixed(2)}` : '-'; };
  console.log(`${w}: chiamate ${v.length} (rosso ${ro.size}); con bollino ${con.length}; timbro ${[...new Set(v.map((r) => r.timbro))].join('/')}; rosso con bollino ${[...ro.values()].filter((r) => r.c).length}`);
  console.log(`   misura ${[...new Set(con.map((r) => `${r.bw}×${r.bh}`))].join(',')}; posto ${[...new Set(con.map((r) => r.angolo))].join(' / ')}; nella metà destra del fumetto ${con.filter((r) => r.destra).length}`);
  console.log(`   avatar coperto ${st(con.map((r) => r.avatarCoperto))} · glifo dell'avatar coperto ${st(con.map((r) => r.glifoCoperto))}`);
  console.log(`   testi o comandi sotto il bollino ${con.filter((r) => r.sotto.length).length}${con.filter((r) => r.sotto.length).slice(0, 4).map((r) => ` ${r.k}:«${r.sotto.join(',')}»`).join('')}; fuori dalla finestra ${con.filter((r) => !r.dentro).length}`);
  const sf = {}; for (const r of con) for (const [kk, n] of Object.entries(r.sottoFuori)) sf[kk] = (sf[kk] ?? 0) + n;
  console.log(`   parte del bollino fuori dal fumetto ${st(con.map((r) => r.fuori))}; sotto la parte fuori: ${Object.entries(sf).map(([kk, n]) => `${kk}:${n}`).join(' ')}`);
  console.log(`   fumetto o documento diverso dal rosso ${piuAlte.length}${piuAlte.slice(0, 5).map((r) => ` ${r.k} msg ${r.msg}/${ro.get(r.k).msg} doc ${r.doc}/${ro.get(r.k).doc}`).join('')}`);
  const sc = v.filter((r) => r.scorri?.provato); console.log(`   scorrimento sotto la barra: provati ${sc.length}, bollino sopra la barra ${sc.filter((r) => r.scorri.sopra === 'bollino').length}, barra sopra ${sc.filter((r) => r.scorri.sopra === 'barra').length}, altro ${sc.filter((r) => !['bollino', 'barra'].includes(r.scorri.sopra)).length}`);
  const ev = {}; for (const r of con) ev[r.evento] = (ev[r.evento] ?? 0) + 1; console.log(`   gruppo dell'evento delle chiamate col bollino: ${Object.entries(ev).map(([kk, n]) => `${kk}=${n}`).join(' ')}`);
}
console.log(`errori di apertura ${RIS.filter((r) => r.errore).length}; errori di console ${errori.length} ${[...new Set(errori)].slice(0, 3).join(' | ')}`);
await chiudi();
