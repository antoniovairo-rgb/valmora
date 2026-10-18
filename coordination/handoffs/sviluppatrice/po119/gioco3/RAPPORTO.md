# PO-119 / D-174 (PO-131, PO-132) – la terza prova approvata nel gioco · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: 0f588a8. Base: merge della principale 05f98de (b64f437).

## Cosa cambia

- `src/resa/persona2.ts`: il disegno è ora quello della terza prova approvata (`po119/bozza3/bozza-persona-3.mjs`), copiato con i soli tipi TypeScript. Braccia a riposo lungo i fianchi (D-174, opzione A).
- Posizioni, scale e pose nelle vignette restano quelle della seconda bozza nel gioco (`vignette-gioco.tsx`, invariato); il vice a braccia conserte quando è tranquillo.
- `vignetta.tsx`: il segno della figura passa da `data-persona="2"` a `"3"`; il guardiano lo cerca.
- **Rosso `__NO_C114P01`:** il disegno della 0.38.0 (invariato).

## Misure

| prova | prima | dopo |
|---|---|---|
| stringa SVG del gioco uguale alla bozza approvata (3 capigliature × 4 pose di braccia × 4 bocche × 3 sopracciglia) | – | 144/144 uguali |
| scena del tono e01 o1, 360/375/412/1366: 2 figure della bozza approvata, pupille dentro la cornice, tratto sottile del token, vice a braccia conserte | rosso C114P01: 0 figure, 4 righe | 4/4, «nessun errore» |

- Guardiano `tools/foto-po119.mjs` (nel giro foto, dentro `foto-c33.mjs`): verde «nessun errore»; rosso C114P01 4 righe.
- Test vitest: tutti verdi (vedi STABILITA).
- Foto: `prima/tono-*.png` = seconda bozza nel gioco (0.39.0, stessa prova); `dopo/tono-*.png` = terza prova (360, 375, 412, 1366); `altre-{360,375,412}.png` = guida 0–5, chiamata del vice, verbale bene/medio/male/fallita, a sinistra il rosso C114P01 (0.38.0), a destra la terza prova.

## Non verificato

- Il guardiano riconosce la figura dal segno `data-persona="3"` di `vignetta.tsx`, non dalla forma del disegno: l'uguaglianza col disegno approvato l'ho misurata una volta (144/144), non è un guardiano permanente.
- `altre-*.png` sono le vignette da sole (SSR), non le schermate; la lacrima del verbale «male» resta dove la mette la seconda bozza, guardata solo a occhio.
- `src/resa/busto.tsx` di S-09 (tavole dei civili) non l'ho toccato: lo porta S-09.
