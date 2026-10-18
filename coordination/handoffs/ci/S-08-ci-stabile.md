# S-08 · CI stabile (PO-128) · rapporto

Ramo: `claude/valmora-ci-stabile` (da `claude/valmora-l1-setup-schema-xdrbx7` 36d0c0f). Commit: a2b3f00 (correzione, guardiano, C, D, B), 31953e3 (braccio rosso solo con 412), f1a3831 (sonda con font in
ritardo); il resto è rapporto e STABILITA.json.
Non toccati: `src/resa/mappa/etichette.ts` (solo istrumentato in locale per la misura, poi ripristinato e non committato), `data/`.

## A. «nome tocca il bordo della mappa» (città, 412 px): causa e correzione

### FATTO MISURATO
1. **Il controllo non era cieco né sbagliato: il difetto c'è nel gioco ed è intermittente.** Foto CI 412-81-citta.png
   (run 39042326369, artifact 12106309349): il nome «Il mercato del sabato» esce a destra (riquadro fino al bordo, «SABAT»
   tagliato). Lo stesso stato giocato in locale col browser della CI dà il nome dentro (margine destro 13,2 px).
2. **Riproduzione deterministica senza WebGL.** Stato salvato della città 81 a 412 (catturato dal giro foto),
   `tools/sonda-citta.mjs` con `SONDA_ARGS="--disable-webgl --disable-3d-apis"`, Chrome Headless Shell 156.0.8078.4:
   **10 rossi su 10**, nome a `destra`, larghezza `--nome-max·0,5` (45 px), `--nome-dx` 4,72 px, margine destro **−0,52 px**.
   Con WebGL (stesso browser, stesso stato): 0 rossi su 15 (3 + 6 con CPU rallentata ×4 + 6 con ×10).
3. **Meccanismo** (registrazione temporanea in `disponiNomeCitta`, poi tolta): i 3 calcoli del posto del nome avvengono tutti
   con la scena ancora in entrata, fattore di scala k = 0,924; nessun calcolo dopo. La scena entra con framer-motion
   **scala 0,9 e rotazione −2°** (`src/resa/schermate/Scena.tsx:54`), e `reducedMotion: 'reduce'` di Playwright non la
   ferma. La correzione di C47N01 (`etichette.ts:164-171`) divide per la scala ma non tiene conto della rotazione: il
   riquadro calcolato «dentro» (destra 374,4 su 380) a scena ferma è a 380,5. Basta un ridimensionamento della finestra
   (che rifà il calcolo a scena ferma) per avere il posto giusto: dx 0, larghezza 0,4, dentro.
4. **Perché in CI a volte sì e a volte no.** Con WebGL, `pronta` arriva quando Pixi è pronto
   (`MappaCitta.tsx:105`, `setPronta`) e il nuovo disegno rifà il calcolo: se arriva **dopo** la fine dell'animazione il nome
   va a posto, se arriva **prima** resta il posto calcolato durante l'entrata. La foto CI rossa coincide con la mappa WebGL
   (0 pixel diversi su 310×280 px fuori dal nome, contro 20 706 con la mappa HTML) e il nome ha lo spostamento del
   calcolo «stantio» (riquadro 5 px a destra, come dx 4,72). Senza WebGL nessun disegno arriva dopo: rosso sempre.
5. Il controllo di `tools/foto.mjs:126` misura dopo la fine dell'animazione anche oggi (sonda: 10/10 misure con
   `transform: none`); l'attesa in più che avevo provato (C128A01) non mostrava rosso nel braccio rosso → **tolta**
   (guardiano cieco), vedi «Non verificato».

### Correzione (gioco, minima)
`src/resa/mappa/MappaCitta.tsx:66-80`: dopo ogni calcolo, se la mappa è ancora trasformata (rettangolo a schermo ≠
misura d'impaginazione), si guarda a ogni fotogramma e a ingresso finito si rifà il calcolo una volta. Rosso
`globalThis.__NO_C128N01`: comportamento di prima. Nessuna soglia cambiata.

| Misura (Headless Shell 156, 412×800, stato città 81, senza WebGL) | prove | rossi |
|---|---|---|
| prima (= rosso C128N01) | 10 | 10 |
| dopo | 10 | 0 |
| dopo, con WebGL | 15 | 0 |

### Guardiano permanente
`tools/foto-c128.mjs`: il giro foto salva lo stato di ogni città che mostra un nome (`tools/foto.mjs:111`, solo 412 per
D-123); il passo `foto` (`tools/passi-grafica.mjs`) li rigioca in un browser **senza WebGL**, dove il difetto è
deterministico, e controlla 5 px dal bordo (stessa soglia di R06). Braccio rosso in `bracci-rossi-grafica`: col rosso
C128N01 deve trovare «tocca il bordo». Misura sugli stati 53/66/81: verde `[]`; rosso: 2 su 3 fuori («Ospiti numerosi»
3,1 px dall'alto, «Il mercato del sabato» −0,5 px a destra). Costo ~2,5 s.
Errore mio corretto in 31953e3: a 375 da solo (CI per larghezza) non ci sono nomi e il braccio rosso si dichiarava cieco
(job «grafica (375)» rosso su a2b3f00): ora il braccio vale quando il giro comprende 412.

## A2. e14 o1 a 360×760 (rosso CI della 0.38.0), C128-02, richiesta della principale del 18/10 (D-169)

### FATTO MISURATO
1. Su 91ea00e, `tools/sonda-schieramento.mjs` (stato del bot attento, bozza nel salvataggio, stessa attesa di
   `foto-schieramenti.mjs`): Chrome Headless Shell 156.0.8078.4 **9 rossi su 9** (4 coi caratteri rallentati di 1,5 s,
   5 senza; anche ridisponendo a scena ferma con un cambio di misura); Chromium 141 locale **0 su 4**. Quindi non dipende
   dai tempi né dai font: f7f39e9 non poteva bastare.
2. Misure dei nomi: Biglietteria 84,0 px (156) contro 82,5 (141), Tornelli 63,0 contro 61,3; mappa 328×328 in entrambi.
3. Costi (registro temporaneo in `disponiEtichette`, poi tolto): in 141 biglietteria sceglie sopra-sx/sotto (costo
   64 961); in 156 lo stesso posto ha il riquadro del nome a **4,69 px** dal bordo sinistro (in 141 6,16): 0,31 px dentro il
   margine di 5 px, che pesa VERA·1e4 per px² (circa 5,1 milioni) e vince destra/sotto (4 235 601) con la pastiglia «1» sopra
   Tornelli (160 px²) e due nomi rubati: è il rosso della CI, identico.

### Correzione (D-169)
`src/resa/mappa/etichette.ts` (passo «nome e unità insieme»): un nome che entra nel margine di poco (fino a un ottavo
di disco, 5,5 px a 44 px) si sposta verso l'interno con `--nome-dx/--nome-dy` e il costo si conta già spostato, come
nella città (C20-03); all'inizio di ogni disposizione gli spostamenti si azzerano (C33-04). `src/resa/stile-c18.css:11`:
la translate vale per `.mappa .settore-nome` (prima solo la città). Rosso `globalThis.__NO_C128E01`. Margine e soglie
invariati.

| e14 o1, 360×760, sonda | prove | rossi |
|---|---|---|
| Chrome 156, rosso C128E01 (= prima) | 10 | 10 |
| Chrome 156, dopo | 10 | 0 |
| Chrome 156, caratteri +1,5 s, dopo | 3 | 0 |
| Chromium 141, dopo | 3 | 0 |

Guardiano: `foto-schieramenti.mjs` (rubati e pastiglie sui nomi, soglia 0) in CI col browser 156; braccio rosso
dimostrato con la sonda (C128E01 → 10/10). In locale col Chromium 141 il guardiano non vede questo caso: per
riprodurlo `VALMORA_CHROME=$(node tools/chrome-ci.mjs)`.
CI su 9e892c29 (run 39083225279): **7 job verdi, 1 tentativo ciascuno** (grafica 360 27 min 42 s, 375 5 min 51 s,
412 6 min 19 s): nessun altro episodio peggiorato col browser della CI.

## B. Il browser della CI in locale
FATTO: la rete lo consente. `node tools/chrome-ci.mjs` scarica (una volta, ~13 s) Chrome Headless Shell **156.0.8078.4**
(playwright v1248, la stessa versione del log CI) in `~/.cache/valmora-browser-ci` e stampa il percorso. Uso:
`VALMORA_CHROME=$(node tools/chrome-ci.mjs) node tools/catena.mjs grafica` (foto e offline leggono già `VALMORA_CHROME`).
Il Chromium di /opt/pw-browsers è 141.0.7390.37. Per S-01: `VALMORA_LARGHEZZE=360` limita il giro a una larghezza.
`tools/sonda-citta.mjs [prove] [larghezza]` ripete la città con `SONDA_STATO` (salvataggio), `SONDA_ARGS`, `SONDA_CPU`.

## C. Tempo del job grafica
FATTO (log GitHub):
| run | commit | catena grafica | foto |
|---|---|---|---|
| 39024883983 (verde) | 78b865e | 29 min 33 s (10:26:49→10:56:22) | 1 tentativo |
| 39042326369 (rosso) | d2fdf88 | 85 min 30 s (14:49:11→16:14:41) | **3 tentativi** |

**Il tempo non è cresciuto per passo: è triplicato perché il passo `foto` rosso si rifà 3 volte** (`tools/catena.mjs`,
fino a 2 nuovi tentativi), ~28 min ciascuno. Prima la catena non registrava i tempi: ora ogni passo ha `secondi` (uno per
tentativo) in STABILITA.json e a schermo.

Riduzione applicata senza togliere copertura: `grafica` in matrice per larghezza (`VALMORA_LARGHEZZE`, i giri delle
larghezze sono indipendenti in `giraFoto`), artifact `foto-360/375/412`; il giro registra `larghezze` per non passare
per completo. Misure CI su 31953e3: grafica (412) catena 6 min 19 s, grafica (375) 4 min 25 s; su a2b3f00:
412 foto 187,5 s + bracci-rossi-grafica 66 s; 375 foto 271,9 s; **360 foto 1395 / 1423,9 / 1420,2 s** (3 tentativi, rosso
noto e14 o1). Quindi del vecchio giro foto (~28 min) circa 23 min sono la sola 360 (che fa anche il giro 360×760).
**Effetto vero della matrice: job grafica verde da ~29,5 a ~24 min (−20%), non a un terzo.** Il grosso del guadagno viene
da A: niente più 3 tentativi da ~28 min per un rosso instabile (85 min → ~24).
Proposta non applicata (da decidere): dividere la 360 in due job (360×800 e 360×760) se i due giri sono indipendenti
in `tools/foto.mjs`; non l'ho verificato.
Costo: 3 runner invece di 1 (minuti fatturati circa uguali, più ~1 min di preparazione per job).

## D. Mail inutili
`.github/workflows/catene.yml`: job `cambi` (`tools/cambi-gioco.mjs`) confronta `github.event.before` (push) o la base
della PR con il commit; se TUTTI i file cambiati sono `docs/**`, `coordination/**` o `STABILITA.json`, `logica`,
`grafica` e `apk` sono saltati (esito «skipped», niente mail). `governo` gira sempre (controlla proprio i documenti, 1 s).
Ramo nuovo (`before` = 000…) o diff non calcolabile: gira tutto. Scelta tecnica dichiarata: filtro a livello di job
invece di `paths-ignore` sul workflow, perché `paths-ignore` avrebbe tolto anche `governo` sui commit di documenti.
D-115 non cambia: il commit della versione tocca `src/versione.ts`.
Effetto misurato (diff col genitore, `node tools/cambi-gioco.mjs <h>~1 <h>`): degli 8 commit delle mail rosse citate,
7 avrebbero saltato le catene pesanti (d2fdf88, 38701b4, 6fb89d0, 182d2e4, 0b97acc, 4b2d899, 1c03044); 4d309bd
(`src/versione.ts`) gira. Sugli ultimi 69 commit in prima linea del ramo principale: 38 senza gioco, 31 con.

## E. Catene
- CI su 31953e3 (run 39067814016): cambi, governo, logica, apk, grafica (375) 4 min 25 s, grafica (412) 6 min 19 s
  **verdi**; grafica (360) **rossa SOLO per il difetto noto e14 o1 ereditato** (360×760, «mediatore@biglietteria sul nome
  Tornelli», pastiglie 160 px²; 3 tentativi 1492 / 1482,7 / 1485,9 s), corretto da S-01 in f7f39e9 sul ramo resa-v2, non
  toccato qui. Stesso esito su a2b3f00 (run 39065332991), più il mio rosso del braccio a 375 corretto in 31953e3.
- Prova dal vivo di D: run 39071532401 (bb41479, solo coordination/) e 39071708481 (5570f14, solo STABILITA.json e
  docs/): governo e cambi verdi, **logica, grafica, apk «skipped»**, run «success» (niente mail).
- Catena completa locale (Chromium 141 di /opt/pw-browsers), 3 giri sulla stessa build:
  giro 1 su 31953e3 VERDE (20:41→21:27 UTC, foto 2290 s, 1 tentativo); giro 2 VERDE (21:27→22:12), marcato «con modifiche
  non committate» perché il rapporto era ancora un file non tracciato in coordination/ (codice e build identici);
  giro 3 su 7944a22 (stesso codice di gioco e strumenti di 31953e3: in mezzo solo rapporto, sonda e STABILITA) VERDE
  (22:42→23:25, foto 2171 s, 1 tentativo). Un primo giro 3 (22:12) è stato **interrotto** al passo foto dal limite di 2 h
  del mio ciclo in background (non un rosso della catena) e rifatto da capo. **Esito: 3/3 verdi, nessun passo instabile.**

## IPOTESI della principale verificata: font in ritardo (classe di e14 o1)?
NO. Sonda, stato città 81, WebGL, `.woff2` ritardati di 1500 ms (`SONDA_FONT_MS=1500`), misura a font caricati: 0/5 rossi
con la correzione e **0/5 anche col rosso C128N01**. Col font in ritardo il nome compare dopo l'ingresso e va a posto da solo.

## Non verificato
- **Perché Pixi a volte è pronto prima della fine dell'animazione sul runner** (velocità del runner, SwiftShader): IPOTESI,
  non misurata; la correzione non dipende da questo.
- La correzione C47N01 di `etichette.ts` ignora la rotazione d'ingresso: non toccata (file escluso dal compito); con
  C128-01 il calcolo finale è sempre a scena ferma. Se S-01 lo ritiene, si può proporre di misurare con
  `offsetLeft/offsetTop` invece che con i rettangoli trasformati.
- Le altre misure geometriche di `tools/foto.mjs` (scorrimento, altezze, sovrapposizioni) sono fatte dopo opacità 1:
  10/10 misure della sonda erano già a trasformazione finita, ma non ho dimostrato che valga per ogni scena.
- Telefoni Android senza WebGL: il difetto (nome fuori a 412) si vedeva sempre lì; non provato su un dispositivo vero.
