# Collaudo C-026 — 0.20.0: 13 club nella storia (PO-109, D-125), stemmi, D-123, D-126, rilievi chiusi, regressioni

- **Build collaudata:** main a 76935e1, GAME_VERSION 0.20.0 (`src/versione.ts:147`, commento `:140-146`). Ricostruita in locale con `npm ci` e `npx vite build` (verde).
- **Confronto:** 0.19.0 a 0744b24, in un worktree separato (`git worktree add`, `npx vite build`), solo per bot e salvataggi.
- **Ramo:** claude/valmora-collaudo-c26. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-15. **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), DPR 1 salvo dove scritto, «riduci movimento» attivo. Node 22.
- **Sonde nuove:** `coordination/sonde/c26-*.mjs` (tabella in fondo). **Foto:** `docs/foto/c26/`. **Salvataggi veri della 0.19.0:** `coordination/sonde/salvataggi-019/`.

Convenzioni dei collaudi precedenti: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, sulle foto citate) · **IPOTESI** marcate.

## Riepilogo

| verifica | esito |
|---|---|
| Nomi vecchi nei testi, ogni maiuscola (4926 valori di `data/testi/it/*.json`) | **0** |
| Nomi vecchi a schermo (36 episodi × 3 larghezze, 1916 schermate per larghezza) | **0**; nella build solo come id minuscoli (`curva_cinderwick`…) |
| I 13 club di Valmora della prefazione negli episodi | **13/13**, ognuno in ≥ 2 episodi nei dati o nei testi, e a schermo nel percorso giocato (1.2) |
| Club dei testi e club dei dati contro la mappa approvata (13-club.md §4.1) | **0 club fuori piano, 0 mancanti** in 36 episodi |
| Articoli e suffissi davanti ai 16 nomi (827 occorrenze) | **0 errori** |
| Limiti di lunghezza (fonti s1 ≤ 80, chiamate s1 ≤ 100, «i» ≤ 90) | **0 oltre**; 26 testi col nome di un club a ≤ 3 caratteri dal limite |
| Contraddizioni di storia | **4**: sfida coi gemellati «contro» (C26-01), Arches «di fuori» in e33 (C26-02), due partite in casa con lo stesso avversario nella stessa stagione (C26-04), «terzo derby» che è il quinto (C26-05) |
| Stemmi (16) | guardiano `tools/foto-stemmi.mjs` verde (rosso C62S01 rosso); 15/16 mostrati in gioco (Tramway mai); 42×42 px, 0 fuori finestra; simboli e colori in 3.x |
| D-123 nome in città | 360 e 375: **0/36** nomi sulla mappa; 412: **36/36**, distanza dal disco ≤ 18 px (mediana 1,5), 0 dischi o stelline coperti |
| D-126 b avatar nel briefing | **144/144** fonti con l'avatar (45×45 px), 0 vignette, alle tre larghezze |
| D-126 c urgenza | **422/422** chiamate coerenti con la regola (361 urgenti, 61 no), alle tre larghezze |
| D-126 d vignette a 375×667 | sala nascosta in 32/36, **verbale mostrato in 30/36 a 61,7–94,9 px** → C26-03 |
| Interfaccia | 0 scorrimenti orizzontali, 0 testi tagliati; testi sotto la barra fissa dei pulsanti tornano visibili scorrendo (0/127 in fondo); 1 comando coperto (C26-11) |
| Bot | `node tools/bot.mjs 1000`: 156 righe, **0 blocchi**, chiamate mai comparse 0 in 36/36; esiti **identici alla 0.19.0** riga per riga |
| Test | `npx vitest run`: **38 file, 207/207 verdi** |
| Salvataggi | 10/10 salvataggi veri della 0.19.0 ripresi sulla stessa chiamata; 3/3 salvataggi reali vecchi; ripresa ed export/import 13/13 |
| Errori di console | **0** in 3 corse complete, 2 corse «in fondo», 100 percorsi città→briefing, ripresa, salvataggi, rilievi chiusi |
| Offline | `node tools/offline.mjs dist` → «offline: verde (O1-O4)» |

Rilievi: **0 alti, 3 medi, 10 bassi** (sezione 6).

## 1. Credibilità della storia coi 16 club

### 1.1 Dati e testi contro la mappa approvata (FATTO MISURATO)

Comando: `node coordination/sonde/c26-storia.mjs <uscita.json>`. Campione: tutti i valori di `data/testi/it/*.json` (4926), i 36 file `data/missioni/eNN.json` (campo `club` di settori ed eventi, fonti di briefing e chiamate), la mappa approvata (`docs/proposte/13-club.md` §4.1, più §1.1 per gli episodi invariati). Esito: «nomi vecchi (ogni maiuscola) 0; occorrenze dei 16 nomi 827; articoli/suffissi sospetti 0; fonti di club che non tornano 4; oltre i limiti 0; vicini al limite col nome 26».

- **Club fuori piano e mancanti:** 0 e 0 in 36/36 episodi. I club solo nominati nei testi (senza campo `club`) sono quelli previsti dal piano: Wallgate in e11, Tramway in e17, Pinegrove e Southwind in e21, Belltower in e25 (gli ospiti non hanno settore, `13-club.md` §8.3), Studio in e30.
- **Le 4 «fonti che non tornano» sono falsi positivi:** Lavezzari (sicurezza del Kiln) che parla dei gemellati di Railhead (`e15.info_cinderwick`, `e15.ch.fratelli`), la sicurezza dello Skyfield che parla del Lookout (`e18.ch.deflusso18`), il responsabile del Railhead che parla del Waterline (`e27.ch.gemellati_escono`): parlano dell'altro club della serata.
- **Fonti di club e articoli:** «Responsabile dei Pinegrove Rangers», «del Waterline City», «del Lookout FC»… (`data/testi/it/comune.json:43-60`), «dello Studio Town» (`bozze_s2.json`): tutti corretti. Distribuzione completa degli articoli nell'uscita della sonda.
- **Suffissi da soli:** «i Rovers» compare in e04 ed e08 (Square) e in e15 (Wallgate, 9 testi): sempre il club della serata. Nessun «Rovers», «Town» o «Albion» rimasto da un club uscito dall'episodio.

### 1.2 I 13 club della prefazione (FATTO MISURATO)

La prefazione (`comune.json:96`, `guida.1`) promette 13 club e nomina Kiln e Skyfield. Presenze (testo o dati), stessa sonda:

| club | episodi | | club | episodi |
|---|---|---|---|---|
| Kiln | 25 | | Pinegrove | e16, e21 |
| Skyfield | 23 | | Belltower | e09, e25 |
| Square | e04, e08 | | Waterline | e14, e27 |
| Arches | e28, e33 | | Lookout | e18, e34 |
| Studio | e19, e30 | | Domepark | e05, e26 |
| Garden | e03, e06 | | Tramway | e13, e17 |
| Stoneway | e24, e29 | | Railhead · Southwind · Wallgate (esterni) | 4 · 4 · 2 |

A schermo (corse della sezione 4, piano del bot attento, seme 1) tutti i 16 nomi compaiono; Southwind in 3 episodi su 4 (in e21 è solo nell'esito di un'opzione che il piano non sceglie).

### 1.3 Coerenza fra episodi (FATTO, file:riga; GIUDIZIO dove scritto)

Tornano: la rivincita di e15 («Kiln–Wallgate, la rivincita del quattro a zero», `e15.json:4`) sul «quattro a zero a Wallgate» di e11 (`e11.json:3`) con le «due ore di treno» (`e11.json:12`) della BIBBIA (`docs/BIBBIA.md:136-137`); la neopromossa Southwind (`e07.json:3,10`) che si salva all'85' dell'ultima (`e12.json:4,94`) e torna in e23; il gemellaggio Railhead–curva Kiln da vent'anni (`e15.json:6`, `e27.json:3,5`) e il Railhead che non gioca mai contro il Kiln; lo Stoneway campione per un punto (`e24.json:106`); la finale di coppa Skyfield–Domepark (`e26.json:3`); il Tramway fermo al capolinea per lo sciopero (`e17.json:4`).

Non tornano (rilievi C26-01, C26-02, C26-04, C26-05):

- **Sfida coi gemellati (e15, e27):** la riga «Stasera» di città, sala e verbale è costruita coi club di **tutte le curve** (`src/resa/stemma.tsx:86-91`); il settore dei gemellati è una curva col club Railhead (`data/missioni/e15.json:64-66`, `e27.json:57-59`). A schermo: «RAILHEAD COUNTY contro KILN UNITED contro WALLGATE ROVERS» (e15) e «KILN UNITED contro RAILHEAD COUNTY contro WATERLINE CITY» (e27), mentre i testi dicono che il Railhead viene «a cantare con la curva Kiln» (`e15.json:3`). Con tre club la griglia a tre colonne (`src/resa/stile.css:196`) manda a capo il secondo «contro», che resta solo a sinistra (foto `360-e15-sala-1.jpg`, `360-e15-citta.jpg`); e a 360×760 la vignetta della sala si nasconde in e15 ed e27 (le sole a 360). Il difetto c'era già con lo Studio (0.19.0, stessi settori): la 0.20.0 l'ha tenuto.
- **Arches «di fuori» in e33:** la BIBBIA mette Arches a Valmora, «sud-est, lungo la ferrovia e gli acquedotti» (`docs/BIBBIA.md:108`); in e33 «il treno per Arches è di mezzanotte» (`e33.json:111`) e «Sessanta Arches restano in città fino all'alba» (`e33.json:117`): frase da tifoseria di fuori città. Anche e28 «trasferta vietata… arrivano lo stesso, in auto» (`e28.json:4,7`) e e33 «trasferta tranquilla» (`e33.json:7`). GIUDIZIO: «trasferta» dentro la città si regge (lo dice già `e10.json:51`), «restano in città» no. Più debole: il Garden, ora del quartiere sul fiume, viene scortato «fino alla statale» (`e03.json:99`).
- **Calendario:** nella stagione 1 il Kiln riceve lo Square due volte (e04: «pullman ospiti», `e04.json:8,90`; e08: curva ospiti Square, `data/missioni/e08.json`, settori), nella stagione 2 il Pinegrove due volte (e16: «lo stadio è a dieci minuti dalle fonderie», `e16.json:4`; e21: «C'è il Pinegrove: i vecchi restano allo stadio», `e21.json:3`, curva Kiln nei settori). IPOTESI: il campionato di Valmora è a girone con andata e ritorno (una partita in casa per avversario); non è scritto in BIBBIA, quindi non posso confermare che sia un errore. La coppia e16/e21 nasce con D-125 (piano §4.1, e21 «avversario nominato»).
- **«Il terzo derby»** (`e32.json:3`): prima di e32 se ne giocano quattro (e01, e10, e20, e22; tabella in `docs/BIBBIA.md:117`). Testo precedente alla 0.20.0 (`git log -S "terzo derby"` → 8fbe970).
- **Sfida con un club solo:** in e07 la riga «Stasera» mostra solo «SOUTHWIND TOWN» (foto `360-e07-sala-1.jpg`): lo Skyfield, che gioca in casa (`e07.json:7`, «un gruppo da Skyfield»), non ha una curva nei dati. Uguale in e13, e21, e25, e28 (avversario senza curva, coerente coi testi) ed e31 (curva Skyfield che diserta, `e31.json:4`). → C26-06.

### 1.4 Ripresa di una partita a metà dalla 0.19.0 (FATTO MISURATO, informativo)

`node coordination/sonde/c26-salvataggi.mjs <0.19.0> . coordination/sonde/salvataggi-019 <uscita>`: un episodio salvato a metà con la 0.19.0 riprende nella 0.20.0 con l'avversario nuovo (e15: «Studio» prima, «Railhead» dopo; e07: Stoneway → Southwind; e23: Garden → Southwind). Il gioco non è ancora pubblicato (D-009, uscita 2026-11-30), quindi nessun giocatore vero lo vede; lo riporto per i rilasci futuri che cambiano un avversario.

## 2. Stemmi

### 2.1 Misure (FATTO MISURATO)

Comando: `node coordination/sonde/c26-stemmi.mjs docs/foto/c26 <uscita.json>`: i 16 stemmi di `src/resa/stemma.tsx` alla misura del gioco (`--avatar`, 42 px), col CSS del gioco, a DPR 1 e 3; ogni pixel classificato sul colore più vicino fra primario, secondario, nero e bianco. In gioco (corse della sezione 4): **232 stemmi per larghezza, tutti 42×42 px**, 0 fuori finestra, 0 righe «Stasera» con scorrimento, alle tre larghezze. Guardiano: `node tools/foto-stemmi.mjs` → «stemmi: nessun errore»; con `VALMORA_ROSSI=C62S01` segnala le iniziali al posto dei simboli (non è cieco).

| club | forma/simbolo | simbolo/forma | forma/bianco | simbolo a DPR 1 (px) |
|---|---|---|---|---|
| Kiln United | scudo/ciminiera | 6,07 | 2,87 | 11,8×25,2 |
| Skyfield Athletic | tondo/collina | 2,60 + contorno nero | 2,60 | 23,5×9,7 |
| Square Rovers | scudo/calderone | 3,14 | 5,27 | 21,8×24,4 |
| Arches Town | tondo/arco | 3,02 | 5,40 | 16,8×19,3 |
| Studio Town | rombo/ciak | 2,98 + contorno nero | 4,32 | 15,8×20,6 |
| Garden Albion | rombo/penna | 2,66 + contorno bianco | 13,21 | 11,8×21 |
| Stoneway Wanderers | scudo/pietra miliare | 5,58 | 9,32 | 12,6×20,2 |
| Pinegrove Rangers | tondo/pigna | 5,76 | 9,39 | 12,2×25,1 |
| Belltower Harriers | scudo/campanile | 3,50 | 3,76 | 9,2×23,9 |
| Waterline City | rombo/onde | 8,63 | **1,00** | 15,1×12,6 |
| Lookout FC | scudo/torre | 5,16 | 5,62 | 13,4×20,6 |
| Domepark Villa | tondo/cupola | 17,18 | 18,73 | 17,9×18,3 |
| Tramway Borough | rombo/tram | 3,47 | 1,66 | 16×16,5 |
| Railhead County | scudo/fine linea | 5,15 | 2,40 | 10,9×18,5 |
| Southwind Town | rombo/ancora | 1,77 + contorno nero | 1,77 | 14,3×22,3 |
| Wallgate Rovers | scudo/porta | 5,28 | 1,83 | 16×17,6 |

Simbolo sotto 3:1 sulla forma: 4 club, tutti col contorno di C22-06 (`stemma.tsx:29-36`). Forma sotto 3:1 sul bianco della scheda: 7; la separa il bordo nero della forma (`stile.css:200`). Waterline ha il primario **#ffffff** (`data/club/waterline_city.json`), il piano diceva #f5f5f5 (`13-club.md` §2.3 e `tools/foto-stemmi.mjs` PIANO): rombo bianco su scheda bianca, si vede solo il bordo (foto `stemmi-avatar-dpr3.png`).

**Colori fra club che si incontrano** (ΔE2000 dei primari; deuteranopia e protanopia simulate con la matrice di Machado, Oliveira, Fernandes 2009, gravità 1). Le coppie più vicine fra quelle che stanno nella stessa riga «Stasera»:

| coppia (episodi) | normale | deuteranopia | protanopia |
|---|---|---|---|
| Skyfield–Railhead (e02) | 27,4 | 10,1 | **6,1** |
| Kiln–Southwind (e12, e23) | 63,5 | **7,3** | 21,4 |
| Kiln–Wallgate (e15) | **17,9** | 15,7 | 20,9 |
| Kiln–Lookout (e34) | 23,4 | 18,6 | 22,1 |
| Kiln–Skyfield (6 derby) | 52,5 | 60,0 | 55,7 |

Il valore di soglia oltre cui due colori «si distinguono» a 42 px non lo posso confermare da una fonte: riporto i numeri; le forme e i simboli aiutano (Kiln scudo-ciminiera, Southwind rombo-ancora; Skyfield tondo, Railhead scudo).

### 2.2 Simboli e nomi (GIUDIZIO sulle foto `stemmi-avatar-dpr1.png`, `stemmi-avatar-dpr3.png`)

- Tornano col nome: ciminiera (Kiln), collina (Skyfield), arco (Arches), ciak (Studio), cupola (Domepark), torre (Lookout), tram (Tramway), ancora (Southwind), onde (Waterline), porta fra le torri (Wallgate).
- Si leggono come altro: la **pietra miliare** dello Stoneway (cippo arrotondato con una tacca su una base) **sembra una lapide**; la **fine linea** del Railhead sembra un traliccio o una scala; la **pigna** del Pinegrove, gialla col ciuffo, sembra un ananas; il **campanile** del Belltower a DPR 1 è un obelisco scuro (la cella aperta è di 2-3 px).
- C25-07 (aperto al PO): **calderone** sullo Square (oggi «lo scalo ferroviario», `docs/BIBBIA.md:108`) e **penna** sul Garden (case coi cortili-giardino) restano legati ai nomi vecchi. Lo registro perché l'ho rivisto.
- Lookout (scudo rosso, torre bianca) e Wallgate (scudo salmone, castello scuro) hanno simboli simili; nella stessa serata non si incontrano mai.
- Nel verbale la sfida è a soli stemmi, senza nomi (C18-08, `stile-c18.css:14-16`; foto `412-e15-verbale-1.jpg`): con 16 club la si riconosce solo dallo stemma.

## 3. Decisioni D-123, D-126 e rilievi chiusi (sui pixel e sui casi)

Sonde: `c26-schermate.mjs` (sezione 4), `c26-chiusi.mjs` (`PARTI=P,I,A,N,S`), `c25-info.mjs`, `c25-ripresa.mjs`.

- **D-123** (FATTO MISURATO, città di ognuno dei 36 episodi col proprio disco acceso): 360 e 375 → nome sulla mappa **0/36**; 412 → **36/36**, distanza dal disco 0–18 px (mediana 1,5), 0 nomi fuori dalla mappa, 0 dischi o stelline di altri episodi coperti. Foto `360-e14-citta.jpg`, `412-e14-citta.jpg`.
- **D-126 a / C22-03, persone sulla mappa:** sui pixel della mappa (componenti di pixel quasi neri da 3-12 px con il centro chiaro: il contorno della persona), e04 schieramento e chiamata, e26 chiamata: verde 7–21 componenti, lato mediano **5–6 px**; rosso C56P01 2–7 componenti (fondo e scritte). Le misure dichiarate dal disegno (`data-persone`): spalti 3 px, corteo 6, folla 6, tutti con alone. GIUDIZIO (foto `mappa-360-e04-chiamata.png` contro `mappa-360-rosso-e04-chiamata.png`): le persone del corteo sono dischi con contorno nero e alone bianco, si leggono come persone; nel rosso sono puntini. **Chiuso.** Nota: gli spalti restano a 3 px (scelta di `src/resa/mappa/persone.ts:10`).
- **D-126 b / C24-01:** avatar in **144/144** fonti del briefing per larghezza (45×45 px), vignetta 0. **Chiuso.**
- **D-126 c / C24-04:** in ogni chiamata la sonda calcola dai dati se c'è un evento della stessa ondata sullo stesso settore (con la condizione «se» valutata sulle variabili della partita in quel momento) e lo confronta con spicchio e «Urgente!» a schermo: **422/422 coerenti** a ogni larghezza (361 urgenti, 61 no; prima 495/495 urgenti, C-024). **Chiuso** come regola; l'efficacia del segnale → C26-10.
- **D-126 d / C22-04:** a 375×667 la vignetta della sala è nascosta nel primo passo in **32/36** episodi; mostrata a 66,8 px nei 4 senza sfida (e04, e11, e30, e35). Il verbale la mostra nel primo passo in **30/36** episodi, **61,7–94,9 px** (mediana 71,7); a 360×760 il verbale va da 107,5 a 185,1 px. → C26-03 (chiuso solo in parte).
- **C22-05** effetti sotto le opzioni 16×16 px (e01, e18 × 3 larghezze). **Chiuso.** **C22-08** «home» e «i» 20×20 px (erano 14,3 e 15); stelline della città 13×13 px come prima (C22-08 le aveva giudicate leggibili). **C22-10** icone dei pulsanti 20×20 px in titolo, città, chiamata. **Chiusi.**
- **C22-06** contrasto degli stemmi: tabella 2.1. **Chiuso.**
- **C22-07** splash: i `splash.png` non sono più quelli di Capacitor (10 immagini diverse su 11 file; `drawable-port-mdpi/splash.png` è la V gialla del gioco) e `values-v31/styles.xml` imposta colore e icona per Android 12+ (`android/app/src/main/res/values-v31/styles.xml`). Sul telefono: non posso confermarlo.
- **C22-09** avatar uguale all'icona di chi chiama: 6/6 campioni (e01, e18 × 3 larghezze). **Chiuso.**
- **C24-03** errori «screen»: **0 errori in 100 percorsi** città → sala → briefing a 360 (carico alto: tre sonde in parallelo) e 0 in tutte le altre corse. **Chiuso** per quanto misurabile (C-024: 3 su 812).
- **C24-06** nome di e36 a 412: **fermo in 10/10 caricamenti** a 150, 300, 600, 1000, 1500 ms (stessa posizione 214,454, 89×12). **Chiuso.**
- **C25-01** «CALDERHOLT»: 0 residui in ogni maiuscola (1.1, 4). **Chiuso.**
- **C25-02** tocco dopo la «i»: vedi sezione 4. Le corse complete hanno aperto la «i» in ogni ondata e poi schierato: **0 blocchi** (in C-025 e16 si bloccava).

## 4. Interfaccia e regressioni (FATTO MISURATO)

Comando: `FOTO=1 W=360|375|412 node coordination/sonde/c26-schermate.mjs . <foto> <uscita.json>` (36 episodi, piano del bot attento col seme 1, «i» aperta in ogni ondata); poi `FONDO=1 W=360|375 EP=e01,e06,e13,e16` per i casi coperti.

| larghezza | schermate | nomi vecchi | scorrimento orizzontale | testi tagliati | testi sotto un pulsante (in cima → in fondo) | comandi coperti | errori |
|---|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | rapporto, risposta → **0** in fondo | 1 (e06) | 0 |
| 375×667 | 1916 | 0 | 0 | 0 | rapporto, risposta, chiusura, «i», briefing → **0** in fondo | 142 in cima («?» sotto la barra) → **0** in fondo | 0 |
| 412×915 | 1916 | 0 | 0 | 0 | rapporto → 0 | 1 (vedi sotto) | 0 |

- **Testi sotto la barra dei pulsanti:** con la pagina in cima l'ultimo paragrafo (o il nome di chi parla) sta sotto il pulsante fisso «Avanti»; scorrendo in fondo **0/127** restano coperti a 360 e 375 (foto `375-e01-risposta-corteo_partito-cima.png` e `-fondo.png`). Non è un difetto.
- **Comandi coperti:** a 360, e06 schieramento, la pastiglia «ritira Mediatore da Piazza del concerto» ha il centro sotto il disco del Piazzale (anche in fondo alla pagina) → C26-11. A 412 un'opzione della chiamata «presidente» di e01 aveva il centro fuori dal documento al momento della misura (elemento in cima: nessuno); 1 caso su 1916, non ripetuto: non posso confermarlo come difetto.
- **Etichette dei settori sovrapposte:** e13 «Viale fra stadio e piazza» × «Parcheggi» 20,5×4,2 px a 360 e 16,8×3,4 a 375; e16 «Magazzino delle fonderie» × «Strada da Kiln» 20,5×1,5 a 360 (foto `360-e13-schieramento-2-cima.png`) → C26-11. I segni ▲▼ degli effetti sopra le pastiglie (684–844 casi per larghezza) sono il disegno voluto.
- **C25-02** (`node coordination/sonde/c25-info.mjs . <foto> <uscita>`, 36 episodi × 3 larghezze): con la «i» aperta il bersaglio è colpito **108/108** (C-025: 0/108), senza 108/108, errori 0. La mappa si sposta ancora di 43,2–58,8 px quando la riga si chiude, ma dopo il tocco: il tocco arriva. **Chiuso.**
- **Bot:** `node tools/bot.mjs 1000` (45 s): 156 righe missione × partenza × strategia, **0 blocchi** in tutte, «chiamate mai comparse» `[]` in 36/36. Stessa corsa sulla 0.19.0 (0744b24): `diff` delle righe di blocchi, esiti e stelle **vuoto** (il campo `club` non entra nel motore, D-108).
- **Test:** `npx vitest run` → «Test Files 38 passed (38) · Tests 207 passed (207)».
- **Salvataggi:** `c26-salvataggi.mjs`: 10/10 salvataggi veri della 0.19.0 (e02, e05, e07, e12, e15, e21, e23, e25, e27, e31, esportati dal pulsante della 0.19.0 dopo la prima risposta) importati nella 0.20.0 e ripresi sulla **stessa chiamata**, 0 nomi vecchi, 0 errori di console in entrambe le build. `c25-ripresa.mjs`: R1 13/13 (ricarica, export, import), R2 3/3 salvataggi reali vecchi di `tests/salvataggi-reali/`.
- **Offline:** «offline: verde (O1-O4)».

## 5. Realismo e usabilità da giocatore (GIUDIZIO)

- Chi conosce il calcio legge «Railhead County contro Kiln United contro Wallgate Rovers» come una partita a tre, e i gemellati come nemici (C26-01). È la cosa che confonde di più fra quelle viste.
- La riga «Stasera» con una sola squadra (e07: «Southwind Town») non dice contro chi si gioca (C26-06).
- «Urgente!» compare su 6 chiamate su 7 (C26-10): diventa la norma e non aiuta a scegliere.
- Nel verbale gli stemmi senza nome (2.2) e alcuni simboli ambigui (lapide, traliccio) chiedono di riconoscere 16 stemmi a memoria.
- Arches che «resta in città fino all'alba» contraddice la mappa dei quartieri appena introdotta (C26-02).

## 6. Rilievi (per gravità)

| id | gravità | elemento | riproduzione | misura | foto | causa (FATTO) / IPOTESI |
|---|---|---|---|---|---|---|
| C26-01 | **media** | sfida «Stasera» coi gemellati | città, sala o verbale di e15 ed e27 | 2/36 episodi, 3 schermate ciascuno, 3/3 larghezze: «Railhead County contro Kiln United contro Wallgate Rovers»; «Kiln United contro Railhead County contro Waterline City»; secondo «contro» da solo a capo; vignetta della sala nascosta a 360×760 solo in questi due | `360-e15-sala-1.jpg`, `360-e15-citta.jpg`, `360-e27-sala-1.jpg` | `stemma.tsx:86-91` (club di tutte le curve), curva dei gemellati col club Railhead (`data/missioni/e15.json:64-66`, `e27.json:57-59`), griglia a 3 colonne `stile.css:196`. C'era già con lo Studio (0.19.0) |
| C26-02 | **media** | Arches di Valmora scritto da tifoseria di fuori | e33, ondata 4: «treno di mezzanotte» | 2 testi: `e33.json:111` («il treno per Arches»), `e33.json:117` («Sessanta Arches restano in città fino all'alba»); contro `docs/BIBBIA.md:108` | — | testi di e33 non toccati da D-125 (piano §6: e33 «resta come è»). Più debole: `e03.json:99` (Garden «fino alla statale») |
| C26-03 | **media** | D-126 d / C22-04 chiuso in parte | 375×667, primo passo del verbale di quasi ogni episodio | verbale mostrato in 30/36 episodi a 61,7–94,9 px (mediana 71,7); sala mostrata a 66,8 px in e04, e11, e30, e35; C22-04 giudicava illeggibili 54–94,9 px | `375-e01-verbale-1.jpg`, `375-e04-sala-1.jpg` | `vignetta.tsx:23-28`: si nasconde solo sotto il minimo `--vignetta-min-sala` 56 / `--vignetta-min-esito` 54 px (`token.css:124,126`). GIUDIZIO: i busti a 69 px si riconoscono come due persone, l'espressione no |
| C26-04 | bassa | calendario | stagione 1: e04 ed e08; stagione 2: e16 ed e21 | Kiln in casa due volte con lo Square (s1) e col Pinegrove (s2) | — | IPOTESI di campionato a girone (non scritto in BIBBIA). e16/e21 nasce con D-125 (`13-club.md` §4.1) |
| C26-05 | bassa | «Il terzo derby» | e32, sala | è il quinto derby Kiln–Skyfield giocato (e01, e10, e20, e22) | — | `e32.json:3`; testo anteriore alla 0.20.0 (8fbe970) |
| C26-06 | bassa | sfida con un solo club | città e sala di e07 (manca lo Skyfield che gioca in casa); anche e13, e21, e25, e28, e31 | 6/36 episodi con un club, 5 senza riga | `360-e07-sala-1.jpg` | `stemma.tsx:89`: solo club delle curve; e07 non ha la curva Skyfield (`data/missioni/e07.json`, settori) |
| C26-07 | bassa | simboli degli stemmi | sala o città con Stoneway, Railhead, Pinegrove, Belltower; C25-07 Square e Garden | — | `stemmi-avatar-dpr1.png`, `stemmi-avatar-dpr3.png` | GIUDIZIO: pietra miliare = lapide, fine linea = traliccio, pigna = ananas, campanile a DPR 1 = obelisco; calderone e penna (C25-07, aperto al PO) |
| C26-08 | bassa | colori degli stemmi | e02 (Skyfield–Railhead), e12/e23 (Kiln–Southwind), e15 (Kiln–Wallgate); Waterline | ΔE2000 6,1 (protanopia), 7,3 (deuteranopia), 17,9 (normale); Waterline forma/scheda 1,00:1 | `stemmi-avatar-dpr3.png` | colori dei club come dati (`data/club/*.json`); Waterline #ffffff contro #f5f5f5 del piano (`13-club.md` §2.3) |
| C26-09 | bassa | stemma del Tramway mai mostrato | tutti i 36 episodi | 15/16 stemmi visti a schermo; Tramway 0 | — | nessuna curva Tramway nei dati (e13: settore ospiti inagibile, e17: porte chiuse): coerente coi testi, ma lo stemma disegnato non si vede mai |
| C26-10 | bassa | «Urgente!» quasi ovunque | chiamate di qualsiasi episodio | 361/422 chiamate urgenti (85,5 %) a ogni larghezza | `360-e15-chiamata-treno_amici.jpg` (urgente), `360-e15-chiamata-rovers_rete.jpg` (no) | la regola D-126 c è rispettata 422/422; GIUDIZIO: quasi ogni chiamata ha un evento sul suo settore, quindi il segnale distingue poco |
| C26-11 | bassa | tocchi ed etichette sulla mappa a 360/375 | e06 schieramento a 360: tocca la pastiglia del mediatore di «Piazza del concerto»; e13, e16 | 1 pastiglia col centro sotto il disco del Piazzale; etichette sovrapposte 20,5×4,2 (e13, 360), 16,8×3,4 (e13, 375), 20,5×1,5 (e16, 360) | `360-e06-schieramento-1-cima.png`, `360-e13-schieramento-2-cima.png` | posizione dei punti nei dati della mappa; IPOTESI: il tocco va al Piazzale (non provato col dito) |
| C26-12 | bassa | testi vicini al limite | — | 26 testi col nome di un club a ≤ 3 caratteri dal limite; a 100/100 `e07.ch.immagine_club`, `e09.ch.rigore9`, `e09.ch.non_erano_nostri`, `e12.ch.voto_deciso`; 80/80 `e09.info_club` | — | informativo: il limite è rispettato |
| C26-13 | bassa | ripresa a metà episodio dopo l'aggiornamento | salvataggio della 0.19.0 a metà di e15 (o e07, e23) | l'avversario cambia nome a partita in corso (Studio → Railhead) | — | informativo: gioco non ancora pubblicato |

Nessun rilievo su: nomi vecchi (0 nei testi, 0 a schermo), articoli e suffissi (0 su 827), club fuori piano (0), limiti di lunghezza, scorrimento orizzontale e testi tagliati, D-123, D-126 a-b-c, bot (identico alla 0.19.0), test, salvataggi, offline, errori di console.

## Verificati e chiusi

| rilievo / decisione | misura |
|---|---|
| D-123 (nome in città) | 0/36 a 360 e 375; 36/36 a 412 entro 18 px, 0 sovrapposizioni |
| D-126 a, C22-03 (persone sulla mappa) | dischi da 5–6 px con contorno sui pixel; rosso C56P01 puntini |
| D-126 b, C24-01 (avatar nel briefing) | 144/144 per larghezza |
| D-126 c, C24-04 (urgenza) | 422/422 coerenti con la regola |
| C22-05, C22-08, C22-10 (icone) | effetti 16 px, «home» e «i» 20 px, pulsanti 20 px |
| C22-06 (contrasto stemmi) | 4 simboli sotto 3:1, tutti col contorno; guardiano verde, rosso C62S01 visibile |
| C22-07 (splash) | immagini sostituite e tema Android 12+; telefono: non posso confermarlo |
| C22-09 (avatar = chi chiama) | 6/6 |
| C24-03 (errori «screen») | 0/100 percorsi, 0 in tutte le corse |
| C24-06 (nome di e36) | fermo 10/10 |
| C25-01 (nome vecchio) | 0 residui in ogni maiuscola |
| C25-02 (tocco dopo la «i») | bersaglio colpito 108/108 con la «i» aperta (era 0/108), 108/108 senza |
| D-124 (nomi storici), D-125 (13 club) | 0 nomi vecchi, 13/13 club negli episodi, 0 fuori piano |
| C22-04 | **non chiuso del tutto** → C26-03 |

## Note di metodo e limiti

- **Nessuna misura dei collaudi precedenti ritirata.**
- Le corse dell'interfaccia giocano il piano del bot attento col seme 1: 422 chiamate per larghezza, non tutte quelle dei dati; i testi sono invece controllati tutti (sezione 1).
- Chromium headless a DPR 1 (stemmi anche a DPR 3); non ho un telefono Android: resa reale, DPR e tocco col dito non posso confermarli.
- Le persone sulla mappa sono lette dai pixel con un filtro semplice (componenti scure piccole col centro chiaro): conta anche qualche pezzo di fondo (2–7 nel rosso) e fonde le persone vicine; il confronto rosso/verde e le foto valgono più del numero assoluto.
- ΔE2000 e simulazione del daltonismo sono calcolati sui primari, non sui pixel dello stemma intero.
- Le corse complete hanno girato tre in parallelo (carico alto): utile per C24-03.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c26-storia.mjs` | club nei dati e nei testi contro la mappa approvata, fonti, nomi vecchi in ogni maiuscola, articoli e suffissi dei 16 nomi, lunghezze | `node coordination/sonde/c26-storia.mjs [uscita.json]` |
| `c26-stemmi.mjs` | 16 stemmi a 42 px, DPR 1 e 3: pixel, contrasti, misura del simbolo; ΔE2000 e daltonismo fra i club che si incontrano | `node coordination/sonde/c26-stemmi.mjs <foto> <uscita.json>` |
| `c26-schermate.mjs` | gioca i 36 episodi: nomi, scorrimento, tagli, testi sovrapposti, comandi coperti, sfida e stemmi, D-123, avatar, urgenza attesa dai dati, vignette | `W=360\|375\|412 [EP=…] [FOTO=1] [FONDO=1] [NOINFO=1] node coordination/sonde/c26-schermate.mjs . <foto> <uscita.json>` |
| `c26-chiusi.mjs` | persone sulla mappa (pixel, rosso C56P01), icone, avatar = chi, nome di e36, percorsi ripetuti | `[PARTI=P,I,A,N,S] [GIRI=100] node coordination/sonde/c26-chiusi.mjs . <foto> <uscita.json>` |
| `c26-salvataggi.mjs` | salvataggi veri della 0.19.0 esportati e ripresi nella 0.20.0 | `node coordination/sonde/c26-salvataggi.mjs <radice 0.19.0> . <cartella> <uscita.json>` |
| `c25-info.mjs`, `c25-ripresa.mjs` | tocco dopo la «i»; ripresa, export/import, salvataggi reali vecchi | come in COLLAUDO_C25.md |
