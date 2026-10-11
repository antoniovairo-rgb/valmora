// Collaudo C-014b, compito 3 (salvataggi vuoto, JSON rotto, save_version 1) e compito 5 (offline).
// Uso: node coordination/sonde/c14b-salvataggi-offline.mjs   → out/c14b/salvataggi-offline.json
// Ogni caso parte da una pagina nuova con localStorage «valmora-salvataggio» impostato dalla sonda.
import { avviaServer, apriBrowser, nuovaPagina, attendiScena, scenaCorrente, salvato, osserva, scrivi, attesa, MISURE, RADICE } from './c14b-lib.mjs';

const { srv, url } = await avviaServer();
const b = await apriBrowser();
const risultati = [];
const [larg, alt] = MISURE[0];

/** Carica la pagina con un salvataggio dato (stringa grezza) e annota titolo, pulsanti, errori. */
async function caso(nome, grezzo) {
  const p = await nuovaPagina(b, url, [larg, alt], { pulisci: true });
  if (grezzo !== null) await p.evaluate((g) => localStorage.setItem('valmora-salvataggio', g), grezzo);
  await p.reload();
  const sc = await attendiScena(p, ['titolo'], 8000);
  const r = { caso: nome, scena: sc ?? (await scenaCorrente(p)), riprendi: await p.getByRole('button', { name: 'Riprendi' }).count(), nuova: await p.getByRole('button', { name: 'Nuova partita' }).count() };
  r.misura = await osserva(p, { larg, episodio: nome, scena: 'titolo', foto: true });
  if (r.riprendi) {
    await p.getByRole('button', { name: 'Riprendi' }).click();
    await attesa(p, 800);
    r.dopoRiprendi = await scenaCorrente(p);
    r.misuraDopo = await osserva(p, { larg, episodio: nome, scena: r.dopoRiprendi ?? 'sconosciuta', foto: true });
  }
  r.salvatoDopo = await p.evaluate(() => { const v = localStorage.getItem('valmora-salvataggio'); if (v === null) return 'assente'; if (v === '') return 'stringa vuota'; try { JSON.parse(v); return 'JSON valido'; } catch { return 'JSON rotto'; } });
  r.saveVersionDopo = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null')?.save_version ?? null; } catch { return 'non leggibile'; } });
  r.errori = p.errori;
  await p.close();
  risultati.push(r);
  console.log(JSON.stringify({ caso: nome, scena: r.scena, riprendi: r.riprendi, nuova: r.nuova, dopoRiprendi: r.dopoRiprendi ?? null, salvatoDopo: r.salvatoDopo, saveVersionDopo: r.saveVersionDopo, errori: r.errori.length, errori0: r.errori[0] ?? null }));
}

await caso('salvataggio vuoto (stringa vuota)', '');
await caso('JSON rotto', '{"save_version":2,"seme":');
// save_version 1: si prende un salvataggio reale (nuova partita) e si riscrive con save_version 1
{
  const p = await nuovaPagina(b, url, [larg, alt]);
  await p.getByRole('button', { name: 'Nuova partita' }).click();
  await attendiScena(p, ['genere']); await p.click('[data-genere="m"]'); await attendiScena(p, ['citta']); await attesa(p, 600);
  const vero = await salvato(p);
  const v1 = { ...vero, save_version: 1 };
  await p.close();
  await caso('save_version 1 (copia di una partita reale)', JSON.stringify(v1));
  console.log('save_version reale del salvataggio:', vero.save_version, '· campi in v1:', Object.keys(v1).join(','));
}
// Offline (compito 5): primo caricamento online, poi setOffline e ricarica
{
  const ctx = await b.newContext({ viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'allow' });
  const p = await ctx.newPage();
  const errori = []; p.on('pageerror', (e) => errori.push(e.message)); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text()); });
  await p.goto(url); await attendiScena(p, ['titolo']);
  // attende fino a 8 s la registrazione del service worker (campionata ogni 500 ms)
  for (let i = 0; i < 16; i++) { if (await p.evaluate(async () => (await navigator.serviceWorker?.getRegistrations?.())?.length > 0).catch(() => false)) break; await attesa(p, 500); }
  await attesa(p, 500);
  // senza await su ready (può non risolversi mai): stato letto così com'è
  const pronto = await p.evaluate(() => ({ supportato: 'serviceWorker' in navigator, controllata: !!navigator.serviceWorker?.controller }));
  const reg = await p.evaluate(() => navigator.serviceWorker?.getRegistrations?.().then((rs) => rs.map((r) => ({ scope: r.scope, attivo: !!r.active }))).catch(() => 'errore'));
  pronto.registrazioni = reg ?? null;
  const cacheNomi = await p.evaluate(() => (typeof caches === 'undefined' ? 'non disponibile' : caches.keys()));
  await ctx.setOffline(true);
  await p.reload({ waitUntil: 'domcontentloaded' }).catch((e) => errori.push(`reload: ${e.message.split('\n')[0]}`));
  const sc = await attendiScena(p, ['titolo'], 10000);
  const versione = await p.evaluate(() => document.querySelector('[data-versione]')?.getAttribute('data-versione') ?? null);
  const testo = await p.evaluate(() => document.querySelector('[data-versione]')?.textContent ?? null);
  const r = { caso: 'offline dopo primo caricamento', sw: pronto, cacheNomi, scenaOffline: sc, dataVersione: versione, testoVersione: testo, errori };
  r.misura = await osserva(p, { larg, episodio: 'offline', scena: sc ?? 'sconosciuta', foto: true });
  console.log(JSON.stringify(r));
  risultati.push(r);
  await ctx.close();
}
scrivi('salvataggi-offline.json', risultati);
console.log(`cartella: ${RADICE}`);
await b.close(); srv.close();
