# S-06 – N01 (C-007.2) e rilievi C-008 · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, con merge (non rebase) fino a cc8b92b. Stato: **consegna completa.**

## Cosa ho fatto

- **N01**, rapporto: lo stato («sotto controllo» / «scoperto») sta sempre sulla riga del nome. Se serve va a
  capo il nome, mai lo stato (`.elenco-settori`: riga senza a capo, nome che si stringe, stato `nowrap`).
- **C-008.1**: «1 tentativo» / «N tentativi» nella scheda della città.
- **C-008.3, C-008.4, C-008.5** (aree di tocco sopra i nomi, nomi che si sfiorano): la regola a soglie di
  S-04 è sostituita da `src/resa/mappa/etichette.ts`, che sceglie i posti misurando nel DOM:
  - posti per i nomi: sotto, sopra, destra, sinistra, sotto allineato a sinistra o a destra del punto;
  - posti per le unità: sopra, destra, sinistra, in alto a destra, in alto a sinistra, sotto;
  - per ogni settore prova tutte le combinazioni di nome e unità e tiene quella che costa meno, in due passate;
  - ostacoli: punti dei settori (44×44), nomi, aree di tocco intere delle unità (44×44), margine di 5 px dai bordi;
  - pesi: una sovrapposizione vera vale 100, uscire dai bordi 1000, un distacco sotto i 6 px fra due nomi 1;
  - si ricalcola a ogni disegno, quando la mappa cambia misura e quando arrivano i caratteri.
- Guardiani nuovi in **tools/foto.mjs**, in ogni foto con una mappa:
  - nessuna area di tocco `[data-presenza]` sopra un nome (> 4 px², stessa soglia della sonda c07);
  - nessun nome sopra un altro (> 0 px²);
  - nel rapporto, lo stato sulla riga del nome;
  - sulla città, «1 tentativo» per e02 dopo il primo tentativo.
- Interruttori rossi:
  - `__NO_C05S08`: nomi e unità al posto fisso;
  - `__NO_C05N01`: stato che va a capo (regola in token.css);
  - `__NO_C05S81`: plurale fisso.

## Misure

| comando | campione | verde | rosso |
|---|---|---|---|
| sonda `coordination/handoffs/collaudatrice/sonde/c07-sovrapposizioni.mjs . <larghezza>` (ramo claude/valmora-collaudo) | e01, schieramento come la sonda | 360, 375, 412: «nessuna sovrapposizione» | prima della correzione (stessa sonda, build d2e5590): 360 → 328 px² ×2 e nomi 11 px² ×2; 375 → 112 px² ×2 |
| sonda `c06-resa.mjs .`, riga N01 | 3 larghezze | «nessuna» a 360, 375, 412 | `SPENTI=C05N01` a 360: «piazzale, strada_cinderwick, strada_larkspire» |
| `node tools/foto.mjs out/foto` | e01 ×2 + e02, 3 larghezze | verde | |
| `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C05S08 node tools/foto.mjs …` | 360 px | | ROSSO: nomi piazzale×strade 11 px² (×28 ciascuno), tocco squadre@strade sopra le curve 328 px² (×15 ciascuno), steward 404 px² |
| `… VALMORA_ROSSI=C05N01 …` | 360 px | | ROSSO: lo stato di piazzale e delle due strade va sotto il nome (×3 rapporti) |
| `… VALMORA_ROSSI=C05S81 …` | 360 px | | ROSSO: «1 tentativi» invece di «1 tentativo» |
| `npx vitest run` | 100 test | verdi | |
| `node tools/catena.mjs completa` | vedi sotto | | |

## Foto

docs/foto/e01/2026-10-11-n01-c008/: schieramento e rapporto di e01 ed e02 e la città, a 360/375/412 px.

## Problemi aperti

1. A 360 px, nello schieramento di e01, «Curva Cinderwick» e «Strada da Cinderwick» restano sotto i 6 px di
   distacco (senza toccarsi): ogni altro posto avrebbe una sovrapposizione vera, perché i punti nei dati
   sono vicini. Se il PO li trova confusi, si risolve spostando un `pos` nei dati (della principale).
2. La disposizione si calcola nel browser: con molti settori (36 episodi) va riverificata. I guardiani di
   foto.mjs ci sono già.
