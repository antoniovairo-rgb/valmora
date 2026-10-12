# S-18 – Guida introduttiva alla prima partita (PO-056) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Cosa ho fatto

- **Quando compare**: alla prima «Nuova partita» su questo telefono, dopo la scelta del genere e prima della città.
  - È la guida a passi della principale (`Guida.tsx`), con gli stessi testi `guida.*` e le varianti @f.
  - In modalità `introduttiva` il primo passo ha «Salta» (al posto di «Chiudi») e l'ultimo «Iniziamo» (al posto di «Ho capito»).
  - Alla fine, o col salto, si va alla città.
- **«Prima partita»**: lo ricorda la chiave `valmora-guida-vista` nel localStorage (`archivio.ts`), non il salvataggio.
  - Così una nuova partita successiva non la ripropone; resta comunque nella home («La città e il gioco»).
  - Se il localStorage non risponde, la guida non compare: meglio niente che ripeterla.
- **Interruttore rosso** `__NO_C22G01`: niente guida.
- `coordination/sonde/rev-schermate.mjs`: dopo il genere salta la guida, se c'è.

## Guardiano

`tools/foto-club.mjs` → `controllaGuida`, chiamato dopo il genere a ogni larghezza. Controlla che:
- la guida compaia;
- al primo passo ci sia «Salta»;
- a 360 e 412 px si percorrano tutti i 6 passi fino a «Iniziamo», con una foto per passo;
- a 375 px «Salta» porti alla città.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360,375 node tools/foto.mjs out/foto-s18` | 360 (tutti i passi), 375 (Salta) | verde |
| `… VALMORA_ROSSI=C22G01 …` | 360 px | ROSSO: «prima partita: dopo il genere manca la guida introduttiva» |
| `node tools/foto.mjs out/foto-s18` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | vedi sotto | |

Foto in `docs/foto/s18/2026-10-12/`:
- prima: subito la città dopo il genere, a 360, 375 e 412 px;
- dopo: il passo 1 della guida a 360, 375 e 412 px, e il passo 6 a 360 e 412 px.
