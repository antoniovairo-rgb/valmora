// Vignette delle schermate di gioco (S-23, PO-078):
// - apertura dell'episodio (S-15, D-096), dai dati: notte o giorno (mappa.ora), stadio con le curve nei colori dei
//   club (o una piazza se non ci sono curve), cartelloni e cantiere se i dettagli li nominano;
// - fine episodio (S-14): protagonista e vice con l'espressione dell'esito (festa, sollievo, preoccupazione, sconfitta).
// I colori dei club sono dati (D-086), gli altri solo token (classi «v-*»).
import type { Missione } from '../logica/tipi.ts';
import { club } from './dati.ts';
import { Persona, Vignetta } from './vignetta.tsx';
import { espressioneEsito, espressioneOndata, type Espressione, type TonoEsito, type TonoOndata } from './espressioni.ts';
import { spento } from '../interruttori.ts';

/** Stadio in prospettiva di tre quarti (stile C, PO-092): catino, folla delle curve nei colori dei club (dati, D-086),
 *  campo a strisce, facciata con gli ingressi e l'ombra a retino, torri dei fari con la luce. */
function Stadio(p: { sx?: string; dx?: string; notte: boolean }) {
  const folla = Array.from({ length: 70 }, (_, i) => {
    const a = Math.PI * (0.05 + 0.9 * (i / 70)), r = 0.82 + (i % 3) * 0.05;
    return { x: 160 - Math.cos(a) * 126 * r, y: 96 - Math.sin(a) * 34 * r, i };
  });
  return (
    <g>
      {([[34, 30], [286, 30]] as const).map(([x, y]) => (
        <g key={x}>
          <polygon points={`${x - 4},${y + 6} ${x + 4},${y + 6} ${x + (x < 160 ? 70 : -70)},150 ${x + (x < 160 ? 10 : -10)},150`} className="v-cono" />
          <rect x={x - 2} y={y} width="4" height="70" className="v-nero" />
          <rect x={x - 10} y={y - 10} width="20" height="12" className={`${p.notte ? 'v-faro' : 'v-luce'} v-tratto`} />
        </g>
      ))}
      <ellipse cx="160" cy="98" rx="140" ry="44" className="v-cemento v-tratto" />
      <path d="M24 98 A136 40 0 0 1 296 98 L262 100 A102 26 0 0 0 58 100 Z" className="v-ombra" />
      {folla.map((f) => <circle key={f.i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r="1.9"
        fill={f.x < 120 ? p.sx : f.x > 200 ? p.dx : undefined} className={f.x < 120 || f.x > 200 ? (p[f.x < 120 ? 'sx' : 'dx'] ? '' : 'v-magenta') : f.i % 2 ? 'v-bianco' : 'v-nero'} />)}
      <ellipse cx="160" cy="114" rx="96" ry="22" className="v-prato v-tratto" />
      {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${94 + i * 36} 96 h18 l4 36 h-18 Z`} className="v-prato-chiaro" />)}
      <path d="M160 93 V135 M120 114 h80" className="v-linea v-bianco-linea" />
      <path d="M20 100 Q20 150 160 156 Q300 150 300 100 L300 132 Q300 172 160 176 Q20 172 20 132 Z" className="v-cemento v-tratto" />
      <path d="M20 132 Q20 172 160 176 Q300 172 300 132 L300 146 Q300 180 160 180 Q20 180 20 146 Z" className="v-ombra" />
      {Array.from({ length: 11 }, (_, i) => <rect key={i} x={38 + i * 24} y={150 - Math.abs(5 - i) * 2} width="10" height="16" className="v-giacca-scura v-tratto" />)}
    </g>
  );
}

export function VignettaApertura(p: { m: Missione }) {
  const notte = p.m.mappa.ora === 'notte';
  const dettagli = (p.m.mappa.dettagli ?? []).map((x) => x.split('@')[0]);
  const curve = p.m.mappa.settori.filter((s) => s.tipo === 'curva').map((s) => (s.club ? club.get(s.club)?.colori : undefined));
  return (
    <Vignetta nome={`apertura-${p.m.id}`} titolo={`Apertura: ${notte ? 'notte' : 'giorno'}${curve.length ? ', stadio' : ', città'}`}>
      {notte && <rect x="0" y="0" width="320" height="180" className="v-notte" />}
      {notte && [[30, 20], [90, 34], [150, 16], [230, 28], [290, 18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" className="v-giallo" />)}
      <path d="M0 150 L40 120 L70 132 L96 112 L130 128 L190 110 L230 126 L262 108 L320 128 V180 H0 Z" className="v-ombra" />
      {curve.length > 0 ? <Stadio sx={curve[0]?.primario} dx={curve[1]?.primario} notte={notte} /> : (
        <g>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <g key={i}><rect x={i * 48 - 6} y={70 + (i % 3) * 12} width="40" height="110" className={`${notte ? 'v-giacca-scura' : 'v-cemento'} v-tratto`} />
            <rect x={i * 48 + 22} y={70 + (i % 3) * 12} width="12" height="110" className="v-ombra" />
            {[0, 1, 2].map((r) => <rect key={r} x={i * 48 + 2} y={84 + (i % 3) * 12 + r * 22} width="9" height="9" className={notte ? 'v-luce' : 'v-bianco'} />)}</g>)}
          <rect x="0" y="146" width="320" height="34" className="v-cemento v-tratto" />
          {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={20 + (i * 13) % 290} cy={156 + (i % 3) * 8} r="4" className={`${i % 4 ? 'v-nero' : 'v-magenta'} v-tratto`} />)}
        </g>
      )}
      {dettagli.includes('cartelloni_stadio_nuovo') && <g><rect x="8" y="40" width="70" height="34" className="v-bianco v-tratto" /><rect x="8" y="40" width="70" height="8" className="v-magenta" /><rect x="16" y="58" width="40" height="5" className="v-ciano" /></g>}
      {dettagli.includes('cantiere_stadio') && <g><rect x="250" y="20" width="5" height="60" className="v-gru" /><rect x="220" y="20" width="70" height="5" className="v-gru" /></g>}
    </Vignetta>
  );
}

/** PO-119 / D-171: inquadratura e pose delle tavole approvate (busto, figure più grandi; il vice a braccia conserte quando
 *  è tranquillo). Rosso C114P01: posizioni della 0.38.0. */
const nuove = () => !spento('C114P01');
const quieto = (v: Espressione, tranquillo: boolean) => v.braccia ?? (tranquillo ? 'conserte' as const : undefined);
/** D-176 (quarta prova): spostamento di peso per tono, in gradi [protagonista, vice], e mano sul cinturone del protagonista
 *  nel tono calmo, come nelle tavole approvate. Rosso C114P01: niente. */
const PESO: Record<TonoOndata | TonoEsito, [number, number]> = { calmo: [-3, 2], teso: [1.5, -1], critico: [0, 1], bene: [0, 0], medio: [-2, 2], male: [1, -1], fallita: [2, -2] };
const tuo = (t: TonoOndata | TonoEsito, e: Espressione) => ({ peso: PESO[t][0], ...e, ...(t === 'calmo' && !e.braccia ? { braccia: 'cinturone' as const } : {}) });

export function VignettaEsito(p: { m: Missione; tono: TonoEsito; genere: 'm' | 'f' }) {
  const e = espressioneEsito(p.tono); // PO-059: anche sopracciglia e braccia
  return (
    <Vignetta nome={`esito-${p.tono}`} titolo={`Fine episodio: ${e.titolo}`}>
      <path d="M0 132 L40 104 L70 116 L110 96 L160 112 L210 94 L260 110 L320 98 V180 H0 Z" className="v-ombra" />
      {p.tono === 'bene' && Array.from({ length: 22 }, (_, i) => <rect key={i} x={(i * 41) % 310 + 4} y={(i * 23) % 70 + 6} width="5" height="9" transform={`rotate(${(i * 47) % 180} ${(i * 41) % 310 + 6} ${(i * 23) % 70 + 10})`} className={`${['v-magenta', 'v-ciano', 'v-bianco'][i % 3]} v-tratto`} />)}
      {p.tono === 'fallita' && <path d="M40 30 Q60 10 80 30 Q100 10 120 30 Q140 50 100 50 L50 50 Q20 50 40 30 Z" className="v-nuvola v-tratto" />}
      {nuove() ? <><Persona x={104} y={72} scala={1.15} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} {...tuo(p.tono, e.tu)} distintivo />
        <Persona x={222} y={78} s={0.95} scala={1.15} giro={-3} peso={PESO[p.tono][1]} giacca="v-giacca-scura" capelli="berretto" {...e.vice} braccia={quieto(e.vice, p.tono === 'medio')} baffi /></>
        : <><Persona x={112} y={96} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} {...e.tu} distintivo />
        <Persona x={218} y={100} s={0.92} giacca="v-giacca-scura" capelli="berretto" {...e.vice} baffi /></>}
      {p.tono === 'male' && <path d={nuove() ? 'M130 52 q4 8 0 12 q-4 -4 0 -12 Z' : 'M134 68 q4 8 0 12 q-4 -4 0 -12 Z'} className="v-acqua v-tratto" />}
    </Vignetta>
  );
}

/** PO-059: a fine ondata protagonista e vice in sala operativa, con l'espressione della tensione (espressioni.ts). */
export function VignettaOndata(p: { tono: TonoOndata; genere: 'm' | 'f'; fissa?: boolean }) {
  const e = espressioneOndata(p.tono);
  return (
    <Vignetta nome={`ondata-${p.tono}`} titolo={`Fine ondata: ${e.titolo}`} fissa={p.fissa}>
      <rect x="0" y="118" width="320" height="62" className="v-ombra" />
      <rect x="18" y="22" width="92" height="56" className="v-nero v-tratto" /><rect x="24" y="28" width="80" height="44" className="v-ciano" />
      {p.tono !== 'calmo' && <path d={p.tono === 'critico' ? 'M30 64 L48 40 L62 56 L80 32 L98 46' : 'M30 60 L50 52 L66 56 L84 46 L98 50'} className="v-linea" />}
      {nuove() ? <><Persona x={116} y={72} scala={1.15} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} {...tuo(p.tono, e.tu)} distintivo />
        <Persona x={236} y={78} s={0.95} scala={1.15} giro={-3} peso={PESO[p.tono][1]} giacca="v-giacca-scura" capelli="berretto" {...e.vice} braccia={quieto(e.vice, p.tono !== 'critico')} baffi /></>
        : <><Persona x={150} y={98} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} {...e.tu} distintivo />
        <Persona x={250} y={102} s={0.92} giacca="v-giacca-scura" capelli="berretto" {...e.vice} baffi /></>}
    </Vignetta>
  );
}
