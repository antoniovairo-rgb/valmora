// Verbale: esito, e rivelazione di quali informazioni del briefing erano vere (D-024).
import type { EsitoMissione } from '../../logica/plancia.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';

export function Verbale(p: { m: Missione; esito: EsitoMissione; fine: () => void }) {
  const tono = { contenuto: 'bene', contenuto_a_fatica: 'medio' }[p.esito.esito.id] ?? 'male';
  return (
    <section>
      <p className="tenue">Episodio {p.m.episodio} · Verbale</p>
      <h1 className={tono}>{t(`esito.${p.esito.esito.id}`)}</h1>
      <p>{t(p.esito.esito.verbale)}</p>
      <p className="tenue">Tensione massima: {String(p.esito.variabili.tensione_max)}</p>
      <h2>Le fonti</h2>
      {p.m.briefing.map((b, i) => (
        <div className="scheda" key={i}>
          <div className="riga"><strong>{t(`fonte.${b.fonte}`)}</strong><strong className={b.vera ? 'bene' : 'male'}>{b.vera ? 'vera' : 'falsa'}</strong></div>
          <p className="tenue">{t(b.testo)}</p>
        </div>
      ))}
      <button className="pulsante" onClick={p.fine}>Torna al titolo</button>
    </section>
  );
}
