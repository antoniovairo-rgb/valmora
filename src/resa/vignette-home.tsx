// Vignetta della home (PO-140, D-179, proposta A approvata dal PO): sala operativa di notte, dalla finestra lo stadio
// con i fari, le curve nei colori dei club del derby di e01 (dati, D-086) e il fumo; davanti protagonista e Malvasi
// (seconda bozza approvata, D-171/D-176). Colori solo dalle classi «v-*». Come le altre vignette (PO-092) prende lo
// spazio libero della pagina fra --home-vignetta-min e --home-vignetta-max (useRiempi) e si ritaglia (slice).
import { club } from './dati.ts';
import { Persona, Vignetta } from './vignetta.tsx';

/** Stadio di notte visto da lontano: catino, folla nei colori dei club, torri dei fari con i coni. */
function StadioLontano(p: { x: number; y: number; k: number; sx?: string; dx?: string }) {
  const folla = Array.from({ length: 40 }, (_, i) => {
    const a = Math.PI * (0.06 + 0.88 * (i / 40));
    return { x: -Math.cos(a) * 62, y: -Math.sin(a) * 15, i };
  });
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${p.k})`}>
      {[-84, 84].map((fx) => (
        <g key={fx}>
          <polygon points={`${fx - 3},-40 ${fx + 3},-40 ${fx > 0 ? fx - 50 : fx + 50},16 ${fx > 0 ? fx - 10 : fx + 10},16`} className="v-cono" />
          <rect x={fx - 1.5} y={-42} width="3" height="56" className="v-nero" />
          <rect x={fx - 8} y={-50} width="16" height="9" className="v-faro v-tratto" />
        </g>
      ))}
      <ellipse cx="0" cy="0" rx="72" ry="22" className="v-cemento v-tratto" />
      {folla.map((f) => {
        const lato = f.x < -14 ? p.sx : f.x > 14 ? p.dx : undefined, curva = f.x < -14 || f.x > 14;
        return <circle key={f.i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r="1.8" fill={lato} className={curva ? (lato ? '' : 'v-magenta') : 'v-bianco'} />;
      })}
      <ellipse cx="0" cy="6" rx="48" ry="11" className="v-prato v-tratto" />
      <path d="M-72 0 Q-72 26 0 30 Q72 26 72 0 L72 12 Q72 38 0 40 Q-72 38 -72 12 Z" className="v-cemento v-tratto" />
      <path d="M-72 12 Q-72 38 0 40 Q72 38 72 12 L72 18 Q72 42 0 44 Q-72 42 -72 18 Z" className="v-ombra" />
    </g>
  );
}

const Fumo = (p: { x: number; y: number; k: number }) => (
  <path transform={`translate(${p.x} ${p.y}) scale(${p.k})`} d="M0 0 Q-6 -14 8 -16 Q12 -30 28 -24 Q40 -34 50 -20 Q64 -20 60 -6 Q66 4 52 6 L4 6 Q-8 6 0 0 Z" className="v-fumo v-tratto" />
);

export function VignettaHome(p: { genere: 'm' | 'f'; didascalia: string; fissa?: boolean }) {
  const sx = club.get('cinderwick_united')?.colori?.primario, dx = club.get('larkspire_athletic')?.colori?.primario;
  return (
    <Vignetta nome="home" titolo={`${p.didascalia}: tu e il vice Malvasi, dalla finestra lo stadio di notte`} ritaglio="xMidYMin slice" fissa={p.fissa}>
      <rect x="0" y="0" width="320" height="120" className="v-notte" />
      {[[22, 14], [70, 26], [150, 10], [262, 18], [300, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" className="v-giallo" />)}
      <path d="M0 96 L30 80 L52 88 L80 70 L96 84 L130 74 V120 H0 Z" className="v-giacca-scura v-tratto" />
      {[[8, 84], [40, 82], [60, 74], [86, 80]].map(([x, y], i) => <rect key={i} x={x} y={y} width="5" height="5" className="v-luce" />)}
      <StadioLontano x={214} y={78} k={0.95} sx={sx} dx={dx} />
      <Fumo x={128} y={96} k={0.9} /><Fumo x={262} y={100} k={0.7} />
      <path d="M0 0 H320 V120 H0 Z" className="v-cornice" />
      <rect x="0" y="118" width="320" height="62" className="v-ombra" />
      <rect x="0" y="116" width="320" height="6" className="v-nero" />
      <rect x="8" y="126" width="54" height="34" className="v-nero v-tratto" /><rect x="12" y="130" width="46" height="26" className="v-ciano" />
      <path d="M16 150 L26 142 L34 146 L44 136 L54 140" className="v-linea" />
      <Persona x={120} y={72} scala={1.15} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} distintivo sopracciglia="giu" bocca="dritta" />
      <Persona x={240} y={78} s={0.95} scala={1.15} giro={-3} giacca="v-giacca-scura" capelli="berretto" baffi braccia="conserte" bocca="su" />
    </Vignetta>
  );
}
