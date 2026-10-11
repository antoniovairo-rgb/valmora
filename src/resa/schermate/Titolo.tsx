import { Capacitor } from '@capacitor/core';
import { Download, Info, Play, RotateCcw } from 'lucide-react';
import { GAME_VERSION } from '../../versione.ts';
import { URL_APK } from '../collegamenti.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';

export function Titolo(p: { puoRiprendere: boolean; nuova: () => void; riprendi: () => void; crediti: () => void }) {
  return (
    <>
      <p className="sopratitolo">Sala operativa · turno di servizio</p>
      <h1>{t('gioco.titolo')}</h1>
      {p.puoRiprendere && <button className="pulsante" onClick={p.riprendi}><Icona di={RotateCcw} />Riprendi</button>}
      <button className={`pulsante${p.puoRiprendere ? ' secondario' : ''}`} onClick={p.nuova}><Icona di={Play} />Nuova partita</button>
      {!Capacitor.isNativePlatform() && <a className="pulsante secondario" data-azione="apk" href={URL_APK}><Icona di={Download} />Scarica l'app Android (APK di prova)</a>}
      <button className="pulsante secondario" data-azione="crediti" onClick={p.crediti}><Icona di={Info} />Crediti</button>
      <p className="tenue">{t('gioco.avviso')}</p>
      <p className="tenue">Versione {GAME_VERSION}</p>
    </>
  );
}
