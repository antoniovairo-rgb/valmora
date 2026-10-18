# S-09 · Epilogo (D-161) e passo «Fine stagione» (D-164)

Ramo: `claude/valmora-epilogo`, da `claude/valmora-l1-setup-schema-xdrbx7` @ 4d36988. Origine: P-01 e P-04 di
docs/revisioni/PARTITA_AZ.md. `src/versione.ts` non toccato.

## Cosa cambia

- **Logica pura** `src/logica/epilogo.ts` (86 righe, importa solo da src/logica):
  - `usiDelleVariabili` (righe 23-38): per ogni variabile, quali missioni la impostano (`imposta`/`aggiungi`) e quali la
    leggono (`var`), visitando il JSON delle missioni. Niente elenco «pesa su» scritto a mano.
  - `fineStagione` (righe 57-68): stelle della stagione dal registro, fili già aperti (impostati in una stagione ≤ N),
    divisi in **aperti** (un episodio di una stagione dopo li legge; `pesa_su` = il primo) e **chiusi**.
  - `epilogo` (righe 71-83): le sei scelte di D-100 nominate da D-161 (`rapporto_dessi`, `testimone`, `busta`,
    `pista_cattura`, `fascicolo`, `sospetti_talpa`), carriera dalla prima parte dell'esito migliore dell'ultimo
    episodio (`confermato`/`prorogato`/`sostituito`, altrimenti `null` → testo «ignota»), stelle per stagione e totali.
  - `chiudeStagione` (righe 48-52): vero solo per l'ultimo episodio di una stagione che non è l'ultima → e12, e24.
  - Variabili mancanti completate col valore iniziale dichiarato (`completaVariabili` di aggiornamento.ts).
    **Nessun campo nuovo nel salvataggio**: SAVE_VERSION resta 2, nessuna migrazione.
- **Testi** `data/testi/it/epilogo.json`: un testo per ogni valore di ogni filo (9 fili), carriere, titoli; tutti ≤ 80
  caratteri; persone e luoghi della Bibbia (il Fabbro, Malvasi, Lavezzari, Varrone), nessuna violenza a schermo.
  Il filo `sospetti_talpa` si chiama «I dubbi su Lavezzari» per non svelare la talpa a fine stagione 1.
- **Resa**
  - `src/resa/schermate/Epilogo.tsx`: schermata `epilogo` (carriera, sei scelte, stelle S1/S2/S3/totale, «Alla mappa
    della città») e `PassoFineStagione`.
  - `Verbale.tsx:78-97`: dopo l'ultimo episodio superato «Epilogo» in evidenza + icona mappa; nel verbale di e12/e24
    un ultimo passo «Fine stagione N», poi «Prossimo episodio» apre la stagione nuova.
  - `App.tsx`: schermata `epilogo`; da lì si torna alla città. `Citta.tsx`: «Rileggi l'epilogo» quando l'ultimo
    episodio è superato (nessun soft-lock: l'epilogo resta raggiungibile anche dopo una ricarica).
  - Stile: classe `.fili` in `stile.css` solo con token (`--spazio-1`, `--spazio-3`); il resto riusa `.scheda`,
    `.etichetta`, `.tenue`, `.pulsante`. Fuoco: la scena nuova riceve il fuoco come le altre (D-142, `Scena.tsx`).
- **Interruttori rossi**: `globalThis.__NO_C161E01` (dopo e36 solo «Alla mappa della città», niente «Rileggi»),
  `globalThis.__NO_C164F01` (verbale di e12/e24 senza passo).

## Guardiani e misure (FATTO MISURATO)

1. `tests/epilogo.test.ts` (5 prove, `npx vitest run tests/epilogo.test.ts` → 5 passate):
   - e12, e24 sono gli unici episodi che chiudono una stagione; e36 è l'ultimo.
   - Salvataggio vero della partita A-Z (0.38.0, copiato da `docs/partita-az/partita.json` → `salvataggio_finale`
     in `tests/salvataggi-reali/v2-0.38.0-fine-campagna.json`), caricato come il gioco (migra → adattaAiDati):
     esito e36 `prorogato_procura` → carriera `prorogato`; scelte rispetto/protetto/consegnata/nessuna/procura/3;
     stelle 28/36, 27/36, 28/36, totale 83/108.
   - Fine stagione 1: aperti informatore→e13, presidente→e14, furgone→e13, Fabbro→e20, Lavezzari→e33; fine stagione 2:
     6 aperti, `presidente_incontrato` chiuso (letto per l'ultima volta in e24).
   - Salvataggi vecchi reali (`v1-nuova-partita`, `v1-dopo-ondata-1`, `v2-0.4.0-e02-in-corso`): nessuna eccezione,
     carriera null, sei scelte, cinque fili in stagione 1.
   - Testi: uno per ogni valore, ≤ 80 caratteri; braccio rosso (un testo tolto, uno lungo) → 2 problemi trovati.
2. `tools/foto-epilogo.mjs`, chiamato dal passo `foto` della catena grafica a 360, 375, 412 e 1366 px; parte dal
   salvataggio vero, gioca l'episodio col motore (`pianoAttento`) fino all'ultimo rapporto, poi «Riprendi» → rapporto →
   verbale nel browser. Controlla: passo «Fine stagione N» con stelle e ≥ 1 filo aperto; «Prossimo episodio» apre e13 /
   e25; «Epilogo» → carriera valida, sei scelte nell'ordine, 4 righe di stelle, fuoco nella scena; «Alla mappa della
   città» raggiunto con Tab e aperto con Invio; «Rileggi l'epilogo» in città e ritorno; comandi ≥ 44 px, testi ≥ 12 px,
   nessun «[[chiave]]», nessuno scorrimento orizzontale, nessun errore di console.
   Bracci rossi nel passo `bracci-rossi-grafica`: C161E01 e C164F01 a 360 px devono far fallire il giro.
   - Verde (`node tools/foto-epilogo.mjs … 360,375,412,1366`): «verde», uscita 0.
   - Rosso (`VALMORA_ROSSI=C161E01,C164F01`): 12 problemi, 3 per larghezza: «e12: ultimo passo del verbale senza
     «Fine stagione 1»», «e24: … «Fine stagione 2»», «e36: ultimo passo del verbale senza «Epilogo»». Uscita 1.

## Foto (asset veri, build di questo ramo)

`coordination/handoffs/sviluppatrice/S-09-foto/prima/` (rossi accesi = comportamento di prima) e `…/dopo/`, per
360, 375, 412, 1366: `*-e12-verbale-fine.jpg`, `*-e24-verbale-fine.jpg`, `*-e36-verbale-fine.jpg`; solo in «dopo»
`*-e36-epilogo.jpg`, `*-e36-citta.jpg`.

## Catena completa

FATTO MISURATO (`node tools/catena.mjs completa`, attesa nel turno, uscita in /tmp senza pipe):
- bf7adb0 (solo D-161/D-164): giro 1 VERDE (20:29 → 21:36). Giri 2-3 fermati da me: stavo modificando src per D-165,
  quindi la build non sarebbe stata più quella; non contati.
- **f6b677d** (D-161, D-164, D-165 parte 1, unita la principale a 221541f): **3/3 VERDE**: 21:46 → 22:53, 22:53 → 23:59,
  23:59 → 01:04 (STABILITA in 649a3ae). Circa 66 minuti a giro, quasi tutti nel passo foto.
- Dopo l'unione della principale (1123c81: S-08 città senza WebGL, S-02): tipi ok, `npx vitest run` 53 file / 298 prove
  passate, `foto-epilogo` 360+1366 «verde», `foto-tavole` «verde». Catena completa su 1123c81 non ancora rifatta.

CI «catene»: su bf7adb0 logica, governo e apk verdi; **grafica rossa per il rosso noto ereditato**: passo foto, «e14 o1
centro del tocco mediatore@biglietteria sul nome Tornelli» e «pastiglie sopra i nomi … biglietteria × Tornelli» a 360
(D-143, C27-06), lo stesso di PO-128 corretto da S-01 (f7f39e9 su claude/valmora-resa-v2). Nessun problema dei
guardiani dell'epilogo in CI. Gli altri giri della CI sul ramo erano ancora in corso quando ho scritto.

## Non verificato

- Su un telefono vero (Android/Capacitor): Non posso confermarlo, provato solo in Chromium headless.
- Lettore di schermo: non provato; ho verificato solo fuoco e Tab/Invio.
- Il giro foto rigioca e36 col motore: nella foto l'esito è `confermato` (non `prorogato_procura` della partita A-Z),
  perché il giocatore del motore è diverso da quello della partita; i conti sul salvataggio vero stanno nel test.
- Coordinamento con S-01 (vignetta prima del rapporto, D-143): non ho visto il suo ramo; tocco Verbale.tsx (righe 1-20 e
  78-104) e App.tsx (ramo del verbale e della città). IPOTESI: conflitti di merge piccoli, da risolvere nella principale.

## Scelte per la principale (non decise da me)

1. Testi dell'epilogo: A) tenerli come sono (consigliata, tutti ≤ 80); B) farli rivedere da S-02/S-03 (dati) per il tono.
2. Fili mostrati a fine stagione: A) tutti i 9 fili (consigliata: dice anche quelli di S1); B) solo i sei di D-100.

## Commit

- bf7adb0 epilogo (D-161) e «Fine stagione» (D-164)
- d2ab4d4 tavole di prova D-165, prima prova
- ea23eef D-165 parte 1: fischio dell'ultimo derby
- f6b677d unione della principale; 649a3ae STABILITA 3/3 verde su f6b677d
- 70729b2 D-167 seconda prova delle tavole
- 1123c81 unione della principale (S-08, S-02); giraEpilogo segue VALMORA_LARGHEZZE come foto.mjs

## D-165 (PO-130) · tavole di prova delle parti 2 e 3, per il PO

Ramo di storia: la partita A-Z vera (`tests/salvataggi-reali/v2-0.38.0-fine-campagna.json`): Fabbro «rispetto»,
testimone «protetto», busta «consegnata», 3 dubbi su Lavezzari, fascicolo «procura», carriera «prorogato».
Foto in `coordination/handoffs/sviluppatrice/S-09-tavole-prova/` a 360 e 412 px, protagonista uomo (`360-…`) e donna
(`360-f-…`): una tavola per filo (`*-tavola-fabbro|testimone|busta|talpa|fascicolo.jpg`), il bar (`*-tavola-bar.jpg`) e
la pagina intera (`*-finale-intero.jpg`). Comando: `node tools/foto-tavole.mjs <cartella> 360,412 [f]` → «verde»
(niente errori di console, niente scorrimento orizzontale, nessun testo mancante).
- Disegni: SVG nel codice come le altre vignette (`src/resa/tavole-finale.tsx`, classi `v-*`, stile C), nessun file
  esterno. Testi: `data/testi/it/finale.json` (didascalie ≤ 82 caratteri, ancora senza guardiano).
- Nel gioco **non si vedono**: solo con `globalThis.__PROVA_D165 = true` (Epilogo.tsx). Entrano dopo il sì del PO.
- IPOTESI da far confermare al PO: il Fabbro «dietro il vetro» (in custodia dopo e29); la battuta di chiusura di Malvasi
  «Doppio o niente sulla prossima?» riprende quella del verbale di e01; le didascalie di busta, fascicolo e bar
  riprendono le parole dei verbali di e36 (stessi fatti), non li contraddicono.
- Parte 1 fatta (ea23eef): dal verbale di e36 «Epilogo» apre la scena `fischio` sulla mappa di e36: città vuota
  (folla e cortei spenti, `Mappa.tsx` props `vuota`), settori spenti uno ogni 700 ms (`spenti`), poi la sala al buio
  (`buio`); con la riduzione del movimento tutto spento subito; «Avanti» o Invio salta all'epilogo. Rosso
  `__NO_C165F01` (dritti all'epilogo). Guardiano in `tools/foto-epilogo.mjs`: all'inizio meno settori spenti del totale,
  alla fine tutti e la sala al buio, poi Invio porta all'epilogo; col rosso «manca il fischio» (misurato a 360).
  Foto `*-e36-fischio.jpg` nel giro foto (out/foto).

### D-167 · seconda prova delle tavole («più cura sui disegni»)

Foto in `coordination/handoffs/sviluppatrice/S-09-tavole-prova-2/` (360 e 412, uomo e donna «-f-»), stesso ramo di
storia della prima prova; comando `node tools/foto-tavole.mjs <cartella> 360,412 [f]` → «verde».
- Tavole più grandi: 4:3 invece di 16:9 (`src/resa/tavole-figure.tsx`, cornice `Tavola`).
- Volti puliti: figura nuova `Figura` (tavole-figure.tsx) con l'ombra del volto a tono pieno
  (`--vignetta-pelle-ombra`), occhi con iride e luce, sopracciglia vere; il retino resta solo su vestiti e sfondi.
  Non tocca `Persona` di vignetta.tsx (usata dal resto del gioco e ridisegnata da S-01 per PO-119).
- Luce e ombre: coni di luce a gradiente (lampade, fari), colonne e bacheca con l'ombra; prospettiva: pavimento del
  parlatorio, scrivania, bancone, cartolina e bacheca in scorcio; stadio con folla e fari dalla finestra (busta) e dalla
  vetrina del bar.
- Token nuovi in token.css: `--vignetta-sughero`, `--vignetta-legno`, `--vignetta-tramonto`, `--vignetta-vetro`.
- Non verificato: allineamento alla seconda bozza PO-119 di S-01: non l'ho trovata su origin (ultimo PO-119 su
  claude/valmora-resa-v2 è 3c605fb, prima bozza); chiesto alla principale. Le figure sono in un componente a parte,
  quindi si possono sostituire con quelle di S-01 senza toccare le scene.

## D-171 · le tavole entrano nel gioco, volti dalla seconda bozza PO-119

Il PO ha scelto la seconda prova (D-171); principale 1fee029 unita (d822cf1, merge).
- Volti: `src/resa/busto.tsx` = `persona()` di `bozza-persona-2.mjs` di S-01 (0ec4262) passata da stringa SVG a JSX,
  stessi tracciati; aggiunte `divisa` e `cravatta` spegnibili per i civili (Fabbro, testimone, Lavezzari).
  `Figura` delle tavole (`tavole-figure.tsx`) ora disegna il `Busto`, alla misura delle scene. Token nuovo
  `--vignetta-tratto-fine` (1,1) e classe `.v-linea.v-fine`, come chiedeva il LEGGIMI della bozza.
  `Persona` di vignetta.tsx (resto del gioco) non è toccata.
- Nel gioco: tolto `__PROVA_D165`; dopo il fischio l'epilogo è a tavole (5 fili + bar). Rosso `__NO_C165T01`: l'epilogo a
  schede di D-161, come prima.
- Guardiano (`tools/foto-epilogo.mjs`, nel passo foto e nei bracci rossi): tavole nell'ordine fabbro, testimone, busta,
  talpa, fascicolo coi valori del salvataggio, poi il bar con carriera valida; al bar due busti (protagonista del genere
  della partita + Malvasi col berretto); 3 numeri della carriera.
  FATTO MISURATO: verde a 360/375/412 («verde»); rosso `VALMORA_ROSSI=C165T01` → 3 problemi per larghezza («tavole «» invece
  di «fabbro=rispetto, …»», «al bar i busti «»», «0 numeri della carriera»).
- Foto: prima/dopo dell'epilogo in `coordination/handoffs/sviluppatrice/S-09-foto-d171/{prima,dopo}/` (360, 375, 412);
  tavole una per una, uomo e donna, in `coordination/handoffs/sviluppatrice/S-09-tavole-gioco/` (360, 375, 412).
- Test: `npx vitest run` 54 file / 301 prove passate; controllo dei token su src/resa: nessun problema.
- Non verificato: i busti di S-01 sono una bozza «a busto» approvata solo per le tavole; se S-01 cambia ancora i tracciati,
  `busto.tsx` va riallineato a mano (copia, non import). Le mani e le pose (braccia) non sono usate nelle tavole.

### Esito finale su 3186061 (D-161, D-164, D-165, D-171)

- FATTO MISURATO: catena completa **3/3 VERDE** su 3186061: 06:45 → 07:32, 07:32 → 08:20, 08:20 → 09:09 (STABILITA nel
  commit successivo).
- CI «catene» su 3186061: **verde** (run 703, tutti i job). Il rosso noto di e14 o1 non c'è più dopo l'unione della
  principale.
- Aperto: PO-131 (braccia poco naturali) e PO-132 (il personaggio coi capelli lunghi non sembra una donna) sulla seconda
  bozza PO-119; le tavole entrano coi volti di oggi. Quando S-01 passa i tracciati della terza prova li porto in
  `src/resa/busto.tsx` e rifaccio le foto delle tavole a 360/375/412.

## D-174 · terza prova dei protagonisti nelle tavole (PO-131 braccia, PO-132 figura femminile)

- Principale 05f98de unita (fast-forward: conteneva già la mia consegna e quella di S-01).
- `src/resa/busto.tsx` ora è `persona()` di `po119/bozza3/bozza-persona-3.mjs` (S-01, cc454bc) copiata senza cambiare
  una forma: stringa SVG montata come fa `Persona` in vignetta.tsx (persona2.ts di S-01). Tenute le mie opzioni
  `divisa`/`cravatta` per i civili. Braccia a riposo lungo i fianchi (nessuna posa nelle tavole).
- Corretto un nome in conflitto: la mia scritta «FINE» usava la classe `v-fine`, che S-01 usa per il tratto sottile del
  volto; ora è `v-scritta-fine`.
- Foto: dopo in `coordination/handoffs/sviluppatrice/S-09-tavole-d174/` (360, 375, 412, uomo e donna); prima = seconda
  bozza in `S-09-tavole-gioco/`.
- FATTO MISURATO: `foto-tavole` 360/375/412 m e f «verde»; `foto-epilogo` 360 «verde»; tipi ok; vitest e token: vedi sotto.
- Non verificato: le tavole usano solo la posa a riposo; le pose `su`/`nuca`/`conserte` della terza prova non le ho
  guardate nelle tavole. `persona2.ts` di S-01 nel resto del gioco è ancora la seconda bozza: tocca a S-01 portarci la terza.

### PO-133: terza prova annullata nelle tavole (scelta B della principale)

- Il PO ha rimandato la terza prova (PO-133: «Le braccia continuano ad essere incollate al busto fermo») e S-01 l'ha
  annullata nel gioco (d5b0dcc su resa-v2). Qui `src/resa/busto.tsx` torna alla seconda bozza (quella di 3186061), con
  un commit di revert, senza force push; resta il nuovo nome `v-scritta-fine` della scritta «FINE».
- La catena 3/3 su 46db1d6, partita alle 13:08, l'ho fermata io durante il giro 1: non vale. Rifatta sul commit del revert.
- Le foto in `S-09-tavole-d174/` mostrano la terza prova, non più in gioco: restano solo come documentazione.
- FATTO MISURATO dopo il revert: tipi ok; `foto-epilogo` 360 «verde»; `foto-tavole` 360 donna «verde».

## D-176 · quarta prova dei protagonisti nelle tavole (PO-133 braccia, PO-135 figura femminile)

- `src/resa/busto.tsx` = `persona()` di `po119/bozza4/bozza-persona-4.mjs` (S-01, d35cedb) copiata senza cambiare una
  forma (stringa SVG, come persona2.ts); tenute `divisa` (ora anche il cinturone) e `cravatta` per i civili.
- La catena su 563d906 (seconda bozza) l'ho fermata io durante il giro 2, dopo che il giro 1 era verde (14:08 → 15:17):
  superata da questa consegna, non la conto come 3/3.
- Foto dopo: `coordination/handoffs/sviluppatrice/S-09-tavole-d176/` (360, 375, 412, uomo e donna); prima = seconda
  bozza in `S-09-tavole-gioco/`.
- FATTO MISURATO: `foto-tavole` 360/375/412 uomo e donna «verde»; `foto-epilogo` 360 «verde»; tipi ok.
- Non verificato: nelle tavole le figure sono tagliate al petto (bancone, vetro, cornice della foto), quindi delle braccia
  nuove si vedono solo spalle e attacco; le pose `cinturone`/`peso` non le uso.

### C117B01 (PO: «manca un braccio all'uomo - verifica la donna») nelle tavole

- La catena su 6ee5abb l'ho fermata io durante il giro 1, su richiesta della principale: non vale.
- Le tavole non usano la posa «mano alla nuca». `Figura` (tavole-figure.tsx:39) non passa mai `braccia`, quindi tutte
  le 6 figure sono a riposo, con due braccia. Il difetto stava però anche nella mia copia (busto.tsx di 6ee5abb, posa
  `nuca`).
- `src/resa/busto.tsx` ora copia `persona()` di persona2.ts di S-01 al commit 7c0357f (correzione C117B01, rosso
  `__NO_C117B01`, attributi data-braccio/data-spalla/data-busto), più divisa/cravatta per i civili.
- Guardiano nuovo `tests/braccia-tavole.test.ts`: tutte le pose (riposo, su, nuca, conserte, cinturone) per uomo, donna e
  vice, più le 6 tavole renderizzate: due braccia per busto, entro 6 unità dalla spalla, disegnate dopo il busto.
  FATTO MISURATO: verde «2 passed»; col rosso `__NO_C117B01` trova «posa nuca corti: 0 braccia sx» e «posa nuca lunghi:
  braccio dx disegnato prima del busto».
- Il guardiano del giro foto contava anche il nuovo `data-busto="1"` interno (al bar «corti,1,berretto,1»). Corretto il
  selettore in tools/foto-epilogo.mjs. Dopo: verde a 360; rosso C165T01 ancora segnalato (3 problemi).
- `npx vitest run`: 60 file, 316 prove passate. Foto delle tavole rifatte in `S-09-tavole-d176/` (360, 375, 412, m e f),
  «verde».

### PO-137 (braccia smussate, C118S01) nelle tavole

- Catena completa **3/3 VERDE su 2bac5be** (C117B01): 18:03 → 19:12 → 20:20 → 21:29, STABILITA nel commit successivo.
- `arto()` di `src/resa/busto.tsx` = quello di persona2.ts di S-01 al commit 032ff92 (cappucci arrotondati a polso e
  spalla, un'unica curva chiusa; attributo `data-arto="1"`; rosso `__NO_C118S01`).
- Guardiano in `tests/braccia-tavole.test.ts`: la stessa `svoltaMassima` (soglia 30°) di tests/braccia.test.ts di S-01,
  su tutte le pose di uomo, donna e vice e sul bar. FATTO MISURATO: verde, 0 braccia con spigoli; rosso C118S01, spigoli
  su tutte le braccia misurate.
- Verifica secondo D-177 (PO-139): 3 giri di `node tools/catena.mjs governo && node tools/catena.mjs logica`, più la CI.
