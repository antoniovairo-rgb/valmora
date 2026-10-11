// Indirizzi esterni usati dalla resa.

/** APK di debug, ricostruito dalla CI a ogni push su main (D-046). */
// PO-049: servito dal sito stesso (GitHub Pages) invece che dal redirect delle release, dove il download si bloccava (PO-020).
export const URL_APK = './valmora-debug.apk';

/** Sostieni il progetto (PO-050): donazione esterna pura, nessuna ricompensa nel gioco. Stesso link dell'altro gioco del PO. */
export const URL_DONAZIONE = 'https://paypal.me/elevoraCPM';

/** Idee e segnalazioni (PO-050): l'indirizzo non è scritto in chiaro nel sorgente (si ricompone all'uso), come nell'altro gioco. */
// Codici spostati di 3: il compilatore non può ricomporre la stringa in fase di build (misurato: con fromCharCode diretto
// l'indirizzo finiva in chiaro nel file pubblicato).
const CODICI = [110, 114, 117, 122, 100, 117, 103, 49, 103, 104, 121, 119, 104, 100, 112, 67, 106, 112, 100, 108, 111, 49, 102, 114, 112];
const destinatario = () => CODICI.map((c) => String.fromCharCode(c - (Date.now() > 0 ? 3 : 0))).join('');
export const mailIdee = (versione: string) =>
  `mailto:${destinatario()}?subject=${encodeURIComponent('Valmora – idee e segnalazioni')}&body=${encodeURIComponent(`Versione ${versione}\n\nLa mia idea o segnalazione:\n\n`)}`;

