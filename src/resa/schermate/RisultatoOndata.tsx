import type { EsitoOndata } from '../../logica/plancia.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';

export function RisultatoOndata(p: { m: Missione; esito: EsitoOndata; ultima: boolean; avanti: () => void }) {
  return (
    <section>
      <p className="tenue">Episodio {p.m.episodio} · Rapporto dell'ondata {p.esito.n}</p>
      <h1>Tensione {p.esito.tensione}</h1>
      {p.m.mappa.settori.map((s) => {
        const sc = p.esito.scoperto[s.id] ?? 0;
        return (
          <div className="scheda riga" key={s.id}>
            <span>{t(`settore.${s.id}`)}</span>
            <strong className={sc ? 'male' : 'bene'}>{sc ? `scoperto di ${sc}` : 'sotto controllo'}</strong>
          </div>
        );
      })}
      <button className="pulsante" data-azione="avanti" onClick={p.avanti}>{p.ultima ? 'Leggi il verbale' : 'Prossima ondata'}</button>
    </section>
  );
}
