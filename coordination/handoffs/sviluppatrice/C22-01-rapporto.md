# C22-01 – chi chiama fuori dalla vignetta, icona HTML · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Foto in `c22-01/`.

## Difetto (dal collaudo C-022, `docs/revisioni/COLLAUDO_C22.md` riga C22-01)

Nella vignetta della chiamata, chi chiama (telefono, radio, rete, ufficio) era un riquadro disegnato:
- 76×60 unità del viewBox 320×180, quindi glifo di 12,4×10,9 px a 360;
- tratti sotto 1 px;
- riquadro bianco su giallo 1,43:1.

Riguarda 437 chiamate su 498, tutte tranne quelle del vice.

## Correzione (indicazione della principale: «togliere il riquadro dalla vignetta e mettere un'icona di chi chiama come elemento HTML accanto alla vignetta»)

- `src/resa/vignette-chiamata.tsx`: con `chiFuori`, la vignetta non disegna più il riquadro. Accanto c'è un elemento HTML `.chi-icona` (`data-chi-icona`) con l'icona di chi chiama:
  - radio: Radio;
  - telefono: Phone;
  - rete: Globe;
  - ufficio: FileText.
  - Sono icone lucide, le stesse famiglie dell'avatar.
- Il vice resta disegnato nella scena, come prima: è una persona, non un riquadro.
- `src/resa/schermate/Ondata.tsx`: la chiamata passa `chiFuori`.
- **Non toccato:** il briefing, dove la vignetta è la figura 42×42 della fonte (D-118, D-122).
- `src/resa/stile-c18.css` e `src/resa/token.css` (nuovo `--icona-chi: 24px`):
  - glifo nero (`--nero`) su bianco (`--bianco`), contorno `--bordo-fine` nero;
  - l'icona sta sull'angolo in alto a destra della vignetta e ne esce di `--spazio-2` verso l'alto e verso il testo, così copre meno scena.
- **Rosso `__NO_C54C01`:** il riquadro disegnato dentro la vignetta, come prima.

## Guardiano sui px reali

`controllaChiIcona` (`tools/foto-chiamata.mjs`, chiamato da `tools/foto.mjs` in ogni chiamata del giro foto):
- nessun `[data-chi-riquadro]` nella vignetta e l'icona HTML presente;
- glifo misurato a schermo (`getBoundingClientRect` dell'SVG) di almeno 24×24 px;
- glifo e contorno ad almeno 3:1 sul fondo dell'icona (WCAG 1.4.11, https://www.w3.org/TR/WCAG21/#non-text-contrast);
- l'icona non copre il testo della chiamata (0 px²).

## Misure (FATTO MISURATO)

- **Sonda** sulle chiamate e01 «corteo_partito» ed e18 «telefonata»:
  - glifo 24×24 px e icona 36×36 px a 360, 375 e 412;
  - vignetta 101,3×58,7 px a 360, 106,4×61,6 a 375, 119,0×68,7 a 412.
- **Contrasto calcolato dai token:** #111111 su #ffffff, circa 18,9:1 (il guardiano chiede 3:1).
- **`VALMORA_LARGHEZZE=360 node tools/foto.mjs`:**
  - verde exit 0;
  - rosso C54C01 exit 1, 85 righe «chi chiama è disegnato dentro la vignetta (1 riquadri) o manca l'icona accanto», per esempio «corteo_partito», «ufficio_insiste», «pullman».
- **Il guardiano non è cieco sugli altri controlli** (sonda `chi-rossi.mjs`, stile alterato su e01 «corteo_partito» a 360, 375 e 412). Scatta ogni volta:
  - glifo a 18 px: «glifo 18.0×18.0 px, minimo 24×24»;
  - glifo #ccc e contorno #ddd: «glifo 1.61:1, contorno 1.36:1»;
  - icona spostata di 60 px verso il testo: «copre 1008 px² del testo».
  - Senza alterazioni: nessun errore.
- **Nessun cambio di altezza** (sonda `altchiamate.mjs`, prima chiamata di ogni ondata dei 36 episodi a 360×760): fondo del contenuto identico in 142 chiamate su 142, rosso C54C01 contro verde.

## Foto

In `c22-01/`, `prima-*` (codice di prima, poi rosso C54C01) e `dopo-*`:
- e01 «corteo_partito» (telefono), e18 «telefonata» (telefono) ed e01 «fumogeni» (radio), a 360, 375 e 412;
- pagina intera e ritaglio del corpo della chiamata (`*-corpo.png`).

## Resta (C22-09, bassa)

L'avatar del mittente segue ancora `iconaFonte` (`icone.tsx`), che per 222 chiamate dà l'icona generica. L'icona nuova segue `chiDi`. Le due regole restano diverse finché non si fa C22-09.
