# C34-01 e C34-08 (D-142) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Rilievi in `docs/revisioni/COLLAUDO_C34.md` (ramo `claude/valmora-collaudo-c34`).

## C34-01 – il fuoco va sul titolo del riepilogo, non su «Sì, conferma»

- Causa (dal collaudo, confermata): `Scena.tsx` manda il fuoco perso al comando più vicino all'ultimo (C32-01); dopo Invio su «Conferma» il più vicino era «Sì, conferma» del riepilogo, spesso fuori dalla finestra (`preventScroll`), e un secondo Invio confermava senza aver visto il riepilogo.
- Correzione: `src/resa/fuoco-titolo.ts` (`useFuocoTitolo`): quando si apre un riepilogo o una conferma il fuoco va sul suo titolo (tabIndex -1, fuori dal giro dei Tab) e la pagina scorre fin lì. Usato in:
  - `Schieramento.tsx` – riepilogo dello schieramento (titolo «Il tuo schieramento»);
  - `Tripla.tsx` – la triplice conferma, a ogni passo (il pulsante «Sì» restava lo stesso elemento da un passo all'altro: tre Invio passavano tutti e tre i passi);
  - `Archivio.tsx` – le due conferme prima di importare.
  - `stile.css`: `.titolo-fuoco:focus { outline: none; }` (come `.scena`).
- **Rosso `__NO_C104R01`.**
- Misura (sonda del collaudo `c34-riepilogo-fuoco.mjs`, e01 ed e19 a 360×760, 1024×768, 1366×768):
  - verde 6/6 fuoco su `H3.titolo-fuoco` nella finestra; il secondo Invio non fa nulla (resta lo schieramento);
  - rosso C104R01 6/6 come nella 0.34.0: fuoco su «Sì, conferma», fuori dalla finestra (y 781) a 1024 e 1366, il secondo Invio apre la chiamata.
- Guardiani (giro foto, catena grafica):
  - `controllaRiepilogoFuoco` (`tools/foto-c22.mjs`): sullo schieramento, alla misura del giro e a 1366×768, Invio su «Conferma» → il fuoco non è su un comando ed è nella finestra; poi «Torna allo schieramento»;
  - `controllaTripla` (`tools/foto-club.mjs`): i passi si fanno con la tastiera (fuoco su «Sì, vai avanti», Invio) e dopo ogni passo il fuoco non è su un comando.
  - Giro foto: verde 0 righe; rosso C104R01 136 righe (56 sul riepilogo, il resto sulla triplice conferma).
- Effetto sui Tab: «conferma-passo» 1 → 2 (il fuoco sta sul testo; Tab → «No», Tab → «Sì»).

## C34-08 (D-142) – entrando in una scena nuova il Tab riparte dall'inizio

- Causa: entrando in una scena nuova il fuoco andava al comando più vicino al punto dell'ultimo comando della scena di PRIMA (città: 10 Tab fino alla stagione 1; schieramento: 10 fino alla prima unità).
- Correzione (`Scena.tsx`): al montaggio di una scena il punto si azzera; il comando più vicino vale solo per il fuoco perso dentro la stessa scena (pastiglia ritirata, opzione disattivata, riepilogo chiuso). Entrando in una scena nuova il fuoco va sulla scena (C28-09: mai sul body). **Rosso `__NO_C105S01`.**
- Misura (sonda del collaudo `c32-fuoco.mjs`, e01 a 1366×768):

| Tab fino a | prima (0.34 + C34-01) | verde | rosso C105S01 |
|---|---|---|---|
| stagione 1 | 10 | 2 | 10 |
| prima unità | 10 | 1 | 9 |
| un settore | 9 | 9 | 9 |
| «Conferma» | 12 | 12 | 12 |
| prima opzione della chiamata | 1 | 2 | 1 |
| «continua» | 0 | 1 | 0 |

  Ogni chiamata è una scena nuova: la prima opzione costa un Tab in più, «continua» non ha più il fuoco da solo (un Invio non salta la risposta).
- Guardiano C32-01 (`controllaFuoco`, decisione D-142 della principale): ristretto al fuoco perso DENTRO la scena. A ogni schermata del giro foto si mette il fuoco sul primo comando della scena e lo si toglie (blur, come una pastiglia che si ritira); il fuoco deve finire su un comando, non sulla scena né sul body. All'ingresso di una scena nuova resta il controllo «mai sul body» (C28-09).
  - Giro foto: verde 0 righe; rosso C97F01 290 righe («il fuoco perso dentro la scena sta sulla scena»).
