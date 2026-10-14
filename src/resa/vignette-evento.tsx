// D-112 punto 5 (PO-089, «fumetti scena per scena»): nella vignetta di ogni chiamata, sopra lo sfondo del luogo e il
// riquadro di chi chiama, la sagoma di ciò che succede sul settore in quell'ondata (eventi dei dati), in 7 gruppi.
// Se sul settore ci sono più eventi vince il più grave. «scontro» resta fuori campo: nuvola di polvere e «!», nessun
// gesto, nessuna arma, nessun sangue (BIBBIA: violenza fuori campo). Colori solo dalle classi «v-*»; la sciarpa del
// tifo coi colori del club del settore (dati, D-086). Rosso C45E01: nessuna sagoma, come prima.
import { spento } from '../interruttori.ts';
import type { Chiamata, Missione } from '../logica/tipi.ts';

export type GruppoEvento = 'gente' | 'tifo' | 'corteo' | 'veicoli' | 'scontro' | 'biglietti' | 'fumo';
const GRUPPI: Record<string, GruppoEvento> = {
  folla: 'gente', raduno: 'gente', assembramento: 'gente', movimento: 'gente', arrivo: 'gente', deflusso: 'gente', fuga: 'gente',
  curva: 'tifo', festa: 'tifo', cerimonia: 'tifo',
  corteo: 'corteo', protesta: 'corteo', picchetto: 'corteo', presidio: 'corteo',
  furgone: 'veicoli', sosta: 'veicoli', traffico: 'veicoli', retata: 'veicoli',
  rissa: 'scontro', lite: 'scontro', faida: 'scontro', minaccia: 'scontro',
  biglietti: 'biglietti', incendio: 'fumo',
};
/** Dal più grave al meno grave: decide quando sul settore ci sono eventi di più gruppi. */
export const GRAVITA: GruppoEvento[] = ['scontro', 'fumo', 'corteo', 'tifo', 'veicoli', 'biglietti', 'gente'];

/** Il gruppo dell'evento sul settore della chiamata, nell'ondata della chiamata; null senza settore o senza eventi. */
export function gruppoEvento(m: Missione, c: Chiamata): GruppoEvento | null {
  if (!c.settore || spento('C45E01')) return null;
  const ondata = m.ondate.find((o) => o.chiamate?.some((x) => x.id === c.id));
  const gruppi = new Set((ondata?.eventi ?? []).filter((e) => e.settore === c.settore).map((e) => GRUPPI[e.tipo]).filter(Boolean));
  return GRAVITA.find((g) => gruppi.has(g)) ?? null;
}

/** Omino stilizzato visto di spalle (testa e busto), alto circa 26 unità. */
const Omino = (p: { x: number; y: number; classe?: string; braccia?: boolean }) => (
  <g transform={`translate(${p.x} ${p.y})`}>
    {p.braccia && <path d="M-7 4 L-11 -10 M7 4 L11 -10" className="v-linea" />}
    <rect x="-7" y="2" width="14" height="16" rx="5" className={`${p.classe ?? 'v-nero'} v-tratto`} />
    <circle cx="0" cy="-3" r="5.5" className="v-nero v-tratto" />
  </g>
);

export function SagomaEvento(p: { gruppo: GruppoEvento; colore?: string }) {
  switch (p.gruppo) {
    case 'gente': return <g>{[0, 1, 2, 3, 4, 5, 6].map((i) => <Omino key={i} x={22 + i * 26} y={150 + (i % 2) * 8} classe={i % 3 ? 'v-nero' : 'v-magenta'} />)}</g>;
    case 'tifo': return (
      <g>{[0, 1, 2, 3, 4].map((i) => <Omino key={i} x={30 + i * 34} y={150} classe="v-nero" braccia />)}
        <path d="M14 132 L200 120" stroke={p.colore ?? 'currentColor'} className={spento('C45E02') ? 'v-linea' : 'v-club'} strokeWidth="7" fill="none" /></g>
    );
    case 'corteo': return (
      <g><rect x="30" y="112" width="150" height="30" className="v-bianco v-tratto" /><path d="M42 122 H168 M42 132 H140" className="v-linea" />
        <path d="M30 112 V170 M180 112 V170" className="v-linea" />{[0, 1, 2, 3].map((i) => <Omino key={i} x={52 + i * 36} y={158} classe="v-nero" />)}</g>
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
        {[0, 1, 2, 3].map((i) => <Omino key={i} x={108 + i * 24} y={152} classe="v-nero" />)}</g>
    );
    case 'fumo': return <g>{[[70, 160, 16], [80, 136, 20], [96, 108, 24], [118, 80, 26], [146, 58, 24]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} className="v-fumo v-tratto" />)}</g>;
  }
}
