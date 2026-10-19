# S-14 · Imprevisti senza timer su tutti i 36 episodi (PO-022, D-190, D-192, D-194)

Ramo `claude/valmora-tempo-reale`, unito al principale 378b6f9 (merge, nessun rebase). Il PO ha deciso (D-190): «non voglio che il
gioco metta ansia», «Imprevisti senza timer». Una volta per ondata un imprevisto interrompe la sequenza delle chiamate e si
risolve subito, **senza nessun conto alla rovescia**. Il prototipo dei tempi (modi a/b/c) è tolto dal codice; resta solo il
rapporto `S-14-tempo-reale.md`.

## 1. Come funziona (FATTO, dal codice)

- **Dati** in `data/imprevisti/<episodio>.json` (schema `schema/imprevisti.schema.json`), separati dalle missioni.
- **Testi:**
  - e01–e06: nei file `eNN.json`;
  - e07–e36: in `data/testi/it/imp_eNN.json` (D-192), fuori dai testi rifiniti;
  - la vista dei dati (`innesta`, `src/dati/imprevisti.ts:28-36`) unisce i testi `imp_eNN` a quelli dell'episodio, così ogni
    guardiano che legge `testi/it/eNN.json` controlla anche gli imprevisti.
- **Innesto** (`src/dati/imprevisti.ts:13`): la chiamata entra nell'ondata alla posizione `dopo`, col segno `imprevisto: true`.
  - Lo usano il gioco (`src/resa/dati.ts`), gli strumenti e le catene (`tools/dati-disco.mjs`) e la validazione (`src/dati/valida.ts`).
  - Da lì è una chiamata come le altre: stesso motore e stesso bot.
  - È deterministico: la posizione sta nei dati.
  - Rosso `__NO_S14I01`: nessun innesto.
- **Controlli dei dati** (`src/dati/imprevisti.ts:45-70`):
  - uno per ondata;
  - deve interrompere: almeno una chiamata prima e una dopo;
  - arriva sempre: niente «se», «dopo», «senza»;
  - opzioni senza condizioni, quindi c'è sempre un'uscita;
  - id unico;
  - all'ultima ondata nessuna unità impegnata (`:66`, C42-01);
  - **mai fiducia data** (`:67`); toglierla si può.
- **Resa:** la fascia «Imprevisto: interrompe le chiamate» (`src/resa/schermate/Ondata.tsx:95`). Timbro e spicchio restano
  quelli di D-129, perché lo spicchio suggerisce il tempo. Rosso `__NO_C190I01`.

## 2. Modello delle risposte (D-194)

| risposta | effetti | perché (FATTO MISURATO) |
|---|---|---|
| A «intervieni» | pressione −2 sul settore S, tensione +1 su un altro settore T; nessuna unità impegnata (in e01–e06, fuori dall'ultima ondata, un'unità impegnata come nel blocco 1) | con l'unità impegnata ovunque, i bot attento ed equilibrato perdevano stelle quasi in ogni episodio (3★ → 1★, e30 fallita): il bot decide ondata per ondata e paga l'unità dopo |
| B «arrangia» | pressione −1 e tensione +1 sullo stesso settore S | con B che spostava pressione su T, il guardiano D-160 delle opzioni nel verso sbagliato saliva da 12 a 37 (200 partite) |
| C «lascia correre» | nessun effetto, salvo 3 casi in e02 (sotto) | — |

- **Trappole** (D-194): in 19 imprevisti «intervieni» e «arrangia» non danno sollievo al settore (+2 e +1 rispetto al modello);
  in e03 o3 solo «arrangia».
  - Senza, in e14, e17, e21 ed e24 gli imprevisti gonfiavano le 3★ del bot attento (da 17 a 20 su 36).
  - I testi di A e B dicono quello che succede davvero.
  - Elenco (verificato con script sui dati): e05 o2, e07 o1, e09 o2, e10 o1, e13 o4, e17 o4, e20 o4, e21 o3, e23 o2, e24 o4,
    e27 o1, e28 o2, e29 o3, e30 o2, e32 o4, e33 o3, e35 o2, e35 o3, e36 o4.
- **e02:** due «lascia correre» tolgono 1 di fiducia, e uno, il binario, aggiunge +1 di pressione in stazione. Servono a D-160 e
  al verbale C36-03: la stazione degenera nel 52,0% delle partite perse (soglia 50%).
- **Taratura per episodio:** una leva per imprevisto (A −3/−1, B −2, A con +1 di tensione) e le trappole. È scelta da uno
  strumento con le stesse partite e gli stessi semi dei guardiani, con questi vincoli:
  - stelle del bot attento identiche;
  - equilibrato mai sotto le stelle di prima;
  - curva D-154;
  - Δ fiducia delle perse ≤ 0;
  - imprevisti neutri in media per il casuale (stagione 3: +1,8 punti, per D-162).
  - I testi restano veri in ogni posizione delle leve.

## 3. Contenuti

- 142 imprevisti, uno per ondata in tutti i 36 episodi.
- e01–e06 li ho scritti io (blocco 1). e07–e36 li hanno scritti 3 sottoagenti su una specifica unica (incidenti laterali, niente
  trama, niente nomi nuovi, finzione dichiarata, violenza fuori campo); poi li ho controllati, importati e tarati io.
- Ogni chiamata è ≤ 100 caratteri (guardiano PO-084/085 verde) e nessun testo contiene le formule vietate (C42-02 verde).
- Dubbi segnalati dagli agenti, da far giudicare al PO:
  - e19: la gag della «chiave dei bagni» è forse allusiva;
  - e23 o2: il legame fra gabbiano e sirena è debole;
  - e36 o3: le sciarpe annodate alla rete sono da controllare con l'epilogo;
  - alcune A dell'ultima ondata nominano «gli agenti», genericamente.

## 4. Misure prima/dopo (FATTO MISURATO, 1000 semi, gli stessi del passo «bot»)

Tabella completa per episodio e strategia: `s14/misura-imprevisti-36.md` (`node tools/misura-imprevisti.mjs 1000`).

Partite perse dal casuale, prima → dopo:

| stagione | episodi | media |
|---|---|---|
| 1 | e01 56,7→56,5 · e02 56,0→63,9 · e03 55,7→63,3 · e04 55,2→62,9 · e05 60,4→62,5 · e06 61,7→63,5 · e07 63,2→63,5 · e08 63,8→64,4 · e09 64,7→65,1 · e10 67,8→67,5 · e11 70,6→70,4 · e12 75,9→76,6 | 62,64 → 65,01 |
| 2 | e13 50,7→54,8 · e14 59,0→60,8 · e15 60,8→60,6 · e16 60,8→61,6 · e17 60,6→66,8 · e18 65,0→67,1 · e19 68,4→67,9 · e20 67,9→67,9 · e21 69,2→71,6 · e22 69,6→73,4 · e23 68,8→73,2 · e24 70,4→72,7 | 64,27 → 66,53 |
| 3 | e25 60,9→61,5 · e26 61,5→64,1 · e27 67,4→69,1 · e28 67,2→69,5 · e29 67,3→69,1 · e30 67,0→68,6 · e31 66,5→68,1 · e32 66,5→68,6 · e33 68,1→69,9 · e34 70,5→73,4 · e35 74,0→78,2 · e36 76,5→78,4 | 67,78 → 69,88 |

- **Curva D-154:** verde in tutte e tre le stagioni (passo «bot»).
- **D-162:** 65,01 < 66,53 < 69,88. Il margine fra le stagioni 1 e 2 passa da 0,38 a 1,52 punti (non si chiude); quello fra 2 e 3
  da 3,51 a 3,35.
- **Stelle (D-181):**
  - 3★ del bot attento: 17 → 17 su 36, con 0★ dell'attento 0 → 0;
  - equilibrato 3★: 32 → 33 (e14: 2★ → 3★, l'unica differenza);
  - peggiore: 0★ in 36 su 36.
- **D-160:** Δ fiducia media nelle perse ≤ 0 in tutti i 36 (il massimo è passato da −0,10 a −0,03). Opzioni nel verso sbagliato,
  200 partite: 12 → 21 (soglia 30).
- **Blocchi:** 0. Tutti gli esiti sono raggiunti dai bot.
- **Ripartenza C17-06:** la stima veloce ora usa 150 partite invece di 60 (D-192), ed è uguale al calcolo esatto.

## 5. Riproduzioni dei casi del collaudo (C36-03, C40-01, C42-03)

- **C42-03** (e10, rosso C42B03): verde senza modifiche al test.
- **C36-03 «misura non cieca»:**
  - le frasi del collaudo C-036 si rigiocano sul percorso di oggi: gli imprevisti ci sono, ma si risolvono con la risposta senza
    effetti, senza consumare il caso (`tests/c36-dati.test.ts:51`);
  - il controllo principale su tutti i 36 usa il bot casuale vero;
  - il rosso segnala ancora 2 + 2 frasi.
- **C40-01, rosso C40B01:**
  - i casi del collaudo C-040 si rigiocano sulle missioni di allora, senza imprevisti (`tests/confronto.test.ts:83`);
  - la tabella dei confronti (D-174) di oggi cambia però le altre voci del bilancio;
  - attesa del rosso: per ognuno dei tre casi resta una voce smentita su una risposta del collaudo (e35 «lascia_coda»,
    e13 «palco_si», e12 «rinforzi12»), quindi il rosso resta rosso in tutti e tre;
  - non sono più nell'attesa segui_barca, stampa_vicina e lascia_cori. **Da confermare** dalla principale.

## 6. Salvataggi

- Nessun campo nuovo: SAVE_VERSION resta 2 (D-192).
- Il salvataggio vero della 0.4.0 (e02 a metà ondata) si migra e arriva all'esito con l'imprevisto (`tests/imprevisti.test.ts`).

## 7. Guardiani e prove

- `tests/imprevisti.test.ts` controlla:
  - innesto e posizione;
  - idempotenza;
  - rosso `__NO_S14I01`;
  - controlli dei dati rossi su ogni regola rotta, compresa l'ultima ondata;
  - determinismo col seme;
  - nessun soft-lock: ognuna delle risposte forzate arriva all'esito;
  - salvataggio vero.
- `npx vitest run`: 72 file, 381 test verdi.
- Passo «bot»: verde.
- **Foto** a 360, 375 e 412 px di e01 `imp_ambulanza`, e17 `imp_lampioni` (trappola) ed e30 `imp_mercatino`, più il braccio
  rosso C190I01 a 360 px, in `s14/imprevisti/` (`npx vite build && node tools/foto-imprevisti.mjs`):
  - 9 foto, 0 difetti: avviso visibile, nessun timer, nessuno scorrimento orizzontale;
  - rosso: avviso assente 3 su 3.
- Catene governo + logica, 3 giri sulla build cde6273: 6/6 VERDE (`STABILITA.json`; dal giro 2 «con modifiche non committate»
  = solo questo rapporto e STABILITA).
- CI «catene» su cde6273: run 865, success (https://github.com/antoniovairo-rgb/valmora/actions/runs/39313909089). Anche su
  f9c159c: run 864, success.

## 8. Non verificato

- Prova sul telefono vero e tempo della ripartenza sul telefono.
- Giudizio del PO sui testi dei 142 imprevisti e sulle trappole.
- La sensazione di tensione in una partita vera.
- Catena grafica in locale: non girata; la gira la CI.
- La curva usa margini stretti in alcuni punti (fino a 0,2-0,3 punti fra episodi consecutivi): ogni ritocco ai dati va rimisurato.
