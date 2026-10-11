// Mappa della città degli episodi (D-061): ogni episodio è un punto in «missione.luogo» (0-100) con
// esito e stelle; i futuri sono spenti. Tocco su un punto = lo scegli. Pixi sotto (se c'è WebGL), HTML sopra.
import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import type { StatoEpisodio } from '../episodi.ts';
import { Stelle } from '../stelle.tsx';
import type { PuntoCitta } from './StratoCitta.tsx';
import { webglDisponibile } from './webgl.ts';

const StratoCitta = lazy(() => import('./StratoCitta.tsx').then((x) => ({ default: x.StratoCitta })));
const conWebgl = typeof document !== 'undefined' && webglDisponibile();

export interface VoceCitta { m: Missione; stato: StatoEpisodio; stelle: number | null }

const posiziona = (x: number, y: number) => (el: HTMLElement | null) => {
  el?.style.setProperty('--x', String(x));
  el?.style.setProperty('--y', String(y));
};

export function MappaCitta(p: { voci: VoceCitta[]; scelto: string | null; scegli: (id: string) => void }) {
  const contenitore = useRef<HTMLDivElement>(null);
  const [pronta, setPronta] = useState(!conWebgl);
  const margine = useMemo(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--settore')) / 2 || 22, []);
  // Senza «luogo» nei dati gli episodi si mettono in fila, così non spariscono.
  const voci = useMemo(() => p.voci.map((v, i) => ({ ...v, pos: v.m.luogo ?? { x: ((i + 1) * 100) / (p.voci.length + 1), y: 50 } })), [p.voci]);
  const punti: PuntoCitta[] = useMemo(() => voci.map((v) => ({ id: v.m.id, x: v.pos.x, y: v.pos.y, acceso: v.stato !== 'futuro' && v.stato !== 'superato' })), [voci]);
  return (
    <div className="mappa citta" ref={contenitore} data-mappa={conWebgl ? 'webgl' : 'html'} data-pronta={pronta ? 'si' : 'no'} aria-label="Mappa di Valmora">
      {conWebgl && <Suspense fallback={null}><StratoCitta contenitore={contenitore} punti={punti} margine={margine} pronto={() => setPronta(true)} /></Suspense>}
      {voci.map((v) => (
        <div key={v.m.id} ref={posiziona(v.pos.x, v.pos.y)} data-episodio={v.m.id} data-stato={v.stato}
          className={`settore lato-${v.pos.x < 30 ? 'sinistra' : v.pos.x > 70 ? 'destra' : 'centro'} episodio ${v.stato}${p.scelto === v.m.id ? ' acceso' : ''}`}>
          <button type="button" className="settore-punto" disabled={v.stato === 'futuro'} onClick={() => p.scegli(v.m.id)}
            aria-label={`Episodio ${v.m.episodio}: ${t(v.m.titolo)}${v.stelle !== null ? `, ${v.stelle} stelle su 3` : ''}${v.stato === 'futuro' ? ', non ancora disponibile' : ''}`}>
            {v.m.episodio}
          </button>
          <span className="settore-nome" aria-hidden="true">{t(v.m.titolo)}</span>
          {v.stelle !== null && <span className="settore-unita"><Stelle n={v.stelle} piccole /></span>}
        </div>
      ))}
    </div>
  );
}
