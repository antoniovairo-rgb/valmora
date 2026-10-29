// Indirizzi esterni usati dalla resa.

/** Indirizzo pubblico del gioco (GitHub Pages), usato dalla condivisione del verbale (PO-074). UNICO punto dell'indirizzo
 *  (D-244, D-249): segue il nome del repository, che il PO ha rinominato in «vandelfalls» il 2026-10-28 (le Pages non
 *  reindirizzano il percorso vecchio: …/varcalda/ ora risponde 404). */
export const URL_GIOCO = 'https://antoniovairo-rgb.github.io/vandelfalls/';

/** Condivisione (PO-074): pannello del telefono se c'è (Web Share API), altrimenti copia negli appunti.
 *  «annullato» se il giocatore chiude il pannello: non è un errore e non si mostra nulla. */
export async function condividi(testo: string): Promise<'condiviso' | 'copiato' | 'annullato' | 'errore'> {
  try {
    if (typeof navigator.share === 'function') { await navigator.share({ title: 'Vandel Falls', text: testo, url: URL_GIOCO }); return 'condiviso'; }
    await navigator.clipboard.writeText(`${testo} ${URL_GIOCO}`); return 'copiato';
  } catch (e) { return (e as Error)?.name === 'AbortError' ? 'annullato' : 'errore'; }
}

/** Sostieni il progetto (PO-050): donazione esterna pura, nessuna ricompensa nel gioco. Stesso link dell'altro gioco del PO. */
export const URL_DONAZIONE = 'https://paypal.me/elevoraCPM';

/** Idee e segnalazioni (PO-050): l'indirizzo non è scritto in chiaro nel sorgente (si ricompone all'uso), come nell'altro gioco. */
// Codici spostati di 3: il compilatore non può ricomporre la stringa in fase di build (misurato: con fromCharCode diretto
// l'indirizzo finiva in chiaro nel file pubblicato).
const CODICI = [110, 114, 117, 122, 100, 117, 103, 49, 103, 104, 121, 119, 104, 100, 112, 67, 106, 112, 100, 108, 111, 49, 102, 114, 112];
const destinatario = () => CODICI.map((c) => String.fromCharCode(c - (Date.now() > 0 ? 3 : 0))).join('');
export const mailIdee = (versione: string) =>
  `mailto:${destinatario()}?subject=${encodeURIComponent('Vandel Falls – idee e segnalazioni')}&body=${encodeURIComponent(`Versione ${versione}\n\nLa mia idea o segnalazione:\n\n`)}`;

