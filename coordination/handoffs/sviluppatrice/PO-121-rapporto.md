# PO-121 (D-148) – annullare la risposta a una chiamata entro 5 secondi · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: COMMIT. Foto in `po121/`.

## Cosa fa

- Dopo aver scelto una risposta compare «Annulla 5», sotto le opzioni, con un conto alla rovescia di un secondo alla volta. La pagina scorre fin lì se serve; il fuoco NON ci va (resta sull'opzione scelta).
- «Annulla» (tocco o tastiera): la scelta non conta, la chiamata torna com'era (stesse opzioni, niente applicato).
- Scaduti i 5 s la risposta diventa definitiva e il gioco va avanti come prima (segni sulla mappa, squadre in volo, risposta del vice).
- Un secondo Invio sull'opzione scelta non fa nulla (l'opzione scelta non si può ripremere: `aria-disabled`, il gestore esce); le altre opzioni sono spente.
- **Rosso `__NO_C107A01`:** niente «Annulla», la risposta vale subito, come nella 0.37.0.

## Come (scelta tecnica: la risposta si applica solo alla conferma)

- Logica pura `src/logica/sospesa.ts`, senza tempi: `sospendi` (controlla chiamata e opzione come `rispondi`, senza applicare), `valida` (stessa ondata, nessuna risposta data nel frattempo), `decidi(…, 'confermata' | 'annullata')`: annullata restituisce lo stato identico, confermata è `rispondi`.
- La scelta in sospeso vive solo nella resa (`App.tsx`, un `useRef`): non entra in `InCorso` né nel salvataggio. Se il gioco si chiude durante i 5 s, alla ripresa la chiamata è ancora aperta. SAVE_VERSION e migrazione: non servono (il formato non cambia).
- Il conto alla rovescia (5 s, `ANNULLA_SECONDI` in `Ondata.tsx`) è solo nella resa.
- Il bot e la catena logica non passano dalla resa: nessun numero cambia (catena logica verde, vedi STABILITA).
- `Scena.tsx`: il fuoco perso non va mai da solo su «Annulla» (escluso da `COMANDI`).

## Misure

| prova | prima (rosso C107A01) | dopo |
|---|---|---|
| «Annulla» dopo la risposta, 360/375/412/1366 | assente 4/4 | presente 4/4, visibile, non coperto, tocco 51 px, conto «5» |
| fuoco su «Annulla» da solo | – | 0/4 |
| secondo Invio: annulla o conferma prima del tempo | – | 0/4 |
| «Annulla»: stesse opzioni, salvataggio identico | – | 4/4 |
| scaduti 5 s la risposta è salvata (360) | – | sì |
| salvataggio vero (`v2-0.4.0-e02-in-corso.json`, migrato), chiuso durante i 5 s: alla ripresa stessa chiamata, stesse opzioni, stato salvato identico (360) | – | sì |

- Test logici `tests/sospesa.test.ts`: per ogni chiamata di ogni episodio col bot attento (più di 400), annullata = stesso oggetto e stessi campi, chiamata ancora aperta con le stesse opzioni; confermata = `rispondi`; la stessa scelta non si conferma due volte.
- Guardiano permanente `tools/foto-po121.mjs` (`controllaAnnulla`), nel giro foto (catena grafica): verde 0 righe; rosso C107A01 4 righe («dopo la risposta manca Annulla»).

## Non verificato

- Il conto alla rovescia usa il tempo reale (5 s): le prove lo misurano a 5,6 s, non a ogni secondo.
- Lettori di schermo: «Annulla» sta in una zona `role="status"` col conto nell'etichetta; non l'ho provato con un lettore vero.
- Se il giocatore lascia la chiamata durante i 5 s (casa), la scelta si perde come alla chiusura; non c'è una prova dedicata.

## Opzioni per il PO (non scelte da me)

- Durata: 5 s come deciso. Se in prova risultasse lunga per chi gioca veloce: A) lasciare 5 s (consigliata, è la decisione); B) 3 s; C) «Annulla» finché non si tocca «Avanti».
