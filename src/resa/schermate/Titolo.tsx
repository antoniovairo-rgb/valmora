import { Capacitor } from '@capacitor/core';
import { GAME_VERSION } from '../../versione.ts';
import { URL_APK } from '../collegamenti.ts';
import { t } from '../dati.ts';

export function Titolo(p: { puoRiprendere: boolean; nuova: () => void; riprendi: () => void }) {
  return (
    <section>
      <h1>{t('gioco.titolo')}</h1>
      {p.puoRiprendere && <button className="pulsante" onClick={p.riprendi}>Riprendi</button>}
      <button className={`pulsante${p.puoRiprendere ? ' secondario' : ''}`} onClick={p.nuova}>Nuova partita</button>
      {!Capacitor.isNativePlatform() && <a className="pulsante secondario" data-azione="apk" href={URL_APK}>Scarica l'app Android (APK di prova)</a>}
      <p className="tenue">{t('gioco.avviso')}</p>
      <p className="tenue">Versione {GAME_VERSION}</p>
    </section>
  );
}
