// GAME_VERSION aumenta a ogni rilascio. Ogni valore porta un commento: causa, misura, guardiano.
//
// 0.1.0 – impianto di L1 (PO-010/011/012), NON pubblicato.
//   causa: serve lo scheletro Vite + TypeScript + Vitest per scrivere e01 (D-006).
//   misura: catena «logica» verde su 3 giri, vedi STABILITA.json.
//   guardiano: catena «logica» (tipi, confini, schema, test, salvataggi-reali, bracci-rossi-logica).
//
// 0.2.0 – primo rilascio numerato su main (PO-032): stile C (D-066/067), R01-R07, e02 su mappa e città,
//   accenni di costo (D-078), N01 e C-008 corretti.
//   causa: la versione restava 0.1.0 a ogni pubblicazione, il PO non poteva sapere quale build collaudava.
//   misura: catena completa 3/3 verde su d589e18; sonde c06 (N01 nessuna a 360, rossa con C05N01) e c07 (nessuna sovrapposizione 360/375).
//   guardiano: catena «governo» – ogni GAME_VERSION ha la sua riga di commento; la home mostra versione e build.
export const GAME_VERSION = '0.2.0';
