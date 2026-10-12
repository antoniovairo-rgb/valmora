# Collaudo C-014b (PO-070) · rapporto della collaudatrice

**Build:** `2459e64` · **GAME_VERSION:** `0.5.0` (`src/versione.ts:35`) · **Ramo delle sonde:** `claude/valmora-collaudo-c14b` (sonde `coordination/sonde/c14b-*.mjs`, commit `04e3f91`, `153ed11`).

Regole: sola lettura sul gioco; nessuna correzione proposta; ogni numero è una misura con comando ed esito. Le misure di eccedenza sono **misure ripetute** (una per ogni passaggio sulla schermata), non schermate distinte. «Non verificato» = non misurato, con motivo.

## Come sono state eseguite le misure
- Server statico sulla cartella `dist/` della build (`vite build`), Chromium `/opt/pw-browsers/chromium`, `playwright-core` 1.64.0, `reducedMotion: reduce`.
- Scorrimento: `document.scrollingElement` (`scrollHeight − clientHeight`, `scrollWidth − clientWidth`). Cliccabili: lato minore < 44 px. Testi tagliati: elementi di testo con `scrollWidth > clientWidth`.
- Gioco: città → episodio → sala → briefing → schieramento → chiamate → chiusura → rapporto → verbale, con i selettori di `src/resa` (`data-azione`, `data-scena`, `data-opzione`).
- **Scelte della sonda (dichiarate):**
  - Chiamate: sempre la prima opzione (ultima dopo due fallimenti; mai scattata).
  - Schieramento: il piano del giocatore «attento» del motore (`src/logica/bot.ts`), lo stesso di `coordination/sonde/rev-schermate.mjs`. Senza unità, e01 perde 6 volte su 6 (misurato con la sonda prima della versione definitiva).
  - Sala, briefing e verbale: avanzamento con «passo» fino all'ultimo passo (`src/resa/schermate/Passi.tsx`).

## Compito 1 · schermate × misure (360×760, 375×812, 412×915)

Valori da `out/c14b/gioco-*.json` (non versionati: `out/` è in `.gitignore`).

| schermata | 360 px: misure / con eccedenza verticale / max px | 375 px: misure / con eccedenza / max px | 412 px: misure / con eccedenza / max px |
|---|---|---|---|
| titolo | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 |
| guida (passi 1–6) | 1 ciascuno / 0 | 1 ciascuno / 0 | 1 ciascuno / 0 |
| crediti | 1 / **1 / 1071** | 1 / **1 / 962** | 1 / **1 / 822** |
| genere | 1 / 0 | 1 / 0 | 1 / 0 |
| città | 10 / **10 / 64** | 10 / **10 / 64** | 10 / **10 / 50** |
| sala | 60 / 1 / 17 | 60 / 0 | 60 / 0 |
| briefing (passi) | 45 / 0 | 45 / 0 | 45 / 0 |
| briefing-fine | 15 / 0 | 15 / 0 | 15 / 0 |
| schieramento | 61 / 9 / 186 | 60 / 4 / 93 | 59 / 0 |
| chiamata | 216 / **216 / 524** | 213 / **213 / 430** | 211 / **119 / 346** |
| risposta | 216 / **216 / 99** | 213 / **109 / 62** | 211 / 0 |
| chiusura | 61 / 0 | 61 / 0 | 60 / 0 |
| rapporto | 61 / **61 / 230** | 61 / **61 / 166** | 60 / **27 / 55** |
| verbale | 16 / 6 / 53 | 16 / 0 | 16 / 0 |

Per tutte le schermate e i tre formati: **cliccabili sotto 44 px = 0; testi tagliati = 0; eccedenza orizzontale = 0** (misurato su ogni misura).

Interpretazione, senza attribuire cause: l'eccedenza verticale è misurata; se sia voluta non posso verificarlo da qui. I valori su «crediti» (una sola misura) sono il contenuto da scorrere.

**Foto:** `out/c14b/foto/` (non versionate), salvate per ogni misura con eccedenza.

## Compito 2 · 36 episodi con la prima opzione

**Esito: fermo a e12 in tutte e tre le misure. Non verificato per e13–e36.**

| episodio | 360 px | 375 px | 412 px |
|---|---|---|---|
| e01–e10 | superata (1 tentativo, 3–4 ondate) | superata | superata |
| e11 | superata (dal log della run interrotta) | superata | superata |
| e12 | **fallita 6/6** (23 ondate con 6 rigiocate) | fallita 6/6 | fallita 6/6 |
| e13–e36 | Non verificato (bloccato da e12) | Non verificato | Non verificato |

Verifica di e12 (misurata, non interpretata): il giocatore «equilibrato» del motore (`src/logica/bot.ts`, risposte scelte dal giocatore, non dalla prima opzione) raggiunge l'esito migliore su e12 (`coordination/sonde/c14b-esito-motore.mjs`, riga e12: «contenuto»). Quindi e12 è vincibile dal motore; il blocco è dovuto alla regola «sempre la prima opzione». Non verificato se la regola sia la sola causa: servirebbe una partita con altre risposte.

**Errori in console e eccezioni:** `pageerror` = 0 in tutte le run. Un solo errore di console, ripetuto:
«Error while trying to use the following icon from the Manifest: …/icone/icona-192.png (Download error or resource isn't a valid image)» — a 360 e 375 px nel chunk e06–e10; a 412 px nessuno. Il file esiste ed è un PNG 192×192 valido (`dist/icone/icona-192.png`, misurato con `file`). La causa non è nel mio mandato: **Non verificato**.

**Stati senza pulsante per proseguire:** nessuno nei 36 episodi attraversati fino a e12. Lo stato bloccante è la fallita ripetuta: il verbale mostra «Rigioca» e non «Alla mappa» (per regola del gioco), e la sonda ha esaurito i sei tentativi.

## Compito 3 · ripresa e salvataggi anomali

**Ripresa a metà ondata** (360 px, e01 e e02; le riprese sono registrate dopo ricaricamento della pagina e «Riprendi»):

| episodio | ondata | esito | nota |
|---|---|---|---|
| e01 | 1 | UGUALE | stessa scena, stesse risposte, stesso testo |
| e01 | 2 | **DIVERSO** | scena, ondata e risposte uguali; i testi differiscono oltre i primi 200 caratteri salvati. **Non verificato** cosa cambi |
| e01 | 3 | UGUALE | |
| e02 | 1–4 | UGUALE | |
| e13, e14, e25, e26 | — | Non verificato | non raggiunti (blocco a e12) |

**Salvataggi anomali** (360 px, `coordination/sonde/c14b-salvataggi-offline.mjs`, `out/c14b/salvataggi-offline.json`):

| caso | «Riprendi» | comportamento | errori |
|---|---|---|---|
| stringa vuota | assente | titolo e «Nuova partita»; il valore `''` resta salvato | 0 |
| JSON rotto | assente | titolo e «Nuova partita»; il valore rotto resta salvato | 0 |
| `save_version` 1 (copia di una partita reale, `save_version` reale 2) | presente | «Riprendi» riporta alla città; il salvataggio resta a `save_version` 1 | 0 |

## Compito 4 · doppio tocco e tasto indietro (e01, 375 px)

Script `coordination/sonde/c14b-tocchi.mjs`, esito `out/c14b/tocchi.json` (non versionato).

**Tasto indietro**
- Pagina grezza (nessuna voce di cronologia), su «genere» e «città»: **esce dal gioco** (`about:blank`). «Riprendi» riporta alla città o al titolo.
- Con una voce di cronologia aggiunta dalla sonda, su ogni schermata (genere, città, sala, briefing, schieramento, chiamata, risposta, chiusura, rapporto): **nessun effetto** (stessa scena).
- Nota: l'app non gestisce la cronologia; il comportamento reale su telefono dipende dal browser e non è misurato qui.

**Doppio tocco** (sul pulsante principale di ogni schermata, stato letto dal salvataggio):
- Chiamata (prima opzione): +1 risposta a ogni doppio tocco, mai +2 (misurato 4 volte).
- Risposta («Avanti»): nessun doppio effetto.
- Chiusura («Leggi il rapporto»): +1 rapporto (misurato 2 volte).
- Schieramento («Conferma»): passa alla chiamata, nessun doppio effetto (misurato 3 volte).
- Sala e briefing («passo»): nel primo caso il doppio tocco non cambia la scena, in altri casi avanza di un passo. **Non verificato** il motivo di questa differenza.
- Su «genere» e «città» il pulsante non era presente al momento del doppio tocco (la sonda era già passata oltre per il test indietro): **Non verificato**.

## Compito 5 · offline

Script `coordination/sonde/c14b-salvataggi-offline.mjs` su `localhost` (il service worker si registra solo su https o localhost, `src/resa/installa.ts:11`).
- Primo caricamento online: service worker registrato (`controllata: true`), cache `valmora-v1`.
- Rete disattivata e ricaricamento: scena `titolo`, `data-versione` = **0.5.0**, testo «Versione 0.5.0 · build 2459e64».
- Errori: 0.

## Rilievi (misurati, senza cause)

1. **Eccedenza verticale su chiamata e risposta**, a tutti e tre i formati (vedi tabella): 360 px (chiamata 216/216, max 524 px), 375 px (213/213, max 430 px), 412 px (119/211, max 346 px).
2. **Eccedenza verticale su rapporto**: 61/61 a 360 px (max 230 px), 61/61 a 375 px (max 166 px), 27/60 a 412 px (max 55 px).
3. **Eccedenza verticale in città**: 10/10 a ogni formato (max 64 px a 360 e 375, 50 px a 412).
4. **e12 fallito 6/6** con la regola «prima opzione» a tutti e tre i formati (il motore lo vince con altre risposte).
5. **Ripresa e01 ondata 2**: testi diversi oltre 200 caratteri (non verificato cosa).
6. **Errore di console** dell'icona manifest 192 px (360 e 375 px, un episodio).
7. **Salvataggi anomali**: nessun blocco e nessun errore; il valore non valido resta nel `localStorage` fino a una nuova partita.

## Non verificato (riepilogo)
- e13–e36 (36 episodi meno 12): bloccati da e12 con la regola «prima opzione».
- Ripresa su e13, e14, e25, e26.
- Causa della differenza di testo nella ripresa di e01 ondata 2.
- Doppio tocco su «genere» e «città» (pulsante assente al momento del test).
- Causa dell'errore di console dell'icona manifest.
- Se l'eccedenza verticale sia voluta (chiamate, risposte, rapporto, crediti).

## Anomalie della sessione (dichiarate)
- Le run complete sono state interrotte dal limite di tempo di ogni turno. Il lavoro è ripreso a chunk di 3–5 episodi con profilo di Chromium persistente e porta fissa per misura. Il chunk e11–e15 è stato interrotto e ripreso dentro e12 dal salvataggio: le misure di e11 non sono state salvate (solo l'esito dal log).
- Le sonde di diagnosi (`c14b-diagnosi-*.mjs`) servono a verificare le sonde, non il gioco.
