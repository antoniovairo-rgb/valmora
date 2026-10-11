// Mappa tattica della sala operativa (D-049). Due strati:
// - sotto, PixiJS (StratoPixi) disegna griglia, campo, aloni e impulsi; se WebGL manca non c'è e basta;
// - sopra, HTML: un punto per settore (pulsante vero, tocco e lettori di schermo), nome e unità schierate.
// La tensione si vede SOLO come colore (D-055): classe liv-0…liv-5, mai il numero.
import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import type { Disposizione, Missione } from '../../logica/tipi.ts';
import { spento } from '../../interruttori.ts';
import { t } from '../dati.ts';
import { Icona, iconaRisorsa } from '../icone.tsx';
import { livello } from '../partita.ts';
import type { PuntoMappa } from './StratoPixi.tsx';
import { webglDisponibile } from './webgl.ts';

// PixiJS pesa: si carica a parte, dopo il titolo, e solo se WebGL c'è.
const StratoPixi = lazy(() => import('./StratoPixi.tsx').then((x) => ({ default: x.StratoPixi })));

const PAROLE = ['calma', 'tranquilla', 'mossa', 'tesa', 'molto tesa', 'critica'];
const conWebgl = typeof document !== 'undefined' && webglDisponibile();

export interface MappaProps {
  m: Missione;
  accesi?: string[];
  tensione?: Record<string, number> | null;
  presenze?: Disposizione | null;
  /** schieramento: tocco su un settore, e tocco su un'unità già schierata per ritirarla */
  onSettore?: (settore: string) => void;
  onTogli?: (risorsa: string, settore: string) => void;
}

/** Posizione del settore in percentuale, passata al CSS come variabili (niente stili in linea). */
const posiziona = (x: number, y: number) => (el: HTMLElement | null) => {
  el?.style.setProperty('--x', String(x));
  el?.style.setProperty('--y', String(y));
};

export function Mappa(p: MappaProps) {
  const contenitore = useRef<HTMLDivElement>(null);
  const [pronta, setPronta] = useState(!conWebgl);
  const settori = useMemo(() => p.m.mappa.settori.map((s, i, tutti) => ({ ...s, pos: s.pos ?? { x: ((i + 1) * 100) / (tutti.length + 1), y: 50 } })), [p.m]);
  const accesi = useMemo(() => new Set(p.accesi ?? []), [p.accesi]);
  const punti: PuntoMappa[] = useMemo(() => settori.map((s) => ({
    id: s.id, tipo: s.tipo, x: s.pos.x, y: s.pos.y, acceso: accesi.has(s.id), livello: p.tensione ? livello(p.tensione[s.id] ?? 0) : null,
  })), [settori, accesi, p.tensione]);
  // Margine interno = mezzo punto del settore, come nel CSS (.settore), così Pixi e HTML coincidono.
  // e in basso c'è in più lo spazio per i nomi (--margine-nomi): stessi conti di .settore in stile.css.
  const margine = useMemo(() => {
    const v = (k: string, d: number) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(k)) || d;
    return { lato: v('--settore', 44) / 2, sotto: v('--margine-nomi', 34) };
  }, []);

  return (
    <div className="mappa" ref={contenitore} data-mappa={conWebgl ? 'webgl' : 'html'} data-pronta={pronta ? 'si' : 'no'} aria-label="Mappa tattica">
      {conWebgl && <Suspense fallback={null}><StratoPixi contenitore={contenitore} punti={punti} margine={margine} pronto={() => setPronta(true)} /></Suspense>}
      {settori.map((s) => {
        const liv = p.tensione ? livello(p.tensione[s.id] ?? 0) : null;
        const lato = s.pos.x < 30 ? 'sinistra' : s.pos.x > 70 ? 'destra' : 'centro';
        // Settori vicini (e02: stazione, curva ospiti e viale della stazione uno sopra l'altro): con un punto
        // subito sotto il nome va sopra; con punti sopra E sotto il nome va di lato e le unità dall'altro lato;
        // con un punto subito sopra o sotto le unità vanno di lato.
        const vicino = (verso: 1 | -1) => settori.some((o) => o.id !== s.id && Math.abs(o.pos.x - s.pos.x) < 18 && verso * (o.pos.y - s.pos.y) > 0 && verso * (o.pos.y - s.pos.y) < 24);
        const sotto = vicino(1), sopra = vicino(-1);
        const posto = sotto && sopra ? ' nome-lato unita-lato' : sotto ? ' nome-sopra unita-lato' : sopra ? ' unita-lato' : '';
        const qui = Object.entries(p.presenze ?? {}).map(([r, ps]) => [r, ps[s.id] ?? 0] as const).filter(([, n]) => n > 0);
        const nome = t(`settore.${s.id}`);
        return (
          <div key={s.id} ref={posiziona(s.pos.x, s.pos.y)} data-settore={s.id}
            className={`settore lato-${lato}${posto}${accesi.has(s.id) ? ' acceso' : ''}${liv !== null ? ` liv-${liv}` : ''}`}>
            <button type="button" className="settore-punto" disabled={!p.onSettore} onClick={() => p.onSettore?.(s.id)}
              aria-label={`${nome}${liv !== null ? `, situazione ${PAROLE[liv]}` : ''}${qui.length ? `, ${qui.map(([r, n]) => `${n} ${t(`risorsa.${r}`)}`).join(', ')}` : ''}`} />
            <span className="settore-nome" aria-hidden="true">{nome}</span>
            {qui.length > 0 && (
              <span className="settore-unita">
                {qui.map(([r, n]) => (
                  <button key={r} type="button" className={spento('C05R05') ? 'pastiglia-rossa' : 'tocco-pastiglia'} data-presenza={`${r}@${s.id}`} disabled={!p.onTogli}
                    aria-label={`ritira ${t(`risorsa.${r}`)} da ${nome}`} onClick={() => p.onTogli?.(r, s.id)}>
                    <span className="pastiglia"><Icona di={iconaRisorsa(r)} />{n}</span>
                  </button>
                ))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
