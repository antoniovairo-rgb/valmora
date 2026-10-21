// Collaudo C-043 (D-196), rilievi di S-16. Ogni guardiano ha il suo braccio rosso globalThis.__NO_C43xx.
// - C43-01 epilogo a tavole: ogni filo di EPILOGO si vede nella RESA (non solo nella logica): una tavola, o una riga sotto
//   una tavola (D-197: «pista_cattura» sotto il Fabbro). Rossi C4301: senza la tavola «carte»; C4301P: senza la riga.
// - C43-05 (D-197, opzione A): «Chiudi un occhio» in e02, e24, e33 uguale (−2 pressione, +1 tensione ai tornelli), senza
//   fiducia e non più efficace dell'alternativa controllata (stesso sollievo, con un costo). Rosso C4305: gli effetti di prima.
// - C43-03 verbale di un episodio fallito (0 stelle): il requisito parla della prima stella. Rosso C4303: «seconda».
// - C43-04 nessuna risposta dice «il comando approva/apprezza/gradisce/ringrazia» senza muovere la fiducia (D-190). Rosso C4304.
//   C44-05 (D-201): lo stesso vale per il resoconto (.r) e per «è contento»/«al comando apprezzano». Rosso C4405: i 5 di 0.44.0.
// - C43-08 citazioni interne con le virgolette alte “…”: nessun testo con «…«…»…». Rosso C4308: i 74 testi di prima.
// - C43-09 e13 sospendi13: il testo non nomina la piazza del concerto, che la risposta non tocca. Rosso C4309.
// - C43-10 e36 con fascicolo «nessuno»: la chiamata del comando e il verbale confermato leggono «carte». Rosso C4310.
// Testi di prima: tests/dati/testi-c43-prima.json (0.43.0).
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { valuta, variabiliIniziali } from '../src/logica/condizioni.ts';
import { EPILOGO } from '../src/logica/epilogo.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Condizione, Dichiarazione, Missione, Valore, Variabili } from '../src/logica/tipi.ts';
import { RIGHE, TAVOLE } from '../src/resa/tavole-finale.tsx';
import { Epilogo } from '../src/resa/schermate/Epilogo.tsx';
import { sezioniBilancio } from '../src/resa/schermate/Bilancio.tsx';

const g = globalThis as Record<string, unknown>;
const ROSSI = ['C4301', 'C4301P', 'C4305', 'C4303', 'C4304', 'C4405', 'C4308', 'C4309', 'C4310'];
afterEach(() => { for (const x of ROSSI) delete g[`__NO_${x}`]; });
const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const mis = (id: string) => d[`missioni/${id}.json`] as Missione;
const TUTTI: Record<string, string> = Object.assign({}, ...Object.entries(d).filter(([k]) => k.startsWith('testi/it/')).map(([, t]) => t));
const PRIMA = JSON.parse(readFileSync('tests/dati/testi-c43-prima.json', 'utf8')) as { testi: Record<string, string>; virgolette: Record<string, string> };
/** Il testo come lo vede il giocatore, o quello di prima col braccio rosso indicato. */
const testo = (k: string, rosso?: string) => {
  if (rosso && g[`__NO_${rosso}`]) { const x = PRIMA.testi[k] ?? PRIMA.virgolette[k]; if (x !== undefined) return x; }
  return TUTTI[k] ?? '';
};
const opzioni = (m: Missione) => m.ondate.flatMap((o) => (o.chiamate ?? []).flatMap((c) => c.opzioni.map((x) => ({ o: o.n, c, x }))));

describe('C43-01 epilogo a tavole: i fili di EPILOGO nella resa', () => {
  const html = (carte: Valore, pista: Valore = 'nessuna') => {
    const scelte = EPILOGO.map((id) => ({ id, valore: id === 'carte' ? carte : id === 'pista_cattura' ? pista : id === 'sospetti_talpa' ? 2 : id === 'rapporto_dessi' ? 'rispetto' : id === 'testimone' ? 'protetto' : id === 'busta' ? 'consegnata' : id === 'fascicolo' ? 'procura' : 'nessuna', aperto: false, pesa_su: null }));
    return renderToStaticMarkup(createElement(Epilogo, { e: { carriera: 'confermato', esito: 'confermato', scelte, stagioni: [], stelle: 0, massimo: 0 }, citta: () => {} }));
  };
  const tavole = (carte: Valore) => [...html(carte).matchAll(/data-tavola="([a-z_]+)" data-valore="([^"]*)"/g)].map((x) => `${x[1]}=${x[2]}`);
  it('ogni filo di EPILOGO ha una tavola o una riga sotto una tavola (D-165, D-197)', () => {
    const fili = new Set<string>([...TAVOLE.map(([, id]) => id), ...Object.keys(RIGHE)]);
    expect(EPILOGO.filter((id) => !fili.has(id))).toEqual([]);
    expect(RIGHE).toEqual({ pista_cattura: 'fabbro' });
  });
  it('D-197: «pista_cattura» come riga sotto la tavola del Fabbro, col testo di epilogo.json; rosso C4301P: manca', () => {
    for (const v of dich.get('pista_cattura')!.valori!) {
      const h = html('nessuna', v);
      const fabbro = h.slice(h.indexOf('data-tavola="fabbro"'), h.indexOf('data-tavola="testimone"'));
      expect(fabbro).toContain(`data-riga="pista_cattura" data-valore="${v}"`);
      expect(fabbro).toContain(testo(`epilogo.pista_cattura.${v}`).replace(/'/g, '&#x27;'));
    }
    g.__NO_C4301P = true;
    expect(html('nessuna', 'porto')).not.toContain('data-riga'); // misurato prima: nessuna riga
  });
  it('la resa disegna la tavola «carte» con la didascalia del valore della partita; rosso C4301: manca', () => {
    for (const v of dich.get('carte')!.valori!) {
      expect(tavole(v)).toContain(`carte=${v}`);
      expect(testo(`finale.carte.${v}`)).toBeTruthy();
    }
    expect(tavole('fermate')).toEqual(['fabbro=rispetto', 'testimone=protetto', 'busta=consegnata', 'talpa=2', 'fascicolo=procura', 'carte=fermate']);
    g.__NO_C4301 = true;
    expect(tavole('fermate').some((x) => x.startsWith('carte='))).toBe(false); // misurato prima: 0 tavole «carte» su 5
  });
});

describe('C43-03 verbale di un episodio fallito: la prima stella', () => {
  it('con 0 stelle «Per la prima stella», mai «seconda»; rosso C4303: «Per la seconda stella»', () => {
    const e13 = mis('e13');
    let n = 0;
    for (let s = 1; s <= 300 && n < 20; s++) {
      const r = giocaMissione(e13, v0, dich, casuale(creaCaso(`c4303:${s}`), dich));
      if (!r.esito.fallita) continue;
      n++;
      const html = () => renderToStaticMarkup(createElement('div', null, ...sezioniBilancio({ m: e13, esito: r, stelle: 0 })));
      expect(html()).toContain('Per la prima stella');
      expect(html()).not.toContain('seconda stella');
      g.__NO_C4303 = true; expect(html()).not.toContain('Per la prima stella'); delete g.__NO_C4303;
    }
    expect(n).toBe(20);
    // il caso del collaudo: e13 fallito con la tensione oltre il giallo
    g.__NO_C4303 = true;
    let visto = false;
    for (let s = 1; s <= 300 && !visto; s++) {
      const r = giocaMissione(e13, v0, dich, casuale(creaCaso(`c4303:${s}`), dich));
      if (r.esito.fallita) visto = renderToStaticMarkup(createElement('div', null, ...sezioniBilancio({ m: e13, esito: r, stelle: 0 }))).includes('Per la seconda stella');
    }
    expect(visto).toBe(true);
  });
});

describe('C43-04 «il comando approva» solo se la fiducia si muove (D-190)', () => {
  const RE = /comando (approva|apprezza|gradisce|ringrazia)/i;
  const promesse = () => Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).flatMap(([, m]) => opzioni(m as Missione)
    .filter(({ x }) => !x.effetti.some((e) => 'aggiungi' in e && e.aggiungi === 'credito') && x.costo && RE.test(testo(x.costo.replace(/^testi:/, ''), 'C4304')))
    .map(({ x }) => `${(m as Missione).id}.${x.id}`));
  it('verde: nessuna; rosso C4304: le 11 del collaudo', () => {
    expect(promesse()).toEqual([]);
    g.__NO_C4304 = true;
    expect(promesse()).toEqual(['e02.respingi', 'e02.rimuovi_str', 'e04.respingi_falsi', 'e08.accesso_no', 'e13.aspettino', 'e15.striscione_no', 'e15.due_cortei', 'e15.fuori15', 'e17.festa17', 'e19.due_squadre', 'e20.cerca_tutti']);
  });
  // C44-05: costo e resoconto, formule più larghe; braccio rosso coi testi di 0.44.0 (tests/dati/c44-prima.json)
  const RE2 = /comando (approva|apprezza|gradisce|ringrazia|è contento)|al comando (approvano|apprezzano|gradiscono|ringraziano|sono contenti)/i;
  const C44 = (JSON.parse(readFileSync('tests/dati/c44-prima.json', 'utf8')) as { testi: Record<string, string> }).testi;
  const t44 = (k: string) => { const c = k.replace(/^testi:/, ''); return g.__NO_C4405 && c in C44 ? C44[c]! : testo(c); };
  const promesse2 = () => Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).flatMap(([, m]) => opzioni(m as Missione)
    .filter(({ x }) => !x.effetti.some((e) => 'aggiungi' in e && e.aggiungi === 'credito') && [x.costo, x.risposta].some((k) => k && RE2.test(t44(k))))
    .map(({ x }) => `${(m as Missione).id}.${x.id}`));
  it('C44-05 anche nei resoconti (.r) e con «è contento»: verde nessuna; rosso C4405: le 5 del collaudo', () => {
    expect(promesse2()).toEqual([]);
    g.__NO_C4405 = true;
    expect(promesse2()).toEqual(['e01.ferma', 'e02.respingi', 'e02.rimuovi_str', 'e04.respingi_falsi', 'e27.consegna_comando']);
  });
});

describe('C43-08 citazioni interne con le virgolette alte', () => {
  const profondita = (s: string) => { let p = 0, max = 0; for (const ch of s) { if (ch === '«') max = Math.max(max, ++p); else if (ch === '»') p--; } return max; };
  const annidati = () => Object.entries(d).filter(([k]) => k.startsWith('testi/it/')).flatMap(([, t]) => Object.keys(t as object)).filter((k) => profondita(testo(k, 'C4308')) > 1);
  it('verde: nessun «…«…»…» in tutti i testi (imp_ compresi); rosso C4308: i 74 di prima, 7 con «»»»', () => {
    expect(annidati()).toEqual([]);
    g.__NO_C4308 = true;
    const rosso = annidati();
    expect(rosso.length).toBe(74);
    expect(rosso.filter((k) => testo(k, 'C4308').includes('»»')).length).toBe(7);
  });
});

describe('C43-09 e13 sospendi13: testo coerente con gli effetti', () => {
  const smentisce = () => {
    const x = opzioni(mis('e13')).find(({ x }) => x.id === 'sospendi13')!.x;
    const tocca = x.effetti.some((e) => 'pressione' in e && e.pressione === 'piazza_concerto');
    return !tocca && [x.costo!, x.risposta!].some((k) => /piazza\b|concerto/i.test(testo(k.replace(/^testi:/, ''), 'C4309')));
  };
  it('verde: non nomina la piazza del concerto; rosso C4309: «si svuotano verso la piazza»', () => {
    expect(smentisce()).toBe(false);
    g.__NO_C4309 = true; expect(smentisce()).toBe(true);
  });
});

describe('C43-10 e36: «carte» letta dalla chiamata del comando e dal verbale confermato', () => {
  const e36 = () => {
    const m = mis('e36');
    if (!g.__NO_C4310) return m;
    // i dati di prima: una sola chiamata del comando (solo fascicolo), un solo «confermato» (senza «carte»)
    const via = (c: Condizione): Condizione => ('tutte' in c ? { tutte: c.tutte.filter((x) => !('var' in x && x.var === 'carte')) } : c);
    return { ...m, ondate: m.ondate.map((o) => ({ ...o, chiamate: (o.chiamate ?? []).filter((c) => c.id !== 'conti_perse').map((c) => (c.id === 'comando_conti' ? { ...c, se: { var: 'fascicolo', uguale: 'nessuno' } as Condizione } : c)) })),
      esiti: m.esiti.filter((e) => e.id !== 'confermato_perse').map((e) => (e.id === 'confermato' ? { ...e, se: via(e.se) } : e)) };
  };
  /** Testi che il giocatore legge con fascicolo «nessuno» e «carte» = c: la chiamata del comando in o3 e il verbale confermato. */
  const letti = (c: Valore) => {
    const m = e36(), v: Variabili = { ...v0, fascicolo: 'nessuno', carte: c, credito: 8, tensione_max: 0 };
    const ch = m.ondate.flatMap((o) => o.chiamate ?? []).filter((x) => /conti/.test(x.id) && (!x.se || valuta(x.se, v)));
    const es = m.esiti.find((e) => valuta(e.se, v))!;
    return { chiamate: ch.length, testi: [...ch.map((x) => testo(x.testo.replace(/^testi:/, ''))), testo(es.verbale.replace(/^testi:/, ''))] };
  };
  const contraddizioni = () => {
    const p: string[] = [];
    for (const c of dich.get('carte')!.valori!) {
      const { chiamate, testi } = letti(c);
      if (chiamate !== 1) p.push(`${c}: ${chiamate} chiamate del comando`);
      // con i faldoni persi (e36 «faldoni spariti») nessuna «carta trovata» né «carte della rapina» (fermate/nessuna: il testo di prima regge)
      if (c === 'perse' && testi.some((x) => /carte trovate|carte della rapina/.test(x))) p.push(`${c}: «carte trovate/della rapina» coi faldoni spariti`);
    }
    return p;
  };
  it('verde: una chiamata per combinazione, testi coerenti con «carte»; rosso C4310: le contraddizioni del collaudo', () => {
    expect(contraddizioni()).toEqual([]);
    g.__NO_C4310 = true;
    expect(contraddizioni()).toEqual(['perse: «carte trovate/della rapina» coi faldoni spariti']);
  });
  it('la variante di «confermato» resta «confermato» (carriera e tono)', () => {
    for (const id of ['confermato_perse']) { expect(mis('e36').esiti.some((e) => e.id === id)).toBe(true); expect(testo(`esito.${id}`)).toBe('Confermato'); }
  });
});

describe('C43-05 «Chiudi un occhio» (D-197, opzione A)', () => {
  const CASI = [['e02', 'tornelli_falsi', 'chiudi_occhio'], ['e24', 'stessa_carta24', 'chiudi_occhio24'], ['e33', 'tornelli_falsi', 'chiudi_occhio']] as const;
  // effetti della 0.43.0, per il rosso
  const PRIMA05: Record<string, unknown[]> = { e02: [{ pressione: 'tornelli', valore: -3 }], e24: [{ aggiungi: 'credito', valore: -1 }, { pressione: 'tornelli', valore: -2 }], e33: [{ pressione: 'tornelli', valore: -2 }] };
  type Eff = { pressione?: string; tensione?: string; aggiungi?: string; riserva?: string; valore: number };
  const effetti = (ep: string, ch: string, op: string) => (g.__NO_C4305 ? PRIMA05[ep] : opzioni(mis(ep)).find(({ c, x }) => c.id === ch && x.id === op)!.x.effetti) as Eff[];
  const sollievo = (e: Eff[]) => -e.filter((x) => x.pressione === 'tornelli').reduce((a, x) => a + x.valore, 0);
  const problemi = () => {
    const p: string[] = [];
    const forme = new Set(CASI.map(([ep, ch, op]) => JSON.stringify(effetti(ep, ch, op))));
    if (forme.size !== 1) p.push(`${forme.size} forme diverse`);
    for (const [ep, ch, op] of CASI) {
      const e = effetti(ep, ch, op);
      if (e.some((x) => x.aggiungi === 'credito')) p.push(`${ep}: muove la fiducia`);
      if (!e.some((x) => x.tensione === 'tornelli' && x.valore > 0)) p.push(`${ep}: nessun costo`);
      // l'alternativa controllata: le altre risposte della stessa chiamata che tolgono pressione ai tornelli
      const altre = opzioni(mis(ep)).filter(({ c, x }) => c.id === ch && x.id !== op).map(({ x }) => sollievo(x.effetti as Eff[])).filter((s) => s > 0);
      if (sollievo(e) > Math.max(...altre)) p.push(`${ep}: più sollievo dell'alternativa controllata`);
    }
    return p;
  };
  it('verde: stessa forma, nessuna fiducia, un costo, non più efficace; rosso C4305: i problemi del collaudo', () => {
    expect(problemi()).toEqual([]);
    for (const [ep, , op] of CASI) expect(testo(`${ep}.op.${op}.c`)).toBe('I tornelli scorrono, ma la coda si scalda.');
    g.__NO_C4305 = true;
    expect(problemi()).toEqual(['3 forme diverse', 'e02: nessun costo', "e02: più sollievo dell'alternativa controllata", 'e24: muove la fiducia', 'e24: nessun costo', 'e33: nessun costo']);
  });
});
