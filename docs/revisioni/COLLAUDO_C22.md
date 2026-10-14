# Collaudo C-022 — grafica: icone, vignette, mappa e immagini fruibili e di qualità (PO-106)

- **Richiesta del PO (PO-106):** «questa icona non si vede bene, verifica che tutte le immagini / icone / grafica sia fruibile e di qualità». Foto del PO: vignetta di una chiamata, telefono nel riquadro bianco in alto a destra illeggibile.
- **Build collaudata:** ramo principale claude/valmora-l1-setup-schema-xdrbx7 a 8305430 (sopra c5f3dc1), GAME_VERSION 0.16.0 (`src/versione.ts:117`). Ricostruita in locale con `npm ci` e `npx vite build`.
- **Ramo:** claude/valmora-collaudo-c22. Sola lettura sul codice di gioco.
- **Data:** 2026-10-14.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), «riduci movimento» attivo (cortei fermi nelle foto).
- **Sonde nuove:** `coordination/sonde/c22-*.mjs` (tabella in fondo).
- **Foto:** `docs/foto/c22/`. Finestre: `<larghezza>[x2]-<episodio>-<schermata>.jpg` (x2 = DPR 2). Fogli ingranditi: `foglio-<larghezza>[x2]-{icone,segni,vignette}.png` (ogni elemento a sinistra alla dimensione reale, a destra ×4 a pixel pieni). Mappa: `mappa-*.png` (mappa intera) e `zoom4-*.png` (120×120 px CSS attorno al settore della chiamata, ×4).

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (lettura della forma, mia, sulle foto citate) · **IPOTESI** marcate.

## Riferimenti (fonti verificate oggi)

- **Material Design 3, icone** (https://m3.material.io/styles/icons/designing-icons, testo letto con Chromium il 2026-10-14): «Standard icons are displayed as 24dp x 24dp»; «Supported icon sizes: 20dp, 24dp, 40dp, and 48dp»; «Icon content is limited to the 20dp x 20dp live area, with 2dp of padding around the perimeter»; «The recommended stroke weight for icons is 2dp».
- **WCAG 2.1, criterio 1.4.11** (https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html): rapporto di almeno 3:1 contro i colori adiacenti per le «parts of graphics required to understand the content» e per i componenti dell'interfaccia, «except for inactive components». Il rapporto è calcolato con la luminanza relativa di WCAG.
- **IPOTESI (non verificata con una fonte):** nella WebView di Android 1 px CSS corrisponde a 1 dp (devicePixelRatio = densità). Con questa ipotesi le misure in px CSS si confrontano direttamente con i dp di Material.

## Metro delle gravità

Come chiesto dalla principale: **alta** = la forma non si riconosce, o è sotto 3:1, in uno stato di gioco frequente (ogni chiamata, schieramento, risposta, mappa di gioco); **media** = sotto 16 px, o sotto soglia in stati rari (una volta per episodio); **bassa** = il resto. Scelta mia, dichiarata: per le icone accompagnate da un testo visibile che dice la stessa cosa (pulsanti «Avanti», «Indietro»…), considero l'icona non necessaria a capire (WCAG 1.4.11 parla di grafica «required to understand the content») e le metto in bassa; la misura «sotto 16 px» la applico al **lato maggiore del glifo disegnato**, non al riquadro dell'icona (lucide lascia margini: un riquadro di 18 px contiene un chevron di 4,5×9 px).

## Riepilogo

| verifica | esito |
|---|---|
| Causa letta dalla principale | **confermata dalla misura**: a 412 la vignetta della chiamata è **119×68,7 px** (stima 119×70), il riquadro di chi chiama **27,3×21,6 px** (stima 28×22), il telefono **14,7×12,9 px** (stima circa 15). A 360 è peggio: vignetta 101,3×58,7, riquadro 23,1×18,2, telefono **12,4×10,9 px**, tratti **0,63–0,76 px** |
| Censimento | 72 coppie icona-contesto distinte fra icone, stelle e stemmi (fogli), vignette (chiamata: 5 «chi» e 7 sagome; apertura; esito: 4 toni; guida: 6), mappa (dischi, nomi, pastiglie, segni, cortei, folla, spalti, stadio), 7 stemmi, logo, 26 immagini raster Android, 5 in `public/icone` (sezione 1) |
| Misura | **2088 schermate** (348 per configurazione: 360×760, 375×667, 412×915, DPR 1 e 2), episodi e01, e04, e07, e13, e18, e26, e34 giocati dall'interfaccia col piano attento, più titolo, scelta, guida 1-6, crediti, conferma tripla; **61 575 misure di elementi**; **0 errori di console** |
| Forma | fogli ingranditi di ogni elemento alle 6 configurazioni (sezione 3) |

Rilievi: **3 alti, 5 medi, 3 bassi** (tabella in fondo).

## 1. Censimento

### 1.1 Icone dell'interfaccia (lucide-react, `src/resa/icone.tsx:3-18`)

Dimensione dal token `--icona: 18px` (`src/resa/token.css:177`, classe `.icona` in `src/resa/stile.css:13`), tratto `strokeWidth={2}` su griglia 24 (`icone.tsx:17`), quindi tratto reale = 2×18/24 = **1,5 px**. Eccezioni misurate: «?» dello schieramento 26 px (`--icona-aiuto`, `token.css:178`, `stile.css:361`); avatar del mittente 19,2 px (`.avatar`, `stile.css:76`); icone nelle pastiglie della mappa 13 px (`stile.css:117`); icone degli effetti sotto le opzioni 12 px (`src/resa/stile-c18.css:42`); stelle grandi 26 px e piccole 13 px (`stile.css:160-163`).

| icona | sorgente | schermate (misurate) |
|---|---|---|
| Play, RotateCcw, Smartphone, BookOpen, Info, Heart, Lightbulb, Upload, Download | `schermate/Titolo.tsx:42-56`, `schermate/Archivio.tsx:27-28` | titolo |
| UserRound, ArrowLeft | `schermate/SceltaGenere.tsx:27-29`, `schermate/Crediti.tsx:19` | scelta, crediti |
| ChevronLeft, ChevronRight, X | `schermate/Guida.tsx:23-25`, `schermate/Passi.tsx:29-31` | guida, sala, briefing, verbale |
| House («home») | `schermate/Fumetto.tsx:12` | città, sala, briefing, schieramento, chiamata, risposta, chiusura, rapporto, verbale |
| Info («i» dell'ondata) | `schermate/Fumetto.tsx:29` | schieramento, chiamata, risposta, chiusura |
| avatar: Radio, Globe, UserRound, FileText, MessageSquare (fonte), Coffee (vice) | `icone.tsx:8-13`, `schermate/Fumetto.tsx:48`, `schermate/Ondata.tsx:49,84,94`, `schermate/Sala.tsx:24` | sala, briefing, chiamata, risposta, chiusura |
| Users, HardHat, Handshake, Construction (risorse) | `icone.tsx:5`, `schermate/Schieramento.tsx:124`, `mappa/Mappa.tsx:133,139` | schieramento (unità), mappa (pastiglie) |
| Lock, Moon, Undo2, Check, CircleHelp | `schermate/Schieramento.tsx:106-141` | schieramento |
| Flame, ThumbsUp + risorse (effetti) | `src/resa/effetti-opzione.tsx:17-22,34` | chiamata (sotto le opzioni) |
| ChevronDown («Rispondi») | `schermate/Ondata.tsx:43` | chiamata |
| FileText, Moon, ChevronRight | `schermate/Rapporto.tsx:57-63`, `schermate/Ondata.tsx:85,97` | chiusura, rapporto |
| ThumbsUp, ThumbsDown, ShieldAlert, Star | `schermate/Bilancio.tsx:67-82` | verbale (bilancio) |
| Share2, StepForward, RotateCcw, Map | `schermate/Verbale.tsx:42-78` | verbale |
| ArrowLeft, TriangleAlert | `schermate/Tripla.tsx:16-18` | conferma «Rigioca» |
| RotateCcw | `src/resa/errore.tsx:18` | schermata d'errore (non misurata: non raggiunta) |
| Star (stelle) | `src/resa/stelle.tsx:7` | città, conferma, verbale |

Non raggiunte nel campione (nessuna transenna schierata dal piano attento, nessun errore): Construction, Lock nelle pastiglie fisse e `.unita-fissa`, StepForward, Download, Smartphone. Le misure di dimensione valgono per costruzione (stesse classi), il giudizio di forma no.

### 1.2 Segni e forme dell'interfaccia (testo e CSS)

| elemento | sorgente | schermate |
|---|---|---|
| segni ▲ ▼ +⚑ −⚑ sulla mappa | `src/resa/mappa/segni.ts:14-31`, `mappa/Mappa.tsx:100-128`, stile `stile-c18.css:33-37` | risposta, chiamata, chiusura |
| tasti lettera A, B, C | `schermate/Ondata.tsx:66`, `stile.css:62` | chiamata |
| dischi dei settori (colore della tensione) | `mappa/Mappa.tsx:117`, `stile.css:89-92,119-124` | sala, briefing, schieramento, chiamata, risposta, chiusura, rapporto |
| dischi della città (numero) | `mappa/MappaCitta.tsx:65-68` | città |
| pastiglie delle unità | `mappa/Mappa.tsx:129-142`, `stile.css:116-117` | schieramento, chiamata, risposta, chiusura |
| tacche della fiducia | `src/resa/fiducia.tsx:25-27` | tutte le schermate dell'episodio |
| timbri («Urgente!», «In corso», «Vera/Falsa») | `schermate/Fumetto.tsx:53`, `schermate/Verbale.tsx` | chiamata, chiusura, verbale |
| pallini dei passi | `schermate/Passi.tsx:21-23` | sala, briefing, verbale |

### 1.3 Vignette SVG (viewBox 320×180, `src/resa/vignetta.tsx:41`)

| vignetta | sorgente | schermate |
|---|---|---|
| chiamata: luogo (10), chi chiama (radio, telefono, rete, ufficio nel riquadro 76×60 unità; il vice a busto) | `src/resa/vignette-chiamata.tsx:25-55`; larghezza `--vignetta-chiamata: 34%` (`token.css:126`, `stile.css:332`) | ogni chiamata |
| chiamata: sagome dell'evento (gente, tifo, corteo, veicoli, scontro, biglietti, fumo); persona = pallino r 5,5 unità (PO-103) | `src/resa/vignette-evento.tsx:40-68` | chiamate con evento sul settore |
| apertura (stadio o città, cartelloni, cantiere) | `src/resa/vignette-gioco.tsx:12-62` | sala, primo passo |
| esito (protagonista e vice, 4 espressioni) | `src/resa/vignette-gioco.tsx:71-83` | verbale, primo passo |
| guida 1-6 | `src/resa/vignette-guida.tsx:6-85` | guida |
| busto (Persona) | `src/resa/vignetta.tsx:57-81` | esito, guida 2 e 4, chiamata del vice |

### 1.4 Mappa (Pixi, WebGL)

| elemento | sorgente | dimensione (FATTO, codice) |
|---|---|---|
| sfondo disegnato (case, viali, stadio, spalti) | `src/resa/mappa/sfondo.ts` | tela a risoluzione min(2, DPR) (`StratoPixi.tsx:55-57`) |
| tifosi sugli spalti | `StratoPixi.tsx:67-70`, colori `sfondo.ts:197-237` | quadratini **1,3 px** |
| cortei dell'ondata | `StratoPixi.tsx:72-84` | quadratini **2,2 px** |
| corteo / folla della chiamata | `src/resa/mappa/dinamica.ts:24,34` | quadratini **2,6** e **2,4 px** |
| aloni e onde | `StratoPixi.tsx:113-117,128-139` | onda: tratto 3 px |
| nomi dei settori (HTML) | `stile.css:94` | testo 12 px (misurato 12 in tutte le schermate) |

### 1.5 Stemmi, logo, immagini raster

- **Stemmi** disegnati dal codice (`src/resa/stemma.tsx:9-34`): 4 club con simbolo (ciminiera, calderone, collina, penna), 3 con le iniziali; 42 px nella sala, città e conferma, 18 px nella vignetta d'esito (`stile.css:199,329`).
- **Logo** del titolo: `public/icone/icona.svg` (vettoriale, 1024×1024) mostrato a 72×72 px CSS (`schermate/Titolo.tsx:29`, `--logo-icona`, `token.css:191`).
- **Raster in `public/icone/`** (`file`): favicon-32 32×32, apple-touch-icon 180×180, icona-192 192×192, icona-512 e icona-maskable-512 512×512. Non mostrate nel gioco (favicon e manifest, `index.html:7-8`).
- **Raster Android** (`android/app/src/main/res/`): `ic_launcher` e `ic_launcher_round` 48, 72, 96, 144, 192 px (mdpi…xxxhdpi), `ic_launcher_foreground` 108, 162, 216, 324, 432 px, `splash.png` 11 file da 320×480 a 1920×1280. Non c'è una cartella `assets/` nel repository (`ls assets` → assente).

## 2. Misure

Comandi:
```
npm ci && npx vite build
DPR=1 node coordination/sonde/c22-grafica.mjs . docs/foto/c22 <scratch>/c22-dpr1.json <scratch>/rit
DPR=2 node coordination/sonde/c22-grafica.mjs . docs/foto/c22 <scratch>/c22-dpr2.json <scratch>/rit
node coordination/sonde/c22-analisi.mjs <scratch>/c22-dpr1.json <scratch>/c22-dpr2.json
node coordination/sonde/c22-contrasti.mjs
node coordination/sonde/c22-mappa.mjs . <scratch>/mappa
node coordination/sonde/c22-fonti.mjs
```
Esito della sonda principale: «schermate 1044, elementi 30849, ritagli 884, errori di console 0» (DPR 1) e «schermate 1044, elementi 30726, ritagli 886, errori di console 0» (DPR 2). Le misure in px CSS sono identiche a DPR 1 e 2 (verificato sul riepilogo: stesse righe); a DPR 2 i px reali dello schermo sono il doppio.

### 2.1 Vignetta della chiamata (FATTO MISURATO, 81 chiamate per configurazione)

| larghezza | vignetta mostrata | scala | riquadro di chi chiama | glifo (telefono / radio / rete / ufficio) | tratto v-tratto / v-linea | pallino persona | «!» dello scontro |
|---|---|---|---|---|---|---|---|
| 360 | 101,3×58,7 | 0,317 | 23,1×18,2 | 12,4×10,9 / 12,5×14,6 / 11,9×14,9 / 14,6×10,9 | 0,76 / 0,63 px | 3,3 px | 1,8×4,9 |
| 375 | 106,4×61,6 | 0,333 | 24,3×19,2 | 13,1×11,5 / 13,1×15,4 / 12,5×15,7 / 15,4×11,5 | 0,80 / 0,67 px | 3,5 px | 1,9×5,1 |
| 412 | 119×68,7 | 0,372 | 27,3×21,6 | 14,7×12,9 / 14,7×17,3 / 14,0×17,6 / 17,3×12,9 | 0,89 / 0,74 px | 4,0 px | 2,2×5,8 |

A DPR 2 i tratti diventano 1,26–1,78 px reali, sempre sotto i 2 dp di Material (riferimento sopra).

Contrasti dentro la vignetta (FATTO, `node coordination/sonde/c22-contrasti.mjs`, colori dai token): riquadro bianco sul fondo giallo **1,43:1**; telefono nero sul bianco 18,88:1; foglio giallo dell'«ufficio» sul riquadro bianco **1,43:1**; timbro magenta sul foglio 3,32:1. Il riquadro e il foglio si staccano dal fondo solo per il contorno nero `v-tratto`, cioè una linea di 0,76–0,89 px.

Sagome dell'evento: pallini neri sulla **strada** (asfalto #2a2d33) **1,37:1**, magenta 2,90:1; magenta sul grigio di piazzale, curva e sala 1,69:1, sul mattone 1,19:1, sull'acqua 1,13:1; pallini del tifo col colore del club sul grigio della curva: Calderholt 1,87, Cinderwick **1,02**, Larkspire 1,09, Mossgarth 1,92, Ollerbrook 1,53 (Quillhaven 4,69 e Saltmere 3,31 sopra soglia). I pallini non hanno contorno (`vignette-evento.tsx:41-42`). Frequenza (dal C-021, 498 chiamate): sagome con pallini (gente, tifo, corteo, biglietti) in 376/498 chiamate.

Chi chiama (FATTO MISURATO, `node coordination/sonde/c22-fonti.mjs`, 498 chiamate dei dati): riquadro presente in **437/498** chiamate (61 sono del vice); telefono 80, radio 188, rete 60, ufficio 109.

### 2.2 Vignette di sala e verbale (FATTO MISURATO)

La vignetta si stringe in altezza per non far scorrere la pagina (`vignetta.tsx:8-34`); il disegno, con `preserveAspectRatio="xMidYMid meet"`, è largo scala×320.

| vignetta | 360×760 | 375×667 | 412×915 |
|---|---|---|---|
| apertura (sala) | altezza 78,6–147 px, scala 0,437–0,817 | **altezza 56–66,8 px, scala 0,311–0,371** (disegno 100–119 px) | 200 px, scala 1,069 |
| esito (verbale) | 140,7–164,7 px, scala 0,782–0,906 | **54–94,9 px, scala 0,30–0,53** | 200 px, scala 1,069 |
| guida 1-6 | 200 px, scala 1,025 | 200 px, scala 1,072 | 200 px, scala 1,111 |

A 375×667 la vignetta della sala e quella del verbale sono disegnate grandi quanto quella della chiamata (tratti 0,72–1,26 px). Foto `375x2-e01-sala-1.jpg`, `375x2-e01-verbale-1.jpg`.

### 2.3 Icone e segni dell'interfaccia (FATTO MISURATO, DPR 1, tutte e tre le larghezze uguali)

| elemento | riquadro px | glifo min (lato maggiore) | tratto px | contrasto min (fondo) | comparse |
|---|---|---|---|---|---|
| icone dei pulsanti (lucide) | 18 | 4,5 (9) chevron … 16 | 1,5 | 4,76 («Rispondi», bianco su magenta) – 18,88 | — |
| «home» | 18 | 13,5 (14,3) | 1,5 | 18,88 | 1017 |
| «i» dell'ondata | 18 (tasto 32) | 15 | 1,5 | 13,19 (giallo) | 663 |
| «?» dello schieramento | 26 | 21,7 | 2,17 | 13,19 | 99 |
| avatar del mittente | 19,2 | 11,6 (15,7) radio … 16 globe | 1,6 | 4,76 (Coffee su magenta) – 9,14 | — |
| icone nelle pastiglie della mappa | **13** | **8,1 (10,8)** casco, 9,8 (10,8) mani, 9,8 (10,8) persone | **1,08** | 13,19 | 3462 |
| icone degli effetti sotto le opzioni | **12** | **7 (9,5)** fiamma, 7,5 (10) casco, 9,1 (10) mani, 9 (10) persone, 9,9 (10) pollice | **1,0** | 16,89 | 987 |
| stelle piccole (città) | **13** | 10,3 (10,8) | 1,08 | 13,19 (giallo su nero) | 999 (con le grandi) |
| segni ▲ ▼ ±⚑ | 18 di altezza, testo 13 px | — | — | 4,76 (▲ bianco su magenta), 9,14, 13,19 | 606 |
| tasti A B C | 34 | 34 | — | 13,19 | 564 |
| dischi dei settori | 44 (disco 24,7) | 24,7 | bordo 3 | disco sull'asfalto 3,72 (liv-5) – 13,80 (tabella in c22-contrasti) | — |
| stemmi | 42 | simbolo: collina **9,7**, ciminiera 11,8, penna 15,1, calderone 21,8 | 1,68 | vedi 2.5 | — |

Contrasti sotto 3:1 misurati sulle icone: solo su unità **disattivate** (opacità 0,4, `stile.css:138`): 2,33–2,62 (78 casi), luna del riposo 1,55 (3 casi). Esenti da 1.4.11 («except for inactive components»). Coffee dell'avatar del vice: 15 misure su 264 fra 2,73 e 4,66 con opacità 0,67–0,99: la sonda ha misurato durante la comparsa del messaggio (ritardo 0,15 s, `schermate/Ondata.tsx:84`); a riposo 4,76. Non lo conto come difetto.

### 2.4 Mappa (FATTO, codice; FATTO MISURATO, foto)

- Persone: quadratini di **1,3 px** (spalti), **2,2 px** (cortei), **2,4–2,6 px** (folla e corteo della chiamata), in px CSS; a DPR 2 la tela Pixi è a risoluzione 2 (`StratoPixi.tsx:169`), quindi 2,6–5,2 px reali.
- Contrasti dei colori dei club sul viale #33363c (`node coordination/sonde/c22-contrasti.mjs`): sotto 3:1 **7 colori su 14**: Calderholt primario 2,30, Cinderwick secondario **1,44** (#1a1a1a), Mossgarth primario 2,24, Ollerbrook primario 2,81, Quillhaven primario **1,09** e secondario 2,44, Saltmere primario 1,30. Sugli spalti (gradinata #3b3f48) gli stessi 7 sotto 3:1 (1,13–2,44). Il grigio neutro (dopo C21-01) è sopra soglia: 6,84 e 4,07.
- Foto: `mappa-412x2-e04-corteo-corteo_fonderie.png`, `zoom4-412x2-e04-corteo-corteo_fonderie.png`, `zoom4-412x2-e01-corteo-corteo_partito.png`, `zoom4-360-e01-corteo-corteo_partito.png` (DPR 1), `zoom4-412x2-e26-folla-auto_autorita.png`. Sonda: 14 chiamate (una su strada e una su un altro settore per episodio) aperte a 360 e 412, DPR 1 e 2: 56 aperture, 0 errori.

### 2.5 Stemmi, logo e raster (FATTO MISURATO)

- Stemmi, forma sul bianco: Cinderwick 2,87, Larkspire 2,60, gli altri ≥4,32; la forma però ha il contorno nero (`stile.css:200`, 1,68 px), quindi la sagoma si stacca. **Simbolo sulla forma:** Larkspire collina bianca su azzurro **2,60**, Quillhaven penna rossa su blu **2,66**, Ollerbrook iniziali 2,98 (club senza stemma, non comparso nel campione); gli altri ≥3,02.
- Logo: SVG 1024×1024 mostrato a 72 px (servono 72 o 144 px reali): **non sgranato** (6/6 configurazioni).
- Icone Android (`file`): 48/72/96/144/192 px = 48 dp per le cinque densità; foreground 108/162/216/324/432 = 108 dp. Coerenti con le densità. Il foreground è il logo di Valmora (vista del file `mipmap-xxxhdpi/ic_launcher_foreground.png`); sfondo `#FFD400` (`values/ic_launcher_background.xml`); i 15 file differiscono dal modello di Capacitor (`cmp`).
- **Splash Android:** i **11 file `splash.png` sono identici byte per byte** a quelli del modello di Capacitor (`cmp` contro `node_modules/@capacitor/cli/assets/android-template.tar.gz`: «UGUALE» 11/11); la vista del file `drawable-port-xxhdpi/splash.png` mostra un simbolo azzurro su bianco che non è la grafica di Valmora. Il tema d'avvio li usa come sfondo (`android/app/src/main/res/values/styles.xml:19-21`, tema `AppTheme.NoActionBarLaunch` in `AndroidManifest.xml:16`). Se e quanto si vedano all'avvio su un telefono vero **non posso confermarlo**: non ho un dispositivo e il tema deriva da `Theme.SplashScreen`, il cui comportamento varia con la versione di Android.

## 3. Leggibilità della forma (GIUDIZIO)

Sui fogli `docs/foto/c22/foglio-<larghezza>[x2]-*.png`, guardati alla dimensione reale (colonna sinistra) e ingranditi (destra). Il giudizio è mio, su Chromium; un telefono vero ha un'altra resa dei sub-pixel.

**Vignetta della chiamata, riquadro di chi chiama** (`foglio-360-vignette.png`, `foglio-412x2-vignette.png`):
- **telefono: «non si riconosce»** a tutte e sei le configurazioni: alla dimensione reale è una macchia nera a forma di «C» con un trattino; ingrandito ×4 si capisce che è una cornetta. È l'icona della foto del PO.
- radio: «ambiguo con una pila o un telefono cellulare» (rettangolo nero con antenna e onde di 0,7 px che spariscono a DPR 1).
- rete: «si riconosce» come smartphone a DPR 2; a DPR 1 «ambiguo con la radio» (tutti e due rettangoli neri con lo schermo azzurro).
- ufficio: «ambiguo»: un rettangolo giallo a righe nel riquadro bianco, si legge come un foglio solo ingrandito.
- vice (busto, 9 chiamate): «si riconosce» come persona col berretto a DPR 2, ambiguo a DPR 1.

**Sagome della vignetta:** pallini neri sulla strada «non si riconoscono» (quasi invisibili, `412x2-e01-chiamata-corteo_partito.jpg`); sul grigio si vedono come puntini. Lo striscione del corteo «ambiguo con un riquadro di testo». Nuvola dello scontro con «!»: il «!» è leggibile solo a 412 DPR 2 (`412x2-e18-chiamata-telefonata.jpg`).

**Vignette di sala ed esito a 375×667:** lo stadio «si riconosce»; nei due busti dell'esito l'espressione (l'unica cosa che distingue festa, sollievo, preoccupazione, sconfitta: `vignette-gioco.tsx:64-69`) «non si riconosce» (`375x2-e01-verbale-1.jpg`).

**Icone d'interfaccia a 18-26 px:** tutte «si riconoscono» (play, libro, info, cuore, carica, lampadina, persona, frecce, chevron, casa, rotazione, avviso, documento, onde radio, globo, fumetto, caffè, mappa, pollici, scudo, stella, condividi, annulla, spunta, «?»).

**Icone piccole:**
- pastiglie 13 px: persone «si riconoscono»; casco «ambiguo con una campanella» a DPR 1, si riconosce a DPR 2; stretta di mano «non si riconosce» a DPR 1 (groviglio), «ambiguo» a DPR 2.
- effetti 12 px: fiamma «ambigua con una goccia» a DPR 1 e 2; pollice «si riconosce»; persone «si riconoscono»; casco e mani come sopra.
- stelle piccole 13 px: «si riconoscono».
- segni ▲ ▼ +⚑ −⚑: «si riconoscono».

**Stemmi a 42 px:** Calderholt (calderone) «si riconosce» come pentola fumante; Larkspire (collina) «si riconosce» come colline; Cinderwick (ciminiere) «ambiguo con le lettere "li"»; Quillhaven (penna) «ambiguo con uno sfregio rosso»; iniziali (SW) «si riconoscono».

**Mappa:** dischi, nomi, pastiglie «si riconoscono». Persone di cortei e folla: «non si riconoscono come persone», si leggono come coriandoli o polvere colorata (`zoom4-*.png`); nel corteo del Cinderwick i quadratini neri sul viale sono quasi invisibili, e la folla grigia della chiamata finisce in parte sotto il disco e il nome (`zoom4-412x2-e26-folla-auto_autorita.png`). È la scelta di PO-103 («meglio solo i pallini») applicata alla mappa: lo segnalo per la leggibilità del colore, non per la forma.

## 4. Rilievi (per gravità)

| id | gravità | elemento | riproduzione | misura | foto | causa (FATTO) / IPOTESI |
|---|---|---|---|---|---|---|
| C22-01 | **alta** | vignetta della chiamata: riquadro di chi chiama (telefono, radio, rete, ufficio) | qualsiasi chiamata non del vice (437/498); es. e01 «corteo_partito» (telefono), e18 «telefonata» | glifo 12,4×10,9 px a 360, 14,7×12,9 a 412 (Material: 24 dp, minimo 20); tratti 0,63–0,89 px (Material 2 dp); riquadro bianco su giallo **1,43:1**, foglio dell'ufficio sul riquadro 1,43:1. GIUDIZIO: telefono non si riconosce, radio e ufficio ambigui | `foglio-360-vignette.png`, `foglio-412x2-vignette.png`, `412x2-e18-chiamata-telefonata.jpg`, `360-e01-chiamata-corteo_partito.jpg` | il disegno è a scala fissa del viewBox 320×180 (`vignetta.tsx:41`), largo 34% del fumetto (`token.css:126`, `stile.css:332`); il riquadro è 76×60 unità (`vignette-chiamata.tsx:48`), quindi scala 0,32–0,37; tratti in unità del disegno (`stile.css:273-274,347`) |
| C22-02 | **alta** | vignetta della chiamata: sagome dell'evento | e01 «corteo_partito» (strada, gente), e01 «fumogeni» (curva, tifo) | pallini 3,3–4,0 px senza contorno; neri sulla strada **1,37:1**, magenta 1,13–2,90 su strada, grigio, mattone, acqua; tifo sul grigio della curva 1,02–1,92 per 5 club su 7; «!» 1,8×4,9 – 2,2×5,8 px. In 376/498 chiamate ci sono pallini | `412x2-e01-chiamata-corteo_partito.jpg`, `foglio-412x2-vignette.png` | `vignette-evento.tsx:41-42` (cerchio r 5,5 unità, nessun `v-tratto`), sfondi `vignette-chiamata.tsx:27-40` |
| C22-03 | **alta** | mappa: persone di cortei, folla e spalti | e04 «corteo_fonderie» (corteo del Cinderwick), e26 «auto_autorita» (folla) | quadratini 1,3–2,6 px CSS; colori dei club sul viale sotto 3:1 per 7 colori su 14 (Cinderwick secondario 1,44, Quillhaven 1,09 e 2,44, Saltmere 1,30, Calderholt 2,30, Mossgarth 2,24, Ollerbrook 2,81); uguali sugli spalti. GIUDIZIO: non si leggono come persone, i neri spariscono | `zoom4-412x2-e04-corteo-corteo_fonderie.png`, `zoom4-360-e01-corteo-corteo_partito.png`, `zoom4-412x2-e26-folla-auto_autorita.png` | `StratoPixi.tsx:67-80`, `dinamica.ts:24,34`; colori del club senza contorno né fondo chiaro. IPOTESI: il colore porta l'informazione «di chi è la gente» (PO-102), per questo lo conto sotto 1.4.11 |
| C22-04 | media | vignette di sala (apertura) e verbale (esito) | 375×667: e01 sala, primo passo; verbale, primo passo | altezza 56–66,8 px (apertura) e 54–94,9 px (esito), scala 0,30–0,53, tratti 0,72–1,26 px; a 360×760 apertura di e01 alta 78,6 px. GIUDIZIO: espressione dei busti non si riconosce | `375x2-e01-sala-1.jpg`, `375x2-e01-verbale-1.jpg` | la vignetta prende solo lo spazio libero fra `--vignetta-min-sala` 56 px e `--vignetta-min-esito` 54 px (`token.css:123,125`) e il massimo (`vignetta.tsx:8-24`); a 667 px di altezza resta il minimo |
| C22-05 | media | icone nelle pastiglie (13 px) e negli effetti sotto le opzioni (12 px) | schieramento e chiamata di qualsiasi episodio | glifi 7–10,8 px, tratti 1,0–1,08 px; contrasto 13,19–16,89. GIUDIZIO: stretta di mano non si riconosce a DPR 1, fiamma ambigua con una goccia, casco ambiguo a DPR 1 | `foglio-360-icone.png`, `foglio-412x2-icone.png`, `foglio-360-segni.png` | `stile.css:117`, `stile-c18.css:42` (dimensioni dal testo piccolo e mini). Ad alta gravità se si guarda solo DPR 1: IPOTESI che i telefoni del pubblico abbiano DPR ≥ 2 (non posso confermarlo) |
| C22-06 | media | stemmi dei club | sala, città, verbale di e01 (Cinderwick, Larkspire), e26 (Quillhaven) | simbolo sulla forma: Larkspire **2,60**, Quillhaven **2,66**; collina 9,7 px. GIUDIZIO: ciminiere ambigue con «li», penna ambigua | `foglio-412x2-icone.png` | colori dei club come dati (D-086, `stemma.tsx:27-32`) |
| C22-07 | media | splash d'avvio Android | avvio dell'app installata | 11/11 `splash.png` identici al modello di Capacitor; non è grafica del gioco. Visibilità sul telefono: non posso confermarla | (file `android/app/src/main/res/drawable-port-xxhdpi/splash.png`) | `styles.xml:19-21`; mai sostituiti (ultimo commit che li tocca: 2e7d896) |
| C22-08 | media | icone informative sotto 16 px che si riconoscono: stelle piccole della città (13 px), segni ▲▼±⚑ (testo 13 px), «home» (glifo 14,3), «i» dell'ondata (glifo 15) | città; risposta; tutte le schermate dell'episodio | misure in 2.3; contrasto ≥4,76. GIUDIZIO: si riconoscono tutte | `foglio-412x2-icone.png`, `foglio-360-segni.png` | metro della principale («sotto 16 px» = media); nessun difetto di forma |
| C22-09 | bassa | avatar del mittente diverso da chi chiama nella vignetta | e18 «telefonata»: avatar fumetto, vignetta telefono | 222/498 chiamate hanno l'avatar generico «fumetto»; 40 chiamate di comando, viabilità, vertice hanno «fumetto» nell'avatar e la radio nella vignetta; 6 di segreteria_comune globo e ufficio; l'icona Phone non è mai usata (nessuna fonte contiene «telefon») | `412x2-e18-chiamata-telefonata.jpg` | due regole diverse: `icone.tsx:8-13` contro `vignette-chiamata.tsx:18-23` |
| C22-10 | bassa | icone dei pulsanti a 18 px | tutte le schermate | riquadro 18 px (sotto i 20 dp, minimo di Material), tratto 1,5 px (Material 2 dp); accompagnate da testo, contrasto ≥4,76. GIUDIZIO: si riconoscono | `foglio-*-icone.png` | `--icona: 18px` (`token.css:177`), `strokeWidth={2}` su 24 (`icone.tsx:17`) |
| C22-11 | bassa | contrasto delle unità disattivate | schieramento con tutte le unità schierate | 2,33–2,62 (opacità 0,4), luna 1,55 | `360-e01-schieramento-1.jpg` | `stile.css:138`; esente da 1.4.11 (componenti inattivi). Segnalato solo per completezza |

Nessun rilievo su: logo (vettoriale, non sgranato), icone Android (dimensioni coerenti con le densità), vignette della guida (scala ≥1,025, tratti ≥2,05 px, scritte alte 17–34 px), dischi dei settori (disco 24,7 px, contrasto 3,72–13,80), tasti lettera, timbri, tacche della fiducia, «?» dello schieramento (26 px).

## Note di metodo e limiti

- **Nessuna misura dei collaudi precedenti ritirata.** La causa scritta dalla principale nel prompt è confermata (sezione Riepilogo); le sue cifre erano stime arrotondate, le mie sono misurate.
- Una prima versione di `c22-grafica.mjs` (corse interrotte, non usate) ritagliava male gli elementi fissi in basso e aspettava la risposta con un tempo fisso; corretta prima delle corse buone. Alcuni ritagli dei fogli hanno ancora un piccolo spostamento (pastiglie e tacche vicine a elementi fissi): le misure non ne dipendono, i giudizi sono stati dati sui ritagli corretti o sulle foto a finestra intera.
- Contrasti dentro SVG e mappa: calcolati dai token e dai colori dei club, non letti dai pixel (`c22-contrasti.mjs`); il retino del fondo giallo e le strisce del club sulla curva non sono considerati.
- Il giudizio di forma è dato su Chromium headless; non ho un telefono Android: resa dei sub-pixel, DPR reali (2,6, 3, 3,5) e WebView possono cambiare il risultato. Non posso confermarlo su dispositivo.
- Episodi: e01, e04, e07, e13, e18, e26, e34 col piano attento: 81 chiamate per configurazione su 498. Le misure di dimensione delle vignette valgono per tutte (stesse classi e stessa scala); i contrasti delle sagome sono calcolati per tutti gli sfondi del codice.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c22-grafica.mjs` | gioca gli episodi dall'interfaccia e censisce ogni elemento grafico visibile (icone, stelle, stemmi, img, segni, dischi, vignette); foto e ritagli | `DPR=1\|2 [EP=e01,…] [W=360,…] node coordination/sonde/c22-grafica.mjs . docs/foto/c22 <uscita.json> <cartella ritagli>` |
| `c22-analisi.mjs` | riepilogo per elemento e per vignetta | `node coordination/sonde/c22-analisi.mjs <dpr1.json> <dpr2.json>` |
| `c22-fogli.mjs` | fogli ingranditi per il giudizio di forma | `FOGLIO_DIR=<scratch> node coordination/sonde/c22-fogli.mjs . <uscita.json> docs/foto/c22` |
| `c22-contrasti.mjs` | contrasti WCAG delle coppie disegnate in SVG e Pixi | `node coordination/sonde/c22-contrasti.mjs` |
| `c22-mappa.mjs` | foto e zoom ×4 della mappa durante le chiamate | `node coordination/sonde/c22-mappa.mjs . <cartella>` |
| `c22-fonti.mjs` | avatar del mittente contro chi chiama nella vignetta | `node coordination/sonde/c22-fonti.mjs` |
