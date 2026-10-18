// PO-140, fase 1: SOLO PROPOSTE per la home, fuori dal gioco (nessun import da qui in src/). Usa gli asset veri:
// token.css, stile.css, stile-c18.css, icona del gioco, Vignetta e Persona (seconda bozza approvata, D-171/D-176),
// colori dei club dai dati (D-086). Variante da ?v=A|B|C. Testi nuovi = proposte, da far approvare al PO.
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import { createRoot } from 'react-dom/client';
import { BookOpen, Ellipsis, Play, RotateCcw } from 'lucide-react';
import '../../../../../src/resa/token.css';
import '../../../../../src/resa/stile.css';
import '../../../../../src/resa/stile-c18.css';
import './proposte.css';
import { Persona, Vignetta } from '../../../../../src/resa/vignetta.tsx';
import { Icona } from '../../../../../src/resa/icone.tsx';
import { club, t } from '../../../../../src/resa/dati.ts';
import { GAME_VERSION } from '../../../../../src/versione.ts';

const v = new URLSearchParams(location.search).get('v') ?? 'A';
const sx = club.get('cinderwick_united')?.colori?.primario, dx = club.get('larkspire_athletic')?.colori?.primario;

/** Stadio di notte visto da lontano: catino, folla nei colori dei club, fari con i coni, fumo (la «cortina»). */
function StadioLontano(p: { x: number; y: number; k: number }) {
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
      {folla.map((f) => <circle key={f.i} cx={f.x.toFixed(1)} cy={f.y.toFixed(1)} r="1.8" fill={f.x < -14 ? sx : f.x > 14 ? dx : undefined} className={f.x < -14 || f.x > 14 ? '' : 'v-bianco'} />)}
      <ellipse cx="0" cy="6" rx="48" ry="11" className="v-prato v-tratto" />
      <path d="M-72 0 Q-72 26 0 30 Q72 26 72 0 L72 12 Q72 38 0 40 Q-72 38 -72 12 Z" className="v-cemento v-tratto" />
      <path d="M-72 12 Q-72 38 0 40 Q72 38 72 12 L72 18 Q72 42 0 44 Q-72 42 -72 18 Z" className="v-ombra" />
    </g>
  );
}

const Fumo = (p: { x: number; y: number; k?: number }) => (
  <path transform={`translate(${p.x} ${p.y}) scale(${p.k ?? 1})`} d="M0 0 Q-6 -14 8 -16 Q12 -30 28 -24 Q40 -34 50 -20 Q64 -20 60 -6 Q66 4 52 6 L4 6 Q-8 6 0 0 Z" className="v-fumo v-tratto" />
);

/** A e C: sala operativa di notte, finestra sullo stadio, protagonista e Malvasi (pose della vignetta di fine ondata). */
function SalaStadio(p: { nome: string; copertina?: boolean }) {
  return (
    <Vignetta nome={p.nome} titolo="Sala operativa di notte, con lo stadio dalla finestra: tu e il vice Malvasi" fissa>
      <rect x="0" y="0" width="320" height="120" className="v-notte" />
      {[[22, 14], [70, 26], [150, 10], [262, 18], [300, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" className="v-giallo" />)}
      <path d="M0 96 L30 80 L52 88 L80 70 L96 84 L130 74 V120 H0 Z" className="v-giacca-scura v-tratto" />
      {[[8, 84], [40, 82], [60, 74], [86, 80]].map(([x, y], i) => <rect key={i} x={x} y={y} width="5" height="5" className="v-luce" />)}
      <StadioLontano x={p.copertina ? 160 : 214} y={78} k={p.copertina ? 1.05 : 0.95} />
      <Fumo x={p.copertina ? 54 : 128} y={96} k={0.9} /><Fumo x={p.copertina ? 222 : 262} y={100} k={0.7} />
      {/* telaio della finestra della sala */}
      <path d="M0 0 H320 V120 H0 Z M0 118 H320" className="v-cornice" />
      <rect x="0" y="118" width="320" height="62" className="v-ombra" />
      <rect x="0" y="116" width="320" height="6" className="v-nero" />
      {!p.copertina && <g><rect x="8" y="126" width="54" height="34" className="v-nero v-tratto" /><rect x="12" y="130" width="46" height="26" className="v-ciano" />
        <path d="M16 150 L26 142 L34 146 L44 136 L54 140" className="v-linea" /></g>}
      <Persona x={p.copertina ? 104 : 120} y={72} scala={1.15} giacca="v-ciano" capelli="corti" distintivo sopracciglia="giu" bocca="dritta" />
      <Persona x={p.copertina ? 222 : 240} y={78} s={0.95} scala={1.15} giro={-3} giacca="v-giacca-scura" capelli="berretto" baffi braccia="conserte" bocca="su" />
    </Vignetta>
  );
}

/** B: mappa stilizzata della città come fondo della metà alta: fonderie di Cinderwick a sinistra, collina di Larkspire
 *  a destra, fiume, viali, stadio della serata cerchiato (D-032). */
function MappaSfondo() {
  return (
    <div className="p-b-mappa" aria-hidden="true">
      <svg viewBox="0 0 360 380" preserveAspectRatio="xMidYMax slice" className="vignetta">
        <rect width="360" height="380" className="v-giallo" />
        <rect width="360" height="380" fill="url(#p-retino)" />
        <defs><pattern id="p-retino" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.2" className="v-retino" /></pattern></defs>
        <path d="M-10 250 Q90 230 150 270 T380 300 V330 Q260 320 160 300 T-10 285 Z" className="v-acqua v-tratto" />
        <path d="M0 190 L360 175 M120 0 L150 380 M0 360 L360 345" className="v-strada" style={{ strokeWidth: 9, fill: 'none' }} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={6 + (i % 3) * 34} y={300 + Math.floor(i / 3) * 34} width="28" height="26" className="v-mattone v-tratto" />)}
        {[14, 52, 90].map((x) => <g key={x}><rect x={x} y={250} width="9" height="50" className="v-cemento v-tratto" /><Fumo x={x - 8} y={248} k={0.6} /></g>)}
        <path d="M200 190 Q290 120 380 160 V240 H200 Z" className="v-verde v-tratto" />
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={262 + (i % 2) * 40} y={168 + Math.floor(i / 2) * 26} width="22" height="16" className="v-bianco v-tratto" />)}
        <StadioLontano x={252} y={312} k={0.62} />
        <ellipse cx="252" cy="316" rx="62" ry="34" style={{ stroke: 'var(--magenta)', strokeWidth: 5, fill: 'none' }} />
      </svg>
    </div>
  );
}

const Logo = () => {
  const [nome, sotto] = t('gioco.titolo').split(/\s+[–-]\s+/);
  return (
    <div className="p-logo">
      <div className="logo-riga"><img className="logo-icona" src="/icone/icona.svg" alt="" /><h1 className="logo-nome">{nome}</h1></div>
      <div className="p-sotto">{sotto}</div>
    </div>
  );
};

const Pulsanti = () => (
  <div className="p-pulsanti">
    <button className="pulsante"><Icona di={RotateCcw} />Riprendi</button>
    <button className="pulsante secondario"><Icona di={Play} />Nuova partita</button>
    <div className="p-riga">
      <button className="pulsante secondario" style={{ flex: 1 }}><Icona di={BookOpen} />{t('guida.titolo')}</button>
      <button className="pulsante piccolo p-altro" style={{ flex: 'none' }}><Icona di={Ellipsis} />Altro</button>
    </div>
  </div>
);

function A() {
  return (<>
    <Logo />
    <div className="p-riquadro"><SalaStadio nome="home-a" /><span className="p-didascalia">Sala operativa · stasera si gioca</span></div>
    <p className="p-obiettivo">Tieni la città calma nei giorni di partita.</p>
    <p className="p-chi">Sei il responsabile <b>ad interim</b> dell'ordine pubblico di Valmora. Malvasi, il tuo vice, scommette su quanto duri.</p>
    <Pulsanti />
    <p className="tenue avviso-finzione">{t('gioco.avviso')}</p>
  </>);
}

function B() {
  return (<>
    <div className="p-b-alto">
      <MappaSfondo />
      <Logo />
      <div className="p-spazio-mappa" />
      <span className="p-quartiere" style={{ left: 'var(--spazio-2)', bottom: 'var(--spazio-1)' }}>Cinderwick</span>
      <span className="p-quartiere" style={{ right: 'var(--spazio-2)', top: '44%' }}>Larkspire</span>
      <span className="p-segno" style={{ right: 'var(--spazio-5)', bottom: 'calc(var(--spazio-6) * 2.4)' }}>Stasera: derby</span>
    </div>
    <div className="p-stasera">
      <span className="p-timbro">Stasera · episodio 1</span>
      <h2>Derby allo stadio: fonderie contro collina</h2>
      <div className="p-riga">
        <div style={{ flex: 1 }}><p>{t('e01.titolo')}. Dalla sala operativa, con il vice Malvasi, decidi dove mandare squadre, steward e mediatore.</p></div>
        <svg className="vignetta p-busti" viewBox="60 20 230 140" style={{ height: 'auto', minHeight: 0, maxHeight: 'none', margin: 0 }} aria-hidden="true">
          <rect x="60" y="20" width="230" height="140" className="v-ciano" />
          <Persona x={120} y={72} scala={1.15} giacca="v-ciano" capelli="corti" distintivo />
          <Persona x={240} y={78} s={0.95} scala={1.15} giro={-3} giacca="v-giacca-scura" capelli="berretto" baffi braccia="conserte" bocca="su" />
        </svg>
      </div>
    </div>
    <p className="p-obiettivo">Tieni Valmora calma, una partita alla volta.</p>
    <Pulsanti />
    <p className="tenue avviso-finzione">{t('gioco.avviso')}</p>
  </>);
}

function C() {
  return (<>
    <div className="p-copertina">
      <div className="p-testata"><span>N. 1 · Stagione 1</span><span>Giorni di partita</span></div>
      <h1 className="p-titolone">Valmora</h1>
      <div className="p-sotto">Cortina di fumo</div>
      <div className="p-riquadro"><SalaStadio nome="home-c" copertina /></div>
      <p className="p-premessa">Il tuo predecessore è stato rimosso in fretta e nessuno voleva il posto. Ora l'ordine pubblico di Valmora, nei giorni di partita, è tuo: ad interim.</p>
      <div className="p-nuvola"><b>Malvasi, il vice</b>«Sei il quarto ad interim in due anni: ho una scommessa su quanto duri.»</div>
    </div>
    <Pulsanti />
    <p className="tenue avviso-finzione">{t('gioco.avviso')}</p>
  </>);
}

createRoot(document.getElementById('app')!).render(
  <main data-schermata="titolo" data-proposta={v}>
    <small className="versione-angolo" data-versione-angolo aria-hidden="true">v{GAME_VERSION}</small>
    {v === 'B' ? <B /> : v === 'C' ? <C /> : <A />}
  </main>,
);
