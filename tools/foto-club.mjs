// Controlli delle foto su club e rapporto (S-08), a parte da foto.mjs che è al limite delle 400 righe.
// - curve coi colori del club dai dati (D-086): si campiona la mappa vera (strato Pixi) vicino a ogni curva;
// - stemmi della sfida (D-088): uno per club delle curve;
// - picco della tensione nel rapporto (C09-01): si vede dove il motore dice che è salita più di dove è finita.
import { leggiDati } from './dati-disco.mjs';

const livello = (t) => (t <= 0 ? 0 : Math.min(5, Math.ceil(t / 2))); // come src/resa/partita.ts
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Club dei dati, per id. */
export const clubDai = (dirDati) => Object.fromEntries(Object.entries(leggiDati(dirDati)).filter(([k]) => k.startsWith('club/')).map(([, c]) => [c.id, c]));

/** Distanza (RGB) del pixel più vicino al colore cercato, in una fascia sopra ogni curva, verso il campo. */
async function campiona(pagina, curve) {
  const mappa = pagina.locator('.mappa').first();
  await pagina.evaluate(() => document.querySelectorAll('.mappa > [data-settore]').forEach((x) => { x.style.visibility = 'hidden'; }));
  const png = (await mappa.screenshot()).toString('base64');
  await pagina.evaluate(() => document.querySelectorAll('.mappa > [data-settore]').forEach((x) => { x.style.visibility = ''; }));
  return pagina.evaluate(async ([png, curve]) => {
    const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const f = c.getContext('2d'); f.drawImage(img, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const lato = (parseFloat(css.getPropertyValue('--settore')) || 44) / 2, sotto = parseFloat(css.getPropertyValue('--margine-nomi')) || 34;
    const r = document.querySelector('.mappa').getBoundingClientRect(), sx = img.width / r.width;
    const centro = curve.reduce((a, q) => a + q.x, 0) / curve.length;
    return curve.map((q) => {
      const x = (lato + ((r.width - 2 * lato) * q.x) / 100) * sx, y = (lato + ((r.height - 2 * lato - sotto) * q.y) / 100) * sx;
      const verso = Math.sign(centro - q.x) || 1;
      let migliore = Infinity;
      // parte alta della curva, fuori dall'alone del settore (raggio 34 px) che la tinge col colore della tensione
      for (let dx = 0; dx <= 40 * sx; dx++) for (let dy = -75 * sx; dy <= -36 * sx; dy++) {
        if (y + dy < 0) continue;
        const [R, G, B] = f.getImageData(Math.round(x + verso * dx), Math.round(y + dy), 1, 1).data;
        migliore = Math.min(migliore, Math.hypot(R - q.colore[0], G - q.colore[1], B - q.colore[2]));
      }
      return { id: q.id, distanza: Math.round(migliore) };
    });
  }, [png, curve]);
}

/** Curve sulla mappa col primario del loro club (D-086); solo con WebGL (senza, la mappa è solo HTML). */
export async function controllaCurve(pagina, m, club, atteso) {
  if ((await pagina.getAttribute('.mappa', 'data-mappa')) !== 'webgl') return;
  const curve = m.mappa.settori.filter((s) => s.tipo === 'curva' && club[s.club]?.colori && s.pos)
    .map((s) => ({ id: s.id, x: s.pos.x, y: s.pos.y, colore: rgb(club[s.club].colori.primario) }));
  if (!curve.length) return;
  for (const q of await campiona(pagina, curve)) {
    atteso(`${m.id}: la curva «${q.id}» non ha i colori del suo club (pixel più vicino a ${q.distanza}, serve ≤ 40) (D-086)`, q.distanza <= 40);
  }
}

/** Uno stemma per club delle curve, col club giusto (D-088). */
export async function controllaSfida(pagina, m, atteso, dove) {
  const attesi = m.mappa.settori.filter((s) => s.club).map((s) => s.club).join(',');
  if (!attesi) return;
  const visti = await pagina.$$eval('.scena [data-sfida] [data-stemma]', (xs) => xs.map((x) => x.dataset.stemma).join(','));
  atteso(`${m.id} ${dove}: stemmi «${visti}», servono «${attesi}» (D-088)`, visti === attesi);
}

/** Picco della tensione nel rapporto (C09-01): segnato dove il picco ha un colore più alto della fine. */
export async function controllaPicco(pagina, m, rapporto, atteso) {
  if (!rapporto?.picco) return;
  for (const s of m.mappa.settori) {
    const sale = livello(rapporto.picco[s.id] ?? 0) > livello(rapporto.tensione[s.id] ?? 0);
    const visto = (await pagina.locator(`[data-picco="${s.id}"]`).count()) === 1;
    atteso(`${m.id} rapporto ${rapporto.n}: «${s.id}» ${sale ? 'salita e poi calmata ma il picco non si vede' : 'picco mostrato senza salita'} (C09-01)`, sale === visto);
  }
}
