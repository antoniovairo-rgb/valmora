# S-16 – Triplice conferma (PO-066) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Cosa ho fatto

- Componente `src/resa/schermate/Tripla.tsx`:
  - tre passi («Conferma 1 di 3» …), con un testo che cresce a ogni passo;
  - l'ultimo passo è in magenta;
  - «No» sta sempre per primo, nel pulsante principale;
  - i passi intermedi hanno il pulsante «Sì, vai avanti»; solo l'ultimo ha il pulsante che fa davvero l'azione.
- **«Nuova partita» con una partita salvata** (`SceltaGenere.tsx` → `ConfermaNuova`):
  1. «La partita salvata (episodi, stelle, scelte) verrà cancellata. Vuoi ricominciare?»;
  2. «Sicuro? Perdi tutti gli episodi superati, le stelle e le scelte fatte finora.»;
  3. «Ultima conferma: cancello la partita. Non si può tornare indietro.»

  `data-azione` «annulla-nuova» e «conferma-nuova» restano quelli di prima.
- **Rigiocare dalla città un episodio già superato** (`Citta.tsx`): «Rigioca l'episodio» apre le tre conferme nella scheda. L'ultima è «Ultima conferma: rigiochi l'episodio dall'inizio.».
  - Un episodio fallito («da rigiocare») o da giocare parte subito, senza conferme.
  - Il secondo passo dice cosa succede davvero (D-062): «si riparte da come stavano le cose prima di questo episodio; resta il risultato migliore che hai già».
- Interruttore rosso `__NO_C20T01`: una conferma sola, come prima.
- `coordination/sonde/rev-schermate.mjs`: passa i due passi intermedi prima di «conferma-nuova».

## Guardiano

`tools/foto-club.mjs` → `controllaTripla` controlla che:
- servano esattamente 3 conferme;
- «No» ci sia a ogni passo;
- l'ultimo passo sia in magenta.

Dove si usa:
- su «Nuova partita», nel controllo C-005 R02, che poi preme «No» e verifica che il salvataggio non cambi;
- sul «Rigioca» di ognuno dei 36 episodi (`tools/foto-bozze.mjs`, a 360×760).

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s16` | partita completa, 36 episodi | verde |
| `… VALMORA_ROSSI=C20T01 …` | 360 px | ROSSO: «1 conferme invece di 3» su «Nuova partita» e sul «Rigioca» dei 36 episodi |
| `node tools/foto.mjs out/foto-s16` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | commit 91b9ef7 (merge della principale f5483cc), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Foto in `docs/foto/s16/2026-10-12/`: «Nuova partita» prima (conferma unica) e dopo (passo 1 e passo 3), a 360, 375 e 412 px.

La conferma del «Rigioca» dalla città è controllata, ma non fotografata: il giro che apre tutti gli episodi non fa foto.
