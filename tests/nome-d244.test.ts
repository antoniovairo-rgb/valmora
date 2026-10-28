// D-244 (PO-153): il gioco si chiama Varcalda – Cortina di fumo. Guardiani: il nome vecchio non compare in ciò che si
// pubblica (dati, store, pagina, manifest, service worker, Android, stringhe del codice; il bundle costruito lo controlla il
// passo «email» della catena grafica), rosso __NO_C244N01 (il titolo di prima torna e viene visto); le chiavi dei salvataggi
// si spostano da «valmora-…» a «varcalda-…» senza perdite sui salvataggi veri (0.4.0, 0.38.0, 0.52.0), rosso __NO_C244S01.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { controllaNome } from '../tools/nome-d244.mjs';
import { carica, guidaVista } from '../src/resa/archivio.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C244N01; delete g.__NO_C244S01; });
const tutti = (dir: string): string[] => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? tutti(p) : [p]; });
const leggi = (ps: string[]) => Object.fromEntries(ps.map((p) => [p, readFileSync(p, 'utf8')]));
// nel codice contano le stringhe, non i commenti (la storia nei commenti non si riscrive)
const senzaCommenti = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

function pubblicati() {
  const f = leggi([...tutti('data').filter((p) => p.endsWith('.json')), 'store/it-IT/testi.json', 'public/manifest.webmanifest', 'public/sw.js',
    'capacitor.config.json', 'android/app/src/main/res/values/strings.xml', 'android/app/build.gradle']);
  const html = readFileSync('index.html', 'utf8');
  f['index.html'] = g.__NO_C244N01 ? html.replace('Varcalda – Cortina di fumo', 'Valmora – Cortina di fumo') : html; // rosso: il titolo di prima
  for (const p of tutti('src').filter((x) => /\.(ts|tsx)$/.test(x))) f[p] = senzaCommenti(readFileSync(p, 'utf8'));
  return f;
}

describe('D-244 nome Varcalda', () => {
  it('verde: il nome vecchio non compare in ciò che si pubblica; titolo, manifest, store e app si chiamano Varcalda', () => {
    expect(controllaNome(pubblicati())).toEqual([]);
    expect(readFileSync('index.html', 'utf8')).toContain('<title>Varcalda – Cortina di fumo</title>');
    expect(JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))).toMatchObject({ name: 'Varcalda – Cortina di fumo', short_name: 'Varcalda' });
    expect(JSON.parse(readFileSync('store/it-IT/testi.json', 'utf8')).nome).toBe('Varcalda – Cortina di fumo');
    expect(JSON.parse(readFileSync('capacitor.config.json', 'utf8'))).toMatchObject({ appId: 'io.github.antoniovairo.varcalda', appName: 'Varcalda' });
    expect(readFileSync('android/app/build.gradle', 'utf8')).toContain('applicationId "io.github.antoniovairo.varcalda"');
  });
  it('rosso __NO_C244N01: il titolo di prima viene visto', () => {
    g.__NO_C244N01 = true;
    expect(controllaNome(pubblicati())).toEqual(['index.html: nome vecchio «<title>Valmora – Cortina di fumo</title>» (D-244)']);
  });
});

describe('D-244 chiavi dei salvataggi: «valmora-…» → «varcalda-…»', () => {
  let mem: Map<string, string>;
  beforeEach(() => {
    mem = new Map();
    g.localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, String(v)); }, removeItem: (k: string) => { mem.delete(k); } };
  });
  afterEach(() => { delete g.localStorage; });
  const veri = ['v2-0.4.0-e02-in-corso.json', 'v2-0.38.0-fine-campagna.json', 'v2-0.52.0-e01-ondata2-in-corso.json'];
  for (const nome of veri) it(`${nome}: sotto la chiave vecchia si riprende senza perdite e la chiave vecchia sparisce`, () => {
    const testo = readFileSync(`tests/salvataggi-reali/${nome}`, 'utf8'), vero = JSON.parse(testo);
    mem.set('valmora-salvataggio', testo); mem.set('valmora-salvataggio-riserva', testo); mem.set('valmora-guida-vista', 'si');
    const s = carica()!;
    expect([s.seme, s.genere, s.missioni_concluse, Object.keys(s.episodi)]).toEqual([vero.seme, vero.genere, vero.missioni_concluse, Object.keys(vero.episodi)]);
    expect(s.in_corso?.missione ?? null).toBe(vero.in_corso?.missione ?? null);
    expect(guidaVista()).toBe(true);
    expect([...mem.keys()].sort()).toEqual(['varcalda-guida-vista', 'varcalda-salvataggio', 'varcalda-salvataggio-riserva']);
    expect(mem.get('varcalda-salvataggio-riserva')).toBe(mem.get('varcalda-salvataggio')); // riserva riscritta, buona
  });
  it('se la chiave nuova c\'è già, la vecchia non la sovrascrive (e resta dov\'è)', () => {
    const a = readFileSync('tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', 'utf8'), b = readFileSync('tests/salvataggi-reali/v2-0.38.0-fine-campagna.json', 'utf8');
    mem.set('varcalda-salvataggio', b); mem.set('valmora-salvataggio', a);
    expect(carica()!.missioni_concluse).toEqual(JSON.parse(b).missioni_concluse);
    expect(mem.get('valmora-salvataggio')).toBe(a);
  });
  it('rosso __NO_C244S01: senza spostamento la partita di prima non si vede', () => {
    g.__NO_C244S01 = true;
    mem.set('valmora-salvataggio', readFileSync('tests/salvataggi-reali/v2-0.52.0-e01-ondata2-in-corso.json', 'utf8'));
    expect(carica()).toBeNull();
    expect(guidaVista()).toBe(false);
  });
});
