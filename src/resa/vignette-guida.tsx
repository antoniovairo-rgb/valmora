// Le 6 vignette della guida «La città e il gioco» (S-23, PO-078): skyline di Vandel Falls con fonderie e collina di
// Skyfield; protagonista col vice Malvasi; mappa con le squadre; sala operativa; barra della fiducia; verbale con
// le stelle. Città e persone inventate.
import { spento } from '../interruttori.ts';
import { Persona, Vignetta } from './vignetta.tsx';

function Skyline() {
  return (
    <Vignetta nome="guida-1" titolo="Vandel Falls: le fonderie di Kiln e la collina di Skyfield">
      <path d="M190 180 Q250 60 320 70 L320 180 Z" className="v-verde v-tratto" />
      {([[232, 96], [252, 84], [272, 80], [292, 82]] as const).map(([x, y], i) => <g key={i}><rect x={x} y={y} width="14" height="12" className="v-bianco v-tratto" /><path d={`M${x - 2} ${y} L${x + 7} ${y - 8} L${x + 16} ${y} Z`} className="v-magenta v-tratto" /></g>)}
      {([[20, 70], [44, 56], [68, 74]] as const).map(([x, y], i) => <g key={i}><rect x={x} y={y} width="12" height={180 - y} className="v-mattone v-tratto" /><circle cx={x + 8} cy={y - 10} r="9" className="v-fumo" /><circle cx={x + 18} cy={y - 22} r="12" className="v-fumo" /></g>)}
      <rect x="6" y="110" width="110" height="70" className="v-grigio v-tratto" />
      <path d="M6 110 L30 96 L54 110 L78 96 L102 110 L116 102 L116 110 Z" className="v-grigio v-tratto" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={120 + i * 18} y={120 - (i % 2) * 18} width="16" height={60 + (i % 2) * 18} className="v-bianco v-tratto" />)}
      <path d="M0 166 Q160 150 320 168 L320 180 L0 180 Z" className="v-acqua v-tratto" />
    </Vignetta>
  );
}

function ChiSei(p: { genere: 'm' | 'f' }) {
  return (
    <Vignetta nome="guida-2" titolo="Tu e il vice Malvasi">
      <rect x="0" y="130" width="320" height="50" className="v-grigio" />
      <Persona x={110} y={84} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} bocca="dritta" />
      <Persona x={220} y={88} s={0.95} giacca="v-nero" capelli="berretto" bocca="su" baffi />
      {/* C41-08: fumetto più largo di 16 unità verso sinistra (il testo, 85 unità, toccava i bordi). Rosso C41G08: come prima. */}
      {spento('C41G08') ? <path d="M232 22 h70 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-50 l-14 12 l2 -12 h-8 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8 Z" className="v-bianco v-tratto" />
        : <path d="M216 22 h86 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-50 l-14 12 l2 -12 h-24 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8 Z" className="v-bianco v-tratto" />}
      <text x={spento('C41G08') ? 267 : 259} y="46" className="v-scritta">Quanto dura?</text>
    </Vignetta>
  );
}

function Mappa() {
  return (
    <Vignetta nome="guida-3" titolo="La mappa con i settori e le squadre">
      <rect x="40" y="18" width="240" height="144" className="v-asfalto v-tratto" />
      <ellipse cx="160" cy="74" rx="70" ry="38" className="v-grigio v-tratto" />
      <rect x="124" y="58" width="72" height="32" className="v-prato v-tratto" />
      <path d="M60 162 Q100 110 130 104 M260 162 Q220 110 190 104" className="v-strada" />
      {[[92, 74], [228, 74], [160, 128], [74, 140], [246, 140]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" className={`${i % 2 ? 'v-verde' : 'v-giallo'} v-tratto`} />)}
      {[[70, 44, 'v-ciano'], [206, 44, 'v-ciano'], [140, 112, 'v-magenta']].map(([x, y, c], i) => <g key={i}><rect x={x as number} y={y as number} width="36" height="20" className={`${c as string} v-tratto`} /><text x={(x as number) + 18} y={(y as number) + 15} className="v-scritta">{i === 2 ? '1' : '2'}</text></g>)}
    </Vignetta>
  );
}

function Sala(p: { genere: 'm' | 'f' }) {
  return (
    <Vignetta nome="guida-4" titolo="La sala operativa: briefing e schieramento">
      <rect x="0" y="120" width="320" height="60" className="v-grigio v-tratto" />
      <rect x="24" y="22" width="120" height="78" className="v-asfalto v-tratto" />
      {[[50, 46], [84, 70], [118, 50]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6" className="v-giallo v-tratto" />)}
      {[0, 1].map((i) => <g key={i}><rect x={170 + i * 64} y="40" width="56" height="40" className="v-nero v-tratto" /><rect x={176 + i * 64} y="46" width="44" height="28" className="v-ciano" /><rect x={192 + i * 64} y="80" width="12" height="14" className="v-nero" /></g>)}
      <rect x="150" y="104" width="160" height="16" className="v-mattone v-tratto" />
      <rect x="40" y="108" width="34" height="18" className="v-nero v-tratto" /><path d="M66 108 L80 84" className="v-linea" />
      <path d="M250 128 l8 -16 l8 16 Z" className="v-magenta v-tratto" />
      <Persona x={110} y={118} s={0.7} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} bocca="dritta" />
    </Vignetta>
  );
}

function Fiducia() {
  return (
    <Vignetta nome="guida-5" titolo="La barra della fiducia sale e scende con le scelte">
      <rect x="30" y="70" width="260" height="40" className="v-bianco v-tratto" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={36 + i * 25.2} y="76" width="21" height="28" className={i < 6 ? 'v-ciano' : 'v-rosa'} />)}
      <path d="M60 50 l14 -22 l14 22 h-8 v14 h-12 v-14 Z" className="v-verde v-tratto" />
      <path d="M232 130 l14 22 l14 -22 h-8 v-14 h-12 v14 Z" className="v-magenta v-tratto" />
      <text x="160" y="150" className="v-scritta grande">6/10</text>
    </Vignetta>
  );
}

function Verbale() {
  return (
    <Vignetta nome="guida-6" titolo="Il verbale con le stelle">
      <path d="M96 14 h128 v152 h-128 Z" className="v-bianco v-tratto" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="110" y={70 + i * 14} width={i % 2 ? 80 : 100} height="5" className="v-grigio" />)}
      {[0, 1, 2].map((i) => <path key={i} transform={`translate(${128 + i * 32} 42)`} d="M0 -14 L4 -4 L15 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-15 -4 L-4 -4 Z" className={`${i < 2 ? 'v-giallo' : 'v-bianco'} v-tratto`} />)}
      <g transform="translate(232 120) rotate(-14)"><rect x="-46" y="-14" width="92" height="28" className="v-timbro" /><text x="0" y="6" className="v-scritta timbro">CONTENUTO</text></g>
    </Vignetta>
  );
}

/** La vignetta del passo N (1-6) della guida. */
export function VignettaGuida(p: { n: number; genere: 'm' | 'f' }) {
  return [<Skyline key={1} />, <ChiSei key={2} genere={p.genere} />, <Mappa key={3} />, <Sala key={4} genere={p.genere} />, <Fiducia key={5} />, <Verbale key={6} />][p.n - 1] ?? null;
}
