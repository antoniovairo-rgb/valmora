import { Capacitor } from '@capacitor/core';
import { BookOpen, Heart, Info, Lightbulb, Play, RotateCcw, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { GAME_VERSION } from '../../versione.ts';
import { spento } from '../../interruttori.ts';
import { BUILD } from '../build.ts';
import { mailIdee, URL_DONAZIONE } from '../collegamenti.ts';
import { Guida } from './Guida.tsx';
import { giaInstallata, suIphone, useInstallazione } from '../installa.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';

export function Titolo(p: { puoRiprendere: boolean; nuova: () => void; riprendi: () => void; crediti: () => void; avviso?: string | null }) {
  const [nome, sotto] = t('gioco.titolo').split(/\s+[–-]\s+/);
  const inst = useInstallazione();
  const [guida, setGuida] = useState(false);
  if (guida) return <Guida chiudi={() => setGuida(false)} />;
  return (
    <>
      <div className="logo">
        <img className="logo-icona" src="./icone/icona.svg" alt="" aria-hidden="true" data-logo />
        <h1 className="logo-nome">{nome}</h1>
        {sotto && <div className="logo-sotto">{sotto}</div>}
      </div>
      <p className="tenue" data-versione={GAME_VERSION}>Versione {GAME_VERSION} · build {spento('C05S09') ? 'sviluppo' : BUILD}</p>
      {/* C-014: salvataggio adattato ai dati nuovi (episodio in corso ripartito o sparito) */}
      {p.avviso && <p className="avviso buono" role="status" data-avviso-aggiornamento>{p.avviso}</p>}
      {p.puoRiprendere && <button className="pulsante" onClick={p.riprendi}><Icona di={RotateCcw} />Riprendi</button>}
      <button className={`pulsante${p.puoRiprendere ? ' secondario' : ''}`} onClick={p.nuova}><Icona di={Play} />Nuova partita</button>
      {inst.pronta && <button className="pulsante" data-azione="installa" onClick={inst.installa}><Icona di={Smartphone} />Installa sul telefono</button>}
      {!inst.pronta && !giaInstallata() && suIphone() && <p className="tenue" data-installa-iphone>Per installarla: Condividi → «Aggiungi alla schermata Home».</p>}
      <button className="pulsante secondario" data-azione="guida" onClick={() => setGuida(true)}><Icona di={BookOpen} />{t('guida.titolo')}</button>
      {/* PO-063: pulsanti secondari piccoli su una riga; PO-064: niente più APK (l'app passa da Play, test chiusi con l'AAB) */}
      <div className="secondari" data-sostieni>
        <button className="pulsante piccolo" data-azione="crediti" onClick={p.crediti}><Icona di={Info} />Crediti</button>
        {/* PO-050: la donazione solo dal browser, non nell'app Android, finché la regola Play non è verificata (REGOLE_PLAY §7) */}
        {!Capacitor.isNativePlatform() && <a className="pulsante piccolo" data-azione="dona" href={URL_DONAZIONE} target="_blank" rel="noopener noreferrer"><Icona di={Heart} />Sostieni</a>}
        <button type="button" className="pulsante piccolo" data-azione="idee" onClick={() => { location.href = mailIdee(GAME_VERSION); }}><Icona di={Lightbulb} />Idee</button>
      </div>
      <p className="tenue avviso-finzione">{t('gioco.avviso')}</p>
    </>
  );
}
