# S-21 – «Indietro» e «Home» (D-104, C14-05, PO-075) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Cosa ho fatto

- **Tasto indietro del telefono e del browser** (`src/resa/indietro.ts`):
  - fuori dalla home c'è sempre una voce di cronologia «trappola», quindi il tasto indietro non esce mai a metà;
  - nelle schermate a passi (sala, briefing, verbale) rilegge il passo precedente: `Passi.tsx` registra il suo gestore;
  - altrimenti porta alla home, con la partita salvata: «Riprendi» riporta esattamente lì;
  - non annulla mai risposte o schieramenti confermati (D-104);
  - dalla home, il tasto indietro esce come ci si aspetta;
  - interruttore rosso `__NO_C25I01`: nessuna trappola, come prima.
- **Pulsante «Home»** (`TastoHome`, icona casa, 44×44):
  - **città**: nella riga dei pulsanti delle stagioni. Nell'angolo della mappa copriva il punto di e01.
  - **episodio** (sala, briefing, schieramento, chiamata, risposta, chiusura, rapporto): nell'angolo della mappa più lontano dai settori. In e02 ed e15 la stazione sta in alto a sinistra, quindi lì il pulsante va in un altro angolo.
  - **verbale**: nella testata, dove l'etichetta è corta.
  - Nella testata delle altre schermate tagliava l'etichetta a 360 px: il controllo C-005 R07 l'ha segnalata su chiamate, schieramenti, risposte e città.
  - Ho anche accorciato l'etichetta della chiamata: «chiamata 1/5» invece di «chiamata 1 di 5».
- **App Android**: il tasto indietro della WebView di Capacitor torna indietro nella cronologia se può, quindi dovrebbe comportarsi allo stesso modo (IPOTESI). **Non verificato** su un telefono.

## Guardiani

- `controllaIndietro` (a 360 px, con un episodio in corso), in `tools/foto-club.mjs`:
  - dall'episodio, il tasto indietro porta alla home, il salvataggio resta identico e «Riprendi» torna alla stessa schermata;
  - il pulsante «Home» fa lo stesso;
  - dalla città, il tasto indietro porta alla home.
- `tools/foto-bozze.mjs`: nella sala di e01, «Avanti» e poi il tasto indietro riportano al passo 1.
- `controllaHome`: su ogni foto e sullo schieramento dei 36 episodi, il pulsante «Home» non copre punti né nomi dei settori.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s21` | partita completa, archivio, ripartenza, indietro, 36 episodi | verde |
| stesso comando, con «Home» nella testata | 360 px | ROSSO: «etichetta della testata tagliata» su chiamate, schieramenti, risposte, città |
| stesso comando, con «Home» sempre in alto a sinistra | 360 px | ROSSO: «il pulsante Home copre stazione» (e02, e15) |
| `… VALMORA_ROSSI=C25I01 …` | 360 px | ROSSO: «indietro dall'episodio: si arriva a fuori dal gioco (about:blank)» |
| `node tools/foto.mjs out/foto-s21` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | commit 938b6f7 (merge della principale), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Foto in `docs/foto/s21/2026-10-12/`: schieramento e città, prima e dopo, a 360, 375 e 412 px.
