# Collaudo C-032: 0.29.0 (tablet e PC, correzioni piccole D-132; rifinitura e07–e09 D-138)

Novità collaudate (commento di GAME_VERSION, `src/versione.ts:200-208`): C28-01 tela della mappa, C28-02 opzione accesa sotto il puntatore fermo, C28-09 fuoco della tastiera e contorno su 5 comandi, C28-11 versione accanto alla colonna, C29-05 braccio rosso degli stemmi, C29-06 pigna, rifinitura dei testi di e07 ed e08. In più: rilievi aperti, regressioni, usabilità su telefono, tablet e PC.

- **Build collaudata:** main a 5e97c04, GAME_VERSION 0.29.0 (`src/versione.ts:209`); `npm ci` e `npx vite build` verdi.
- **Confronto «prima»:** 0.28.0 a 4132fa7 in un worktree separato (`git worktree add`, `npm ci`, `npx vite build`).
- **Cosa è cambiato fra le due** (`git diff --stat 4132fa7 5e97c04 -- src data schema tools tests index.html public`): 14 file, +154/−24. Testi `data/testi/it/e07.json` (2 righe) ed `e08.json` (4); resa `App.tsx`, `mappa/StratoCitta.tsx`, `mappa/StratoPixi.tsx`, `mappa/schermo.ts`, `schermate/Ondata.tsx`, `schermate/Scena.tsx`, `stemma.tsx`, `stile.css`; guardiani `tools/foto.mjs`, `tools/foto-c22.mjs`, `tools/foto-stemmi.mjs`. Nessun file di `src/logica`, `schema/`, `tests/`, `data/missioni/`.
- **Ramo:** claude/valmora-collaudo-c32. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-16.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), DPR 1 salvo dove detto, Node 22.22, 4 CPU, fino a 4 browser in parallelo (carico fino a 20).
- **Sonde:** riprese senza modifiche dai rami del C-028…C-031 (`c25-*`…`c31-*`); nuove `c32-*` (tabella in fondo). Per i bracci rossi nelle sonde che non hanno `ROSSI=` uso il precaricatore `c32-rossi.mjs` (`node --import`), che aggiunge `globalThis.__NO_XXX = true` a ogni pagina senza cambiare la sonda.
- **Dove sono i dati:** uscite grezze in `coordination/sonde/uscite-c32/` (i JSON grandi compressi `.json.gz`; la corsa delle schermate a 1366×768 è `schermate-1366b`); salvataggi veri della 0.28.0 in `coordination/sonde/salvataggi-028/`; foto in `docs/foto/c32/` (JPEG; `prima/` = 0.28.0, `dopo/` = 0.29.0, `rossi/` = bracci rossi; delle 1916 schermate a 360 solo e07, e08, e09, e17, e27 in `s360/`, il resto è rimasto locale).

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, marcato) · **IPOTESI** (marcata).

## Riepilogo

| verifica | esito |
|---|---|
| **C28-01** tela della mappa | tela ≠ mappa **0/1700** schermate con mappa a ognuna delle 7 misure e col dito a 768×1024 (0.28.0: 1412/1700; con la stessa sonda a 360 su 4 episodi 162/194). Rosso C86T01: 162/194. **Chiuso**. Effetto collaterale: la scena Pixi ora è disegnata su tutta la mappa e i cortei di e17 hanno cambiato verso rispetto allo stadio → **C32-02** |
| **C28-02** opzione accesa sotto il puntatore fermo | opzione **azzurra** sotto il puntatore fermo **0/39** a 360, 768, 1024, 1366 e 1920 (lo stato `:hover` c'è ancora in 18–31/39, ma non si vede). Rosso C87H01: 18/39. Dopo un movimento le opzioni si accendono ancora. **Chiuso** |
| **C28-09** fuoco della tastiera | il fuoco non resta mai sul `body` oltre 150 ms (sonda `c32-fuoco.mjs`); contorno magenta su casa, «i», «?», pastiglie, «Rispondi» (rosso C89C01: anello del browser). **Chiuso nel senso del rilievo**, ma il Tab ora riparte dalla cima della scena: «conferma-passo» della città **2 → 18 Tab** in 4/4 episodi, fino a 30 Tab nello schieramento dopo un ritiro → **C32-01** |
| **C28-11** versione | a ogni finestra **−16 px** dal bordo destro della colonna (nel margine), come sul telefono; 0.28.0 e rosso C90V01: +128…+704 px. **Chiuso**. Su tablet e PC ora tocca i pulsanti fissi e ne copre l'ombra → C32-06 |
| **C29-05** braccio rosso degli stemmi | col rosso C83S01 Square e Garden mostrano il calderone e la penna (foto), non le iniziali; alias `VECCHI_ID` tolto, piano con gli id nuovi (`tools/foto-stemmi.mjs:15-16`). **Chiuso** |
| **C29-06** pigna | scaglie **1,18 px** a DPR 1 in 6/6 casi (0.28.0: 0,76); rosso C92P01: 0,76. **Chiuso** |
| **Testi e07, e08, e09** | rigori, coppa e steward coerenti fra loro e con e03, e09, e21, e26 salvo tre punti di forma: mittente «vice» sulle battute nuove (C32-03), offerta di Lavezzari legata all'incontro col presidente dello Skyfield (C32-04), rigori senza supplementari e la scommessa di Malvasi (C32-05). Nessun altro episodio richiama il presidente in e07 o e08 |
| Rilievi aperti | C28-05 **cambiato** (e17 peggiora, C32-02); C28-14, C29-02, C29-04, C30-04, C30-05, C31-02 e i 7 casi di C27-06 **ancora presenti**, con le stesse misure (§ 3) |
| Bot, 1000 semi | **0 blocchi** in 156/156 righe; «chiamate mai comparse» `[]` 36/36; righe di blocchi ed esiti identiche alla 0.28.0 |
| Test e tipi | `npx vitest run` 42/42 file, **229/229**; `npx tsc --noEmit -p .` uscita 0 |
| Salvataggi veri | **12/12 della 0.28.0** (fra cui e07, e08, e09) e 12/12 della 0.27.0 ripresi sulla stessa chiamata; R1 6/6, R2 3/3; 0 errori. Il primo giro dava 11/12 per un difetto della mia sonda, riparato (§ 5) |
| Console | **0 errori** in tutte le corse con browser |
| Schermate con asset veri | 360, 375, 412, 1366: 1916 ciascuna, 0 scorrimenti orizzontali, 0 tagli, 0 nomi vecchi, 0 errori; nessun tipo nuovo di sovrapposizione rispetto alla 0.28.0 |
| **0.30.0 e 0.31.0** (main a 8eb495e, sezione finale) | C31-01, C31-03, C29-02, C29-04 **chiusi**, con i rossi; C32-02 attenuato in e17 (chiamata `me_lo_dovete` 25/15); 233/233 test, 0 errori |

# 1. Le novità della 0.29.0

## 1.1 Le sette misure, col mouse e col dito (C28-01 e regressioni sul telefono)

**FATTO MISURATO.** `W=… H=… [TOCCO=1] FOTO=… node coordination/sonde/c28-grandi.mjs . docs/foto/c32/dopo <uscita.json>` (sonda del C-028 invariata: 36 episodi giocati dall'interfaccia col piano del bot attento, seme 1, col mouse o col dito), riassunto `c28-analisi.mjs` (`uscite-c32/grandi-*-analisi.log`).

| misura | episodi | schermate | blocchi | errori | scorr. orizz. | tagli | fuori schermo | comandi coperti | tela ≠ mappa | chiamate con le opzioni sotto il bordo | fuori colonna |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 360×760 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | **0/1700** | 420/422 | 0 % |
| 375×667 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | **0/1700** | 422/422 | 0 % |
| 412×915 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 1 (e01 `presidente`, C27-07) | **0/1700** | 186/422 | 0 % |
| 768×1024 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | **0/1700** | 51/422 | 37,5 % |
| 768×1024 col dito | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | **0/1700** | 50/422 | 37,5 % |
| 1024×768 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | **0/1700** | 422/422 | 53,1 % |
| 1366×768 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | **0/1700** | 422/422 | 64,9 % |
| 1920×1080 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | **0/1700** | 6/422 | 75,0 % |

- **Prima (0.28.0):** con la stessa sonda tela ≠ mappa in 1412/1700 a 360 (`uscite-c31/grandi-360.json` sul ramo claude/valmora-collaudo-c31) e nelle sei corse grandi del C-028; nel worktree della 0.28.0, su e01, e13, e19, e30 a 360: **162/194** (`grandi-028-360x760-analisi.log`).
- **Braccio rosso** `ROSSI=C86T01 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c28-grandi.mjs …`, stessi 4 episodi a 360: **162/194**, come la 0.28.0. Il guardiano `controllaTela` (`tools/foto-c22.mjs:101-111`) vede il difetto.
- **Rotazione e ridimensionamento:** `EP=e01,e19 node coordination/sonde/c28-rotazione.mjs`: **40/40 cambi** (768×1024 → 1024×768 → 1366×768 → 360×760 → 1920×1080 → 768×1024, in 4 punti della partita) con scena, chiamata, pastiglie e salvataggio identici, 0 scorrimenti, tela = mappa 40/40; ricarica e «Riprendi» sulla stessa chiamata 2/2; 0 errori. Col rosso C86T01 la rotazione dà ancora 0 differenze: un cambio di finestra ripara la tela anche senza la correzione (come nel C-028 § B4), quindi la rotazione non è la misura del rosso.
- **Il telefono non è rotto:** a 360, 375 e 412 nessun tipo nuovo di sovrapposizione rispetto alla 0.28.0 (`node coordination/sonde/c32-confronta-grandi.mjs <0.28.0> <0.29.0>`: «tipi di coppia solo dopo: nessuno» a 360; le schermate che cambiano sono i segni ▲▼ transitori, 81 in più e 67 in meno, cioè rumore di tempi). A 768, 1024, 1366, 1920 contro le uscite del C-028: stesse famiglie di coppie (segni ▲▼, «chi-nome» sopra il primo paragrafo = C27-07).
- **Foto prima/dopo:** `docs/foto/c32/prima/<misura>-e19-schieramento-1.jpg` (quarto basso scuro) e `dopo/…` (mappa intera), a 360×760 e 1024×768; idem per e01, e13 ed e30. GIUDIZIO: la fascia scura non c'è più; la città riempie la cornice.

## 1.2 C28-02: col mouse, l'opzione sotto il puntatore fermo

**Correzione della misura.** La sonda del C-028 (`c28-mouse.mjs:82`) conta l'opzione in stato `:hover`. Con la correzione `:hover` resta vero, ma lo sfondo non cambia (`stile.css:61`, `.opzioni:not([data-fermo])`): su questa domanda la sonda vecchia è cieca. Nella 0.29.0 dà ancora 30/39 a 768×1024 (`mouse-768x1024-sonda-c28.log`). La copia `c32-mouse.mjs` legge anche se lo sfondo dell'opzione è quello dell'evidenza (`--ciano`), esclusa l'opzione già scelta.

**FATTO MISURATO.** `W=… H=… EP=e01,e13,e19 node coordination/sonde/c32-mouse.mjs . docs/foto/c32/mouse <uscita>`:

| misura | chiamate | sotto il puntatore fermo (`:hover`) | **azzurra** | errori | prove (trascina, ritira, rotella, episodio intero) |
|---|---|---|---|---|---|
| 360×760 (mouse) | 39 | 18 | **0** | 0 | tutte ok |
| 768×1024 | 39 | 30 | **0** | 0 | tutte ok |
| 1024×768 | 39 | 23 | **0** | 0 | tutte ok |
| 1366×768 | 39 | 22 | **0** | 0 | tutte ok |
| 1920×1080 | 39 | 31 | **0** | 0 | tutte ok |
| 1366×768, rosso C87H01 | 39 | 18 | **18** | 0 | tutte ok |

- 0.28.0 (C-031, sonda vecchia): 31/39, 29/39, 23/39 accese e azzurre.
- Dopo un movimento l'evidenza funziona: le opzioni misurate da `hover()` cambiano aspetto sotto il puntatore (3/3 a 768×1024).
- Col dito (`hasTouch`) la regola vale solo con `@media (hover: hover)`, come prima.
- Limite: in Chromium headless non nascono `pointermove` senza un movimento vero. Su un PC vero, con mouse o touchpad che tremano, il primo micro-movimento riaccende l'evidenza (`Ondata.tsx:27-34`, `once: true`): non posso confermare quanto spesso succede.

## 1.3 C28-09: tastiera

**FATTO MISURATO.** `W=1366 H=768 EP=e01,e13,e19,e30 node coordination/sonde/c28-tastiera.mjs`, più a 1024×768 e 360×760 su e01, e19; riassunto `node coordination/sonde/c32-tab-conti.mjs <uscite>`:

| corsa | episodi | azioni | Tab | Tab per azione: mediana / p90 / max | fuoco sul `body` 120 ms dopo l'azione | contorno del browser |
|---|---|---|---|---|---|---|
| 0.28.0 (C-031), 1366×768 | 4/4 | 411 | 1208 | 2 / 9 / 16 | 87 | 5 comandi |
| **0.29.0**, 1366×768 | 4/4 | 412 | **1274** | 1 / 9 / **21** | 44 | **0** |
| 0.29.0, rossi C88F01 + C89C01 | 4/4 | 411 | 1211 | 2 / 9 / 16 | 83 | 5 comandi |
| 0.29.0, 1024×768 | 2/2 | 203 | 637 | 1 / 9 / **30** | 15 | 0 |
| 0.29.0, 360×760 | 2/2 | 203 | 660 | 1 / 9 / **27** | 15 | 0 |

- **Contorno:** casa, «i», «?», pastiglie e «Rispondi» hanno `outline solid 3px rgb(224, 17, 95)` (`stile.css:37`); col rosso C89C01 `outline auto 1px` (anello del browser). 0 fuochi coperti, 0 fuori finestra, 0 tagliati.
- **Il fuoco non si perde più:** i 44 «body» della sonda del C-028 sono letti a 120 ms sotto carico, prima che la correzione intervenga (`Scena.tsx:15-24`, un `requestAnimationFrame` dopo il `focusout`). Con `W=1366 H=768 node coordination/sonde/c32-fuoco.mjs .`, che legge `document.activeElement` a 50, 150, 400, 1000 e 2000 ms: dopo la scelta di un'opzione `body` a 50 ms, **scena da 150 ms in poi**; dopo «Conferma», «conferma-davvero» e «Avanti» la scena. Nella 0.28.0 e col rosso C88F01: `body` fino a 2000 ms.
- **Ma il Tab dopo riparte dalla cima della scena** → C32-01 (§ Rilievi).
- Il fuoco sulla scena non ha contorno (`stile.css:35`, `.scena:focus { outline: none; }`): voluto, non è un comando; il Tab dopo va al primo comando.

## 1.4 C28-11: la versione

**FATTO MISURATO.** `node coordination/sonde/c29-versione.mjs <radice>` (titolo):

| finestra | 0.28.0 | **0.29.0** | 0.29.0 rosso C90V01 |
|---|---|---|---|
| 360×760, 412×915 | −16 | **−16** | −16 |
| 768×1024 | +128 | **−16** | +128 |
| 1024×768 | +256 | **−16** | +256 |
| 1366×768 | +427 | **−16** | +427 |
| 1920×1080 | +704 | **−16** | +704 |

(distanza in px fra il bordo sinistro della versione e il bordo destro della colonna; −16 = nel margine destro della colonna). Anche nelle corse di § 1.1 la versione è a −16 px a ogni misura.

**Vicinanza ai pulsanti** (`node coordination/sonde/c32-versione-pulsanti.mjs <radice>`: e01 schieramento, prima chiamata e prima risposta, 7 finestre). La versione tocca un comando (distanza 0 px dal bordo, l'ombra da 5 px del comando passa sotto la versione) in **10/21** scene nella 0.29.0, contro **4/21** nella 0.28.0. I 4 della 0.28.0 sono al telefono e restano uguali; i **6 nuovi** sono a 768×1024 (opzione), 1024×768 (Conferma, opzione), 1366×768 (Conferma, opzione, Avanti) e 1920×1080 (opzione). Foto: `dopo/1024x768-e19-schieramento-1.jpg` (in basso a destra) → C32-06.

## 1.5 C29-05 e C29-06: stemmi

**FATTO MISURATO.** `node coordination/sonde/c29-stemmi.mjs . docs/foto/c32/stemmi <uscita>` (360, 375, 412 × DPR 1 e 3; e08 Square, e06 Garden, e16 Pinegrove, e25 Belltower):
- 24/24 stemmi col disegno `…@D-128`; scaglie della pigna **1,18 px CSS** (= px a DPR 1) in 6/6 casi; 0 errori. 0.28.0 (C-031): 0,76.
- Rosso C92P01 (`ROSSI=C92P01 node --import ./coordination/sonde/c32-rossi.mjs coordination/sonde/c29-stemmi.mjs …`): scaglie 0,76 in 6/6. Il guardiano nuovo (`tools/foto-stemmi.mjs:83-87`, tratti < 1 px) ha un braccio rosso che mostra il difetto.
- Rosso C83S01: Square «fontana» → disegno del **calderone**, Garden «albero_cortile» → **penna** (foto `rossi/stemmi-360-dpr3-e08.jpg`, `…-e06.jpg`), non più le iniziali come nel C-029. Codice: `PRIMA_ID` (`src/resa/stemma.tsx:88-89`); `VECCHI_ID` non c'è più (`grep -n VECCHI_ID src/resa/stemma.tsx` → nulla); piano con gli id dei dati (`tools/foto-stemmi.mjs:15-16`; `data/club/calderholt_rovers.json` `fontana`, `quillhaven_albion.json` `albero_cortile`).
- GIUDIZIO sulla foto `stemmi/stemmi-360-dpr1-e16.jpg` ingrandita: a DPR 1 le file di scaglie si distinguono (prima erano una trama confusa).
- Nota: le foto di `rossi/` con lo stesso nome sono state sovrascritte dalla corsa C83S01; per C92P01 vale la misura.

## 1.6 Rifinitura e07–e09 (D-138): coerenza dei testi

**FATTO (dati).** `git diff 4132fa7 5e97c04 -- data/testi/it/e07.json data/testi/it/e08.json`:

| chiave | 0.28.0 | 0.29.0 | car. |
|---|---|---|---|
| `e07.ch.immagine_club` | «Il presidente dello Skyfield: festa ospiti da non rovinare, per l'immagine. Ti presta due steward.» | «Sicurezza dello Skyfield: è la loro prima volta, festa da non rovinare. Vi prestiamo due steward.» | 99 (limite 100) |
| `e07.op.declina7.r` | «Il presidente sorride lo stesso. Sorride sempre.» | «Come crede.» Gli steward tornano ai tornelli. | 46 |
| `e08.ch.consiglio_presidente` | «Il presidente dello Skyfield: al Fabbro “niente gratis”. E ti presta due steward per la fine.» | «Lavezzari, sicurezza del Kiln: al Fabbro “niente gratis”. E le presto due steward per la fine.» | 96 |
| `e08.ch.consiglio_presidente.vice` | «Il presidente dello Skyfield sa molte cose della curva del Kiln. Lo noto e basta.» | «Lavezzari sa molte cose della sua curva. Più di quante ne dice. Lo noto e basta.» | 82 |
| `e08.ch.risultato` | «Due a due. Il Fabbro ti fa sapere …» | «Due a due, il Kiln passa ai rigori. Il Fabbro: il corteo di ritorno passerà “dove passa sempre”.» | 98 |
| `e08.ch.risultato.vice` | «Pareggio: la scommessa del giorno l'ho vinta. …» | «Rigori: la scommessa del giorno l'ho vinta. Quella grande la sto perdendo, sei ancora qui.» | 92 |

`node tools/consolidamento.mjs` → «0 problemi»; `tests/brevita.test.ts` verde (229/229).

**A schermo (FATTO MISURATO).**
- `e08.ch.risultato` intero a 360×760: `docs/foto/c32/s360/360x760-e08-chiamata-risultato.jpg`.
- `immagine_club` e `consiglio_presidente` compaiono solo con `presidente_incontrato` (`data/missioni/e07.json:607-610`, `e08.json:483-486`), che il bot attento non imposta. Le ho portate a schermo con `W=360 H=760 EP=e07,e08 FOTO= FOTOCH=immagine_club,consiglio_presidente,risultato VAR=presidente_incontrato=true node coordination/sonde/c32-grandi-var.mjs . docs/foto/c32/presidente <uscita>`: 2/2 episodi, 107 schermate, 0 errori, 0 tagli; foto `presidente/360x760-e07-chiamata-immagine_club.jpg`, `…-e08-chiamata-consiglio_presidente.jpg` e le risposte.

**Coerenza (FATTO dati; GIUDIZIO dove marcato).**
- **Rigori e coppa.** e03 è Skyfield–Garden di coppa (`data/missioni/e03.json`, `partita`), vinta dal Garden ai rigori (`e03.ch.risultato`); e08 è Kiln–Square di coppa (`e08.intro2`), «il Kiln passa ai rigori». Due club diversi: nessuna contraddizione su chi è eliminato. e21 (stagione 2) è di nuovo coppa per il Kiln e non dice risultati; e26 (stagione 3) è la finale Skyfield–Domepark. Nessun testo dopo e08 dice come va il Kiln in coppa nella stagione 1 (`grep -n -i "coppa\|rigori" data/testi/it/*.json`). C28-07 («pareggio senza vincitore») **chiuso**. Resta che e03 (`e03.ondata3` «I supplementari») ed e26 (`e26.ondata3`) passano dai supplementari, e08 va dritta ai rigori (`e08.ondata3.i` «Secondo tempo», poi `e08.ch.risultato`) → C32-05. Sulla regola reale non cito norme: il campionato è di finzione, e la coerenza va misurata con e03 ed e26.
- **Chi offre gli steward.** e07 si gioca allo stadio dello Skyfield (Skyfield–Southwind, `e07.json` `partita`): la sicurezza del club di casa che presta steward è coerente con le altre chiamate «Sicurezza Skyfield» (e05, e10, e17, e18, e20, e22). e08 si gioca allo stadio del Kiln: Lavezzari, «sicurezza del Kiln United» (`comune.json:19`), è il club di casa. Il commento del vice «Più di quante ne dice» è coerente con la talpa (`docs/BIBBIA.md:90`, smascherato in e33). `e08.op.accetta8.r` «Nessuno sa chi li paghi» e `e08.op.declina8.r` «Il consiglio, almeno, era gratis» si leggono bene anche col nuovo mittente.
- **Ma:** il mittente a schermo è «Ettore Malvasi, il vice» (`fonte: vice`, `e07.json:604`, `e08.json:479`), mentre le battute sono in prima persona di altri («Vi prestiamo», «le presto») → C32-03. E le due offerte restano condizionate a `presidente_incontrato`, l'incontro col presidente dello Skyfield in e01 → C32-04.
- **Il presidente in e07/e08 citato altrove?** `grep -n -i presidente data/testi/it/*.json`: il presidente dello Skyfield resta in e01, e02, e03, e05, e06, e09, e10, e11, e12, e14, e17, e20, e22, e24. Nessuno di questi testi richiama un fatto di e07 o e08: e14 «Si ricorda la stretta di mano del derby» (e10), e02 «ricorda la stretta di mano» (e01). La BIBBIA non nomina il presidente in e07/e08 (`grep -n -i presidente docs/BIBBIA.md`: righe 53 e 78, variabile e luci di e03).
- **e09:** si gioca allo stadio dello Skyfield (Skyfield–Belltower, `e09.ch.risultato` «Due a zero Skyfield»); il presidente ha «immagini dalla tribuna» (`e09.ch.immagini_club`): coerente col club di casa. Nessun testo di e09 richiama e08.
- **Scommessa (preesistente):** `e08.intro2` «Stavolta non scommetto: guardo.» contro `e08.ch.risultato.vice` «la scommessa del giorno l'ho vinta». La riga è stata toccata da D-138 («Pareggio» → «Rigori») e la contraddizione è rimasta (`git log -S"Stavolta non scommetto"` → fccea7d) → in C32-05.

# 2. Effetto di C28-01 sui cortei (36 episodi)

**FATTO (codice).** La disposizione della città dipende dalla misura della tela: `disponi(W, H, …)` (`src/resa/mappa/sfondo.ts:71`), stadio vuoto `stadioVuoto(W, H, …)` (`:49-60`), inizio del viale al bordo basso `y: H + 12` (`:110`). Prima della correzione, nello schieramento e nelle chiamate la scena era disegnata per 322×240 dentro una mappa 328×328; ora per 322×322.

**FATTO MISURATO.** `W=360 EP=e01,…,e36 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs <radice> …` sulla 0.29.0 e sulla 0.28.0 (posizioni vere delle persone nella scena Pixi a 400 ms; 238 misure ciascuna, 0 errori); confronto `node coordination/sonde/c32-pixel-confronto.mjs <log 0.28.0> <log 0.29.0>` (`uscite-c32/pixel-confronto.log`). «Classe» = verso lo stadio ≥ 2/3, via ≥ 2/3, misto altrimenti.

- **228 cortei abbinati, 13 cambiano classe**, tutti in due episodi:

| episodio, scena, corteo | 0.28.0 | 0.29.0 |
|---|---|---|
| e17 o1 schieramento e `schermo_comizi`, ondata Strada da Kiln «entra» | 69 verso / 0 via | 36–37 / 32–33 (misto) |
| e17 o2 `ci_vediamo_dopo`, chiamata Strada da Kiln | 39 / 0 | 19 / 20 (misto) |
| e17 o4 schieramento, `me_lo_dovete`, `fine_corteo`, ondata Strada da Kiln «esce» | 0 / 69–70 | 33 / 36–37 (misto) |
| e17 o4 `me_lo_dovete`, chiamata Strada da Kiln | 6 / 34 | **30 / 10 (verso)** |
| e27 o1 schieramento e `fermata_prima`, ondata e chiamata «entra» | 42 / 27, 24 / 15 (misti) | 70 / 0, 39 / 0 |
| e27 o4 schieramento e `abbraccio`, ondata e chiamata «esce» | 26 / 43, 14 / 25 (misti) | 0 / 69–70, 0 / 39 |

- e27 migliora: entrata ed uscita ora sono nette, come dicono `entra`/`esce`.
- e17 peggiora rispetto allo stadio. e17 non ha `meta` (`data/missioni/e17.json`, mappa): il viale finisce al centro, che ora è vicino allo stadio vuoto (foto `pixel/360x760-e17-chiamata-me_lo_dovete.jpg` contro `c31/s360/…` sul ramo del C-031). Rispetto alla piazza del municipio il verso è netto: o1 69/0 verso, o4 0/70 via, chiamata `me_lo_dovete` 0/40 via.
- Testi di e17: `e17.ondata4.i` «Partita e corteo finiti: … tutti devono tornare a casa a piedi»; `e17.ch.me_lo_dovete` «Li riporto io, tutti insieme, per la strada di Kiln». GIUDIZIO: a schermo 30 su 40 persone della chiamata vanno verso lo stadio vuoto, mentre il testo dice che tornano a casa; prima andavano via in maggioranza (6/34).
- Uguale a 412: `me_lo_dovete` 31 / 9, ondata 34 / 36 (`pixel-412.log`).
- Nessun guardiano misura le posizioni sullo schermo: `tests/corteo-verso.test.ts` controlla il verso nei dati (`follaDellOndata`, `:11`) ed è verde → **C32-02**.

# 3. Rilievi aperti

| rilievo | ancora presente? | misura C-032 | C-031 |
|---|---|---|---|
| **C28-05** corteo della chiamata via dallo stadio solo in maggioranza | **sì, e in e17 peggiorato** | e17 `me_lo_dovete` **30 verso / 10 via** (stadio); e30 col municipio come riferimento: `fiaccolata` 0/39, `silenzio_totale` 39/0 (§ 2) | 6/34 |
| **C28-14** nomi sotto le pastiglie | **sì** | `c28-c2611.mjs` su `schermate-360.json`: e13 «Viale fra stadio e piazza» × pastiglia 15,8×10,4 px in 24 schermate; e16 «Magazzino delle fonderie» 34,6×6,0 in 16; a 375 e13 12,1×9,6 in 16 | uguale |
| **C29-02** e04 o2 «entra» che va via dallo stadio | **sì** | `coro_fonderie`: ondata **8 verso / 61 via**, chiamata **4 / 35** (360); 412: 19/51, 13/27 | 11/59, 9/30 |
| **C29-04** «Urgente!» non spiegato nella guida | **sì** | urgenti a schermo **211/422** a 360, 375, 412, 1366; 0 righe con «urgent» in `data/testi/it/comune.json` | 211/422 |
| **C30-04** 1366×768: vignetta della sala e «?» coperto | **sì** | `c29-schermate.mjs` a 1366×768: vignetta della sala **5/36**; «?» coperto da `BUTTON.pulsante` in **142/142** schermate «info» | 5/36; 142/142 |
| **C30-05** 10 incoerenze e 6 difetti di forma nei testi | **sì** | `git diff 4132fa7 5e97c04 -- data/testi` tocca solo e07 ed e08; nessuna delle chiavi di C30-05 è in e07/e08 | — |
| **C31-02** e30 o2 corteo che parte dal bordo e si avvicina allo stadio | **sì** | ondata **57 verso / 13 via** (stadio), chiamata **31 / 8**; verso il municipio 70/0 e 39/0 | 57/69 vicini; 29/39 |
| **C27-06**, i 7 casi | **sì**, tutti e 7 a 360 | `node coordination/sonde/c29-pastiglie.mjs`: e05 o3 11 px², e13 o1 e o4 164 px², e13 o2 35 px², e16 o1 e o2 208 px², e35 o2 149 px²; a 375 tre (e13 o1 e o4 116 px², e35 o2 149 px²), a 412 zero; nomi su nomi 0, pastiglie col centro coperto 0 | uguale |

Anche C31-01 (nessun guardiano per e21 o3) e C31-03 («parenti»/«familiari») restano: né `tests/` né `e35.json` sono cambiati.

# 4. Regressioni (FATTO MISURATO)

- **Bot:** `node tools/bot.mjs 1000` (`uscite-c32/bot-1000.log`): 156/156 righe missione × strategia con **blocchi 0/1000**; «chiamate mai comparse» `[]` in 36/36. `diff` delle righe di blocchi ed esiti con la 0.28.0 (`uscite-c31/bot-1000.log`): **vuoto**.
- **Test e tipi:** `npx vitest run` → «Test Files 42 passed (42) · Tests 229 passed (229)» (`vitest.log`); `npx tsc --noEmit -p .` uscita 0 (`tipi.log`). I guardiani nuovi della 0.29.0 stanno nella catena delle foto (`tools/foto.mjs:158`, `:277`), non in `tests/`: il numero dei test non cambia.
- **Console:** 0 errori di pagina e di console in tutte le corse con browser (7 + 1 corse grandi da 1881 schermate, 4 corse di schermate da 1916, mouse 6, tastiera 4, rotazione 2, stemmi 3, pixel 4, salvataggi 3, ripresa, sonde nuove).
- **Schermate con asset veri:** `W=… H=… [FOTO=1] node coordination/sonde/c29-schermate.mjs . docs/foto/c32/s<W> <uscita>`, 36 episodi, piano del bot attento, seme 1; analisi `c28-schermate-analisi.mjs`:

| misura | schermate | scorr. orizz. | tagli | nomi vecchi | comandi coperti | errori | vignetta sala / verbale |
|---|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 0 | 0 | 36/36, 36/36 |
| 375×667 | 1916 | 0 | 0 | 0 | 142 («?» sotto la barra, come C-026…C-031) | 0 | 0/36, 0/36 (D-126 d) |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, C27-07) | 0 | 36/36, 36/36 |
| 1366×768 | 1916 | 0 | 0 | 0 | 142 («?» sotto il pulsante fisso, C30-04) | 0 | 5/36, 36/36 |

  Contro le uscite del C-031 a 360, 375, 412 e 1366 (`c32-confronta-grandi.mjs`): nessun tipo nuovo di sovrapposizione. Urgenti a schermo 211/422 a ogni misura, 0 diversi dall'atteso (`c29-urgenza-analisi.mjs`). Sfida «… contro …» in e07, e13, e15, e21, e25, e27, e28, e31 uguale al C-031.
- **Salvataggi veri della 0.28.0:**
  - Comando: `EP=e01,e04,e07,e08,e09,e13,e17,e19,e21,e25,e30,e33 VA=0.28.0 VECCHI_DIR=coordination/sonde/salvataggi-027 node coordination/sonde/c32-salvataggi.mjs <0.28.0> . coordination/sonde/salvataggi-028 <uscita>`.
  - Esito: **12/12** salvataggi esportati col pulsante dalla 0.28.0 a metà della prima ondata (fra cui e07, e08 ed e09), importati nella 0.29.0 e ripresi sulla **stessa chiamata**; 12/12 veri della 0.27.0 ripresi; 0 errori (`salvataggi-giro2.log`).
  - **Misura ritirata:** il primo giro con `c28-salvataggi.mjs` dava 11/12 (e33). Sotto carico il «continua» non compariva entro 5 s, la sonda ignorava l'errore (`.catch(() => {})`) ed esportava sulla scena «risposta». Rifatta da sola, e33 passa 2/2 (`salvataggi-e33-giro{1,2}.log`). Ho riparato lo strumento (`c32-salvataggi.mjs`: attesa vera, 30 s) e rifatto tutti i 12.
  - `EP=e01,e07,e08,e17,e21,e30 node coordination/sonde/c25-ripresa.mjs . <uscita>`: R1 6/6 (ricarica, esporta, importa), R2 3/3 (salvataggi della 0.4.0 di `tests/salvataggi-reali/`), 0 errori.
  - Limite: i salvataggi sono a metà dell'ondata 1; uno della 0.28.0 dentro e08 ondata 4 (testo cambiato) non l'ho provato. Le chiavi dei testi non cambiano, solo il valore.

# 5. Usabilità e realismo (GIUDIZIO, marcato)

- **Telefono (360–412):** la mappa ora è piena fino in fondo: settori, nomi e pastiglie del quarto basso stanno sulla città e non più sul nero. È la differenza più visibile della 0.29.0 (foto `prima/` contro `dopo/`). Nessun peggioramento misurato: niente scorrimenti, tagli o coperture nuove.
- **Tablet verticale (768×1024):** come nel C-028, godibile; mappa piena, nessuna opzione già accesa sotto il mouse.
- **Tablet orizzontale e PC (1024×768, 1366×768):** si gioca, ma resta la scomodità principale del C-028 (C28-03, scelta di progetto): opzioni sotto il bordo in 422/422 chiamate e più di metà dello schermo vuota. La versione ora sta accanto alla colonna, ma appoggiata ai pulsanti (C32-06).
- **PC grande (1920×1080):** tutto in una schermata, gioco piccolo al centro (75 % vuoto), come prima.
- **Tastiera:** il miglioramento c'è (contorno ben visibile su tutti i comandi, nessun fuoco «sparito»), ma chi gioca solo da tastiera trova un passo più lungo: dopo «Gioca l'episodio» servono 18 Tab per arrivare alla conferma. Prima ne bastavano 2 (C32-01).
- **Mouse:** nessun dubbio di «scelta già fatta» all'apertura della chiamata; appena si muove il mouse l'evidenza torna. Buono.
- **e07/e08:** i testi nuovi si leggono bene e sono nel tono radio. La sicurezza del club di casa che presta steward è più verosimile del presidente di un altro club. «Lavezzari sa molte cose della sua curva. Più di quante ne dice» prepara bene e33. Stona che a parlare sembri il vice (C32-03), e che l'offerta arrivi solo a chi ha incontrato il presidente dello Skyfield (C32-04).
- **Realismo:** le novità non aggiungono procedure o termini di polizia; nessun riferimento reale da verificare su fonti.

# Rilievi (per gravità)

## Alto

Nessuno.

## Medio

**C32-01: la correzione di C28-09 allunga il cammino col Tab: «conferma-passo» della città da 2 a 18 Tab, fino a 30 Tab nello schieramento dopo un ritiro.**
- Riproduzione: a 1366×768, solo tastiera: città → stagione 1 → e01 → Tab fino a «Gioca l'episodio», Invio → Tab fino alla conferma.
- Misura (`c32-fuoco.mjs`): **18 Tab** nella 0.29.0, 2 nella 0.28.0 e 2 col rosso C88F01. In `c28-tastiera.mjs` 18 Tab in **4/4** episodi a 1366, 2/2 a 1024 e a 360 (0.28.0, C-031: 2). Dopo il ritiro di un'unità dalla pastiglia, il settore seguente arriva a 27 Tab (360) e 30 (1024). In totale 1274 Tab contro 1208 (rosso: 1211), massimo per azione 21 contro 16.
- Causa (FATTO codice e IPOTESI sul browser): quando il comando col fuoco sparisce, la correzione mette il fuoco sulla scena (`src/resa/schermate/Scena.tsx:15-24`) e il Tab riparte dal primo comando della scena, cioè dalla cima. Prima il fuoco restava sul `body`; IPOTESI: Chromium faceva ripartire il Tab dal punto in cui stava il comando tolto (il «punto di partenza della navigazione»), quindi vicino al comando dopo. Lo dicono i numeri (2 Tab), il meccanismo del browser non l'ho verificato su documentazione.
- Il guardiano `controllaFuoco` (`tools/foto-c22.mjs:140-144`) controlla solo che il fuoco non sia sul `body`: non vede la distanza.
- Dove migliora: dopo «Avanti» della risposta e alcune scelte serve un Tab in meno (42 azioni con meno Tab, 20 con più: `uscite-c32/tab-confronto-1366.log`).

**C32-02: con la tela intera (C28-01) la città è disegnata su un'altezza diversa e in e17 i cortei della Strada da Kiln hanno cambiato verso rispetto allo stadio.**
- Misura (§ 2): su 228 cortei dei 36 episodi ne cambiano 13; in e17 7 peggiorano (da netti a misti, e la chiamata `me_lo_dovete` da 6 verso / 34 via a **30 / 10**), in e27 6 migliorano.
- Testi di e17 o4: «tutti devono tornare a casa a piedi», «Li riporto io … per la strada di Kiln».
- Nessun guardiano: `tests/corteo-verso.test.ts` legge il verso nei dati, non le posizioni a schermo, ed è verde. Le misure sui pixel finora erano fatte su una scena schiacciata a 4:3; quelle nuove sono le prime sulla scena giusta.
- Da decidere se e17 debba avere una `meta` o un riferimento diverso dallo stadio (come e30 col municipio, C30-01).
- **Nella 0.31.0** (viale dal bordo più vicino, C29-02) e17 migliora ma non torna come prima: la chiamata `me_lo_dovete` fa **25 verso / 15 via** (misto); le ondate o1 sono 47/22 «entra», le o4 19–21/48–50 «esce» (§ «0.30.0 e 0.31.0»).

## Basso

**C32-03: e07 ed e08: il mittente a schermo è «Ettore Malvasi, il vice», ma le battute nuove sono in prima persona della sicurezza dello Skyfield e di Lavezzari.**
- FATTO: `fonte: vice` (`data/missioni/e07.json:604`, `e08.json:479`); a schermo «ETTORE MALVASI, IL VICE» con la vignetta del vice sopra «Vi prestiamo due steward» e «le presto due steward» (foto `presidente/360x760-e07-chiamata-immagine_club.jpg`, `…-e08-chiamata-consiglio_presidente.jpg`).
- Le altre chiamate di Lavezzari hanno `fonte: ufficio_sicurezza_cinderwick`, «Gianni Lavezzari, sicurezza del Kiln United» (es. e16 `corteo_fonderie`, e19 `ora_prima`, e22 `ridateci`); quelle della sicurezza dello Skyfield hanno `ufficio_sicurezza_larkspire` (e05 `volontari`, e10 `collina_risponde`). Prima di D-138 le due battute erano discorso riferito («Il presidente … ti presta»), coerenti col vice che riferisce.
- GIUDIZIO: o si cambia la fonte, o si torna al discorso riferito.

**C32-04: le offerte di e07 ed e08 compaiono solo a chi ha incontrato il presidente dello Skyfield in e01.**
- FATTO: `se: { var: presidente_incontrato, uguale: true }` (`e07.json:607-610`, `e08.json:483-486`), impostata in e01 (`e01.json:473`).
- GIUDIZIO: per e07 (stadio dello Skyfield) il legame si regge; per e08 l'offerta è di Lavezzari, sicurezza del Kiln, che col presidente dello Skyfield non ha un legame scritto. Chi in e01 non è salito in tribuna non riceve mai l'offerta di Lavezzari. Non è un blocco: la chiamata è facoltativa.

**C32-05: e08: «il Kiln passa ai rigori» senza supplementari, mentre e03 ed e26 (stessa coppa) li hanno; e la scommessa di Malvasi.**
- FATTO: `e03.ondata3` «I supplementari», `e26.ondata3` «Supplementari: la finale non si è chiusa al novantesimo»; e08: `e08.ondata3.i` «Secondo tempo», poi `e08.ch.risultato` «Due a due, il Kiln passa ai rigori».
- FATTO (preesistente, da fccea7d): `e08.intro2` «Stavolta non scommetto: guardo.» contro `e08.ch.risultato.vice` «Rigori: la scommessa del giorno l'ho vinta».
- GIUDIZIO: due parole bastano («dopo i supplementari»; «la scommessa di ieri»). C28-07 (pareggio senza vincitore) è chiuso.

**C32-06: su tablet e PC la versione ora tocca i pulsanti fissi e ne copre l'ombra.**
- Misura (§ 1.4): distanza 0 px e ombra sotto la versione in 6 scene nuove su 21 (768, 1024, 1366, 1920), oltre alle 4 del telefono che c'erano già.
- Causa (FATTO codice): `right: max(0%, calc((100% - var(--larghezza-max)) / 2))` (`stile.css:376`) mette la versione nei 16 px del margine destro della colonna, dove arriva l'ombra dei pulsanti larghi quanto la colonna. Sul telefono era già così (`stile.css:373`).
- GIUDIZIO: si nota solo guardando l'angolo; non copre testo né comandi (0 comandi coperti in tutte le corse).

# Verificati e chiusi

| rilievo / novità | misura |
|---|---|
| **C28-01** tela della mappa | 0/1700 a 360, 375, 412, 768 (mouse e dito), 1024, 1366, 1920; rotazione 40/40; rosso C86T01 162/194 come la 0.28.0. Effetto sui cortei in C32-02 |
| **C28-02** opzione accesa sotto il puntatore fermo | azzurra 0/39 a 5 misure; rosso C87H01 18/39; evidenza col movimento intatta |
| **C28-09** fuoco perso e contorno | fuoco mai sul `body` oltre 150 ms; contorno magenta su 5/5 comandi (rosso C89C01: anello del browser). Effetto sul Tab in C32-01 |
| **C28-11** versione | −16 px dalla colonna a 6 finestre (rosso C90V01 +128…+704). Residuo C32-06 |
| **C29-05** rosso degli stemmi | rosso C83S01: calderone e penna; `VECCHI_ID` tolto; piano con gli id nuovi |
| **C29-06** pigna | scaglie 1,18 px a DPR 1 (rosso C92P01: 0,76) |
| **C28-07** coppa di e08 senza vincitore | «il Kiln passa ai rigori»; residuo di forma in C32-05 |
| Presidente in e07/e08 (D-138) | tolto da 4 testi; nessun altro episodio vi fa riferimento; e09 coerente |
| **C31-01** (0.30.0) e21 o3 senza guardiano | `tests/meta-fase.test.ts:49-50`: togliendo la fase, 1 test rosso su 6 |
| **C31-03** (0.30.0) «parenti»/«familiari» | `e35.ch.fine_trattativa` «i familiari aspettano» |
| **C29-02** (0.31.0) e04 o2 «entra» che va via | ondata 69/0, chiamata 40/0 verso lo stadio (rosso C93V01: 8/61, 3/36) |
| **C29-04** (0.31.0) «Urgente!» nella guida | `guida.5` lo spiega, intero a 360, 375, 412, 1366 |
| Regressioni | bot 0 blocchi 156/156 × 1000 semi, uguale alla 0.28.0; 229/229 test; tipi 0; salvataggi 12/12 (0.28.0) + 12/12 (0.27.0) + 6/6 + 3/3; 0 errori di console; schermate a 4 misure senza scorrimenti, tagli, nomi vecchi né sovrapposizioni nuove |

# Note di metodo e limiti

- **Misure ritirate o corrette:** (1) C28-02 con la sonda del C-028: conta `:hover`, non il colore, e dà 30/39 anche con la correzione; sostituita da `c32-mouse.mjs` (§ 1.2). (2) Salvataggi 11/12 al primo giro: difetto della sonda, riparata e rifatta (§ 4). (3) «Fuoco perso 44/412» di `c28-tastiera.mjs`: letto a 120 ms, prima che la correzione agisca; il fuoco perso davvero è 0 (§ 1.3).
- **Corse interrotte:** la coda del mouse si è fermata dopo le 4 misure grandi (la corsa rossa C87H01 senza uscita all'inizio); rifatta. Nel rifarla ho lanciato per errore una seconda copia della corsa rossa mentre la prima era ancora viva: l'ho fermata subito, ma il log della prima è stato troncato. Il JSON (`mouse-1366x768-rosso-c87h01.json`, scritto per intero alla fine) è quello citato.
- **Cosa non ho misurato:** telefoni, tablet e PC veri, DPR reali, WebView dell'APK, rotazione fisica, tastiere esterne, lettori di schermo (la scena che prende il fuoco potrebbe farsi leggere per intero: non posso confermarlo); trascinamento col dito; salvataggi della 0.28.0 dentro e08 ondata 4.
- **Carico:** fino a 4 browser su 4 CPU (carico fino a 20). I secondi reali nei log dicono solo quanto è durata una corsa. Le corse del verso sui pixel e del mouse sono state confrontate solo con corse fatte nelle stesse condizioni.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c32-rossi.mjs` | precaricatore: accende i bracci rossi in qualsiasi sonda che usa `chromium.launch` + `newPage` | `ROSSI=C86T01[,…] node --import ./coordination/sonde/c32-rossi.mjs <sonda> …` |
| `c32-mouse.mjs` | come `c28-mouse.mjs`, più «azzurra»: l'opzione sotto il puntatore fermo ha lo sfondo dell'evidenza | `W=… H=… EP=… node coordination/sonde/c32-mouse.mjs <radice> <foto> <uscita>` |
| `c32-fuoco.mjs` | solo tastiera, e01: dove sta il fuoco a 50–2000 ms dopo ogni tasto, Tab fino al comando dopo | `W=1366 H=768 node coordination/sonde/c32-fuoco.mjs <radice>` |
| `c32-tab-conti.mjs` | dalle uscite di `c28-tastiera.mjs`: Tab per azione, dopo un fuoco perso, dove resta il fuoco | `node coordination/sonde/c32-tab-conti.mjs <uscite…>` |
| `c32-versione-pulsanti.mjs` | distanza fra la versione e i comandi alla stessa altezza, 7 finestre | `node coordination/sonde/c32-versione-pulsanti.mjs <radice>` |
| `c32-confronta-grandi.mjs` | due uscite di `c28-grandi.mjs`/`c29-schermate.mjs`: tipi di sovrapposizione comparsi o spariti | `node coordination/sonde/c32-confronta-grandi.mjs <prima.json> <dopo.json>` |
| `c32-pixel-confronto.mjs` | due log di `c27-pixel.mjs` su tutti gli episodi: cortei che cambiano classe (verso / via / misto) rispetto allo stadio | `node coordination/sonde/c32-pixel-confronto.mjs <log prima> <log dopo>` |
| `c32-grandi-var.mjs` | come `c28-grandi.mjs` con variabili iniziali (`VAR=`) e foto di chiamate scelte (`FOTOCH=`) | `W=… H=… EP=… VAR=presidente_incontrato=true FOTOCH=… node coordination/sonde/c32-grandi-var.mjs <radice> <foto> <uscita>` |
| `c32-salvataggi.mjs` | come `c28-salvataggi.mjs`, con l'attesa vera del «continua» (30 s) | come `c28-salvataggi.mjs` |
| `c32-guida.mjs` | guida introduttiva da memoria vuota, passo 5: testo, tagli, scorrimenti, pulsanti, foto, a 4 finestre | `node coordination/sonde/c32-guida.mjs <radice> <foto>` |
| `c32-presidente.mjs` | tentativo a mano di e07/e08 con `presidente_incontrato`: **non usata** (si ferma nelle transizioni); sostituita da `c32-grandi-var.mjs` | — |

# 0.30.0 e 0.31.0 (aggiunta su richiesta della principale)

- **Build:** main a 8eb495e, GAME_VERSION 0.31.0 (`src/versione.ts:219`, commenti `:209-218`); worktree separato, `npm ci` e `npx vite build` verdi.
- **Cosa è cambiato dalla 0.29.0** (`git diff --stat 5e97c04 8eb495e -- src data schema tools tests`): 7 file, +73/−4: `data/testi/it/comune.json` (`guida.5`), `data/testi/it/e35.json` (`e35.ch.fine_trattativa`), `src/resa/mappa/sfondo.ts` (+20, `bordoLontano`), `src/versione.ts`, `tests/meta-fase.test.ts` (+2), `tests/urgente.test.ts` (+8), `tests/viale.test.ts` (nuovo, 31 righe).
- Uscite in `coordination/sonde/uscite-c32/v031/`, foto in `docs/foto/c32/v031/`.

| voce | esito | misura |
|---|---|---|
| **C31-01** (0.30.0) guardiano della fase di e21 o3 | **chiuso** | `tests/meta-fase.test.ts:49-50` chiede `spalti` = `pieni` in e21 o3. Braccio rosso nel worktree: tolta `"fase": "partita"` da e21 ondata 3 → `npx vitest run tests/meta-fase.test.ts` **rosso**, 1 fallito su 6 («expected 'deflusso' to be 'pieni'», `rosso-c3101-meta-fase.log`); dati veri ripristinati (`git checkout`) → 6/6 verdi |
| **C31-03** (0.30.0) «parenti» contro «familiari» | **chiuso** | `e35.ch.fine_trattativa` (`data/testi/it/e35.json:106`): «Comando: finita. Ostaggi illesi, rapinatori arresi. La folla guarda, i familiari aspettano.», 93 caratteri (limite 100). «Familiari» come in `e35.ch.familiari`, `e35.op.corridoio`, `e35.op.corridoio.r`, `e35.op.steward_familiari.r`, `e35.op.rimanda_comando.r`; nessun «parenti» in e35. GIUDIZIO: «la folla guarda, i familiari aspettano» porta bene alla scelta dopo (corridoio fino ai familiari) |
| **C29-02** (0.31.0) e04: corteo «entra» che va via dallo stadio | **chiuso** | `W=360 EP=e01,…,e36 RIF=piazza_municipio node coordination/sonde/c27-pixel.mjs`: e04 o2 `coro_fonderie` ondata **69 verso / 0 via**, chiamata **40 / 0**; o1 ondata parcheggi 70 / 0 (0.29.0: 8/61 e 5/35). Rosso `ROSSI=C93V01` (stessa sonda, EP=e04,e17): 8/61 e 3/36, come prima. Guardiano `tests/viale.test.ts` col suo rosso dentro (3/3 verdi) |
| **C29-04** (0.31.0) «Urgente!» nella guida | **chiuso** | `guida.5` (`data/testi/it/comune.json:105`) spiega il timbro: «nel settore della chiamata, in questa ondata, c'è un evento grave. Vale per il posto, anche se chi chiama parla d'altro»; coerente con la regola D-129 misurata a schermo (urgenti 211/422, 0 diversi dall'atteso). `node coordination/sonde/c32-guida.mjs <radice> <foto>` sulla guida introduttiva, passo 5/6: testo intero, 0 tagli, 0 scorrimenti verticali e orizzontali, pulsanti dentro la finestra, a **360×760, 375×667, 412×915** e 1366×768; 0 errori. Foto `v031/guida/<misura>-guida-5.jpg`; prima `guida-029/…` |

**Effetto del viale nuovo sugli altri cortei (FATTO MISURATO).** `bordoLontano` (`src/resa/mappa/sfondo.ts:72-81`) vale per **tutte** le strade senza `meta` (`:127-128`), non solo per e04. Confronto sui 36 episodi, 0.29.0 contro 0.31.0 (`node coordination/sonde/c32-pixel-confronto.mjs`, `v031/pixel-confronto-029-031.log`): 231 cortei abbinati, **12 cambiano classe**, tutti in e04 (5, quelli corretti) ed e17 (7). Nessun altro episodio cambia.

| e17 (strada da Kiln, senza meta) | 0.28.0 | 0.29.0 | **0.31.0** |
|---|---|---|---|
| o1 ondata «entra» | 69 verso / 0 via | 36 / 33 | **47 / 22** |
| o2 chiamata `ci_vediamo_dopo` | 39 / 0 | 19 / 20 | **26 / 13** |
| o4 ondata «esce» | 0 / 69–70 | 33 / 36–37 | **19–21 / 48–50** |
| o4 chiamata `me_lo_dovete` | 6 / 34 | 30 / 10 | **25 / 15** |

C32-02 è quindi **attenuato, non chiuso**: in e17 le ondate tornano in maggioranza nel verso giusto, ma la chiamata `me_lo_dovete` («Li riporto io … per la strada di Kiln») va ancora in maggioranza verso lo stadio (25 su 40).

**Regressioni sulla 0.31.0 (FATTO MISURATO).**
- `npx vitest run`: **43/43 file, 233/233** test (`v031/vitest.log`); `npx tsc --noEmit -p .`: uscita 0.
- `node tools/bot.mjs 1000`: 0 blocchi in 156/156, «mai comparse» `[]` 36/36; righe di blocchi ed esiti **identiche** alla 0.29.0 (`v031/bot-1000.log`).
- `W=360 H=760 node coordination/sonde/c29-schermate.mjs`: 1916 schermate, 0 nomi vecchi, 0 scorrimenti, 0 tagli, 0 tocchi coperti, **0 errori**; urgenti 211/422; C28-14 invariato.
- Sovrapposizioni: stessi tipi di coppia della 0.29.0, ma in 251 schermate in più c'è un segno ▲▼ transitorio sopra una pastiglia o un nome. Il codice dei segni non è cambiato. Prova con lo stesso carico, e01 ed e02 due volte per build: 0.29.0 53 e 54, 0.31.0 53 e 53 (`v031/segni-*.json`). La differenza viene quindi dal carico durante le corse (la 0.29.0 girava con 4 browser, la 0.31.0 con 2), non dalla build.
- Non rifatte sulla 0.31.0: misure grandi, mouse, tastiera, rotazione, salvataggi. La 0.31.0 non tocca quei file (diff sopra), ma non posso confermarle con una misura.
