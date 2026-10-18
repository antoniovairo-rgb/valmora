# Protagonisti della quarta prova in ogni vignetta (segnalazione di S-11, IPOTESI) · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: 23aa116.

## Verifica

- **IPOTESI di S-11:** «la vignetta della guida "Quanto dura?" usa le figure vecchie». **Non trova riscontro sulla build attuale (e3e3fe4, che contiene la principale 748aa8dd).**
- **FATTO (codice):** guida (`vignette-guida.tsx:4,24-25,55`), chiamata del vice (`vignette-chiamata.tsx:10,51`), rapporto e verbale (`vignette-gioco.tsx:8`) importano `Persona` da `vignetta.tsx`, che disegna con `persona2.ts` (quarta prova). In `vignette-evento.tsx:72` c'è un'altra `Persona`, ma disegna solo i pallini della folla («gente»), non i protagonisti.
- **FATTO MISURATO (disegno SSR, testa e3e3fe4):**

  | vignetta | figure della quarta prova | altri disegni |
  |---|---|---|
  | guida, «Quanto dura?», uomo e donna | 2 | 0 |
  | guida, sala operativa, uomo e donna | 1 | 0 |
  | chiamate del vice e01 (rinforzi, presidente, pareggio) | 1 ciascuna | 0 |
  | rapporto (3 toni) e verbale (4 toni), uomo e donna | 2 | 0 |

- **Ipotesi sulla causa (non verificata):** S-11 ha guardato una build pubblicata prima dell'integrazione della quarta prova (la 0.39.0 ha la seconda bozza; la quarta esce col rilascio delle 08:00). Non posso confermarlo: non so quale build abbia usato S-11.

## Guardiano

- `tests/persona-ovunque.test.ts`: 21 vignette (2 generi × (2 guida + 3 rapporti + 4 verbali) + 3 chiamate del vice). Ogni protagonista atteso è della quarta prova (`data-persona="4"`) e non c'è nessun altro disegno.
  - verde: 0 errori;
  - rosso `__NO_C114P01` (disegno della 0.38.0): 21 vignette su 21 segnalate.
- **Test:** 339 su 339 verdi.
- **Foto:** `altre-{360,375,412}.png`: guida, chiamata del vice e verbale; a sinistra il rosso C114P01 (disegno vecchio), a destra la build attuale. Il gioco non è cambiato.

## Non verificato

- **Schermate:** non ho visto le schermate del gioco (le foto sono le vignette SSR).
- **Build di S-11:** quale build abbia guardato S-11.
- **Altri episodi:** le chiamate del vice degli altri episodi le ho contate solo per e01.
