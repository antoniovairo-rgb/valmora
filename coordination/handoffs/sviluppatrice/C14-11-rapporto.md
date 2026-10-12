# C14-11 – Dove rende ogni unità (D-037), dentro S-18 · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Cosa ho fatto

- Nello schieramento, la riga «In mano» ora dice anche dove rende l'unità presa (`rende()` in `Schieramento.tsx`). Usa i settori di questa missione, letti dall'efficacia per tipo di settore dei dati (D-037/D-039).
  - Esempio, squadre in e01: «Rende di più: Strada da Cinderwick, Strada da Larkspire; normale: Curva Cinderwick, Curva Larkspire, Piazzale dello stadio.»
  - Il mediatore, che non ha efficacia ma dimezza: «Dimezza: corteo.»
  - Dove non ha effetto: «qui non serve: …».
- Nei testi non ci sono etichette per i tipi di settore (e i dati non li tocco), quindi uso i nomi dei settori, che esistono già.
- Interruttore rosso `__NO_C22R01`: nessuna spiegazione.

## Guardiano

`tools/foto-club.mjs` → `controllaRende`, all'ondata 1 di ogni partita giocata:
- prende in mano ogni unità del vassoio;
- la spiegazione deve nominare tutti i settori col valore più alto, oppure contenere «Dimezza» per chi dimezza.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-c1411` | e01 ×2, e02, e03, e13, e25 | verde |
| stesso comando, prima versione | 360 px | ROSSO: «Rende di più: …» a 10,8 px (C-005 R06). Corretto con `--testo-mini` |
| `… VALMORA_ROSSI=C22R01 …` | 360 px | ROSSO: «con squadre/steward/mediatore in mano la spiegazione «» non dice dove rende» su e01 ed e02 |
| `node tools/foto.mjs out/foto-c1411` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | vedi sotto | |

Foto in `docs/foto/c14-11/2026-10-12/`: schieramento di e01 con un'unità in mano, a 360, 375 e 412 px. La foto «prima» è quella di S-12, `docs/foto/s12/2026-10-12/`.

Visto nelle foto, da trattare in S-13: la barra dei pulsanti fissa in basso copre l'ultima voce del vassoio finché non si scorre.
