# C117B01 – braccio mancante nella posa «mano alla nuca» (PO: «manca un braccio all'uomo - verifica la donna») · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: COMMIT_C117.

## Riproduzione (FATTO, dal codice e dal guardiano)

- **Codice:** in `bozza-persona-3.mjs:40-41`, `bozza-persona-4.mjs:40-41`, nel gioco (`src/resa/persona2.ts`, quarta prova) e in `src/resa/busto.tsx` di S-09 (6ee5abb:46-48), la posa `nuca` disegna:
  - un solo braccio (il destro), **prima del busto**: l'attacco alla spalla resta nascosto dietro il busto e si vede un anello staccato;
  - nessun altro braccio: le braccia a riposo si disegnano solo senza posa, con `cinturone` o con `conserte`.
- **Seconda bozza** (`bozza-persona-2.mjs:84`): il braccio alzato si disegna dopo il busto, quindi è attaccato. L'altro braccio non è una sagoma: è il bordo del busto, che lì era ancora un blocco unico.
- **Chi e dove:** solo il protagonista, uomo e donna, nei toni con la posa `nuca` (rapporto critico, verbale male; `espressioni.ts:22,27`). Il vice non ha mai la posa `nuca`. Nella festa (`su`) ci sono le due braccia.

## Correzione (`src/resa/persona2.ts`)

- **Braccio alzato:** si disegna dopo il busto e prima della testa, partendo dalla spalla (spalla → gomito in alto → mano sulla fronte). La testa copre l'avambraccio come prima.
- **Altro braccio:** a riposo lungo il fianco, come nelle pose approvate.
- **Segni per il guardiano**, solo attributi, nessuna forma cambiata:
  - ogni braccio porta `data-braccio` (sx/dx) e `data-spalla`, il punto da cui parte;
  - il busto porta `data-busto`;
  - le braccia alzate della festa, disegnate dietro il busto come approvato, portano `data-dietro`.
- **Rosso `__NO_C117B01`:** come nella quarta prova.
- **Forme:** la stringa SVG resta uguale alla quarta prova approvata in tutte le pose fuori da `nuca`, a parte questi attributi. Misurato: vedi sotto.

## Misure

| guardiano `tests/braccia.test.ts` (7 toni × uomo/donna, col vice: 14 vignette, 28 figure) | prima (rosso C117B01) | dopo |
|---|---|---|
| figure con un braccio mancante | 4 (critico e male × uomo e donna, braccio sinistro) | 0 |
| braccia disegnate prima del busto (non dichiarate dietro) | 4 (le stesse, braccio destro alzato) | 0 |
| braccia lontane più di 6 unità dalla propria spalla | 0 | 0 |

- **Forme uguali alla quarta prova approvata:** fuori dalla posa `nuca`, togliendo gli attributi del guardiano, la stringa SVG è identica a `bozza-persona-4.mjs` in 432 casi su 432 (3 capigliature × 4 pose di braccia × 4 bocche × 3 sopracciglia × 3 pesi).
- **Test:** 318 su 318 verdi.
- **Foto:** `braccia-{m,f}-{360,412}.png`, tutti i toni, a sinistra il rosso C117B01 e a destra la correzione.

## Non verificato

- **`busto.tsx` di S-09:** ha lo stesso difetto (6ee5abb:46-48) e la correzione la porta S-09.
- **Disposizione del braccio alzato:** giudicata a occhio sulle foto.
- **Schermate:** le foto sono le vignette da sole (SSR).
