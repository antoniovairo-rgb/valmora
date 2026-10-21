import { Capacitor } from '@capacitor/core';
import { BookOpen, Ellipsis, Heart, Info, Lightbulb, Play, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react';
import { useRef, useState } from 'react';
import { GAME_VERSION } from '../../versione.ts';
import { spento } from '../../interruttori.ts';
import { BUILD } from '../build.ts';
import { mailIdee, URL_DONAZIONE } from '../collegamenti.ts';
import { Guida } from './Guida.tsx';
import { ConfermaImporta, PulsantiArchivio } from './Archivio.tsx';
import { dallaRiserva, persa } from '../archivio.ts';
import type { Salvataggio } from '../../salvataggi/salvataggio.ts';
import { browserInterno, giaInstallata, suAndroid, suIphone, useInstallazione } from '../installa.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { VignettaHome } from '../vignette-home.tsx';

export function Titolo(p: { puoRiprendere: boolean; nuova: () => void; riprendi: () => void; crediti: () => void; privacy: () => void; avviso?: string | null; sal: Salvataggio | null; importata: (s: Salvataggio) => void }) {
  const [daImportare, setDaImportare] = useState<Salvataggio | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [importata, setImportata] = useState(false);
  const [nome, sotto] = t('gioco.titolo').split(/\s+[–-]\s+/);
  const inst = useInstallazione();
  const [guida, setGuida] = useState(false);
  const [altro, setAltro] = useState(false);
  const tastoAltro = useRef<HTMLButtonElement>(null);
  if (guida) return <Guida chiudi={() => setGuida(false)} />;
  const versione = <p className="tenue" data-versione={GAME_VERSION}>Versione {GAME_VERSION} · build {spento('C05S09') ? 'sviluppo' : BUILD}</p>;
  const secondari = (
    <div className="secondari" data-sostieni>
      <button className="pulsante piccolo" data-azione="crediti" onClick={p.crediti}><Icona di={Info} />Crediti</button>
      {/* PO-145 (D-217): la privacy policy dentro il gioco, anche offline. Rosso C145H01: la voce manca, come prima */}
      {!spento('C145H01') && <button className="pulsante piccolo" data-azione="privacy" onClick={p.privacy}><Icona di={ShieldCheck} />{t('privacy.titolo')}</button>}
      {/* PO-050: la donazione solo dal browser, non nell'app Android, finché la regola Play non è verificata (REGOLE_PLAY §7) */}
      {!Capacitor.isNativePlatform() && <a className="pulsante piccolo" data-azione="dona" href={URL_DONAZIONE} target="_blank" rel="noopener noreferrer"><Icona di={Heart} />Sostieni</a>}
      <PulsantiArchivio sal={p.sal} chiedi={(s) => { setErrore(null); setImportata(false); setDaImportare(s); }} errore={(x) => { setImportata(false); setErrore(x); }} />
      <button type="button" className="pulsante piccolo" data-azione="idee" onClick={() => { location.href = mailIdee(GAME_VERSION); }}><Icona di={Lightbulb} />Idee</button>
    </div>
  );
  const avvisi = (<>
    {dallaRiserva && <p className="avviso" role="status" data-riserva>Il salvataggio era rovinato: ho ripreso la partita dalla copia di riserva.</p>}
    {persa && <p className="avviso" role="alert" data-persa>Il salvataggio e la sua copia di riserva sono rovinati: la partita di prima non si può riprendere. Se l'avevi esportata, caricala con «Importa».</p>}
    {errore && <p className="avviso" role="alert" data-errore-importa>{errore}</p>}
    {importata && <p className="avviso buono" role="status" data-importata>Partita importata.</p>}
    {daImportare && <ConfermaImporta nuova={daImportare} esiste={!!p.sal} annulla={() => setDaImportare(null)} fatto={(s) => { setDaImportare(null); setImportata(true); p.importata(s); }} />}
  </>);
  const installa = (<>
    {inst.pronta && <button className="pulsante" data-azione="installa" onClick={inst.installa}><Icona di={Smartphone} />Installa sul telefono</button>}
    {!inst.pronta && !giaInstallata() && suIphone() && <p className="tenue" data-installa-iphone>Per installarla: Condividi → «Aggiungi alla schermata Home».</p>}
    {/* PO-082: Android senza richiesta del browser. Rosso C30I01: nessuna spiegazione, come prima */}
    {!inst.pronta && !giaInstallata() && suAndroid() && !spento('C30I01') && <p className="tenue" data-installa-android>
      {browserInterno() ? 'Per installarla apri questa pagina in Chrome (menu ⋮ → «Apri in Chrome»).' : 'Per installarla: menu ⋮ del browser → «Installa app» o «Aggiungi a schermata Home».'}</p>}
  </>);
  const riprendi = p.puoRiprendere && <button className="pulsante" onClick={p.riprendi}><Icona di={RotateCcw} />Riprendi</button>;
  const nuova = <button className={`pulsante${p.puoRiprendere ? ' secondario' : ''}`} onClick={p.nuova}><Icona di={Play} />Nuova partita</button>;
  const tastoGuida = <button className="pulsante secondario" data-azione="guida" onClick={() => setGuida(true)}><Icona di={BookOpen} />{t('guida.titolo')}</button>;
  // PO-140 (D-179, proposta A): vignetta di sala e stadio, frase-obiettivo, premessa; azioni secondarie e versione nel
  // menu «Altro» (sempre nel DOM, nascosto: l'importazione resta raggiungibile dagli avvisi). Rosso C140H01: la home di prima.
  if (!spento('C140H01')) return (
    <>
      <div className="logo home-logo">
        <div className={spento('C25L01') ? undefined : 'logo-riga'}><img className="logo-icona" src="./icone/icona.svg" alt="" aria-hidden="true" data-logo /><h1 className="logo-nome">{nome}</h1></div>
        {sotto && <div className="logo-sotto">{sotto}</div>}
      </div>
      {avvisi}
      {p.avviso && <p className="avviso buono" role="status" data-avviso-aggiornamento>{p.avviso}</p>}
      <figure className="home-vignetta" data-home-vignetta>
        <VignettaHome genere={p.sal?.genere === 'f' ? 'f' : 'm'} didascalia={t('home.didascalia')} />
        <figcaption className="home-didascalia">{t('home.didascalia')}</figcaption>
      </figure>
      <p className="home-obiettivo" data-obiettivo>{t('home.obiettivo')}</p>
      <p className="home-premessa">{t('home.premessa')}</p>
      {riprendi}{nuova}{installa}
      <div className="home-riga">
        {tastoGuida}
        <button ref={tastoAltro} type="button" className="pulsante piccolo home-tasto-altro" data-azione="altro" aria-expanded={altro} aria-controls="home-altro" onClick={() => setAltro((x) => !x)}><Icona di={Ellipsis} />{t('home.altro')}</button>
      </div>
      <div id="home-altro" className="home-altro" data-altro hidden={!altro} onKeyDown={(e) => { if (e.key === 'Escape') { setAltro(false); tastoAltro.current?.focus(); } }}>
        {secondari}{versione}
      </div>
      <p className="tenue avviso-finzione">{t('gioco.avviso')}</p>
    </>
  );
  return (
    <>
      <div className="logo">
        {/* PO-077: icona a sinistra, affiancata al nome. Rosso C25L01: icona sopra il nome, come prima */}
        <div className={spento('C25L01') ? undefined : 'logo-riga'}>
          <img className="logo-icona" src="./icone/icona.svg" alt="" aria-hidden="true" data-logo />
          <h1 className="logo-nome">{nome}</h1>
        </div>
        {sotto && <div className="logo-sotto">{sotto}</div>}
      </div>
      {avvisi}
      {versione}
      {/* C-014: salvataggio adattato ai dati nuovi (episodio in corso ripartito o sparito) */}
      {p.avviso && <p className="avviso buono" role="status" data-avviso-aggiornamento>{p.avviso}</p>}
      {riprendi}{nuova}{installa}
      {tastoGuida}
      {/* PO-063: pulsanti secondari piccoli su una riga; PO-064: niente più APK (l'app passa da Play, test chiusi con l'AAB) */}
      {secondari}
      <p className="tenue avviso-finzione">{t('gioco.avviso')}</p>
    </>
  );
}
