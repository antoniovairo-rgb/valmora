// C-036 (collaudo, D-151): incoerenze fra dati e testi, provate sui dati veri. Verde coi dati corretti, rosso coi dati
// di prima (prova: dati vecchi rimessi, test rossi). Nessun codice di gioco toccato: solo data/.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { DEGENERA, giocaMissione } from '../src/logica/missione.ts';
import { casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ep = (id: string) => d[`missioni/${id}.json`] as Missione;
const t = (id: string, k?: string) => (k ? (d[`testi/it/${id}.json`] as Record<string, string>)[k.replace(/^testi:/, '')] ?? '' : '');
const EPISODI = Array.from({ length: 36 }, (_, i) => `e${String(i + 1).padStart(2, '0')}`);

describe('C36-03 verbali di fallimento: un luogo nominato degenera in almeno metà delle partite fallite', () => {
  // Frase del verbale → settore. Il settore deve essere degenerato (scoperto e a tensione ≥ DEGENERA in un'ondata) in
  // almeno il 50% delle partite fallite del bot casuale (semi 1…N, gli stessi della sonda c36-fallimenti-tutti).
  // Prima (collaudo C-036, 1000 semi): e29 piazzale 1%, e31 viale 2%, e09 tangenziale 11%, e24 municipio 14%, e26 piazzale 14%.
  const AFFERMA: Record<string, [RegExp, string][]> = {
    e02: [[/stazione/i, 'stazione']], e03: [[/quartiere/i, 'quartiere']],
    e04: [[/mercato|bancarelle/i, 'mercato'], [/piazzale/i, 'piazzale']],
    e05: [[/cancelli|tornelli/i, 'tornelli'], [/in strada/i, 'strada_larkspire']], e06: [[/viale/i, 'viale_concerto']],
    e07: [[/strada da skyfield/i, 'strada_larkspire'], [/pulmini|parcheggi/i, 'parcheggi']],
    e08: [[/curva/i, 'curva_cinderwick'], [/strada/i, 'strada_cinderwick']],
    e09: [[/coda|rampa|tangenziale/i, 'tangenziale']], e11: [[/quartiere/i, 'quartiere']],
    e12: [[/piazza del comune/i, 'piazza_comune']], e13: [[/piazza|concerto/i, 'piazza_concerto'], [/piazzale/i, 'piazzale']],
    e14: [[/tornelli/i, 'tornelli'], [/biglietteria/i, 'biglietteria']], e15: [[/viale/i, 'viale_stazione'], [/\btreni\b/i, 'stazione']],
    e17: [[/cancelli/i, 'tornelli'], [/strada di kiln/i, 'strada_cinderwick'], [/piazza/i, 'piazza_municipio']],
    e19: [[/curva/i, 'curva_cinderwick']], e21: [[/ex fonderia/i, 'ex_fonderia'], [/in piazza/i, 'piazza_fonderie']],
    e22: [[/municipio|presidio/i, 'piazza_municipio']], e23: [[/\bcode\b|casello/i, 'casello']],
    e24: [[/municipio|stessa piazza/i, 'piazza_municipio']],
    e25: [[/stazione/i, 'stazione'], [/piazza/i, 'piazza_municipio'], [/varchi/i, 'zona_rossa']],
    e26: [[/piazzale/i, 'piazzale'], [/pullman|parcheggi/i, 'parcheggi']],
    e27: [[/curva/i, 'curva_cinderwick'], [/stazione/i, 'stazione'], [/strada di kiln/i, 'strada_cinderwick']],
    e28: [[/strada/i, 'strada_cinderwick'], [/curva fuori/i, 'curva_cinderwick']],
    e29: [[/strada/i, 'strada_cinderwick'], [/piazzale/i, 'piazzale']],
    e30: [[/viale|strada/i, 'strada_cinderwick'], [/scuola|quartiere/i, 'quartiere'], [/piazzale/i, 'piazzale']],
    e31: [[/viale/i, 'viale_stazione'], [/stazione piena/i, 'stazione']],
    e32: [[/piazzale/i, 'piazzale'], [/collina/i, 'strada_larkspire']],
    e33: [[/viale/i, 'viale_stazione'], [/stazione piena/i, 'stazione']],
    e34: [[/parcheggi/i, 'parcheggi'], [/mercato/i, 'mercato']],
    e35: [[/nastro|perimetro/i, 'perimetro_banca'], [/porto|banchine/i, 'banchine'], [/stazione/i, 'stazione']],
    e36: [[/piazzale/i, 'piazzale'], [/cantiere/i, 'cantiere_stadio_nuovo'], [/collina/i, 'strada_larkspire']],
  };
  const N = 400;
  /** Quota di partite fallite in cui ogni settore degenera (come la sonda del collaudo). */
  const quote = new Map<string, Record<string, number>>();
  const quota = (id: string) => {
    if (quote.has(id)) return quote.get(id)!;
    const m = ep(id); const conta: Record<string, number> = {}; let fallite = 0;
    for (let s = 1; s <= N; s++) {
      const e = giocaMissione(m, v0, dich, casuale(creaCaso(`c36f:${id}:${s}`), dich));
      if (!e.esito.fallita) continue; fallite++;
      for (const q of new Set(e.rapporti.flatMap((x) => Object.keys(x.tensione).filter((k) => x.tensione[k]! >= DEGENERA && x.scoperto[k]! > 0)))) conta[q] = (conta[q] ?? 0) + 1;
    }
    const r = Object.fromEntries(Object.keys(conta).map((k) => [k, conta[k]! / Math.max(1, fallite)]));
    quote.set(id, r); return r;
  };
  const smentiti = (id: string, verbale: string) => (AFFERMA[id] ?? []).filter(([re]) => re.test(verbale))
    .map(([re, sett]) => [re, sett, quota(id)[sett] ?? 0] as const).filter(([, , q]) => q < 0.5).map(([re, sett, q]) => `${id} ${re}: ${sett} degenera nel ${Math.round(q * 100)}% delle fallite`);
  it('e01-e36: nessun verbale di fallimento nomina un luogo che degenera in meno di metà delle partite perse', () => {
    const fuori = EPISODI.flatMap((id) => ep(id).esiti.filter((e) => e.fallita).flatMap((e) => smentiti(id, t(id, e.verbale))));
    expect(fuori).toEqual([]);
  });
  it('la misura non è cieca: frasi del collaudo vengono segnalate', () => {
    expect(smentiti('e29', 'Strada piena fino al porto, piazzale fuori controllo.').length).toBe(2);
    expect(smentiti('e31', 'viale occupato, stazione piena fino a notte').length).toBe(2);
    expect(smentiti('e08', 'La curva ha mostrato cosa fa').length).toBe(0);
  });
});

describe('C36-04 e14: i tifosi del Waterline sono bianco e blu, come il club', () => {
  it('nessun «viola» o «oro» nei testi di e14; i colori del club sono bianco e blu', () => {
    const club = d['club/waterline_city.json'] as { colori: Record<string, string> } | undefined;
    if (club) expect(Object.values(club.colori).map((x) => x.toLowerCase())).toEqual(expect.arrayContaining(['#ffffff', '#0d47a1']));
    expect(Object.values(d['testi/it/e14.json'] as Record<string, string>).filter((x) => /viola|\boro\b/i.test(x))).toEqual([]);
  });
});

describe('C36-05 e03: la fonte vera del comitato non contraddice la notte di coppa', () => {
  it('niente «sabato» né «amichevole»', () => expect(t('e03', 'e03.info_comitato')).not.toMatch(/sabato|amichevole/i));
});

describe('C36-06 e32: la «i» dell\'ondata 1 non svela quale fonte mente', () => {
  it('non dice che le due tifoserie partono in corteo (l\'informatore, falso, dice «Kiln senza corteo»)', () => {
    expect(t('e32', 'e32.info_informatore')).toMatch(/Kiln senza corteo/);
    expect(t('e32', 'e32.ondata1.i')).not.toMatch(/due tifoserie partono in corteo|in corteo/i);
  });
});

describe('C36-07 il bollino dell\'unità impegnata sta sul settore che l\'opzione tocca', () => {
  // Il bollino scrive «unità · settore della chiamata» (src/resa/effetti-opzione.tsx:21). Se l'opzione impegna un'unità
  // e i suoi effetti non toccano quel settore, il bollino manda l'unità altrove. Accettati: scorte che partono dal
  // settore della chiamata (collaudo C-036) e il fermo di e35 (l'unità è tolta dal perimetro, lo dice il costo).
  const ACCETTATI = ['e02 ritardo/scorta_subito', 'e04 kebab/scorta_ospiti', 'e15 treno_amici/scorta15', 'e16 scatole/entra', 'e27 lettera_gemellati/consegna_comando', 'e35 posto_prenotato/ferma_uomo'];
  it('e01-e36: nessun altro caso', () => {
    const fuori = EPISODI.flatMap((id) => ep(id).ondate.flatMap((o) => (o.chiamate ?? []).filter((c) => c.settore).flatMap((c) => c.opzioni
      .filter((op) => op.effetti.some((e) => 'riserva' in e && e.valore < 0))
      .filter((op) => op.effetti.some((e) => 'pressione' in e || 'tensione' in e))
      .filter((op) => !op.effetti.some((e) => ('pressione' in e && e.pressione === c.settore) || ('tensione' in e && e.tensione === c.settore)))
      .map((op) => `${id} ${c.id}/${op.id}`))));
    expect(fuori.filter((x) => !ACCETTATI.includes(x))).toEqual([]);
  });
});
