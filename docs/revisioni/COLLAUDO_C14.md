# Collaudo C-014 (PO-070) · collaudatrice, sola lettura

**Build collaudata: commit `2459e64f7ec48c53dae7252c6bdaa47fa7ed5b39` (ramo claude/valmora-l1-setup-schema-xdrbx7), GAME_VERSION `0.5.0`** (`src/versione.ts:35`).
La home della build servita mostra «Versione 0.5.0 · build 2459e64 · …» a 360, 375 e 412 px (sonda B1): coerente.
Data: 2026-10-11. Confronto per i salvataggi: `origin/main` = `df14f8b` (rilascio 0.4.0).

Sonde (tutte in `coordination/sonde/`, si rifanno da capo con gli stessi comandi):

| sonda | comando | uscita completa |
|---|---|---|
| logica | `node coordination/sonde/c14-logica.mjs 1000` | `out/c14/logica.txt` (non nel commit) |
| browser | `npm run build && node coordination/sonde/c14-resa.mjs . out/c14 <prove>` | `out/c14/resa-*.txt` |
| offline | `node coordination/sonde/c14-offline.mjs dist <seconda build> out/c14/foto` | `out/c14/offline*.txt` |

Ambiente: Node 22.22.0, Chromium headless di `/opt/pw-browsers/chromium` via playwright-core 1.64.0, server HTTP locale che serve `dist/`.
Le misure di tempo sono **AUSILIARIE** (server headless ≠ telefono). Le foto sono in `out/c14/foto/` (non committate: file pesanti).
Gli avvisi `GL Driver Message … GPU stall due to ReadPixels` in console vengono dal WebGL software di Chromium headless durante gli screenshot: non sono errori del gioco e non li conto.

Già registrati e **non** rifatti come rilievi nuovi (stato in `docs/governo/COLLAUDI.md` e `BACKLOG.md`): C-009.4, C-010.2, C-010.3, C-010.4, C-012.2 (vedi «Aggiornamenti su rilievi già aperti»); funzioni in coda PO-056, PO-060 (resa), PO-061, PO-066, PO-067 (barra della fiducia). Comportamenti decisi dal PO (D-055, D-085, D-093, D-097) non sono difetti.

---

## Rilievi

### C14-01 · ALTA · Offline: città ed episodio diventano una pagina vuota se i pezzi della mappa non sono già in cache

**FATTO MISURATO** (`c14-offline.mjs`, http://localhost, service worker attivo, 360×760):
- O1 – prima visita della sola home, poi rete staccata, «Nuova partita» → scelta del protagonista: **pagina vuota** (0 caratteri, foto `offline-O1.png`), errore `Failed to fetch dynamically imported module …/assets/StratoCitta-LlSQcKPE.js` preceduto da `Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`. **3 su 3** esecuzioni.
- O3 – build A giocata online (e01 finito, e02 in corso), poi online si apre solo la home di una seconda build B dello stesso commit con impronte diverse (come un rilascio notturno, D-093), poi offline → «Riprendi»: **pagina vuota**, errore su `StratoPixi-CpQ--wPn.js`. **3 su 3** esecuzioni arrivate al passo misurato (in 1 esecuzione precedente la sonda è andata in timeout prima di arrivarci: instabilità della sonda, non del gioco).
- O2 – e01 giocato online, poi offline → e02 dall'inizio al verbale: **funziona** (2 su 3; nella terza la sonda è andata in timeout su un clic, non c'è prova di un difetto).
- Dopo la prima visita della home sono in cache 12 file; 11 dei 13 `.js` della build non lo sono (B10 di `c14-resa.mjs`).

**Codice:** `public/sw.js:7-9` mette in cache all'installazione solo i file citati da `index.html`; `src/resa/mappa/MappaCitta.tsx:12` e `src/resa/mappa/Mappa.tsx:21` caricano `StratoCitta`/`StratoPixi` con `lazy(import(…))`; quando l'import fallisce, `sw.js:19` risponde con la pagina (`caches.match('./')`) al posto del modulo e, senza un contenitore d'errore in `src/resa/App.tsx`, tutta l'app sparisce. `CACHE = 'valmora-v1'` non cambia fra i rilasci (`sw.js:3`), quindi il passo «install» non si ripete con le build nuove (IPOTESI dedotta dal codice: il browser reinstalla un service worker solo se `sw.js` cambia).

**IPOTESI:** l'app Android (Capacitor) porta i file dentro l'APK/AAB e non passa dal service worker (`src/resa/installa.ts:11` lo registra solo fuori da Capacitor): il difetto tocca il link GitHub Pages / app installata dal browser, non la versione Play. Non posso confermarlo su un telefono.

**Passi:** aprire il link online solo fino alla home (o subito dopo un rilascio nuovo) → modalità aereo → riaprire → Nuova partita (o Riprendi). **Schermo:** qualunque larghezza.

### C14-02 · MEDIA · Un salvataggio con un episodio in corso che la build non conosce rende la home bianca a ogni avvio, senza via d'uscita

**FATTO MISURATO** (`c14-resa.mjs` B6, 360×760): salvataggio valido ma con `in_corso.missione = "e99"` → la home non compare (nessuna scena), `pageerror: missione «e99» non trovata`; dopo la ricarica identico; il salvataggio resta lì. «Nuova partita» non è raggiungibile: l'unica uscita è cancellare i dati del sito.
`migra()` lo accetta (`c14-logica.mjs` L5: «ACCETTATO (in_corso e99/o1)»), perché `controllaInCorso` (`src/salvataggi/salvataggio.ts:61-69`) controlla solo i tipi. `App.tsx:90` chiama `missione(ic.missione)` a ogni disegno, anche sulla home, e `src/resa/dati.ts:32` lancia l'errore.

**Raggiungibilità:** oggi nessuna via normale: 0.4.0 e 0.5.0 hanno gli stessi 36 id (`git ls-tree origin/main data/missioni/` = 36 file, stessi nomi). **IPOTESI:** diventa reale se un consolidamento (PO-068) rinomina o toglie un episodio mentre qualcuno lo ha in corso, o con dati del sito danneggiati.
**Passi:** `localStorage.setItem('valmora-salvataggio', <salvataggio con in_corso.missione "e99">)` → ricarica.

### C14-03 · MEDIA (latente) · stato.json 0.5.0 aggiunge 6 variabili senza SAVE_VERSION né migrazione: i salvataggi 0.4.0 restano senza

**FATTO MISURATO:** `git diff --stat origin/main 2459e64 -- data/stato.json` = +64 righe: `rapporto_dessi, testimone, busta, pista_cattura, fascicolo, sospetti_talpa`. `SAVE_VERSION` resta 2 (`salvataggio.ts:13`), nessuna migrazione e nessun riempimento con i valori iniziali (`variabiliIniziali` è usata solo per la partita nuova, `App.tsx:74`).
`c14-logica.mjs` L6: un salvataggio con le 5 variabili della 0.4.0 passa `migra()` e resta **senza** le 6 nuove; `valuta({var:"testimone",…})` su quel salvataggio → eccezione «variabile «testimone» senza valore» (`src/logica/condizioni.ts:10`).
Oggi **nessun sintomo**: nessun episodio legge o scrive le 6 variabili (L6: «lette NO, scritte NO» per tutte e 6) e B7 gioca e02 da un salvataggio 0.4.0 fino al verbale senza errori.
**IPOTESI:** appena il consolidamento (PO-068, D-100) metterà le condizioni sulle 6 variabili, chi ha iniziato con la 0.4.0 (o con la 0.5.0, se dopo si aggiunge altro) avrà un'eccezione nel disegno della chiamata o della città. CLAUDE.md, «Architettura»: «Salvataggi con SAVE_VERSION e migrazione retrocompatibile».

### C14-04 · MEDIA · La fiducia si porta da un episodio all'altro: chi tiene bassa la tensione finisce a fiducia 0-2 e le 3★ spariscono quasi ovunque

**FATTO MISURATO** (`c14-logica.mjs` L1-L2; campagna con chiusura come `src/resa/episodi.ts:31-41`):
- Bot «attenta» (abbassa sempre la tensione) su e01→e36: fiducia a fine episodio `0,1,0,2,0,1,0,1,0,1,0,0,…` (mai sopra 2), stelle 2★ in 34 episodi e 1★ in 2.
- Bot «equilibrata» (pesa anche la fiducia): fiducia 4-10, 3★ in 27 episodi su 36.
- Con **fiducia d'ingresso 0**: 3★ mai ottenute in **28/36 episodi** su 1003 partite per episodio (1000 casuali + 3 deterministiche); con fiducia 5: mai in 2/36 (e02, e12); con fiducia 10 il numero di 3★ sale (es. e30: 18 → 43 su 1003).
- Non è un'impossibilità dimostrata: il guadagno massimo di fiducia per episodio (somma delle migliori opzioni) va da +5 (e06) a +12 (e22).
- Durante l'episodio la fiducia non si vede (barra di D-097 ancora da fare, PO-067 PARZIALE): il giocatore non sa di partire da 0.

**IPOTESI:** è una scelta di bilanciamento (D-060, D-065), non un errore di codice; la porto al PO perché col trascinamento le 3★ dipendono dalla storia degli episodi precedenti più che da quello in gioco. Nessuna stella «regalata»: il bot «peggiore» fallisce 36/36 episodi (L2b).

### C14-05 · MEDIA · Nessuna strada per tornare alla home; il tasto indietro esce dal gioco

**FATTO MISURATO** (`c14-resa.mjs` B1, B5): sulla città i pulsanti sono solo le stagioni e i punti degli episodi (nessuno porta alla home) a 360, 375 e 412 px; dentro l'episodio non c'è un'uscita. `App.tsx` chiama `setSchermata('titolo')` solo da Crediti, Conferma e Genere (`App.tsx:98-100`). Il tasto indietro del browser, a metà schieramento di e01 e con la guida aperta, porta a `about:blank` (fuori dal gioco); tornando avanti si riparte dal titolo e il salvataggio è intatto (in_corso e01, ondata 1).
Conseguenza: dopo «Nuova partita» la guida («La città e il gioco») e i crediti si raggiungono solo ricaricando o riaprendo l'app.
**IPOTESI:** nell'app Android il tasto indietro di sistema chiude l'app (comportamento di Capacitor senza ascoltatore `backButton`): Non posso confermarlo senza telefono.

### C14-06 · BASSA · Salvataggi incoerenti ma accettati: «Riprendi» che non fa nulla

**FATTO MISURATO** (B6 e L5): `migra()` accetta `in_corso.ondata = 99`, una disposizione con risorsa inesistente, una tensione `"alta"` (stringa), `credito = 99`, variabili senza `credito`, `rapporto_aperto` senza rapporti. Nel browser: con `ondata 99` il pulsante «Riprendi» non cambia schermata e non dice nulla (resta il titolo); gli altri riprendono (chiamata o schieramento) senza errori in console. Causa: `salvataggio.ts:61-69` controlla i tipi dei campi, non i valori.

### C14-07 · BASSA · Salvataggio illeggibile: si perde in silenzio e la «Nuova partita» lo sovrascrive senza conferma

**FATTO MISURATO** (B6): con testo non JSON, `null`, `{}` o `save_version 3` la home non offre «Riprendi», nessun messaggio a schermo (solo `console.warn` da `src/resa/archivio.ts:11`); il dato resta in localStorage. «Nuova partita» chiede conferma solo se c'è un salvataggio leggibile (`App.tsx:97`): la prima partita nuova cancella il vecchio file senza chiedere. (`save_version 3` è il caso di chi torna a una build vecchia.)

### C14-08 · BASSA · La ricarica perde lo schieramento non confermato e il verbale

**FATTO MISURATO** (B3, 81 ricariche su e01 ed e02 a 375×812): la scena riprende sempre giusta (schieramento 7/7, chiamata 29/29, chiusura 7/7, rapporto 7/7; risposta → chiamata/chiusura successiva 29/29 come dichiarato in `Ondata.tsx`, intestazione). Però le unità già messe e non confermate spariscono (7/7: la bozza vive solo in `useState`, `App.tsx:50`) e ricaricando sul verbale si torna alla città (2/2): stelle e registro sono salvati, ma bilancio e «Cosa ti ha penalizzato» non si rivedono più.

### C14-09 · BASSA · Service worker: i file dei rilasci vecchi restano in cache

**FATTO MISURATO** (`c14-offline.mjs` O4): build A giocata, poi build B giocata: la cache `valmora-v1` ha 29 voci, di cui 5 file che esistono solo nella build A. `sw.js:12` (activate) non toglie nulla e il nome della cache non cambia (`sw.js:3`). **IPOTESI:** con un rilascio a notte (D-093) lo spazio occupato cresce a ogni build giocata.

### C14-10 · BASSA · «Valmora» somiglia a un luogo reale

**FATTO:** Valmorea è un comune della provincia di Como ([Wikipedia](https://en.wikipedia.org/wiki/Valmorea), [Tuttitalia](https://www.tuttitalia.it/lombardia/71-valmorea/)). Differisce di una lettera. Ricerche web sui 7 club dei dati (Cinderwick United, Larkspire Athletic, Calderholt Rovers, Quillhaven Albion, Mossgarth Town, Ollerbrook Town, Saltmere Wanderers): nessun risultato con quei nomi (ricerca del 2026-10-11; un'assenza nei risultati non prova che non esistano). **IPOTESI:** rischio basso di confusione; decide il PO.

---

## Aggiornamenti su rilievi già aperti (non nuovi)

- **C-010.2** (pulsante sotto la piega): nella chiamata la prima opzione è ancora sotto la piega di **155 px a 360×760** e **102 px a 375×812**, visibile a 412×915; c'è l'indicatore «Rispondi» (foto `360-chiamata.png`). Rapporto: scorrimento fino a 188 px a 360. Le altre schermate di e01 non scorrono (B2).
- **C-012.2** (nome dell'episodio sopra i punti vicini): ora gli abbozzi si vedono senza `?bozze=1` (S-09), quindi lo vede chiunque: a 360×760 il nome di e01 copre il punto 5 (foto `360-citta.png`). I tocchi però funzionano: 1188/1188 tocchi incrociati fra coppie di episodi a 360/375/412 scelgono l'episodio giusto (B12).
- **PO-060** (ripartire dall'ondata persa): la logica c'è e regge (2982 ripartenze da `riprendiDallOndata` identiche alla partita rigiocata fino a quell'ondata; `ondataDaRiprendere` sulle 4603 partite perse del casuale: ondata 1: 89, 2: 316, 3: 2106, 4: 2092), ma la resa non la usa: `grep riprendiDallOndata src/resa` = 0 righe; il verbale dice «Si riparte da come stavano le cose prima» (`Verbale.tsx:28`). È «IN CODA – resa» nel backlog.
- **PO-067** (barra della fiducia): non c'è in questa build (`grep -i fiducia src/resa` trova solo l'etichetta del bilancio). Vedi C14-04.

## Verificato senza difetti

- **Logica, 36 episodi:** nessun blocco in 36 × (1000 casuali + 3 deterministiche) × 3 livelli di fiducia; 300 campagne casuali e01→e36 (fino a 50 tentativi per episodio) tutte finite, mediana 104 tentativi totali (min 62, max 149); bot «attenta» ed «equilibrata» arrivano a e36 al primo tentativo. Esiti: «degenerato» e «a fatica» raggiunti ovunque, «contenuto» manca solo con fiducia d'ingresso 0 in alcuni episodi (richiede fiducia ≥ 3).
- **Soft-lock:** 470 chiamate, nessuna con opzioni condizionate, quindi nessuna chiamata senza risposte; ondate con 0 unità schierabili: 2 su 28.400 (e35, ondata 4) e la conferma vuota è ammessa. Riferimenti dei dati (settori di briefing, eventi, chiamate, effetti, risorse) tutti esistenti; ogni settore ha almeno una risorsa efficace. Briefing: nessuna fonte «vera» su un settore senza eventi; le fonti «false» minimizzano settori dove la pressione c'è (coerente col tranello).
- **Salvataggio a ogni passo:** 15.568 passi salvati → JSON → `migra` → ripresi: 0 partite con esito o variabili diversi dalla partita giocata d'un fiato (L4).
- **Doppio tocco** (dblclick e due tocchi a 40 ms) su avvia, avanti, inizia, conferma, opzione, continua, rapporto, prossima ondata, città: 0 anomalie (scelte +1 ciascuna, risposta giusta, 1 tentativo) (B4).
- **Rigiocare un episodio superato** (e01 da 3★, dopo e02 superato) e perderlo apposta: il verbale dice «fallito», resta il 3★, tentativi 2, variabili della storia invariate, e02 ancora superato, la città propone e03 (B8, D-062).
- **Salvataggio 0.4.0** a metà e02 → ripreso e finito con la 0.5.0 senza errori (B7).
- **Usabilità a 360/375/412:** home senza scorrimento; nessun bersaglio di tocco sotto 44 px trovato dalla sonda nelle schermate di e01; nessun testo tagliato; carattere minimo 12 px; schieramento, sala, briefing, chiusura e verbale a passi senza scorrimento (B2). Errori in console: 0 (oltre agli avvisi GL headless).

SESSIONE_LUNGA_E_TEMPI

## Realismo

- Nessuna procedura reale citata nei testi: ricerca su `data/testi/it/*.json` di questura, questore, DASPO, GOS, carabinieri, polizia, celere, reparto mobile, lacrimogeni, idranti, prefettura, DIGOS, tessera del tifoso: **0 occorrenze**. Ci sono «steward» (515), «tornelli» (85), «vigili del fuoco» (4), «biglietto nominativo» (1): termini generici. Non verifico qui la prassi reale degli steward da stadio: **Non posso confermarlo** senza una fonte, e i testi non dichiarano norme.
- Violenza fuori campo: le due occorrenze di «feriti» sono «senza feriti» / «nessun ferito» nei verbali.
- Plausibilità interna: le fonti false del briefing negano proprio i settori dove poi la pressione arriva (es. e01, ufficio sicurezza del Cinderwick: «nessun corteo» → strada da Cinderwick pressione 11): coerente con D-024 e D-028.
- Il nome «Dessì» è ancora nei testi (PO-069: cambio nel consolidamento, non in questa build): non è un rilievo.

## Riepilogo

| id | gravità | area | sintesi |
|---|---|---|---|
| C14-01 | alta | zero bug / offline | pezzi della mappa non in cache → pagina vuota offline (3/3 + 3/3) |
| C14-02 | media | logica / salvataggi | in_corso con episodio sconosciuto → home bianca permanente |
| C14-03 | media (latente) | salvataggi | 6 variabili nuove senza SAVE_VERSION né migrazione |
| C14-04 | media | logica / stelle | fiducia trascinata: 3★ mai trovate in 28/36 con fiducia d'ingresso 0 |
| C14-05 | media | usabilità | nessun ritorno alla home; indietro esce dal gioco |
| C14-06 | bassa | salvataggi | salvataggi incoerenti accettati; «Riprendi» muto con ondata 99 |
| C14-07 | bassa | salvataggi | salvataggio illeggibile perso in silenzio, sovrascritto senza conferma |
| C14-08 | bassa | fluidità / ricarica | ricarica perde schieramento non confermato e verbale |
| C14-09 | bassa | offline | cache dei rilasci vecchi mai ripulita |
| C14-10 | bassa | realismo | «Valmora» ≈ Valmorea (comune reale) |

Bloccanti: **0**. Alte: **1**. Medie: **4**. Basse: **5**.

## Cosa NON ho potuto verificare

- Telefono vero, WebView Android/Capacitor, tasto indietro di sistema, installazione PWA reale («Installa sul telefono» compare solo quando il browser offre la richiesta; headless non la offre): Non posso confermarlo.
- Tempi e memoria su un telefono economico: le misure qui sono headless e ausiliarie.
- Giocate a mano «umane»: ho guidato la resa con i piani dei bot (attenta, equilibrata, peggiore, prima opzione); la comprensione al primo uso (guida, fiducia, «Cosa ti ha penalizzato») è giudicata solo dalle foto, senza giocatori.
- 3★ «impossibili»: ho cercato con 1003 partite per episodio e livello di fiducia, non in modo esaustivo.
- Prassi reali di ordine pubblico da stadio: nessuna fonte consultata, quindi nessun giudizio sul realismo delle procedure oltre all'assenza di norme citate.
- Che i nomi inventati non coincidano con club o luoghi reali minori: solo ricerca web generica.
