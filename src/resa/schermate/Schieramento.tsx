// Schieramento: le unità si trascinano dal vassoio sui settori della mappa. Alternativa a tocco
// (accessibilità): tocchi un'unità, poi il settore; tocchi un'unità sulla mappa per ritirarla.
// Le unità a riposo (D-056) si vedono a parte e non si possono schierare.
import { Check, Moon, Undo2 } from 'lucide-react';
import { useRef, type PointerEvent } from 'react';
import { disponibili, type InCorso } from '../../logica/missione.ts';
import type { Disposizione, Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona, iconaRisorsa } from '../icone.tsx';

export const usate = (d: Disposizione, r: string) => Object.values(d[r] ?? {}).reduce((a, n) => a + n, 0);

/** Trascinamento con i pointer event (dito e mouse); se il dito non si muove è un tocco normale. */
function useTrascina(rilascia: (risorsa: string, settore: string) => void) {
  const volo = useRef<{ x: number; y: number; mosso: boolean } | null>(null);
  const appenaTrascinato = useRef(false);
  const fine = (el: HTMLElement) => { el.classList.remove('in-volo'); el.style.removeProperty('--dx'); el.style.removeProperty('--dy'); volo.current = null; };
  return {
    gestori: (r: string) => ({
      onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
        if (e.currentTarget.disabled) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        volo.current = { x: e.clientX, y: e.clientY, mosso: false };
      },
      onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
        const v = volo.current; if (!v) return;
        const dx = e.clientX - v.x; const dy = e.clientY - v.y;
        if (!v.mosso && Math.hypot(dx, dy) < 8) return;
        v.mosso = true;
        e.currentTarget.classList.add('in-volo');
        e.currentTarget.style.setProperty('--dx', `${dx}px`);
        e.currentTarget.style.setProperty('--dy', `${dy}px`);
      },
      onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
        const v = volo.current; fine(e.currentTarget);
        if (!v?.mosso) return;
        appenaTrascinato.current = true;
        const sotto = document.elementsFromPoint(e.clientX, e.clientY).map((x) => x.closest<HTMLElement>('[data-settore]')).find((x) => x);
        if (sotto?.dataset.settore) rilascia(r, sotto.dataset.settore);
      },
      onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => fine(e.currentTarget),
    }),
    /** Il click che segue un trascinamento non deve valere anche come tocco. */
    eraTrascinamento: () => { const x = appenaTrascinato.current; appenaTrascinato.current = false; return x; },
  };
}

export function Schieramento(p: {
  m: Missione; ic: InCorso; d: Disposizione; scelta: string | null;
  scegli: (r: string) => void; metti: (r: string, settore: string) => void; azzera: () => void; conferma: () => void;
}) {
  const disp = disponibili(p.m, p.ic);
  const tr = useTrascina(p.metti);
  const ondata = p.m.ondate[p.ic.ondata - 1]!;
  const tutte = Object.entries(disp).reduce((a, [r, n]) => a + n - usate(p.d, r), 0) === 0;
  return (
    <>
      <p className="sopratitolo">Episodio {p.m.episodio} · Ondata {p.ic.ondata} di {p.m.ondate.length} · Schieramento</p>
      <h1>{ondata.titolo ? t(ondata.titolo) : `Ondata ${p.ic.ondata}`}</h1>
      <p className="tenue">Trascina le unità sui settori, oppure tocca un'unità e poi il settore. Tocca un'unità sulla mappa per ritirarla.</p>
      <div className="vassoio" role="group" aria-label="Unità da schierare">
        {Object.entries(disp).map(([r, n]) => {
          const libere = n - usate(p.d, r);
          const riposo = p.ic.riposo[r] ?? 0;
          return (
            <div className="vassoio-voce" key={r}>
              <button type="button" className={`unita${p.scelta === r ? ' scelta' : ''}`} data-risorsa={r} disabled={libere <= 0}
                aria-pressed={p.scelta === r} aria-label={`${t(`risorsa.${r}`)}: ${libere} libere`}
                {...tr.gestori(r)} onClick={() => { if (!tr.eraTrascinamento()) p.scegli(r); }}>
                <Icona di={iconaRisorsa(r)} /><span>{t(`risorsa.${r}`)}</span><strong>{libere}</strong>
              </button>
              {riposo > 0 && <span className="riposo" data-riposo={r}><Icona di={Moon} />{riposo} a riposo</span>}
            </div>
          );
        })}
      </div>
      <div className="riga azioni">
        <button className="pulsante secondario" data-azione="azzera" onClick={p.azzera}><Icona di={Undo2} />Ritira tutte</button>
        <button className="pulsante" data-azione="conferma" onClick={p.conferma}><Icona di={Check} />{tutte ? 'Conferma lo schieramento' : 'Conferma (con unità libere)'}</button>
      </div>
    </>
  );
}
