// C33-06 (D-143): a fine ondata, prima del rapporto, la scena del tono con la vignetta grande. Guardiano del giro foto, a
// 360, 375, 412 e 1366 su e01 ondata 1 (bot attento, chiamate già risposte): dopo «Leggi il rapporto» c'è la scena
// «tono»; la vignetta è VISIBILE (tutta nella finestra, alta più di 0, non nascosta); il fuoco sta sulla scena (D-142);
// da sola passa al rapporto entro 4 s; a 360 anche con Invio, subito. Foto tono-<larghezza>.png.
// Rosso VALMORA_ROSSI=C110V01 (niente scena, il rapporto subito).
import { join } from 'node:path';
import { leggiDati } from './dati-disco.mjs';
import { salvataggioTutti } from './foto-bozze.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, iniziaMissione, rispondi, schiera } from '../src/logica/missione.ts';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';

const scena = (p) => p.evaluate(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 ? s[0].dataset.scena : null; });

export async function controllaTono(browser, url, dirDati, cartella, atteso, rossi) {
  const dati = leggiDati(dirDati), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
  const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x), m = missioni.find((x) => x.id === 'e01');
  const g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v0, dich); s = schiera(m, s, g.schiera(m, s));
  for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich);
  const salvataggio = JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: s });
  for (const [w, h] of [[360, 760], [375, 812], [412, 915], [1366, 768]]) for (const conInvio of w === 360 ? [false, true] : [false]) {
    const dove = `C33-06 ${w}×${h}${conInvio ? ' (Invio)' : ''}`;
    const p = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
    await p.goto(url); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), salvataggio); await p.reload();
    await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('[data-azione="rapporto"]', { timeout: 15000 });
    await p.click('[data-azione="rapporto"]');
    const tono = await p.waitForFunction(() => document.querySelector('.scena[data-scena="tono"]'), null, { timeout: 3000 }).then(() => true, () => false);
    atteso(`${dove}: a fine ondata manca la scena del tono (scena «${await scena(p)}»)`, tono);
    if (tono) {
      await p.waitForTimeout(400);
      const v = await p.evaluate(() => { const e = document.querySelector('.scena[data-scena="tono"] [data-vignetta^="ondata-"]'); if (!e) return null; const r = e.getBoundingClientRect();
        return { alta: Math.round(r.height), dentro: r.top >= 0 && r.bottom <= innerHeight + 1, nascosta: e.hasAttribute('data-nascosta') || getComputedStyle(e).display === 'none', fuoco: document.activeElement === document.querySelector('.scena') }; });
      atteso(`${dove}: vignetta del tono ${v ? `alta ${v.alta} px${v.dentro ? '' : ', fuori dalla finestra'}${v.nascosta ? ', nascosta' : ''}` : 'assente'} (deve vedersi tutta)`, !!v && v.alta > 0 && v.dentro && !v.nascosta);
      atteso(`${dove}: il fuoco non è sulla scena del tono (D-142)`, !!v?.fuoco);
      if (!conInvio) await p.screenshot({ path: join(cartella, `tono-${w}.png`) });
      if (conInvio) await p.keyboard.press('Enter');
      const dopo = await p.waitForFunction(() => document.querySelector('.scena[data-scena="rapporto"]'), null, { timeout: conInvio ? 1500 : 4000 }).then(() => true, () => false);
      atteso(`${dove}: la scena del tono non passa al rapporto ${conInvio ? 'con Invio' : 'da sola entro 4 s'}`, dopo);
    }
    await p.close();
  }
}
