// Flusso: titolo → mappa della città (D-061) → episodio: sala operativa → briefing → per ogni ondata
// schieramento → chiamate → rapporto → verbale (stelle; se fallito si rigioca, D-059) → città. La mappa tattica resta fissa in alto, le scene cambiano
// sotto. La resa legge e mostra; i calcoli stanno in src/logica. Si salva dopo ogni passo (D-040):
// la scena dentro l'ondata si ricava dal salvataggio (partita.ts), quindi una ricarica riprende lì.
import { AnimatePresence, MotionConfig } from 'motion/react';
import { useState } from 'react';
import { variabiliIniziali } from '../logica/condizioni.ts';
import { chiudiOndata, concludiMissione, disponibili, missioneFinita, rispondi, schiera, type EsitoMissione, type InCorso } from '../logica/missione.ts';
import type { Disposizione, Missione, Opzione } from '../logica/tipi.ts';
import { SAVE_VERSION, type Salvataggio } from '../salvataggi/salvataggio.ts';
import { GAME_VERSION } from '../versione.ts';
import { carica, nuovoSeme, salva } from './archivio.ts';
import { dichiarate, impostaGenere, missione, missioni } from './dati.ts';
import type { Genere } from '../dati/testi.ts';
import { SceltaGenere } from './schermate/SceltaGenere.tsx';
import { chiudiEpisodio, iniziaEpisodio, prossimoEpisodio } from './episodi.ts';
import type { Risultato } from '../logica/episodi.ts';
import { Mappa, type MappaProps } from './mappa/Mappa.tsx';
import { faseDi } from './partita.ts';
import { Briefing } from './schermate/Briefing.tsx';
import { Citta } from './schermate/Citta.tsx';
import { Crediti } from './schermate/Crediti.tsx';
import { Chiamata, Chiusura, Risposta } from './schermate/Ondata.tsx';
import { Rapporto } from './schermate/Rapporto.tsx';
import { Sala } from './schermate/Sala.tsx';
import { Scena } from './schermate/Scena.tsx';
import { Schieramento, usate } from './schermate/Schieramento.tsx';
import { Titolo } from './schermate/Titolo.tsx';
import { Verbale } from './schermate/Verbale.tsx';

type Schermata = 'titolo' | 'crediti' | 'genere' | 'citta' | 'sala' | 'briefing' | 'gioco' | 'rapporto' | 'verbale';

const libera = (m: Missione, ic: InCorso, d: Disposizione, preferita: string | null) => {
  const disp = disponibili(m, ic);
  const ok = (r: string) => (disp[r] ?? 0) - usate(d, r) > 0;
  return preferita && ok(preferita) ? preferita : Object.keys(disp).find(ok) ?? null;
};

export function App() {
  const [sal, setSal] = useState<Salvataggio | null>(() => carica());
  const [schermata, setSchermata] = useState<Schermata>('titolo');
  const [visti, setVisti] = useState(0);
  const [bozza, setBozza] = useState<Disposizione>({});
  const [scelta, setScelta] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ m: Missione; e: EsitoMissione; r: Risultato; migliore: boolean } | null>(null);
  const [scelto, setScelto] = useState<string | null>(null); // episodio scelto sulla mappa della città
  const [eco, setEco] = useState<Opzione | null>(null); // risposta all'ultima scelta, solo a schermo
  const aggiorna = (s: Salvataggio) => { salva(s); setSal(s); };
  const conIc = (ic: InCorso | null) => sal && aggiorna({ ...sal, in_corso: ic });

  impostaGenere(sal?.genere ?? 'm');
  const nuova = (genere: Genere) => {
    const seme = nuovoSeme();
    const s: Salvataggio = { save_version: SAVE_VERSION, game_version: GAME_VERSION, seme, caso: seme, variabili: variabiliIniziali(dichiarate.values()), missioni_concluse: [], episodi: {}, genere, in_corso: null };
    aggiorna(s);
    alla_citta(s);
  };
  // Sulla mappa è già scelto il prossimo episodio da giocare; se sono tutti superati, l'ultimo.
  function alla_citta(s: Salvataggio) { setScelto(prossimoEpisodio(s)?.id ?? missioni.at(-1)?.id ?? null); setSchermata('citta'); }
  const riprendi = () => {
    const ic = sal?.in_corso;
    setBozza({}); setEco(null);
    if (!ic) { if (sal) alla_citta(sal); return; }
    setSchermata(missioneFinita(missione(ic.missione), ic) ? 'rapporto' : 'gioco');
  };
  const giocaEpisodio = (id: string) => { setScelto(id); setSchermata('sala'); };

  const ic = sal?.in_corso ?? null;
  const m = ic ? missione(ic.missione) : scelto ? missione(scelto) : null;
  let nome: string = schermata;
  let corpo;
  let mappa: Omit<MappaProps, 'm'> | null = null;

  const titolo = <Titolo puoRiprendere={!!sal} nuova={() => setSchermata('genere')} riprendi={riprendi} crediti={() => setSchermata('crediti')} />;
  if (schermata === 'crediti') corpo = <Crediti indietro={() => setSchermata('titolo')} />;
  else if (schermata === 'genere') corpo = <SceltaGenere scegli={nuova} indietro={() => setSchermata('titolo')} />;
  else if (schermata === 'verbale' && esito && sal) {
    corpo = <Verbale m={esito.m} esito={esito.e} risultato={esito.r} migliore={esito.migliore}
      rigioca={() => giocaEpisodio(esito.m.id)} citta={() => alla_citta(sal)} />;
  } else if (schermata === 'citta' && sal && !ic) {
    corpo = <Citta sal={sal} scelto={m} scegli={setScelto} avvia={(x) => giocaEpisodio(x.id)} />;
  }
  else if (schermata === 'titolo' || !sal || !m) { nome = 'titolo'; corpo = titolo; }
  else if (schermata === 'sala') {
    nome = 'sala';
    mappa = { accesi: m.mappa.settori.map((s) => s.id) };
    corpo = <Sala m={m} avanti={() => { setVisti(Math.min(1, m.briefing.length)); setSchermata('briefing'); }} />;
  } else if (schermata === 'briefing') {
    const ultimo = m.briefing[visti - 1];
    mappa = { accesi: ultimo?.settore ? [ultimo.settore] : [] };
    corpo = <Briefing m={m} visti={visti} prossimo={() => setVisti(visti + 1)} inizia={() => {
      setBozza({}); conIc(iniziaEpisodio(sal, m)); setSchermata('gioco');
    }} />;
  } else if (schermata === 'rapporto' && ic?.rapporti.length) {
    const r = ic.rapporti.at(-1)!;
    const fine = missioneFinita(m, ic);
    mappa = { tensione: r.tensione };
    corpo = <Rapporto m={m} r={r} ultima={fine} prossime={fine ? {} : disponibili(m, ic)} avanti={() => {
      if (!fine) { setBozza({}); setSchermata('gioco'); return; }
      const e = concludiMissione(m, ic, dichiarate);
      const chiuso = chiudiEpisodio(sal, m, e); // registro, stelle, variabili (D-059…D-062)
      aggiorna(chiuso.salvataggio);
      setEsito({ m, e, r: chiuso.risultato, migliore: chiuso.migliore });
      setSchermata('verbale');
    }} />;
  } else if (!ic) { nome = 'titolo'; corpo = titolo; }
  else if (eco) {
    nome = 'risposta';
    mappa = { tensione: ic.tensione, presenze: ic.disposizione };
    corpo = <Risposta m={m} ic={ic} o={eco} avanti={() => setEco(null)} />;
  } else {
    const f = faseDi(m, ic);
    nome = f.tipo;
    if (f.tipo === 'schieramento') {
      const sel = libera(m, ic, bozza, scelta);
      const metti = (r: string, settore: string) => {
        if ((disponibili(m, ic)[r] ?? 0) - usate(bozza, r) <= 0) return;
        const d = structuredClone(bozza);
        d[r] = { ...(d[r] ?? {}), [settore]: (d[r]?.[settore] ?? 0) + 1 };
        setBozza(d); setScelta(libera(m, ic, d, r));
      };
      mappa = {
        tensione: ic.tensione, presenze: bozza,
        onSettore: (s) => sel && metti(sel, s),
        onTogli: (r, s) => setBozza((d) => ({ ...d, [r]: { ...d[r], [s]: Math.max(0, (d[r]?.[s] ?? 0) - 1) } })),
      };
      corpo = <Schieramento m={m} ic={ic} d={bozza} scelta={sel} scegli={setScelta} metti={metti} azzera={() => setBozza({})}
        conferma={() => conIc(schiera(m, ic, bozza))} />;
    } else if (f.tipo === 'chiamata') {
      mappa = { tensione: ic.tensione, presenze: ic.disposizione, accesi: f.chiamata.settore ? [f.chiamata.settore] : [] };
      corpo = <Chiamata key={f.chiamata.id} m={m} ic={ic} c={f.chiamata} numero={f.numero} totale={f.totale}
        rispondi={(o) => {
          conIc(rispondi(m, ic, f.chiamata.id, o, dichiarate));
          const scelta = f.chiamata.opzioni.find((x) => x.id === o)!;
          if (scelta.risposta) setEco(scelta);
        }} />;
    } else if (f.tipo === 'chiusura') {
      mappa = { tensione: ic.tensione, presenze: ic.disposizione };
      corpo = <Chiusura m={m} ic={ic} chiudi={() => { conIc(chiudiOndata(m, ic, dichiarate)); setSchermata('rapporto'); }} />;
    } else { nome = 'titolo'; corpo = titolo; }
  }

  const chiave = (nome === 'chiamata' || nome === 'risposta') && ic ? `${nome}-${ic.ondata}-${Object.keys(ic.risposte).length}` : `${nome}-${ic?.ondata ?? 0}`;
  return (
    <MotionConfig reducedMotion="user">
      <main data-schermata={nome} data-ondata={ic?.ondata ?? 0}>
        {mappa && m && <Mappa m={m} {...mappa} />}
        <AnimatePresence mode="wait" initial={false}>
          <Scena key={chiave} nome={nome}>{corpo}</Scena>
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
