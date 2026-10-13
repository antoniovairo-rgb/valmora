// Guardiani dei difetti del collaudo C-017, chiamati da tools/foto.mjs.
/** C17-16: unità messe e non confermate; ricarica e «Riprendi» → lo schieramento ha le stesse unità sulla mappa. */
export async function controllaBozzaRicarica(pagina, atteso) {
  const sulla = () => pagina.evaluate(() => [...document.querySelectorAll('[data-presenza] .pastiglia')].reduce((a, e) => a + Number(e.textContent.replace(/\D/g, '') || 0), 0));
  const prima = await sulla();
  if (!prima) return;
  await pagina.reload();
  await pagina.getByRole('button', { name: 'Riprendi' }).click();
  await pagina.waitForSelector('[data-barra]', { timeout: 5000 }).catch(() => {});
  await pagina.waitForTimeout(150);
  const dopo = await sulla();
  atteso(`schieramento: ${prima} unità messe e non confermate, dopo una ricarica ${dopo} (C17-16)`, dopo === prima);
}

/** C17-12: nella città i dischi degli episodi non si coprono e il nome dell'episodio scelto è in primo piano. */
export async function controllaCitta(pagina, atteso, dove) {
  const [dischi, sopra] = await pagina.evaluate(() => {
    const a = (A, B) => Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left)) * Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
    const d = [...document.querySelectorAll('[data-episodio] .settore-punto')].map((e) => e.getBoundingClientRect());
    let dd = 0; for (let i = 0; i < d.length; i++) for (let j = 0; j < i; j++) dd += a(d[i], d[j]);
    const nm = document.querySelector('.episodio.acceso .settore-nome');
    if (!nm) return [dd, true];
    const prima = nm.style.pointerEvents; nm.style.pointerEvents = 'auto'; // .settore non riceve tocchi: per misurare sì
    const r = nm.getBoundingClientRect();
    const ok = [[0.2, 0.3], [0.5, 0.5], [0.8, 0.7]].every(([x, y]) => nm.contains(document.elementFromPoint(r.left + r.width * x, r.top + r.height * y)));
    nm.style.pointerEvents = prima;
    return [dd, ok];
  });
  atteso(`${dove}: dischi degli episodi sovrapposti per ${Math.round(dischi)} px² (C17-12)`, dischi === 0);
  atteso(`${dove}: il nome dell'episodio scelto è coperto da altri dischi (C17-12)`, sopra);
}

/** PO-092: la vignetta (fuori dalla chiamata) prende lo spazio libero: o la pagina è piena, o la vignetta è al massimo. */
export async function controllaRiempi(pagina, atteso, nome) {
  // la finestra può essere appena tornata da 760 a 800 (controllaAltezza): si lascia arrivare l'evento «resize»
  await pagina.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)))); await pagina.waitForTimeout(100);
  const r = await pagina.evaluate(() => {
    const v = [...document.querySelectorAll('svg.vignetta')].find((x) => !x.closest('.chiamata-corpo') && x.getClientRects().length);
    if (!v) return null;
    const main = document.querySelector('main'), app = main.parentElement;
    const libero = innerHeight - (main.getBoundingClientRect().bottom + scrollY + parseFloat(getComputedStyle(main).marginBottom) + parseFloat(getComputedStyle(app).paddingBottom));
    return { h: v.getBoundingClientRect().height, max: parseFloat(getComputedStyle(v).maxHeight), libero };
  });
  if (r) atteso(`${nome}: vignetta alta ${Math.round(r.h)} px con ${Math.round(r.libero)} px liberi sotto (massimo ${r.max}) (PO-092)`, r.libero <= 8 || r.h >= r.max - 1);
}

/** C17-15 (D-114): nella chiamata si accetta lo scorrimento, ma «Rispondi ↓» porta sempre alla prima opzione, intera. */
export async function controllaRispondi(pagina, atteso, dove) {
  if (!(await pagina.locator('[data-indicatore="opzioni"]').count())) return;
  await pagina.click('[data-indicatore="opzioni"]');
  let r = null;
  for (let k = 0; k < 20; k++) { // lo scorrimento può essere animato
    await pagina.waitForTimeout(80);
    r = await pagina.evaluate(() => { const b = document.querySelector('.opzione')?.getBoundingClientRect(); return b ? [b.top, b.bottom, innerHeight] : null; });
    if (r && r[0] >= 0 && r[1] <= r[2]) break;
  }
  atteso(`${dove}: dopo «Rispondi» la prima opzione è a ${r?.map(Math.round).join('–')} (finestra ${r?.[2]}), non intera (C17-15)`, !!r && r[0] >= 0 && r[1] <= r[2]);
  await pagina.evaluate(() => scrollTo(0, 0));
  await pagina.waitForTimeout(150); // l'indicatore si aggiorna all'evento di scorrimento
}

/** PO-096: nello schieramento la riga «in mano» non è troncata e il «?» è grande (tocco ≥ 44 px, icona ≥ 24 px). */
export async function controllaRigaAiuto(pagina, atteso, nome) {
  const r = await pagina.evaluate(() => {
    const p = document.querySelector('.riga-in-mano .in-mano'), b = document.querySelector('.riga-in-mano .aiuto');
    if (!p || !b) return null;
    const i = b.querySelector('svg')?.getBoundingClientRect();
    return { tagliata: p.scrollWidth > p.clientWidth + 1 || getComputedStyle(p).textOverflow === 'ellipsis', tocco: Math.min(b.offsetWidth, b.offsetHeight), icona: i ? Math.min(i.width, i.height) : 0 };
  });
  if (!r) return;
  atteso(`${nome}: la riga dell'aiuto è troncata coi puntini (PO-096)`, !r.tagliata);
  atteso(`${nome}: il «?» è piccolo (tocco ${r.tocco} px, icona ${Math.round(r.icona)} px) (PO-096)`, r.tocco >= 44 && r.icona >= 24);
}

/** PO-097: la versione c'è su ogni schermata, è quella del gioco e non tocca nessun comando. */
export async function controllaVersione(pagina, atteso, nome, versione) {
  const r = await pagina.evaluate(() => {
    const v = document.querySelector('[data-versione-angolo]');
    if (!v) return null;
    const a = v.getBoundingClientRect();
    const sopra = [...document.querySelectorAll('button, a, input, [role="button"]')].filter((e) => e.getClientRects().length).filter((e) => {
      const b = e.getBoundingClientRect(); return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;
    }).map((e) => e.dataset.azione ?? e.textContent.trim().slice(0, 20));
    return { testo: v.textContent, sopra, carattere: parseFloat(getComputedStyle(v).fontSize) };
  });
  atteso(`${nome}: manca il numero di versione (PO-097)`, !!r);
  if (!r) return;
  atteso(`${nome}: versione «${r.testo}» invece di «v${versione}» (PO-097)`, r.testo === `v${versione}`);
  atteso(`${nome}: la versione copre ${r.sopra.join(', ')} (PO-097)`, !r.sopra.length);
}
