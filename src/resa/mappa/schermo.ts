// C24-03 / C25-03: «Cannot read properties of undefined (reading 'screen')». In Pixi app.screen legge il renderer, che
// non c'è prima che l'app sia pronta né dopo lo smontaggio (passaggio città → briefing, 3 percorsi su 612 nel C-024).
// La misura si legge solo col renderer; senza, null e chi chiama tiene la misura che ha. Rosso C65S01: lettura diretta.
import { spento } from '../../interruttori.ts';

export interface ConSchermo { renderer?: unknown; readonly screen: { width: number; height: number } }

export function schermo(app: ConSchermo): { w: number; h: number } | null {
  if (!app.renderer && !spento('C65S01')) return null;
  return { w: app.screen.width, h: app.screen.height };
}

/** La tela di Pixi, con la stessa cautela (C24-03: «reading 'canvas'» in ridisegno.ts, stessa causa). */
export function tela(app: { renderer?: unknown; readonly canvas: unknown }): HTMLCanvasElement | null {
  if (!app.renderer && !spento('C65S01')) return null;
  return app.canvas as HTMLCanvasElement;
}

type ConEventi = { on(e: 'resize', f: () => void): unknown; off(e: 'resize', f: () => void): unknown };

/** C27-03: «reading 'on'» (2 volte su 150 nel C-027), stessa causa: il ridimensionamento si segue solo col renderer.
 *  Senza, si aspetta che arrivi (un frame alla volta) e allora si misura; allo smontaggio si stacca. Rosso C80R01: diretto. */
export function seguiMisura(app: { renderer?: unknown }, aggiorna: () => void): () => void {
  if (spento('C80R01')) { const r = app.renderer as ConEventi; r.on('resize', aggiorna); return () => { r.off('resize', aggiorna); }; }
  let r: ConEventi | null = null, finito = false, id = 0;
  const attacca = () => {
    if (finito) return;
    if (!app.renderer) { id = requestAnimationFrame(attacca); return; }
    r = app.renderer as ConEventi; r.on('resize', aggiorna); aggiorna();
  };
  attacca();
  return () => { finito = true; cancelAnimationFrame(id); r?.off('resize', aggiorna); };
}
