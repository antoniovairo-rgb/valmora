# Collaudo C-035: 0.35.0 (dati e testi coerenti con le scelte: C34-02/03/06/09/10), rilievi aperti e partita da giocatore (PO-120)

- **Build collaudata:** main a e7f00cc (rilascio 1f7a724), GAME_VERSION 0.35.0 (`src/versione.ts:246`, commento `:240-245`); `npm ci` e `npx vite build` verdi.
- **Confronto «prima» (braccio rosso dei dati):** 0.34.0 a acf1151 in un worktree separato (`git worktree add`, `npx vite build`).
- **Cosa è cambiato nel gioco** (`git diff --stat acf1151 e7f00cc -- src data schema tools tests`): solo `data/missioni/e02.json`, `e35.json`, `data/testi/it/e02.json`, `e13.json`, `e17.json`, `e21.json`, `e35.json`, `src/versione.ts` e il guardiano `tests/c34-dati.test.ts`. Nessun file di `src/logica`, `src/resa`, `schema/`.
- **Ramo:** claude/valmora-collaudo-c35. Sola lettura sul gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-17. Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, SwiftShader), DPR 1, Node 22.22, 4 CPU, fino a 5 browser insieme (carico medio fino a 25: tempi lunghi, nessun effetto sulle misure, che contano passi).
- **Sonde:** riprese dai rami C-032/C-033/C-034 senza modifiche (copiate in `coordination/sonde/`); nuove `c35-*` (tabella in fondo). Uscite in `coordination/sonde/uscite-c35/`, foto in `docs/foto/c35/`, salvataggi veri della 0.34.0 in `coordination/sonde/salvataggi-034/`, della 0.33.0 (dal ramo C-034) in `coordination/sonde/salvataggi-033/`.

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, marcato) · **IPOTESI** (marcata) · **IMPRESSIONE DA GIOCATORE**.

## Riepilogo

| verifica | esito |
|---|---|
| **C34-03** e35 barca | dopo `blocca_barca` in o3 arriva **`barca_ormeggiata` 1000/1000**, dopo `segui_barca` **`barca_ritorno` 1000/1000**; 0 frasi che smentiscono il ramo nei testi a schermo e nei verbali; `faldoni` dopo `ferma_uomo` 0/300. Rosso (dati 0.34.0): `barca_ritorno` 1000/1000 anche dopo il blocco, «tornata senza scatoloni» 1000/1000, «barca partita» 703, «andata e tornata» 286, «faldoni spariti» 300/300. Giocati entrambi i rami (§ 5.6, 5.7). **Chiuso**, ma nuovo **C35-01** (salvataggio 0.34.0 a fine ondata 3) |
| **C34-02** e21 `pullman21` | «Riaprile»: piazzale pressione **3→5**, quartiere invariato; «Tienile chiuse»: piazzale **3→1**, quartiere tensione **+1** (1000/1000 partite, e a schermo: `modifiche.piazzale −2`, `tensione.quartiere 1→2`, fiducia 6→5). Testi nuovi coerenti. Rosso: testi vecchi che dicevano il contrario. **Chiuso** |
| **C34-06** verbali di fallimento e13/e17 | testi nuovi generici, senza settori nominati; e13 fallito due volte in modi diversi a schermo (piazzale+curva, poi parcheggi+viale): il verbale regge. **Chiuso**. Stesso difetto però nel verbale di fallimento **nuovo** di e35 → **C35-04** |
| **C34-09** «i» di e21 o1 | ora «la curva è divisa, e l'ex fonderia dei giovani rischia lo sgombero» (`data/testi/it/e21.json:10`). **Chiuso** (GIUDIZIO in § 1.4) |
| **C34-10** e02 `caldo_casa` | dopo `mediatore_corteo`: unica opzione «Non intervenire: il mediatore è ancora col corteo» 200/200 e a schermo; senza, le due di sempre 400/400. **Chiuso per e02**; in altri 8 punti del gioco una chiamata resta ancora con una sola risposta senza spiegazione → **C35-02** |
| C33-06, C33-07, C33-09, C34-04 | **tutti aperti, invariati** (§ 2) |
| Bot, 1000 semi | **0 blocchi** in 156/156 righe; «mai comparse» `[]` 36/36; righe **identiche** alla 0.34.0 (`diff` vuoto) |
| Test e tipi | `npx vitest run` **46/46 file, 252/252**; `npx tsc --noEmit -p .` uscita 0 |
| Salvataggi veri | 0.34.0 dentro e35: **7/8** ripresi senza difetti, 1 caso sbagliato (C35-01); 0.34.0 in o3 e o4 di e02/e13/e17/e21/e35: **10/10**; 0.34.0 importati col pulsante: **18/18**; 0.33.0: **15/15**; 0 errori |
| Schermate con asset veri | 360, 375, 412, 1366: **1916** ciascuna, 0 scorrimenti, 0 tagli, 0 nomi vecchi, 0 errori; tocchi coperti 1 (e06, C33-03) / 0 / 1 (C27-07) / 0 = **uguale alla 0.34.0** |
| Console | **0 errori** in tutte le corse con browser e nei 921 passi della partita |
| **Partita da giocatore** | 7 giri a 360 su 6 episodi (e02, e10, e13, e21, e26, e35 ×2), col salvataggio, 0 errori; e10 ed e13 sbagliati apposta; rilievi nuovi C35-01…C35-06 |

# 1. Novità della 0.35.0

Sonda logica `node coordination/sonde/c35-dati.mjs <radice dati> 1000` (logica del repository, dati della radice; `src/logica` è uguale nelle due versioni): `uscite-c35/dati-035.json` (verde), `dati-034-rosso.json` (dati della 0.34.0).

## 1.1 C34-03: e35, la barca

**FATTO (dati).** `barca_ritorno` ha `"dopo": {"gia": ["barca_porto/segui_barca"]}` (`data/missioni/e35.json:589-590`); la nuova `barca_ormeggiata` ha `"dopo": {"gia": ["barca_porto/blocca_barca"]}` (`:630-631`), con `apri_scatoloni` e `identifica_equipaggio` (stessi effetti di `cerca_scatoloni`/`ferma_barca`). `rapporto_notte` non dice più «faldoni spariti» (`data/testi/it/e35.json:121`); i verbali non nominano più la barca (`:130-131`).

**FATTO MISURATO** (bot casuale, scelta della barca forzata, semi 1–1000 per ramo):

| | `blocca_barca` | `segui_barca` | rosso 0.34.0, `blocca_barca` |
|---|---|---|---|
| chiamata delle banchine in o3 | `barca_ormeggiata` 1000/1000 | `barca_ritorno` 1000/1000 | `barca_ritorno` 1000/1000 |
| opzioni in o3 | apri / identifica 1000/1000 | cerca / ferma 1000/1000 | cerca / ferma |
| frasi che smentiscono il ramo, dopo la scelta (chiamate, opzioni, costi, risposte, verbale) | **0** | **0** | «tornata senza scatoloni» 1000, «lungo la costa» 1000, «barca partita» 703, «andata e tornata» 286 |
| «faldoni spariti» dopo `ferma_uomo` (300 partite) | 0 | – | 300/300 |

Nota di metodo: la mia espressione `/parte\b/` ha preso anche «Il treno parte» e «da qualche parte» (547 e 362 casi): falsi positivi della sonda, tolti a mano dal conto qui sopra.

**Giocato** (§ 5.6, 5.7): ramo blocco → «la barca è ancora al pontile» → «Negli scatoloni, carte asciutte e leggibili» → verbale contenuto «carte che portano tutte alla Varrone & Figli»; ramo segui → «la barca è tornata senza scatoloni» → verbale a fatica «le carte, quasi tutte». Foto `docs/foto/c35/giocatore/e35a-o3-barca_ormeggiata.jpg`, `e35b-o3-barca_ritorno.jpg`; prima/dopo a 4 finestre `docs/foto/c35/novita/e35-o3-banchine-{blocca,segui}-<finestra>-{034,035}.jpg`.

**Salvataggi veri della 0.34.0 dentro e35** (`node coordination/sonde/c35-salvataggi-e35.mjs <0.34.0> . coordination/sonde/salvataggi-034 uscite-c35/salvataggi-e35.json docs/foto/c35/salvataggi`): stato del motore 0.34.0 (bot attento, seme 1, barca forzata), «Riprendi» nella 0.34.0, dove indicato l'ultima risposta toccata nell'interfaccia della 0.34.0, file esportato col pulsante; poi importato nella 0.35.0, «Riprendi», avanti nell'interfaccia fino a fine ondata e fine partita col motore 0.35.0.

| punto del salvataggio 0.34.0 | 0.34.0 | 0.35.0 dopo l'import | esito |
|---|---|---|---|
| o1, su `barca_porto` (prima di bloccare) | chiamata `barca_porto` | stessa chiamata; poi `barca_ormeggiata` in o3 | ok, contenuto |
| o1, dopo `blocca_barca` toccato nella 0.34.0 | `corso_chiuso` | stessa | ok |
| o2, blocco già scelto | `dirette` | stessa | ok |
| o3, blocco, aperta `barca_ritorno` | `barca_ritorno` | **`barca_ormeggiata`** (giusto: il racconto si corregge) | ok |
| **o3, blocco, `barca_ritorno` già risposta (`cerca_scatoloni`)** | **chiusura** dell'ondata | **chiamata `barca_ormeggiata`**, «CHIAMATA 4/4», una sola opzione (`identifica_equipaggio`) | **C35-01** |
| o4, blocco e `barca_ritorno` nelle scelte | `posto_prenotato` | stessa | ok, a fatica |
| o2 e o3, ramo segui | `dirette` / `barca_ritorno` | stesse | ok |

0 errori di console in A e in B.

## 1.2 C34-02: e21 `pullman21`

**FATTO (dati/testi).** Effetti invariati (`data/missioni/e21.json`, chiamata `pullman21`): `subito21` credito +1, pressione piazzale +2; `trattieni21` pressione piazzale −2, tensione quartiere +1, credito −1. Costi nuovi (`data/testi/it/e21.json:110`, `:113`): «chi esce a piedi resta nel piazzale dello stadio, che si intasa» / «Il piazzale si svuota … e il quartiere si scalda».

**FATTO MISURATO** (`c35-dati.mjs`, 1000 partite per opzione, schieramento attento):

| | piazzale: pressione dell'ondata | quartiere | tensione a fine o4 (media, min–max) | settore scoperto in o4 |
|---|---|---|---|---|
| «Riaprile» | **3 → 5** (1000/1000) | pressione 2 → 2, tensione invariata | piazzale 1,52 (1–6), quartiere 3,48 (2–5) | piazzale 1000, quartiere 1000 |
| «Tienile chiuse» | **3 → 1** | tensione **+1** (es. 1→2) | piazzale 0,06 (0–2), quartiere 4,48 (3–6) | piazzale 30, quartiere 1000 |

A schermo (partita, e21 o4, `trattieni21`; letto dal salvataggio prima e dopo): `modifiche` da `{ex_fonderia:-2}` a `{ex_fonderia:-2, piazzale:-2}`, `tensione.quartiere` 1 → 2, fiducia 6 → 5; bollini «Piazzale dello stadio · Vie del quartiere · fiducia». Il testo dice dove sale e dove scende. **Chiuso.** (Il quartiere scoperto 1000/1000 è un altro difetto: C35-03.)

## 1.3 C34-06: verbali di fallimento

**FATTO (testi).** `e13.verbale_degenerato` «La serata è sfuggita di mano: due ore di caos nei rapporti, nessun ferito grave…» (`data/testi/it/e13.json:134`); `e17.verbale_degenerato` «Tafferugli in città fino a notte fonda, molti fermati…» (`data/testi/it/e17.json:123`). Nessun settore nominato.

**FATTO MISURATO.** `node coordination/sonde/c35-fallimenti.mjs . <ep> <settore> 1000` (`uscite-c35/fallimenti-035.log`) e `c35-dati.mjs`:

| | partite fallite (casuale, `c35-fallimenti`) | settori degenerati per partita | senza nessun settore degenerato | prima ondata oltre il giallo (altro campione, `c35-dati`: 553 e 612 fallite) |
|---|---|---|---|---|
| e13 | 523/1000 | 0: 99 · 1: 352 · 2: 69 · 3: 3 | 99 | o2 87 · o3 385 · o4 81 |
| e17 | 610/1000 | 0: 22 · 1: 413 · 2: 153 · 3: 18 · 4: 4 | 22 | o2 137 · o3 309 · o4 166 |

- I fallimenti sono molto diversi fra loro (in e13 la piazza del concerto degenera solo in 25/523; in 99 nessun settore degenera: la tensione supera la soglia per effetto diretto di una risposta, `src/logica/missione.ts:211` conta `s.tensione` prima del dimezzamento). Il testo generico non smentisce nessuno di questi casi.
- Rosso (dati 0.34.0): «piazza oltre il limite, concerto interrotto» con piazza del concerto degenerata in 29/553 partite fallite; «Cancelli forzati» con tornelli degenerati in 132/610.
- **Giocato** e13 fallito due volte (§ 5.3): prima piazzale e curva Kiln degenerati (o2–o3), poi, ripartendo dall'ondata 2, parcheggi e viale in o4. Il verbale è lo stesso e vale per tutti e due. **Chiuso.**
- GIUDIZIO: e17 «fino a notte fonda» è vero anche quando si perde in o2 (il racconto finisce di notte). Nessun residuo.

## 1.4 C34-09: la «i» dell'ondata 1 di e21

**FATTO.** Nuovo testo a schermo (foto `docs/foto/c35/novita/e21-o1-info-360x760-035.jpg`, prima `…-034.jpg` «i giovani della curva sono all'ex fonderia»): «Inizio serata: la curva è divisa, e l'ex fonderia dei giovani rischia lo sgombero». Non dice più dove sono stasera. **Chiuso.**

GIUDIZIO (non è un rilievo): restano due indizi più deboli, il titolo dell'ondata «Dall'ex fonderia» (`e21.ondata1`) e il vice in sala «I giovani stanno all'ex fonderia, col centro sociale». Da giocatore non li ho letti come una smentita della fonte del comune.

## 1.5 C34-10: e02 `caldo_casa`

**FATTO (dati).** `niente` ha `dopo.mai` e `niente_senza_mediatore` ha `dopo.gia` su `corteo_viale/mediatore_corteo` (`data/missioni/e02.json:731-747`). **FATTO MISURATO** (`c35-dati.mjs`, 200 partite per caso): dopo `mediatore_corteo` 200/200 «Non intervenire: il mediatore è ancora col corteo»; dopo `corteo_scortato` o `corteo_no` 400/400 le due opzioni di sempre. Rosso: 200/200 «Non intervenire» da solo. A schermo nella partita: foto `docs/foto/c35/giocatore/e02-o3-caldo_casa.jpg`, costo «Nessun costo, nessun aiuto: l'hai mandato col corteo del Railhead.» **Chiuso per e02.**

Ma il difetto descritto da C34-10 («un'opzione che sparisce per mancanza di unità non lascia traccia») è generale: → C35-02.

# 2. Rilievi aperti, rimisurati (stato, senza proposte)

`git diff --stat acf1151 e7f00cc -- src schema data/missioni/e17.json`: solo `src/versione.ts`. Nessuno dei quattro poteva cambiare.

| rilievo | stato | misura C-035 |
|---|---|---|
| **C33-06** vignetta del rapporto mai visibile | **aperto, uguale** | schermate (`c29-schermate`, seme 1, 36 episodi): vignetta del rapporto **nascosta 142/142** a 360, 375, 412 e 1366 (`uscite-c35/vignette-schermate.txt`); nella partita **31/31** rapporti con `data-nascosta` (`rap.sh`). A 375×667 sono nascoste anche le vignette della sala (108/108) e del verbale (180/180); a 1366 quella della sala in 93/108. Codice: `src/resa/vignetta.tsx:38` |
| **C33-07** tono «calmo» con un settore scoperto | **aperto, uguale** | nella partita **9/20** rapporti col tono «calmo» hanno almeno un «SCOPERTO» (e02 o4; e21 o2, o3; e26 o2, **o4 con tre scoperti**; e35a o3; e35b o1, o2, o3 con due). Il tono viene dai livelli di tensione, non dagli scoperti (`src/resa/schermate/Rapporto.tsx:18`) |
| **C33-09** «non deve passare il giallo: è arrivata al giallo» | **aperto, uguale** | visto 2 volte nella partita: e21 e e35b (foto `e21-verbale-p-*.jpg`, `e35b-verbale-p-*.jpg`). Codice `src/resa/schermate/Bilancio.tsx:39` |
| **C34-04** e17 Piazza del municipio di tipo strada | **aperto, uguale** | `data/missioni/e17.json:81-82` `"tipo": "strada"`; steward senza efficacia sulle strade (risorse di e17). Un caso dello stesso tipo, più grave, in e21: C35-03 |

Visti di nuovo giocando (non richiesti): C33-13 fiducia piena con l'episodio perso (e10: **10/10** con due settori degenerati; e13: 10/10 in o2–o3), C33-15 «Per la stella successiva» negli episodi falliti (e10, e13), C34-05 unità «fino a sera» che non coprono (e02 o4: il mediatore «resta col corteo fino a sera» ma il viale è «Corteo: unità non abbastanza»), C34-07 «Dove sei rimasto scoperto» che salta settori (e13: piazzale o3, degenerato, assente), Lavezzari che dà del «te» (`e21.ch.striscione_sgombero`, «i vecchi chiedono di te»).

# 3. Coerenza testi ↔ dati ↔ resa (e02, e13, e17, e21, e35)

- **e02:** coerente (§ 1.5). Nota: la vignetta della chiamata del vice e il testo «Andrei io, ma è il tuo turno» con una sola risposta «Non intervenire» ora si capiscono.
- **e13:** verbale coerente (§ 1.3). **Ondata 2: sul Piazzale dello stadio il rapporto scrive «Curva agitata»**, perché l'evento `cori_ospiti` è di tipo `curva` (`data/missioni/e13.json:333-335`) e il testo dell'evento è «curva agitata» (`data/testi/it/comune.json:69`). Su 36 episodi è l'unico evento `curva` su un settore che non è una curva (scansione in riga di comando dei dati). → C35-05.
- **e17:** verbale coerente; C34-04 invariato.
- **e21:** pullman21 e «i» coerenti. **Le «Vie del quartiere» sono un settore che nessuna unità può coprire** → C35-03.
- **e35:** barca coerente nei due rami e nei verbali «contenuto» e «a fatica». **Verbale di fallimento nuovo** «La notte è scappata in troppe direzioni insieme, dal nastro al porto» → C35-04. Salvataggio 0.34.0 → C35-01.
- **Ordine pubblico e violenza:** sempre riferiti (rapporti, radio, verbali). Nessuna procedura reale nuova da verificare su fonti esterne.

# 4. Regressioni (FATTO MISURATO)

- **Bot:** `node tools/bot.mjs 1000` (`uscite-c35/bot-1000.log`) e lo stesso nella 0.34.0 (`bot-1000-v034.log`): 156/156 righe con **blocchi 0/1000**, tutte e tre le stagioni (e01–e36); «chiamate mai comparse» `[]` 36/36; `diff` delle due uscite (tolti i tempi): solo la riga finale «fine 0». Coerente: le opzioni nuove hanno gli stessi effetti delle vecchie, il generatore fa le stesse estrazioni.
- **Test e tipi:** `npx vitest run` → «Test Files 46 passed (46) · Tests 252 passed (252)» (0.34.0: 241; in più `c34-dati`); `npx tsc --noEmit -p .` uscita 0, nessun messaggio.
- **Console:** 0 errori di pagina e di console in schermate (16 blocchi), salvataggi (4 corse), foto delle novità, import vecchi (2) e nei 921 passi della partita (`/fine` → `errori: []`).
- **Schermate con asset veri:** `bash coordination/sonde/c35-schermate-blocchi.sh <1-4> <foto>` (= `c29-schermate.mjs`, bot attento, seme 1), riassunto `node coordination/sonde/c35-riassunto-schermate.mjs coordination/sonde/uscite-c35/schermate` (`uscite-c35/schermate-riassunto.txt`):

| misura | schermate | scorr. orizz. | tagli | nomi vecchi | tocchi coperti | errori |
|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 1 (e06, C33-03) | 0 |
| 375×667 | 1916 | 0 | 0 | 0 | 0 | 0 |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, C27-07) | 0 |
| 1366×768 | 1916 | 0 | 0 | 0 | 0 | 0 |

  Uguale alla 0.34.0 riga per riga. Le 4 × 1916 foto sono rimaste locali (si rifanno col comando). **Foto prima/dopo** delle schermate cambiate a 360, 375, 412 e 1366: `node coordination/sonde/c35-foto-novita.mjs <0.34.0> . docs/foto/c35/novita uscite-c35/foto-novita.json` → 40 foto (5 casi × 4 finestre × 2 versioni), 0 scorrimenti orizzontali, 0 errori.
- **Salvataggi veri:**
  - e35 della 0.34.0: § 1.1 (7/8, C35-01);
  - `EP=e02,e13,e17,e21,e35 ONDATA=3|4 VA=0.34.0 node coordination/sonde/c33-salvataggi-o4.mjs <0.34.0> . coordination/sonde/salvataggi-034 …`: **5/5 e 5/5** ripresi sulla stessa chiamata (`salvataggi-o3.json`, `salvataggi-o4.json`);
  - `node coordination/sonde/c35-importa-vecchi.mjs . <cartella> …`: tutti i 18 file della 0.34.0 e i 15 file veri della 0.33.0 (ramo C-034) importati senza errore e ripresi su una chiamata (`importa-034.json`, `importa-033.json`). I salvataggi della 0.32.0 e precedenti non li ho riprovati.

# 5. Partita da giocatore (PO-120)

**Come ho giocato (FATTO).**
- Build 0.35.0, 360×760, col dito (`hasTouch`), DPR 1, asset veri. Pilota `c33-giocatore.mjs` con gli aiuti `coordination/sonde/c35-giocatore-aiuti/` (copie del C-034 coi percorsi della mia sessione). Ogni scelta l'ho decisa leggendo la schermata. **Limite dichiarato:** e35 (e in parte e21, e02, e13) li conoscevo già dai dati per via delle sonde della § 1; in e35 il secondo giro l'ho giocato sapendo cosa arrivava.
- Partita nuova dal titolo, guida intera letta, «la nuova responsabile ad interim». **Un solo salvataggio per tutta la partita** (nessun riavvio del container). Per arrivare agli episodi richiesti ho segnato a mano come conclusi gli episodi in mezzo (`sblocca.sh`: 1 stella, variabili invariate) e, per e10 ed e13 falliti, ho segnato il loro migliore come superato per sbloccare il seguito. Le variabili della storia degli episodi saltati quindi non vengono da scelte vere.
- **Durata in minuti di gioco: non posso confermarla** (il gioco non mostra un orologio di gioco). Conto tocchi (`node coordination/sonde/c34-giornale.mjs …/giornale.jsonl`, più il taglio del giornale alle partenze), ondate e chiamate.
- Giornale `coordination/sonde/uscite-c35/giocatore/giornale.jsonl`; foto `docs/foto/c35/giocatore/` (168). Errori di console: 0.

| episodio | come ho giocato | esito | stelle | tocchi | ondate / chiamate |
|---|---|---|---|---|---|
| e02 Ospiti numerosi | bene | contenuto | 3 | 124 | 4 / 14 |
| e10 Derby di ritorno (mai giocato nei collaudi recenti) | **sbagliato apposta** | degenerato (fallito in o1) | 0 | 123 | 4 / 11 |
| e13 Il concertone d'estate | **sbagliato apposta**, poi ripreso dall'ondata 2 e fallito in un altro modo | degenerato, due volte | 0 | 116 + 75 | 4+3 / 12+9 |
| e21 Senza capo | bene | contenuto a fatica | 1 | 110 | 4 / 11 |
| e26 La finale (mai giocato nei collaudi recenti) | bene | contenuto | 3 | 111 | 4 / 12 |
| e35 La notte lunga, ramo blocco | bene | contenuto | 3 | 109 | 4 / 12 |
| e35 La notte lunga, ramo segui | bene ma meno attenta (treno ignorato, stampa all'uscita, «un imprenditore») | contenuto a fatica | 2 | 102 | 4 / 12 |

(I tocchi comprendono la navigazione fra un episodio e l'altro e le foto non contano; e35 ramo segui comprende le 3 conferme di «Rigioca».)

## 5.1 e02 Ospiti numerosi (giocato bene)

Foto `e02-*`.
- **FATTO:** o1–o3 «Fiducia +1: nessun settore scoperto»; o4 viale «Corteo: unità non abbastanza / SCOPERTO» col tono «calmo» (C33-07); verbale «CONTENUTO», 3 stelle, «Ottocento ospiti arrivati, quasi tutti ripartiti in giornata».
- **IMPRESSIONE DA GIOCATORE:**
  - Capisco tutto: treni in ritardo, biglietti falsi, il responsabile del Railhead che «se la lega al dito». Ritmo buono, mai annoiata.
  - `caldo_casa` adesso si capisce: il vice dice «Andrei io, ma è il tuo turno» e l'unica risposta spiega che il mediatore l'ho mandato col corteo. Mi ha fatto pensare «giusto, l'ho speso io».
  - Il mediatore «resta col corteo fino a sera», ma in o4 il viale va scoperto proprio per un corteo (C34-05): sembra che il mediatore sia sparito.
  - Testo, mappa e vignetta raccontano la stessa cosa. Finale che si sente («lo appende accanto alla cartina dei treni»).

## 5.2 e10 Derby di ritorno (sbagliato apposta)

Foto `e10-*`.
- **Cosa ho fatto:** creduto all'informatore (bassa) e non alla radio (alta): niente sulla strada da Kiln né su quella da Skyfield, tutto in curva e sul piazzale; «silenzio», «niente soldi», «nessun trattamento speciale», «lascia parlare la stampa», «lascia esplodere».
- **FATTO:** o1 strada da Kiln e da Skyfield scoperte, una degenerata (−1); o2 curva Kiln; o3 curva Kiln degenerata; o4 due strade scoperte. Verbale «DEGENERATO FUORI CAMPO», «Episodio fallito: va rigiocato» (solo «Ricomincia», perché si è perso in o1). **Fiducia 10/10** a fine o3 (C33-13).
- **IMPRESSIONE DA GIOCATORE:**
  - L'idea del derby di ritorno che «passa a riscuotere» è chiara e funziona: il ragazzo delle sciarpe non pagato, il presidente mai incontrato.
  - Le conseguenze sono giuste e rapide; il fallimento all'ondata 1 si capisce dal rapporto.
  - La barra della fiducia piena mentre perdo è l'unica cosa che stona davvero: avevo scelto le risposte «che piacciono al comando» e il gioco me le ha premiate tutte.
  - «Fai uscire prima Skyfield» compare fra le scelte che «ti hanno aiutato» nello stesso verbale che dà la strada da Skyfield scoperta in o4.
  - Finale amaro ma giusto («cerchi rossi su ogni foto»).

## 5.3 e13 Il concertone d'estate (sbagliato apposta, due fallimenti diversi)

Foto `e13-*`, `e13b-*`.
- **Cosa ho fatto:** primo giro, tutto su viale e parcheggi, niente su piazzale e curva Kiln nonostante la radio (alta) «trenino pieno, ospiti sul piazzale»; «che resistano», «aspetta che si stanchino», «niente patti». Poi «Riparti dall'ondata 2», piazzale e curva coperti bene, ma parcheggi e viale lasciati vuoti in o4.
- **FATTO:** giro 1: o2 curva Kiln e piazzale scoperti, o3 due degenerati (−2), o4 viale scoperto. Giro 2: o2 e o3 nessuno scoperto, o4 viale e parcheggi scoperti, uno degenerato. Tutti e due «DEGENERATO FUORI CAMPO» con lo stesso verbale; il primo propone «Riparti dall'ondata 2», il secondo «dall'ondata 4».
- **IMPRESSIONE DA GIOCATORE:**
  - Il verbale nuovo («La serata è sfuggita di mano…») non racconta più una serata diversa dalla mia: va bene per tutti e due i fallimenti. È meno colorito di prima, ma è giusto.
  - Sul piazzale in o2 il rapporto dice «Curva agitata»: mi sono chiesta se avessi sbagliato settore (C35-05).
  - «Dove sei rimasto scoperto» del primo giro elenca o2 piazzale, o2 curva, o3 curva e salta il piazzale dell'ondata 3, quello degenerato (C34-07).
  - La ripartenza dall'ondata 2 è comoda; nel secondo giro ho capito dove avevo sbagliato e mi sono sentita brava, poi ho perso apposta e il gioco me l'ha detto chiaramente.

## 5.4 e21 Senza capo (giocato bene)

Foto `e21-*`.
- **FATTO:** o1 nessuno scoperto (+1); o2 **«Vie del quartiere: Raduno: nessuna unità a coprirlo / SCOPERTO» con 2 steward sul disco** e dopo aver risposto «Steward nelle vie del quartiere»; i 2 steward vanno **a riposo** e nell'ondata 3 ho **0 steward** (foto `e21-o2-rapporto.jpg`, `e21-o3-steward-zero.jpg`); o3 piazzale scoperto; o4 quartiere ed ex fonderia scoperti. Verbale «CONTENUTO A FATICA», 1 stella, «è arrivata al giallo» (C33-09).
- **IMPRESSIONE DA GIOCATORE:**
  - L'episodio più politico e il più scritto bene: la curva divisa, l'assemblea che «chiede a te di decidere», «La democrazia, ma col vivavoce».
  - La «i» dell'ondata 1 non mi ha più detto chi mente (C34-09 chiuso). Il comune (alta) è «FALSA» nel verbale: sorpresa giusta.
  - `pullman21`: i costi dicono esattamente cosa succede (§ 1.2). Ho scelto «Tienile chiuse» sapendo che il quartiere si sarebbe scaldato.
  - **Mi sono sentita presa in giro dal quartiere:** ci ho messo steward, ho risposto due volte «uno steward per le vie del quartiere», e il rapporto dice «nessuna unità a coprirlo»; in più gli steward mi sono stati tolti per l'ondata dopo. Non c'era modo di capirlo dal gioco (C35-03).
  - In o3 «Steward in piazza a spiegare: ti costa uno steward» con 0 steward disponibili: l'ho scelta e ha funzionato, ma non capivo da dove venisse lo steward (C35-06).

## 5.5 e26 La finale (giocato bene)

Foto `e26-*`.
- **FATTO:** o1 e o3 nessuno scoperto; o2 curva ospiti scoperta (tono «calmo»); **o4 tribuna, piazzale e parcheggi «SCOPERTO», tono «calmo»**, verbale «CONTENUTO», **3 stelle** («Coppa alzata, immagini pulite, pullman ripartiti»). In o4 `carosello` con **una sola risposta** «Blocca il carosello», perché il mediatore l'avevo mandato in tribuna in o1 (foto `e26-o4-carosello-una-sola.jpg`): C35-02. In o4 avevo 1 squadra: le altre impegnate da risposte «fino a sera».
- **IMPRESSIONE DA GIOCATORE:**
  - Bella atmosfera da finale: sei pagine di ospiti d'onore, «niente immagini brutte in diretta», la regia che inquadra il cielo.
  - Tre settori scoperti nell'ultima ondata e tre stelle: il risultato mi è sembrato regalato, e il tono «calmo» del rapporto lo conferma.
  - Dopo «Blocca il carosello» («Il carosello si ferma») la chiamata seguente dice che i pullman sono «chiusi dalle auto del carosello» e offre «Aspettano la fine del carosello». GIUDIZIO: si può leggere come «le auto ferme bloccano i pullman», ma al primo colpo mi è sembrato che il blocco non fosse servito.
  - Il vice usa due volte la stessa battuta in due episodi («Io ci andrei / lo scriverei, ma io non ho niente da perdere», e26 e e35).

## 5.6 e35 La notte lunga, ramo blocco (giocato bene)

Foto `e35a-*`.
- **FATTO:** o1, o2 «nessun settore scoperto»; o3 corso scoperto (tono «calmo»); `barca_ormeggiata` → `apri_scatoloni` «Negli scatoloni, carte asciutte e leggibili»; o4 `ferma_uomo` disponibile (mi restava una squadra) «Nella valigia, faldoni»; `rapporto_notte` «la rapina copriva le carte del cantiere»; verbale «CONTENUTO», 3 stelle; «Manda una squadra a bloccare il pontile» fra le scelte che hanno aiutato.
- **IMPRESSIONE DA GIOCATORE:**
  - Adesso la storia della barca tiene: la blocco, resta al pontile, apro gli scatoloni, trovo le carte, il verbale dice che le carte portano alla Varrone. È la notte che ricordo.
  - Ritmo da notte vera (sette, dieci, l'una, l'alba); il corridoio fino ai familiari resta il momento più umano.
  - Ho dovuto risparmiare squadre apposta per avere «Fermalo» in o4; un giocatore meno attento resta con «Lascialo partire» e basta (C35-02: il bot attento 300/300).

## 5.7 e35 La notte lunga, ramo segui (rigiocato)

Foto `e35b-*`.
- **FATTO:** «Rigioca» chiede **tre conferme** («Conferma 2 di 3», «3 di 3», foto `e35b-rigioca-3di3.jpg`). o1 banchine scoperte («Gruppi in movimento», dopo «Lasciala partire»); o3 `barca_ritorno` «la barca è tornata senza scatoloni» → «Fai fermare l'equipaggio»; o4 «Lascialo partire», stampa all'uscita, «un imprenditore»; verbale «CONTENUTO A FATICA» «nastro, corso bloccato, stazione, porto… le carte, quasi tutte»; «Resta il risultato migliore di un tentativo precedente».
- **IMPRESSIONE DA GIOCATORE:**
  - Il racconto è diverso dal primo giro e coerente: la barca parte, torna vuota, le carte si perdono in parte. Il verbale «quasi tutte» suona giusto.
  - «Guadagni fiducia col comando **se va bene**» (segui_barca): la fiducia sale subito, anche se poi la barca torna vuota.
  - Il seguito della barca non dà niente: «Una luce la segue lungo la costa» e poi nessuna notizia di dove abbia lasciato gli scatoloni. Peccato, è la scelta più «da indagine».

## 5.8 Insieme (IMPRESSIONE DA GIOCATORE)

- **Cosa funziona:** le correzioni della 0.35.0 si sentono giocando: e35 racconta la mia notte nei due rami, `pullman21` dice la verità, i verbali di fallimento non inventano. Fonti smascherate nel verbale, il vice, le ripartenze dall'ondata.
- **Dove mi sono persa:** settori dove le unità non contano niente (e21 quartiere, e17 municipio), con la beffa delle unità messe a riposo; chiamate con una sola risposta (e26 carosello); la fiducia piena mentre perdo (e10).
- **Testo, mappa e vignetta:** testo e mappa coincidono; la vignetta del rapporto non si vede mai (31/31, C33-06); quelle del verbale sì; il tono del rapporto è «calmo» con settori scoperti (9 volte su 20).
- **Noia:** quasi mai. Un po' di ripetizione nelle frasi del vice fra episodi.
- **Finali:** si sentono in e02, e10, e21, e26, e35 (tutti e due i rami); e13 più neutro col verbale nuovo.

# Rilievi (per gravità)

## Alto

Nessuno.

## Medio

**C35-01: un salvataggio della 0.34.0 fermo a fine ondata 3 di e35, dopo il blocco della barca e la risposta a `barca_ritorno`, nella 0.35.0 riapre l'ondata con `barca_ormeggiata`: due chiamate che si smentiscono e effetti contati due volte.**
- Misura (§ 1.1): `c35-salvataggi-e35.mjs`, punto `o3-blocca-dopo-cerca_scatoloni`: nella 0.34.0 scena **chiusura** (ondata finita, nessuna chiamata); importato nella 0.35.0, «Riprendi» → **chiamata `barca_ormeggiata`**, «ONDATA 3/4 · CHIAMATA 4/4», «la barca è ancora al pontile, scatoloni a bordo», **una sola opzione** `identifica_equipaggio` (`apri_scatoloni` nascosta: squadre finite). Le scelte finali contengono sia `3:barca_ritorno/cerca_scatoloni` sia `3:barca_ormeggiata/identifica_equipaggio` (credito +1 e banchine +2 in più). Foto `docs/foto/c35/salvataggi/A-o3-blocca-dopo-cerca_scatoloni.jpg` e `B-o3-blocca-dopo-cerca_scatoloni.jpg`.
- Causa (FATTO dati/codice): le chiamate aperte si calcolano dai dati ad ogni ripresa (`chiamateAperte`, `src/logica/missione.ts:128-131`); `barca_ormeggiata` (`data/missioni/e35.json:630-631`) è nuova e non è fra le `risposte` del salvataggio. Il salvataggio non cambia SAVE_VERSION (nessun file di `src/salvataggi` nel diff).
- Altri 7 punti dentro e35 (prima del blocco, dopo il blocco in o1 e o2, o3 su `barca_ritorno` aperta, o4, ramo segui) ripresi bene: la finestra è la sola schermata di chiusura dell'ondata 3 nel ramo blocco.
- GIUDIZIO: media perché tocca la regola dei salvataggi retrocompatibili e riapre il racconto contraddittorio che C34-03 chiudeva; la finestra è stretta.

**C35-03: e21, le «Vie del quartiere» sono un settore che nessuna unità può coprire; le unità messe lì valgono zero, vanno a riposo, e il rapporto dice «nessuna unità a coprirlo».**
- FATTO (dati): settore `quartiere` di tipo `quartiere` (`data/missioni/e21.json:69-70`); nessuna risorsa di e21 ha efficacia su `quartiere` (`:93` e seguenti: squadre magazzino/piazzale/curva, steward curva/piazzale/magazzino, mediatore dimezza solo `faida`). Eventi `raduno` 3 in o2 e 2 in o4. Copertura = somma delle efficacie (`src/logica/missione.ts:201`); se il settore è scoperto, le unità lì vanno a riposo (`:209`). Scansione dei 36 episodi: è l'**unico settore che nessuna unità copre** (altri 7 settori coperti da un solo tipo di unità: e16, e17 ×2, e19, e25, e35 ×2).
- FATTO MISURATO: quartiere scoperto in o4 **1000/1000** partite, con qualunque risposta (`c35-dati.mjs`, `scoperto_o4`); nella partita: o2 «Raduno: nessuna unità a coprirlo / SCOPERTO» con 2 steward sul disco e dopo `steward_ospiti21`, i 2 steward a riposo, **0 steward** in o3 (foto `e21-o2-rapporto.jpg`, `e21-o3-steward-zero.jpg`); o4 di nuovo scoperto col mediatore sul disco.
- È lo stesso tipo di difetto di C34-04 (aperto, in attesa di decisione), ma totale. GIUDIZIO: media perché punisce chi gioca bene e il gioco non lo fa capire.

## Basso

**C35-02: chiamate che restano con una sola risposta, senza dire perché (C34-10 corretto solo in e02).**
- `node coordination/sonde/c35-opzioni-sparite.mjs . 300` (bot casuale e attento, 300 semi, tutte le missioni; `uscite-c35/opzioni-sparite-035.log`): 22 casi distinti di opzioni nascoste da C17-03 (`src/logica/missione.ts:149-152`), **9 con una sola risposta**: e02 `caldo_casa` (ora spiegato), e26 o4 `carosello` (casuale 94/300), e27 o3 `gol_ospiti` (98/300), e28 o4 `corteo_capo` (attento **300/300**), e29 o3 `ospiti_spaventati` (attento 300/300), e29 o4 `corteo_al_porto` (attento 300/300), e35 o4 `fine_trattativa` (39/300), **e35 o4 `posto_prenotato`** (attento **300/300**: resta solo «Lascialo partire»), e36 o4 `busta` (2/300).
- A schermo: e26 o4 «Blocca il carosello» da sola (foto `e26-o4-carosello-una-sola.jpg`).

**C35-04: e35, il verbale di fallimento nuovo («troppe direzioni insieme, dal nastro al porto») racconta più di quello che succede.**
- FATTO: `data/testi/it/e35.json:131`. `c35-fallimenti.mjs . e35 banchine 1000`: partite fallite 734/1000; settori degenerati per partita **0: 5 · 1: 567 · 2: 152 · 3: 9 · 4: 1**; banchine (il porto) degenerate in **88/734**. Esempio seme 53 (`dati-035.json`, `fallimenti.e35.esempi`): fallita per il solo perimetro (picco 7 in o4, `stampa_uscita`).
- Stessa classe di C34-06, introdotta dal testo nuovo della 0.35.0. Il guardiano `tests/c34-dati.test.ts` non lo vede perché controlla solo e13 ed e17.

**C35-05: e13 ondata 2, sul Piazzale dello stadio il rapporto dice «Curva agitata».**
- FATTO: evento `cori_ospiti` `"tipo": "curva"` su `"settore": "piazzale"` (`data/missioni/e13.json:333-335`), testo «curva agitata» (`data/testi/it/comune.json:69`); unico evento `curva` fuori da un settore curva nei 36 episodi. A schermo nella partita (e13 o2, `e13-o2-rapporto.jpg`).

**C35-06: una risposta che «costa uno steward» si offre anche con 0 steward schierabili.**
- e21 o3 `steward_scale21` (`data/missioni/e21.json:535`) offerta con «Steward 0» sulla barra (2 a riposo, 4 impegnati); scelta, ha funzionato e in o4 gli steward disponibili erano 1. C17-03 guarda solo la riserva (`quantita + riserva > 0`, `src/logica/missione.ts:151`), non le unità a riposo. Foto `e21-o3-steward-zero.jpg`.
- IMPRESSIONE DA GIOCATORE: non si capisce da dove arrivi lo steward.

# Verificati e chiusi

| rilievo | misura |
|---|---|
| **C34-03** e35 barca | o3 `barca_ormeggiata`/`barca_ritorno` 1000/1000 per ramo, 0 smentite (rosso: 1000/1000 smentite); giocati i due rami. Residuo di migrazione: C35-01 |
| **C34-02** e21 `pullman21` | piazzale 3→5 / 3→1, quartiere tensione +1; testi coerenti; a schermo coi numeri del salvataggio |
| **C34-06** verbali di fallimento e13/e17 | testi generici; 523 e 610 partite fallite diverse, e13 fallito due volte in modi diversi a schermo. Residuo in e35: C35-04 |
| **C34-09** «i» di e21 o1 | testo nuovo a schermo a 4 finestre |
| **C34-10** e02 `caldo_casa` | 200/200 con la spiegazione; 400/400 le due di sempre. Residuo in altri episodi: C35-02 |
| Regressioni | bot uguale alla 0.34.0; 252/252; tipi 0; schermate 4 × 1916 uguali alla 0.34.0; salvataggi 0.34.0 e 0.33.0; console 0 |

# Note di metodo e limiti

- **Misura ritirata:** nessuna. Dichiarato in § 1.1 il falso positivo della mia espressione `/parte\b/` (non entra nei conti).
- **Incidenti di sessione:** un mio `pkill -f` ha chiuso la shell (nessuna corsa persa: il pilota e le schermate erano processi separati e sono andati avanti); un giro di comandi è rimasto appeso alla conferma di «Rigioca» e l'ho fermato (i tocchi falliti non entrano nel giornale). Nessun riavvio del container.
- **Rumore:** le schermate hanno girato con 5 browser e carico fino a 25; i numeri sono identici alla 0.34.0, quindi il carico non li ha toccati.
- **Non misurato:** telefoni, tablet e PC veri; WebView dell'APK; lettori di schermo; tastiera; catena completa (`node tools/catena.mjs`, non lanciata per non scrivere `STABILITA.json` da collaudatrice); salvataggi della 0.32.0 e precedenti; foto «prima/dopo» del verbale di fallimento (solo «dopo», dalla partita a 360).
- **Partita:** episodi intermedi segnati a mano; e35 conosciuto in anticipo dai dati; un giocatore; durata in minuti di gioco non misurabile.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c35-dati.mjs` | C34-03 barca nei due rami (chiamate, opzioni, smentite, verbali), C34-02 pressioni prima/dopo `pullman21`, fallimenti di e13/e17/e35, C34-10 opzioni di `caldo_casa` | `node coordination/sonde/c35-dati.mjs <radice dati> [semi]` |
| `c35-fallimenti.mjs` | partite fallite: quanti settori degenerano, se c'è un settore dato, fallimenti senza settore degenerato | `node coordination/sonde/c35-fallimenti.mjs <radice dati> <ep> <settore> [N]` |
| `c35-opzioni-sparite.mjs` | chiamate con opzioni nascoste da C17-03 e quante ne restano, tutte le missioni | `node coordination/sonde/c35-opzioni-sparite.mjs <radice dati> [N]` |
| `c35-salvataggi-e35.mjs` | salvataggi veri della 0.34.0 dentro e35 prima e dopo `blocca_barca`, ripresi nella 0.35.0 e portati a fine partita | `node coordination/sonde/c35-salvataggi-e35.mjs <A> <B> <cartella> <uscita.json> [foto]` |
| `c35-importa-vecchi.mjs` | file di salvataggio vecchi importati col pulsante e ripresi | `node coordination/sonde/c35-importa-vecchi.mjs <radice> <cartella> <uscita.json>` |
| `c35-foto-novita.mjs` | foto prima/dopo delle schermate cambiate dalla 0.35.0 a più finestre | `[MISURE=…] node coordination/sonde/c35-foto-novita.mjs <A> <B> <foto> <uscita.json>` |
| `c35-schermate-blocchi.sh` | `c29-schermate.mjs` a blocchi, uscite in `uscite-c35` | `bash coordination/sonde/c35-schermate-blocchi.sh <1-4> <foto> [ROSSI]` |
| `c35-riassunto-schermate.mjs` | riassunto per finestra delle uscite delle schermate | `node coordination/sonde/c35-riassunto-schermate.mjs <cartella> [suffisso]` |
| `c35-giocatore-aiuti/` | aiuti del pilota della partita coi percorsi di questa sessione | vedi `LEGGIMI.md` |
