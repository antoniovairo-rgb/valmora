// C-053 punto 3: dopo il caricamento di un salvataggio v2 (0.53.0) e UNA risposta, cosa c'è nel localStorage; poi i salvataggi reali del repository.
import { readFileSync, readdirSync } from 'node:fs';
import * as L from './c053-lib.mjs';
const A = await L.avvia(), dir = 'coordination/collaudi/c053/dati/salvataggi';
const leggi = (sv) => ({ save_version: sv.save_version, game_version: sv.game_version, seme_in_corso: sv.in_corso?.seme, seme_sconfitta: sv.sconfitta?.seme, partenze: sv.in_corso?.partenze ? Object.fromEntries(Object.entries(sv.in_corso.partenze).map(([k, v]) => [k, v.seme])) : null });
for (const nome of ['e09-ondata3', 'e17-ondata2', 'e01-sconfitta']) {
  const p = await L.nuovaPagina(A.browser, A.url, 375, 667, null);
  const grezzo = readFileSync(`${dir}/${nome}.salvataggio.json`, 'utf8'); const prima = JSON.parse(grezzo);
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [L.CHIAVE, grezzo]); await p.reload(); await L.lento(p);
  await p.getByRole('button', { name: 'Riprendi' }).click(); await L.lento(p);
  const m = L.missioni.find((x) => x.id === nome.split('-')[0]);
  if (await p.locator('[data-opzione]').count()) { await p.locator('[data-opzione]').first().click(); await p.click('[data-conferma]'); await L.lento(p); await p.waitForTimeout(500); }
  else if (await p.locator('[data-azione="riparti"]').count()) { await p.click('[data-azione="riparti"]'); await L.lento(p); await p.waitForTimeout(500); }
  else if (await p.locator('[data-azione="rigioca"]').count()) { await p.click('[data-azione="rigioca"]'); await L.lento(p); await p.waitForTimeout(500); }
  const dopo = await L.stato(p);
  console.log(nome, 'prima', JSON.stringify(leggi(prima)), '→ dopo una azione', JSON.stringify(leggi(dopo)), 'errori', p.errori.length);
  await p.close();
}
// salvataggi reali del repository (tests/salvataggi-reali): Riprendi senza errori
for (const f of readdirSync('tests/salvataggi-reali').filter((x) => x.endsWith('.json'))) {
  const grezzo = readFileSync(`tests/salvataggi-reali/${f}`, 'utf8'), v = JSON.parse(grezzo);
  const p = await L.nuovaPagina(A.browser, A.url, 375, 667, null);
  await p.evaluate(([k, x]) => localStorage.setItem(k, x), [L.CHIAVE, grezzo]); await p.reload(); await L.lento(p);
  const n = await p.getByRole('button', { name: 'Riprendi' }).count(); let scena = '-';
  if (n) { await p.getByRole('button', { name: 'Riprendi' }).click(); await L.lento(p); await p.waitForTimeout(400); scena = await L.scenaDi(p); }
  const s = await L.stato(p);
  console.log(f, 'v' + v.save_version, v.game_version, '| Riprendi', n, 'scena', scena, '| in_corso', v.in_corso ? v.in_corso.missione + ' ondata ' + v.in_corso.ondata : null, '| errori', p.errori.length, p.errori.slice(0, 2).join(' / '));
  await p.close();
}
await A.chiudi();
