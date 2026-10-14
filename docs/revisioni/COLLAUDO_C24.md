# Collaudo C-024 — 0.18.0: vignetta del luogo nel briefing (PO-078), spicchio dell'urgenza (PO-085), C21-04/05/06/09, C23-01/02/03, rilievi aperti C-022 e C23-04, usabilità, regressioni

- **Build collaudata:** main e9e027a (rilascio 48f44ee), GAME_VERSION 0.18.0 (`src/versione.ts:132`, commento `:125-131`). Ricostruita in locale con `npm ci` e `npx vite build`.
- **Ramo:** claude/valmora-collaudo-c24, creato da main e9e027a. Sola lettura sul codice di gioco: nessun file fuori da `coordination/sonde/c24-*`, `docs/foto/c24/` e questo rapporto.
- **Data:** 2026-10-14.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader); funzioni di `src/logica` importate in Node.
- **Sonde nuove:** `coordination/sonde/c24-*.mjs` (tabella in fondo; `c24-comune.mjs` raccoglie le parti comuni). Rilanciate quelle già su main: `c23-citta.mjs`, `c17-affidabilita.mjs` (senza A1, che misura tempo reale), `tools/bot.mjs`, `tools/offline.mjs`.
- **Foto:** `docs/foto/c24/` (finestra 360×760, 375×667, 412×915). Nomi: `briefing-<larghezza>-<episodio>-1[-rosso].jpg`; `figura-<vignetta>-<episodio>.png` (riga del mittente nel briefing, scala 3) e il foglio `figure-briefing-foglio-360x3.png`; `orologio-<larghezza>-<episodio>-<chiamata>[-rosso].jpg`; `cortei-412x2-<episodio>-<chiamata>[-rosso].jpg` (sola mappa, scala 2); `stadio-412x2-<episodio>-o1[-rosso].jpg`; `c23-03-412x2-<episodio>-o<n>.jpg`; `vignetta-<episodio>-<chiamata>[-rosso].png`; `<larghezza>-citta-<episodio>-lontano[-rosso].jpg`; `c22-*.jpg`; `gioco-360-<episodio>-<scena>.jpg` (partite dall'interfaccia; tenute solo quelle a 360).

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **LETTURA** (testo copiato dai dati, chiave tra parentesi) · **GIUDIZIO** e **IPOTESI** marcati.

**Carico della macchina.** Le sonde lunghe hanno girato insieme (4 processori, carico medio fino a 25). Nessun esito usa tempi reali; due esiti sono cambiati col carico e li riporto con entrambe le misure: l'errore di console di C24-03 e il primo giro di `c17-affidabilita.mjs` (vedi 7).

## Riepilogo

| verifica | esito |
|---|---|
| 1. PO-078 vignetta del luogo nel briefing | **misura verde**: 432/432 passi (144 per larghezza) con figura **42×42**; documento **identico** al rosso C51A01 in 432/432; a 360×760 nessun passo scorre. **Leggibilità (GIUDIZIO): insufficiente** a 1×: riquadro di chi chiama 16,0×12,7 px, glifo **8,2–10,3 px**, più piccolo di quello già giudicato illeggibile in C22-01 (12,4 px); del luogo si vede la metà destra (**C24-01, media**) |
| 2. PO-085 spicchio d'orologio | nessun testo coperto (0/1485), nessuna chiamata più alta (0/1485 contro il rosso C51O01); **ma** è uguale su tutte le 495 chiamate, comprese le 82 senza evento sul settore, e i dati non hanno un'urgenza a cui legarlo (**C24-04, media**); sta nell'angolo **in alto a sinistra** (0/1485 nella metà destra), non dove dice D-122, e copre fino al 23% dell'avatar (**C24-05, bassa**) |
| 3. C21-04, C21-05/06, C21-09 | **CHIUSI**: e15 ed e27 con lo stadio fra le due squadre (rosso C50C01 lo rimette accanto ai gemellati); 21/21 chiamate con cerimonia/minaccia/lite/faida disegnate «gente» (rosso C50G01: tifo 10, scontro 11); e31 offerta «gente» solo con `testimone=esposto`, «nessuno» altrimenti (rosso C50S01: «gente» in entrambi i casi) |
| 4. C23-01, C23-02, C23-03 | **C23-01 CHIUSO**: 106/106 chiamate con corteo coerenti sui pixel, 13/13 col club dall'evento; rosso C53D01 cambia colore 13/13. **C23-02 CHIUSO** sulla misura del C-023 (0/36 nomi coperti a ogni larghezza; rosso C53N01 14/36, 13/36, 13/36), **ma** a 360 e 375 16/36 nomi finiscono più vicini al disco di un altro episodio che al proprio, fino a 55 px (**C24-02, media**) e a 412 il nome di e36 si sposta all'arrivo in 5/10 caricamenti (**C24-06, bassa**). **C23-03 CHIUSO** per e30 ed e17 ondata 4 (arancio Cinderwick; rosso C49E01 grigio) |
| 5. Rilievi aperti | **C22-01…C22-10 ancora presenti** (attesi): file del C-022 invariati, misure uguali a quelle del C-022; **C23-04 presente** |
| 6. Usabilità e realismo | e01, e07, e13, e15, e28 dall'interfaccia: 30 partite, 1512 schermate, 0 testi irraggiungibili, «Rispondi» porta la prima opzione intera 255/255. Realismo: in e30 il corteo «dallo stadio al municipio» è disegnato verso lo stadio, con spalti «in arrivo» in un giorno senza partita (**C24-07, bassa**) |
| 7. Regressioni | **0 blocchi** su 42 828 partite col motore e 30 dall'interfaccia; offline verde; ripresa, indietro, «Riparti», export/import verdi; **errori di console: 3 in 612 percorsi città → briefing**, tutti «reading 'screen'» in `StratoCitta`, solo a macchina carica (**C24-03, media**); 0 errori in tutte le altre sonde |

Rilievi nuovi: **0 alti, 4 medi, 3 bassi** (tabella in fondo).

## 1. PO-078 (D-118, D-122): vignetta del luogo al posto dell'avatar nel briefing

**Codice (FATTO):** nel briefing `Mittente` riceve come `figura` la vignetta della chiamata costruita dalla fonte (`src/resa/schermate/Briefing.tsx:17-19`, rosso `C51A01`), con ritaglio `xMaxYMid slice`; la figura prende il posto dell'avatar (`src/resa/schermate/Fumetto.tsx:49`) ed è quadrata, alta e larga `--avatar` 42 px (`src/resa/stile-c18.css:51-52`, `src/resa/token.css:180`). La vignetta viene da `VignettaChiamata` con un id `briefing-<n>` che non è in nessuna ondata, quindi senza sagoma dell'evento: solo luogo e chi parla (`src/resa/vignette-chiamata.tsx:57-61`, `src/resa/vignette-evento.tsx:35`).

**Misura (FATTO MISURATO,** `node coordination/sonde/c24-briefing.mjs . docs/foto/c24`**):** 36 episodi, tutti i passi del briefing (144 per larghezza), verde e rosso C51A01, a 360×760, 375×667, 412×915:

| larghezza | passi | documento diverso dal rosso | passi che scorrono (verde / rosso) | figura | nome su più righe (verde / rosso) |
|---|---|---|---|---|---|
| 360×760 | 144 | **0** | 0 / 0 | 42×42 | 40 / 40 |
| 375×667 | 144 | 0 | 144 / 144, max 97 px in entrambi | 42×42 | 40 / 40 |
| 412×915 | 144 | 0 | 0 / 0 | 42×42 | 37 / 37 |

- Altezza del briefing a 360×760 **invariata**: 144/144 passi con documento identico al rosso, nessuno scorre. A 375×667 scorrono tutti, ma identici al rosso: non è un effetto di PO-078.
- Riquadro di chi chiama dentro il ritaglio 144/144 (100%); sua misura **16,0×12,7 px**; glifo: telefono 8,6×7,6, ufficio 10,1×7,6, radio 8,7×10,1, rete 8,2×10,3 px (lato maggiore mediana 10,1). Nessun vice nel briefing.
- Vignette usate: 29 coppie luogo-chi, le più frequenti curva-ufficio 21, strada-ufficio 17, strada-telefono 10, curva-rete 10.
- Errori di console nella sonda: 2 (C24-03).

**Leggibilità (GIUDIZIO, separato dalla misura):** foto `briefing-360-e01-1.jpg`, `briefing-360-e15-1.jpg`, foglio `figure-briefing-foglio-360x3.png` (scala 3, cioè tre volte più grande del telefono a 1×).
- Ingrandito a scala 3, telefono, radio, rete e foglio dell'ufficio si riconoscono; alla misura vera il glifo è di 8–10 px, sotto il telefono di 12,4 px che il C-022 giudicava già irriconoscibile (C22-01, alta).
- Il ritaglio mostra il terzo destro del disegno (180 unità su 320, x 140-320): il luogo si capisce solo dove ha una forma propria a destra (righe colorate della curva, barca dell'acqua, gru dell'industria); strada, piazzale e sala si riducono a una fascia scura in basso sotto un fondo giallo, che occupa più di metà della figura.
- Rispetto all'avatar di prima (icona lucide 19,2 px su fondo ciano) la figura porta più informazione ma in un glifo più piccolo. Il nome della fonte, scritto accanto, dice comunque chi parla.

## 2. PO-085 (D-120, D-122): spicchio d'orologio dell'urgenza

**Codice (FATTO):** ogni chiamata ha `timbro="Urgente!"` e `urgenza={!spento('C51O01')}` (`src/resa/schermate/Ondata.tsx:49`); lo spicchio è uno `span.orologio` 32×32 in posizione assoluta, `top` e `left` −12 px rispetto alla riga del mittente, gradiente conico che si svuota in 8 s e riparte (`animation … infinite`), fermo a metà con il movimento ridotto (`src/resa/stile-c18.css:53-61`). Il tipo `Chiamata` non ha alcun campo di urgenza o scadenza (`src/logica/tipi.ts:35`).

**Misura (FATTO MISURATO,** `node coordination/sonde/c24-orologio.mjs . docs/foto/c24`**):** 828 partite col motore (0 blocchi), **495/498** chiamate raggiunte (mai: e06 favore_impresa, e06 risultato_favore, e36 conti_procura, che il C-023 raggiungeva con 200 semi), aperte a 360, 375 e 412, verde e rosso C51O01:
- bollino presente 495/495 a ogni larghezza (rosso: 0); misura 32×32;
- **testi o comandi sotto il bollino: 0** su 1485; fuori dalla finestra 0;
- **fumetto o documento diverso dal rosso: 0** su 1485: nessuna chiamata più alta;
- posto: a 3 px dal bordo sinistro del fumetto, **nella metà destra 0/1485**; avatar coperto fino al **23%** (mediana 13% a 360, 23% a 375 e 412), glifo dell'avatar coperto fino al 20%;
- la riga del mittente non ha barre fisse sopra quando si scorre (la prova «bollino sotto la barra» non ha trovato barre in cima: 0 provati);
- gruppo della vignetta delle chiamate col bollino: gente 176, tifo 107, corteo 87, **nessuno 82**, veicoli 17, biglietti 15, fumo 6, scontro 5;
- errori di console 0. Foto: `orologio-360-e01-corteo_partito.jpg` e `-rosso.jpg`, idem e07, e15, e18, e28 a 360 e 375.

**Coerenza con l'urgenza vera (FATTO dati):** su 498 chiamate, 40 non hanno settore, 43 hanno un settore senza eventi in quell'ondata, 69 hanno pressione massima 1-2, 5 hanno pressione 7 (conteggio sui file `data/missioni/*.json`, pressione massima degli eventi sul settore della chiamata nella sua ondata). Tutte mostrano lo stesso «Urgente!» e lo stesso spicchio.
- LETTURA, chiamate senza evento sul settore o senza settore: «Sono del giornale di Valmora. Gira voce che fra poco prendete il Fabbro. Mi conferma qualcosa, anche a mezza voce?» (e28.ch.cronista_voci); «Foto in rete: striscione in curva Larkspire, KILLJOY AD INTERIM, col tuo nome storpiato.» (e01.ch.striscione); «Capo, ai banchi del concerto vendono abbonamenti della nuova stagione a metà prezzo…» (e13.ch.abbonamenti_voce).
- GIUDIZIO: lo spicchio non distingue l'urgenza perché nei dati non c'è un'urgenza da distinguere; D-120 lo vuole «solo grafica», quindi è coerente con la decisione ma non con l'urgenza della chiamata (**C24-04**). Che ricominci pieno ogni 8 s senza conseguenze può far credere a un tempo limite che non esiste: IPOTESI sul giocatore, non misurata.

**Posto (C24-05):** D-122 dice «bollino sull'angolo in alto a destra del fumetto» (`docs/governo/DECISIONI.md:133`); i commenti del codice dicono «accanto al timbro» (`src/resa/schermate/Fumetto.tsx:54`, `src/resa/stile-c18.css:53`) e «bollino sull'angolo dell'avatar» (`stile-c18.css:56-57`); la misura dice angolo in alto a **sinistra** del fumetto, sull'avatar. Il commento di `stile-c18.css:56-57` spiega il motivo (in alto a destra copriva «Urgente!» in 13 chiamate), ma la decisione non è stata aggiornata. Allo stesso modo `Briefing.tsx:17` e D-118 dicono «78×44 px» per la figura del briefing, che è 42×42 (D-122).

## 3. C21-04, C21-05/06, C21-09

**C21-04 (FATTO MISURATO,** `PARTE=A node coordination/sonde/c24-c21.mjs . docs/foto/c24`**):** mappa dello schieramento, ondata 1, 412 scala 2. Con tre curve lo stadio è fra le due che non sono dei gemellati (`src/resa/mappa/sfondo.ts:72-79`, rosso `C50C01`).
- e15: verde, ellisse 207,198,84,52 fra curva ospiti (Rovers, a sinistra) e curva Cinderwick (a destra), spalti con arancio Cinderwick e verde Rovers; rosso C50C01: ellisse 260,116,32,20 accanto al settore dei gemellati, spalti grigio-verdi (Mossgarth/Ollerbrook nei pixel). Foto `stadio-412x2-e15-o1.jpg` e `-rosso.jpg`.
- e27: verde, ellisse 191,129,113,70 fra curva Cinderwick e curva ospiti; rosso: 115,103,39,24 accanto alla curva Cinderwick. Foto `stadio-412x2-e27-o1.jpg` e `-rosso.jpg`.
- GIUDIZIO sulle foto: in verde lo stadio sta fra le due squadre della partita, il settore dei gemellati resta fuori. Il conteggio dei pixel per colore dentro l'ellisse è rumoroso (tetti marroni contati come Saltmere): lo uso solo per il confronto fra i bracci.

**C21-05/06 (FATTO MISURATO,** `PARTE=B,C node coordination/sonde/c24-c21.mjs . docs/foto/c24`**):** le 21 chiamate su un settore con cerimonia, minaccia, lite o faida:

| tipo | verde | rosso C50G01 | chiamate |
|---|---|---|---|
| cerimonia | gente 10/10 | tifo 10/10 | e26 lista_ospiti, cori_tribuna, foto_coppa; e31 comando_vuole, costruttore_saluta, segreteria_chiede; e34 commissione_schieramento, uscita_commissione, fiducia_comando, osservatore |
| minaccia | gente 5/5 | scontro 5/5 | e18 telefonata, via_fonderie, cappucci, con_o_senza, lo_conosco |
| faida | gente 4/4 | scontro 4/4 | e21 nuovo_capo, bottigliette, striscione_sgombero, stanotte_sgombero |
| lite | gente 2/2 | scontro 2/2 | e14 seduti, ospiti_sbagliati |

Regola nel codice: `src/resa/vignette-evento.tsx:15-23` (gruppi di prima col rosso: `:14`). Foto `vignetta-e34-commissione_schieramento.png`, `vignetta-e18-telefonata.png`, `vignetta-e21-nuovo_capo.png`, `vignetta-e14-seduti.png` e i `-rosso`.

**C21-09 (FATTO MISURATO, stessa sonda):** le chiamate sul settore di un evento con `se` (dati: tre eventi) aperte con la variabile vera e falsa:
- e31 offerta, evento testimone_ritratta (folla, `se testimone=esposto`), unico evento sul settore: `testimone=esposto` → «gente», 7 pallini; `testimone=nessuno` → **«nessuno»**, 0 pallini. Rosso C50S01: «gente» in entrambi i casi. Foto `vignetta-e31-offerta-testimone-*.png`.
- e20 viso_scoperto ed e29 corteo_al_porto: «corteo» con la variabile vera e falsa, perché sullo stesso settore c'è un altro corteo senza condizione: corretto.
- Fuori dalla vignetta: la folla della mappa (`src/resa/mappa/folla.ts:24-31`) non guarda `se`; con i dati di oggi non cambia nulla di visibile (in e20 ed e29 c'è comunque un altro corteo sulla strada; nessun evento con `se` ha un club). Non lo conto come rilievo.

## 4. C23-01, C23-02, C23-03

**C23-01 (codice, FATTO):** il corteo della chiamata prende il club dell'evento dell'ondata su quella strada, poi club della strada, curva omonima, neutro (`src/resa/mappa/StratoPixi.tsx:159-163`, club per strada da `src/resa/mappa/folla.ts:23-24`, rosso `C53D01`), e lo dichiara in `data-dinamica-colori`. Dati: nessuna ondata ha due eventi con club diversi sulla stessa strada, nessun evento con club ha un `se` (controllo sui file `data/missioni`).

**C23-01 (FATTO MISURATO,** `node coordination/sonde/c24-cortei.mjs . docs/foto/c24`**):** tutte le chiamate raggiungibili (495) aperte a 412 scala 2 con riduci movimento; **106** hanno il corteo della chiamata. Per ciascuna, sola mappa in PNG in tre bracci (verde, `__NO_C32D01` senza corteo della chiamata, rosso C53D01); differenza verde − C32D01 = pixel del corteo della chiamata, contati per colore primario (±14 per canale); atteso calcolato dai dati, non dal codice.
- **coerenti 106/106** (colore dominante del corteo = atteso, almeno 40 px); `data-dinamica-colori` uguale all'atteso 106/106;
- con club dall'evento **13** (e06 corteo_cinderwick; e07 coro_imparato, pareggio_casa, immagine_club; e13 corteo_rovers; e15 fratelli, mille, fondo_viale; e17 me_lo_dovete; e28 ospiti_in_auto; e30 silenzio_totale, saluto_larkspire, fiaccolata): coerenti 13/13; **il rosso C53D01 cambia colore in 13/13** (grigio, o Cinderwick in e28): la sonda vede il difetto;
- e28 ospiti_in_auto: Mossgarth 267 px (rosso: Cinderwick 305 px). Foto `cortei-412x2-e28-ospiti_in_auto.jpg` e `-rosso.jpg`, `cortei-412x2-e15-mille.jpg` e `-rosso.jpg`;
- errori di console 0.

**C23-02 (FATTO MISURATO,** `node coordination/sonde/c24-citta.mjs . docs/foto/c24` **e** `ROSSO=C53N01`**, copia di `c23-citta-copre.mjs` con la distanza dal proprio disco):**

| larghezza | nomi coperti > 3% (verde) | idem rosso C53N01 | distanza nome-proprio disco: mediana / max (verde) | nomi più vicini al disco di un altro episodio (verde) | idem rosso |
|---|---|---|---|---|---|
| 360 | **0/36** | 14/36 (e26 100%) | 12,1 / **55** px | **16/36** | 2/36 |
| 375 | **0/36** | 13/36 (e26 67,7%) | 11,0 / 51 px | **16/36** | 2/36 |
| 412 | **0/36** | 13/36 (e28 40,2%) | 1,5 / 18 px | 1/36 | 0/36 |

- Il nome non è più coperto dalle stelline del suo episodio: C23-02 chiuso come era misurato. La correzione aggiunge come ostacoli disco e stelline dell'episodio stesso (`src/resa/mappa/etichette.ts:114-118`) e non pesa la distanza dal disco (`LONTANO = 0`, `etichette.ts:13`).
- **Effetto (C24-02):** a 360 «Ospiti numerosi» (e02) sta nell'angolo in alto a sinistra a 55 px dal suo disco e a 9 px dal disco di e01; e06 a 45 px dal suo, 9 da e03; e07 a 40 px, 12 da e03. Foto `360-citta-e02-lontano.jpg` (il nome sta sopra il disco 1, il disco 2 è cerchiato), e le altre `*-lontano.jpg`.
- La sviluppatrice lo scrive nel suo rapporto come «DECISIONE DEL PO – vicinanza del nome al disco» (`coordination/handoffs/sviluppatrice/C23-01-02-rapporto.md:62-74`, nel commit f037582) e nel commento di `LONTANO`; non trovo una voce in `docs/governo/DECISIONI.md` né in `BACKLOG.md` (`grep -i "vicinanza\|LONTANO"`: nessun risultato).
- Misure del C-023 rifatte (`CARICAMENTI=10 node coordination/sonde/c23-citta.mjs`, a macchina scarica): sopra stelline di altri 0, sopra dischi di altri 0, a meno di 5 px dal bordo 0 a ogni larghezza; posto stabile fra i caricamenti 36/36; carattere 12 px. **Ma** a 412 il nome acceso all'arrivo (e36) si sposta fra 150 e 1500 ms in **5/10** caricamenti (da 240,8,333,1, 90×30,8 a 197,8,303,7, 89×12: da due righe a una, 43 px a sinistra); nel C-023 era 0/10. Con la macchina carica era 1/10. Vedi **C24-06** e il braccio rosso in fondo.
- Errori di console 0 in tutte e tre le corse.

**C23-03 (FATTO MISURATO,** `PARTE=D node coordination/sonde/c24-c21.mjs . docs/foto/c24`**, schieramento a 412 scala 2):** club Cinderwick sugli eventi `silenzio_strada`, `coda_corteo`, `fiaccole` (`data/missioni/e30.json:287,453,611`) e `dopo_corteo` (`data/missioni/e17.json:643`).
- e30 ondate 2, 3, 4: `strada_cinderwick=#ff6a13`, 335 px arancio sulla mappa; rosso C49E01: neutro, 0 px arancio.
- e17 ondata 4: `#ff6a13`, 382 px; rosso: neutro, 0 px. e17 ondata 1 (raduno_strada): neutro, per scelta della principale (registro C-023 in `docs/governo/COLLAUDI.md:96`).
- Foto `c23-03-412x2-e30-o2.jpg`…`-o4.jpg`, `c23-03-412x2-e17-o4.jpg`. Il corteo della chiamata in e30 ed e17 è coerente (sopra, 4/4).
- Realismo della direzione in e30: vedi **C24-07**.

## 5. Rilievi ancora aperti

**C22-01…C22-10 (FATTO):** `git diff --stat 8305430 e9e027a` sui file citati dal C-022 (`token.css`, `stile.css`, `icone.tsx`, `stemma.tsx`, `mappa/dinamica.ts`, `android/app/src/main/res`): nessuna modifica. Cambiano solo `vignetta.tsx` (parametro di ritaglio), `vignette-chiamata.tsx` (variabili per `gruppoEvento`), `vignette-evento.tsx` (gruppi C21-05/06/09), `StratoPixi.tsx` (colori del corteo della chiamata), `stile-c18.css` (figura del briefing e spicchio): nessuno tocca misure o colori dei rilievi C-022.

**Misure rifatte (FATTO MISURATO,** `node coordination/sonde/c24-c22.mjs . docs/foto/c24`**):**

| voce | misura C-024 | C-022 | esito |
|---|---|---|---|
| C22-01 riquadro di chi chiama, glifo | 360: vignetta 101,3×58,7, riquadro 23,1×18,2, glifo **12,4×10,9**; 412: 119,0×68,7, 27,3×21,6, **14,7×12,9** | uguali | presente; nel briefing è più piccolo ancora (C24-01) |
| C22-02 pallini | 3,3 px a 360, 4,0 a 412; cerchio r 5,5 senza contorno (`src/resa/vignette-evento.tsx:51-52`) | 3,3–4,0 | presente |
| C22-03 persone della mappa | quadratini 2,2 e 2,6 unità di tela (`StratoPixi.tsx:82`, `dinamica.ts:24`), colori dei club senza contorno | uguali | presente (codice) |
| C22-04 vignetta della sala | 375×667, e01 primo passo: **56,0 px** (`--vignetta-min-sala`, `token.css:123`) | 56 | presente |
| C22-05 icone delle pastiglie | 13,0×13,0 px | 13 | presente |
| C22-06 stemmi | `stemma.tsx` invariato | — | presente (codice) |
| C22-07 splash Android | 11/11 `splash.png` **identici byte per byte** al modello di `@capacitor/cli` 8.5.3 (`assets/android-template.tar.gz`, confronto con `cmp`) | 11/11 | presente |
| C22-08 icone < 16 px che si riconoscono | codice invariato | — | presente (media per metro, nessun difetto di forma) |
| C22-09 avatar diverso dalla vignetta | e18 telefonata: avatar `message-square`, vignetta `industria-telefono`; e13 viale_pieno: avatar fumetto, vignetta ufficio (`gioco-360-e13-chiamata-viale_pieno.jpg`) | uguale | presente |
| C22-10 icone dei pulsanti | 18,0×18,0 px (`--icona`, `token.css:177`), `strokeWidth={2}` (`icone.tsx:17`) | 18 | presente |

**C23-04 (FATTO):** pallini `--nero` #111111 (`token.css:8`) su `--mappa-asfalto` #2a2d33 (`token.css:36`, `stile.css:285`), nessun contorno (`vignette-evento.tsx:52`): contrasto 1,37:1 come nel C-023. **Presente.**

Fuori dall'elenco chiesto, gli altri due aperti del C-021: C21-07 (veicoli disegnati come persone: `arrivo: 'gente'`, `vignette-evento.tsx:16`; e28 ospiti_in_auto ancora pallini, `gioco-360-e28-chiamata-ospiti_in_auto.jpg`) e C21-10 (82 chiamate «nessuno» su 495 raggiunte) **presenti**.

## 6. Usabilità e realismo dall'interfaccia

**FATTO MISURATO** (`node coordination/sonde/c24-partite.mjs . docs/foto/c24`, copia di `c23-partite.mjs` con e13): e01, e07, e13, e15, e28 avviati dalla città («Rigioca»), piano del bot attento e del peggiore, a 360, 375 e 412: **30 partite** fino al verbale, **1512 schermate** misurate a inizio e fondo pagina:
- versione presente 1512/1512, sopra un comando 0, fuori dalla finestra a fondo pagina 0;
- testi coperti da elementi fissi a fondo pagina **0** (a inizio pagina il pulsante fisso in basso copre l'ultima riga del rapporto e della risposta, che si raggiunge scorrendo, come nel C-023);
- chiamate 360; «Rispondi» in 255 (360: 118/120, 375: 120/120, 412: 17/120); dopo il tocco la prima opzione è intera 255/255, coperta 0; «Rispondi» sopra il testo 0;
- errori di console 0.

GIUDIZIO (foto `gioco-360-*`):
- e13 (`gioco-360-e13-chiamata-viale_pieno.jpg`): testo («Il viale fra stadio e piazza è pieno: sciarpe, sedie pieghevoli e auto, tutti in mezzo.», e13.ch.viale_pieno) coerente con il settore e coi pallini; spicchio in alto a sinistra, «Urgente!» a destra, leggibili. Mittente «Organizzatori del concerto» con avatar a fumetto e vignetta ufficio (C22-09).
- e28 (`gioco-360-e28-chiamata-ospiti_in_auto.jpg`): ora il corteo sulla strada è grigio-verde Mossgarth come il testo (C23-01 chiuso); la vignetta mostra ancora persone e non auto (C21-07).
- e15 e e07: testi coerenti coi settori; e15 col corteo arancio sul viale e lo stadio fra le due squadre.
- A 360 la mappa dello schieramento e della chiamata di e13 ha in basso una fascia scura senza città (`gioco-360-e13-chiamata-viale_pieno.jpg`); era già nel C-023 (lasciata al grafico C-022).
- Verbali persi (`gioco-360-e13-persa-verbale-1.jpg`, `gioco-360-e28-persa-verbale-1.jpg`): esito e «Ricomincia l'episodio» leggibili; violenza fuori campo.

**Realismo di e30 (C24-07):** LETTURA «Corteo dallo stadio al municipio, le due metà della curva insieme.» (e30.intro2), «Il corteo si muove in silenzio dallo stadio verso il municipio, in mezzo al traffico.» (e30.ondata2.i), «Il giorno dopo, niente partita» (e30.ondata1.i). FATTO MISURATO (`c24-c21.mjs` parte D): nelle ondate 2, 3, 4 `data-folla` = `arrivo|strada_cinderwick>entra`, cioè spalti «in arrivo» e corteo **verso lo stadio**. FATTO (codice): senza deflusso e senza una partita prima, la folla è sempre «arrivo» e il corteo «entra» (`src/resa/mappa/folla.ts:30-34`). GIUDIZIO: con il movimento il corteo va nel verso opposto al racconto e lo stadio si riempie in un giorno senza partita; con «riduci movimento» il verso non si vede (foto `c23-03-412x2-e30-o4.jpg`, ferma).

## 7. Regressioni

- **Blocchi** (FATTO MISURATO, ogni partita chiusa con un esito):
  - `node tools/bot.mjs 200`: «blocchi 0/200» in **156/156** righe strategia × episodio (31 200 partite), più 300 partite per episodio «scelte a caso con schieramento attento» (10 800); «chiamate mai comparse []» in 36/36;
  - `c24-comune.mjs` (usato da `c24-orologio`, `c24-cortei`, `c24-c21`): 828 partite (36 episodi × 3 strategie fisse + 20 semi casuali, metà con variabili di partenza a caso), 0 blocchi;
  - totale **42 828 partite, 0 blocchi**, più 30 partite dall'interfaccia (punto 6).
- **Offline:** `node tools/offline.mjs dist` → «offline: verde (O1-O4)».
- **Ripresa, indietro, Riparti, export/import** (`SALTA_A1=1 node coordination/sonde/c17-affidabilita.mjs .`, carico medio 0,7): ricarica sul verbale → «Riprendi» → verbale con «Riparti»; indietro sul verbale resta sul verbale; «Riparti» → schieramento dell'ondata 2 e il bot attento vince («contenuto»); ricarica sulla risposta, sul rapporto, a schieramento non confermato (6 pastiglie prima e dopo) ok; esporta → cancella → importa uguale; errori di console 0. Le righe A6 e A7 contengono tempi e fotogrammi al secondo: non li uso (regola delle misure).
  - **Primo giro rosso, dichiarato:** la stessa sonda lanciata con la macchina carica (carico medio circa 20) si è fermata al passo A2 per un'attesa scaduta (15 s, `page.waitForFunction` della scena «chiamata», `c17-affidabilita.mjs:27`). Al secondo giro, a macchina scarica, è verde. Per la regola delle catene è uno strumento instabile sotto carico (attesa a tempo reale), non un difetto misurato del gioco.
- **Errori di console:** 0 in `c24-orologio` (2970 aperture), `c24-cortei` (318), `c24-c21`, `c24-c22`, `c24-citta` (verde e rosso), `c23-citta` (due corse), `c24-partite`, `c17-affidabilita` (secondo giro). **3 errori** «TypeError: Cannot read properties of undefined (reading 'screen')» nel percorso città → sala → briefing (**C24-03**):

| corsa | percorsi | errori | carico |
|---|---|---|---|
| `c24-briefing.mjs` (6 bracci × 36 episodi + 36 per le foto ingrandite) | 252 | 2 (braccio C51A01 a 412; foto a scala 3) | alto (circa 20) |
| `N=10 RATE=4 c24-screen.mjs` (e01, e15, processore rallentato 4×) | 20 | 0 | medio |
| `N=15 SCALA=3 c24-screen.mjs` (e01…e06, 360) | 90 | **1** | medio (circa 15) |
| `N=15 LARG=412x915 c24-screen.mjs` | 90 | 0 | medio |
| `N=20 SCALA=3 c24-screen.mjs` | 120 | 0 | basso (circa 5) |
| `N=40 SCALA=3 c24-screen.mjs` | 240 | 0 | basso |
| **totale** | **812** | **3** | |

  Pila (corsa `N=15 SCALA=3`): `get screen` (Application di Pixi, `assets/sfondo-*.js`) ← `h` in `assets/StratoCitta-*.js` ← funzioni di React del rendering. FATTO (codice): `Disegno` di `StratoCitta` legge `app.screen` nel valore iniziale di `useState` e in `aggiorna` (`src/resa/mappa/StratoCitta.tsx:17,20`); lo stesso schema è in `StratoPixi.tsx:29,32`; Pixi definisce `get screen(){return this.renderer.screen}` (testo del pacchetto nella build). In tutti i 812 percorsi il briefing è stato raggiunto (percorsi non completati 0). IPOTESI: `Disegno` viene disegnato quando l'Application non ha (ancora o più) il renderer, durante il passaggio dalla città alla sala con la macchina lenta. Effetto visibile per il giocatore: **non posso confermarlo** (nelle due corse con la foto dopo l'errore l'errore non è comparso).

## Braccio rosso

- `C51A01` (`c24-briefing.mjs`): avatar al posto della figura in 432/432 passi, stessa altezza: la sonda distingue i bracci (figura 42×42 contro avatar 45×45 ruotato).
- `C51O01` (`c24-orologio.mjs`): bollino 0/1485.
- `C50C01`, `C50G01`, `C50S01` (`c24-c21.mjs`): stadio di e15/e27 accanto ai gemellati; 21/21 chiamate di nuovo tifo/scontro; e31 offerta «gente» anche con `testimone=nessuno`.
- `C53D01` (`c24-cortei.mjs`): colore del corteo cambiato 13/13. `__NO_C32D01` è il braccio di confronto che isola il corteo della chiamata.
- `C53N01` (`c24-citta.mjs`): nomi coperti 14/36, 13/36, 13/36. `C49E01` (`c24-c21.mjs` parte D): e30 ed e17 di nuovo grigie.
- C24-06 col rosso `C53N01` (`ROSSO=C53N01 CARICAMENTI=10 node coordination/sonde/c23-citta.mjs`): 0/10 contro 5/10 del verde a 412 (nota in fondo alla tabella dei rilievi).

## Rilievi nuovi (per gravità)

Metro del C-022 e del C-023: «alta» = contraddizione misurata al 100% di una situazione dell'episodio sull'oggetto stesso della decisione del PO, o forma che non si riconosce in uno stato frequente; «media» = sotto 16 px o sotto soglia in stati rari (una volta per episodio), o difetto misurato che non blocca; «bassa» = il resto.

| id | gravità | asse | riproduzione | misura | foto | ipotesi di causa |
|---|---|---|---|---|---|---|
| C24-01 | media | PO-078, D-118/D-122, C22-01 | briefing di qualsiasi episodio, qualsiasi larghezza | figura 42×42; riquadro di chi chiama 16,0×12,7 px; glifo 8,2–10,3 px (mediana 10,1) in 432/432 passi; ritaglio sul terzo destro del disegno (x 140-320 di 320). GIUDIZIO: a 1× il glifo non si riconosce (più piccolo del 12,4 px di C22-01), il luogo si capisce solo per curva, acqua, industria | `briefing-360-e01-1.jpg`, `figure-briefing-foglio-360x3.png`, `figura-*.png` | FATTO: la vignetta della chiamata 320×180 ridotta a 42 px di altezza (scala 0,23) con `xMaxYMid slice` (`Briefing.tsx:19`, `stile-c18.css:51-52`); riquadro 76×60 unità (`vignette-chiamata.tsx:48`). Media: briefing una volta per episodio |
| C24-02 | media | C23-02, D-119 | città a 360 o 375, stagione 1, tocco su e02 | 16/36 nomi più vicini al disco di un altro episodio che al proprio (rosso C53N01: 2/36); distanza massima 55 px (e02, e14); a 412 1/36 | `360-citta-e02-lontano.jpg`, `360-citta-e06-lontano.jpg`, `375-citta-e18-lontano.jpg` | FATTO: `LONTANO = 0` (`etichette.ts:13`), il costo non pesa la distanza (`:141-144`); la scelta è indicata come del PO nel rapporto della sviluppatrice ma non c'è in DECISIONI né in BACKLOG |
| C24-03 | media | regressioni, 0 errori di console | percorso città → sala → briefing ripetuto, macchina carica | 3 errori «reading 'screen'» in 812 percorsi (2/252 e 1/90 con carico alto o medio, 0/470 con carico basso); percorsi non completati 0 | — | FATTO: `app.screen` letto in `useState` e in `aggiorna` (`StratoCitta.tsx:17,20`; uguale in `StratoPixi.tsx:29,32`); IPOTESI: Application senza renderer durante il cambio di schermata. Effetto visibile: non posso confermarlo |
| C24-04 | media | PO-085, D-120 | qualsiasi chiamata, per esempio e28 cronista_voci, e01 striscione | bollino e «Urgente!» uguali in 495/495 chiamate; 82 senza evento sul settore; dati: 40 senza settore, 43 senza eventi, 69 con pressione 1-2, 5 con pressione 7 | `orologio-360-e01-corteo_partito.jpg`, `orologio-360-e18-telefonata.jpg` | FATTO: `timbro="Urgente!"` e `urgenza` costanti (`Ondata.tsx:49`); nessun campo di urgenza in `Chiamata` (`tipi.ts:35`). GIUDIZIO: coerente con «solo grafica» di D-120, non con l'urgenza della chiamata |
| C24-05 | bassa | D-122, documenti | qualsiasi chiamata | bollino nella metà destra del fumetto 0/1485 (D-122: «in alto a destra»); copre fino al 23% dell'avatar e al 20% del suo glifo; commenti «accanto al timbro»; figura del briefing «78×44» in `Briefing.tsx:17` e D-118, misurata 42×42 | `orologio-375-e07-quaranta_pulmini.jpg` | FATTO: `stile-c18.css:59` (`top`/`left` −12 px), motivo in `:56-57`; testi non aggiornati in `DECISIONI.md:129,133`, `Fumetto.tsx:54`, `stile-c18.css:53` |
| C24-06 | bassa | D-119, C20-03 | città a 412 con tutti gli episodi conclusi, arrivo (e36 acceso) | il nome di e36 si sposta fra 150 e 1500 ms in 5/10 caricamenti (carico basso), 1/10 (carico alto); C-023: 0/10; da due righe a una, 43 px a sinistra | — | FATTO MISURATO: col rosso C53N01 0/10, quindi viene dalla correzione C23-02. IPOTESI sul meccanismo: il primo posto è calcolato prima che le stelline di e36 abbiano la misura finale, ora che sono ostacoli (`etichette.ts:114-118`) |
| C24-07 | bassa | PO-102, realismo | e30 ondate 2-4 | `data-folla` `arrivo|strada_cinderwick>entra` nelle ondate 2, 3, 4; i testi dicono «dallo stadio verso il municipio», «niente partita» | `c23-03-412x2-e30-o2.jpg` | FATTO: verso e spalti decisi solo da deflusso e partita (`folla.ts:30-34`); GIUDIZIO sul verso visibile solo col movimento |

**Nota C24-06, rosso C53N01** (FATTO MISURATO, `ROSSO=C53N01 CARICAMENTI=10 node coordination/sonde/c23-citta.mjs`, carico medio 2,6): nome all'arrivo che si sposta **0/10** a 360, 375 e 412 (verde nelle stesse condizioni: 0/10, 0/10, **5/10**). Lo spostamento di e36 a 412 viene quindi dalla correzione C23-02; sopra stelline e dischi di altri 0 anche col rosso.

## Ritiri e note di metodo

- **Carico:** vedi in cima. C24-03 e C24-06 dipendono dal carico in versi opposti (C24-03 compare col carico, C24-06 più spesso senza): li riporto con le due misure.
- **Chiamate raggiunte:** 495/498 con 20 semi (mancano e06 favore_impresa, e06 risultato_favore, e36 conti_procura); il C-023 ne raggiungeva 498 con 200 semi. Le tre mancanti restano fuori dalle misure 2 e 4 (non le ho aperte).
- **Pixel:** soglia ±14 per canale; il secondario Cinderwick #1a1a1a coincide col nero della mappa, quindi il colore dominante del corteo è calcolato sul primario. Foto con «riduci movimento»: cortei fermi.
- **Foto delle partite:** tenute solo quelle a 360 (170) per non appesantire il repository; le misure sono su tutte e tre le larghezze.
- **c24-orologio, prova sotto la barra:** non ha trovato barre fisse in cima alla chiamata (la barra fissa è in basso), quindi 0 provati: non è una misura del bollino sopra la barra.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c24-comune.mjs` | parti comuni: server di dist/, Chromium, stati delle chiamate, apertura di una chiamata e del briefing | (importata dalle altre) |
| `c24-briefing.mjs` | PO-078: figura del briefing, altezza, scorrimento, righe del nome, glifo di chi chiama, foto | `node coordination/sonde/c24-briefing.mjs . docs/foto/c24` · `EP=` `LARGHEZZE=` `USCITA=` |
| `c24-orologio.mjs` | PO-085: posto del bollino, avatar coperto, testi sotto, altezze contro il rosso, gruppo dell'evento | `node coordination/sonde/c24-orologio.mjs . docs/foto/c24` · `SEMI=` `EP=` `LARGHEZZE=` `USCITA=` |
| `c24-cortei.mjs` | C23-01 su tutte le chiamate con corteo, sui pixel, tre bracci | `node coordination/sonde/c24-cortei.mjs . docs/foto/c24` · `SEMI=` `EP=` `TOL=` `USCITA=` |
| `c24-citta.mjs` | C23-02: nome coperto (copia di `c23-citta-copre.mjs`) e distanza dal proprio disco | `node coordination/sonde/c24-citta.mjs . docs/foto/c24` · `ROSSO=C53N01` |
| `c24-c21.mjs` | C21-04 (A), C21-05/06 (B), C21-09 (C), C23-03 e verso dei cortei (D) | `PARTE=A,B,C,D node coordination/sonde/c24-c21.mjs . docs/foto/c24` |
| `c24-c22.mjs` | misure dei rilievi C-022 ancora aperti | `node coordination/sonde/c24-c22.mjs . docs/foto/c24` |
| `c24-screen.mjs` | riproduzione dell'errore «reading 'screen'» | `N=40 SCALA=3 EP=e01,e02 node coordination/sonde/c24-screen.mjs .` · `RATE=` `LARG=` `FOTO=` |
| `c24-partite.mjs` | e01, e07, e13, e15, e28 dall'interfaccia (copia di `c23-partite.mjs`) | `node coordination/sonde/c24-partite.mjs . docs/foto/c24` |
| `c23-citta.mjs`, `c17-affidabilita.mjs`, `tools/bot.mjs`, `tools/offline.mjs` | nomi in città su 10 caricamenti, ripresa ed export/import, blocchi, offline | come nel C-023 (`c17-affidabilita` con `SALTA_A1=1`) |
