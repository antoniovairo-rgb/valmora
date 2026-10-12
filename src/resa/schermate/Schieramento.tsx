// Schieramento: le unità si trascinano dal vassoio sui settori della mappa. Alternativa a tocco
// (accessibilità): tocchi un'unità, poi il settore; tocchi un'unità sulla mappa per ritirarla.
// Le unità a riposo (D-056) si vedono a parte e non si possono schierare.
import { ArrowLeft, Check, Hand, Lock, Moon, RotateCcw, Undo2 } from 'lucide-react';
import { useRef, useState, type PointerEvent } from 'react';
import { spento } from '../../interruttori.ts';
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
  avviso?: string | null; annulla: (() => void) | null;
}) {
  const [riepilogo, setRiepilogo] = useState(false);
  const disp = disponibili(p.m, p.ic);
  const tr = useTrascina(p.metti);
  const restano = Object.entries(disp).map(([r, n]) => [r, n - usate(p.d, r)] as const).filter(([, n]) => n > 0);
  const tutte = restano.length === 0;
  // S-12 (PO-061): prima di confermare, il riepilogo di cosa va dove e di cosa resta. Rosso C17C01: conferma subito.
  if (riepilogo && !spento('C17C01')) return <Riepilogo m={p.m} d={p.d} restano={restano} indietro={() => setRiepilogo(false)} conferma={p.conferma} />;
  const libereScelta = p.scelta ? (disp[p.scelta] ?? 0) - usate(p.d, p.scelta) : 0;
  return (
    <>
      <p className="tenue">Trascina le unità sui settori, oppure tocca un'unità e poi il settore. Tocca un segnalino sulla mappa per ritirare una sola unità.</p>
      <p className="scheda in-mano" data-in-mano={p.scelta ?? ''} role="status">
        <Icona di={Hand} />{p.scelta
          ? <span>In mano: <strong>{t(`risorsa.${p.scelta}`)}</strong>, {libereScelta === 1 ? 'ne resta 1' : `ne restano ${libereScelta}`}. Tocca un settore sulla mappa.</span>
          : <span>Tocca un'unità qui sotto per prenderla.</span>}
      </p>
      {Object.entries(p.m.mappa.risorse).filter(([, x]) => x.fissa).map(([r]) => (
        <p key={r} className="scheda nota-fisse" data-nota-fisse={r}>
          <Icona di={Lock} /> <strong>{t(`risorsa.${r}`)}</strong>: una volta montate restano fino a fine serata. Si montano solo dove servono, mai sugli spalti.
        </p>
      ))}
      {p.avviso && <p className="avviso" role="status" data-avviso="si">{p.avviso}</p>}
      <div className="vassoio" role="group" aria-label="Unità da schierare">
        {Object.entries(disp).map(([r, n]) => {
          const libere = n - usate(p.d, r);
          const riposo = p.ic.riposo[r] ?? 0;
          const montate = usate(p.ic.fisse ?? {}, r);
          return (
            <div className="vassoio-voce" key={r}>
              <button type="button" className={`unita${p.scelta === r ? ' scelta' : ''}`} data-risorsa={r} disabled={libere <= 0}
                aria-pressed={p.scelta === r} aria-label={`${t(`risorsa.${r}`)}: ${libere} libere`}
                {...tr.gestori(r)} onClick={() => { if (!tr.eraTrascinamento()) p.scegli(r); }}>
                <Icona di={iconaRisorsa(r)} /><span>{t(`risorsa.${r}`)}</span><strong>{libere}</strong>
              </button>
              {riposo > 0 && <span className="riposo" data-riposo={r}><Icona di={Moon} />{riposo} a riposo</span>}
              {montate > 0 && <span className="riposo" data-montate={r}><Icona di={Lock} />{montate} già montate</span>}
            </div>
          );
        })}
      </div>
      <div className="riga azioni tre">
        <button className="pulsante secondario" data-azione="annulla" aria-label="Annulla l'ultima mossa" disabled={!p.annulla} onClick={() => p.annulla?.()}><Icona di={Undo2} />Annulla</button>
        <button className="pulsante secondario" data-azione="azzera" aria-label="Ritira tutte le unità" onClick={p.azzera}><Icona di={RotateCcw} />Ritira tutte</button>
        <button className="pulsante" data-azione="conferma" aria-label={tutte ? 'Conferma lo schieramento' : 'Conferma lo schieramento, con unità libere'} onClick={() => (spento('C17C01') ? p.conferma() : setRiepilogo(true))}><Icona di={Check} />Conferma</button>
      </div>
    </>
  );
}

const elenco = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} e ${xs.at(-1)}` : xs[0] ?? '');

/** Seconda conferma (S-12, PO-061): cosa hai messo dove e, se avanzano unità, quante. */
function Riepilogo(p: { m: Missione; d: Disposizione; restano: (readonly [string, number])[]; indietro: () => void; conferma: () => void }) {
  const righe = p.m.mappa.settori.map((s) => [s.id, Object.entries(p.d).map(([r, ps]) => [r, ps[s.id] ?? 0] as const).filter(([, n]) => n > 0)] as const)
    .filter(([, xs]) => xs.length);
  return (
    <>
      <div className="scheda riepilogo" data-riepilogo={righe.reduce((a, [, xs]) => a + xs.reduce((b, [, n]) => b + n, 0), 0)}>
        <h3>Il tuo schieramento</h3>
        {righe.length ? (
          <ul>{righe.map(([s, xs]) => <li key={s} data-riepilogo-settore={s}><strong>{t(`settore.${s}`)}</strong>: {elenco(xs.map(([r, n]) => `${n} ${t(`risorsa.${r}`)}`))}</li>)}</ul>
        ) : <p className="tenue">Nessuna unità schierata.</p>}
      </div>
      {p.restano.length > 0 && (
        <p className="avviso" role="alert" data-restano={p.restano.reduce((a, [, n]) => a + n, 0)}>
          Ti restano {elenco(p.restano.map(([r, n]) => `${n} ${t(`risorsa.${r}`)}`))}: confermi lo stesso?
        </p>
      )}
      <div className="riga azioni">
        <button className="pulsante secondario" data-azione="modifica" onClick={p.indietro}><Icona di={ArrowLeft} />Torna allo schieramento</button>
        <button className="pulsante" data-azione="conferma-davvero" onClick={p.conferma}><Icona di={Check} />Sì, conferma</button>
      </div>
    </>
  );
}
