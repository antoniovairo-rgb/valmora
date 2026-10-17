# Collaudo C-037: 0.37.0 (tastiera C34-01/C34-08, fiaccolata di e30 C33-02, etichette C33-03…05), regressioni, salvataggi 0.36.0 e partita da giocatore (PO-120)

- **Build collaudata:** main a d2fdf88 (rilascio 78b865e), GAME_VERSION 0.37.0 (`src/versione.ts:261`, commento `:251-260`); `npm ci` e `npx vite build` verdi.
- **Cosa è cambiato nel gioco** (`git diff --stat fdad627 d2fdf88 -- src schema data tools tests`): `data/missioni/e30.json:612` (`fiaccole` `verso: dalla_meta`), `schema/missione.schema.json:265`, `src/logica/tipi.ts:28`, nuovo `src/resa/fuoco-titolo.ts`, `src/resa/schermate/{Scena,Schieramento,Tripla,Archivio}.tsx`, `src/resa/mappa/{etichette.ts,folla.ts,StratoPixi.tsx}`, test e strumenti di foto.
- **Versione di confronto:** 0.36.0 a fdad627, worktree separato nella mia area di lavoro, `npx vite build` verde.
- **Ramo:** claude/valmora-collaudo-c037, da main d2fdf88. Sola lettura sul gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-17. Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, SwiftShader), DPR 1, Node 22.22. Fino a 8 browser insieme, carico medio fino a 60: vedi «Note di metodo» (una corsa ritirata).
- **Sonde:** riprese dai rami C-028…C-036 senza modifiche (copiate in `coordination/sonde/`); nuova `c37-tripla.mjs`; aiuti della partita in `coordination/sonde/c37-giocatore-aiuti/`. Uscite in `coordination/sonde/uscite-c37/`, foto in `docs/foto/c37/`, salvataggi veri 0.36.0 in `coordination/sonde/salvataggi-036/`.

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, marcato) · **IPOTESI** (marcata) · **IMPRESSIONE DA GIOCATORE**.

## Riepilogo

| verifica | esito |
|---|---|
| **C34-01** Invio su «Conferma» del riepilogo | fuoco sul titolo «Il tuo schieramento» in **5/5** finestre, il secondo Invio **non** conferma (0.36.0 e rosso C104R01: 5/5 confermano senza riepilogo, 3/5 col pulsante fuori finestra). Conferme a 3 passi (rigioca, nuova partita): Invio ripetuti **fermi al passo 2** (0.36.0 e rosso: le 3 conferme attraversate senza Tab). **Chiuso** |
| **C34-08 / D-142** Tab entrando in scena nuova | stagione 1 **2** Tab (0.36.0 10, rosso C105S01 10), prima unità **1** (0.36.0 9–10, rosso 9), 3/3 corse. Ma il totale e01+e19 a 1366 non scende: **553** contro 546 (0.36.0): il costo si sposta sulle scene a un comando → **C37-02** |
| **C33-02 / D-141** fiaccolata e30 o4 | 360: ondata **6/63** si avvicinano/allontanano dal municipio (rosso C99M01: 62/8), chiamata `fiaccolata` 0/39 (rosso 37/2); 1366 uguale. Salvataggio 0.36.0 in e30 o4 riaperto: stessa chiamata, `>entra` → `>esce`. **Chiuso** (nota di testo: C37-09) |
| **C33-03** e06 a 360, tocco coperto | **0** in 2/2 giri e nella partita (10/10 posate una alla volta); 0.36.0: **1**. Rosso C102D01: 0, rosso C103P01: 0 (**il rosso non lo mostra**, vedi § 1.4) |
| **C33-04** etichette diverse fra due giri | **0/138** ondate diverse fra due giri a 360 (4 non aperte nel giro 1 per carico) |
| **C33-05** pastiglie più vicine al disco altrui | 360/375/412: **29–30 / 18 / 8** gruppi (0.36.0 a 360: 44; rosso C102D01+C103P01: 44). **Chiuso** |
| Regressione nuova sulle etichette | testo del nome fuori dal riquadro a 360: **18** ondate (0.36.0: 11, rosso: 10), massimo **16,8 px** (prima 13,1), testo sopra la pastiglia in **4** ondate (prima 2) → **C37-01** |
| C32-01 fuoco perso dentro la scena | non regredito: fuoco perso dopo l'azione **23/203** (0.36.0: 31/203), fuori finestra **0** (0.36.0: 1), max Tab dopo un fuoco perso 15 (0.36.0: 16) |
| Bot, 1000 semi, tre stagioni | **0 blocchi** in 156/156 righe; «mai comparse» `[]` 36/36; uscita **identica** alla 0.36.0 (`diff` vuoto) |
| Test e tipi | `npx vitest run` **46/46 file, 254/254**; `npx tsc --noEmit -p .` uscita 0 |
| Salvataggi 0.36.0 | veri, dentro l'episodio: o2 **14/14**, rapporto di o3 **14/14**, o4 **13/13** ripresi sulla stessa schermata; import col pulsante 0.36.0 **41/41**, 0.35.0 **41/41**, 0.35.0 in e35 **74/74**; 0 errori |
| Console | **0 errori** in tutte le corse e nei 701 tocchi della partita |
| **Partita da giocatore** | 6 episodi mai giocati nei collaudi C-033…C-036, a 360: e05, e06, **e11 (sbagliato apposta)**, **e19 (sbagliato apposta)**, e24, e33; rilievi nuovi C37-03…C37-08 |

## Misure prima/dopo (PO-122)

| misura | prima (0.36.0, fdad627) | dopo (0.37.0, d2fdf88) | rosso |
|---|---|---|---|
| riepilogo: secondo Invio conferma senza riepilogo (5 finestre) | 5/5 | **0/5** | C104R01: 5/5 |
| Tripla «rigioca» / «nuova partita»: Invio senza Tab attraversano le 3 conferme (360 e 1366) | 4/4 | **0/4** | C104R01: 4/4 |
| Tab fino alla stagione 1 / prima unità (1366, 3 corse) | 10 / 9–10 | **2 / 1** | C105S01: 10 / 9 |
| Tab totali e01+e19 a 1366 (`c28-tastiera`) | 546 (203 azioni) | 553 (203 azioni) | – |
| e30 o4 ondata, municipio si avvicinano/si allontanano (360) | 63/6 (C-034) | **6/63** | C99M01: 62/8 |
| e06 o1 a 360, tocchi coperti (`c29-schermate`) | 1 | **0, 0** | C102D01: 0; C103P01: 0 |
| ondate diverse fra due giri uguali (360) | 6/426 (C-034, 3 misure) | **0/138** | – |
| gruppi più vicini al disco altrui, 360 | 44 | **29 / 30** | 44 |
| testo del nome fuori dal riquadro, 360 (ondate / max px) | 11 / 13,1 | **18 / 16,8** | 10 / 13,1 |
| bot 1000 semi: righe con blocchi | 0/156 | 0/156 (uscita identica) | – |
| `npx vitest run` | 253/253 | 254/254 | – |

# 1. Novità della 0.37.0

## 1.1 C34-01: tastiera nei riepiloghi e nelle conferme

**FATTO (codice).** `useFuocoTitolo` (`src/resa/fuoco-titolo.ts:9-15`) mette il fuoco sul titolo (tabIndex −1) all'apertura del riepilogo (`Schieramento.tsx:160-165`), a ogni passo della Tripla (`Tripla.tsx:13-17`) e della conferma d'importazione (`Archivio.tsx:40-45`). Rosso C104R01.

**FATTO MISURATO.**
- `node coordination/sonde/c34-riepilogo-fuoco.mjs <radice> <uscita> [foto]` (e01, 360×760, 360×640, 375×667, 412×915, 1366×768; `uscite-c37/riepilogo-*.log`):
  - 0.37.0: **5/5** fuoco su `H3.titolo-fuoco` dentro la finestra, il secondo Invio lascia la scena «schieramento». Foto `docs/foto/c37/riepilogo/riepilogo-*.png`.
  - 0.36.0: 5/5 fuoco su «Sì, conferma», **fuori finestra** a 360×640 (y 677), 375×667 (y 692), 1366×768 (y 781); il secondo Invio apre la chiamata.
  - Rosso C104R01: identico alla 0.36.0 (5/5). Il rosso vede il difetto.
- Sonda nuova `W=… H=… [ROSSI=C104R01] node coordination/sonde/c37-tripla.mjs <radice>` (`uscite-c37/tripla-*.log`): Tab fino al «Sì», Invio, poi 3 Invio **senza Tab**.
  - 0.37.0, 360 e 1366: rigioca e nuova partita **fermi al passo 2** (fuoco su `P.tenue`, il titolo «Conferma 2 di 3»).
  - 0.36.0: a 1366 e 360 la «nuova partita» (che cancella la partita salvata) arriva alla **scelta del genere** con Invio ripetuti; la «rigioca» arriva alla sala. Rosso C104R01 uguale.
  - Nella prima corsa a 1366 la 0.37.0 non aveva aperto «Nuova partita» entro 800 ms (carico); rifatta (`tripla-037-1366-bis.log`): passo 2 fermo. Vedi «Note di metodo».
- Conferma d'importazione (`Archivio.tsx`): **non misurata** con la tastiera.

**C34-01 chiuso.**

## 1.2 C34-08 / D-142: fuoco entrando in una scena nuova

**FATTO (codice).** `Scena.tsx:43-46`: entrando in una scena nuova `ultimo = null`, il fuoco va sulla scena; rosso C105S01.

**FATTO MISURATO.**
- `W=1366 H=768 node coordination/sonde/c32-fuoco.mjs <radice>`, 3 corse per versione (`uscite-c37/fuoco/1366-*.log`), più rosso (`fuoco-1366-037-rossoC105.log`) e 360 (`fuoco-360-037.log`):

| Tab necessari | 0.36.0 (3 corse) | **0.37.0** (3 corse) | rosso C105S01 |
|---|---|---|---|
| stagione 1 in città | 10, 10, 10 | **2, 2, 2** | 10 |
| prima unità nello schieramento | 9, 10, 10 | **1, 1, 1** | 9 |
| «Gioca l'episodio» | 12 | 12 | 12 |

- A 360 la 0.37.0 dà 2 e 1, come a 1366.
- `W=1366 H=768 EP=e01,e19 node coordination/sonde/c28-tastiera.mjs <radice> <foto> <uscita>`, `node coordination/sonde/c32-tab-conti.mjs <uscita>` (`tab-conti-1366-036.log`, `tab-conti-1366-037-bis.log`): 203 azioni in tutte e due; **Tab 546 → 553**, mediana 1 → 1, p90 9 → 9, max 16 → 15; fuoco fuori finestra 1 → **0**; fuoco perso dopo l'azione 31 → **23**.
- Dove vanno i Tab (stessa uscita, somma per fase e comando): −59 sulle prime azioni (stagione −9, e01 −9, squadre in o2/o3/o4 −16/−16/−9), **+53 altrove**: comandi unici delle scene che prima avevano già il fuoco (0 Tab) ora ne vogliono 2 (sala «passo», briefing, «rapporto», «avanti» del rapporto, `conferma-rigioca`, `conferma-davvero`), verbale «passo» +6 su 8 azioni, ogni prima opzione di chiamata +1. → **C37-02**.

**C34-08 chiuso** per quello che chiedeva (prima azione 10 → 2); il totale resta uguale (C37-02).

## 1.3 C33-02 / D-141: fiaccolata di e30 o4

**FATTO (dati/codice).** `data/missioni/e30.json:612` `verso: dalla_meta`; `src/resa/mappa/StratoPixi.tsx:80-82` e `:169`; strada con meta `piazza_municipio` (`e30.json:62`). Rosso C99M01.

**FATTO MISURATO.** `W=… H=… EP=e30 [ROSSI=C99M01] node coordination/sonde/c27-pixel.mjs . <foto> <uscita>` (`uscite-c37/pixel-e30-*.log`), ondata 4, numeri «si avvicinano / si allontanano»:

| misura (ondata 4) | **0.37.0, 360** | **0.37.0, 1366** | rosso C99M01, 360 |
|---|---|---|---|
| `data-folla` | `strada_cinderwick>esce` | `>esce` | `>entra` |
| ondata, stadio | 69/0 | 69/0 | 0/70 |
| ondata, municipio | **5/64** (schieramento), **6/63** (chiamata) | 6/63, 7/62 | 62/8, 63/6 |
| chiamata `fiaccolata`, municipio | **0/39** | 0/40 | 37/2 |

- La fiaccolata ora parte dal municipio e va verso lo stadio, come dice D-141. Il rosso rifà C33-02 (verso il municipio).
- Salvataggio vero 0.36.0 in e30 o4 aperto nella 0.37.0 (§ 3): stessa chiamata `fiaccolata`, stessa fiducia, `data-folla` `>entra` → `>esce`. Foto `docs/foto/c37/salvataggi/e30-o4-salvataggio036-in-036.jpg` e `…-in-037.jpg` (a foto ferma i due cortei sembrano uguali; il verso si legge da `data-folla` e dalla sonda di pixel).
- GIUDIZIO: la risposta a «Lasciala andare» dice «Partono di nuovo **dal piazzale**» (`data/testi/it/e30.json:102`), cioè dalla parte dello stadio, mentre ora la mappa li fa arrivare al piazzale → **C37-09**.

**C33-02 chiuso.**

## 1.4 C33-03…05: etichette sulla mappa

**FATTO (codice).** `etichette.ts:50-52` (C33-04, rosso C102D01: si riparte sempre dallo stesso stato), `:88-92` e `:111-116` (C33-05, rosso C103P01: costo per il disco altrui più vicino e per il centro sotto un disco).

**FATTO MISURATO.**
- **C33-03** (e06 o1 a 360, unità messe una alla volta): `W=360 H=760 EP=e06 node coordination/sonde/c29-schermate.mjs <radice> <foto> <uscita>` (`uscite-c37/e06-*.log`), 52 schermate per corsa: 0.37.0 **0** e **0** tocchi coperti (2 giri); 0.36.0 **1** («BUTTON.tocco-pastiglia[ritira Mediatore da Piazza del concerto] coperto da BUTTON.settore-punto»); rosso C102D01 **0**; rosso C103P01 **0**. Nella partita (§ 4.2): 10/10 posate una alla volta, 5/5 dischi liberi a ogni passo.
  - GIUDIZIO: nessuno dei due rossi rifà C33-03 su questa sonda; il guardiano `tools/foto-schieramenti.mjs:163-178` è il controllo dichiarato. Non ho lanciato i due rossi insieme sulla sonda di schermate né il guardiano col rosso: **non posso confermare** quale rosso veda C33-03 (vedi «Non verificato»).
- **C33-04 e C33-05**: `[MISURE=360x760] [ROSSI=C102D01,C103P01] node coordination/sonde/c33-pastiglie.mjs <radice> <uscita> [foto]` (142 ondate per misura; `uscite-c37/pastiglie-*.log`):

| misura | 0.36.0 (360) | **0.37.0** giro 1 (360 / 375 / 412) | **0.37.0** giro 2 (360) | rosso (360) |
|---|---|---|---|---|
| gruppi più vicini al disco di un altro settore | 44 | **29 / 18 / 8** | 30 | 44 |
| pastiglie sopra i nomi (riquadro) | 0 | 0 / 0 / 0 | 0 | 0 |
| centro sotto un altro tocco | 0 | 0 / 0 / 0 | 0 | 0 |
| tocchi di settori diversi sovrapposti | 4 | 2 / 4 / 0 | 2 | 4 |
| pastiglie sopra dischi altrui | 7 | 5 / 6 / 1 | 6 | 7 |
| nomi stretti (ondate) | 46 | 50 / 37 / 4 | 51 | 45 |
| **testo del nome fuori dal riquadro** (ondate) | 11 | **18** / 5 / 1 | **18** | 10 |
| ondate non aperte (carico) | 0 | 4 / 0 / 0 | 0 | 0 |

- **C33-04:** fra giro 1 e giro 2 a 360, posti, nomi stretti, gruppi ambigui e testi fuori sono **identici in 138/138** ondate confrontabili (le 4 non aperte del giro 1 sono escluse). C-034 misurava 6/426 diverse (3 misure).
- **C33-05:** 44 → 29–30 a 360, il rosso torna a 44. Resta e06 o1 a 360: «piazza_concerto (destra): proprio disco 89 px, viale_concerto 14 px» (giro 2).
- **Regressione:** il testo del nome fuori dal riquadro (classe C33-01) passa da 11 a 18 ondate → **C37-01**.

**C33-03, C33-04, C33-05 chiusi** (C33-03 con la riserva sul rosso).

# 2. Regressioni (FATTO MISURATO)

- **Bot** (`node tools/bot.mjs 1000`, `uscite-c37/bot-1000.log`; stessa corsa nella 0.36.0, `bot-1000-v036.log`): 156/156 righe con **blocchi 0/1000**; «chiamate mai comparse» `[]` **36/36**; `diff` delle due uscite **vuoto**.
- **Test e tipi:** `npx vitest run` → «Test Files 46 passed (46) · Tests 254 passed (254)» (`uscite-c37/vitest.log`); `npx tsc --noEmit -p .` uscita 0 (`tsc.log`).
- **C32-01** (fuoco perso dentro la stessa scena): vedi § 1.2: fuoco perso dopo l'azione 23/203 contro 31/203, nessuna fermata fuori finestra. Dopo Spazio su un'opzione il fuoco passa per il body in tutte e due le versioni (0.36.0 3/3 corse, 0.37.0 2/3), poi torna su un comando o sulla scena: a 1366 in 1/3 corse della 0.37.0 è ancora sul body a 2000 ms dopo «continua» (0.36.0: 0/3, va su «home» o sull'indicatore). IPOTESI: tempi sotto carico (fino a 60); con la tastiera vera il Tab successivo riparte comunque (mediana 1 Tab dopo un fuoco perso).
- **C-008 pastiglie e nomi:** pastiglie sopra il riquadro di un nome **0** a 360, 375, 412 (§ 1.4); ma testo fuori riquadro sotto una pastiglia in 4 ondate (C37-01).
- **Console:** 0 errori di pagina e di console in tutte le corse con browser e nella partita (`/fine` dei tre piloti: `{"passi":228,"errori":[]}`, `{"passi":240,"errori":[]}`, `{"passi":233,"errori":[]}`).
- **Schermate complete (36 episodi × 4 finestre): non rifatte** in questo giro (vedi «Non verificato»); fatte solo e06 a 360 (4 corse) e le 142 ondate delle pastiglie.

# 3. Salvataggi 0.36.0 ripresi nella 0.37.0

**FATTO MISURATO.** Build A = 0.36.0 (fdad627), B = 0.37.0, 360×760, tocco.
- `EP=e01,e03,e09,e13,e14,e17,e21,e22,e26,e28,e30,e32,e35,e36 ONDATA=2|4 VA=0.36.0 node coordination/sonde/c33-salvataggi-o4.mjs <A> . coordination/sonde/salvataggi-036 <uscita>` e la stessa con `RAPPORTO=1 ONDATA=3`: il motore 0.36.0 (bot attento, seme 1) gioca fino al punto, lo stato va nella build 0.36.0, «Riprendi», si **esporta col pulsante**; il file si importa col pulsante nella 0.37.0, «Riprendi», si confrontano scena e chiamata.

| punto | ripresi sulla stessa schermata e chiamata | errori importazione | console A / B |
|---|---|---|---|
| ondata 2, chiamata aperta | **14/14** | 0 | 0 / 0 |
| rapporto di o3 | **14/14** | 0 | 0 / 0 |
| ondata 4, chiamata aperta | **13/13** (e01 ha 3 ondate) | 0 | 0 / 0 |

- Import col pulsante e «Riprendi» (`node coordination/sonde/c35-importa-vecchi.mjs . <cartella> <uscita>`): 0.36.0 nuovi **41/41**, 0.35.0 (`salvataggi-035/` del ramo C-036) **41/41**, 0.35.0 dentro e35 **74/74**; 0 errori (`uscite-c37/importa-*.json`).
- e30 o4: § 1.3.
- File: `coordination/sonde/salvataggi-036/` (41 salvataggi e 41 foto della ripresa nella 0.37.0); uscite `uscite-c37/salvataggi-036-*.json`.

# 4. Partita da giocatore (PO-120, D-121)

**Come ho giocato (FATTO).**
- Build 0.37.0 (titolo «Versione 0.37.0 · build d2fdf88»), 360×760, col dito (`hasTouch`), DPR 1, asset veri. Pilota `c33-giocatore.mjs`, tre partite separate (porte 9341, 9342, 9343), aiuti del C-036 coi percorsi di questa sessione più `cop.sh` (tocchi coperti), `vic.sh` (distanze delle etichette), `scegli.sh`, `prossima.sh` (`coordination/sonde/c37-giocatore-aiuti/`).
- Ogni scelta decisa sulla schermata; i dati letti solo **dopo** l'episodio per le citazioni.
- Episodi intermedi segnati a mano come conclusi (`sblocca.sh`: 1 stella, variabili invariate): le variabili della storia degli episodi saltati non vengono da scelte vere. Guida letta intera nelle partite A e B, saltata nella C (genere `f` nel salvataggio senza scelta a schermo).
- Episodi: **e05, e06, e11, e19, e24, e33**, nessuno fra quelli dei collaudi C-033…C-036 (`docs/governo/COLLAUDI.md`). **Sbagliati apposta: e11 ed e19.** e33 giocato dopo e24 nella stessa partita.
- **Durata in minuti di gioco: non posso confermarla** (il gioco non mostra un orologio di gioco). Conto tocchi (`node coordination/sonde/c34-giornale.mjs <giornale>`).
- Giornali `coordination/sonde/uscite-c37/giocatore-{A,B,C}/giornale.jsonl`, salvataggi finali `giocatore-B/`, `giocatore-C/salvataggio-finale.json`; foto `docs/foto/c37/giocatore/` (140). Errori di console: 0.

| episodio | come ho giocato | esito | stelle | tocchi | ondate / chiamate |
|---|---|---|---|---|---|
| e05 Sciopero degli steward | bene | contenuto a fatica | 1 | 100 | 4 / 10 |
| e06 Due eventi, una città | bene | contenuto a fatica | 1 | 115 | 4 / 11 |
| e11 Cassonetti in fiamme | **sbagliato apposta** (creduto a ferrovie e comitato, tutto su stazione e viale) | degenerato fuori campo | 0 | 113 | 4 / 11 |
| e19 La retata mancata | **sbagliato apposta** (tutto sul magazzino, creduto a «quelli dello Studio non vengono») | degenerato fuori campo | 0 | 113 | 4 / 13 |
| e24 Fine stagione | bene | contenuto a fatica | 1 | 107 (±1) | 4 / 12 |
| e33 La talpa | bene | contenuto a fatica | 1 | 110 (±1) | 4 / 12 |

## 4.1 e05 Sciopero degli steward (giocato bene)

- **FATTO:** fiducia 5 → 8 (dopo o2) → 5. o1 «calmo» con la Strada da Skyfield SCOPERTO (C33-07); o2 tornelli e curva ospiti scoperti; o3 piazzale, curva Skyfield, curva ospiti; o4 strada. Vignetta del rapporto nascosta 4/4 (C33-06). Verbale «CONTENUTO A FATICA», «è arrivata all'arancione»; fonti: sindacato VERA, sicurezza Skyfield FALSA, radio VERA, rete FALSA. «Dove sei rimasto scoperto» 3 voci su 8 (C34-07). o3 «Una squadra entra in curva» scelta con 0 squadre libere → **C37-05**. Foto `e05-*`.
- **IMPRESSIONE DA GIOCATORE:** tema chiaro e simpatico (steward pagati poco, il vice cinico: «Zero a zero. Lo avevo detto io. Finalmente.»). La sicurezza del club che dice «non serviranno steward» puzzava, e il verbale mi ha dato ragione. «Chiedi al responsabile ospiti di farli spegnere» fra le scelte che penalizzano mi ha sorpreso, ma il costo lo diceva. Finale che si sente: «Sindacato e comando si accusano a vicenda. Tu sei nel mezzo».

## 4.2 e06 Due eventi, una città (giocato bene)

- **FATTO:** C33-03 dal vivo: ondata 1, 10 unità posate una alla volta, dopo ognuna `cop.sh` sui 5 dischi: **5/5 liberi in 10/10 passi**; o2–o4 5/5 liberi. o1 tutto sotto controllo, fiducia +1; o2 Curva Kiln SCOPERTO con tono «calmo» (C33-07); o3 «A riposo nella prossima ondata: 3 squadre» → o4 con 0 squadre; o4 la chiamata `risultato_bislungo` segue la scelta «Bis lungo» di o3 (`data/missioni/e06.json:795`). Fiducia 5 → 4, «CONTENUTO A FATICA», 1 stella. «Concedi una squadra al palco» («ti costa una squadra») offerta con «Squadre 0» (C35-06). Fumogeni «viola» del Garden → **C37-04**. Foto `e06-*`.
- **IMPRESSIONE DA GIOCATORE:** «Ventimila persone in due posti e un viale solo in mezzo»: si capisce subito. Il bis lungo come leva mi è piaciuto: la chiamata di o4 cambia davvero. La fonte del Garden («dritti allo stadio») smentita dalla chiamata stessa del Garden: me ne sono accorto prima del verbale, bella soddisfazione. Le 3 squadre a riposo in o4 mi hanno punito senza preavviso: il rapporto di o3 lo dice, ma lo leggo dopo aver speso.

## 4.3 e11 Cassonetti in fiamme (sbagliato apposta)

- **FATTO:** tutte le unità su stazione e viale per 4 ondate (sempre «SOTTO CONTROLLO»); degenerati: o2 −1, o3 −3, o4 −2; fiducia 5 → 2; tono teso, poi critico in o2–o4; vignetta nascosta 4/4. «DEGENERATO FUORI CAMPO», «riparti dall'ondata 2, dove si è deciso, o da capo». Fonti: ferrovie FALSA, radio VERA, rete VERA, comitato FALSA: le due a cui ho creduto erano false. «Per la stella successiva» con 0 stelle (già visto nel C-036). In o4 «Le fonderie SOTTO CONTROLLO / MA ANCORA CALDO» senza unità, dopo un livello 5 nello schieramento: IPOTESI che senza chiamate il settore si raffreddi da solo (codice non letto). Foto `e11-*`.
- **IMPRESSIONE DA GIOCATORE:** l'episodio più atmosferico: treno della sconfitta, cassonetti, l'alba con le scope. Ignorare le chiamate sul quartiere fa male in modo leggibile. Il Fabbro («Io non c'entro… ma domani nessuno fa nomi») e il vice preparano bene il seguito.

## 4.4 e19 La retata mancata (sbagliato apposta)

- **FATTO:** o1 strada e tornelli scoperti; o2 Curva Kiln e Curva ospiti; o3 «critico», −2; o4 strada e curva ospiti, −2. «DEGENERATO FUORI CAMPO», «riparti dall'ondata 3». **Fiducia 7/10** a episodio fallito (scelte compiacenti +1: C33-13). «Per la stella successiva» nell'episodio fallito; «Dove sei rimasto scoperto» 3 voci su 8 (C34-07); vignetta nascosta 4/4. Etichetta «Magazzino delle fonderie» più vicina al disco della Strada da Kiln che al proprio → **C37-03**. Foto `e19-*`.
- **IMPRESSIONE DA GIOCATORE:** la sala più tesa vista finora («Malvasi parla piano, per la prima volta»); il vice che sospetta Lavezzari è il momento migliore. Sbagliando tutto ho capito bene perché ho perso. Mi ha stonato «Sapeva com'era andata prima del giornale» (`data/testi/it/e19.json:117`) dopo che in o3 la stampa aveva già scritto «Retata fallita alle fonderie» «già in rete» (`:78`): GIUDIZIO, regge solo se «giornale» è l'edizione di carta. La fiducia a 7/10 dopo un disastro mi ha fatto pensare di aver giocato bene.

## 4.5 e24 Fine stagione (giocato bene)

- **FATTO:** o1 curva ospiti scoperta, tono «calmo»; o2 curva Skyfield e piazza del municipio scoperte, «calmo» (C33-07, 2 volte); o3 curva ospiti e tornelli; o4 curva ospiti e strada, «teso». Vignetta nascosta 4/4. «CONTENUTO A FATICA», 1 stella, «è arrivata al giallo» (C33-09). o1 `mediatore24` accettata col mediatore già schierato (barra «Mediatore 0», `riserva.mediatore = -1` nel salvataggio: C35-06, foto `e24-o1-mediatore-senza.jpg`). o2 `consegna` «chiusa» dopo aver aperto la busta → **C37-06**. o3 «Steward ai tornelli», poi «Tornelli · Ressa ai biglietti: nessuna unità a coprirlo · SCOPERTO» → **C37-08**. Fiducia 5 → 2. Foto `e24-*`.
- **IMPRESSIONE DA GIOCATORE:** il finale di stagione si sente (pareggio all'80°, Stoneway campione per un punto). La busta è il filo migliore, ma «Leggi il nome. Lo rileggi» e il nome non viene detto (lo scopro in e33). La chiamata del caffè di Malvasi con «CURVA OSPITI · URGENTE!» mi è parsa strana. Fiducia da 5 a 2 giocando con prudenza: coerente, ma severo.

## 4.6 e33 La talpa (giocato bene)

- **FATTO:** o1 nessuno scoperto, fiducia +1; o2 curva Skyfield e viale scoperti con «calmo» (C33-07); o3 curva ospiti; o4 viale e tornelli. Vignetta nascosta 4/4. «CONTENUTO A FATICA», 1 stella; il verbale nomina la stazione mai scoperta → **C37-07**. «Dove sei rimasto scoperto» senza o2 curva Skyfield e o3 curva ospiti (C34-07). o3 `nome_talpa` offre «Apri la busta che hai tenuto» perché in e24 ho tenuto la busta: la reattività fra episodi funziona (foto `e33-o3-nome.jpg`). o3 `festa_viale` con bollino «Squadre · Curva ospiti» mentre la squadra scorta la festa sul viale (`data/testi/it/e33.json:84,88`; `data/missioni/e33.json:582`): classe C36-07, foto `e33-o3-festa-bollino.jpg`. Fiducia 3 → 9. Foto `e33-*`.
- **IMPRESSIONE DA GIOCATORE:** l'episodio più bello dei sei: trappola degli ordini, targa, garage, firma nella busta; il nome arriva meritato. Due testi ignorano lo schieramento («Nessuno li aspettava, tranne il bar», `e33.json:19`, con 2 squadre già in stazione; «il viale resta senza una squadra» con 0 squadre sul viale). Non ho capito al primo colpo «Scommetto: ti ha sorriso.» (`:4`) e «Il viale diventa una festa. Non sua.» (`:110`).

## 4.7 Insieme (IMPRESSIONE DA GIOCATORE)

- **Cosa funziona:** ogni episodio ha un'idea chiara; le fonti si chiudono bene nel verbale (e05, e11, e06); la reattività fra episodi (e24 → e33) e dentro l'episodio (e06 bis lungo) si sente. Sbagliando apposta (e11, e19) ho capito perché ho perso.
- **Dove mi sono perso:** opzioni che parlano di unità che non ho (C37-05, C35-06 in e06 ed e24); un rapporto che dice «nessuna unità» subito dopo che ho mandato uno steward (C37-08); una chiamata che ignora la busta aperta (C37-06); la fiducia alta perdendo (e19 7/10, C33-13).
- **Mappa:** nessun tocco coperto in tutta la partita; etichette quasi sempre accanto al proprio disco, salvo e19 (C37-03, C37-01).
- **Già aperti, visti di nuovo (solo stato):** C33-06 vignetta del rapporto nascosta **24/24** rapporti; C33-07 «calmo» con scoperti in e05 o1, e06 o2, e24 o1 e o2, e33 o2; C33-09 (e24); C34-07 (6/6 episodi); C35-06 (e06, e24); C36-07 (e33).

# Rilievi nuovi (per gravità)

## Alto

Nessuno.

## Medio

**C37-01: a 360 il testo del nome esce dal riquadro in più ondate di prima (11 → 18), fino a 16,8 px, e in e19 finisce sotto la pastiglia del proprio settore. Regressione della 0.37.0 sulla classe C33-01.**
- FATTO MISURATO: `MISURE=360x760 node coordination/sonde/c33-pastiglie.mjs <radice> <uscita>` (§ 1.4): ondate col testo fuori 0.36.0 **11**, 0.37.0 **18** (2 giri uguali), rosso C102D01+C103P01 **10**. Nuove: e14 o1 e o2 «Tornelli» 3,3 px, e15 o4 «Viale della stazione» 3,8, **e19 o2/o3/o4 «Magazzino delle fonderie» 16,8**, e22 o4 «Piazzale dello stadio» 2,6, e34 o2/o3 «Tribuna autorità» 5,0; sparite e07 o1, e26 o4. Testo fuori riquadro **sopra una pastiglia**: 0.36.0 2 ondate (e13 o2, e23 o1), 0.37.0 **4** (in più e19 o2 e o4, «× pastiglia «1» di magazzino 7 px²»).
- Foto `docs/foto/c37/pastiglie/pastiglie-360-e19-o2.png` (nome su 3 righe, schiacciato sopra il disco della Strada da Kiln), `…-e13-o2.png`, `…-e23-o1.png`, `…-e34-o2.png`.
- IPOTESI sulla causa: il costo nuovo per la distanza dal disco (`etichette.ts:111-116`) premia i posti stretti a 60 % di `--nome-max`, dove le parole lunghe escono. Non ho separato i due rossi.
- GIUDIZIO: media perché è una regressione della release e tocca D-145 («la pastiglia visibile non va mai sopra un nome»), anche se la sonda del riquadro dà 0.
- Opzioni (consigliata la prima):
  1. **Consigliata:** nel costo, misurare il testo vero (un `Range` sul nome, come fa la sonda) invece del riquadro, così i posti stretti con testo fuori costano; guardiano «testo fuori dal riquadro» a 360/375/412 con soglia 0 per i nuovi casi. Costo: `etichette.ts` e un test.
  2. Vietare la larghezza al 60 % quando una parola non ci sta (si resta all'80 % o alla larghezza intera). Costo minimo, può riportare qualche gruppo ambiguo (C33-05).
  3. Lasciare e trattarlo con C33-01 aperto. Sconsigliata: il numero è cresciuto.

## Basso

**C37-02: con la tastiera, D-142 abbassa i Tab della prima azione ma il totale non scende (546 → 553): le scene a un solo comando, che prima avevano già il fuoco sul comando, ora vogliono 2 Tab.**
- FATTO MISURATO: § 1.2 (`tab-conti-1366-036.log`, `tab-conti-1366-037-bis.log`): sala «passo» 0 → 2, briefing 0 → 2, «rapporto» di ogni chiusura 0 → 2, «avanti» del rapporto 0 → 2, verbale «passo» 0 → 6 (8 azioni), `conferma-rigioca` 0 → 4, `conferma-davvero` 0–2 → 4 (voluto da C34-01), prima opzione di ogni chiamata +1.
- GIUDIZIO: il guadagno della 0.37.0 è vero e voluto (stagione e prima unità); il fuoco sul comando unico nella 0.36.0 era un effetto di C32-01, e ha il rischio di C34-01 (un Invio di troppo avanza). Per le scene che non confermano nulla di grave (sala, rapporto, verbale) il prezzo è 2 Tab per scena.
- Opzioni (consigliata la prima):
  1. **Consigliata:** lasciare D-142 com'è e registrare il conto (553 contro 546) come riferimento del guardiano della tastiera; nessun lavoro.
  2. Nelle scene a un solo comando che non conferma nulla (sala, briefing, rapporto, verbale) mettere il fuoco sul comando entrando. Costo: un elenco in `Scena.tsx` e un guardiano; riapre in piccolo il rischio di C34-01.
  3. Scorciatoia da tastiera (es. Invio sulla scena = comando principale) per le sole scene di lettura. Costo maggiore, da progettare.

**C37-03: e19 a 360, mappa vuota, l'etichetta «Magazzino delle fonderie» è più vicina al disco della «Strada da Kiln» (16 px) che al proprio (22 px).**
- FATTO MISURATO: `coordination/sonde/c37-giocatore-aiuti/vic.sh` in e19 o1 e o2 a 360, prima di posare le unità (bordo dell'etichetta → centro del disco); le altre 4 etichette 18 px dal proprio disco, 40–75 dagli altri; con le unità posate torna a 18 contro 50. Foto `docs/foto/c37/giocatore/e19-o1-mappa-vuota.jpg`; stessa zona di C37-01 (`pastiglie-360-e19-o2.png`).
- Campione: solo e06 ed e19 a 360 nella partita; **non** misurato sugli altri episodi.
- Opzioni (consigliata la prima):
  1. **Consigliata:** estendere il controllo di C33-05 alle etichette dei nomi (a mappa vuota e con unità): etichetta più vicina al proprio disco che a ogni altro, 36 episodi a 360/375/412. Costo: un test, più i casi che trova.
  2. Correggere solo e19. Costo minimo.
  3. Lasciare (con le unità posate il caso sparisce). Sconsigliata: la mappa vuota è la prima che si legge.

**C37-04: e06, i tifosi del Garden sono «viola», ma il club ospite è blu e rosso (stessa classe di C36-04).**
- FATTO: club ospite `quillhaven_albion` (`data/missioni/e06.json:83`), colori `#1b2a6b` / `#d62839` (`data/club/quillhaven_albion.json:1`); «Duecento sciarpe viola» `data/testi/it/e06.json:43`, «fumogeni viola» `:53`, chiamata `fumo_viola` `:54-57`. Foto `e06-o2-fumo.jpg`, stemma blu e rosso in `e06-verbale.jpg`.
- IPOTESI: residuo di un vecchio club viola, come per C36-04; non verificata.
- Opzioni: 1. **Consigliata:** testi «blu e rossi» in e06 e una ricerca di «viola» (e degli altri colori) in tutti i testi confrontata coi colori dei club, insieme a C36-04. Costo: testi e una sonda. 2. Solo le due righe di e06.

**C37-05: e05 o3, «Una squadra entra in curva» si sceglie anche senza squadre libere e non impegna nessuna unità.**
- FATTO (dati): `squadra_torce` ha solo pressione `curva_larkspire` −2 e tensione +1, nessun impegno di unità (`data/missioni/e05.json:605-617`); testo `data/testi/it/e05.json:91-93`.
- FATTO (partita): in o3 «Squadre 2», tutte schierate; scelta l'opzione, il rapporto dà la curva Skyfield «nessuna unità a coprirlo · SCOPERTO» (foto `e05-o3-rapporto.jpg`). Parente di C35-06.
- Opzioni: 1. **Consigliata:** testo senza unità (es. «Chiedi al club di spegnerle»), una riga. 2. Far impegnare davvero una squadra e spegnere l'opzione senza squadre libere (regola di C35-06). 3. Lasciare.

**C37-06: e24, la chiamata `consegna` («Ordine di consegnarla, chiusa») arriva anche a chi ha già aperto la busta (classe C36-02).**
- FATTO: `consegna` senza `dopo` (`data/missioni/e24.json:474-480`); testo `data/testi/it/e24.json:69`, opzione A «il nome finisce in un cassetto che non è il tuo» (`:72`). A schermo dopo «Aprila adesso» in o1: foto `e24-o2-consegna.jpg`.
- Opzioni: 1. **Consigliata:** variante per chi ha aperto la busta (`dopo.mai` + chiamata gemella, come la barca di e35), dentro la scansione proposta da C36-02. 2. Testo neutro senza «chiusa». 3. Lasciare.

**C37-07: e33, il verbale «a fatica» nomina la stazione anche quando non è mai stata scoperta (classe C36-03).**
- FATTO: `data/testi/it/e33.json:119` «la sera ha retto a fatica: viale, stazione, tornelli»; nella partita stazione SOTTO CONTROLLO in o1–o4 (foto `e33-o1…o4-rapporto.jpg`).
- Opzioni: 1. **Consigliata:** testo generico e aggiungere e33 alla sonda/guardiano proposti in C36-03. 2. Verbale composto dai settori davvero scoperti (codice).

**C37-08: un'unità impegnata da una chiamata nel settore non conta come copertura, e il rapporto dice «nessuna unità a coprirlo» subito dopo.**
- FATTO: e24 o3 «Steward ai tornelli» («Lo steward tiene il cancello»), poi «Tornelli · Ressa ai biglietti: nessuna unità a coprirlo · SCOPERTO» (foto `e24-o3-rapporto.jpg`); salvataggio `rapporti[2].causa.tornelli = {pressione 2, copertura 0, risposte −2}` (`coordination/sonde/uscite-c37/giocatore-C/salvataggio-finale.json`); copertura e risposte calcolate a parte in `src/logica/missione.ts:31`, `:205`.
- GIUDIZIO: il motore è coerente (la risposta toglie pressione), la frase contraddice quello che il giocatore ha appena fatto.
- Opzioni: 1. **Consigliata:** con risposte negative nel settore, scrivere «le tue risposte non bastano» invece di «nessuna unità a coprirlo». Costo: un ramo in `src/resa` e un guardiano. 2. Contare l'unità impegnata come copertura (cambia il bilanciamento, sconsigliata). 3. Lasciare.

**C37-09: e30 o4, la risposta a «Lasciala andare» dice «Partono di nuovo dal piazzale», ma con D-141 la fiaccolata parte dal municipio e va verso lo stadio.**
- FATTO: `data/testi/it/e30.json:102`; verso misurato § 1.3 (municipio 6/63, stadio 69/0); chiamata «dopo il municipio, fiaccolata fino al porto» (`:93`); il porto non è sulla mappa di e30 (settori `piazzale`, `strada_cinderwick`, `viale_stazione`, `quartiere`, `piazza_municipio`).
- GIUDIZIO: la mappa ora segue «dopo il municipio»; «di nuovo dal piazzale» resta l'unica frase che va al contrario. Bassa.
- Opzioni: 1. **Consigliata:** testo «Ripartono dal municipio. Le fiaccole si vedono dal comando.» (una riga). 2. Lasciare: «di nuovo» può voler dire un secondo giro.

# Verificati e chiusi

| rilievo | misura |
|---|---|
| **C34-01** | riepilogo 0/5 conferme senza riepilogo (0.36.0 5/5, rosso 5/5); Tripla 0/4 attraversate (0.36.0 4/4, rosso 4/4) |
| **C34-08** | stagione 1 2 Tab, prima unità 1 (0.36.0 10 e 9–10, rosso 10 e 9), 3/3 corse; residuo C37-02 |
| **C33-02** | e30 o4 municipio 6/63, chiamata 0/39 (rosso 62/8, 37/2); salvataggio 0.36.0 ripreso con `>esce` |
| **C33-03** | e06 o1 a 360 0 + 0 tocchi coperti (0.36.0: 1); partita 10/10 passi liberi. Riserva: rossi C102D01 e C103P01 da soli danno 0 |
| **C33-04** | 0/138 ondate diverse fra due giri |
| **C33-05** | 29–30 / 18 / 8 gruppi (0.36.0 e rosso: 44 a 360) |
| Regressioni | bot identico alla 0.36.0, 0 blocchi; 254/254; tipi 0; salvataggi 0.36.0 41/41 e import 156/156; console 0 |

# Non verificato

- **Schermate complete** 36 episodi × 360/375/412/1366 (`c29-schermate.mjs`): non rifatte (tempo e carico); fatte e06 a 360 e le 142 ondate delle pastiglie a 3 misure.
- Quale rosso rifà C33-03 sulla sonda di schermate (C102D01 e C103P01 da soli danno 0; i due insieme e il guardiano `tools/foto-schieramenti.mjs` col rosso non lanciati).
- Quale dei due rossi produce C37-01 (provati solo insieme).
- Conferma d'importazione (`ConfermaImporta`) con la tastiera; pastiglie a 375 e 412 per la 0.36.0 e per il rosso; secondo giro a 375 e 412.
- Fuoco dopo «continua» a 1366 sul body a 2000 ms (1/3 corse 0.37.0): **non posso confermare** se è tempo sotto carico o comportamento.
- Salvataggi 0.36.0 dentro e35 nei 74 punti (provati i 74 della 0.35.0); salvataggi 0.34.0 e precedenti; altri semi e finestre per i salvataggi.
- Durata della partita in minuti di gioco (il gioco non mostra un orologio).
- Variabili di storia degli episodi saltati (segnati a mano), quindi la coerenza fra episodi (es. e33 «capo arrestato»).
- Rami non giocati: «Riparti dall'ondata» di e11 ed e19; e24 `consegna_chiusa`; e33 `ordini_puliti`.
- Perché le fonderie di e11 o4 tornano «sotto controllo» senza unità (IPOTESI, codice non letto).
- Telefoni, tablet e PC veri; WebView dell'APK; lettori di schermo.
- Catena completa (`node tools/catena.mjs`): non lanciata, per non scrivere `STABILITA.json` da collaudatrice.

# Commit

- Build collaudata: main **d2fdf88** (rilascio 78b865e); confronto 0.36.0 **fdad627**.
- Commit del collaudo: vedi `git log claude/valmora-collaudo-c037` (hash nel messaggio della sessione principale).

# Note di metodo e limiti

- **Misura ritirata:** la prima corsa di `c28-tastiera` sulla 0.37.0 (`tastiera-1366-037.log`) si è fermata su e01 con «Timeout 15000ms» aspettando la sala dopo `conferma-rigioca`; la foto del blocco mostra la sala aperta: tempo sotto carico (60), non un blocco del gioco. Rifatta (`tastiera-1366-037-bis.*`, 203 azioni, finita): uso solo questa. Anche `fuoco-1366-037-rosso.log` e `fuoco-1366-036.log` della prima tornata sono uscite per timeout della sonda; rifatte in `uscite-c37/fuoco/` (3 corse per versione). La prima `c37-tripla` a 1366 non aveva aperto «Nuova partita» in 800 ms: rifatta (`tripla-037-1366-bis.log`).
- **Rumore:** fino a 8 browser e carico medio fino a 60; le misure contano passi, Tab e pixel, ma le letture del fuoco a 50–2000 ms dipendono dai tempi: per questo 3 corse per versione e nessun numero in ms nelle conclusioni.
- **Partita:** tre partite separate (una per coppia di episodi), episodi intermedi segnati a mano; un solo giocatore per episodio; durata in minuti di gioco non misurabile.

# Sonde nuove

| sonda | cosa misura | comando |
|---|---|---|
| `c37-tripla.mjs` | C34-01 nelle conferme a 3 passi (rigioca, nuova partita): Invio ripetuti senza Tab, passo raggiunto e fuoco | `W=… H=… [ROSSI=C104R01] node coordination/sonde/c37-tripla.mjs <radice>` |
| `c37-giocatore-aiuti/` | `cop.sh` tocchi coperti sui dischi, `vic.sh` distanze etichetta/pastiglie dal proprio disco e dall'altrui, `scegli.sh`, `prossima.sh` (con gli aiuti del C-036) | con `c33-giocatore.mjs`, vedi `coordination/sonde/c36-giocatore-aiuti/LEGGIMI.md` sul ramo C-036 |
