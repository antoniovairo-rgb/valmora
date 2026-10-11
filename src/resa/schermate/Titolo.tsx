import { Capacitor } from '@capacitor/core';
import { Download, Info, Play, RotateCcw, Smartphone } from 'lucide-react';
import { GAME_VERSION } from '../../versione.ts';
import { spento } from '../../interruttori.ts';
import { BUILD } from '../build.ts';
import { URL_APK } from '../collegamenti.ts';
import { giaInstallata, suIphone, useInstallazione } from '../installa.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';

export function Titolo(p: { puoRiprendere: boolean; nuova: () => void; riprendi: () => void; crediti: () => void }) {
  const [nome, sotto] = t('gioco.titolo').split(/\s+[–-]\s+/);
  const inst = useInstallazione();
  return (
    <>
      <div className="logo">
        <h1 className="logo-nome">{nome}</h1>
        {sotto && <div className="logo-sotto">{sotto}</div>}
      </div>
      <p className="tenue" data-versione={GAME_VERSION}>Versione {GAME_VERSION} · build {spento('C05S09') ? 'sviluppo' : BUILD}</p>
      {p.puoRiprendere && <button className="pulsante" onClick={p.riprendi}><Icona di={RotateCcw} />Riprendi</button>}
      <button className={`pulsante${p.puoRiprendere ? ' secondario' : ''}`} onClick={p.nuova}><Icona di={Play} />Nuova partita</button>
      {inst.pronta && <button className="pulsante" data-azione="installa" onClick={inst.installa}><Icona di={Smartphone} />Installa sul telefono</button>}
      {!inst.pronta && !giaInstallata() && suIphone() && <p className="tenue" data-installa-iphone>Per installarla: Condividi → «Aggiungi alla schermata Home».</p>}
      {!Capacitor.isNativePlatform() && <a className="pulsante secondario" data-azione="apk" href={URL_APK}><Icona di={Download} />Scarica l'app Android (APK di prova)</a>}
      <button className="pulsante secondario" data-azione="crediti" onClick={p.crediti}><Icona di={Info} />Crediti</button>
      <div className="scheda"><p className="tenue">{t('gioco.avviso')}</p></div>
    </>
  );
}
