// C24-03 / C25-03: la misura della scena Pixi si legge solo col renderer (src/resa/mappa/schermo.ts).
import { afterEach, describe, expect, it } from 'vitest';
import { schermo, seguiMisura, tela } from '../src/resa/mappa/schermo.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C65S01; });
// come Pixi: «screen» è un getter che legge il renderer (undefined prima dell'avvio e dopo lo smontaggio)
const app = (renderer?: { screen: { width: number; height: number } }) => ({ renderer, get screen() { return (this.renderer as { screen: { width: number; height: number } }).screen; } });

describe('C24-03 misura della scena senza renderer', () => {
  it('col renderer la misura, senza null e nessun errore', () => {
    expect(schermo(app({ screen: { width: 320, height: 240 } }))).toEqual({ w: 320, h: 240 });
    expect(schermo(app())).toBeNull();
    const senza = { renderer: undefined, get canvas() { return (this.renderer as unknown as { canvas: unknown }).canvas; } };
    expect(tela(senza)).toBeNull();
  });
  it('braccio rosso __NO_C65S01: lettura diretta, l\'errore del collaudo', () => {
    g.__NO_C65S01 = true;
    expect(() => schermo(app())).toThrow(/reading 'screen'/);
    expect(() => tela({ renderer: undefined, get canvas() { return (this.renderer as unknown as { canvas: unknown }).canvas; } })).toThrow(/reading 'canvas'/);
  });
});

describe('C27-03 ridimensionamento senza renderer', () => {
  afterEach(() => { delete g.__NO_C80R01; });
  const conRenderer = () => { const ascolti: (() => void)[] = []; return { ascolti, on: (_: string, f: () => void) => ascolti.push(f), off: (_: string, f: () => void) => ascolti.splice(ascolti.indexOf(f), 1) }; };
  it('senza renderer nessun errore; quando arriva si attacca e misura; allo smontaggio si stacca', () => {
    let frame: FrameRequestCallback | null = null;
    g.requestAnimationFrame = (f: FrameRequestCallback) => { frame = f; return 1; }; g.cancelAnimationFrame = () => { frame = null; };
    const a: { renderer?: ReturnType<typeof conRenderer> } = {}; let misure = 0;
    const stacca = seguiMisura(a, () => { misure++; });
    expect(misure).toBe(0);
    a.renderer = conRenderer(); (frame as FrameRequestCallback | null)?.(0);
    expect(misure).toBe(1); expect(a.renderer.ascolti).toHaveLength(1);
    stacca(); expect(a.renderer.ascolti).toHaveLength(0);
    const b = {}; const via = seguiMisura(b, () => {}); via(); // smontato prima del renderer: nessun errore
  });
  it('braccio rosso __NO_C80R01: diretto, l\'errore del collaudo', () => {
    g.__NO_C80R01 = true;
    expect(() => seguiMisura({}, () => {})).toThrow(/reading 'on'/);
  });
});
