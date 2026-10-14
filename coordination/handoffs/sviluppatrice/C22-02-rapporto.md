# C22-02 – pallini delle persone nelle vignette: più grandi, con contorno · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Foto in `c22-02/`.

## Difetto (dal collaudo C-022, riga C22-02)

I pallini delle persone nelle vignette delle chiamate (PO-103):
- larghi 3,3-4,0 px;
- senza contorno;
- neri sulla strada 1,37:1, magenta 1,13-2,90.

## Correzione (`src/resa/vignette-evento.tsx`)

- Ogni persona è un pallino di raggio 10 unità (prima 5,5), con contorno nero (`.v-contorno`, nuovo token `--vignetta-contorno: 4px`, in unità del disegno) e un alone bianco di raggio 15 unità sotto.
  - Su fondo scuro si stacca l'alone; su fondo chiaro il contorno.
  - Il colore del club del tifo resta il riempimento.
- A 360 il pallino misura 6,3 px (101,3/320 × 20), l'alone 9,5 px.
- Le file si diradano per non sovrapporsi:
  - gente: 6 persone ogni 34 unità (prima 7 ogni 26);
  - biglietti: ogni 30 unità (prima 24).
  - Tifo e corteo restano ogni 34 e 36 unità.
- **Rosso `__NO_C55P01`:** pallini e file di prima.
- **Scelta tecnica dichiarata:** il collaudo non dà una misura minima. Ho preso 6 px, quasi il doppio di oggi, perché la vignetta è larga circa 101 px a 360 e file più fitte non ci stanno.

## Guardiano (`controllaVignettaEvento`, `tools/foto-c17.mjs`, su ogni chiamata del giro foto)

Per ogni pallino:
- larghezza a schermo ≥6 px;
- un contorno, che sta a ≥3:1 sul suo alone;
- l'alone o il contorno a ≥3:1 sul fondo della scena sotto il centro del pallino (WCAG 1.4.11, https://www.w3.org/TR/WCAG21/#non-text-contrast).
- Il fondo si legge con `elementsFromPoint`: il primo elemento della scena con riempimento pieno e opaco. Il retino d'ombra e il fumo, semitrasparenti, si saltano.

**Punto cieco trovato e riparato.** A 375×667 la vignetta era fuori dalla finestra. `elementsFromPoint` non trovava nulla e il fondo diventava bianco per difetto: un pallino nero sull'asfalto sarebbe risultato a 18,88:1. Ora il guardiano porta la vignetta in vista prima di leggere e poi ripristina lo scorrimento. Dopo la riparazione il fondo a 375 è l'asfalto, rgb(42, 45, 51), come a 360 e 412.

## Misure (FATTO MISURATO)

- `VALMORA_LARGHEZZE=360 node tools/foto.mjs`:
  - verde exit 0;
  - rosso C55P01 exit 1, 77 righe. Per esempio: «corteo_partito» «3.3 px, senza contorno (rgb(17, 17, 17) su rgb(42, 45, 51): 1.37:1)», «ufficio_insiste» magenta su grigio 1,69:1, «pullman» magenta su asfalto 2,90:1. Sono gli stessi valori del collaudo.
- Il guardiano non è cieco sul contrasto (sonda `pallini-rossi.mjs`, e01 «corteo_partito», stile alterato, a 360, 375 e 412). Scatta ogni volta:
  - alone uguale all'asfalto: «contorno rgb(17, 17, 17), alone rgb(42, 45, 51), fondo rgb(42, 45, 51)»;
  - contorno tolto: «senza contorno … 1.37:1».
  - Senza alterazioni: nessun errore.
- Dopo la riparazione del punto cieco: vedi «Esito dei giri».

## Foto

In `c22-02/`, `prima-*` (build con C22-01, pallini di prima) e `dopo-*`:
- e01 «corteo_partito» (corteo sulla strada), e01 «fumogeni» (tifo in curva) ed e18 «telefonata» (gente), a 360, 375 e 412;
- pagina intera e corpo della chiamata (`*-corpo.png`);
- `conf-412.png`: sopra prima, sotto dopo.

## Resta

Il «!» del fumetto dello scontro (1,8×4,9 px nel collaudo) non è toccato: non è un pallino. Si può fare a parte, se volete.

## Esito dei giri

FATTO MISURATO, `node tools/foto.mjs`, col guardiano riparato:
- verde a 360 (`VALMORA_LARGHEZZE=360`): exit 0;
- verde a 375 (`VALMORA_LARGHEZZE=375`): exit 0;
- rosso C55P01 a 360: 77 righe (giro fatto prima della riparazione; la riparazione cambia solo dove si legge il fondo, non la misura né il contorno).
