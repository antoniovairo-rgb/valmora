# Collaudo C-033: 0.32.0 (pastiglie a tetto 0 D-136, corteo di e30 C31-02, voci dei club C32-03, coppa di e08 C32-05)

Novità collaudate (commento di GAME_VERSION, `src/versione.ts:219-225`): D-136/C28-14 pastiglie mai sopra i nomi, con due posti in più per le unità e nomi stretti su più righe; C31-02 corteo di e30 dal bordo dello stadio verso il municipio; C32-03 mittenti del club in e07/e08; C32-05 supplementari e scommessa in e08. In più: conferma della 0.30.0/0.31.0, rilievi aperti del C-032, coerenza testi↔dati↔resa, usabilità, regressioni.

- **Build collaudata:** main a c15c617 (rilascio a 75cc870), GAME_VERSION 0.32.0 (`src/versione.ts:226`); `npm ci` e `npx vite build` verdi.
- **Confronto «prima»:** 0.31.0 a 8eb495e in un worktree separato (`git worktree add`, `npm ci`, `npx vite build`).
- **Cosa è cambiato** (`git diff --stat 8eb495e c15c617 -- src data schema tools tests index.html public`): 11 file, +86/−21. Dati `data/missioni/e07.json`, `e08.json` (una `fonte` ciascuno), `data/testi/it/e08.json` (2 righe); resa `src/resa/mappa/etichette.ts`, `sfondo.ts`, `StratoPixi.tsx`, `stile.css` (+2 righe); `src/versione.ts`; guardiani `tests/viale.test.ts`, `tests/voci-club.test.ts` (nuovo), `tools/foto-schieramenti.mjs` (tetto 7 → 0). Nessun file di `src/logica` o `schema/`. D-139 (38a96b1, «?» nella barra fissa) è una decisione: nessun file di `src/` cambiato per D-139.
- **Ramo:** claude/valmora-collaudo-c33. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato. I bracci rossi sui dati li ho fatti in un worktree a parte (`git checkout data` dopo).
- **Data:** 2026-10-16.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), DPR 1, Node 22, 4 CPU, fino a 4 browser in parallelo.
- **Sonde:** riprese senza modifiche dai rami del C-027…C-032 (copiate dal ramo claude/valmora-collaudo-c32); nuove `c33-*` (tabella in fondo).
- **Dove sono i dati:** uscite in `coordination/sonde/uscite-c33/` (JSON grandi `.json.gz`); salvataggi veri della 0.31.0 in `coordination/sonde/salvataggi-031/`; foto in `docs/foto/c33/` (JPEG: `pastiglie/`, `e06/`, `club/`). Le 4 × 1916 schermate delle corse complete sono rimaste locali, si rifanno col comando indicato.

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, marcato) · **IPOTESI** (marcata).

## Riepilogo

| verifica | esito |
|---|---|
| **D-136 / C28-14** pastiglie sopra i nomi | riquadro del nome sotto una pastiglia **0/142** ondate a 360, 375 e 412 in 3/3 giri (0.31.0: 7, 3, 0; rosso C94N01: 7–8, 3, 0). Nelle schermate giocate «nome × pastiglia» sparisce (360: 46 coppie → 0). **Chiuso nel senso del guardiano**, ma il guardiano misura il riquadro, non il testo: con la larghezza ×0,6 il testo esce dal riquadro (10 ondate a 360, 5 a 375) e in e13 o2 la «I» di PARCHEGGI va sotto una pastiglia, in e35 o2 a 375 PERIMETRO tocca un altro nome → **C33-01** |
| e31 ondata 2, tocco sotto un altro tocco | **0** (0.31.0 e rosso C94N01: 1). **Chiuso** |
| Posti nuovi destra-basso / sinistra-basso | usati a 360 da 14 (destra-basso) e 10 (sinistra-basso) gruppi su 457, in 142 ondate; nessuno scorrimento, nessun tocco fuori dalla mappa. Ma nel gioco vero, e06 schieramento 1 a 360: la pastiglia del mediatore di Piazza del concerto finisce **sotto il disco del Piazzale** (2/2 giri; 0.31.0 e rosso: 0) → **C33-03** |
| **C31-02** e30 ondate 2-4 | via dallo stadio **0 avvicinano / 69 allontanano** (ondata) e 0/40 (chiamate) in o2, o3, o4; verso il municipio 62–64/69. Uguale a 412 e 1366. Rosso C95S01: 57–58/11–12, come la 0.31.0. **Chiuso per o2 e o3.** In o4 però la fiaccolata («dopo il municipio, fiaccolata fino al porto») ora va **verso** il municipio: 0.31.0 0/69, 0.32.0 63/6 → **C33-02** |
| **C32-03** mittenti di e07/e08 | a schermo «Ufficio sicurezza dello Skyfield Athletic» ed «Gianni Lavezzari, sicurezza del Kiln United»; `tests/voci-club.test.ts` col rosso 2/2. **Chiuso** |
| **C32-05** e08 | «Due a due ai supplementari, rigori al Kiln» e «Meno male che stavolta non ho scommesso»: coerenti con e03, e26 e con `e08.intro2`. **Chiuso** |
| 0.30.0 / 0.31.0 | nessun file toccato dalla 0.32.0; e04 o2 69/0 e 40/0; guida passo 5 intera a 4 misure; 237/237 test. **Non regredite** |
| Rilievi aperti del C-032 | C32-01 **18 Tab** (uguale); C32-02 e17 `me_lo_dovete` **24 verso / 16 via** (360, 412), 23/16 (1366) (uguale); C32-04 **tenuto** (D-108; la motivazione regge: e08 casuale 63,8 % → 55,6 % senza condizione); C32-06 **11/21** scene a 0 px (0.31.0: 12/21) |
| Bot, 1000 semi | **0 blocchi** in 156/156 righe; «chiamate mai comparse» `[]` in 36/36; righe di blocchi ed esiti **identiche** alla 0.31.0 |
| Test e tipi | `npx vitest run` **44/44 file, 237/237**; `npx tsc --noEmit -p .` uscita 0 |
| Salvataggi veri | 12/12 della 0.31.0 (metà ondata 1) e 12/12 della 0.28.0 ripresi sulla stessa chiamata; **2/2 della 0.31.0 dentro l'ondata 4** di e08 ed e30 (testi cambiati), ripresi sulla stessa chiamata; 0 errori |
| Console | **0 errori** in tutte le corse con browser |
| Schermate con asset veri | 360, 375, 412, 1366: 1916 ciascuna, 0 scorrimenti orizzontali, 0 tagli, 0 nomi vecchi, 0 errori; urgenti 211/422, 0 diversi dall'atteso; tocchi coperti 1 (e06, C33-03), 142 («?», C30-04), 1 (C27-07), 142 («?», C30-04) |

# 1. Novità della 0.32.0

## 1.1 D-136 / C28-14: pastiglie e nomi

**FATTO (codice).** Due posti in più per le unità (`src/resa/mappa/etichette.ts:16`, `stile.css:119-120`); se il posto migliore costa ancora, il nome si stringe a 80 % e 60 % di `--nome-max` (`etichette.ts:102-118`); il centro di una pastiglia non può stare sotto il tocco di un'altra (`:84`). Rosso C94N01: posti e larghezze di prima. Il costo e il guardiano misurano il nome con `getBoundingClientRect()` del riquadro (`etichette.ts:51`; `tools/foto-schieramenti.mjs:50-71`). Il guardiano gira solo a 360×760 (`tools/foto-schieramenti.mjs:110`), col tetto 0 (`:84`, `:124`).

**FATTO MISURATO.** `node coordination/sonde/c33-pastiglie.mjs <radice> <uscita.json> [foto]` (copia di `c29-pastiglie.mjs`: stati del bot attento all'inizio di ogni ondata, unità nella bozza, 142 ondate × 360×760, 375×667, 412×915; più posti, nomi stretti, testo vero del nome con un `Range`, tocchi). 3 giri sulla 0.32.0, 2 col rosso, 2 sulla 0.31.0; 0 errori in tutti.

| misura | 0.31.0 (2 giri) | rosso C94N01 (2 giri) | **0.32.0** (3 giri) |
|---|---|---|---|
| ondate con il riquadro di un nome sotto una pastiglia, 360 / 375 / 412 | 7 / 3 / 0 | 7 e 8 / 3 / 0 | **0 / 0 / 0** |
| ondate con il centro di una pastiglia sotto un altro tocco (360) | 1 (e31 o2) | 1 (e31 o2) | **0** |
| tocchi di settori diversi sovrapposti (aree > 1 px², 360 / 375 / 412) | 8 / 7 / 0 | 8 / 7 / 0 | 4 / 3 / 0 |
| pastiglie sopra il disco di un altro settore (360 / 375 / 412) | 11 / 7 / 1 | 11 / 7 / 1 | 7 / 4 / 1 |
| nomi stretti (ondate) 360 / 375 / 412 | 0 | 0 | 45 / 37 / 2 |
| **testo del nome fuori dal suo riquadro** (ondate) 360 / 375 / 412 | 0 | 0 | **10 / 5 / 0**, fino a 13,1 e 14,6 px |
| testo fuori dal riquadro sopra una pastiglia o un altro nome | 0 | 0 | **e13 o2 (360), e35 o2 (375)** |
| gruppi di pastiglie più vicini al disco di un altro settore che al proprio (360 / 375 / 412) | 36 / 29 / 9 | 38 / 28 / 9 | 44 / 32 / 14 |

Uscite `uscite-c33/pastiglie-*.log`. I nomi su più righe arrivano a 3 righe (anche prima). Posti nuovi usati a 360: `destra-basso` 14 gruppi, `sinistra-basso` 10 (giro 2).

- **Il testo esce dal riquadro.** Con 60 % di `--nome-max` una parola sola può essere più larga del riquadro: «Parcheggi» (e13 o1/o2/o4, e26 o4), «Tornelli» (e14 o3/o4), «Viale della stazione» (e07 o1), «Piazzale dello stadio» (e10, e17, e22 o4), «Vie del quartiere» (e30 o3), «Curva Skyfield» (e03 o3, 375), «Perimetro della banca» (e35 o2, 375). Le lettere che escono restano gialle sulla mappa, senza il fondo nero (foto `docs/foto/c33/pastiglie/pastiglie-360-e14-o3.jpg`: la «I» finale di TORNELLI; `…-e13-o1.jpg`: «GI» di PARCHEGGI). In due casi il testo che esce finisce sopra altro: **e13 o2 a 360** la «I» di PARCHEGGI sotto la pastiglia «1» di Piazza del concerto, 43 px² (foto `pastiglie-360-e13-o2.jpg`: si legge «PARCHEGG'»); **e35 o2 a 375** «PERIMETRO» tocca il riquadro di «Banchine del porto» (foto `pastiglie-375-e35-o2.jpg`). Uguale in 2/2 giri con la misura del testo (nel primo giro, senza quella misura, gli stessi 10 nomi risultano già con `scrollWidth > clientWidth`).
- Col rosso C94N01 e nella 0.31.0: 0 testi fuori dal riquadro (il riquadro non si stringe mai).
- IPOTESI sulla causa: il costo vede un riquadro più stretto del testo e quindi meno sovrapposizioni; «Parcheggi» stretto a 60 % resta su 1 riga, cioè la larghezza nuova non porta il testo a capo e restringe solo il riquadro. Non ho provato una correzione.
- e31 ondata 2: il caso nato durante lo sviluppo (centro sotto un altro tocco) non c'è più. Foto `pastiglie-360-e31-o2.jpg` contro `pastiglie-360-rosso-e31-o2.jpg`: le pastiglie del Piazzale ora stanno sotto, accanto al disco del Viale della stazione (vedi C33-05).
- **Non determinismo (anche prima):** due giri verdi identici danno disposizioni diverse in 2/426 ondate (375 e14 o4, e16 o2); il rosso dà 7 in un giro e 8 nell'altro (in più e14 o2 «2» × Curva Skyfield 252 px²); fra rosso e 0.31.0 cambia 1/426 ondate. → C33-04.

## 1.2 Posti nuovi nel gioco vero: e06 a 360 (regressione)

**FATTO MISURATO.** `W=… H=… FOTO=1 node coordination/sonde/c29-schermate.mjs . <foto> <uscita>` (36 episodi giocati dall'interfaccia col piano del bot attento, seme 1; le unità si mettono una alla volta): a 360 **1 tocco coperto** su 1916 schermate: e06 `schieramento-1`, «BUTTON.tocco-pastiglia[ritira Mediatore da Piazza del concerto] coperto da BUTTON.settore-punto». Nel C-032 sulla 0.29.0 e sulla 0.31.0 a 360: 0.

Solo e06 a 360 (`EP=e06`): 0.32.0 **1 e 1** (2 giri), rosso C94N01 **0**, 0.31.0 **0** (`uscite-c33/e06-*.log`). Foto `docs/foto/c33/e06/360x760-e06-schieramento-1.jpg` (corsa con `FONDO=1`): la pastiglia 🤝 del mediatore sta sotto il disco del Piazzale dello stadio e il numero non si vede.

Il guardiano non lo vede: carica tutte le unità insieme dalla bozza. Con la bozza (`c33-pastiglie.mjs`) e06 o1 dà 0 tocchi coperti in 3/3 giri. IPOTESI: la disposizione dipende dalla strada fatta (le unità messe una alla volta lasciano `data-nome`, `data-unita` e `maxWidth` del passo prima, e la ricerca parte da lì: `etichette.ts:104-118`). → C33-03.

## 1.3 C31-02: corteo di e30

**FATTO (codice).** Con la meta e lo stadio disegnato il viale parte dal bordo dello stadio (`src/resa/mappa/sfondo.ts:131-132`); su quel viale il corteo è sempre `entra`, cioè cammina verso la meta, in ogni ondata (`src/resa/mappa/StratoPixi.tsx:81`), e la chiamata non esce mai (`:168`). Il verso scritto nei dati non conta più su quel viale: e30 o4 ha `"verso": "dallo_stadio"` (`data/missioni/e30.json:612`), che altrove vale `esce` (`src/resa/mappa/folla.ts:40`).

**FATTO MISURATO.** `W=360 EP=e01,…,e36 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs . <foto> <uscita>` (238 misure, 0 errori), riassunto `node coordination/sonde/c33-pixel-riassunto.mjs <log> e30` (numeri = si avvicinano / si allontanano):

| e30 | 0.31.0 (C-032, `v031/pixel-tutti-031.log`) | rosso C95S01 | **0.32.0** |
|---|---|---|---|
| o2 ondata, dallo stadio | 56/13 | 58/11 | **0/69** |
| o2 ondata, verso il municipio | 69/0 | 69/0 | **62/7** |
| o2 chiamata `silenzio_totale`, stadio / municipio | 31/8, 39/0 | 31/8, 39/0 | **0/40, 37/3** |
| o3 ondata, stadio / municipio | 60/10, 70/0 | 58/11, 69/0 | **0/69, 63/6** |
| o3 chiamata `saluto_larkspire` | 32/8, 40/0 | 30/10, 40/0 | **0/40, 37/3** |
| o4 ondata (`data-folla`) | `esce`: 11/58, **0/69** | `esce`: 12/57, 0/69 | `entra`: 0/69, **63/6** |
| o4 chiamata `fiaccolata` | 20/20, **0/40** | 18/21, 0/39 | 0/39, **36/3** |

- A 412×915 e 1366×768 (`pixel-e17-e30-*.log`): stessi versi (o2–o4 ondata 0/69 dallo stadio, 61–63/6–8 verso il municipio).
- Su tutti i 36 episodi (`node coordination/sonde/c32-pixel-confronto.mjs <0.31.0> <0.32.0>`, `pixel-confronto-031-032.log`; la sonda chiama «0.28.0» e «0.29.0» le due colonne): 229 cortei abbinati, cambiano classe rispetto allo stadio solo quelli di e30 (8) ed e17 o2 `ci_vediamo_dopo` (26/13 → 25/14, al limite di 2/3: rumore). Nessun altro episodio ha una strada con meta e stadio.
- Guardiano: `tests/viale.test.ts:37-50` controlla il viale di e30 (si allontana dallo stadio, `versoMeta`), non l'ondata; il rosso dentro (`__NO_C95S01`) è verde in 237/237.
- **e30 ondata 4.** Testi: `e30.ondata4.i` «È sera, dopo il corteo al municipio»; `e30.ch.fiaccolata` «dopo il municipio, fiaccolata fino al porto». Il C-031 aveva giudicato la 0.31.0 coerente su o4 («via dal municipio 0/69»). Nella 0.32.0 la fiaccolata cammina verso il municipio, cioè verso il posto da cui il testo dice che è appena partita. Anche col salvataggio vero della 0.31.0 dentro l'ondata 4 (§ 4): `data-folla` `strada_cinderwick>esce` nella 0.31.0, `>entra` nella 0.32.0, stessa chiamata. → C33-02.

## 1.4 C32-03 e C32-05: e07 ed e08

**FATTO (dati).** `fonte: ufficio_sicurezza_larkspire` in e07 `immagine_club`, `ufficio_sicurezza_cinderwick` in e08 `consiglio_presidente` (`git diff 8eb495e c15c617 -- data/missioni`); `e08.ch.risultato` «Due a due ai supplementari, rigori al Kiln. Il Fabbro: il ritorno passerà “dove passa sempre”.» (98 caratteri), `e08.ch.risultato.vice` «Rigori. Meno male che stavolta non ho scommesso. Quella grande la sto perdendo: sei ancora qui.» (`data/testi/it/e08.json:106-107`).

**FATTO MISURATO.**
- A schermo: `W=360 H=760 EP=e07,e08 FOTO= FOTOCH=immagine_club,consiglio_presidente,risultato VAR=presidente_incontrato=true node coordination/sonde/c32-grandi-var.mjs . docs/foto/c33/club <uscita>`, e a 412×915: 107 schermate per misura, 0 errori, 0 tagli, 0 scorrimenti, 0 comandi coperti. Foto `club/360x760-e07-chiamata-immagine_club.jpg` («UFFICIO SICUREZZA DELLO SKYFIELD ATHLETIC»), `…-e08-chiamata-consiglio_presidente.jpg` («GIANNI LAVEZZARI, SICUREZZA DEL KILN UNITED»), `…-e08-chiamata-risultato.jpg` (testo intero).
- Braccio rosso del guardiano: in un worktree a parte rimessa `fonte: "vice"` in e07 ed e08 → `npx vitest run tests/voci-club.test.ts` **2 falliti su 2**; dati veri ripristinati (`git checkout data`) → 2/2 verdi (`rosso-voci-club.log`).

**Coerenza (FATTO dati; GIUDIZIO dove marcato).**
- Supplementari come e03 (`e03.ondata3` «I supplementari») ed e26; prima dei rigori nessun testo di e08 dice «novantesimo» o «fischio finale» (`grep -n -i "fischio\|novant\|supplement\|rigor" data/testi/it/e08.json`). `e08.verbale_contenuto` «Partita finita» resta coerente.
- La scommessa: `e08.intro2` «Stavolta non scommetto: guardo.» → «Meno male che stavolta non ho scommesso». Coerente. GIUDIZIO: «Quella grande» ora si regge sul verbo («ho scommesso») e non su un nome («la scommessa»); si capisce, ma è meno netto di prima.
- Registro: Lavezzari dà del «lei» in e01 (`e01.ch.lavezzari`), e30 (`lettera_curva`), e32 (`portavoce`) ed e08 («le presto»): coerente. L'unico «te» è `e21.ch.striscione_sgombero` «i vecchi chiedono di te», preesistente (non toccato dalla 0.32.0). La sicurezza dello Skyfield «Vi prestiamo» parla al comando: coerente.
- GIUDIZIO: «Lavezzari, sicurezza del Kiln: …» sotto il mittente «Gianni Lavezzari, sicurezza del Kiln United» ripete il nome, come lo stile radio di e16, e19, e20 («Lavezzari: …»). Si legge bene.

# 2. Novità della 0.30.0 e 0.31.0: conferma

- `git diff --stat 8eb495e c15c617 -- data/testi/it/comune.json data/testi/it/e35.json tests/meta-fase.test.ts tests/urgente.test.ts src/resa/schermate src/resa/App.tsx`: **vuoto**.
- C31-01, C31-03: test e testo invariati; `tests/meta-fase.test.ts` verde (237/237).
- C29-02: e04 o2 `coro_fonderie` ondata **69/0**, chiamata **40/0** verso lo stadio (`pixel-e17-e04-riassunto.txt`), come nella 0.31.0.
- C29-04: `node coordination/sonde/c32-guida.mjs . <foto>`: guida passo 5/6 intera con «Urgente!», 0 tagli, 0 scorrimenti, pulsanti dentro, a 360×760, 375×667, 412×915, 1366×768; 0 errori (`guida.log`). Urgenti a schermo 211/422 a 360, 375, 412, 0 diversi dall'atteso (`c29-urgenza-analisi.mjs`).

# 3. Rilievi aperti del C-032, rimisurati sulla 0.32.0

| rilievo | stato | misura C-033 | C-032 |
|---|---|---|---|
| **C32-01** Tab dopo il fuoco recuperato | **aperto, uguale** | `W=1366 H=768 node coordination/sonde/c32-fuoco.mjs .`: «conferma-passo» a **18 Tab**; fuoco mai sul `body` oltre 150 ms dopo «Conferma» e «continua» (`fuoco-1366.log`). `src/resa/schermate` non è cambiata | 18 |
| **C32-02** e17 e altezza della tela | **aperto, uguale** | `me_lo_dovete` **24 verso / 16 via** (360), 24/16 (412), 23/16 (1366); o1 ondata 48/21 «entra», o4 21/48 «esce». Uguale alle tre misure: con la tela quadrata il verso non cambia più con la finestra | 0.31.0: 25/15 |
| **C32-04** condizione `presidente_incontrato` | **tenuta per decisione** (D-108, nota in `tests/voci-club.test.ts:1-4`) | condizione ancora in `e07.json:608`, `e08.json:484`. Motivazione verificata: nel worktree a parte, tolta la `se` di e08 `consiglio_presidente`, `node tools/bot.mjs 1000`: e08 casuale degenerato **638 → 556 / 1000** (63,8 % → 55,6 %), e07 622 (`bot-1000-e08-senza-condizione.log`); dati ripristinati. GIUDIZIO: la misura regge la scelta; resta il legame narrativo debole fra Lavezzari e il presidente dello Skyfield | — |
| **C32-06** versione sui pulsanti (tablet/PC) | **aperto, uguale** | `node coordination/sonde/c32-versione-pulsanti.mjs <radice>`: a 0 px da un comando in **11/21** scene (0.31.0 nelle stesse condizioni: **12/21**; 0.29.0: 10/21). Le differenze sono di 1–3 px: la scritta «v0.32.0» è 3 px più alta di «v0.31.0» | 10/21 |
| C30-04 «?» coperto a 375×667 e 1366×768 | **aperto**: deciso in D-139, non ancora nel codice | 142/1916 a 375 e a 1366 («BUTTON.aiuto coperto da BUTTON.pulsante»); vignetta della sala a 1366 5/36 (D-139: resta così) | 142; 5/36 |
| C27-07 e01 `presidente` a 412 | aperto, uguale | 1 opzione coperta («manda_vice») | 1 |

# 4. Regressioni (FATTO MISURATO)

- **Bot:** `node tools/bot.mjs 1000` (`bot-1000.log`): 156/156 righe con **blocchi 0/1000**; «chiamate mai comparse» `[]` 36/36. `diff` delle righe di blocchi ed esiti con la 0.31.0 (`uscite-c32/v031/bot-1000.log` sul ramo del C-032): **vuoto**.
- **Test e tipi:** `npx vitest run` → «Test Files 44 passed (44) · Tests 237 passed (237)» (0.31.0: 43, 233; in più `voci-club` 2 e `viale` 2); `npx tsc --noEmit -p .` uscita 0.
- **Console:** 0 errori di pagina e di console in tutte le corse (schermate 4 × 1916, pastiglie 7 giri, pixel 4, club 2, fuoco, versione 2, salvataggi 2, guida, e06 6).
- **Schermate con asset veri:** `W=… H=… FOTO=1 node coordination/sonde/c29-schermate.mjs . <foto> <uscita>`, 36 episodi, piano del bot attento, seme 1:

| misura | schermate | scorr. orizz. | tagli | nomi vecchi | tocchi coperti | errori | tipi di sovrapposizione nuovi (`c32-confronta-grandi.mjs`) |
|---|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | **1** (e06, C33-03) | 0 | contro la 0.31.0: spariti «settore-nome × pastiglia» (46) e «pastiglia × pastiglia» (8); nuovo «chi-nome × P.» 2 (2,6 px, «Intanto…» durante l'entrata del messaggio; IPOTESI: tempi, `Ondata.tsx` non è cambiato) |
| 375×667 | 1916 | 0 | 0 | 0 | 142 («?», C30-04) | 0 | contro la 0.29.0: sparito «settore-nome × pastiglia» (16); nessuno nuovo |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (C27-07) | 0 | nessuno sparito, nessuno nuovo |
| 1366×768 | 1916 | 0 | 0 | 0 | 142 («?», C30-04) | 0 | nuovo 1 + 1 di «chi-nome × P.», stessa famiglia di «Intanto…» sotto «Avanti» già presente; vignetta della sala 5/36, verbale 36/36 |

- **Salvataggi veri:**
  - `EP=e01,e04,e07,e08,e09,e13,e17,e19,e21,e25,e30,e31 VA=0.31.0 VECCHI_DIR=coordination/sonde/salvataggi-028 node coordination/sonde/c32-salvataggi.mjs <0.31.0> . coordination/sonde/salvataggi-031 <uscita>`: **12/12** esportati col pulsante dalla 0.31.0 a metà della prima ondata, importati nella 0.32.0 e ripresi sulla stessa chiamata; **12/12** veri della 0.28.0 ripresi; 0 errori (`salvataggi.log`; la sonda chiama «0.19.0»/«0.20.0» le due build).
  - Dentro l'ondata 4, dove la 0.32.0 cambia testi e verso: `node coordination/sonde/c33-salvataggi-o4.mjs <0.31.0> . coordination/sonde/salvataggi-031 <uscita>`: **2/2** (e08 `risultato` col testo nuovo, e30 `fiaccolata`), stessa chiamata, 0 errori (`salvataggi-o4.log`). **Misura ritirata:** il primo giro dava 1/2 perché la sonda leggeva la scena della 0.31.0 a 1200 ms dal «Riprendi», ancora sul titolo (e08); riparata (attesa vera della chiamata, 15 s) e rifatta (`salvataggi-o4-giro1.log`).

# 5. Usabilità e realismo (GIUDIZIO, marcato)

- **Mappa al telefono (360–412):** è la novità più visibile: nessun numero sopra i nomi nelle 142 ondate. Il prezzo sono nomi stretti su 2–3 righe in 45 ondate a 360 (prima: 0) e alcune parole che escono dal riquadro nero (C33-01); i gruppi di pastiglie a volte finiscono più vicini al disco di un altro settore (C33-05). Nel complesso la mappa si legge meglio di prima, salvo e06 o1 (C33-03), e13 o2 ed e35 o2 (C33-01).
- **e30:** in o2 e o3 la fila arancione esce dal bordo dello stadio e va al municipio, come dicono i testi. In o4 chi ha letto «dopo il municipio, fiaccolata fino al porto» vede la fila tornare verso il municipio (C33-02).
- **e07/e08:** chi parla ora è chi offre gli steward; il risultato di e08 è chiaro anche per chi segue il calcio; il vice non si contraddice più.
- **Ordine pubblico e violenza:** le novità non aggiungono procedure o termini di polizia; nessuna violenza in campo (risultato e fiaccolata riferiti per radio). Niente da verificare su fonti esterne.
- **Tablet e PC:** invariati rispetto al C-032 (C32-01, C32-06, C30-04).

# Rilievi (per gravità)

## Alto

Nessuno.

## Medio

**C33-01: D-136 conta il riquadro del nome, non il testo: con la larghezza al 60 % il testo esce dal riquadro, e in e13 o2 (360) ed e35 o2 (375) finisce sotto una pastiglia o su un altro nome. Il guardiano non lo vede.**
- Misura (§ 1.1): testo fuori dal riquadro in 10/142 ondate a 360 e 5/142 a 375 (fino a 13,1 e 14,6 px), 0 a 412; 0 nella 0.31.0 e col rosso C94N01. Sopra altro: e13 o2 a 360, «I» di PARCHEGGI sotto la pastiglia «1» di Piazza del concerto (43 px²); e35 o2 a 375, PERIMETRO sul riquadro di «Banchine del porto». 2/2 giri con la misura del testo.
- Riproduzione: e13, ondata 2, 360×760, unità del bot attento (o `node coordination/sonde/c33-pastiglie.mjs . out.json docs/foto/x`); foto `docs/foto/c33/pastiglie/pastiglie-360-e13-o2.jpg`.
- Causa (FATTO codice): `nomeDi` usa il riquadro (`etichette.ts:51`), `maxWidth` fino al 60 % (`:105`) senza a capo dentro la parola; il guardiano usa lo stesso riquadro (`tools/foto-schieramenti.mjs:50-71`) e gira solo a 360 (`:110`). IPOTESI: il costo preferisce il riquadro stretto proprio perché copre meno.
- Il braccio rosso C94N01 mostra il difetto vecchio (7–8 a 360): il guardiano non è cieco al C27-06, ma lo è a questo.

**C33-02: e30 ondata 4: la fiaccolata «dopo il municipio, fino al porto» ora cammina verso il municipio (0.31.0: se ne allontanava).**
- Misura (§ 1.3): ondata o4 verso il municipio **63/6** (0.31.0 e rosso C95S01: 0/69); chiamata `fiaccolata` 36/3 (0.31.0: 0/40); `data-folla` `entra` invece di `esce` anche ripartendo da un salvataggio vero della 0.31.0. Rispetto allo stadio il verso resta «via» (0/69).
- Causa (FATTO codice): `StratoPixi.tsx:81` mette `entra` a ogni corteo del viale con la meta, in tutte le ondate; il verso scritto nei dati (`"dallo_stadio"`, `e30.json:612`) non conta più lì.
- Il C-031 aveva giudicato o4 coerente. C31-02 chiedeva solo o2. Nessun guardiano lega il verso di o4 ai testi.
- GIUDIZIO: i testi di o4 non sono netti («fino al porto», che non è sulla mappa; `e30.op.fiaccolata_libera.r` «Partono di nuovo dal piazzale»), ma nessuno dice «verso il municipio».

**C33-03: e06, schieramento dell'ondata 1, 360×760: il tocco della pastiglia del mediatore di Piazza del concerto finisce sotto il disco del Piazzale (regressione della 0.32.0, caso storico di C26-11).**
- Misura (§ 1.2): 1/1916 schermate a 360 nella corsa completa; da solo 2/2 giri; rosso C94N01 0; 0.31.0 0. Foto `docs/foto/c33/e06/360x760-e06-schieramento-1.jpg`: la pastiglia 🤝 è sotto il disco e il numero non si vede.
- Il guardiano C26-11 (`mappaSchieramento`, «pastiglie col centro coperto») passa: con le unità dalla bozza e06 o1 dà 0 in 3/3 giri. Il caso nasce solo mettendo le unità una alla volta, come fa chi gioca. IPOTESI: la ricerca dei posti parte dagli attributi lasciati dal passo prima.

## Basso

**C33-04: la disposizione delle etichette non è deterministica: lo stesso stato dà posti diversi in 1–2 ondate su 426.**
- Misura (§ 1.1): due giri verdi diversi in 2/426 (375 e14 o4, e16 o2); rosso 7 in un giro e 8 nell'altro (e14 o2 in più); fra rosso e 0.31.0 1/426. Preesistente (succede anche col codice di prima).
- Effetto: un guardiano a tetto 0 può diventare rosso a caso (secondo `CLAUDE.md`: rosso che passa al nuovo tentativo = instabile, si ripara lo strumento). Nei 3 giri verdi le pastiglie sopra i nomi sono sempre 0. Causa non cercata: non posso confermarla.

**C33-05: con i posti nuovi alcune pastiglie stanno più vicine al disco di un altro settore che al proprio.**
- Misura (§ 1.1): gruppi più vicini a un disco altrui 44 a 360 (0.31.0: 36, rosso 38), 32 a 375 (29, 28), 14 a 412 (9, 9). Esempio e31 o2: le pastiglie del Piazzale a 70 px dal proprio disco e a 43 px da quello del Viale della stazione (foto `pastiglie-360-e31-o2.jpg` contro `…-rosso-e31-o2.jpg`).
- GIUDIZIO: la misura (distanza dei centri) è grezza; il tocco ritira comunque l'unità giusta. Si nota quando si cerca a chi appartiene un numero.

# Verificati e chiusi

| rilievo / novità | misura |
|---|---|
| **C28-14 / D-136** pastiglie sopra i nomi | riquadri 0/142 a 360, 375, 412 in 3/3 giri; rosso C94N01 7–8 / 3 / 0; schermate giocate senza «nome × pastiglia» a 360 e 375. Residui C33-01, C33-03, C33-05 |
| e31 o2 tocco sotto un altro tocco | 0 (rosso e 0.31.0: 1) |
| **C31-02** e30 o2–o3 dallo stadio | 0/69 ondate, 0/40 chiamate, verso il municipio 62–64/69; uguale a 412 e 1366; rosso C95S01 57–58/11–12. Residuo C33-02 su o4 |
| **C32-03** mittenti in e07/e08 | sicurezza dei club a schermo; `tests/voci-club.test.ts` rosso 2/2 |
| **C32-05** supplementari e scommessa | testi coerenti con e03, e26 ed `e08.intro2`; salvataggio vero della 0.31.0 in e08 o4 ripreso col testo nuovo |
| 0.30.0 / 0.31.0 | nessun file toccato; e04 69/0 e 40/0; guida intera a 4 misure; 237/237 |
| Regressioni | bot uguale alla 0.31.0 (0 blocchi, 1000 semi); 237/237; tipi 0; salvataggi 12 + 12 + 2; 0 errori di console; schermate a 4 misure senza scorrimenti, tagli o nomi vecchi |

# Note di metodo e limiti

- **Misure ritirate:** salvataggi in ondata 4, primo giro 1/2 (difetto della sonda, § 4).
- **Rumore:** i segni ▲▼ e «Intanto…» dipendono dai tempi delle animazioni; li conto come tipi di coppia, non come difetti. Le corse grandi sono girate con 2–4 browser insieme.
- **Non misurato:** telefoni, tablet e PC veri; WebView dell'APK; lettori di schermo; tastiera e mouse oltre `c32-fuoco` e la versione (la 0.32.0 non tocca `src/resa/schermate` né le regole di fuoco di `stile.css`, ma non l'ho rimisurato con `c28-tastiera` e `c32-mouse`: non posso confermarlo con una misura); il guardiano completo nella catena (`node tools/catena.mjs`) non l'ho eseguito: ho usato le stesse funzioni (`mappaSchieramento`, `partenzeAttente`) nelle mie sonde.
- **Bracci rossi sui dati** (voci-club, condizione di e08) fatti in un worktree separato e annullati con `git checkout data`; nessun file del gioco cambiato sul ramo.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c33-pastiglie.mjs` | come `c29-pastiglie.mjs`, più posti delle unità, nomi stretti e righe, testo vero del nome fuori dal riquadro e sopra pastiglie o nomi, tocchi sovrapposti o col centro sotto un altro tocco, pastiglie sui dischi altrui, gruppi più vicini a un disco altrui | `[ROSSI=C94N01] [MISURE=360x760,…] node coordination/sonde/c33-pastiglie.mjs <radice> <uscita.json> [foto]` |
| `c33-pixel-riassunto.mjs` | da un log di `c27-pixel.mjs`: per scena, avvicinano/allontanano rispetto allo stadio e al riferimento, ondata e chiamata | `node coordination/sonde/c33-pixel-riassunto.mjs <log> [episodi]` |
| `c33-salvataggi-o4.mjs` | salvataggio vero della build A all'inizio dell'ondata N (schieramento fatto), esportato col pulsante e ripreso nella build B: chiamata, testo, `data-folla` | `[EP=e08,e30] [ONDATA=4] node coordination/sonde/c33-salvataggi-o4.mjs <radice A> <radice B> <cartella> <uscita.json>` |
