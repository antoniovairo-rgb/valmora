// C41-04 (D-182, collaudo C-041): testi di risposta che affermavano fatti di schieramento smentiti dallo schieramento
// del giocatore (unità tolte da un settore dove non ce n'erano, settori «presidiati» o «scoperti» comunque fossero,
// «squadre e steward» senza costo in unità). Ora sono neutri sullo schieramento; gli effetti non cambiano.
// Rosso __NO_C41T01: il test rimette i testi di prima e la misura li segnala (5 casi del collaudo).
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C41T01; delete g.__NO_C42T01; });
const d = leggiDati() as Record<string, unknown>;

/** I 5 casi del collaudo: chiave del testo → affermazione sullo schieramento che non deve comparire. */
const CASI: [string, string, RegExp][] = [
  ['e33', 'e33.op.nega_auto.c', /tolta alla stazione/], ['e33', 'e33.op.nega_auto.r', /lascia la stazione/],
  ['e33', 'e33.op.festa_viale', /scortata/], ['e33', 'e33.op.festa_viale.r', /la tiene breve/],
  ['e25', 'e25.op.firme_domani.c', /restano presidiati/],
  ['e36', 'e36.op.apri_ora.c', /resta scoperto/],
  ['e02', 'e02.op.accoglienza', /con squadre e steward/],
];
/** Testi di prima (dati della 0.41.0), per il braccio rosso. */
const PRIMA: Record<string, string> = {
  'e33.op.nega_auto.c': 'Guadagni fiducia col comando; ma ti costa una squadra, tolta alla stazione, che sale.',
  'e33.op.nega_auto.r': 'Una squadra lascia la stazione e va al retro. Lavezzari si siede in corridoio, e guarda il muro.',
  'e33.op.festa_viale': 'Festa breve sul viale, scortata',
  'e33.op.festa_viale.r': 'Festa sul viale. Una squadra la tiene breve.',
  'e25.op.firme_domani.c': 'I varchi restano presidiati; la Struttura segna il ritardo: costa fiducia.',
  'e36.op.apri_ora.c': 'Un minuto per voi due; il cantiere, intanto, resta scoperto e sale.',
  'e02.op.accoglienza': 'Accoglienza in banchina con squadre e steward',
};
const testo = (ep: string, k: string) => (g.__NO_C41T01 ? PRIMA[k] : undefined) ?? (d[`testi/it/${ep}.json`] as Record<string, string>)[k] ?? '';
const smentiti = () => [...new Set(CASI.filter(([ep, k, re]) => re.test(testo(ep, k))).map(([, k]) => k.replace(/\.(c|r)$/, '')))];

/** C42-02 (D-185): testi di prima (dati della 0.42.0) dei residui, per il braccio rosso C42T01. */
const PRIMA42: Record<string, string> = {
  "e25.op.scorta_ritorno.r": "Il giro lungo allunga di mezz'ora e toglie ogni ragione di litigare. Alla stazione, intanto, nessuno.",
  "e01.op.accetta.c": "Piazzale più calmo; la curva Kiln resta scoperta.",
  "e02.op.fidati.c": "Il viale resta scoperto e si carica.",
  "e08.op.gruppo_si": "Arrivo in gruppo, scortato",
  "e09.op.squadre_coda.c": "La lite finisce, ma il piazzale resta scoperto e si scalda.",
  "e11.op.pattuglia_fissa.r": "Una pattuglia lascia la stazione e parcheggia sotto le finestre del comitato. Le luci si spengono.",
  "e11.op.ferma11.c": "Il comando ti dà fiducia, ma la strada resta scoperta e si scalda.",
  "e11.op.squadre_ultimo.c": "La strada si calma, ma il quartiere resta scoperto.",
  "e12.op.rinforzi12.c": "Il piazzale si calma, ma la strada da Kiln resta scoperta.",
  "e14.op.fuori_subito": "Fuori subito, scortati",
  "e16.op.segui_furgone.c": "Il comando apprezza; la strada da Kiln resta scoperta.",
  "e16.op.scorta_fonderie.r": "Il corteo torna scortato. Gli ospiti restano in curva ad aspettare il loro turno.",
  "e18.op.aspetti.c": "Nessuna unità spostata; il retro della tribuna resta scoperto.",
  "e18.op.separa18": "Prima il Lookout, scortato",
  "e19.op.due_squadre.r": "Due squadre lasciano lo stadio senza dire dove vanno. Allo stadio se ne accorgono tutti.",
  "e19.op.presidia19.c": "Il magazzino resta presidiato; la strada da Kiln si scalda.",
  "e20.op.insegui20.c": "Ci guadagni fiducia col comando; la strada da Kiln resta scoperta.",
  "e20.op.lascia20.r": "Malvasi annota: «auto scura, fari spenti, verso il mare». Lo stadio resta presidiato.",
  "e24.op.festa_ospiti": "Festa in piazza, scortata",
  "e25.op.aspetta_modulo.c": "Guadagni fiducia con la Struttura; la piazza del municipio resta scoperta.",
  "e25.op.mostra_regole.c": "L'ispettore è contento; la curva Kiln resta scoperta.",
  "e25.op.spiega_ispettore.c": "La curva resta presidiata; l'ispettore annota.",
  "e25.op.raccogli_firme.c": "Guadagni fiducia con la Struttura; ma i varchi della zona rossa restano scoperti.",
  "e25.op.scorta_ritorno.c": "La piazza si svuota tranquilla, ma ti costa una squadra e la stazione resta scoperta.",
  "e25.op.steward_sedie": "Steward fra le auto del piazzale",
  "e25.op.steward_sedie.r": "Gli steward fanno scendere tutti dai cofani. Gli ospiti festeggiano lo stesso, ma per terra.",
  "e26.op.niente_foto.c": "Tribuna presidiata; in comune se lo ricordano.",
  "e27.op.tieni_busta.c": "Mentre parli la stazione resta scoperta e sale.",
  "e28.op.pista_porto.c": "Guadagni fiducia col comando; il magazzino delle fonderie resta scoperto e sale.",
  "e28.op.separa_curve.r": "Una squadra lascia la sua posizione per fare cordone. Al porto, intanto, nessuno.",
  "e31.op.consegna_comando.c": "Uno steward lascia la tribuna per portarlo, e la tribuna sale.",
  "e32.op.niente_accordo.c": "La curva resta presidiata; il portavoce la prende male e la curva si scalda: costa fiducia.",
  "e35.op.rinforzi_porto.c": "Il comando apprezza: guadagni fiducia; ma i rinforzi arrivano dal porto, e le banchine restano scoperte.",
  "e35.op.squadra_cantiere": "Sposta una squadra dal centro al cantiere",
  "e35.op.squadra_cantiere.c": "Il cantiere è sotto occhio, ma ti costa una squadra, tolta dal centro: il perimetro sale.",
  "e35.op.anticipa_comando.c": "Il comando apprezza la segnalazione, ci guadagni fiducia; ma fino all'ingresso il cantiere resta scoperto e sale.",
  "e35.op.ferma_uomo.c": "Il comando apprezza; ma ti costa una squadra, tolta dal perimetro, che sale.",
  "e36.op.ultimo_giro.c": "Il cantiere resta presidiato, ma ti costa una squadra.",
};

/** C42-02 (D-185, collaudo C-042): ricerca per formula su tutti i testi dei 36 episodi (non più per chiave).
 *  Formule che affermano fatti di schieramento: «resta/restano scoperto/presidiato» assoluto, «tolta dal/alla …»,
 *  «una squadra/uno steward … lascia …», «sposta una squadra dal …», «… intanto, nessuno», «Tribuna presidiata;»,
 *  e «scortato/a» in una risposta che non costa unità. Il comparativo «più/un po' scoperto» resta (IPOTESI del collaudo:
 *  dice che il settore si carica). Rosso __NO_C42T01: il test rimette i testi di prima dei residui. */
const FORMULE: [string, RegExp][] = [['resta scoperto/presidiato', /\brest(a|ano) (scopert|presidiat)/i], ['tolta da', /\btolt[aoie] (da|dal|dalla|dallo|dai|dalle|al|alla|allo)\b/i],
  ['unità che lascia', /\b(squadr[ae]|steward|pattugli[ae]|mediatore) (lascia|lasciano)\b/i], ['sposta dal', /\bsposta (una|due|tre) \w+ dal\b/i], ['intanto nessuno', /intanto, nessuno\.$/i],
  ['presidiata assoluto', /^\w+ presidiat[ao];/i], ['scortata senza costo', /scortat[aoie]/i]];
const costa = new Map<string, boolean>();
for (const [k, m] of Object.entries(d)) if (/^missioni\/e\d+\.json$/.test(k)) for (const o of (m as { ondate: { chiamate?: { opzioni: { id: string; effetti: { riserva?: string; valore: number }[] }[] }[] }[]; id: string }).ondate) for (const c of o.chiamate ?? []) for (const x of c.opzioni) costa.set(`${(m as { id: string }).id}.op.${x.id}`, x.effetti.some((e) => 'riserva' in e && e.valore < 0));
function perFormula(): string[] {
  const male: string[] = [];
  for (const [f, testi] of Object.entries(d)) { if (!/^testi\/it\/e\d+\.json$/.test(f)) continue;
    for (const [k, v0] of Object.entries(testi as Record<string, string>)) { const v = (g.__NO_C42T01 ? PRIMA42[k] : undefined) ?? (g.__NO_C41T01 ? PRIMA[k] : undefined) ?? v0, base = k.replace(/\.(c|r)$/, '');
      for (const [nome, re] of FORMULE) { if (!re.test(v)) continue; if (nome === 'scortata senza costo' && (!costa.has(base) || costa.get(base))) continue; male.push(`${k} (${nome})`); } } }
  return male;
}

describe('C42-02 testi neutri sullo schieramento, per formula su tutti i testi', () => {
  it('verde: nessuna formula', () => { expect(perFormula()).toEqual([]); });
  it('rosso C42T01: i residui di prima', () => { g.__NO_C42T01 = true; const n = perFormula().length; if (process.env.MOSTRA) console.log(`rosso C42T01: ${n}`); expect(n).toBe(37); }); // i 37 testi di prima dei residui (e25 scorta_ritorno.r compreso)
  // «la tiene breve» e «con squadre e steward» non sono formule: li sorveglia il test per chiave di C41-04 qui sotto
  it('rosso C41T01: 4 dei 5 casi di C41-04 tornano con la ricerca per formula', () => { g.__NO_C41T01 = true; expect(perFormula().length).toBe(4); });
});

describe('C41-04 testi neutri sullo schieramento', () => {
  it('verde: nessuno dei 5 casi del collaudo afferma un fatto di schieramento', () => { expect(smentiti()).toEqual([]); });
  it('rosso C41T01: i testi di prima, 5 casi', () => { g.__NO_C41T01 = true; expect(smentiti().length).toBe(5); });
});
