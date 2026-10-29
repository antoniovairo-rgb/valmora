// D-244 (PO-153), D-249 (PO-155): il gioco si chiama Vandel Falls. Nei file pubblicati (bundle costruito, dati, store) i nomi
// di prima non compaiono: «Valmora» e «Varcalda» mai; in minuscolo solo nelle chiavi vecchie della migrazione dei salvataggi,
// e nel filtro delle cache di prima che il service worker cancella. «VALMORA» maiuscolo (variabili d'ambiente degli strumenti, __VALMORA_*) resta: tecnico, mai mostrato.
export const AMMESSI = ['valmora-salvataggio-riserva', 'valmora-salvataggio', 'valmora-guida-vista', 'varcalda-salvataggio-riserva', 'varcalda-salvataggio',
  'varcalda-guida-vista', '(valmora|varcalda|vandelfalls)'];

/** file: percorso → testo. Restituisce i punti dove un nome di prima compare. */
export function controllaNome(file) {
  const p = [];
  for (const [k, testo] of Object.entries(file)) {
    let t = testo;
    for (const a of AMMESSI) t = t.split(a).join('');
    const m = t.match(/.{0,30}(Valmora|valmora|Varcalda|varcalda).{0,30}/);
    if (m) p.push(`${k}: nome di prima «${m[0].trim()}» (D-244, D-249)`);
  }
  return p;
}
