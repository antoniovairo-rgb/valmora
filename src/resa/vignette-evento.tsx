// D-112 punto 5 (PO-089, «fumetti scena per scena»): nella vignetta di ogni chiamata, sopra lo sfondo del luogo e il
// riquadro di chi chiama, la sagoma di ciò che succede sul settore in quell'ondata (eventi dei dati), in 7 gruppi.
// Se sul settore ci sono più eventi vince il più grave. «scontro» resta fuori campo: nuvola di polvere e «!», nessun
// gesto, nessuna arma, nessun sangue (BIBBIA: violenza fuori campo). Colori solo dalle classi «v-*»; la sciarpa del
// tifo coi colori del club del settore (dati, D-086). Rosso C45E01: nessuna sagoma, come prima.
import { spento } from '../interruttori.ts';
import type { Chiamata, Missione } from '../logica/tipi.ts';
import { valuta } from '../logica/condizioni.ts';
import type { Variabili } from '../logica/tipi.ts';

export type GruppoEvento = 'gente' | 'tifo' | 'corteo' | 'veicoli' | 'scontro' | 'biglietti' | 'fumo';
// C21-05/06: cerimonia (tribuna autorità), minaccia, lite e faida sono «gente», non tifo né rissa: i testi (e14, e18,
// e21, e26, e34) non parlano di colluttazione («Nessuno si alza»). Rosso C50G01: i gruppi di prima.
const PRIMA: Record<string, GruppoEvento> = { cerimonia: 'tifo', minaccia: 'scontro', lite: 'scontro', faida: 'scontro' };
const GRUPPI: Record<string, GruppoEvento> = {
  folla: 'gente', raduno: 'gente', assembramento: 'gente', movimento: 'gente', arrivo: 'gente', deflusso: 'gente', fuga: 'gente',
  cerimonia: 'gente', minaccia: 'gente', lite: 'gente', faida: 'gente',
  curva: 'tifo', festa: 'tifo',
  corteo: 'corteo', protesta: 'corteo', picchetto: 'corteo', presidio: 'corteo',
  furgone: 'veicoli', sosta: 'veicoli', traffico: 'veicoli', retata: 'veicoli',
  rissa: 'scontro',
  biglietti: 'biglietti', incendio: 'fumo',
};
/** Dal più grave al meno grave: decide quando sul settore ci sono eventi di più gruppi. */
export const GRAVITA: GruppoEvento[] = ['scontro', 'fumo', 'corteo', 'tifo', 'veicoli', 'biglietti', 'gente'];

/** Il gruppo dell'evento sul settore della chiamata, nell'ondata della chiamata; null senza settore o senza eventi.
 *  C21-09: un evento con «se» conta solo se la condizione è vera con le variabili della partita (senza variabili non
 *  conta, come il motore che non lo apre). Rosso C50S01: «se» ignorato. */
export function gruppoEvento(m: Missione, c: Chiamata, variabili?: Variabili): GruppoEvento | null {
  return spento('C45E01') ? null : gruppoSul(m, c, variabili);
}

/** D-126 c (C24-04): la chiamata è urgente se sul suo settore, nella sua ondata, c'è un evento in corso (stessa regola
 *  della sagoma, «se» compreso). Rosso C64U01: urgenti tutte, come prima. */
export const urgente = (m: Missione, c: Chiamata, variabili?: Variabili) => spento('C64U01') || gruppoSul(m, c, variabili) !== null;

function gruppoSul(m: Missione, c: Chiamata, variabili?: Variabili): GruppoEvento | null {
  if (!c.settore) return null;
  const ondata = m.ondate.find((o) => o.chiamate?.some((x) => x.id === c.id));
  const vale = (e: { se?: Parameters<typeof valuta>[0] }) => !e.se || spento('C50S01') || (!!variabili && valuta(e.se, variabili));
  const gruppo = (tipo: string) => (spento('C50G01') ? PRIMA[tipo] ?? GRUPPI[tipo] : GRUPPI[tipo]);
  const gruppi = new Set((ondata?.eventi ?? []).filter((e) => e.settore === c.settore && vale(e)).map((e) => gruppo(e.tipo)).filter(Boolean));
  return GRAVITA.find((g) => gruppi.has(g)) ?? null;
}

/** Omino stilizzato visto di spalle (testa e busto), alto circa 26 unità. */
/** Omino stilizzato visto di spalle (testa e busto), alto circa 26 unità: le sagome di D-112 punto 5, prima di PO-103. */
const Omino = (p: { x: number; y: number; classe?: string; braccia?: boolean }) => (
  <g transform={`translate(${p.x} ${p.y})`} data-figura="omino">
    {p.braccia && <path d="M-7 4 L-11 -10 M7 4 L11 -10" className="v-linea" />}
    <rect x="-7" y="2" width="14" height="16" rx="5" className={`${p.classe ?? 'v-nero'} v-tratto`} />
    <circle cx="0" cy="-3" r="5.5" className="v-nero v-tratto" />
  </g>
);
/** PO-103 (il PO: «le sagome sembrano insetti, meglio solo i pallini 2D»): una persona è un pallino piatto, come la folla
 *  dello sfondo della strada; col colore del club (dati) per il tifo. Rosso C48P01: gli omini di prima. */
/** C22-02: il pallino era largo 3,3-4 px senza contorno (nero sulla strada 1,37:1). Ora raggio 10 unità (6,3 px a 360),
 *  contorno nero e alone bianco: su fondo scuro si stacca l'alone, su fondo chiaro il contorno. Rosso C55P01: come prima. */
// C25-05: alone 15,5 (anello bianco 3,5 unità: 1,1 px a 360; con 15 era 0,88) e centro mai sotto 180 − alone − 2 (i
// pallini in fondo toccavano il bordo della vignetta). Rosso C72A01: alone 15 e nessun limite in basso.
const PALLINO = 10, alone = () => (spento('C72A01') ? 15 : 15.5), fondo = () => (spento('C72A01') ? Infinity : 180 - 15.5 - 2);
const Persona = (p: { x: number; y: number; classe?: string; braccia?: boolean; colore?: string }) => (spento('C48P01') ? <Omino {...p} />
  : spento('C55P01') ? (p.colore ? <circle cx={p.x} cy={p.y + 6} r="5.5" fill={p.colore} data-figura="pallino" />
    : <circle cx={p.x} cy={p.y + 6} r="5.5" className={p.classe ?? 'v-nero'} data-figura="pallino" />)
  : <PallinoPersona x={p.x} y={Math.min(p.y + 6, fondo())} classe={p.classe} colore={p.colore} />);
/** Il pallino di una persona (C22-02), anche per la folla di sfondo delle vignette (C25-06). */
export const PallinoPersona = (p: { x: number; y: number; classe?: string; colore?: string }) => (
  <g data-figura="pallino"><circle cx={p.x} cy={p.y} r={alone()} className="v-bianco" data-alone />
    <circle cx={p.x} cy={p.y} r={PALLINO} fill={p.colore} className={`${p.colore ? '' : p.classe ?? 'v-nero'} v-contorno`} data-pallino /></g>);
/** C22-02: con pallini più grandi le file si diradano, per non sovrapporsi (rosso C55P01: le file di prima). */
const fila = (prima: number, dopo: number) => (spento('C55P01') ? prima : dopo);

export function SagomaEvento(p: { gruppo: GruppoEvento; colore?: string }) {
  switch (p.gruppo) {
    case 'gente': return <g>{(spento('C55P01') ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5]).map((i) => <Persona key={i} x={22 + i * fila(26, 34)} y={150 + (i % 2) * 8} classe={i % 3 ? 'v-nero' : 'v-magenta'} />)}</g>;
    case 'tifo': return (
      <g>{[0, 1, 2, 3, 4].map((i) => <Persona key={i} x={30 + i * 34} y={150} classe="v-nero" braccia colore={i % 2 ? undefined : p.colore} />)}
        <path d="M14 132 L200 120" stroke={p.colore ?? 'currentColor'} className={spento('C45E02') ? 'v-linea' : 'v-club'} strokeWidth="7" fill="none" /></g>
    );
    case 'corteo': return (
      <g><rect x="30" y="112" width="150" height="30" className="v-bianco v-tratto" /><path d="M42 122 H168 M42 132 H140" className="v-linea" />
        <path d="M30 112 V170 M180 112 V170" className="v-linea" />{[0, 1, 2, 3].map((i) => <Persona key={i} x={52 + i * 36} y={158} classe="v-nero" />)}</g>
    );
    case 'veicoli': return (
      <g><rect x="40" y="118" width="110" height="40" rx="4" className="v-bianco v-tratto" /><rect x="150" y="128" width="34" height="30" rx="4" className="v-bianco v-tratto" />
        <rect x="156" y="132" width="20" height="12" className="v-ciano v-tratto" /><circle cx="66" cy="160" r="9" className="v-nero" /><circle cx="160" cy="160" r="9" className="v-nero" /></g>
    );
    case 'scontro': return (
      <g>{[[60, 150, 22], [88, 140, 26], [118, 152, 22], [96, 162, 18]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} className="v-bianco v-tratto" />)}
        <path d="M150 92 h40 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-20 l-10 10 v-10 h-10 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8 Z" className="v-bianco v-tratto" />
        <rect x="167" y="98" width="6" height="16" className="v-magenta" /><rect x="167" y="118" width="6" height="6" className="v-magenta" /></g>
    );
    case 'biglietti': return (
      <g><rect x="30" y="100" width="60" height="70" className="v-magenta v-tratto" /><rect x="40" y="112" width="40" height="20" className="v-ciano v-tratto" />
        {[0, 1, 2, 3].map((i) => <Persona key={i} x={108 + i * fila(24, 30)} y={152} classe="v-nero" />)}</g>
    );
    case 'fumo': return <g>{[[70, 160, 16], [80, 136, 20], [96, 108, 24], [118, 80, 26], [146, 58, 24]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} className="v-fumo v-tratto" />)}</g>;
  }
}
