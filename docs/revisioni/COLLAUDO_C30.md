# Collaudo C-030: 0.26.0 e 0.27.0

Novità collaudate: testi di e13–e36 (PO-084/085), C27-02 `meta`, C27-04 `fase`, C29-01 vignetta, C29-03 `partita`. In più: rilievi aperti di C-028 e C-029, regressioni, usabilità.

- **Build collaudata:**
  - main a f4bc982, GAME_VERSION 0.27.0 (`src/versione.ts:194`, commenti `:180-193`);
  - ricostruita con `npm ci` e `npx vite build` (verde).
- **Confronto «prima»:**
  - 0.25.0 a 1e1ba03, in un worktree separato (`git worktree add`, `npm ci`, `npx vite build`);
  - per i testi, `git show 1e1ba03:data/testi/it/…`.
- **Ramo:** claude/valmora-collaudo-c30.
  - Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/` o `tests/` toccato.
  - Ho scritto solo il rapporto e le sonde (`coordination/sonde/c30-*.mjs`).
- **Data:** 2026-10-16.
- **Strumenti:**
  - Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader);
  - Node 22.22, 4 CPU, fino a 9 browser in parallelo (media di carico fino a 33).
- **Sonde:**
  - riprese senza modifiche dal ramo claude/valmora-collaudo-c29: `c25-*`, `c27-*`, `c28-*`, `c29-*`;
  - nuove: `c30-testi-diff.mjs`, `c30-testi-contesto.mjs`, `c30-vignette.mjs`, `c30-fasi.mjs`, `c30-fasi-tutte.mjs`, `c30-foto-sala.mjs`.
- **Dove sono i dati:**
  - uscite grezze in `coordination/sonde/uscite-c30/`;
  - salvataggi veri della 0.25.0 in `coordination/sonde/salvataggi-025/`;
  - foto in `docs/foto/c30/`.

Convenzioni:
- **FATTO MISURATO**: comando, campione ed esito.
- **FATTO (codice/dati)**: file:riga.
- **GIUDIZIO**: mio, marcato come tale.
- **IPOTESI**: marcata come tale.

## Riepilogo

| verifica | esito |
|---|---|
| **Testi e13–e36** (290: 73 fonti, 217 chiamate) | 0 oltre i limiti (max 80 / 100). 0 nomi cambiati, 0 nomi nuovi. Lette tutte le 290 coppie: **2 cambi di senso** (C30-03), 10 piccole incoerenze e 6 difetti di forma (C30-05) |
| **C29-01, sala** | sweep del C-029 (e01, e13, e25 × 128 finestre): **0/384** finestre che tremano; prima erano 14 + 16 + 13. Rosso C89V01: 16/128 in e01 e in e13 |
| **C29-01, sala, finestre singole** | 0 cambi in 120 frame a 1366×768, 360×700, 360×760, 393×740 e 412×740. Rosso C89V01: **119** (1366×768 e 360×700) |
| **C29-01, clic «da giocatore»** | 30/30 a segno a 1366×768 e a 360×700. Rosso: 8 e 10 a vuoto su 30 |
| **C29-01, verbale** | 396 finestre (e01, 18 larghezze × 22 altezze): **0** con cambi. Ma 0 anche col rosso C89V01: la mia sonda non mostra il difetto nel verbale, e che il verbale tremasse non posso confermarlo (§ 2) |
| **C29-03** `partita` | e02, e03, e18, e24, e26: casa per prima in città, sala e verbale, a 360, 375 e 412 (5/5 × 3): **chiuso** |
| **C27-04** `fase` | discordanze testi ↔ spalti su 98 ondate: **9 → 1**. Resta **e21 o3**: spalti che si svuotano a partita in corso (C30-02) |
| **C27-02** `meta` (e30) | la strada da Kiln ora finisce in piazza del municipio, ma nell'ondata 2 il corteo **va via dal municipio**: 69/69 persone, e nella chiamata 39/39 (C30-01) |
| Rilievi aperti C28-01, 02, 05, 09, 11, 14 e C29-02, 04, 05, 06 | **tutti ancora presenti** (§ 4) |
| Bot, 1000 semi | **0 blocchi** in 156/156 righe; «chiamate mai comparse» `[]` in 36/36 |
| Test e tipi | `npx vitest run`: **42/42 file, 229/229 test**; `npx tsc --noEmit -p .`: uscita 0 |
| Salvataggi veri | 12/12 della **0.25.0** e 12/12 della 0.24.0 ripresi sulla stessa chiamata; R1 6/6; R2 3/3 (0.4.0); 0 errori |
| Schermate, 1916 per misura | 360×760, 375×667, 412×915, **1366×768**: 0 scorrimenti orizzontali, 0 tagli, 0 nomi vecchi, **0 errori di console**, 0 blocchi |

# 1. Testi accorciati di e13–e36 (PO-084/085)

**FATTO MISURATO.** `node coordination/sonde/c30-testi-diff.mjs 1e1ba03 HEAD <uscita>` confronta `data/testi/it/e13…e36.json` della 0.25.0 con quelli della 0.27.0.
- Chiavi cambiate: **290** (73 fonti, 217 chiamate); 0 chiavi nuove, 0 tolte.
- Lunghezze:
  - fonti: max **80**, 0 oltre 80; media 103,0 → 76,4 caratteri;
  - chiamate: max **100**, 0 oltre 100; media 116,8 → 96,5.
- Nomi:
  - **0** nomi propri nuovi, **0** cambiati;
  - calano solo «Kiln», 42 → 36 (tolto «sicurezza del Kiln» dalle etichette di Lavezzari), e «Fabbro», 28 → 27 (in `e36.ch.messaggio_carcere`; il contesto resta in `e36.info_informatore`).
- Articoli dei club, contati su tutti i testi e01–e36 (lo/dello Skyfield, l'/dell'Arches, il/del Railhead…): nessuna forma nuova o sbagliata.
- Virgolette « » bilanciate in 290/290.

**Metodo del giudizio.**
- Ho letto tutte le 290 coppie prima/dopo: elenco completo in `coordination/sonde/uscite-c30/testi-diff.txt`, commenti del vice accanto al testo nuovo in `testi-vice.txt`.
- Per ogni caso dubbio ho usato `node coordination/sonde/c30-testi-contesto.mjs <chiave> [parola…]`. La sonda mostra:
  - opzioni, costi e risposte della chiamata;
  - condizione «se» e settore;
  - commento del vice;
  - ogni altro testo di e01–e36 con la stessa parola.

**Esito.**
- In **272/290** testi non trovo perdite che contino: si tolgono ripetizioni, etichette lunghe («Responsabile del…», «sicurezza del Kiln») e dettagli di colore.
- In **18** trovo qualcosa da segnalare:
  - 2 cambi di senso (C30-03);
  - 10 piccole incoerenze o ambiguità (C30-05);
  - 6 difetti di forma (C30-05).
- A parte, la stessa fonte compare con etichette diverse (§ 1.3).
- Nessuna contraddizione nuova fra episodi, salvo quelle in tabella.

## 1.1 Cambi di senso (GIUDIZIO; → C30-03)

| chiave | prima (0.25.0) | dopo (0.27.0) | perché conta |
|---|---|---|---|
| `e24.ch.busta` | Malvasi ti dà una busta chiusa. «Dentro c'è chi ha avvisato la curva prima della retata. Me l'ha dato il testimone.» | Malvasi ti dà una busta chiusa del testimone: «C'è chi ha avvisato la curva prima della retata.» | «C'è chi ha avvisato» in italiano vuol dire «qualcuno ha avvisato», non «dentro c'è il suo nome». La chiamata non dice più che la busta contiene il nome della talpa. Il resto della storia lo dà per detto: «Leggi il nome» (`e24.op.apri_busta.r`), «il nome nella busta» (`e24.op.caffe.r`, `e24.ch.testimone_conferma`, `e24.verbale_*`), poi e25, e31 ed `e33.op.apri_busta`. |
| `e35.ch.fine_trattativa` | «Il comando: è finita. Gli ostaggi escono tutti illesi, chi era dentro si è arreso. …» | «Comando: è finita, ostaggi illesi, si sono arresi. …» | Il soggetto di «si sono arresi» sembra gli ostaggi. Non si dice più chi si è arreso (chi teneva la banca), cioè la chiusura della trattativa. |

## 1.2 Piccole incoerenze e ambiguità (GIUDIZIO; → C30-05)

| chiave | prima | dopo | nota |
|---|---|---|---|
| `e14.ch.doppioni` | «… Due biglietti per posto.» | «… Due biglietti a posto.» | «a posto» si legge anche come «in regola» |
| `e21.info_centro` | «… I ragazzi della curva li abbiamo accolti, ma non parlano per noi.» | «… La curva è accolta, non parla per noi.» | ora è accolta «la curva», ma i vecchi sono allo stadio (`e21.info_club`, `e21.ondata2.i`) |
| `e21.ch.striscione_sgombero` | «… hanno appeso al cancello dello stadio uno striscione contro lo sgombero.» | «… appendono al cancello uno striscione anti-sgombero.» | senza «dello stadio» il cancello si legge come quello dell'ex fonderia (`e21.ch.furgone_fonderia`, `e21.op.squadra_cancello`) |
| `e21.ch.bottigliette` | «Il maxischermo in piazza inquadra la curva. I vecchi chiamano i giovani «disertori» …» | «Al maxischermo i vecchi chiamano «disertori» i giovani. …» | sembra che i vecchi siano al maxischermo, non in curva ripresi dal maxischermo |
| `e25.info_radio` | «… L'uscita principale della stazione è in zona rossa.» | «… Stazione in zona rossa.» | `e25.ch.treno_pieno` e `e25.ch.treno_orario` dicono che l'uscita laterale resta aperta |
| `e31.ch.costruttore_saluta` | «… Due parole, all'intervallo. Niente di formale.» | «… Due parole, informali.» | il vice cita ancora «Niente di formale» (`e31.ch.costruttore_saluta.vice`) |
| `e32.ch.comando_derby` | «… Decidi tu, ma decidi bene.» | «… Decidi tu, e bene.» | il vice cita «Decidi tu ma decidi bene» (`e32.ch.comando_derby.vice`) |
| `e26.ch.lista_ospiti` | «… con un invito firmato da qualcuno in comune.» | «… Ospiti fuori lista, invitati da qualcuno in comune.» | il vice parla ancora di «Inviti firmati a mano» e della firma |
| `e15.ch.accompagnarli`, `e27.ch.abbraccio` | «… vuole accompagnare i gemellati …» | «… vuole scortare i gemellati …» | «scortare» è la parola delle opzioni della polizia («Corteo sì, scortato», `e27.op.corteo_scortato`): non è chiaro chi scorta chi |

## 1.3 Forma (FATTO; → C30-05)

- Punto finale perso dopo la citazione: `e25.info_informatore`, `e28.info_cinderwick`, `e32.info_informatore`.
- Trattino corto «Skyfield-Lookout» in `e18.ch.dessi_tribuna`. Altrove c'è sempre «–» (22 casi; in e18 due volte «Skyfield–Lookout»).
- `e36.ch.busta`: «Ora o dopo l'ultimo giro?» non dice più cosa (aprire la busta); lo dicono le opzioni sotto.
- `e35.ch.perimetro`: «banca chiusa, si tratta.» si legge anche come «si tratta di…»; il contesto (`e35.ondata1.i`) aiuta.
- La stessa fonte ha etichette diverse:
  - «Lavezzari (Kiln):» (`e13.info_club`), «Lavezzari, Kiln:» (`e15.info_cinderwick`, `e25.ch.club_garantisce`), «Gianni Lavezzari:» (e29, e30, e32);
  - «Centrale radio:» e «Radio:» (`e35.ch.perimetro`);
  - «Presidente Skyfield» (`e22.ch.ti_difendo`) e «Presidente dello Skyfield» (e14, e20, e24).

# 2. C29-01: vignetta di sala e verbale

**FATTO (codice).** Da nascosta, ora l'altezza della vignetta vale 0 (`src/resa/vignetta.tsx:33`); il rosso C89V01 la riporta come nella 0.23.0. Il guardiano conta i cambi in 30 frame a 1366×768 e 360×700 (`tools/foto-c22.mjs:87-95`).

**Sala, FATTO MISURATO.**

| prova | comando | 0.27.0 | rosso C89V01 | C-029 (0.25.0) |
|---|---|---|---|---|
| sweep, 8 larghezze × 16 altezze | `EP=e01,e13,e25 node coordination/sonde/c29-sala-sweep.mjs . <uscita>` | **0/128** in e01, e13 ed e25 | 16/128 (e01), 16/128 (e13) | 14, 16, 13 |
| 120 frame, pagina nuova | `W=… H=… [ROSSI=C89V01] [MOTO=reduce] node coordination/sonde/c29-sala-tremolio.mjs .` | 0 cambi a 1366×768 (anche con `reducedMotion`), 360×700, 360×760, 393×740, 412×740 | **119** a 1366×768 e a 360×700 | 119 |
| clic «da giocatore» (posizione letta, 120 ms, clic) | `W=… H=… N=30 [ROSSI=C89V01] node coordination/sonde/c29-sala-clic.mjs .` | **30/30** a segno a 1366×768 e 360×700 | 22/30 e 20/30 | 25/30 |
| mouse, Playwright | `W=1366 H=768 EP=e01,e13,e19 node coordination/sonde/c28-mouse.mjs …` | 3/3 episodi finiti, 0 «element is not stable» | — | si fermava in sala 3/3 |

Uscite: `uscite-c30/sala-sweep*.{json,log}`, `sala-tremolio.log`, `sala-clic.log`, `mouse-1366x768.log`.

**Sala, foto.** Asset veri, `node coordination/sonde/c30-foto-sala.mjs <radice> <foto>`:
- `docs/foto/c30/{prima,dopo}-{360x760,375x667,412x915,1366x768}-e01-sala.jpg`;
- tavola `tavola-prima-dopo-1366x768-e01-sala.jpg`: a sinistra la 0.25.0, colta nel frame con la vignetta e la pagina di 822 px; a destra la 0.27.0, ferma, senza vignetta.

**Verbale, FATTO MISURATO.** Sonda nuova `c30-vignette.mjs`: gioca e01 fino al verbale col piano del bot attento e lì misura la vignetta `esito-…` e il pulsante.
- `EP=e01 SCENA=verbale FRAME=60 ATTESA=1000 node coordination/sonde/c30-vignette.mjs . <uscita>`:
  - 396 finestre (18 larghezze da 320 a 1920 × 22 altezze da 568 a 1080);
  - **0** con cambi; vignetta mostrata in 306, nascosta in 90; 0 errori.
- Con `NUOVA=1` (pagina nuova aperta già alla misura, 120 frame) a 1366×768, 360×700 e 393×720: 0 cambi.
- **Braccio rosso: 0 anche con C89V01**, sia nella griglia sia con pagina nuova.
  - Quindi la mia sonda nel verbale non vede il difetto. Non posso confermare che il verbale tremasse, né che ora non tremi in altri passi del verbale o in altri episodi.
  - Il commento di `src/versione.ts:192` dice «rosso C89V01 19 righe (sala e verbale)»: non l'ho rifatto.
- Misura ritirata: la prima prova a 360×700 (30 frame dopo 600 ms) dava 1 cambio, 102 → 104 px. Rifatta con 2000 ms di attesa: 0 cambi. Era l'assestamento dopo il ridimensionamento, non un tremolio.

**Esito:** C29-01 **chiuso per la sala**. Per il verbale: non posso confermarlo (vedi sopra).

# 3. Cortei e fasi (C27-02, C27-04)

## 3.1 e30, strada da Kiln → piazza del municipio

**FATTO (codice/dati).**
- `data/missioni/e30.json:62` ha `"meta": "piazza_municipio"` sulla strada da Kiln.
- `src/resa/mappa/sfondo.ts:106-110`: il viale finisce sul settore della meta.
- Il corteo dell'ondata si muove lungo il viale; con verso «esce» va dalla fine all'inizio (`src/resa/mappa/StratoPixi.tsx:112`), e così anche il corteo della chiamata (`src/resa/mappa/dinamica.ts:32`).
- Gli eventi di e30 ondate 2 e 4 hanno `verso: dallo_stadio` (`silenzio_strada`, `fiaccole`), quindi «esce».
- Con la meta, «esce» vuol dire **via dal municipio**.

**FATTO MISURATO.**
- Comando: `W=360 EP=e30,… node coordination/sonde/c27-pixel.mjs . docs/foto/c30 <uscita>` (RIF = piazza_municipio).
- Misura: posizioni vere delle persone nella scena Pixi, a 400 ms l'una dall'altra.

| ondata | testo dell'ondata | data-folla | corteo dell'ondata rispetto al municipio | corteo della chiamata |
|---|---|---|---|---|
| o2 | «Il corteo si muove in silenzio dallo stadio verso il municipio» (`e30.ondata2.i`) | `strada_cinderwick>esce` | **69/69 si allontanano** | `silenzio_totale`: **39/39 si allontanano** |
| o3 | «Il corteo arriva in piazza del municipio» | `strada_cinderwick>entra` | 69/69 si avvicinano | `saluto_larkspire`: 39/39 si avvicinano |
| o4 | «È sera, dopo il corteo al municipio: la curva resta in strada» | `strada_cinderwick>esce` | 69/69 si allontanano | `fiaccolata` («dopo il municipio, fiaccolata fino al porto»): 40/40 si allontanano |

- **Rosso C85M01** (meta ignorata, come nella 0.25.0): o2 69/69 e o4 69/69 si allontanano dal municipio anche lì. Quindi C27-02 ha spostato la fine della strada, ma il verso del corteo in o2 è rimasto quello di prima.
- **Pixel** (componenti del colore del club, due foto a 200 ms): pochi accoppiamenti (3-22 persone), risultato misto. La misura valida è quella della scena Pixi. Tabella col verso rispetto allo stadio: `node coordination/sonde/c28-verso-tabella.mjs …` in `uscite-c30/pixel*.log`.
- **Foto:**
  - `docs/foto/c30/360x760-e30-chiamata-silenzio_totale.png`: la strada parte dal bordo in basso a sinistra, sale e finisce in piazza del municipio;
  - il corteo occupa il tratto basso, fra il bordo e il piazzale, e scende verso il bordo;
  - anche `360x760-e30-schieramento-{2,3,4}.png`.
- **GIUDIZIO:**
  - **o2 contraddice il testo**: verso il municipio nel testo, via dal municipio sulla mappa;
  - **o4 è coerente** con «dopo il municipio»;
  - **o3 è coerente**.

## 3.2 e07, e21, e23, e27: spalti e cortei contro i testi

**FATTO MISURATO.** `node coordination/sonde/c30-fasi.mjs` usa `follaDellOndata`, la stessa funzione della mappa (`src/resa/mappa/folla.ts:18-46`). Uscita: `uscite-c30/fasi.log`, col rosso C84F01 `fasi-rosso-c84f01.log`.

| ondata | `fase` | spalti / cortei | testi | esito |
|---|---|---|---|---|
| e07 o1 | – | arrivo; parcheggi>entra | «Prima della partita» | coerente |
| e07 o2, o3 | partita | pieni | «Si gioca», «La partita prosegue» | coerente (col rosso: arrivo) |
| e07 o4 | dopo | deflusso | «A partita finita, di sera» | coerente |
| e21 o1 | – | arrivo | «Inizio serata» | coerente |
| e21 o2 | partita | pieni | «Si gioca» | coerente |
| **e21 o3** | **–** | **deflusso** | **«Kiln–Pinegrove in corso»** (`e21.ondata3.i`) | **contraddice** → C30-02 |
| e21 o4 | dopo | deflusso | «Dopo la partita, di notte» | coerente |
| e23 o1 | – | arrivo; casello>entra | «Prima della partita» | coerente |
| e23 o2 | prima | arrivo | «Verso il fischio d'inizio» | coerente (col rosso: pieni) |
| e23 o3 | – | pieni | «Si gioca» | coerente |
| e23 o4 | – | deflusso; casello>esce | «Fine partita» | coerente |
| e27 o1 | prima | arrivo; strada_cinderwick>entra | «Prima della partita: arrivano in treno i gemellati» | coerente (col rosso: pieni) |
| e27 o2, o3 | – | pieni | «Si gioca», «Secondo tempo» | coerente |
| e27 o4 | dopo | deflusso; strada_cinderwick>esce | «Dopo la partita: i gemellati tornano in stazione» | coerente (col rosso: pieni) |

**Su tutti e 36 gli episodi.** `node coordination/sonde/c30-fasi-tutte.mjs` riconosce la fase dai testi per parole chiave (titolo e riga «i»).
- Ondate con una sola fase riconosciuta: 98.
- Discordanze con gli spalti: **1** (e21 o3). Col rosso C84F01: **9**.
- Uscita: `uscite-c30/fasi-tutte.log`.

**A schermo:**
- `c27-pixel.mjs` legge sulla mappa `data-folla` = `deflusso|` in e21 schieramento-3 e `pieni|` in schieramento-2.
- Tavola `docs/foto/c30/tavola-e21-o2-o3.png`: a sinistra la curva Kiln piena (o2), a destra quasi vuota (o3).

**Cortei in movimento** (`c27-pixel.mjs` + `c28-verso-tabella.mjs`, rispetto allo stadio):
- e23 o1 casello 69/0 verso; o4 0/69 via: coerente.
- e27 o1 `strada_cinderwick>entra`: ondata 43 verso / 27 via; chiamata `fermata_prima` 24/15.
- e27 o4 `>esce`: ondata 28 verso / 41 via; chiamata `abbraccio` 15/25.
- e27 è quindi misto, come in C28-05.

# 4. Rilievi aperti di C-028 e C-029

| rilievo | ancora presente? | misura C-030 | misura precedente (C-029) |
|---|---|---|---|
| **C28-01** tela della mappa diversa dalla mappa (fascia scura) | **sì** | codice invariato: `resizeTo={p.contenitore}` (`src/resa/mappa/StratoPixi.tsx:176`). `W=360 H=760 node coordination/sonde/c28-grandi.mjs`: tela ≠ mappa in **1412/1700** schermate con mappa (36/36 episodi, 0 errori; `uscite-c30/grandi-360-analisi.log`). Fascia scura in basso nelle foto `360x760-e07-schieramento-2.png` e `tavola-e21-o2-o3.png` | 1412/1700 |
| **C28-02** opzione già accesa sotto il puntatore fermo | **sì** | `c28-mouse.mjs`: 768×1024 **30/39**, 1920×1080 **29/39**, 1366×768 **16/39** (ora misurabile: la sala non blocca più); `stile.css:58` invariato | 28/39, 30/39 |
| **C28-05** corteo della chiamata via dallo stadio solo in maggioranza | **sì** | `c28-verso-tabella.mjs`: e30 `silenzio_totale` **19 verso / 20 via**, `fiaccolata` **20 / 20**, e17 `me_lo_dovete` **6 / 34** | 13/27, 13/26, 6/33 |
| **C28-09** fuoco perso dopo un'azione | **sì** | `c28-tastiera.mjs` a 1366×768, e01, e13, e19, e30: 4/4 episodi finiti, 411 azioni, **fuoco perso 82/411**, 0 coperto, 0 fuori finestra | 94/412 |
| **C28-11** versione lontana dalla colonna | **sì** | `c29-versione.mjs`: −16 px a 360 e 412; +128 (768), +256 (1024), +427 (1366), +704 (1920); `stile.css:370` invariato | uguale |
| **C28-14** nomi sotto le pastiglie in e13 ed e16 | **sì** | `c28-c2611.mjs`: e13 «Viale fra stadio e piazza» × pastiglia 15,8×10,4 px in 24 schermate (360), 12,1×9,6 in 16 (375); e16 «Magazzino delle fonderie» 34,6×6,0 in 16 (360) | uguale |
| **C29-02** e04 o2, corteo «entra» che va via dallo stadio | **sì** | e04 o2 `coro_fonderie`: ondata **12 verso / 57 via**, chiamata **7 / 32** | 11/58, 8/32 |
| **C29-04** «Urgente!» segue il settore; la guida non lo spiega | **sì** | a schermo 211/422 a ogni misura (come la 0.25.0); 0 righe con «urgent» in `data/testi/it/comune.json:94-107`; commento «D-126 c» ancora in `src/resa/schermate/Ondata.tsx:24` | uguale |
| **C29-05** rosso C83S01, alias e piano con gli id vecchi | **sì** | `src/resa/stemma.tsx:67` («com'erano») e `:85` (`VECCHI_ID` «finché i dati hanno gli id vecchi») invariati; `tools/foto-stemmi.mjs:15-16` ha ancora `calderone` e `penna`. Il rosso di `foto-stemmi.mjs` non l'ho rifatto | uguale |
| **C29-06** scaglie della pigna sotto il pixel a DPR 1 | **sì** | `c29-stemmi.mjs`: scaglie **0,76 px CSS** (scala 0,84 × `strokeWidth="0.9"`, `stemma.tsx:79`), 24/24 casi `…@D-128` | uguale |

# 5. Regressioni (FATTO MISURATO)

**Bot.** `node tools/bot.mjs 1000` (`uscite-c30/bot-1000.log`):
- 156 righe missione × strategia, **0 blocchi** su 1000 semi in 156/156;
- «chiamate mai comparse» `[]` in 36/36.

**Test e tipi.**
- `npx vitest run`: «Test Files 42 passed (42) · Tests 229 passed (229)»;
- `npx tsc --noEmit -p .`: uscita 0.

**Console.** 0 errori in tutte le corse:
- schermate a 4 misure (7664 schermate);
- sweep e vignette (788 finestre);
- pixel, mouse, tastiera e salvataggi.

**Salvataggi veri.**
- `EP=e02,e07,e13,e17,e21,e23,e25,e27,e30,e31,e33,e35 VA=0.25.0 VECCHI_DIR=coordination/sonde/salvataggi-024 node coordination/sonde/c28-salvataggi.mjs <0.25.0> . coordination/sonde/salvataggi-025 <uscita>`:
  - 12/12 salvataggi esportati col pulsante dalla **0.25.0** a metà della prima ondata, importati nella 0.27.0 e ripresi sulla **stessa chiamata**;
  - fra questi e07, e21, e23, e27 ed e30, che hanno `fase` o `meta` nuovi;
  - 12/12 salvataggi veri della 0.24.0 ripresi; 0 errori.
- `EP=e01,e08,e17,e21,e30,e33 node coordination/sonde/c25-ripresa.mjs . <uscita>`: R1 6/6, R2 3/3 (salvataggi reali della 0.4.0 in `tests/salvataggi-reali/`), 0 errori.

**Schermate.** `W=… [H=…] node coordination/sonde/c29-schermate.mjs . docs/foto/c30 <uscita>`: 36 episodi, piano del bot attento, seme 1, asset veri; analisi con `c28-schermate-analisi.mjs`.

| misura | schermate | scorr. orizz. | tagli | nomi vecchi | comandi coperti | errori | vignetta sala / verbale |
|---|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 0 | 0 | 36/36 mostrata, 36/36 mostrata |
| 375×667 | 1916 | 0 | 0 | 0 | 142 («?» sotto la barra, come C-026/27/28/29) | 0 | 0/36, 0/36 (D-126 d) |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, C27-07) | 0 | 36/36, 36/36 |
| **1366×768** | 1916 | 0 | 0 | 0 | **142** («?» sotto la barra) | 0 | **5/36**, 36/36 |

- Urgenti a schermo 211/422 a ogni misura.
- Foto a 360, 375 e 412: `docs/foto/c30/` (selezione).
- Foto della sala prima/dopo a 4 misure: § 2.

# 6. Usabilità e realismo (GIUDIZIO, marcato)

- **Sala:** da giocatore ora è ferma a ogni finestra provata, e il pulsante «Avanti» non scappa più.
  - A 1366×768 però la vignetta della sala è nascosta in 31/36 episodi: la colonna è larga 480 px (bordo destro a 923 px, `c29-versione.mjs`) e alta quanto la finestra, mentre ai lati restano centinaia di pixel gialli vuoti (foto `tavola-prima-dopo-1366x768-e01-sala.jpg`).
  - Sul PC la sala sembra spoglia → C30-04.
- **«?» coperto a 1366×768:** il pulsante d'aiuto dell'ondata sta sotto il pulsante fisso in 142/142 schermate «info», come a 375×667.
  - Sul PC, chi vuole leggere l'aiuto deve scorrere → C30-04.
- **e30:** il testo dell'ondata 2 dice «verso il municipio», ma sulla mappa il corteo scende verso il bordo. È la prima cosa che si guarda in quella schermata → C30-01.
- **e21:** «Kiln–Pinegrove in corso» con la curva che si svuota fa pensare a una partita finita → C30-02.
- **Testi:**
  - le chiamate accorciate si leggono meglio e restano nel tono radio;
  - in qualche caso lo stile telegrafico toglie il soggetto («si sono arresi», «C'è chi ha avvisato») → C30-03;
  - le etichette diverse della stessa fonte («Lavezzari (Kiln)», «Lavezzari, Kiln», «Gianni Lavezzari») si notano giocando di seguito.
- **Realismo:**
  - le fonti brevi restano credibili come messaggi radio;
  - non ho trovato procedure o termini nuovi da verificare: i testi cambiati non aggiungono fatti, ne tolgono.

# Rilievi (per gravità)

## Alto

Nessuno.

## Medio

**C30-01: e30, ondata 2: il corteo «verso il municipio» va via dal municipio. C27-02 ha spostato la strada, non il verso.**

- **Riproduzione:** e30, ondata 2 (schieramento e chiamata `silenzio_totale`), a ogni misura.
- **Misura:** § 3.1.
  - Persone del corteo dell'ondata che si allontanano dalla piazza del municipio: **69/69**; nella chiamata: **39/39**.
  - Testo: «Il corteo si muove in silenzio dallo stadio verso il municipio» (`data/testi/it/e30.json`, chiave `e30.ondata2.i`).
  - Col rosso C85M01: uguale (69/69).
- **Causa (FATTO codice/dati):**
  - `verso: dallo_stadio` sull'evento `silenzio_strada` (`data/missioni/e30.json`, ondata 2) diventa «esce» (`src/resa/mappa/folla.ts:39-40`);
  - «esce» percorre il viale dalla fine all'inizio (`StratoPixi.tsx:112`, `dinamica.ts:32`);
  - con la meta, la fine del viale è il municipio (`sfondo.ts:106-110`).
- **Guardiano:** `tests/meta-fase.test.ts` controlla dove finisce la strada (C85M01), non il verso del corteo. IPOTESI: per questo non lo vede.
- o4 («dopo il municipio») e o3 sono coerenti.

**C30-02: e21, ondata 3: spalti che si svuotano mentre il testo dice «Kiln–Pinegrove in corso».**

- **Misura:** § 3.2.
  - `follaDellOndata` dà `deflusso`; sullo schermo `data-folla` = `deflusso|`;
  - tavola `docs/foto/c30/tavola-e21-o2-o3.png`.
- **Causa (FATTO dati/codice):**
  - `data/missioni/e21.json` ha `fase` in o2 (`partita`) e o4 (`dopo`), ma non in o3;
  - senza `fase`, o3 è «dopo» perché viene dopo un'ondata di partita (`src/resa/mappa/folla.ts:25,32`).
  - Col rosso C84F01 o3 era `arrivo`, sbagliato anche prima.
- È l'unica discordanza rimasta su 98 ondate riconosciute dai testi (`c30-fasi-tutte.mjs`).

**C30-03: due testi accorciati cambiano senso (`e24.ch.busta`, `e35.ch.fine_trattativa`).**

- Testo prima/dopo e conseguenze: § 1.1. GIUDIZIO.
- In e24 la chiamata non dice più che nella busta c'è il nome, che poi le risposte e gli episodi seguenti danno per letto.
- In e35 «si sono arresi» sembra detto degli ostaggi.
- **Guardiano:** `tests/brevita.test.ts` misura solo le lunghezze. Il senso non ha guardiano automatico: lo può dire solo una lettura.

## Basso

**C30-04: a 1366×768 la sala è quasi sempre senza vignetta, e il «?» dell'ondata è sotto il pulsante fisso.**

- `c29-schermate.mjs` a 1366×768: vignetta della sala mostrata **5/36**; «?» (`BUTTON.aiuto`) coperto da `BUTTON.pulsante` in **142/142** schermate «info».
- La decisione sulle vignette nascoste a finestra bassa è del PO (D-126 d, `--vignetta-finestra-min`); il rilievo riguarda il PC, dove la finestra è larga ma bassa.
- GIUDIZIO: sala spoglia, aiuto meno raggiungibile.

**C30-05: testi accorciati: 10 piccole incoerenze o ambiguità e 6 difetti di forma.**

- Elenco con prima/dopo in § 1.2 e § 1.3:
  - «a posto», «la curva è accolta», «al cancello», «al maxischermo», «stazione in zona rossa»;
  - tre commenti del vice che citano parole tolte;
  - «scortare» detto della curva;
  - tre punti finali persi e un trattino corto;
  - etichette diverse per la stessa fonte.

# Verificati e chiusi

| rilievo / novità | misura |
|---|---|
| **C29-01** sala che si accende e si spegne a ogni frame | sweep 0/384 (rosso 16/128 in e01 ed e13); 120 frame: 0 cambi in 5 finestre (rosso 119); clic 30/30 (rosso 22/30 e 20/30); mouse a 1366×768 3/3 episodi. **Chiuso per la sala**; per il verbale non posso confermarlo (§ 2) |
| **C29-03** casa per prima nella sfida | e02, e03, e18, e24, e26: SKYFIELD ATHLETIC per primo in città, sala e verbale, a 360, 375 e 412 |
| **C27-04** fase delle ondate e07, e23, e27 | spalti coerenti coi testi; discordanze su 36 episodi 9 → 1 (resta C30-02) |
| **C27-02** fine della strada in e30 | la strada da Kiln finisce in piazza del municipio (foto `360x760-e30-chiamata-silenzio_totale.png`); il verso resta in C30-01 |
| **PO-084/085** lunghezze | 290/290 nei limiti (fonti ≤ 80, chiamate ≤ 100) |
| Regressioni | bot 0 blocchi 156/156 × 1000 semi; 229/229 test; tipi 0; salvataggi 12/12 (0.25.0) + 12/12 (0.24.0) + 6/6 + 3/3; 7664 schermate a 4 misure con 0 scorrimenti, 0 tagli, 0 errori |

# Note di metodo e limiti

- **Sonda del verbale cieca:** col rosso C89V01 `c30-vignette.mjs` non vede cambi nel verbale (§ 2). L'ho scritto invece di contare come «chiuso» il verbale.
- **Sweep:** `c29-sala-sweep.mjs` ridimensiona la stessa pagina in sequenza. Per questo ho rifatto le finestre principali con una pagina nuova (`c29-sala-tremolio.mjs`; per il verbale `NUOVA=1`).
- **Pixel contro scena Pixi:** per i versi dei cortei vale la misura sulle posizioni della scena Pixi (centinaia di persone). Quella sui pixel accoppia poche persone ed è rumorosa.
- **Carico:** fino a 9 browser su 4 CPU. I tempi in secondi reali servono solo a dire quanto è durata una corsa, mai come misura.
- **Cosa non ho misurato:**
  - telefoni, tablet e PC veri, e la WebView dell'APK;
  - il rosso C83S01 di `tools/foto-stemmi.mjs`;
  - le chiamate dei testi accorciati che il bot attento non apre (per es. `e24.ch.busta`) le ho lette nei dati, non a schermo.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c30-testi-diff.mjs` | testi cambiati fra due commit in e13–e36: prima, dopo, lunghezze, nomi e numeri persi | `node coordination/sonde/c30-testi-diff.mjs [prima] [dopo] [uscita.json]` |
| `c30-testi-contesto.mjs` | una chiave e tutto ciò che la segue o la richiama (opzioni, risposte, «se», vice, stessa parola altrove) | `node coordination/sonde/c30-testi-contesto.mjs <chiave> [parola…]` |
| `c30-vignette.mjs` | C29-01 su sala o verbale, griglia di finestre, anche con pagina nuova | `EP=… SCENA=sala\|verbale [LARG=…] [ALT=…] [FRAME=…] [ATTESA=…] [NUOVA=1] [ORDINE=giu] [ROSSI=…] node coordination/sonde/c30-vignette.mjs <radice> <uscita.json>` |
| `c30-fasi.mjs` | folla della mappa per ondata accanto a `fase`, eventi e testi | `[EP=…] [ROSSI=C84F01] node coordination/sonde/c30-fasi.mjs` |
| `c30-fasi-tutte.mjs` | fase dai testi contro spalti, su e01–e36 | `[ROSSI=C84F01] node coordination/sonde/c30-fasi-tutte.mjs` |
| `c30-foto-sala.mjs` | foto della sala a W×H (prima/dopo) | `W=… H=… [EP=…] node coordination/sonde/c30-foto-sala.mjs <radice> <foto.jpg>` |
