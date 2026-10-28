// D-244 (PO-153): il gioco si chiama Varcalda. Nei file pubblicati (bundle costruito, dati, store) il nome vecchio non
// compare: «Valmora» mai; «valmora» minuscolo solo nelle chiavi vecchie della migrazione dei salvataggi, nel nome della
// cache di prima che il service worker cancella e nell'indirizzo github.io, che cambia quando il PO rinomina il repository.
// «VALMORA» maiuscolo (interruttori e variabili d'ambiente degli strumenti, __VALMORA_*) resta: tecnico, mai mostrato.
export const AMMESSI = ['valmora-salvataggio-riserva', 'valmora-salvataggio', 'valmora-guida-vista', '(valmora|varcalda)', 'github.io/valmora/'];

/** file: percorso → testo. Restituisce i punti dove il nome vecchio compare. */
export function controllaNome(file) {
  const p = [];
  for (const [k, testo] of Object.entries(file)) {
    let t = testo;
    for (const a of AMMESSI) t = t.split(a).join('');
    const m = t.match(/.{0,30}(Valmora|valmora).{0,30}/);
    if (m) p.push(`${k}: nome vecchio «${m[0].trim()}» (D-244)`);
  }
  return p;
}
