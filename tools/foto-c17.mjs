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
