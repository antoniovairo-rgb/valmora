// C-036 (collaudo, D-151): incoerenze fra dati e testi, provate sui dati veri. Verde coi dati corretti, rosso coi dati
// di prima (prova: dati vecchi rimessi, test rossi). Nessun codice di gioco toccato: solo data/.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { DEGENERA, giocaMissione } from '../src/logica/missione.ts';
import { casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Chiamata, Dichiarazione, Missione } from '../src/logica/tipi.ts';

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
  // D-194: «collaudo» rigioca le partite del collaudo C-036 sul percorso di oggi, con gli imprevisti presenti ma risolti con
  // la risposta senza effetti e senza consumare il caso: la partita del collaudo resta quella di allora.
  const quota = (id: string, collaudo = false) => {
    const chiave = `${id}${collaudo ? ':collaudo' : ''}`;
    if (quote.has(chiave)) return quote.get(chiave)!;
    const m = ep(id); const conta: Record<string, number> = {}; let fallite = 0;
    for (let s = 1; s <= N; s++) {
      const b = casuale(creaCaso(`c36f:${id}:${s}`), dich);
      const g = collaudo ? { ...b, scegli: (mm: Missione, st: Parameters<typeof b.scegli>[1], c: Chiamata) => (c.imprevisto ? c.opzioni.find((o) => !o.effetti.length)!.id : b.scegli(mm, st, c)) } : b;
      // D-241 idea C: nel collaudo C-036 gli effetti ritardati non c'erano; si spengono anche loro (rosso C241C01), come gli imprevisti
      if (collaudo) (globalThis as Record<string, unknown>).__NO_C241C01 = true;
      let e: ReturnType<typeof giocaMissione>;
      try { e = giocaMissione(m, v0, dich, g); } finally { delete (globalThis as Record<string, unknown>).__NO_C241C01; }
      if (!e.esito.fallita) continue; fallite++;
      for (const q of new Set(e.rapporti.flatMap((x) => Object.keys(x.tensione).filter((k) => x.tensione[k]! >= DEGENERA && x.scoperto[k]! > 0)))) conta[q] = (conta[q] ?? 0) + 1;
    }
    const r = Object.fromEntries(Object.keys(conta).map((k) => [k, conta[k]! / Math.max(1, fallite)]));
    quote.set(chiave, r); return r;
  };
  const smentiti = (id: string, verbale: string, collaudo = false) => (AFFERMA[id] ?? []).filter(([re]) => re.test(verbale))
    .map(([re, sett]) => [re, sett, quota(id, collaudo)[sett] ?? 0] as const).filter(([, , q]) => q < 0.5).map(([re, sett, q]) => `${id} ${re}: ${sett} degenera nel ${Math.round(q * 100)}% delle fallite`);
  it('e01-e36: nessun verbale di fallimento nomina un luogo che degenera in meno di metà delle partite perse', () => {
    const fuori = EPISODI.flatMap((id) => ep(id).esiti.filter((e) => e.fallita).flatMap((e) => smentiti(id, t(id, e.verbale))));
    expect(fuori).toEqual([]);
  });
  it('la misura non è cieca: frasi del collaudo vengono segnalate', () => {
    expect(smentiti('e29', 'Strada piena fino al porto, piazzale fuori controllo.', true).length).toBe(2);
    expect(smentiti('e31', 'viale occupato, stazione piena fino a notte', true).length).toBe(2);
    expect(smentiti('e08', 'La curva ha mostrato cosa fa', true).length).toBe(0);
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

describe('D-152 (C36-01) «ignora, se fosse vera…»: con la fonte falsa non costa nulla', () => {
  // Opzioni il cui costo dice «se fosse vera/o» o «se la voce è vera»: se la fonte della chiamata è dichiarata falsa nel
  // briefing, l'opzione non aggiunge pressione né tensione. Fonte vera: il costo resta (e29 rassicura). Prima: e32 +2, e28 +1.
  const casi = EPISODI.flatMap((id) => ep(id).ondate.flatMap((o) => (o.chiamate ?? []).flatMap((c) => c.opzioni
    .filter((op) => /se (fosse|è|era) ver|se la voce/i.test(t(id, op.costo)))
    .map((op) => ({ id, c, op, vera: ep(id).briefing.find((b) => b.fonte === c.fonte)?.vera })))));
  it('trovati i casi della sonda C-036 (e28, e29, e32)', () => expect(casi.map((x) => `${x.id} ${x.op.id}`).sort()).toEqual(['e28 ignora_anonimo', 'e29 rassicura', 'e32 ignora_piazzale']));
  it('fonte falsa: nessuna pressione o tensione in più', () => {
    const fuori = casi.filter((x) => x.vera === false && x.op.effetti.some((e) => ('pressione' in e || 'tensione' in e) && e.valore > 0)).map((x) => `${x.id} ${x.op.id}`);
    expect(fuori).toEqual([]);
  });
  it('fonte vera: il costo di oggi resta (e29 rassicura costa fiducia)', () => {
    const r = casi.find((x) => x.op.id === 'rassicura')!;
    expect(r.vera).not.toBe(false);
    expect(r.op.effetti).toEqual(expect.arrayContaining([{ aggiungi: 'credito', valore: -1 }]));
  });
});

describe('C36 (messaggio integrale) e03: «lo stadio dei cartelloni» si capisce', () => {
  it('nomina lo stadio nuovo dei cartelloni', () => expect(t('e03', 'e03.ch.cartelloni')).toMatch(/stadio nuovo dei cartelloni/));
});

describe('C37-04 (classe C36-04) «viola» solo dove gioca un club viola', () => {
  // Club con un colore viola nei dati: pinegrove_rangers (#6a1b9a), railhead_county (#b39ddb / #311b92). Prima: e06 (Quillhaven, blu e rosso).
  const VIOLA = ['pinegrove_rangers', 'railhead_county'];
  it('e01-e36', () => {
    const fuori = EPISODI.filter((id) => Object.values(d[`testi/it/${id}.json`] as Record<string, string>).some((x) => /viola/i.test(x))
      && !ep(id).mappa.settori.some((s) => VIOLA.includes((s as { club?: string }).club ?? '')));
    expect(fuori).toEqual([]);
  });
});

describe('C37-07 (classe C36-03) e33: il verbale «a fatica» non elenca settori', () => {
  // Il verbale «a fatica» si legge anche dopo una partita in cui la stazione non è mai stata scoperta (collaudo C-037).
  // Misura (bot casuale, 1000 semi): stazione scoperta in 281 partite «a fatica» su 312; il criterio del 50% di C36-03
  // non lo vede, perciò qui il controllo è sul testo: nessun settore della mappa nominato.
  it('nessun viale, stazione, tornelli, curva', () => expect(t('e33', 'e33.verbale_a_fatica')).not.toMatch(/viale|stazione|tornelli|curva/i));
});

describe('C37-09 e30: la fiaccolata riparte dal municipio (D-141)', () => {
  it('niente «di nuovo dal piazzale»', () => expect(t('e30', 'e30.op.fiaccolata_libera.r')).not.toMatch(/dal piazzale/i));
});
