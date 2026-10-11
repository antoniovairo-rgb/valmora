// Verbale: esito, fonti vere e false (D-024), le scelte fatte durante le chiamate.
import { House } from 'lucide-react';
import type { EsitoMissione } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t, vice } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { sceltaLeggibile, tono } from '../partita.ts';

export function Verbale(p: { m: Missione; esito: EsitoMissione; fine: () => void }) {
  return (
    <>
      <p className="sopratitolo">Episodio {p.m.episodio} · Verbale</p>
      <h1 className={tono(p.m, p.esito.esito)} data-esito={p.esito.esito.id}>{t(`esito.${p.esito.esito.id}`)}</h1>
      <p>{t(p.esito.esito.verbale)}</p>
      <p className="vice-a-margine"><span className="chi">Il vice:</span> {vice(p.m.id, `verbale_${p.esito.esito.id}`)}</p>
      <h2>Le fonti</h2>
      {p.m.briefing.map((b, i) => (
        <div className="scheda" key={i} data-fonte={b.fonte}>
          <div className="riga"><strong className="chi"><Icona di={iconaFonte(b.fonte)} />{t(`fonte.${b.fonte}`)}</strong><strong className={b.vera ? 'bene' : 'male'}>{b.vera ? 'vera' : 'falsa'}</strong></div>
          <p className="tenue">{t(b.testo)}</p>
        </div>
      ))}
      <h2>Le tue scelte</h2>
      {p.esito.scelte.length === 0 && <p className="tenue">Nessuna chiamata in questa missione.</p>}
      {p.esito.scelte.map((x, i) => {
        const { chiamata, opzione } = sceltaLeggibile(p.m, x);
        return (
          <div className="scheda" key={i} data-scelta={`${x.chiamata}:${x.opzione}`}>
            <p className="tenue">Ondata {x.ondata} · {chiamata ? t(`fonte.${chiamata.fonte}`) : x.chiamata}</p>
            <p>{opzione ? t(opzione.testo) : x.opzione}</p>
          </div>
        );
      })}
      <button className="pulsante" onClick={p.fine}><Icona di={House} />Torna al titolo</button>
    </>
  );
}
