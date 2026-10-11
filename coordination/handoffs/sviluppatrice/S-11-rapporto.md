# S-11 – Folla che segue gli eventi dell'ondata (PO-046) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Difetto

Il PO ha segnalato: «Durante la partita i tifosi sono dentro lo stadio, il corteo sulla sinistra non è realistico».

Riproduzione (FATTO MISURATO): la foto «prima» è presa con l'interruttore rosso acceso, che rimette il comportamento vecchio.
- Il corteo era sempre animato sulla prima strada dei dati, in ogni ondata.
- Gli spalti erano sempre pieni.

## Correzione

Nessun dato nuovo: tutto viene dagli eventi già presenti (`m.ondate[n].eventi`, tipo + settore). La regola sta in `src/resa/mappa/folla.ts`:
- **ondata di partita** (evento `curva`): spalti pieni, nessun corteo;
- **prima della partita**: spalti a metà; un corteo per ogni strada con un evento di gente in strada (`corteo`, `arrivo`, `deflusso`, `folla`, `raduno`, `movimento`, `fuga`), diretto verso lo stadio;
- **dopo la partita** (evento `deflusso`, oppure un'ondata che viene dopo quella di partita): spalti con un quarto dei tifosi, cortei che escono dallo stadio.

Come si collega alla mappa:
- la mappa mostra l'ondata in corso; nel rapporto mostra l'ondata appena chiusa; nella sala e nel briefing mostra l'ondata 1;
- lo strato Pixi ridisegna spalti e cortei solo quando cambia l'ondata.

Riparato anche un difetto nato con questa modifica e trovato dal giro delle foto (errore di console «Cannot read properties of null (reading 'set')»): al cambio d'ondata il primo fotogramma toccava gli aloni appena distrutti. Ora l'elenco degli aloni si svuota insieme alla scena.

Interruttore rosso `__NO_C11F01`: corteo fisso sulla prima strada e spalti sempre pieni.

## Guardiano

`tools/foto-club.mjs` → `controllaFolla`, chiamato a ogni schieramento:
- legge ciò che lo strato Pixi ha disegnato davvero (`data-folla` sulla mappa);
- lo confronta con le regole del PO:
  - durante la partita, spalti pieni e nessun corteo;
  - cortei solo dove l'ondata ha un evento;
  - ogni evento `corteo` su una strada ha il suo corteo;
  - al deflusso la gente esce.

Spostato anche il controllo dei colori dei club (S-08) alla prima ondata di partita: con gli spalti a metà, di notte su e03 il campione non bastava (distanza 61 sulla curva del Larkspire). Con gli spalti pieni torna verde.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s11` | e01 ×2, e02, e03 | verde |
| `… VALMORA_ROSSI=C11F01 …` | 360 px | ROSSO: 11 righe (e01 ondate 2 e 3, e02 ondata 3, e03 ondate 2 e 3) |
| `… VALMORA_ROSSI=C10C01 …` (controllo spostato) | 360 px | ROSSO: curva_ospiti di e02 (61) ed e03 (53) |
| `node tools/catena.mjs completa` | commit f952668 (merge della principale d1c680d), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Foto in `docs/foto/s11/2026-10-11/`: e01 a 360 px, prima e dopo (partita, deflusso), più l'arrivo dopo.
