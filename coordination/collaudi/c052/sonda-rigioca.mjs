// C-052 (sola lettura): «Rigioca» di un episodio superato → Tripla (3 passi): scorrimento e pulsanti+ombra rispetto
// al riquadro interno della scheda più vicina (la Tripla è una .scheda dentro la scheda dell'episodio) e di quella esterna.
// Uso: node sonda-rigioca.mjs <uscita.json> [cartella foto]
import { writeFileSync, mkdirSync } from 'node:fs';
import { avvia, apriCitta, salvTutti, missioni } from './lib.mjs';
const salv = () => { const s = salvTutti(); if (!process.env.PARZ) return s; const fuori = missioni.slice(8).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const [out, foto] = process.argv.slice(2); if (foto) mkdirSync(foto, { recursive: true });
const FORMATI = []; for (const w of [360, 375, 412]) for (const h of [640, 667, 760, 915]) FORMATI.push([w, h]); FORMATI.push([412, 800]);
const mis = () => {
  const R = (e) => e.getBoundingClientRect(); const de = document.documentElement;
  const fuori = (sc, b) => { const cs = getComputedStyle(sc), s = R(sc), r = R(b); const [dx, dy] = (getComputedStyle(b).boxShadow.match(/(-?[\d.]+)px (-?[\d.]+)px/)?.slice(1) ?? [0, 0]).map(parseFloat);
    return { sx: +(r.left - (s.left + parseFloat(cs.borderLeftWidth))).toFixed(1), dx: +((s.right - parseFloat(cs.borderRightWidth)) - (r.right + Math.max(dx, 0))).toFixed(1), giu: +((s.bottom - parseFloat(cs.borderBottomWidth)) - (r.bottom + Math.max(dy, 0))).toFixed(1) }; };
  const tr = document.querySelector('.tripla'), es = document.querySelector('[data-scheda-episodio]');
  return { sv: de.scrollHeight - innerHeight, sh: de.scrollWidth - innerWidth, passo: tr?.dataset.confermaPasso ?? null,
    bt: tr ? [...tr.querySelectorAll('.pulsante')].map((b) => ({ az: b.dataset.azione, vsTripla: fuori(tr, b), vsEpisodio: fuori(es, b) })) : [],
    trVsEp: tr ? (() => { const a = R(tr), b = R(es); return { sx: +(a.left - b.left).toFixed(1), dx: +(b.right - a.right).toFixed(1), giu: +(b.bottom - a.bottom).toFixed(1) }; })() : null };
};
const a = await avvia(); const ris = [];
for (const [w, h] of FORMATI) {
  const { ctx, p } = await apriCitta(a.browser, a.url, w, h, salv());
  for (const [s, e] of (process.env.PARZ ? [[1, 'e01'], [1, 'e04']] : [[1, 'e01'], [2, 'e19'], [3, 'e36']])) {
    await p.click(`[data-stagione="${s}"]`); await p.waitForTimeout(150);
    await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(120);
    const prima = await p.evaluate(mis);
    await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(150);
    for (let i = 1; i <= 3; i++) { const m = await p.evaluate(mis); ris.push({ w, h, s, e, ...m });
      if (foto && ((w === 360 && h === 760) || (w === 412 && h === 915)) && s === 2) await p.screenshot({ path: `${foto}/rigioca-${w}x${h}-${e}-passo${i}.jpg`, type: 'jpeg', quality: 70 });
      if (i < 3) await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(100); }
    await p.click('[data-azione="annulla-rigioca"]'); await p.waitForTimeout(100);
    ris.push({ w, h, s, e, passo: 'dopo-no', ...(await p.evaluate(mis)), prima: prima.sv });
  }
  await ctx.close();
}
writeFileSync(out, JSON.stringify(ris)); await a.chiudi();
const per = {}; for (const r of ris) (per[`${r.w}×${r.h}`] ??= []).push(r);
for (const [k, L] of Object.entries(per)) { const t = L.filter((r) => r.bt.length); console.log(k, 'sv max', Math.max(...L.map((r) => r.sv)), 'sh', Math.max(...L.map((r) => r.sh)), 'btn vs Tripla min sx/dx/giù', ['sx', 'dx', 'giu'].map((c) => Math.min(...t.flatMap((r) => r.bt.map((b) => b.vsTripla[c])))).join('/'), 'vs episodio', ['sx', 'dx', 'giu'].map((c) => Math.min(...t.flatMap((r) => r.bt.map((b) => b.vsEpisodio[c])))).join('/')); }
