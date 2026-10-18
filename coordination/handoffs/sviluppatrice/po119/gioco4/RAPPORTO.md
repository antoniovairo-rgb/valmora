# PO-119 / D-176 (PO-133, PO-135) – la quarta prova approvata nel gioco · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: COMMIT_G4.

## Cosa cambia

- `src/resa/persona2.ts` disegna ora la quarta prova approvata (`po119/bozza4/bozza-persona-4.mjs`), copiata con i soli tipi TypeScript:
  - braccia separate dal busto;
  - spostamento di peso (`peso`);
  - mano sul cinturone (`braccia: 'cinturone'`);
  - figura femminile di PO-135.
- `vignette-gioco.tsx` usa la composizione delle tavole approvate:
  - peso per tono, protagonista/vice: calmo −3/+2, teso +1,5/−1, critico 0/+1, bene 0/0, medio −2/+2, male +1/−1, fallita +2/−2;
  - mano sul cinturone del protagonista nel tono calmo;
  - vice a braccia conserte quando è tranquillo, come prima.
- Il taglio a busto resta invariato (opzione A).
- `vignetta.tsx`: il segno della figura passa da `data-persona="2"` a `"4"`; il guardiano lo cerca.
- **Rosso `__NO_C114P01`:** il disegno e le posizioni della 0.38.0, invariati.

## Misure

| prova | prima | dopo |
|---|---|---|
| stringa SVG del gioco uguale alla bozza approvata (3 capigliature × 5 pose di braccia × 4 bocche × 3 sopracciglia × 3 pesi) | – | 540/540 uguali |
| scena del tono e01 o1, 360/375/412/1366: 2 figure, pupille dentro la cornice, tratto sottile del token, vice a braccia conserte | rosso C114P01: 0 figure, 4 righe | 4/4, «nessun errore» |

- **Guardiano:** `tools/foto-po119.mjs`, nel giro foto: verde «nessun errore», rosso C114P01 4 righe.
- **Test:** 316 su 316 verdi; tsc pulito.
- **Foto:**
  - `prima/tono-*.png`: seconda bozza nel gioco (0.39.0);
  - `dopo/tono-*.png`: quarta prova, a 360, 375, 412 e 1366;
  - `altre-{360,375,412}.png`: guida, chiamata del vice e verbale, rosso C114P01 a sinistra e quarta prova a destra.

## Non verificato

- **Guardiano:** riconosce la figura dal segno `data-persona="4"`, non dalla forma. L'uguaglianza col disegno approvato l'ho misurata una volta (540/540), non c'è un guardiano permanente.
- **Mano sul cinturone:** col taglio a busto, nelle vignette mano e cinturone sono fuori campo (unità 71 del disegno); si legge il gomito aperto.
- **Lacrima del verbale «male»:** resta dove la metteva la seconda bozza; l'ho guardata solo a occhio.
- **`altre-*.png`:** sono le vignette da sole (SSR), non le schermate del gioco.
- **`src/resa/busto.tsx`:** è di S-09 e lo porta S-09.
