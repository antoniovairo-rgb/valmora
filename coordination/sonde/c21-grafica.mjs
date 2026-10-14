// Sonda C-021 (sola lettura): ogni chiamata dei 36 episodi aperta nell'interfaccia vera (dist/), con lo stato di gioco
// in cui compare per prima (raccolto giocando col motore: strategie casuale, attenta, equilibrata, peggiore e SEMI semi).
// Per ogni chiamata legge dove nasce (DOM della pagina): gruppo della vignetta [data-evento], cortei disegnati
// (.mappa data-folla) e i loro colori (.mappa data-colori-cortei), più gli errori di console. Confronta il gruppo con
// quello ricalcolato dai dati (stessa regola di src/resa/vignette-evento.tsx:22-27) e i colori con la regola PO-102
// (src/resa/mappa/sfondo.ts:121). Foto della finestra per le chiamate in FOTO (episodio:chiamata) a 360/375/412.
// Uso: node coordination/sonde/c21-grafica.mjs <radice con dist/> <cartella foto> [uscita.json]
//      env: SEMI (20), EP=e01,e09 (filtro), ROSSO=C45E01,C43C02 (interruttori spenti nella pagina), SOLO_FOTO=1
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c21'; const OUT = process.argv[4];
mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const { missioni, v0 } = missioniDai(join(R, 'data'));
const club = Object.fromEntries(Object.entries(dati).filter(([k]) => k.startsWith('club/')).map(([, c]) => [c.id, c]));
const SEMI = Number(process.env.SEMI ?? 20); const EP = process.env.EP?.split(','); const ROSSI = process.env.ROSSO?.split(',').filter(Boolean) ?? [];
const FOTO = new Set((process.env.FOTO ?? 'e09:a_piedi,e09:pullman_fermi,e28:ospiti_in_auto,e15:mille,e23:dieci_pullman,e06:corteo_cinderwick,e13:corteo_rovers,e18:telefonata,e14:seduti,e34:commissione_schieramento,e26:lista_ospiti,e02:corteo_viale,e04:corteo_fonderie,e01:corteo_partito,e11:primo_fuoco,e05:sindacato,e16:magazzino_sette,e07:coro_imparato').split(','));
const GRUPPI = { folla: 'gente', raduno: 'gente', assembramento: 'gente', movimento: 'gente', arrivo: 'gente', deflusso: 'gente', fuga: 'gente', curva: 'tifo', festa: 'tifo', cerimonia: 'tifo',
  corteo: 'corteo', protesta: 'corteo', picchetto: 'corteo', presidio: 'corteo', furgone: 'veicoli', sosta: 'veicoli', traffico: 'veicoli', retata: 'veicoli', rissa: 'scontro', lite: 'scontro', faida: 'scontro', minaccia: 'scontro', biglietti: 'biglietti', incendio: 'fumo' };
const GRAVITA = ['scontro', 'fumo', 'corteo', 'tifo', 'veicoli', 'biglietti', 'gente'];
const gruppo = (m, n, c) => { if (!c.settore) return 'nessuno'; const ev = m.ondate[n - 1].eventi.filter((e) => e.settore === c.settore); return GRAVITA.find((g) => ev.some((e) => GRUPPI[e.tipo] === g)) ?? 'nessuno'; };
const coloreAtteso = (m, s) => { const cu = m.mappa.settori.find((c) => c.tipo === 'curva' && c.id === `curva_${s.id.replace(/^[a-z]+_/, '')}`); const di = s.club ?? cu?.club; return di ? club[di]?.colori?.primario ?? 'neutro' : 'neutro'; };

// 1) stati: per ogni chiamata, il primo stato in cui è la prima aperta (quella che l'interfaccia mostra)
const stati = new Map(); let partite = 0, blocchi = 0;
for (const m of missioni) {
  if (EP && !EP.includes(m.id)) continue;
  for (const [nome, st] of Object.entries(B.STRATEGIE)) for (let seme = 1; seme <= (B.DETERMINISTICHE.has(nome) ? 1 : SEMI); seme++) {
    const g = st(creaCaso(seme * 7919 + m.episodio), dich); partite++;
    // metà delle partite casuali con variabili di partenza a caso (bool, enum, int nei limiti dichiarati)
    const cv = creaCaso(seme * 104729 + m.episodio), r = () => cv.numero();
    const v = nome === 'casuale' && seme % 2 === 0 ? Object.fromEntries(dati['stato.json'].variabili.map((d) => [d.id, d.tipo === 'bool' ? r() < 0.5 : d.tipo === 'enum' ? d.valori[Math.floor(r() * d.valori.length)] : d.id === 'tensione_max' ? 0 : Math.round(d.min + r() * (d.max - d.min))])) : { ...v0 };
    let s = M.iniziaMissione(m, v, dich), passi = 0;
    try {
      while (!M.missioneFinita(m, s)) {
        if (++passi > 400) { blocchi++; break; }
        s = M.schiera(m, s, g.schiera(m, s));
        for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) {
          const k = `${m.id}:${c.id}`; if (!stati.has(k)) stati.set(k, { m, n: s.ondata, c, s: structuredClone(s) });
          s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); if (++passi > 400) throw new Error('blocco');
        }
        s = M.chiudiOndata(m, s, dich);
      }
    } catch (e) { blocchi++; console.error(`${m.id} ${nome} ${seme}: ${e.message}`); }
  }
}
const tutte = missioni.filter((m) => !EP || EP.includes(m.id)).flatMap((m) => m.ondate.flatMap((o) => (o.chiamate ?? []).map((c) => `${m.id}:${c.id}`)));
console.log(`partite ${partite}, blocchi ${blocchi}; chiamate raggiunte ${stati.size}/${tutte.length}; mai: ${tutte.filter((k) => !stati.has(k)).join(' ') || 'nessuna'}`);

// 2) interfaccia
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const errori = []; const RIS = [];
async function apri(p, x) {
  await p.evaluate((v) => { localStorage.setItem('valmora-salvataggio', v); }, JSON.stringify({ ...base, in_corso: x.s }));
  await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
  await p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === 'chiamata' && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 10000 });
  await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(250);
}
const larghezze = [[360, 760], [375, 667], [412, 915]];
for (const [w, h] of larghezze) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 160)}`));
  await p.goto(URL);
  for (const [k, x] of stati) {
    const tutto = w === 360 && !process.env.SOLO_FOTO; if (!tutto && !FOTO.has(k)) continue;
    try { await apri(p, x); } catch (e) { RIS.push({ k, w, errore: e.message.slice(0, 120) }); continue; }
    const v = await p.evaluate(() => {
      const vg = document.querySelector('.scena [data-vignetta^="chiamata-"]'); const mp = document.querySelector('.mappa');
      return { evento: vg?.dataset.evento ?? null, nome: vg?.dataset.vignetta ?? null, folla: mp?.dataset.folla ?? null, colori: mp?.dataset.colori ?? mp?.dataset.coloriCortei ?? null, gl: mp?.dataset.mappa ?? null,
        testo: document.querySelector('.scena .testo-radio, .scena [data-testo-chiamata]')?.textContent?.trim().slice(0, 90) ?? null };
    });
    const strade = Object.fromEntries(x.m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => [s.id, coloreAtteso(x.m, s)]));
    const visti = Object.fromEntries((v.colori ?? '').split(',').filter(Boolean).map((y) => y.split('=')));
    RIS.push({ k, w, n: x.n, settore: x.c.settore ?? null, atteso: gruppo(x.m, x.n, x.c), ...v, coloriOk: v.gl !== 'webgl' || Object.entries(strade).every(([id, c]) => visti[id] === c) });
    if (FOTO.has(k)) await p.screenshot({ path: `${DIR}/${w}-${x.m.id}-${x.c.id}${ROSSI.length ? '-rosso' : ''}.jpg`, type: 'jpeg', quality: 72 });
  }
  await p.close();
}
await b.close(); srv.close();
const a360 = RIS.filter((r) => r.w === 360 && !r.errore);
console.log(`aperte nell'interfaccia (360): ${a360.length}; non aperte: ${RIS.filter((r) => r.errore).length}`);
console.log(`vignetta: gruppo uguale ai dati ${a360.filter((r) => r.evento === r.atteso).length}/${a360.length}; diversi: ${a360.filter((r) => r.evento !== r.atteso).map((r) => `${r.k}(${r.evento}≠${r.atteso})`).join(' ') || 'nessuno'}`);
const perGruppo = {}; for (const r of a360) perGruppo[r.evento] = (perGruppo[r.evento] ?? 0) + 1; console.log('per gruppo', JSON.stringify(perGruppo));
console.log(`mappa webgl ${a360.filter((r) => r.gl === 'webgl').length}/${a360.length}; colori dei cortei uguali alla regola PO-102 ${a360.filter((r) => r.coloriOk).length}/${a360.length}`);
console.log(`errori di console: ${errori.length}${errori.length ? '\n  ' + [...new Set(errori)].slice(0, 10).join('\n  ') : ''}`);
for (const r of RIS.filter((r) => r.errore)) console.log(`  non aperta ${r.w} ${r.k}: ${r.errore}`);
if (OUT) writeFileSync(OUT, JSON.stringify(RIS));
