// C-021: (1) C21-01 il corteo «neutro» non deve sembrare di un club: i suoi due colori distano almeno ΔE 20 (CIE76, Lab)
// dal colore principale di ogni club dei dati; (2) un evento in strada col campo «club» dà al corteo quel club.
// Rossi: __NO_C49C01 (neutro arancio di prima: ΔE 8 dal Cinderwick), __NO_C49E01 (club dell'evento ignorato).
import { readFileSync, readdirSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { follaDellOndata, neutroCorteo } from '../src/resa/mappa/folla.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C49C01; delete g.__NO_C49E01; });

const token = (nome: string) => readFileSync('src/resa/token.css', 'utf8').match(new RegExp(`${nome}:\\s*(#[0-9a-fA-F]{6})`))![1]!;
const club = readdirSync('data/club').map((f) => JSON.parse(readFileSync(`data/club/${f}`, 'utf8')) as { id: string; colori: { primario: string } });
const lab = (h: string) => {
  const [r, gg, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r! * 0.4124 + gg! * 0.3576 + b! * 0.1805) / 0.95047), y = f(r! * 0.2126 + gg! * 0.7152 + b! * 0.0722), z = f((r! * 0.0193 + gg! * 0.1192 + b! * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)] as const;
};
const deltaE = (a: string, b: string) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
const SOGLIA = 20; // dichiarata: sotto i 20 ΔE due colori pieni sulla mappa si confondono (misura C-021: 8 col Cinderwick)
const vicini = () => neutroCorteo().flatMap((t) => club.filter((c) => deltaE(token(t), c.colori.primario) < SOGLIA).map((c) => `${t}~${c.id} ${deltaE(token(t), c.colori.primario).toFixed(0)}`));

const strada = { id: 'm', episodio: 1, mappa: { settori: [{ id: 'via', tipo: 'strada', pos: { x: 1, y: 1 } }], risorse: {} },
  ondate: [{ n: 1, chiamate: [], eventi: [{ id: 'c', tipo: 'corteo', settore: 'via', pressione: 1, club: 'cinderwick_united' }] }] } as unknown as Missione;

describe('C-021: colori del corteo', () => {
  it(`il neutro dista almeno ΔE ${SOGLIA} dal colore principale di ogni club`, () => expect(vicini()).toEqual([]));
  it('braccio rosso __NO_C49C01: il neutro arancio sembra del Cinderwick', () => { g.__NO_C49C01 = true; expect(vicini().some((x) => x.includes('cinderwick'))).toBe(true); });
  it('il club dell\'evento passa al corteo', () => expect(follaDellOndata(strada, 1).cortei[0]?.club).toBe('cinderwick_united'));
  it('braccio rosso __NO_C49E01: il club dell\'evento si perde', () => { g.__NO_C49E01 = true; expect(follaDellOndata(strada, 1).cortei[0]?.club).toBeUndefined(); });
});
