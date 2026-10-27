// D-241 (PO-152, idea D): ogni partita diversa. Il seme di partita (InCorso.seme) sceglie la carta del mazzo d'imprevisti,
// il suo posto nella finestra e le varianti di chiamata (src/logica/partita.ts). Guardiani: stesso seme = stessa partita
// al carattere; seme 0 = la partita classica (quella di prima, per i salvataggi migrati); quota di partite diverse su
// 100 coppie di semi per episodio; ogni carta e ogni variante compare; seme nuovo a ogni episodio e ripartenza; rosso
// __NO_C241D01 (seme fisso: tutte le partite uguali, quota 0).
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { diversita } from '../tools/misura-d241.mjs';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, giocaMissione, iniziaMissione, missioneFinita, riprendiDallOndata, rispondi, schiera } from '../src/logica/missione.ts';
import { dichiarate, missioni } from '../src/resa/dati.ts';
import { chiudiEpisodio, iniziaEpisodio } from '../src/resa/episodi.ts';
import { adattaAiDati } from '../src/resa/archivio.ts';
import { chiamateDellaPartita, semeDa, semeEpisodio, semeRipartenza } from '../src/logica/partita.ts';
import type { FileImprevisti } from '../src/dati/imprevisti.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';
import { controllaSalvataggio, migra } from '../src/salvataggi/salvataggio.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C241D01; });
const d = leggiDati() as Record<string, unknown>;
const ms = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione).sort((a, b) => a.episodio - b.episodio);
const files = new Map(Object.entries(d).filter(([k]) => k.startsWith('imprevisti/')).map(([, f]) => [(f as FileImprevisti).id, f as FileImprevisti]));
const grezza = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const T = Object.assign({}, ...Object.entries(d).filter(([k]) => k.startsWith('testi/it/')).map(([, v]) => v)) as Record<string, string>;
const tx = (k?: string) => T[(k ?? '').replace(/^testi:/, '')] ?? `[[${k}]]`;

/** Quello che il giocatore legge, nell'ordine: chiamata, opzioni offerte, risposta scelta. */
function racconto(m: Missione, seme: number): string {
  const bot = casuale(creaCaso(`racconto:${m.id}`), dich), righe: string[] = [];
  giocaMissione(m, v0, dich, { schiera: bot.schiera, scegli: (mm, s, c) => {
    const o = bot.scegli(mm, s, c), x = c.opzioni.find((y) => y.id === o)!;
    righe.push(tx(c.testo), ...c.opzioni.map((y) => tx(y.testo)), tx(x.risposta));
    return o;
  } }, seme);
  return righe.join('\n');
}

/** La partita classica attesa: le chiamate della missione nel loro ordine con la sola carta classica al posto «dopo». */
function classica(m: Missione, n: number): string[] {
  const ids = (grezza(m.id).ondate[n - 1]!.chiamate ?? []).map((c) => c.id), x = files.get(m.id)?.imprevisti.find((i) => i.ondata === n);
  if (x) ids.splice(x.dopo!, 0, x.chiamata.id);
  return ids;
}

describe('seme di partita (D-241)', () => {
  it('stesso seme, stessa partita al carattere (36 episodi × 5 semi); semi diversi, testi diversi almeno una volta', () => {
    for (const m of ms) {
      const visti = new Set<string>();
      for (let i = 0; i < 5; i++) { const s = semeDa(`car:${m.id}:${i}`), a = racconto(m, s); expect(racconto(m, s), m.id).toBe(a); visti.add(a); }
      expect(visti.size, m.id).toBeGreaterThan(1);
    }
  });
  it('seme 0 = la partita classica: le chiamate di prima con la sola carta classica al suo posto (e ogni seme col rosso)', () => {
    for (const m of ms) for (const o of m.ondate) expect(chiamateDellaPartita(m, o, 0).map((c) => c.id), `${m.id} ondata ${o.n}`).toEqual(classica(m, o.n));
    g.__NO_C241D01 = true;
    for (const m of ms) for (const o of m.ondate) expect(chiamateDellaPartita(m, o, semeDa(`rosso:${m.id}`)).map((c) => c.id)).toEqual(classica(m, o.n));
  });
  it('ogni carta del mazzo e ogni variante compaiono, ogni carta in ogni posto della sua finestra (200 semi)', () => {
    const mai: string[] = [];
    for (const m of ms) for (const o of m.ondate) {
      const visti = new Set<string>();
      for (let i = 0; i < 200; i++) chiamateDellaPartita(m, o, semeDa(`mazzo:${m.id}:${i}`)).forEach((c, k) => visti.add(c.imprevisto ? `${c.id}@${k}` : c.id));
      for (const c of o.chiamate ?? []) {
        const posti = c.imprevisto ? Array.from({ length: c.finestra![1] - c.finestra![0] + 1 }, (_, j) => `${c.id}@${c.finestra![0] + j}`) : [c.id];
        mai.push(...posti.filter((p) => !visti.has(p)).map((p) => `${m.id} ondata ${o.n}: ${p}`));
      }
    }
    expect(mai).toEqual([]);
  });
  it('mazzo per ondata in tutti i 36 episodi (2-3 carte), varianti in tutte le ondate della stagione 1', () => {
    expect(ms.length).toBe(36);
    for (const m of ms) for (const o of m.ondate) {
      const carte = (o.chiamate ?? []).filter((c) => c.imprevisto).length, varianti = (o.chiamate ?? []).filter((c) => c.variante_di).length;
      expect(carte, `${m.id} ondata ${o.n}`).toBeGreaterThanOrEqual(2);
      expect(carte).toBeLessThanOrEqual(3);
      if (m.stagione === 1) expect(varianti, `${m.id} ondata ${o.n}`).toBe(1);
    }
  });
});

describe('guardiano C241D01: partite diverse su 100 coppie di semi per episodio', () => {
  // SOGLIA fissata dopo la prima misura (docs/governo/DECISIONI.md, D-241): vedi il valore e la misura lì
  const SOGLIA = 0.5;
  it(`verde: ogni episodio ≥ ${SOGLIA * 100}% di coppie con sequenza di chiamate diversa; rosso __NO_C241D01: 0 in ogni episodio`, () => {
    const verde = diversita(d, 100);
    if (process.env.MOSTRA) console.log(verde.map((x) => `${x.missione} ${x.diverse}`).join(', '));
    expect(verde.filter((x) => x.quota < SOGLIA).map((x) => `${x.missione} ${x.diverse}/100`)).toEqual([]);
    g.__NO_C241D01 = true;
    expect(diversita(d, 100).filter((x) => x.diverse > 0)).toEqual([]);
  }, 120_000);
});

describe('il seme nasce all\'episodio e a ogni ripartenza, e si salva', () => {
  const m = ms[0]!;
  it('semeEpisodio: deterministico, diverso per episodio e tentativo, mai 0', () => {
    expect(semeEpisodio(7, 'e01', 0)).toBe(semeEpisodio(7, 'e01', 0));
    const semi = new Set([0, 1, 2].flatMap((t) => ms.map((x) => semeEpisodio(7, x.id, t))));
    expect(semi.size).toBe(3 * ms.length);
    expect(semi.has(0)).toBe(false);
  });
  it('iniziaMissione salva il seme nello stato e nella partenza dell\'ondata 1; la ripartenza ne usa uno nuovo', () => {
    const s = iniziaMissione(m, v0, dich, 42);
    expect([s.seme, s.partenze![1]!.seme]).toEqual([42, 42]);
    const r = riprendiDallOndata({ ...s, partenze: { 1: s } }, 1)!;
    expect(r.seme).toBe(semeRipartenza(42, 1));
    expect(r.seme).not.toBe(42);
  });
  it('SAVE_VERSION 3: il salvataggio vero della 0.4.0 (e02 a metà) migra col seme 0 e ritrova le stesse chiamate aperte', () => {
    const vero = JSON.parse(readFileSync('tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', 'utf8'));
    const s = migra(vero), e02 = ms.find((x) => x.id === 'e02')!;
    expect(s.in_corso!.seme).toBe(0);
    const aperte = chiamateAperte(e02, s.in_corso!).map((c) => c.id);
    g.__NO_C241D01 = true; // il gioco di prima: nessun mazzo, nessuna variante
    expect(aperte).toEqual(chiamateAperte(e02, s.in_corso!).map((c) => c.id));
    delete g.__NO_C241D01;
    const b = attenta(creaCaso(1), dich); let ic = s.in_corso!; // e si gioca fino all'esito
    while (!missioneFinita(e02, ic)) {
      if (!ic.disposizione) ic = schiera(e02, ic, b.schiera(e02, ic));
      for (let c = chiamateAperte(e02, ic)[0]; c; c = chiamateAperte(e02, ic)[0]) ic = rispondi(e02, ic, c.id, b.scegli(e02, ic, c), dich);
      ic = chiudiOndata(e02, ic, dich);
    }
    expect(concludiMissione(e02, ic, dich).esito.id).toBeTruthy();
    const { seme: _, ...senza } = s.in_corso!;
    expect(controllaSalvataggio({ ...s, in_corso: senza } as unknown as Record<string, unknown>).join()).toMatch(/seme/);
  });
  it('salvataggio vero della 0.52.0 (e01 a metà ondata 2, imprevisto risposto, con «partenze»): seme 0 ovunque, stesse chiamate aperte della 0.52.0', () => {
    const s = migra(JSON.parse(readFileSync('tests/salvataggi-reali/v2-0.52.0-e01-ondata2-in-corso.json', 'utf8'))), e01 = ms[0]!;
    expect([s.in_corso!.seme, s.in_corso!.partenze![1]!.seme, s.in_corso!.partenze![2]!.seme]).toEqual([0, 0, 0]);
    // misurato sulla build 0.52.0 (commit 8d26012) con chiamateAperte sullo stesso salvataggio
    expect(chiamateAperte(e01, s.in_corso!).map((c) => c.id)).toEqual(['presidente', 'capo_curva']);
    const b = attenta(creaCaso(1), dich); let ic = s.in_corso!;
    while (!missioneFinita(e01, ic)) {
      if (!ic.disposizione) ic = schiera(e01, ic, b.schiera(e01, ic));
      for (let c = chiamateAperte(e01, ic)[0]; c; c = chiamateAperte(e01, ic)[0]) ic = rispondi(e01, ic, c.id, b.scegli(e01, ic, c), dich);
      ic = chiudiOndata(e01, ic, dich);
    }
    expect(concludiMissione(e01, ic, dich).esito.id).toBeTruthy();
    expect(riprendiDallOndata(ic, 2)!.seme).toBe(semeRipartenza(0, 2)); // «Riparti» dall'ondata 2: partita nuova da lì
  });
  it('salvataggio vero della 0.38.0 (fine campagna): migra, e un episodio rigiocato nasce col suo seme e arriva all\'esito', () => {
    const s = adattaAiDati(migra(JSON.parse(readFileSync('tests/salvataggi-reali/v2-0.38.0-fine-campagna.json', 'utf8')))).salvataggio; // come al caricamento
    for (const mm of [missioni[0]!, missioni.at(-1)!]) {
      let ic = iniziaEpisodio(s, mm); const b = attenta(creaCaso(1), dichiarate);
      expect(ic.seme).toBe(semeEpisodio(s.seme, mm.id, s.episodi[mm.id]!.tentativi));
      expect(ic.seme).not.toBe(0);
      while (!missioneFinita(mm, ic)) {
        ic = schiera(mm, ic, b.schiera(mm, ic));
        for (let c = chiamateAperte(mm, ic)[0]; c; c = chiamateAperte(mm, ic)[0]) ic = rispondi(mm, ic, c.id, b.scegli(mm, ic, c), dichiarate);
        ic = chiudiOndata(mm, ic, dichiarate);
      }
      expect(chiudiEpisodio(s, mm, concludiMissione(mm, ic, dichiarate)).salvataggio.episodi[mm.id]!.tentativi).toBe(s.episodi[mm.id]!.tentativi + 1);
    }
  });
});
