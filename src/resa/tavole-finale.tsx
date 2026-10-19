// Finale in tre tempi (D-165), parti 2 e 3: tavole grandi (4:3), una per filo della partita, poi il bar con Malvasi.
// Seconda prova (D-167, «più cura sui disegni»): prospettiva, luce e ombre, stadio e folla sullo sfondo, volti puliti
// (tavole-figure.tsx). Violenza fuori campo: il Fabbro è già dietro il vetro, il testimone è già al sicuro o lontano.
// Approvate dal PO (D-171): sono l'epilogo. Rosso __NO_C165T01: l'epilogo a schede di D-161, come prima delle tavole.
import type { ReactNode } from 'react';
import { spento } from '../interruttori.ts';
import type { Valore } from '../logica/tipi.ts';
import { t } from './dati.ts';
import { A, Figura, Folla, L, Retino, Tavola } from './tavole-figure.tsx';

export const conTavole = () => !spento('C165T01');
type Genere = 'm' | 'f';

/** I fili delle tavole: la variabile che decide la didascalia (data/stato.json) e il nome della tavola nei testi. */
export const TAVOLE = [['fabbro', 'rapporto_dessi'], ['testimone', 'testimone'], ['busta', 'busta'], ['talpa', 'sospetti_talpa'], ['fascicolo', 'fascicolo']] as const;

/** Stadio di notte sullo sfondo: anello degli spalti, folla, due torri faro con i coni di luce. */
function Stadio(p: { y: number; folla?: boolean }) {
  return (
    <g data-stadio>
      <path d={`M10 ${p.y + 40} Q30 ${p.y} 160 ${p.y - 4} Q290 ${p.y} 310 ${p.y + 40} Z`} className="v-giacca-scura v-tratto" />
      {p.folla && <Folla x={40} y={p.y + 10} l={240} file={3} />}
      {[34, 286].map((x) => <g key={x}>
        <rect x={x - 2} y={p.y - 46} width="4" height="56" className="v-asfalto" />
        <rect x={x - 10} y={p.y - 54} width="20" height="10" className="v-faro v-tratto" />
        <path d={`M${x - 10} ${p.y - 44} L${x < 160 ? x + 90 : x - 150} ${p.y + 40} L${x < 160 ? x + 150 : x - 90} ${p.y + 40} L${x + 10} ${p.y - 44} Z`} fill="url(#t-luce)" />
      </g>)}
    </g>
  );
}

/** Pavimento in prospettiva verso il punto di fuga, da y in giù. */
const Pavimento = (p: { y: number; classe: string }) => (
  <g>
    <rect x="0" y={p.y} width={L} height={A - p.y} className={`${p.classe} v-tratto`} />
    {[-160, -80, 0, 80, 160, 240, 320, 400, 480].map((x) => <path key={x} d={`M${x} ${A} L160 ${p.y}`} className="v-linea-fine" />)}
  </g>
);

function Fabbro(p: { v: Valore }) {
  const umore = p.v === 'rispetto' ? { bocca: 'dritta' as const, ciglia: 'su' as const } : p.v === 'ostile' ? { bocca: 'giu' as const, ciglia: 'giu' as const, occhi: 'stretti' as const } : { bocca: 'dritta' as const, ciglia: 'dritte' as const };
  return (
    <>
      {/* parlatorio: parete di fondo, lampada che scende, vetro col telaio e i riflessi, bancone in prospettiva */}
      <rect x="0" y="0" width={L} height={A} className="v-cemento" />
      <Retino d={`M0 0 H${L} V40 H0 Z`} />
      <path d="M160 0 V18 M140 18 H180 L172 28 H148 Z" className="v-nero v-tratto" />
      <path d="M148 28 L60 170 H260 L172 28 Z" fill="url(#t-luce)" />
      <Figura x={160} y={104} s={1.15} giacca="v-nero" capelli="rasati" baffi civile {...umore} />
      <rect x="40" y="30" width="240" height="146" className="v-vetro" />
      <path d="M70 40 L110 40 L60 120 L40 120 Z M230 40 L250 40 L200 130 L190 130 Z" className="v-riflesso" />
      <rect x="40" y="30" width="240" height="146" className="v-telaio" />
      <path d="M0 176 H320 L300 196 H20 Z" className="v-mattone v-tratto" /><Pavimento y={196} classe="v-giacca-scura" />
      <path d="M232 168 q-4 -22 8 -26 l10 0 q6 4 2 10 l-6 2 q-4 6 0 12 Z" className="v-nero v-tratto" />
    </>
  );
}

function Testimone(p: { v: Valore }) {
  if (p.v === 'esposto') return (
    <>
      {/* cartolina sul tavolo sotto la lampada: una città lontana, il francobollo, nessun mittente */}
      <rect x="0" y="0" width={L} height={A} className="v-giacca-scura" />
      <Retino d={`M0 170 H${L} V${A} H0 Z`} />
      <ellipse cx="160" cy="120" rx="150" ry="100" fill="url(#t-luce)" />
      <g transform="rotate(-6 160 120)">
        <path d="M54 52 L270 40 L284 190 L44 200 Z" className="v-bianco v-tratto" />
        <path d="M66 62 L170 56 L176 182 L60 188 Z" className="v-acqua v-tratto" />
        <path d="M70 150 L90 120 L104 136 L124 98 L146 128 L172 112 L174 180 L62 186 Z" className="v-giacca-scura" />
        <path d="M190 80 h70 M192 100 h66 M194 120 h70 M196 140 h50" className="v-linea" />
        <rect x="232" y="50" width="30" height="22" className="v-magenta v-tratto" />
        <circle cx="222" cy="66" r="14" className="v-timbro" />
      </g>
    </>
  );
  return (
    <>
      {/* scalinata del tribunale al tramonto, colonne con l'ombra; protetto: il testimone esce con la scorta */}
      <rect x="0" y="0" width={L} height={A} className="v-tramonto" />
      <path d="M20 30 L160 4 L300 30 Z" className="v-cemento v-tratto" />
      <rect x="28" y="30" width="264" height="14" className="v-cemento v-tratto" />
      {[44, 96, 148, 200, 252].map((x) => <g key={x}><rect x={x} y="44" width="22" height="110" className="v-cemento v-tratto" /><rect x={x + 14} y="45" width="7" height="108" className="v-ombra-colonna" /></g>)}
      <rect x="0" y="154" width={L} height="86" className="v-cemento v-tratto" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M0 ${160 + i * 16} H${L}`} className="v-linea" />)}
      {p.v === 'protetto'
        ? <><Figura x={128} y={150} s={0.9} giacca="v-bianco" capelli="corti" bocca="dritta" ciglia="su" civile /><Figura x={214} y={156} s={0.86} giacca="v-ciano" capelli="berretto" bocca="dritta" distintivo /></>
        : <path d="M90 170 h140 v12 h-140 Z" className="v-giacca-scura v-tratto" />}
    </>
  );
}

function Busta(p: { v: Valore }) {
  return (
    <>
      {/* scrivania di notte in prospettiva, lampada da tavolo, finestra con lo stadio lontano */}
      <rect x="0" y="0" width={L} height={A} className="v-notte" />
      <rect x="196" y="16" width="108" height="80" className="v-asfalto v-tratto" />
      <svg x="198" y="18" width="104" height="76" viewBox="0 0 320 180"><Stadio y={120} folla /></svg>
      <path d="M196 56 H304 M250 16 V96" className="v-telaio" />
      <path d="M0 120 L320 108 L320 240 L0 240 Z" className="v-legno v-tratto" />
      <Retino d="M0 210 L320 192 L320 240 L0 240 Z" />
      <path d="M34 118 L46 50 L70 44 M58 40 l30 -6 l6 16 l-34 8 Z" className="v-nero v-tratto" />
      <path d="M62 56 L10 200 L210 200 L92 50 Z" fill="url(#t-luce)" />
      {p.v === 'tenuta' && <path d="M60 150 L260 142 L276 200 L52 210 Z" className="v-nero v-tratto" />}
      {p.v !== 'nessuna' && <g transform={p.v === 'tenuta' ? 'translate(0 14)' : ''}>
        {/* C41-05: la busta consegnata ha la patta aperta e niente sigillo, uguale per chi l'ha aperta in e24 («Aprila
            adesso») e per chi no; la busta tenuta resta sigillata. Rosso C41B05: sigillata anche consegnata, come prima. */}
        {p.v === 'consegnata' && !spento('C41B05')
          ? <><path d="M92 120 L160 96 L232 112 Z" className="v-bianco v-tratto" data-patta="aperta" /><path d="M92 120 L232 112 L244 172 L86 180 Z" className="v-bianco v-tratto" /><path d="M92 120 L166 140 L232 112" className="v-linea" /></>
          : <><path d="M92 120 L232 112 L244 172 L86 180 Z" className="v-bianco v-tratto" /><path d="M92 120 L166 150 L232 112" className="v-linea" /><circle cx="166" cy="150" r="11" className="v-magenta v-tratto" data-sigillo /></>}
      </g>}
      {p.v === 'consegnata' && <g transform="rotate(-10 164 96)"><rect x="104" y="80" width="122" height="30" className="v-timbro" /><text x="165" y="101" className="v-scritta v-scritta-timbro">ARCHIVIO</text></g>}
    </>
  );
}

function Talpa(p: { v: Valore }) {
  const n = Number(p.v) || 0, foto: [number, number][] = [[54, 52], [266, 50], [60, 168], [262, 170]];
  return (
    <>
      {/* bacheca di sughero: Lavezzari al centro, i dubbi annotati collegati col filo rosso */}
      <rect x="0" y="0" width={L} height={A} className="v-giacca-scura" />
      <path d="M14 14 L306 6 L300 230 L20 222 Z" className="v-sughero v-tratto" />
      <Retino d="M230 8 L306 6 L300 230 L246 228 Z" />
      <rect x="112" y="44" width="96" height="124" className="v-bianco v-tratto" />
      <svg x="116" y="48" width="88" height="116" viewBox="-60 -60 120 160"><rect x="-60" y="-60" width="120" height="160" className="v-cemento" /><Figura x={0} y={0} giacca="v-ciano" capelli="corti" bocca="dritta" cravatta civile /></svg>
      {foto.map(([x, y], i) => <g key={i}>
        <rect x={x - 28} y={y - 18} width="56" height="36" className="v-bianco v-tratto" transform={`rotate(${(i % 2 ? 4 : -5)} ${x} ${y})`} />
        <path d={`M${x - 18} ${y - 4} h36 M${x - 18} ${y + 6} h26`} className="v-linea-fine" />
        {i < n && <path d={`M${x} ${y} L160 50`} className="v-filo" data-dubbio={i + 1} />}
        <circle cx={x} cy={y} r="4.5" className="v-magenta v-tratto" />
      </g>)}
      <circle cx="160" cy="50" r="4.5" className="v-magenta v-tratto" />
    </>
  );
}

function Fascicolo(p: { v: Valore }) {
  return (
    <>
      <rect x="0" y="0" width={L} height={A} className={p.v === 'nessuno' ? 'v-giacca-scura' : 'v-notte'} />
      {p.v === 'procura' && <g>{/* palazzo di giustizia di notte, finestre accese, in prospettiva */}
        <path d="M40 150 L80 20 L240 20 L280 150 Z" className="v-cemento v-tratto" />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => <rect key={`${r}${c}`} x={92 + c * 28 - r * 6} y={34 + r * 28} width={14 + r * 2} height="16" className={(r + c) % 3 ? 'v-luce v-tratto' : 'v-asfalto v-tratto'} />))}
      </g>}
      {p.v === 'stampa' && <g>{/* prima pagina */}
        <path d="M50 14 L270 22 L262 150 L42 144 Z" className="v-bianco v-tratto" />
        <path d="M62 30 L258 37 L256 62 L60 56 Z" className="v-nero" />
        <path d="M64 70 L150 73 L148 132 L60 129 Z" className="v-cemento v-tratto" />
        <path d="M162 76 h88 M162 88 h88 M162 100 h80 M162 112 h88 M162 124 h60" className="v-linea" />
      </g>}
      {p.v === 'comando' && <g>{/* stella del comando sulla parete, bandiera */}
        <path d="M160 24 l14 30 h32 l-26 20 l10 32 l-30 -19 l-30 19 l10 -32 l-26 -20 h32 Z" className="v-giallo v-tratto" />
        <path d="M40 20 V150 M40 24 h60 l-10 18 l10 18 h-60" className="v-ciano v-tratto" />
      </g>}
      {p.v === 'nessuno' && <g>{/* cassaforte socchiusa nel buio */}
        <path d="M70 30 L250 22 L256 170 L64 176 Z" className="v-grigio v-tratto" />
        <path d="M250 22 L292 40 L296 156 L256 170 Z" className="v-asfalto v-tratto" />
        <circle cx="160" cy="98" r="30" className="v-asfalto v-tratto" /><path d="M160 72 v52 M134 98 h52" className="v-linea-chiara" />
        <path d="M252 30 L300 30 L300 170 L256 168 Z" fill="url(#t-luce)" />
      </g>}
      <path d="M0 160 L320 150 L320 240 L0 240 Z" className="v-legno v-tratto" />
      <Retino d="M0 214 L320 200 L320 240 L0 240 Z" />
      {p.v !== 'nessuno' && <g>
        <path d="M96 176 L224 170 L232 216 L90 222 Z" className="v-giallo v-tratto" />
        <path d="M96 176 L140 174 L142 166 L104 168 Z" className="v-giallo v-tratto" />
        <text x="162" y="202" className="v-scritta">VARRONE</text>
      </g>}
    </>
  );
}

const DISEGNI: Record<string, (p: { v: Valore }) => ReactNode> = { fabbro: Fabbro, testimone: Testimone, busta: Busta, talpa: Talpa, fascicolo: Fascicolo };

/** Una tavola grande con la didascalia scritta sulla scelta del giocatore. */
export function TavolaFilo(p: { tavola: string; valore: Valore }) {
  const D = DISEGNI[p.tavola]!;
  return (
    <figure className="tavola" data-tavola={p.tavola} data-valore={String(p.valore)}>
      <Tavola nome={`finale-${p.tavola}`} titolo={t(`finale.${p.tavola}`)}><D v={p.valore} /></Tavola>
      <figcaption className="didascalia"><strong>{t(`finale.${p.tavola}`)}</strong> {t(`finale.${p.tavola}.${String(p.valore)}`)}</figcaption>
    </figure>
  );
}

/** Ultima tavola: protagonista e Malvasi al bar, lo stadio dalla vetrina, «Fine» e i numeri della carriera. */
export function TavolaBar(p: { genere: Genere; carriera: string | null; numeri: string[] }) {
  const parole = t('finale.bar.battuta').split(' '), meta = Math.ceil(parole.length / 2);
  const righe = [parole.slice(0, meta).join(' '), parole.slice(meta).join(' ')];
  return (
    <figure className="tavola" data-tavola="bar" data-carriera={p.carriera ?? 'ignota'}>
      <Tavola nome="finale-bar" titolo={t('finale.bar')}>
        <rect x="0" y="0" width={L} height={A} className="v-mattone" />
        <Retino d={`M0 0 H${L} V12 H0 Z`} />
        {/* vetrina sulla notte: lo stadio con la folla, i fari ancora accesi */}
        <rect x="14" y="14" width="292" height="104" className="v-notte v-tratto" />
        <svg x="16" y="16" width="288" height="100" viewBox="0 0 320 112" preserveAspectRatio="xMidYMax slice"><Stadio y={70} folla /></svg>
        <path d="M14 66 H306 M160 14 V118" className="v-telaio" />
        <Figura x={100} y={96} s={1.05} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} bocca={p.carriera === 'sostituito' ? 'dritta' : 'sorriso'} distintivo />
        <Figura x={232} y={102} s={1} giacca="v-giacca-scura" capelli="berretto" bocca="sorriso" ciglia="su" baffi rughe cravatta />
        {/* bancone in prospettiva, due tazzine */}
        <path d="M0 194 L320 186 L320 240 L0 240 Z" className="v-legno v-tratto" />
        <path d="M0 194 L320 186 L320 192 L0 200 Z" className="v-luce" />
        <path d="M140 188 v-12 h16 v12 Z M176 187 v-12 h16 v12 Z" className="v-bianco v-tratto" />
        <path d="M150 6 h150 a8 8 0 0 1 8 8 v20 a8 8 0 0 1 -8 8 h-40 l-14 10 l2 -10 h-96 a8 8 0 0 1 -8 -8 v-20 a8 8 0 0 1 8 -8 Z" className="v-bianco v-tratto" />
        <text x="226" y="22" className="v-scritta">{righe[0]}</text><text x="226" y="37" className="v-scritta">{righe[1]}</text>
        <text x="160" y="228" className="v-scritta v-scritta-fine">{t('finale.fine').toUpperCase()}</text>
      </Tavola>
      <figcaption className="didascalia"><strong>{t('finale.bar')}</strong> {t(`finale.bar.${p.carriera ?? 'ignota'}`)}</figcaption>
      <p className="riga numeri-carriera" data-numeri>{p.numeri.map((n) => <span key={n} className="etichetta">{n}</span>)}</p>
    </figure>
  );
}
