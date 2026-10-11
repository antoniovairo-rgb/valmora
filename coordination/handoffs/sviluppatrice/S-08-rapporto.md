# S-08 – Rilievi di resa C-010 (C09-02, C09-03, C09-04) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegna parziale** (solo C09-02/03/04). Ancora da fare in S-08: bilancio nel verbale (PO-036, D-085), colori e stemmi dei club (PO-038, PO-040), C09-01 picco. I messaggi della principale con l'ambito completo mi sono arrivati alle 18:32 UTC, dopo la scadenza delle 18:30.

## Cosa ho fatto

- **C09-02**: un settore «scoperto» non ha più il pallino verde chiaro. Nel rapporto (mappa ed elenco) un
  settore scoperto ha almeno il giallo (livello 2). Il colore resta quello della tensione (D-055), mai il
  numero. Interruttore rosso `__NO_C10S02`.
- **C09-03**, pulsante sotto la piega:
  - i pulsanti principali (avanti, prossimo messaggio, alla prima ondata, conferma, leggi il rapporto, continua) restano attaccati in basso (`position: sticky`);
  - nella chiamata, se la prima opzione non si vede intera, compare in basso l'indicatore «Rispondi ↓», che porta alle opzioni;
  - causa vera trovata: `#app` aveva `overflow-x: hidden`, che rende l'elemento un contenitore di scorrimento e blocca `sticky`. Ora è `overflow-x: clip`, che taglia lo stesso senza bloccare.

  Interruttore rosso `__NO_C10S03`.
- **C09-04**, steward messo in silenzio: l'unità scelta resta scelta anche quando è finita, e un tocco su un
  settore mostra «Squadre: finite. Tocca un'altra unità nel vassoio.» invece di passare in silenzio alla
  successiva. Interruttore rosso `__NO_C10S04`.
- Controlli permanenti in tools/foto.mjs:
  - in ogni foto, il pulsante principale (o l'indicatore delle opzioni) è dentro la finestra a scorrimento zero;
  - nel rapporto, un settore scoperto ha `liv-2` o più;
  - nello schieramento dell'ondata 1, un tocco con l'unità scelta finita non aggiunge unità e mostra l'avviso.

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto` | e01 ×2, e02, e03, 3 larghezze | verde |
| `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C10S02 …` | 360 px | ROSSO: «viale_stazione scoperto ma colore tranquillo (liv-1)», «piazzale … (liv-1)» |
| `… VALMORA_ROSSI=C10S03 …` | 360 px | ROSSO: «opzioni sotto la piega senza indicatore» ×8, «Prossima ondata» ×4, «Ascolta le fonti» ×3, «Conferma» ×2 |
| `… VALMORA_ROSSI=C10S04 …` | 360 px | ROSSO: «unità finita senza avviso» |
| `node tools/catena.mjs completa` | vedi sotto | |

Limite del controllo C09-04 (FATTO MISURATO): nel giro delle foto, al momento del tocco tutte le unità
sono già schierate. Col difetto non si mette quindi nessuna unità sbagliata: il braccio rosso scatta solo
sull'avviso mancante.
