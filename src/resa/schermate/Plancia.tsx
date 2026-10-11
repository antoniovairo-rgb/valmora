// Disposizione delle risorse prima di un'ondata (D-038). Le pressioni non si vedono prima:
// si decide sul briefing, il risultato le rivela (D-041).
import { useState } from 'react';
import { controllaDisposizione } from '../../logica/plancia.ts';
import type { Disposizione, Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';

export function Plancia(p: { m: Missione; n: number; iniziale: Disposizione; avvia: (d: Disposizione) => void }) {
  const risorse = Object.entries(p.m.mappa.risorse);
  const [d, setD] = useState<Disposizione>(() => (controllaDisposizione(p.m, p.iniziale).length ? {} : structuredClone(p.iniziale)));
  const usate = (r: string) => Object.values(d[r] ?? {}).reduce((s, x) => s + x, 0);
  const cambia = (r: string, settore: string, delta: number) => setD((x) => {
    const y = structuredClone(x);
    y[r] = { ...(y[r] ?? {}), [settore]: Math.max(0, (y[r]?.[settore] ?? 0) + delta) };
    return y;
  });
  const ondata = p.m.ondate[p.n - 1]!;
  return (
    <section>
      <p className="tenue">Episodio {p.m.episodio} · Ondata {p.n} di {p.m.ondate.length}</p>
      <h1>{ondata.titolo ? t(ondata.titolo) : `Ondata ${p.n}`}</h1>
      <div className="disponibili riga">
        {risorse.map(([r, ris]) => <span key={r} className="etichetta" data-risorsa={r}>{t(`risorsa.${r}`)}: {ris.quantita - usate(r)} libere</span>)}
      </div>
      {p.m.mappa.settori.map((s) => (
        <div className="scheda" key={s.id} data-settore={s.id}>
          <strong>{t(`settore.${s.id}`)}</strong>
          {risorse.map(([r, ris]) => (
            <div className="riga" key={r}>
              <span>{t(`risorsa.${r}`)}</span>
              <span className="passo">
                <button aria-label={`togli ${r} da ${s.id}`} disabled={!(d[r]?.[s.id])} onClick={() => cambia(r, s.id, -1)}>−</button>
                <output>{d[r]?.[s.id] ?? 0}</output>
                <button aria-label={`aggiungi ${r} a ${s.id}`} disabled={usate(r) >= ris.quantita} onClick={() => cambia(r, s.id, +1)}>+</button>
              </span>
            </div>
          ))}
        </div>
      ))}
      <button className="pulsante secondario" data-azione="azzera" onClick={() => setD({})}>Ritira tutte le risorse</button>
      <button className="pulsante" data-azione="avvia" onClick={() => p.avvia(d)}>Avvia l'ondata {p.n}</button>
    </section>
  );
}
