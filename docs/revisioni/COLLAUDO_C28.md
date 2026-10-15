# Collaudo C-028 — 0.22.0: novità (C27-01, testi, D-130), rilievi aperti, regressioni; tablet e PC (PO-114)

- **Build collaudata:** main a 869fd35, GAME_VERSION 0.22.0 (`src/versione.ts:160`, commento `:153-159`). Ricostruita in locale con `npm ci` e `npx vite build` (verde).
- **Confronto:** 0.21.0 a 56fa2a1, in un worktree separato (`git worktree add`, `npm ci`, `npx vite build`).
- **Cosa cambia fra le due:** `git diff --stat 56fa2a1 869fd35 -- src data schema tests tools` → 17 file, 80 righe: `folla.ts` (+7, `esceDinamica`), `StratoPixi.tsx` (3 righe), `e17.json` (+1, `verso` su `piazza17b`), `partita` in e07, e13, e21, e25, e28, e31 (+4 ciascuno), testi di e08, e21, e32, e33, schema (+10), `tipi.ts` (+2), `tests/corteo-verso.test.ts`.
- **Ramo:** claude/valmora-collaudo-c28. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-15. **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), DPR 1, Node 22.22, 4 CPU (fino a 4 browser in parallelo).
- **Sonde nuove:** `coordination/sonde/c28-*.mjs`; uscite grezze (JSON e log, compressi) in `coordination/sonde/uscite-c28/`; riprese dai rami del C-026/C-027 senza modifiche: `c26-*.mjs`, `c27-*.mjs`. **Foto:** `docs/foto/c28/` (JPEG). **Salvataggi veri della 0.21.0:** `coordination/sonde/salvataggi-021/`.

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, sulle foto citate; marcato) · **IPOTESI** (marcate).

## Riepilogo

| verifica | esito |
|---|---|
| C27-01: corteo della chiamata col verso dell'ondata (e30 ondate 2 e 4, e17 ondata 4) | **sì, in maggioranza**: 28/40, 26/39, 34/39 persone via dallo stadio (0.21.0: 3/39, 3/40, 0/39); non all'unanimità come l'ondata (68–69 su 69–70) → C28-05 |
| braccio rosso `__NO_C74D01` | vivo: la chiamata torna verso lo stadio (37/39, 37/39, 39/39) |
| e04 `angolo` uguale alla 0.21.0 (atteso dal mandato) | **no**: 0.21.0 39 verso / 0 via, 0.22.0 **0 verso / 39 via** (ora come l'ondata e come `e04.json:84`) → C28-06 |
| e17 `piazza17b` «dallo_stadio» | sì: ondata 0/69 verso lo stadio, chiamata `fine_corteo` 0/39 (0.21.0: 70/70 e 40/40 verso) |
| Testi nuovi (e08, e21, e32, e33): lunghezze | entro D-101: intro ≤ 140 (e08.intro2 **139**), verbale ≤ 220 (199); `node tools/consolidamento.mjs` → «0 problemi» |
| Testi nuovi: coerenza | «quinto derby» giusto; e08/e21 coppa coerenti col calendario; **e08 in coppa finisce «Due a due… Pareggio» senza supplementari** (e03 li ha) → C28-07; e33 corretto a metà → C28-08 |
| D-130 `partita` contro i testi | **6/6 coerenti** (tabella § A3) |
| Rilievi aperti C-026/C-027 | chiusi: C26-04, C26-05, C27-05; a metà: C26-02, C27-01; **ancora presenti**: C26-01, 03, 06, 07, 08, 09, 10, 11, C27-02, 03, 04, 06, 07 (§ A4) |
| Bot, 1000 semi × 4 strategie × 36 episodi | **0 blocchi** in 156/156 righe; «chiamate mai comparse» `[]` 36/36 |
| Test, tipi | `npx vitest run` 39/39 file, **213/213** test; `tsc --noEmit` 0 errori |
| Salvataggi | 12/12 esportati dalla 0.21.0 e ripresi sulla stessa chiamata; 12/12 veri della 0.20.0 ripresi; R1 6/6, R2 3/3 |
| Schermate 360×760, 375×667, 412×915 (1916 per misura) | 0 scorrimenti, 0 tagli, 0 nomi vecchi; errore «reading 'on'» (C27-03) 1 volta a 360 |
| **Parte B: 36 episodi col bot a 768×1024, 1024×768, 1366×768, 1920×1080, 1280×800** | **giocabile a ogni misura**: 36/36 episodi, **0 blocchi**, 0 scorrimenti orizzontali, 0 tagli, 0 elementi fuori schermo, 0 comandi coperti, 0 errori di console |
| Parte B: spazio | colonna fissa 480 px: fuori colonna **37,5 %** (768) … **75,0 %** (1920) della finestra; mappa ≤ 448 px → C28-03 |
| Parte B: orizzontale | opzioni della chiamata **sotto il bordo in 422/422 chiamate** a 1024×768, 1280×800 e 1366×768, come sul telefono a 360×760 (422/422), con oltre metà dello schermo vuota → C28-03 |
| Parte B: mouse | 21/21 prove (trascina, ritira, episodio intero) su 3 episodi × 4 misure; rotella ovunque; **:hover solo sulle opzioni**, e un'opzione resta **accesa sotto il puntatore fermo in 106/156 chiamate** → C28-02 |
| Parte B: tastiera | 4/4 episodi finiti con Tab, Invio e Spazio (412 azioni, 1216 Tab); fuoco sempre visibile e mai coperto; **fuoco perso** dopo 82/412 azioni → C28-09 |
| Parte B: rotazione e ridimensionamento | 40/40 cambi senza perdite (scena, chiamata, pastiglie, salvataggio identici), ripresa dopo ricarica 2/2 |
| Parte B: tocco su tablet | 36/36 episodi col dito a 768×1024 (`page.tap`, `hasTouch`), 0 blocchi, 0 comandi coperti; nessun comando sotto 44 px (la «i» ha l'area allargata) |
| **Difetto trovato a ogni misura (anche 360)** | la tela della mappa non segue la mappa quando cambia forma: **fascia scura** nel quarto basso in **1412/1700** schermate con mappa → C28-01 |

# Parte A — novità della 0.22.0

## A1. Il corteo della chiamata (C27-01)

**FATTO MISURATO.** `W=360 EP=e30,e17,e04 [ROSSI=C74D01] node coordination/sonde/c27-pixel.mjs <radice> <foto> <uscita.json>` (sonda del C-027 invariata): posizioni vere delle persone nella scena Pixi a 400 ms di distanza, piano del bot attento, seme 1; persone che si avvicinano / si allontanano dal centro dello stadio disegnato. Tre build: 0.22.0, 0.21.0, 0.22.0 col braccio rosso C74D01. Riassunto con `node coordination/sonde/c28-verso-tabella.mjs 0.22.0=<log> 0.21.0=<log> rosso=<log>` (log in `coordination/sonde/uscite-c28/pixel-*.log.gz`).

| chiamata (strada) | corteo dell'ondata 0.22.0 | **chiamata 0.22.0** | chiamata 0.21.0 | chiamata rosso C74D01 |
|---|---|---|---|---|
| e30/2 `silenzio_totale` (strada da Kiln) | 1 verso / 68 via | **12 verso / 28 via** | 36 / 3 | 37 / 2 |
| e30/4 `fiaccolata` (strada da Kiln) | 1 / 69 | **13 / 26** | 37 / 3 | 37 / 2 |
| e17/4 `me_lo_dovete` (strada da Kiln) | 0 / 69 | **5 / 34** | 39 / 0 | 39 / 0 |
| e17/4 `fine_corteo` (piazza del municipio) | 0 / 69 | **0 / 39** | 40 / 0 (ondata 70 / 0) | 40 / 0 |
| e04/3 `angolo` (strada da Kiln) | 0 / 70 | **0 / 39** | 39 / 0 | 40 / 0 |
| e30/3 `saluto_larkspire` («entra») | 68 / 1 | 36 / 4 | 36 / 3 | 37 / 2 |
| e04/1 `corteo_fonderie` («entra») | 69 / 0 | 39 / 0 | 39 / 0 | 39 / 0 |

- Le chiamate citate nel collaudo C-027 ora vanno **in maggioranza** nel verso dell'ondata; il rosso rimette il difetto in tutte: il guardiano `tests/corteo-verso.test.ts` è verde (213/213) e il suo rosso è vivo.
- Ma un terzo circa delle persone della chiamata va ancora verso lo stadio (e30: 12/40 e 13/39), mentre l'ondata è unanime → **C28-05**.
- **e04 `angolo` cambia** rispetto alla 0.21.0 (39 verso → 39 via), contrariamente a quanto scritto nel mandato → **C28-06**.
- Foto: `docs/foto/c28/360x760-e30-chiamata-silenzio_totale.jpg`, `360x760-e17-chiamata-me_lo_dovete.jpg`, `360x760-e04-chiamata-angolo.jpg`. GIUDIZIO sulle foto: come nel C-027, in una foto ferma il verso non si legge; si legge solo nel movimento.

## A2. Testi nuovi: lunghezze e coerenza

**Lunghezze (FATTO MISURATO,** `node coordination/sonde/c28-lunghezze.mjs`, confronto con i testi dello stesso tipo nei 36 episodi; limiti D-101 in `tools/consolidamento.mjs:7`: battute ≤ 140, verbali ≤ 220):

| testo (file:riga) | prima → dopo | stesso tipo: mediana / p95 / max | limite |
|---|---|---|---|
| `e08.intro2` (`data/testi/it/e08.json:4`) | 130 → **139** | 128 / 139 / 140 (n 72) | 140: 1 carattere di margine |
| `e21.intro1` (`e21.json:3`) | 133 → 135 | 128 / 139 / 140 | 140 |
| `e32.intro1` (`e32.json:3`) | 121 → 122 | 128 / 139 / 140 | 140 |
| `e32.verbale_degenerato` (`e32.json:128`) | 198 → 199 | 168 / 199 / 209 (n 118) | 220 |
| `e33.op.parte_mezzanotte.r` (`e33.json:117`) | 63 → 82 | 75 / 103 / 136 (n 1131) | 140 |

`node tools/consolidamento.mjs` → «0 problemi». A schermo: 0 testi tagliati a 360/375/412 e alle cinque misure grandi (§ A5, § B1).

**Coerenza con gli altri episodi (FATTO dati, GIUDIZIO dove marcato):**
- **«quinto derby»** (`e32.json:3,128`): giusto. Derby Kiln–Skyfield giocati prima: e01, e10, e20, e22 (`docs/BIBBIA.md:117`); e36 «l'ultimo» (`e36.json:3,36`).
- **e08 ed e21 partite di coppa** (`e08.json:4`, `e21.json:3`): chiudono la doppia partita in casa con lo stesso avversario (C26-04: e04/e08 Square, e16/e21 Pinegrove). Ma **e08 finisce in pareggio senza supplementari**: «Due a due…» (`e08.json:106`), «Pareggio: la scommessa del giorno l'ho vinta» (`e08.json:107`), mentre e03, l'altra coppa della stagione 1, dice «Uno a uno: supplementari, forse rigori» (`e03.json:77`) → **C28-07**. e21 non dice il risultato: coerente.
- La BIBBIA non dice ancora che e08 ed e21 sono di coppa (`docs/BIBBIA.md:120` «Square Rovers … e04, e08», `:125` «Pinegrove … e21 (si gioca durante lo sgombero)»; la coppa è scritta solo per e03 `:119` ed e26 `:121`) → in C28-08.
- **e33 «Sessanta Arches tornano a casa a piedi, lungo gli archi, all'alba»** (`e33.json:117`): toglie «restano in città» (C26-02). Restano «il treno per Arches è di mezzanotte» (`e33.json:111`) e «trasferta tranquilla» (`e33.json:7`); GIUDIZIO: un treno urbano per un quartiere sulla ferrovia si regge (`docs/BIBBIA.md:108`), ma tornare a piedi dentro la città da mezzanotte «all'alba» è lungo per un quartiere della stessa città → C28-08.
- **e02, trovato giocando a mano (§ B6):** lo striscione in curva ospiti «SQUARE NON DIMENTICA» (`data/testi/it/e02.json:71`) sta nella curva del **Railhead County** (`data/missioni/e02.json:57,74` `club: railhead_county`; «Responsabile del Railhead County» nella chiamata accanto). Lo Square Rovers è un club di Valmora (`docs/BIBBIA.md:108,120`) che in e02 non c'è più dalla f00c669 («e02, gli ospiti in treno sono il Railhead County … non più gli Square Rovers»); prima della f00c669 la curva ospiti era `calderholt_rovers` (= Square). La correzione di C25-01 ha cambiato il nome nello striscione ma non il club → **C28-04**.

## A3. Campo `partita` (D-130) contro i testi

FATTO (dati): `node coordination/sonde/c28-partita.mjs` stampa `partita`, le curve dei dati e i testi d'apertura. La resa non usa ancora il campo (`grep -n partita src/resa/stemma.tsx` → nulla): a schermo la riga «Stasera» è ancora quella del C-026 (§ A4, C26-06).

| episodio | `partita` (`data/missioni/eNN.json:3-6`) | testo che lo dice | esito |
|---|---|---|---|
| e07 | Skyfield Athletic – Southwind Town | «Lo Skyfield pareggia» (`e07.json:84`); Southwind «Prima trasferta in città» (`e07.json:3`) | coerente |
| e13 | Kiln United – Tramway Borough | «Amichevole alle sette, Kiln–Tramway» (`e13.json:3`) | coerente |
| e21 | Kiln United – Pinegrove Rangers | «Pinegrove in coppa: i vecchi restano allo stadio» (`e21.json:3`) | coerente |
| e25 | Kiln United – Belltower Harriers | «Curva ospiti chiusa per ordinanza, ma il Belltower arriva lo stesso» (`e25.json:4`) | coerente |
| e28 | Kiln United – Arches Town (`mossgarth_town`) | «Kiln–Arches, trasferta vietata agli ospiti» (`e28.json:4`) | coerente |
| e31 | Skyfield Athletic – Railhead County | «Stasera Skyfield–Railhead» (`e31.json:4`) | coerente |

## A4. Rilievi aperti del C-026 e del C-027 (stato nella 0.22.0)

Codice di resa invariato fuori da `folla.ts`/`StratoPixi.tsx` (diff sopra); D-128 (stemmi) e D-129 (urgenza) sono decise (`docs/governo/DECISIONI.md:139-140`) ma **non ancora nel codice** (`git show --stat b0827fe`: solo documenti; `grep -rn pressione src/resa` non trova la soglia ≥ 4).

| rilievo | stato | misura C-028 |
|---|---|---|
| C26-01 sfida coi gemellati «contro … contro» | **presente** | sala-1 a 360 e 375×667: e15 «RAILHEAD COUNTY contro KILN UNITED contro WALLGATE ROVERS», e27 «KILN UNITED contro RAILHEAD COUNTY contro WATERLINE CITY» |
| C26-02 Arches «di fuori» in e33 | **a metà** | `e33.json:117` corretto; `:111` e `:7` restano (C28-08) |
| C26-03 vignette a 375×667 | **presente** | verbale mostrato nel primo passo 30/36, 61,7–97,0 px; sala 4/36 (come C-027) |
| C26-04 stesso avversario in casa due volte | **chiuso** | e08, e21 di coppa; residuo C28-07 |
| C26-05 «terzo derby» | **chiuso** | «quinto», `e32.json:3,128` |
| C26-06 sfida con un club solo | **presente a schermo** | e07 «SOUTHWIND TOWN», e13/e21/e25/e28 «KILN UNITED», e31 «RAILHEAD COUNTY» a 360 e 375×667; D-130 nei dati, coerente (§ A3), non usato dalla resa |
| C26-07 simboli degli stemmi | **presente** (D-128 decisa, non fatta) | nessun file di stemmi cambiato |
| C26-08 colori per daltonici | **presente** | nessun colore cambiato (`git diff` vuoto su `data/club/`) |
| C26-09 stemma del Tramway mai mostrato | **presente** | e13 sala: solo «KILN UNITED»; D-130 dice che va bene così finché il Tramway non ha una curva |
| C26-10 «Urgente!» quasi ovunque | **presente** (D-129 decisa, non fatta) | 361/422 chiamate a 360 e a 375×667 |
| C26-11 tocchi ed etichette a 360/375 | **presente** | e06 a 360: «ritira Mediatore da Piazza del concerto» coperto da `settore-punto` (1/1916) |
| C27-02 viale verso il centro senza stadio pieno | **presente** | `sfondo.ts` non cambiato; è anche la causa di C28-05 (IPOTESI, § C28-05) |
| C27-03 «reading 'on'» in StratoCitta | **presente** | 1 volta nelle 3 corse delle schermate (360×760, ritorno in città dopo e01), 1 volta in `c25-ripresa.mjs`; 0 nelle 7 corse `c28-grandi.mjs` (13 167 schermate) e nelle 4 corse del mouse; nella 0.21.0 2 volte durante l'esportazione dei salvataggi |
| C27-04 fase di partita sbagliata | **presente** | `folla.ts:22,25` invariati |
| C27-05 e17 `piazza17b` | **chiuso** | § A1 |
| C27-06 e19 «Magazzino delle fonderie» sotto una pastiglia | **presente a 360/375/412**, **assente** da 768 in su | 16 schermate a 360, 375 e 412, 34,6×22,6 px; 0 nelle sei corse grandi; a 1024×768 l'etichetta è libera (foto `1024x768-e19-schieramento-1.jpg`) |
| C27-07 piccole sovrapposizioni | **presente** | stesse coppie del C-027 |

## A5. Regressioni (FATTO MISURATO)

- **Bot:** `node tools/bot.mjs 1000` → 156 righe missione × strategia, **0 blocchi** su 1000 semi in 156/156; «chiamate mai comparse» `[]` 36/36.
- **Test e tipi:** `npx vitest run` → «Test Files 39 passed (39) · Tests 213 passed (213)»; `npx tsc --noEmit -p .` → uscita 0.
- **Salvataggi:** `EP=e04,e07,e08,e13,e17,e21,e25,e28,e30,e31,e32,e33 VA=0.21.0 VECCHI_DIR=coordination/sonde/salvataggi-020 node coordination/sonde/c28-salvataggi.mjs <0.21.0> . coordination/sonde/salvataggi-021 <uscita>`: 12/12 salvataggi esportati col pulsante dalla 0.21.0 a metà della prima ondata (anche dei sei episodi con `partita` e dei quattro con testi nuovi), importati nella 0.22.0 e ripresi sulla **stessa chiamata**; 12/12 salvataggi veri della 0.20.0 (`salvataggi-020/`) ripresi su una chiamata; 0 errori di console nella 0.22.0 (nella 0.21.0, durante l'esportazione, 2 volte «reading 'on'», C27-03). `EP=e01,e08,e17,e21,e30,e33 node coordination/sonde/c25-ripresa.mjs . <uscita>`: R1 6/6 (ricarica, export, import), R2 3/3 salvataggi reali vecchi di `tests/salvataggi-reali/`; 1 errore «reading 'on'».
- **Schermate:** `W=… H=… node coordination/sonde/c27-schermate.mjs . <foto> <uscita>`, 36 episodi, piano del bot attento:

| misura | schermate | scorrimento | tagli | nomi vecchi | comandi coperti | errori |
|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 1 (e06, C26-11) | 1 «reading 'on'» (dopo e01) |
| 375×667 | 1916 | 0 | 0 | 0 | 142 («?» sotto la barra in cima, come C-026/C-027) | 0 |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, centro sul bordo: C27-07) | 0 |

# Parte B — tablet e PC (PO-114)

Il gioco oggi è una colonna: `#app { max-width: var(--larghezza-max) }` (`src/resa/stile.css:6`) con `--larghezza-max: 480px` (`src/resa/token.css:174`); il manifesto della PWA chiede `"orientation": "portrait"` (`public/manifest.webmanifest:9`), mentre l'APK **non** blocca la rotazione (`android/app/src/main/AndroidManifest.xml:13`: `configChanges` con `orientation|screenSize`, nessun `screenOrientation`). I guardiani grafici misurano solo 360, 375 e 412 px (`tools/foto.mjs:21`).

## B1. I 36 episodi col bot a cinque misure (FATTO MISURATO)

`W=… H=… [TOCCO=1] FOTO=e01,e13,e19,e30 node coordination/sonde/c28-grandi.mjs . docs/foto/c28 <uscita.json>` gioca dall'interfaccia, col mouse (o col dito), i 36 episodi col piano del bot attento (seme 1) e misura ogni schermata; riassunto con `node coordination/sonde/c28-analisi.mjs <uscite…>`. «Quota vuota» = finestra meno il rettangolo colonna × altezza del contenuto visibile; «caratteri» = `font-size` calcolato dei testi visibili nella finestra, pesato sui caratteri (px CSS = px reali a DPR 1). Riferimento con la stessa sonda a 360×760 (prima riga).

| misura | episodi | schermate | blocchi | scorr. orizz. | tagli | fuori schermo | comandi coperti | errori | colonna | fuori colonna | mappa (max) e quota della finestra | caratteri min / mediana | chiamate con le opzioni sotto il bordo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 360×760 (rif.) | 36/36 | 1881 | 0 | 0 | 0 | 0 | 1 (C26-11) | 0 | 360 | 0 % | 328×328, 39,3 % | 12 / 13 | 422/422 |
| 768×1024 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | 480 | 37,5 % | 448×448, 25,5 % | 12 / 13 | 53/422 |
| 1024×768 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | 480 | 53,1 % | 448×448, 25,5 % | 12 / 13 | **422/422** |
| 1366×768 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | 480 | 64,9 % | 448×448, 19,1 % | 12 / 13 | **422/422** |
| 1920×1080 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | 480 | 75,0 % | 448×448, 9,7 % | 12 / 13 | 11/422 |
| 1280×800 | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | 480 | 62,5 % | 448×448, 19,6 % | 12 / 13 | **422/422** |
| 768×1024 tocco | 36/36 | 1881 | 0 | 0 | 0 | 0 | 0 | 0 | 480 | 37,5 % | 448×448, 25,5 % | 12 / 13 | 53/422 |

- **Foto (asset veri, DPR 1):** per ogni misura il percorso completo di e01 (città, sala, briefing, schieramento, prima chiamata e risposta, chiusura, rapporto, verbale) più titolo, città di e13, chiamata di e13 e schieramento di e19: `docs/foto/c28/<misura>-e01-*.jpg`. Il «prima» di ogni foto grande è la foto con lo stesso nome a `360x760-…` (stessa sonda, stessa partita).
- **Sovrapposizioni:** le coppie sono le stesse che a 360 (segni ▲▼ sopra le pastiglie per un attimo dopo la risposta; testo che scorre sotto il pulsante fisso «Avanti»/«Leggi il rapporto» quando la pagina è in cima). Nessuna coppia nuova propria delle misure grandi. L'etichetta di e19 coperta (C27-06) **sparisce** da 768 in su.
- **Leggibilità:** nessun testo sotto 12 px in nessuna schermata; i caratteri non crescono con la finestra (stessi px a 360 e a 1920). A DPR 1 (PC a scala 100 %) sono 12–16 px reali; su un tablet con DPR 2 sono il doppio dei pixel fisici, ma la stessa misura in px CSS del telefono. Misura fisica in mm su schermi veri: non posso confermarla.
- **Elementi fuori schermo:** nessuno ai lati. Sotto il bordo: a 1024×768, 1280×800 e 1366×768 la chiamata comincia a ~575 px dall'alto (testata + mappa 448 px), quindi le opzioni sono **sempre** sotto il bordo, come sul telefono a 360×760; a 1366×768 anche il testo della chiamata è tagliato a metà (foto `1366x768-e01-chiamata-corteo_partito.jpg`). Ci si arriva con la rotella o col pulsante «Rispondi ↓» → C28-03.
- **Versione in basso a destra:** fissata al bordo della finestra (`stile.css:370`), a 128 px (768), 256 px (1024), 384 px (1280), 427 px (1366), 704 px (1920) dalla colonna → C28-11.
- **Fascia scura sulla mappa:** a ogni misura la tela Pixi resta 442×330 dentro una mappa 448×448 in **1412/1700** schermate con mappa, identico a 360×760 (322×240 dentro 328×328) → C28-01.

## B2. Mouse (FATTO MISURATO)

`W=… H=… EP=e01,e13,e19 node coordination/sonde/c28-mouse.mjs . <foto> <uscita.json>` a 768×1024, 1024×768, 1366×768, 1920×1080:

- **Ogni comando si raggiunge e funziona col clic:** i 36 episodi delle corse B1 sono tutti giocati col mouse (`page.click`: il puntatore si muove, preme e rilascia), compresi schieramento (unità → settore), ritiro dalla pastiglia, mappa della città, riepilogo, sala e verbale a passi. Nella sonda del mouse: **trascinamento** di un'unità sulla mappa (giù, 12 passi, su) 12/12, **ritiro** col clic sulla pastiglia 12/12, episodio intero 12/12 (3 episodi × 4 misure), 0 errori. Foto del trascinamento: `mouse-1366x768-e01-trascina.jpg`.
- **Rotella:** sopra la mappa (sopra la tela Pixi) e sopra il testo della chiamata la pagina scorre di 300 px su 3 scatti in 12/12 prove a 1366×768. (Una prima misura dava 0 in metà dei casi: la sonda girava la rotella subito dopo `scrollTo(0,0)`; **la ritiro**, rifatta con 300 ms di attesa.)
- **Stati :hover:** fra 200 comandi misurati a 1366×768 in e01, e13, e19 (136 attivi, 64 disattivati), cambiano aspetto sotto il puntatore **solo le opzioni delle chiamate** (azzurro, `stile.css:58`, `@media (hover: hover)`); pulsanti, settori, pastiglie, unità, «i», «?», casa e «Rispondi» non cambiano (nel CSS non c'è un `:hover` per loro: `grep -n ":hover" src/resa/*.css` → solo `stile.css:58`). Hanno però il cursore a mano (`cursor: pointer`), tranne le unità (`cursor: grab`, `stile.css:135`). I comandi disattivati hanno il cursore normale e non cambiano: nessun hover fuorviante su di loro.
- **Hover fuorviante:** quando si apre una nuova chiamata, il puntatore è ancora dove si è cliccato «Avanti» o «Conferma», e lì spesso c'è un'opzione: **appare già accesa** (stesso azzurro), come se fosse già scelta. Opzione accesa senza muovere il mouse: 768×1024 **29/39**, 1024×768 **23/39**, 1366×768 **25/39**, 1920×1080 **29/39** chiamate → **C28-02**. Foto: `768x1024-e01-chiamata-corteo_partito.jpg` e `mano-1920x1080-e02-passo01.jpg` (opzione A azzurra prima di ogni scelta). Il commento di `stile.css:57` descrive proprio questo effetto per i telefoni («:hover resta acceso … e sembra una scelta già fatta»).

## B3. Tastiera (FATTO MISURATO)

`W=1366 H=768 EP=e01,e13,e19,e30 node coordination/sonde/c28-tastiera.mjs . docs/foto/c28 <uscita.json>`: solo **Tab** (avanti), **Invio** (pulsanti, settori, pastiglie) e **Spazio** (opzioni e unità).

- **Si gioca tutto:** 4/4 episodi dalla città al verbale, 412 azioni, 1216 Tab (254–326 per episodio); ritiro di un'unità dalla pastiglia col tasto 4/4; 0 errori.
- **Fuoco visibile:** 9 tipi di comando diversi raggiunti; **tutti** con un contorno del fuoco (stile calcolato `outline` non nullo, `:focus-visible` vero): magenta 3 px per pulsanti, opzioni, unità e settori (`stile.css:35`); per casa, «i», «?», pastiglie e «Rispondi» solo l'anello predefinito del browser (`outline: auto 1px`). Fuoco coperto dalla barra fissa: 0/412; fuori dalla finestra: 0/412; contorno tagliato dal bordo della mappa: 0/412. Foto: `tastiera-1366x768-e01-fuoco-conferma.jpg`.
- **Dove il fuoco si perde:** dopo **82/412** azioni il fuoco torna al `body` (inizio pagina): dopo **ogni** scelta di un'opzione (51/51), dopo «Conferma» dello schieramento, dopo il ritiro dalla pastiglia (la pastiglia sparisce, 4/4), dopo «Gioca l'episodio» e alcuni «Avanti». Il Tab successivo riparte dalla testata: fino a 16 Tab per arrivare al comando dopo (mediana 2–3) → C28-09.
- **Ordine dei settori:** Tab li visita nell'ordine dei dati, non della mappa; fino a 16 Tab per un settore (mediana 3). Nessuna scorciatoia (frecce, numeri delle opzioni).

## B4. Rotazione e ridimensionamento a partita in corso (FATTO MISURATO)

`EP=e01,e19 node coordination/sonde/c28-rotazione.mjs . docs/foto/c28 <uscita.json>`: partenza a 768×1024; in quattro punti (schieramento a metà con la bozza, chiamata aperta, risposta letta, rapporto) la finestra passa per 1024×768 → 1366×768 → 360×760 → 1920×1080 → 768×1024.

- **40/40 cambi**: scena uguale, chiamata uguale, pastiglie uguali, **salvataggio (localStorage) identico byte per byte**, 0 scorrimenti orizzontali, 0 errori di console.
- Dopo i cambi, ricarica della pagina → «Riprendi» → **stessa chiamata** 2/2 (`chiamata-ufficio_insiste`, `chiamata-ora_prima`); episodi finiti 2/2.
- Effetto collaterale utile per capire C28-01: **il primo cambio di finestra ripara la tela** (442×330 → 442×442 in 10/10 cambi del punto A); da lì la tela segue la mappa in 40/40. Foto: `rotazione-e01-A-schieramento-768x1024-prima.jpg` (fascia scura) e `rotazione-e01-A-schieramento-1024x768-dopo.jpg` (mappa intera).
- Rotazione vera su un tablet Android (evento `orientationchange`, barra di sistema, tastiera): non posso confermarla; in Chromium il cambio di finestra è l'unica misura possibile.

## B5. Tocco su tablet (FATTO MISURATO)

`W=768 H=1024 TOCCO=1 FOTO=e01 node coordination/sonde/c28-grandi.mjs . docs/foto/c28 <uscita.json>`: contesto con `hasTouch`, ogni comando dato con `page.tap` (tocco al centro dell'elemento), compresi unità, settori della mappa, pastiglie, mappa della città e opzioni.

- **36/36 episodi** finiti col dito, 1881 schermate, **0 blocchi**, 0 errori, 0 comandi coperti nel punto del tocco.
- **Aree di tocco:** l'unico comando sotto 44×44 px misurato dalla sonda è la «i» dell'ondata (32×32), che però ha l'area allargata a 50×50 da `::after` (`src/resa/stile-c18.css:25,27`): nessun comando reale sotto i 44 px (`--tocco-min: 44px`, `token.css:175`). Le misure sono quelle del telefono: la colonna non cresce, quindi le aree di tocco restano 44 px anche su un tablet da 10″.
- Con `hasTouch` la regola `:hover` delle opzioni non vale (`@media (hover: hover)`, `stile.css:58`): C28-02 riguarda solo il mouse.
- Tocco con un dito vero, pressioni lunghe e trascinamento col dito su un tablet fisico: non posso confermarli (il trascinamento col dito non l'ho provato: `page.tap` dà solo tocchi; quello col mouse funziona, § B2).

## B6. Partita a mano (FATTO MISURATO; GIUDIZIO marcato)

`W=1920 H=1080 EP=e02 SCELTE='…' node coordination/sonde/c28-mano.mjs . <foto>`: la sonda si ferma a ogni decisione, io leggo lo schermo e scelgo (non il piano del bot); le 18 scelte sono in `coordination/sonde/c28-mano-e02-scelte.txt`. Esito: e02 **contenuto**, fiducia 8/10, 0 errori, 0 blocchi. Foto: `mano-1920x1080-e02-passo00.jpg` (schieramento), `…passo01.jpg` (prima chiamata, opzione A già accesa), `…passo12.jpg`, `…passo18.jpg` (verbale). È in questa partita che ho trovato C28-04 (lo striscione dello Square nella curva del Railhead).

## B7. Giudizio da giocatore (GIUDIZIO, marcato come tale)

- **Tablet verticale (768×1024):** godibile. La colonna da 480 px lascia 144 px gialli per lato, ma mappa e chiamata stanno quasi sempre insieme (opzioni sotto il bordo in 53/422 chiamate); sembra un telefono grande. I caratteri a 12–13 px su un tablet tenuto in mano si leggono, ma sono piccoli per lo schermo.
- **Tablet orizzontale e portatile (1024×768, 1280×800, 1366×768):** si gioca, ma è la misura più scomoda: come sul telefono, a ogni chiamata bisogna scorrere per leggere il testo intero e vedere le opzioni, e la mappa esce dallo schermo mentre si sceglie; solo che qui accanto c'è più di metà dello schermo giallo e vuoto, e lo scorrimento sembra inutile. Con un'opzione già accesa sotto il puntatore (C28-02) viene il dubbio di aver già scelto.
- **PC grande (1920×1080):** tutto sta in una schermata, ma il gioco occupa un quarto dello schermo: la mappa è 448 px su 1920, le persone dei cortei sono puntini, la città sembra una miniatura (foto `1920x1080-e01-schieramento-1.jpg`). Si capisce che è un gioco per telefono «proiettato» sul monitor. Giocabile, non povero nei contenuti, povero nella resa.
- **In sintesi:** totalmente **giocabile** su tablet e PC (0 blocchi a ogni misura, mouse e tastiera completi); **godibile** su tablet verticale; in orizzontale e su PC la colonna stretta lo rende **scomodo** (scorrimento a ogni chiamata, come sul telefono ma con lo schermo vuoto accanto) e **piccolo**, non rotto.

## B8. Tabella riassuntiva per risoluzione

| risoluzione | giocabile | problemi (rilievi) | costo stimato per correggere (**IPOTESI**) |
|---|---|---|---|
| 768×1024 tablet verticale | **sì** (36/36, 0 blocchi) | colonna 480 px (37,5 % vuoto), caratteri da telefono, C28-01 fascia scura, C28-02 hover residuo col mouse, opzioni sotto il bordo in 53/422 | C28-01: ~0,5 giorni (tela che segue la mappa + guardiano); C28-02: ~0,5 giorni; colonna più larga e caratteri in scala per ≥ 768 px: ~1–2 giorni, più i guardiani a una misura nuova |
| 1024×768 tablet orizzontale | **sì** (36/36) | **opzioni sotto il bordo in 422/422** chiamate (C28-03), 53,1 % vuoto, C28-01, C28-02 | impaginazione a due colonne in orizzontale (mappa ferma a sinistra, testata/chiamata/opzioni a destra): ~3–5 giorni con foto e guardiani a 3 misure nuove; decisione PO sull'orientamento (C28-12) |
| 1280×800 orizzontale | **sì** (36/36) | come 1024×768: 422/422 chiamate da scorrere, 62,5 % vuoto | come 1024×768 |
| 1366×768 PC | **sì** (36/36) | come 1024×768: 422/422 chiamate da scorrere, 64,9 % vuoto, versione a 427 px dalla colonna | come 1024×768; versione accanto alla colonna: < 0,5 giorni |
| 1920×1080 PC | **sì** (36/36) | 75 % vuoto, mappa al 9,7 % dello schermo; C28-01, C28-02 | due colonne come sopra **più** una scala d'insieme (caratteri, mappa, tela Pixi a risoluzione maggiore): +1–2 giorni; da misurare il costo della tela più grande su PC deboli |
| tutte, tastiera | **sì** (4/4) | C28-09 fuoco perso dopo 82/412 azioni; anello del browser su 5 comandi | ~0,5–1 giorno (fuoco portato sul titolo o sulla prima opzione a ogni scena, contorno del gioco sui 5 comandi) |
| tutte, rotazione | **sì** (40/40) | nessuno; C28-12 manifest «portrait» contro APK libero | decisione PO, poi 1 riga nel manifesto o nell'AndroidManifest |

Le stime sono mie, senza aver scritto codice: nessun numero è misurato.

# Rilievi (per gravità)

## Alto

Nessuno.

## Medio

**C28-01 — La tela della mappa non segue la mappa quando la mappa cambia forma: fascia scura nel quarto basso, a ogni misura.**
- Riproduzione: qualsiasi episodio, dalla sala (mappa 4:3) allo schieramento (mappa 1:1), senza ridimensionare la finestra. Il quarto basso della mappa resta scuro, senza città né folla; settori, nomi e pastiglie che stanno lì restano sul fondo scuro.
- Misura: tela Pixi diversa dalla mappa (oltre 2 px) in **1412/1700** schermate con mappa in ognuna delle sei corse grandi (768×1024 col mouse e col dito, 1024×768, 1280×800, 1366×768, 1920×1080; es. tela 442×330 in mappa 448×448: 442×112 px scuri, il 25 % della mappa); uguale a 360×760 con la stessa sonda: **1412/1700**, tela 322×240 in 328×328. Foto: `360x760-e30-chiamata-silenzio_totale.jpg`, `1024x768-e19-schieramento-1.jpg`, `mano-1920x1080-e02-passo00.jpg`.
- Causa (FATTO, codice): `<Application resizeTo={p.contenitore}>` (`src/resa/mappa/StratoPixi.tsx:180`) e il `ResizePlugin` di Pixi ascolta solo il `resize` della **finestra** (`node_modules/pixi.js/lib/app/ResizePlugin.mjs:20`: `globalThis.addEventListener("resize", …)`), non quello del contenitore. Prova: un solo cambio di finestra la ripara (442×330 → 442×442, § B4).
- Già vista e fotografata nel C-023 (`COLLAUDO_C23.md:155`) e nel C-024 (`COLLAUDO_C24.md:157`), senza causa e senza numero. Su un telefono vero con Chrome la barra dell'indirizzo che si nasconde manda un `resize` e potrebbe ripararla da sola; nell'APK (WebView senza barra) no: IPOTESI, non posso confermarla senza un dispositivo.

**C28-02 — Col mouse, alla nuova chiamata un'opzione appare già accesa sotto il puntatore fermo.**
- Riproduzione: a 768×1024 o più, col mouse; schierare, «Conferma» (o rispondere e «Avanti»), non muovere il mouse: la nuova chiamata si apre con l'opzione che sta sotto il puntatore in azzurro.
- Misura: 106/156 chiamate su 4 misure (§ B2). Foto: `768x1024-e01-chiamata-corteo_partito.jpg`, `mano-1920x1080-e02-passo01.jpg`.
- Causa (FATTO, codice): `@media (hover: hover) { .opzione:not(:disabled):hover { background: var(--ciano); } }` (`stile.css:58`): con un mouse vero `:hover` vale anche senza movimento. Il commento di `stile.css:57` descriveva lo stesso effetto per i telefoni.

**C28-03 — Su tablet e PC la colonna resta quella del telefono: dal 37,5 % al 75 % della finestra vuota e, in orizzontale, opzioni sotto il bordo a ogni chiamata come a 360 px.**
- Misura (§ B1): fuori colonna 37,5 % (768×1024), 53,1 % (1024×768), 62,5 % (1280×800), 64,9 % (1366×768), 75,0 % (1920×1080); mappa ≤ 448 px (9,7 % della finestra a 1920×1080); caratteri 12–16 px a ogni misura. Chiamate con le opzioni sotto il bordo: 1024×768, 1280×800 e 1366×768 **422/422**, come a 360×760 (422/422); 768×1024 53/422; 1920×1080 11/422. A 1366×768 anche il testo della chiamata è tagliato dal bordo (foto `1366x768-e01-chiamata-corteo_partito.jpg`).
- Causa (FATTO, codice): `--larghezza-max: 480px` (`token.css:174`) e una sola colonna (`stile.css:6`) con la mappa quadrata fino a 448 px sopra la chiamata; nessuna `@media` per larghezza in `src/resa/*.css` (`grep -n "@media" src/resa/*.css` → solo `prefers-reduced-motion` e `hover`). È una scelta di progetto (gioco per telefono), non un errore: la riporto perché è la risposta alla domanda del PO.
- Non blocca: rotella, «Rispondi ↓», Tab e Invio arrivano alle opzioni in tutte le prove. Giudizio e costi in § B7-B8.

**C28-04 — e02: striscione «SQUARE NON DIMENTICA» nella curva ospiti del Railhead County.**
- Misura: `data/testi/it/e02.json:71` («In curva ospiti uno striscione: «SQUARE NON DIMENTICA»») contro `data/missioni/e02.json:57,74` (`curva_ospiti`, `viale_stazione`: `railhead_county`) e la chiamata del «Responsabile del Railhead County». Mostrata a schermo nella partita a mano (passo 10).
- Causa (FATTO, storia del repository): f00c669 ha cambiato gli ospiti di e02 da Square Rovers (`calderholt_rovers`) a Railhead County; lo striscione è rimasto, e C25-01 ne ha solo aggiornato il nome. Lo Square è un club di Valmora (`docs/BIBBIA.md:108,120`). GIUDIZIO: un giocatore attento legge una tifoseria di fuori che espone lo striscione di un quartiere della città.

## Basso

**C28-05 — Il corteo della chiamata va via dallo stadio solo in maggioranza (e30, e17), non come il corteo dell'ondata.**
- Misura: § A1, e30 `silenzio_totale` 12 verso / 28 via, `fiaccolata` 13 / 26, e17 `me_lo_dovete` 5 / 34, contro 0–1 / 68–69 dell'ondata.
- Causa (FATTO, codice): i due cortei usano tratti diversi dello stesso viale: l'ondata `bezier(punti, (1 − u) × 0,75)`, tratto 0–0,75 (`StratoPixi.tsx:115-116`); la chiamata `bezier(viale, 1 − u)` con `u ≤ 0,8`, tratto 0,2–1 (`dinamica.ts:32-33`). IPOTESI: senza stadio pieno il viale finisce al centro della mappa (C27-02, `sfondo.ts:99`) e nell'ultimo quarto, percorso all'indietro, prima si avvicina allo stadio e poi se ne allontana; la geometria del viale non l'ho misurata.
- GIUDIZIO: si vede una folla che in gran parte esce, con un gruppo in coda che sembra entrare; molto meglio della 0.21.0.

**C28-06 — e04 `angolo`: la chiamata cambia verso rispetto alla 0.21.0, contro quanto atteso dal mandato.**
- Misura: § A1, 0.21.0 39 verso / 0 via, 0.22.0 0 verso / 39 via.
- Causa (FATTO, codice/dati): e04 ondata 3 ha un evento `corteo` su `strada_cinderwick` e un `deflusso` sul mercato (`data/missioni/e04.json`, ondata 3), quindi `folla.ts:29,37` dà al corteo dell'ondata il verso «esce» ed `esceDinamica` (`folla.ts:49-52`) lo fa seguire alla chiamata. Il nuovo verso concorda con la riga «i» «Dopo la partita: i tifosi escono dallo stadio» (`e04.json:84`) e con il caso che il C-027 elencava fra i contrasti (`COLLAUDO_C27.md` § 2 sul ramo claude/valmora-collaudo-c27, «e04/3, chiamata `angolo`»). Il testo della chiamata parla di un gruppo fermo che aspetta (`e04.json:108`), quindi né «entra» né «esce» è scritto.
- Il guardiano `tests/corteo-verso.test.ts` non fissa e04: il cambio non era previsto né protetto. Da decidere se l'attesa del mandato va corretta o se e04 deve tornare com'era.

**C28-07 — e08 è diventata di coppa ma finisce in pareggio senza supplementari.**
- `e08.json:106-107` «Due a due… Pareggio» contro `e03.json:77` «Uno a uno: supplementari, forse rigori» (la coppa della stessa stagione). GIUDIZIO: o si dice che è l'andata, o il pareggio va tolto.

**C28-08 — Testi e BIBBIA dopo C26-02/C26-04.**
- e33: restano «il treno per Arches» (`e33.json:111`) e «trasferta tranquilla» (`e33.json:7`); il nuovo «tornano a casa a piedi … all'alba» (`e33.json:117`) è lungo per un quartiere della città (GIUDIZIO).
- BIBBIA: e08 ed e21 non risultano di coppa (`docs/BIBBIA.md:120,125`).

**C28-09 — Tastiera: il fuoco torna all'inizio della pagina dopo ogni scelta.**
- Misura: § B3, 82/412 azioni; fino a 16 Tab per tornare dove si era. Cinque comandi (casa, «i», «?», pastiglie, «Rispondi») hanno solo l'anello del browser, non il contorno magenta del gioco (`stile.css:35` elenca solo `.pulsante`, `.opzione`, `.unita`, `.settore-punto`).

**C28-10 — Mouse: nessuno stato :hover fuori dalle opzioni; unità col cursore «grab».**
- Misura e causa in § B2 (`stile.css:58` è l'unico `:hover`; `cursor: grab` in `stile.css:135`). GIUDIZIO: col mouse i pulsanti grandi «Conferma»/«Avanti» non reagiscono al passaggio; la mano «grab» sulle unità suggerisce solo il trascinamento, mentre il clic semplice funziona.

**C28-11 — La versione «v0.22.0» sta sul bordo destro della finestra, lontana dalla colonna.**
- `position: fixed; right: 0` (`stile.css:370`): 128–704 px dalla colonna (§ B1). Il commento della stessa riga dice «larga al più quanto il margine destro (16 px)»: vero solo fino a 480 px.

**C28-12 — Orientamento: la PWA chiede il verticale, l'APK ruota.**
- `public/manifest.webmanifest:9` `"orientation": "portrait"`; `AndroidManifest.xml:13` nessun `screenOrientation`. Da decidere col PO quale delle due vale per tablet e PC.

**C28-13 — Nessun guardiano grafico sopra 412 px.**
- `tools/foto.mjs:21` `LARGHEZZE = [360, 375, 412]`: le misure di questo collaudo (tablet e PC) non sono protette da nessuna catena. Informativo.

# Verificati e chiusi

| rilievo / novità | misura |
|---|---|
| C27-01 (corteo della chiamata col verso dell'ondata) | **chiuso in gran parte**: 4/4 chiamate citate ora vanno in maggioranza via dallo stadio; rosso C74D01 vivo; residuo C28-05 |
| C27-05 (e17 `piazza17b`) | ondata 0/69 verso lo stadio; chiamata `fine_corteo` 0/39 |
| C26-04 (stesso avversario in casa due volte) | e08 ed e21 di coppa (`e08.json:4`, `e21.json:3`); residuo C28-07 |
| C26-05 («terzo derby») | «quinto derby» (`e32.json:3,128`), giusto rispetto a `docs/BIBBIA.md:117` |
| C26-02 (Arches di fuori) | a metà: `e33.json:117` corretto, residuo C28-08 |
| D-130 `partita` | 6/6 coerente coi testi (§ A3) |
| Lunghezze dei testi nuovi | 5/5 entro D-101; consolidamento 0 problemi |
| Regressioni | bot 0 blocchi in 156/156; 213/213 test; tipi verdi; salvataggi 12/12 + 12/12 + 6/6 + 3/3; 0 scorrimenti e 0 tagli a 360/375/412 |
| Parte B: giocabilità | 36/36 episodi a ogni misura grande, 0 blocchi, 0 errori; mouse 21/21 per misura; tastiera 4/4; rotazione 40/40 |

# Note di metodo e limiti

- **Misure ritirate:** (1) la rotella che «non scorre» sopra la mappa o sopra il testo (§ B2): errore della sonda, rifatta; (2) la «i» dell'ondata «sotto i 44 px» (32×32): la sonda misurava il riquadro del pulsante, ma l'area di tocco è allargata da `::after` (`stile-c18.css:25,27`, già C20-06): non è un rilievo.
- Chromium headless a DPR 1; tablet, PC e telefoni veri, DPR reali, rotazione fisica, tastiere esterne e lettori di schermo: non posso confermarli.
- Le corse delle misure grandi giocano col piano del bot attento (seme 1): stesse 422 chiamate a ogni misura, non tutte le chiamate dei dati; la partita a mano copre un solo episodio.
- Fino a 4 browser in parallelo su 4 CPU: carico alto; tempi in secondi reali solo per la durata delle corse, mai come misura.

# Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c28-grandi.mjs` | 36 episodi a W×H col mouse o col dito: scorrimento, tagli, sovrapposizioni, fuori schermo, comandi coperti e sotto il bordo, caratteri, colonna, quota vuota, mappa e tela | `W=… H=… [TOCCO=1] [EP=…] [FOTO=e01,…] node coordination/sonde/c28-grandi.mjs <radice> <foto> <uscita.json>` |
| `c28-analisi.mjs` | riassunto delle uscite di `c28-grandi.mjs` | `node coordination/sonde/c28-analisi.mjs <uscite…>` |
| `c28-mouse.mjs` | :hover e cursore di ogni comando, trascinamento, ritiro, rotella, opzione accesa sotto il puntatore fermo | `W=… H=… EP=… node coordination/sonde/c28-mouse.mjs <radice> <foto> <uscita.json>` |
| `c28-tastiera.mjs` | episodi giocati solo con Tab/Invio/Spazio, contorno del fuoco, fuoco coperto o perso | `W=… H=… EP=… node coordination/sonde/c28-tastiera.mjs <radice> <foto> <uscita.json>` |
| `c28-rotazione.mjs` | cambi di finestra in 4 punti della partita: stato, salvataggio, tela, ripresa | `EP=… node coordination/sonde/c28-rotazione.mjs <radice> <foto> <uscita.json>` |
| `c28-mano.mjs` | partita «a mano»: si ferma a ogni decisione e mostra lo schermo | `W=… H=… EP=… SCELTE='…' node coordination/sonde/c28-mano.mjs <radice> <foto>` |
| `c28-verso-tabella.mjs`, `c28-lunghezze.mjs`, `c28-partita.mjs`, `c28-schermate-analisi.mjs` | riassunti della parte A (verso dei cortei, lunghezze, D-130, rilievi aperti dalle schermate) | vedi § A1-A4 |
| `c28-salvataggi.mjs` | come `c26-salvataggi.mjs`, con `VA=` e `VECCHI_DIR=` | `EP=… VA=0.21.0 VECCHI_DIR=… node coordination/sonde/c28-salvataggi.mjs <A> <B> <cartella> <uscita.json>` |
| `c27-*.mjs`, `c26-*.mjs` | come nel C-027 e nel C-026 | vedi COLLAUDO_C27.md e COLLAUDO_C26.md sui rispettivi rami |
