// Mappa della città degli episodi (D-061): scegli un episodio sulla mappa e lo avvii o lo rigiochi.
import { BookOpen, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
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
            : <VignettaHome genere={genereAttuale() === 'f' ? 'f' : 'm'} didascalia={t('citta.striscia')} cielo={CIELO_STRISCIA} />}
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
        <div className="scheda" data-scheda-episodio={v.m.id}>
          <div className="riga"><span className="etichetta">Episodio {due(v.m.episodio)}</span><span className="tenue">{tentativi(p.sal.episodi[v.m.id]?.tentativi ?? 0)}</span></div>
          <h2>{t(v.m.titolo)}</h2>
          {bozza(v.m) && <p className="tenue" data-bozza-scheda><span className="etichetta bozza">Bozza</span> Episodio abbozzato: testi e numeri ancora provvisori.</p>}
          <Sfida m={v.m} />
          {v.stelle !== null && <Stelle n={v.stelle} />}
          <p className={v.stato === 'da_rigiocare' ? 'avviso' : 'tenue'}>{DESCRIZIONE[v.stato]}</p>
          {/* S-16 (PO-066): rigiocare un episodio già superato chiede tre conferme */}
          {rigioca === v.m.id && v.stato === 'superato' ? (
            <Tripla azione="rigioca" no="No, resta qui" si="Sì, rigioca l'episodio" annulla={() => setRigioca(null)} conferma={() => p.avvia(v.m)}
              testi={[`Rigiocare «${t(v.m.titolo)}»? L'hai già superato.`,
                'Sicuro? Si riparte da come stavano le cose prima di questo episodio; resta il risultato migliore che hai già.',
                'Ultima conferma: rigiochi l\'episodio dall\'inizio.']} />
          ) : v.stato !== 'futuro' && (
            <button className="pulsante" data-azione="avvia-episodio" onClick={() => (v.stato === 'superato' ? setRigioca(v.m.id) : p.avvia(v.m))}>
              {v.stato === 'disponibile' ? <><Icona di={Play} />Avvia l'episodio</> : <><Icona di={RotateCcw} />Rigioca l'episodio</>}
            </button>
          )}
        </div>
      ) : <Invito sal={p.sal} stagione={stagione} voci={voci} scegli={(id) => { setStagione(missioni.find((x) => x.id === id)?.stagione ?? stagione); p.scegli(id); }} />}
      {/* D-161: campagna finita → l'epilogo si rilegge dalla città */}
      {p.epilogo && <button className="pulsante secondario" data-azione="epilogo" onClick={p.epilogo}><Icona di={BookOpen} />Rileggi l'epilogo</button>}
    </>
  );
}

/** PO-091: senza episodio scelto, una scheda come le altre. Se la stagione è tutta chiusa dice perché e cosa la
 * apre (il prossimo episodio da superare, toccabile); altrimenti invita a toccare un episodio. Rosso C33C01: la
 * riga di prima, anche per le stagioni chiuse. */
function Invito(p: { sal: Salvataggio; stagione: number; voci: { m: Missione; stato: StatoEpisodio }[]; scegli: (id: string) => void }) {
  if (spento('C33C01')) return <p className="tenue">Tocca un episodio sulla mappa.</p>;
  const chiusa = p.voci.length > 0 && p.voci.every((x) => x.stato === 'futuro');
  if (!chiusa) return <div className="scheda invito" data-invito="tocca"><p>Tocca un episodio sulla mappa per vederlo e giocarlo.</p></div>;
  const prossimo = prossimoEpisodio(p.sal);
  return (
    <div className="scheda invito" data-invito="chiusa">
      <h2>Stagione {p.stagione} chiusa</h2>
      {prossimo && prossimo.stagione < p.stagione ? <>
        <p>Si apre quando avrai superato tutti gli episodi della stagione {prossimo.stagione}{prossimo.stagione < p.stagione - 1 ? ' e di quelle prima' : ''}.</p>
        <button className="pulsante secondario" data-azione="vai-prossimo" onClick={() => p.scegli(prossimo.id)}>
          Prossimo: episodio {due(prossimo.episodio)}, {t(prossimo.titolo)}
        </button>
      </> : <p>Si apre più avanti nella storia.</p>}
    </div>
  );
}
