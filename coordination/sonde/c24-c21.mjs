// Sonda C-024 (sola lettura): rilievi C21-04, C21-05/06, C21-09 corretti nella 0.18.0.
// A) C21-04: mappa dello schieramento, ondata 1 (e ONDATE), di e15 ed e27 a 412×915 scala 2, verde e rosso C50C01;
//    pixel dei colori primari dei club dentro l'ellisse dello stadio (data-stadio-ellisse) e foto.
// B) C21-05/06: le chiamate con eventi cerimonia, minaccia, lite, faida sul proprio settore (dati), gruppo della
//    vignetta nell'interfaccia (data-evento), verde e rosso C50G01, foto ingrandite di alcune.
// C) C21-09: le chiamate sul settore di un evento con «se», aperte con la variabile che rende vera e falsa la
//    condizione, verde e rosso C50S01.
// Uso: node coordination/sonde/c24-c21.mjs <radice> <foto> · env PARTE=A,B,C ONDATE=1,2,3,4
import { mkdirSync } from 'node:fs';
import { M, B, dich, v0, missioni, club, creaCaso, statiChiamate, avvia, apriChiamata, base, sc } from './c24-comune.mjs';
const DIR = process.argv[3] ?? 'docs/foto/c24'; mkdirSync(DIR, { recursive: true });
const PARTI = (process.env.PARTE ?? 'A,B,C').split(',');
const { b, pagina, errori, chiudi } = await avvia();
const conta = await b.newPage();
const contaEllisse = (png, ell, scala, COL, TOL = 14) => conta.evaluate(async ([b64, ell, scala, COL, TOL]) => {
  const im = new Image(); im.src = `data:image/png;base64,${b64}`; await im.decode();
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data; const rgb = Object.entries(COL).map(([k, h]) => [k, [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))]);
  const n = Object.fromEntries(rgb.map(([k]) => [k, { sx: 0, dx: 0 }])); const [cx, cy, rx, ry] = ell.map((v) => v * scala);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; if (q > 1.15) continue; const i = (y * c.width + x) * 4;
    for (const [k, v] of rgb) if (Math.abs(d[i] - v[0]) <= TOL && Math.abs(d[i + 1] - v[1]) <= TOL && Math.abs(d[i + 2] - v[2]) <= TOL) n[k][x < cx ? 'sx' : 'dx']++;
  }
  return n;
}, [png.toString('base64'), ell, scala, COL, TOL]);
const gioca = (m, n) => { const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, { ...v0 }, dich);
  while (s.ondata < n) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); }
  return s; };

if (PARTI.includes('A')) {
  const COL = Object.fromEntries(Object.values(club).map((c) => [c.id.split('_')[0], c.colori.primario]));
  for (const braccio of ['verde', 'C50C01']) {
    const p = await pagina({ w: 412, h: 915, scala: 2, rossi: braccio === 'verde' ? [] : [braccio], etichetta: `A ${braccio}` });
    for (const id of ['e15', 'e27']) for (const n of (process.env.ONDATE ?? '1').split(',').map(Number)) {
      const m = missioni.find((x) => x.id === id); const s = gioca(m, n);
      await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: s }));
      await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'schieramento');
      await p.waitForSelector('.mappa[data-pronta="si"]').catch(() => {}); await p.waitForTimeout(700);
      const a = await p.evaluate(() => { const m = document.querySelector('.mappa'); return { ell: m.dataset.stadioEllisse, stadio: m.dataset.stadio, folla: m.dataset.folla }; });
      const ell = a.ell.split(',').map(Number); const png = await p.locator('.mappa').first().screenshot({ type: 'png' });
      // l'ellisse è in px della tela della mappa: si porta in px della foto con la larghezza dell'elemento
      const tela = await p.evaluate(() => { const c = document.querySelector('.mappa canvas'); const r = c.getBoundingClientRect(), m = document.querySelector('.mappa').getBoundingClientRect(); return { dx: r.left - m.left, dy: r.top - m.top, k: r.width / (c.width / devicePixelRatio) }; });
      const ellFoto = [ell[0] * tela.k + tela.dx, ell[1] * tela.k + tela.dy, ell[2] * tela.k, ell[3] * tela.k];
      const n2 = await contaEllisse(png, ellFoto, 2, COL);
      console.log(`A ${braccio} ${id} ondata ${n}: stadio ${a.stadio} ellisse ${a.ell} · folla ${a.folla} · pixel dei primari nello stadio (sx/dx): ${Object.entries(n2).filter(([, v]) => v.sx + v.dx > 30).map(([k, v]) => `${k} ${v.sx}/${v.dx}`).join(' · ')}`);
      await p.locator('.mappa').first().screenshot({ path: `${DIR}/stadio-412x2-${id}-o${n}${braccio === 'verde' ? '' : '-rosso'}.jpg`, type: 'jpeg', quality: 85 });
    }
    await p.close();
  }
}

// D) C23-03: e30 ondate 2-4 ed e17 ondate 1 e 4, strada_cinderwick nello schieramento: colori dei cortei dell'ondata
//    (data-colori-cortei) e pixel dell'arancio Cinderwick sulla mappa, verde e rosso C49E01 (club dell'evento spento).
if (PARTI.includes('D')) {
  const COL = { cinderwick: club.cinderwick_united.colori.primario, 'grigio-1': '#c9c2b4', 'grigio-2': '#9a958c' };
  for (const braccio of ['verde', 'C49E01']) {
    const p = await pagina({ w: 412, h: 915, scala: 2, rossi: braccio === 'verde' ? [] : [braccio], etichetta: `D ${braccio}` });
    for (const [id, n] of [['e30', 2], ['e30', 3], ['e30', 4], ['e17', 1], ['e17', 4]]) {
      const m = missioni.find((x) => x.id === id); const s = gioca(m, n);
      await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: s }));
      await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'schieramento');
      await p.waitForSelector('.mappa[data-pronta="si"]').catch(() => {}); await p.waitForTimeout(700);
      const a = await p.evaluate(() => { const m = document.querySelector('.mappa'); return { colori: m.dataset.coloriCortei, folla: m.dataset.folla }; });
      const n2 = await contaEllisse(await p.locator('.mappa').first().screenshot({ type: 'png' }), [0, 0, 1e5, 1e5], 1, COL);
      const strada = a.colori.split(',').find((x) => x.startsWith('strada_cinderwick')) ?? '-';
      console.log(`D ${braccio} ${id} ondata ${n} (ondata ${s.ondata}): folla ${a.folla} · ${strada} · pixel mappa: ${Object.entries(n2).map(([k, v]) => `${k} ${v.sx + v.dx}`).join(' · ')}`);
      if (braccio === 'verde') await p.locator('.mappa').first().screenshot({ path: `${DIR}/c23-03-412x2-${id}-o${n}.jpg`, type: 'jpeg', quality: 80 });
    }
    await p.close();
  }
}

if (PARTI.includes('B') || PARTI.includes('C')) {
  const { stati } = statiChiamate({ SEMI: 20 });
  const TIPI = new Set(['cerimonia', 'minaccia', 'lite', 'faida']);
  const lista = [...stati.values()].filter(({ m, n, c }) => c.settore && m.ondate[n - 1].eventi.some((e) => e.settore === c.settore && TIPI.has(e.tipo)));
  const cond = [...stati.values()].filter(({ m, n, c }) => c.settore && m.ondate[n - 1].eventi.some((e) => e.settore === c.settore && e.se));
  for (const braccio of ['verde', 'C50G01', 'C50S01']) {
    if (braccio === 'C50G01' && !PARTI.includes('B')) continue; if (braccio === 'C50S01' && !PARTI.includes('C')) continue;
    const p = await pagina({ w: 412, h: 915, scala: 3, rossi: braccio === 'verde' ? [] : [braccio], etichetta: `BC ${braccio}` });
    const leggi = () => p.evaluate(() => { const v = document.querySelector('.scena [data-vignetta^="chiamata-"]'); return { evento: v?.dataset.evento, pallini: v?.querySelectorAll('[data-figura="pallino"]').length ?? 0 }; });
    if (PARTI.includes('B') && braccio !== 'C50S01') {
      const conta = {};
      for (const x of lista) {
        await apriChiamata(p, x, 300); const v = await leggi(); const tipi = x.m.ondate[x.n - 1].eventi.filter((e) => e.settore === x.c.settore).map((e) => e.tipo).join('+');
        conta[`${tipi} → ${v.evento}`] = [...(conta[`${tipi} → ${v.evento}`] ?? []), `${x.m.id}:${x.c.id}`];
        if (['e34:commissione_schieramento', 'e18:telefonata', 'e21:nuovo_capo', 'e14:seduti'].includes(`${x.m.id}:${x.c.id}`)) await p.locator('.scena [data-vignetta^="chiamata-"]').first().screenshot({ path: `${DIR}/vignetta-${x.m.id}-${x.c.id}${braccio === 'verde' ? '' : '-rosso'}.png` });
      }
      console.log(`B ${braccio}: ${lista.length} chiamate su un settore con cerimonia/minaccia/lite/faida`); for (const [k, v] of Object.entries(conta)) console.log(`   ${k}: ${v.length} (${v.join(' ')})`);
    }
    if (PARTI.includes('C') && braccio !== 'C50G01') {
      for (const x of cond) for (const e of x.m.ondate[x.n - 1].eventi.filter((e) => e.settore === x.c.settore && e.se)) {
        const d = dich.get(e.se.var); const vero = e.se.uguale; const falso = d?.tipo === 'enum' ? d.valori.find((v) => v !== vero) : !vero;
        for (const val of [vero, falso]) {
          const s = structuredClone(x.s); s.variabili[e.se.var] = val;
          await apriChiamata(p, { ...x, s }, 300); const v = await leggi();
          const altri = x.m.ondate[x.n - 1].eventi.filter((q) => q.settore === x.c.settore && q !== e).map((q) => q.tipo);
          console.log(`C ${braccio} ${x.m.id}:${x.c.id} evento ${e.id} (${e.tipo}, se ${e.se.var}=${vero}) con ${e.se.var}=${val}: vignetta ${v.evento}, pallini ${v.pallini}; altri eventi sul settore: ${altri.join(',') || 'nessuno'}`);
          if (x.m.id === 'e31') await p.locator('.scena [data-vignetta^="chiamata-"]').first().screenshot({ path: `${DIR}/vignetta-e31-offerta-${e.se.var}-${val}${braccio === 'verde' ? '' : '-rosso'}.png` });
        }
      }
    }
    await p.close();
  }
}
console.log(`errori di console ${errori.length} ${[...new Set(errori)].slice(0, 3).join(' | ')}`);
await chiudi();
