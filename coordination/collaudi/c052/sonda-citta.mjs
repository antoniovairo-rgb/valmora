// C-052 (sola lettura): città, 3 stagioni × ogni episodio scelto (e nessuna scelta) × formati. Misura scorrimento V/O,
// spazio sopra le teste, bolle tagliate/sovrapposte, pulsanti+ombra rispetto al riquadro interno della scheda.
// Uso: node sonda-citta.mjs <tutti|nessuno|parziale> <uscita.json> [colore=dark]
import { writeFileSync } from 'node:fs';
import { avvia, apriCitta, salvTutti, salvNessuno, missioni } from './lib.mjs';
const [modo, out, schema] = process.argv.slice(2);
const primi = (n) => { const s = salvTutti(); const fuori = missioni.slice(n).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const sal = /^n\d+$/.test(modo) ? primi(Number(modo.slice(1))) : modo === 'tutti' ? salvTutti() : modo === 'nessuno' ? salvNessuno() : (() => { const s = salvTutti(); const fuori = missioni.slice(8).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; })();
const FORMATI = []; for (const w of [360, 375, 412]) for (const h of [640, 667, 760, 915]) FORMATI.push([w, h]); FORMATI.push([412, 800]);
const misura = () => {
  const R = (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const de = document.documentElement, ap = document.getElementById('app');
  const m = { sv: de.scrollHeight - innerHeight, sh: de.scrollWidth - innerWidth, bsv: document.body.scrollHeight - innerHeight, appsv: ap ? ap.scrollHeight - ap.clientHeight : null };
  const fig = document.querySelector('[data-citta-striscia]'), svg = fig?.querySelector('svg.vignetta');
  m.striscia = null;
  if (svg) { const gs = [...svg.querySelectorAll('[data-persona]')]; const sr = svg.getBoundingClientRect();
    m.striscia = { h: Math.round(sr.height), sopra: gs.map((g) => +(g.getBoundingClientRect().top - sr.top).toFixed(1)) }; }
  const mp = document.querySelector('.mappa.citta'); const mr = mp.getBoundingClientRect(); m.mappa = { h: Math.round(mr.height), w: Math.round(mr.width), t: Math.round(mr.top) };
  const ep = [...document.querySelectorAll('[data-episodio]')]; const tagli = [], sov = [];
  const parti = ep.map((e) => ({ id: e.dataset.episodio, rr: [e.querySelector('.settore-punto'), e.querySelector('.settore-unita')].filter(Boolean).map(R), nome: e.querySelector('.settore-nome') ? R(e.querySelector('.settore-nome')) : null }));
  for (const q of parti) { for (const r of q.rr.concat(q.nome ? [q.nome] : [])) { const o = Math.max(mr.left - r.l, r.r - mr.right, mr.top - r.t, r.b - mr.bottom); if (o > 0.5) { tagli.push(`${q.id}:${o.toFixed(1)}`); break; } } }
  const inter = (a, b) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0.5 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0.5;
  for (let i = 0; i < parti.length; i++) for (let j = 0; j < parti.length; j++) { if (i === j) continue;
    if (j > i) for (const a of parti[i].rr) for (const b of parti[j].rr) if (inter(a, b)) { sov.push(`${parti[i].id}×${parti[j].id}`); break; }
    if (parti[i].nome) for (const b of parti[j].rr) if (inter(parti[i].nome, b)) sov.push(`nome ${parti[i].id}×${parti[j].id}`); }
  m.clip = [...document.querySelectorAll('.scena button, .scena h2, .scena p, .scena .sfida *')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => (e.className?.baseVal ?? e.className ?? e.tagName).toString().slice(0, 30)).slice(0, 5);
  m.tagli = [...new Set(tagli)]; m.sov = [...new Set(sov)];
  const sc = document.querySelector('.scena .scheda'); m.scheda = null; m.bt = [];
  if (sc) { const cs = getComputedStyle(sc), s = R(sc), bw = { l: parseFloat(cs.borderLeftWidth), r: parseFloat(cs.borderRightWidth), t: parseFloat(cs.borderTopWidth), b: parseFloat(cs.borderBottomWidth) };
    m.scheda = { h: Math.round(s.b - s.t), cls: sc.className, bw: bw.l };
    for (const b of sc.querySelectorAll('.pulsante')) { const r = R(b), sh = getComputedStyle(b).boxShadow; const mm = sh.match(/(-?[\d.]+)px (-?[\d.]+)px/g); const [dx, dy] = (mm?.[0] ?? '0px 0px').split(' ').map(parseFloat);
      m.bt.push({ az: b.dataset.azione ?? b.textContent.trim().slice(0, 20), sx: +(r.l - (s.l + bw.l)).toFixed(1), dx: +((s.r - bw.r) - (r.r + Math.max(dx, 0))).toFixed(1), giu: +((s.b - bw.b) - (r.b + Math.max(dy, 0))).toFixed(1), ombra: `${dx},${dy}` }); } }
  const last = [...document.querySelector('.scena').children].pop(); m.fondo = Math.round(innerHeight - last.getBoundingClientRect().bottom); m.scelto = !!document.querySelector('[data-scheda-episodio]'); m.invito = document.querySelector('[data-invito]')?.dataset.invito ?? null;
  return m;
};
const a = await avvia(); const ris = []; let errTot = 0;
for (const [w, h] of FORMATI) {
  const { ctx, p, err } = await apriCitta(a.browser, a.url, w, h, sal, schema === 'dark' ? { colorScheme: 'dark' } : {});
  if (process.env.ZOOM) await p.addStyleTag({ content: `:root { --testo-mini: ${12 * process.env.ZOOM}px; --testo-piccolo: ${13 * process.env.ZOOM}px; --testo-base: ${16 * process.env.ZOOM}px; --testo-grande: ${20 * process.env.ZOOM}px; --testo-titolo: ${26 * process.env.ZOOM}px; --testo-numero: ${34 * process.env.ZOOM}px; }` });
  for (const s of [1, 2, 3]) {
    await p.click(`[data-stagione="${s}"]`); await p.waitForTimeout(150);
    const base = await p.evaluate(misura); ris.push({ w, h, s, ep: null, ...base });
    for (const e of await p.locator('[data-episodio] .settore-punto:not([disabled])').evaluateAll((l) => l.map((x) => x.closest('[data-episodio]').dataset.episodio))) {
      await p.locator(`[data-episodio="${e}"] .settore-punto`).click({ timeout: 4000 }); await p.waitForTimeout(80);
      ris.push({ w, h, s, ep: e, ...(await p.evaluate(misura)) });
    }
  }
  errTot += err.length; if (err.length) console.log('ERRORI', w, h, err.slice(0, 3)); await ctx.close();
}
writeFileSync(out, JSON.stringify({ modo, schema: schema ?? 'chiaro', ris, errTot }, null, 0));
console.log(modo, 'stati', ris.length, 'errori console', errTot); await a.chiudi();
