// PO-121 (D-148): dopo una risposta a una chiamata, «Annulla» col conto alla rovescia per 3 s (PO-142, D-198; era 5). Guardiano del giro foto:
// a 360, 375, 412 e 1366 su e01 ondata 1 (stato del bot attento): «Annulla» c'è, si vede tutto, non è coperto, tocco
// ≥44 px, il fuoco non ci va sopra; un secondo Invio non annulla né conferma; «Annulla» riporta la chiamata com'era
// (stesse opzioni, salvataggio identico). A 360 anche: chiusura del gioco durante i 3 s su un salvataggio vero (e02 della
// 0.4.0, migrato) → alla ripresa la chiamata è ancora aperta e niente è salvato; scaduti i 3 s la risposta vale.
// Foto po121-<larghezza>.png. Rosso VALMORA_ROSSI=C107A01 (nessun «Annulla», la risposta vale subito).
// Rosso VALMORA_ROSSI=C198A01 (PO-142): il conto torna a 5 s → 4 controlli rossi (conto «5» a 375/412/1366, a 360 la risposta non è ancora salvata a 3,6 s).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { leggiDati } from './dati-disco.mjs';
import { salvataggioTutti } from './foto-bozze.mjs';
import { partenzeAttente } from './foto-schieramenti.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { schiera } from '../src/logica/missione.ts';

const CHIAVE = 'valmora-salvataggio';
const inCorso = (p) => p.evaluate((k) => JSON.stringify(JSON.parse(localStorage.getItem(k) ?? '{}').in_corso ?? null), CHIAVE);
const chiamata = (p) => p.evaluate(() => document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null);
const opzioni = (p) => p.evaluate(() => [...document.querySelectorAll('[data-opzione]')].map((o) => `${o.dataset.opzione}${o.disabled ? ':spenta' : ''}${o.classList.contains('scelta') ? ':scelta' : ''}`).join(' '));
const pronta = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1' && document.querySelector('[data-opzione]'); }, null, { timeout: 15000 });

export async function controllaAnnulla(browser, url, dirDati, cartella, atteso, rossi) {
  const dati = leggiDati(dirDati), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
  const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x);
  const st = partenzeAttente(dirDati).find((x) => x.m.id === 'e01' && x.n === 1);
  const salvataggio = JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: schiera(st.m, st.s, st.d) });
  for (const [w, h] of [[360, 760], [375, 812], [412, 915], [1366, 768]]) {
    const dove = `PO-121 ${w}×${h}`;
    const p = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
    await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, salvataggio]); await p.reload();
    await p.getByRole('button', { name: 'Riprendi' }).click(); await pronta(p);
    const prima = { stato: await inCorso(p), chiamata: await chiamata(p), opzioni: await opzioni(p) };
    // scelta con la tastiera, come chi gioca col PC
    await p.focus('[data-opzione]'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    const a = await p.evaluate(() => { const b = document.querySelector('[data-annulla]'); if (!b) return null; const r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { vista: r.top >= 0 && r.bottom <= innerHeight, coperto: !(t && (t === b || b.contains(t))), tocco: Math.min(r.width, r.height), fuoco: document.activeElement === b, conto: b.querySelector('[data-conto]')?.textContent }; });
    atteso(`${dove}: dopo la risposta manca «Annulla» (la risposta vale subito)`, !!a);
    if (a) {
      atteso(`${dove}: «Annulla» ${a.vista ? '' : 'fuori dalla finestra '}${a.coperto ? 'coperto ' : ''}tocco ${Math.round(a.tocco)} px, conto «${a.conto}» (devono essere: visibile, libero, ≥44 px, 3)`, a.vista && !a.coperto && a.tocco >= 44 && a.conto === '3');
      atteso(`${dove}: il fuoco è andato da solo su «Annulla»`, !a.fuoco);
      await p.screenshot({ path: join(cartella, `po121-${w}.png`) });
      // un secondo Invio involontario: niente annullato, niente confermato
      await p.keyboard.press('Enter'); await p.waitForTimeout(300);
      atteso(`${dove}: un secondo Invio ha cambiato qualcosa (annullato o confermato prima del tempo)`, !!(await p.$('[data-annulla]')) && (await inCorso(p)) === prima.stato && (await chiamata(p)) === prima.chiamata);
      await p.click('[data-annulla]'); await p.waitForTimeout(200);
      atteso(`${dove}: dopo «Annulla» la chiamata non è com'era (opzioni «${await opzioni(p)}» invece di «${prima.opzioni}», o salvataggio cambiato)`, !(await p.$('[data-annulla]')) && (await opzioni(p)) === prima.opzioni && (await chiamata(p)) === prima.chiamata && (await inCorso(p)) === prima.stato);
      if (w === 360) {
        // scaduti i 3 s la risposta vale e si salva
        await p.click('[data-opzione]:not([disabled])'); await p.waitForTimeout(3600);
        atteso(`${dove}: scaduti i 3 s la risposta non è stata salvata`, (await inCorso(p)) !== prima.stato);
        // chiusura durante i 3 s, su un salvataggio vero della 0.4.0 (migrato al caricamento)
        const vero = readFileSync(new URL('../tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', import.meta.url), 'utf8');
        await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, vero]); await p.reload();
        await p.getByRole('button', { name: 'Riprendi' }).click(); await pronta(p);
        const vecchio = { stato: await inCorso(p), chiamata: await chiamata(p), opzioni: await opzioni(p) };
        await p.click('[data-opzione]'); await p.waitForTimeout(1000); await p.reload();
        await p.getByRole('button', { name: 'Riprendi' }).click(); await pronta(p);
        atteso(`${dove}: salvataggio vero, chiuso durante i 3 s: alla ripresa la scelta risulta fatta (chiamata «${await chiamata(p)}» invece di «${vecchio.chiamata}»)`, (await inCorso(p)) === vecchio.stato && (await chiamata(p)) === vecchio.chiamata && (await opzioni(p)) === vecchio.opzioni);
      }
    }
    await p.close();
  }
}
