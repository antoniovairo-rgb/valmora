# C42-01 (resa), C42-02, C42-06 (D-185, collaudo C-042) · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: 76995c7. Base: merge della principale b52efe2.

## C42-01 – «dalla prossima ondata» all'ultima ondata (parte della resa)

- **Riproduzione (FATTO, dati):** 230 risposte con costo in unità, 27 nell'ultima ondata, tutte con la riga «… dalla prossima ondata». Il conto coincide con quello del collaudo.
- **Correzione (`effetti-opzione.tsx`, `quandoCosta(o, ultima)`; `Ondata.tsx` passa `ondata ≥ numero di ondate`):** all'ultima ondata la riga dice «Le unità restano impegnate fino a fine serata». **Rosso `__NO_C42U01`.** Testo in `comune.json`.
- **Verbale (`bilancio.ts`):** lo fa S-05 (D-185); io non l'ho toccato.

| misura | prima (rosso C42U01) | dopo |
|---|---|---|
| risposte dell'ultima ondata con «dalla prossima ondata» | 27 su 27 | 0 su 27 |
| risposte delle altre ondate con «dalla prossima ondata» | 203 su 203 | 203 su 203 |
| e02 o4 a schermo (360/375/412) | «Ti costa 1 squadra dalla prossima ondata» | «Le unità restano impegnate fino a fine serata» |

- **Guardiano:** `tests/costo-quando.test.ts`, esteso: verde 0 errori; rosso C42U01 27 errori.
- **Foto:** `c42/prima/` e `c42/dopo/` (sonda `c42/c42-foto.mjs`).

## C42-02 – residui di C41-04

- **Riproduzione (FATTO, dati):** ricerca per formula su tutti i testi dei 36 episodi. Formule:
  - «resta/restano scoperto/presidiato» assoluto;
  - «tolta dal/alla …»;
  - «squadra/steward/pattuglia/mediatore lascia»;
  - «sposta una … dal»;
  - «…, intanto, nessuno.»;
  - «Tribuna presidiata;»;
  - «scortato/a» in una risposta che non costa unità.

  Risultato: 33 testi trovati dalle formule, più 4 casi della tabella del collaudo (e25 «Steward fra le auto», e26 «Tribuna presidiata», e35 «Sposta una squadra dal centro», e25 «Alla stazione, intanto, nessuno.»). Comprende i gruppi 1, 2, 3 e la tabella del collaudo, ed e24 «Festa in piazza, scortata».
- **Correzione:** 38 testi resi neutri sullo schieramento, coerenti con gli effetti (letti uno per uno in `data/missioni`); effetti invariati. Per esempio:
  - «la curva Kiln si scalda»;
  - «il viale si carica»;
  - «Una squadra va a fare cordone. Le banchine, intanto, si caricano.»;
  - «Manda una squadra al cantiere».
- **Guardiano:** `tests/testi-schieramento.test.ts`, che ora cerca per formula su tutti i testi (resta anche il test per chiave dei 5 casi di C41-04).
  - verde: 0;
  - rosso `__NO_C42T01` (testi di prima dei residui): 37;
  - rosso `__NO_C41T01`: 4 dei 5 casi di C41-04 (i 2 che non sono formule, «la tiene breve» e «con squadre e steward», li sorveglia il test per chiave).

| misura | prima | dopo |
|---|---|---|
| testi con una formula di schieramento (ricerca su tutti i testi) | 33 (37 con le formule nuove) | 0 |

- **Restano fuori (come da collaudo):**
  - comparativi «più/un po' scoperto» (gruppo 4, 11 testi);
  - etichette del gruppo 5 che nominano unità senza costo, tranne quelle con «scortato/a» (corrette) ed e25 «Steward fra le auto»;
  - «Nessuno lascia la stazione» (e33) e i due «intanto, nessuno …» figurati (e14 «nessuno aspetta volentieri», e23 «nessuno conta le targhe»).

## C42-06 – «Ti restano 1 mediatore»

- **Riproduzione (FATTO, codice):** `Schieramento.tsx:174` scriveva «Ti restano» fisso.
- **Correzione:** «Ti resta» quando la somma è 1 (`tiResta`). **Rosso `__NO_C42R01`.** Test `tests/ti-resta.test.ts`: verde «Ti resta» con 1 e «Ti restano» con 2; rosso «Ti restano» con 1.

## Altro

- Dopo l'unione è servito `npm ci`: `@types/node` era nuovo.
- **Test:** 356 su 356 verdi; tsc pulito.

## Non verificato

- **C42-01, equilibrio:** l'effetto sull'equilibrio (il costo dell'ultima ondata resta senza effetto reale) non l'ho misurato; non è nel compito.
- **C42-02 a schermo:** i testi nuovi non li ho visti a schermo; li ho controllati col test e con la ricerca.
- **C42-06 a schermo:** «Ti resta» non l'ho visto a schermo; l'ho provato con la funzione.
- **Gruppo 5:** le etichette del gruppo 5 non le ho controllate voce per voce.
