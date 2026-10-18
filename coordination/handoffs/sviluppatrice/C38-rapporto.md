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
- Casi del mediatore (e14 o1 biglietteria, e17 o3 piazza del municipio): non li chiudeva C37-08 (il mediatore è schierato, non impegnato da una risposta, e ha `efficacia: {}`). Chiusi con D-173, sotto.

## C38-01 – mediatore che presidia (D-173, opzione A)

- `missione.ts` (motore): la causa di un settore scoperto porta anche `presenti`, le unità schierate lì (anche senza efficacia). Campo facoltativo: nessun numero di gioco cambia; i vecchi salvataggi non lo hanno e il testo resta quello di prima.
- `Rapporto.tsx`: copertura 0 e solo il mediatore sul settore → «presidiato, ma il mediatore qui non basta»; altre unità senza efficacia → «presidiato, ma le unità qui non bastano». **Rosso `__NO_C115M01`.**
- Test `tests/rapporto-mediatore.test.ts`, partita vera del motore sui casi esatti del collaudo: e14 ondata 1, mediatore alla biglietteria; e17 ondata 3, mediatore alla piazza del municipio (ondate prima col bot attento, le altre unità mai su quel settore). Il settore è scoperto, `presenti` = mediatore.

| caso del collaudo | prima (rosso C115M01) | dopo |
|---|---|---|
| e14 o1 biglietteria | «nessuna unità a coprirlo» | «presidiato, ma il mediatore qui non basta» |
| e17 o3 piazza del municipio | «nessuna unità a coprirlo» | «presidiato, ma il mediatore qui non basta» |

## Non verificato

- Il testo «è salita troppo dentro il giallo» non l'ho visto nel verbale a schermo (360/375/412): è provato dal test e dall'uscita della funzione, non con una foto.
- Il caso e17 o2 l'ho provato col rapporto costruito nel test, non giocando la partita; i casi del mediatore con la partita del motore e il bot, non con la stessa disposizione del collaudatore.
- I testi nuovi del rapporto non li ho visti a schermo (360/375/412).
