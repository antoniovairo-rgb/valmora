// C35-02 (estende C34-10): quando C17-03 nasconde un'opzione perché l'unità che impegna è finita
// (src/logica/missione.ts:149-152) e resta una sola risposta, quella risposta è una variante con `dopo` che dice perché
// manca l'altra (lo schema di e02 caldo_casa). Partite vere coi bot casuale e attento sui dati veri; la risposta che
// resterebbe senza C17-03 si ricava con il braccio __NO_C17R03. Rosso coi dati di prima: e26 carosello, e27 gol_ospiti.
// I casi che i dati non sanno esprimere (l'unità finisce solo per una combinazione di più scelte: `dopo.gia` è un «e»,
// `dopo.mai` un «nessuna») erano in APERTI: D-153 li chiude mostrando la risposta tolta disattivata, col motivo
// «nessuna squadra libera» (opzioniEsaurite, src/logica/missione.ts). Rosso __NO_C153A01: tornano muti.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, opzioniEsaurite, opzioniValide, rispondi, schiera, type InCorso } from '../src/logica/missione.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Chiamata, Dichiarazione, Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C17R03; delete g.__NO_C153A01; });
const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione);
const testi = (id: string) => d[`testi/it/${id}.json`] as Record<string, string>;

/** Senza il filtro C17-03: le opzioni che si offrirebbero se l'unità non fosse finita. */
const senzaFiltro = (c: Chiamata, s: InCorso, m: Missione) => { g.__NO_C17R03 = true; try { return opzioniValide(c, s, m); } finally { delete g.__NO_C17R03; } };

interface Caso { chiave: string; resta: { id: string; dopo?: unknown }; nascoste: string[]; mostrate: string[] }
/** Ogni chiamata vista in cui C17-03 lascia una sola risposta, nelle partite dei due bot (semi 1…N). */
function soloUna(m: Missione, N: number): Caso[] {
  const out: Caso[] = [];
  for (const [nome, st] of [['casuale', casuale], ['attenta', attenta]] as const) for (let seme = 1; seme <= N; seme++) {
    const caso = creaCaso(`c35o:${m.id}:${seme}`); const gioc = st(caso, dich); let s = iniziaMissione(m, v0, dich);
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, gioc.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
        const ok = opzioniValide(c, s, m), tutte = senzaFiltro(c, s, m);
        if (ok.length === 1 && tutte.length > 1) out.push({ chiave: `${m.id} o${s.ondata} ${c.id}`, resta: ok[0]!, nascoste: tutte.filter((o) => o !== ok[0]).map((o) => o.id), mostrate: opzioniEsaurite(c, s, m).map((o) => o.id) });
        s = rispondi(m, s, c.id, nome === 'attenta' ? gioc.scegli(m, s, c) : caso.scegli(ok).id, dich);
      }
      s = chiudiOndata(m, s, dich);
    }
  }
  return out;
}

/** I 6 casi che C35-02 lasciava aperti: ora la risposta tolta si vede disattivata (D-153). */
const EX_APERTI = ['e28 o4 corteo_capo', 'e29 o3 ospiti_spaventati', 'e29 o4 corteo_al_porto', 'e35 o4 fine_trattativa', 'e35 o4 posto_prenotato', 'e36 o4 busta'];
const N = 60;
const casi = missioni.flatMap((m) => soloUna(m, N));
/** Spiegata: variante con «dopo» oppure ogni risposta tolta è mostrata disattivata col motivo. */
const spiegato = (x: Caso) => Boolean(x.resta.dopo) || x.nascoste.every((id) => x.mostrate.includes(id));

describe('C35-02 una sola risposta rimasta: dice perché manca l\'altra', () => {
  it('la risposta rimasta è sempre spiegata: variante con «dopo» o le altre disattivate (nessun caso aperto)', () => {
    const muti = [...new Set(casi.filter((x) => !spiegato(x)).map((x) => x.chiave))];
    expect(muti).toEqual([]);
  });
  it('e26 carosello ed e27 gol_ospiti si vedono nelle partite e nominano il mediatore', () => {
    for (const [chiave, ep] of [['e26 o4 carosello', 'e26'], ['e27 o3 gol_ospiti', 'e27']] as const) {
      const visti = casi.filter((x) => x.chiave === chiave);
      expect(visti.length).toBeGreaterThan(0);
      for (const x of visti) expect(testi(ep)[`${ep}.op.${x.resta.id}`]).toMatch(/mediatore/i);
    }
  });
  it('la variante col mediatore assente non compare mai insieme all\'opzione del mediatore, e una sola delle due varianti è offerta (e26, e27: 2 bot × N semi)', () => {
    for (const [ep, cid, variante, med, base] of [['e26', 'carosello', 'blocca_carosello_senza_mediatore', 'percorso_carosello', 'blocca_carosello'], ['e27', 'gol_ospiti', 'annuncio_senza_mediatore', 'mediatore_curva', 'annuncio']] as const) {
      const m = missioni.find((x) => x.id === ep)!;
      for (const [nome, st] of [['casuale', casuale], ['attenta', attenta]] as const) for (let seme = 1; seme <= N; seme++) {
        const caso = creaCaso(`c35v:${ep}:${seme}`); const gioc = st(caso, dich); let s = iniziaMissione(m, v0, dich);
        while (!missioneFinita(m, s)) {
          s = schiera(m, s, gioc.schiera(m, s));
          for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
            const ok = opzioniValide(c, s, m).map((o) => o.id);
            if (c.id === cid) { expect(ok.includes(variante) && ok.includes(med)).toBe(false); expect(ok.filter((x) => x === variante || x === base).length).toBe(1); }
            s = rispondi(m, s, c.id, nome === 'attenta' ? gioc.scegli(m, s, c) : caso.scegli(opzioniValide(c, s, m)).id, dich);
          }
          s = chiudiOndata(m, s, dich);
        }
      }
    }
  });
  it('D-153: i 6 casi ex aperti si vedono nelle partite e la risposta tolta è mostrata disattivata', () => {
    const visti = new Set(casi.map((x) => x.chiave));
    expect(EX_APERTI.filter((k) => !visti.has(k) && k !== 'e36 o4 busta')).toEqual([]);
    for (const x of casi.filter((y) => EX_APERTI.includes(y.chiave))) expect(x.nascoste.every((id) => x.mostrate.includes(id))).toBe(true);
  });
  it('braccio rosso __NO_C153A01: i casi ex aperti tornano muti', () => {
    g.__NO_C153A01 = true;
    const rossi = missioni.filter((m) => ['e28', 'e29', 'e35'].includes(m.id)).flatMap((m) => soloUna(m, 20));
    const muti = [...new Set(rossi.filter((x) => !spiegato(x)).map((x) => x.chiave))];
    console.log(`C153A01 rosso: casi muti ${muti.join(', ')}`);
    expect(muti.length).toBeGreaterThan(0);
  });
});
