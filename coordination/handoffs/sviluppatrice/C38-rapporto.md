# C38-02 (D-172) e verifica di C38-01 · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: 382e8fb (C38-02 e test), 8df2a18 (rapporto).

## C38-02 – «non deve passare il giallo: è arrivata al giallo»

- Riprodotto prima di correggere: test `tests/stella-colore.test.ts` sulle 72 soglie di tensione delle stelle dei dati (tutte «tensione_max al massimo 3»; tensione dello stesso colore oltre la soglia: solo 4, livello `ceil(t/2)` = 2). Sul codice di prima: frase contraddittoria in 72 casi su 72 (test rosso).
- Correzione (`Bilancio.tsx`, `requisitoInParole`): se soglia e tensione raggiunta hanno lo stesso colore, «è salita troppo dentro il giallo» invece di «è arrivata al giallo». Nessuna cifra nella frase dei colori (D-055). **Rosso `__NO_C38G01`.**
- Uscita vera (vite-node, soglia 3, seconda stella):
  - tensione 4: «Per la seconda stella la tensione non deve passare il giallo: è salita troppo dentro il giallo. Seconda stella: tensione massima 3 su 10 (raggiunta: 4).»
  - tensione 6 (colore diverso, invariata): «… è arrivata all'arancione. Seconda stella: tensione massima 3 su 10 (raggiunta: 6).»
  - rosso C38G01, tensione 4: «… è arrivata al giallo. …» (come prima).

| misura (72 casi) | prima | rosso C38G01 | dopo |
|---|---|---|---|
| frase dei colori che si contraddice | 72 | 72 | 0 |
| cifre nella frase dei colori | 0 | 0 | 0 |

- La seconda frase coi numeri è quella di C33-09 (D-147) e non cambia.

## C38-01 – verifica sulla build integrata

- Caso C37-08 del collaudo (e17 o2, «Steward ai cancelli», nessuno steward posato ai tornelli): CHIUSO. Sulla principale integrata (d155487, merge e4f50d1) c'è il codice di C37-08 (`Rapporto.tsx:29-30`, `App.tsx:191` passa le scelte). Test nuovo in `tests/causa-risposte.test.ts` col caso esatto del collaudo: «le tue risposte non bastano», 1 steward impegnato.
- Casi del mediatore (e14 o1 biglietteria, e17 o3 piazza del municipio): NON chiusi da C37-08. Il mediatore è schierato, non impegnato da una risposta, e non ha efficacia (`missione.ts:215` somma solo le efficacie; `e14.json`: `efficacia: {}`), quindi il rapporto dice ancora «nessuna unità a coprirlo». Non l'ho cambiato: non è nel compito e serve una scelta.

## Non verificato

- Il testo «è salita troppo dentro il giallo» non l'ho visto nel verbale a schermo (360/375/412): è provato dal test e dall'uscita della funzione, non con una foto.
- Il caso e17 o2 l'ho provato col rapporto costruito nel test, non giocando la partita.

## Opzioni per la principale (non scelte da me)

- Mediatore nel rapporto (C38-01, resto): A) testo che distingue «presidiato, ma il mediatore qui non basta» (consigliata, come opzione 1 del collaudo: una condizione in `Rapporto.tsx`, test sui due casi); B) contare il mediatore come presidio solo nel testo (non spiega perché resta scoperto); C) spiegarlo solo nella guida (il rapporto resta in contraddizione con la mappa).
