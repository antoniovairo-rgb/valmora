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

/** Curve sulla mappa col primario del loro club (D-086), nella prima ondata di partita (spalti pieni, S-11);
 *  solo con WebGL (senza, la mappa è solo HTML). */
export async function controllaCurve(pagina, m, n, club, atteso) {
  if (m.ondate.findIndex((o) => o.eventi.some((e) => e.tipo === 'curva')) !== n - 1) return;
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

/** Spalti e cortei disegnati secondo gli eventi dell'ondata (S-11, PO-046): partita = spalti pieni e strade
 *  vuote; cortei solo dove l'ondata ha gente in strada; dopo il deflusso i cortei escono. */
export async function controllaFolla(pagina, m, n, atteso) {
  if ((await pagina.getAttribute('.mappa', 'data-mappa')) !== 'webgl') return;
  const [spalti, lista = ''] = ((await pagina.getAttribute('.mappa', 'data-folla')) ?? '').split('|');
  const cortei = lista ? lista.split(',').map((x) => x.split('>')) : [];
  const eventi = m.ondate[n - 1].eventi; const tipi = new Set(eventi.map((e) => e.tipo));
  const strade = new Set(m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => s.id));
  const dove = `${m.id} ondata ${n} (spalti «${spalti}», cortei «${lista}»)`;
  if (tipi.has('curva')) atteso(`${dove}: durante la partita servono spalti pieni e strade vuote (PO-046)`, spalti === 'pieni' && cortei.length === 0);
  for (const [s] of cortei) atteso(`${dove}: corteo su «${s}» senza un evento in strada in questa ondata (PO-046)`, eventi.some((e) => e.settore === s));
  for (const e of eventi) if (e.tipo === 'corteo' && strade.has(e.settore) && !tipi.has('curva')) atteso(`${dove}: evento corteo su «${e.settore}» ma nessun corteo disegnato`, cortei.some(([s]) => s === e.settore));
  if (tipi.has('deflusso')) atteso(`${dove}: al deflusso la gente esce dallo stadio`, spalti === 'deflusso' && cortei.every(([, v]) => v === 'esce'));
}

/** Schermate a passi (S-10, PO-045): a 360 px di larghezza la pagina sta in 760 px di altezza, senza scorrere.
 *  Con VALMORA_MISURE=1 stampa l'altezza di ogni schermata (misura prima/dopo). */
export async function controllaAltezza(pagina, larghezza, nome, atteso) {
  if (!['sala', 'briefing', 'verbale'].includes(nome)) return;
  const prima = pagina.viewportSize();
  await pagina.setViewportSize({ width: prima.width, height: 760 }); // il telefono di riferimento è 360×760
  await pagina.waitForTimeout(50);
  const [h, passo, passi] = await pagina.evaluate(() => [document.documentElement.scrollHeight, document.querySelector('.passi')?.dataset.passo, !!document.querySelector('.passi')]);
  await pagina.setViewportSize(prima);
  if (process.env.VALMORA_MISURE) console.log(`misura ${larghezza}px ${nome} ${passo ?? '-'}: ${h} px`);
  if (larghezza === 360 && (passi || process.env.VALMORA_ROSSI?.includes('C12P01')) ) atteso(`${nome} ${passo ?? ''}: ${h} px di pagina, a 360×760 si scorre (PO-045)`, h <= 760);
}

/** Attraversa i passi della schermata («Avanti») finché il pulsante cercato non si vede; foto a ogni passo. */
export async function avanzaFino(pagina, sel, dopo) {
  const vede = async (s) => (await pagina.locator(s).count()) > 0 && pagina.locator(s).first().isVisible();
  while (!(await vede(sel)) && (await vede('[data-azione="passo"]'))) { await pagina.click('[data-azione="passo"]'); await dopo(); }
}

/** C12-01 (D-055): la tensione mai in cifre. Ogni frase (spezzata a «·», «,», «:») che parla di tensione non ha
 *  numeri; si leggono anche i passi nascosti del verbale. */
export async function controllaCifreTensione(pagina, atteso, dove) {
  const frasi = await pagina.evaluate(() => [...document.querySelectorAll('.scena *')]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((el) => el.textContent));
  const male = frasi.flatMap((x) => x.split(/[·,:;]/)).filter((x) => /tension/i.test(x) && /\d/.test(x));
  atteso(`${dove}: tensione in cifre «${male.slice(0, 2).join(' | ')}» (C12-01, D-055)`, male.length === 0);
}

/** S-19 (PO-067, D-097): barra della fiducia in ogni schermata dell'episodio, col valore del salvataggio; se
 *  cambia rispetto alla schermata prima, nella risposta compare «+N/−N» col segno giusto. */
let fiduciaPrima = null;
export async function controllaFiducia(pagina, nome, atteso) {
  if (!['schieramento', 'chiamata', 'risposta', 'chiusura', 'rapporto'].includes(nome)) { fiduciaPrima = null; return; }
  const [barra, valore, delta, salvata] = await pagina.evaluate(() => {
    const b = document.querySelectorAll('[data-fiducia]');
    const s = JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null');
    return [b.length, Number(b[0]?.dataset.fiducia), Number(document.querySelector('[data-delta]')?.dataset.delta ?? 0), s?.in_corso?.variabili?.credito];
  });
  atteso(`${nome}: ${barra} barre della fiducia, ne serve una (PO-067)`, barra === 1);
  if (salvata !== undefined) atteso(`${nome}: la barra dice ${valore}, la fiducia salvata è ${salvata} (PO-067)`, valore === salvata);
  if (nome === 'risposta' && fiduciaPrima !== null && valore !== fiduciaPrima) atteso(`risposta: fiducia da ${fiduciaPrima} a ${valore} senza «${valore - fiduciaPrima}» accanto alla barra (PO-067)`, delta === valore - fiduciaPrima);
  fiduciaPrima = valore;
}

/** S-12 (PO-061): «Annulla l'ultima» toglie l'ultima unità messa; «Conferma» apre il riepilogo con le unità messe e,
 *  se ne avanzano, «Ti restano N»; poi «Sì, conferma». */
export async function confermaSchieramento(pagina, { premi, atteso, fotoSe, prova, ultima }) {
  const sulla = () => pagina.evaluate(() => [...document.querySelectorAll('[data-presenza] .pastiglia')].reduce((a, e) => a + Number(e.textContent.replace(/\D/g, '') || 0), 0));
  if (prova && ultima) {
    const [r, s] = ultima, prima = await sulla();
    await premi('[data-azione="annulla"]');
    atteso(`schieramento: «Annulla l'ultima» da ${prima} a ${await sulla()} unità, doveva toglierne una (PO-061)`, (await sulla()) === prima - 1);
    if ((await sulla()) === prima - 1) {
      if ((await pagina.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await premi(`[data-risorsa="${r}"]`);
      await premi(`[data-settore="${s}"] .settore-punto`);
    }
  }
  const messe = await sulla();
  const libere = await pagina.evaluate(() => [...document.querySelectorAll('[data-risorsa] strong')].reduce((a, e) => a + Number(e.textContent || 0), 0));
  await premi('[data-azione="conferma"]');
  const riepilogo = await pagina.getAttribute('[data-riepilogo]', 'data-riepilogo', { timeout: 2000 }).catch(() => null);
  atteso(`schieramento: «Conferma» senza riepilogo di cosa va dove (PO-061)`, riepilogo !== null);
  if (riepilogo === null) return;
  atteso(`riepilogo: ${riepilogo} unità, sulla mappa ce ne sono ${messe} (PO-061)`, Number(riepilogo) === messe);
  const restano = await pagina.getAttribute('[data-restano]', 'data-restano', { timeout: 500 }).catch(() => null);
  atteso(`riepilogo: ${libere} unità libere ma «Ti restano» dice ${restano ?? 'niente'} (PO-061)`, libere ? Number(restano) === libere : restano === null);
  await fotoSe();
  await premi('[data-azione="conferma-davvero"]');
}

/** S-20 (PO-073): esporta → ricarica pulita → importa = stesso salvataggio; file rovinato = avviso e nulla
 *  cambia; con una partita, due conferme; salvataggio principale rovinato = ripresa dalla copia di riserva. */
export async function controllaArchivio(pagina, { atteso, scena, foto }) {
  const CH = 'valmora-salvataggio';
  const leggi = () => pagina.evaluate((k) => localStorage.getItem(k), CH);
  await pagina.reload(); await scena('titolo');
  const prima = await leggi();
  if (!prima) { atteso('archivio: nessun salvataggio da esportare', false); return; }
  const [scarico] = await Promise.all([pagina.waitForEvent('download'), pagina.click('[data-azione="esporta"]')]);
  atteso(`archivio: il file si chiama «${scarico.suggestedFilename()}», non valmora-AAAA-MM-GG.json`, /^valmora-\d{4}-\d{2}-\d{2}\.json$/.test(scarico.suggestedFilename()));
  const percorso = await scarico.path();
  const { readFileSync } = await import('node:fs');
  const esportato = JSON.parse(readFileSync(percorso, 'utf8'));
  atteso('archivio: il file esportato non è il salvataggio', JSON.stringify(esportato) === JSON.stringify(JSON.parse(prima)));
  // ricarica pulita e importazione: senza partita entra subito
  await pagina.evaluate(() => localStorage.clear()); await pagina.reload(); await scena('titolo');
  await pagina.setInputFiles('[data-importa]', percorso);
  await pagina.waitForSelector('[data-importata]', { timeout: 3000 }).catch(() => {});
  atteso('archivio: esporta → ricarica pulita → importa non ridà lo stesso salvataggio', JSON.stringify(JSON.parse((await leggi()) ?? 'null')) === JSON.stringify(esportato));
  // file non valido: avviso, nulla cambia
  const ora = await leggi();
  await pagina.setInputFiles('[data-importa]', { name: 'rotto.json', mimeType: 'application/json', buffer: Buffer.from('{rotto') });
  await pagina.waitForSelector('[data-errore-importa]', { timeout: 3000 }).catch(() => {});
  atteso('archivio: file rovinato senza avviso', (await pagina.locator('[data-errore-importa]').count()) === 1);
  atteso('archivio: il file rovinato ha cambiato il salvataggio', (await leggi()) === ora);
  // con una partita: due conferme
  await pagina.setInputFiles('[data-importa]', percorso);
  const uno = await pagina.waitForSelector('[data-conferma-importa="1"]', { timeout: 3000 }).then(() => true, () => false);
  atteso('archivio: importare sopra una partita non chiede conferma', uno);
  if (uno) { await foto(); await pagina.click('[data-azione="si-importa"]'); }
  const due = await pagina.waitForSelector('[data-conferma-importa="2"]', { timeout: 3000 }).then(() => true, () => false);
  atteso('archivio: manca la seconda conferma prima di sostituire la partita', due);
  if (due) { await foto(); await pagina.click('[data-azione="si-importa"]'); }
  // salvataggio principale rovinato: si riprende dalla copia di riserva
  await pagina.evaluate((k) => localStorage.setItem(k, '{rotto'), CH); await pagina.reload(); await scena('titolo');
  atteso('archivio: salvataggio rovinato senza ripresa dalla copia di riserva (C19S01)', (await pagina.locator('[data-riserva]').count()) === 1 && (await pagina.getByRole('button', { name: 'Riprendi' }).count()) === 1);
  const dopo = await leggi(); let ripreso = null; try { ripreso = JSON.parse(dopo ?? 'null'); } catch { /* resta rovinato */ }
  atteso('archivio: dopo la ripresa il salvataggio non è quello della copia', JSON.stringify(ripreso) === JSON.stringify(esportato));
  if ((await pagina.locator('[data-riserva]').count())) await foto();
}
