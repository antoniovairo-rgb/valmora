# Consegna: PO-121 (D-148), C37-01, C37-03, C37-08 (D-166), D-168 · sviluppatrice

Ramo `claude/valmora-resa-v2`. Rapporto di PO-121: `PO-121-rapporto.md` (foto in `po121/`).

## e14 o1 in CI (0.38.0) – ritiro

- f7f39e9: il guardiano degli schieramenti aspetta che i caratteri siano caricati e a 360 li rallenta di 1,5 s. In locale riproduceva i numeri della CI (6 e 158 px² contro 5 e 160) col carattere in ritardo.
- **Ritiro la conclusione** che fosse la causa della CI: con f7f39e9 la CI resta rossa con lo stesso errore (run 39072431144 sulla principale, run 39072296584 su 4a3bdea). L'indagine è di S-08 (Chrome Headless Shell 156). f7f39e9 resta perché il caso del carattere lento è vero in locale (verde/rosso sotto).
- Misura: guardiano completo verde «nessun errore»; senza l'attesa (`VALMORA_SENZA_FONT=1`) torna «e14 o1 … toccando Tornelli si colpisce mediatore@biglietteria» e «1» × Tornelli 158 px².

## C37-01 – testo del nome fuori dal riquadro (chiuso da C33-01)

| sonda del collaudo `c33-pastiglie.mjs`, 360×760, 142 ondate | 0.37.0 (collaudo) | rosso C100N01 | verde (4a3bdea) |
|---|---|---|---|
| ondate col testo fuori dal riquadro | 18 | 18 | 0 |
| testo fuori sopra una pastiglia | 4 | 3 | 0 |

- Guardiano: quello di C33-01 (testo vero, tetto 0 a 360/375/412) già nella catena.

## C37-03 – nome più vicino al disco di un altro settore

- Causa: a mappa vuota i nomi li mette `migliorCombinazione`, che guardava solo le sovrapposizioni e solo la larghezza piena; «Magazzino delle fonderie» sta sul bordo e non c'era un posto dentro la mappa a larghezza piena.
- Correzione (`etichette.ts`): `nomeLontano` (distanza dal bordo del nome al centro del disco, proprio contro altrui) costa VERA × 100 per px; a mappa vuota la ricerca combinata prova anche le larghezze 80 % e 60 % (saltando quelle col testo che esce). **Rosso `__NO_C111E01`.**
- Misura (e19 o1 a 360, mappa vuota): prima 22 px dal proprio disco, 16 dalla Strada da Kiln; dopo 18 e 50 (nome stretto, sotto a destra); rosso 22 e 16.
- Guardiano (`controllaSchieramenti`): a mappa vuota a 360 (36 episodi × ondate) tetto 0; con le unità a 360/375/412 tetto ai casi misurati il 18/10 (NOMI_VICINI), vedi «Non verificato».

## C37-08 (D-166) – «le tue risposte non bastano»

- `src/resa/causa.ts` (`impegnateDaRisposte`): unità impegnate dalle risposte dell'ondata sulle chiamate di quel settore. Nel rapporto, settore scoperto con copertura 0 ma unità mandate lì da una risposta: «le tue risposte non bastano» invece di «nessuna unità a coprirlo». **Rosso `__NO_C112R01`.**
- Test `tests/causa-risposte.test.ts` (e24 o3, secondo_tempo → steward_t24 sui tornelli): verde «le tue risposte non bastano»; rosso «nessuna unità a coprirlo».

## D-168 – la versione nel margine sinistro

- FATTO MISURATO (prima): a 360 la versione (x 344–360) toccava il bordo del riquadro delle opzioni (x 344) e copriva la loro ombra (`--ombra-1/2`, 5–7 px a destra); il guardiano PO-097 misurava solo i riquadri e solo in cima.
- Ora: margine sinistro (x 0–16 sui telefoni), su PC subito fuori dalla colonna a sinistra. **Rosso `__NO_C113V01`.**
- Sonda (e01 o1, chiamata, in cima e in fondo, 360×640/760, 375×667, 412×915): dopo, «libera» 8/8.
- Guardiani: `controllaVersioneOmbra` (nuovo, ogni schermata del giro foto, pagina in cima e in fondo, ombra compresa); `controllaLargo` controlla il lato sinistro a 1366. Rosso: ROSSO113.

## Giri e STABILITA

- Catena completa: vedi STABILITA.json (ultimo giro).
- Giri NON registrati in STABILITA per errore mio (li avevo scartati col file): rosso su 37d5278 (giro foto di PO-121, segni letti prima della conferma); rosso su 964d2fc (fermato dal mio limite di 90 minuti); instabile su 156dde7 (doppio tocco C-005 letto prima della conferma). Da ora non ne scarto altri.

## Non verificato

- C37-03 con le unità: restano 6 casi a 360 e 3 a 375 (guardiano completo, 18/10): e19 o2–o4 «Magazzino» 22 contro 16 (375: 19), e02 o4 22 contro 22, e15 o4 18 contro 14, e18 o4 22 contro 21. Uguali col rosso C111E01, quindi non vengono dal codice di C37-03; per e19 sono una regressione rispetto alla 0.37.0 (collaudo: 18 contro 50 con le unità), dovuta all'insieme delle regole di C33-01. Peso × 1000 provato: chiude e19 o3 ed e18 o4 ma non e19 o2/o4. Il guardiano li tiene col tetto misurato (6/3/0), non a 0.
- La CI di GitHub su questo ramo resta rossa finché S-08 non chiude e14 o1.
- Lettore di schermo su «Annulla» (PO-121): non provato.

## Opzioni per la principale (non scelte da me)

- C37-03 con le unità (e19 o2–o4, e02/e15/e18 o4): A) lasciare col tetto misurato e chiuderli in un lotto a parte sul risolutore (consigliata: sono 3–6 px e non coprono nulla); B) vincolo forte, da misurare perché sposta altre etichette (× 1000 non basta per e19); C) una linea sottile dal nome al suo disco nei casi ambigui (lavoro di disegno).
