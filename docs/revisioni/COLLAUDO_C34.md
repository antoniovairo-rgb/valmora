# Collaudo C-034: 0.34.0 («?» nella barra D-139, fuoco C32-01, versione C32-06, e17 C32-02), rilievi aperti del C-033 e partita da giocatore (PO-120)

- **Build collaudata:** main a acf1151 (rilascio 55fa77a), GAME_VERSION 0.34.0 (`src/versione.ts:240`, commento `:233-239`); `npm ci` e `npx vite build` verdi.
- **Confronto «prima»:** 0.33.0 a 57229a4 in un worktree separato (`git worktree add`, `npx vite build`).
- **Cosa è cambiato nel gioco** (`git diff --stat 57229a4 acf1151 -- src data tests tools`): `data/missioni/e17.json` (+`meta`), `src/resa/App.tsx` (rosso C98V01), `schermate/Scena.tsx`, `schermate/Schieramento.tsx`, `stile.css`, `versione.ts`; guardiani `tests/meta-fase.test.ts`, `tools/foto-c17.mjs`, `foto-c22.mjs`, `foto-schieramenti.mjs`. Nessun file di `src/logica`, `schema/` o dei testi.
- **Ramo:** claude/valmora-collaudo-c34. Sola lettura sul gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-16. Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, SwiftShader), DPR 1, Node 22, 4 CPU, fino a 4 browser insieme.
- **Sonde:** riprese dai rami C-032/C-033 senza modifiche; nuove `c34-*` (tabella in fondo). Uscite in `coordination/sonde/uscite-c34/`, foto in `docs/foto/c34/`, salvataggi veri della 0.33.0 in `coordination/sonde/salvataggi-033/`.
- **Incidente:** a metà lavoro il container è stato riavviato (uscita 137): le 4 corse complete delle schermate e il pilota della partita sono morti. Le schermate le ho rifatte da capo a blocchi di 9 episodi (`c34-schermate-blocchi.sh`); la partita è ripresa da una partita nuova (§ 5).

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, marcato) · **IPOTESI** (marcata) · **IMPRESSIONE DA GIOCATORE**.

## Riepilogo

| verifica | esito |
|---|---|
| **D-139** «?» nella barra | «?» fra annulla e ricomincia, libero in **20/20** stati (5 finestre × riga «i» × aiuto aperto), tocco 44 px, icona 26 px; «Conferma» 172–292 × 51 px col testo intero. Schermate: tocchi coperti **0/1916** a 375 e a 1366 (0.33.0: 142 e 142). Rosso C96A01 sulle schermate: 34/466 a 375 e a 1366 (blocco e01–e09). **Chiuso** |
| **C32-01** fuoco perso | «conferma-passo» in città **1 Tab** (rosso C97F01: 18); Tab totali e01+e19 a 1366 **515** (rosso 641), massimo per azione 14 (29). **Chiuso**, ma nuovo **C34-01 (media)**: due Invio su «Conferma» confermano lo schieramento senza il riepilogo, 6/6 (rosso 0/6), col pulsante fuori dalla finestra a 1024 e 1366 |
| **C32-06** versione su tablet e PC | scene a 0 px da un comando su tablet/PC **0/12** (0.33.0 8/12, rosso C98V01 8/12). Telefoni 4/9 come prima (non toccati, dichiarato). **Chiuso** |
| **C32-02** e17 | strada di Kiln, ondata 4: via dallo stadio **52/69**, verso il municipio **65/69**; «me_lo_dovete» via **30/40**, verso il municipio **38/40**; uguale a 412 e 1366. Rosso C95S01: 35/34 e 0/69. **Chiuso**. Viale: GIUDIZIO in § 1.4 |
| C33-01…C33-05 | **tutti aperti, invariati** (nessun file di `etichette.ts` o di e30 toccato): C33-01 10/5/0 ondate col testo fuori dal riquadro, e13 o2 e e35 o2 come prima; C33-02 e30 o4 verso il municipio 63/69; C33-03 e06 a 360, 1/1916; C33-04 6/426 ondate diverse fra due giri; C33-05 44–46/32–33/14 gruppi |
| Bot, 1000 semi | **0 blocchi** in 156/156 righe; «mai comparse» `[]` 36/36; righe **identiche** alla 0.33.0 |
| Test e tipi | `npx vitest run` **45/45 file, 241/241**; `npx tsc --noEmit -p .` uscita 0 |
| Salvataggi veri | 12/12 esportati dalla 0.33.0 e ripresi nella 0.34.0; 3/3 dentro l'ondata 4 (e08, **e17**, e30); 7/7 della 0.32.0 ripresi dove erano; 0 errori |
| Schermate con asset veri | 360, 375, 412, 1366: **1916** ciascuna, 0 scorrimenti, 0 tagli, 0 nomi vecchi, 0 errori; tocchi coperti 1 (e06, C33-03) / 0 / 1 (C27-07) / 0 |
| Console | **0 errori** in 31 uscite con browser e nella partita |
| **Partita da giocatore** | 6 episodi a 360 (e02, e04, e13, e17, e21, e35), 797 tocchi, 0 errori; e13 ed e21 sbagliati apposta; e13 ed e17 ripresi da «Riparti dall'ondata N»; rilievi nuovi C34-02…C34-10 |

# 1. Novità della 0.34.0

## 1.1 D-139: il «?» nella barra fissa

**FATTO (codice).** Con la barra nuova il «?» non sta più nella riga (`src/resa/schermate/Schieramento.tsx:140`) ma nella barra fra annulla e ricomincia (`:145`); rosso C96A01 (`:101`). Guardiano `controllaRigaAiuto` (`tools/foto-c17.mjs:104-113`): «?» nella barra e non coperto, tocco ≥ 44, icona ≥ 24, «Conferma» ≥ 44×44 senza taglio.

**FATTO MISURATO.** `node coordination/sonde/c34-aiuto.mjs . <uscita> <foto>` (e01, schieramento dell'ondata 1, un'unità in mano, col dito; 4 stati per finestra; `aiuto-034.log`):

| finestra | «?» (y, stato) | «Conferma» verde | «Conferma» rosso C96A01 |
|---|---|---|---|
| 360×760 | 574–747, libero 4/4 | 172×51, «Conferma» intero | 224×51 |
| 360×640 | 574–632, libero 4/4 | 172×51 | 224×51 |
| 375×667 | 589–659, libero 4/4 | 187×51 | 239×51 |
| 412×915 | 610–783, libero 4/4 | 224×51 | 276×51 |
| 1366×768 | 677–760, libero 4/4 | 292×51 | 344×51 |

- Ordine della barra in 20/20 stati: annulla, «?», ricomincia, conferma. Tocco 44 px, icona 26 px. Nessuno scorrimento orizzontale. 0 errori.
- Col «?» aperto la scheda dell'aiuto sta sopra la barra, tutta in vista (per esempio 360×640: 467–565, barra 581).
- **Il braccio rosso della mia sonda non mostra il difetto:** col rosso il «?» torna nella riga ma è libero in 20/20, anche senza unità in mano e senza tocco (`aiuto-034-noscelta-*.log`). La sonda misura la pagina in cima; il difetto del C-030 dipende dallo stato di scorrimento. Per questo il rosso l'ho misurato col giro delle schermate:
- **Schermate** (`c29-schermate.mjs`, § 4): tocchi coperti a 375 e 1366 **0/1916** (0.33.0: 142 e 142, «BUTTON.aiuto coperto da BUTTON.pulsante»). Rosso C96A01, blocco e01–e09 (`FOTO=0 MISURE="375x667 1366x768" bash coordination/sonde/c34-schermate-blocchi.sh 1 <foto> C96A01`): **34/466** a 375 e **34/466** a 1366, tutti «BUTTON.aiuto[aiuto] coperto da BUTTON.pulsante». Il guardiano vede il difetto.
- Foto prima/dopo: `docs/foto/c34/aiuto/<finestra>-e01[-info][-aiuto][-rosso].jpg`.
- GIUDIZIO: a 360 «Conferma» resta largo e leggibile (foto `360x640-e01-info-aiuto.jpg`); i tre tasti piccoli si distinguono.

## 1.2 C32-01: il fuoco perso va al comando più vicino

**FATTO (codice).** Al fuoco perso, `Scena.tsx` cerca in tutto `main` il comando più vicino all'ultimo che aveva il fuoco (`src/resa/schermate/Scena.tsx:12-22`, `:39`) e lo mette a fuoco **senza scorrere** (`preventScroll: true`, `:40`). Sono escluse solo le opzioni delle chiamate (`.opzione`, `:12`), perché «Invio sceglierebbe senza aver letto» (`:33-34`). Rosso C97F01: sempre sulla scena (`:39`).

**FATTO MISURATO.**
- `W=1366 H=768 node coordination/sonde/c32-fuoco.mjs .` (`fuoco-1366.log`, rosso `fuoco-1366-rosso.log`):

| azione (Tab necessari) | verde 0.34.0 | rosso C97F01 |
|---|---|---|
| città, «conferma-passo» | **1** | 18 |
| città, stagione 1 | 10 | 2 |
| schieramento, prima unità | 10 | 1 |
| schieramento, un settore | 8 | 16 |
| schieramento, «Conferma» | 12 | 12 |

- `W=1366 H=768 EP=e01,e19 node coordination/sonde/c28-tastiera.mjs . <foto> <uscita>` e `node coordination/sonde/c32-tab-conti.mjs <uscita>` (`tastiera-1366*.log`, `tab-conti-1366*.log`): 203 azioni, tutte raggiunte; **Tab 515** (rosso 641), mediana 1, p90 9, **massimo 14** (rosso 29); fuoco perso dopo un'azione 8 (rosso 17); fuoco coperto 0; **fuori finestra 4** (rosso 0); 0 errori.
- **Le 4 fermate fuori finestra sono tutte «Sì, conferma»** del riepilogo, raggiunto con **0 Tab** in 7/7 schieramenti (rosso: 2 Tab in 7/7, sempre in vista). → **C34-01.**
- Riproduzione dedicata: `[ROSSI=C97F01] EP=e01,e19 MISURE=1366x768,1024x768,360x760 node coordination/sonde/c34-riepilogo-fuoco.mjs . <uscita> docs/foto/c34/riepilogo` (fuoco su «Conferma», Invio, poi un secondo Invio):

| | verde 0.34.0 | rosso C97F01 |
|---|---|---|
| fuoco dopo il primo Invio | «Sì, conferma» 6/6 (fuori dalla finestra, y 781, a 1024 e 1366: 4/6) | la scena 6/6 |
| scena dopo il secondo Invio | **chiamata 6/6**: schieramento confermato senza aver visto il riepilogo | schieramento 6/6 |

  Foto `docs/foto/c34/riepilogo/riepilogo-1366x768-e01.jpg`: a schermo «Ti restano 3 squadre, 6 steward e 1 mediatore: confermi lo stesso?»; i due pulsanti sono sotto il bordo della finestra, quello col fuoco non si vede.
- GIUDIZIO: il guadagno sui conti è reale (−20 % di Tab). Il costo si sposta su altre azioni (stagione e prima unità da 1–2 a 10 Tab) e c'è la scorciatoia involontaria sul riepilogo, che è la seconda conferma voluta da S-12/PO-061.

## 1.3 C32-06: la versione su tablet e PC

**FATTO (codice).** `src/resa/stile.css:379-381`: dove c'è spazio la versione sta 16 px fuori dalla colonna; rosso C98V01.

**FATTO MISURATO.** `node coordination/sonde/c32-versione-pulsanti.mjs <radice>` (7 finestre × 3 scene; `versione-033.log`, `versione-034.log`, `versione-034-rosso.log`):

| | scene a 0 px da un comando | di cui tablet/PC (768–1920) |
|---|---|---|
| 0.33.0 | 12/21 | 8/12 |
| **0.34.0** | **4/21** | **0/12** (distanza 16 px dal bordo con l'ombra 11 px) |
| rosso C98V01 | 12/21 | 8/12 |

I 4 casi rimasti sono telefoni (360 e 375 «continua», 412 opzioni, 375 schieramento): la sviluppatrice li dichiara non toccati. **Chiuso** per tablet e PC.

## 1.4 C32-02: e17, la strada di Kiln verso il municipio

**FATTO (dati/codice).** `data/missioni/e17.json:54` `"meta": "piazza_municipio"`; con la meta e lo stadio (vuoto) disegnato il viale parte dal bordo dello stadio, passa dalla strada e finisce sul municipio (`src/resa/mappa/sfondo.ts:131-134`), e il corteo è sempre `entra` (`src/resa/mappa/StratoPixi.tsx:81`). Guardiano `tests/meta-fase.test.ts` (fra i 241 verdi).

**FATTO MISURATO.** `W=… EP=e17,e30 RIF=piazza_municipio [ROSSI=C95S01] node coordination/sonde/c27-pixel.mjs . <foto> <uscita>`, riassunto `c33-pixel-riassunto.mjs` (numeri: si avvicinano / si allontanano; `pixel-*-riassunto.txt`):

| e17 | 360 | 412 | 1366 | rosso C95S01 (360) |
|---|---|---|---|---|
| o4 ondata, stadio / municipio | 17/52, 65/4 | 19/50, 63/6 | 17/52, 62/7 | 35/34, **0/69** |
| `me_lo_dovete`, stadio / municipio | 10/30, 38/2 | 10/29, 36/3 | 10/29, 36/3 | 33/7, 0/40 |
| `ci_vediamo_dopo` (o2) | 10/29, 36/3 | – | – | 19/21, 40/0 |
| o1 ondata (raduno) | 17/52, 65/4 | 19/50, 63/6 | 18/51, 63/6 | 33/36, 69/0 |

Uguale alle misure della sviluppatrice (51/18 e 29/10 nel suo ordine «via/verso»). Salvataggio vero della 0.33.0 fermo su `me_lo_dovete`: `data-folla` da `strada_cinderwick>esce` a `>entra` (§ 4). **Chiuso.**

**Il viale disegnato ha senso? (GIUDIZIO, foto `docs/foto/c34/e17/e17-o1-zoom.jpg`, `e17-o4-zoom.jpg`, `e17-o4-ch1-zoom.jpg`)**
- La strada parte dal bordo dello stadio vuoto, passa dal disco «Strada da Kiln», gira lungo lo stadio e scende in diagonale **sotto il disco del Piazzale dello stadio** fino alla Piazza del municipio. Si legge come «la strada che dallo stadio porta in centro»: coerente con `e17.ch.ci_vediamo_dopo` («Il corteo passa dalla strada di Kiln») e con l'ondata 4 («tutti devono tornare a casa a piedi»).
- Due cose stonano:
  - nell'ondata 1 (raduno sulla strada di Kiln, `e17.json` evento `raduno_strada`) i tifosi del Kiln camminano già verso il municipio, quando il corteo dello sciopero non è ancora partito (`e17.ondata2` «Il corteo parte»). La gente si vede accanto al Piazzale, non al disco della strada;
  - la strada «da Kiln» non arriva al bordo della mappa: comincia allo stadio. Chi cerca da che parte sta Kiln non lo trova.
- Nell'ondata 4 si vedono due file: quella del Kiln (arancio/nero) dal Piazzale al municipio e quella della piazza (bianco/nero) che esce a destra. Nella mia partita a 360 si leggeva bene.

# 2. Rilievi aperti del C-033, rimisurati sulla 0.34.0

`git diff --stat 57229a4 acf1151 -- src/resa/mappa data/missioni/e30.json data/missioni/e06.json`: solo `e17.json`. Le misure confermano.

| rilievo | stato | misura C-034 (stessi strumenti) | C-033 |
|---|---|---|---|
| **C33-01** testo del nome fuori dal riquadro | **aperto, uguale** | `node coordination/sonde/c33-pastiglie.mjs . <uscita> <foto>`, 2 giri: testo fuori in **10 / 5 / 0** ondate (360/375/412), max 13,1 e 14,6 px; sopra altro: e13 o2 a 360 «Parcheggi» × pastiglia «1» di Piazza del concerto 43 px², e35 o2 a 375 «Perimetro della banca» × «Banchine del porto»; pastiglie sopra i nomi 0/142 a ogni misura. Foto `docs/foto/c34/pastiglie/pastiglie-360-e13-o2.jpg`, `…-375-e35-o2.jpg` | 10/5/0, stessi due casi |
| **C33-02** e30 o4 fiaccolata verso il municipio | **aperto, uguale** | 360: ondata stadio 0/69, **municipio 63/6**; chiamata `fiaccolata` 35/4; uguale a 412 e 1366. D-141 (verso `dalla_meta`) è deciso ma non c'è nel codice: `grep -rn dalla_meta src data schema` vuoto | 63/6 |
| **C33-03** e06 o1 a 360 | **aperto, uguale** | schermate 360: 1/1916, «tocco-pastiglia[ritira Mediatore da Piazza del concerto] coperto da BUTTON.settore-punto» | 1/1916 |
| **C33-04** etichette non deterministiche | **aperto** | due giri verdi identici: **6/426** ondate con posti diversi (360 e08 o1, e16 o3, e29 o1; 375 e07 o4, e08 o4, e18 o3). Le misure riassuntive non cambiano (pastiglie sopra i nomi 0 in tutti e due). IPOTESI: dipende dai tempi (giri con 3–4 browser insieme) | 2/426 |
| **C33-05** pastiglie più vicine al disco altrui | **aperto, uguale** | gruppi 46 / 33 / 14 (giro 1), 44 / 32 / 14 (giro 2) | 44 / 32 / 14 |

Visti di nuovo giocando (non richiesti, nessuna novità nel codice): C33-06 vignetta del rapporto nascosta (**27/27** rapporti aperti nella mia partita, `rap.sh`), C33-07 tono «calmo» con un settore «SCOPERTO» (e02 o4, e04 o1, e35 o3), C33-09 «è arrivata al giallo» (e17, verbale), C33-13 fiducia alta a fine serata fallita (e17 9/10, e21 9/10), C33-14 «un settore è degenerato» fra tre «SCOPERTO» (e13 o3, e17 o4), C33-15 «Per la stella successiva» negli episodi falliti (e13, e17, e21), C33-16 scelte con «+1 fiducia» fra quelle che hanno penalizzato (e17, e21). Lavezzari dà del «te» in `e21.ch.striscione_sgombero` (come nel C-033).

# 3. Coerenza testi ↔ dati ↔ resa (episodi toccati e giocati)

- **e17:** testi, meta e verso coincidono (§ 1.4). In più: **Piazza del municipio è un settore di tipo `strada`** (`data/missioni/e17.json:81-82`) e gli steward valgono 0 sulle strade (`:99-104`); il rapporto dice «Folla: nessuna unità a coprirlo» con lo steward sul disco, perché il testo guarda la copertura e non le unità (`src/resa/schermate/Rapporto.tsx:27`, `src/logica/missione.ts:201`). Fra i 36 episodi è l'unica «piazza_…» di tipo strada. → C34-04.
- **e21 `pullman21`:** gli effetti contraddicono i testi delle due opzioni (`data/missioni/e21.json:720-750`, `data/testi/it/e21.json:109-114`). → C34-02.
- **e35:** la barca bloccata in o1 torna «senza scatoloni» in o3; «faldoni spariti» dopo averli fermati in stazione; il verbale «a fatica» dice «una barca andata e tornata». Nessuna variabile lega le chiamate (`data/missioni/e35.json:205`, `:589`, nessuna `se`). → C34-03.
- **e04:** «due steward restano lì fino a sera» (`data/testi/it/e04.json:17`) toglie due steward dalla riserva (`data/missioni/e04.json:171`, effetto `riserva`) ma non copre il mercato: nell'ondata 3 «Mercato rionale: Deflusso: nessuna unità a coprirlo». → C34-05.
- **Verbali di fallimento a testo fisso:** e13 «piazza oltre il limite, concerto interrotto» (`data/testi/it/e13.json:134`) con la piazza del concerto «sotto controllo» in 4/4 rapporti; e17 «Cancelli forzati» (`data/testi/it/e17.json:123`) coi tornelli «sotto controllo» nell'ondata decisiva. → C34-06.
- **Ordine pubblico e violenza:** tutto riferito (rapporti, radio, verbali: «tafferugli», «Rissa» come causa del settore scoperto). Nessuna procedura reale nuova da verificare su fonti esterne.

# 4. Regressioni (FATTO MISURATO)

- **Bot:** `node tools/bot.mjs 1000` (`bot-1000.log`): 156/156 righe con **blocchi 0/1000**; «chiamate mai comparse» `[]` 36/36; `diff` delle righe di blocchi, esiti e «mai comparse» con la 0.33.0 (`uscite-c33/v033/bot-1000.log` del ramo c33): **vuoto**. Coerente: `meta` cambia solo la resa.
- **Test e tipi:** `npx vitest run` → «Test Files 45 passed (45) · Tests 241 passed (241)» (0.33.0: 240; in più `meta-fase` C32-02); `npx tsc --noEmit -p .` uscita 0.
- **Console:** 0 errori di pagina e di console nelle 31 uscite con campo `errori` (schermate 4 × 4 blocchi + rossi, pastiglie 2 giri, pixel 4, salvataggi 2, tastiera 2, aiuto 4, riepilogo 2) e nei 797 tocchi della partita.
- **Schermate con asset veri:** `bash coordination/sonde/c34-schermate-blocchi.sh <1-4> <foto>` (= `W=… H=… EP=<9 episodi> FOTO=1 node coordination/sonde/c29-schermate.mjs`), 36 episodi, bot attento, seme 1 (`uscite-c34/schermate/`):

| misura | schermate | scorr. orizz. | tagli | nomi vecchi | tocchi coperti | errori |
|---|---|---|---|---|---|---|
| 360×760 | 466+480+484+486 = 1916 | 0 | 0 | 0 | **1** (e06, C33-03) | 0 |
| 375×667 | 1916 | 0 | 0 | 0 | **0** (0.33.0: 142, «?») | 0 |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, C27-07) | 0 |
| 1366×768 | 1916 | 0 | 0 | 0 | **0** (0.33.0: 142, «?») | 0 |

  Le 4 × 1916 foto sono rimaste locali (si rifanno col comando); foto scelte nelle cartelle `docs/foto/c34/`.
- **Salvataggi veri:**
  - `EP=e08,e17,e30 ONDATA=4 node coordination/sonde/c33-salvataggi-o4.mjs <0.33.0> . coordination/sonde/salvataggi-033 <uscita>`: **3/3** esportati col pulsante dalla 0.33.0 nell'ondata 4 e ripresi nella 0.34.0 sulla stessa chiamata (e08 `risultato`, e17 `me_lo_dovete`, e30 `fiaccolata`); e17 `data-folla` `strada_cinderwick>esce` → `>entra` (atteso); 0 errori (`salvataggi-o4.log`). La sonda scrive «0.31.0» nel nome dei file: li ho rinominati «0.33.0-…».
  - `EP=e01,e04,e07,e08,e09,e13,e17,e19,e21,e25,e30,e31 VA=0.33.0 VECCHI_DIR=<salvataggi-032 del C-033> node coordination/sonde/c32-salvataggi.mjs <0.33.0> . coordination/sonde/salvataggi-033 <uscita>`: **12/12** ripresi sulla stessa chiamata; dei 7 file veri della 0.32.0, 2 ripresi sulla chiamata e 5 sul rapporto dove erano stati salvati (la sonda li segna «NO» perché aspetta una chiamata: è il comportamento giusto, come nel C-033); 0 errori (`salvataggi.log`). I salvataggi della 0.28.0 e 0.31.0 non li ho riprovati.

# 5. Partita da giocatore (PO-120)

**Come ho giocato (FATTO).**
- Build 0.34.0, 360×760, col dito (`hasTouch`), DPR 1, asset veri. Strumento `c33-giocatore.mjs` (un tocco per comando) con gli aiuti `c34-giocatore-aiuti/` (copie di quelli del C-033 coi percorsi della mia sessione). Ogni scelta l'ho decisa leggendo la schermata; **non** ho letto le chiamate in anticipo dai dati (diverso dal C-033), salvo le ripartenze, dove le conoscevo già come le conoscerebbe un giocatore.
- Ho scelto «il nuovo responsabile ad interim» (il C-033 aveva giocato al femminile).
- **Salvataggio:** partita nuova dal titolo, guida intera letta. Per arrivare agli episodi richiesti ho segnato a mano come conclusi (1 stella, variabili invariate) gli episodi in mezzo (`sblocca.sh`). **Il riavvio del container ha perso il salvataggio** dopo e17: per e21 ed e35 ho aperto una partita nuova e segnato e01–e20 (poi e21–e34) come conclusi; e21, fallito, l'ho segnato superato per sbloccare e35. Le variabili della storia in e21 ed e35 quindi non vengono da e02–e17.
- **Durata in minuti di gioco: non posso confermarla.** Il gioco non mostra un orologio di gioco (`grep -rln "orologio" src/` trova solo lo spicchio grafico dell'urgenza, `Fumetto.tsx:58`). Conto tocchi, ondate e chiamate (`node coordination/sonde/c34-giornale.mjs <giornale>`) e riporto le ore del racconto.
- Giornali `uscite-c34/giocatore/giornale.jsonl` (e02–e17) e `giornale-2.jsonl` (e21, e35); foto `docs/foto/c34/giocatore/` (123). Errori di console: 0.

| episodio | come ho giocato | esito | stelle | tocchi | ondate / chiamate | ore del racconto |
|---|---|---|---|---|---|---|
| e02 Ospiti numerosi | bene | contenuto | 2 | 130 | 4 / 14 | arrivo dei treni → ripartenza |
| e04 Il mercato del sabato | bene | contenuto a fatica | 1 | 93 | 3 / 9 | dalle dodici e mezza a dopo la partita |
| e13 Il concertone d'estate | **sbagliato apposta**, poi ripreso dall'ondata 2 | degenerato (fallito), poi contenuto a fatica | 0 → 1 | 200 | 4+3 / 12+9 | amichevole alle sette, concerto alle nove |
| e17 La partita a porte chiuse | bene; fallito, ripreso dall'ondata 4 | degenerato (fallito), poi contenuto a fatica | 0 → 1 | 127 | 4+1 / 12+3 | dalle cinque alle undici di sera |
| e21 Senza capo | **sbagliato apposta** | degenerato (fallito) | 0 | 134 | 4 / 11 | dalla sera alla notte |
| e35 La notte lunga | bene | contenuto a fatica | 1 | 113 | 4 / 12 | dalle sette all'alba |

## 5.1 e02 Ospiti numerosi (giocato bene)

Foto `e02-*`.
- **FATTO:** 3 rapporti con «Fiducia +1: nessun settore scoperto», l'ultimo con i tornelli «SCOPERTO» (li avevo lasciati vuoti dopo la partita); verbale 2 stelle, «Per la stella successiva: Fiducia ≥ 5: hai 4»; Ferrovie e responsabile del Railhead «FALSA», radio e rete «VERA».
- **IMPRESSIONE DA GIOCATORE:**
  - Si capisce subito: treni in ritardo, biglietti falsi, ospiti che vogliono «un giro» a Skyfield. Le fonti si smascherano sul momento («Puntuali, dicevano»). Buon ritmo.
  - Il responsabile del Railhead risulta «FALSA» («ottocento tifosi, biglietto nominativo») e il verbale apre con «Ottocento ospiti arrivati»: per un attimo non ho capito cosa fosse falso (credo i biglietti nominativi).
  - In o3 la chiamata del vice ha **una sola risposta**, «Non intervenire» (foto `e02-o3-caldo_casa.jpg`): l'opzione col mediatore sparisce perché l'avevo impegnato in o2 (`opzioniValide`, `src/logica/missione.ts:148-151`), ma lo schermo non lo dice. → C34-10.
  - «Comitato di Skyfield, tifosi sotto le case» si risolve con un «presidio in curva Skyfield»: il quartiere non è sulla mappa e il nesso fra case e curva non l'ho capito.
  - Conseguenze giuste; finale che si sente («Malvasi lo appende accanto alla cartina dei treni»).

## 5.2 e04 Il mercato del sabato (giocato bene)

Foto `e04-*`.
- **FATTO:** o1 strada da Kiln «SCOPERTO» dopo aver deviato il corteo («Corteo: unità non abbastanza»), con 2 squadre a riposo dopo; o2 fonderie e parcheggi scoperti; o3 mercato e piazzale scoperti; verbale 1 stella, «contenuto a fatica».
- **IMPRESSIONE DA GIOCATORE:**
  - L'idea (passeggini e sciarpe fra i banchi) è simpatica e chiara; «Stesso codice storto dei treni» lega bene a e02.
  - Mi sono sentito preso in giro due volte:
    - in o2 «Manda gli steward in piazza» risponde «Gli steward arrivano» ma il rapporto dice «Raduno: nessuna unità a coprirlo» (la risposta non mette unità: `data/missioni/e04.json:524`);
    - in o3 avevo tre steward «lì fino a sera» al mercato e il vice diceva «Mercato già smontato», ma il mercato risulta «Deflusso: nessuna unità a coprirlo». → C34-05.
  - Mappa e testo non coincidono in o1: «Fallo girare per la strada delle fonderie» e la fila continua a passare accanto al Mercato (foto `e04-o1-corteo.jpg`), perché c'è un solo viale.
  - «Dovevano chiudere alle due. Sono le dodici e mezza» (vice): il mercato non è in ritardo, sono i tifosi in anticipo; la battuta non torna.
  - Finale debole ma giusto («Malvasi propone di spostare il mercato al martedì»).

## 5.3 e13 Il concertone d'estate (sbagliato apposta, poi ripreso)

Foto `e13-*`, `e13b-*`.
- **Cosa ho fatto:** tutto in piazza del concerto e ai parcheggi, niente sul piazzale e sul viale nonostante la radio («trenino pieno da Tramway», alta); viale aperto «come chiede il comando», parcheggi agli addetti, foto al Fabbro, «che resistano», «aspetta che si stanchino», patto col Fabbro.
- **FATTO:** o2 −1 (piazzale), o3 −1 con due «SCOPERTO» (curva Kiln e piazzale), o4 −1; verbale «DEGENERATO FUORI CAMPO», «riparti dall'ondata 2». Ripreso dall'ondata 2: fiducia 4/10 come a inizio ondata, nessun blocco; chiuso «contenuto a fatica».
- **IMPRESSIONE DA GIOCATORE:**
  - Il fallimento si capisce e la ripartenza dall'ondata 2 è comoda: la seconda volta ho giocato meglio sapendo cosa arrivava.
  - Il verbale del fallimento racconta «piazza oltre il limite, concerto interrotto», ma nella mia serata la piazza del concerto era sempre «sotto controllo» (ci avevo messo tutti): il testo non è la mia partita. → C34-06.
  - «Accetta» (il patto col Fabbro) sta fra le scelte che «ti hanno aiutato»; la risposta dice «La curva, sotto, si siede», poi il rapporto dà la curva Kiln «Rissa: nessuna unità a coprirlo». Le due cose insieme mi hanno confuso.
  - «Dove sei rimasto scoperto» elenca 3 righe in ordine sparso (ondata 4, 1, 2) e salta l'ondata 3 con due settori scoperti (sono i 3 «più scoperti», `src/logica/bilancio.ts:48`, ma il titolo non lo dice). → C34-07.

## 5.4 e17 La partita a porte chiuse (giocato bene, fallito)

Foto `e17-*`, `e17b-*`; mappa ingrandita `docs/foto/c34/e17/`.
- **FATTO:** o1 tutto sotto controllo (+1); o2 piazzale e quartiere scoperti; o3 tornelli e piazza del municipio scoperti; o4 **fallito** (strada di Kiln, quartiere e municipio scoperti; municipio a tensione 7, letta nel salvataggio: `sconfitta.rapporti[3]`), con fiducia **9/10**. Avevo solo 2 squadre e 0 steward per l'ondata 4: le altre erano impegnate «fino a sera» da risposte date bene (presidio del piazzale, squadra nel quartiere, pattuglia sulla strada, steward ai cancelli). Ripreso dall'ondata 4 con «Lascia che li riporti a casa lui»: «contenuto a fatica», «Per la seconda stella … è arrivata al giallo» (C33-09).
- **IMPRESSIONE DA GIOCATORE:**
  - Il testo è il più bello dei sei: sciopero e porte chiuse lo stesso giorno, il Fabbro che «fa il servizio d'ordine», la radiocronaca dal bar.
  - Ho perso giocando con attenzione, e non ho capito perché finché non ho guardato i dati: in piazza del municipio avevo messo uno steward in o1, o2 e o3, e il rapporto diceva «nessuna unità a coprirlo» con lo steward sul disco (foto `e17-o3-schierato.jpg`). La piazza è una «strada» per il gioco e lì gli steward non contano. Un giocatore non può saperlo. → C34-04.
  - Le scelte prudenti delle prime ondate mi hanno lasciato senza unità nell'ultima. Lo trovo giusto come idea, ma il gioco non lo fa vedere prima (le unità impegnate compaiono solo nel totale «disponibili»).
  - «Dove sei rimasto scoperto» non nomina la piazza del municipio dell'ondata 4, cioè il settore che ha fatto fallire l'episodio (C34-07); il verbale parla di «Cancelli forzati» coi tornelli sotto controllo (C34-06).
  - La strada di Kiln: vedi § 1.4. Giocando a 360 la fila del Fabbro che scende dal Piazzale al municipio si legge, e racconta la stessa cosa del testo.

## 5.5 e21 Senza capo (sbagliato apposta)

Foto `e21-*`.
- **Cosa ho fatto:** tutto in curva e sul piazzale; corteo fuori dal cortile, «ignoralo» al nuovo capo, smentita in rete, «lascia correre», striscione tolto, piazza chiusa, «ascolta il consiglio» del comune, «tutti insieme», vie riaperte.
- **FATTO:** o1 tre settori scoperti, o2 −1, o3 −2, o4 −2; verbale «DEGENERATO FUORI CAMPO», «Nessuna scelta ha dato una mano», vignetta del verbale **nascosta** a 360 (unico dei sei, `verb.sh`); fiducia 9/10 a fine serata (C33-13).
- **IMPRESSIONE DA GIOCATORE:**
  - È l'episodio più politico: curva divisa, centro sociale, sgombero, «qualcuno in comune» che vuole un rapporto comodo. Il vice regge il tono («La democrazia, ma col vivavoce»).
  - Il titolino dell'ondata 1 dice «i giovani della curva sono all'ex fonderia» mentre la fonte «Qualcuno in comune» (alta) dice «stasera l'ex fonderia sarà vuota»: la «i» rivela quale fonte mente prima di giocare. → C34-09.
  - `pullman21`: «Riaprile» dice «nel quartiere auto e gente insieme» ma il bollino è «Piazzale dello stadio»; «Tienile chiuse» dice «il piazzale si intasa» e invece lo alleggerisce. → C34-02.
  - Il fallimento è raccontato bene e amaro («lo sgombero ora ha una data»).

## 5.6 e35 La notte lunga (giocato bene)

Foto `e35-*`.
- **FATTO:** o1 e o2 «nessun settore scoperto» (+1, +1); o3 stazione scoperta; o4 perimetro, cantiere e stazione scoperti; verbale «contenuto a fatica», 1 stella; il guardiano del cantiere e la rete «FALSA».
- **IMPRESSIONE DA GIOCATORE:**
  - Ritmo da notte vera: le sette, le dieci, l'una, l'alba. La trattativa resta del comando e gli ostaggi escono «illesi»; il corridoio fino ai familiari è il momento più umano dei sei episodi.
  - Ho bloccato la barca al pontile in o1 («La barca resta ormeggiata») e in o3 il testimone dice «la barca è tornata senza scatoloni»; in o4 ho fermato l'uomo coi faldoni e il comando parla di «faldoni spariti»; il verbale dice «una barca andata e tornata». Le mie scelte non lasciano traccia. → C34-03.
  - Finale: si sente («Quasi è la nostra parola»).

## 5.7 Insieme (IMPRESSIONE DA GIOCATORE)

- **Cosa funziona:** fonti vere e false smascherate nel verbale; il vice; le ripartenze dall'ondata decisiva; la violenza sempre riferita; e17 ed e35 come storie.
- **Dove mi sono perso:**
  - unità che «restano lì» ma non coprono (C34-05) e settori dove un tipo di unità non vale niente senza che il gioco lo dica (C34-04);
  - verbali che raccontano una serata diversa dalla mia (C34-03, C34-06);
  - la barra della fiducia piena mentre la serata va a rotoli (C33-13).
- **Testo, mappa e vignetta:** testo e mappa coincidono quasi sempre (eccezioni: e04 o1 corteo deviato che passa dal mercato, e30 o4 C33-02); la vignetta del rapporto non si vede mai (C33-06), quella del verbale sì in 5/6.
- **Noia:** quasi mai; un po' in e04 o2 (quattro chiamate che spostano gente fra fonderie e parcheggi).
- **Finali:** si sentono in e02, e17, e21, e35; più deboli in e04 ed e13.

# Rilievi (per gravità)

## Alto

Nessuno.

## Medio

**C34-01: con la tastiera, dopo Invio su «Conferma» il fuoco va da solo su «Sì, conferma» del riepilogo (spesso fuori dalla finestra): un secondo Invio conferma lo schieramento senza averlo visto. Regressione della 0.34.0 (C32-01).**
- Misura (§ 1.2): `c34-riepilogo-fuoco.mjs` verde **6/6** al secondo Invio si apre la chiamata; il pulsante col fuoco è fuori dalla finestra (y 781 su 768) a 1024×768 e 1366×768 (4/6), dentro a 360×760. Rosso C97F01 **0/6** (il fuoco sulla scena, il secondo Invio non fa nulla). `c28-tastiera` a 1366: «Sì, conferma» a 0 Tab in 7/7 schieramenti, fuori finestra 4/7 (rosso: 2 Tab, sempre in vista).
- Foto `docs/foto/c34/riepilogo/riepilogo-1366x768-e01.jpg`: «Ti restano 3 squadre, 6 steward e 1 mediatore: confermi lo stesso?» col fuoco su un pulsante che non si vede.
- Causa (FATTO codice): `Scena.tsx:12` esclude solo le opzioni delle chiamate; «Sì, conferma» è il comando più vicino al «Conferma» appena premuto (`:14-22`, `:39`) e il fuoco non scorre la pagina (`:40`). Il riepilogo è la seconda conferma di S-12/PO-061 (`Schieramento.tsx:94`, `:174`).
- Nessun guardiano lo vede: `controllaFuoco` controlla solo che il fuoco non sia sulla scena.

**C34-02: e21 `pullman21`: gli effetti delle due opzioni contraddicono i loro testi.**
- FATTO (dati): «Riaprile» — testo «nel quartiere auto e gente insieme» (`data/testi/it/e21.json:110`), effetti `pressione piazzale +2` e credito +1 (`data/missioni/e21.json:720` e seguenti), bollino a schermo «Piazzale dello stadio». «Tienile chiuse ancora un'ora» — testo «il quartiere resta sgombro … il piazzale dello stadio si intasa» (`e21.json:113`), effetti `pressione piazzale −2`, `tensione quartiere +1`, credito −1 (`data/missioni/e21.json:736` e seguenti): il piazzale si alleggerisce e il quartiere si scalda, il contrario del testo.
- A schermo nella mia partita (e21 o4, giornale-2).

**C34-03: e35, le chiamate e il verbale non tengono conto di quello che hai fatto con la barca e coi faldoni.**
- FATTO (dati): `blocca_barca` (o1) non imposta variabili (`data/missioni/e35.json:205`); `barca_ritorno` (o3, `:589`) non ha `se` e dice «la barca è tornata senza scatoloni» (`data/testi/it/e35.json:89`); `e35.verbale_a_fatica` «una barca andata e tornata» (`:123`); `rapporto_notte` (o4, `data/missioni/e35.json:741`, nessuna `se`) «faldoni spariti dal cantiere» (`data/testi/it/e35.json:114`) anche dopo `ferma_uomo` (`:662`, «Nella valigia, faldoni»).
- IMPRESSIONE DA GIOCATORE: le scelte giuste spariscono dal racconto proprio nell'episodio d'indagine.

**C34-04: e17, la Piazza del municipio è una «strada»: gli steward non valgono niente lì e il rapporto dice «nessuna unità a coprirlo» con lo steward sul disco.**
- FATTO (dati/codice): `data/missioni/e17.json:81-82` tipo `strada`; steward senza efficacia su `strada` (`:99-104`); copertura = somma delle efficacie (`src/logica/missione.ts:201`); testo della causa da `copertura <= 0` (`src/resa/schermate/Rapporto.tsx:27`). Unico caso fra i 36 episodi di una «piazza_…» di tipo strada (sonda in riga di comando, § 3).
- Nella mia partita (giocata bene) lo steward in piazza del municipio in o1–o3 non ha coperto niente; la piazza è arrivata a tensione 7 in o4 e l'episodio è fallito.
- Anche il mediatore (efficacia `{}`, dimezza i raduni) dà «nessuna unità a coprirlo» quando è sul disco (e17b o4, quartiere).
- GIUDIZIO: è media perché tocca l'episodio cambiato in questa versione e fa perdere chi gioca bene; il testo «nessuna unità» è falso a vista anche negli altri episodi.

## Basso

**C34-05: le unità impegnate da una risposta «restano lì fino a sera» ma non coprono il settore.**
- FATTO: `e04.op.cordone_banchi.c` «due steward restano lì fino a sera» (`data/testi/it/e04.json:17`) → effetto `riserva steward −2` (`data/missioni/e04.json:171`), nessuna copertura; e04 o3 «Mercato rionale: Deflusso: nessuna unità a coprirlo». `steward_fumo4` «Gli steward arrivano» (`e04.json:72` dei testi) senza unità (`data/missioni/e04.json:524`): e04 o2 fonderie «nessuna unità a coprirlo». Frasi «fino a sera» nei testi: 29 (`grep -n "fino a sera" data/testi/it/*.json`).
- IMPRESSIONE DA GIOCATORE: si legge come un errore del gioco.

**C34-06: i verbali di fallimento hanno un testo fisso che può raccontare cose non successe.**
- e13 «piazza oltre il limite, concerto interrotto» (`data/testi/it/e13.json:134`) con la piazza del concerto sotto controllo 4/4; e17 «Cancelli forzati» (`data/testi/it/e17.json:123`) coi tornelli sotto controllo nell'ondata 4.

**C34-07: «Dove sei rimasto scoperto» mostra i 3 settori più scoperti, senza dirlo, e può saltare quello che ha fatto fallire l'episodio.**
- FATTO codice: `src/logica/bilancio.ts:48` (ordinati per quanto scoperti, poi per ondata, primi 3). e17: elenco o2 quartiere, o3 tornelli, o3 municipio; manca il municipio dell'ondata 4 (tensione 7, l'episodio è fallito lì). e13: ondata 3 (due settori scoperti) assente.

**C34-08: C32-01 sposta il costo dei Tab su altre azioni.**
- `c32-fuoco` a 1366: stagione 1 **10** Tab (rosso 2), prima unità **10** (rosso 1). Il totale scende comunque (515 contro 641).

**C34-09: e21, la «i» dell'ondata 1 rivela quale fonte mente.**
- `e21.ondata1.i` «i giovani della curva sono all'ex fonderia» contro `e21.info_comune` (alta) «stasera l'ex fonderia sarà vuota» (testi a schermo, giornale-2).

**C34-10: un'opzione che sparisce per mancanza di unità non lascia traccia: la chiamata può restare con una sola risposta.**
- e02 o3 `caldo_casa`: a schermo solo «Non intervenire» (foto `docs/foto/c34/giocatore/e02-o3-caldo_casa.jpg`); l'opzione col mediatore è nascosta da C17-03 (`src/logica/missione.ts:148-151`).
- IMPRESSIONE DA GIOCATORE: una chiamata del vice che chiede di intervenire e offre solo di non farlo sembra uno scherzo; basterebbe dire perché.

# Verificati e chiusi

| rilievo / novità | misura |
|---|---|
| **D-139 / C30-04** «?» nella barra | libero 20/20 a 5 finestre; schermate 0/1916 a 375 e 1366 (0.33.0: 142/142); rosso C96A01 34/466 + 34/466; «Conferma» ≥ 172×51 col testo intero |
| **C32-01** fuoco e Tab | «conferma-passo» 1 Tab (rosso 18); Tab 515 contro 641. Residui C34-01, C34-08 |
| **C32-06** versione su tablet/PC | 0/12 scene a 0 px (0.33.0 e rosso 8/12) |
| **C32-02** e17 | o4 via dallo stadio 50–53/69 e verso il municipio 62–65/69 a 360/412/1366; `me_lo_dovete` 29–30/40 e 36–38/40; rosso C95S01 35/34 e 0/69; salvataggio vero della 0.33.0 ripreso con `>entra` |
| Regressioni | bot uguale alla 0.33.0; 241/241; tipi 0; schermate 4 × 1916 senza scorrimenti, tagli, nomi vecchi, errori; salvataggi 12 + 3 + 7; console 0 |

# Note di metodo e limiti

- **Misura ritirata:** nessuna. La prima corsa di `c27-pixel` a 1366 è uscita subito per `H` mancante (errore della sonda, `viewport.height NaN`); rifatta con `H=768`.
- **Braccio rosso cieco della mia sonda `c34-aiuto`:** col rosso C96A01 il «?» risulta libero; il rosso l'ho dimostrato col giro schermate (§ 1.1). Non ho cercato lo stato esatto in cui la sviluppatrice lo vede coperto.
- **Rumore:** corse con 3–4 browser insieme; C33-04 (6/426) potrebbe dipendere da questo (IPOTESI, non verificata).
- **Riavvio del container:** perse le corse complete già avviate e il salvataggio della partita (§ 5). Rifatto tutto; nessun numero di questo rapporto viene dalle corse perse.
- **Non misurato:** telefoni, tablet e PC veri; WebView dell'APK; lettori di schermo; tastiera solo a 1366 (e 1024/360 per il riepilogo); salvataggi della 0.28.0 e 0.31.0; catena completa (`node tools/catena.mjs`).
- **Partita:** episodi intermedi segnati a mano; un giocatore, una volta per episodio; durata in minuti di gioco non misurabile.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c34-aiuto.mjs` | D-139: «?» (barra o riga, coperto, tocco, icona), «Conferma» (misura, testo intero), ordine della barra, scatola dell'aiuto, in 4 stati per finestra; foto | `[ROSSI=C96A01] [SCEGLI=0] [TOUCH=0] [EP=…] [MISURE=…] node coordination/sonde/c34-aiuto.mjs <radice> <uscita.json> [foto]` |
| `c34-riepilogo-fuoco.mjs` | C34-01: fuoco dopo Invio su «Conferma», in vista o no, e scena dopo un secondo Invio | `[ROSSI=C97F01] [EP=…] [MISURE=…] node coordination/sonde/c34-riepilogo-fuoco.mjs <radice> <uscita.json> [foto]` |
| `c34-schermate-blocchi.sh` | `c29-schermate.mjs` a blocchi di 9 episodi, 4 finestre in parallelo (resiste meglio ai riavvii) | `[MISURE=…] [FOTO=0] bash coordination/sonde/c34-schermate-blocchi.sh <1-4> <foto> [ROSSI]` |
| `c34-giornale.mjs` | dal giornale del pilota: tocchi, ondate e chiamate per episodio | `node coordination/sonde/c34-giornale.mjs <giornale.jsonl>` |
| `c34-giocatore-aiuti/` | aiuti del C-033 per il pilota, coi percorsi della sessione | vedi `LEGGIMI.md` |
