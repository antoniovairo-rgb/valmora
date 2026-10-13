# PO-101 (icona «i» dell'ondata) e C19-04 (contrasto su ogni fondo) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, sopra il merge dei dati di PO-101 (c935b60).

## PO-101

- Nella testata, accanto al titolo, c'è una «i»: tondo giallo con bordo nero, come il «?» dello schieramento (`Testata` in `src/resa/schermate/Fumetto.tsx`).
  - Compare in ogni scena dentro un'ondata: schieramento, chiamate, chiusura e risposta. Il titolo dell'ondata compare solo nello schieramento; nelle altre scene la riga spiega comunque l'ondata in corso.
  - La riga viene da «eXX.ondataN.i» dei dati (`infoOndata` in `src/resa/partita.ts`, `testoSe` in `src/resa/dati.ts`). Se la chiave manca, l'icona non c'è.
- Al tocco la riga si apre sotto il titolo, dentro la testata: spinge giù la mappa e non copre niente. Si chiude toccando di nuovo o altrove.
- Tondo di 32 px, ma il tocco resta di 44 px (`::after`). L'etichetta «Ondata N/M · …» resta intera sulla riga sopra. Con un tondo di 44 px accanto al titolo l'etichetta si troncava in 30 schermate, misurato a 360.
- **Rosso `__NO_C43I01`:** niente icona.
- **Guardiano** in `tools/foto-schieramenti.mjs`, e07 ondata 2 a 360×760, 375×667 e 412×915. Controlla che:
  - l'icona ci sia;
  - al tocco la riga contenga testo dei dati;
  - la riga non copra la mappa né comandi e stia nella finestra;
  - il secondo tocco chiuda la riga;
  - un tocco altrove la chiuda.
- **Foto** in `po101/`: `prima-<w>.png` (rosso, senza icona), `dopo-<w>-chiusa.png` e `dopo-<w>-aperta.png`.

## C19-04

- `controllaContrasto` (`tools/foto-contrasto.mjs`) ora misura ogni testo sul suo fondo effettivo.
  - Soglie: ≥ 4,5:1, oppure ≥ 3:1 per il testo grande (≥ 24 px, o ≥ 18,66 px in grassetto). Fonte: https://www.w3.org/TR/WCAG21/#contrast-minimum
  - Restano fuori: vignette SVG, testi sulla mappa (tela disegnata), fondi a immagine e comandi disattivati (WCAG li esenta).
- `--colore-bene` passa da #0f9d4f (3,53:1 sul bianco) a #0b7d3e (5,23:1 sul bianco; bianco su di esso 5,23:1).
- **Rosso `__NO_C40C01`:** rimette anche il verde di prima.

## Misure (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori.
- Rosso C43I01: «manca la «i» accanto al titolo dell'ondata» a 360×760, 375×667 e 412×915.
- Rosso C40C01, contrasto (oltre ai suoi rilievi di PO-098 sulla versione):

  | Testo | Rapporto | Volte |
  |---|---|---|
  | «+1» | 3,53:1 | 53 |
  | «+2» | 3,53:1 | 2 |
  | «sotto controllo» | 3,53:1 | 12 |
  | «Cosa ti ha aiutato» | 3,53:1 | 3 |
  | righe «Fiducia ±N» sul giallo | 2,46:1 e 3,32:1 | 9 |
