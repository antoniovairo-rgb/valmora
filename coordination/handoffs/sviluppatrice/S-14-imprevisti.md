# S-14 · Imprevisti senza timer (PO-022, D-190) · FASE 2, blocco 1: logica + e01–e06

Ramo `claude/valmora-tempo-reale`. Scelta del PO (D-190): «non voglio che il gioco metta ansia», «Imprevisti senza timer».
Una volta per ondata un imprevisto interrompe la sequenza delle chiamate e va risolto subito, **senza conto alla rovescia**.
Il prototipo dei tempi (modi a/b/c) è **tolto** dal codice (era in b0c1710; resta solo il rapporto `S-14-tempo-reale.md`).

## 1. Come funziona (FATTO, dal codice)

- **Dati separati dalle missioni:** `data/imprevisti/<episodio>.json`, schema `schema/imprevisti.schema.json`. Così S-13 ed
  S-15 possono lavorare sui file delle missioni senza conflitti. Ogni voce ha l'ondata, `dopo` (quante chiamate dell'ondata
  vengono prima) e una chiamata con la stessa forma delle altre (riusa lo schema della chiamata, `$ref`).
- **Innesto al caricamento:** `src/dati/imprevisti.ts:13` mette la chiamata nella lista dell'ondata alla posizione `dopo`,
  col segno `imprevisto: true` (campo nuovo dello schema, `schema/missione.schema.json:295`). Da lì in poi è una chiamata
  come le altre: stesso motore (`src/logica/missione.ts` non cambia), stesso bot, stesse regole di uscita. L'innesto è
  idempotente (`imprevisti.ts:17`).
  - Il gioco lo usa in `src/resa/dati.ts:43`.
  - Gli strumenti e le catene lo usano in `tools/dati-disco.mjs:20`.
  - La validazione lo usa in `src/dati/valida.ts:11`.
- **Rosso `__NO_S14I01`:** nessun innesto, il gioco di prima (`imprevisti.ts:14`). È il braccio «prima» di tutte le misure.
- **Deterministici:** la posizione è nei dati, senza nessun sorteggio. Con lo stesso seme la partita è identica
  (guardiano, sotto).
- **Controlli di significato** (`imprevisti.ts:37`):
  - un solo imprevisto per ondata;
  - deve interrompere: almeno una chiamata prima e una dopo;
  - niente `se`/`dopo`/`senza`: arriva sempre;
  - opzioni senza condizioni, quindi c'è sempre un'uscita;
  - id unico nell'episodio;
  - **nessun effetto che dia fiducia** (`:56`). Toglierla si può: è nel verso del risultato (D-160).
- **Resa** (`src/resa/schermate/Ondata.tsx:94-96`): sopra la chiamata compare la fascia «Imprevisto: interrompe le chiamate»
  (magenta, `src/resa/stile-c18.css:125`). Nessun timer. Timbro «Urgente!» e spicchio d'orologio restano quelli di D-129
  (solo con un evento di pressione ≥ 4 sul settore): lo spicchio suggerisce il tempo, e il PO non lo vuole. Rosso
  `__NO_C190I01`: chiamata come le altre.

## 2. Contenuti: 22 imprevisti in e01–e06 (uno per ondata)

| ep | ondata · dopo | imprevisto | settore |
|---|---|---|---|
| e01 | 1·2 · 2·2 · 3·2 | ambulanza bloccata dai pullman · buio in curva Skyfield · tram guasto davanti al piazzale | strada Skyfield · curva Skyfield · piazzale |
| e02 | 1·2 · 2·3 · 3·2 · 4·2 | cambio di binario · sciarpa strappata in stazione · acquazzone sulla curva ospiti · ultimo treno soppresso | stazione · stazione · curva ospiti · stazione |
| e03 | 1·2 · 2·2 · 3·1 · 4·2 | carro attrezzi incastrato · cane in campo · musica dai balconi · bus notturno che salta la fermata | quartiere · curva ospiti · quartiere · parcheggi |
| e04 | 1·2 · 2·2 · 3·3 | ghiaccio del camion del pesce · bambino perso ai varchi · tendone del mercato come bandiera | mercato · piazzale · strada da Kiln |
| e05 | 1·1 · 2·2 · 3·1 · 4·1 | lucchetto al cancello · tabellone sbagliato · steward in sciopero con la pettorina girata · pullman ospite sulla strada sbagliata | tornelli · curva ospiti · curva Skyfield · strada Skyfield |
| e06 | 1·2 · 2·2 · 3·1 · 4·4 | allarme della banca alla prova del suono · palloncini sul campo · corrente saltata sul palco · metro chiusa | piazza · curva Kiln · piazza · viale |

- Ogni imprevisto ha 3 risposte, con l'accenno di costo (D-078) e la risposta del vice. Lo schema tipico:
  - **intervieni**: un'unità impegnata per il resto della missione, −2 di pressione;
  - **arrangia**: −1 qui, +1 altrove, oppure +1 di tensione;
  - **lascia correre**: nessuno impegnato, da 0 a +2 di pressione.
- Testi nei file `data/testi/it/e01…e06.json` (chiavi `eXX.imp.*`). Chiamate ≤ 100 caratteri (guardiano PO-084/085 verde).
  Coerenti con la trama: Varrone, Lavezzari e il Fabbro non vengono toccati. Nessun riferimento reale, nessuna violenza in scena.
- Fiducia: nessuna risposta la dà. Due risposte di e02 la tolgono (−1), entrambe «lascia correre» in stazione, col costo
  scritto: «Lasciali cercare» per la sciarpa e «Fai annunciare e basta» per il treno soppresso. Servono a D-160: senza, la
  fiducia media nelle partite perse di e02 saliva (+0,10).

## 3. Misure prima/dopo (FATTO MISURATO)

Comando: `node tools/misura-imprevisti.mjs 1000 e01,…,e07`, 1000 semi (gli stessi del passo «bot» della catena). Tabella
completa in `s14/misura-imprevisti-blocco1.md`.

| ep | casuale: fallite prima → dopo | stelle medie del casuale | attenta (stelle) | equilibrata (stelle) | peggiore |
|---|---|---|---|---|---|
| e01 | 56,7% → 57,0% | 0,45 → 0,45 | 2 → 2 | 3 → 3 | 0 → 0 |
| e02 | 56,0% → 61,3% | 0,47 → 0,42 | 3 → 3 | 3 → 3 | 0 → 0 |
| e03 | 55,7% → 61,4% | 0,50 → 0,42 | 2 → 2 | 3 → 3 | 0 → 0 |
| e04 | 55,2% → 60,6% | 0,47 → 0,41 | 3 → 3 | 3 → 3 | 0 → 0 |
| e05 | 60,4% → 60,0% | 0,41 → 0,41 | 2 → 2 | 1 → 1 | 0 → 0 |
| e06 | 61,7% → 59,8% | 0,40 → 0,44 | 2 → 2 | 3 → 3 | 0 → 0 |
| e07 (senza imprevisti) | 63,2% | 0,39 | 2 | 3 | 0 |

- **Curva D-154/D-108** (fallite del casuale, mai giù di oltre 1 punto fra episodi consecutivi):
  - valori: 57,0 · 61,3 · 61,4 · 60,6 · 60,0 · 59,8 · 63,2 → verde;
  - margini stretti: e04 contro e03 0,2 punti, e05 contro e04 0,4, e06 contro e05 0,8;
  - prima della ritaratura gli imprevisti alzavano le fallite fino a 10 punti, e la curva era rossa fra e06 ed e07;
  - ritarato coi dati, mai con le soglie.
- **Crescita fra stagioni D-162** (media delle fallite del casuale per stagione), prima → dopo:
  - stagione 1: 62,64 → 63,84; stagione 2: 64,22 → 64,22; stagione 3: 67,91 → 67,91;
  - verde, ma la stagione 1 è sotto la 2 di soli 0,38 punti;
  - un primo giro della catena era rosso qui (stagione 1 a 64,9). Per questo e05 ed e06 ora sono un po' più facili per il
    casuale (−0,4 e −1,9 punti), mentre i bot attento ed equilibrato non cambiano;
  - quando le stagioni 2 e 3 avranno i loro imprevisti, la media va rimisurata.
- **Stelle D-181:** i bot attento, equilibrato e peggiore hanno le stesse stelle in tutti e 6 gli episodi. Le 3★ non si
  gonfiano: e05 «attenta» saliva a 3★ con il primo «tabellone», corretto togliendo la pressione a quella risposta.
- **Fiducia D-160:** Δ medio nelle partite perse, prima → dopo (`deltaFallite`, 1000 semi):
  e01 −0,80 → −0,88 · e02 −0,10 → −0,54 · e03 −1,51 → −1,75 · e04 −0,27 → −0,34 · e05 −0,97 → −0,72 · e06 −3,06 → −3,06.
  Tutti ≤ 0.
- **Bilancio del verbale (C36-03):** quota di partite perse in cui degenera il luogo nominato dal verbale:
  - e02 stazione: 52,4% → 52,4%;
  - e03 quartiere: 54,9% → 53,6%;
  - tutti ≥ 50% (`tests/c36-dati.test.ts` verde).
- **Bilancio del verbale C38-03:** la tabella precalcolata `src/logica/confronti.json` è rigenerata (`node tools/confronti.mjs`),
  e il test D-174 è verde.
- **Ripartenza C17-06:**
  - Con una chiamata in più per ondata, la stima veloce (60 partite) sbagliava un caso: e04 seme 1, ondata 2, stima 0,267
    contro un calcolo esatto di 0,366, soglia 1/3.
  - Ora la stima usa 150 partite (`src/logica/ripartenza.ts:57`) e torna uguale al calcolo esatto: ondata media 3,092 contro 3,092.
  - Tempo massimo di una ripartenza: 119 ms, contro 75 di prima (misurato dal test, Node, non sul telefono).
- **Blocchi:** 0 su tutte le partite dei bot.

## 4. Salvataggi

- **Nessun campo nuovo nel salvataggio**: l'imprevisto è una chiamata dei dati e la sua risposta finisce in `risposte` e in
  `scelte` come le altre. Per la regola di `src/salvataggi/salvataggio.ts:2` («ogni campo nuovo = SAVE_VERSION + 1»)
  **SAVE_VERSION resta 2**. Lo dichiaro come scelta tecnica, da confermare dalla principale, perché la consegna chiedeva una
  SAVE_VERSION nuova con migrazione.
- **Misurato sul salvataggio vero** `tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json` (e02 a metà dell'ondata 2):
  - si migra;
  - l'imprevisto `imp_sciarpa` compare fra le chiamate aperte;
  - il bot gioca fino all'esito.
  Guardiano in `tests/imprevisti.test.ts`. Gli altri 3 salvataggi veri passano nella catena (passo `salvataggi-reali`).

## 5. Guardiano e braccio rosso

`tests/imprevisti.test.ts` (6 test) controlla:
- presenza e posizione degli imprevisti;
- idempotenza dell'innesto;
- rosso `__NO_S14I01`, che rende le missioni identiche ai file;
- i controlli di significato, rossi su ogni regola rotta (nessun controllo cieco);
- determinismo col seme;
- nessun soft-lock: ognuna delle 66 risposte forzata porta a un esito; dove l'unità è finita l'opzione è spenta (D-153) e
  resta sempre un'uscita;
- il salvataggio vero di prima.

## 6. Foto (360, 375, 412 px)

`npx vite build && node tools/foto-imprevisti.mjs` → `s14/imprevisti/`:
- e01 `imp_ambulanza`;
- e02 `imp_sciarpa`;
- e05 `imp_tabellone`;
- più `-360-rosso.png` con `__NO_C190I01`.

Esito misurato:
- 9 foto, 0 difetti: avviso presente e visibile, nessun timer, nessuno scorrimento orizzontale;
- braccio rosso: avviso assente in 3 casi su 3.

## 7. Catene e CI

- `npx vitest run`: 68 file, 355 test verdi.
- Catene governo + logica, 3 giri: vedi messaggio di consegna (esito e hash).
- CI 7/7: vedi messaggio di consegna.

## 8. Non verificato

- e07–e36: imprevisti non ancora scritti (blocchi successivi).
- Prova sul telefono vero e tempo della ripartenza sul telefono.
- Giudizio del PO sui testi degli imprevisti.
- La sensazione di «tensione» in una partita vera.
- I margini stretti (curva 0,2-0,8 punti, D-162 0,38 punti) dopo i blocchi successivi: vanno rimisurati a ogni blocco.

## 9. Blocchi successivi (proposta)

- **e07–e09:** nessun conflitto (fuori dalle aree di S-13 ed S-15), stesso metodo.
- **e10–e24 (S-13) ed e25–e36 (S-15):** i dati vanno in `data/imprevisti/`, senza conflitti. I **testi** però oggi stanno nei
  file `data/testi/it/eXX.json` che S-13 ed S-15 stanno rifinendo.
  - Proposta: file di testi separati `data/testi/it/imp_eXX.json`. Va esteso il guardiano della brevità, che oggi legge solo
    `eXX.json`, così i testi degli imprevisti restano controllati.
  - Oppure ci si coordina con S-13 ed S-15 via `send_message` prima di toccare i loro file.
- Curva: con tutti i 36 episodi la curva va rimisurata intera. Il casuale perde di più, e la soglia di D-154 vale sul valore relativo.
