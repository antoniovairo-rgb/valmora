# C40-03, C40-04 (D-180, collaudo C-040) · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: COMMIT_C40. Base: merge della principale 748aa8dd.

## Riproduzione (prima di correggere)

Test `tests/rapporto-c40.test.ts` con i casi del collaudo; rapporto disegnato dalla resa. Sul codice di prima:
- e25 o3: «Folla, le tue risposte: le tue risposte non bastano»;
- e36 o3: «Folla: presidiato, ma il mediatore qui non basta».

Sono gli stessi testi delle foto del collaudo.

## Correzioni (`src/resa/schermate/Rapporto.tsx`, opzioni consigliate)

- **C40-03:** se la copertura è «le tue risposte non bastano», le cause non aggiungono «le tue risposte». **Rosso `__NO_C119R01`.**
- **C40-04:** se sul settore c'è il mediatore e ci sono anche unità impegnate da risposte, il testo è «presidiato, ma le unità qui non bastano». **Rosso `__NO_C120U01`.**

| caso | prima / rosso | dopo |
|---|---|---|
| e25 o3, piazzale | «Folla, le tue risposte: le tue risposte non bastano» | «Folla: le tue risposte non bastano» |
| e36 o3, cantiere (mediatore + `steward_cantiere`) | «Folla: presidiato, ma il mediatore qui non basta» | «Folla: presidiato, ma le unità qui non bastano» |

- **Test:** 337 su 337 verdi; tsc pulito.
- **Test di C38-01 sistemato (dichiarato).** Nel test di `tests/rapporto-mediatore.test.ts` sul caso e14 ondata 1, il bot rispondeva `controlla_codici`, che impegna uno steward sulla biglietteria dove c'è il mediatore. Con D-180 quel caso è giustamente «le unità qui non bastano». Il test ora, nell'ondata in prova, non sceglie risposte che impegnano unità sul settore del mediatore. Così prova ancora D-173 (solo mediatore), mentre il caso misto è coperto dal test nuovo. Nessuna soglia cambiata.

## Non verificato

- **Testi a schermo:** non li ho visti a 360/375/412; sono provati coi rapporti costruiti nei test, non giocando le partite.
- **Altri episodi:** quanti rapporti cambiano testo negli altri episodi non l'ho contato.
