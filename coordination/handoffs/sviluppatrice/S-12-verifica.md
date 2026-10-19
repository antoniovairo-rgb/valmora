# S-12 · verifica delle voci aperte della prima triade (PO-052, PO-053, PO-058, PO-086, PO-114)

Compito di sola misura (D-184): il gioco non è stato toccato. Build: ramo `claude/valmora-verifica-backlog` da `ad0ed88`, `GAME_VERSION` 0.42.0 (`src/versione.ts:328`), `npm ci` + `npx vite build` il 2026-10-19.

Sonde nuove, in `coordination/sonde/` (derivate da `rev-schermate.mjs`, che sulla build attuale non arriva oltre la scelta del genere: si ferma in attesa di «genere» per 8 s, perché ora ci sono la guida e le conferme):
- `s12-altezze.mjs`: partita e01 completa, a ogni scena altezza della pagina (`scrollingElement.scrollHeight`), eccedenza sullo schermo, scorrimento orizzontale e altezza dei blocchi (il «perché»). Con `REV=1` aggiunge le misure della revisione del 2026-10-11 (carattere minimo, tocchi < 44 px, testi tagliati, sovrapposizioni fra testi).
- `s12-c28.mjs`: C28-01/02/09/11 alle 5 risoluzioni di C-028, col mouse.

Uscite grezze in `coordination/handoffs/sviluppatrice/s12/uscite/`, foto in `s12/telefoni/`, `s12/pc/`, `s12/c28/`.

**Limiti di misura (valgono per tutte le tabelle):**
- un solo episodio, e01; il pilota sceglie lo schieramento del bot attento e, nelle chiamate, la prima risposta attiva;
- una schermata si conta una volta per stato distinto; i campioni per tipo cambiano fra un giro e l'altro (es. «risposta» 11/11 in un giro, 2/2 in un altro), perché la scena «risposta» dura poco;
- del verbale ho misurato solo il primo passo (il pilota si ferma lì): gli altri passi sono **Non verificati**;
- il giro tablet/PC è partito prima che rendessi più fine la chiave dei campioni, quindi lì sala e briefing hanno 1 campione.

---

## PO-052 e PO-058 · overflow e scorrimenti

**FATTO MISURATO.** Comando: `node coordination/sonde/s12-altezze.mjs . <foto>` (VP predefinite 360×640, 360×760, 375×667, 412×830, 412×915). Uscita: `s12/uscite/telefoni.txt`, exit 0, 0 blocchi, 0 errori di pagina. Lettura: eccedenza in px oltre l'altezza dello schermo; «max, med (scene che scorrono / scene viste)».

| schermata | 360×640 | 360×760 | 375×667 | 412×830 | 412×915 |
|---|---|---|---|---|---|
| titolo | 0 | 0 | 0 | 0 | 0 |
| crediti | 1191 | 1071 | 1107 | 907 | 822 |
| genere | 0 | 0 | 0 | 0 | 0 |
| guida | 0 | 0 | 0 | 0 | 0 |
| città | 133 | 13 | 106 | 1 | 1 |
| sala (3 passi) | max 82, med 38 (3/3) | 0 (0/3) | max 66, med 14 (3/3) | 0 | 0 |
| briefing (4 passi) | max 80, med 78 (4/4) | 0 (0/4) | max 64, med 62 (4/4) | 0 | 0 |
| schieramento | max 53, med 37 (5/5) | 0 (0/5) | max 41, med 25 (5/5) | 0 | 0 |
| chiamata | max 664, med 430 (28/28) | max 544, med 283 (29/29) | max 618, med 407 (28/28) | max 435, med 207 (28/28) | max 350, med 107 (28/29) |
| risposta | max 224, med 222 (5/5) | max 121, med 102 (11/11) | max 212, med 206 (11/11) | max 86, med 61 (12/12) | max 1, med 0 (3/12) |
| chiusura | 95 (2/2) | 0 | 83 (2/2) | 0 | 0 |
| tono (D-143) | 0 | 0 | 0 | 0 | 0 |
| rapporto | max 366, med 322 (3/3) | max 246, med 202 (3/3) | max 330, med 286 (3/3) | max 166, med 160 (3/3) | max 81, med 75 (3/3) |
| verbale (1° passo) | 0 | 0 | 0 | 0 | 0 |

Scorrimento orizzontale: 0 su tutte le scene.

### Perché scorre (blocchi misurati, `telefoni.txt`)

- **Chiamata.** Testata 78 + fiducia 18 + mappa 328 (380 a 412) + messaggio fino a 344 + opzioni fino a 358 px. Caso peggiore, chiamata-2 a 360: pagina 1304 px.
  - La mappa ha la stessa altezza a 640 e a 760 px di schermo: nella chiamata non si stringe con l'altezza.
  - Regola già decisa, D-114: «Chiamata con mappa intera e indicatore "Rispondi ↓": si accetta lo scorrimento (mediana 271 px a 360)» (`docs/governo/DECISIONI.md:125`).
  - Oggi a 360×760 la mediana è 283 px su 29 scene, la massima 544.
- **Risposta.** Mappa 328 + 2 messaggi (69–88 e 142–166) + pulsante 51. Nessuna decisione che la copra.
- **Rapporto.** Mappa 328 + scheda dei settori 322 + «a riposo» + nota + pulsante. Nessuna decisione che lo copra.
- **Crediti.** 10 schede in colonna (scena 1763 px a 360). Nessuna decisione che li copra.
- **Città.** Testata 54 + stagioni 68 + mappa 260 + scheda 295 = 709 px di scena. A 360×760 eccede di 13 px.
  - Il backlog dava «360×760 136→0»: oggi è 13, non 0.
  - IPOTESI: la scheda della città è cresciuta dopo quella misura. Non ho cercato il commit.
- **Sala, briefing, schieramento, chiusura a 360×640 e 375×667.** Mappa 246–328 + passo; eccedenza 14–95 px.
  - Regola D-126 d (`DECISIONI.md:137`): a 375×667 si nascondono le vignette di sala e verbale. Anche così la sala eccede fino a 66 px.
  - Il passo resta comunque ≤ 760 a 360 (sotto).

### Regole già decise, verificate

- **Wizard: passo ≤ 760 px a 360** (S-10, PO-058). FATTO: a 360×760 sala 3/3, briefing 4/4 e primo passo del verbale stanno in 760 px (pagina = 760).
  - Altezza del passo: sala 124–231, briefing 166–185, verbale 493.
  - Gli altri passi del verbale: **Non verificati**.
- **PO-045** (wizard invece della cascata): confermato dalla stessa misura. Sala e briefing a 0 da 360×760 in su; prima erano 538 e 817 (tabella PO-053 sotto).
- **D-126 d**: non ho misurato direttamente se la vignetta è nascosta a 375×667. **Non verificato.** Il guardiano dovrebbe essere in `tools/foto.mjs` (`controllaAltezza`), ma non l'ho eseguito.

### Proposta

- **PO-052: resta**, con questo elenco:
  - (a) città: 13 px a 360×760, 106 a 375×667, 133 a 360×640;
  - (b) a 360×640 e 375×667: sala, briefing, schieramento e chiusura eccedono di 14–95 px. Va deciso se queste due altezze sono nel perimetro: la soglia del wizard parla di 760 a 360;
  - (c) rapporto e risposta scorrono a tutte le altezze, tranne la risposta a 412×915.
- **PO-058: resta.** Le parti decise sono fatte: wizard ≤ 760 e chiamata accettata da D-114.
  - Senza regola né correzione restano rapporto (75–366 px), risposta (fino a 224) e crediti (822–1191).
  - Resta anche la seconda metà della richiesta («la mappa è più grande di quanto serve»): nella chiamata, nella risposta e nel rapporto la mappa ha 328 px a 360 sia a 640 sia a 760 di altezza; solo la città la stringe.
  - Proposta: una decisione del PO su rapporto, risposta e crediti, oppure chiudere PO-058 con D-114 come regola e aprire una voce nuova per rapporto e risposta. Non decido io.

---

## PO-053 · revisione di tutte le schermate, prima e dopo

**FATTO MISURATO.** Comando: `VP=360x760 REV=1 FOTO=0 node coordination/sonde/s12-altezze.mjs . <dir>` e lo stesso con `412x830`. Uscite: `s12/uscite/rev-360x760.txt` e `rev-412x830.txt`, exit 0.
- **Prima:** `docs/revisioni/REVISIONE_SCHERMATE_2026-10-11.md`, sulla build dopo 5df546d.
- **Dopo:** build 0.42.0.
- Le misure sono le stesse (funzione `misuraTutto` copiata da `rev-schermate.mjs`).

### Scorrimento verticale

| schermata | 360×760 prima | 360×760 dopo | 412×830 prima | 412×830 dopo |
|---|---|---|---|---|
| titolo (home) | 122 | **0** | 12 | **0** |
| crediti | 1071 | 1071 (uguale) | 907 | 907 (uguale) |
| genere | 0 | 0 | 0 | 0 |
| città | 0 | **13** | 0 | **1** |
| sala | 538 (1/1) | **0 (0/3)** | 426 | **0 (0/3)** |
| briefing | 817 (4/4) | **0 (0/4)** | 700 (4/4) | **0 (0/4)** |
| schieramento | 0 | 0 (0/5) | 0 | 0 (0/5) |
| chiamata | 437 (13/13) | max 544, med 274 (34/34) | 289 (13/13) | max 435, med 197 (32/32) |
| risposta | 107 (13/13) | max 104 (2/2); altro giro max 121, med 102 (11/11) | 41 (12/13) | max 86, med 70 (8/8) |
| chiusura | 0 | 0 | 0 | 0 |
| rapporto | 188 (3/3) | max 246, med 224 (2/2) | 76 (3/3) | max 166, med 144 (2/2) |
| verbale | 1395 | **0** (1° passo) | 1218 | **0** (1° passo) |
| guida, tono | – | 0 (nuove) | – | 0 (nuove) |

Note sulla tabella:
- «Prima» non dice se 437/289 sono massimi o altro; li ho letti come massimi.
- La chiamata ha più scene di prima (34 contro 13) perché il pilota conta stati distinti, non solo chiamate.
- I testi di e01 sono cambiati dal 11/10, quindi il confronto della chiamata non è a parità di testo.

### Rilievi del 11/10, uno per uno

1. **Scorrimento su sala, briefing, chiamata, risposta, rapporto, verbale, crediti e home a 360.**
   - Risolto: sala, briefing, verbale (1° passo), home.
   - Accettato da D-114: chiamata.
   - Resta: risposta, rapporto, crediti (uguale a prima), città (nuovo, 13 px).
2. **Pulsante fisso sopra il testo** (chiamata, sala).
   - FATTO: in sala e briefing 0 sovrapposizioni.
   - Nella chiamata nessuna sovrapposizione col pulsante «Rispondi».
   - Limite: la misura è solo con la pagina in cima, non a metà scorrimento.
3. **Nomi impilati nello schieramento di e01** («Curva Cinderwick» × «Strada da Cinderwick»).
   - FATTO: nello schieramento nessuna sovrapposizione fra nomi di settore. Restano solo «Le risposte ch…» × «Squadre/Mediatore/Steward», 52–64 px².
   - I nomi dei luoghi sono cambiati (Kiln, Skyfield); il caso originale non esiste più.
   - Nella chiamata invece i nomi della mappa toccano i segni dei settori: «Strada da Kiln» × «▼»/«+⚑» fino a 506 px² a 360, «Curva Skyfield» × «+⚑» 480 px².
   - IPOTESI: sono il nome del settore e i suoi segni di pressione sulla mappa. Non ho guardato le foto una per una.
4. **«Prossima ondata» sopra le righe del rapporto: resta.**
   - Misure: 360×760, «Strada da Skyf…» × «Prossima ondata» 3275 px², «sotto controllo» 2194 px²; 412×830, «Strada da Skyf…» × «Leggi il verbale» 3275 px², «A riposo…» × «Prossima ondata» 3187 px².
   - Prima: fino a 9126 px² a 412.
   - Causa (codice): `.scena .azioni` è `position: sticky` (`src/resa/stile.css:186`). Con la pagina che scorre, il pulsante sta sopra le righe dei settori.
5. **Home a 360, 122 px: risolto**, 0 px a tutte e 5 le altezze.
6. **«Verbale» × «Contenuto a fatica»**: 129 px² a 360 e 197 a 412. È lo stesso falso allarme di prima (etichetta sopra il titolo).

### Nuovi rispetto al 11/10 (FATTO MISURATO, sovrapposizioni geometriche)

- **Versione sopra la lettera delle opzioni.** «v0.42.0» × lettera della risposta («A», «B», «C»): 211–356 px² a 360 (chiamata-26, chiamata-29), 576 px² a 412 (chiamata-12, chiamata-28).
  - La versione sta fissa nel margine sinistro (D-168, `src/resa/stile.css:390`).
  - IPOTESI: si vede solo quando un'opzione passa sotto l'etichetta durante lo scorrimento.
- **«i» dell'ondata (32×32) contata fra i bersagli < 44 px** in tutte le chiamate. Non è un difetto: l'area toccabile è allargata da `::after` (`src/resa/stile-c18.css:25-28`, rosso C44I02). La sonda misura il riquadro visibile, non l'area di tocco.
- **Invariati:** scorrimento orizzontale 0, carattere minimo 12 px, testi tagliati 0.

### Proposta

**PO-053: chiudere la revisione** (ripetuta e confrontata qui). Le correzioni rimaste passano ad altre voci:
- rilievo 1 (risposta, rapporto, crediti, città) → PO-052/PO-058;
- rilievo 4 (pulsante del rapporto sopra le righe) e i due nuovi (nomi della mappa nella chiamata, versione sopra le lettere) → voce o collaudo nuovo, se la principale li vuole tenere.

In alternativa resta aperta solo per il rilievo 4. Decide la principale.

---

## PO-086 · eventi condizionati dalle azioni precedenti

**FATTO MISURATO.**
- Comando: `npx vitest run tests/coerenza-d153.test.ts tests/dopo-scelte.test.ts tests/c34-dati.test.ts tests/opzioni-spiegate.test.ts --reporter=verbose`.
- Esito: 4 file, 28/28 verdi, exit 0. Uscita in `s12/uscite/po086-vitest.txt`.
- Le righe stampate dai test, che includono i bracci rossi interni:
  - «PO-086: scelte forzate 701, contraddizioni viste dopo 0»;
  - «D-153 verde: scelte del registro fatte 285, smentite 0»; «D-153 rosso: smentite 133 in 12/12 voci»;
  - «C37-05 rosso: 6»;
  - «C153A01 rosso: casi muti e28 o4 corteo_capo, e28 o3 gol_mossgarth, e29 o3 ospiti_spaventati, e29 o4 corteo_al_porto, e35 o4 fine_trattativa, e35 o3 barca_ormeggiata, e35 o4 posto_prenotato».

### Guardiani e cosa misurano

| guardiano | cosa misura | braccio rosso |
|---|---|---|
| `tests/dopo-scelte.test.ts:57-65` | per un elenco di casi [episodio, scelta forzata, chiamata/opzione che non deve comparire] la contraddizione non compare; ogni `dopo` punta a dati esistenti in un'ondata precedente o nella stessa | `__NO_PO086` + `__NO_C17R03` (`src/logica/missione.ts:152`) |
| `tests/coerenza-d153.test.ts:109-134` | registro di 12 voci `dopo` di D-153: dati esistenti, partite vere (2 bot × 40 semi) senza smentite, testi riscritti senza la frase vecchia, tutti i 36 episodi giocati senza ondate senza uscita | `__NO_C153D01` (dati di prima) |
| `tests/coerenza-d153.test.ts:160-162` | C37-05, tutti i 36 episodi: un'opzione che manda un numero di unità o «il mediatore» la impegna o dice perché no | testi di prima: 6 casi |
| `tests/opzioni-spiegate.test.ts:53-88` | C35-02, tutti i 36 episodi: la risposta rimasta è spiegata (variante o altre disattivate) | `__NO_C153A01` |
| `tests/c34-dati.test.ts` | casi puntuali e35, e21, e02, e13/e17/e35 (verbali di fallimento) | misure non cieche nei test stessi |

### Copre la richiesta?

- **FATTO** (da `coordination/handoffs/sviluppatrice/S-03-D153.md:191-200` e dal merge 535e4da): la scansione dei 36 episodi è stata fatta e integrata. I casi trovati sono corretti e protetti.
- **FATTO**, limite dichiarato da S-03 (`S-03-D153.md:200`): il guardiano protegge i casi trovati e la struttura, ma «non trova da solo una contraddizione nuova scritta in un testo».
- **FATTO**: per decisione della principale restano fuori dal guardiano 27 opzioni che nominano le unità in forma generica (`S-03-D153.md:98`, `:235`).
- **FATTO**: in `BACKLOG.md:92` PO-086 dice ancora «sessione S-03 in corso», ma S-03 è integrata (535e4da, D-159 `DECISIONI.md:170`). La descrizione è vecchia.

**Proposta: chiudere PO-086** come FATTO, citando D-153/D-159, 535e4da e i guardiani sopra. Il limite (nessun rilevatore generale di contraddizioni nei testi) va scritto nella voce. Il controllo dei testi nuovi resta alla lettura dei collaudi.

---

## PO-114 · tablet e PC (C28-01, C28-02, C28-09, C28-11, D-132)

### Nel codice (file:riga)

- **C28-01** (la tela segue il contenitore): `src/resa/mappa/schermo.ts:36-43`, `seguiContenitore`, un ResizeObserver con rosso C86T01. Usato in `src/resa/mappa/StratoPixi.tsx:34` e `src/resa/mappa/StratoCitta.tsx:21`.
- **C28-02** (opzione non accesa sotto il puntatore fermo): `src/resa/schermate/Ondata.tsx:48-57` (stato `fermo`, rosso C87H01) e `:108` (`data-fermo`); CSS in `src/resa/stile.css:62`.
- **C28-09** (fuoco):
  - fuoco perso riportato sulla scena: `src/resa/schermate/Scena.tsx:24-36`, rosso C88F01, poi affinato da C32-01;
  - contorno del gioco su casa, «i», «?», pastiglie, indicatore: `src/resa/stile.css:37-38`, rosso C89C01.
- **C28-11** (versione vicino alla colonna): `src/resa/stile.css:382-384`, rosso C90V01. Superata da C32-06 (`:386-387`) e D-168 (`:389-390`): la versione ora sta subito fuori dalla colonna, a sinistra.
- Annotazione di rilascio: `src/versione.ts:207`.

### Misure alle 5 risoluzioni di C-028

Le 5 risoluzioni sono 768×1024, 1024×768, 1280×800, 1366×768 e 1920×1080 (`docs/governo/COLLAUDI.md:101`). **FATTO MISURATO.** Comando: `node coordination/sonde/s12-c28.mjs . <foto>`, exit 0, uscita `s12/uscite/c28.txt`.

- **C28-01:** tela della mappa 442×442 in un interno di 442×442, sia nello schieramento sia nella chiamata, 5/5 risoluzioni. Collaudo C-028: 442×330 in 442×442 a 1366.
- **C28-11:** la versione sta fuori dalla colonna, a sinistra, con 16 px di distacco, 5/5. Valori: 768×1024 x 128–144 (colonna 160–608); 1024×768 256–272 (288–736); 1280×800 384–400 (416–864); 1366×768 427–443 (459–907); 1920×1080 704–720 (736–1184).
- **C28-09:**
  - dopo la scelta da tastiera il fuoco resta su `button.opzione`, non sul body (5/5);
  - il primo Tab arriva a un `button.pulsante` con `outline solid rgb(224, 17, 95)` (il magenta del gioco), non l'anello del browser (5/5);
  - **ritiro una misura:** la colonna «dopo "continua"» del file grezzo non vale. Nella foto `c28-1366x768-chiamata.png` la scena è ancora la prima chiamata con la risposta scelta, quindi il «continua» non era ancora comparso quando la sonda ha guardato. Fuoco dopo «continua»: **Non verificato**;
  - non ho misurato la parte «contorno del gioco» su casa, «?», pastiglie e indicatore: **Non verificato** qui. Il guardiano `controllaLargo` (`tools/foto-c22.mjs:158`) lo controlla a 1366×768; non l'ho eseguito.
- **C28-02**, stesso metodo del guardiano `controllaOpzioneFerma` (`tools/foto-c22.mjs:116`): ripresa da tastiera col puntatore fermo dove sta la prima opzione.
  - 768×1024: «scorta» sotto il puntatore, sfondo bianco (spenta); dopo una mossa del mouse diventa ciano. Comportamento corretto.
  - 1920×1080: spenta, ma resta bianca anche dopo la mossa. IPOTESI non verificata: il movimento di 3 px non ha dato l'evidenza; non ne so la causa.
  - 1024×768, 1280×800, 1366×768: sotto il puntatore non c'era nessuna opzione (dopo la ripresa la pagina non è dove l'avevo misurata). **La misura è cieca: Non verificato** a queste tre risoluzioni.

### Foto

`s12/c28/c28-<risoluzione>-schieramento.png` e `-chiamata.png` (10 foto, schermo visibile). Altezze di pagina a tablet/PC in `s12/uscite/pc.txt`, foto della chiamata e del rapporto in `s12/pc/`.

**FATTO MISURATO** (`pc.txt`): scorrimento sì, scorrimento orizzontale 0. A 1024×768 e 1366×768 la chiamata eccede fino a 409 px (mediana 287), il rapporto fino a 277, i crediti 812. A 1920×1080 la chiamata eccede fino a 45 px.

### Proposta

- **PO-114: chiudere la parte D-132.** C28-01 e C28-11 sono misurati verdi a 5/5 risoluzioni e C28-09 in parte; i quattro interventi sono nel codice coi loro rossi.
- Restano da far misurare a una catena o alla collaudatrice:
  - C28-02 a 1024×768, 1280×800 e 1366×768 (la mia sonda era cieca lì) e il caso anomalo a 1920×1080;
  - C28-09 dopo «continua».
- La domanda del PO («fruibile e totalmente giocabile su tablet e PC») ha già la misura di C-028: 36/36 episodi, 0 blocchi a 5 risoluzioni. Io non l'ho rifatta sulla 0.42.0: **Non verificato** su tutti i 36 episodi. Ho giocato solo e01, completo a 5/5 risoluzioni, senza blocchi.

---

## Non verificato (elenco)

- Passi del verbale oltre il primo, a tutte le risoluzioni.
- D-126 d (vignetta nascosta a 375×667) misurata direttamente.
- Episodi diversi da e01, per tutte le altezze.
- Sovrapposizioni a metà scorrimento (la sonda misura con la pagina in cima).
- C28-02 a 1024×768, 1280×800 e 1366×768; la causa del caso a 1920×1080.
- C28-09: il fuoco dopo «continua» e il contorno su casa, «?», pastiglie e indicatore.
- PO-114 sui 36 episodi alla 0.42.0.
- Causa dei 13 px della città a 360×760 (quale commit l'ha portata).
