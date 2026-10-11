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
| `node tools/catena.mjs completa` | commit 8436b78, 3 giri | 3 su 3 VERDI, nessun passo ritentato |

## Problemi aperti

Nessuno. Non ho altri compiti in coda.

## Richiesta arrivata dal PO in questa sessione (da registrare: la registra la principale)

«Colori delle curve e tifosi sarebbe bello diversi in base alla squadra.» Oggi la resa colora la curva
di sinistra in arancio e quella di destra in azzurro (token `--mappa-curva-a/b`, `--mappa-folla-a/b`,
`--mappa-corteo-1`), qualunque sia il club. Per farlo servono dati che non ho il permesso di toccare:
- `data/club/*.json` + `schema/club.schema.json`: due colori per club (per esempio `colori: { primario, secondario }`);
- `mappa.settori[]` di tipo curva (ed eventualmente strade e stazione per il corteo): il campo `club`.
Con quei dati la resa colora curve, folla e corteo per club, e tiene i colori di oggi se il dato manca.
