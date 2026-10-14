// Vignetta di ogni chiamata (PO-089, stile delle vignette S-23): dai dati, senza testi nuovi.
// - Il luogo viene dal tipo del settore della chiamata (strada, piazzale, curva, stazione, tornelli…); senza
//   settore, la sala operativa.
// - Chi chiama viene dalla fonte, raggruppata in pochi tipi: radio della centrale o del comando, telefono
//   (informatori, residenti, testimoni…), rete e giornali, il vice, gli uffici e i club. Persone e luoghi inventati.
// Colori solo da token (classi «v-*»); le curve coi colori del club del settore (dati, D-086).
import type { Chiamata, Missione, Variabili } from '../logica/tipi.ts';
import { club } from './dati.ts';
import { spento } from '../interruttori.ts';
import { Persona, Vignetta } from './vignetta.tsx';
import { gruppoEvento, SagomaEvento } from './vignette-evento.tsx';

type Luogo = 'strada' | 'piazzale' | 'curva' | 'stazione' | 'tornelli' | 'quartiere' | 'piazza' | 'industria' | 'acqua' | 'sala';
const LUOGHI: Record<string, Luogo> = {
  strada: 'strada', piazzale: 'piazzale', curva: 'curva', tribuna: 'curva', stazione: 'stazione', tornelli: 'tornelli', perimetro: 'tornelli',
  quartiere: 'quartiere', piazza: 'piazza', mercato: 'piazza', magazzino: 'industria', retro: 'industria', cantiere: 'industria', zona: 'industria', porto: 'acqua',
};
type Chi = 'radio' | 'telefono' | 'rete' | 'vice' | 'ufficio';
const RADIO = ['centrale_radio', 'comando', 'viabilita', 'struttura_vertice'];
const RETE = ['voci_in_rete', 'stampa_locale', 'cronista', 'messaggio_anonimo'];
const UFFICI = ['ufficio_', 'club_', 'ferrovie', 'biglietteria', 'sindacato_steward', 'organizzatori_', 'segreteria_comune', 'cerimoniale', 'servizio_ordine', 'gemellati'];
export const chiDi = (fonte: string): Chi => (fonte === 'vice' ? 'vice' : RADIO.includes(fonte) ? 'radio' : RETE.includes(fonte) ? 'rete'
  : UFFICI.some((u) => fonte.startsWith(u)) ? 'ufficio' : 'telefono');

function Sfondo(p: { luogo: Luogo; colore?: string }) {
  switch (p.luogo) {
    case 'strada': return <g><rect x="0" y="110" width="320" height="70" className="v-asfalto" /><path d="M0 146 H320" className="v-strada" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={40 + i * 18} cy={128 + (i % 3) * 6} r="5" className={i % 3 ? 'v-nero' : 'v-magenta'} />)}</g>;
    case 'piazzale': return <g><rect x="0" y="120" width="320" height="60" className="v-grigio v-tratto" /><path d="M180 120 Q250 40 320 60 V120 Z" className="v-bianco v-tratto" />
      {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={20 + (i * 17) % 300} cy={140 + (i % 3) * 10} r="4.5" className={i % 4 ? 'v-nero' : 'v-ciano'} />)}</g>;
    case 'curva': return <g><path d="M0 70 Q160 20 320 70 V180 H0 Z" className="v-grigio v-tratto" />
      {[0, 1, 2, 3].map((r) => <path key={r} d={`M0 ${86 + r * 22} Q160 ${40 + r * 22} 320 ${86 + r * 22}`} stroke={p.colore ?? 'currentColor'} className={spento('C45E02') ? 'v-linea' : 'v-club'} strokeWidth="9" fill="none" />)}</g>;
    case 'stazione': return <g><rect x="0" y="130" width="320" height="50" className="v-grigio" /><rect x="10" y="80" width="200" height="50" className="v-ciano v-tratto" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={20 + i * 38} y="90" width="26" height="18" className="v-bianco v-tratto" />)}<path d="M0 150 H320 M0 162 H320" className="v-linea" /></g>;
    case 'tornelli': return <g><rect x="0" y="40" width="320" height="90" className="v-mattone v-tratto" />{[0, 1, 2, 3].map((i) => <g key={i}><rect x={40 + i * 66} y="96" width="30" height="40" className="v-nero" /><path d={`M${55 + i * 66} 110 h24`} className="v-linea" /></g>)}<rect x="0" y="136" width="320" height="44" className="v-grigio" /></g>;
    case 'quartiere': return <g>{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={i * 66} y={70 + (i % 2) * 14} width="58" height="110" className="v-mattone v-tratto" /><rect x={i * 66 + 12} y={90 + (i % 2) * 14} width="14" height="14" className="v-giallo v-tratto" /></g>)}</g>;
    case 'piazza': return <g><rect x="0" y="120" width="320" height="60" className="v-grigio v-tratto" />{[0, 1, 2].map((i) => <g key={i}><path d={`M${30 + i * 100} 110 l35 -24 l35 24 Z`} className={`${i % 2 ? 'v-magenta' : 'v-ciano'} v-tratto`} /><rect x={36 + i * 100} y="110" width="58" height="22" className="v-bianco v-tratto" /></g>)}</g>;
    case 'industria': return <g><rect x="0" y="80" width="180" height="100" className="v-grigio v-tratto" /><path d="M0 80 L30 60 L60 80 L90 60 L120 80 L150 60 L180 80" className="v-grigio v-tratto" /><rect x="200" y="40" width="5" height="100" className="v-gru" /><rect x="180" y="40" width="80" height="5" className="v-gru" /><path d="M0 140 H320" className="v-linea" /></g>;
    case 'acqua': return <g><rect x="0" y="120" width="320" height="60" className="v-acqua v-tratto" /><path d="M60 120 L90 96 H230 L250 120 Z" className="v-bianco v-tratto" /><rect x="120" y="80" width="40" height="16" className="v-magenta v-tratto" /></g>;
    default: return <g><rect x="0" y="120" width="320" height="60" className="v-grigio v-tratto" />{[0, 1, 2].map((i) => <g key={i}><rect x={30 + i * 96} y="56" width="70" height="46" className="v-nero v-tratto" /><rect x={36 + i * 96} y="62" width="58" height="34" className="v-ciano" /></g>)}</g>;
  }
}

function Chi(p: { chi: Chi }) {
  if (p.chi === 'vice') return <Persona x={262} y={92} s={0.9} giacca="v-giacca-scura" capelli="berretto" bocca="dritta" baffi />;
  return (
    <g transform="translate(232 18)">
      <rect x="0" y="0" width="76" height="60" className="v-bianco v-tratto" />
      {p.chi === 'radio' && <g><rect x="28" y="14" width="22" height="38" className="v-nero" /><rect x="40" y="4" width="4" height="12" className="v-nero" /><rect x="32" y="20" width="14" height="8" className="v-ciano" /><path d="M56 18 q8 10 0 20 M62 12 q14 16 0 32" className="v-linea" /></g>}
      {p.chi === 'telefono' && <g><path d="M18 40 q-6 -24 12 -28 l6 10 l-8 6 q2 10 12 14 l6 -8 l10 6 q-4 16 -28 0 Z" className="v-nero" /><path d="M52 14 q8 8 4 18" className="v-linea" /></g>}
      {p.chi === 'rete' && <g><rect x="24" y="8" width="28" height="46" rx="4" className="v-nero" /><rect x="28" y="14" width="20" height="30" className="v-ciano" /><circle cx="56" cy="12" r="7" className="v-magenta" /></g>}
      {p.chi === 'ufficio' && <g><rect x="14" y="10" width="48" height="36" className="v-giallo v-tratto" /><path d="M20 20 h36 M20 28 h30 M20 36 h24" className="v-linea" /><rect x="44" y="34" width="14" height="10" className="v-magenta" /></g>}
    </g>
  );
}

export function VignettaChiamata(p: { m: Missione; c: Chiamata; variabili?: Variabili; ritaglio?: string }) {
  const s = p.m.mappa.settori.find((x) => x.id === p.c.settore);
  const luogo = s ? LUOGHI[s.tipo] ?? 'piazza' : 'sala';
  const chi = chiDi(p.c.fonte);
  const evento = gruppoEvento(p.m, p.c, p.variabili); // D-112 punto 5: cosa succede sul settore in questa ondata
  const colore = s?.club ? club.get(s.club)?.colori?.primario : undefined;
  return (
    <Vignetta fissa nome={`chiamata-${luogo}-${chi}`} titolo={`Chiamata: ${luogo}, ${chi}${evento ? `, ${evento}` : ''}`} evento={evento ?? 'nessuno'} ritaglio={p.ritaglio}>
      <Sfondo luogo={luogo} colore={colore} />
      {/* PO-092: ombra a retino sul primo piano (stile C) */}
      <path d="M0 150 L110 180 H0 Z" className="v-ombra" />
      {evento && <SagomaEvento gruppo={evento} colore={colore} />}
      <Chi chi={chi} />
    </Vignetta>
  );
}
