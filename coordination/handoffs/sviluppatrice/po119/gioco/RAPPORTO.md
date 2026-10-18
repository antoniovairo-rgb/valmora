# PO-119 / D-171 – la seconda bozza dei protagonisti nel gioco (taglio «a busto») · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: COMMIT_PO119. Foto in questa cartella (`prima/` = rosso C114P01, `dopo/`).

## Cosa cambia

- `src/resa/persona2.ts`: il disegno della seconda bozza approvata (`po119/bozza2/bozza-persona-2.mjs`), copiato senza cambiare una forma (solo i tipi TypeScript).
- `Persona` (`vignetta.tsx`) disegna la figura nuova. Nelle vignette di fine ondata e di fine episodio (`vignette-gioco.tsx`) si usano le posizioni e la scala delle tavole approvate: busto, figure 1,15 volte la bozza; il vice a braccia conserte quando la serata non è critica (ondata) o l'esito è «medio» (verbale). Altrove (guida, chiamata del vice) la scala è 0,9, così le figure restano grandi come prima.
- Il tratto sottile dei dettagli del volto ha un token nuovo, `--vignetta-tratto-fine` (1,1 px), e una classe in `stile-c18.css`.
- Nel verbale «male» la lacrima segue il volto nuovo.
- **Rosso `__NO_C114P01`:** il disegno e le posizioni della 0.38.0.

## Misure

| prova | prima (rosso C114P01) | dopo |
|---|---|---|
| scena del tono, e01 ondata 1, 360/375/412/1366: 2 figure della bozza | 0/4 | 4/4 |
| pupille 2 per figura, dentro la cornice | – | 4/4 |
| dettagli del volto col tratto del token (1.1px) | – | 4/4 |
| vice a braccia conserte a serata non critica | – | 4/4 |

- Guardiano permanente `tools/foto-po119.mjs` (`controllaPersone`), chiamato nella scena del tono di `foto-c33.mjs` (giro foto): verde «nessun errore»; rosso C114P01 4 righe («0 figure della seconda bozza invece di 2»).
- Test: 301 su 301 verdi (vitest); tsc pulito.
- Foto: `dopo/tono-*.png` e `prima/tono-*.png` (360, 375, 412, 1366); `altre-{360,375,412}.png` guida 0–5, chiamata del vice (e01 rinforzi) e verbale bene/medio/male/fallita, prima e dopo affiancati.

## Non verificato

- Le foto di guida, chiamata e verbale (`altre-*.png`) sono le vignette da sole (SSR), non le schermate del gioco; nelle schermate le vedono il giro foto e la catena.
- La posizione della lacrima nel verbale «male» è stimata dalla geometria del volto; non l'ho misurata con una prova.
- Il guardiano guarda solo la vignetta del tono (e01 ondata 1, tono di quell'ondata); gli altri toni e il verbale li ho guardati a occhio sulle foto.

## Opzioni per il PO (non scelte da me)

- Guida e chiamata: A) figura nuova a scala 0,9, grande come prima (consigliata: le vignette non cambiano impaginazione); B) stessa inquadratura stretta delle vignette di fine ondata (figure più grandi, da misurare su ogni vignetta della guida); C) figura vecchia fuori da rapporto e verbale (due stili nel gioco).
