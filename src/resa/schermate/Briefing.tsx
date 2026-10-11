// Briefing sulla mappa: le fonti arrivano una alla volta come messaggi; ognuna accende il suo settore
// (campo «settore» del briefing) e il vice dice la sua («<missione>.vice.briefing_<n>»).
// Vero o falso si scopre solo nel verbale (D-024).
import { ChevronRight, Play } from 'lucide-react';
import type { Missione } from '../../logica/tipi.ts';
import { t, vice } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { Messaggio } from './Scena.tsx';

export function Briefing(p: { m: Missione; visti: number; prossimo: () => void; inizia: () => void }) {
  const fonti = p.m.briefing.slice(0, p.visti);
  const finito = p.visti >= p.m.briefing.length;
  return (
    <>
      <p className="sopratitolo">Episodio {p.m.episodio} · Briefing · {fonti.length} di {p.m.briefing.length} fonti</p>
      {fonti.map((b, i) => (
        <Messaggio key={i} classe={`radio${i === fonti.length - 1 ? ' ultimo' : ''}`} dati={`fonte-${i + 1}`}>
          <div className="riga">
            <strong className="chi"><Icona di={iconaFonte(b.fonte)} />{t(`fonte.${b.fonte}`)}</strong>
            <span className="etichetta">{t(`affidabilita.${b.affidabilita}`)}</span>
          </div>
          <p>{t(b.testo)}</p>
          {b.settore && <p className="tenue">Settore: {t(`settore.${b.settore}`)}</p>}
          <p className="vice-a-margine"><span className="chi">Il vice:</span> {vice(p.m.id, `briefing_${i + 1}`)}</p>
        </Messaggio>
      ))}
      {finito
        ? <button className="pulsante" data-azione="inizia" onClick={p.inizia}><Icona di={Play} />Alla prima ondata</button>
        : <button className="pulsante" data-azione="prossimo" onClick={p.prossimo}>Prossimo messaggio<Icona di={ChevronRight} /></button>}
    </>
  );
}
