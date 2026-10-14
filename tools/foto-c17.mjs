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
  const [dischi, sopra, copre] = await pagina.evaluate(() => {
    const a = (A, B) => Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left)) * Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
    const d = [...document.querySelectorAll('[data-episodio] .settore-punto')].map((e) => e.getBoundingClientRect());
    let dd = 0; for (let i = 0; i < d.length; i++) for (let j = 0; j < i; j++) dd += a(d[i], d[j]);
    const nm = document.querySelector('.episodio.acceso .settore-nome');
    if (!nm) return [dd, true, 0];
    const prima = nm.style.pointerEvents; nm.style.pointerEvents = 'auto'; // .settore non riceve tocchi: per misurare sì
    const r = nm.getBoundingClientRect();
    const ok = [[0.2, 0.3], [0.5, 0.5], [0.8, 0.7]].every(([x, y]) => nm.contains(document.elementFromPoint(r.left + r.width * x, r.top + r.height * y)));
    nm.style.pointerEvents = prima;
    // C17-12 (C-018): il nome dell'episodio scelto non copre gli altri dischi
    const proprio = nm.closest('[data-episodio]').querySelector('.settore-punto');
    const copre = [...document.querySelectorAll('[data-episodio] .settore-punto')].filter((e) => e !== proprio).reduce((s, e) => s + a(r, e.getBoundingClientRect()), 0);
    return [dd, ok, copre];
  });
  atteso(`${dove}: dischi degli episodi sovrapposti per ${Math.round(dischi)} px² (C17-12)`, dischi === 0);
  atteso(`${dove}: il nome dell'episodio scelto è coperto da altri dischi (C17-12)`, sopra);
  atteso(`${dove}: il nome dell'episodio scelto copre altri dischi per ${Math.round(copre)} px² (C17-12)`, copre === 0);
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
export const statoSalvato = (pagina) => pagina.evaluate(() => { try { return JSON.parse(localStorage.getItem('valmora-salvataggio'))?.in_corso ?? null; } catch { return null; } });

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
  const viste = await pagina.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-opzione]')].map((b) =>
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
export async function controllaColoriCortei(pagina, m, club, atteso, dove) {
  if ((await pagina.getAttribute('.mappa', 'data-mappa')) !== 'webgl') return;
  const visti = Object.fromEntries(((await pagina.getAttribute('.mappa', 'data-colori-cortei')) ?? '').split(',').filter(Boolean).map((x) => x.split('=')));
  for (const s of m.mappa.settori.filter((x) => x.tipo === 'strada')) {
    const curva = m.mappa.settori.find((c) => c.tipo === 'curva' && c.id === `curva_${s.id.replace(/^[a-z]+_/, '')}`);
    const di = s.club ?? curva?.club;
    const atteso_ = di ? club[di]?.colori?.primario ?? 'neutro' : 'neutro';
    atteso(`${dove}: corteo di «${s.id}» coi colori «${visti[s.id]}», i dati dicono «${di ?? 'non si sa'}» (${atteso_}) (PO-102)`, visti[s.id] === atteso_);
  }
}

/** C20-03 (C17-12): con tutti gli episodi conclusi, scelto a turno ogni episodio di ogni stagione, il nome non tocca
 *  il cerchio di nessun altro disco (le stelline sono decorazione, non ricevono tocchi). Rosso VALMORA_ROSSI=C44N01:
 *  solo gli 8 posti; VALMORA_ROSSI=C42N01: nome sempre sotto il disco. */
export async function controllaNomiCittaTutti(pagina, atteso, salvataggio, scena) {
  await pagina.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), salvataggio);
  await pagina.reload(); await scena('titolo'); await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
  const male = [];
  for (const st of await pagina.$$eval('[data-stagione]', (xs) => xs.map((x) => x.dataset.stagione))) {
    await pagina.click(`[data-stagione="${st}"]`); await pagina.waitForTimeout(150);
    for (const id of await pagina.$$eval('[data-episodio]', (xs) => xs.map((x) => x.dataset.episodio))) {
      await pagina.click(`[data-episodio="${id}"] .settore-punto`); await pagina.waitForTimeout(80);
      const su = await pagina.evaluate((id) => {
        const n = document.querySelector(`[data-episodio="${id}"].acceso .settore-nome`);
        if (!n) return [];
        const r = n.getBoundingClientRect();
        return [...document.querySelectorAll('[data-episodio] .settore-punto')].filter((d) => d.closest('[data-episodio]').dataset.episodio !== id).filter((d) => {
          const c = d.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2, raggio = c.width / 2;
          const px = Math.max(r.left, Math.min(cx, r.right)), py = Math.max(r.top, Math.min(cy, r.bottom));
          return Math.hypot(px - cx, py - cy) < raggio - 0.5;
        }).map((d) => d.closest('[data-episodio]').dataset.episodio);
      }, id);
      if (su.length) male.push(`${id} su ${su.join('+')}`);
    }
  }
  atteso(`città ${pagina.viewportSize().width}, episodi conclusi: il nome dell'episodio scelto tocca altri dischi in ${male.length} casi: ${male.join(', ')} (C20-03)`, !male.length);
}

/** D-112 punto 5: la vignetta della chiamata mostra il gruppo dell'evento che i dati mettono sul settore in quell'ondata
 *  (il più grave se sono più d'uno; «nessuno» senza settore o senza eventi). Rosso VALMORA_ROSSI=C45E01: nessuna sagoma. */
const GRUPPI_EVENTO = { folla: 'gente', raduno: 'gente', assembramento: 'gente', movimento: 'gente', arrivo: 'gente', deflusso: 'gente', fuga: 'gente', curva: 'tifo', festa: 'tifo', cerimonia: 'tifo', corteo: 'corteo', protesta: 'corteo', picchetto: 'corteo', presidio: 'corteo', furgone: 'veicoli', sosta: 'veicoli', traffico: 'veicoli', retata: 'veicoli', rissa: 'scontro', lite: 'scontro', faida: 'scontro', minaccia: 'scontro', biglietti: 'biglietti', incendio: 'fumo' };
export async function controllaVignettaEvento(pagina, ondata, c, atteso, dove) {
  const visto = await pagina.getAttribute('.chiamata-corpo svg.vignetta', 'data-evento').catch(() => null);
  if (visto === null) return;
  const gruppi = new Set((ondata.eventi ?? []).filter((e) => c.settore && e.settore === c.settore).map((e) => GRUPPI_EVENTO[e.tipo]));
  const voluto = ['scontro', 'fumo', 'corteo', 'tifo', 'veicoli', 'biglietti', 'gente'].find((g) => gruppi.has(g)) ?? 'nessuno';
  atteso(`${dove}: la vignetta mostra «${visto}», i dati dicono «${voluto}» (D-112 punto 5)`, visto === voluto);
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
