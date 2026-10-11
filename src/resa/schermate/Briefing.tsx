import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';

export function Briefing(p: { m: Missione; avanti: () => void }) {
  return (
    <section>
      <p className="tenue">Episodio {p.m.episodio} · Briefing</p>
      <h1>{t(p.m.titolo)}</h1>
      {p.m.briefing.map((b, i) => (
        <div className="scheda" key={i}>
          <div className="riga"><strong>{t(`fonte.${b.fonte}`)}</strong><span className="etichetta">{t(`affidabilita.${b.affidabilita}`)}</span></div>
          <p>{t(b.testo)}</p>
        </div>
      ))}
      <button className="pulsante" onClick={p.avanti}>Alla plancia</button>
    </section>
  );
}
