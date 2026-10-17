# C33-06 (D-143), C33-07 (D-144), C33-09 (D-147) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: aab4ce6 (C33-07), 2964b23 (C33-09), d12ea98 (C33-06), COMMIT_FINALE. Foto in `c33b/`.

## C33-06 – scena del tono prima del rapporto

- Prima: nel rapporto la vignetta del tono era quasi sempre nascosta (D-126 d, spazio insufficiente); il guardiano accettava «nascosta».
- Ora: dopo «Leggi il rapporto» una scena «tono» (`src/resa/schermate/Tono.tsx`) con «Fine dell'ondata N» e la vignetta a tutta larghezza della colonna (proporzione 320×180, `fissa`, mai nascosta). Avanza da sola dopo 2 s (`TONO_MS`), oppure con un tocco o con Invio/Spazio. Nessun comando nella scena: il fuoco sta sulla scena (D-142). Il rapporto resta com'è.
- **Rosso `__NO_C110V01`:** niente scena, il rapporto subito.
- Guardiano permanente `tools/foto-c33.mjs` (`controllaTono`, nel giro foto): e01 ondata 1 a 360×760, 375×812, 412×915, 1366×768: scena «tono» presente; vignetta tutta nella finestra, alta più di 0, non nascosta; fuoco sulla scena; da sola al rapporto entro 4 s; a 360 anche con Invio entro 1,5 s.

| misura | prima (rosso C110V01) | dopo |
|---|---|---|
| scena del tono a fine ondata (4 larghezze + Invio a 360) | assente 5/5 | presente 5/5 |
| vignetta visibile nella scena | – | 5/5 (foto `c33b/tono-*.png`) |
| fuoco sulla scena | – | 5/5 |
| passa al rapporto (da sola / Invio) | – | 4/4, 1/1 |

## C33-07 – un settore scoperto vale almeno «teso»

- `src/resa/espressioni.ts`: `tonoOndata(livelli, scoperti)`: se il tono dalla tensione è «calmo» e almeno un settore è scoperto, il tono è «teso». Usato dal rapporto e dalla scena del tono.
- **Rosso `__NO_C108T01`:** solo la tensione, come prima.
- Test `tests/espressioni.test.ts`: calmo + 1 scoperto → teso; calmo + 0 → calmo; critico resta critico; rosso → calmo.

## C33-09 – la seconda stella col numero

- È nella resa (`src/resa/schermate/Bilancio.tsx`, `requisitoInParole`), quindi mio. Al colore si aggiunge il numero: «Per la seconda stella la tensione non deve passare il giallo (massimo 3 su 10): è arrivata all'arancione (4).» La scala («su 10») viene dalla dichiarazione della variabile (`tensione_max`, max 10). Soglie e colori invariati.
- **Rosso `__NO_C109S01`:** solo i colori.
- Test `tests/stella-numero.test.ts`: verde «(massimo 3 su 10)» e «(4)»; rosso nessuna cifra.

## Giri

- Test: tutti verdi (vedi STABILITA).
- Guardiano C33-06: verde «nessun errore»; rosso C110V01 5 righe «manca la scena del tono».
- Catena completa: vedi STABILITA.

## Non verificato

- La scena del tono allunga di 2 s ogni fine ondata; le sonde del collaudo che aspettano il rapporto subito dopo «Leggi il rapporto» possono doverlo attendere (il giro foto lo attende già).
- Il testo «Fine dell'ondata N» non è nei dati (testi): è nella resa, come «Rapporto dell'ondata N».

## Opzioni per il PO (non scelte da me)

- Nelle foto la vignetta sta in alto e sotto resta spazio vuoto. A) lasciare così (consigliata: niente scorrimento, si legge subito); B) centrare la vignetta in verticale; C) vignetta più grande oltre la colonna (a 1366 fino a metà schermo).
