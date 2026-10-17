// D-153 (C36-02): scansione dei 36 episodi; le chiamate e le opzioni che raccontavano il contrario di una scelta già fatta
// sono escluse con «dopo» (REGISTRO) o hanno un testo valido in tutti i rami (TESTI). Partite vere coi bot casuale e
// attento su tutti gli episodi: dopo la scelta, la chiamata o l'opzione che la smentisce non si offre mai.
// Rosso __NO_C153D01: il test toglie dai dati i «dopo» di D-153 (i dati di prima) e le contraddizioni tornano.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../src/logica/missione.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C153D01; });
const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione);
const testi = (ep: string) => d[`testi/it/${ep}.json`] as Record<string, string>;

/** [episodio, chiamata o «chiamata/opzione» colpita, «mai» o «gia», scelte]: le condizioni messe da D-153. */
const REGISTRO: [string, string, 'mai' | 'gia', string[]][] = [
  ['e11', 'non_centro', 'mai', ['per_la_squadra/chiudi_fonderie']],
  ['e13', 'coda_auto/senso_unico', 'mai', ['viale_pieno/chiudi_strada']],
  ['e18', 'via_fonderie', 'mai', ['telefonata/al_comando18']],
  ['e18', 'cappucci/tribuna_stampa', 'mai', ['telefonata/al_comando18']],
  ['e19', 'vuoto/rientra', 'mai', ['piano/rimanda']],
  ['e23', 'in_tondo', 'mai', ['dieci_pullman/parcheggio_ospiti']],
  ['e27', 'abbraccio', 'mai', ['gemellati_escono/uscita_scortata']],
  ['e32', 'incrocio', 'mai', ['festa_larkspire/uscita_collina']],
  ['e33', 'parcheggio_vuoto', 'gia', ['ordini_segnati/ordini_veri']],
  ['e34', 'ultimo_coro', 'mai', ['mercato_fine/chiudi_piazzale']],
  ['e36', 'piazzale_maxi', 'mai', ['festa_vietata/smonta_palco']],
];
/** [chiave di testo, frase di prima che smentiva un ramo]: il testo nuovo vale in tutti i rami. */
const TESTI: [string, string][] = [
  ['e09.ch.furgone_sparito', 'carro attrezzi in manovra'], // dopo due_furgoni/verifica_foto il furgone spariva due volte
  ['e33.ch.nome_talpa', 'Targa, ordine finto'], // con ordini_puliti non c'è né targa né ordine finto
  ['e35.op.presidia_stazione.r', 'resta vuoto'], // il posto prenotato «vuoto» all'una, l'uomo lo cerca alle cinque
  ['e24.op.registra.r', 'accanto alla busta'], // dopo consegna_chiusa la busta non c'è più
  ['e24.op.mettilo_atti24.r', 'sulla busta'],
  // e15 ed e28 con un testo valido in tutti i rami invece che con «dopo»: togliere la chiamata abbassava le fallite del
  // casuale (e15 59,3 → 55,7%, e28 62,7 → 55,5%), contro D-108/D-154; il testo lascia gli effetti com'erano.
  ['e15.ch.fondo_viale', 'aspetta il corteo'], // con le navette (accompagnarli/navette15) non c'è nessun corteo
  ['e15.op.niente_rovers.r', 'Il corteo arriva'],
  ['e28.ch.talpa_sospetto', 'li state guardando'], // dopo aspetta_testimone o pista_fonderie il porto è senza occhi
];

/** I dati di prima: senza i «dopo» di D-153 (braccio rosso). */
function datiPrima(m: Missione): Missione {
  const x = structuredClone(m);
  for (const [, colpita] of REGISTRO.filter((r) => r[0] === m.id)) {
    const [ch, op] = colpita.split('/');
    for (const o of x.ondate) for (const c of o.chiamate ?? []) if (c.id === ch) { if (op) delete c.opzioni.find((y) => y.id === op)!.dopo; else delete c.dopo; }
  }
  return x;
}

/** Partite dei due bot su tutti gli episodi del registro: quante volte la chiamata/opzione colpita si offre contro le scelte fatte. */
function contraddizioni(N: number) {
  let viste = 0, scelte = 0; const dove = new Set<string>();
  for (const ep of [...new Set(REGISTRO.map((r) => r[0]))]) {
    const m0 = d[`missioni/${ep}.json`] as Missione; const m = g.__NO_C153D01 ? datiPrima(m0) : m0;
    for (const [nome, st] of [['casuale', casuale], ['attenta', attenta]] as const) for (let seme = 1; seme <= N; seme++) {
      const caso = creaCaso(`d153:${ep}:${nome}:${seme}`); const gioc = st(caso, dich); let s = iniziaMissione(m, v0, dich);
      while (!missioneFinita(m, s)) {
        s = schiera(m, s, gioc.schiera(m, s));
        for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
          const fatte = new Set(s.scelte.map((y) => `${y.chiamata}/${y.opzione}`)); const ops = opzioniValide(c, s, m).map((o) => o.id);
          for (const [e, colpita, tipo, chiavi] of REGISTRO) {
            if (e !== ep) continue;
            const [ch, op] = colpita.split('/');
            if (c.id !== ch || (op && !ops.includes(op))) continue;
            const smentita = tipo === 'mai' ? chiavi.some((k) => fatte.has(k)) : !chiavi.every((k) => fatte.has(k));
            if (smentita) { viste++; dove.add(`${ep} ${colpita}`); }
          }
          const id = nome === 'attenta' ? gioc.scegli(m, s, c) : caso.scegli(opzioniValide(c, s, m)).id;
          if (REGISTRO.some(([e, , , k]) => e === ep && k.includes(`${c.id}/${id}`))) scelte++;
          s = rispondi(m, s, c.id, id, dich);
        }
        s = chiudiOndata(m, s, dich);
      }
    }
  }
  return { viste, scelte, dove: [...dove] };
}

describe('D-153 le chiamate non smentiscono le scelte già fatte (tutti i 36 episodi)', () => {
  it('ogni voce del registro punta a dati che esistono e porta il suo «dopo»', () => {
    const rotti: string[] = [];
    for (const [ep, colpita, tipo, chiavi] of REGISTRO) {
      const m = d[`missioni/${ep}.json`] as Missione; const [ch, op] = colpita.split('/');
      const c = m.ondate.flatMap((o) => o.chiamate ?? []).find((y) => y.id === ch);
      const x = op ? c?.opzioni.find((y) => y.id === op)?.dopo : c?.dopo;
      if (!x || chiavi.some((k) => !(x[tipo] ?? []).includes(k))) rotti.push(`${ep} ${colpita}`);
    }
    expect(rotti).toEqual([]);
  });
  it('partite vere (2 bot × 40 semi): le scelte del registro si fanno e la chiamata che le smentisce non arriva mai', () => {
    const x = contraddizioni(40); console.log(`D-153 verde: scelte del registro fatte ${x.scelte}, smentite ${x.viste}`);
    expect(x.scelte).toBeGreaterThan(200); expect(x.viste).toBe(0);
  });
  it('braccio rosso __NO_C153D01 (dati di prima): le smentite tornano in quasi tutte le voci', () => {
    g.__NO_C153D01 = true; const x = contraddizioni(15);
    console.log(`D-153 rosso: smentite ${x.viste} in ${x.dove.length}/${REGISTRO.length} voci`);
    expect(x.viste).toBeGreaterThan(50); expect(x.dove.length).toBeGreaterThanOrEqual(REGISTRO.length - 2);
  });
  it('i testi riscritti non contengono più la frase che smentiva un ramo (rosso: i testi di prima la contengono)', () => {
    const fuori = TESTI.filter(([k, frase]) => testi(k.split('.')[0]!)[k]!.includes(frase));
    expect(fuori).toEqual([]);
    for (const [k] of TESTI) expect(testi(k.split('.')[0]!)[k]).toBeTruthy();
  });
  it('tutti i 36 episodi giocati dai bot senza errori dopo le nuove condizioni (nessuna ondata senza uscita)', () => {
    expect(missioni.length).toBe(36);
    for (const m of missioni) for (let seme = 1; seme <= 5; seme++) {
      const caso = creaCaso(`d153t:${m.id}:${seme}`); const gioc = casuale(caso, dich); let s = iniziaMissione(m, v0, dich);
      while (!missioneFinita(m, s)) {
        s = schiera(m, s, gioc.schiera(m, s));
        for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) { expect(opzioniValide(c, s, m).length).toBeGreaterThan(0); s = rispondi(m, s, c.id, caso.scegli(opzioniValide(c, s, m)).id, dich); }
        s = chiudiOndata(m, s, dich);
      }
    }
  });
});
