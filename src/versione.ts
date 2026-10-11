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
//
// 0.3.0 – e03 «Notte di coppa» giocabile (D-081…D-084): partita di notte, quartiere, transenne fisse (D-082).
//   Nella logica (resa in arrivo): bilancio di fine episodio (D-085), picco di tensione nel rapporto (C09-01),
//   colori e stemmi dei club (D-088). Abbozzi e04–e36 presenti ma nascosti (D-087, D-090: ?bozze=1).
//   causa: PO-035, PO-036, PO-038/040, PO-039.
//   misura: catena completa 3/3 verde sulla build del rilascio; bot e03 casuale 67,7% fallite, posizione delle transenne 1★…3★.
//   guardiano: tests/transenne.test.ts, tools/fisse.mjs, tests/picco.test.ts, tests/bilancio.test.ts, tests/bot-deterministiche.test.ts.
//
// 0.4.0 – rilascio di giorno su richiesta del PO (PO-051, deroga a D-093): icona del gioco (PO-048), gioco installabile e
//   offline dal browser + APK servito dal sito (PO-049), «Sostieni il progetto» e «Idee e segnalazioni» (PO-050),
//   città leggibile una stagione alla volta (PO-044), pulsante sempre visibile / «scoperto» / avviso unità finite (C09-02/03/04),
//   abbozzi con i sette grandi eventi (D-091, nascosti: ?bozze=1).
//   causa: PO-044, PO-048…PO-051. misura: completa 3/3 sulla build del rilascio; Chromium 0 errori di installabilità
//   (oltre all'incognito della prova), ricarica offline verde; email non in chiaro nel bundle.
//   guardiano: passo «email» della catena grafica, tests/collegamenti.test.ts, __NO_C13M01 (città).
//
// 0.5.0 – rilascio notturno (D-093): sala, briefing e verbale a passi (PO-045), folla che segue l'ondata (PO-046),
//   bilancio di fine episodio con «Cosa ti ha penalizzato» (PO-036/057), colori e stemmi dei club (PO-038/040),
//   home con logo e guida «La città e il gioco» (PO-063/065), «fiducia» al posto di «credito» (PO-067), città per
//   stagione con tutti i 36 episodi e segno «bozza» (S-09), ripartenza dall'ondata persa nella logica (PO-060).
//   causa: PO-036…PO-067. misura: completa 3/3 sulla build del rilascio.
//   guardiano: controllaFolla, passi ≤760 px (S-10), D-097 nel validatore, tests/ripartenza.test.ts.
export const GAME_VERSION = '0.5.0';
