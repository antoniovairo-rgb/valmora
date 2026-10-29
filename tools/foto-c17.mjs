import { valuta } from '../src/logica/condizioni.ts';
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

/** C17-12: nella città i dischi degli episodi non si coprono, né le stelle coprono i dischi degli altri (C47-03, D-218, rosso C218S01), e il nome dell'episodio scelto è in primo piano. */
export async function controllaCitta(pagina, atteso, dove) {
  const [dischi, sopra, copre, stelle] = await pagina.evaluate(() => {
    const a = (A, B) => Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left)) * Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
    const d = [...document.querySelectorAll('[data-episodio] .settore-punto')].map((e) => e.getBoundingClientRect());
    let dd = 0; for (let i = 0; i < d.length; i++) for (let j = 0; j < i; j++) dd += a(d[i], d[j]);
    const ep = [...document.querySelectorAll('[data-episodio]')], st = ep.reduce((x, e) => { const s = e.querySelector('.stelle')?.getBoundingClientRect(); return x + (s ? ep.filter((f) => f !== e).reduce((y, f) => y + a(s, f.querySelector('.settore-punto').getBoundingClientRect()), 0) : 0); }, 0);
    const nm = document.querySelector('.episodio.acceso .settore-nome'); if (!nm) return [dd, true, 0, st];
    const prima = nm.style.pointerEvents; nm.style.pointerEvents = 'auto'; // .settore non riceve tocchi: per misurare sì
    const r = nm.getBoundingClientRect();
    const ok = [[0.2, 0.3], [0.5, 0.5], [0.8, 0.7]].every(([x, y]) => nm.contains(document.elementFromPoint(r.left + r.width * x, r.top + r.height * y)));
    nm.style.pointerEvents = prima;
    // C17-12 (C-018): il nome dell'episodio scelto non copre gli altri dischi
    const proprio = nm.closest('[data-episodio]').querySelector('.settore-punto');
    const copre = [...document.querySelectorAll('[data-episodio] .settore-punto')].filter((e) => e !== proprio).reduce((s, e) => s + a(r, e.getBoundingClientRect()), 0);
    return [dd, ok, copre, st];
  });
  atteso(`${dove}: dischi degli episodi sovrapposti per ${Math.round(dischi)} px² (C17-12)`, dischi === 0); atteso(`${dove}: le stelle coprono dischi di altri episodi per ${Math.round(stelle)} px² (C17-12, C47-03)`, stelle === 0);
  atteso(`${dove}: il nome dell'episodio scelto è coperto da altri dischi (C17-12)`, sopra);
  atteso(`${dove}: il nome dell'episodio scelto copre altri dischi per ${Math.round(copre)} px² (C17-12)`, copre === 0);
}

/** PO-092: la vignetta (fuori dalla chiamata) prende lo spazio libero: o la pagina è piena, o la vignetta è al massimo. */
export async function controllaRiempi(pagina, atteso, nome) {
  // D-126 b (C24-01): nel briefing ogni fonte visibile ha l'avatar, non la vignetta (a 42×42 non si leggeva).
  // Rosso VALMORA_ROSSI=C63A01: la vignetta di D-118.
  const fonte = await pagina.evaluate(() => {
    if (!document.querySelector('.scena[data-scena="briefing"]')) return null;
    const m = [...document.querySelectorAll('.scena [data-messaggio^="fonte-"]')].find((x) => x.getClientRects().length && !x.closest('[hidden]'));
    if (!m) return null;
    const f = m.querySelector('[data-figura-fonte] svg.vignetta'), av = m.querySelector('.avatar'), avatar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--avatar'));
    const r = f?.getBoundingClientRect();
    return { c: !!f, av: !!av, h: r ? Math.round(r.height) : 0, w: r ? Math.round(r.width) : 0, avatar };
  });
  // D-120 (PO-085): nella chiamata lo spicchio d'orologio c'è, sta nella finestra e non copre testi né comandi (bollino
  // sull'angolo del fumetto, fuori dalla riga del mittente). Rosso VALMORA_ROSSI=C51O01: niente orologio.
  const orologio = await pagina.evaluate(() => {
    const m = document.querySelector('.scena[data-scena="chiamata"] .messaggio.ultimo');
    if (!m) return null;
    const o = m.querySelector('[data-urgenza]');
    if (!o) return { c: false, sopra: [] };
    const a = o.getBoundingClientRect(), proprio = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const sopra = [...document.querySelectorAll('body *')].filter((e) => e !== o && !e.contains(o) && !e.closest('svg') && e.getClientRects().length && (e.matches('button, a') || proprio(e))).filter((e) => {
      const b = e.getBoundingClientRect(); return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
    }).map((e) => e.textContent.trim().slice(0, 20));
    return { c: true, sopra, dentro: a.left >= 0 && a.right <= innerWidth };
  });
  // D-126 c: lo spicchio c'è solo sulle urgenti (controllaVignettaEvento); dove c'è, non copre nulla e sta nella finestra
  if (orologio?.c) atteso(`${nome}: spicchio d'orologio ${orologio.c ? `sopra «${orologio.sopra.join(', ')}»${orologio.dentro ? '' : ' fuori dalla finestra'}` : 'assente'} (D-120)`, orologio.c && !orologio.sopra.length && orologio.dentro);
  if (fonte) atteso(`${nome}: fonte del briefing ${fonte.c ? `con la vignetta ${fonte.w}×${fonte.h}` : ''}${fonte.av ? '' : ' senza avatar'}, serve l'avatar (D-126 b)`, !fonte.c && fonte.av);
  // la finestra può essere appena tornata da 760 a 800 (controllaAltezza): si lascia arrivare l'evento «resize»
  await pagina.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)))); await pagina.waitForTimeout(100);
  const r = await pagina.evaluate(() => {
    const v = [...document.querySelectorAll('svg.vignetta')].find((x) => !x.closest('.chiamata-corpo, .figura-fonte, [data-citta-striscia], [data-guida-testata]') && x.getClientRects().length); // fisse per scelta: chiamata (PO-089 A), fonte del briefing (D-118), striscia della città e testata della guida (D-210)
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
  // C18-05: alla posizione iniziale «Rispondi» non copre nessun testo né comando
  const sopra = await pagina.evaluate(() => {
    scrollTo(0, 0);
    const v = document.querySelector('[data-indicatore="opzioni"]'), a = v.getBoundingClientRect();
    const proprio = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    return [...new Set([...document.querySelectorAll('body *')].filter((e) => e !== v && !v.contains(e) && !e.contains(v) && !e.closest('svg') && e.getClientRects().length && (e.matches('button, a, input, [role="button"]') || proprio(e))).filter((e) => {
      const b = e.getBoundingClientRect(); return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    }).map((e) => e.dataset.azione ?? e.textContent.trim().slice(0, 20)))];
  });
  atteso(`${dove}: «Rispondi» copre ${sopra.join(', ')} (C18-05)`, !sopra.length);
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
export async function controllaRigaAiuto(pagina, atteso, nome) { // PO-096 e D-139: il «?» nella barra fissa, sempre visibile (rosso C96A01: nella riga)
  const r = await pagina.evaluate(() => { const p = document.querySelector('.riga-in-mano .in-mano'), b = document.querySelector('[data-azione="aiuto"]'), c = document.querySelector('[data-barra] [data-azione="conferma"]'); if (!p || !b) return null;
    const i = b.querySelector('svg')?.getBoundingClientRect(), q = b.getBoundingClientRect(), t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
    return { tagliata: p.scrollWidth > p.clientWidth + 1 || getComputedStyle(p).textOverflow === 'ellipsis', tocco: Math.min(b.offsetWidth, b.offsetHeight), icona: i ? Math.min(i.width, i.height) : 0, barra: !!b.closest('[data-barra]'), coperto: !(t && (t === b || b.contains(t))), conferma: c ? { w: c.offsetWidth, h: c.offsetHeight, taglio: c.scrollWidth > c.clientWidth + 1 } : null }; });
  if (!r) return;
  atteso(`${nome}: la riga dell'aiuto è troncata coi puntini (PO-096)`, !r.tagliata);
  atteso(`${nome}: il «?» è piccolo (tocco ${r.tocco} px, icona ${Math.round(r.icona)} px) (PO-096)`, r.tocco >= 44 && r.icona >= 24);
  atteso(`${nome}: il «?» non è nella barra fissa (${r.barra ? 'nella barra' : 'nella riga'}) o è coperto (D-139)`, r.barra && !r.coperto);
  atteso(`${nome}: «Conferma» ${r.conferma?.w}×${r.conferma?.h} px${r.conferma?.taglio ? ', testo tagliato' : ''} (D-139: leggibile e ≥44 px)`, !!r.conferma && r.conferma.w >= 44 && r.conferma.h >= 44 && !r.conferma.taglio);
}

/** PO-097: la versione c'è su ogni schermata, è quella del gioco e non tocca nessun comando. */
export async function controllaVersione(pagina, atteso, nome, versione) {
  // C18-10: alla posizione iniziale della pagina (in cima) la versione è nella vista e non copre testi né comandi
  const y = await pagina.evaluate(() => { const y = scrollY; scrollTo(0, 0); return y; });
  const r = await pagina.evaluate(() => {
    const v = document.querySelector('[data-versione-angolo]');
    if (!v) return null;
    const a = v.getBoundingClientRect();
    const proprio = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const sopra = [...document.querySelectorAll('button, a, input, [role="button"], body *')].filter((e) => e !== v && !v.contains(e) && !e.contains(v) && !e.closest('svg') && e.getClientRects().length && (e.matches('button, a, input, [role="button"]') || proprio(e))).filter((e) => {
      const b = e.getBoundingClientRect(); return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;
    }).map((e) => e.dataset.azione ?? e.textContent.trim().slice(0, 20));
    const fondo = (getComputedStyle(v).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]);
    return { testo: v.textContent, sopra: [...new Set(sopra)], carattere: parseFloat(getComputedStyle(v).fontSize), vista: a.bottom <= innerHeight && a.top >= 0, fondino: (fondo.length > 3 ? fondo[3] : 1) > 0.5 };
  });
  await pagina.evaluate((y) => scrollTo(0, y), y);
  atteso(`${nome}: manca il numero di versione (PO-097)`, !!r);
  if (!r) return;
  atteso(`${nome}: versione «${r.testo}» invece di «v${versione}» (PO-097)`, r.testo === `v${versione}`);
  atteso(`${nome}: la versione copre ${r.sopra.join(', ')} (PO-097)`, !r.sopra.length);
  atteso(`${nome}: la versione non è nella vista senza scorrere (C18-10)`, r.vista);
  atteso(`${nome}: la versione non ha un fondino suo: sul giallo a puntini si legge male (PO-098)`, r.fondino);
}

/** C18-09: nel rapporto la riga della fiducia (perché sale o scende) si legge a inizio pagina, intera e non coperta
 *  dal pulsante fisso «Prossima ondata» / «Leggi il verbale». Rosso VALMORA_ROSSI=C42F01: riga in fondo, come prima. */
export async function controllaFiduciaRapporto(pagina, atteso, dove) {
  const r = await pagina.evaluate(() => {
    scrollTo(0, 0);
    const f = document.querySelector('[data-premio-fiducia]');
    if (!f) return null;
    const a = f.getBoundingClientRect(), b = document.querySelector('.scena [data-azione="avanti"]')?.getBoundingClientRect();
    const sopra = b ? Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) : 0;
    return { vista: a.top >= 0 && a.bottom <= innerHeight, sopra };
  });
  if (r) atteso(`${dove}: la riga della fiducia non si legge a inizio pagina (${r.vista ? `coperta per ${Math.round(r.sopra)} px²` : 'fuori dalla finestra'}) (C18-09)`, r.vista && r.sopra === 0);
}

/** C18-08: nel verbale la riga della sfida (club e «contro») non sta sopra la vignetta dei busti.
 *  Rosso VALMORA_ROSSI=C42S01: sopra, come prima. */
export async function controllaSfidaBusti(pagina, atteso, dove) {
  const area = await pagina.evaluate(() => {
    const c = document.querySelector('.verbale .vignetta-cornice'), v = c?.querySelector('svg.vignetta'), s = c?.querySelector('.sfida');
    if (!v || !s) return 0;
    const A = v.getBoundingClientRect(), B = s.getBoundingClientRect();
    return Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left)) * Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
  });
  atteso(`${dove}: la sfida sta sopra i busti della vignetta per ${Math.round(area)} px² (C18-08)`, area === 0);
}

/** Stato della partita in corso, letto dal salvataggio (per confrontare prima e dopo una risposta). */
export const statoSalvato = (pagina) => pagina.evaluate(() => { try { return JSON.parse(localStorage.getItem('vandelfalls-salvataggio'))?.in_corso ?? null; } catch { return null; } });

/** PO-085, C20-07: dopo la risposta, i segni sulla mappa sono quelli degli effetti che CAMBIANO lo stato (stato prima
 *  e dopo dal salvataggio); una chiamata senza settore ha il suo segno al centro (settore «»); le squadre dicono il
 *  verso («+⚑» in arrivo, «−⚑» richiamate); i segni stanno nella finestra. */
export async function controllaSegni(pagina, atteso, c, op, dove, prima) {
  if ((await pagina.getAttribute('.mappa', 'data-mappa').catch(() => null)) === null) return;
  const o = c.opzioni.find((x) => x.id === op), dopo = await statoSalvato(pagina);
  const cambia = (k, x) => !prima || !dopo || (prima[k]?.[x] ?? 0) !== (dopo[k]?.[x] ?? 0);
  const voluti = new Set(), squadre = [];
  for (const e of o?.effetti ?? []) {
    if ('pressione' in e && e.valore) voluti.add(e.pressione);
    if ('tensione' in e && e.valore && cambia('tensione', e.tensione)) voluti.add(e.tensione);
    if ('riserva' in e && e.valore && cambia('riserva', e.riserva)) { voluti.add(c.settore ?? ''); squadre.push(e.valore < 0 ? '+⚑' : '−⚑'); }
  }
  await pagina.waitForTimeout(60); // la mappa può tornare in vista (C20-07)
  const segni = await pagina.evaluate(() => [...document.querySelectorAll('[data-segno]')].map((x) => {
    const r = x.getBoundingClientRect();
    return { dove: x.dataset.segno.split(':')[0], tipo: x.dataset.segno.split(':')[1], testo: x.textContent, vista: r.top >= 0 && r.bottom <= innerHeight };
  }));
  const a = [...voluti].sort().join(','), b = [...new Set(segni.map((x) => x.dove))].sort().join(',');
  atteso(`${dove}: segni sulla mappa su «${b}», gli effetti che cambiano lo stato toccano «${a}» (PO-085, C20-07)`, a === b);
  const viste = segni.filter((x) => x.tipo === 'squadra').map((x) => x.testo).sort().join(' '), attese = squadre.sort().join(' ');
  atteso(`${dove}: squadre «${viste}», servono «${attese}» (C20-07)`, viste === attese);
  const fuori = segni.filter((x) => !x.vista).map((x) => x.dove || 'centrale');
  atteso(`${dove}: segni fuori dalla finestra su ${fuori.join(', ')} (C20-07)`, !fuori.length);
}

/** PO-085: sotto ogni opzione, le icone d'effetto sono quelle dei dati (settore, fiducia, unità), senza numeri. */
export async function controllaIconeEffetti(pagina, atteso, c, dove) {
  const c22 = await import('./foto-c22.mjs'); await c22.controllaIconePiccole(pagina, atteso, dove); await c22.controllaAvatarChi(pagina, atteso, dove); await c22.controllaIconePulsanti(pagina, atteso, dove); // C22-05, C22-09, C22-10
  // le opzioni spente perché l'unità è finita (D-153) mostrano il motivo, non gli effetti: le controlla D-153 (data-esaurita)
  const viste = await pagina.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-opzione]:not([data-esaurita])')].map((b) =>
    [b.dataset.opzione, [...b.querySelectorAll('[data-effetto]')].map((x) => x.dataset.effetto).sort().join(',') + (/\d/.test(b.querySelector('.effetti-opzione')?.textContent ?? '') ? ' CON NUMERI' : '')])));
  for (const [id, v] of Object.entries(viste)) {
    const o = c.opzioni.find((x) => x.id === id), k = new Set();
    for (const e of o?.effetti ?? []) {
      if (('tensione' in e || 'pressione' in e) && e.valore) k.add(`settore:${e.tensione ?? e.pressione}`);
      else if ('aggiungi' in e && e.aggiungi === 'credito' && e.valore) k.add('fiducia');
      else if ('riserva' in e && e.valore) k.add(`unita:${e.riserva}`);
    }
    const voluti = [...k].sort().join(',');
    atteso(`${dove} opzione «${id}»: icone «${v}», i dati dicono «${voluti}» (PO-085)`, v === voluti);
  }
}

/** PO-102: ogni corteo in strada ha i colori dei tifosi che i dati mettono lì: il club della strada, altrimenti quello
 *  della curva con lo stesso nome (strada_larkspire → curva_larkspire); se i dati non lo dicono, neutri. Si legge
 *  «data-colori-cortei» (strada=primario del club usato, o «neutro»). Rosso VALMORA_ROSSI=C43C02: la curva ospiti. */
export async function controllaColoriCortei(pagina, m, club, atteso, dove, n) {
  if ((await pagina.getAttribute('.mappa', 'data-mappa')) !== 'webgl') return;
  const visti = Object.fromEntries(((await pagina.getAttribute('.mappa', 'data-colori-cortei')) ?? '').split(',').filter(Boolean).map((x) => x.split('=')));
  for (const s of m.mappa.settori.filter((x) => x.tipo === 'strada')) {
    const curva = m.mappa.settori.find((c) => c.tipo === 'curva' && c.id === `curva_${s.id.replace(/^[a-z]+_/, '')}`);
    // C-021: un corteo di quest'ondata col club sull'evento è di quel club (precedenza sul club della strada)
    const cortei = ((await pagina.getAttribute('.mappa', 'data-folla')) ?? '').split('|')[1]?.split(',').map((x) => x.split('>')[0]) ?? [];
    const dell = n && cortei.includes(s.id) ? (m.ondate[n - 1]?.eventi ?? []).find((e) => e.settore === s.id && e.club && ['corteo', 'arrivo', 'deflusso', 'folla', 'raduno', 'movimento', 'fuga'].includes(e.tipo))?.club : undefined;
    const di = dell ?? s.club ?? curva?.club;
    const atteso_ = di ? club[di]?.colori?.primario ?? 'neutro' : 'neutro';
    atteso(`${dove}: corteo di «${s.id}» coi colori «${visti[s.id]}», i dati dicono «${di ?? 'non si sa'}» (${atteso_}) (PO-102)`, visti[s.id] === atteso_);
  }
}

/** C20-03 (C17-12): con tutti gli episodi conclusi, scelto a turno ogni episodio di ogni stagione, il nome non tocca
 *  il cerchio di nessun altro disco (le stelline sono decorazione, non ricevono tocchi). Rosso VALMORA_ROSSI=C44N01:
 *  solo gli 8 posti; VALMORA_ROSSI=C42N01: nome sempre sotto il disco. */
export async function controllaNomiCittaTutti(pagina, atteso, salvataggio, scena) {
  // D-123: a 360 e 375 il nome non c'è; le prove di stabilità del posto si fanno a 412×915, dove il nome c'è (se no
  // sarebbero cieche), poi i giri a 412, 375 e 360, e si torna alla misura di prima.
  const misuraIniziale = pagina.viewportSize(); await pagina.setViewportSize({ width: 412, height: 915 });
  await pagina.evaluate((v) => localStorage.setItem('vandelfalls-salvataggio', v), salvataggio);
  await pagina.reload(); await scena('titolo'); await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
  // Strumento instabile in CI (412, «Il mercato del sabato» sul bordo): il posto del nome non deve dipendere da una
  // scala in corso (animazione d'entrata della scena). Si sceglie ogni episodio della stagione 1 con la pagina in
  // scala 0,85 e senza: posto, spostamento e larghezza uguali (entro 1 px). Rosso VALMORA_ROSSI=C47N01.
  const posto = (id) => pagina.evaluate((id) => { const s = document.querySelector(`[data-episodio="${id}"]`), n = s?.querySelector('.settore-nome');
    return n ? { p: s.dataset.nome, dx: parseFloat(n.style.getPropertyValue('--nome-dx')) || 0, dy: parseFloat(n.style.getPropertyValue('--nome-dy')) || 0, w: n.style.maxWidth } : null; }, id);
  const scala = (v) => pagina.evaluate((v) => { const m = document.querySelector('main'); m.style.transformOrigin = 'top left'; m.style.transform = v; }, v);
  const prima = await pagina.$$eval('[data-episodio]', (xs) => xs.map((x) => x.dataset.episodio));
  const diversi = [];
  for (const [i, id] of prima.entries()) {
    const altro = prima[(i + 1) % prima.length];
    await pagina.click(`[data-episodio="${id}"] .settore-punto`); await pagina.waitForTimeout(60);
    const a = await posto(id);
    await scala('scale(0.85)'); await pagina.click(`[data-episodio="${altro}"] .settore-punto`, { force: true }); await pagina.click(`[data-episodio="${id}"] .settore-punto`, { force: true }); await pagina.waitForTimeout(60);
    const b = await posto(id); await scala('');
    if (a && b && (a.p !== b.p || a.w !== b.w || Math.abs(a.dx - b.dx) > 1 || Math.abs(a.dy - b.dy) > 1)) diversi.push(`${id} ${a.p}/${b.p} ${a.dx.toFixed(1)},${a.dy.toFixed(1)}→${b.dx.toFixed(1)},${b.dy.toFixed(1)}`);
  }
  atteso(`città, nome dell'episodio scelto con la pagina in scala: posto diverso in ${diversi.length} casi: ${diversi.join('; ')} (strumento instabile, C20-03)`, !diversi.length);
  // Il nome cambia misura dopo il calcolo (carattere che arriva tardi): si allarga la spaziatura del nome scelto e il
  // posto deve essere quello di un calcolo da capo (scelta di un altro episodio e ritorno). Rosso VALMORA_ROSSI=C47N02.
  // D-123: a 412 la spaziatura può non cambiare il riquadro del nome (larghezza fissata, stesse righe): il riquadro è lo
  // stesso, quindi le sovrapposizioni pure; lì un calcolo da capo può scegliere un'altra larghezza ugualmente buona. Si
  // confrontano solo i casi in cui il riquadro cambia misura, e devono essercene (se no il controllo è cieco).
  const misura = (id) => pagina.evaluate((id) => { const r = document.querySelector(`[data-episodio="${id}"] .settore-nome`)?.getBoundingClientRect(); return r ? `${r.width.toFixed(1)}×${r.height.toFixed(1)}` : null; }, id);
  let confrontati = 0;
  const largo = (v) => pagina.evaluate((v) => { let st = document.getElementById('prova-largo'); if (!st) { st = document.createElement('style'); st.id = 'prova-largo'; document.head.append(st); } st.textContent = v ? '.settore-nome { letter-spacing: 0.12em; }' : ''; }, v);
  const stantii = [];
  for (const [i, id] of prima.entries()) {
    const altro = prima[(i + 1) % prima.length];
    await pagina.click(`[data-episodio="${id}"] .settore-punto`); await pagina.waitForTimeout(60);
    const m0 = await misura(id); await largo(true); await pagina.waitForTimeout(120);
    const a = await posto(id), m1 = await misura(id);
    await pagina.click(`[data-episodio="${altro}"] .settore-punto`); await pagina.click(`[data-episodio="${id}"] .settore-punto`); await pagina.waitForTimeout(60);
    const b = await posto(id); await largo(false);
    if (m0 === m1) continue;
    confrontati += a && b ? 1 : 0;
    if (a && b && (a.p !== b.p || a.w !== b.w || Math.abs(a.dx - b.dx) > 1 || Math.abs(a.dy - b.dy) > 1)) stantii.push(`${id} ${a.p}/${b.p} ${a.w || '-'}/${b.w || '-'}`);
  }
  atteso(`città: dopo un cambio di misura del nome il posto non si rifà in ${stantii.length} casi: ${stantii.join('; ')} (strumento instabile, C20-03)`, !stantii.length);
  atteso(`città: nessun nome ha cambiato misura con la spaziatura, il controllo del ricalcolo è cieco (C20-03)`, confrontati > 0);
  // C24-06: mentre un carattere carica il nome non si vede (calcolato col carattere di riserva poi saltava); torna quando
  // ha finito. Gli eventi di FontFaceSet si mandano a mano: deterministico. Rosso VALMORA_ROSSI=C68N01: resta visibile.
  await pagina.click(`[data-episodio="${prima[0]}"] .settore-punto`); await pagina.waitForTimeout(60);
  const nome = () => pagina.evaluate(() => !!document.querySelector('[data-episodio].acceso .settore-nome'));
  const prova = (ev) => pagina.evaluate((ev) => document.fonts.dispatchEvent(new Event(ev)), ev);
  await prova('loading'); await pagina.waitForTimeout(60); const durante = await nome();
  await prova('loadingdone'); await pagina.waitForTimeout(60); const dopo = await nome();
  atteso(`città: col carattere in arrivo il nome ${durante ? 'si vede (poi salta)' : 'non si vede'}, dopo ${dopo ? 'si vede' : 'non torna'} (C24-06)`, !durante && dopo);
  const giro = async () => {
  const male = [];
  for (const st of await pagina.$$eval('[data-stagione]', (xs) => xs.map((x) => x.dataset.stagione))) {
    await pagina.click(`[data-stagione="${st}"]`); await pagina.waitForTimeout(150);
    for (const id of await pagina.$$eval('[data-episodio]', (xs) => xs.map((x) => x.dataset.episodio))) {
      await pagina.click(`[data-episodio="${id}"] .settore-punto`); await pagina.waitForTimeout(80);
      const su = await pagina.evaluate((id) => {
        const n = document.querySelector(`[data-episodio="${id}"].acceso .settore-nome`), conNome = innerWidth >= 400;
        if (!n) return conNome ? ['senza nome (a 412 resta, D-123)'] : [];
        if (!conNome) return ['nome mostrato a questa larghezza (D-123)'];
        const r = n.getBoundingClientRect();
        const dischi = [...document.querySelectorAll('[data-episodio] .settore-punto')].filter((d) => { // C23-02: anche il proprio
          const c = d.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2, raggio = c.width / 2;
          const px = Math.max(r.left, Math.min(cx, r.right)), py = Math.max(r.top, Math.min(cy, r.bottom));
          return Math.hypot(px - cx, py - cy) < raggio - 0.5;
        }).map((d) => d.closest('[data-episodio]').dataset.episodio);
        // D-119: nemmeno le stelline degli altri episodi, né il bordo della mappa (5 px); C23-02: nemmeno le proprie
        const stelle = [...document.querySelectorAll('[data-episodio] .settore-unita')].filter((d) => {
          const c = d.getBoundingClientRect(); return Math.min(r.right, c.right) - Math.max(r.left, c.left) > 0.5 && Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top) > 0.5;
        }).map((d) => `stelle ${d.closest('[data-episodio]').dataset.episodio}`);
        const m = document.querySelector('.mappa').getBoundingClientRect();
        const bordo = r.left < m.left + 5 || r.right > m.right - 5 || r.top < m.top + 5 || r.bottom > m.bottom - 5 ? ['bordo'] : [];
        return [...dischi, ...stelle, ...bordo];
      }, id);
      if (su.length) male.push(`${id} su ${su.join('+')}`);
    }
  }
  atteso(`città ${pagina.viewportSize().width}×${pagina.viewportSize().height}, episodi conclusi: il nome dell'episodio scelto tocca dischi, stelline o bordo in ${male.length} casi: ${male.join(', ')} (C20-03, D-119)`, !male.length);
  };
  await giro();
  await pagina.setViewportSize({ width: 375, height: 667 }); await pagina.reload(); await scena('titolo');
  await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
  await giro();
  await pagina.setViewportSize({ width: 360, height: 760 }); await pagina.reload(); await scena('titolo');
  await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
  await giro();
  await pagina.setViewportSize(misuraIniziale);
}

/** D-112 punto 5: la vignetta della chiamata mostra il gruppo dell'evento che i dati mettono sul settore in quell'ondata
 *  (il più grave se sono più d'uno; «nessuno» senza settore o senza eventi). Rosso VALMORA_ROSSI=C45E01: nessuna sagoma. */
// C21-05/06: cerimonia, minaccia, lite e faida sono «gente» (i testi non parlano di colluttazione); scontro solo rissa
const GRUPPI_EVENTO = { folla: 'gente', raduno: 'gente', assembramento: 'gente', movimento: 'gente', arrivo: 'gente', deflusso: 'gente', fuga: 'gente', cerimonia: 'gente', minaccia: 'gente', lite: 'gente', faida: 'gente', curva: 'tifo', festa: 'tifo', corteo: 'corteo', protesta: 'corteo', picchetto: 'corteo', presidio: 'corteo', furgone: 'veicoli', sosta: 'veicoli', traffico: 'veicoli', retata: 'veicoli', rissa: 'scontro', biglietti: 'biglietti', incendio: 'fumo' };
export async function controllaVignettaEvento(pagina, ondata, c, atteso, dove) {
  const vv = pagina.locator('.chiamata-corpo svg.vignetta'), visto = (await vv.count()) ? await vv.first().getAttribute('data-evento') : null; // D-206: senza attesa se manca
  if (visto === null && !c.imprevisto) return; // D-206: l'imprevisto non ha vignetta, ma spicchio e «Urgente!» (D-129) sì
  // C21-09: un evento con «se» conta solo se è vero con le variabili della partita (dal salvataggio)
  const variabili = (await statoSalvato(pagina))?.variabili ?? {};
  const gruppi = new Set((ondata.eventi ?? []).filter((e) => c.settore && e.settore === c.settore && (!e.se || valuta(e.se, variabili))).map((e) => GRUPPI_EVENTO[e.tipo]));
  const voluto = ['scontro', 'fumo', 'corteo', 'tifo', 'veicoli', 'biglietti', 'gente'].find((g) => gruppi.has(g)) ?? 'nessuno';
  if (visto !== null) atteso(`${dove}: la vignetta mostra «${visto}», i dati dicono «${voluto}» (D-112 punto 5)`, visto === voluto); else atteso(`${dove}: l'imprevisto «${c.id}» mostra una vignetta (D-206)`, !(await pagina.locator('.chiamata-corpo svg').count()));
  // D-129 (era D-126 c): spicchio e «Urgente!» solo se sul settore un evento in corso nell'ondata ha pressione ≥ 4.
  // Rossi VALMORA_ROSSI=C82U01 (D-126 c: un evento qualsiasi), C64U01 (urgenti tutte) e C51O01 (niente spicchio).
  const [spicchio, timbro] = await pagina.evaluate(() => { const m = document.querySelector('[data-messaggio^="chiamata-"]'); return [!!m?.querySelector('[data-urgenza]'), m?.querySelector('.timbro')?.textContent ?? '']; });
  const urge = (ondata.eventi ?? []).some((e) => c.settore && e.settore === c.settore && (!e.se || valuta(e.se, variabili)) && e.pressione >= 4);
  atteso(`${dove}: ${urge ? 'urgente' : 'non urgente'} per i dati, ma spicchio ${spicchio ? 'sì' : 'no'} e timbro «${timbro}» (D-129)`, spicchio === urge && (timbro === 'Urgente!') === urge); // D-129
  if (visto === null) return; // D-206: senza vignetta (imprevisto) non ci sono figure da controllare. PO-103: le persone sono pallini piatti, niente omini con testa e braccia; i gruppi con gente ne mostrano.
  // Rosso VALMORA_ROSSI=C48P01: gli omini di prima.
  const [omini, pallini] = await pagina.evaluate(() => ['omino', 'pallino'].map((f) => document.querySelectorAll(`.chiamata-corpo svg.vignetta [data-figura="${f}"]`).length));
  const conGente = ['gente', 'tifo', 'corteo', 'biglietti'].includes(voluto);
  atteso(`${dove}: ${omini} omini e ${pallini} pallini nella vignetta «${visto}» (PO-103)`, omini === 0 && (!conGente || pallini > 0));
  // C22-02: ogni pallino è largo almeno 6 px a schermo e ha un contorno. Il contorno sta a ≥3:1 sul suo alone, e
  // l'alone o il contorno a ≥3:1 sul fondo della scena sotto il pallino (WCAG 1.4.11). Rosso VALMORA_ROSSI=C55P01.
  const deboli = await pagina.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) ?? []).map(Number), pieno = (s) => /^rgb\(/.test(s);
    const lum = (v) => { const [r, g, b] = v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const rap = (a, b) => { const [l1, l2] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p); return (l1 + 0.05) / (l2 + 0.05); };
    // il fondo si legge con elementsFromPoint, che vede solo la finestra: prima la vignetta va in vista (poi si torna)
    const y0 = scrollY, v = document.querySelector('.chiamata-corpo svg.vignetta'); v?.scrollIntoView({ block: 'center' });
    const out = [...document.querySelectorAll('.chiamata-corpo svg.vignetta [data-figura="pallino"]')].flatMap((g) => {
      const d = g.querySelector('[data-pallino]') ?? g, alone = g.querySelector('[data-alone]'), r = d.getBoundingClientRect(), cs = getComputedStyle(d);
      const fondo = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find((e) => e.closest('svg.vignetta') && !g.contains(e) && e !== g && e.tagName !== 'svg' && pieno(getComputedStyle(e).fill) && getComputedStyle(e).opacity === '1');
      const sotto = fondo ? getComputedStyle(fondo).fill : 'rgb(255, 255, 255)', bordo = pieno(cs.stroke) && parseFloat(cs.strokeWidth) > 0 ? cs.stroke : null;
      const giro = alone ? getComputedStyle(alone).fill : null, out = [];
      if (Math.min(r.width, r.height) < 6) out.push(`${r.width.toFixed(1)} px`);
      // C25-05: l'anello bianco (alone meno pallino e mezzo contorno) almeno 1 px, e l'alone dentro la vignetta
      if (alone) { const v = g.closest('svg.vignetta').getBoundingClientRect(), k = v.width / 320, ra = alone.getBoundingClientRect();
        const anello = (ra.width - r.width) / 2 - (parseFloat(cs.strokeWidth) * k) / 2;
        if (anello < 1) out.push(`anello ${anello.toFixed(2)} px`);
        if (ra.bottom > v.bottom - 0.5 || ra.top < v.top + 0.5) out.push('alone sul bordo della vignetta'); }
      if (!bordo) out.push(`senza contorno (${cs.fill} su ${sotto}: ${rap(cs.fill, sotto).toFixed(2)}:1)`);
      else if ((giro && rap(bordo, giro) < 3) || Math.max(rap(bordo, sotto), giro ? rap(giro, sotto) : 0) < 3) out.push(`contorno ${bordo}, alone ${giro}, fondo ${sotto}`);
      return out.length ? [out.join(', ')] : [];
    });
    scrollTo(0, y0); return out;
  });
  atteso(`${dove}: ${deboli.length} pallini piccoli o poco contrastati: ${deboli.slice(0, 3).join('; ')} (C22-02)`, !deboli.length);
  // C25-06: la folla di sfondo (strada, piazzale) è fatta dei pallini nuovi, non di puntini. Rosso VALMORA_ROSSI=C70F01.
  const puntini = await pagina.evaluate(() => document.querySelectorAll('.chiamata-corpo svg.vignetta [data-folla-sfondo] > circle').length); atteso(`${dove}: ${puntini} puntini nella folla di sfondo invece dei pallini (C25-06)`, puntini === 0);
  // i tratti coi colori del club (gradinate, sciarpa) si vedono davvero: il colore calcolato è quello del club.
  // Rosso VALMORA_ROSSI=C45E02: «.v-linea» li rende neri.
  const spenti = await pagina.evaluate(() => [...document.querySelectorAll('.chiamata-corpo svg.vignetta [stroke^="#"]')].filter((e) => {
    const prova = document.createElement('i'); prova.style.color = e.getAttribute('stroke'); document.body.append(prova);
    const voluto = getComputedStyle(prova).color; prova.remove();
    return getComputedStyle(e).stroke !== voluto;
  }).length);
  atteso(`${dove}: ${spenti} tratti col colore del club ridipinti da un'altra regola (D-112 punto 5)`, spenti === 0);
}

/** PO-054: un tocco su una pastiglia dello schieramento ritira UNA sola unità di quella risorsa da quel settore (le
 *  altre restano); «Annulla l'ultima» la rimette. Serve una pastiglia con almeno 2 unità, altrimenti «una» e «tutte»
 *  coincidono e il guardiano sarebbe cieco. Rosso VALMORA_ROSSI=C46R01: il tocco le ritira tutte. */
export async function controllaRitiroSingolo(pagina, atteso, dove) {
  const conta = () => pagina.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-presenza]')].map((e) => [e.dataset.presenza, Number(e.textContent.replace(/\D/g, '') || 0)])));
  const prima = await conta();
  const chiave = Object.keys(prima).find((k) => prima[k] >= 2);
  atteso(`${dove}: nessuna pastiglia con almeno 2 unità, il ritiro singolo non si può provare (PO-054)`, !!chiave);
  if (!chiave) return;
  await pagina.click(`[data-presenza="${chiave}"]`);
  const dopo = await conta();
  const altre = Object.keys(prima).filter((k) => k !== chiave && prima[k] !== dopo[k]);
  atteso(`${dove}: il tocco su «${chiave}» da ${prima[chiave]} a ${dopo[chiave] ?? 0} unità, doveva toglierne una (PO-054)`, (dopo[chiave] ?? 0) === prima[chiave] - 1 && !altre.length);
  await pagina.click('[data-azione="annulla"]');
  const ancora = await conta();
  atteso(`${dove}: dopo «Annulla l'ultima» «${chiave}» è a ${ancora[chiave] ?? 0} invece di ${prima[chiave]} (PO-054)`, ancora[chiave] === prima[chiave]);
}
