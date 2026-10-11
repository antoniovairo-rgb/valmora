// Schieramento: piano del giocatore «attento» del motore per ondata (pianoSchieramento), come in rev-schermate.mjs.
// Collaudo C-014b, compiti 1-3 (misure per schermata, gioco dei 36 episodi con la prima opzione,
// ripresa a metà ondata sui 6 episodi scelti: e01 e02 · e13 e14 · e25 e26).
// Uso: LARG=360 node coordination/sonde/c14b-gioco.mjs   (LARG = 360 | 375 | 412)
// Esito in out/c14b/gioco-<LARG>.json. Le scelte: chiamate sempre la prima opzione; schieramento
// confermato senza unità nella prima versione; poi con il piano del giocatore attento (vedi sopra); se un episodio
// fallisce due volte con la prima opzione, dalla terza si usa l'ultima opzione (annotato).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RADICE, MISURE, avviaServer, apriBrowser, nuovaPagina, attendiScena, scenaCorrente, salvato, osserva, scrivi, attesa, agisci, OUT } from './c14b-lib.mjs';

const LARG = Number(process.env.LARG ?? 360);
const alt = MISURE.find(([l]) => l === LARG)[1];
const RIPRESA = LARG === 360 ? new Set(['e01', 'e02', 'e13', 'e14', 'e25', 'e26']) : new Set();
const dati = (id) => JSON.parse(readFileSync(join(RADICE, 'data', 'missioni', `${id}.json`), 'utf8'));
const ID = Array.from({ length: Number(process.env.MAX_EP ?? 36) }, (_, i) => `e${String(i + 1).padStart(2, '0')}`);

const misure = [];
const episodi = {};
const ripresa = [];
const log = (x) => console.log(`[${LARG}] ${x}`);
const M = (r) => misure.push(r);

const { srv, url } = await avviaServer();
const b = await apriBrowser();
const p = await nuovaPagina(b, url, [LARG, alt]);

async function titolo() {
  await attendiScena(p, ['titolo']);
  M(await osserva(p, { larg: LARG, episodio: '-', scena: 'titolo' }));
  // Guida: tutti i passi, poi «Ho capito»
  await p.click('[data-azione="guida"]'); await attesa(p, 400);
  M(await osserva(p, { larg: LARG, episodio: '-', scena: 'guida-passo-1' }));
  for (let n = 2; n <= 12; n++) {
    if (!(await p.locator('[data-azione="guida-avanti"]').count())) break;
    await p.click('[data-azione="guida-avanti"]'); await attesa(p, 300);
    M(await osserva(p, { larg: LARG, episodio: '-', scena: `guida-passo-${n}` }));
  }
  if (await p.locator('[data-azione="guida-fine"]').count()) await p.click('[data-azione="guida-fine"]');
  else await p.click('[data-azione="guida-chiudi"]');
  await attesa(p, 300);
  // Crediti
  await p.click('[data-azione="crediti"]'); await attesa(p, 600);
  M(await osserva(p, { larg: LARG, episodio: '-', scena: 'crediti' }));
  await p.goto(url); await attendiScena(p, ['titolo']);
  // Nuova partita: genere, città
  await p.getByRole('button', { name: 'Nuova partita' }).click();
  await attendiScena(p, ['genere']); M(await osserva(p, { larg: LARG, episodio: '-', scena: 'genere' }));
  await p.click('[data-genere="m"]');
  await attendiScena(p, ['citta']); await attesa(p, 800);
}

/** Gioca un episodio dalla sala al verbale. Ritorna l'esito registrato. */
async function giocaEpisodio(id) {
  const e = { id, tentativi: 0, fallimenti: 0, esiti: [], ondate: 0, bloccato: null, ultimaOpzioneDa3: false, ripresa: [] };
  const m = dati(id);
  const dichR = new Map(JSON.parse(readFileSync(join(RADICE, 'data', 'stato.json'), 'utf8')).variabili.map((d) => [d.id, d]));
  const { variabiliIniziali } = await import(`${RADICE}/src/logica/condizioni.ts`);
  const piano = await pianoSchieramento(m, dichR, variabiliIniziali(dichR.values()));
  for (let tent = 0; tent < 6; tent++) {
    e.tentativi++;
    const scenaSala = await attendiScena(p, ['sala']);
    if (!scenaSala) { e.bloccato = `attesa sala fallita (scena ${await scenaCorrente(p)})`; break; }
    M(await osserva(p, { larg: LARG, episodio: id, scena: 'sala' }));
    // Sala: i passi si scorrono con «passo»; «avanti» compare all'ultimo (Passi.tsx)
    for (let k = 0; k < 30 && !(await p.locator('[data-azione="avanti"]').count()); k++) {
      await agisci(p, () => p.click('[data-azione="passo"]')); await attesa(p, 120);
      M(await osserva(p, { larg: LARG, episodio: id, scena: 'sala' }));
    }
    await agisci(p, () => p.click('[data-azione="avanti"]'));
    await attendiScena(p, ['briefing']);
    let passi = 0;
    // Briefing a passi (Passi.tsx): «passo» fino all'ultimo, poi «inizia»
    while (!(await p.locator('[data-azione="inizia"]').count()) && passi < 40) {
      const avanza = p.locator('[data-azione="passo"], [data-azione="prossimo"]').first();
      if (await avanza.count()) {
        M(await osserva(p, { larg: LARG, episodio: id, scena: 'briefing' }));
        await avanza.click(); passi++;
      }
      await attesa(p, 150);
    }
    await p.waitForSelector('[data-azione="inizia"]', { timeout: 8000 });
    M(await osserva(p, { larg: LARG, episodio: id, scena: 'briefing-fine' }));
    await agisci(p, () => p.click('[data-azione="inizia"]'));
    let ultimaOpzione = e.fallimenti >= 2;
    if (ultimaOpzione) e.ultimaOpzioneDa3 = true;
    let fase = null;
    for (let giro = 0; giro < 400; giro++) {
      fase = await attendiScena(p, ['schieramento', 'chiamata', 'risposta', 'chiusura', 'rapporto', 'verbale'], 12000);
      if (!fase) { e.bloccato = `nessuna scena dopo ${await scenaCorrente(p)} (giro ${giro})`; break; }
      if (process.env.DEBUG_FASI) console.log(`  giro ${giro} fase ${fase} · scena ora ${await scenaCorrente(p)} · azioni ${JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-azione]')].map((x) => x.dataset.azione)))}`);
      await attesa(p, 350); // la scena entra con l'animazione: attende che sia ferma prima di toccare
      if (fase === 'schieramento') {
        M(await osserva(p, { larg: LARG, episodio: id, scena: 'schieramento' }));
        if (!(await p.locator('[data-azione="conferma"]').count())) {
          e.bloccato = `schieramento senza «conferma»: pulsanti ${JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-azione]')].map((x) => x.dataset.azione)))}; testo ${JSON.stringify((await p.evaluate(() => document.querySelector('.scena')?.innerText ?? '')).slice(0, 160))}`;
          break;
        }
        await schieraDa(piano[((await salvato(p))?.in_corso?.ondata ?? 1) - 1] ?? {});
        await agisci(p, () => p.click('[data-azione="conferma"]'));
      } else if (fase === 'chiamata') {
        M(await osserva(p, { larg: LARG, episodio: id, scena: 'chiamata' }));
        const opz = p.locator('[data-opzione]');
        const n = await opz.count();
        await agisci(p, () => opz.nth(ultimaOpzione ? n - 1 : 0).click());
        await attesa(p, 150);
        if (await p.locator('[data-azione="continua"]').count()) {
          M(await osserva(p, { larg: LARG, episodio: id, scena: 'risposta' }));
          await agisci(p, () => p.click('[data-azione="continua"]'));
        }
        await attesa(p, 150);
      } else if (fase === 'risposta') {
        M(await osserva(p, { larg: LARG, episodio: id, scena: 'risposta' }));
        await agisci(p, () => p.click('[data-azione="continua"]'));
      } else if (fase === 'chiusura') {
        M(await osserva(p, { larg: LARG, episodio: id, scena: 'chiusura' }));
        await agisci(p, () => p.click('[data-azione="rapporto"]'));
      } else if (fase === 'rapporto') {
        M(await osserva(p, { larg: LARG, episodio: id, scena: 'rapporto' }));
        if (await p.locator('[data-azione="avanti"]').count() === 0) { e.bloccato = 'rapporto senza «avanti»'; break; }
        await agisci(p, () => p.click('[data-azione="avanti"]'));
        e.ondate++;
      } else if (fase === 'verbale') {
        M(await osserva(p, { larg: LARG, episodio: id, scena: 'verbale' }));
        // Verbale a passi (Passi.tsx): il pulsante finale compare all'ultimo passo
        for (let k = 0; k < 20 && !(await p.locator('[data-azione="rigioca"], [data-azione="citta"]').count()); k++) {
          await agisci(p, () => p.click('[data-azione="passo"]')); await attesa(p, 100);
        }
        const fallita = await p.locator('[data-azione="rigioca"]').count();
        e.esiti.push(fallita ? 'fallita' : 'superata');
        if (fallita) {
          e.fallimenti++;
          await agisci(p, () => p.click('[data-azione="rigioca"]'));
          break; // ricomincia dalla sala
        }
        const citta = await p.locator('[data-azione="citta"]').count();
        if (!citta) { e.bloccato = 'verbale senza «Alla mappa della città»'; return e; }
        await agisci(p, () => p.click('[data-azione="citta"]'));
        await attendiScena(p, ['citta']);
        return e;
      }
      // Ripresa a metà ondata (solo sui 6 episodi scelti, a 360 px)
      if (RIPRESA.has(id) && fase === 'chiamata') await proveRipresa(e, m);
    }
    if (e.bloccato) break;
    if (!e.esiti.length || e.esiti.at(-1) === 'fallita') continue;
  }
  if (!e.bloccato && e.esiti.at(-1) === 'fallita') e.bloccato = `fallita ${e.fallimenti} volte, nessun «Alla mappa» (rigioca)`;
  return e;
}

/** Piano di schieramento per ondata: il giocatore «attento» del motore (src/logica/bot.ts), come in rev-schermate.mjs. */
async function pianoSchieramento(m, dich, v0) {
  const M = await import(`${RADICE}/src/logica/missione.ts`);
  const { attenta } = await import(`${RADICE}/src/logica/bot.ts`);
  const { creaCaso } = await import(`${RADICE}/src/logica/caso.ts`);
  const g = attenta(creaCaso(1), dich); let st = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, st)) {
    const d = g.schiera(m, st); st = M.schiera(m, st, d); ond.push(d);
    for (let c = M.chiamateAperte(m, st)[0]; c; c = M.chiamateAperte(m, st)[0]) st = M.rispondi(m, st, c.id, g.scegli(m, st, c), dich);
    st = M.chiudiOndata(m, st, dich);
  }
  return ond;
}
/** Schiera le unità secondo il piano dell'ondata (risorsa → settore → quantità). */
async function schieraDa(d) {
  for (const [r, ps] of Object.entries(d)) for (const [sett, q] of Object.entries(ps)) for (let x = 0; x < q; x++) {
    if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`).catch(() => {});
    await p.click(`[data-settore="${sett}"] .settore-punto`, { timeout: 2000 }).catch(() => {});
    await attesa(p, 60);
  }
}

const ondataTestata = new Set();
/** Ripresa: a metà ondata ricarica, «Riprendi» deve riportare alla stessa chiamata con gli stessi dati. */
async function proveRipresa(e, m) {
  const ic = (await salvato(p))?.in_corso;
  if (!ic) return;
  const onda = m.ondate[ic.ondata - 1];
  const idsOnda = onda.chiamate.map((c) => c.id);
  const risposte = idsOnda.filter((x) => ic.risposte[x] !== undefined).length;
  const meta = Math.max(1, Math.floor(idsOnda.length / 2));
  const chiave = `${e.id}:${ic.ondata}`;
  if (risposte !== meta || ondataTestata.has(chiave)) return;
  ondataTestata.add(chiave);
  const prima = { ondata: ic.ondata, risposte: Object.keys(ic.risposte).length, testo: await p.evaluate(() => document.querySelector('.scena')?.innerText ?? '') };
  await p.reload(); await attendiScena(p, ['titolo']);
  await p.getByRole('button', { name: 'Riprendi' }).click();
  const dopo = await attendiScena(p, ['chiamata', 'risposta', 'schieramento', 'chiusura', 'rapporto']);
  const icDopo = (await salvato(p))?.in_corso;
  const testo = await p.evaluate(() => document.querySelector('.scena')?.innerText ?? '');
  const r = { episodio: e.id, ondata: ic.ondata, metaOnda: meta, scenaPrima: 'chiamata', scenaDopo: dopo, ondataDopo: icDopo?.ondata, risposteDopo: icDopo ? Object.keys(icDopo.risposte).length : null, rispostePrima: prima.risposte, stessoTesto: testo === prima.testo };
  r.testoPrima = prima.testo.slice(0, 200); r.testoDopo = testo.slice(0, 200);
  r.esito = r.scenaDopo === 'chiamata' && r.ondataDopo === r.ondata && r.risposteDopo === r.rispostePrima && r.stessoTesto ? 'UGUALE' : 'DIVERSO';
  ripresa.push(r); e.ripresa.push(r.esito); log(`ripresa ${JSON.stringify(r)}`);
}

await titolo();
for (const id of ID) {
  const cur = await p.getAttribute('[data-scheda-episodio]', 'data-scheda-episodio').catch(() => null);
  if (cur !== id) { log(`città: scheda su ${cur}, atteso ${id}: fermo`); episodi[id] = { bloccato: `scheda su ${cur}` }; break; }
  M(await osserva(p, { larg: LARG, episodio: id, scena: 'citta' }));
  const avvia = p.locator('[data-azione="avvia-episodio"]');
  if (!(await avvia.count())) { episodi[id] = { bloccato: 'nessun «Avvia l\'episodio» in città' }; break; }
  await avvia.click();
  const e0 = p.errori.length;
  const r = await giocaEpisodio(id);
  r.errori = p.errori.slice(e0);
  episodi[id] = r;
  log(`${id}: esiti ${r.esiti.join(',') || '-'} · tentativi ${r.tentativi} · ondate ${r.ondate} · bloccato ${r.bloccato ?? 'no'}`);
  if (r.bloccato) break;
}

const errori = p.errori;
scrivi(`gioco-${LARG}.json`, { larg: LARG, alt, misure, episodi, ripresa, erroriPagina: errori });
const cattive = misure.filter((x) => x.verticale > 0 || x.orizzontale > 0 || x.piccoli > 0 || x.tagliati > 0);
console.log(`[${LARG}] misure ${misure.length} · con difetto ${cattive.length} · episodi giocati ${Object.values(episodi).filter((x) => !x.bloccato).length}/36 · ripresa ${ripresa.length} · errori pagina ${errori.length}`);
console.log(`[${LARG}] cartella uscita: ${OUT}`);
await b.close(); srv.close();
