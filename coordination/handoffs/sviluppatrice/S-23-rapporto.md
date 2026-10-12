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
| `node tools/catena.mjs completa` | commit be070e6, 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Foto in `docs/foto/s23/2026-10-12/`: i 6 passi a 360 px.

## Secondo pezzo: sala (S-15) e verbale (S-14)

- **Apertura dell'episodio** (`VignettaApertura`, `src/resa/vignette-gioco.tsx`), nel primo passo della sala («Stasera»). Ora quel passo c'è sempre, anche senza club. La vignetta è disegnata dai dati:
  - notte o giorno (`mappa.ora`, con stelle e fari accesi);
  - stadio con le curve nei colori del loro club (D-086), oppure una piazza con la folla se la missione non ha curve;
  - cartelloni e gru se i dettagli li nominano.
- **Fine episodio** (`VignettaEsito`), nel primo passo del verbale: protagonista (col genere della partita) e vice, con l'espressione presa dall'esito.

  | esito | protagonista | vice | in più |
  |---|---|---|---|
  | bene: festa | sorride | sorride | coriandoli |
  | medio: sollievo | dritto | sorride | |
  | male: preoccupazione | giù | dritto | una goccia di sudore |
  | fallito: sconfitta | giù | giù | nuvola |

  Gli stemmi del verbale (D-088) stanno in sovrimpressione in fondo alla vignetta, così non occupano altra altezza.
- **Scorrimento zero**: ogni vignetta ha una «riserva» misurata (il resto della schermata a 360×760) e si stringe.
  - Prima della taratura: sala passo 1 a 839-863 px, verbale passo 1 a 780-803 px.
  - Dopo: tutte a 760.
- **Guardiano**: `controllaVignetta` nella sala (`apertura-…`) e nel verbale (`esito-…`) di ogni partita giocata.

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s23b` | e01 ×2, e02, e03, e13, e25 | verde |
| `… VALMORA_ROSSI=C26V01 …` | 360 px | ROSSO: 7 sale senza «apertura», 7 verbali senza «esito», 6 passi della guida senza vignetta |
| `node tools/foto.mjs out/foto-s23b` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | vedi sotto | |

Non ancora fatte: home, città, crediti, briefing, chiamata, risposta, rapporto. Chiamata, risposta e rapporto scorrono già senza vignetta (1181, 881 e 974 px a 360×760): vanno fatte insieme a S-13.
