// Sonda C-015 (collaudo, sola lettura): resa della 0.7.0 nel browser.
// Uso: node coordination/sonde/c15-resa.mjs <radice con dist/ e node_modules> <parte> [cartella foto]
// Parti: fiducia · schieramento · verbale · perso · home · vecchi · misure
// Stampa una riga per misura: «parte · cosa → esito». Non scrive nulla nel repository (foto solo nella cartella data).
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const PARTE = process.argv[3]; const FOTO = process.argv[4] ?? null;
if (FOTO) mkdirSync(FOTO, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = (cosa, esito) => console.log(`${PARTE} · ${cosa} → ${esito}`);
const foto = async (p, nome) => { if (FOTO) await p.screenshot({ path: join(FOTO, `${nome}.png`), fullPage: true }); };

async function pagina(larg = 360, alt = 760, sal = null) {
  const ctx = await b.newContext({ viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce', acceptDownloads: true });
  const p = await ctx.newPage(); const errori = [];
  p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text()); }); p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear());
  if (sal) await p.evaluate((s) => localStorage.setItem('valmora-salvataggio', s), typeof sal === 'string' ? sal : JSON.stringify(sal));
  await p.reload(); p.errori = errori; return p;
}
const sc = (p, n, ms = 8000) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: ms });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? null);
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
const conta = (p, s) => p.locator(s).count();
/** Avanza con «Avanti» dei passi finché compare sel (le schermate a passi, S-10). */
async function avanza(p, sel) { for (let i = 0; i < 12 && !(await p.locator(sel).isVisible().catch(() => false)); i++) { if (!(await conta(p, '[data-azione="passo"]:visible'))) break; await p.click('[data-azione="passo"]:visible'); await p.waitForTimeout(80); } }
async function nuova(p, gen = 'm') {
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(300);
  if ((await quale(p)) === 'conferma') { while (await conta(p, '[data-azione="conferma-passo"]')) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-nuova"]'); }
  await sc(p, 'genere'); await p.click(`[data-genere="${gen}"]`); await sc(p, 'citta');
}
const fiducia = (p) => p.evaluate(() => { const f = document.querySelector('[data-fiducia]'); return f ? Number(f.dataset.fiducia) : null; });
async function finoAlloSchieramento(p, registra) {
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); if (registra) await registra('sala');
  await avanza(p, '[data-azione="avanti"]'); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); if (registra) await registra('briefing');
  await avanza(p, '[data-azione="inizia"]'); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
}
/** Piano di partita di un bot sul motore (stesso calcolo della resa). */
const piano = (m, v, strategia = 'attenta', da = null) => { const g = B[strategia](creaCaso(1), dich); let s = da ?? M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
async function giocaEpisodio(p, pl, registra) {
  for (const [i, o] of pl.ond.entries()) {
    if (i) await sc(p, 'schieramento');
    await schiera(p, o.d); if (registra) await registra('schieramento');
    await p.click('[data-azione="conferma"]'); if (await conta(p, '[data-azione="conferma-davvero"]')) { if (registra) await registra('riepilogo'); await p.click('[data-azione="conferma-davvero"]'); }
    for (const [, op] of o.rs) { await sc(p, 'chiamata'); if (registra) await registra('chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(250);
      if (await conta(p, '[data-azione="continua"]')) { if (registra) await registra('risposta'); await p.click('[data-azione="continua"]'); } }
    await sc(p, 'chiusura'); if (registra) await registra('chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); if (registra) await registra('rapporto');
    await avanza(p, '[data-azione="avanti"]'); await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); if (registra) await registra('verbale');
}
const m = (id) => dati[`missioni/${id}.json`];
const iniziali = () => Object.fromEntries([...dich.values()].map((d) => [d.id, d.iniziale]));
/** Salvataggio «come scritto dal gioco» con gli episodi fino a «fino» superati (1★) e le variabili date. */
function salvataggioCon(fino, variabili) {
  const ids = Object.keys(dati).filter((k) => k.startsWith('missioni/')).map((k) => dati[k]).sort((a, b) => a.episodio - b.episodio).map((x) => x.id);
  const fatti = ids.slice(0, ids.indexOf(fino) + 1); const v = { ...iniziali(), ...variabili };
  return { save_version: 2, game_version: '0.7.0', seme: 7, caso: 7, variabili: v, missioni_concluse: fatti, genere: 'm', in_corso: null, rapporto_aperto: null,
    episodi: Object.fromEntries(fatti.map((id) => [id, { migliore: { esito: 'x', fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: v, variabili_dopo: v }])) };
}

if (PARTE === 'fiducia') {
  // 1) barra in ogni schermata di e01; 2) fiducia d'ingresso 0 → a inizio e02 la barra dice 2 (D-105)
  const p = await pagina(); await nuova(p); const visto = [];
  const registra = async (n) => { visto.push(`${n}:${await fiducia(p) ?? 'NO'}`); };
  await finoAlloSchieramento(p, registra);
  await giocaEpisodio(p, piano(m('e01'), (await salvato(p)).in_corso.variabili), registra);
  out('barra della fiducia per schermata in e01 (schermata:valore, NO = assente)', visto.filter((x, i, a) => a.indexOf(x) === i).join(' '));
  await p.close();
  for (const f of [0, 1, 2, 7]) {
    const q = await pagina(360, 760, salvataggioCon('e01', { credito: f })); await q.getByRole('button', { name: 'Riprendi' }).click(); await sc(q, 'citta');
    await finoAlloSchieramento(q); out(`credito salvato ${f} → barra a inizio e02`, `${await fiducia(q)} (salvato in_corso: ${(await salvato(q)).in_corso.variabili.credito})`);
    await foto(q, `fiducia-ingresso-${f}`); await q.close();
  }
}

if (PARTE === 'schieramento') {
  const p = await pagina(); await nuova(p); await finoAlloSchieramento(p);
  const e01 = m('e01'); const r0 = Object.keys(e01.mappa.risorse)[0]; const s0 = e01.mappa.settori[0].id; const s1 = e01.mappa.settori[1].id;
  const libere = async (r) => Number(await p.locator(`[data-risorsa="${r}"] strong`).textContent());
  const l0 = await libere(r0);
  await p.click(`[data-risorsa="${r0}"]`); await p.click(`[data-settore="${s0}"] .settore-punto`); await p.click(`[data-settore="${s0}"] .settore-punto`); await p.click(`[data-settore="${s1}"] .settore-punto`);
  out(`3 tocchi di ${r0} (${s0},${s0},${s1}) → libere`, `${l0} → ${await libere(r0)}; segnalini ${await p.locator('[data-presenza]').evaluateAll((xs) => xs.map((x) => `${x.dataset.presenza}:${x.textContent}`).join(','))}`);
  await p.click('[data-azione="annulla"]');
  out('«Annulla» una volta', `libere ${await libere(r0)}; segnalini ${await p.locator('[data-presenza]').evaluateAll((xs) => xs.map((x) => `${x.dataset.presenza}:${x.textContent}`).join(','))}`);
  await p.click(`[data-presenza="${r0}@${s0}"]`);
  out(`tocco sul segnalino ${r0}@${s0} (ritiro di una)`, `libere ${await libere(r0)}; segnalini ${await p.locator('[data-presenza]').evaluateAll((xs) => xs.map((x) => `${x.dataset.presenza}:${x.textContent}`).join(','))}`);
  await p.click('[data-azione="annulla"]');
  out('«Annulla» dopo il ritiro', `libere ${await libere(r0)}; segnalini ${await p.locator('[data-presenza]').evaluateAll((xs) => xs.map((x) => `${x.dataset.presenza}:${x.textContent}`).join(','))}`);
  const box = await p.locator('[data-presenza]').first().boundingBox(); out('misura del segnalino da toccare per ritirare (px)', box ? `${Math.round(box.width)}×${Math.round(box.height)}` : 'nessuno');
  await p.click('[data-azione="conferma"]'); await p.waitForTimeout(200);
  out('prima «Conferma» con unità libere', `riepilogo ${await conta(p, '[data-riepilogo]')} · avviso restano «${(await p.locator('[data-restano]').textContent().catch(() => '—'))}» · salvato disposizione ${JSON.stringify((await salvato(p)).in_corso.disposizione)}`);
  await foto(p, 'riepilogo-360');
  // la mappa resta toccabile sotto il riepilogo?
  await p.click(`[data-settore="${s1}"] .settore-punto`).catch(() => {}); await p.waitForTimeout(150);
  out('tocco su un settore mentre il riepilogo è aperto', `riepilogo dice ${await p.getAttribute('[data-riepilogo]', 'data-riepilogo').catch(() => '—')} unità; restano «${await p.locator('[data-restano]').textContent().catch(() => '—')}»`);
  await p.click('[data-azione="modifica"]'); await p.waitForTimeout(150);
  out('«Torna allo schieramento»', `schermata ${await quale(p)}; libere ${r0} ${await libere(r0)}; annulla attivo ${await p.isEnabled('[data-azione="annulla"]')}`);
  await p.click('[data-azione="azzera"]'); out('«Ritira tutte»', `libere ${await libere(r0)}; segnalini ${await conta(p, '[data-presenza]')}`);
  await p.click('[data-azione="conferma"]'); await p.waitForTimeout(150);
  out('conferma con nessuna unità', `riepilogo «${(await p.locator('[data-riepilogo]').textContent().catch(() => '—')).slice(0, 80)}» · avviso «${(await p.locator('[data-restano]').textContent().catch(() => '—')).slice(0, 120)}»`);
  await p.click('[data-azione="conferma-davvero"]'); await p.waitForTimeout(400);
  out('«Sì, conferma» con zero unità', `schermata ${await quale(p)}; salvato disposizione ${JSON.stringify((await salvato(p)).in_corso.disposizione)}`);
  // tutte le unità usate: niente avviso «ti restano»
  const q = await pagina(); await nuova(q); await finoAlloSchieramento(q);
  const pl = piano(e01, (await salvato(q)).in_corso.variabili); await schiera(q, pl.ond[0].d); await q.click('[data-azione="conferma"]'); await q.waitForTimeout(150);
  out('conferma con tutte le unità usate (bot attenta)', `riepilogo ${await conta(q, '[data-riepilogo]')} · avviso restano ${await conta(q, '[data-restano]')}`);
  await q.close(); await p.close();
}

if (PARTE === 'verbale') {
  for (const [nome, fissa] of [['share', true], ['appunti', false]]) {
    const p = await pagina(); await nuova(p); await finoAlloSchieramento(p);
    await p.evaluate((fissa) => { if (fissa) navigator.share = async (d) => { window.__condiviso = d; }; else { delete Navigator.prototype.share; navigator.clipboard.writeText = async (x) => { window.__copiato = x; }; } }, fissa);
    const pl = piano(m('e01'), (await salvato(p)).in_corso.variabili); await giocaEpisodio(p, pl);
    await p.click('[data-azione="condividi"]'); await p.waitForTimeout(400);
    const d = await p.evaluate(() => window.__condiviso ?? window.__copiato ?? null);
    out(`«Condividi» (${nome})`, `${JSON.stringify(d)} · messaggio «${await p.locator('[data-condivisione]').textContent().catch(() => '—')}»`);
    await avanza(p, '[data-azione="prossimo"]');
    const finale = await p.evaluate(() => ({ prossimo: !!document.querySelector('[data-azione="prossimo"]'), mappa: document.querySelector('.verbale-riga [data-azione="citta"]')?.getAttribute('aria-label'), riga: document.querySelector('[data-spiega="mappa"]')?.textContent }));
    out('ultimo passo del verbale (e01 superato)', JSON.stringify(finale));
    for (const [l, a] of [[360, 760], [375, 812], [412, 915]]) { await p.setViewportSize({ width: l, height: a }); await p.waitForTimeout(150);
      const r = await p.evaluate(() => [...document.querySelectorAll('.passi-nav button, .verbale-riga button')].filter((x) => x.offsetParent).map((x) => { const q = x.getBoundingClientRect(); return `${(x.textContent || x.getAttribute('aria-label')).trim()} ${Math.round(q.width)}×${Math.round(q.height)}@${Math.round(q.top)}`; }));
      out(`pulsanti finali del verbale a ${l}×${a}`, r.join(' | ')); if (nome === 'share') await foto(p, `verbale-fine-${l}`); }
    if (nome === 'share') { await p.click('[data-azione="prossimo"]'); await sc(p, 'sala'); out('«Prossimo episodio» apre', await p.getAttribute('.scena[data-scena="sala"]', 'data-missione')); }
    await p.close();
  }
}

if (PARTE === 'perso') {
  // e01 perso col bot «peggiore»: cosa offre il verbale?
  const p = await pagina(); await nuova(p); await finoAlloSchieramento(p);
  const pl = piano(m('e01'), (await salvato(p)).in_corso.variabili, 'peggiore');
  out('esito del bot peggiore su e01 (motore)', `${pl.esito.id} fallita=${!!pl.esito.fallita}`);
  await giocaEpisodio(p, pl); await avanza(p, '[data-azione="citta"]');
  const az = await p.evaluate(() => [...document.querySelectorAll('[data-azione]')].map((x) => `${x.dataset.azione}${x.offsetParent ? '' : '(nascosto)'}`).join(','));
  const testo = await p.evaluate(() => document.querySelector('main').innerText);
  out('verbale di e01 perso: pulsanti', az);
  out('verbale di e01 perso: testo con «ondata»', /riparti|ondata \d/i.test(testo) ? testo.match(/.{0,40}(riparti|ondata \d).{0,40}/i)[0] : 'nessun «Riparti dall\'ondata N»');
  await foto(p, 'verbale-perso-360');
  out('«Rigioca» visibile all\'ultimo passo', String(await p.locator('[data-azione="rigioca"]').isVisible()));
  await p.click('[data-azione="citta"]'); await sc(p, 'citta');
  out('«Alla mappa della città» porta a', `${await quale(p)} · scheda «${(await p.locator('[data-scheda-episodio]').innerText().catch(() => '—')).replace(/\n/g, ' / ')}»`);
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); out('«Rigioca l\'episodio» dalla città porta a', `${await quale(p)} (sala: dall'inizio)`);
  await p.close();
}

if (PARTE === 'home') {
  const p = await pagina(); await nuova(p);
  await p.goto(URL); await sc(p, 'titolo');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-azione="esporta"]')]);
  const file = await dl.path(); const testo = readFileSync(file, 'utf8'); const tmp = join(FOTO ?? '/tmp', 'esportato.json'); writeFileSync(tmp, testo);
  out('«Esporta»', `file «${dl.suggestedFilename()}», ${testo.length} caratteri, JSON ${(() => { try { JSON.parse(testo); return 'valido'; } catch { return 'NON valido'; } })()}`);
  const prima = await p.evaluate(() => localStorage.getItem('valmora-salvataggio'));
  const importa = async (q, nome, contenuto) => { const f = join(FOTO ?? '/tmp', nome); writeFileSync(f, contenuto); await q.setInputFiles('[data-importa]', f); await q.waitForTimeout(400); };
  for (const [nome, cont] of [['rotto.json', '{"save_version": 2, "vari'], ['vuoto.json', ''], ['estraneo.json', '{"ciao": 1}'], ['futuro.json', JSON.stringify({ ...JSON.parse(testo), save_version: 99 })], ['immagine.json', '\u0089PNG\r\n']]) {
    await importa(p, nome, cont);
    out(`importa «${nome}» sopra una partita`, `errore «${await p.locator('[data-errore-importa]').textContent().catch(() => '—')}» · conferma ${await conta(p, '[data-conferma-importa]')} · salvataggio ${prima === await p.evaluate(() => localStorage.getItem('valmora-salvataggio')) ? 'invariato' : 'CAMBIATO'}`);
    if (await conta(p, '[data-azione="no-importa"]')) await p.click('[data-azione="no-importa"]');
  }
  // file valido sopra una partita: due conferme; «No» al secondo passo
  const altro = salvataggioCon('e05', { credito: 9 });
  await importa(p, 'valido.json', JSON.stringify(altro));
  const t1 = await p.locator('[data-conferma-importa]').textContent(); await p.click('[data-azione="si-importa"]');
  const t2 = await p.locator('[data-conferma-importa]').textContent(); await p.click('[data-azione="no-importa"]');
  out('importa valido sopra una partita, «Sì» poi «No»', `1: «${t1}» · 2: «${t2}» · salvataggio ${prima === await p.evaluate(() => localStorage.getItem('valmora-salvataggio')) ? 'invariato' : 'CAMBIATO'}`);
  await importa(p, 'valido.json', JSON.stringify(altro)); await p.click('[data-azione="si-importa"]'); await p.click('[data-azione="si-importa"]'); await p.waitForTimeout(300);
  const dopo = await salvato(p);
  out('importa valido, due «Sì»', `avviso «${await p.locator('[data-importata]').textContent().catch(() => '—')}» · concluse ${dopo.missioni_concluse.length} · credito ${dopo.variabili.credito}`);
  await p.reload(); await sc(p, 'titolo'); out('dopo ricarica', `concluse ${(await salvato(p)).missioni_concluse.length}`);
  // stesso file importato due volte di seguito (l'input si svuota?)
  await importa(p, 'valido.json', JSON.stringify(altro)); out('stesso file una seconda volta', `conferma ${await conta(p, '[data-conferma-importa]')}`);
  await p.close();
  // senza partita: si importa subito
  const q = await pagina(); await sc(q, 'titolo'); await importa(q, 'valido.json', JSON.stringify(altro));
  out('importa valido senza partita', `conferme ${await conta(q, '[data-conferma-importa]')} · avviso «${await q.locator('[data-importata]').textContent().catch(() => '—')}» · Riprendi ${await q.getByRole('button', { name: 'Riprendi' }).count()}`);
  await q.close();
  // copia di riserva: principale rovinato
  const r = await pagina(); await nuova(r); await r.goto(URL); await sc(r, 'titolo');
  await r.evaluate(() => localStorage.setItem('valmora-salvataggio', '{rotto')); await r.reload(); await sc(r, 'titolo');
  out('principale rovinato, riserva buona', `avviso «${await r.locator('[data-riserva]').textContent().catch(() => '—')}» · Riprendi ${await r.getByRole('button', { name: 'Riprendi' }).count()} · principale ripristinato ${(await r.evaluate(() => localStorage.getItem('valmora-salvataggio'))).startsWith('{"save')}`);
  await r.evaluate(() => { localStorage.setItem('valmora-salvataggio', '{rotto'); localStorage.setItem('valmora-salvataggio-riserva', '{rotta'); }); await r.reload(); await r.waitForTimeout(800);
  out('principale e riserva rovinati', `schermata ${await quale(r)} · Riprendi ${await r.getByRole('button', { name: 'Riprendi' }).count()} · caratteri ${(await r.evaluate(() => document.body.innerText)).length} · errori ${r.errori.length}`);
  await r.evaluate(() => { localStorage.setItem('valmora-salvataggio', JSON.stringify({ save_version: 2, ciao: 1 })); }); await r.reload(); await r.waitForTimeout(800);
  out('principale JSON valido ma senza campi (riserva rotta)', `schermata ${await quale(r)} · caratteri ${(await r.evaluate(() => document.body.innerText)).length} · errori ${r.errori.slice(-2).join(' | ').slice(0, 200)}`);
  await r.close();
  // Nuova partita: tre conferme
  const n = await pagina(); await nuova(n); await n.goto(URL); await sc(n, 'titolo'); await n.getByRole('button', { name: 'Nuova partita' }).click(); await sc(n, 'conferma');
  const passi = []; for (let i = 0; i < 3; i++) { passi.push(`${await n.getAttribute('[data-conferma-passo]', 'data-conferma-passo')}:${(await n.locator('[data-conferma-passo] strong').textContent()).slice(0, 50)}`); if (i < 2) await n.click('[data-azione="conferma-passo"]'); }
  out('«Nuova partita» con partita', passi.join(' | '));
  await n.click('[data-azione="annulla-nuova"]'); await sc(n, 'titolo').catch(() => {}); out('«No» al terzo passo', `${await quale(n)} · partita ${(await salvato(n)) ? 'tenuta' : 'PERSA'}`);
  await n.close();
}

if (PARTE === 'vecchi') {
  const dir = join(R, 'tests/salvataggi-reali'); const extra = (process.argv[5] ?? '').split(',').filter(Boolean);
  for (const f of [...['v1-nuova-partita.json', 'v1-dopo-ondata-1.json', 'v2-0.4.0-e02-in-corso.json'].map((x) => join(dir, x)), ...extra]) {
    const p = await pagina(360, 760, readFileSync(f, 'utf8')); await p.waitForTimeout(800);
    const avviso = await p.locator('[data-avviso-aggiornamento]').textContent().catch(() => '—');
    const car = (await p.evaluate(() => document.body.innerText)).length;
    let dove = '—'; if (await p.getByRole('button', { name: 'Riprendi' }).count()) { await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(900); dove = `${await quale(p)} ep ${(await salvato(p)).in_corso?.missione ?? '—'} ondata ${(await salvato(p)).in_corso?.ondata ?? '—'} fiducia ${await fiducia(p)}`; }
    out(`apro «${f.split('/').pop()}»`, `caratteri ${car} · avviso «${avviso}» · Riprendi → ${dove} · errori ${p.errori.length}${p.errori.length ? ' ' + p.errori.join(' | ').slice(0, 200) : ''}`);
    await foto(p, `vecchio-${f.split('/').pop()}`);
    // si gioca fino al verbale?
    const s = await salvato(p);
    if (s?.in_corso && (await quale(p)) === 'schieramento') { const mm = m(s.in_corso.missione); const pl = piano(mm, null, 'attenta', s.in_corso); try { await giocaEpisodio(p, pl); out(`  ${f.split('/').pop()}: episodio giocato`, `verbale «${await p.locator('[data-esito]').getAttribute('data-esito')}»`); } catch (e) { out(`  ${f.split('/').pop()}: episodio NON finito`, e.message.slice(0, 160)); } }
    await p.close();
  }
}

if (PARTE === 'genera') {
  // Salvataggi scritti da una build vecchia (R = sua radice): C) e01 giocato, e02 a metà dell'ondata 1;
  // A) registro e01…e35 superati iniettato, e36 avviato dall'interfaccia e fermo allo schieramento dell'ondata 2.
  const v = await (async () => (await import(`${R}/src/versione.ts`)).GAME_VERSION)();
  const p = await pagina(); await nuova(p); await finoAlloSchieramento(p);
  await giocaEpisodio(p, piano(m('e01'), (await salvato(p)).in_corso.variabili)); await avanza(p, '[data-azione="citta"]');
  await p.click('[data-azione="citta"]'); await sc(p, 'citta'); await finoAlloSchieramento(p);
  const pl = piano(m('e02'), (await salvato(p)).in_corso.variabili); await schiera(p, pl.ond[0].d); await p.click('[data-azione="conferma"]');
  if (await conta(p, '[data-azione="conferma-davvero"]')) await p.click('[data-azione="conferma-davvero"]');
  await sc(p, 'chiamata'); await p.click(`[data-opzione="${pl.ond[0].rs[0][1]}"]`); await p.waitForTimeout(400);
  const c = await p.evaluate(() => localStorage.getItem('valmora-salvataggio')); writeFileSync(join(FOTO, `v2-${v}-e02-in-corso.json`), c);
  out(`scritto v2-${v}-e02-in-corso.json`, `${c.length} caratteri, in_corso ${JSON.parse(c).in_corso.missione} ondata ${JSON.parse(c).in_corso.ondata}`);
  await p.close();
  const q = await pagina(360, 760, { ...salvataggioCon('e35', {}), game_version: v }); await q.getByRole('button', { name: 'Riprendi' }).click(); await sc(q, 'citta');
  await finoAlloSchieramento(q); const p36 = piano(m('e36'), (await salvato(q)).in_corso.variabili);
  await giocaEpisodio(q, { ond: p36.ond.slice(0, 1) }).catch(() => {}); await sc(q, 'schieramento').catch(() => {});
  const a = await q.evaluate(() => localStorage.getItem('valmora-salvataggio')); writeFileSync(join(FOTO, `v2-${v}-e36-in-corso.json`), a);
  out(`scritto v2-${v}-e36-in-corso.json`, `${a.length} caratteri, in_corso ${JSON.parse(a).in_corso?.missione} ondata ${JSON.parse(a).in_corso?.ondata} (registro e01…e35 iniettato, e36 giocato dall'interfaccia)`);
  await q.close();
}

if (PARTE === 'etichette') {
  // Nomi dei settori sulla mappa tattica (sala operativa) di ogni episodio: coppie di etichette che si toccano o si coprono.
  const ids = Object.keys(dati).filter((k) => k.startsWith('missioni/')).map((k) => dati[k]).sort((a, b) => a.episodio - b.episodio).map((x) => x.id);
  for (const [l, a] of [[360, 760], [375, 812], [412, 915]]) {
    const p = await pagina(l, a); const righe = [];
    for (const [i, id] of ids.entries()) {
      const s = i ? salvataggioCon(ids[i - 1], {}) : { ...salvataggioCon('e01', {}), episodi: {}, missioni_concluse: [] };
      await p.evaluate((x) => localStorage.setItem('valmora-salvataggio', JSON.stringify(x)), s); await p.reload();
      await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.waitForTimeout(300);
      const x = await p.evaluate(() => { const e = [...document.querySelectorAll('.settore-nome')].map((n) => ({ t: n.textContent, r: n.getBoundingClientRect() })); const o = [];
        for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++) { const A = e[i].r, B = e[j].r; const w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
          if (w > -2 && h > -2) o.push(`«${e[i].t}»×«${e[j].t}» ${Math.round(Math.max(0, w) * Math.max(0, h))}px² (distanza ${Math.round(Math.min(-w, -h, 0) * -1) ? 0 : Math.round(Math.max(w, h) < 0 ? Math.min(-w, -h) : 0)})`); }
        return o; });
      if (x.length) { righe.push(`${id}: ${x.join('; ')}`); if (FOTO) await p.screenshot({ path: join(FOTO, `etichette-${l}-${id}.png`) }); }
    }
    out(`${l}×${a} episodi con etichette di settore che si toccano o si coprono`, `${righe.length}/36${righe.length ? '\n   ' + righe.join('\n   ') : ''}`);
    await p.close();
  }
}

if (PARTE === 'misure') {
  // Tutte le schermate di e01 alle tre larghezze: scorrimento, tocchi < 44 px, testi tagliati, carattere minimo.
  const misura = (p) => p.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' && !e.closest('[hidden]'); };
    const foglie = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
    const font = Math.min(...foglie.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    const piccoli = [...document.querySelectorAll('button, a, input, [role=button]')].filter(vis).map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ e, r }) => `${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 22)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    const tagliati = foglie.filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.textContent.trim().slice(0, 30));
    const fuori = foglie.filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).map((e) => e.textContent.trim().slice(0, 24));
    const s = document.scrollingElement; return { v: s.scrollHeight - innerHeight, o: s.scrollWidth - s.clientWidth, font, piccoli, tagliati, fuori };
  });
  for (const [l, a] of [[360, 760], [375, 812], [412, 915]]) {
    const p = await pagina(l, a); await sc(p, 'titolo'); const righe = [];
    const registra = async (n) => { await p.waitForTimeout(250); const x = await misura(p); righe.push(`${n}: vert ${x.v} · orizz ${x.o} · font ${x.font} · <44px ${x.piccoli.length ? x.piccoli.join('; ') : 0} · tagliati ${x.tagliati.length ? x.tagliati.join('; ') : 0} · fuori ${x.fuori.length ? x.fuori.join('; ') : 0}`); await foto(p, `${l}-${n}-${righe.length}`); };
    await registra('titolo'); await nuova(p); await registra('citta'); await finoAlloSchieramento(p, registra);
    await giocaEpisodio(p, piano(m('e01'), (await salvato(p)).in_corso.variabili), registra);
    for (let i = 0; i < 8 && await conta(p, '[data-azione="passo"]:visible'); i++) { await p.click('[data-azione="passo"]:visible'); await registra('verbale-passo'); }
    const visti = new Set(); for (const r of righe) { const k = r.replace(/^[^:]+/, ''); const n = r.split(':')[0]; if (!visti.has(n + k)) { visti.add(n + k); out(`${l}×${a}`, r); } }
    await p.close();
  }
}
await b.close(); srv.close();
