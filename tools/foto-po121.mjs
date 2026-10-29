// PO-148 (D-236, al posto del conto alla rovescia di PO-121/D-148): dopo il tocco su una risposta la scelta resta evidenziata e
// compaiono «Annulla» e «Conferma»; niente vale prima di «Conferma». Guardiano del giro foto, su e01 ondata 1 (stato del bot
// attento), a 360/375/412 × 640/667/760 e a 1366×768: dopo la scelta (da tastiera) i due pulsanti ci sono, stanno nella
// finestra, non sono coperti, tocco ≥44 px, il fuoco non ci va sopra; nessun effetto prima di «Conferma» (salvataggio e
// chiamata identici; a 360×640 anche dopo 3,6 s, niente conto alla rovescia); un secondo Invio non cambia niente; «Annulla»
// riporta la chiamata com'era; «Conferma» salva la risposta. A 360×640 anche: chiusura del gioco prima della conferma su un
// salvataggio vero (e02 della 0.4.0, migrato) → alla ripresa la chiamata è ancora aperta e niente è salvato.
// Foto po121-<larghezza>x<altezza>.png. Rosso VALMORA_ROSSI=C107A01 (nessun pulsante, la risposta vale subito).
// Rosso VALMORA_ROSSI=C236C01 (la risposta vale già al tocco, anche coi pulsanti in vista).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { leggiDati } from './dati-disco.mjs';
import { salvataggioTutti } from './foto-bozze.mjs';
import { partenzeAttente } from './foto-schieramenti.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { schiera } from '../src/logica/missione.ts';

const CHIAVE = 'vandelfalls-salvataggio';
const inCorso = (p) => p.evaluate((k) => JSON.stringify(JSON.parse(localStorage.getItem(k) ?? '{}').in_corso ?? null), CHIAVE);
const chiamata = (p) => p.evaluate(() => document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null);
const opzioni = (p) => p.evaluate(() => [...document.querySelectorAll('[data-opzione]')].map((o) => `${o.dataset.opzione}${o.disabled ? ':spenta' : ''}${o.classList.contains('scelta') ? ':scelta' : ''}`).join(' '));
const pronta = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1' && document.querySelector('[data-opzione]'); }, null, { timeout: 15000 });
// i due pulsanti: presenza, finestra, copertura, misura del tocco, fuoco
const pulsanti = (p) => p.evaluate(() => ['[data-annulla]', '[data-conferma]'].map((sel) => { const b = document.querySelector(sel); if (!b) return null; const r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { sel, vista: r.top >= 0 && r.bottom <= innerHeight, coperto: !(t && (t === b || b.contains(t))), tocco: Math.round(Math.min(r.width, r.height)), fuoco: document.activeElement === b }; }));
export const FORMATI_PO148 = [[360, 640], [375, 667], [412, 760], [360, 760], [375, 760], [412, 640], [375, 640], [360, 667], [412, 667], [1366, 768]];

export async function controllaAnnulla(browser, url, dirDati, cartella, atteso, rossi) {
  const dati = leggiDati(dirDati), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
  const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x);
  const st = partenzeAttente(dirDati).find((x) => x.m.id === 'e01' && x.n === 1);
  const salvataggio = JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: schiera(st.m, st.s, st.d) });
  for (const [w, h] of FORMATI_PO148) {
    const dove = `PO-148 ${w}×${h}`;
    const p = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
    await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, salvataggio]); await p.reload();
    await p.getByRole('button', { name: 'Riprendi' }).click(); await pronta(p);
    const prima = { stato: await inCorso(p), chiamata: await chiamata(p), opzioni: await opzioni(p) };
    const com_era = async () => (await inCorso(p)) === prima.stato && (await chiamata(p)) === prima.chiamata;
    // scelta con la tastiera, come chi gioca col PC
    await p.focus('[data-opzione]'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    const [an, co] = await pulsanti(p);
    atteso(`${dove}: dopo la scelta mancano ${[!an && '«Annulla»', !co && '«Conferma»'].filter(Boolean).join(' e ')} (la risposta vale subito)`, !!an && !!co);
    if (an && co) {
      for (const b of [an, co]) {
        atteso(`${dove}: ${b.sel} ${b.vista ? '' : 'fuori dalla finestra '}${b.coperto ? 'coperto ' : ''}tocco ${b.tocco} px (devono essere: nella finestra, libero, ≥44 px)`, b.vista && !b.coperto && b.tocco >= 44);
        atteso(`${dove}: il fuoco è andato da solo su ${b.sel}`, !b.fuoco);
      }
      atteso(`${dove}: la risposta ha avuto effetto prima di «Conferma» (salvataggio o chiamata cambiati)`, await com_era());
      if (w === 360 && h === 640) { await p.waitForTimeout(3600); atteso(`${dove}: dopo 3,6 s senza «Conferma» la risposta è stata salvata (c'è ancora un conto alla rovescia?)`, (await com_era()) && !!(await p.$('[data-conferma]'))); }
      await p.screenshot({ path: join(cartella, `po121-${w}x${h}.png`) });
      // un secondo Invio involontario: niente annullato, niente confermato
      await p.keyboard.press('Enter'); await p.waitForTimeout(300);
      atteso(`${dove}: un secondo Invio ha cambiato qualcosa (annullato o confermato)`, !!(await p.$('[data-conferma]')) && (await com_era()));
      await p.click('[data-annulla]'); await p.waitForTimeout(200);
      atteso(`${dove}: dopo «Annulla» la chiamata non è com'era (opzioni «${await opzioni(p)}» invece di «${prima.opzioni}», o salvataggio cambiato)`, !(await p.$('[data-annulla]')) && (await opzioni(p)) === prima.opzioni && (await com_era()));
      // di nuovo la scelta, poi «Conferma»: la risposta vale e si salva
      const libera = p.locator('[data-opzione]:not([disabled])'); // con «Annulla» rotto la chiamata può non esserci più
      if (await libera.count()) { await libera.first().click(); await p.waitForTimeout(200); await p.click('[data-conferma]', { timeout: 3000 }).catch(() => {}); await p.waitForTimeout(300); }
      atteso(`${dove}: dopo «Conferma» la risposta non è stata salvata`, (await inCorso(p)) !== prima.stato);
      if (w === 360 && h === 640) {
        // chiusura prima della conferma, su un salvataggio vero della 0.4.0 (migrato al caricamento)
        const vero = readFileSync(new URL('../tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', import.meta.url), 'utf8');
        await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, vero]); await p.reload();
        await p.getByRole('button', { name: 'Riprendi' }).click(); await pronta(p);
        const vecchio = { stato: await inCorso(p), chiamata: await chiamata(p), opzioni: await opzioni(p) };
        await p.click('[data-opzione]'); await p.waitForTimeout(1000); await p.reload();
        await p.getByRole('button', { name: 'Riprendi' }).click(); await pronta(p);
        atteso(`${dove}: salvataggio vero, chiuso prima di «Conferma»: alla ripresa la scelta risulta fatta (chiamata «${await chiamata(p)}» invece di «${vecchio.chiamata}»)`, (await inCorso(p)) === vecchio.stato && (await chiamata(p)) === vecchio.chiamata && (await opzioni(p)) === vecchio.opzioni);
      }
    }
    await p.close();
  }
}
