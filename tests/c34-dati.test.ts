// C-034 (collaudo): incoerenze fra dati e testi, provate sui dati veri. Ogni blocco è verde coi dati corretti e rosso
// coi dati di prima (prova: dati vecchi rimessi, test rossi). Nessun codice di gioco toccato: solo data/.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, DEGENERA, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera, type InCorso } from '../src/logica/missione.ts';
import { casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Chiamata, Dichiarazione, Missione, Opzione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ep = (id: string) => d[`missioni/${id}.json`] as Missione;
const testi = (id: string) => d[`testi/it/${id}.json`] as Record<string, string>;
const t = (id: string, k?: string) => (k ? testi(id)[k.replace(/^testi:/, '')] ?? '' : '');

interface Vista { n: number; c: Chiamata; ops: Opzione[] }
/** Partita del giocatore casuale con alcune risposte forzate («chiamata» → «opzione»): cosa vede a schermo e come finisce. */
function gioca(id: string, forza: Record<string, string>, seme: number) {
  const m = ep(id); const caso = creaCaso(`c34:${id}:${seme}`); const g = casuale(caso, dich);
  let s: InCorso = iniziaMissione(m, v0, dich); const viste: Vista[] = [];
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      const ops = opzioniValide(c, s, m); viste.push({ n: s.ondata, c, ops });
      s = rispondi(m, s, c.id, (ops.find((o) => o.id === forza[c.id]) ?? caso.scegli(ops)).id, dich);
    }
    s = chiudiOndata(m, s, dich);
  }
  return { m, s, viste, esito: concludiMissione(m, s, dich) };
}
const aSchermo = (id: string, v: Vista[]) => v.flatMap(({ c, ops }) => [t(id, c.testo), t(id, c.commento), ...ops.flatMap((o) => [t(id, o.testo), t(id, o.costo)])]);

describe('C34-03 e35: la barca bloccata o seguita resta nel racconto', () => {
  // Dopo la scelta, nessun testo a schermo (chiamate, opzioni) né alcun verbale dell'episodio la smentisce.
  const SMENTITE: Record<string, RegExp[]> = {
    'barca_porto/blocca_barca': [/tornata senza scatoloni/i, /barca andata e tornata/i, /barca partita/i],
    'barca_porto/segui_barca': [/ancora al pontile/i],
    'posto_prenotato/ferma_uomo': [/faldoni spariti/i],
  };
  const verbali = ep('e35').esiti.map((e) => t('e35', e.verbale));
  for (const [barca, uomo] of [['blocca_barca', 'ferma_uomo'], ['blocca_barca', 'lascia_partire'], ['segui_barca', 'ferma_uomo'], ['segui_barca', 'lascia_partire']]) {
    it(`${barca} + ${uomo}: nessuna frase smentita, e in ondata 3 una chiamata sulle banchine`, () => {
      const scelte = [`barca_porto/${barca}`, `posto_prenotato/${uomo}`];
      const fuori: string[] = [];
      for (let seme = 1; seme <= 10; seme++) {
        const r = gioca('e35', { barca_porto: barca!, posto_prenotato: uomo! }, seme);
        expect(r.s.scelte.map((x) => `${x.chiamata}/${x.opzione}`)).toEqual(expect.arrayContaining(scelte));
        expect(r.viste.some((v) => v.n === 3 && v.c.settore === 'banchine')).toBe(true);
        const dopo = (k: string) => { const i = r.viste.findIndex((v) => v.c.id === k.split('/')[0]); return r.viste.slice(i + 1); };
        for (const k of scelte) for (const x of [...aSchermo('e35', dopo(k)), ...verbali]) for (const re of SMENTITE[k] ?? []) if (re.test(x)) fuori.push(`${k}: «${x}»`);
      }
      expect([...new Set(fuori)]).toEqual([]);
    });
  }
});

describe('C34-02 e21 pullman21: il testo del costo dice dove sale la pressione', () => {
  const NOMI: Record<string, RegExp> = { piazzale: /piazzale/i, quartiere: /quartiere/i };
  const SALE = /si intasa|sale|si scalda|si riempie/i;
  it('ogni settore che sale è nominato; nessun settore che scende è detto in salita', () => {
    const c = ep('e21').ondate.flatMap((o) => o.chiamate ?? []).find((x) => x.id === 'pullman21')!;
    const fuori: string[] = [];
    for (const o of c.opzioni) {
      const costo = t('e21', o.costo);
      for (const e of o.effetti) {
        const sett = 'pressione' in e ? e.pressione : 'tensione' in e ? e.tensione : undefined;
        if (!sett || !NOMI[sett]) continue;
        if (Number(e.valore) > 0 && !NOMI[sett].test(costo)) fuori.push(`${o.id}: ${sett} sale ma il costo non lo nomina`);
        if (Number(e.valore) < 0 && costo.split(/[;.]/).some((p) => NOMI[sett]!.test(p) && SALE.test(p))) fuori.push(`${o.id}: ${sett} scende ma il costo lo dice in salita`);
      }
    }
    expect(fuori).toEqual([]);
  });
});

describe('C34-06 verbali di fallimento: non raccontano un settore che non è degenerato', () => {
  // Frase del verbale → settore che dovrebbe essere degenerato (tensione ≥ DEGENERA) in OGNI partita fallita.
  const AFFERMA: Record<string, [RegExp, string][]> = {
    e13: [[/piazza oltre il limite|concerto interrotto/i, 'piazza_concerto'], [/spintoni sul piazzale/i, 'piazzale']],
    e17: [[/cancelli forzati/i, 'tornelli'], [/strada di kiln/i, 'strada_cinderwick'], [/piazza sgomberata/i, 'piazza_municipio']],
    // C35-04: e35 «dal nastro al porto»: le banchine degenerano in 88 partite fallite su 734 (collaudo C-035)
    e35: [[/nastro|perimetro/i, 'perimetro_banca'], [/corso/i, 'corso_centro'], [/cantiere/i, 'cantiere_stadio_nuovo'], [/porto|banchine/i, 'banchine'], [/stazione/i, 'stazione']],
  };
  const smentiti = (id: string, verbale: string, semi = 120) => {
    const fuori: string[] = [];
    for (const [re, sett] of AFFERMA[id]!) {
      if (!re.test(verbale)) continue;
      for (let seme = 1; seme <= semi; seme++) {
        const r = gioca(id, {}, seme);
        if (!r.esito.esito.fallita) continue;
        if (Math.max(...r.s.rapporti.map((x) => (x.picco ?? x.tensione)[sett] ?? 0)) < DEGENERA) { fuori.push(`${id} ${re}: ${sett} mai degenerato (seme ${seme})`); break; }
      }
    }
    return fuori;
  };
  for (const id of ['e13', 'e17', 'e35']) {
    const m = ep(id); const fallito = m.esiti.find((e) => e.fallita)!;
    it(`${id}: il verbale «${fallito.id}» non afferma fatti smentiti dalle partite fallite`, () => expect(smentiti(id, t(id, fallito.verbale))).toEqual([]));
  }
  it('la misura non è cieca: una frase specifica in un verbale viene smentita', () => {
    expect(smentiti('e13', 'Concerto interrotto.', 60).length).toBeGreaterThan(0);
    expect(smentiti('e17', 'Cancelli forzati.', 60).length).toBeGreaterThan(0);
    expect(smentiti('e35', 'Dal nastro al porto.', 60).length).toBeGreaterThan(0);
  });
});

describe('C34-09 e21: la «i» dell\'ondata 1 non svela quale fonte mente', () => {
  it('non afferma che stasera i giovani sono all\'ex fonderia (la fonte del comune, falsa, dice che sarà vuota)', () => {
    const falsa = ep('e21').briefing.find((b) => b.settore === 'ex_fonderia' && b.vera === false);
    expect(t('e21', falsa?.testo)).toMatch(/ex fonderia sarà vuota/);
    expect(t('e21', 'e21.ondata1.i')).not.toMatch(/sono all'ex fonderia/i);
  });
});

describe('C34-10 e02 caldo_casa: se resta una sola risposta, il testo dice perché', () => {
  it('dopo il mediatore col corteo (o2), in o3 l\'unica risposta nomina il mediatore', () => {
    // C35-06: se il mediatore è a riposo in o2, mediatore_corteo non si offre e la partita non conta (seme 5).
    let viste = 0;
    for (let seme = 1; seme <= 5; seme++) {
      const r = gioca('e02', { corteo_viale: 'mediatore_corteo' }, seme);
      if (!r.s.scelte.some((x) => x.opzione === 'mediatore_corteo')) continue;
      const v = r.viste.find((x) => x.c.id === 'caldo_casa')!; viste++;
      expect(v.ops.length).toBe(1);
      expect(t('e02', v.ops[0]!.testo)).toMatch(/mediatore/i);
    }
    expect(viste).toBeGreaterThanOrEqual(3);
  });
  it('senza il mediatore col corteo, le due risposte di sempre', () => {
    const v = gioca('e02', { corteo_viale: 'corteo_scortato' }, 1).viste.find((x) => x.c.id === 'caldo_casa')!;
    expect(v.ops.map((o) => o.id)).toEqual(['mediatore_casa', 'niente']);
  });
});

describe('C35-01 e35: un salvataggio della 0.34.0 dopo barca_ritorno non riapre barca_ormeggiata', () => {
  // Nella 0.34.0 barca_ritorno arrivava anche dopo blocca_barca: chi ha già risposto non deve leggere la chiamata opposta.
  it('barca_ormeggiata esclude chi ha già risposto a barca_ritorno', () => {
    const m = JSON.parse(readFileSync('data/missioni/e35.json', 'utf8')) as { ondate: { chiamate: { id: string; dopo?: { mai?: string[] }; opzioni: { id: string }[] }[] }[] };
    const ch = m.ondate.flatMap((o) => o.chiamate);
    const rit = ch.find((c) => c.id === 'barca_ritorno')!, orm = ch.find((c) => c.id === 'barca_ormeggiata')!;
    expect(rit.opzioni.map((o) => `barca_ritorno/${o.id}`).every((k) => orm.dopo?.mai?.includes(k))).toBe(true);
  });
});
