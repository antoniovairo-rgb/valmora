# Collaudo C-029 — 0.24.0 e 0.25.0: novità (C26-06, C27-03, C27-06, C28-04, D-129, D-128), rilievi aperti C-027/C-028, coerenza, regressioni

- **Build collaudata:** main a 1e1ba03, GAME_VERSION 0.25.0 (`src/versione.ts:180`, commenti `:167-179`). Ricostruita con `npm ci` e `npx vite build` (verde).
- **Confronto «prima»:** 0.24.0 a 9941b8e, in un worktree separato (`git worktree add`, `npm ci`, `npx vite build`).
- **Ramo:** claude/valmora-collaudo-c29. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-16. **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), Node 22.22, 4 CPU, fino a 6 browser in parallelo (carico alto: media di carico fino a 26).
- **Sonde nuove:** `coordination/sonde/c29-*.mjs`. Riprese senza modifiche dai rami del C-026, C-027 e C-028: `c26-*.mjs`, `c27-*.mjs`, `c28-*.mjs`, con i salvataggi veri `salvataggi-020/021/022/`. Uscite grezze in `coordination/sonde/uscite-c29/` (le più grandi compresse). Salvataggi veri della 0.24.0 in `coordination/sonde/salvataggi-024/`. **Foto:** `docs/foto/c29/`.

Convenzioni:
- **FATTO MISURATO**: comando, campione, esito.
- **FATTO (codice/dati)**: file:riga.
- **GIUDIZIO**: mio, sulle foto citate, marcato come tale.
- **IPOTESI**: marcata come tale.

## Riepilogo

| verifica | esito |
|---|---|
| **D-129**, regola sui dati | **235/498** chiamate urgenti (47,2 %), come scritto in `versione.ts:177`; con D-126 c erano 415/498 |
| **D-129** nel motore, 4 strategie × 200 semi × 36 episodi | **50,0 %** delle chiamate aperte (169 124 su 338 568; con D-126 c sarebbe 85,6 %); 433/498 chiamate distinte comparse: 213 sempre urgenti, 220 mai, **0** che cambiano con «se» |
| **D-129** a schermo, 36 episodi a 360, 375 e 412 | **211/422** chiamate con spicchio e «Urgente!» a ogni misura, **0 discordanze** con la regola ricalcolata dalla sonda; prima (D-126 c) erano 361/422 |
| **D-128**, stemmi nel gioco a 360, 375 e 412, DPR 1 e 3 | disegno nuovo in 24/24 casi (`…@D-128`); stemma 42×42 px a ogni misura; guardiano verde e braccio rosso vivo |
| **D-128**, leggibilità | GIUDIZIO: a DPR 3 pigna e campanile si riconoscono; a DPR 1 la pigna è una trama (scaglie da 0,76 px) → C29-06 |
| **C27-03** sotto carico | **0/300** aperture della città con errori (412 e 360, 150 giri ciascuna); braccio rosso C80R01 **5/150**: **chiuso** |
| **C26-06** riga «Stasera» | 6/6 episodi con `partita` mostrano i due club giusti in città, sala e verbale a 3 misure: **chiuso** |
| **C27-06** e19 | 0 ondate a 360/375/412: **chiuso**. Restano i **7 casi** a 360 (stessi px² della sviluppatrice), **3** a 375, **0** a 412 |
| **C28-04** e02 | «RAILHEAD NON DIMENTICA» (`data/testi/it/e02.json:71`): **chiuso** |
| C28-01, 02, 05, 09, 11, 14 | **tutti ancora presenti** (§ 2) |
| Coerenza e02, e07, e13, e21, e25, e28, e31 | testi ↔ dati ↔ resa coerenti; ma l'ordine della sfida contraddice il testo in e24 ed e26 → C29-03 |
| **Difetto nuovo, regressione della 0.23.0** | la vignetta della sala **si accende e si spegne a ogni frame** in alcune finestre (1366×768, 360×700, 393×720-760, 412×720…) → **C29-01** |
| Difetto vecchio mai segnalato | e04 ondata 2: il corteo «entra» ma 58/69 persone vanno via dallo stadio → C29-02 |
| Bot, 1000 semi × 4 strategie × 36 episodi | **0 blocchi** in 156/156 righe; «chiamate mai comparse» `[]` 36/36 |
| Test e tipi | `npx vitest run` **41/41 file, 221/221 test**; `npx tsc --noEmit -p .` uscita 0 |
| Salvataggi | 12/12 veri della 0.24.0 e 12/12 della 0.22.0 ripresi sulla stessa chiamata; R1 6/6, R2 3/3; 0 errori |
| Schermate 360×760, 375×667, 412×915 (1916 per misura) | 0 scorrimenti orizzontali, 0 tagli, 0 nomi vecchi, **0 errori di console**, comandi coperti 0 / 142 / 1 (come il C-028) |

# 1. Novità, voce per voce

## 1.1 D-129: «Urgente!» solo con un evento a pressione ≥ 4

**FATTO (codice).**
- `urgente()` è in `src/resa/vignette-evento.tsx:36`: un evento sul settore della chiamata con `pressione >= URGENTE_DA`.
- `URGENTE_DA = 4` è a `:40`.
- `eventiSul()` (`:43-48`) prende gli eventi della stessa ondata e dello stesso settore, con «se» valutato.
- Lo usa `Chiamata` per timbro e spicchio (`src/resa/schermate/Ondata.tsx:24,62`).

**FATTO MISURATO, tre livelli:**

| livello | comando | campione | urgenti D-129 | con D-126 c |
|---|---|---|---|---|
| dati, «se» ignorato | `node coordination/sonde/c29-urgenza-dati.mjs` | 498 chiamate (40 senza settore) | **235 (47,2 %)** | 415 (83,3 %) |
| motore, partite vere | `node coordination/sonde/c29-urgenza-logica.mjs 200` | 36 episodi × 4 strategie × 200 semi = 338 568 chiamate aperte | **169 124 (50,0 %)** | 289 819 (85,6 %) |
| schermo, fumetto della chiamata | `W=… node coordination/sonde/c29-schermate.mjs . <foto> <uscita>`, poi `node coordination/sonde/c29-urgenza-analisi.mjs <uscite>` | 422 chiamate × 3 misure | **211/422** a 360, 375 e 412 | 361/422 |

- **Confronto con la regola, a schermo.** Per ogni chiamata la sonda legge sul fumetto `[data-messaggio="chiamata-<id>"]` lo spicchio (`[data-urgenza]`) e il timbro «Urgente!». L'atteso lo ricalcola dai dati con le variabili della partita in quel momento.
  - Esito: **0 discordanze** su 1266 chiamate.
  - **0** casi di spicchio senza timbro, o di timbro senza spicchio.
- **Nel motore:** 433/498 chiamate distinte compaiono con le 4 strategie.
  - 213 sono sempre urgenti, 220 mai.
  - **0** cambiano con «se»: i 3 eventi con condizione non spostano l'urgenza di nessuna chiamata comparsa.
  - Per episodio la quota va dal 19,8 % (e05) al 75,0 % (e24, e36): tabella in `uscite-c29/urgenza-logica.log`.
- **Prima e dopo, stesso episodio** (e25, bot attento, seme 1):
  - 0.24.0: urgenti 11/12;
  - 0.25.0: 6/12.
  - Foto: `docs/foto/c29/prima-dopo-{360x760,375x667,412x915}-e25-chiamata-voce_dessi.jpg` (pressione 2: «Urgente!» prima sì, ora no) e `…-chiamata-permesso_mediatore.jpg` (pressione 4: «Urgente!» in tutte e due).

**Realismo** (FATTO dati; GIUDIZIO dove marcato) → C29-04:
- L'urgenza dipende dal settore, non da chi chiama né da cosa dice. Nella corsa a 360 sono urgenti:
  - 20/44 chiamate di «voci in rete»;
  - 3/7 della stampa locale e 3/5 del cronista;
  - in e25, la nota della Struttura sull'autorizzazione scritta del mediatore (foto sopra).
- Restano non urgenti tre chiamate con una rissa o una faida sul settore, a pressione 3: `e09 lite_coda` («lite fra automobilisti e una decina scesa dai pullman»), `e09 immagini_club`, `e21 nuovo_capo`.

## 1.2 D-128: stemmi ridisegnati

**FATTO (codice/dati).**
- I disegni sono nella tabella `D128` (`src/resa/stemma.tsx:68-84`).
- I dati hanno già gli id nuovi: `data/club/calderholt_rovers.json:1` `"simbolo": "fontana"`, `data/club/quillhaven_albion.json:1` `"albero_cortile"`.
- Lo stemma è largo `--avatar` = 42 px (`src/resa/token.css:182`, `src/resa/stile.css:199`), uguale a ogni larghezza di finestra.

**FATTO MISURATO.** Comando: `node coordination/sonde/c29-stemmi.mjs . docs/foto/c29 coordination/sonde/uscite-c29/stemmi.json`.
- La sonda apre il gioco vero e sceglie in città e08 (Square), e06 (Garden), e16 (Pinegrove) ed e25 (Belltower).
- Misura alla riga «Stasera» a 360, 375 e 412, a DPR 1 e 3.
- Esito: 24/24 casi col disegno `…@D-128`, 0 errori di console. Le misure non cambiano con la finestra.

| club | simbolo (px CSS) | contrasto simbolo/forma | note |
|---|---|---|---|
| Square Rovers, fontana | 17,6×23,8 | 3,14:1 | |
| Garden Albion, albero nel cortile | 15,1×21,4 | 2,66:1 | alone bianco: il guardiano C22-06 lo accetta, `tools/foto-c22.mjs` |
| Pinegrove Rangers, pigna | 11,7×23,1 | 5,76:1 | scaglie da **0,76 px CSS**: 0,76 px fisici a DPR 1, 2,3 a DPR 3 |
| Belltower Harriers, campanile | 12,6×26,5 | 3,50:1 | |

**Guardiano (FATTO MISURATO).**
- `node tools/foto-stemmi.mjs <cartella>` → «stemmi: nessun errore», exit 0.
- `VALMORA_ROSSI=C83S01 node tools/foto-stemmi.mjs <cartella>` → exit 1 a 360, 375 e 412: il braccio rosso è vivo.
- Ma per Square e Garden il rosso mostra le **iniziali**, non «i disegni di prima» → C29-05.

**Foto:**
- `docs/foto/c29/stemma-{360,375,412}-dpr{1,3}-<club>.png`: ritaglio dello stemma.
- `stemmi-…-<episodio>.png`: riga della sfida.
- `tavola-stemmi-d128-360.png`: a sinistra DPR 1 ingrandito 6×, a destra DPR 3 ingrandito 2×, cioè la stessa misura a schermo.
- `tavola-sfida-360-dpr1.png` e `tavola-sfida-360-dpr3.png`: le quattro sfide a grandezza vera.

**GIUDIZIO** (mio, sulle tavole; non è una misura; la decisione è del PO):
- **Pigna:**
  - a DPR 3 si legge come una pigna appesa al gambo, con le scaglie a file; non sembra più un ananas;
  - a DPR 1, a grandezza vera, è un ovale giallo con una trama viola indistinta: «frutto» o «pannocchia» più che pigna.
- **Campanile:**
  - a DPR 3 si riconosce (tetto, cella ad arco con la campana, orologio, porta);
  - a DPR 1 si legge come una torre o una casa alta; la campana è una macchia.
  - Meglio dell'obelisco di prima.
- **Fontana:** a DPR 1 la sagoma a due vasche col getto può sembrare una coppa o una corona; a DPR 3 è una fontana.
- **Albero nel cortile:** l'albero si legge; i due pilastri col suolo sotto formano una «U» che a DPR 1 non dice «cortile».
- Sul telefono vero, a distanza di lettura, non posso confermarlo.

## 1.3 C27-03: «reading 'on'» in StratoCitta, sotto carico

**FATTO (codice).** `seguiMisura()` è in `src/resa/mappa/schermo.ts:22-33`: si attacca a `renderer` solo quando c'è. La usano `StratoCitta.tsx:20` e `StratoPixi.tsx:33`.

**FATTO MISURATO.** Comando: `W=… GIRI=150 [ROSSI=C80R01] node coordination/sonde/c29-citta-errori.mjs . <uscita>`. È la sonda del C-027 (ricarica → «Riprendi» → città → episodio → sala), con in più i bracci rossi. Girava con altre 3-5 corse di browser in parallelo, quindi sotto carico come nel C-027.

| corsa | giri completati | giri con errore |
|---|---|---|
| 0.25.0, 412×915 | 150/150 | **0** |
| 0.25.0, 360×760 | 150/150 | **0** |
| 0.25.0, rosso C80R01, 412×915 | 150/150 | **5** (giri 43, 53, 59, 60, 92; 7 messaggi «Cannot read properties of undefined (reading 'on')») |
| C-027 sulla 0.21.0 (riferimento) | 150/150 | 2 |

In più, 0 errori di console nelle 3 corse delle schermate (36 aperture della città ciascuna), nella corsa `c28-grandi.mjs` a 360 e nelle prove di mouse, tastiera e salvataggi.

**Esito: chiuso.** La sonda vede il difetto: col rosso compare in 5/150 giri.

## 1.4 C26-06 (riga «Stasera» col campo `partita`), C28-04 (e02), C27-06 (pastiglie)

**C26-06.**
- FATTO (codice): `sfidanti()` usa `m.partita` (`src/resa/stemma.tsx:113`).
- FATTO MISURATO (`c28-schermate-analisi.mjs` sulle uscite di `c29-schermate.mjs`): città, sala e verbale a 360, 375 e 412 mostrano:
  - e07 «SKYFIELD ATHLETIC contro SOUTHWIND TOWN»;
  - e13 «KILN UNITED contro TRAMWAY BOROUGH»;
  - e21 «… contro PINEGROVE RANGERS»;
  - e25 «… contro BELLTOWER HARRIERS»;
  - e28 «… contro ARCHES TOWN»;
  - e31 «SKYFIELD ATHLETIC contro RAILHEAD COUNTY».
- Con gli stemmi dei due club. Coerenti con `partita` e con i testi d'apertura (§ 3).

**C28-04.**
- `data/testi/it/e02.json:71` «In curva ospiti uno striscione: «RAILHEAD NON DIMENTICA»»; la curva è `railhead_county` (`data/missioni/e02.json:57,74`).
- A schermo, nella chiamata `striscione_ospiti`, nessun «Square» nelle 3 corse.

**C27-06.**
- Comando: `node coordination/sonde/c29-pastiglie.mjs . <uscita> docs/foto/c29`. Stessi stati (`partenzeAttente`) e stessa misura (`mappaSchieramento`) del guardiano `tools/foto-schieramenti.mjs`, a tre misure, 142 ondate ciascuna.

| misura | ondate con pastiglie sopra i nomi | nomi su nomi | pastiglie col centro coperto | fuori dalla mappa |
|---|---|---|---|---|
| 360×760 | **7** | 0 | 0 | 0 |
| 375×667 | **3** (e13 o1 e o4 116 px², e35 o2 149 px²) | 0 | 0 | 0 |
| 412×915 | **0** | 0 | 0 | 0 |

- e19 è a 0 a ogni misura, e nelle schermate «Magazzino delle fonderie» × pastiglia compare in 0 schermate. **Chiuso.**
- I 7 casi residui sono § 2.

# 2. Rilievi aperti di C-027 e C-028

| rilievo | ancora presente? | misura C-029 | misura precedente |
|---|---|---|---|
| **C28-01** tela della mappa che non segue la mappa (fascia scura) | **sì** | `W=360 H=760 node coordination/sonde/c28-grandi.mjs`: tela ≠ mappa in **1412/1700** schermate con mappa; si vede nelle foto `prima-dopo-*-e25-*.jpg` (quarto basso scuro). Codice invariato: `resizeTo={p.contenitore}` (`src/resa/mappa/StratoPixi.tsx:176`) | C-028: 1412/1700 |
| **C28-02** opzione già accesa sotto il puntatore fermo | **sì** | `c28-mouse.mjs` a 768×1024 **28/39**, a 1920×1080 **30/39**; `stile.css:58` invariato | C-028: 29/39 e 29/39 |
| **C28-09** fuoco perso dopo un'azione | **sì** | `c28-tastiera.mjs` a 1366×768, e01/e13/e19/e30: 4/4 episodi finiti, 412 azioni, **fuoco perso 94/412**, 0 coperto, 0 fuori finestra | C-028: 82/412 |
| **C28-11** versione lontana dalla colonna | **sì** | `node coordination/sonde/c29-versione.mjs .`: −16 px a 360 e 412 (nel margine), **+128** (768), **+256** (1024), **+427** (1366), **+704** (1920); `stile.css:370` `position: fixed; right: 0` | C-028: stessi numeri |
| **C28-14** nomi sotto le pastiglie in e13/e16 | **sì** (in parte cambiato) | `c28-c2611.mjs`: e13 «Viale fra stadio e piazza» × pastiglia «1» **15,8×10,4 px in 24 schermate** (360) e 12,1×9,6 in 16 (375); e16 «Magazzino delle fonderie» × pastiglia 34,6×6,0 in 16 (360); «Parcheggi» × pastiglia **0** (era 34,6×3,3). GIUDIZIO sulla foto `pastiglie-360-e13-o1.png`: il disco verde dei Parcheggi copre ancora «FRA» del nome | C-028: Viale 15 schermate, Parcheggi 16, e16 16 |
| **C28-05** corteo della chiamata via dallo stadio solo in maggioranza | **sì** | `W=360 EP=e30,e17,e04 node coordination/sonde/c27-pixel.mjs`, tabella `c28-verso-tabella.mjs`: e30 `silenzio_totale` **13 verso / 27 via**, `fiaccolata` **13 / 26**, e17 `me_lo_dovete` **6 / 33**; ondata 0-1 / 68-69 | C-028: 12/28, 13/26, 5/34 |
| **C27-06**, 7 casi residui | **sì**, a 360 tutti e 7 | e05 o3 11 px², e13 o1 e o4 164 px², e13 o2 35 px², e16 o1 e o2 208 px², e35 o2 149 px² (identici al rapporto della sviluppatrice); a 375 restano 3, a 412 0 (§ 1.4) | sviluppatrice: 7/142 a 360 |

# 3. Coerenza testi ↔ dati ↔ resa (e02, e07, e13, e21, e25, e28, e31)

FATTO (dati), con i testi d'apertura e le chiamate che nominano i club:

| episodio | dati | testi | resa (sfida, 3 misure) | esito |
|---|---|---|---|---|
| e02 | curva ospiti `railhead_county` (`e02.json:57,74`) | «Arrivano quelli del Railhead County» (`e02.json:3`), striscione «RAILHEAD NON DIMENTICA» (`:71`) | RAILHEAD COUNTY contro SKYFIELD ATHLETIC | coerente; ospiti per primi → C29-03 |
| e07 | `partita` Skyfield–Southwind; curva solo ospite | «Southwind Town … Prima trasferta in città» (`e07.json:3`) | SKYFIELD ATHLETIC contro SOUTHWIND TOWN | coerente |
| e13 | `partita` Kiln–Tramway; nessun settore del Tramway | «Amichevole … Kiln–Tramway. Settore ospiti inagibile: quelli del Tramway stanno fuori» (`e13.json:3`), «restano sul piazzale» (`:6`) | KILN UNITED contro TRAMWAY BOROUGH | coerente |
| e21 | `partita` Kiln–Pinegrove | «Pinegrove in coppa» (`e21.json:3`), «Kiln–Pinegrove in corso» (`:72`) | KILN UNITED contro PINEGROVE RANGERS | coerente |
| e25 | `partita` Kiln–Belltower; nessuna curva del Belltower | «Curva ospiti chiusa per ordinanza, ma il Belltower arriva lo stesso» (`e25.json:4`), «col treno urbano» (`:6`) | KILN UNITED contro BELLTOWER HARRIERS, campanile nuovo | coerente |
| e28 | `partita` Kiln–Arches (`mossgarth_town`) | «Kiln–Arches, trasferta vietata agli ospiti» (`e28.json:4`) | KILN UNITED contro ARCHES TOWN | coerente |
| e31 | `partita` Skyfield–Railhead; curva solo ospite | «Stasera Skyfield–Railhead … La curva Skyfield diserta» (`e31.json:4`) | SKYFIELD ATHLETIC contro RAILHEAD COUNTY | coerente |

Fuori dai sette episodi, guardando l'ordine della sfida: dove non c'è `partita`, l'ordine è quello delle curve nei dati. In e24 ed e26 contraddice il testo → C29-03.

# 4. Regressioni (FATTO MISURATO)

**Bot.** `node tools/bot.mjs 1000` (`uscite-c29/bot-1000.log`):
- 156 righe missione × strategia, **0 blocchi** su 1000 semi in 156/156;
- «chiamate mai comparse» `[]` in 36/36.

**Test e tipi.**
- `npx vitest run` → «Test Files 41 passed (41) · Tests 221 passed (221)».
- `npx tsc --noEmit -p .` → uscita 0.

**Salvataggi veri.**
- `EP=e02,e06,e07,e08,e13,e16,e19,e21,e25,e28,e31,e33 VA=0.24.0 VECCHI_DIR=coordination/sonde/salvataggi-022 node coordination/sonde/c28-salvataggi.mjs <0.24.0> . coordination/sonde/salvataggi-024 <uscita>`:
  - 12/12 salvataggi esportati col pulsante dalla **0.24.0** a metà della prima ondata (fra questi i 4 episodi degli stemmi nuovi e i 6 con `partita`), importati nella 0.25.0 e ripresi sulla **stessa chiamata**;
  - 12/12 salvataggi veri della **0.22.0** ripresi;
  - 0 errori di console in tutte e due le build.
- `EP=e01,e08,e17,e21,e30,e33 node coordination/sonde/c25-ripresa.mjs . <uscita>`:
  - R1 6/6 (ricarica, export, import);
  - R2 3/3 salvataggi reali vecchi di `tests/salvataggi-reali/` (v1 e v2 0.4.0);
  - 0 errori.

**Schermate.** `W=… node coordination/sonde/c29-schermate.mjs . <foto> <uscita>`: 36 episodi, piano del bot attento, seme 1, asset veri.

| misura | schermate | scorrimento orizzontale | tagli | nomi vecchi | comandi coperti | errori di console | blocchi |
|---|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 0 | 0 | 0 |
| 375×667 | 1916 | 0 | 0 | 0 | 142 («?» sotto la barra, come C-026/27/28) | 0 | 0 |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, C27-07) | 0 | 0 |

- Vignette di sala e verbale come nella 0.23.0: mostrate 36/36 a 360 e 412, nascoste 36/36 a 375×667.
- Foto prima/dopo con asset veri: `docs/foto/c29/prima-dopo-{360x760,375x667,412x915}-e25-{citta,chiamata-voce_dessi,chiamata-permesso_mediatore}.jpg`.
- Percorso completo a 360 di e13 ed e30: `docs/foto/c29/360x760-e13-*.png`, `360x760-e30-*.png`.

**Fuori dalle tre misure:** la sala trema → C29-01.

# 5. Usabilità e realismo (GIUDIZIO, marcato)

- **Urgenza:**
  - con D-129 il timbro compare su metà delle chiamate invece che su 6 su 7, e comincia a distinguere;
  - ma non dice cosa significa: la guida non parla di «Urgente!» né dello spicchio (`data/testi/it/comune.json:94-107`);
  - e compare su voci di rete, giornalisti e note burocratiche, perché segue il settore e non la chiamata → C29-04.
  - Da giocatore lo leggo come «questa chiamata è grave», e in e25 la nota sull'«articolo dodici» con «Urgente!» stona.
- **Stemmi:** la riga «Stasera» ora mostra sempre i due club giusti. La pigna a DPR 1 resta difficile (§ 1.2).
- **Sala che trema** (C29-01):
  - a 360×700 o a 1366×768 la vignetta compare e sparisce a ogni frame (119 cambi su 120) e il pulsante «Avanti» salta di 51-53 px;
  - a vista è uno sfarfallio continuo, sgradevole da guardare;
  - col mouse 5 clic su 30 vanno a vuoto.
- **Mappa:** la fascia scura in basso (C28-01) si nota in ogni foto con la mappa quadrata; nomi coperti da ▼/▲ per un attimo dopo la risposta (C27-07): es. «CURV▼N» in `360x760-e25-chiamata-permesso_mediatore` (dentro le foto prima/dopo).

# Rilievi (per gravità)

## Alto

**C29-01 — La vignetta della sala si accende e si spegne a ogni frame in alcune finestre: pagina che salta, pulsante che si sposta, clic a vuoto. Regressione della 0.23.0 (C78V01).**

**Riproduzione:** e01, città → «Gioca» → sala, finestra 1366×768 o 360×700. Non serve toccare niente.

**Misura** (FATTO MISURATO, `W=… H=… [ROSSI=…] node coordination/sonde/c29-sala-tremolio.mjs <radice>`, 120 frame letti; `uscite-c29/sala-tremolio.log`):

| finestra | build | cambi in 120 frame | vignetta | altezza della pagina | pulsante (y) |
|---|---|---|---|---|---|
| 1366×768 | 0.25.0 | **119** | 78,6 ↔ 0 px | 822 ↔ 768 | 693 ↔ 640,4 |
| 1366×768, `reducedMotion` | 0.25.0 | **119** | idem | idem | idem |
| 360×700 | 0.25.0 | **119** | 66,6 ↔ 0 px | 744 ↔ 700 | 625 ↔ 574,4 |
| 1366×768 | 0.24.0 | **119** | idem | idem | idem |
| 1366×768, rosso **C78V01** | 0.25.0 | **0** | nascosta | 768 | 640,4 |
| 360×760 (misura dei guardiani) | 0.25.0 | 0 | 78,6 | 760 | 661 |

**Quante finestre** (`EP=e01,e13,e25 node coordination/sonde/c29-sala-sweep.mjs . <uscita>`; 8 larghezze × 16 altezze, la stessa pagina ridimensionata, 30 frame):
- e01 trema in **14/128** finestre, e13 in **16/128**, e25 in **13/128**;
- fra queste ci sono finestre da telefono: 360×700, 375×700/720, 393×700-760, 412×720/740 (dipende dall'episodio);
- a 360×760, 375×667 e 412×915 non trema;
- col rosso C78V01: **0/128** (e01, e13).
- Tabella completa in `uscite-c29/sala-sweep.log`.

**Effetti misurati:**
- `c28-mouse.mjs` a 1366×768 si ferma in sala in **3/3** episodi: Playwright «element is not stable» (`c29-sala-mouse.mjs`, foto `docs/foto/c29/sala-mouse-1366x768-e01-passo1.jpg`). Nel C-028, sulla 0.22.0, la stessa sonda finiva 12/12.
- Clic «da giocatore»: si legge dove sta il pulsante, si aspettano 120 ms e si clicca lì (`W=1366 H=768 N=30 [ROSSI=C78V01] node coordination/sonde/c29-sala-clic.mjs .`). Esito: **5/30 a vuoto**; col rosso C78V01 0/30.

**Causa** (FATTO, codice; meccanismo IPOTESI):
- C78V01 (205ec78, 0.23.0) legge l'altezza della vignetta da `parseFloat(css.height)` subito dopo `svg.style.removeProperty('height')` (`src/resa/vignetta.tsx:15,30`). Prima la leggeva dal riquadro a schermo.
- IPOTESI:
  - da nascosta (`display: none`) l'altezza letta vale 0;
  - da mostrata vale l'altezza del CSS, non quella in pagina;
  - così `vuole` (`:31`) scavalca il minimo una volta sì e una no;
  - il `ResizeObserver` di `:43` rifà la misura a ogni cambio di altezza di `main`, e il giro non si ferma.
- Il commento di `:24-25` dice che i margini si tolgono proprio «per non farla riapparire e sparire a ogni misura».

**Perché la catena non lo vede:** i guardiani misurano solo 360×760, 375×667 e 412×915 (`tools/foto.mjs:21`), dove la sala è ferma. Nel verbale (vignetta `esito-`, stessa funzione) il tremolio non l'ho misurato: non posso confermarlo.

## Medio

**C29-02 — e04 ondata 2: il corteo dei ritardatari «entra», ma sulla mappa 58/69 persone vanno via dallo stadio (anche la chiamata: 32/40).**

**Misura** (FATTO MISURATO, `c27-pixel.mjs` a 360, tabella `c28-verso-tabella.mjs`, `uscite-c29/verso.log`):
- e04/2 `coro_fonderie`, `data-folla` «parcheggi>entra»: ondata **11 verso / 58 via** (n 69), chiamata **8 / 32** (n 40).
- È così anche nelle uscite del C-028: 0.21.0 11/58 e 7/32, 0.22.0 11/59 e 7/31. Quindi non è nuovo, ma non era nei rapporti.

**Testi:**
- «Poco prima del fischio: gli ultimi tifosi entrano, passando dalla zona del mercato» (`data/testi/it/e04.json:50`);
- «i ritardatari vogliono passare cantando dalla piazza delle fonderie» (`e04.json:76`).
- Dati: evento `ritardatari`, tipo `arrivo`, su `parcheggi` (`data/missioni/e04.json`, ondata 2).

**Causa:** IPOTESI. È la stessa famiglia di C27-02 e C28-05: senza stadio pieno il viale non porta allo stadio (`sfondo.ts`). La geometria del tratto «parcheggi» non l'ho misurata.

**Guardiano:** `tests/corteo-verso.test.ts` non fissa e04/2.

## Basso

**C29-03 — Sfida con gli ospiti per primi in 5 episodi; in e24 ed e26 l'ordine contraddice il testo.**

**Misura:** FATTO MISURATO, `c29-schermate.mjs` a 360, scena città.
- e24: «STONEWAY WANDERERS contro SKYFIELD ATHLETIC» contro «Skyfield–Stoneway, il titolo si decide qui» (`data/testi/it/e24.json:3`).
- e26: «DOMEPARK VILLA contro SKYFIELD ATHLETIC» contro «Finale di coppa in casa: Skyfield contro Domepark» (`e26.json:3`).
- Ospiti per primi anche in e02 (Railhead), e03 (Garden) ed e18 (Lookout). Nei 6 episodi con `partita` la casa è prima.

**Causa:** FATTO (codice/dati). Senza `partita` l'ordine è quello delle curve nei dati (`src/resa/stemma.tsx:116`); in e02, e03, e18, e24 ed e26 `curva_ospiti` viene prima di `curva_larkspire` (es. `data/missioni/e24.json:48,65`).

**C29-04 — «Urgente!» segue il settore, non la chiamata, e la guida non lo spiega.**

**Misura:** § 1.1.
- Voci in rete 20/44, stampa 3/7, cronista 3/5 urgenti nella corsa a 360.
- Urgenti per fonte su tutte le 498 chiamate: `uscite-c29/urgenza-fonti.log`.
- Tre chiamate con una rissa o una faida (pressione 3) non urgenti.

**Guida:** nessuna voce su timbro e spicchio (`data/testi/it/comune.json:94-107`).

**Commento vecchio:** `src/resa/schermate/Ondata.tsx:24` dice ancora «D-126 c».

GIUDIZIO: è la regola decisa dal PO (D-129), applicata correttamente; il rilievo riguarda come la legge un giocatore.

**C29-05 — D-128: il braccio rosso C83S01 non mostra più «i disegni di prima» per Square e Garden; restano un alias e un piano con gli id vecchi.**

- **Misura:** `VALMORA_ROSSI=C83S01 node tools/foto-stemmi.mjs <cartella>` → «calderholt_rovers: iniziali al posto del simbolo «fontana»; quillhaven_albion: iniziali al posto del simbolo «albero_cortile»». Il guardiano resta rosso (exit 1), quindi vivo.
- **Causa:** FATTO (codice/dati).
  - I dati hanno gli id nuovi (`data/club/calderholt_rovers.json:1`).
  - Col rosso `simboloDi` cerca `fontana` in `SIMBOLO` e `NUOVI`, che non lo hanno (`src/resa/stemma.tsx:86`).
  - Il commento «Rosso C83S01: com'erano» (`:67`) e l'alias `VECCHI_ID` «finché i dati hanno gli id vecchi» (`:85`) non valgono più.
  - `PIANO` in `tools/foto-stemmi.mjs:15-16` ha ancora `calderone` e `penna`, ma i file dei dati vincono (`clubDaProvare`).

**C29-06 — D-128: a DPR 1 le scaglie della pigna sono sotto il pixel.**

- **Misura:** scaglie 0,9 unità × scala 0,84 = **0,76 px** (§ 1.2): 0,76 px fisici a DPR 1, 2,3 a DPR 3.
- GIUDIZIO sulle tavole: a DPR 1 la pigna è una trama, a DPR 3 si legge. Quale DPR conti è una decisione del PO. Sul telefono vero non posso confermarlo.

# Verificati e chiusi

| rilievo / novità | misura |
|---|---|
| **D-129** urgenza con pressione ≥ 4 | dati 235/498; motore 50,0 % di 338 568 chiamate; a schermo 211/422 a 3 misure, **0 discordanze**; rosso del guardiano C82U01 descritto dalla sviluppatrice (non rifatto da me) |
| **C26-10** «Urgente!» quasi ovunque | 361/422 → **211/422** a schermo (resta C29-04 sul significato) |
| **D-128** disegni nuovi | 24/24 `…@D-128` a 360/375/412 × DPR 1/3; guardiano verde, rosso C83S01 exit 1 (con C29-05) |
| **C25-07, C26-07** simboli scollegati dal nome | fontana e albero nel cortile al posto di calderone e penna (`data/club/*.json`); leggibilità a DPR 1 in C29-06 |
| **C27-03** «reading 'on'» | 0/300 giri sotto carico; rosso C80R01 5/150 |
| **C26-06** riga «Stasera» col campo `partita` | 6/6 episodi, città/sala/verbale, 3 misure |
| **C27-06** e19 | 0 a 360/375/412 (residui in § 2) |
| **C28-04** striscione di e02 | «RAILHEAD NON DIMENTICA», curva `railhead_county` |
| Regressioni | bot 0 blocchi 156/156 × 1000 semi; 221/221 test; tipi 0; salvataggi 12/12 + 12/12 + 6/6 + 3/3; 5748 schermate con 0 scorrimenti, 0 tagli, 0 errori |

# Note di metodo e limiti

- **Misura ritirata:** il primo giro di `c29-sala-clic.mjs` si è fermato con un timeout. La sonda aspettava il pulsante «passo» anche quando i passi della sala erano finiti. L'ho corretta (riparte dalla sala quando il pulsante non c'è più) e rifatta; i numeri sopra sono quelli della seconda versione.
- **Sweep:** `c29-sala-sweep.mjs` ridimensiona la stessa pagina in sequenza, quindi lo stato di una finestra può dipendere dalla precedente. Ho rifatto le due finestre principali con una pagina nuova (`c29-sala-tremolio.mjs`, 1366×768 e 360×700): tremano tutte e due.
- **Cosa non ho misurato:**
  - con la sola tastiera la sala si attraversa (C28-09: 4/4 episodi a 1366×768), ma lo sfarfallio a schermo non lo misura;
  - mouse a 1366×768: le prove di trascinamento e ritiro non sono partite per C29-01; le ho fatte a 768×1024 e 1920×1080 (3/3 e 3/3).
- **Tipo di macchina:** Chromium headless; DPR 3 simulato (`deviceScaleFactor`). Telefoni, tablet e PC veri, la WebView dell'APK e la lettura degli stemmi a occhio nudo: non posso confermarli.
- **Tempi e carico:** fino a 6 browser su 4 CPU. I tempi in secondi reali servono solo a dire quanto è durata una corsa, mai come misura.

# Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c29-schermate.mjs` | come `c27-schermate.mjs`, più urgenza letta sul fumetto della chiamata, pressioni degli eventi, `STRAT` e `SEME` | `W=… [EP=…] [FOTO=1] [STRAT=…] [SEME=…] node coordination/sonde/c29-schermate.mjs <radice> <foto> <uscita.json>` |
| `c29-urgenza-analisi.mjs` | D-129 a schermo contro la regola | `node coordination/sonde/c29-urgenza-analisi.mjs <uscite…>` |
| `c29-urgenza-logica.mjs` | D-129 nel motore, 4 strategie × N semi | `node coordination/sonde/c29-urgenza-logica.mjs [N] [uscita.json]` |
| `c29-urgenza-dati.mjs` | D-129 sulle 498 chiamate dei dati, per tipo di evento | `node coordination/sonde/c29-urgenza-dati.mjs` |
| `c29-stemmi.mjs` | stemmi D-128 nel gioco a 3 misure × DPR 1/3, foto e misure | `node coordination/sonde/c29-stemmi.mjs <radice> <foto> <uscita.json>` |
| `c29-citta-errori.mjs` | `c27-citta-errori.mjs` con `ROSSI=` | `W=… GIRI=150 [ROSSI=…] node coordination/sonde/c29-citta-errori.mjs <radice> <uscita.json>` |
| `c29-pastiglie.mjs` | C27-06/C28-14 su 142 ondate a 3 misure, con la misura del guardiano | `[ROSSI=…] node coordination/sonde/c29-pastiglie.mjs <radice> <uscita.json> [foto]` |
| `c29-sala-tremolio.mjs` | C29-01: 120 frame della sala, vignetta, pagina, pulsante | `W=… H=… [MOTO=reduce] [ROSSI=…] [EP=…] node coordination/sonde/c29-sala-tremolio.mjs <radice> [uscita.json]` |
| `c29-sala-sweep.mjs` | C29-01 su una griglia di finestre | `[EP=…] [ROSSI=…] [LARG=…] [ALT=…] node coordination/sonde/c29-sala-sweep.mjs <radice> <uscita.json>` |
| `c29-sala-mouse.mjs`, `c29-sala-clic.mjs` | C29-01: clic col mouse in sala (messaggio di Playwright; clic «da giocatore») | `W=… H=… [EP=…] node coordination/sonde/c29-sala-mouse.mjs <radice> <uscita.json> [foto]`; `W=… H=… [N=30] [ROSSI=…] node coordination/sonde/c29-sala-clic.mjs <radice>` |
| `c29-versione.mjs` | C28-11, distanza della versione dalla colonna | `node coordination/sonde/c29-versione.mjs <radice>` |
| `c28-*.mjs`, `c27-*.mjs`, `c26-*.mjs`, `c25-ripresa.mjs` | come nei rispettivi collaudi | vedi COLLAUDO_C28.md sul ramo claude/valmora-collaudo-c28 |
