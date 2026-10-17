// Finale in tre tempi (D-165), parti 2 e 3: tavole grandi, una per filo della partita, poi il bar con Malvasi.
// Disegnate dal codice in SVG come le altre vignette (vignetta.tsx, stile C D-066), colori solo dalle classi «v-*».
// Violenza fuori campo: il Fabbro è già dietro il vetro, il testimone è già al sicuro o lontano.
// PROVA (PO-130): finché il PO non approva le tavole si vedono solo con globalThis.__PROVA_D165 (tools/foto-tavole.mjs).
import type { ReactNode } from 'react';
import type { Valore } from '../logica/tipi.ts';
import { t } from './dati.ts';
import { Persona, Vignetta } from './vignetta.tsx';

export const provaTavole = () => Boolean((globalThis as Record<string, unknown>).__PROVA_D165);
type Genere = 'm' | 'f';

/** I fili delle tavole: la variabile che decide la didascalia (data/stato.json) e il nome della tavola nei testi. */
export const TAVOLE = [['fabbro', 'rapporto_dessi'], ['testimone', 'testimone'], ['busta', 'busta'], ['talpa', 'sospetti_talpa'], ['fascicolo', 'fascicolo']] as const;

const Sbarre = () => <g>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={104 + i * 14} y="18" width="4" height="120" className="v-asfalto" />)}<rect x="96" y="18" width="128" height="8" className="v-asfalto v-tratto" /></g>;

function Fabbro(p: { v: Valore }) {
  const umore = p.v === 'rispetto' ? { bocca: 'dritta' as const, sopracciglia: 'su' as const } : p.v === 'ostile' ? { bocca: 'giu' as const, sopracciglia: 'giu' as const } : { bocca: 'dritta' as const };
  return (
    <>
      <rect x="0" y="0" width="320" height="180" className="v-cemento" />
      <rect x="90" y="12" width="140" height="132" className="v-grigio v-tratto" />
      <Persona x={160} y={84} s={1.05} giacca="v-nero" capelli="corti" baffi {...umore} />
      <Sbarre />
      <rect x="0" y="138" width="320" height="42" className="v-mattone v-tratto" />
      <path d="M40 138 l14 -10 h30 l14 10 Z M222 138 l14 -10 h30 l14 10 Z" className="v-nero" />
    </>
  );
}

function Testimone(p: { v: Valore }) {
  if (p.v === 'esposto') return (
    <>
      <rect x="0" y="0" width="320" height="180" className="v-ciano" />
      <rect x="70" y="24" width="180" height="120" className="v-bianco v-tratto" transform="rotate(-4 160 84)" />
      <rect x="84" y="36" width="90" height="70" className="v-acqua v-tratto" transform="rotate(-4 160 84)" />
      <path d="M190 52 h46 M190 66 h40 M190 80 h46 M190 94 h30" className="v-linea" transform="rotate(-4 160 84)" />
      <rect x="214" y="30" width="24" height="16" className="v-magenta v-tratto" transform="rotate(-4 160 84)" />
    </>
  );
  return (
    <>
      <rect x="0" y="0" width="320" height="180" className="v-mattone" />
      <path d="M30 20 h260 v40 h-260 Z" className="v-cemento v-tratto" />
      {[60, 120, 180, 240].map((x) => <rect key={x} x={x} y="60" width="16" height="84" className="v-cemento v-tratto" />)}
      <rect x="0" y="144" width="320" height="36" className="v-grigio v-tratto" />
      {p.v === 'protetto' && <><Persona x={150} y={100} s={0.7} giacca="v-bianco" capelli="corti" bocca="dritta" /><Persona x={200} y={102} s={0.66} giacca="v-ciano" capelli="berretto" bocca="dritta" distintivo /></>}
    </>
  );
}

function Busta(p: { v: Valore }) {
  return (
    <>
      <rect x="0" y="0" width="320" height="180" className="v-mattone" />
      <rect x="0" y="112" width="320" height="68" className="v-giacca-scura" />
      {p.v === 'tenuta' && <path d="M60 112 h200 l-14 50 h-172 Z" className="v-nero v-tratto" />}
      {p.v !== 'nessuna' && <g transform={p.v === 'tenuta' ? 'translate(0 26) scale(1 0.8) translate(0 20)' : ''}>
        <rect x="100" y="54" width="120" height="76" className="v-bianco v-tratto" />
        <path d="M100 54 L160 98 L220 54" className="v-linea" />
        <circle cx="160" cy="98" r="10" className="v-magenta v-tratto" />
      </g>}
      {p.v === 'consegnata' && <g transform="rotate(-12 160 40)"><rect x="104" y="22" width="112" height="28" className="v-timbro" /><text x="160" y="42" className="v-scritta">ARCHIVIO</text></g>}
    </>
  );
}

function Talpa(p: { v: Valore }) {
  const n = Number(p.v) || 0, puntine: [number, number][] = [[52, 40], [268, 46], [60, 140], [262, 136]];
  return (
    <>
      <rect x="0" y="0" width="320" height="180" className="v-mattone" />
      <rect x="24" y="16" width="272" height="148" className="v-cemento v-tratto" />
      <rect x="122" y="38" width="76" height="96" className="v-bianco v-tratto" />
      <Persona x={160} y={84} s={0.6} giacca="v-ciano" capelli="corti" bocca="dritta" />
      {puntine.map(([x, y], i) => <g key={i}><rect x={x - 22} y={y - 14} width="44" height="28" className="v-bianco v-tratto" />{i < n && <path d={`M${x} ${y} L160 86`} className="v-timbro" />}<circle cx={x} cy={y} r="4" className="v-magenta v-tratto" /></g>)}
    </>
  );
}

function Fascicolo(p: { v: Valore }) {
  return (
    <>
      <rect x="0" y="0" width="320" height="180" className={p.v === 'nessuno' ? 'v-giacca-scura' : 'v-cemento'} />
      {p.v === 'procura' && [40, 90, 214, 264].map((x) => <rect key={x} x={x} y="20" width="16" height="100" className="v-bianco v-tratto" />)}
      {p.v === 'stampa' && <g><rect x="60" y="14" width="200" height="110" className="v-bianco v-tratto" /><rect x="72" y="24" width="176" height="18" className="v-nero" /><path d="M72 56 h80 M72 68 h80 M72 80 h80 M168 56 h80 M168 68 h80" className="v-linea" /></g>}
      {p.v === 'comando' && <path d="M160 18 l10 22 h24 l-19 15 l7 23 l-22 -14 l-22 14 l7 -23 l-19 -15 h24 Z" className="v-giallo v-tratto" />}
      {p.v === 'nessuno' && <g><rect x="84" y="20" width="152" height="120" className="v-grigio v-tratto" /><circle cx="160" cy="80" r="26" className="v-asfalto v-tratto" /><path d="M160 58 v44 M138 80 h44" className="v-bianco-linea v-linea" /></g>}
      <rect x="0" y="130" width="320" height="50" className="v-mattone v-tratto" />
      {p.v !== 'nessuno' && <g><rect x="110" y="112" width="100" height="30" className="v-giallo v-tratto" /><rect x="110" y="106" width="40" height="10" className="v-giallo v-tratto" /><text x="160" y="132" className="v-scritta">VARRONE</text></g>}
    </>
  );
}

const DISEGNI: Record<string, (p: { v: Valore }) => ReactNode> = { fabbro: Fabbro, testimone: Testimone, busta: Busta, talpa: Talpa, fascicolo: Fascicolo };

/** Una tavola grande con la didascalia scritta sulla scelta del giocatore. */
export function TavolaFilo(p: { tavola: string; valore: Valore }) {
  const D = DISEGNI[p.tavola]!;
  return (
    <figure className="tavola" data-tavola={p.tavola} data-valore={String(p.valore)}>
      <Vignetta nome={`finale-${p.tavola}`} titolo={t(`finale.${p.tavola}`)} fissa><D v={p.valore} /></Vignetta>
      <figcaption className="didascalia"><strong>{t(`finale.${p.tavola}`)}</strong> {t(`finale.${p.tavola}.${String(p.valore)}`)}</figcaption>
    </figure>
  );
}

/** Ultima tavola: protagonista e Malvasi al bar, la scommessa, «Fine» e i numeri della carriera. */
export function TavolaBar(p: { genere: Genere; carriera: string | null; numeri: string[] }) {
  const parole = t('finale.bar.battuta').split(' '), meta = Math.ceil(parole.length / 2);
  const righe = [parole.slice(0, meta).join(' '), parole.slice(meta).join(' ')];
  return (
    <figure className="tavola" data-tavola="bar" data-carriera={p.carriera ?? 'ignota'}>
      <Vignetta nome="finale-bar" titolo={t('finale.bar')} fissa>
        <rect x="0" y="0" width="320" height="180" className="v-notte" />
        <rect x="18" y="16" width="120" height="70" className="v-luce v-tratto" />
        <path d="M78 16 v70 M18 51 h120" className="v-linea" />
        <Persona x={108} y={90} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} bocca={p.carriera === 'sostituito' ? 'dritta' : 'su'} distintivo />
        <Persona x={232} y={94} s={0.95} giacca="v-giacca-scura" capelli="berretto" bocca="su" sopracciglia="su" baffi />
        <rect x="0" y="142" width="320" height="38" className="v-mattone v-tratto" />
        <path d="M146 142 v-12 h14 v12 Z M178 142 v-12 h14 v12 Z" className="v-bianco v-tratto" />
        <path d="M160 12 h148 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-70 l-14 14 l2 -14 h-66 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 Z" className="v-bianco v-tratto" />
        <text x="238" y="33" className="v-scritta">{righe[0]}</text><text x="238" y="51" className="v-scritta">{righe[1]}</text>
        <text x="160" y="171" className="v-scritta v-fine">{t('finale.fine').toUpperCase()}</text>
      </Vignetta>
      <figcaption className="didascalia"><strong>{t('finale.bar')}</strong> {t(`finale.bar.${p.carriera ?? 'ignota'}`)}</figcaption>
      <p className="riga numeri-carriera" data-numeri>{p.numeri.map((n) => <span key={n} className="etichetta">{n}</span>)}</p>
    </figure>
  );
}
