// Sonda C-024 (sola lettura): i rilievi grafici C22-01…C22-10 sono ancora presenti nella 0.18.0? Rifà alcune misure
// del C-022 nell'interfaccia (le correzioni non sono in questa release): vignetta della chiamata, riquadro di chi
// chiama e glifo (C22-01), pallini delle persone (C22-02), quadratini del corteo nella mappa (C22-03, dal codice),
// vignetta della sala a 375×667 (C22-04), icone nelle pastiglie e nei pulsanti (C22-05, C22-10), avatar contro
// vignetta (C22-09). Uso: node coordination/sonde/c24-c22.mjs <radice> <foto>
import { mkdirSync } from 'node:fs';
import { statiChiamate, avvia, apriChiamata, base, sc, missioni } from './c24-comune.mjs';
const DIR = process.argv[3] ?? 'docs/foto/c24'; mkdirSync(DIR, { recursive: true });
const { stati } = statiChiamate({ SEMI: 3, EP: ['e01', 'e18'] });
const { pagina, errori, chiudi } = await avvia();
for (const [w, h] of [[360, 760], [412, 915]]) {
  const p = await pagina({ w, h, etichetta: 'c22' });
  for (const k of ['e01:corteo_partito', 'e18:telefonata']) {
    await apriChiamata(p, stati.get(k), 300);
    const x = await p.evaluate(() => {
      const v = document.querySelector('.scena [data-vignetta^="chiamata-"]'), r = (e) => e.getBoundingClientRect(), f = (q) => `${q.width.toFixed(1)}×${q.height.toFixed(1)}`;
      const box = v.querySelector('g[transform="translate(232 18)"]'); const gl = box?.querySelector('rect + g');
      const pal = v.querySelector('[data-figura="pallino"]'); const av = document.querySelector('.messaggio.ultimo .avatar svg');
      return { vignetta: f(r(v)), riquadro: box ? f(r(box.querySelector('rect'))) : null, glifo: gl ? f(r(gl)) : null, pallino: pal ? f(r(pal)) : null, chi: v.dataset.vignetta, avatar: av ? `${av.getAttribute('class')} ${f(r(av))}` : null,
        icone: [...document.querySelectorAll('.pulsante .icona, button .icona')].slice(0, 3).map((i) => f(r(i))) };
    });
    console.log(`${w} ${k}: ${JSON.stringify(x)}`);
    await p.screenshot({ path: `${DIR}/c22-${w}-${k.replace(':', '-')}.jpg`, type: 'jpeg', quality: 80 });
  }
  await p.close();
}
// sala di e01 a 375×667: altezza della vignetta d'apertura (C22-04)
{
  const p = await pagina({ w: 375, h: 667, etichetta: 'sala' });
  await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(base)); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
  await sc(p, 'citta'); await p.click('[data-stagione="1"]'); await p.locator('[data-episodio="e01"] .settore-punto').click(); await p.waitForTimeout(300);
  await p.click('[data-azione="avvia-episodio"]'); if (await p.locator('.tripla').count()) { for (let q = 0; q < 5 && (await p.locator('[data-azione="conferma-passo"]').count()); q++) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-rigioca"]'); }
  await sc(p, 'sala'); await p.waitForTimeout(400);
  const hs = await p.evaluate(() => [...document.querySelectorAll('svg.vignetta')].filter((x) => x.getClientRects().length).map((x) => `${x.dataset.vignetta} ${x.getBoundingClientRect().height.toFixed(1)} px`));
  console.log(`375×667 sala e01 primo passo: ${hs.join(', ')}`);
  await p.screenshot({ path: `${DIR}/c22-375-e01-sala-1.jpg`, type: 'jpeg', quality: 80 });
  // pastiglie dello schieramento: icone (C22-05)
  while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]');
  await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); await p.waitForTimeout(300);
  await p.click('[data-risorsa]'); await p.click('.settore-punto'); await p.waitForTimeout(300);
  const ic = await p.evaluate(() => [...document.querySelectorAll('[data-presenza] svg, .settore-unita svg')].slice(0, 3).map((x) => `${x.getBoundingClientRect().width.toFixed(1)}×${x.getBoundingClientRect().height.toFixed(1)}`));
  console.log(`375×667 schieramento e01: icone nelle pastiglie ${ic.join(', ') || 'nessuna'}`);
  await p.close();
}
console.log(`errori di console ${errori.length} ${[...new Set(errori)].slice(0, 3).join(' | ')}`);
await chiudi();
