// PO-119 / D-171: nella scena del tono (vignetta grande, foto-c33) protagonista e vice sono quelli della seconda bozza
// approvata: due figure nuove (data-persona="2"), occhi (pupille) dentro la cornice, dettagli del volto col tratto sottile
// del token (col tratto normale gli occhi a 3× erano macchie nere), il vice a braccia conserte quando la serata non è
// critica (pose delle tavole). Rosso VALMORA_ROSSI=C114P01: il disegno della 0.38.0.
export async function controllaPersone(p, atteso, dove) {
  const r = await p.evaluate(() => {
    const v = document.querySelector('.scena[data-scena="tono"] [data-vignetta^="ondata-"]'); if (!v) return null;
    const cornice = v.getBoundingClientRect(), fig = [...v.querySelectorAll('[data-persona="2"] > g')];
    const pupille = fig.map((g) => [...g.querySelectorAll('circle[r="1.9"]')].map((c) => c.getBoundingClientRect()));
    const fuori = pupille.flat().filter((q) => q.left < cornice.left || q.right > cornice.right || q.top < cornice.top || q.bottom > cornice.bottom).length;
    const fini = [...v.querySelectorAll('[data-persona="2"] .v-fine')].map((e) => getComputedStyle(e).strokeWidth);
    const token = getComputedStyle(document.documentElement).getPropertyValue('--vignetta-tratto-fine').trim();
    return { n: fig.length, pupille: pupille.map((x) => x.length), fuori, fini: fini.length, storti: fini.filter((x) => x !== token).length, token,
      tono: v.dataset.vignetta.replace('ondata-', ''), vice: fig[1]?.dataset.braccia ?? null };
  });
  atteso(`${dove}: vignetta del tono assente (PO-119)`, !!r);
  if (!r) return;
  atteso(`${dove}: ${r.n} figure della seconda bozza invece di 2 (PO-119, D-171)`, r.n === 2);
  if (r.n !== 2) return;
  atteso(`${dove}: pupille per figura ${r.pupille.join('/')} invece di 2/2, ${r.fuori} fuori dalla cornice (PO-119)`, r.pupille.every((x) => x === 2) && !r.fuori);
  atteso(`${dove}: ${r.storti} dettagli del volto su ${r.fini} senza il tratto sottile ${r.token} (PO-119)`, r.fini > 0 && !r.storti);
  atteso(`${dove}: vice con le braccia «${r.vice}» a serata «${r.tono}» (conserte se non critica, D-171)`, r.tono === 'critico' ? r.vice !== 'conserte' : r.vice === 'conserte');
}
