// Vignette delle schermate di gioco (S-23, PO-078):
// - apertura dell'episodio (S-15, D-096), dai dati: notte o giorno (mappa.ora), stadio con le curve nei colori dei
//   club (o una piazza se non ci sono curve), cartelloni e cantiere se i dettagli li nominano;
// - fine episodio (S-14): protagonista e vice con l'espressione dell'esito (festa, sollievo, preoccupazione, sconfitta).
// I colori dei club sono dati (D-086), gli altri solo token (classi «v-*»).
import type { Missione } from '../logica/tipi.ts';
import { club } from './dati.ts';
import { Persona, Vignetta } from './vignetta.tsx';

export function VignettaApertura(p: { m: Missione }) {
  const notte = p.m.mappa.ora === 'notte';
  const dettagli = (p.m.mappa.dettagli ?? []).map((x) => x.split('@')[0]);
  const curve = p.m.mappa.settori.filter((s) => s.tipo === 'curva').map((s) => (s.club ? club.get(s.club)?.colori : undefined));
  return (
    <Vignetta nome={`apertura-${p.m.id}`} titolo={`Apertura: ${notte ? 'notte' : 'giorno'}${curve.length ? ', stadio' : ', città'}`}>
      {notte && <rect x="0" y="0" width="320" height="180" className="v-notte" />}
      {notte && [[30, 20], [90, 34], [150, 16], [230, 28], [290, 18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" className="v-giallo" />)}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={i * 48 - 6} y={70 + (i % 3) * 12} width="40" height="110" className={`${notte ? 'v-asfalto' : 'v-grigio'} v-tratto`} />)}
      {curve.length > 0 ? (
        <g>
          <ellipse cx="160" cy="132" rx="130" ry="44" className="v-grigio v-tratto" />
          <path d="M30 132 A130 44 0 0 1 100 92 L112 112 A90 26 0 0 0 70 132 Z" fill={curve[0]?.primario ?? 'currentColor'} className="v-tratto" />
          <path d="M290 132 A130 44 0 0 0 220 92 L208 112 A90 26 0 0 1 250 132 Z" fill={curve[1]?.primario ?? 'currentColor'} className="v-tratto" />
          <ellipse cx="160" cy="134" rx="74" ry="20" className="v-prato v-tratto" />
          {([[60, 96], [260, 96]] as const).map(([x, y], i) => <g key={i}><rect x={x - 2} y={y - 40} width="4" height="40" className="v-nero" /><circle cx={x} cy={y - 44} r="7" className={notte ? 'v-faro' : 'v-bianco'} /></g>)}
        </g>
      ) : (
        <g>
          <rect x="0" y="130" width="320" height="50" className="v-grigio v-tratto" />
          {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={20 + (i * 13) % 290} cy={142 + (i % 3) * 10} r="4" className={i % 4 ? 'v-nero' : 'v-magenta'} />)}
        </g>
      )}
      {dettagli.includes('cartelloni_stadio_nuovo') && <g><rect x="8" y="40" width="70" height="34" className="v-bianco v-tratto" /><rect x="8" y="40" width="70" height="8" className="v-magenta" /><rect x="16" y="58" width="40" height="5" className="v-ciano" /></g>}
      {dettagli.includes('cantiere_stadio') && <g><rect x="250" y="20" width="5" height="60" className="v-gru" /><rect x="220" y="20" width="70" height="5" className="v-gru" /></g>}
    </Vignetta>
  );
}

const ESPRESSIONE = {
  bene: { tu: 'su', vice: 'su', titolo: 'festa' },
  medio: { tu: 'dritta', vice: 'su', titolo: 'sollievo' },
  male: { tu: 'giu', vice: 'dritta', titolo: 'preoccupazione' },
  fallita: { tu: 'giu', vice: 'giu', titolo: 'sconfitta' },
} as const;

export function VignettaEsito(p: { m: Missione; tono: 'bene' | 'medio' | 'male' | 'fallita'; genere: 'm' | 'f' }) {
  const e = ESPRESSIONE[p.tono];
  return (
    <Vignetta nome={`esito-${p.tono}`} titolo={`Fine episodio: ${e.titolo}`}>
      <rect x="0" y="130" width="320" height="50" className="v-grigio" />
      {p.tono === 'bene' && Array.from({ length: 18 }, (_, i) => <rect key={i} x={20 + (i * 37) % 280} y={14 + (i * 23) % 60} width="6" height="10" transform={`rotate(${(i * 40) % 180} ${23 + (i * 37) % 280} ${19 + (i * 23) % 60})`} className={['v-magenta', 'v-ciano', 'v-bianco'][i % 3]} />)}
      {p.tono === 'fallita' && <path d="M40 30 Q60 10 80 30 Q100 10 120 30 Q140 50 100 50 L50 50 Q20 50 40 30 Z" className="v-nuvola v-tratto" />}
      <Persona x={115} y={84} giacca="v-ciano" capelli={p.genere === 'f' ? 'lunghi' : 'corti'} bocca={e.tu} />
      <Persona x={215} y={88} s={0.95} giacca="v-nero" capelli="berretto" bocca={e.vice} baffi />
      {p.tono === 'male' && <path d="M132 64 q4 8 0 12 q-4 -4 0 -12 Z" className="v-acqua" />}
    </Vignetta>
  );
}
