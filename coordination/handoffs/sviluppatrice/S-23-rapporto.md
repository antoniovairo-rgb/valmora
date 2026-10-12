# S-23 – Immagini a fumetto (PO-078): primo pezzo, la guida · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **primo pezzo consegnato** (le 6 vignette della guida). Restano home, città, sala, briefing, chiamata, rapporto, verbale (S-14/S-15 compresi).

## Cosa ho fatto

- `src/resa/vignetta.tsx`: contenitore della vignetta.
  - SVG 320×180 con riquadro nero spesso e retino giallo di fondo; nessun asset esterno.
  - Colori solo da token, tramite classi `v-*` in `stile.css`. Token nuovi: `--vignetta-pelle`, `--vignetta-capelli`, `--vignetta-fumo`, e le misure `--vignetta-riserva/-min/-max`.
  - L'altezza è `clamp(min, 100dvh − riserva, max)`: la vignetta si stringe prima che la pagina scorra.
  - Componente `Persona`: personaggio a fumetto con capelli corti, lunghi o berretto, bocca su, giù o dritta, baffi. Servirà a S-14 (espressioni).
- `src/resa/vignette-guida.tsx`: le 6 vignette della guida, una per passo:
  1. skyline di Valmora con le fonderie di Cinderwick e la collina di Larkspire;
  2. il protagonista (col genere della partita) e il vice, che chiede «Quanto dura?»;
  3. la mappa con i settori e le squadre;
  4. la sala operativa (mappa a muro, monitor, radio, il protagonista);
  5. la barra della fiducia con frecce su e giù;
  6. il verbale con le stelle e il timbro «Contenuto».
- Rosso `__NO_C26V01`: nessuna vignetta.

## Guardiano

`controllaGuida` (`tools/foto-club.mjs`): a ogni passo la vignetta `[data-vignetta="guida-N"]` deve essere visibile. Il controllo dell'altezza a 360×760 ora vale anche per la guida.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s23` | guida 6 passi, partita | verde |
| `… VALMORA_ROSSI=C26V01 …` | 360 px | ROSSO: «guida passo 1…6: manca la vignetta» |
| `node tools/foto.mjs out/foto-s23` | 3 larghezze | verde |
| altezza della pagina a 360×760 e 412×915, 6 passi (sonda a mano) | 12 misure | 760 e 915 px: nessuno scorrimento |
| `node tools/catena.mjs completa` | vedi rapporto S-24 (catena unica) | |

Foto in `docs/foto/s23/2026-10-12/`: i 6 passi a 360 px.
