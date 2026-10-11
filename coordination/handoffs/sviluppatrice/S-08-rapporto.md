# S-08 – Rilievi di resa C-010 (C09-02, C09-03, C09-04) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **S-08 completa** (seconda consegna). Prima consegna (ae46c72): solo C09-02/03/04, i messaggi con l'ambito intero mi sono arrivati alle 18:32 UTC, dopo la scadenza delle 18:30.

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
| `node tools/catena.mjs completa` | commit 9617374 (con merge della principale 3f0288f), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Limite del controllo C09-04 (FATTO MISURATO): nel giro delle foto, al momento del tocco tutte le unità
sono già schierate. Col difetto non si mette quindi nessuna unità sbagliata: il braccio rosso scatta solo
sull'avviso mancante.

## Seconda consegna: bilancio, club, picco

- **Bilancio nel verbale** (PO-036, D-085), file `src/resa/schermate/Bilancio.tsx`:
  - sotto l'esito ci sono 4 sezioni: «Cosa ti ha aiutato» (verde), «Cosa ha pesato» (magenta), «Dove sei rimasto scoperto», «Per la stella successiva»;
  - aiuti e pesi mostrano al massimo 3 voci: il testo dell'opzione scelta più gli impatti in parole (es. «−2 pressione su Strada da Cinderwick, −1 Squadre di riserva»);
  - per la stella successiva c'è il requisito mancante più vicino (es. «Tensione massima ≤ 3: hai 4»);
  - le 4 sezioni sostituiscono «Le scelte che hanno pesato»;
  - interruttori rossi: `__NO_C05R03` (tutte le scelte in fila, come prima), più quello del motore `__NO_C10B01`.
- **Colori dei club sulla mappa** (PO-038, D-086):
  - curve, tifosi (3 su 4 col primario, 1 col secondario) e corteo prendono i colori dai dati del club della curva;
  - il corteo usa i colori della curva «ospiti», altrimenti della prima curva;
  - se un club non ha colori, restano i token di prima;
  - sono colori dei dati, non scritti nel codice: il guardiano dei token non cambia;
  - interruttore rosso `__NO_C10C01`.
- **Stemmi** (PO-040, D-088), file `src/resa/stemma.tsx`:
  - scudo, tondo o rombo con il simbolo (ciminiera, calderone, collina, penna), disegnati in SVG;
  - per i club senza stemma (quelli nuovi degli abbozzi) c'è uno scudo con le iniziali;
  - la «sfida» (club A contro club B) compare nella sala, nella scheda dell'episodio sulla città e nel verbale;
  - interruttore rosso `__NO_C10C02`.
- **C09-01, picco**: nel rapporto, sotto il nome del settore, compaiono un campione del colore del picco e «salita, poi calmata» quando il livello del picco supera quello finale. Interruttore rosso `__NO_C10S01`.
- Controlli permanenti in `tools/foto-club.mjs`, chiamato da `tools/foto.mjs`:
  - curve: il pixel più vicino al primario del club dista al massimo 40 in RGB, cercato in una fascia sopra il settore, fuori dall'alone;
  - stemmi uguali ai club delle curve, nella sala e nel verbale;
  - picco visibile se e solo se il motore dice che c'è stata una salita;
  - nel verbale: 4 sezioni, al massimo 3 aiuti e 3 pesi, nessuna scelta fuori dal bilancio, bilancio non vuoto se ci sono state scelte.

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto-s08` | e01 ×2, e02, e03, 3 larghezze | verde |
| `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C10C01 …` | 360 px | ROSSO: curva_ospiti di e02 (61) ed e03 (53) |
| `… VALMORA_ROSSI=C10C02 …` | 360 px | ROSSO: stemmi «» nella sala e nel verbale di e01, e02, e03 |
| `… VALMORA_ROSSI=C10S01 …` | 360 px | ROSSO: 8 picchi non mostrati (e01 rapporti 1-3, e02 rapporti 2-3) |
| `… VALMORA_ROSSI=C10B01 …` (motore) | 360 px | ROSSO: «partita con scelte ma bilancio vuoto» ×4 |
| `… VALMORA_ROSSI=C05R03 …` | 360 px | ROSSO: «13 scelte fuori dal bilancio», sezioni assenti |
| `node tools/catena.mjs completa` | vedi sotto | |

Limite del controllo dei colori (FATTO MISURATO):
- su e01 il braccio rosso non scatta, perché il primario del Cinderwick (#ff6a13) è quasi uguale al vecchio token arancio. Lo stesso vale per il Larkspire su tutte le missioni: primario e token sono identici (#2fa7ff);
- il difetto si vede quindi sulle curve ospiti di e02 ed e03.

Foto in `docs/foto/s08/2026-10-11/`, a 360 e 412 px: verbale di e01, curve di e01 ed e02 (con stemmi), rapporto con il picco, stemmi di e03.
