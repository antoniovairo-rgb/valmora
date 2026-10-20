// C-045 (D-203): guardiani dei rilievi C45-02, C45-03 e C45-04 (C45-01 è in tests/coerenza-d153.test.ts, guardiano C37-05).
// C45-02 rosso __NO_C4502: la guida di prima nomina le transenne, che esistono solo in e03.
// C45-03 rosso __NO_C4503: aiuti con effetti che non aiutano (e pesi che non pesano) senza la dicitura del confronto.
// C45-04 rosso __NO_C4504: il testo di prima di e36 imp_cassa ripete «musica spenta» dopo chiudi_festa.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione, opzioniValide } from '../src/logica/missione.ts';
import { STRATEGIE, attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { bilancio, type VoceScelta } from '../src/logica/bilancio.ts';
import { daTabella, type TabellaConfronti } from '../src/logica/confronto.ts';
import tabella from '../src/logica/confronti.json';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { for (const k of ['C4502', 'C4503', 'C4504']) delete g[`__NO_${k}`]; });
const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione);
const prima = JSON.parse(readFileSync('tests/dati/c45-testi-prima.json', 'utf8')) as Record<string, Record<string, Record<string, string>>>;
const testi = (f: string, rosso?: string) => ({ ...(d[`testi/it/${f}.json`] as Record<string, string>), ...(rosso && g[`__NO_${rosso.replace('-', '')}`] ? prima[rosso]![f] ?? {} : {}) });

describe('C45-02 la guida nomina solo risorse che ci sono in tutti gli episodi', () => {
  const risorse = (m: Missione) => Object.keys(m.mappa.risorse);
  const fuori = () => {
    const conta = new Map<string, number>(); for (const m of ms) for (const r of risorse(m)) conta.set(r, (conta.get(r) ?? 0) + 1);
    const t = testi('comune', 'C45-02'), guida = Object.entries(t).filter(([k]) => /^guida\.\d+(@f)?$/.test(k));
    return [...conta].filter(([, n]) => n < ms.length).flatMap(([r]) => guida.filter(([, x]) => new RegExp(r.replace(/[aeio]$/, ''), 'i').test(x)).map(([k]) => `${k}: ${r}`));
  };
  it('verde: nessuna guida nomina una risorsa che manca in qualche episodio (le transenne sono solo in e03)', () => {
    expect(ms.length).toBe(36);
    expect(fuori()).toEqual([]);
  });
  it('rosso __NO_C4502: la guida di prima nomina le transenne', () => { g.__NO_C4502 = true; expect(fuori()).toEqual(['guida.4: transenne']); });
});

describe('C45-04 un imprevisto non ripete lo stato che una risposta prima, nella stessa ondata, ha già raccontato', () => {
  // frasi di stato («musica spenta», «cancelli chiusi»…) comuni al testo dell'imprevisto e alla risposta di una chiamata che
  // lo precede: l'imprevisto arriva sempre (imprevisti.ts:60), quindi non può dire come nuovo uno stato che una risposta ha già dato
  const STATO = /^(spent|chius|ferm|finit|sospes|smontat|svuotat|acces)[aeio]$/;
  const coppie = (s: string) => { const w = s.toLowerCase().match(/\p{L}+/gu) ?? [], r = new Set<string>(); for (let i = 0; i + 1 < w.length; i++) if (w[i]!.length >= 4 && STATO.test(w[i + 1]!)) r.add(`${w[i]} ${w[i + 1]}`); return r; };
  const ripetuti = () => {
    const out: string[] = [];
    for (const m of ms) { const t = testi(m.id, 'C45-04'), x = (k?: string) => t[(k ?? '').replace(/^testi:/, '')] ?? '';
      for (const o of m.ondate) { const ch = o.chiamate ?? []; ch.forEach((c, i) => {
        if (!c.imprevisto) return; const tc = coppie(x(c.testo));
        for (const p of ch.slice(0, i)) for (const op of p.opzioni) for (const k of coppie(x(op.risposta))) if (tc.has(k)) out.push(`${m.id} ${c.id} ← ${p.id}/${op.id}: «${k}»`);
      }); } }
    return out;
  };
  it('verde: 0 ripetizioni in 36 episodi', () => expect(ripetuti()).toEqual([]));
  it('rosso __NO_C4504: e36 imp_cassa ripete «musica spenta» dopo chiudi_festa', () => { g.__NO_C4504 = true; expect(ripetuti()).toEqual(['e36 imp_cassa ← piazzale_ultimo/chiudi_festa: «musica spenta»']); });
});

describe('C45-03 un aiuto con effetti che non aiutano (o un peso che non pesa) dice che viene dal confronto (D-172)', () => {
  const PESO = { credito: 1, pressione: 1, tensione: 1.5, riserva: 1 } as const;
  const locale = (v: VoceScelta) => v.impatti.reduce((t, i) => t + PESO[i.tipo] * Math.abs(i.valore) * (i.buono ? 1 : -1), 0);
  const dalConfronto = (v: VoceScelta) => !!v.confronto && Math.sign(v.confronto.saldo) === Math.sign(v.saldo);
  /** Voci mostrate con effetti contro la lista, dal confronto, senza la dicitura; e quante hanno la dicitura. */
  function conta(semi: number) {
    let senza = 0, con = 0;
    for (const m of ms) { const conf = daTabella(tabella as TabellaConfronti, m.id)!;
      for (const [n, s] of [...Array.from({ length: semi }, (_, i) => ['casuale', i + 1] as const), ['attenta', 1] as const, ['peggiore', 1] as const]) {
        const b = bilancio(m, giocaMissione(m, v0, dich, STRATEGIE[n]!(creaCaso(`c45t:${m.id}:${n}:${s}`), dich)), 3, conf);
        for (const v of [...b.aiuti.filter((x) => locale(x) <= 0), ...b.pesi.filter((x) => locale(x) >= 0)]) if (v.impatti.length && dalConfronto(v)) { if (v.controcorrente) con++; else senza++; }
      } }
    return { senza, con };
  }
  it('i due casi del collaudo portano la dicitura (e36 +2 pressione fra gli aiuti, e05 +1 fiducia fra i pesi); rosso: no', () => {
    const e36 = ms.find((m) => m.id === 'e36')!, e05 = ms.find((m) => m.id === 'e05')!;
    // e36: casuale, seme della misura (node tools/misura-c45.mjs: 4 casi su 1000, semi 505, 664, 719, 793)
    const r36 = giocaMissione(e36, v0, dich, STRATEGIE.casuale!(creaCaso('c45:e36:casuale:505'), dich));
    const caso = creaCaso('c45e05:1'); // e05: schieramento attento, «Declina» quando c'è, il resto a caso
    const r05 = giocaMissione(e05, v0, dich, { schiera: attenta(caso, dich).schiera, scegli: (mm, st, c) => { const o = opzioniValide(c, st, mm); return (o.find((x) => x.id === 'volontari_no') ?? caso.scegli(o)).id; } });
    const voci = () => [bilancio(e36, r36, 3, daTabella(tabella as TabellaConfronti, 'e36')!).aiuti.find((v) => v.opzione === 'niente_cantiere'),
      bilancio(e05, r05, 3, daTabella(tabella as TabellaConfronti, 'e05')!).pesi.find((v) => v.opzione === 'volontari_no')];
    const [a, p] = voci();
    expect(a!.impatti.map((i) => [i.tipo, i.valore])).toEqual([['pressione', 2]]); expect(a!.controcorrente).toBe(true);
    expect(p!.impatti.map((i) => [i.tipo, i.valore])).toEqual([['credito', 1], ['pressione', 1]]); expect(p!.controcorrente).toBe(true);
    const t = d['testi/it/comune.json'] as Record<string, string>;
    expect([t['bilancio.controcorrente.aiuto'], t['bilancio.controcorrente.peso']]).toEqual(['con le altre risposte andava peggio', 'con le altre risposte andava meglio']);
    g.__NO_C4503 = true; expect(voci().map((v) => v?.controcorrente)).toEqual([undefined, undefined]);
  }, 60_000);
  it('36 episodi (casuale 30 semi + attenta + peggiore): 0 voci senza dicitura; rosso __NO_C4503: tutte senza', () => {
    const v = conta(30); console.log(`C45-03 verde: ${JSON.stringify(v)}`);
    expect(v.senza).toBe(0); expect(v.con).toBeGreaterThan(0);
    g.__NO_C4503 = true; const r = conta(30); console.log(`C45-03 rosso: ${JSON.stringify(r)}`);
    expect(r).toEqual({ senza: v.con, con: 0 });
  }, 180_000);
});
