// Flusso: titolo → mappa della città (D-061) → episodio: sala operativa → briefing → per ogni ondata
// schieramento → chiamate → rapporto → verbale (stelle; se fallito si rigioca, D-059) → città. La mappa tattica resta fissa in alto, le scene cambiano
// sotto. La resa legge e mostra; i calcoli stanno in src/logica. Si salva dopo ogni passo (D-040):
// la scena dentro l'ondata si ricava dal salvataggio (partita.ts), quindi una ricarica riprende lì.
import { AnimatePresence, MotionConfig } from 'motion/react';
import { useRef, useState } from 'react';
import { spento } from '../interruttori.ts';
import { variabiliIniziali } from '../logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, disponibili, missioneFinita, ondataDaRiprendere, riprendiDallOndata, rispondi, schiera, settoriAmmessi, type EsitoMissione, type InCorso } from '../logica/missione.ts';
import type { Disposizione, Missione, Opzione } from '../logica/tipi.ts';
import { SAVE_VERSION, type Salvataggio } from '../salvataggi/salvataggio.ts';
import { GAME_VERSION } from '../versione.ts';
import { carica, guidaVista, segnaGuidaVista, nuovoSeme, salva, ultimoAvviso } from './archivio.ts';
import { dichiarate, impostaGenere, missione, missioni } from './dati.ts';
import type { Genere } from '../dati/testi.ts';
import { ConfermaNuova, SceltaGenere } from './schermate/SceltaGenere.tsx';
import { Guida } from './schermate/Guida.tsx';
import { chiudiEpisodio, iniziaEpisodio, prossimoEpisodio } from './episodi.ts';
import type { Risultato } from '../logica/episodi.ts';
import { Mappa, type MappaProps } from './mappa/Mappa.tsx';
import { centro, Voli, type Volo } from './mappa/Volo.tsx';
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
import { due, Testata } from './schermate/Fumetto.tsx';
import { t } from './dati.ts';
import { Fiducia } from './fiducia.tsx';
import { useIndietroApp } from './indietro.ts';

type Schermata = 'titolo' | 'crediti' | 'conferma' | 'genere' | 'guida' | 'citta' | 'sala' | 'briefing' | 'gioco' | 'rapporto' | 'verbale';

// Interruttori rossi che agiscono sul CSS (token.css): C05R06 testi a 10 px e nomi sul bordo, C05R07 etichetta
// lunga, C05N01 stato del rapporto che va a capo sotto il nome.
const ROSSI_CSS = ['C05R06', 'C05R07', 'C05N01', 'C10S03', 'C14T01'];
const libera = (m: Missione, ic: InCorso, d: Disposizione, preferita: string | null) => {
  const disp = disponibili(m, ic);
  const ok = (r: string) => (disp[r] ?? 0) - usate(d, r) > 0;
  return preferita && ok(preferita) ? preferita : Object.keys(disp).find(ok) ?? null;
};

export function App() {
  const [sal, setSal] = useState<Salvataggio | null>(() => carica());
  const [aggiornato] = useState(() => ultimoAvviso()); // dopo carica(): avviso dell'adattamento ai dati nuovi (C-014)
  const [schermata, setSchermata] = useState<Schermata>('titolo');
  const [visti, setVisti] = useState(0);
  const [bozza, setBozza] = useState<Disposizione>({});
  // S-12 (PO-061): ogni mossa dello schieramento si può annullare («Annulla l'ultima»).
  const [storia, setStoria] = useState<Disposizione[]>([]);
  const cambiaBozza = (d: Disposizione) => { setStoria((s) => [...s, bozza]); setBozza(d); };
  const nuovaBozza = () => { setStoria([]); setBozza({}); };
  const annulla = () => { if (!storia.length || spento('C17C02')) return; setBozza(storia.at(-1)!); setStoria(storia.slice(0, -1)); setAvviso(null); };
  const [scelta, setScelta] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ m: Missione; e: EsitoMissione; r: Risultato; migliore: boolean; ic: InCorso } | null>(null);
  const [scelto, setScelto] = useState<string | null>(null); // episodio scelto sulla mappa della città
  const [voli, setVoli] = useState<Volo[]>([]); // unità in volo verso il settore (solo decorazione)
  const contaVoli = useRef(0);
  const vola = (risorsa: string, settore: string) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const da = centro(`[data-risorsa="${risorsa}"]`), a = centro(`[data-settore="${settore}"] .settore-punto`);
    if (da && a) setVoli((v) => [...v, { id: ++contaVoli.current, risorsa, da, a }]);
  };
  const [avviso, setAvviso] = useState<string | null>(null); // transenne su un settore dove non si montano (D-082)
  const [eco, setEco] = useState<Opzione | null>(null); // risposta all'ultima scelta, solo a schermo
  // Ogni azione parte dal salvataggio PIÙ RECENTE (ref), non da quello catturato quando la scena è stata
  // disegnata: un secondo tocco durante l'uscita della scena trova la chiamata già chiusa e non fa nulla (C-005 R01).
  const ultimo = useRef(sal);
  const aggiorna = (s: Salvataggio) => { ultimo.current = s; salva(s); setSal(s); };
  // Interruttore rosso C05R01: si torna allo stato catturato dalla scena (difetto originale).
  const icOra = () => (spento('C05R01') ? sal?.in_corso ?? null : ultimo.current?.in_corso ?? null);
  const conIc = (ic: InCorso | null, extra: Partial<Salvataggio> = {}) => ultimo.current && aggiorna({ ...ultimo.current, in_corso: ic, ...extra });

  impostaGenere(sal?.genere ?? 'm');
  const nuova = (genere: Genere) => {
    const seme = nuovoSeme();
    const s: Salvataggio = { save_version: SAVE_VERSION, game_version: GAME_VERSION, seme, caso: seme, variabili: variabiliIniziali(dichiarate.values()), missioni_concluse: [], episodi: {}, genere, in_corso: null, rapporto_aperto: null };
    aggiorna(s);
    // S-18 (PO-056): alla prima partita su questo telefono, la guida a passi (saltabile) prima della città.
    // Rosso C22G01: niente guida.
    if (!guidaVista() && !spento('C22G01')) { segnaGuidaVista(); setScelto(prossimoEpisodio(s)?.id ?? null); setSchermata('guida'); return; }
    alla_citta(s);
  };
  // Sulla mappa è già scelto il prossimo episodio da giocare; se sono tutti superati, l'ultimo.
  function alla_citta(s: Salvataggio) { setScelto(prossimoEpisodio(s)?.id ?? missioni.at(-1)?.id ?? null); setSchermata('citta'); }
  const riprendi = () => {
    const ic = sal?.in_corso;
    nuovaBozza(); setEco(null);
    if (!ic) { if (sal) alla_citta(sal); return; }
    // Rapporto aperto al momento del salvataggio: si torna lì (C-005 R04).
    setSchermata(missioneFinita(missione(ic.missione), ic) || (sal?.rapporto_aperto && !spento('C05R04')) ? 'rapporto' : 'gioco');
  };
  const giocaEpisodio = (id: string) => { setScelto(id); setSchermata('sala'); };

  const ic = sal?.in_corso ?? null;
  const m = ic ? missione(ic.missione) : scelto ? missione(scelto) : null;
  let nome: string = schermata;
  let corpo;
  let mappa: Omit<MappaProps, 'm'> | null = null;
  let testata: { etichetta: string; titolo: string } | null = null; // sopra la mappa, come nella bozza C2

  // Con una partita salvata, «Nuova partita» chiede conferma prima di cancellarla (C-005 R02).
  // S-21 (D-104, C14-05): «Home» dalla città e dall'episodio; il tasto indietro del telefono non esce a metà.
  const home = () => { setEco(null); setSchermata('titolo'); };
  useIndietroApp(schermata === 'titolo', () => { if (schermata === 'titolo') return false; home(); return true; });
  // S-17 (PO-060): episodio perso → si riparte dall'ondata che ha deciso l'esito, se lo stato di quell'ondata
  // c'è (salvataggi vecchi: no) e non è la prima (allora è «Ricomincia»). Rosso C21R01: solo «Ricomincia».
  const ripartenza = (x: NonNullable<typeof esito>) => {
    if (!x.r.fallita || spento('C21R01')) return null;
    const n = ondataDaRiprendere(x.e);
    const stato = n > 1 ? riprendiDallOndata(x.ic, n) : null;
    return stato ? { n, vai: () => { nuovaBozza(); setEsito(null); setScelto(x.m.id); conIc(stato, { rapporto_aperto: null }); setSchermata('gioco'); } } : null;
  };
  const titolo = <Titolo avviso={aggiornato} puoRiprendere={!!sal} nuova={() => setSchermata(sal && !spento('C05R02') ? 'conferma' : 'genere')} riprendi={riprendi} crediti={() => setSchermata('crediti')} sal={sal} importata={aggiorna} />;
  if (schermata === 'crediti') corpo = <Crediti indietro={() => setSchermata('titolo')} />;
  else if (schermata === 'conferma') corpo = <ConfermaNuova si={() => setSchermata('genere')} no={() => setSchermata('titolo')} />;
  else if (schermata === 'genere') corpo = <SceltaGenere scegli={nuova} indietro={() => setSchermata('titolo')} />;
  else if (schermata === 'guida' && sal) { nome = 'guida'; corpo = <Guida introduttiva chiudi={() => alla_citta(sal)} />; }
  else if (schermata === 'verbale' && esito && sal) {
    corpo = <Verbale m={esito.m} esito={esito.e} risultato={esito.r} migliore={esito.migliore}
      rigioca={() => giocaEpisodio(esito.m.id)} citta={() => alla_citta(sal)} home={home} riparti={ripartenza(esito)}
      prossimo={prossimoEpisodio(sal) ? () => giocaEpisodio(prossimoEpisodio(sal)!.id) : undefined} />;
  } else if (schermata === 'citta' && sal && !ic) {
    corpo = <Citta sal={sal} scelto={m} scegli={setScelto} avvia={(x) => giocaEpisodio(x.id)} home={home} />;
  }
  else if (schermata === 'titolo' || !sal || !m) { nome = 'titolo'; corpo = titolo; }
  else if (schermata === 'sala') {
    nome = 'sala';
    mappa = { accesi: m.mappa.settori.map((s) => s.id) };
    testata = { etichetta: 'Sala operativa', titolo: t(m.titolo) };
    corpo = <Sala m={m} avanti={() => { setVisti(Math.min(1, m.briefing.length)); setSchermata('briefing'); }} />;
  } else if (schermata === 'briefing') {
    const ultimo = m.briefing[visti - 1];
    mappa = { accesi: ultimo?.settore ? [ultimo.settore] : [] };
    testata = { etichetta: `Briefing · ${Math.min(visti, m.briefing.length)} di ${m.briefing.length} fonti`, titolo: t(m.titolo) };
    corpo = <Briefing m={m} visti={visti} vai={setVisti} inizia={() => {
      if (icOra()) return; // già iniziata (doppio tocco)
      nuovaBozza(); conIc(iniziaEpisodio(sal, m)); setSchermata('gioco');
    }} />;
  } else if (schermata === 'rapporto' && ic?.rapporti.length) {
    const r = ic.rapporti.at(-1)!;
    const fine = missioneFinita(m, ic);
    // C-010 C09-02: un settore scoperto non può sembrare tranquillo: almeno il giallo (livello 2).
    // Interruttore rosso C10S02: colore dalla sola tensione.
    mappa = { tensione: spento('C10S02') ? r.tensione : Object.fromEntries(Object.entries(r.tensione).map(([k, v]) => [k, (r.scoperto[k] ?? 0) > 0 ? Math.max(v, 3) : v])) };
    testata = { etichetta: `Rapporto · ondata ${r.n} di ${m.ondate.length}`, titolo: `Rapporto dell'ondata ${r.n}` };
    corpo = <Rapporto m={m} r={r} ultima={fine} prossime={fine ? {} : disponibili(m, ic)} avanti={() => {
      const ora = icOra();
      if (!ora) return; // episodio già chiuso (doppio tocco)
      if (!missioneFinita(m, ora)) { conIc(ora, { rapporto_aperto: null }); nuovaBozza(); setSchermata('gioco'); return; }
      const e = concludiMissione(m, ora, dichiarate);
      const chiuso = chiudiEpisodio(ultimo.current!, m, e); // registro, stelle, variabili (D-059…D-062)
      aggiorna({ ...chiuso.salvataggio, rapporto_aperto: null });
      setEsito({ m, e, r: chiuso.risultato, migliore: chiuso.migliore, ic: ora });
      setSchermata('verbale');
    }} />;
  } else if (!ic) { nome = 'titolo'; corpo = titolo; }
  else if (eco) {
    nome = 'risposta';
    testata = { etichetta: `Ondata ${ic.ondata}/${m.ondate.length} · la tua scelta`, titolo: t(m.titolo) };
    mappa = { tensione: ic.tensione, presenze: ic.disposizione, fisse: spento('C09S02') ? null : ic.fisse };
    corpo = <Risposta m={m} ic={ic} o={eco} avanti={() => setEco(null)} />;
  } else {
    const f = faseDi(m, ic);
    nome = f.tipo;
    const ondata = m.ondate[ic.ondata - 1];
    const cosa = f.tipo === 'chiamata' ? `chiamata ${f.numero}/${f.totale}` : f.tipo === 'chiusura' ? 'in corso' : 'schieramento';
    testata = { etichetta: `Ondata ${ic.ondata}/${m.ondate.length} · ${cosa}`, titolo: f.tipo === 'schieramento' && ondata?.titolo ? t(ondata.titolo) : t(m.titolo) };
    if (f.tipo === 'schieramento') {
      // C-010 C09-04: l'unità scelta resta scelta anche quando è finita (prima si passava in silenzio alla
      // successiva e un tocco metteva uno steward al posto di una squadra); se è finita, avviso.
      // Interruttore rosso C10S04: torna il cambio automatico.
      const sel = spento('C10S04') || !scelta ? libera(m, ic, bozza, scelta) : scelta;
      const metti = (r: string, settore: string) => {
        if ((disponibili(m, ic)[r] ?? 0) - usate(bozza, r) <= 0) {
          setAvviso(`${t(`risorsa.${r}`)}: finite. Tocca un'altra unità nel vassoio.`);
          return;
        }
        // Interruttore rosso C09S01: si accetta la risorsa ovunque (difetto: transenne sugli spalti).
        if (!spento('C09S01') && !settoriAmmessi(m, r).includes(settore)) {
          setAvviso(`${t(`risorsa.${r}`)}: in «${t(`settore.${settore}`)}» non hanno effetto, qui non si montano.`);
          return;
        }
        setAvviso(null);
        const d = structuredClone(bozza);
        d[r] = { ...(d[r] ?? {}), [settore]: (d[r]?.[settore] ?? 0) + 1 };
        cambiaBozza(d); setScelta(spento('C10S04') ? libera(m, ic, d, r) : r); vola(r, settore);
      };
      mappa = {
        tensione: ic.tensione, presenze: bozza, fisse: spento('C09S02') ? null : ic.fisse,
        vietati: sel && m.mappa.risorse[sel]?.fissa ? m.mappa.settori.map((x) => x.id).filter((x) => !settoriAmmessi(m, sel).includes(x)) : [],
        onSettore: (s) => sel && metti(sel, s),
        onTogli: (r, s) => cambiaBozza({ ...bozza, [r]: { ...bozza[r], [s]: Math.max(0, (bozza[r]?.[s] ?? 0) - 1) } }),
      };
      corpo = <Schieramento m={m} ic={ic} d={bozza} scelta={sel} avviso={avviso} scegli={(r) => { setScelta(r); setAvviso(null); }} metti={metti} azzera={() => cambiaBozza({})} annulla={storia.length ? annulla : null}
        conferma={() => { setAvviso(null); const ora = icOra(); if (ora && !ora.disposizione && ora.ondata === ic.ondata) conIc(schiera(m, ora, bozza)); }} />;
    } else if (f.tipo === 'chiamata') {
      mappa = { tensione: ic.tensione, presenze: ic.disposizione, fisse: spento('C09S02') ? null : ic.fisse, accesi: f.chiamata.settore ? [f.chiamata.settore] : [] };
      corpo = <Chiamata key={f.chiamata.id} m={m} ic={ic} c={f.chiamata} numero={f.numero} totale={f.totale}
        rispondi={(o) => {
          const ora = icOra();
          if (!spento('C05R01') && (!ora || !chiamateAperte(m, ora).some((c) => c.id === f.chiamata.id))) return; // già risposta
          if (!ora) return;
          conIc(rispondi(m, ora, f.chiamata.id, o, dichiarate));
          const scelta = f.chiamata.opzioni.find((x) => x.id === o)!;
          if (scelta.risposta) setEco(scelta);
        }} />;
    } else if (f.tipo === 'chiusura') {
      mappa = { tensione: ic.tensione, presenze: ic.disposizione, fisse: spento('C09S02') ? null : ic.fisse };
      corpo = <Chiusura m={m} ic={ic} chiudi={() => {
        const ora = icOra();
        if (!ora || faseDi(m, ora).tipo !== 'chiusura') return; // già chiusa (doppio tocco)
        const dopo = chiudiOndata(m, ora, dichiarate);
        conIc(dopo, { rapporto_aperto: dopo.rapporti.at(-1)!.n }); setSchermata('rapporto');
      }} />;
    } else { nome = 'titolo'; corpo = titolo; }
  }

  const chiave = (nome === 'chiamata' || nome === 'risposta') && ic ? `${nome}-${ic.ondata}-${Object.keys(ic.risposte).length}` : `${nome}-${ic?.ondata ?? 0}`;
  return (
    <MotionConfig reducedMotion="user">
      <main data-schermata={nome} data-ondata={ic?.ondata ?? 0} className={ROSSI_CSS.filter((x) => spento(x)).map((x) => `rosso-${x.toLowerCase()}`).join(' ')}>
        {mappa && m && testata && <Testata numero={due(m.episodio)} etichetta={testata.etichetta} titolo={testata.titolo} />}
        {ic && (schermata === 'gioco' || schermata === 'rapporto') && <Fiducia valore={Number(ic.variabili.credito ?? 0)} max={Number(dichiarate.get('credito')?.max ?? 10)} />}
        {mappa && m && <Mappa m={m} home={home} ondata={schermata === 'rapporto' ? ic?.rapporti.at(-1)?.n : Math.min(ic?.ondata ?? 1, m.ondate.length)} {...mappa} />}
        <Voli voli={voli} finito={(id) => setVoli((v) => v.filter((x) => x.id !== id))} />
        <AnimatePresence mode="wait" initial={false}>
          <Scena key={chiave} nome={nome} missione={m?.id}>{corpo}</Scena>
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
