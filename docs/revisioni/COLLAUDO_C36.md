# Collaudo C-036: 0.36.0 (C35-01, salvataggi vecchi dentro e35), rilievi aperti, regressioni e partita da giocatore (PO-120)

- **Build collaudata:** main a fdad627 (rilascio f6b38b6), GAME_VERSION 0.36.0 (`src/versione.ts:251`, commento `:246-250`); `npm ci` e `npx vite build` verdi.
- **Cosa è cambiato nel gioco** (`git diff --stat e7f00cc fdad627 -- src schema data tools tests`): solo `data/missioni/e35.json` (una riga: `barca_ormeggiata` riceve `"mai": ["barca_ritorno/cerca_scatoloni", "barca_ritorno/ferma_barca"]`, `:631`), `src/versione.ts` e il guardiano `tests/c34-dati.test.ts:129-137`. Nessun file di `src/logica`, `src/resa`, `schema/`.
- **Versioni di confronto** (worktree separati nella mia area di lavoro, `npx vite build` verde per ognuna): 0.35.0 a e7f00cc, 0.34.0 a acf1151, 0.33.0 a c42b155.
- **Ramo:** claude/valmora-collaudo-c36, da main fdad627. Sola lettura sul gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-17. Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, SwiftShader), DPR 1, Node 22.22, 4 CPU, fino a 5 browser insieme (carico medio fino a 28: tempi lunghi, nessun effetto sulle misure, che contano passi).
- **Sonde:** riprese dai rami C-033/C-034/C-035 senza modifiche (copiate in `coordination/sonde/`); nuove `c36-*` (tabella in fondo). Uscite in `coordination/sonde/uscite-c36/`, foto in `docs/foto/c36/`, salvataggi veri nuovi in `coordination/sonde/salvataggi-034-e35/`, `salvataggi-035-e35/` e `salvataggi-035/`.

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, marcato) · **IPOTESI** (marcata) · **IMPRESSIONE DA GIOCATORE**.

## Riepilogo

| verifica | esito |
|---|---|
| **C35-01** salvataggio vecchio in e35 | salvataggi veri della 0.34.0 in **74/74** punti di e35 (ogni chiamata prima e dopo la risposta, ogni schieramento, due rami della barca, due risposte alla barca in o3) ripresi nella 0.36.0 senza difetti; 0.35.0 → 0.36.0 **74/74**. Rosso (0.34.0 → 0.35.0): **72/74**, i 2 casi sbagliati sono esattamente C35-01 (con `cerca_scatoloni` e con `ferma_barca`). Guardiano `tests/c34-dati.test.ts` 12/12, rosso coi dati 0.35.0 11/12. **Chiuso** |
| C35-02…06, C34-04, C33-06/07/09 | **tutti aperti, invariati** (§ 2) |
| Bot, 1000 semi, tre stagioni | **0 blocchi** in 156/156 righe; «mai comparse» `[]` 36/36; uscita **identica** alla 0.35.0 (`diff` vuoto) |
| Test e tipi | `npx vitest run` **46/46 file, 253/253**; `npx tsc --noEmit -p .` uscita 0 |
| Salvataggi veri | 0.34.0 e 0.35.0 dentro e35: **74/74** e **74/74**; 0.35.0 in o2, o4 e sul rapporto di o3 di 14 episodi: **41/41** ripresi sulla stessa schermata (13 + 14 + 14; e01 non ha l'ondata 4); 0.34.0 e 0.33.0 in o3 di 14 episodi: **14/14** e **14/14**; import col pulsante: 0.33.0 **15/15**, 0.34.0 **18/18**, 0.35.0 **41/41**, e35 0.34.0 **74/74**, e35 0.35.0 **74/74**; 0 errori |
| Schermate con asset veri | 360, 375, 412, 1366: **1916** ciascuna, 0 scorrimenti, 0 tagli, 0 nomi vecchi, 0 errori; tocchi coperti 1 / 0 / 1 / 0 = **uguale alla 0.35.0** (riassunto identico) |
| Console | **0 errori** in tutte le corse con browser e nei 791 passi della partita |
| **Partita da giocatore** | 6 episodi mai giocati nei collaudi recenti, a 360 col salvataggio: e03, e09 (sbagliato apposta, poi ripreso dall'ondata 3), e14, e22, e28 (sbagliato apposta), e32; 0 errori; rilievi nuovi C36-01…C36-07 |

# 1. Novità della 0.36.0: C35-01

**FATTO (dati).** `barca_ormeggiata` ora ha `"dopo": {"gia": ["barca_porto/blocca_barca"], "mai": ["barca_ritorno/cerca_scatoloni", "barca_ritorno/ferma_barca"]}` (`data/missioni/e35.json:631`); `coerente()` scarta la chiamata se una delle scelte `mai` è già fatta (`src/logica/missione.ts:142-146`), e `chiamateAperte()` lo applica a ogni ripresa (`:128-131`).

**Sonda nuova** `coordination/sonde/c36-salvataggi-e35.mjs` (generalizza `c35-salvataggi-e35.mjs`, che provava 8 punti). Per ogni ramo della barca (`blocca_barca`, `segui_barca`) e per ognuna delle due risposte alla chiamata della barca in ondata 3, il motore della versione A (bot attento, seme 1) gioca fino al punto voluto; il salvataggio va nella build A, «Riprendi», dove previsto si **tocca nell'interfaccia di A** la risposta e «continua» (l'ultimo passo lo salva A), si ricarica e si **esporta il file col pulsante**. Il file si importa nella 0.36.0, «Riprendi», si legge scena e chiamata, si va avanti nell'interfaccia fino a fine ondata, poi il motore 0.36.0 finisce la partita. Punti per ogni ondata: «sala» (prima dello schieramento), «su ‹chiamata›» (aperta) e «dopo ‹chiamata›» (risposta toccata; dopo l'ultima chiamata è la chiusura dell'ondata). Controlli: mai le due chiamate della barca nella stessa partita, mai la chiamata del ramo opposto, nessuna chiamata risposta due volte, nessun blocco, stessa scena di A.

**FATTO MISURATO.**

| corsa (comando: `node coordination/sonde/c36-salvataggi-e35.mjs <A> <B> <cartella> <uscita>`) | punti | senza difetti | casi sbagliati | errori di console |
|---|---|---|---|---|
| 0.34.0 → **0.36.0** (`uscite-c36/salvataggi-e35-034-036.log`) | 74 | **74** | 0 | 0 / 0 |
| 0.35.0 → **0.36.0** (`salvataggi-e35-035-036.log`) | 74 | **74** | 0 | 0 / 0 |
| rosso: 0.34.0 → 0.35.0 (`salvataggi-e35-034-035-rosso.log`) | 74 | 72 | **2**: `blocca_barca`, o3 dopo `barca_ritorno/cerca_scatoloni` e dopo `barca_ritorno/ferma_barca` → la 0.35.0 apre `barca_ormeggiata` «ONDATA 3/4 · CHIAMATA 4/4» e la partita finisce con **due chiamate della barca** | 0 / 0 |

- Nei due punti di C35-01 la 0.36.0 riprende sulla **chiusura** dell'ondata 3, come la 0.34.0, e a fine partita le scelte della barca sono solo `1:barca_porto/blocca_barca` + `3:barca_ritorno/…` (foto `docs/foto/c36/salvataggi/A0.34.0-blocca_barca-o3x0-o3-dopo-barca_ritorno-cerca_scatoloni.jpg` e `B0.36.0-da0.34.0-…`, idem `o3x1-…-ferma_barca`).
- Nel ramo blocco con `barca_ritorno` **aperta e non ancora risposta** (0.34.0) la 0.36.0 mostra `barca_ormeggiata` al suo posto: il racconto si corregge, come nella 0.35.0 (2 punti, contati come attesi). Contatore «CHIAMATA 3/3» in A e in B.
- Tutti gli altri punti (sala, su, dopo, o1–o4, due rami): stessa scena e stessa chiamata della versione A. Esiti col motore 0.36.0: contenuto 28, contenuto a fatica 46 (uguali nelle due corse verdi).
- **Guardiano:** `npx vitest run tests/c34-dati.test.ts` 12/12; lo stesso file nel worktree 0.35.0 (dati senza la correzione): **11/12**, rosso «barca_ormeggiata esclude chi ha già risposto a barca_ritorno». Il rosso vede il difetto.
- GIUDIZIO (non è un rilievo): il guardiano controlla la regola nei dati (`tests/c34-dati.test.ts:135`), non la ripresa di un salvataggio; la prova di ripresa vera è la sonda qui sopra.

**C35-01 chiuso.**

# 2. Rilievi aperti, rimisurati (solo stato)

`git diff --stat e7f00cc fdad627 -- src schema data` tocca solo `data/missioni/e35.json:631` e `src/versione.ts`: nessuno dei rilievi qui sotto poteva cambiare.

| rilievo | stato | misura C-036 |
|---|---|---|
| **C35-02** chiamate con una sola risposta senza spiegazione | **aperto, uguale** | `node coordination/sonde/c35-opzioni-sparite.mjs . 300` (`uscite-c36/opzioni-sparite-036.log`): 22 casi, **9** con una sola risposta; uscita **identica** a quella del C-035 (`diff` vuoto) |
| **C35-03** e21 «Vie del quartiere» che nessuna unità copre | **aperto, uguale** | `data/missioni/e21.json:69-70` tipo `quartiere`; efficacie `:96`, `:104`, `:112` senza `quartiere`; `node coordination/sonde/c35-dati.mjs . 1000` (`uscite-c36/dati-036.json`): quartiere scoperto in o4 **1000/1000** con ogni risposta; uscita identica al C-035 |
| **C35-04** e35 verbale di fallimento «dal nastro al porto» | **aperto, uguale** | testo `data/testi/it/e35.json:131`; `node coordination/sonde/c35-fallimenti.mjs . e35 banchine 1000`: fallite **734/1000**, banchine degenerate **88/734**, settori per partita 0:5 · 1:567 · 2:152 · 3:9 · 4:1 (uguale al C-035). Lo stesso difetto in altri episodi: C36-03 |
| **C35-05** e13 «Curva agitata» sul piazzale | **aperto, uguale** | `data/missioni/e13.json:333-335` (`cori_ospiti`, tipo `curva`, settore `piazzale`), testo `data/testi/it/comune.json:69` |
| **C35-06** «ti costa uno steward» offerta senza unità libere | **aperto, uguale** | `src/logica/missione.ts:151` guarda solo `quantita + riserva`. Visto di nuovo giocando: e03 o1 `rimozione` «ti costa una squadra» offerta con «Squadre 0» sulla barra (tutte e 3 schierate); scelta, in o2 le squadre disponibili erano 2 |
| **C34-04** e17 Piazza del municipio di tipo strada | **aperto, uguale** | `data/missioni/e17.json:81-82` |
| **C33-06** vignetta del rapporto mai visibile | **aperto, uguale** | nella partita **26/26** rapporti con `data-nascosta` (`rap.sh`); nelle schermate (36 episodi, seme 1) rapporto **nascosto 142/142** a 360, 375, 412 e 1366; a 375×667 nascoste anche sala (108/108) e verbale (180/180); a 1366 la sala in 93/108 (`uscite-c36/vignette-schermate.txt`, identico al C-035). Codice `src/resa/vignetta.tsx:38` |
| **C33-07** tono «calmo» con settori scoperti | **aperto, uguale** | nella partita 26 rapporti, **8** col tono «calmo», **7** di questi con almeno un «SCOPERTO» (e03 o2, o4; e14 o1; e22 o3; e32 o1, o2, **o3 con due**) (`uscite-c36/giocatore/rapporti-toni.txt`). Codice `src/resa/schermate/Rapporto.tsx:18` |
| **C33-09** «non deve passare il giallo: è arrivata al giallo» | **aperto, uguale** | visto nel verbale di e03 (foto `docs/foto/c36/giocatore/e03-verbale-p-*.jpg`). Codice `src/resa/schermate/Bilancio.tsx:39` |

Visti di nuovo giocando (non richiesti, solo stato): **C34-07** «Dove sei rimasto scoperto» salta settori (e03: manca o2 curva ospiti; e14: manca o1 piazzale; e22: manca o1 piazza del municipio; e09: 3 voci su 8 settori scoperti); **C33-13** fiducia alta con l'episodio perso (e28 fallito con fiducia **9/10**, e09 con 6/10); «Per la stella successiva» negli episodi falliti (e09, e28).

# 3. Regressioni (FATTO MISURATO)

- **Bot** (`node tools/bot.mjs 1000`, `uscite-c36/bot-1000.log`; stessa corsa nella 0.35.0, `bot-1000-v035.log`): 156/156 righe con **blocchi 0/1000**, e01–e36 (tre stagioni); «chiamate mai comparse» `[]` **36/36**; `diff` delle due uscite **vuoto**. Coerente: la correzione agisce solo su partite che hanno già sia `blocca_barca` sia una risposta a `barca_ritorno`, cosa che nella 0.35.0/0.36.0 il motore non produce.
- **Test e tipi:** `npx vitest run` → «Test Files 46 passed (46) · Tests 253 passed (253)» (`uscite-c36/vitest.log`; 0.35.0: 252, in più il test C35-01); `npx tsc --noEmit -p .` uscita 0, nessun messaggio.
- **Console:** 0 errori di pagina e di console in: salvataggi e35 (3 corse × 2 build), salvataggi 0.35.0, import dei vecchi, schermate, partita (`/fine` → `{"passi":791,"errori":[]}`).
- **Salvataggi veri:** 
  - dentro e35, 0.34.0 e 0.35.0 → 0.36.0: § 1 (**74/74** e **74/74**);
  - 0.35.0 nuovi, veri (`EP=e01,e03,e09,e13,e14,e17,e21,e22,e26,e28,e30,e32,e35,e36 ONDATA=2|4 VA=0.35.0 node coordination/sonde/c33-salvataggi-o4.mjs <0.35.0> . …`, e `RAPPORTO=1 ONDATA=3`): o2 **14/14**, o4 **13/13** (e01 ha 3 ondate: «l'ondata 4 non esiste», non è un difetto), rapporto di o3 **14/14** ripresi sulla stessa chiamata o sullo stesso rapporto (`uscite-c36/salvataggi-035-*.json`); file in `coordination/sonde/salvataggi-035/` (41);
  - 0.34.0 e 0.33.0 in o3 degli stessi 14 episodi (`VA=0.34.0`/`0.33.0`, build dei worktree): **14/14** e **14/14** sulla stessa chiamata (`salvataggi-034-o3.json`, `salvataggi-033-o3.json`);
  - import col pulsante e «Riprendi» (`node coordination/sonde/c35-importa-vecchi.mjs . <cartella> …`): 0.33.0 (ramo C-034) **15/15**, 0.34.0 (ramo C-035) **18/18** (il file `0.34.0-e35-o3-blocca-dopo-cerca_scatoloni.json` di C35-01 ora riparte sulla **chiusura**, nel C-035 su `barca_ormeggiata`), 0.35.0 **41/41**, e35 0.34.0 **74/74**, e35 0.35.0 **74/74**; 0 errori di importazione e di console (`uscite-c36/importa-*.json`). Salvataggi della 0.32.0 e precedenti non riprovati.
- **Schermate con asset veri:** `bash coordination/sonde/c36-schermate-blocchi.sh <1-4> <foto>` (= `c29-schermate.mjs`, bot attento, seme 1), riassunto `node coordination/sonde/c35-riassunto-schermate.mjs coordination/sonde/uscite-c36/schermate` (`uscite-c36/schermate-riassunto.txt`):

| misura | schermate | scorr. orizz. | tagli | nomi vecchi | tocchi coperti | errori |
|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 1 (e06, C33-03) | 0 |
| 375×667 | 1916 | 0 | 0 | 0 | 0 | 0 |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, C27-07) | 0 |
| 1366×768 | 1916 | 0 | 0 | 0 | 0 | 0 |

  Riassunto **identico** a quello del C-035 (`diff` vuoto). Le foto (2408) restano locali e si rifanno col comando; un campione a 4 finestre in `docs/foto/c36/schermate/` (e35 `barca_ormeggiata`, e14 `fumo_viola`, e32 `due_cortei`). Nessuna foto «prima/dopo»: la 0.36.0 non cambia schermate (il diff non tocca `src/resa` né testi).

# 4. Partita da giocatore (PO-120)

**Come ho giocato (FATTO).**
- Build 0.36.0, 360×760, col dito (`hasTouch`), DPR 1, asset veri. Pilota `c33-giocatore.mjs` con gli aiuti `coordination/sonde/c36-giocatore-aiuti/` (copie del C-035 coi percorsi di questa sessione). **Rispetto al C-035 ho tolto `anteprima.mjs`:** non ho mai letto chiamate o opzioni dai dati prima di giocare; ogni scelta l'ho decisa sulla schermata. I dati li ho letti solo **dopo** ogni episodio, per verificare quello che avevo notato.
- Partita nuova dal titolo, guida intera (6 pagine), «il nuovo responsabile ad interim» (il C-035 aveva scelto il femminile). **Un solo salvataggio** per tutta la partita, nessun riavvio. Per arrivare agli episodi richiesti ho segnato a mano come conclusi gli episodi in mezzo (`sblocca.sh`: 1 stella, variabili invariate) e, per e09 ed e28 persi, ho segnato il migliore come superato per sbloccare il seguito. Le variabili della storia degli episodi saltati non vengono da scelte vere (es. in e32 la curva parla del «capo arrestato» senza che io abbia giocato la cattura).
- Episodi: **e03, e09, e14, e22, e28, e32** (nessuno fra quelli esclusi; e28 ed e32 della stagione 3). **Sbagliati apposta: e09 ed e28.**
- **Durata in minuti di gioco: non posso confermarla** (il gioco non mostra un orologio di gioco). Conto tocchi (`node coordination/sonde/c34-giornale.mjs coordination/sonde/uscite-c36/giocatore/giornale.jsonl`, `giocatore/conti.txt`; i tocchi comprendono la navigazione e i passi del verbale; le foto non contano), ondate e chiamate.
- Giornale `coordination/sonde/uscite-c36/giocatore/giornale.jsonl`, salvataggio finale `giocatore/salvataggio-finale.json`, foto `docs/foto/c36/giocatore/` (231). Errori di console: 0.

| episodio | come ho giocato | esito | stelle | tocchi | ondate / chiamate |
|---|---|---|---|---|---|
| e03 Notte di coppa | bene | contenuto a fatica | 1 | 116 | 4 / 12 |
| e09 Il furgone grigio | **sbagliato apposta** (tutto sul furgone), poi «Riparti dall'ondata 3» giocando bene | degenerato, due volte | 0 | 174 (due giri) | 4+2 / 12+6 |
| e14 Biglietti doppi | bene | contenuto a fatica | 1 | 118 | 4 / 12 |
| e22 Il derby dei sospetti | bene | contenuto | 3 | 114 | 4 / 11 |
| e28 La trappola | **sbagliato apposta** (creduto all'anonimo e a Lavezzari) | degenerato | 0 | 125 | 4 / 12 |
| e32 Il derby della città | bene | contenuto a fatica | 2 | 114 | 4 / 12 |

## 4.1 e03 Notte di coppa (giocato bene)

Foto `e03-*`.
- **FATTO:** o1 piazzale scoperto («Folla, le tue risposte: unità troppo poche», dopo il parcheggio lontano che «affolla il piazzale»); o2 curva ospiti scoperta, tono «calmo»; o3 parcheggi scoperti; o4 piazzale scoperto, tono «calmo». Fiducia 5 → **1** (rinforzi −2, cordone −1). Verbale «CONTENUTO A FATICA», 1 stella, «è arrivata al giallo» (C33-09).
- **IMPRESSIONE DA GIOCATORE:**
  - Capisco bene il tema: le case a cinquanta metri, il comitato, i bambini che domani vanno a scuola. Le risposte «INTANTO…» sono brevi e spesso fanno sorridere («Il suo.» del carro attrezzi).
  - **Non capisco** «Almeno lo stadio dei cartelloni sarà lontano» (`e03.ch.cartelloni`): ho riletto due volte senza capire a cosa si riferisce.
  - Il briefing del comitato parla di «**sabato, amichevole**» e il verbale lo dà per VERO; ma la serata è una notte di coppa e il comitato stesso dice che «domani c'è scuola». Mi sono chiesto se avessi capito male la serata (C36-05).
  - «Chiedi due squadre per la notte» costa **due** punti di fiducia (4 → 2) mentre il costo dice solo «il comando non dimentica»: le conseguenze sono giuste, ma la misura mi ha sorpreso.
  - Mappa e testo coerenti; la folla che arriva da destra nella foto dell'ondata 1 racconta i pullman del Garden prima che lo dica la chiamata.
  - Finale che si sente («Malvasi chiede che l'incontro sia di giorno»).

## 4.2 e09 Il furgone grigio (sbagliato apposta, poi ripreso)

Foto `e09-*`, `e09b-*`.
- **Cosa ho fatto:** creduto all'informatore (bassa: «furgone grigio… porta guai») e non alla radio (alta: «nessun mezzo sospetto»); tutte le squadre e il mediatore in tangenziale per tre ondate, niente su curva ospiti e strada da Skyfield; «la viabilità non è compito nostro», «lasciali scendere», «lascia correre» due volte.
- **FATTO:** o1 strada da Skyfield scoperta; o2 tutte e due le curve scoperte; o3 tre scoperti, due degenerati («Fiducia −2»); o4 «DEGENERATO FUORI CAMPO», «riparti dall'ondata 3». Ripreso dall'ondata 3 giocando con criterio: o3 tre scoperti, o4 tangenziale e strada scoperte, **di nuovo degenerato**, «riparti dall'ondata 3».
- **FATTO MISURATO** (la ripartenza era davvero vincibile?): `node coordination/sonde/c36-ripartenza.mjs coordination/sonde/uscite-c36/giocatore/e09-sconfitta-giro2.json 3 1000` (dalla sconfitta vera, stato `partenze[3]`): bot attento **contenuto a fatica**, schieramento attento con scelte a caso **469/1000** non fallite, tutto a caso 93/1000. Il gioco propone l'ondata 3 perché da lì la possibilità supera un terzo (`src/logica/ripartenza.ts:62-70`). Ho perso io, non la ripartenza.
- **IMPRESSIONE DA GIOCATORE:**
  - Il colpo di scena delle fonti è il migliore della partita: l'informatore (bassa) era **VERO**, la radio (alta) **FALSA**. Aver «sbagliato» credendo all'informatore e perdere lo stesso perché ho dimenticato le curve è giusto: il furgone non era il problema della serata.
  - Il furgone **sparisce due volte**: in o3 «Fai verificare la foto» → «il carro attrezzi trova la piazzola vuota»; in o4 la viabilità chiama «Col carro attrezzi in manovra, furgone grigio sparito». E avevo «una squadra al furgone… fino a sera». Mi sono sentito preso in giro (C36-02).
  - In o2 l'opzione «Sposta le squadre del piazzale sulla coda» con zero squadre sul piazzale: non capivo quali squadre.
  - Il verbale di fallimento parla di «Coda ferma fino a notte, scontri sulla rampa dello stadio»: io avevo la tangenziale sempre «SOTTO CONTROLLO» e la rampa chiusa; avevo perso sulle curve (C36-03).
  - Il secondo giro dall'ondata 3 è stato frustrante: con le unità a riposo e le curve già rosse ho perso di nuovo, e il gioco mi ha riproposto la stessa ondata. Giusto (la misura dice che si poteva vincere), ma senza un indizio su cosa cambiare.

## 4.3 e14 Biglietti doppi (giocato bene)

Foto `e14-*`.
- **FATTO:** o1 piazzale scoperto (dopo «Conferma e spiega» alla stampa: «in piazzale la notizia gira»), tono «calmo»; o2 curva ospiti scoperta («Lite: nessuna unità»); o3 curva ospiti scoperta; o4 piazzale scoperto. Fiducia 3 → 1 → 3. Verbale «CONTENUTO A FATICA», 1 stella.
- **IMPRESSIONE DA GIOCATORE:**
  - Idea bella e chiara: biglietti veri ma doppi, la biglietteria che nel briefing giura «nessun doppione possibile» e alla prima chiamata dice «la vendiamo ancora». La fonte falsa si smaschera da sola: soddisfacente.
  - I tifosi del Waterline sono «**viola e oro**» (sciarpe, pettorina, «isola viola») ma i loro fumogeni sono «**bianchi e blu**» e lo stemma del Waterline è bianco e blu: ho pensato a due tifoserie diverse (C36-04).
  - Due chiamate ignorano quello che avevo deciso: dopo «Falli cambiare in biglietteria» («Gli ospiti vanno al posto giusto») arrivano «quaranta del Waterline in curva Skyfield coi biglietti doppi»; dopo «Pretendi i rimborsi subito» («Gli sportelli rimborsano») a fine partita «duemila persone vogliono indietro i soldi… Abbiamo due sportelli» (C36-02, GIUDIZIO: il secondo si può leggere come una seconda ondata di rimborsi).
  - Il verbale dice «rimborsi promessi»: io li avevo fatti subito e con sei sportelli.
  - Mai annoiato; la curva ospiti scoperta per due ondate senza nessuna chiamata che la segnalasse mi ha colto di sorpresa (la rete diceva «arriva in pochi», FALSA: giusto così).

## 4.4 e22 Il derby dei sospetti (giocato bene)

Foto `e22-*`.
- **FATTO:** o1 piazza del municipio scoperta; o2 «Fiducia +1: nessun settore scoperto»; o3 curva Skyfield scoperta, tono «calmo»; **o4 piazzale, strada da Kiln e piazza del municipio scoperti**. Verbale «CONTENUTO», **3 stelle**: «Derby finito, **piazza svuotata**…».
- **IMPRESSIONE DA GIOCATORE:**
  - L'episodio più teso e più personale: la tua foto sul cartello, il coro col tuo nome «in rima», «Resto.» in diretta. Il vice è al suo meglio («Io ci ho messo quindici anni ad arrivarci»).
  - La mappa dell'ondata 1 mostra il corteo sulla strada da Kiln mentre Lavezzari giura «in pullman, nessun corteo»: la mappa mi ha detto chi mentiva prima della chiamata. Bello, ma toglie la sorpresa.
  - Tre settori scoperti nell'ultima ondata, la piazza del municipio in «Protesta… SCOPERTO», e il verbale dice «piazza svuotata» con tre stelle: risultato che mi è sembrato regalato (lo stesso effetto che il C-035 ha descritto per e26).
  - «Steward sotto lo striscione Kiln» mostra il bollino «Steward · **Curva Skyfield**» (C36-07).
  - Intestazione «KILN UNITED contro SKYFIELD ATHLETIC» in un «derby in collina» dove il «club di casa» è lo Skyfield: non ho capito chi giocava in casa. **Non posso confermare** che l'ordine dell'intestazione voglia dire casa/fuori: per i derby senza `partita` nei dati l'ordine viene dalle curve della mappa (`src/resa/stemma.tsx:113-121`).

## 4.5 e28 La trappola (sbagliato apposta)

Foto `e28-*`.
- **Cosa ho fatto:** creduto al messaggio anonimo (bassa: «il Fabbro è al magazzino delle fonderie») e a Lavezzari («curva tranquilla, garantisco io»); tre squadre e il mediatore al magazzino per tutta la sera; «lascia parcheggiare», «aspetta una seconda conferma», «pista della soffiata», «lascialo andare verso il porto», «nomi compresi».
- **FATTO:** o1 strada da Kiln scoperta; o2 curva Kiln, piazzale e banchine scoperti; o3 curva Kiln e banchine degenerate («Fiducia −2»); o4 banchine e strada scoperte. «DEGENERATO FUORI CAMPO», «riparti dall'ondata 2». **Fiducia 9/10** al fallimento (C33-13).
- **IMPRESSIONE DA GIOCATORE:**
  - Il racconto della trappola funziona: l'anonimo che scrive «venite in tanti», il vice che capisce («vuole sapere quanti siamo»), il testimone che dopo il rapporto «nomi compresi» non risponde più. Il verbale («La trappola è scattata dalla parte sbagliata… al porto non c'era più nessuno. Qualcuno ha avvisato in tempo») racconta proprio la mia serata.
  - In o3 il testimone dice «Qualcuno li ha avvisati che **li state guardando**», ma io avevo scelto di non guardare il porto («aspetta una seconda conferma», «il porto resta senza occhi») (C36-02).
  - Le scelte sbagliate mi hanno dato fiducia a ogni passo (5 → 9): «lascia parcheggiare» +2, maxischermo +1, «lascia intendere» +1, «nomi compresi» +2. Perdere con la barra quasi piena stona.

## 4.6 e32 Il derby della città (giocato bene)

Foto `e32-*`.
- **FATTO:** o1 piazzale scoperto dopo «Ignora: è una voce» («Poi arrivano altri quaranta»), tono «calmo»; o2 strada da Skyfield scoperta, «calmo»; o3 piazzale e strada da Kiln scoperti, «calmo»; o4 le due strade scoperte. Verbale «CONTENUTO A FATICA», 2 stelle («Fiducia ≥ 5: hai 2»). Fra le scelte che «ti hanno penalizzato»: «**Ignora: è una voce** · +2 pressione su Piazzale dello stadio»; fra le fonti: «Voci in rete — **FALSA**».
- **IMPRESSIONE DA GIOCATORE:**
  - Il quinto derby chiude bene il cerchio («la cartina del primo giorno, con le stesse cinque crocette»; «Il primo giorno era lo stesso incrocio»). Il finale «Il titolo della mia autobiografia» si sente.
  - **Mi sono sentito punito per aver ragionato bene:** la voce in rete era falsa (lo dice il verbale), l'ho ignorata come suggeriva il costo «se fosse vera, il piazzale sale», e il piazzale è salito lo stesso (C36-01).
  - La «i» dell'ondata 1 dice «le due tifoserie partono in corteo» e così smentisce subito il ragazzo delle sciarpe («Kiln senza corteo»): come C34-09 in e21 (C36-06).
  - «Uscita verso la collina, scortata» («Il piazzale resta a Kiln»), poi nell'ondata 4 «i due deflussi si vedono. Cento metri. Cinquanta» sul piazzale (C36-02).
  - «Fai aspettare il corteo di Kiln» con il bollino «Squadre · **Strada da Skyfield**» (foto `e32-o1-due_cortei-bollino.jpg`, C36-07).

## 4.7 Insieme (IMPRESSIONE DA GIOCATORE)

- **Cosa funziona:** le fonti smascherate nel verbale (e09 e e14 le migliori), il vice, i finali; ogni episodio ha un'idea chiara in due righe di sala operativa. Mai annoiato davvero: 3 chiamate per ondata sono il ritmo giusto.
- **Dove mi sono perso:** scelte che il seguito ignora (4 episodi su 6, C36-02); un'opzione «se fosse vera» che punisce chi non ci crede (C36-01); bollini che mandano l'unità nel settore sbagliato (C36-07); la fiducia che sale mentre perdo (e28).
- **Testo, mappa e vignetta:** testo e mappa coincidono quasi sempre, e la mappa a volte anticipa troppo (e22, e32). La vignetta del rapporto non si vede mai (26/26, C33-06); quelle del verbale sì. Il tono del rapporto è «calmo» con settori scoperti 7 volte su 26 (C33-07).
- **Conseguenze:** giuste quando riguardano i settori (pressioni e scoperti si capiscono dal rapporto); meno quando riguardano la storia (C36-02) e la fiducia (e03 −2 per i rinforzi, e28 +4 per scelte sbagliate).
- **Finali:** si sentono in e03, e09, e22, e28, e32; e14 più neutro.

# Rilievi nuovi (per gravità)

## Alto

Nessuno.

## Medio

**C36-01: un'opzione che dice «se fosse vera» toglie la stessa pressione anche quando la voce è falsa: chi legge bene le fonti viene punito.**
- FATTO (dati): `node coordination/sonde/c36-se-fosse-vera.mjs .` (`uscite-c36/se-fosse-vera.log`): 3 opzioni col costo «se fosse vera/se la voce è vera»; in 2 l'effetto è senza condizione e la voce è dichiarata **falsa** nel briefing:
  - e32 o1 `piazzale_anonimo/ignora_piazzale` (`data/missioni/e32.json:265`), costo «Nessun costo subito; se fosse vera, il piazzale sale.» (`data/testi/it/e32.json:34`), effetto pressione piazzale **+2**; fonte `voci_in_rete` sul piazzale `"vera": false` (`data/missioni/e32.json:34`); risposta «Poi arrivano altri quaranta» (`:35`).
  - e28 o1 `voce_magazzino/ignora_anonimo` (`data/missioni/e28.json:176`), «se fosse vero, il magazzino si scalda» (`data/testi/it/e28.json:17`), effetto pressione magazzino **+1**; fonte `messaggio_anonimo` `"vera": false` (`data/missioni/e28.json:31`).
- A schermo (e32, partita): piazzale «SCOPERTO» in o1 e, nel verbale, «Ignora: è una voce» fra le scelte che **penalizzano**, sulla stessa pagina che dà «Voci in rete — FALSA».
- GIUDIZIO: media perché tocca il cuore del gioco (credere o no alle fonti) e succede **sempre** a chi sceglie bene.

**C36-02: risposte che il seguito ignora: chiamate senza `dopo` che raccontano il contrario di quello che il giocatore ha appena scelto (la classe di C34-03, in 4 dei 6 episodi giocati).**
- FATTO (dati; nessuna di queste chiamate ha `dopo`, verificato in riga di comando sui file delle missioni):
  - e09: dopo `verifica_foto` («il carro attrezzi trova la piazzola vuota», `data/testi/it/e09.json:88`) arriva sempre `furgone_sparito` («Col carro attrezzi in manovra, furgone grigio sparito», `:116`; `data/missioni/e09.json:729`): il furgone sparisce due volte.
  - e28: dopo `aspetta_testimone` («le banchine restano da sole», `data/testi/it/e28.json:34`) e `pista_fonderie` («il porto resta senza occhi», `:55`) arriva sempre `talpa_sospetto` «Qualcuno li ha avvisati che li state guardando» (`:69`; `data/missioni/e28.json:503`).
  - e32: dopo `uscita_collina` («La festa esce dal lato della collina… Il piazzale resta a Kiln», `data/testi/it/e32.json:84`) arriva sempre `incrocio` «i due deflussi si vedono» sul piazzale (`:95`; `data/missioni/e32.json:646`).
  - e14: dopo `cambio_biglietti` («Gli ospiti vanno al posto giusto», `data/testi/it/e14.json:23`) arriva `ospiti_sbagliati` «quaranta del Waterline in curva Skyfield coi biglietti doppi» (`:52`; `data/missioni/e14.json:380`); dopo `rimborsa_ora` («Gli sportelli rimborsano», `:81`) arriva `sportelli` «duemila persone vogliono indietro i soldi… Abbiamo due sportelli» (`:103`; `data/missioni/e14.json:686`). GIUDIZIO: i due casi di e14 si possono leggere come gruppi diversi; quelli di e09, e28, e32 no.
- Tutti visti a schermo nella partita (foto `e09-o3-foto.jpg`, `e09-o4-sparito.jpg`, `e28-o3-talpa.jpg`, `e32-o3-festa.jpg`, `e32-o4-incrocio.jpg`, `e14-o2-estrai.jpg`, `e14-o4-sportelli.jpg`).
- GIUDIZIO: media perché è lo stesso tipo di difetto che la 0.35.0 ha corretto per la barca di e35 (C34-03), e l'ho incontrato in 4 episodi su 6 senza cercarlo. Non ho fatto una scansione di tutti i 36 episodi: **non posso confermare** quanti altri casi ci siano.

## Basso

**C36-03: il difetto di C34-06/C35-04 (verbale di fallimento che nomina luoghi non degenerati) c'è anche in altri episodi.**
- FATTO MISURATO: `node coordination/sonde/c36-fallimenti-tutti.mjs . 1000` (bot casuale, 1000 semi per episodio, `uscite-c36/fallimenti-tutti.log`): per ogni episodio, partite fallite e in quante ogni settore è degenerato, accanto al testo del verbale. Esempi in cui il verbale nomina un luogo preciso (GIUDIZIO sulla scelta del luogo):

| episodio | il verbale dice | settore | degenerato nelle partite fallite |
|---|---|---|---|
| e09 | «Coda ferma fino a notte, scontri sulla rampa dello stadio» | Tangenziale | 71/642 (11%) |
| e24 | «una notte lunghissima davanti al municipio» | Piazza del municipio | 96/697 (14%) |
| e26 | «carosello fuori controllo, pullman bloccati, un piazzale ingestibile» | Piazzale dello stadio | 89/618 (14%) |
| e29 | «Strada piena fino al porto, **piazzale fuori controllo**» | Piazzale dello stadio | **9/654 (1%)** |
| e31 | «viale occupato, stazione piena fino a notte» | Viale della stazione | **11/638 (2%)** |
| e05 | «cancelli forzati» | Tornelli | 149/560 (27%) |
| e12 | «Piazza del comune bloccata» | Piazza del comune | 184/779 (24%) |

- A schermo: e09 (§ 4.2), con la tangenziale «SOTTO CONTROLLO» in tutte le ondate del secondo giro.
- Stessa classe di C35-04 (aperto, solo e35); il guardiano `tests/c34-dati.test.ts` controlla e13 ed e17.

**C36-04: e14, i tifosi del Waterline City sono «viola e oro» nei testi, ma il club è bianco e blu e i loro fumogeni «bianchi e blu».**
- FATTO: `data/club/waterline_city.json:1` colori `#ffffff` / `#0d47a1`; «viola e oro» / «viola» in `data/testi/it/e14.json:24`, `:55`, `:58`, `:74`; «fumogeni bianchi e blu» `:71` (chiamata `fumo_viola`). Visto a schermo (foto `e14-o1-cambio.jpg`, `e14-o3-fumo.jpg`). Testi presenti uguali anche nella 0.33.0, 0.34.0 e 0.35.0 (5 «viola» in ognuna).
- IPOTESI: resto di un club precedente; non verificata.

**C36-05: e03, la fonte del comitato (VERA nel verbale) parla di «sabato, amichevole», ma la serata è una notte di coppa e «domani c'è scuola».**
- FATTO: `data/testi/it/e03.json:121` «sabato, amichevole: auto sui passi carrabili fino alle 2», fonte `"vera": true` (`data/missioni/e03.json:24`); titolo «Notte di coppa» (`:118`), sala «Coppa di notte col Garden» (`:119`), chiamata «domani c'è scuola» (`:54`). A schermo nel verbale (foto `e03-verbale-p-*.jpg`).

**C36-06: e32, la «i» dell'ondata 1 smentisce la fonte dell'informatore (stesso tipo di C34-09).**
- FATTO: «Prima del derby: le due tifoserie partono in corteo» (`data/testi/it/e32.json:10`) contro «Kiln senza corteo» (`:8`, fonte `informatore_di_strada` `"vera": false`, `data/missioni/e32.json:41`). A schermo: foto `e32-o1-info.jpg`.
- GIUDIZIO: la fonte è di affidabilità bassa, quindi il danno è piccolo; ma è la stessa regola che C34-09 ha fatto correggere in e21.

**C36-07: il bollino dell'unità impegnata nomina il settore della chiamata anche quando il testo la manda altrove.**
- FATTO (codice): `src/resa/effetti-opzione.tsx:21` scrive «‹unità› · ‹settore della chiamata›»; anche l'unità che vola sulla mappa va al settore della chiamata (`src/resa/App.tsx:254`).
- FATTO MISURATO: `node coordination/sonde/c36-bollini-unita.mjs .` (`uscite-c36/bollini-unita.log`): 224 opzioni impegnano un'unità in una chiamata con settore; in **10** gli effetti non toccano il settore della chiamata. Con il testo che dice un altro settore (GIUDIZIO): e16 o3 `steward_cinder` «Steward in curva Kiln» → «Steward · Curva ospiti»; e16 o3 `cerca_fonderie` «cercarlo alle fonderie» → «· Curva Kiln»; e22 o3 `steward_str22` «Steward sotto lo striscione Kiln» → «Steward · Curva Skyfield»; e32 o1 `ferma_cinderwick` «Fai aspettare il corteo di Kiln» → «Squadre · Strada da Skyfield». Gli altri 6 (scorte che partono dal settore della chiamata) li leggo come giusti.
- A schermo: foto `docs/foto/c36/giocatore/e32-o1-due_cortei-bollino.jpg` (pagina intera).

# Verificati e chiusi

| rilievo | misura |
|---|---|
| **C35-01** e35 salvataggio vecchio | 0.34.0 → 0.36.0 **74/74**, 0.35.0 → 0.36.0 **74/74** punti senza difetti; rosso 0.34.0 → 0.35.0 72/74 con i 2 casi di C35-01; guardiano 12/12, rosso 11/12 |
| Regressioni | bot identico alla 0.35.0, 0 blocchi; 253/253; tipi 0; schermate 4 × 1916 identiche alla 0.35.0; salvataggi 0.33.0/0.34.0/0.35.0 ripresi; console 0 |

# Note di metodo e limiti

- **Misura ritirata:** nessuna. Nella prima stesura della sonda `c36-fallimenti-tutti.mjs` i nomi dei settori non uscivano (lettura sbagliata della mappa, che è una lista): corretto prima di usarne i numeri; i conteggi non cambiano.
- **Incidenti di sessione:** un giro di tocchi su un pulsante assente («passo») ha atteso i 30 s di Playwright per tocco ed è finito in sottofondo; l'ho atteso in primo piano fino alla fine. Nessun riavvio del container.
- **Rumore:** fino a 5 browser e carico medio fino a 28; le misure contano passi, e bot e opzioni sparite sono identici al C-035.
- **Non misurato:** telefoni, tablet e PC veri; WebView dell'APK; lettori di schermo; tastiera; catena completa (`node tools/catena.mjs`, non lanciata per non scrivere `STABILITA.json` da collaudatrice); salvataggi della 0.32.0 e precedenti; foto dei salvataggi solo a 360 (la 0.36.0 non cambia nessuna schermata).
- **Partita:** episodi intermedi segnati a mano (le variabili della storia non vengono da scelte vere); un solo giocatore; durata in minuti di gioco non misurabile; C36-02 trovato giocando, **non** con una scansione completa.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c36-salvataggi-e35.mjs` | salvataggi veri di una versione A in tutti i punti di e35 (sala, su e dopo ogni chiamata, due rami, due risposte alla barca), ripresi in B; due barche, ramo smentito, doppie, blocchi | `node coordination/sonde/c36-salvataggi-e35.mjs <A> <B> <cartella> <uscita.json> [foto] [filtro]` |
| `c36-fallimenti-tutti.mjs` | per ogni missione: partite fallite, settori degenerati, testo del verbale di fallimento | `node coordination/sonde/c36-fallimenti-tutti.mjs <radice> [N] [missioni]` |
| `c36-ripartenza.mjs` | da una sconfitta vera, quante partite si vincono ripartendo da un'ondata | `node coordination/sonde/c36-ripartenza.mjs <sconfitta.json> <ondata> [N]` |
| `c36-se-fosse-vera.mjs` | opzioni «se fosse vera» con effetti e verità delle fonti | `node coordination/sonde/c36-se-fosse-vera.mjs [radice]` |
| `c36-bollini-unita.mjs` | opzioni che impegnano un'unità fuori dal settore della chiamata | `node coordination/sonde/c36-bollini-unita.mjs [radice]` |
| `c36-schermate-blocchi.sh` | `c29-schermate.mjs` a blocchi, uscite in `uscite-c36` | `bash coordination/sonde/c36-schermate-blocchi.sh <1-4> <foto>` |
| `c36-giocatore-aiuti/` | aiuti del pilota coi percorsi di questa sessione, senza anteprima dei dati | vedi `LEGGIMI.md` |
