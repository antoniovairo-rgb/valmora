# S-26 – Mappa scura dopo il background (PO-081) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata, con riproduzione sul telefono NON riuscita** (vedi sotto).

## Difetto (dal telefono del PO)

Dopo essere usciti dall'app e rientrati, la mappa diventa scura: le particelle restano, lo sfondo disegnato no.

## Riproduzione

- FATTO MISURATO: in Chromium headless (Playwright, 360×760) ho provato:
  - pagina nascosta e poi visibile;
  - perdita e ripristino del contesto WebGL (`WEBGL_lose_context`: `loseContext()` e poi `restoreContext()`).
- In entrambi i casi la mappa dello schieramento e quella della città **si ripristinano da sole**: il difetto **non si riproduce** nel browser di prova.
- IPOTESI (Non verificato sul telefono): su Android il sistema scarta la memoria grafica in background. La texture dello sfondo nasce da un canvas 2D disegnato una volta sola (`sfondo.ts`, `disegnaSfondo`), e quel canvas non viene ridisegnato.
  - Le particelle invece si ridisegnano a ogni fotogramma: questo spiega «scuro ma con la folla».

## Cosa ho fatto

- `src/resa/mappa/ridisegno.ts` (nuovo), `useRidisegno(app, contenitore)`.
  - Conta i ritorni: `visibilitychange` con la pagina di nuovo visibile, e `webglcontextrestored` sulla tela Pixi.
  - Il conteggio entra nelle dipendenze dell'effetto che disegna lo sfondo, in `StratoPixi.tsx` (schieramento) e in `StratoCitta.tsx` (città). A ogni ritorno lo sfondo si ridisegna da capo.
  - Espone `data-sfondo` (numero di ridisegni) sul contenitore della mappa, per il guardiano.
- **Rosso `__NO_C31W01`**: nessun ridisegno, come prima.
  - Id assegnato dalla principale (messaggio delle 19:57 UTC): C28W01 era già usato da C16-03. Prima del messaggio l'interruttore si chiamava C30M01; l'ho rinominato.

## Guardiano

`controllaRidisegno` in `tools/foto-club.mjs`, chiamato da `tools/foto.mjs` sullo schieramento dell'ondata 1 di e01, e02 ed e03, solo con la mappa WebGL. Fa due cose:
- simula il background (pagina nascosta e poi visibile) e la perdita e il ripristino del contesto WebGL;
- poi verifica due condizioni:
  - `data-sfondo` cresce di almeno 2;
  - la media dei pixel della mappa cambia meno di 8 (la mappa ha lo stesso aspetto di prima).

## Misure (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori.
- Rosso (misurato col vecchio nome C30M01, stesso codice): il guardiano scatta in e01, e02 ed e03 con «tornando dal background lo sfondo della mappa non si ridisegna (0 → 0)». Il braccio rosso vede il difetto, quindi il guardiano non è cieco.
- Limite dichiarato: il guardiano dimostra che lo sfondo si ridisegna; non dimostra che questo basti sul telefono del PO, perché lì non ho potuto misurare. **Chiedo al PO una prova sul telefono** con l'APK di questa build.

## Correzione successiva: aloni persi dopo il ridisegno (difetto mio, trovato prima della consegna)

- Difetto: il ridisegno dello sfondo distruggeva la scena Pixi con gli aloni colorati della tensione, e l'effetto degli aloni non si rifaceva. Dopo il background i settori restavano senza alone fino alla scena successiva.
- Correzione: l'effetto degli aloni dipende anche dal contatore dei ridisegni (`src/resa/mappa/StratoPixi.tsx`); la mappa espone `data-aloni`.
- **Rosso `__NO_C31W02`**: gli aloni non si rifanno, come prima della correzione.
- Guardiano: `controllaRidisegno` confronta `data-aloni` prima e dopo il background.
- FATTO MISURATO (`VALMORA_LARGHEZZE=360 node tools/foto.mjs`):
  - verde: 0 errori;
  - rosso `C31W02`: «gli aloni della tensione sono 0 invece di 5» negli schieramenti di e01 (3 volte), e02, e03, e07, e13 ed e25.
