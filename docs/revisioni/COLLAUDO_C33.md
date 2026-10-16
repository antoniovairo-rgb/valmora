# Collaudo C-033: 0.32.0 (pastiglie a tetto 0 D-136, corteo di e30 C31-02, voci dei club C32-03, coppa di e08 C32-05), 0.33.0 (espressioni PO-059) e partita da giocatore (PO-120)

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
| **0.33.0** `data-tono` contro la tensione (§ 6) | 0 diversi su 2840 rapporti (4 strategie, 4 misure); un'espressione diversa per tono; rosso C96P01 568/568 senza vignetta. Ma la vignetta di fine ondata è **nascosta in tutti i rapporti** a 360, 375, 412, 768, 1024, 1366 (visibile solo a 1920×1080, 56–77 px) → **C33-06 (alta)**; tono «calmo» accanto a «SCOPERTO» nel 26 % dei rapporti con un settore scoperto → C33-07; 1920×1080 pagina +12 px → C33-08 |
| 0.33.0 regressioni | 240/240 test, tipi 0, bot identico alla 0.32.0, salvataggi veri della 0.32.0 2/2 + 5/5 (sul rapporto), schermate 360/375/412 senza tipi nuovi, verbale invariato (36/36, 0/36, 36/36), nessun tremolio (C29-01) |
| **Partita da giocatore** (§ 7) | 6 episodi interi a 360 (e01, e07, e08, e17, e30, e35), 692 tocchi, 0 errori; e17 ed e35 sbagliati apposta: falliti e raccontati bene; rilievi C33-09 (stelle «giallo: giallo», media), C33-10…C33-16 (bassi) |

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

# 6. La 0.33.0 (PO-059, D-133): espressioni dalla tensione (aggiunta su richiesta della principale)

- **Build:** main a 57229a4 (rilascio c42b155), GAME_VERSION 0.33.0 (`src/versione.ts:233`, commento `:226-232`); worktree separato, `npm ci` e `npx vite build` verdi.
- **Cosa cambia** (`git diff --stat c15c617 57229a4 -- src data schema tools tests`): 8 file, +109/−17: `src/resa/espressioni.ts` (nuovo), `schermate/Rapporto.tsx`, `vignetta.tsx`, `vignette-gioco.tsx`, `versione.ts`, `tests/espressioni.test.ts` (nuovo), `tools/foto-c22.mjs` (`controllaVignettaOndata`), `tools/foto.mjs`. Nessun dato, nessun file di `src/logica`.
- Uscite in `coordination/sonde/uscite-c33/v033/`, foto in `docs/foto/c33/v033/`.

**FATTO (codice).** Tono del rapporto dal livello più alto della tensione **a fine ondata** (`src/resa/espressioni.ts:12`, `Rapporto.tsx:18`): ≤1 calmo, 2-3 teso, ≥4 critico. Espressioni: calmo bocche in su; teso tu bocca dritta e sopracciglia giù, il vice sorride; critico tutti e due giù, tu con la mano alla nuca (`espressioni.ts:14-18`). Verbale: bene braccia alzate tutti e due, medio sollievo, male mano alla nuca, fallita tutti e due giù (`:19-24`). La vignetta del rapporto è «nascondibile» come quelle di sala e verbale (`vignetta.tsx:55`, regola D-126 d in `useRiempi`, `:10-45`). Il guardiano `controllaVignettaOndata` (`tools/foto-c22.mjs`) accetta la vignetta nascosta e controlla solo `data-tono`.

## 6.1 `data-tono` contro la tensione vera

**FATTO MISURATO.** `N=200 NUI=2 W=360 node coordination/sonde/c33-toni.mjs <0.33.0> <uscita> <foto>` (parte A: motore, 4 strategie × semi 1…200 × 36 episodi; parte B: interfaccia, 4 strategie × semi 1…2, ogni rapporto ripreso da un salvataggio con `rapporto_aperto`, genere alternato m/f); a 375, 412, 1366 con `N=1 NUI=1`.

| misura | 360×760 | 375×667 | 412×915 | 1366×768 |
|---|---|---|---|---|
| rapporti aperti | 1136/1136 | 568/568 | 568/568 | 568/568 |
| `data-tono` ≠ tono ricalcolato dal motore | **0** | **0** | **0** | **0** |
| vignetta ≠ `ondata-<tono>` | 0 | 0 | 0 | 0 |
| **vignetta nascosta** | **1136/1136** | **568/568** | **568/568** | **568/568** |
| errori di console | 0 | 0 | 0 | 0 |

- Espressioni lette nell'SVG (anche se nascosto): calmo bocche su/su; teso dritta+sopracciglia giù / su; critico giù+giù+nuca / giù+giù. **Un'espressione diversa per ogni tono**, uguale per uomo e donna (cambiano solo i capelli: `vignette-gioco.tsx`, `capelli={p.genere === 'f' ? 'lunghi' : 'corti'}`).
- Rosso C96P01 (`ROSSI=C96P01 N=1 NUI=1`): 568/568 rapporti senza vignetta, 0 errori.
- Distribuzione dei toni (motore, 113 600 fini d'ondata): calmo 58 290, teso 25 147, critico 30 163; il bot attento quasi sempre calmo (27 000/28 400), il peggiore quasi sempre critico (23 800/28 400).

## 6.2 Si vede? Vignetta nascosta a ogni finestra salvo 1920×1080

**FATTO MISURATO.** `node coordination/sonde/c33-rapporto-tremolio.mjs <0.33.0>` (rapporto dell'ondata 1 di e01, e13, e30; 120 fotogrammi letti per finestra):

| finestra | vignetta | altezza | pagina | valori diversi dal frame 60 |
|---|---|---|---|---|
| 360×760, 375×667, 412×915 | **nascosta** 9/9 | 0 | 944–1021 px | 1 |
| 768×1024, 1024×768, 1366×768 | **nascosta** 9/9 | 0 | 1007–1028 px | 1 |
| 1920×1080 | visibile 3/3 | **56–77 px** | **1092 px** (finestra 1080) | 1 |
| 1920×1080, 0.32.0 e rosso C96P01 | — | — | 1080 px | 1 |

- Nessun tremolio (C29-01 non regredisce: un solo stato dal frame 60, 0 passaggi nascosta↔visibile).
- A 1920×1080 la vignetta c'è, ma alta 56–77 px: le facce non si leggono (foto `docs/foto/c33/v033/rapporto/rapporto-1920x1080-e01.jpg`). E la pagina diventa più alta della finestra di 12 px (0.32.0 e rosso: 1080 = finestra).
- Anche giocando dall'interfaccia (§ 7) la vignetta del rapporto è nascosta in **23/23** rapporti a 360×760.
- La sviluppatrice lo scrive nel suo rapporto (`coordination/handoffs/sviluppatrice/PO-059-rapporto.md`): «Quanti rapporti mostrano la vignetta e quanti la nascondono per spazio non l'ho contato». Le foto `po059/dopo-*` sono le vignette disegnate da sole, non schermate del gioco.
- → **C33-06** (alta).

## 6.3 Realismo: il tono rispetto a com'è andata l'ondata

**FATTO MISURATO** (parte A, 113 600 fini d'ondata, conteggi in `toni-360.log`):
- Settore **degenerato** (fiducia −1 nel rapporto): tono critico **29 688/29 688**. Coerente.
- Settore **scoperto** ma non degenerato (nel rapporto la riga «SCOPERTO» in rosso): calmo **19 090**, teso 24 834, critico 30 131. In un quarto dei casi il titolo della vignetta sarebbe «Fine ondata: serata sotto controllo» con protagonista e vice sorridenti accanto a un settore rosso «SCOPERTO» (esempio: e02 o3, casuale seme 1; nella mia partita e01 o1 ed e07 o1, § 7).
- Picco critico durante l'ondata (livello ≥ 4) ma tensione finale bassa: tono teso 2 042, calmo 0. Il tono legge solo la fine (decisione del PO, `espressioni.ts:1-3`), il rapporto dice «salita, poi calmata».
- Premio di fiducia (+1, nessun settore scoperto) col tono critico: 32 casi (e05 o4, casuale seme 20: curva ospiti a livello 4, coperta).
- GIUDIZIO: critico ↔ degenerato regge; calmo ↔ scoperto no. → **C33-07** (media), da decidere insieme a C33-06.

## 6.4 Verbale: espressioni a schermo

- Nella mia partita a 360×760 (§ 7, giocatrice): `esito-bene` con le braccia alzate di tutti e due in e01 ed e30 (foto `giocatore/e01-verbale-intero.jpg`, `e30-verbale.jpg`); `esito-medio` in e07 ed e08; `esito-fallita` in e17 ed e35 (foto `e17-verbale.jpg`). Vignetta del verbale visibile 6/6.
- GIUDIZIO: la festa a braccia alzate e la mano alla nuca si leggono a 360. Le sopracciglia a DPR 1 sono piccole (lo dice anche la sviluppatrice). In e30 la festa coi coriandoli arriva dopo il corteo muto del giorno dopo l'arresto («IL GIORNO DOPO»): il tono «festa» è lo stesso per ogni episodio ben riuscito → **C33-12** (bassa).
- Schermate complete della 0.33.0 a 360, 375, 412: § 6.5.

## 6.5 Regressioni sulla 0.33.0

- `npx vitest run`: **45/45 file, 240/240** (in più `espressioni` 3); `npx tsc --noEmit -p .` uscita 0.
- `node tools/bot.mjs 1000`: 156/156 righe con 0 blocchi, «mai comparse» `[]` 36/36, righe **identiche** alla 0.32.0 (`v033/bot-1000.log`).
- Salvataggi veri della 0.32.0 nella 0.33.0 (`c33-salvataggi-o4.mjs`): e08 ed e30 dentro l'ondata 4 **2/2**; fermi sul rapporto dell'ondata 2 di e01, e08, e17, e30, e35 (`RAPPORTO=1`) **5/5**, ripresi sul rapporto con `data-tono` «calmo»; 0 errori. I file nella cartella `salvataggi-032/` sono stati rinominati da «0.31.0-…» a «0.32.0-…» (la sonda è partita senza `VA=0.32.0`; la build A era c15c617).
- Schermate complete con asset veri: `W=… H=… FOTO=1 node coordination/sonde/c29-schermate.mjs <0.33.0> <foto> <uscita>`, 36 episodi, bot attento, seme 1 (`v033/schermate-*.log`):

| misura | schermate | scorr. orizz. | tagli | nomi vecchi | tocchi coperti | errori | tipi di sovrapposizione nuovi contro la 0.32.0 | vignetta del verbale |
|---|---|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 1 (e06, C33-03) | 0 | nessuno | 36/36, altezze 115–185 px (0.32.0: 117–185) |
| 375×667 | 1916 | 0 | 0 | 0 | 142 («?», C30-04) | 0 | nessuno | 0/36 (D-126 d, come prima) |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (C27-07) | 0 | nessuno | 36/36, 200 px |

  Urgenti 211/422 a ogni misura, 0 diversi dall'atteso. Verbali coi toni «fallita» (bot peggiore, `STRAT=peggiore EP=e01,e08`) e «medio» (attento) a 360, 375, 412: `docs/foto/c33/v033/verbale/`. 0 errori.

# 7. Partita da giocatore (PO-120, aggiunta su richiesta della principale)

**Come ho giocato (FATTO).**
- Build 0.33.0 (57229a4), 360×760, col dito (`hasTouch`), DPR 1, asset veri.
- Strumento: `coordination/sonde/c33-giocatore.mjs` tiene aperto un browser e riceve un comando per ogni tocco. Ogni scelta l'ho decisa io dopo aver letto la schermata; nessuna è automatica.
- Giornale completo di ogni schermata e di ogni tocco in `uscite-c33/giocatore/giornale.jsonl` (1566 righe); foto in `docs/foto/c33/giocatore/` (146).
- Per decidere più in fretta ho letto in anticipo le chiamate dell'ondata dai dati (stesso testo che compare a schermo, script `coordination/sonde/c33-giocatore-aiuti/anteprima.mjs`). Lo schermo poi ha mostrato ogni chiamata e ogni risposta, e le ho lette lì.
- **Salvataggio continuo:** partita nuova dal titolo («la nuova responsabile», guida introduttiva intera), poi e01 giocato. **Limite:** per arrivare a e07, e17, e30 ed e35 senza giocare i 23 episodi in mezzo ho segnato a mano come conclusi (1 stella, variabili invariate) e02–e06, e09–e16, e18–e29, e31–e34 nel salvataggio vero (`c33-giocatore-aiuti/sblocca.sh`). Dopo il fallimento di e17 ho segnato e17 come superato e tolto la sconfitta in sospeso. Le variabili della storia vengono solo dai 6 episodi giocati. Per questo i testi che richiamano episodi saltati (per esempio «Il Fabbro è dentro» in e30) li ho letti senza aver visto la cattura.
- **Durata:** il gioco non mostra un orologio di gioco, quindi i minuti di gioco non posso misurarli. Conto tocchi, ondate e chiamate; l'ora del racconto la riporto quando i testi la dicono.
- Errori di console: **0** in 692 tocchi.

| episodio | come ho giocato | esito | stelle | tocchi | ondate / chiamate | ore del racconto |
|---|---|---|---|---|---|---|
| e01 Primo giorno, primo derby | bene | contenuto | 3 | 108 | 3 / 14 | pomeriggio–sera del derby |
| e07 La neopromossa | bene | contenuto a fatica | 1 | 110 | 4 / 13 | «sono le sette di sera» (o4) |
| e08 Il capo curva | bene | contenuto a fatica | 1 | 118 | 4 / 13 | partita, supplementari, rigori |
| e17 La partita a porte chiuse | **sbagliato apposta** | **degenerato fuori campo (fallito)** | 0 | 113 | 4 / 13 | fino alle undici di sera |
| e30 Il giorno dopo | bene | contenuto | 3 | 124 | 4 / 12 | dal raduno alla sera |
| e35 La notte lunga | **sbagliato apposta** | **degenerato fuori campo (fallito)** | 0 | 99 | 4 / 12 | dalle 19 all'alba (10–11 ore) |

(I tocchi comprendono la guida, la sala, il briefing, ogni unità messa sulla mappa, le risposte e le pagine del verbale. Nella tabella non conto la guida, che sta prima di e01.)

## 7.1 e01: Primo giorno, primo derby (giocato bene)

Foto: `e01-00-citta.jpg`, `e01-o1-schieramento.jpg`, `e01-o1-ch1.jpg`, `e01-o1-rapporto.jpg`, `e01-o1-rapporto-fondo.jpg`, `e01-verbale-intero.jpg`, `e01-verbale-p1…p4.jpg`.

- **FATTO:**
  - guida di 6 passi letta intera, 0 tagli;
  - quattro fonti nel briefing; chiamate 5 + 4 + 5;
  - in o1 l'informatore dice che il corteo è partito; poco dopo Lavezzari scrive «Nessun corteo, ripetiamo» e il vice commenta;
  - rapporti: o1 Strada da Skyfield «SCOPERTO» (l'avevo lasciata vuota apposta, perché la radio diceva «regolare»), o2 «nessun settore scoperto», o3 Piazzale e Strada da Kiln «SCOPERTO»;
  - verbale: 3 stelle, «CONTENUTO»; «Dove sei rimasto scoperto» elenca 3 settori; nelle fonti Lavezzari e le voci in rete risultano «FALSA».
- **IMPRESSIONE DA GIOCATORE:**
  - Si capisce subito cosa fare. La guida è breve, il briefing con l'affidabilità delle fonti è chiaro, e la bugia di Lavezzari si scopre sul momento: è un buon aggancio per la storia.
  - Il rapporto a 360 mostra 4 settori su 5. Il quinto, quello rosso «SCOPERTO», sta sotto «Prossima ondata» e si vede solo scorrendo (foto `e01-o1-rapporto.jpg` contro `…-fondo.jpg`). Chi ha fretta lo salta.
  - Tre stelle con tre settori scoperti e fiducia 5/10 mi sono sembrate generose. Però la guida dice «tensione bassa e fiducia alta: tre», e la regola è stata rispettata.
  - Nel verbale «Fallo rimuovere» (lo striscione) sta in «Cosa ti ha penalizzato» con «+1 fiducia»: per un attimo ho pensato a un errore. Il motivo è che ha alzato la tensione in curva → C33-16.
  - «Dove sei rimasto scoperto» al maschile, mentre ho scelto «la nuova responsabile» → C33-10.
  - Il finale si sente: il vice paga la scommessa («Doppio o niente sulla prossima»), chiude bene il primo giorno.
  - Testo, mappa e vignetta raccontano la stessa cosa. L'unica eccezione è la vignetta del rapporto, che non si vede mai (C33-06).

## 7.2 e07: La neopromossa (giocato bene)

Foto `e07-*`.

- **FATTO:**
  - in o1 compare `sconti_benvenuto`, perché in e01 avevo pagato l'informatore (`se: informatore_pagato`);
  - in o3 c'è l'offerta di steward firmata «Ufficio sicurezza dello Skyfield Athletic» (C32-03, a schermo); l'ho declinata e la risposta è «Come crede.»;
  - verbale: «CONTENUTO A FATICA», 1 stella, «Per la seconda stella … è arrivata all'arancione» (tensione_max 5).
- **IMPRESSIONE DA GIOCATORE:**
  - L'episodio più leggero e simpatico (banda, pupazzo, bambini persi «e un nonno»).
  - Vedere comparire una chiamata per una scelta di sei episodi prima dà la sensazione che le scelte contino.
  - Il vice che ha «scommesso sul pupazzo» e poi «Ho vinto la scommessa» lega bene sala e partita.
  - Mi sono un po' annoiata in o4: tre chiamate di traffico e clacson una dopo l'altra.
  - Conseguenze giuste: ho lasciato i parcheggi vuoti in o3 ed è arrivato «Festa: nessuna unità a coprirlo».
  - Nel verbale c'è una frase spezzata: «I residenti scrivono al comune, il Southwind che tornerà.» → C33-11.
  - Finale: si sente, ma è debole («Malvasi spera nella retrocessione»).

## 7.3 e08: Il capo curva (giocato bene)

Foto `e08-*`.

- **FATTO:**
  - mittenti a schermo: «Tano Ferrigno detto il Fabbro», «Responsabile degli Square Rovers», «Gianni Lavezzari, sicurezza del Kiln United» (C32-03);
  - risultato: «Due a due ai supplementari, rigori al Kiln» e il vice «Meno male che stavolta non ho scommesso» (C32-05), coerenti con la sala («Stavolta non scommetto: guardo»);
  - verbale: 1 stella e «Per la seconda stella la tensione non deve passare il giallo: è arrivata **al giallo**.» La tensione massima è 4 e la soglia è 3: tutti e due i valori hanno il livello 2, cioè giallo (`Bilancio.tsx:39`, `partita.ts:23`) → C33-09.
- **IMPRESSIONE DA GIOCATORE:**
  - L'episodio più riuscito dei sei.
  - Il Fabbro cresce chiamata dopo chiamata: chiede rispetto, fa la coreografia, «alza una mano e la curva tace», poi la stretta di mano davanti a tutti. Ogni scelta pesa fra comando e curva.
  - La frase sulla seconda stella mi ha confusa: ho tenuto il giallo, eppure la stella non c'è. Non so cosa fare di diverso la prossima volta.
  - All'inizio «lo Square» (sala) e «i Rovers» (fonti) mi sono sembrati due club; il mittente «Square Rovers» chiarisce solo in o1.
  - «al Fabbro “niente gratis”» (Lavezzari) non l'ho capito finché non ho letto la risposta.
  - Finale: si sente, amaro: «Tano Ferrigno ha avuto un po' di quello che chiedeva. Malvasi lo scrive senza commenti, il suo commento peggiore.» («Primo round. Ce ne saranno altri» è il verbale dell'esito «contenuto», che non ho avuto.)

## 7.4 e17: La partita a porte chiuse (scelte sbagliate apposta)

Foto `e17-*`, verbale `e17-verbale.jpg`.

- **Cosa ho fatto:** quasi tutte le unità nel quartiere e in piazza del municipio, lontano da piazzale, tornelli e strada; tollerato il raduno; schermo in piazza; «che spingano»; lasciato festeggiare coi fumogeni; lasciato passare lo Skyfield; e in o4 lasciato che il Fabbro riportasse a casa i suoi.
- **FATTO:**
  - rapporti: o1 3 settori scoperti (tono teso); o2 «Fiducia −1: un settore è degenerato» (critico); o3 −2 (critico); o4 −1 (critico);
  - la fiducia in alto è salita fino a 8/10 nelle ondate 1-3 (ogni «il comando ti dà fiducia») ed è scesa a 3/10 solo con «Lascia che li riporti a casa lui»;
  - verbale: «DEGENERATO FUORI CAMPO», 0 stelle, «Episodio fallito: riparti dall'ondata 2, dove si è deciso, o da capo», con i pulsanti «Riparti dall'ondata 2» e «Ricomincia»;
  - il testo del verbale è tutto riferito: «Cancelli forzati, tafferugli sulla strada di Kiln, piazza sgomberata a notte fonda, molti fermati».
- **IMPRESSIONE DA GIOCATORE:**
  - Il fallimento è raccontato bene: si capisce cosa è andato storto (il verbale elenca le tre scelte che hanno pesato e i settori scoperti) e da dove ripartire. La violenza resta fuori campo.
  - Due cose stonano:
    - Il rapporto dice «un settore è degenerato» ma la lista mostra due o tre «SCOPERTO» uguali: quale sia degenerato non si capisce → C33-14.
    - Nel verbale di un episodio fallito, «Per la stella successiva» parla della seconda stella, non di come superarlo → C33-15.
  - Mentre sbagliavo, la barra della fiducia saliva: ogni scelta «comoda per il comando» dà fiducia anche se la serata va a rotoli → C33-13.
  - «Il presidente dello Skyfield ti presta due steward. In cambio, una buona parola sulla sanzione»: la sanzione è del Kiln (porte chiuse), e perché lo chieda lo Skyfield non l'ho capito. Per la storia è il favore ricorrente del presidente (e02, e05, e06, e10, e11), ma qui il motivo manca. Resta un'impressione, senza rilievo.

## 7.5 e30: Il giorno dopo (giocato bene)

Foto `e30-*`.

- **FATTO:**
  - fonti in contrasto: le ferrovie («il corteo passa lontano dalla stazione», alta) contro la radio («il corteo taglia il viale della stazione»); il vice: «Lontano, per le ferrovie, sono duecento metri»; nel verbale le ferrovie risultano «FALSA»;
  - in o3 la vice-battuta a schermo è «Sei famoso.» per la giocatrice → C33-10;
  - `data-folla` in o2 `strada_cinderwick>entra`;
  - verbale: 3 stelle, «CONTENUTO», festa coi coriandoli e braccia alzate.
- **IMPRESSIONE DA GIOCATORE:**
  - Un bell'episodio, il più adulto dei sei: un corteo muto per un capo arrestato, il «diritto da proteggere per tutti» detto dal vice in sala, l'identificazione dei capi coro come scelta e non come regola, la lettera della curva rimandata con un timbro.
  - Le conseguenze si leggono: deviare la coda per evitare il «saluto» dello Skyfield la fa passare dal quartiere («Dalle finestre, qualcuno guarda passare duecento sciarpe»), e in o4 il quartiere resta scoperto (protesta). Che le due cose siano legate è una mia lettura: il rapporto non lo dice.
  - Il finale si sente («Malvasi appende la foto di “IL GIORNO DOPO” accanto a quella del porto»). La vignetta coi coriandoli però stona con il tono del testo (C33-12).
  - Che la fiaccolata di o4 vada verso il municipio (C33-02) a 360 non l'ho notato giocando: la fila è piccola e veloce. Lo dice la misura, non l'occhio.

## 7.6 e35: La notte lunga (scelte sbagliate apposta)

Foto `e35-*`.

- **Cosa ho fatto:** tutte le squadre alla stazione e gli steward al cantiere o alla stazione; perimetro della banca, corso e porto lasciati a sé; «aspetta che la folla si stanchi», «lascia la coda», «rimandali al comando», punto stampa vicino, «un imprenditore» alla conferenza.
- **FATTO:**
  - rapporti: teso, poi critico con −2, −2, −3;
  - fiducia in alto **10/10** alla fine delle ondate 2 e 3 (ogni «guadagni fiducia col comando»), 9/10 alla fine;
  - verbale: «DEGENERATO FUORI CAMPO», «La notte è scappata in tre direzioni … Gli ostaggi stanno bene. La rapina ha fatto il suo lavoro.», «Nessuna scelta ha dato una mano.»
- **IMPRESSIONE DA GIOCATORE:**
  - Il fallimento è chiaro e amaro: la rapina era una copertura e io ho guardato altrove. Il verbale lo dice in una riga.
  - La trattativa resta del comando e la violenza fuori campo: gli ostaggi sono «illesi» e la «spinta davanti alla porta» si vede solo nelle immagini. Rispetta le regole del gioco.
  - Come in e17, la fiducia piena a fine notte, con tre settori degenerati, non racconta com'è andata (C33-13).
  - «Il comando è dentro la banca» (risposta a «rimandali al comando»): letta alla lettera non è verosimile, perché la trattativa si fa da fuori. Credo voglia dire «è occupato con la banca». Resta un'impressione, senza rilievo.
  - Mi sono persa un po' fra le quattro ore della notte: la mappa è sempre la stessa e le chiamate cambiano settore spesso. Però i titoli («Le sette», «Le dieci», «L'una», «L'alba») aiutano.

## 7.7 Insieme (IMPRESSIONE DA GIOCATORE)

- **Cosa funziona:**
  - fonti vere e false, smascherate nel verbale;
  - un vice con una voce sua;
  - conseguenze che tornano negli episodi dopo (l'informatore pagato in e01 → e07, e08);
  - fallimenti spiegati, con «riparti dall'ondata 2»;
  - violenza sempre riferita.
- **Cosa mi ha fatto perdere il filo:**
  - il settore «SCOPERTO» sotto il pulsante del rapporto a 360;
  - stelle e colori: «giallo / giallo» (C33-09);
  - la barra della fiducia che sale mentre la serata peggiora (C33-13).
- **Testo, mappa e vignetta:**
  - testo e mappa coincidono quasi sempre (eccezione misurata: C33-02);
  - la vignetta del rapporto non si vede mai (C33-06), quella del verbale sì.
- **Finali:** si sentono in e01, e08, e17, e30, e35; più deboli in e07.

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

## Rilievi della 0.33.0 e della partita da giocatore

### Alto

**C33-06: 0.33.0, la vignetta di fine ondata (PO-059) non si vede: nascosta in tutti i rapporti a 360, 375, 412, 768, 1024 e 1366 px.**
- Misura (§ 6.1, 6.2):
  - `c33-toni.mjs`: nascosta in **1136/1136** rapporti a 360×760 e in **568/568** a 375×667, 412×915 e 1366×768;
  - `c33-rapporto-tremolio.mjs`: nascosta anche a 768×1024 e 1024×768;
  - giocando a 360: **23/23**;
  - visibile solo a 1920×1080, alta 56–77 px.
- Causa (FATTO codice): la vignetta è «nascondibile» (`src/resa/vignetta.tsx:55`) e sotto la mappa e la lista dei settori lo spazio libero non arriva mai al minimo (`useRiempi`, `:36-38`).
- Il guardiano `controllaVignettaOndata` (`tools/foto-c22.mjs`) accetta la vignetta nascosta: verde anche così. La sviluppatrice dichiara di non averlo contato; le sue foto mostrano le vignette fuori dal gioco.
- Il tono calcolato è giusto (0 diversi su 2840), ma il giocatore non lo vede. La parte del verbale invece si vede (6/6 a 360 nella partita).
- GIUDIZIO: alta perché è la novità principale della 0.33.0 e sullo schermo non arriva. Serve una decisione del PO: dove metterla (al posto della lista, sopra la mappa, più piccola) o se tenerla solo nel verbale.

### Medio

**C33-07: 0.33.0, tono «calmo» (vignetta «serata sotto controllo», volti sorridenti) con un settore rosso «SCOPERTO» nello stesso rapporto: 19 090 volte su 74 055 rapporti con un settore scoperto (26 %).**
- Misura § 6.3. Coerente invece il degenerato: sempre «critico» (29 688/29 688).
- Causa (FATTO codice): il tono legge solo la tensione a fine ondata (`espressioni.ts:12`); «scoperto» viene da `r.scoperto` (`Rapporto.tsx`).
- Oggi non si vede, per C33-06. Diventa visibile appena C33-06 si risolve.

**C33-09: il verbale dice «Per la seconda stella la tensione non deve passare il giallo: è arrivata al giallo» (e08, nella mia partita): soglia 3 e tensione 4 hanno lo stesso colore.**
- FATTO codice: la soglia è `tensione_max ≤ 3` in **36/36** episodi (`data/missioni/*.json`, `stelle.due`). Colore = `livello(t) = ceil(t/2)` (`src/resa/partita.ts:23`): 3 e 4 sono tutti e due livello 2, «giallo» (`Bilancio.tsx:17`, `:37-39`).
- Misura (`N=200 node coordination/sonde/c33-stella.mjs <0.33.0>`, `v033/stella.log`): fra gli episodi superati senza la seconda stella, quelli fermi esattamente a tensione 4 («giallo: giallo») sono:
  - casuale 335/2454;
  - attento 200/200;
  - equilibrato 200/800.
- IMPRESSIONE DA GIOCATORE: non si capisce cosa sbagliare di meno. E sulla mappa 3 e 4 hanno lo stesso colore, quindi il limite non si vede neanche durante la partita.

### Basso

**C33-08: 0.33.0, a 1920×1080 la pagina del rapporto diventa più alta della finestra (1092 px su 1080) e la vignetta è alta 56–77 px.**
- Misura § 6.2. Nella 0.32.0 e col rosso C96P01 la pagina è alta 1080.
- Foto: `v033/rapporto/rapporto-1920x1080-e01.jpg`.

**C33-10: testi rivolti alla giocatrice senza variante femminile: «Dove sei rimasto scoperto» (verbale, `bilancio.scoperti`, `data/testi/it/comune.json:92`) e «Sei famoso» (`e30.ch.sotto_il_municipio.vice`).**
- Visti a schermo nella partita da giocatrice (e01, e07, e08, e17, e30, e35 per il verbale; e30 o3 per il vice).
- Ricerca su tutti i testi senza `@f` con «sei/ti sei/sarai/eri + parola in -o/-i»: 2 casi rivolti al giocatore. Gli altri 2 trovati non sono rivolti al giocatore: «Sei sportelli», e «te lo sei venduto», dove il soggetto è il Fabbro.
- Varianti `@f` in tutti i testi: 6 (`src/dati/testi.ts:6-8`).

**C33-11: `e07.verbale_a_fatica`: «I residenti scrivono al comune, il Southwind che tornerà.»: frase spezzata.**
- `data/testi/it/e07.json:126`; nata dall'accorciamento di PO-109 (`git log -S` → da2c0e9). A schermo nel verbale di e07.

**C33-12: 0.33.0, verbale «bene»: festa coi coriandoli e braccia alzate in ogni episodio riuscito, anche in e30 (corteo muto per un capo arrestato).**
- FATTO: un solo tono «bene» per tutti gli episodi (`espressioni.ts:20`).
- GIUDIZIO: in e30 e in episodi simili (e35: «gli ostaggi stanno bene») la festa stona col testo.

**C33-13: la barra della fiducia sale mentre la serata peggiora (scelte sbagliate apposta): e35 a 10/10 con −2 e −2 nei rapporti, e17 a 8/10.**
- FATTO: le opzioni «il comando ti dà fiducia» aggiungono subito; i settori degenerati tolgono solo a fine ondata.
- IMPRESSIONE DA GIOCATORE: la barra non dice com'è andata. Che la regola sia giusta non lo giudico: è un equilibrio da decidere.

**C33-14: il rapporto dice «Fiducia −1: un settore è degenerato» ma nella lista i settori sono tutti «SCOPERTO» uguali: quale sia degenerato non si legge.**
- Visto in e17 o2 e o4 ed e35 o2–o4 (giornale della partita).

**C33-15: il verbale di un episodio fallito mostra «Per la stella successiva: Per la seconda stella …».**
- Visto in e17 ed e35: la riga parla di stelle quando l'episodio va rigiocato.

**C33-16: in «Cosa ti ha penalizzato» compaiono scelte con «+1 fiducia» («Fallo rimuovere», «Respingili», «Rifiuta: solo canali ufficiali»).**
- Il motivo è la tensione salita, ma la riga mostra prima «+1 fiducia».
- IMPRESSIONE DA GIOCATORE: si legge come un errore del gioco.

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
| **0.33.0** tono del rapporto (PO-059) | `data-tono` = tensione in 2840/2840; espressione diversa per tono; rosso C96P01 verificato. Visibilità: C33-06 |
| **0.33.0** espressioni del verbale | visibili a 360 (36/36) e 412 (36/36), nascoste a 375 come prima; festa, sollievo e sconfitta a schermo (foto) |
| C29-01 tremolio con la vignetta nuova | 0 passaggi nascosta↔visibile in 21 casi (7 finestre × 3 episodi) |

# Note di metodo e limiti

- **Misure ritirate:** salvataggi in ondata 4, primo giro 1/2 (difetto della sonda, § 4).
- **Rumore:** i segni ▲▼ e «Intanto…» dipendono dai tempi delle animazioni; li conto come tipi di coppia, non come difetti. Le corse grandi sono girate con 2–4 browser insieme.
- **Non misurato:** telefoni, tablet e PC veri; WebView dell'APK; lettori di schermo; tastiera e mouse oltre `c32-fuoco` e la versione (la 0.32.0 non tocca `src/resa/schermate` né le regole di fuoco di `stile.css`, ma non l'ho rimisurato con `c28-tastiera` e `c32-mouse`: non posso confermarlo con una misura); il guardiano completo nella catena (`node tools/catena.mjs`) non l'ho eseguito: ho usato le stesse funzioni (`mappaSchieramento`, `partenzeAttente`) nelle mie sonde.
- **Bracci rossi sui dati** (voci-club, condizione di e08) fatti in un worktree separato e annullati con `git checkout data`; nessun file del gioco cambiato sul ramo.
- **Partita da giocatore:** salvataggio modificato a mano per saltare 23 episodi (§ 7); la durata in minuti di gioco non è misurabile (nessun orologio a schermo); le impressioni sono di una sola giocatrice, una volta per episodio.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c33-pastiglie.mjs` | come `c29-pastiglie.mjs`, più posti delle unità, nomi stretti e righe, testo vero del nome fuori dal riquadro e sopra pastiglie o nomi, tocchi sovrapposti o col centro sotto un altro tocco, pastiglie sui dischi altrui, gruppi più vicini a un disco altrui | `[ROSSI=C94N01] [MISURE=360x760,…] node coordination/sonde/c33-pastiglie.mjs <radice> <uscita.json> [foto]` |
| `c33-pixel-riassunto.mjs` | da un log di `c27-pixel.mjs`: per scena, avvicinano/allontanano rispetto allo stadio e al riferimento, ondata e chiamata | `node coordination/sonde/c33-pixel-riassunto.mjs <log> [episodi]` |
| `c33-salvataggi-o4.mjs` | salvataggio vero della build A all'inizio dell'ondata N (schieramento fatto), esportato col pulsante e ripreso nella build B: chiamata, testo, `data-folla` | `[EP=e08,e30] [ONDATA=4] node coordination/sonde/c33-salvataggi-o4.mjs <radice A> <radice B> <cartella> <uscita.json>` |
| `c33-toni.mjs` | 0.33.0: tono del rapporto (motore: 4 strategie × N semi × 36 episodi, incroci con scoperti/degenerati/picco) e a schermo (`data-tono`, vignetta, nascosta, bocche/sopracciglia/braccia) | `[N=200] [NUI=2] [W=360 H=760] [ROSSI=C96P01] node coordination/sonde/c33-toni.mjs <radice> <uscita.json> [foto]` |
| `c33-rapporto-tremolio.mjs` | 0.33.0: vignetta del rapporto per 120 frame a 7 finestre: nascosta, altezza, pagina, tremolio | `[FOTO=<cartella>] [EP=…] [MISURE=…] node coordination/sonde/c33-rapporto-tremolio.mjs <radice> [uscita.json]` |
| `c33-stella.mjs` | seconda stella mancata con tensione_max 4 («giallo: giallo») | `[N=200] node coordination/sonde/c33-stella.mjs <radice>` |
| `c33-giocatore.mjs` | PO-120: browser aperto comandato tocco per tocco (HTTP locale), giornale di ogni schermata, foto | `PORTA=9333 node coordination/sonde/c33-giocatore.mjs <radice> <foto> <giornale.jsonl>`, poi `curl 127.0.0.1:9333/stato`, `/tocca?s=…`, `/foto?nome=…`, `/fine` |
