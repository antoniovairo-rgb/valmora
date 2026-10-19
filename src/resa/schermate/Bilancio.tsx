// Bilancio di fine episodio nel verbale (D-085, PO-036): cosa ha aiutato, cosa ha pesato, dove sei rimasto
// scoperto, cosa manca per la stella successiva. I conti sono in src/logica/bilancio.ts; qui solo parole.
// Rosso del motore: __NO_C10B01 (aiuti e pesi vuoti).
import { ThumbsDown, ThumbsUp, ShieldAlert, Star } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { bilancio, type Impatto, type Requisito, type VoceScelta } from '../../logica/bilancio.ts';
import { confrontoScelte, daTabella, type TabellaConfronti } from '../../logica/confronto.ts';
import tabella from '../../logica/confronti.json';
import type { EsitoMissione } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { dichiarate, t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { livello, sceltaLeggibile } from '../partita.ts';
import { spento } from '../../interruttori.ts';

const segno = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

/** Nomi dei colori della scala della tensione (token --tensione-0…5): la tensione si dice SOLO così (D-055). */
export const COLORI = ['verde', 'verde chiaro', 'giallo', 'arancione', 'rosso', 'rosso acceso'] as const;
const ORDINE: Record<number, string> = { 2: 'seconda', 3: 'terza' };
const il = (c: string) => (/^[aeiou]/.test(c) ? `l'${c}` : `il ${c}`);
const al = (c: string) => (/^[aeiou]/.test(c) ? `all'${c}` : `al ${c}`);

/** «−2 pressione su Strada da Cinderwick», «abbassa la tensione su Piazzale», «+1 fiducia», «+1 Squadre di riserva».
 *  C12-01: mai cifre di tensione (rosso C12T01: come prima, «−2 tensione su …»). */
export function impattoInParole(i: Impatto): string {
  if (i.tipo === 'tensione' && !spento('C12T01')) return `${i.valore < 0 ? 'abbassa' : 'alza'}${Math.abs(i.valore) >= 3 ? ' molto' : ''} la tensione su ${t(`settore.${i.dove}`)}`;
  if (i.tipo === 'credito') return `${segno(i.valore)} ${t('var.credito').toLowerCase()}`; // D-097: «fiducia»
  if (i.tipo === 'riserva') return `${segno(i.valore)} ${t(`risorsa.${i.dove}`)} di riserva`;
  return `${segno(i.valore)} ${i.tipo} su ${t(`settore.${i.dove}`)}`;
}

const SIMBOLO = { almeno: '≥', al_massimo: '≤', uguale: '=', altro: '' } as const;
const distanza = (q: Requisito) => (typeof q.soglia === 'number' && typeof q.valore === 'number' ? Math.abs(q.soglia - q.valore) : Infinity);

/** Il requisito mancante in parole. Tensione in colori (C12-01, D-055): «Per la seconda stella la tensione non
 *  deve passare il giallo: è arrivata al rosso». Le altre variabili (fiducia) restano in cifre (D-097). */
export function requisitoInParole(q: Requisito, stelle: number): string {
  if (q.var.includes('tensione') && typeof q.soglia === 'number' && typeof q.valore === 'number' && !spento('C12T01')) {
    const limite = COLORI[livello(q.soglia)]!, arrivo = COLORI[livello(q.valore)]!;
    // C33-09 (D-147): il colore da solo non diceva di quanto si era sopra la soglia (due tensioni diverse, stesso colore):
    // si aggiunge il numero, «Seconda stella: tensione massima 3 su 10 (raggiunta: 4).». Soglie e colori invariati. Rosso C109S01: solo i colori.
    const max = dichiarate.get(q.var)?.max, su = typeof max === 'number' ? ` su ${max}` : '';
    const numero = spento('C109S01') ? '' : ` ${ORDINE[stelle]!.charAt(0).toUpperCase()}${ORDINE[stelle]!.slice(1)} stella: tensione ${q.confronto === 'al_massimo' ? 'massima' : 'minima'} ${q.soglia}${su} (raggiunta: ${q.valore}).`;
    // C38-02 (D-172): soglia 3 e tensione 4 hanno lo stesso colore (livello ceil(t/2)): «non deve passare il giallo: è
    // arrivata al giallo» si contraddiceva (72/72 soglie dei dati). Si dice che è salita troppo dentro quel colore, senza
    // cifre (D-055). Rosso C38G01: la frase di prima.
    const dentro = limite === arrivo && !spento('C38G01');
    return (q.confronto === 'al_massimo' ? `Per la ${ORDINE[stelle]} stella la tensione non deve passare ${il(limite)}: ${dentro ? `è salita troppo dentro ${il(arrivo)}` : `è arrivata ${al(arrivo)}`}.`
      : `Per la ${ORDINE[stelle]} stella la tensione deve arrivare ${al(limite)}: si è fermata ${al(arrivo)}.`) + numero;
  }
  return `${t(`var.${q.var}`)} ${SIMBOLO[q.confronto]} ${String(q.soglia)}: hai ${String(q.valore)}`;
}

/** Il requisito non soddisfatto più vicino della stella successiva, o null se non ne manca nessuno. */
export function prossimoRequisito(lista: Requisito[]): Requisito | null {
  return lista.filter((q) => !q.ok).sort((a, b) => distanza(a) - distanza(b))[0] ?? null;
}

function Voce(p: { m: Missione; v: VoceScelta }) {
  const { opzione } = sceltaLeggibile(p.m, p.v);
  return (
    <li data-scelta={`${p.v.chiamata}:${p.v.opzione}`}>
      <span>{opzione ? t(opzione.testo) : p.v.opzione}</span>
      {/* C41-02: niente «Ondata N ·» vuoto (rosso C41B02: come prima) */}
      <small className="tenue">Ondata {p.v.ondata}{p.v.impatti.length || spento('C41B02') ? ` · ${p.v.impatti.map(impattoInParole).join(', ')}` : ''}</small>
    </li>
  );
}

/** Le sezioni del bilancio, una per passo del verbale (S-10): aiuti, pesi, scoperti con la stella dopo. */
export function sezioniBilancio(p: { m: Missione; esito: EsitoMissione; stelle: number }): ReactNode[] {
  // C38-03: contro le altre risposte; D-174: dalla tabella precalcolata (tools/confronti.mjs), calcolo solo se manca
  const b = bilancio(p.m, p.esito, 3, daTabella(tabella as TabellaConfronti, p.m.id) ?? confrontoScelte(p.m, dichiarate));
  const lista = p.stelle >= 3 ? null : p.stelle === 2 ? b.stelle.tre : b.stelle.due;
  const manca = lista && prossimoRequisito(lista);
  return [
    <section key="aiuti" className="scheda bilancio bilancio-aiuti" data-sezione="aiuti">
      <h3><Icona di={ThumbsUp} />{t('bilancio.aiuti')}</h3>
      {b.aiuti.length ? <ul>{b.aiuti.map((v, i) => <Voce key={i} m={p.m} v={v} />)}</ul> : <p className="tenue">Nessuna scelta ha dato una mano.</p>}
    </section>,
    <section key="pesi" className="scheda bilancio bilancio-pesi" data-sezione="pesi">
      <h3><Icona di={ThumbsDown} />{t('bilancio.pesi')}</h3>
      {b.pesi.length ? <ul>{b.pesi.map((v, i) => <Voce key={i} m={p.m} v={v} />)}</ul> : <p className="tenue">Nessuna scelta ti è costata.</p>}
    </section>,
    <Fragment key="resto">
      <section className="scheda bilancio bilancio-scoperti" data-sezione="scoperti">
        <h3><Icona di={ShieldAlert} />{t('bilancio.scoperti')}</h3>
        {b.scoperti.length
          ? <ul>{b.scoperti.map((s, i) => <li key={i} data-scoperto={`${s.ondata}:${s.settore}`}>Ondata {s.ondata} · {t(`settore.${s.settore}`)}</li>)}</ul>
          : <p className="tenue">Nessun settore scoperto.</p>}
      </section>
      <section className="scheda bilancio bilancio-stelle" data-sezione="stelle">
        <h3><Icona di={Star} />{t('bilancio.stelle')}</h3>
        <p data-requisito={manca ? manca.var : 'nessuno'}>
          {!lista ? 'Hai tutte e tre le stelle.'
            : manca ? (manca.confronto === 'altro' ? 'Serve un altro esito della serata.' : requisitoInParole(manca, p.stelle >= 2 ? 3 : 2))
            : 'I numeri ci sono: la stella in più dipende da come finisce la serata.'}
        </p>
      </section>
    </Fragment>,
  ];
}
