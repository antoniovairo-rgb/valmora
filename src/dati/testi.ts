// Scelta del testo in base al genere della protagonista o del protagonista (D-063). Puro.
// Convenzione: «chiave» è la forma maschile o neutra; «chiave@f» la variante femminile, facoltativa.

export type Genere = 'm' | 'f';

export function scegliTesto(testi: Record<string, string>, chiave: string, genere: Genere): string | undefined {
  const k = chiave.replace(/^testi:/, '');
  return (genere === 'f' ? testi[`${k}@f`] : undefined) ?? testi[k];
}
