// PROTOTIPO S-14 (PO-022, D-188): la barra del tempo reale sopra la chiamata, solo con un modo attivo (src/logica/tempo.ts).
// a/b: conto alla rovescia; scaduto, vale la risposta predefinita. c: orologio di partita, i settori scoperti peggiorano.
// Sempre: «Pausa» (copre la chiamata, il tempo si ferma) e il ritmo regolabile fino a «senza tempo».
import { Pause, Play, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { InCorso } from '../logica/missione.ts';
import { improvvisa, MINUTI_PEGGIORA, modoTempo, RITMI, secondiPer, SECONDI_PER_MINUTO, settoriCheCorrono, type Ritmo } from '../logica/tempo.ts';
import type { Chiamata, Missione } from '../logica/tipi.ts';
import { t } from './dati.ts';
import { Icona } from './icone.tsx';
import { secondoMs } from './schermate/Ondata.tsx';
import './stile-tempo.css';

const NOMI: Record<Ritmo, string> = { normale: 'normale', lento: 'lento ×1,5', molto_lento: 'lento ×2', senza: 'senza tempo' };
const ORDINE = Object.keys(RITMI) as Ritmo[];
let ritmoScelto: Ritmo = 'normale';               // prototipo: per la sessione; nella fase 2 nelle impostazioni salvate
const minutiOndata = new Map<string, number>();    // prototipo: minuti di gioco per ondata, non salvati

export function TempoReale(p: { m: Missione; ic: InCorso; c: Chiamata; ferma: boolean; scadi: () => void; peggiora: (trascorsi: number) => void }) {
  const modo = modoTempo(p.m)!;
  const [ritmo, setRitmo] = useState<Ritmo>(ritmoScelto);
  const [pausa, setPausa] = useState(false);
  const totale = secondiPer(modo, p.m, p.ic, p.c, ritmo);
  const [resta, setResta] = useState(totale ?? 0);
  const chiave = `${p.m.id}:${p.ic.ondata}`;
  const [minuti, setMinuti] = useState(minutiOndata.get(chiave) ?? 0);
  const [tic, setTic] = useState(0); // c: secondi dentro il minuto di gioco
  const cambiaRitmo = () => { const r = ORDINE[(ORDINE.indexOf(ritmo) + 1) % ORDINE.length]!; ritmoScelto = r; setRitmo(r); const n = secondiPer(modo, p.m, p.ic, p.c, r); setResta(n ?? 0); };
  const corre = !pausa && !p.ferma;
  useEffect(() => {
    if (!corre || modo === 'c' || totale === null) return;
    const id = setTimeout(() => { if (resta > 1) setResta(resta - 1); else { setResta(0); p.scadi(); } }, secondoMs());
    return () => clearTimeout(id);
  }, [corre, resta, totale, modo, p]);
  const perMinuto = ritmo === 'senza' ? Infinity : Math.round(SECONDI_PER_MINUTO * RITMI[ritmo]);
  useEffect(() => {
    if (!corre || modo !== 'c' || !Number.isFinite(perMinuto)) return;
    const id = setTimeout(() => {
      if (tic + 1 < perMinuto) { setTic(tic + 1); return; }
      setTic(0); p.peggiora(minuti); const n = minuti + 1; minutiOndata.set(chiave, n); setMinuti(n);
    }, secondoMs());
    return () => clearTimeout(id);
  }, [corre, tic, minuti, perMinuto, modo, chiave, p]);
  const imprevisto = modo === 'b' && improvvisa(p.m, p.ic.ondata, p.c);
  const orologio = (min: number) => { const x = 20 * 60 + 30 + min; return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`; };
  const corrono = modo === 'c' ? settoriCheCorrono(p.m, p.ic, p.c.settore) : [];
  const prossimo = (MINUTI_PEGGIORA - (minuti % MINUTI_PEGGIORA)) * perMinuto - tic;
  const quota = totale ? resta / totale : 1;
  return (
    <>
      <div className={`tempo-reale${imprevisto ? ' imprevisto' : ''}${totale && resta <= 5 ? ' stretto' : ''}`} data-tempo={modo} role="timer" aria-live="off">
        {imprevisto && <p className="tempo-titolo" data-imprevisto="">Imprevisto: rispondi entro {totale ?? '—'} s</p>}
        <div className="tempo-riga">
          <Icona di={Timer} />
          {modo === 'c'
            ? <span className="tempo-conto" data-orologio={minuti}>Ore {orologio(minuti)}</span>
            : <span className="tempo-conto" data-resta={resta}>{totale === null ? 'Senza tempo' : `${resta} s`}</span>}
          <button type="button" className="tempo-ritmo" data-ritmo={ritmo} onClick={cambiaRitmo} aria-label={`Ritmo: ${NOMI[ritmo]}. Tocca per cambiarlo`}>{NOMI[ritmo]}</button>
          <button type="button" className="tempo-pausa" data-azione="pausa" onClick={() => setPausa(true)} aria-label="Pausa"><Icona di={Pause} /></button>
        </div>
        {modo !== 'c' && totale !== null && <div className="tempo-barra" aria-hidden="true"><span style={{ inlineSize: `${Math.round(quota * 100)}%` }} /></div>}
        {modo !== 'c' && totale !== null && <p className="tempo-nota">Se non rispondi in tempo, la sala fa da sé.</p>}
        {modo === 'c' && (corrono.length
          ? <p className="tempo-nota" data-corrono={corrono.join(' ')}>Senza nessuno e lasciati soli: {corrono.map((k) => t(`settore.${k}`)).join(', ')}. Peggiorano fra {Number.isFinite(prossimo) ? `${prossimo} s` : '—'}.</p>
          : <p className="tempo-nota">Nessun settore scoperto peggiora.</p>)}
      </div>
      {pausa && (
        <div className="tempo-velo" role="dialog" aria-modal="true" aria-label="Pausa" data-pausa="">
          <p className="tempo-titolo">In pausa</p>
          <p className="tempo-nota">Il tempo è fermo. La chiamata resta lì.</p>
          <button type="button" className="pulsante" data-azione="riprendi-tempo" onClick={() => setPausa(false)} autoFocus><Icona di={Play} />Riprendi</button>
          <button type="button" className="pulsante secondario" onClick={cambiaRitmo}>Ritmo: {NOMI[ritmo]}</button>
        </div>
      )}
    </>
  );
}
