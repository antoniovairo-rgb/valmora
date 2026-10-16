# PO-059 – protagonista e vice con l'espressione della partita · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Piano approvato dalla principale; il PO ha deciso che l'espressione del rapporto segue la tensione. Foto in `po059/`.

## Cosa c'è

**`src/resa/espressioni.ts`** (modulo puro):
- `tonoOndata(livelli)`: livello di tensione più alto a fine ondata (0-5, `livello` di partita.ts). Fino a 1 «calmo», 2-3 «teso», da 4 «critico».
- Tabelle tono → espressione di protagonista e vice. Il vice fa da contrappunto: resta calmo quando tu sei teso, si preoccupa con te quando la serata è critica.

**`Persona`** (`vignetta.tsx`), oltre alla bocca:
- sopracciglia alzate (gioia) o corrucciate (preoccupazione);
- braccia alzate (festa) o una mano alla nuca (preoccupazione);
- tutto in SVG, colori solo dalle classi `v-*`.

**Rapporto di fine ondata:** `VignettaOndata`, in sala operativa col monitor (la linea sale col tono), protagonista (genere dal salvataggio) e vice.
- `data-tono` sulla cornice.
- La vignetta si nasconde quando manca lo spazio, come sala e verbale (D-126 d, `useRiempi`).

**Verbale:** `VignettaEsito` usa le espressioni nuove.
- bene: festeggiano tutti e due, a braccia alzate;
- medio: sollievo;
- male: mano alla nuca;
- fallita: sopracciglia corrucciate e bocca in giù per tutti e due.

**Rosso `__NO_C96P01`:** niente vignetta nel rapporto; al verbale solo la bocca, come prima.

## Guardiani

- `tests/espressioni.test.ts`:
  - soglie del tono;
  - un'espressione diversa per ogni tono;
  - festa a braccia alzate, critico con la mano alla nuca;
  - rosso: solo la bocca.
- `controllaVignettaOndata` (`tools/foto-c22.mjs`), in ogni rapporto del giro foto:
  - il tono si ricalcola dalla tensione del motore (`o.rapporto.tensione`), con la formula di `livello` riscritta lì;
  - `data-tono` e la vignetta «ondata-<tono>» devono coincidere;
  - nel tono critico c'è la mano alla nuca, se la vignetta si vede.

## Misure (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- verde: exit 0;
- rosso C96P01: exit 1, 29 righe «eXX rapporto N: manca la vignetta di fine ondata (PO-059)»;
- `npx vitest run tests/espressioni.test.ts`: 3/3.
- Quanti rapporti mostrano la vignetta e quanti la nascondono per spazio non l'ho contato: non posso dirlo.

## Foto (`po059/`)

- `prima-*` (rosso C96P01) e `dopo-*`, a 360, 412 e 1024 px, DPR 1 e 2.
- Per ogni foto: i 3 toni del rapporto e i 4 del verbale, protagonista uomo e poi donna.
- GIUDIZIO: si leggono la festa (braccia alzate) e la mano alla nuca; le sopracciglia a DPR 1 sono piccole.

## Esito dei giri

FATTO MISURATO: catena completa 3/3 verde su f0d6257.
