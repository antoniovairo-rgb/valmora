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
//
// 0.6.0 – i 36 episodi consolidati (PO-068): testi brevi (D-101), sei scelte che cambiano la storia (D-100), talpa,
//   costruttore e finale agrodolce (D-098/099), Tano Ferrigno «il Fabbro» (D-102), ritmo città/stadio (D-092); verbale
//   con «Prossimo episodio» e «Condividi» (PO-072/074); tensione a colori anche nel bilancio (C12-01); salvataggi delle
//   versioni pubblicate adattati ai dati nuovi (C14-02/03); curva del club anche negli episodi di città (e13, e25).
//   causa: PO-068, PO-072, PO-074, collaudo C-014. misura: completa 3/3 sulla build del rilascio.
//   guardiano: passo «storia» della catena logica (consolidamento + ritmo, tre bracci rossi), foto-verbale.mjs
//   (rossi C18V01/C20C01), tests/aggiornamento.test.ts + salvataggio reale 0.4.0 (rossi C14V01/C14I01), C22K01.
//
// 0.7.0 – primo dei tre rilasci al giorno (D-109): barra della fiducia (S-19, PO-067), doppia conferma dello
//   schieramento con avviso delle unità non usate (S-12, PO-061/054), esporta/importa e copia di riserva (S-20, PO-073),
//   triplice conferma per ripartire (S-16, PO-066), finale di e36 per fascicolo (D-106) col tono giusto, fiducia minima 2
//   a inizio episodio (D-105), e02/e03 ammorbiditi (D-108).
//   causa: PO-054…PO-073, D-105…D-108. misura: completa 3/3 sulla build del rilascio.
//   guardiano: controllaFiducia, controllaArchivio (rosso C19S01), Tripla (C20T01), controllaFiduciaMinima (C23F01),
//   controllaDifficolta, bot per versione di esito (D106BOT), tests/tono.test.ts (C24T01).
//
// 0.8.0 – rilascio delle 13:30 (D-109): pagina bianca offline corretta (S-22, C14-01), guida alla prima partita (S-18),
//   «Riparti dall'ondata N» a episodio perso (S-17, PO-060), logo a sinistra (PO-077), testimone di e18 coerente
//   (C15-03), steward che segnalano invece di sequestrare (C15-10), «il Fabbro» nei dialoghi (C15-11, D-110),
//   fiducia minima 3 (D-110).
//   causa: C-014, C-015, PO-060, PO-077, D-110. misura: completa 3/3 sulla build del rilascio.
//   guardiano: passo «offline» della catena grafica (rossi C14O01-03), C21R01, C22G01, C25L01, tests/testimone.test.ts,
//   controllaFiduciaMinima (C23F01).
//
// 0.9.0 – rilascio anticipato su richiesta del PO (deroga all'orario di D-109): schieramento compatto (S-24, PO-079),
//   vignette a fumetto in guida, sala ed esito del verbale (S-23), ripartenza solo da un'ondata da cui si può ancora
//   vincere (C16-01, PO-083, D-111), spiegazione dell'installazione su Android e nei browser interni (PO-082),
//   tasto indietro che rilegge senza annullare (S-21), «In mano» dice dove rende l'unità (C14-11).
//   causa: C-016, PO-079, PO-082, PO-083. misura: completa 3/3 sulla build del rilascio; ripartenze sotto 1/3 36→0 su 455.
//   guardiano: tests/ripartenza-po083.test.ts (PO083), tests/ripartenza.test.ts (C16R02), C27S01, C26V01, C30I01, C25I01, C22R01.
export const GAME_VERSION = '0.9.0';
