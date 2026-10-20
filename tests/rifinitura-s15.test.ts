// D-189 (rifinitura e25–e36, S-15): guardiani dei casi nuovi.
// - e33: il nome della talpa (chiamate ed esiti) solo con una prova: la trappola (ordini segnati) o la busta tenuta;
//   senza prova resta un sospetto. Rosso __NO_S15T01: gli esiti senza i rami «sospetto» (i dati di prima).
// - e35 → e36 → epilogo: la variabile «carte» la imposta e35, la legge e36 (fiducia) e la mostra l'epilogo; i salvataggi
//   reali di prima la ricevono al suo valore iniziale (C14-03). Rosso __NO_C14V01: senza completamento manca.
// - e36: i fili di e31–e35 (fascicolo, carte) pesano sulla fiducia della carriera; la busta si rivela solo nei verbali.
//   Rosso __NO_S15C01: le chiamate dei fili tolte, la fiducia non dipende più dai fili.
// - Patti gratis (regola 2): Fabbro in e29, steward della commissione in e34 costano fiducia.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { completaPartita, type Partita } from '../src/logica/aggiornamento.ts';
import { epilogo } from '../src/logica/epilogo.ts';
import { giocaMissione, opzioniValide } from '../src/logica/missione.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { migra } from '../src/salvataggi/salvataggio.ts';
import type { Dichiarazione, Missione, Variabili } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_S15T01; delete g.__NO_S15C01; delete g.__NO_C14V01; });
const d = leggiDati() as Record<string, unknown>;
const dichiarate = (d['stato.json'] as { variabili: Dichiarazione[] }).variabili;
const dich = new Map(dichiarate.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const mis = (id: string) => d[`missioni/${id}.json`] as Missione;
const testi = (id: string) => d[`testi/it/${id}.json`] as Record<string, string>;
const chiamate = (m: Missione) => m.ondate.flatMap((o) => o.chiamate ?? []);
const PULITI = 'ordini_segnati/ordini_puliti';

/** e33 come prima di D-189: esiti senza i rami «sospetto». */
const e33 = () => { const m = structuredClone(mis('e33')); if (g.__NO_S15T01) m.esiti = m.esiti.filter((e) => !e.id.endsWith('_sospetto')); return m; };

/** Partite del casuale da ogni valore della busta: esiti e chiamate che nominano la talpa senza una prova. */
function talpaSenzaProva(N: number) {
  const m = e33(); const fuori: string[] = []; let senza = 0, con = 0;
  for (const busta of ['nessuna', 'consegnata', 'tenuta']) for (let seme = 1; seme <= N; seme++) {
    const caso = creaCaso(`s15:e33:${busta}:${seme}`); const gioc = casuale(caso, dich); const viste: string[] = [];
    const r = giocaMissione(m, { ...v0, busta }, dich, { schiera: gioc.schiera, scegli: (mm, s, c) => { viste.push(c.id); return caso.scegli(opzioniValide(c, s, mm)).id; } });
    const prova = !r.scelte.some((x) => `${x.chiamata}/${x.opzione}` === PULITI) || busta === 'tenuta';
    if (prova) con++; else senza++;
    if (!prova && (!r.esito.id.endsWith('_sospetto') || viste.some((c) => c.startsWith('nome_') || c.startsWith('talpa_scappa')))) fuori.push(`${busta}/${seme}: ${r.esito.id}`);
    if (prova && r.esito.id.endsWith('_sospetto')) fuori.push(`${busta}/${seme}: ${r.esito.id} con la prova`);
  }
  return { fuori, senza, con };
}

describe('D-189 e33: il nome della talpa solo con una prova', () => {
  it('verde: senza trappola né busta tenuta resta un sospetto (chiamate ed esiti); con la prova arriva il nome', () => {
    const x = talpaSenzaProva(60); console.log(`S-15 e33 verde: senza prova ${x.senza}, con prova ${x.con}, smentite ${x.fuori.length}`);
    expect(x.senza).toBeGreaterThan(20); expect(x.con).toBeGreaterThan(20); expect(x.fuori).toEqual([]);
  });
  it('rosso __NO_S15T01 (esiti di prima): il verbale dice «smascherato» anche senza prova', () => {
    g.__NO_S15T01 = true; const x = talpaSenzaProva(30); console.log(`S-15 e33 rosso: smentite ${x.fuori.length}`);
    expect(x.fuori.length).toBeGreaterThan(10);
  });
  it('i verbali «sospetto» non dicono che Lavezzari è smascherato', () => {
    const t = testi('e33');
    for (const k of ['verbale_contenuto_sospetto', 'verbale_a_fatica_sospetto', 'verbale_degenerato_sospetto']) expect(t[`e33.${k}`]).not.toMatch(/smascherat|era la talpa/);
  });
});

describe('D-189 e35 → e36 → epilogo: la variabile «carte»', () => {
  it('e35 la imposta con le due risposte all\'uomo con la valigia, e36 la legge', () => {
    const c = chiamate(mis('e35')).find((x) => x.id === 'posto_prenotato')!;
    expect(c.opzioni.map((o) => o.effetti.find((e) => 'imposta' in e && e.imposta === 'carte'))).toEqual([{ imposta: 'carte', valore: 'fermate' }, { imposta: 'carte', valore: 'perse' }]);
    expect(JSON.stringify(mis('e36'))).toContain('"var":"carte"');
  });
  it('l\'epilogo mostra «carte», con un testo per ogni valore', () => {
    const e = epilogo(Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione), {}, { ...v0, carte: 'fermate' }, dichiarate);
    expect(e.scelte.find((f) => f.id === 'carte')?.valore).toBe('fermate');
    for (const v of dich.get('carte')!.valori!) expect((d['testi/it/epilogo.json'] as Record<string, string>)[`epilogo.carte.${v}`]).toBeTruthy();
  });
  it('salvataggi reali di prima: dopo la migrazione e il completamento hanno «carte» = «nessuna»; rosso __NO_C14V01: manca', () => {
    for (const n of ['v2-0.38.0-fine-campagna.json', 'v2-0.4.0-e02-in-corso.json']) {
      const s = migra(JSON.parse(readFileSync(`tests/salvataggi-reali/${n}`, 'utf8'))) as unknown as Partita;
      expect(s.variabili.carte, n).toBeUndefined();
      const p = completaPartita(s, dichiarate);
      expect(p.variabili.carte, n).toBe('nessuna');
      for (const x of Object.values(p.episodi)) expect(x.variabili_prima.carte, n).toBe('nessuna');
      g.__NO_C14V01 = true; expect(completaPartita(s, dichiarate).variabili.carte, n).toBeUndefined(); delete g.__NO_C14V01;
    }
  });
});

/** Fiducia a fine e36 (prima dell'esito) giocata dall'attenta con gli stessi semi, per una combinazione di fili. */
function fiduciaE36(fili: Variabili) {
  const m = structuredClone(mis('e36'));
  if (g.__NO_S15C01) for (const o of m.ondate) o.chiamate = (o.chiamate ?? []).filter((c) => !['conto_procura', 'conto_stampa', 'faldoni_fermati', 'faldoni_persi'].includes(c.id));
  return giocaMissione(m, { ...v0, credito: 5, ...fili }, dich, attenta(creaCaso(1), dich)).variabili.credito as number;
}

describe('D-189 e36: la carriera pesa i fili di e31–e35', () => {
  it('verde: fascicolo e carte spostano la fiducia della carriera (procura + fermate contro stampa + perse: 4 punti)', () => {
    const buoni = fiduciaE36({ fascicolo: 'procura', carte: 'fermate' }), cattivi = fiduciaE36({ fascicolo: 'stampa', carte: 'perse' });
    const neutri = fiduciaE36({ fascicolo: 'comando', carte: 'nessuna' });
    console.log(`S-15 e36 fiducia: procura+fermate ${buoni}, comando+nessuna ${neutri}, stampa+perse ${cattivi}`);
    expect(buoni - neutri).toBe(2); expect(neutri - cattivi).toBe(2);
  });
  it('rosso __NO_S15C01 (senza le chiamate dei fili): la fiducia non dipende più dai fili', () => {
    g.__NO_S15C01 = true;
    expect(fiduciaE36({ fascicolo: 'procura', carte: 'fermate' })).toBe(fiduciaE36({ fascicolo: 'stampa', carte: 'perse' }));
  });
  it('la busta: la risposta di «aprila adesso» non dice il contenuto, ogni verbale lo svela', () => {
    const t = testi('e36'); const m = mis('e36');
    expect(t['e36.op.apri_ora.r']).not.toContain('Non dura');
    const senza = m.esiti.filter((e) => !t[e.verbale.replace('testi:', '')]!.includes('«Non dura»')).map((e) => e.id);
    expect(m.esiti).toHaveLength(14); expect(senza).toEqual([]); // C43-10: + confermato_perse
    expect(t['e36.verbale_degenerato']).not.toContain('resta chiusa');
    for (const e of m.esiti.filter((x) => x.id.startsWith('sostituito'))) expect(t[e.verbale.replace('testi:', '')]).not.toContain('non la scommessa');
  });
});

describe('D-189 regola 2: i patti e i favori costano fiducia', () => {
  const costa = (ep: string, ch: string, op: string) => chiamate(mis(ep)).find((c) => c.id === ch)!.opzioni.find((o) => o.id === op)!.effetti
    .some((e) => 'aggiungi' in e && e.aggiungi === 'credito' && e.valore < 0);
  it('e29 parola del Fabbro, e34 steward della commissione', () => {
    expect(costa('e29', 'corteo_al_porto', 'parola_fabbro')).toBe(true);
    expect(costa('e34', 'fiducia_comando', 'accetta_steward')).toBe(true);
  });
});
