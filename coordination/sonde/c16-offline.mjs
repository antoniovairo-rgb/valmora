// Collaudo C-016 · S-22 offline e aggiornamento. Uso: node coordination/sonde/c16-offline.mjs <buildA> <buildB> <cartella foto>
// buildA e buildB: due build dello stesso commit con impronte diverse (VERSIONE in sw.js).
// O1  sola home online (A), poi offline: Nuova partita → guida → città → e01 intero fino al verbale.
// O2  aggiornamento A → B ricaricando online: build mostrata, cache rimaste, nessuna pagina bianca; poi offline città + episodio.
// O3  scheda A rimasta aperta mentre il server passa a B, poi «Nuova partita» online (modulo della città di A non più sul server).
// O4  O3 ma offline (il server non risponde): il modulo di A viene dalla cache?
import { server, browser, contesto, sc, quale, salvato, nuova, allaPrimaOndata, piano, ondata, mis, M, dich, attenta, creaCaso } from './c16-comune.mjs';
import { resolve } from 'node:path';
const [A, B, FOTO] = process.argv.slice(2).map((x) => resolve(x));
const st = await server(A); const b = await browser();
const log = (...x) => console.log(...x);
const versioneSw = (p) => p.evaluate(() => caches.keys());
const build = (p) => p.evaluate(() => document.querySelector('[data-versione]')?.textContent ?? '—');
async function primaVisita(ctx, p) { st.rete = true; await p.goto(st.url); await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(500); }
async function offline(ctx) { st.rete = false; await ctx.setOffline(true); }
async function online(ctx) { st.rete = true; await ctx.setOffline(false); }
async function episodio(p, id = 'e01') {
  const s = await salvato(p); const m = mis(id);
  const pl = piano(m, M.iniziaMissione(m, s.variabili, dich), attenta(creaCaso(1), dich));
  await allaPrimaOndata(p);
  for (const o of pl.ond) await ondata(p, o);
  await sc(p, 'verbale', 10000);
  return pl.r.esito.id;
}
try {
  { // O1
    st.radice = A; const { ctx, p } = await contesto(b);
    await primaVisita(ctx, p); const cacheA = await versioneSw(p);
    await offline(ctx); await p.reload(); await sc(p, 'titolo');
    const dopoGenere = await nuova(p);
    let passiGuida = 0;
    if (dopoGenere === 'guida') { while (await p.locator('[data-azione="guida-avanti"]').count()) { await p.click('[data-azione="guida-avanti"]'); passiGuida++; } await p.click('[data-azione="guida-fine"]'); }
    const citta = await sc(p, 'citta').then(() => true, () => false);
    const mappa = citta && await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 8000 }).then(() => true, () => false);
    await p.screenshot({ path: `${FOTO}/o1-citta-offline-360.png` });
    let esito = 'non giocato';
    if (citta) esito = await episodio(p).catch((e) => `interrotto: ${e.message.split('\n')[0]} (scena ${'?'})`);
    await p.screenshot({ path: `${FOTO}/o1-verbale-offline-360.png` });
    const fuori = st.richieste.length;
    log(`O1 cache dopo la home: ${cacheA.join(',')} · offline: dopo il genere «${dopoGenere}», guida ${passiGuida + 1} passi, città ${citta}, mappa ${mappa}, e01: ${esito}, scena finale ${await quale(p)}, errori ${p.errori.length}: ${p.errori.slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
  { // O2
    st.radice = A; st.richieste = []; const { ctx, p } = await contesto(b);
    await primaVisita(ctx, p); await p.reload(); await sc(p, 'titolo');
    const bA = await build(p), cA = await versioneSw(p);
    st.radice = B; await p.reload(); await sc(p, 'titolo').catch(() => {});
    const scena1 = await quale(p), b1 = await build(p);
    for (let k = 0; k < 40; k++) { const n = await versioneSw(p); if (n.length === 1 && n[0] !== cA[0]) break; await p.waitForTimeout(250); }
    const c1 = await versioneSw(p);
    await p.reload(); await sc(p, 'titolo'); const b2 = await build(p);
    await p.screenshot({ path: `${FOTO}/o2-home-dopo-aggiornamento-360.png` });
    await offline(ctx); await p.reload(); await sc(p, 'titolo');
    const dopoGenere = await nuova(p);
    if (dopoGenere === 'guida') await p.click('[data-azione="guida-salta"]');
    const citta = await sc(p, 'citta').then(() => true, () => false);
    const esito = citta ? await episodio(p).catch((e) => `interrotto: ${e.message.split('\n')[0]}`) : 'non giocato';
    log(`O2 A: «${bA}» cache ${cA} → server B, prima ricarica: scena ${scena1}, «${b1}»; cache dopo ≤10 s: ${c1.join(',')}; seconda ricarica «${b2}»; offline: città ${citta}, e01 ${esito}, errori ${p.errori.length}: ${p.errori.slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
  for (const modo of ['online', 'offline']) { // O3 / O4
    st.radice = A; const { ctx, p } = await contesto(b);
    await primaVisita(ctx, p); await p.reload(); await sc(p, 'titolo');
    const inCache = await p.evaluate(async () => { for (const n of await caches.keys()) for (const r of await (await caches.open(n)).keys()) if (/StratoCitta/.test(r.url)) return `${n}: ${r.url.split('/').pop()}`; return 'no'; });
    st.radice = B; // rilascio nuovo mentre la scheda è aperta
    if (modo === 'offline') await offline(ctx);
    const dopoGenere = await nuova(p);
    if (dopoGenere === 'guida') await p.click('[data-azione="guida-salta"]').catch(() => {});
    await p.waitForTimeout(1500);
    const scena = await quale(p);
    const mappa = await p.locator('.mappa[data-pronta="si"]').count();
    const riprova = await p.locator('[data-errore-carica] [data-azione="riprova"]').count();
    await p.screenshot({ path: `${FOTO}/o${modo === 'online' ? 3 : 4}-scheda-vecchia-${modo}-360.png` });
    let dopoRiprova = '—';
    if (riprova) { if (modo === 'offline') await online(ctx); await p.click('[data-azione="riprova"]'); await p.waitForTimeout(1500); dopoRiprova = `${await quale(p)} · ${await build(p)} · salvataggio ${(await salvato(p)) ? 'presente' : 'assente'}`; }
    log(`${modo === 'online' ? 'O3' : 'O4'} scheda A aperta, server su B, ${modo}: modulo città di A in cache prima del tocco: ${inCache}; dopo il genere «${dopoGenere}», scena ${scena}, mappa ${mappa}, «Riprova» ${riprova}, dopo Riprova: ${dopoRiprova}; errori ${p.errori.length}: ${p.errori.slice(0, 2).join(' | ')}`);
    await ctx.close();
  }
} catch (e) { log(`giro interrotto: ${e.stack}`); }
await b.close(); st.chiudi();
