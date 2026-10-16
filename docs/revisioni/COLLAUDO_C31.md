# Collaudo C-031: 0.28.0

Novità collaudate (commento di GAME_VERSION, `src/versione.ts:194-199`): C30-01 corteo di e30 verso il municipio, C30-02 `fase: partita` in e21 ondata 3, C30-03 testi `e24.ch.busta` ed `e35.ch.fine_trattativa`. In più: versi dei cortei su 36 episodi, rilievi aperti di C-028/C-029/C-030, C28-07 (coppa), regressioni, usabilità.

- **Build collaudata:** main a 4132fa7, GAME_VERSION 0.28.0 (`src/versione.ts:200`); `npm ci` e `npx vite build` verdi.
- **Confronto «prima»:** 0.27.0 a f4bc982 in un worktree separato (`git worktree add`, `npm ci`, `npx vite build`).
- **Cosa è cambiato fra le due** (`git diff --stat f4bc982 4132fa7`): solo `data/missioni/e21.json` (+1 riga), `data/missioni/e30.json` (−1), `data/testi/it/e24.json` e `e35.json` (1 riga ciascuno), `src/versione.ts` (commento e numero), `tests/corteo-verso.test.ts`, più governo e STABILITA. Nessun file di `src/resa`, `src/logica`, `tools/`, `index.html`, `public/`.
- **Ramo:** claude/valmora-collaudo-c31. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato. Il braccio rosso di C30-02 l'ho fatto in un worktree temporaneo fuori dal ramo, poi rimosso.
- **Data:** 2026-10-16.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository), Node 22.22, 4 CPU, fino a 4 browser in parallelo (carico fino a 12).
- **Sonde:** riprese senza modifiche dal ramo claude/valmora-collaudo-c30 (`c25-*`…`c30-*`); nuove `c31-verso-testi.mjs` e `c31-rif-tabella.mjs`.
- **Dove sono i dati:** uscite grezze in `coordination/sonde/uscite-c31/`; salvataggi veri della 0.27.0 in `coordination/sonde/salvataggi-027/`; foto in `docs/foto/c31/` (`prima/` = 0.27.0, `dopo/` = 0.28.0, `s360/` tutte le schermate a 360; a 375, 412 e 1366 solo una selezione, il resto è rimasto locale).

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, marcato) · **IPOTESI** (marcata).

## Riepilogo

| verifica | esito |
|---|---|
| **C30-01** e30 ondata 2 | corteo dell'ondata verso il municipio **0/69 → 69/69**; chiamata `silenzio_totale` **1/39 → 39/39**; uguale a 360, 375, 412. Ondata 4 resta 69/69 via. **Chiuso**. Resta un dettaglio: il corteo parte dal bordo della mappa e si avvicina allo stadio (57/69), mentre il testo dice «dallo stadio» → C31-02 |
| **C30-02** e21 ondata 3 | `data-folla` = `pieni` a 360, 375, 412; discordanze fase/testi su 98 ondate **1 → 0** (rosso C84F01: 9). **Chiuso**. Ma nessun guardiano: togliendo la riga, 229/229 test verdi → C31-01 |
| **C30-03** due testi | `e24.ch.busta` dice di nuovo che nella busta c'è il nome; `e35.ch.fine_trattativa` dice chi si è arreso. Coerenti con e24, e25, e31, e33 e con e35, e36. **Chiuso**. Un residuo di forma: «parenti» contro «familiari» → C31-03 |
| Versi dei cortei, 36 episodi | 85 ondate con cortei o chiamate su strada: **cambiate solo e30 o2 (corteo) ed e21 o3 (spalti)** rispetto alla 0.27.0. I contrasti testo/verso del C-027 non toccati restano (§ 2) |
| Rilievi aperti C28-01, 02, 05, 09, 11, 14; C29-02, 04, 05, 06; C30-04, 05 | **tutti ancora presenti** (§ 3); codice di `src/resa` invariato |
| **C28-07** coppa senza supplementari | **ancora presente**: e08 finisce «Due a due… Pareggio» senza supplementari, rigori o «andata»; e21 non dà il risultato: coerente (§ 4) |
| Bot, 1000 semi | **0 blocchi** in 156/156 righe; «chiamate mai comparse» `[]` in 36/36 |
| Test e tipi | `npx vitest run`: 42/42 file, **229/229** test; `npx tsc --noEmit -p .`: uscita 0 |
| Salvataggi veri | **12/12 della 0.27.0** (fra cui e21, e24, e30, e35) e 12/12 della 0.25.0 ripresi sulla stessa chiamata; R1 6/6; R2 3/3; 0 errori |
| Schermate | SCHERMATE_RIGA |

# 1. Le novità della 0.28.0

## 1.1 C30-01: e30, corteo verso il municipio

**FATTO (dati/codice).**
- Tolto `"verso": "dallo_stadio"` dall'evento `silenzio_strada` di e30 ondata 2 (`git diff f4bc982 4132fa7 -- data/missioni/e30.json`). Resta su `fiaccole` (ondata 4).
- Senza `verso` e senza partita il corteo è «entra» (`src/resa/mappa/folla.ts:39-41`); «entra» va verso la fine del viale, che con la `meta` è la piazza del municipio (`src/resa/mappa/sfondo.ts:106-111`, `data/missioni/e30.json:62`).
- Il corteo della chiamata segue quello dell'ondata (`esceDinamica`, `folla.ts:52-55`).

**FATTO MISURATO.** `W=… EP=e30,e21 RIF=piazza_municipio [FOTO=1] node coordination/sonde/c27-pixel.mjs <radice> <foto> <uscita>`, riassunto con `node coordination/sonde/c31-rif-tabella.mjs <log>` (posizioni vere delle persone nella scena Pixi, a 400 ms; «verso» = la distanza cala).

| scena | 0.27.0 (360) | 0.28.0 a 360 | 375 | 412 |
|---|---|---|---|---|
| o2, corteo dell'ondata, rispetto al municipio | 0 verso / 69 via | **69 / 0** | 70 / 0 | 69 / 0 |
| o2, chiamata `silenzio_totale`, rispetto al municipio | 1 / 38 | **39 / 0** | 40 / 0 | 39 / 0 |
| o3, ondata / chiamata `saluto_larkspire` | 69/0, 38/0 | 70/0, 40/0 | uguale | uguale |
| o4, ondata / chiamata `fiaccolata` | 0/69, 0/39 | 0/69, 0/39 | 0/69, 1/38 | 0/69, 0/40 |

- `data-folla` a schermo: o2 `vuoti|strada_cinderwick>entra` (prima `>esce`).
- Uscite: `uscite-c31/pixel-e30-e21{,-027}.log`, `pixel-foto-{360,375,412}.log`, `pixel-foto-027-{360,375,412}.log`.
- Foto: `docs/foto/c31/{prima,dopo}/{360x760,375x667,412x915}-e30-chiamata-silenzio_totale.png` e `…-e30-schieramento-{2,3,4}.png`. Le foto ferme di prima e dopo sono quasi uguali: il verso si vede solo in movimento, per questo vale la misura sulla scena Pixi.
- **Guardiano:** `tests/corteo-verso.test.ts` ora chiede `entra` per e30 o2 e per la chiamata (`:17`, `:34`); i rossi C73V01/C74D01 provano o4. Se qualcuno rimette `verso: dallo_stadio` su o2, il test diventa rosso (IPOTESI dalla lettura del test; non l'ho provato).

**Rispetto allo stadio (FATTO MISURATO), la parte non risolta.** Nella stessa misura il corteo di o2 **si avvicina allo stadio** vuoto: 57/69 a 360, 58/69 a 375 e a 412; chiamata 29/39, 32/39 a 412.
- Motivo (FATTO codice): il viale parte dal bordo basso della mappa (`sfondo.ts:110`, e30 non ha stazione) e passa sotto il piazzale salendo verso la piazza del municipio (foto `dopo/360x760-e30-chiamata-silenzio_totale.png`).
- Il testo dice «Il corteo si muove in silenzio dallo stadio verso il municipio» (`e30.ondata2.i`) e l'ondata 1 «la curva si raduna allo stadio per il corteo al municipio» (`e30.ondata1.i`).
- GIUDIZIO: la meta è giusta; la partenza no: il corteo arriva dal bordo, passa accanto allo stadio e va al municipio. Minore → C31-02.

## 1.2 C30-02: e21 ondata 3

**FATTO (dati).** `"fase": "partita"` in e21 ondata 3 (`git diff f4bc982 4132fa7 -- data/missioni/e21.json`).

**FATTO MISURATO.**
- `node coordination/sonde/c30-fasi.mjs`: e21 o3 `fase=partita → spalti pieni` (prima `deflusso`). Uscita `uscite-c31/fasi.log`.
- `node coordination/sonde/c30-fasi-tutte.mjs`: 98 ondate con una sola fase riconosciuta nei testi, **0 discordanze** (C-030: 1). Col rosso C84F01: 9. Uscite `fasi-tutte.log`, `fasi-tutte-rosso-c84f01.log`.
- A schermo, `c27-pixel.mjs`: `data-folla` = `pieni|` in e21 schieramento-3 a 360, 375 e 412. Foto `docs/foto/c31/dopo/{360x760,375x667,412x915}-e21-schieramento-3.png` (curva Kiln piena); prima: `prima/…-e21-schieramento-3.png`.

**Guardiano: manca.** Braccio rosso in un worktree temporaneo a 4132fa7 con `data/missioni/e21.json` della 0.27.0 (cioè senza la riga): `npx vitest run` → **42/42 file, 229/229 test verdi** (`uscite-c31/rosso-e21o3-senza-fase-vitest.log`).
- `tests/meta-fase.test.ts:46-48` controlla e21 ondata 4, non la 3; `tests/corteo-verso.test.ts` non tocca e21.
- Il commento della 0.28.0 cita come guardiani solo `corteo-verso.test.ts` e `brevita.test.ts` (`src/versione.ts:198`).
- La catena «logica» nel worktree non l'ho potuta finire: il passo «confini» si ferma con `EISDIR` per il collegamento a `node_modules` che ho fatto io (`uscite-c31/rosso-e21o3-catena-logica.log`). Dai nomi dei passi (`tools/catena.mjs:44`) nessuno riguarda la fase (IPOTESI). Non posso confermare che la catena completa non se ne accorga.
- → C31-01.

## 1.3 C30-03: i due testi

**FATTO (dati).**

| chiave | 0.27.0 | 0.28.0 | caratteri |
|---|---|---|---|
| `e24.ch.busta` | «Malvasi ti dà una busta chiusa del testimone: «C'è chi ha avvisato la curva prima della retata.»» | «Malvasi ti dà la busta del testimone: «Dentro c'è il nome di chi ha avvisato la curva della retata.»» | 100 (limite 100) |
| `e35.ch.fine_trattativa` | «Comando: è finita, ostaggi illesi, si sono arresi. …» | «Comando: finita. Ostaggi illesi, rapinatori arresi. La folla vuole vedere, i parenti abbracciare.» | 99 |

Contesto letto con `node coordination/sonde/c30-testi-contesto.mjs <chiave> <parole…>`.

**e24 (GIUDIZIO: coerente).**
- Ora la chiamata dice che dentro c'è il nome, come danno per detto: `e24.op.apri_busta.r` «Leggi il nome», `e24.op.caffe.r` e `e24.ch.testimone_conferma` «Il nome nella busta», `e24.info_testimone` «Il nome ve l'ho scritto», i tre verbali di e24.
- «della retata» richiama e19 («Chi ha parlato?», `e19.ondata4.i`).
- Gli episodi dopo restano coerenti: `e25.op.mostra_busta`, `e31.op.mostra_busta` / `busta_al_comando`, `e33.op.apri_busta` («c'è la sua firma») parlano della stessa busta tenuta o consegnata.
- È sparito «chiusa». Prima il vice diceva «Io l'ho letta» di una busta «chiusa» (`e24.ch.busta.vice`); ora quella stonatura non c'è più. Resta `e24.ch.consegna` «Ordine di consegnarla, chiusa», che si legge come «da consegnare senza aprirla»: coerente.

**e35 (GIUDIZIO: coerente).**
- Ora il soggetto è chiaro: si sono arresi i rapinatori, non gli ostaggi.
- Coerente con la rapina (`e35.intro2`, `e35.ondata1.i`), con «rapina-copertura» (`e35.ch.rapporto_notte`), con i verbali di e35 («Ostaggi a casa», «La rapina ha fatto il suo lavoro») e con e36 («carte trovate dopo la rapina», `e36.ch.comando_conti`; verbali «per la rapina»).
- Piccola stonatura nuova: la chiamata dice «i parenti», le opzioni e le risposte dicono «familiari» (`e35.op.corridoio` «fino ai familiari», `e35.op.corridoio.r` «sala dei familiari», `e35.ch.familiari`) → C31-03 (forma).

**A schermo:** il bot attento non apre queste due chiamate. Il testo l'ho letto nei dati, non a schermo: non posso confermarlo a schermo. Che compaiano giocando lo dice il bot: «chiamate mai comparse» `[]` in e24 ed e35 su 1000 semi (`uscite-c31/bot-1000.log`).

# 2. Verso di ogni corteo contro i testi, 36 episodi

**Metodo.** Sonda nuova `node coordination/sonde/c31-verso-testi.mjs <radice> <uscita.md> <uscita.json>`, sulla 0.28.0 e sulla 0.27.0.
- Per ogni ondata con un corteo dell'ondata o una chiamata su una strada: verso del corteo, **dove va davvero** (inizio del viale: stazione o bordo basso; fine: `meta`, stadio con la partita, centro), verso del corteo della chiamata con `esceDinamica` (`folla.ts:52-55`), e i testi (titolo, riga «i», chiamate sulla strada, commenti).
- Correzione di metodo: la colonna «chiamata» di `c27-verso.mjs` e `c27-testi-cortei.mjs` usa ancora la regola di prima di C27-01 (esce solo a spalti `deflusso`, `c27-verso.mjs:20`). Per questo ho scritto la sonda nuova.
- Uscite: `uscite-c31/verso-testi-0{27,28}.{md,json}`.

**FATTO MISURATO: cosa è cambiato rispetto alla 0.27.0.** `diff verso-testi-027.md verso-testi-028.md`: **una sola ondata**, e30 o2 (`strada_cinderwick esce → bordo basso` diventa `entra → meta:piazza_municipio`, anche per la chiamata `silenzio_totale`). Con `c27-verso.mjs` sulle due build: e30 o2 e, in più, e21 o3 (spalti `deflusso → pieni`, nessun corteo). **Nient'altro è cambiato.**

**Lettura dei testi (GIUDIZIO), 85 ondate.** Ho riletto tutte le ondate contro i casi del C-027 § 2:

| caso del C-027 | 0.28.0 |
|---|---|
| e17/4 `piazza_municipio` | coerente (`verso: dallo_stadio`, C-027) |
| e30/2 | **coerente col municipio** (§ 1.1), resta «dallo stadio» (C31-02) |
| e30/4 `fiaccolata` | coerente: via dal municipio (0/69) |
| e04/3 chiamata `angolo`, e17/4 `me_lo_dovete` | ondata e chiamata nello stesso verso (C27-01): coerente |
| e27/4, e07/4 | `fase` (C27-04): coerente |
| e04/2 `parcheggi` «entra» che va via dallo stadio | **resta** (C29-02, § 3) |
| e06/1 «in corteo verso la piazza» → verso lo stadio | resta |
| e13/4 «tutti vanno verso il concertone in piazza» → «esce» verso il bordo | resta |
| e12/4 «Le due curve vanno insieme in piazza» → «esce» | resta |
| e22/4 «vuole passare dal municipio» → «esce» | resta (debole) |
| e19/3 `festa_davanti`, e20/3 `fari_spenti20` | restano (in partita la chiamata va verso lo stadio; l'auto in fuga è disegnata come corteo) |

Casi che il C-027 non elencava e che ho guardato: e28/4 `corteo_capo` e e29/4 `corteo_al_porto` («verso il porto»), con corteo «esce» verso il bordo basso. Se il bordo sia dalla parte del porto non l'ho misurato: non posso confermarlo come contrasto. e30/3 `saluto_larkspire` («la coda del corteo che torna») resta dubbio come nel C-027.

Questi contrasti non sono nuovi e non sono fra i rilievi da riverificare: li riporto come stato, senza nuovo numero.

# 3. Rilievi aperti

| rilievo | ancora presente? | misura C-031 | C-030 |
|---|---|---|---|
| **C28-01** tela della mappa diversa dalla mappa | **sì** | `resizeTo={p.contenitore}` invariato (`src/resa/mappa/StratoPixi.tsx:176`). `W=360 H=760 node coordination/sonde/c28-grandi.mjs`: tela ≠ mappa in **1412/1700** schermate con mappa (36/36 episodi finiti col mouse, 0 errori; `uscite-c31/grandi-360-analisi.log`). Fascia scura in basso nelle foto `dopo/360x760-e21-schieramento-3.png` e `-e30-chiamata-silenzio_totale.png` | 1412/1700 |
| **C28-02** opzione già accesa sotto il puntatore fermo | **sì** | `c28-mouse.mjs` (e01, e13, e19): 768×1024 **31/39**, 1920×1080 **29/39**, 1366×768 **23/39**; 0 errori; `src/resa/stile.css:58` invariato | 30, 29, 16 |
| **C28-05** corteo della chiamata via dallo stadio solo in maggioranza | **sì** per e17 | e17 `me_lo_dovete` **6 verso / 34 via** (stadio). e30: con la meta il riferimento giusto è il municipio, e lì `fiaccolata` è 0/39 e `silenzio_totale` 39/0 | 6/34; e30 19/20, 20/20 |
| **C28-09** fuoco perso dopo un'azione | **sì** | `c28-tastiera.mjs` 1366×768, e01, e13, e19, e30: 4/4 finiti, 411 azioni, **fuoco perso 87/411**, 0 coperto, 0 errori | 82/411 |
| **C28-11** versione lontana dalla colonna | **sì** | `c29-versione.mjs`: −16 px a 360 e 412; +128 (768), +256 (1024), **+427 (1366)**, +704 (1920) | uguale |
| **C28-14** nomi sotto le pastiglie | **sì** | `c28-c2611.mjs` su `schermate-360.json`: e13 «Viale fra stadio e piazza» × pastiglia 15,8×10,4 px in 24 schermate; e16 «Magazzino delle fonderie» 34,6×6,0 in 16 | uguale |
| **C29-02** e04 o2 «entra» che va via dallo stadio | **sì** | `coro_fonderie`: ondata **11 verso / 59 via**, chiamata **9 / 30** | 12/57, 7/32 |
| **C29-04** «Urgente!» non spiegato nella guida | **sì** | urgenti a schermo URGENTI_RIGA; 0 righe con «urgent» in `data/testi/it/comune.json`; commento «D-126 c» in `src/resa/schermate/Ondata.tsx:24` | 211/422 |
| **C29-05** alias e piano con gli id vecchi | **sì** | `src/resa/stemma.tsx:67` e `:85` (`VECCHI_ID`) invariati; `tools/foto-stemmi.mjs:15-16` ha ancora `calderone` e `penna` | uguale |
| **C29-06** scaglie della pigna sotto il pixel | **sì** | `c29-stemmi.mjs`: scaglie **0,76 px CSS** in 6/6 casi della pigna, 24/24 stemmi `@D-128`; 0 errori | uguale |
| **C30-04** 1366×768: vignetta della sala e «?» coperto | **sì** | C3004_RIGA | 5/36; 142/142 |
| **C30-05** 10 incoerenze e 6 difetti di forma nei testi | **sì** | 16/16 testi identici alla 0.27.0 (lettura dei valori attuali; solo e24 ed e35 sono cambiati). Es.: «Due biglietti a posto» (`e14.ch.doppioni`), «Skyfield-Lookout» col trattino corto (`e18.ch.dessi_tribuna`), «Radio: banca chiusa, si tratta» (`e35.ch.perimetro`) | — |

Uscite: `uscite-c31/{mouse-*,tastiera-1366,versione,stemmi,pixel-e17-e04,grandi-360}.{log,json}`.

# 4. C28-07: e08 ed e21, partite di coppa

**Cosa diceva il C-028** (`docs/revisioni/COLLAUDO_C28.md` sul ramo claude/valmora-collaudo-c28, righe 100 e 286-287): «e08 è diventata di coppa ma finisce in pareggio senza supplementari»: «Due a due…» (`e08.json:106`), «Pareggio: la scommessa del giorno l'ho vinta» (`:107`), mentre e03, l'altra coppa della stagione 1, dice «Uno a uno: supplementari, forse rigori». «O si dice che è l'andata, o il pareggio va tolto.»

**FATTO (dati, 0.28.0).**
- e08: coppa in `e08.intro2` («Oggi c'è lo Square in coppa»). Il risultato è ancora «Due a due» (`data/testi/it/e08.json:106`) con «Pareggio» (`:107`). Nessun testo di e08 contiene «supplementari», «rigori», «andata», «ritorno» nel senso della gara, «turno», «eliminat», «qualificat» (`grep` su `data/testi/it/e08.json`). Le ondate: «Si gioca», «Secondo tempo», «Fine partita» (`e08.ondata2.i`…`ondata4.i`).
- e21: coppa in `e21.intro1` («Pinegrove in coppa»). Nessun risultato; ondate «Si gioca», «Kiln–Pinegrove in corso», «Dopo la partita, di notte». Nessun testo su supplementari, rigori o eliminazione.
- e03, per confronto: «I supplementari» (`e03.ondata3`), «Uno a uno: supplementari, forse rigori» (`e03.json:77`), «Garden vince ai rigori» (`e03.ch.risultato`).
- `docs/BIBBIA.md:120` e `:125` non segnano e08 ed e21 come coppa (parte di C28-08).

**GIUDIZIO.**
- **e08: incoerente, C28-07 ancora presente.** Una partita di coppa a eliminazione diretta che finisce 2-2 «al fischio finale» senza supplementari né rigori non torna, e il gioco stesso, in e03, mostra che in coppa dopo il pareggio si va ai supplementari. Bastano poche parole («andata» in `e08.intro2`, oppure un risultato non pari).
- **e21: coerente**: non dice niente che contraddica una coppa. Volendo, è l'occasione per dire se Kiln passa il turno; non è un difetto.
- Sulla regola reale (coppe a gara secca con supplementari e rigori, o andata e ritorno) non cito norme: il gioco è un campionato di finzione, e la coerenza va misurata con e03.

# 5. Regressioni (FATTO MISURATO)

**Bot.** `node tools/bot.mjs 1000` (`uscite-c31/bot-1000.log`): 156/156 righe missione × strategia con **blocchi 0/1000**; «chiamate mai comparse» `[]` in 36/36.

**Test e tipi.** `npx vitest run`: «Test Files 42 passed (42) · Tests 229 passed (229)» (`vitest.log`); `npx tsc --noEmit -p .`: uscita 0, nessun messaggio (`tipi.log`).

**Salvataggi veri della 0.27.0.**
- `EP=e02,e07,e13,e17,e21,e23,e24,e25,e27,e30,e31,e35 VA=0.27.0 VECCHI_DIR=coordination/sonde/salvataggi-025 node coordination/sonde/c28-salvataggi.mjs <0.27.0> . coordination/sonde/salvataggi-027 <uscita>`:
  - 12/12 salvataggi esportati col pulsante dalla **0.27.0** a metà della prima ondata, importati nella 0.28.0, ripresi sulla **stessa chiamata**; fra questi e21, e24, e30 ed e35, i quattro episodi cambiati;
  - 12/12 salvataggi veri della 0.25.0 ripresi; 0 errori di console (`salvataggi.log`; le etichette «0.19.0/0.20.0» nell'ultima riga sono nomi fissi della sonda per «build A/B»).
- Limite: i salvataggi sono a metà dell'**ondata 1**. Un salvataggio della 0.27.0 dentro e30 ondata 2 o e21 ondata 3 non l'ho provato.
- `EP=e01,e08,e17,e21,e30,e33 node coordination/sonde/c25-ripresa.mjs . <uscita>`: R1 6/6, R2 3/3 (salvataggi della 0.4.0 in `tests/salvataggi-reali/`), 0 errori (`ripresa.log`).

**Console.** 0 errori in tutte le corse con browser: pixel (12 corse), mouse (3), tastiera, stemmi, salvataggi, ripresa, schermate (SCHERMATE_ERRORI).

**Schermate.** `W=… [H=…] [FOTO=1] node coordination/sonde/c29-schermate.mjs . docs/foto/c31/s<W> <uscita>`, 36 episodi, piano del bot attento, seme 1, asset veri; analisi `node coordination/sonde/c28-schermate-analisi.mjs <uscita>`.

TABELLA_SCHERMATE

# 6. Usabilità e realismo (GIUDIZIO, marcato)

- **e30, ondata 2:** ora il corteo va dove dice il testo, verso la piazza del municipio, e lo stesso fa quello della chiamata. Chi guarda la mappa vede la fila arancione salire dalla Strada da Kiln verso il municipio. La partenza dal bordo invece che dal piazzale dello stadio si nota solo se si cerca (C31-02).
- **e21, ondata 3:** curva piena mentre il testo dice «Kiln–Pinegrove in corso». Risolto.
- **Testi:** le due chiamate riscritte si leggono bene e restano nel tono radio; «rapinatori arresi» è chiaro. «Parenti» accanto a «familiari» si nota poco.
- **e08:** chi gioca la coda della stagione 1 in ordine trova e03 («supplementari, forse rigori») e poi e08 («Due a due… Pareggio») nella stessa coppa: se ne accorge chi segue il calcio (C28-07).
- **Fascia scura sotto la mappa** (C28-01) visibile in ogni foto della mappa a 360.
- **Realismo:** le novità non aggiungono procedure o termini di polizia; non c'è niente di nuovo da verificare su fonti.

# Rilievi (per gravità)

## Alto

Nessuno.

## Medio

Nessuno di nuovo. Restano aperti, come Medi dei collaudi precedenti, i rilievi del § 3 con quella gravità.

## Basso

**C31-01: C30-02 corretto senza guardiano: togliendo `fase` da e21 ondata 3, 229/229 test restano verdi.**
- Misura: § 1.2 (braccio rosso in un worktree temporaneo, `uscite-c31/rosso-e21o3-senza-fase-vitest.log`).
- `tests/meta-fase.test.ts:46-48` controlla e21 ondata 4, non la 3. CLAUDE.md chiede un guardiano permanente per ogni difetto.
- Il guardiano della discordanza fase/testi su tutti gli episodi esiste solo come mia sonda (`coordination/sonde/c30-fasi-tutte.mjs`: 0 discordanze, rosso C84F01 9).

**C31-02: e30 ondata 2: il corteo va al municipio, ma parte dal bordo della mappa e si avvicina allo stadio, mentre il testo dice «dallo stadio verso il municipio».**
- Misura: § 1.1. Rispetto allo stadio vuoto 57/69 (360), 58/69 (375, 412) si avvicinano; chiamata 29/39 (360), 32/39 (412).
- Causa (FATTO codice): l'inizio del viale è il bordo basso quando non c'è una stazione (`src/resa/mappa/sfondo.ts:110`); `meta` decide solo la fine (`:106-109`).
- GIUDIZIO: difetto minore; il verso principale (verso il municipio) è giusto.

**C31-03: `e35.ch.fine_trattativa` dice «i parenti», le opzioni e le risposte «familiari».**
- `e35.op.corridoio` «fino ai familiari», `e35.op.corridoio.r` «sala dei familiari», `e35.ch.familiari`. Forma, come C30-05.

# Verificati e chiusi

| rilievo / novità | misura |
|---|---|
| **C30-01** e30 ondata 2 via dal municipio | ondata 0/69 → 69/69 verso il municipio, chiamata 1/39 → 39/39, a 360, 375, 412; o4 resta 69/69 via. Residuo minore in C31-02 |
| **C30-02** e21 ondata 3 spalti che si svuotano | `pieni` a schermo a 360, 375, 412; discordanze 1 → 0 su 98 ondate (rosso C84F01: 9). Guardiano mancante in C31-01 |
| **C30-03** `e24.ch.busta`, `e35.ch.fine_trattativa` | nome nella busta e chi si è arreso detti di nuovo; coerenti con e24, e25, e31, e33, e35, e36; 100 e 99 caratteri (limite 100). Residuo di forma in C31-03 |
| Regressioni | bot 0 blocchi 156/156 × 1000 semi; 229/229 test; tipi 0; salvataggi 12/12 (0.27.0) + 12/12 (0.25.0) + 6/6 + 3/3; schermate a 4 misure SCHERMATE_CHIUSI |

# Note di metodo e limiti

- **Verso «dallo stadio»:** la misura rispetto allo stadio in e30 usa il centro dello stadio vuoto disegnato (`data-stadio-ellisse`).
- **Foto ferme:** prima e dopo si somigliano; il verso del corteo si misura solo sul movimento (scena Pixi, centinaia di persone). La misura sui pixel (`mov` nei log) accoppia poche persone ed è rumorosa, come nel C-030.
- **C28-02:** 1366×768 dà 23/39 (C-030: 16/39) con le stesse scelte: la misura cambia da corsa a corsa; non conto la differenza come regressione.
- **Carico:** fino a 4 browser su 4 CPU, carico fino a 12. I secondi reali nei log dicono solo quanto è durata una corsa.
- **Cosa non ho misurato:** telefoni, tablet e PC veri, la WebView dell'APK; i due testi nuovi a schermo (§ 1.3); salvataggi della 0.27.0 dentro le ondate cambiate; la catena «logica» completa col braccio rosso (§ 1.2); il rosso C83S01 di `tools/foto-stemmi.mjs`.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c31-verso-testi.mjs` | per ogni ondata con cortei o chiamate su strada: verso, inizio e fine del viale, verso della chiamata con `esceDinamica`, testi | `node coordination/sonde/c31-verso-testi.mjs <radice> <uscita.md> [uscita.json]` |
| `c31-rif-tabella.mjs` | dai log di `c27-pixel.mjs`: persone che si avvicinano o si allontanano dal settore RIF e dallo stadio, ondata e chiamata | `node coordination/sonde/c31-rif-tabella.mjs <log> […]` |
