// Sonda C-024 (sola lettura): riproduzione dell'errore di console «Cannot read properties of undefined (reading
// 'screen')» visto in c24-briefing.mjs. Ripete N volte il percorso città → sala → briefing (alBriefing, tocchi
// rapidi) su EP, con il processore rallentato RATE volte (CDP Emulation.setCPUThrottlingRate), e conta gli errori
// con la pila completa. Come c24-briefing.mjs, scorre anche tutti i passi del briefing prima della ricarica. Uso: node coordination/sonde/c24-screen.mjs <radice> · env N=20 RATE=4 EP=e01,e15 LARG=360x760
import { avvia, alBriefing } from './c24-comune.mjs';
const N = Number(process.env.N ?? 20), RATE = Number(process.env.RATE ?? 4), EP = (process.env.EP ?? 'e01,e15').split(',');
const [w, h] = (process.env.LARG ?? '360x760').split('x').map(Number);
const { b, chiudi, URL } = await avvia();
const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: Number(process.env.SCALA ?? 1), reducedMotion: 'reduce' });
const pile = [];
p.on('pageerror', (e) => pile.push(`pageerror: ${e.stack?.split('\n').slice(0, 6).join(' | ')}`));
const dopo = [];
p.on('console', (x) => { if (x.type() === 'error') { pile.push(`console: ${x.text().split('\n').slice(0, 6).join(' | ')}`); setTimeout(async () => { try { dopo.push(await p.evaluate(() => ({ scena: document.querySelector('.scena')?.dataset.scena, avviso: !!document.querySelector('[data-errore-carica]'), tele: document.querySelectorAll('.mappa canvas').length }))); await p.screenshot({ path: `${process.env.FOTO ?? '.'}/screen-errore-${dopo.length}.jpg`, type: 'jpeg', quality: 70 }); } catch {} }, 50); } });
await p.goto(URL);
const c = await p.context().newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: RATE });
let giri = 0, falliti = 0;
for (let i = 0; i < N; i++) for (const ep of EP) { giri++; try { await alBriefing(p, ep); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(100); } } catch { falliti++; } }
console.log(`giri ${giri} (rallentamento ${RATE}×, ${w}×${h}), percorsi non completati ${falliti}, errori ${pile.length}`);
for (const x of [...new Set(pile)].slice(0, 5)) console.log('  ' + x);
for (const d of dopo) console.log(`  subito dopo l'errore: scena ${d.scena}, avviso «Qualcosa non si è caricato» ${d.avviso}, tele della mappa ${d.tele}`);
await chiudi();
