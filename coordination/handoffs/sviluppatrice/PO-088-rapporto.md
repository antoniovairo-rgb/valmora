# PO-088 – Sulla mappa pulsa solo il settore della chiamata · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata la parte di resa** (vedi «Cosa resta» in fondo).

## Difetto

Durante una chiamata poteva pulsare, cioè sembrare «in pericolo», un settore diverso da quello di cui parla la scena: per esempio la stazione mentre la chiamata riguarda la strada.
- Causa (`src/resa/mappa/StratoPixi.tsx`, ciclo `passo`): il «battito» degli aloni si applicava a **tutti** gli aloni, cioè a ogni settore con un colore di tensione.
- Il settore della chiamata aveva in più solo le onde gialle.

## Cosa ho fatto

- Pulsano (battito e onde) **solo i settori accesi**, che durante una chiamata sono soltanto `chiamata.settore` (`src/resa/App.tsx`, scena chiamata, `accesi`).
- Gli altri aloni restano fermi, col colore della loro tensione: i colori dei punti non cambiano.
- Fuori dalle chiamate (schieramento, chiusura, rapporto) non pulsa niente.
  - Nella sala, all'apertura, sono accesi tutti i settori, come prima.
- La mappa espone `data-lampeggianti`: l'elenco dei settori che pulsano, per il guardiano.
- **Rosso `__NO_C31M01`**: pulsano tutti gli aloni, come prima.

## Guardiano

`controllaLampeggio` in `tools/foto-club.mjs`, chiamato da `tools/foto.mjs`, solo con la mappa WebGL:
- **in ogni chiamata** delle partite di e01, e02 ed e03: deve pulsare esattamente il settore della chiamata, preso dai dati della missione (`chiamate[].settore`);
- **nello schieramento** dell'ondata 1: non deve pulsare niente.

## Misure

- Rosso `C31M01` (FATTO MISURATO, `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C31M01 node tools/foto.mjs`): il guardiano scatta in 103 chiamate e in 8 schieramenti (e01 tre volte, e02, e03, e07, e13, e25). Il braccio rosso vede il difetto.
- Verde: catena completa della consegna (`STABILITA.json`).
- Le foto ferme non mostrano il battito (con `reducedMotion` la mappa resta ferma); la misura è `data-lampeggianti`.

## Cosa resta (non è resa)

- «Colori dei punti coerenti con gli eventi davvero accaduti»: i colori vengono dalla tensione calcolata dal motore (`ic.tensione`). La coerenza fra eventi e chiamate (PO-087) è della principale.
- «Squadre schierate visibili sui punti»: le pastiglie delle squadre già si vedono sui settori durante le chiamate (`presenze: ic.disposizione`; foto della chiamata 4/5 di e01 a 360 nel giro delle foto: 4 squadre sulla curva Cinderwick). Non ho cambiato niente.
