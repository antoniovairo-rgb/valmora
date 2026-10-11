// Bilancio di fine episodio nel verbale (D-085, PO-036): cosa ha aiutato, cosa ha pesato, dove sei rimasto
// scoperto, cosa manca per la stella successiva. I conti sono in src/logica/bilancio.ts; qui solo parole.
// Rosso del motore: __NO_C10B01 (aiuti e pesi vuoti).
import { ThumbsDown, ThumbsUp, ShieldAlert, Star } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { bilancio, type Impatto, type Requisito, type VoceScelta } from '../../logica/bilancio.ts';
import type { EsitoMissione } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { sceltaLeggibile } from '../partita.ts';

const segno = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

/** «−2 pressione su Strada da Cinderwick», «+1 credito», «+1 Squadre di riserva». */
export function impattoInParole(i: Impatto): string {
  if (i.tipo === 'credito') return `${segno(i.valore)} credito`;
  if (i.tipo === 'riserva') return `${segno(i.valore)} ${t(`risorsa.${i.dove}`)} di riserva`;
  return `${segno(i.valore)} ${i.tipo} su ${t(`settore.${i.dove}`)}`;
}

const SIMBOLO = { almeno: '≥', al_massimo: '≤', uguale: '=', altro: '' } as const;
const distanza = (q: Requisito) => (typeof q.soglia === 'number' && typeof q.valore === 'number' ? Math.abs(q.soglia - q.valore) : Infinity);

/** Il requisito non soddisfatto più vicino della stella successiva, o null se non ne manca nessuno. */
export function prossimoRequisito(lista: Requisito[]): Requisito | null {
  return lista.filter((q) => !q.ok).sort((a, b) => distanza(a) - distanza(b))[0] ?? null;
}

function Voce(p: { m: Missione; v: VoceScelta }) {
  const { opzione } = sceltaLeggibile(p.m, p.v);
  return (
    <li data-scelta={`${p.v.chiamata}:${p.v.opzione}`}>
      <span>{opzione ? t(opzione.testo) : p.v.opzione}</span>
      <small className="tenue">Ondata {p.v.ondata} · {p.v.impatti.map(impattoInParole).join(', ')}</small>
    </li>
  );
}

/** Le sezioni del bilancio, una per passo del verbale (S-10): aiuti, pesi, scoperti con la stella dopo. */
export function sezioniBilancio(p: { m: Missione; esito: EsitoMissione; stelle: number }): ReactNode[] {
  const b = bilancio(p.m, p.esito);
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
            : manca ? (manca.confronto === 'altro' ? 'Serve un altro esito della serata.' : `${t(`var.${manca.var}`)} ${SIMBOLO[manca.confronto]} ${String(manca.soglia)}: hai ${String(manca.valore)}`)
            : 'I numeri ci sono: la stella in più dipende da come finisce la serata.'}
        </p>
      </section>
    </Fragment>,
  ];
}
