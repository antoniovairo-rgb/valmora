# S-08 · CI stabile (PO-128) · rapporto

Ramo: `claude/valmora-ci-stabile` (da `claude/valmora-l1-setup-schema-xdrbx7` 36d0c0f). Commit: a2b3f00, 31953e3 (+ questo rapporto).
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
- CI su 31953e3 (run 39067814016): cambi, governo, logica, apk, grafica (375), grafica (412) verdi; grafica (360): DA_COMPLETARE
- Catena completa locale: DA_COMPLETARE

## Non verificato
- **Perché Pixi a volte è pronto prima della fine dell'animazione sul runner** (velocità del runner, SwiftShader): IPOTESI,
  non misurata; la correzione non dipende da questo.
- La correzione C47N01 di `etichette.ts` ignora la rotazione d'ingresso: non toccata (file escluso dal compito); con
  C128-01 il calcolo finale è sempre a scena ferma. Se S-01 lo ritiene, si può proporre di misurare con
  `offsetLeft/offsetTop` invece che con i rettangoli trasformati.
- Le altre misure geometriche di `tools/foto.mjs` (scorrimento, altezze, sovrapposizioni) sono fatte dopo opacità 1:
  10/10 misure della sonda erano già a trasformazione finita, ma non ho dimostrato che valga per ogni scena.
- Telefoni Android senza WebGL: il difetto (nome fuori a 412) si vedeva sempre lì; non provato su un dispositivo vero.
