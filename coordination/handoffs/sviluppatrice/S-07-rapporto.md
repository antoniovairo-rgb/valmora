# S-07 – Controllo di versione e build nella home (PO-032) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, con merge (non rebase) fino a 60ccab4 (rilascio 0.2.0) e 20432cd. Stato: **consegnato.**

## Cosa ho fatto

- tools/foto.mjs, nella home a ogni larghezza:
  - `[data-versione]` deve essere uguale a `GAME_VERSION` (src/versione.ts, oggi «0.2.0»);
  - la riga deve contenere «build <qualcosa>» e non «build sviluppo».
- Interruttore rosso `__NO_C05S09` in src/resa/schermate/Titolo.tsx: mostra «build sviluppo».

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto` | 3 larghezze | verde |
| `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C05S09 node tools/foto.mjs out/foto-rossa-S09` | 360 px | ROSSO come atteso: «home: build non valida in «Versione 0.2.0 · build sviluppo»» |
| `node tools/catena.mjs completa` | vedi sotto | |

## Problemi aperti

Nessuno. Non ho altri compiti in coda.
