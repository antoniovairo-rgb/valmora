# Collaudo C-025 — 0.19.0: nomi delle squadre (PO-108, D-124), icona di chi chiama (C22-01), pallini (C22-02), regressioni

- **Build collaudata:** main a 0744b24 (sopra e7e03e7), GAME_VERSION 0.19.0 (`src/versione.ts:139`, commento `:133-138`). Ricostruita in locale con `npm ci` e `npx vite build`.
- **Ramo:** claude/valmora-collaudo-c25. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-14.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), DPR 1, «riduci movimento» attivo. Node 22.22.0.
- **Fuori ambito (collaudo C-024 in parallelo):** briefing 42×42, spicchio, C21, C23. Non ripetuti.
- **Sonde nuove:** `coordination/sonde/c25-*.mjs` (tabella in fondo). **Foto:** `docs/foto/c25/`.

Convenzioni come nel C-022: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, sulle foto citate) · **IPOTESI** marcate.

## Riepilogo

| verifica | esito |
|---|---|
| Nomi vecchi nei testi (4908 valori di `data/testi/it/*.json`) | **1 residuo**: «CALDERHOLT NON DIMENTICA» (`data/testi/it/e02.json:71`) → C25-01 |
| Nomi vecchi a schermo (36 episodi × 3 larghezze, 5534 schermate più e16 a parte) | **1 schermata per larghezza**, la stessa: e02, chiamata «striscione_ospiti» |
| Articoli davanti ai nomi nuovi (745 occorrenze) | **0 errori**; 2 segnalazioni della sonda sono falsi positivi (punteggio «Due a uno Kiln») |
| Limiti di lunghezza (fonti s1 ≤ 80, chiamate s1 ≤ 100, righe «i» ≤ 90) | **0 oltre**; 24 testi con un nome nuovo a ≤ 3 caratteri dal limite (elenco in 1.3) |
| Icona di chi chiama (C22-01) | 383 chiamate per larghezza: glifo disegnato **20×20 px** (era 12,4×10,9 a 360), tratto 2 px, contrasto 18,88:1, 0 testi coperti, altezza della chiamata **invariata 78/78** fra rosso e verde |
| Pallini (C22-02) | diametro 6,08–7,19 px (era 3,3–4,0), bordo esterno ≥ 3,29:1: **0 sotto 3:1 su 5218** pallini misurati sui pixel alle tre larghezze (rosso: 71/132 sotto 3:1) |
| Bot | 156 righe (missione × partenza × strategia) × 1000 semi: **0 blocchi**; chiamate mai comparse: 0 in 36 episodi |
| Test | `npx vitest run`: 33 file, **196/196 verdi** |
| Ripresa ed export/import | 13/13 episodi (uno ogni tre), 3/3 salvataggi reali vecchi: **ok** |
| Offline | `node tools/offline.mjs dist`: **verde (O1-O4)** |
| Errori di console | **1 errore di pagina in 17 corse dell'interfaccia** (Pixi, non ripetuto in 3 ripetizioni della stessa corsa) → C25-03 |
| Blocchi nell'interfaccia | 0 soft-lock; 3 blocchi della sonda su e16, causati dal difetto C25-02 (tocco dopo la «i»: 0/108 al bersaglio) |

Rilievi: **0 alti, 3 medi, 5 bassi** (tabella in fondo).

## 1. PO-108 / D-124: nomi delle squadre

Corrispondenza (FATTO, `data/testi/it/comune.json:2-3,37,41` e decisione D-124 in `docs/governo/DECISIONI.md:135`): cinderwick_united → Kiln United, larkspire_athletic → Skyfield Athletic, calderholt_rovers → Square Rovers, mossgarth_town → Arches Town, ollerbrook_town → Studio Town, quillhaven_albion → Garden Albion, saltmere_wanderers → Stoneway Wanderers. Gli id restano (`data/club/*.json`).

### 1.1 Testi (FATTO MISURATO)

Comando: `node coordination/sonde/c25-testi.mjs <uscita.json>`. Campione: tutti i **valori** (non le chiavi) dei 41 file `data/testi/it/*.json`, 4908 testi; letterali di `src/resa/**` e `index.html`.

Esito: «testi 4908, residui nei valori 1, occorrenze dei nomi nuovi 745, articoli sospetti 2, oltre i limiti dei guardiani 0, vicini al limite (≤3) col nome nuovo 24, righe di src/resa coi nomi vecchi 6».

- **Residuo:** `e02.ch.striscione_ospiti` = «In curva ospiti uno striscione: «CALDERHOLT NON DIMENTICA». Nessuno sa cosa non dimentichi.» (`data/testi/it/e02.json:71`). La chiamata è nell'ondata 3 di e02 **senza condizione** (`data/missioni/e02.json:597-600`, nessun campo `se`): compare in ogni partita di e02. Il maiuscolo spiega perché la sostituzione non l'ha presa (IPOTESI: sostituzione sensibile alle maiuscole; non posso confermarlo, non ho lo strumento usato).
- **Nessun guardiano sui nomi vecchi:** `grep -rlnE "Cinderwick|Larkspire|…" tests tools` trova solo `tests/corteo-club.test.ts` e `tests/c21-resa.test.ts`, che usano gli **id**; nessun test cerca i nomi vecchi nei testi mostrati.
- **src/resa:** 5 righe con i nomi vecchi (6 corrispondenze), tutte **commenti** (`mappa/folla.ts:38`, `mappa/sfondo.ts:75,125`, `schermate/Bilancio.tsx:22`, `stemma.tsx:41`): non mostrate. Nella build `dist/` i nomi vecchi compaiono solo come id (`curva_cinderwick`…) più la stringa «CALDERHOLT» del residuo.
- **Articoli:** la sonda classifica ogni parola davanti a un nome nuovo nella famiglia il/lo/l'/i/gli (con le preposizioni articolate) e la confronta con la forma corretta (Kiln, Garden → il/i; Skyfield, Square, Studio, Stoneway → lo/gli; Arches → l'/gli). Distribuzione: «dello Skyfield» 42, «del Kiln» 25, «del Garden» 21, «dell'Arches» 12, «degli Stoneway» 9, «dello Studio» 7, «lo Skyfield» 6, «gli Stoneway» 10, «degli/gli Square» 4, «l'Arches» 8, «dallo Square» 2, «allo Skyfield» 1, «Gli Arches» 1… **0 forme sbagliate**. Le 2 segnalazioni («uno Kiln», `e04.ch.risultato`, `e04.ch.risultato_chiuso`) sono il punteggio «Due a uno Kiln»: falso positivo della sonda.
- Le forme «lo Square» (`e08.intro2`) e «gli Square Rovers» (`e02.intro1`) convivono: sono entrambe corrette (singolare del club, plurale della squadra). Così «lo Skyfield» e «gli Skyfield» (tifosi, `e32.op.allontana.c`).

### 1.2 Schermate (FATTO MISURATO)

Comando: `W=360|375|412 node coordination/sonde/c25-schermate.mjs . <cartella> <uscita.json>` (tutti i 36 episodi, piano del bot attento, seme 1), più `NOINFO=1 W=… EP=e16` per e16 (vedi C25-02); 375 rifatta per intero con `NOINFO=1` (nota in sezione 3). Campione: città, sala, briefing, «i», schieramenti, chiamate (422 per larghezza, e16 compreso), risposte, chiusure, rapporti, verbali. Sul testo visibile (`innerText`):

| larghezza | schermate | con nomi vecchi | scorrimento orizzontale | testi tagliati (overflow nascosto) |
|---|---|---|---|---|
| 360×760 | 1880 + 52 (e16) | **1** (e02 «striscione_ospiti») | 0 | 0 |
| 375×667 | 1880 (prima corsa) e 1774 (rifatta, senza le schermate «i») | **1** (stessa) | 0 | 0 |
| 412×915 | 1880 + 52 (e16) | **1** (stessa) | 0 | 0 |

Foto: `docs/foto/c25/360-e02-chiamata-striscione_ospiti.jpg`.

Salvataggi reali vecchi (`tests/salvataggi-reali/*.json`, 3 file) importati dall'interfaccia: 0 nomi vecchi a schermo (sonda `c25-ripresa.mjs`, R2): i salvataggi contengono solo id.

### 1.3 Testi vicini al limite (FATTO MISURATO, informativo)

24 testi con un nome nuovo sono a ≤ 3 caratteri dal limite del loro guardiano, fra cui a **100/100**: `e07.ch.coro_imparato`, `e07.ch.immagine_club`, `e09.ch.rigore9`, `e12.ch.voto_deciso`; a **80/80** `e12.info_club`; 89/90 `e07.ondata1.i`. Non è un difetto (il limite è rispettato); lo riporto perché un nome più lungo in futuro li porterebbe fuori.

### 1.4 Frasi e simboli col nome nuovo (GIUDIZIO)

- La guida riancora le immagini ai nomi nuovi: «Kiln, fonderie e ciminiere; Skyfield, la collina elegante» (`comune.json`, `guida.1`); le 44 «collina» e 118 «fonderie/ciminiere» dei testi tornano.
- Gli **stemmi** restano disegnati coi simboli scelti per i nomi vecchi (`data/club/*.json`): Square Rovers ha il **calderone** (era Calderholt), Garden Albion la **penna** (era Quillhaven, *quill*). Con i nomi nuovi il simbolo non si lega più al nome. Kiln/ciminiera e Skyfield/collina tornano. → C25-07.
- Le iniziali degli stemmi senza simbolo (`stemma.tsx:22`) diventano AT, ST, SW: distinte fra loro.

## 2. C22-01: icona di chi chiama

FATTO (codice): l'icona è un `<span class="chi-icona">` con un'icona lucide (`vignette-chiamata.tsx:59-82`), riquadro bianco con bordo nero sporgente di 8 px in alto a destra della vignetta (`stile-c18.css:64-67`), glifo `--icona-chi: 24px` (`token.css:182`). Il vice resta disegnato dentro la scena (`vignette-chiamata.tsx:70`).

FATTO MISURATO (stesse corse di 1.2; a 375 la corsa rifatta: 383 chiamate non del vice su 422; a 360 e 412: 374 su 412, e16 a parte):

| misura | 360 | 375 | 412 |
|---|---|---|---|
| riquadro / svg | 36×36 / 24×24 | uguale | uguale |
| glifo **disegnato** (unione dei figli dell'svg) | telefono 20×20, rete 20×20, radio 20×14,1, ufficio 16×20 | uguale | uguale |
| tratto | 2 px | 2 | 2 |
| contrasto glifo / fondo dell'icona; bordo / fumetto | 18,88 / 18,88 (n 374) | uguale | uguale |
| sovrapposizioni con testo, pulsanti, timbri, avatar | **0** | 0 | 0 |
| riquadro ancora disegnato dentro la vignetta | 0 | 0 | 0 |
| vignetta coperta dall'icona | 13,2 % | 12 % | 9,6 % |
| icona non intera nella prima vista della chiamata | 0 | **33/383** (a metà sotto il bordo) | 0 |

Confronto col C-022 (glifo disegnato del telefono): 12,4×10,9 → **20×20 px** a 360; 14,7×12,9 → 20×20 a 412. Material: 24 dp con area viva di 20 dp (fonte nel C-022): il glifo disegnato di 20 px coincide con l'area viva.

**Altezza della chiamata** (FATTO MISURATO): `NOINFO=1 FOTO=1 [ROSSI=C54C01,C55P01] W=… EP=e01,e18 node coordination/sonde/c25-schermate.mjs`, 26 chiamate per larghezza, rosso contro verde: **altezza del fumetto uguale in 26/26 chiamate a 360, 375 e 412** (78/78).

GIUDIZIO (foto ×4 `docs/foto/c25/zoom4-<w>-<ep>-chiamata-*-prima-dopo.png`, a sinistra rosso, a destra verde; chiamata intera `docs/foto/c25/<w>-e01-chiamata-corteo_partito-{prima,dopo}.jpg`): telefono e documento **si riconoscono**; la radio di lucide è il simbolo di trasmissione «((o))», si riconosce come «radio/segnale» ma non come apparecchio; l'icona copre l'angolo in alto a destra della scena (cielo o curva), nessuna sagoma dell'evento coperta nelle foto viste.

## 3. C22-02: pallini delle vignette

FATTO (codice): pallino raggio 10 unità con contorno nero `--vignetta-contorno: 4` unità e alone bianco raggio 15 (`vignette-evento.tsx:50-57`, `token.css:110`, `stile-c18.css:69`); file più rade (`vignette-evento.tsx:58-63`).

FATTO MISURATO: geometria dal DOM; colori **dai pixel** della foto (alone, contorno, riempimento, e il fondo subito fuori dall'alone preso da una seconda foto con i pallini nascosti; per il fondo il punto peggiore su 16 attorno). «Bordo esterno» = il migliore fra alone/fondo e contorno/fondo (il bordo che stacca la figura dal fondo, WCAG 1.4.11).

| larghezza | pallini (chiamate) | diametro | alone | contorno | anello bianco visibile | bordo esterno | sotto 3:1 |
|---|---|---|---|---|---|---|---|
| 360 | 1727 (332) | 6,08 px | 9,12 | 1,27 | **0,88 px** | min 3,29 · mediana 6,7 · media 6,91 | **0** |
| 375 | 1764 (339) | 6,4 | 9,6 | 1,33 | 0,93 | min 3,42 · mediana 6,7 · media 7,01 | **0** |
| 412 | 1727 (332) | 7,19 | 10,78 | 1,49 | 1,05 | min 4,06 · mediana 6,7 · media 7,30 | **0** |

Braccio rosso `ROSSI=C54C01,C55P01` (e01+e18, 132 pallini per larghezza): diametro 3,34 / 3,52 / 3,95 px; **71/132 sotto 3:1** a ogni larghezza; verde 0/119. Il braccio rosso mostra il difetto: il guardiano C55P01 non è cieco.

Nota sulla misura: nella prima corsa a 375×667 la vignetta di 96 chiamate stava sotto il bordo della finestra e i campioni di pixel erano vuoti (465 valori nulli). Errore della sonda, non del gioco: corretto portando la vignetta al centro prima della foto (`c25-schermate.mjs`, funzione `pallini`) e corsa rifatta.

Da solo, l'alone contro il fondo scende fino a 1,0:1 (fondi chiari: grigio del piazzale, ciano): lì è il contorno nero a staccare la figura. Le chiamate di e16 a 360 e 412 non sono nel campione dei pallini (corsa completa bloccata, C25-02).

GIUDIZIO (stesse foto ×4): i pallini **si riconoscono** come persone-gettone a tutte e tre le larghezze, neri sulla strada compresi (prima quasi invisibili). Due osservazioni → C25-05, C25-06: l'anello bianco è sotto il pixel a 360 e 375; la folla disegnata nello sfondo (strada, piazzale) resta a puntini piccoli senza contorno accanto ai pallini nuovi.

## 4. Regressioni

- **Bot** (FATTO MISURATO): `node tools/bot.mjs 1000` (2 min 46 s): 156 righe missione × partenza × strategia (attenta, casuale, equilibrata, peggiore; partenze D-106), 1000 semi ciascuna: **0 blocchi in tutte**; «chiamate mai comparse» `[]` in 36/36 episodi.
- **Test** (FATTO MISURATO): `npx vitest run`: «Test Files 33 passed (33) · Tests 196 passed (196)».
- **Interfaccia** (FATTO MISURATO): 36 episodi giocati dall'interfaccia a 360, 375, 412 (sezione 1.2): 0 blocchi del gioco, 0 scorrimenti orizzontali. e16 si blocca alla sonda solo se prima si apre la «i» (C25-02); senza, 52 schermate a ogni larghezza, 0 errori.
- **Ripresa ed export/import** (FATTO MISURATO): `node coordination/sonde/c25-ripresa.mjs . <uscita>`: R1 su 13 episodi (e01, e04, e07, e10, e13, e16, e19, e22, e25, e28, e31, e34, e36): a metà della prima ondata ricarica e «Riprendi» → stessa chiamata 13/13; esporta → memoria vuota → importa → stessa chiamata 13/13, file uguale al salvataggio 13/13. R2: 3/3 salvataggi reali vecchi importati, 0 nomi vecchi a schermo. 0 errori di console. (I due salvataggi v1 riprendono dalla città e arrivano al briefing; quello v2 di e02 riprende sulla chiamata «tornelli_falsi».)
- **Offline** (FATTO MISURATO): `node tools/offline.mjs dist` → «offline: verde (O1-O4)».
- **Errori di console** (FATTO MISURATO): 17 corse di `c25-schermate.mjs` (3 complete, 3 di e16, 3 verdi e 3 rosse e01+e18, 3 ripetizioni a 412, 375 rifatta, 1 di prova), più `c25-ripresa.mjs` e `c25-info.mjs`: **1 errore di pagina**, nella corsa verde a 412 di e01+e18 → C25-03.

## 5. C25-02: il tocco dopo la riga «i» cade più in alto (trovato durante le regressioni)

FATTO (codice): la riga della «i» (PO-101) è nel flusso della testata (`.info-riga { grid-column: 1 / -1; … }`, `stile-c18.css:30`) e si chiude al `pointerdown` fuori di lei (`schermate/Fumetto.tsx:21-26`). Il click arriva dopo il pointerdown: in mezzo la riga sparisce e tutto ciò che sta sotto sale.

FATTO MISURATO: `node coordination/sonde/c25-info.mjs . <cartella> <uscita.json>`: nello schieramento della prima ondata seleziono «Squadre», apro la «i», misuro il centro del punto di un settore e tocco lì col mouse (come un dito); braccio di controllo senza «i». Campione: 36 episodi × 3 larghezze. Esito: «con la «i» aperta: bersaglio colpito **0/108**; senza: **108/108**; errori 0». La mappa sale di **43,2–58,8 px** (mediana 58,8, media 55,0, n 108): la riga è alta 39,2 px (una riga di testo) o 54,8 px (due righe). In questo campione i 108 tocchi non hanno toccato altri settori (nessuna pastiglia cambiata): il tocco va perso.

Nella corsa completa la sonda, dopo aver aperto la «i», toccava subito i pulsanti delle unità e i settori: in e16, a tutte e tre le larghezze, lo schieramento della seconda ondata non ha più corrisposto al piano (foto `docs/foto/c25/360-e16-blocco.jpg`: «Squadre: finite», pulsante «Steward» disattivato quando il piano ne chiedeva uno). Senza la «i» e16 si gioca fino al verbale (52 schermate a ogni larghezza). Dove sia finito il tocco perso in quella corsa non l'ho ricostruito. Nella foto i pulsanti «annulla» e «ricomincia» sono visibili; che siano attivi non l'ho misurato.

IPOTESI: nella chiamata succede lo stesso (la «i» è anche lì, C-022 1.1); non l'ho misurato in modo affidabile (le opzioni a 360 e 375 sono sotto il bordo della finestra con la riga aperta), quindi non posso confermarlo.

Foto: `docs/foto/c25/{360,412}-e01-info-aperta.jpg` e `{360,412}-e01-info-dopo-tocco.jpg`, `360-e16-info-aperta.jpg` e `360-e16-info-dopo-tocco.jpg`.

## 6. Rilievi (per gravità)

| id | gravità | elemento | riproduzione | misura | foto | causa (FATTO) / IPOTESI |
|---|---|---|---|---|---|---|
| C25-01 | **media** | residuo del nome vecchio | e02, ondata 3, chiamata «striscione_ospiti» (sempre presente) | 1 testo su 4908; 1 schermata per larghezza su 1880 | `360-e02-chiamata-striscione_ospiti.jpg` | `data/testi/it/e02.json:71` «CALDERHOLT NON DIMENTICA»; nessun guardiano cerca i nomi vecchi nei testi |
| C25-02 | **media** | riga «i» dell'ondata | schieramento: apri la «i», tocca un settore della mappa | tocco al settore **0/108** con la riga aperta, 108/108 senza (36 episodi × 3 larghezze); spostamento 43,2–58,8 px; in e16 lo schieramento non torna più col piano | `360-e16-info-aperta.jpg`, `360-e16-info-dopo-tocco.jpg`, `360-e16-blocco.jpg` | `stile-c18.css:30` (riga nel flusso) + `Fumetto.tsx:21-26` (chiusura al pointerdown) |
| C25-03 | **media** | errore di pagina Pixi | corsa `NOINFO=1 FOTO=1 W=412 EP=e01,e18` | 1 volta su 17 corse; 0/3 ripetizioni della stessa corsa. Testo: «TypeError: Cannot read properties of undefined (reading 'screen') at get screen (sfondo-…js)» | — | IPOTESI: `app.screen` letto dopo lo smontaggio dell'applicazione Pixi (`mappa/StratoPixi.tsx:29,32`, `mappa/StratoCitta.tsx:17,20`: il commento a `StratoPixi.tsx:31` e `StratoCitta.tsx:19` dice che allo smontaggio Pixi toglie il renderer da «app»). La schermata non è nota (corsa senza traccia della scena; la sonda ora la registra) |
| C25-04 | bassa | guardiano `controllaChiIcona` | — | misura il riquadro dell'svg (24×24), non il glifo disegnato (20×20, ufficio 16×20); il contrasto del bordo è preso contro il fondo dell'icona stessa, non contro il fumetto; la sovrapposizione solo contro `.testo-radio` | — | `tools/foto-chiamata.mjs:47-49`. Oggi i valori reali sono comunque sopra soglia (sezione 2); il braccio rosso C54C01 resta visibile (riquadro dentro la vignetta) |
| C25-05 | bassa | anello bianco dei pallini | qualsiasi chiamata con pallini a 360 o 375 | anello visibile 0,88 px (360), 0,93 (375), 1,05 (412); alone/fondo fino a 1,0:1 (lo stacco lo dà il contorno, ≥ 3,29:1) | `zoom4-360-e01-chiamata-ufficio_insiste-prima-dopo.png` | `vignette-evento.tsx:53` (alone 15, pallino 10, contorno 4 unità). GIUDIZIO: i pallini in fondo alla scena toccano il bordo della vignetta (centro a y 164, alone fino a 179 su 180) |
| C25-06 | bassa | folla dello sfondo | strada e piazzale (es. e01 «corteo_partito», «ufficio_insiste») | puntini r 5 e 4,5 unità = 3,2 e 2,9 px a 360, senza contorno, accanto ai pallini nuovi da 6,1 px | `zoom4-360-e01-chiamata-corteo_partito-prima-dopo.png` | `vignette-chiamata.tsx:29-32` non toccati da C22-02. Decorativi (disegnati sempre, anche senza evento): fuori da 1.4.11; GIUDIZIO: due scale di «persone» nella stessa vignetta |
| C25-07 | bassa | simboli degli stemmi | sala o città con Square Rovers (calderone), Garden Albion (penna) | — | — | `data/club/calderholt_rovers.json`, `data/club/quillhaven_albion.json` (simboli scelti per i nomi vecchi). GIUDIZIO; scelta di gusto del PO |
| C25-08 | bassa | icona di chi chiama a 375×667 | chiamate a 375×667 | 33/383 icone a metà sotto il bordo della finestra all'apertura (bordo alto dell'icona a y 584–660 su 667) | — | posizione della chiamata sotto la mappa; si vede scorrendo. Nessun testo coperto |

Nessun rilievo su: articoli (0 errori su 745), limiti di lunghezza, scorrimento orizzontale e testi tagliati (0 schermate), contrasto e dimensione del glifo di chi chiama, altezza della chiamata, contrasto dei pallini, bot, test, ripresa, export/import, offline.

## Note di metodo e limiti

- **Nessuna misura dei collaudi precedenti ritirata.**
- La sonda delle schermate gioca il piano del bot attento col seme 1: 412 chiamate per larghezza su quelle possibili, non tutte le 498 chiamate dei dati. I residui nei testi sono però cercati su **tutti** i valori (sezione 1.1).
- Il giudizio di forma è su Chromium headless a DPR 1; non ho un telefono Android: resa e DPR reali possono cambiarlo. Non posso confermarlo su dispositivo.
- La prima corsa completa ha aperto la «i» in ogni ondata; da lì è emerso C25-02. Le corse successive (e16, foto rosso/verde, ripetizioni, 375 rifatta) sono con `NOINFO=1`.
- Contrasti dei pallini letti dai pixel su JPEG/PNG del browser: l'antialiasing sotto il pixel sporca i campioni dell'anello bianco (0,88 px); per questo riporto il bordo migliore fra alone e contorno e il caso peggiore su 16 punti.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c25-testi.mjs` | nomi vecchi nei valori dei testi e in src/resa, articoli davanti ai nomi nuovi, lunghezze coi limiti dei guardiani | `node coordination/sonde/c25-testi.mjs [uscita.json]` |
| `c25-schermate.mjs` | gioca gli episodi dall'interfaccia; per schermata: testo visibile (nomi vecchi e nuovi), scorrimento, tagli; per chiamata: icona di chi chiama e pallini (pixel) | `W=360\|375\|412 [EP=…] [ROSSI=C54C01,C55P01] [FOTO=1] [NOINFO=1] node coordination/sonde/c25-schermate.mjs . <foto> <uscita.json>` |
| `c25-analisi.mjs` | riepilogo per larghezza e confronto rosso/verde | `node coordination/sonde/c25-analisi.mjs <verdi…> [rossi…]` |
| `c25-ripresa.mjs` | ripresa dopo ricarica, export/import, salvataggi reali vecchi | `[EP=…] node coordination/sonde/c25-ripresa.mjs . <uscita.json>` |
| `c25-info.mjs` | tocco su un settore con la riga «i» aperta e senza | `[EP=…] [W=…] node coordination/sonde/c25-info.mjs . <foto> <uscita.json>` |
