// Schieramento: le unità si trascinano dal vassoio sui settori della mappa. Alternativa a tocco
// (accessibilità): tocchi un'unità, poi il settore; tocchi un'unità sulla mappa per ritirarla.
// Le unità a riposo (D-056) si vedono a parte e non si possono schierare.
import { ArrowLeft, Check, CircleHelp, Lock, Moon, RotateCcw, Undo2 } from 'lucide-react';
import { useRef, useState, type PointerEvent, useEffect } from 'react';
import { spento } from '../../interruttori.ts';
import { disponibili, type InCorso } from '../../logica/missione.ts';
import type { Disposizione, Missione } from '../../logica/tipi.ts';
import { t, quante } from '../dati.ts';
import { Icona, iconaRisorsa } from '../icone.tsx';

/** C14-11 (D-037): dove rende l'unità, coi settori di questa missione: «Rende di più: …; normale: …; qui non serve: …».
 *  Rosso C22R01: nessuna spiegazione. */
export function rende(m: Missione, r: string): string {
  const ris = m.mappa.risorse[r];
  if (!ris) return '';
  const per = (f: (v: number) => boolean) => m.mappa.settori.filter((s) => f(ris.efficacia[s.tipo] ?? 0)).map((s) => t(`settore.${s.id}`));
  const max = Math.max(0, ...m.mappa.settori.map((s) => ris.efficacia[s.tipo] ?? 0));
  const parti = [
    max > 1 && per((v) => v === max).length ? `Rende di più: ${per((v) => v === max).join(', ')}` : '',
    per((v) => v > 0 && v < max).length ? `normale: ${per((v) => v > 0 && v < max).join(', ')}` : max === 1 ? `Rende: ${per((v) => v === 1).join(', ')}` : '',
    ris.dimezza?.length ? `Dimezza: ${ris.dimezza.join(', ')}` : '',
    !ris.dimezza?.length && per((v) => v === 0).length ? `qui non serve: ${per((v) => v === 0).join(', ')}` : '',
  ].filter(Boolean);
  return `${parti.join('; ')}.`;
}

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
  /** C15-06: dice all'App quando il riepilogo è aperto (la mappa allora non si tocca) */
  riepilogoAperto?: (aperto: boolean) => void;
}) {
  const [riepilogo, setRiepilogo] = useState(false);
  const { riepilogoAperto } = p;
  useEffect(() => { riepilogoAperto?.(riepilogo); return () => riepilogoAperto?.(false); }, [riepilogo, riepilogoAperto]);
  const [aiuto, setAiuto] = useState(false);
  const finestraAiuto = useRef<HTMLDivElement>(null); // C18-07: aperto, si porta in vista
  useEffect(() => {
    if (!aiuto || spento('C42A01')) return;
    const el = finestraAiuto.current;
    el?.scrollIntoView({ block: 'nearest' });
    // C20-04: a 360×760 il riquadro è già nella finestra ma sotto la barra fissa «Conferma»: si scorre quanto serve
    // a mostrarlo sopra la barra, con lo stacco di --spazio-2. Rosso C44A01: solo scrollIntoView, come prima.
    const barra = document.querySelector('[data-barra]');
    if (!el || !barra || spento('C44A01')) return;
    const stacco = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spazio-2')) || 0;
    const sotto = el.getBoundingClientRect().bottom + stacco - barra.getBoundingClientRect().top;
    if (sotto > 0) window.scrollBy({ top: sotto });
  }, [aiuto]);
  const disp = disponibili(p.m, p.ic);
  const tr = useTrascina(p.metti);
  const restano = Object.entries(disp).map(([r, n]) => [r, n - usate(p.d, r)] as const).filter(([, n]) => n > 0);
  const tutte = restano.length === 0;
  // S-12 (PO-061): prima di confermare, il riepilogo di cosa va dove e di cosa resta. Rosso C17C01: conferma subito.
  if (riepilogo && !spento('C17C01')) return <Riepilogo m={p.m} d={p.d} restano={restano} indietro={() => setRiepilogo(false)} conferma={p.conferma} />;
  const libereScelta = p.scelta ? (disp[p.scelta] ?? 0) - usate(p.d, p.scelta) : 0;
  // S-24 (PO, «Compatto», C16-02): sotto la mappa solo la fila delle unità e una riga; le istruzioni dietro «?»;
  // barra fissa in basso con Annulla e Ritira a sola icona e «Conferma» grande. Rosso C27S01: la disposizione di S-12.
  const vecchio = spento('C27S01');
  const fisse = Object.entries(p.m.mappa.risorse).filter(([, x]) => x.fissa).map(([r]) => r);
  // C18-07: aperto col «?», l'aiuto va sotto la riga del «?» e si porta in vista: sopra le unità le spingeva sotto la
  // barra «Conferma» (375×667). Rosso C42A01: sopra le unità, come prima.
  const sopra = vecchio || spento('C42A01');
  const scatola = (aiuto || vecchio) && (
    <div className="scheda aiuto-schieramento" data-aiuto ref={finestraAiuto}>
      <p>Trascina le unità sui settori, oppure tocca un'unità e poi il settore. Tocca un segnalino sulla mappa per ritirare una sola unità.</p>
      {fisse.map((r) => <p key={r} data-nota-fisse={r}><Icona di={Lock} /> <strong>{t(`risorsa.${r}`)}</strong>: una volta montate restano fino a fine serata. Si montano solo dove servono, mai sugli spalti.</p>)}
    </div>
  );
  return (
    <div className={`schieramento${vecchio ? '' : ' compatto'}`}>
      {sopra && scatola}
      {p.avviso && <p className="avviso" role="status" data-avviso="si">{p.avviso}</p>}
      <div className="vassoio" role="group" aria-label="Unità da schierare">
        {Object.entries(disp).map(([r, n]) => {
          const libere = n - usate(p.d, r);
          const riposo = p.ic.riposo[r] ?? 0;
          const montate = usate(p.ic.fisse ?? {}, r);
          return (
            <button key={r} type="button" className={`unita${p.scelta === r ? ' scelta' : ''}`} data-risorsa={r} disabled={libere <= 0}
              aria-pressed={p.scelta === r}
              aria-label={`${t(`risorsa.${r}`)}: ${libere} libere${riposo ? `, ${riposo} a riposo` : ''}${montate ? `, ${montate} già montate` : ''}${fisse.includes(r) ? ', restano fino a fine serata' : ''}`}
              {...tr.gestori(r)} onClick={() => { if (!tr.eraTrascinamento()) p.scegli(r); }}>
              {fisse.includes(r) && <span className="unita-fissa" data-fissa-chip={r}><Icona di={Lock} /></span>}
              <Icona di={iconaRisorsa(r)} /><span className="unita-nome">{t(`risorsa.${r}`)}</span><strong>{libere}</strong>
              {riposo > 0 && <span className="unita-extra" data-riposo={r}><Icona di={Moon} />{riposo}</span>}
              {montate > 0 && <span className="unita-extra" data-montate={r}><Icona di={Lock} />{montate}</span>}
            </button>
          );
        })}
      </div>
      <div className="riga-in-mano">
      <p className="in-mano" data-in-mano={p.scelta ?? ''} role="status">
        {p.scelta
          ? <><strong>{t(`risorsa.${p.scelta}`)}</strong> {libereScelta === 1 ? '(1)' : `(${libereScelta})`}{/* PO-099 (D-116): niente suggerimento «dove rende»: anticipava dove schierare. Rosso C41R01: lo rimette. */}{spento('C41R01') && !spento('C22R01') && <span className="rende" data-rende={p.scelta} title={rende(p.m, p.scelta)}> · {rende(p.m, p.scelta)}</span>}</>
          : <>Tocca un'unità, poi un settore della mappa.</>}
      </p>
      {!vecchio && <button type="button" className="aiuto" data-azione="aiuto" aria-pressed={aiuto} aria-label="Come si schiera" onClick={() => setAiuto(!aiuto)}><Icona di={CircleHelp} /></button>}
      </div>
      {!sopra && scatola}
      <div className={vecchio ? 'riga azioni tre' : 'barra-schieramento'} data-barra>
        <button className="pulsante secondario" data-azione="annulla" aria-label="Annulla l'ultima mossa" title="Annulla l'ultima mossa" disabled={!p.annulla} onClick={() => p.annulla?.()}><Icona di={Undo2} />{vecchio && 'Annulla'}</button>
        <button className="pulsante secondario" data-azione="azzera" aria-label="Ritira tutte le unità" title="Ritira tutte le unità" onClick={p.azzera}><Icona di={RotateCcw} />{vecchio && 'Ritira tutte'}</button>
        <button className="pulsante" data-azione="conferma" aria-label={tutte ? 'Conferma lo schieramento' : 'Conferma lo schieramento, con unità libere'} onClick={() => (spento('C17C01') ? p.conferma() : setRiepilogo(true))}><Icona di={Check} />Conferma</button>
      </div>
    </div>
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
          <ul>{righe.map(([s, xs]) => <li key={s} data-riepilogo-settore={s}><strong>{t(`settore.${s}`)}</strong>: {elenco(xs.map(([r, n]) => quante(n, r)))}</li>)}</ul>
        ) : <p className="tenue">Nessuna unità schierata.</p>}
      </div>
      {p.restano.length > 0 && (
        <p className="avviso" role="alert" data-restano={p.restano.reduce((a, [, n]) => a + n, 0)}>
          Ti restano {elenco(p.restano.map(([r, n]) => quante(n, r)))}: confermi lo stesso?
        </p>
      )}
      <div className="riga azioni riepilogo-azioni">
        <button className="pulsante secondario" data-azione="modifica" onClick={p.indietro}><Icona di={ArrowLeft} />Torna allo schieramento</button>
        <button className="pulsante" data-azione="conferma-davvero" onClick={p.conferma}><Icona di={Check} />Sì, conferma</button>
      </div>
    </>
  );
}
