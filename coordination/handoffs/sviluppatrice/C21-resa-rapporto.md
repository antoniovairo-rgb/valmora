# C-021 resa: C21-05/06 (gruppi di evento), C21-09 (eventi condizionati), C21-04 (stadio con tre curve) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`.

## C21-05/06 – cerimonia, minaccia, lite e faida non sono tifo né rissa

- `src/resa/vignette-evento.tsx`: cerimonia, minaccia, lite e faida passano nel gruppo «gente». «scontro» resta solo per «rissa».
- Lettura dei testi:
  - e34: commissione in tribuna;
  - e18: telefonate di minaccia;
  - e14: «Nessuno si alza»;
  - e21 (faida): il massimo è «Poi bottigliette»;
  - nessuno parla di colluttazione.
- **Rosso `__NO_C50G01`:** i gruppi di prima.

## C21-09 – un evento con «se» conta solo se è vero

- `gruppoEvento(m, c, variabili)` valuta `se` con le variabili della partita (`Ondata.tsx` passa `ic.variabili`). Senza variabili l'evento condizionato non conta.
- **Rosso `__NO_C50S01`:** «se» ignorato.

## C21-04 – e15, stadio fra le due curve della partita

- `src/resa/mappa/sfondo.ts`: con tre curve, lo stadio, gli spalti a sinistra e a destra e il corteo usano le due curve della partita. Si esclude il settore o la curva dei gemellati.
- Prima la scelta era incoerente: le estremità venivano dalle due curve con x minore, l'ellisse dalle prime due dei dati.
- e15 (dai testi): partita Cinderwick contro Rovers, gemellati dell'Ollerbrook in un settore a parte. Ora gli spalti hanno l'arancio del Cinderwick.
- **Rosso `__NO_C50C01`:** come prima.
- Osservazione (foto): il punto «Viale della stazione» di e15 cade sul bordo del catino. Il settore resta leggibile e toccabile. Lo segnalo, non l'ho cambiato.

## Guardiani

- `tests/c21-resa.test.ts`, sui dati veri. FATTO MISURATO:
  - 21 chiamate con soli eventi cerimonia/minaccia/lite/faida: tutte «gente». Rosso C50G01: tornano tifo e rissa;
  - 3 chiamate con un evento condizionato falso (variabili iniziali): nessun gruppo se non restano eventi veri. Rosso C50S01: il gruppo ricompare;
  - e15: spalti Cinderwick e Rovers. Rosso C50C01: manca l'arancio del Cinderwick.
- `controllaVignettaEvento` (giro foto): gruppi allineati, e valuta `se` con le variabili del salvataggio.

## Misure

- Giro foto (`VALMORA_LARGHEZZE=360 node tools/foto.mjs`): verde 0 errori.
- Foto (sonda delle chiamate, a 360/375/412): e34 «commissione_schieramento», e18 «telefonata», e14 «seduti».
  - Prima (rossi C50G01 e C50C01): tifo, scontro, scontro.
  - Dopo: gente in tutti e tre i casi.

## Foto

In `c21-resa/`, `prima-*` e `dopo-*`:
- vignetta delle tre chiamate a 360, 375 e 412;
- pagina intera a 412;
- mappa di e15 a 360, 375 e 412.
