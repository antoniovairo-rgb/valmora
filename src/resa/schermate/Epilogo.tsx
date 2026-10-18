// Epilogo della campagna (D-161) e passo «Fine stagione» del verbale (D-164). I conti sono in src/logica/epilogo.ts;
// qui solo parole dai testi (data/testi/it/epilogo.json). Dall'epilogo si torna sempre alla città (nessun soft-lock).
// Rossi: __NO_C161E01 (dopo e36 solo «Alla mappa della città», come prima), __NO_C164F01 (verbale di e12/e24 senza passo),
// __NO_C165T01 (epilogo a schede invece delle tavole del finale).
import { Map as IconaMappa } from 'lucide-react';
import { chiaveFilo, type Epilogo as DatiEpilogo, type FineStagione as DatiFine, type Filo } from '../../logica/epilogo.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { Testata } from './Fumetto.tsx';
import { conTavole, TAVOLE, TavolaBar, TavolaFilo } from '../tavole-finale.tsx';

const Fili = (p: { fili: Filo[]; nome: string }) => (
  <ul className="scheda fili" data-fili={p.nome}>
    {p.fili.map((f) => (
      <li key={f.id} data-filo={f.id} data-valore={String(f.valore)}>
        <strong>{t(`epilogo.${f.id}.nome`)}</strong>
        <p className="tenue">{t(chiaveFilo(f))}</p>
      </li>
    ))}
  </ul>
);

const RigaStelle = (p: { etichetta: string; stelle: number; massimo: number }) => (
  <p className="riga" data-stelle-stagione={p.etichetta}><strong>{p.etichetta}</strong><span className="etichetta">★ {p.stelle} su {p.massimo}</span></p>
);

/** Passo «Fine stagione N» nel verbale dell'ultimo episodio della stagione: stelle, fili aperti, poi la stagione nuova. */
export function PassoFineStagione(p: { f: DatiFine }) {
  return (
    <div data-fine-stagione={p.f.stagione}>
      <h2>{t('epilogo.fine_stagione')} {p.f.stagione}</h2>
      <div className="scheda">
        <RigaStelle etichetta={`Stagione ${p.f.stagione}`} stelle={p.f.stelle} massimo={p.f.massimo} />
        <p className="tenue">{p.f.superati} episodi superati su {p.f.episodi}.</p>
      </div>
      <h2>{t('epilogo.aperti')}</h2>
      {p.f.aperti.length ? <Fili fili={p.f.aperti} nome="aperti" /> : <p className="tenue">{t('epilogo.nessun_aperto')}</p>}
      {p.f.chiusi.length > 0 && <><h2>{t('epilogo.chiusi')}</h2><Fili fili={p.f.chiusi} nome="chiusi" /></>}
      <p className="tenue" data-poi>{t('epilogo.poi')}</p>
    </div>
  );
}

/** Schermata di epilogo dopo il verbale dell'ultimo episodio: carriera, le sei scelte, le stelle; poi la città. */
export function Epilogo(p: { e: DatiEpilogo; citta: () => void; home?: () => void; genere?: 'm' | 'f'; fiducia?: number; fiduciaMax?: number }) {
  // D-165, D-171: parte 2 a tavole grandi, una per filo, e parte 3 al bar. Rosso C165T01: l'epilogo a schede di D-161.
  if (conTavole()) {
    const valore = (id: string) => p.e.scelte.find((f) => f.id === id)?.valore;
    const superati = p.e.stagioni.reduce((s, x) => s + x.superati, 0), episodi = p.e.stagioni.reduce((s, x) => s + x.episodi, 0);
    return (
      <>
        <Testata numero="★" etichetta={t('epilogo.etichetta')} titolo={t('finale.titolo')} home={p.home} />
        {TAVOLE.filter(([, id]) => valore(id) !== undefined).map(([tavola, id]) => <TavolaFilo key={tavola} tavola={tavola} valore={valore(id)!} />)}
        <TavolaBar genere={p.genere ?? 'm'} carriera={p.e.carriera} numeri={[`★ ${p.e.stelle} su ${p.e.massimo}`, `${superati} episodi su ${episodi}`, `Fiducia ${p.fiducia ?? '–'}/${p.fiduciaMax ?? 10}`]} />
        <button className="pulsante" data-azione="citta" onClick={p.citta}><Icona di={IconaMappa} />Alla mappa della città</button>
      </>
    );
  }
  return (
    <>
      <Testata numero="★" etichetta={t('epilogo.etichetta')} titolo={t('epilogo.titolo')} home={p.home} />
      <div className="scheda" data-carriera={p.e.carriera ?? 'ignota'}>
        <h2>{t('epilogo.carriera')}</h2>
        <p>{t(`epilogo.carriera.${p.e.carriera ?? 'ignota'}`)}</p>
      </div>
      <h2>{t('epilogo.scelte')}</h2>
      <Fili fili={p.e.scelte} nome="scelte" />
      <h2>{t('epilogo.stelle')}</h2>
      <div className="scheda">
        {p.e.stagioni.map((s) => <RigaStelle key={s.stagione} etichetta={`Stagione ${s.stagione}`} stelle={s.stelle} massimo={s.massimo} />)}
        <RigaStelle etichetta="Totale" stelle={p.e.stelle} massimo={p.e.massimo} />
      </div>
      <p className="tenue">{t('epilogo.citta')}</p>
      <button className="pulsante" data-azione="citta" onClick={p.citta}><Icona di={IconaMappa} />Alla mappa della città</button>
    </>
  );
}
