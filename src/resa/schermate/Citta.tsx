// Mappa della città degli episodi (D-061): scegli un episodio sulla mappa e lo avvii o lo rigiochi.
import { BookOpen, Play, RotateCcw } from 'lucide-react';
import { Fragment, useEffect, useState, type ReactElement, type ReactNode } from 'react';
import type { Missione } from '../../logica/tipi.ts';
import type { Salvataggio } from '../../salvataggi/salvataggio.ts';
import { genereAttuale, missioni, t } from '../dati.ts';
import { VignettaHome } from '../vignette-home.tsx';
import { prossimoEpisodio, statoEpisodio, type StatoEpisodio } from '../episodi.ts';
import { Icona } from '../icone.tsx';
import { bozza, MappaCitta } from '../mappa/MappaCitta.tsx';
import { spento } from '../../interruttori.ts';
import { Stelle } from '../stelle.tsx';
import { Sfida } from '../stemma.tsx';
import { due, TastoHome, Testata } from './Fumetto.tsx';
import { Tripla } from './Tripla.tsx';
import { riservaCitta } from './citta-riserva.ts';

/** «1 tentativo», «N tentativi» (C-008.1). */
const tentativi = (n: number) => `${n} ${n === 1 && !spento('C05S81') ? 'tentativo' : 'tentativi'}`;

const DESCRIZIONE: Record<StatoEpisodio, string> = {
  superato: 'Superato: puoi rigiocarlo, resta il risultato migliore.',
  da_rigiocare: 'Fallito: va rigiocato per andare avanti.',
  disponibile: 'Da giocare.',
  futuro: 'Non ancora disponibile.',
};

/** PO-149: unità di cielo sopra la finestra nella striscia; bastano per --home-vignetta-max (210 px) a 360 px di larghezza. */
const CIELO_STRISCIA = 122;

export function Citta(p: { sal: Salvataggio; scelto: Missione | null; scegli: (id: string) => void; avvia: (m: Missione) => void; home?: () => void; epilogo?: () => void }) {
  const [rigioca, setRigioca] = useState<string | null>(null);
  const tutte = missioni.map((m) => ({ m, stato: statoEpisodio(p.sal, m), stelle: p.sal.episodi[m.id]?.migliore?.stelle ?? null }));
  // PO-044: una stagione alla volta (quella dell'episodio scelto, cambiabile); rosso __NO_C13M01 = tutte insieme
  const stagioni = [...new Set(missioni.map((m) => m.stagione))].sort((a, b) => a - b);
  const [stagione, setStagione] = useState(p.scelto?.stagione ?? stagioni[0] ?? 1);
  const voci = spento('C13M01') ? tutte : tutte.filter((x) => x.m.stagione === stagione);
  const v = voci.find((x) => x.m.id === p.scelto?.id);
  // D-210: sotto --vignetta-finestra-min (700 px) la striscia non ci sta senza scorrere (360×640): resta la testata di prima
  const bassa = () => innerHeight < (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vignetta-finestra-min')) || 0);
  const [finestraBassa, setFinestraBassa] = useState(bassa);
  useEffect(() => { const f = () => setFinestraBassa(bassa()); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  return (
    <>
      {/* D-210 (PO-140 fase 2, scelta del PO): in testa la striscia della home al posto della testata; la stagione la dicono
          i tasti Stagione N (aria-pressed), il titolo resta per il lettore di schermo. Rosso C210C01: la testata di prima */}
      {spento('C210C01') || finestraBassa ? <Testata numero={`S${stagione}`} etichetta={`Stagione ${stagione} · mappa della città`} titolo="Valmora" /> : <>
        <h1 className="solo-lettore">{`Valmora · stagione ${stagione} · mappa della città`}</h1>
        <figure className="home-vignetta citta-striscia" data-citta-striscia>
          {/* PO-149 (D-237): sugli schermi alti la striscia prende lo spazio libero (come la vignetta della home, PO-092) e cresce
              verso l'alto, con più cielo sopra le teste. Rosso C237S01: fissa a 96 px, inquadrata dall'alto, come prima */}
          {spento('C237S01') ? <VignettaHome genere={genereAttuale() === 'f' ? 'f' : 'm'} didascalia={t('citta.striscia')} fissa />
            : <VignettaHome genere={genereAttuale() === 'f' ? 'f' : 'm'} didascalia={t('citta.striscia')} cielo={CIELO_STRISCIA}
              riserva={spento('C242M01') ? undefined : () => riservaCitta(varianti)} />}
          <figcaption className="home-didascalia">{t('citta.striscia')}</figcaption>
        </figure></>}
      {stagioni.length > 1 && (
        <div className="stagioni" data-stagioni>
          {p.home && <TastoHome vai={p.home} />}
          {stagioni.map((n) => (
            <button key={n} type="button" className={`pulsante${n === stagione ? '' : ' secondario'}`} data-stagione={n}
              aria-pressed={n === stagione} onClick={() => setStagione(n)}>Stagione {n}</button>
          ))}
        </div>
      )}
      <MappaCitta voci={voci} scelto={p.scelto?.id ?? null} scegli={p.scegli} />
      {v ? (
        <SchedaEpisodio m={v.m} stato={v.stato} stelle={v.stelle} tentativi={p.sal.episodi[v.m.id]?.tentativi ?? 0}
          azione={() => (v.stato === 'superato' ? setRigioca(v.m.id) : p.avvia(v.m))}
          tripla={rigioca === v.m.id && v.stato === 'superato' ? ( /* S-16 (PO-066): rigiocare un episodio già superato chiede tre conferme */
            <Tripla azione="rigioca" no="No, resta qui" si="Sì, rigioca l'episodio" annulla={() => setRigioca(null)} conferma={() => p.avvia(v.m)}
              testi={[`Rigiocare «${t(v.m.titolo)}»? L'hai già superato.`,
                'Sicuro? Si riparte da come stavano le cose prima di questo episodio; resta il risultato migliore che hai già.',
                'Ultima conferma: rigiochi l\'episodio dall\'inizio.']} />) : undefined} />
      ) : <Invito sal={p.sal} stagione={stagione} voci={voci} scegli={(id) => { setStagione(missioni.find((x) => x.id === id)?.stagione ?? stagione); p.scegli(id); }} />}
      {/* D-161: campagna finita → l'epilogo si rilegge dalla città */}
      {p.epilogo && <TastoEpilogo vai={p.epilogo} />}
    </>
  );
}

/** PO-091: senza episodio scelto, una scheda come le altre. Se la stagione è tutta chiusa dice perché e cosa la
 * apre (il prossimo episodio da superare, toccabile); altrimenti invita a toccare un episodio. Rosso C33C01: la
 * riga di prima, anche per le stagioni chiuse. */
function Invito(p: { sal: Salvataggio; stagione: number; voci: { m: Missione; stato: StatoEpisodio }[]; scegli: (id: string) => void }) {
  if (spento('C33C01')) return <p className="tenue">Tocca un episodio sulla mappa.</p>;
  const chiusa = p.voci.length > 0 && p.voci.every((x) => x.stato === 'futuro');
  return <InvitoVista stagione={p.stagione} chiusa={chiusa} prossimo={chiusa ? prossimoEpisodio(p.sal) : null} scegli={p.scegli} />;
}

/** L'invito come si vede, senza stato (C52-01: serve anche a misurare le varianti). */
function InvitoVista(p: { stagione: number; chiusa: boolean; prossimo: Missione | null; scegli?: (id: string) => void }) {
  if (!p.chiusa) return <div className="scheda invito" data-invito="tocca"><p>Tocca un episodio sulla mappa per vederlo e giocarlo.</p></div>;
  const prossimo = p.prossimo;
  return (
    <div className="scheda invito" data-invito="chiusa">
      <h2>Stagione {p.stagione} chiusa</h2>
      {prossimo && prossimo.stagione < p.stagione ? <>
        <p>Si apre quando avrai superato tutti gli episodi della stagione {prossimo.stagione}{prossimo.stagione < p.stagione - 1 ? ' e di quelle prima' : ''}.</p>
        <button className="pulsante secondario" data-azione="vai-prossimo" onClick={() => p.scegli?.(prossimo.id)}>
          Prossimo: episodio {due(prossimo.episodio)}, {t(prossimo.titolo)}
        </button>
      </> : <p>Si apre più avanti nella storia.</p>}
    </div>
  );
}

/** La scheda dell'episodio scelto; senza «azione» né «tripla» serve a misurare le varianti (C52-01). */
function SchedaEpisodio(p: { m: Missione; stato: StatoEpisodio; stelle: number | null; tentativi: number; azione?: () => void; tripla?: ReactNode }) {
  return (
    <div className="scheda" data-scheda-episodio={p.m.id}>
      <div className="riga"><span className="etichetta">Episodio {due(p.m.episodio)}</span><span className="tenue">{tentativi(p.tentativi)}</span></div>
      <h2>{t(p.m.titolo)}</h2>
      {bozza(p.m) && <p className="tenue" data-bozza-scheda><span className="etichetta bozza">Bozza</span> Episodio abbozzato: testi e numeri ancora provvisori.</p>}
      <Sfida m={p.m} />
      {p.stelle !== null && <Stelle n={p.stelle} />}
      <p className={p.stato === 'da_rigiocare' ? 'avviso' : 'tenue'}>{DESCRIZIONE[p.stato]}</p>
      {p.tripla ?? (p.stato !== 'futuro' && (
        <button className="pulsante" data-azione="avvia-episodio" onClick={p.azione}>
          {p.stato === 'disponibile' ? <><Icona di={Play} />Avvia l'episodio</> : <><Icona di={RotateCcw} />Rigioca l'episodio</>}
        </button>
      ))}
    </div>
  );
}

const TastoEpilogo = (p: { vai?: () => void }) => <button className="pulsante secondario" data-azione="epilogo" onClick={p.vai}><Icona di={BookOpen} />Rileggi l'epilogo</button>;

/** C52-01: ogni blocco possibile sotto la mappa, a prescindere dal salvataggio. Senza epilogo: ogni episodio in ogni stato
 *  (con le stelle quando può averle) e ogni invito. Con «Rileggi l'epilogo» (tutti superati, D-161): solo schede superate
 *  e l'invito a toccare; una stagione chiusa con l'epilogo non può capitare. */
function varianti(): ReactElement[] {
  const stagioni = [...new Set(missioni.map((m) => m.stagione))];
  const scheda = (m: Missione, stato: StatoEpisodio) => <SchedaEpisodio m={m} stato={stato} stelle={stato === 'superato' || stato === 'da_rigiocare' ? 3 : null} tentativi={99} />;
  const senza = [...missioni.flatMap((m) => (['superato', 'da_rigiocare', 'disponibile', 'futuro'] as const).map((stato) => scheda(m, stato))),
    <InvitoVista stagione={1} chiusa={false} prossimo={null} />,
    ...stagioni.flatMap((s) => [<InvitoVista stagione={s} chiusa prossimo={null} />, ...missioni.filter((m) => m.stagione < s).map((m) => <InvitoVista stagione={s} chiusa prossimo={m} />)])];
  const con = [...missioni.map((m) => scheda(m, 'superato')), <InvitoVista stagione={1} chiusa={false} prossimo={null} />].map((x) => <>{x}<TastoEpilogo /></>);
  return [...senza, ...con].map((x, i) => <Fragment key={i}>{x}</Fragment>);
}
