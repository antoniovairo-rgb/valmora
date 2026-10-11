# S-03 – Restyling «graphic novel» e mappa aerea realistica · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, con merge (non rebase) di 01d7fa4. S-02 era già completo e pubblicato
(682ffd2) quando è arrivata la priorità S-03; anche città degli episodi e verbale sono stati portati nello
stile nuovo. Stato: **consegna completa, in attesa del collaudo del PO.**

## Cosa ho fatto

- **Stile C (D-066)** su tutte le schermate: titolo, genere, città, sala, briefing, schieramento, chiamata,
  risposta, chiusura, rapporto, verbale, crediti.
  - giallo `#ffd400` con retino a puntini, nero, magenta, ciano;
  - bordi neri da 3px, ombre piatte;
  - testata con il numero «01» inclinato e il riquadro bianco (sopra la mappa, come nella bozza C2);
  - messaggi radio e battute del vice come fumetti con la punta; avatar quadrati ruotati; timbri «URGENTE!», «IN CORSO», «VERA/FALSA»;
  - opzioni A/B/C con il tasto nero; pulsanti con «scatto» al tocco (si abbassano sull'ombra);
  - avvisi su riquadro pieno: niente testo colorato direttamente sul giallo, per il contrasto.
- **Font locali**: @fontsource/space-grotesk e @fontsource/inter 5.3.0, versioni esatte, OFL 1.1, solo il
  sottoinsieme latino. Nessun CDN. Aggiunti in CREDITI.md e nella schermata Crediti.
- **Mappa aerea al tramonto (D-067)**, portata da docs/stili/mappa-realistica.js:
  - in `src/resa/mappa/sfondo.ts`: asfalto con grana, isolati con tetti, ombre e alberi, auto, viali, piazzale con siepi, stadio con gradinate, curve arancio (sinistra) e azzurro (destra), prato a strisce, tetto, fari, velo serale;
  - lo stadio si mette fra le due curve dei dati e i viali partono dai settori «strada»; una missione senza curve ha solo la città;
  - seme fisso (`creaCaso(7)`), quindi stessa città a ogni avvio;
  - colori solo dai token `--mappa-*`, normalizzati a `#rrggbb` con un canvas, perché il minificatore accorcia i token.
- **Prestazioni (D-006)** in `src/resa/mappa/StratoPixi.tsx`:
  - lo sfondo si disegna UNA volta in un canvas che diventa texture Pixi, e si ridisegna solo se cambiano dimensioni o posizioni dei settori;
  - a ogni fotogramma si muovono solo la folla (1400 particelle, ParticleContainer), il corteo (70 particelle lungo il primo viale) e gli aloni dei settori (sprite colorati, onda gialla sui settori accesi).
- **Città degli episodi** (S-02) nello stesso stile: città dall'alto (fiume, ponti, parco) disegnata una volta.
- **Animazioni**:
  - scene che entrano a molla (scala e rotazione) ed escono di lato;
  - messaggi che «saltano» dentro uno dopo l'altro;
  - unità che **volano** dal vassoio al settore (`src/resa/mappa/Volo.tsx`);
  - aloni che pulsano col colore della tensione, folla che ondeggia, corteo che avanza.

  Con «riduci movimento» restano dissolvenze e un fotogramma fermo.
- Tensione solo a colori (D-055). Bersagli ≥ 44px (punti dei settori 44px, pulsanti e opzioni ≥ 44px).

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto` | 3 larghezze × 35 scene | verde: 0 errori di console, 0 scorrimento, tutti i controlli di S-01/S-02 |
| build di prova + `node tools/foto.mjs out/foto-prova out/dist-prova tests/resa/dati-prova` | 3 larghezze | verde (mappa senza stadio) |
| `npx vitest run` | 95 test | verdi |
| `node tools/fps.mjs dist 5` (nuovo), sala operativa a 360 px, 5 s per prova | 3 prove per riga | CPU 1×: media 59,5, mediana 59,4, min 59,3, max 59,8, dispersione 0,2 fps · CPU rallentata 4× (CDP): media 36,2, mediana 36,4, min 35,2, max 36,9, dispersione 0,7 fps |
| `npx vite build` | | JS iniziale 134,26 KB gzip; StratoPixi 6,40 KB gzip più i pezzi di PixiJS caricati dopo il titolo |

**Gli FPS valgono solo per Chromium headless** (WebGL emulato sulla CPU con SwiftShader, macchina cloud):
NON valgono per un telefono vero. Il rallentamento 4× è un'IPOTESI di telefono economico, non una misura.
Nota: CLAUDE.md dice «le misure contano passi e minuti di gioco, mai fps». Ho misurato gli fps perché la
principale li ha chiesti per il rischio D-006, e li tengo fuori da qualunque guardiano della catena.

## Catena

`node tools/catena.mjs completa` su 265cff5: 3 giri su 3 VERDI, nessun passo ritentato.

## Foto

docs/foto/e01/2026-10-11-stile-c/: 105 foto (17 MB), 35 scene × 360/375/412 px, a 375 px con protagonista donna.
Sono scattate con «riduci movimento»: mappa ferma, nessuna unità in volo.

## Problemi aperti

1. IPOTESI: prestazioni su telefono economico vero non misurate (serve l'APK o il collaudo del PO).
2. La pianta (isolati, fiume) è procedurale e uguale per tutte le missioni; lo stadio compare solo se
   la mappa ha due settori «curva».
3. Le foto non mostrano le animazioni: per vederle serve il gioco aperto (Pages o APK).

## Cosa mi serve

- Il collaudo del PO sullo stile e sulla fluidità al telefono.
