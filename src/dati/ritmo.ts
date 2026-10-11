// Ritmo della campagna (D-092, PO-042): mai più di 3 episodi «di stadio» di fila nella stessa stagione, perché il
// gioco non diventi monotono. Misura oggettiva, non un'etichetta: è «di stadio» un episodio con almeno due settori
// di tipo «curva». Rosso: __NO_C12R01 (nessun controllo).
import { spento } from '../interruttori.ts';

export const MAX_STADIO_DI_FILA = 3;
type M = { id: string; stagione: number; episodio: number; mappa: { settori: { tipo: string }[] } };

export const diStadio = (m: M) => m.mappa.settori.filter((s) => s.tipo === 'curva').length >= 2;

/** Serie di episodi di stadio più lunghe del massimo, per stagione. */
export function controllaRitmo(missioni: M[]): string[] {
  if (spento('C12R01')) return [];
  const p: string[] = [];
  for (const st of new Set(missioni.map((m) => m.stagione))) {
    let serie: string[] = [];
    const chiudi = () => { if (serie.length > MAX_STADIO_DI_FILA) p.push(`stagione ${st}: ${serie.length} episodi di stadio di fila (${serie.join(', ')}), massimo ${MAX_STADIO_DI_FILA} (D-092)`); serie = []; };
    for (const m of missioni.filter((x) => x.stagione === st).sort((a, b) => a.episodio - b.episodio)) diStadio(m) ? serie.push(m.id) : chiudi();
    chiudi();
  }
  return p;
}
