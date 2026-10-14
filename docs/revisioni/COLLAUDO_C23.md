# Collaudo C-023 — 0.17.0: ritiro di una sola unità (PO-054), persone a pallini (PO-103), nomi in città (D-119, C20-03), cortei grigi e club sull'evento (C21-01/02/03), rilievi aperti del C-021, regressioni

- **Build collaudata:** main 8c560a6 (rilascio 2545fec), GAME_VERSION 0.17.0 (`src/versione.ts:124`). Ricostruita in locale con `npm ci` e `npx vite build`.
- **Ramo:** claude/valmora-collaudo-c23, creato da main 8c560a6. Sola lettura sul codice di gioco.
- **Data:** 2026-10-14.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader); funzioni di `src/logica` importate in Node.
- **Sonde nuove:** `coordination/sonde/c23-*.mjs` (tabella in fondo). Rilanciate quelle già su main: `c21-dati.mjs`, `c21-stadio.mjs`, `c17-affidabilita.mjs`, `tools/bot.mjs`, `tools/offline.mjs`.
- **Foto:** `docs/foto/c23/` (finestra 360×760, 375×667, 412×915). Nomi: `po054-<larghezza>-<episodio>-{prima,ritiro1,annulla}[-rosso].jpg`; `<larghezza>-<episodio>-<chiamata>.jpg` (chiamata aperta); `412x2-<episodio>-<chiamata>-mappa.jpg` (sola mappa, scala 2); `vignetta-<episodio>-<chiamata>[-rosso].png` (sola vignetta, scala 3); `<larghezza>-citta-<episodio>-{dopo,coperto}[-rosso].jpg`; `gioco-<larghezza>-<episodio>-<scena>.jpg` (partite giocate dall'interfaccia). Il collaudo grafico C-022 (icone e immagini) non è ripetuto.

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **LETTURA** (testo copiato dai dati, chiave tra parentesi) · **GIUDIZIO** e **IPOTESI** marcati.

## Riepilogo

| verifica | esito |
|---|---|
| 1. PO-054 ritiro singolo | **CHIUSO**: 48/48 prove come atteso (8 episodi × 2 risorse × 3 larghezze): un tocco toglie una unità, «Annulla» la rimette, la bozza salvata segue; rosso C46R01 0/12 |
| 2. PO-103 pallini | **CHIUSO**: 0/498 chiamate con omini (testa e busto), pallini come da gruppo 498/498; rosso C48P01 rimette gli omini 4/4 |
| 3. D-119, C20-03 nomi in città | sulle misure chieste **verde**: 0 nomi sopra stelline o dischi di altri episodi, 0 a meno di 5 px dal bordo, posto identico in 10 caricamenti × 36 episodi × 3 larghezze. **Ma** il nome è coperto dalle stelline **del suo stesso episodio**: a 360 «La finale» (e26) è invisibile (100%), «La fuga» (e20) 79%; il riquadro «stretto» di D-119 peggiora e26 ed e20 (**C23-02, alta**) |
| 4. C21-01 neutro grigio | **CHIUSO**: ΔE76 minimo fra i due grigi del neutro e il primario di un club **23,7** (Mossgarth); 0/498 schermate con l'arancio vecchio |
| 5. C21-02, C21-03 club sull'evento e sulla strada | **PARZIALI**: il corteo **dell'ondata** prende il club dell'evento (498/498 come la regola), ma il corteo **della chiamata** sulla sua strada non lo guarda: in e28 «le auto del Mossgarth» compaiono persone arancio Cinderwick, in e13, e15, e06 ed e07 persone grigie sopra quelle col club; 9 chiamate, guardiano cieco (**C23-01, alta**) |
| 6. Rilievi aperti del C-021 | C21-04, C21-05, C21-06, C21-09 **ancora presenti** (attesi: non sono in questa release); C21-07 e C21-10 **ancora presenti** |
| 7. Usabilità e realismo | e01, e07, e15, e28 giocati dall'interfaccia (24 partite, 1206 schermate): 0 testi irraggiungibili, 0 versioni sopra un comando, «Rispondi» porta la prima opzione intera 205/205; zona di tocco della pastiglia 44×44 |
| 8. Regressioni | **0 blocchi su 49 308 partite**; **0 errori di console** in tutte le sonde sulla build verde; offline verde; ripresa, indietro, «Riparti», export/import ok |

Rilievi nuovi: **2 alti, 0 medi, 2 bassi** (tabella in fondo).

## 1. PO-054: ritiro di una sola unità

**Codice (FATTO):** il tocco sulla pastiglia `[data-presenza="r@s"]` chiama `onTogli` (`src/resa/mappa/Mappa.tsx:137-138`), che toglie una unità: `Math.max(0, … - 1)`; rosso `C46R01` le toglie tutte (`src/resa/App.tsx:238`). Ogni mossa passa da `cambiaBozza`, che mette lo stato precedente nella storia di «Annulla» (`App.tsx:65-67`).

**Interfaccia (FATTO MISURATO,** `node coordination/sonde/c23-po054.mjs . docs/foto/c23`**):** episodi e01, e07, e04, e13, e15, e23, e28, e34, ondata 1, a 360, 375 e 412; per ogni risorsa non fissa con almeno 2 unità (squadre, steward) si mettono 3 unità sullo stesso settore con tocchi veri (touchscreen), poi si tocca la pastiglia al centro (controllato prima con elementFromPoint che il centro sia la pastiglia):
- dopo il tocco **3 → 2** sulla pastiglia, libere nel vassoio **+1**, bozza nel salvataggio **2**: 48/48;
- «Annulla» → **3**: 48/48;
- ritiro fino a zero 2 → 1 → 0 (la pastiglia sparisce), poi tre «Annulla» 1 → 2 → 3: 48/48;
- errori di console 0.
- **Braccio rosso** (`ROSSO=C46R01 EP=e01,e07`): 3 → **0** al primo tocco, libere +3, bozza 0; «Annulla» → 3. **0/12** come atteso: la sonda vede il difetto.
- Zona di tocco (`node coordination/sonde/c23-po054-zona.mjs .`, e01, due pastiglie affiancate su curva_cinderwick): pastiglia 34×24 px, zona toccabile **44×44** (1936 punti su 1936) per ciascuna, a tutte e tre le larghezze.
- Foto: `po054-<360|375|412>-e01-{prima,ritiro1,annulla}.jpg`, idem e07; rosso `po054-*-rosso.jpg`.
- GIUDIZIO (usabilità): il gesto è scritto solo nell'aiuto «?» («Tocca un segnalino sulla mappa per ritirare una sola unità.», `src/resa/schermate/Schieramento.tsx`, riquadro `data-aiuto`); la pastiglia ha l'etichetta accessibile «ritira … da …» (`Mappa.tsx:138`). Non lo conto come rilievo.

## 2. PO-103: persone a pallini piatti nelle vignette

**Codice (FATTO):** `Persona` disegna un cerchio piatto `data-figura="pallino"`; l'omino di prima (`data-figura="omino"`, testa, busto e, per il tifo, braccia) torna solo col rosso `C48P01` (`src/resa/vignette-evento.tsx:29-41`). Usata nei gruppi gente (7), tifo (5), corteo (4), biglietti (4) (`vignette-evento.tsx:46-66`).

**Interfaccia (FATTO MISURATO,** `SEMI=200 node coordination/sonde/c23-grafica.mjs . docs/foto/c23 <uscita.json>`**):** 7308 partite col motore, **498/498 chiamate** aperte a 360: omini **0/498**; chiamate con pallini 376 (= gente 157 + tifo 117 + corteo 87 + biglietti 15); numero di pallini uguale al gruppo **498/498**; errori 0.
- Vignette ingrandite (`node coordination/sonde/c23-vignette.mjs`, 412, scala 3): e09 pullman_fermi 7 pallini, e34 commissione_schieramento 5, e15 mille 4, e02 tornelli_falsi 4, e18 telefonata 0 (scontro); omini 0, braccia 0. Foto `vignetta-*.png`.
- **Rosso** `ROSSO=C48P01`: omini 7, 5 (con 5 braccia), 4, 4 e pallini 0: la sonda vede il difetto. Foto `vignetta-*-rosso.png`.
- Fuori da PO-103: il vice in alcune vignette è un busto a fumetto con la testa (`src/resa/vignette-chiamata.tsx:45`, D-114); è un personaggio, non la folla. Non lo conto.
- Leggibilità dei pallini: vedi **C23-04** (bassa).

## 3. D-119 e C20-03: nomi degli episodi sulla mappa della città

**Codice (FATTO):** il posto del nome si calcola in coordinate d'impaginazione (rosso `C47N01`), si ricalcola a ogni carattere caricato (`C47N02`), e se serve il riquadro si stringe (classe `stretto`, interlinea 1, margine 1 px) senza scendere sotto `--testo-mini` 12 px (`C48N01`) (`src/resa/mappa/etichette.ts:96-138`, `src/resa/stile-c18.css:49`). Gli ostacoli sono i dischi e le stelline **degli altri** episodi: `filter((x) => x !== s)` (`etichette.ts:110`).

**Misure chieste (FATTO MISURATO,** `node coordination/sonde/c23-citta.mjs . docs/foto/c23`**, movimento non ridotto, 10 caricamenti completi per larghezza, 36 episodi per caricamento, misura 500 ms dopo il tocco):**

| larghezza | misure | sopra stelline di altri | sopra dischi di altri | a meno di 5 px dal bordo | bordo minimo | posto diverso fra i caricamenti | nome all'arrivo che si sposta (150→1500 ms) | carattere |
|---|---|---|---|---|---|---|---|---|
| 360 | 360 | 0 | 0 | 0 | 5,5 px | 0/36 (dispersione 0,0 px) | 0/10 | 12 px |
| 375 | 360 | 0 | 0 | 0 | 5,5 px | 0/36 (0,0 px) | 0/10 | 12 px |
| 412 | 360 | 0 | 0 | 0 | 6,5 px | 0/36 (0,0 px) | 0/10 | 12 px |

Riquadro «stretto» usato: 16 episodi a 360, 15 a 375, 2 a 412. Errori di console 0. Rispetto al C-021 (2/36 sopra stelline a 360 e a 375) il residuo C20-03 come era misurato è **chiuso**.

**Ma il nome è coperto dal suo stesso episodio (C23-02).** Nella foto `360-citta-e05-dopo.jpg` il nome di e05 tocca il proprio disco; la misura di sopra non lo vede perché guarda solo gli altri episodi. Misura nuova (`node coordination/sonde/c23-citta-copre.mjs . docs/foto/c23`): griglia di punti ogni 2 px dentro il riquadro del nome, elementFromPoint con `pointer-events:auto` forzato su tutta la mappa; punto coperto se in cima c'è un elemento fuori dal nome.

| larghezza | nomi coperti per più del 3% | peggiori (verde) | stessi col rosso C48N01 (senza riquadro stretto) |
|---|---|---|---|
| 360 | **17/36** | e26 «La finale» **100%**, e20 «La fuga» **79,2%**, e02 «Ospiti numerosi» 43,9%, e14 «Biglietti doppi» 43,9%, e04 28,6% | 16/36: e26 45,1%, e02 45,1%, e20 3,6% |
| 375 | 14/36 | e26 67,7%, e02 43,9%, e14 43,9% | 14/36: e26 67,7%, e02 45,1%, e20 2,7% |
| 412 | 13/36 | e28 «La trappola» 40,2%, e07 34,5%, e02 32,0% | 13/36: e02 32,0% |

In tutti i casi ciò che copre è dell'episodio stesso: le stelline (`stelle piccole` e le loro icone SVG) e, per pochi punti, il disco. Foto: `360-citta-e26-coperto.jpg` (il nome «La finale» non si vede), `360-citta-e26-coperto-rosso.jpg` (rosso C48N01: se ne vede una parte), `360-citta-e20-coperto.jpg`, `360-citta-e02-coperto.jpg`, `412-citta-e28-coperto.jpg`. Errori di console 0 in tre corse (verde, `C48N01`, `C47N01,C47N02,C48N01`).
- **Ritiro di misura:** la prima versione di `c23-citta-copre.mjs` dava 100% su 36/36 a tutte le larghezze perché il nome ha `pointer-events:none` ed elementFromPoint lo salta: era cieca. Ritirata; i numeri sopra sono della versione corretta.

## 4. C21-01: il neutro dei cortei è grigio

**Codice (FATTO):** il neutro è la coppia `--mappa-folla-2` / `--mappa-folla-3` (#c9c2b4 / #9a958c), rosso `C49C01` l'arancio di prima (`src/resa/mappa/folla.ts:37`, `src/resa/token.css:70-71`); usata sia per i cortei dell'ondata (`src/resa/mappa/sfondo.ts:251-252`) sia per quello della chiamata (`src/resa/mappa/StratoPixi.tsx:159`).

**ΔE76 (FATTO MISURATO,** `node coordination/sonde/c23-dati.mjs delta`**, CIE76 su L\*a\*b\* D65, https://en.wikipedia.org/wiki/Color_difference#CIE76):**

| club (data/club/) | primario | ΔE76 da #c9c2b4 / #9a958c | secondario | ΔE76 |
|---|---|---|---|---|
| calderholt_rovers | #1e7b4a | 52,2 / 44,4 | #f2c230 | 65,7 / 70,7 |
| cinderwick_united | #ff6a13 | 82,1 / 82,4 | #1a1a1a | 69,8 / 52,9 |
| larkspire_athletic | #2fa7ff | 61,9 / 58,3 | #ffffff | 22,8 / 38,5 |
| mossgarth_town | #546e7a | 38,6 / **23,7** | #c0ca33 | 64,5 / 68,9 |
| ollerbrook_town | #00897b | 45,3 / 37,1 | #cfd8dc | **13,3** / 25,5 |
| quillhaven_albion | #1b2a6b | 77,9 / 64,4 | #d62839 | 77,6 / 73,2 |
| saltmere_wanderers | #5d4037 | 49,9 / 34,1 | #e9c46a | 41,8 / 48,0 |

Minimo sul primario **23,7 ≥ 20**: requisito rispettato (il vecchio arancio era a 7,9 dal Cinderwick). GIUDIZIO: il margine più stretto è col Mossgarth (23,7) e, sul solo secondario, l'Ollerbrook (#cfd8dc a 13,3 dal grigio chiaro); il requisito riguarda il primario, non lo conto come rilievo.

**Interfaccia (FATTO MISURATO,** `c23-grafica.mjs`**):** `#ff7a1a` in `data-colori-cortei` **0/498**; 55/262 schermate di chiamata con gente in strada hanno almeno una strada neutra grigia (e06 viale_concerto ondata 4, e09 tangenziale, e11 e e17 strada_cinderwick, e13 viale_concerto e parcheggi, e17 piazza_municipio, e30 viale_stazione e strada_cinderwick, e35 corso_centro). Pixel (`c23-colori-ui.mjs`): e09 pullman_fermi, corteo della chiamata in tangenziale = +361/+253 px dei due grigi, nessun arancio. Foto `412x2-e09-pullman_fermi-mappa.jpg`.

## 5. C21-02 e C21-03: club sull'evento e sulla strada

**Codice (FATTO):** il corteo dell'ondata prende il club del primo evento della strada che ce l'ha (`src/resa/mappa/folla.ts:25-31`, rosso `C49E01`), poi club della strada, curva omonima, neutro (`StratoPixi.tsx:76-78`, `sfondo.ts:122`). Dati 0.17.0: club sugli eventi e06 corteo_piazza (Cinderwick), e07 benvenuto7 e pareggio7 (Larkspire), e13 viale13b (Rovers), e15 accoglienza e corteo_unito (Cinderwick), corteo_ritorno15 (Ollerbrook), e28 auto_ospiti (Mossgarth); club sulle strade e07 viale_stazione (Saltmere), e23 parcheggi (Quillhaven) (`git diff aeaa914 2545fec -- data/missioni`).

**Ma il corteo della chiamata no (C23-01, FATTO):** quando una chiamata parla di una strada, sulla strada passa un secondo corteo (40 persone, `src/resa/mappa/dinamica.ts:22-30`) coi colori `coloriDin`, che sono `animati.coloriViali` (`StratoPixi.tsx:98`, usati a `StratoPixi.tsx:159`): club della strada, curva omonima, neutro, **mai il club dell'evento**. `data-colori-cortei` scrive solo i colori dei cortei dell'ondata (`StratoPixi.tsx:90`) e il guardiano `controllaColoriCortei` legge quell'attributo, per di più nello schieramento, dove il corteo della chiamata non c'è (`tools/foto-c17.mjs:187-199`, chiamato da `tools/foto.mjs:223`).

**Dati (FATTO MISURATO,** `node coordination/sonde/c23-dati.mjs dinamica`**):** 9 chiamate in cui i due cortei sulla stessa strada hanno colori diversi:

| chiamata | strada | corteo dell'ondata | corteo della chiamata |
|---|---|---|---|
| e28 o1 ospiti_in_auto | strada_cinderwick | Mossgarth (evento) | **Cinderwick** (curva omonima) |
| e13 o4 corteo_rovers | viale_concerto | Rovers (evento) | grigio neutro |
| e15 o1 fratelli, o2 mille | viale_stazione | Cinderwick (evento) | grigio neutro |
| e15 o4 fondo_viale | viale_stazione | Ollerbrook (evento) | grigio neutro |
| e06 o1 corteo_cinderwick | viale_concerto | Cinderwick (evento) | grigio neutro |
| e07 o2 coro_imparato, o3 pareggio_casa, immagine_club | strada_larkspire | Larkspire (evento) | grigio neutro |

**Pixel (FATTO MISURATO,** `node coordination/sonde/c23-colori-ui.mjs . docs/foto/c23`**):** chiamata aperta a 412, scala 2, riduci movimento (cortei fermi), PNG della sola mappa, pixel entro ±14 per canale dai colori di ogni club e dei due grigi; due bracci: normale e `__NO_C32D01` (niente corteo della chiamata). Differenza = corteo della chiamata:
- **e28 ospiti_in_auto** (LETTURA «Strada da Cinderwick: le auto del Mossgarth cercano parcheggio sotto le case della curva.», e28.ch.ospiti_in_auto): corteo della chiamata **+305 px arancio Cinderwick #ff6a13, +201 px nero #1a1a1a**; Mossgarth −83/−23 (coperti). Nella schermata convivono 180+134 px Mossgarth e l'arancio Cinderwick: `data-colori-cortei` dice solo `strada_cinderwick=#546e7a`. Foto `412x2-e28-ospiti_in_auto-mappa.jpg`, `gioco-360-e28-chiamata-ospiti_in_auto.jpg`.
- e13 corteo_rovers: +260/+173 px grigi sopra i Rovers (360/229 px). Foto `412x2-e13-corteo_rovers-mappa.jpg`.
- e15 fratelli +277/+162 grigi, mille +350/+232 grigi (Cinderwick #ff6a13 solo 124 px), fondo_viale +248/+144 grigi. Foto `412x2-e15-*-mappa.jpg`.
- e06 corteo_cinderwick +348/+296 grigi; e07 coro_imparato +324/+166, pareggio_casa +242/+193 grigi sopra il Larkspire.
- Controlli coerenti: e09 a_piedi +133/+83 Larkspire; e23 in_tondo +477/+211 Quillhaven; e07 foto_ricordo +558/+196 Saltmere.
- Errori di console 0.

GIUDIZIO: sono esattamente i casi della correzione C21-02/C21-03 e della segnalazione del PO (PO-102: colori delle persone non coerenti col racconto). Nella schermata della chiamata, la sola in cui il giocatore legge il testo accanto alla mappa, e28 mostra ancora «colori del Cinderwick» per le auto del Mossgarth e gli altri mostrano metà gente grigia.

**Lettura strada per strada** (`node coordination/sonde/c23-dati.mjs colori`: per ogni strada di ogni episodio e OGNI ondata, eventi, colori del corteo dell'ondata e di quello della chiamata, briefing con settore, testo d'ondata `.i`, chiamate). Casi chiesti:
- **e28 ondata 1** strada_cinderwick: corteo dell'ondata Mossgarth, coerente con LETTURA sopra; corteo della chiamata Cinderwick: **C23-01**. **Ondata 4**: corteo `deflusso_casa` Cinderwick (curva omonima), LETTURA «In rete: la curva Cinderwick annuncia un corteo «per il capo» dopo la partita.» (e28.ch.corteo_capo): **coerente**.
- **e13 ondata 4** viale_concerto: Rovers, LETTURA «I ragazzi vogliono andare al concerto cantando, tutti insieme.» (e13.ch.corteo_rovers, fonte club_ospite): coerente per l'ondata, grigio per la chiamata (C23-01). Ondata 1 neutra: LETTURA «sciarpe, sedie pieghevoli e auto, tutti in mezzo» (e13.ch.viale_pieno): coerente. e13 parcheggi neutra (auto del concerto): coerente.
- **e15** viale_stazione: ondata 1 Cinderwick (LETTURA «Il Fabbro aspetta gli amici di Ollerbrook all'uscita della stazione», e15.ch.fratelli; GIUDIZIO: in strada ci sono tutti e due, accettabile); ondata 2 Cinderwick («Curva Cinderwick e gemellati … Mille persone, un solo colore.», e15.ch.mille): coerente; ondata 4 Ollerbrook (LETTURA «per i gemellati è ora di tornare a casa», e15 ondata4 `.i`): coerente. In tutte e tre il corteo della chiamata è grigio (C23-01).
- **e06** viale_concerto: ondata 1 Cinderwick («curva Cinderwick in corteo verso la piazza», e06.ch.corteo_cinderwick): coerente per l'ondata, grigio per la chiamata; ondata 4 neutra (stadio e concerto insieme): coerente.
- **e07** strada_larkspire: ondate 2 e 3 Larkspire (gruppo del benvenuto): coerenti per l'ondata, grigie per le chiamate; viale_stazione Saltmere (club della strada; LETTURA «i Saltmere dal viale alla strada da Larkspire», e07.ch.foto_ricordo): coerente, anche per la chiamata (+558 px Saltmere).
- **e23** parcheggi: Quillhaven (club della strada) in ondata 1, 2, 4 (LETTURA «Tre pullman del Quillhaven girano in tondo cercando posto.», e23.ch.in_tondo): **coerente**; casello Quillhaven: coerente.
- **e09** tangenziale: neutra grigia, volutamente (LETTURA «Nessuno ha la sciarpa», e09.ch.lite_coda): coerente con la regola; nessun arancio (sopra).
- Ricerca automatica sulle altre strade (nomi di club nei testi dell'ondata contro i colori disegnati) e lettura dei casi trovati: oltre ai casi sopra, **e30 strada_cinderwick** e **e17 strada_cinderwick** (**C23-03, bassa**, GIUDIZIO): grigie, ma LETTURA «Il giorno dopo, niente partita: la curva si raduna allo stadio per il corteo al municipio.» (e30 ondata1 `.i`), «la curva resta in strada» (e30 ondata4 `.i`); e17 ondata 1 raduno_strada con briefing (falso) «la curva ha accettato la sanzione. Nessun raduno previsto.» (ufficio_sicurezza_cinderwick). Nel C-021 avevo giudicato e17 ed e30 coerenti («corteo di lavoratori, fiaccolata»): rileggendo ogni ondata, in e30 il corteo è della curva. Resta un giudizio, non una misura.

## 6. Rilievi ancora aperti del C-021

| voce | esito | misura |
|---|---|---|
| C21-04 spalti con tre curve | **presente** (atteso) | `EP=e15,e27 ONDATE=1 node coordination/sonde/c21-stadio.mjs . docs/foto/c23`: foto `412x2-e15-o1-mappa.jpg`, stadio fra settore dei gemellati e curva Cinderwick, spalti senza arancio, curva ospiti fuori; codice invariato (`src/resa/mappa/sfondo.ts:72-79`) |
| C21-05 cerimonia → tifo | **presente** (atteso) | 10/10 chiamate con evento `cerimonia` disegnate «tifo» (e26 lista_ospiti, cori_tribuna, foto_coppa; e31 comando_vuole, costruttore_saluta, segreteria_chiede; e34 commissione_schieramento, fiducia_comando, osservatore, uscita_commissione): `c21-dati.mjs json` incrociato con l'uscita di `c23-grafica.mjs`; `cerimonia: 'tifo'` in `src/resa/vignette-evento.tsx:11`. Foto `vignetta-e34-commissione_schieramento.png` |
| C21-06 minaccia/lite/faida → scontro | **presente** (atteso) | 11 chiamate «scontro»: e18 telefonata, lo_conosco, via_fonderie, cappucci, con_o_senza; e14 seduti, ospiti_sbagliati; e21 nuovo_capo, bottigliette, striscione_sgombero, stanotte_sgombero (le contraddizioni lette nel C-021 erano 9 di queste); `vignette-evento.tsx:14` |
| C21-09 evento condizionato | **presente** (atteso) | `c23-vignette.mjs`: e31 offerta con `testimone=nessuno` → vignetta «gente» (7 pallini), mentre l'unico evento del settore ha `"se": {"var": "testimone", "uguale": "esposto"}` (`data/missioni/e31.json`, ondata 3); `gruppoEvento` non guarda `e.se` (`vignette-evento.tsx:22-27`) |
| C21-07 veicoli disegnati come persone | **presente** | le 12 chiamate «arrivo/folla» nominate nel C-021 (e09 furgone_coinvolto, pullman_fermi, passaggio; e23 traslochi, camion_targa, imbarco; e26 pullman_sparsi, pullman_sconfitti, carosello; e34 pullman_quillhaven; e07 quaranta_pulmini; e28 ospiti_in_auto) sono ancora «gente» nell'interfaccia; tabella dei tipi invariata (`vignette-evento.tsx:10`) |
| C21-10 silenzi | **presente** | «nessuno» 83/498 = 40 chiamate senza settore + 43 su un settore senza eventi in quell'ondata, come nel C-021 (e01 striscione: foto `360-e01-striscione.jpg`) |

## 7. Usabilità e realismo dall'interfaccia

**FATTO MISURATO** (`node coordination/sonde/c23-partite.mjs . docs/foto/c23`, copia di `c18-grafica.mjs`): e01, e07, e15, e28 avviati dalla mappa della città («Rigioca»), giocati con il piano del bot attento e del peggiore, a 360, 375 e 412: **24 partite** fino al verbale, **1206 schermate** misurate a inizio e fondo pagina:
- versione presente 1206/1206, sopra un comando 0, fuori dalla finestra a fondo pagina 0;
- testi coperti da elementi fissi **a fondo pagina 0** (a inizio pagina il testo passa sotto la barra fissa e si raggiunge scorrendo);
- chiamate 288; «Rispondi» in 205 (360: 94/96, 375: 96/96, 412: 15/96); dopo il tocco la prima opzione è intera 205/205, coperta 0; «Rispondi» sopra il testo 0;
- errori di console 0.

GIUDIZIO (lettura delle foto `gioco-*`):
- e28 a 360 (`gioco-360-e28-chiamata-ospiti_in_auto.jpg`): il testo parla delle auto del Mossgarth, sulla strada si vedono puntini verdi e arancio (C23-01) e la vignetta mostra persone, non auto (C21-07).
- e15 (`gioco-360-e15-chiamata-fratelli.jpg`) ed e07 (`gioco-360-e07-risposta-quaranta_pulmini.jpg`): testi coerenti con i settori; in e07 il segno «▼ +⚑» della risposta copre per 1,8 s il nome «Parcheggi» (PO-085, temporaneo; lo segnalo senza farne un rilievo).
- A 360 la mappa dello schieramento ha in basso una fascia scura senza città (`gioco-360-e15-schieramento-1.jpg`); c'era già nella 0.16.0 (`docs/foto/c21/regr-360-schieramento-1.jpg`): lo lascio al collaudo grafico C-022.
- Verbale di e28 perso (`gioco-360-e28-persa-verbale-1.jpg`): «Episodio fallito: va rigiocato.» e «Ricomincia l'episodio» leggibili; violenza fuori campo.

## 8. Regressioni

- **Blocchi** (FATTO MISURATO, ogni partita chiusa con un esito):
  - `node tools/bot.mjs 200`: 156 righe strategia × episodio (tutte le stagioni, anche le combinazioni delle variabili di storia), «blocchi 0/200» in **156/156** (31 200 partite), più 300 partite per episodio «scelte a caso con schieramento attento» (10 800); «chiamate mai comparse []» in 36/36;
  - `c23-grafica.mjs`: 7308 partite (36 episodi × 3 strategie fisse + 200 semi casuali, metà con variabili di partenza a caso), 498/498 chiamate raggiunte, 0 blocchi;
  - totale: **49 308 partite, 0 blocchi**, più le 24 partite dall'interfaccia (punto 7).
- **Offline:** `node tools/offline.mjs dist` → «offline: verde (O1-O4)».
- **Ripresa, indietro, Riparti, export/import** (`node coordination/sonde/c17-affidabilita.mjs .`): verbale con «Riparti dall'ondata 2»; ricarica → «Riprendi» → verbale; indietro sul verbale resta sul verbale; «Riparti» → schieramento dell'ondata 2 e il bot attento vince («contenuto»); ricarica sulla risposta, sul rapporto, a schieramento non confermato (6 pastiglie prima e dopo) ok; esporta → cancella → importa uguale; errori 0. I tempi della stessa sonda sono stati presi con altre sonde in corso sulla macchina: non li uso.
- **Errori di console sulla build verde: 0** in c23-po054, c23-colori-ui, c23-citta, c23-citta-copre, c23-grafica (498 chiamate a 360 più le foto a 375 e 412), c23-vignette, c23-partite, c17-affidabilita. `c21-stadio.mjs` e `c23-po054-zona.mjs` non raccolgono gli errori.

## Braccio rosso

- `ROSSO=C46R01 EP=e01,e07 node coordination/sonde/c23-po054.mjs . docs/foto/c23`: 0/12 come atteso (ritira tutte).
- `ROSSO=C48P01 node coordination/sonde/c23-vignette.mjs …`: omini 4/4, pallini 0.
- `ROSSO=C48N01` e `ROSSO=C47N01,C47N02,C48N01 node coordination/sonde/c23-citta-copre.mjs`: vedi tabella del punto 3. Non ho rifatto i 10 caricamenti di `c23-citta.mjs` col rosso.
- `__NO_C32D01` in `c23-colori-ui.mjs`: è il braccio di confronto che isola il corteo della chiamata, non un rosso di un guardiano.
- **Cieco:** il guardiano `controllaColoriCortei` (`tools/foto-c17.mjs:187-199`) non può vedere C23-01: legge `data-colori-cortei`, che non contiene il corteo della chiamata, e lo legge nello schieramento.

## Rilievi nuovi (per gravità)

Metro come nel C-021: «alta» = contraddizione misurata al 100% di una situazione dell'episodio, sull'oggetto stesso della segnalazione o decisione del PO.

| id | gravità | asse | riproduzione | misura | foto | ipotesi di causa |
|---|---|---|---|---|---|---|
| C23-01 | **alta** | PO-102, C21-02/03 | e28 ondata 1, chiamata «le auto del Mossgarth cercano parcheggio» (ospiti_in_auto). Anche e13 corteo_rovers, e15 fratelli/mille/fondo_viale, e06 corteo_cinderwick, e07 coro_imparato/pareggio_casa/immagine_club | 9/9 chiamate col corteo della chiamata di colori diversi dal corteo dell'ondata sulla stessa strada; e28: +305/+201 px Cinderwick nella schermata delle auto del Mossgarth; negli altri 8 casi +242…+350 px di grigio neutro sopra il club. `data-colori-cortei` non lo dice | `412x2-e28-ospiti_in_auto-mappa.jpg`, `gioco-360-e28-chiamata-ospiti_in_auto.jpg`, `412x2-e13-corteo_rovers-mappa.jpg`, `412x2-e15-mille-mappa.jpg` | FATTO: il corteo della chiamata usa `coloriDin = animati.coloriViali` (`src/resa/mappa/StratoPixi.tsx:98`, `:159`), senza il club dell'evento che vale solo per i cortei dell'ondata (`StratoPixi.tsx:76-78`); guardiano sull'attributo, nello schieramento (`tools/foto-c17.mjs:187-199`) |
| C23-02 | **alta** | D-119, C20-03 | mappa della città a 360, stagione 3, tocco su e26: il nome «La finale» non si vede | nome coperto dalle stelline del proprio episodio: a 360 e26 **100%**, e20 79,2%, e02 e e14 43,9%; 17/36 nomi oltre il 3% a 360, 14/36 a 375, 13/36 a 412. Rosso C48N01: e26 45,1%, e20 3,6% (il riquadro stretto peggiora questi due) | `360-citta-e26-coperto.jpg`, `360-citta-e26-coperto-rosso.jpg`, `360-citta-e20-coperto.jpg`, `412-citta-e28-coperto.jpg` | FATTO: gli ostacoli del nome sono solo gli altri episodi (`src/resa/mappa/etichette.ts:110`); IPOTESI: le stelline dell'episodio si dipingono sopra il nome (lo dice elementFromPoint, non ho letto l'ordine dei livelli nel CSS). In parte preesistente (16/36 a 360 anche col rosso) |
| C23-03 | bassa | PO-102 dati | e30 ondate 2-4 strada_cinderwick (corteo della curva al municipio, fiaccolata); e17 ondata 1 raduno_strada | 2 strade grigie dove i testi d'ondata parlano della curva (LETTURA nel punto 5) | — | GIUDIZIO, diverso da quello del C-021; nessun club sugli eventi `silenzio_strada`, `coda_corteo`, `fiaccole` (`data/missioni/e30.json`), `raduno_strada` (`data/missioni/e17.json`) |
| C23-04 | bassa | PO-103 leggibilità | qualsiasi chiamata su una strada con gente, corteo o tifo (87 chiamate: strada/corteo 52, strada/gente 32, strada/tifo 3) | pallini `--nero` #111111 su `--mappa-asfalto` #2a2d33: contrasto **1,37:1** (formula WCAG 2.1, https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio; per gli elementi grafici WCAG chiede 3:1, https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html); vignetta larga circa 119 px a 412, pallino di circa 4 px | `vignetta-e15-mille.png` | FATTO: `Persona` senza contorno (`vignette-evento.tsx:40-41`), sfondo strada `v-asfalto` (`src/resa/vignette-chiamata.tsx:27`). GIUDIZIO: anche gli omini di prima erano neri; è leggibilità grafica, vicina al censimento C-022 |

## Ritiri e note di metodo

- **Ritirata** la prima misura di `c23-citta-copre.mjs` (100% su 36/36): cieca, vedi punto 3.
- **Giudizio cambiato** rispetto al C-021 su e17 ed e30 strada_cinderwick (C23-03): nel C-021 «coerenti», qui da leggere col PO.
- **c23-grafica**: confronta la pagina con la regola del codice (ora col club dell'evento): dice che la regola è applicata ai cortei dell'ondata (498/498), non vede il corteo della chiamata; per quello c'è la misura sui pixel (`c23-colori-ui.mjs`).
- **Pixel**: soglia ±14 per canale; i pixel del secondario Cinderwick #1a1a1a coincidono col nero del disegno della mappa, quindi conto solo le differenze fra i due bracci, non i totali. Le foto sono con «riduci movimento»: i cortei sono fermi.
- **Concorrenza:** alcune sonde girano insieme (4 processori); nessun esito usa tempi reali.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c23-po054.mjs` | PO-054: ritiro singolo, «Annulla», bozza salvata, foto | `node coordination/sonde/c23-po054.mjs . docs/foto/c23` · `EP=` · `ROSSO=C46R01` |
| `c23-po054-zona.mjs` | zona di tocco delle pastiglie | `node coordination/sonde/c23-po054-zona.mjs .` |
| `c23-grafica.mjs` | 498 chiamate: gruppo della vignetta, pallini/omini (PO-103), colori dei cortei dell'ondata con il club dell'evento | `SEMI=200 node coordination/sonde/c23-grafica.mjs . docs/foto/c23 [uscita.json]` · `FOTO=` · `ROSSO=` |
| `c23-vignette.mjs` | vignette ingrandite, figure nel DOM, variabile `testimone` (C21-09) | `LISTA=e09:pullman_fermi,… node coordination/sonde/c23-vignette.mjs . docs/foto/c23` · `ROSSO=C48P01` |
| `c23-dati.mjs` | ΔE76 (`delta`), strada per strada e ondata per ondata (`colori`), cortei della chiamata diversi da quelli dell'ondata (`dinamica`) | `node coordination/sonde/c23-dati.mjs delta\|colori\|dinamica` |
| `c23-colori-ui.mjs` | colori veri sui pixel della mappa della chiamata, con e senza corteo della chiamata | `node coordination/sonde/c23-colori-ui.mjs . docs/foto/c23` · `LISTA=` · `TOL=` |
| `c23-citta.mjs` | D-119/C20-03: stelline e dischi di altri, bordo, stabilità su N caricamenti | `CARICAMENTI=10 node coordination/sonde/c23-citta.mjs . docs/foto/c23` · `ROSSO=C47N01,C47N02,C48N01` |
| `c23-citta-copre.mjs` | parte del nome coperta da qualunque elemento, compreso il proprio episodio | `node coordination/sonde/c23-citta-copre.mjs . docs/foto/c23` · `ROSSO=C48N01` |
| `c23-partite.mjs` | e01, e07, e15, e28 giocati dall'interfaccia, misure della C-018 | `EP=e01,e07,e15,e28 node coordination/sonde/c23-partite.mjs . docs/foto/c23` |
| `c21-stadio.mjs`, `c21-dati.mjs`, `c17-affidabilita.mjs`, `tools/bot.mjs`, `tools/offline.mjs` | C21-04, liste del C-021, regressioni | come nel C-021 |
