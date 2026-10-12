// Collaudo C-016 · guida (S-18), «Riparti dall'ondata N» (S-17), fiducia minima (D-110), usabilità.
// Uso: node coordination/sonde/c16-resa.mjs <build> <cartella foto> <sezioni: guida,riparti,vecchio,fiducia,foto>
import { server, browser, contesto, sc, quale, salvato, nuova, allaPrimaOndata, piano, ondata, misura, mis, M, dich, attenta, casuale, creaCaso, testo } from './c16-comune.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [BUILD, FOTO, SEZ = 'guida,riparti,vecchio,fiducia,foto'] = process.argv.slice(2);
const sez = SEZ.split(',');
const st = await server(resolve(BUILD)); const b = await browser();
const log = (...x) => console.log(...x);
const fiducia = (p) => p.evaluate(() => document.querySelector('[data-fiducia]')?.dataset.fiducia ?? '—');
async function pulito(larg = 360, alt = 760) { const { ctx, p } = await contesto(b, larg, alt); await p.goto(st.url); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo'); return { ctx, p }; }
async function salta(p) { if ((await quale(p)) === 'guida') await p.click('[data-azione="guida-salta"]'); await sc(p, 'citta'); }
/** Registro di episodi superati fino a «prima» (escluso), sul salvataggio vero della partita appena iniziata. */
async function conSuperati(p, finoA, variabili = null) {
  await p.evaluate(({ finoA, variabili }) => {
    const s = JSON.parse(localStorage.getItem('valmora-salvataggio'));
    if (variabili) Object.assign(s.variabili, variabili);
    for (let i = 1; i < finoA; i++) { const id = `e${String(i).padStart(2, '0')}`; s.episodi[id] = { migliore: { esito: 'contenuto', fallita: false, stelle: 2 }, tentativi: 1, variabili_prima: s.variabili, variabili_dopo: s.variabili }; s.missioni_concluse.push(id); }
    localStorage.setItem('valmora-salvataggio', JSON.stringify(s)); localStorage.setItem('valmora-salvataggio-riserva', JSON.stringify(s));
  }, { finoA, variabili });
  await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta');
}
/** Cerca una partita persa col giocatore casuale; filtro sul numero dell'ondata proposta e sulla sconfitta certa. */
function persa(id, v, vuoiN, certa) {
  const m = mis(id);
  for (let k = 1; k < 5000; k++) {
    const pl = piano(m, M.iniziaMissione(m, v, dich), casuale(creaCaso(`c16:${id}:${k}`), dich));
    if (!pl.r.esito.fallita) continue;
    const n = M.ondataDaRiprendere(pl.r); const snap = M.riprendiDallOndata(pl.s, n);
    const c = snap ? snap.variabili.tensione_max > 6 : null;
    if (vuoiN(n) && (certa === undefined || c === certa)) return { m, pl, n, snap, seme: `c16:${id}:${k}`, certa: c };
  }
  throw new Error(`${id}: nessuna partita persa adatta`);
}
async function verbale(p) {
  await sc(p, 'verbale', 10000);
  return p.evaluate(() => ({ fallita: !!document.querySelector('[data-fallita]'), avviso: document.querySelector('[data-fallita]')?.textContent ?? document.querySelector('.avviso')?.textContent, riparti: document.querySelector('[data-azione="riparti"]')?.dataset.ondata ?? null, pulsanti: [...document.querySelectorAll('.ripartenza button')].map((x) => x.textContent.trim()), esito: document.querySelector('[data-esito]')?.dataset.esito }));
}
const confronta = (a, b) => ['missione', 'ondata', 'tensione', 'riserva', 'riposo', 'fisse', 'variabili', 'scelte', 'rapporti'].filter((k) => JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null));

try {
  if (sez.includes('guida')) {
    { // G1: prima partita, guida completa, Indietro, Iniziamo
      const { ctx, p } = await pulito();
      const dopo = await nuova(p);
      const passi = [];
      for (let k = 1; k <= 8; k++) {
        passi.push(await p.evaluate(() => ({ n: document.querySelector('[data-guida]')?.dataset.guida, salta: !!document.querySelector('[data-azione="guida-salta"]'), indietro: !!document.querySelector('[data-azione="guida-indietro"]'), fine: document.querySelector('[data-azione="guida-fine"]')?.textContent ?? null })));
        if (await p.locator('[data-azione="guida-avanti"]').count()) await p.click('[data-azione="guida-avanti"]'); else break;
      }
      await p.click('[data-azione="guida-indietro"]'); const tornato = await p.evaluate(() => document.querySelector('[data-guida]')?.dataset.guida);
      await p.click('[data-azione="guida-avanti"]'); await p.click('[data-azione="guida-fine"]'); const fine = await quale(p).then(async (q) => (await sc(p, 'citta').then(() => 'citta', () => q)));
      log(`G1 dopo il genere: ${dopo}; passi: ${passi.map((x) => `${x.n}${x.salta ? '[Salta]' : ''}${x.indietro ? '[Indietro]' : ''}${x.fine ? `[${x.fine}]` : ''}`).join(' ')}; Indietro dal 6 → ${tornato}; dopo «Iniziamo»: ${fine}`);
      // G2: seconda partita sullo stesso telefono
      await p.goto(st.url); await sc(p, 'titolo'); const dopo2 = await nuova(p);
      log(`G2 seconda «Nuova partita» sullo stesso telefono: dopo il genere ${dopo2}`);
      await ctx.close();
    }
    { // G3: ricarica (app chiusa) a metà guida
      const { ctx, p } = await pulito();
      await nuova(p); await p.click('[data-azione="guida-avanti"]'); await p.click('[data-azione="guida-avanti"]');
      const a = await p.evaluate(() => document.querySelector('[data-guida]')?.dataset.guida);
      await p.reload(); await sc(p, 'titolo');
      const flag = await p.evaluate(() => localStorage.getItem('valmora-guida-vista'));
      await p.getByRole('button', { name: 'Riprendi' }).click(); const r = await sc(p, 'citta').then(() => 'citta', async () => quale(p));
      await p.goto(st.url); await sc(p, 'titolo'); const dopo = await nuova(p);
      log(`G3 guida al passo ${a}, app richiusa: valmora-guida-vista=${flag}; «Riprendi» → ${r}; nuova partita → ${dopo} (la guida introduttiva non torna più)`);
      await ctx.close();
    }
    { // G4: «Salta» c'è solo al passo 1; la guida resta dalla home
      const { ctx, p } = await pulito();
      await nuova(p); await p.click('[data-azione="guida-avanti"]');
      const salta2 = await p.locator('[data-azione="guida-salta"]').count();
      await p.click('[data-azione="guida-indietro"]'); await p.click('[data-azione="guida-salta"]'); const r = await sc(p, 'citta').then(() => 'citta', async () => quale(p));
      await p.goto(st.url); await sc(p, 'titolo'); await p.click('[data-azione="guida"]'); const home = await p.evaluate(() => [document.querySelector('[data-guida]')?.dataset.guida, document.querySelector('[data-azione="guida-chiudi"]')?.textContent]);
      log(`G4 «Salta» al passo 2: ${salta2}; Indietro → Salta → ${r}; dalla home «La città e il gioco» → passo ${home[0]}, pulsante «${home[1]}»`);
      await ctx.close();
    }
  }

  if (sez.includes('riparti')) {
    const casi = [
      { id: 'e01', prima: 1, vuoiN: (n) => n > 1, certa: true, nota: 'sconfitta certa nello stato ripreso' },
      { id: 'e01', prima: 1, vuoiN: (n) => n > 1, certa: false, nota: 'stato ripreso recuperabile' },
      { id: 'e13', prima: 13, vuoiN: (n) => n > 1 },
      { id: 'e36', prima: 36, vuoiN: (n) => n > 1 },
      { id: 'e03', prima: 3, vuoiN: (n) => n > 2, nota: 'transenne (fisse)' },
    ];
    for (const c of casi) {
      const { ctx, p } = await pulito();
      await nuova(p); await salta(p);
      if (c.prima > 1) await conSuperati(p, c.prima);
      const s0 = await salvato(p);
      const scelto = await p.evaluate(() => document.querySelector('[data-azione="avvia-episodio"]')?.closest('[data-episodio]')?.dataset.episodio ?? document.body.innerText.match(/Ep\.?\s*\d+/)?.[0]);
      const x = persa(c.id, s0.variabili, c.vuoiN, c.certa);
      await allaPrimaOndata(p);
      for (const o of x.pl.ond) await ondata(p, o);
      const v1 = await verbale(p); const s1 = await salvato(p);
      await p.screenshot({ path: `${FOTO}/r-${c.id}-verbale-fallito-360.png` });
      const variabiliUguali = JSON.stringify(s1.variabili) === JSON.stringify(s0.variabili);
      let riga = `R ${c.id} (${c.nota ?? ''}) seme ${x.seme}: città → «${scelto}»; esito ${v1.esito}, avviso «${v1.avviso}», pulsanti [${v1.pulsanti.join(' | ')}]; ondata proposta ${v1.riparti} (ondataDaRiprendere ${x.n}); tentativi ${s1.episodi[c.id]?.tentativi}; variabili della storia invariate ${variabiliUguali}`;
      if (v1.riparti) {
        await p.click('[data-azione="riparti"]'); await sc(p, 'schieramento');
        const s2 = await salvato(p); const diff = confronta(s2.in_corso, x.snap);
        const f = await fiducia(p); const ond = await p.evaluate(() => document.querySelector('main')?.dataset.ondata);
        riga += `; dopo Riparti: schermata ondata ${ond}, in_corso diverso da riprendiDallOndata in [${diff.join(',') || 'niente'}], fiducia a schermo ${f} (stato ${x.snap.variabili.credito}), tensione_max nello stato ${x.snap.variabili.tensione_max}, tentativi ${s2.episodi[c.id]?.tentativi}`;
        // ricarica a metà della ripartenza
        await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'schieramento');
        riga += `; ricarica+Riprendi → schieramento ondata ${await p.evaluate(() => document.querySelector('main')?.dataset.ondata)}`;
        const seguito = piano(x.m, structuredClone(x.snap), attenta(creaCaso(1), dich));
        for (const o of seguito.ond) await ondata(p, o);
        const v2 = await verbale(p); const s3 = await salvato(p);
        riga += `; rigiocata col giocatore attento: ${v2.esito} (previsto ${seguito.r.esito.id}), nuovo «Riparti» ${v2.riparti}, tentativi ${s3.episodi[c.id]?.tentativi}`;
      }
      log(riga + `; errori ${p.errori.length}`);
      await ctx.close();
    }
  }

  if (sez.includes('vecchio')) { // salvataggio vero 0.4.0 con e02 a metà, senza «partenze»
    const vecchio = readFileSync('tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', 'utf8');
    for (const vuoi of ['n<=2', 'n>2']) {
      const { ctx, p } = await pulito();
      await p.evaluate((v) => { localStorage.setItem('valmora-salvataggio', v); localStorage.setItem('valmora-guida-vista', 'si'); }, vecchio);
      await p.reload(); await sc(p, 'titolo');
      const avviso = await p.evaluate(() => document.querySelector('[data-avviso-aggiornamento]')?.textContent ?? null);
      await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(800);
      const s = await salvato(p); const ic = s.in_corso; const m = mis('e02');
      const scena = await quale(p);
      // seguito perso dallo stato vero, col giocatore casuale
      let trovato = null;
      for (let k = 1; k < 3000 && !trovato; k++) {
        const g = casuale(creaCaso(`c16:vecchio:${k}`), dich); let t = structuredClone(ic); const passi = [];
        // ondata in corso: già schierata, chiamate aperte
        const rs = []; for (let c = M.chiamateAperte(m, t)[0]; c; c = M.chiamateAperte(m, t)[0]) { const o = g.scegli(m, t, c); rs.push([c.id, o]); t = M.rispondi(m, t, c.id, o, dich); }
        t = M.chiudiOndata(m, t, dich);
        const resto = piano(m, t, g);
        if (!resto.r.esito.fallita) continue;
        const n = M.ondataDaRiprendere(resto.r);
        if ((vuoi === 'n<=2') === (n <= 2)) trovato = { rs, resto, n, seme: `c16:vecchio:${k}`, snap: M.riprendiDallOndata(resto.s, n) };
      }
      if (!trovato) { log(`V ${vuoi}: avviso home «${avviso}»; Riprendi → ${scena}; in_corso ${ic?.missione} ondata ${ic?.ondata}, schierata ${!!ic?.disposizione}, risposte ${JSON.stringify(ic?.risposte)}, partenze ${ic?.partenze ? Object.keys(ic.partenze).join(',') : 'assenti'}; nessun seguito perso con ${vuoi} in 3000 semi`); await ctx.close(); continue; }
      for (const [, op] of trovato.rs) { await sc(p, 'chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(250); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
      await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto');
      while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
      await p.click('[data-azione="avanti"]');
      for (const o of trovato.resto.ond) await ondata(p, o);
      const v = await verbale(p);
      await p.screenshot({ path: `${FOTO}/v-vecchio-${vuoi.replace(/[<>=]/g, '')}-360.png` });
      log(`V ${vuoi}: avviso home «${avviso}»; Riprendi → ${scena}, in_corso ${ic.missione} ondata ${ic.ondata}, partenze ${ic.partenze ? Object.keys(ic.partenze).join(',') : 'assenti'}; seme ${trovato.seme}: esito ${v.esito}, ondataDaRiprendere ${trovato.n}, stato salvato per n: ${trovato.snap ? 'sì' : 'no'}; pulsanti [${v.pulsanti.join(' | ')}], avviso «${v.avviso}»; errori ${p.errori.length}`);
      await ctx.close();
    }
  }

  if (sez.includes('vecchio2')) { // in_corso senza «partenze» (come lo scriveva la 0.7.0): salvataggio vero 0.8.0 a inizio ondata 3, campo tolto
    const { ctx, p } = await pulito();
    await nuova(p); await salta(p);
    const s0 = await salvato(p); const x = persa('e01', s0.variabili, (n) => n >= 2);
    await allaPrimaOndata(p); await ondata(p, x.pl.ond[0]); await ondata(p, x.pl.ond[1]); await sc(p, 'schieramento');
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('valmora-salvataggio')); delete s.in_corso.partenze; s.game_version = '0.7.0'; localStorage.setItem('valmora-salvataggio', JSON.stringify(s)); localStorage.setItem('valmora-salvataggio-riserva', JSON.stringify(s)); });
    await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click();
    await ondata(p, x.pl.ond[2]);
    const v = await verbale(p);
    await p.screenshot({ path: `${FOTO}/v-senza-partenze-360.png` });
    log(`V2 e01 seme ${x.seme}, partenze tolte a inizio ondata 3: esito ${v.esito}, ondataDaRiprendere ${x.n}; pulsanti [${v.pulsanti.join(' | ')}], avviso «${v.avviso}»; errori ${p.errori.length}`);
    await ctx.close();
  }

  if (sez.includes('fiducia')) { // D-110: fiducia 0 in ingresso → 3 a inizio episodio; anche dopo «Ricomincia»
    const { ctx, p } = await pulito();
    await nuova(p); await salta(p); await conSuperati(p, 2, { credito: 0 });
    const s0 = await salvato(p);
    await allaPrimaOndata(p); const f1 = await fiducia(p);
    const x = persa('e02', s0.variabili, (n) => n === 1);
    for (const o of x.pl.ond) await ondata(p, o);
    const v = await verbale(p);
    const s1 = await salvato(p);
    await p.click('[data-azione="rigioca"]'); await sc(p, 'sala');
    while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
    await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
    while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]');
    await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); const f2 = await fiducia(p);
    const s2 = await salvato(p);
    // ripartenza con fiducia scesa sotto 3 a metà episodio
    let r = null;
    try { r = persa('e02', s0.variabili, (n) => n > 1); } catch { /* nessuna */ }
    log(`F credito in ingresso ${s0.variabili.credito}: e02 ondata 1 fiducia a schermo ${f1}; perso (${v.esito}, pulsanti [${v.pulsanti.join(' | ')}]), variabili_prima nel registro credito ${s1.episodi.e02?.variabili_prima?.credito}; «Ricomincia» → fiducia a schermo ${f2}, in_corso credito ${s2.in_corso?.variabili?.credito}`);
    await ctx.close();
  }

  if (sez.includes('foto')) { // usabilità delle schermate toccate a tre misure
    for (const [larg, alt] of [[360, 760], [375, 812], [412, 915]]) {
      const { ctx, p } = await pulito(larg, alt);
      const righe = [];
      const foto = async (nome) => { await p.waitForTimeout(350); righe.push([nome, await misura(p)]); await p.screenshot({ path: `${FOTO}/${larg}-${nome}.png` }); };
      await foto('titolo');
      await nuova(p);
      for (let k = 1; k <= 6; k++) { await foto(`guida-${k}`); if (k < 6) await p.click('[data-azione="guida-avanti"]'); }
      await p.click('[data-azione="guida-fine"]'); await sc(p, 'citta'); await p.waitForTimeout(600); await foto('citta');
      const s0 = await salvato(p); const x = persa('e01', s0.variabili, (n) => n > 1, false);
      await allaPrimaOndata(p); for (const o of x.pl.ond) await ondata(p, o);
      await verbale(p); await foto('verbale-fallito');
      await p.click('[data-azione="riparti"]'); await sc(p, 'schieramento'); await foto('schieramento-dopo-riparti');
      // contenitore «Riprova»: modulo della città che non arriva
      await p.route('**/StratoCitta*', (r) => r.abort());
      await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('valmora-salvataggio')); s.in_corso = null; localStorage.setItem('valmora-salvataggio', JSON.stringify(s)); });
      await p.evaluate(() => navigator.serviceWorker.getRegistrations().then((rs) => Promise.all(rs.map((r) => r.unregister()))));
      await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(1500);
      const errore = await p.locator('[data-errore-carica]').count(); if (errore) await foto('errore-riprova');
      for (const [n, m] of righe) log(`U ${larg}×${alt} ${n.padEnd(26)} vert ${String(m.verticale).padStart(4)} · orizz ${m.orizzontale} · font ${m.font} · piccoli ${m.piccoli.join('; ') || '0'} · tagliati ${m.tagliati.join('; ') || '0'} · sovrapp ${m.sov.join('; ') || '0'} · pulsanti sotto la piega ${m.pulsantiSottoLaPiega.join('; ') || '0'}`);
      log(`U ${larg}×${alt} contenitore «Riprova» col modulo città bloccato: ${errore ? 'sì' : 'no (scena ' + (await quale(p)) + ')'}; errori pagina ${p.errori.filter((e) => !e.startsWith('console')).length}`);
      await ctx.close();
    }
  }
} catch (e) { log(`giro interrotto: ${e.stack?.split('\n').slice(0, 4).join(' / ')}`); }
await b.close(); st.chiudi();
