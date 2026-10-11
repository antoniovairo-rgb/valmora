# Salvataggi reali

Qui vanno copie di salvataggi VERI (scritti dal gioco, non a mano), uno o più per ogni versione
vecchia: `v<SAVE_VERSION>-<descrizione>.json`. Il passo «salvataggi-reali» della catena logica
pretende almeno un file per ogni versione da 1 a SAVE_VERSION-1 e li migra tutti.

SAVE_VERSION = 2 (missione a scene). I file v1 sono stati scritti dalla build 0.1.0 (commit 759f0b7)
giocata da Chromium headless a 360 px, copiando `localStorage["valmora-salvataggio"]` così com'era:
- `v1-nuova-partita.json`: subito dopo «Nuova partita» (in_corso null);
- `v1-dopo-ondata-1.json`: dopo l'ondata 1 della plancia (in_corso del motore 0.1.0).
