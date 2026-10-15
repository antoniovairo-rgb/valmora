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
  // D-125: la penna usciva dal rombo in alto e in basso (guardiano di tools/foto-stemmi.mjs); ora è al 78% attorno al
  // centro. Rosso C62P02: com'era.
  penna: <g transform={spento('C62P02') ? undefined : 'translate(20 25) scale(0.78) translate(-20 -25)'}><path d="M29 9C19 14 14 24 13 37L15 37C17 28 21 19 29 9ZM13 37L11 41L14 39Z" /></g>,
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

/** D-125 (PO-109, docs/proposte/13-club.md §2.4): 12 simboli nuovi, a tinta unita come gli altri. I fori (finestre,
 *  feritoie, tacche) sono sottotracciati in senso evenodd. Rosso C62S01: non ci sono, i club cadono sulle iniziali. */
const NUOVI: Record<string, ReactNode> = {
  // Arches: due pilastri e un arco a tutto sesto, con un arco più piccolo dietro, a metà altezza
  arco: <><path d="M10 37V24A10 10 0 0 1 30 24V37H25.5V25A5.5 5.5 0 0 0 14.5 25V37Z" /><path d="M16.5 37V32.5A3.5 3.5 0 0 1 23.5 32.5V37H21.8V33A1.8 1.8 0 0 0 18.2 33V37Z" /></>,
  // Studio: lavagnetta col bordo, asta incernierata in alto aperta di 20°, tre strisce diagonali sull'asta
  ciak: <g transform="translate(20 28) scale(1.25) translate(-20 -28)"><><path fillRule="evenodd" d="M13 24H27V35H13ZM15 26.5V33H25V26.5Z" /><g transform="rotate(-20 13 23)"><path d="M13 20H16L14.5 23H13Z M17.5 20H20.5L19 23H16Z M22 20H25L23.5 23H20.5Z M26.5 20H27V23H25Z" /></g></></g>,
  // Stoneway: cippo a colonna bassa con la cima arrotondata, una tacca orizzontale, base squadrata
  pietra_miliare: <><path fillRule="evenodd" d="M15 36V21A5 5 0 0 1 25 21V36ZM16.5 26H23.5V28H16.5Z" /><path d="M12.5 36H27.5V40H12.5Z" /></>,
  // Pinegrove: ovale a punta in basso con le scaglie a rombi (tre file) e un ciuffo di tre aghi in alto
  pigna: <g transform="translate(20 27) scale(1.15) translate(-20 -27)"><><path fillRule="evenodd" d="M20 38C14 34 12.5 27 14.5 22C16 19 24 19 25.5 22C27.5 27 26 34 20 38ZM17.5 23.5L19 25L17.5 26.5L16 25ZM22.5 23.5L24 25L22.5 26.5L21 25ZM20 27L21.5 28.5L20 30L18.5 28.5ZM17.5 30.5L19 32L17.5 33.5L16 32ZM22.5 30.5L24 32L22.5 33.5L21 32Z" /><path d="M20 20L16.5 13M20 20V12M20 20L23.5 13" fill="none" strokeWidth="1.8" strokeLinecap="round" /></></g>,
  // Belltower: torre stretta con la cella aperta in alto e la campana dentro, tetto a punta
  campanile: <><path d="M14.5 19.5L20 10.5L25.5 19.5Z" /><path fillRule="evenodd" d="M15.5 19.5H24.5V39H15.5ZM17.5 21.5V28H22.5V21.5Z" /><path d="M18.3 27.2Q18.3 22.3 20 22.3Q21.7 22.3 21.7 27.2Z" /></>,
  // Waterline: tre linee ondulate parallele, spessore 2
  onde: <path d="M11 19Q13.25 16 15.5 19T20 19T24.5 19T29 19M11 25Q13.25 22 15.5 25T20 25T24.5 25T29 25M11 31Q13.25 28 15.5 31T20 31T24.5 31T29 31" fill="none" strokeWidth="2.4" strokeLinecap="round" />,
  // Lookout: torre larga con tre merli e una feritoia verticale
  torre_vedetta: <path fillRule="evenodd" d="M12 39V14.5H16V18.5H18V14.5H22V18.5H24V14.5H28V39ZM18.8 24V33H21.2V24Z" />,
  // Domepark: mezza sfera su un tamburo con tre finestre ad arco
  cupola: <g transform="translate(20 28) scale(1.12) translate(-20 -28)"><><path d="M19 17.5H21V20H19Z" /><path d="M10.5 28A9.5 9.5 0 0 1 29.5 28Z" /><path fillRule="evenodd" d="M12 29H28V37H12ZM13.8 36V32.5A1.6 1.6 0 0 1 17 32.5V36ZM18.4 36V32.5A1.6 1.6 0 0 1 21.6 32.5V36ZM23 36V32.5A1.6 1.6 0 0 1 26.2 32.5V36Z" /></></g>,
  // Tramway: vettura coi bordi arrotondati e tre finestrini, pantografo a V sul tetto
  tram: <><path d="M16 23.5L20 17L24 23.5M17 17H23" fill="none" strokeWidth="1.6" strokeLinejoin="round" /><path fillRule="evenodd" d="M12.5 23.5H27.5Q29.5 23.5 29.5 25.5V31.5Q29.5 33.5 27.5 33.5H12.5Q10.5 33.5 10.5 31.5V25.5Q10.5 23.5 12.5 23.5ZM12.5 25.5V28.5H16.5V25.5ZM18 25.5V28.5H22V25.5ZM23.5 25.5V28.5H27.5V25.5Z" /><circle cx="15" cy="35" r="1.6" /><circle cx="25" cy="35" r="1.6" /></>,
  // Railhead: due binari che convergono verso l'alto e finiscono contro un respingente
  fine_linea: <><path d="M13.5 37.5L17.5 21M26.5 37.5L22.5 21M15 32H25M16.4 26.5H23.6" fill="none" strokeWidth="2" strokeLinecap="round" /><path d="M14 15.5H26V20H14Z" /><path d="M19 20H21V22H19Z" /></>,
  // Southwind: ancora con l'anello in alto e i bracci curvi
  ancora: <><path fillRule="evenodd" d="M20 10A3 3 0 1 1 20 16A3 3 0 1 1 20 10ZM20 11.6A1.4 1.4 0 1 0 20 14.4A1.4 1.4 0 1 0 20 11.6Z" /><path d="M20 16V36M16 20H24M13.5 29Q14.5 36.5 20 36.5Q25.5 36.5 26.5 29" fill="none" strokeWidth="2.2" strokeLinecap="round" /><path d="M11.5 30.5L13.5 27L15.5 30.5Z M24.5 30.5L26.5 27L28.5 30.5Z" /></>,
  // Wallgate: arco d'ingresso fra due torri merlate
  porta_mura: <path fillRule="evenodd" d="M10.5 37V16H12.5V18H14.5V16H16.5V18H17.5V22H22.5V18H23.5V16H25.5V18H27.5V16H29.5V37ZM17 37V30.5A3 3 0 0 1 23 30.5V37Z" />,
};
const simboloDi = (id: string) => SIMBOLO[id] ?? (spento('C62S01') ? undefined : NUOVI[id]);
/** Gli id dei simboli disegnati (per i guardiani). */
export const SIMBOLI = () => [...Object.keys(SIMBOLO), ...(spento('C62S01') ? [] : Object.keys(NUOVI))];

const iniziali = (nome: string) => nome.split(/\s+/).map((x) => x[0]).join('').slice(0, 2);

export function Stemma(p: { c: Club }) {
  const forma = p.c.stemma?.forma ?? 'scudo';
  const simbolo = p.c.stemma && simboloDi(p.c.stemma.simbolo);
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

/** Gli id dei club che si sfidano: club delle curve della missione, ognuno con la sua curva. */
export function sfidanti(m: Missione): string[] {
  // C26-01: i gemellati (settore «…gemellati», come in C21-04) non sono uno sfidante: e15 ed e27 mostravano tre club.
  // Rosso C75G01: anche i gemellati.
  return m.mappa.settori.filter((s) => spento('C44S03') || (s.tipo === 'curva' && (spento('C75G01') || !s.id.includes('gemellati')))).map((s) => s.club).filter((x): x is string => !!x);
}

/** I club delle curve della missione (di solito due): la sfida della serata. Niente se non ci sono curve. */
export function Sfida(p: { m: Missione }) {
  // C20-08: la sfida è fra i club delle CURVE, ognuno una volta: con PO-102 anche le strade hanno un club (i loro
  // tifosi), e la sala diceva «Calderholt contro Calderholt contro Larkspire». Rosso C44S03: tutti i settori, come prima.
  const ids = sfidanti(p.m);
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
