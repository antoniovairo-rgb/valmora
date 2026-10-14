// Stemmi dei club disegnati dal codice (D-088, PO-040): forma (scudo, tondo, rombo) e simbolo dai dati,
// coi colori del club (dati, non token: D-086). Club senza stemma (i nuovi degli abbozzi): scudo con le
// iniziali. Club inventati: nessuno stemma vero. Rosso C10C02: nessuno stemma.
import type { ReactNode } from 'react';
import type { Missione } from '../logica/tipi.ts';
import { spento } from '../interruttori.ts';
import { club, t, type Club } from './dati.ts';

const FORMA = {
  scudo: <path d="M4 4H36V24C36 36 28 42 20 46C12 42 4 36 4 24Z" />,
  tondo: <circle cx="20" cy="25" r="19" />,
  rombo: <path d="M20 2L38 25L20 48L2 25Z" />,
};

const SIMBOLO: Record<string, ReactNode> = {
  ciminiera: <><path d="M13 36V16H19V36ZM21 36V22H27V36Z" /><circle cx="17" cy="11" r="2.5" /><circle cx="21" cy="8" r="2" /></>,
  calderone: <><path d="M9 21H31C31 31 27 36 20 36C13 36 9 31 9 21Z" /><path d="M7 19H33V22H7Z" /><path d="M14 13Q16 10 14 7M20 14Q22 11 20 8M26 13Q28 10 26 7" fill="none" strokeWidth="2" /></>,
  collina: <path d="M6 35Q14 17 21 27Q27 19 34 35Z" />,
  penna: <path d="M29 9C19 14 14 24 13 37L15 37C17 28 21 19 29 9ZM13 37L11 41L14 39Z" />,
};

/** Luminanza relativa WCAG di un colore #rrggbb dei dati (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance). */
const luce = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((u) => (u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4)).reduce((s, u, i) => s + u * [0.2126, 0.7152, 0.0722][i]!, 0);
const stacco = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
/** C22-06: il simbolo sulla forma stava sotto 3:1 per tre club (Larkspire 2,60, Quillhaven 2,66, Ollerbrook 2,98). Lì il
 *  simbolo ha un contorno nero o bianco, quello che stacca di più dalla forma. Rosso C57S01: nessun contorno. */
export function aloneStemma(primario?: string, secondario?: string): 'nero' | 'bianco' | null {
  if (spento('C57S01') || !/^#[0-9a-f]{6}$/i.test(primario ?? '') || !/^#[0-9a-f]{6}$/i.test(secondario ?? '')) return null;
  const f = luce(primario!);
  if (stacco(f, luce(secondario!)) >= 3) return null;
  return stacco(f, 0) >= stacco(f, 1) ? 'nero' : 'bianco';
}

const iniziali = (nome: string) => nome.split(/\s+/).map((x) => x[0]).join('').slice(0, 2);

export function Stemma(p: { c: Club }) {
  const forma = p.c.stemma?.forma ?? 'scudo';
  const simbolo = p.c.stemma && SIMBOLO[p.c.stemma.simbolo];
  const { primario, secondario } = p.c.colori ?? { primario: 'currentColor', secondario: 'currentColor' };
  const alone = aloneStemma(p.c.colori?.primario, p.c.colori?.secondario);
  const segno = simbolo ?? <text x="20" y="31" textAnchor="middle" className="stemma-iniziali">{iniziali(t(p.c.nome))}</text>;
  return (
    <svg className="stemma" viewBox="0 0 40 50" role="img" aria-label={`stemma di ${t(p.c.nome)}`} data-stemma={p.c.id} data-forma={forma}>
      <g className="stemma-forma" fill={primario}>{FORMA[forma]}</g>
      {alone && <g className={`stemma-alone ${alone}`} data-alone-stemma={alone} aria-hidden>{segno}</g>}
      <g fill={secondario} stroke={secondario} data-simbolo>{segno}</g>
    </svg>
  );
}

/** I club delle curve della missione (di solito due): la sfida della serata. Niente se non ci sono curve. */
export function Sfida(p: { m: Missione }) {
  // C20-08: la sfida è fra i club delle CURVE, ognuno una volta: con PO-102 anche le strade hanno un club (i loro
  // tifosi), e la sala diceva «Calderholt contro Calderholt contro Larkspire». Rosso C44S03: tutti i settori, come prima.
  const ids = p.m.mappa.settori.filter((s) => spento('C44S03') || s.tipo === 'curva').map((s) => s.club).filter((x): x is string => !!x);
  const lista = (spento('C44S03') ? ids : [...new Set(ids)]).map((id) => club.get(id)).filter((c): c is Club => !!c);
  if (spento('C10C02') || lista.length === 0) return null;
  return (
    <div className="sfida" data-sfida={lista.map((c) => c.id).join(',')}>
      {lista.map((c, i) => [
        i > 0 && <span key={`contro-${c.id}`} className="sfida-contro">contro</span>,
        <span key={c.id} className="sfida-club"><Stemma c={c} /><span>{t(c.nome)}</span></span>,
      ])}
    </div>
  );
}
