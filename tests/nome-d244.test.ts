// D-244 (PO-153), D-249 (PO-155): il gioco si chiama Vandel Falls – Cortina di fumo (prima Valmora, poi Varcalda). Guardiani:
// i nomi di prima non compaiono in ciò che si pubblica (dati, store, pagina, manifest, service worker, Android, stringhe del
// codice; il bundle costruito lo controlla il passo «email» della catena grafica), rossi __NO_C244N01 e __NO_C249N01 (i
// titoli di prima tornano e vengono visti); le chiavi dei salvataggi si spostano da «varcalda-…» e da «valmora-…» a
// «vandelfalls-…» senza perdite sui salvataggi veri (0.4.0, 0.38.0, 0.52.0), rossi __NO_C249S01 e __NO_C244S01.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { controllaNome } from '../tools/nome-d244.mjs';
import { carica, guidaVista } from '../src/resa/archivio.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { for (const k of ['C244N01', 'C244S01', 'C249N01', 'C249S01']) delete g[`__NO_${k}`]; });
const tutti = (dir: string): string[] => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? tutti(p) : [p]; });
const leggi = (ps: string[]) => Object.fromEntries(ps.map((p) => [p, readFileSync(p, 'utf8')]));
// nel codice contano le stringhe, non i commenti (la storia nei commenti non si riscrive)
const senzaCommenti = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

function pubblicati() {
  const f = leggi([...tutti('data').filter((p) => p.endsWith('.json')), 'store/it-IT/testi.json', 'public/manifest.webmanifest', 'public/sw.js',
    'capacitor.config.json', 'android/app/src/main/res/values/strings.xml', 'android/app/build.gradle']);
  const html = readFileSync('index.html', 'utf8');
  // rossi: il titolo della 0.54 (Valmora) o della 0.56 (Varcalda)
  f['index.html'] = g.__NO_C244N01 ? html.replace('Vandel Falls – Cortina di fumo', 'Valmora – Cortina di fumo') : g.__NO_C249N01 ? html.replace('Vandel Falls – Cortina di fumo', 'Varcalda – Cortina di fumo') : html;
  for (const p of tutti('src').filter((x) => /\.(ts|tsx)$/.test(x))) f[p] = senzaCommenti(readFileSync(p, 'utf8'));
  return f;
}

describe('D-249 nome Vandel Falls', () => {
  it('verde: i nomi di prima non compaiono in ciò che si pubblica; titolo, manifest, store e app si chiamano Vandel Falls', () => {
    expect(controllaNome(pubblicati())).toEqual([]);
    expect(readFileSync('index.html', 'utf8')).toContain('<title>Vandel Falls – Cortina di fumo</title>');
    expect(JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))).toMatchObject({ name: 'Vandel Falls – Cortina di fumo', short_name: 'Vandel Falls' });
    expect(JSON.parse(readFileSync('store/it-IT/testi.json', 'utf8')).nome).toBe('Vandel Falls – Cortina di fumo');
    expect(JSON.parse(readFileSync('capacitor.config.json', 'utf8'))).toMatchObject({ appId: 'io.github.antoniovairo.vandelfalls', appName: 'Vandel Falls' });
    expect(readFileSync('android/app/build.gradle', 'utf8')).toContain('applicationId "io.github.antoniovairo.vandelfalls"');
  });
  it('rossi __NO_C244N01 e __NO_C249N01: i titoli di prima vengono visti', () => {
    g.__NO_C244N01 = true;
    expect(controllaNome(pubblicati())).toEqual(['index.html: nome di prima «<title>Valmora – Cortina di fumo</title>» (D-244, D-249)']);
    delete g.__NO_C244N01; g.__NO_C249N01 = true;
    expect(controllaNome(pubblicati())).toEqual(['index.html: nome di prima «<title>Varcalda – Cortina di fumo</title>» (D-244, D-249)']);
  });
});

describe('D-244, D-249 chiavi dei salvataggi: «varcalda-…» e «valmora-…» → «vandelfalls-…»', () => {
  let mem: Map<string, string>;
  beforeEach(() => {
    mem = new Map();
    g.localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, String(v)); }, removeItem: (k: string) => { mem.delete(k); } };
  });
  afterEach(() => { delete g.localStorage; });
  const veri = ['v2-0.4.0-e02-in-corso.json', 'v2-0.38.0-fine-campagna.json', 'v2-0.52.0-e01-ondata2-in-corso.json'];
  for (const prefisso of ['varcalda', 'valmora']) for (const nome of veri) it(`${nome} sotto «${prefisso}-…»: si riprende senza perdite e la chiave vecchia sparisce`, () => {
    const testo = readFileSync(`tests/salvataggi-reali/${nome}`, 'utf8'), vero = JSON.parse(testo);
    mem.set(`${prefisso}-salvataggio`, testo); mem.set(`${prefisso}-salvataggio-riserva`, testo); mem.set(`${prefisso}-guida-vista`, 'si');
    const s = carica()!;
    expect([s.seme, s.genere, s.missioni_concluse, Object.keys(s.episodi)]).toEqual([vero.seme, vero.genere, vero.missioni_concluse, Object.keys(vero.episodi)]);
    expect(s.in_corso?.missione ?? null).toBe(vero.in_corso?.missione ?? null);
    expect(guidaVista()).toBe(true);
    expect([...mem.keys()].sort()).toEqual(['vandelfalls-guida-vista', 'vandelfalls-salvataggio', 'vandelfalls-salvataggio-riserva']);
    expect(mem.get('vandelfalls-salvataggio-riserva')).toBe(mem.get('vandelfalls-salvataggio')); // riserva riscritta, buona
  });
  it('con entrambe le chiavi vecchie vince «varcalda-…» (la più recente); «valmora-…» resta dov\'è', () => {
    const a = readFileSync('tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', 'utf8'), b = readFileSync('tests/salvataggi-reali/v2-0.38.0-fine-campagna.json', 'utf8');
    mem.set('varcalda-salvataggio', b); mem.set('valmora-salvataggio', a);
    expect(carica()!.missioni_concluse).toEqual(JSON.parse(b).missioni_concluse);
    expect([mem.has('varcalda-salvataggio'), mem.get('valmora-salvataggio')]).toEqual([false, a]);
  });
  it('se la chiave nuova c\'è già, le vecchie non la sovrascrivono (e restano dove sono)', () => {
    const a = readFileSync('tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', 'utf8'), b = readFileSync('tests/salvataggi-reali/v2-0.38.0-fine-campagna.json', 'utf8');
    mem.set('vandelfalls-salvataggio', b); mem.set('varcalda-salvataggio', a); mem.set('valmora-salvataggio', a);
    expect(carica()!.missioni_concluse).toEqual(JSON.parse(b).missioni_concluse);
    expect([mem.get('varcalda-salvataggio'), mem.get('valmora-salvataggio')]).toEqual([a, a]);
  });
  for (const [rosso, prefisso] of [['C249S01', 'varcalda'], ['C244S01', 'valmora']]) it(`rosso __NO_${rosso}: senza spostamento da «${prefisso}-…» la partita di prima non si vede`, () => {
    g[`__NO_${rosso}`] = true;
    mem.set(`${prefisso}-salvataggio`, readFileSync('tests/salvataggi-reali/v2-0.52.0-e01-ondata2-in-corso.json', 'utf8')); mem.set(`${prefisso}-guida-vista`, 'si');
    expect(carica()).toBeNull();
    expect(guidaVista()).toBe(false);
  });
});
