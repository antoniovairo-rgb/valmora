# Collaudo C-027 — 0.21.0: verso del corteo (D-127, C24-07), testi contro mappa, rilievi del C-026, regressioni

- **Build collaudata:** main a 56fa2a1, GAME_VERSION 0.21.0 (`src/versione.ts:153`, commento `:147-152`). Ricostruita in locale con `npm ci` e `npx vite build` (verde).
- **Confronto:** 0.20.0 a 76935e1, in un worktree separato (`git worktree add`, `npm ci`, `npx vite build`).
- **Cosa cambia fra le due:** `git diff --stat 76935e1 56fa2a1 -- src data schema tools tests` → 7 file, 45 righe: `data/missioni/e17.json` (+1), `e30.json` (+2), `schema/missione.schema.json` (+4), `src/logica/tipi.ts`, `src/resa/mappa/folla.ts`, `src/versione.ts`, `tests/corteo-verso.test.ts` (nuovo). Nessun testo, nessun club, nessun file di interfaccia oltre a `folla.ts`.
- **Ramo:** claude/valmora-collaudo-c27. Sola lettura sul codice di gioco: nessun file di `src/`, `data/`, `schema/`, `tools/`, `tests/` toccato.
- **Data:** 2026-10-15. **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository, WebGL con SwiftShader), DPR 1. Node 22.22.
- **Sonde nuove:** `coordination/sonde/c27-*.mjs`; riprese dal ramo del C-026 (identiche, salvo la prima riga di `c26-salvataggi.mjs`): `c26-*.mjs`. **Foto:** `docs/foto/c27/`. **Salvataggi veri della 0.20.0:** `coordination/sonde/salvataggi-020/` (campo `game_version: "0.20.0"`).

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **GIUDIZIO** (mio, sulle foto citate) · **IPOTESI** marcate.

## Riepilogo

| verifica | esito |
|---|---|
| e30 ondate 2 e 4, e17 ondata 4: corteo **dell'ondata** via dallo stadio | **sì**: 67–70 persone su 68–70 si allontanano dallo stadio disegnato in ogni misura (0.20.0: 69/70 verso lo stadio) |
| stesse ondate: corteo **della chiamata** sulla stessa strada (dinamica PO-089) | **no**: 36–40 persone su 39–40 vanno **verso** lo stadio, in senso opposto al corteo dell'ondata → **C27-01** |
| e30: «dallo stadio **verso il municipio**» | metà: via dallo stadio sì, ma 68–70/70 si **allontanano** anche dal municipio → C27-02 |
| Altri cortei cambiati rispetto alla 0.20.0 | **nessuno**: `data-folla` diverso in 8/238 schermate, tutte di e17 ondata 4 ed e30 ondate 2 e 4; statico 3/142 ondate |
| Testi dei cortei contro il verso disegnato (36 episodi, 85 ondate con gente in strada) | 4 contrasti dovuti alla dinamica (C27-01), 2 alla forma dei viali senza stadio (C27-02), 3 alla fase di partita sbagliata (C27-04), 7 da dati o forma (C27-05) |
| Rilievi del C-026 | **13/13 ancora presenti** (codice e dati invariati; misure ripetute dove serve uno schermo) |
| Bot, 1000 semi × 4 strategie × 36 episodi (3 stagioni) | **0 blocchi** in 156/156 righe; «chiamate mai comparse» `[]` in 36/36; `diff` con la 0.20.0 **vuoto** |
| Errori di console | **non 0**: «reading 'on'» in `StratoCitta` 4 volte in 4 corse complete della 0.21.0, 1 volta in una della 0.20.0, 2/150 nella prova mirata; esiste già nella 0.20.0 → **C27-03** |
| Salvataggi | 12/12 veri della 0.20.0 ripresi sulla stessa chiamata; R1 6/6; R2 3/3 salvataggi reali vecchi; 0 errori |
| Schermate 360×760, 375×812, 375×667, 412×915 (1916 per misura) | **0** scorrimenti orizzontali, **0** testi tagliati, **0** nomi vecchi |
| Test e tipi | `npx vitest run` 39/39 file, 210/210 test; `tsc --noEmit` verde; offline verde (O1-O4) |

## 1. Il verso del corteo sui pixel e nel movimento

### 1.1 Metodo (FATTO MISURATO)

`W=360 EP=e01,…,e36 node coordination/sonde/c27-pixel.mjs <radice> <foto> <uscita.json>` su 0.21.0 e 0.20.0: gioca dall'interfaccia i 36 episodi col piano del bot attento (seme 1), in ogni schieramento e in ogni chiamata su un settore di tipo strada legge `data-folla`, `data-dinamica`, `data-stadio-ellisse` e le **posizioni vere delle persone nella scena Pixi** (gancio `__PIXI_APP_INIT__` dei devtools di Pixi, nessun file del gioco toccato) due volte a 400 ms di distanza. Per ogni persona conta se si allontana o si avvicina al centro dello stadio disegnato e a ogni settore della mappa. Il corteo dell'ondata sono le 70 particelle per strada di `StratoPixi.tsx:85-91`, mosse da `StratoPixi.tsx:114-118`; il corteo della chiamata sono le 40 persone di `dinamica.ts:27-35`. Campione: 238 misure per build, 182 cortei dell'ondata, 96 cortei di chiamata; errori della sonda 0.

Prima avevo provato a seguire i pixel arancioni del Kiln fra due foto: con le persone a ~5 px l'una dall'altra l'accoppiamento sbagliava (e30 ondata 3, «entra»: 4 su 6 verso lo stadio in una corsa, 9 su 11 via nella successiva). **Ritiro quella misura**: valgono solo le posizioni Pixi. I pixel restano come prova che le persone sono disegnate (12–30 persone arancioni per foto a 360 in e30).

### 1.2 e30 ed e17 (FATTO MISURATO; persone che vanno verso / via dallo stadio, su quelle che si sono mosse)

| scena | 0.20.0, ondata | 0.21.0, ondata | 0.21.0, corteo della chiamata |
|---|---|---|---|
| e30 schieramento 2 | 69 verso / 1 via | **1 verso / 69 via** | — |
| e30 chiamata `silenzio_totale` (strada da Kiln) | 69 / 1 | 1 / 68 | **36 verso / 3 via** |
| e30 chiamata `clacson` (viale della stazione) | 69 / 1 | 1 / 67 | (sul viale della stazione: 39 / 0) |
| e30 schieramento 4 | 69 / 1 | 1 / 69 | — |
| e30 chiamata `fiaccolata` (strada da Kiln) | 69 / 1 | 0 / 69 | **36 verso / 4 via** |
| e17 schieramento 4 | 69 / 0 | 0 / 69 | — |
| e17 chiamata `me_lo_dovete` (strada da Kiln) | 70 / 0 | 0 / 69 | **40 verso / 0 via** |

- Con l'interruttore rosso `ROSSI=C73V01` la stessa sonda su e30 rimette l'ondata verso lo stadio (foto `docs/foto/c27/360x760-rosso-C73V01-e30-*.png`); il guardiano `tests/corteo-verso.test.ts` è verde e il suo rosso è vivo (3/3 test).
- Foto della mappa (DPR 1): `360x760-e30-schieramento-2.png`, `360x760-e30-chiamata-silenzio_totale.png`, `360x760-e17-chiamata-me_lo_dovete.png`. GIUDIZIO sulle foto: le due folle sulla strada da Kiln hanno lo stesso arancio e si sovrappongono; in una foto ferma il verso non si legge, si legge solo nel movimento.

### 1.3 Nessun altro corteo ha cambiato verso (FATTO MISURATO)

- **Senza browser:** `node coordination/sonde/c27-verso.mjs <radice> <uscita>` chiama `follaDellOndata` di ciascuna build su 142 ondate: 68 ondate con cortei, 81 cortei; differenze 0.20.0 → 0.21.0: **3 ondate** (e17/4 `strada_cinderwick` entra→esce; e30/2 e e30/4 idem). Il secondo corteo di e17 ondata 4 (`piazza_municipio`) resta «entra».
- **Nel browser:** `data-folla` e `data-dinamica` uguali in 230/238 schermate; le 8 diverse sono e17 schieramento 4, `me_lo_dovete`, `fine_corteo` ed e30 schieramento 2 e 4, `silenzio_totale`, `clacson`, `fiaccolata`.
- **Nel movimento:** `node coordination/sonde/c27-analisi-verso.mjs <0.21.0.json> <0.20.0.json>` → 278 cortei in comune, verso misurato diverso in 15: gli 8 attesi di e17/e30 e 7 dove una delle due corse ha misurato «fermo» o «misto» (`?`/`~`: e04 `corteo_fonderie` con 0 persone mosse nei 400 ms, e15 `fratelli`, e23 `in_tondo`, e27 `abbraccio`). In quei 7 il verso scritto in `data-folla` è identico: li conto come rumore della sonda (IPOTESI: il ticker di Pixi non ha avanzato fra le due letture sotto carico), non come cambi.
- **Concordanza generale (0.21.0):** dei 182 cortei dell'ondata, 143 vanno dove dice `data-folla` rispetto allo stadio disegnato, 36 non hanno uno stadio disegnato o sono misti, **3 discordi**, tutti e04 `parcheggi` (C27-02).

## 2. Testi dell'ondata contro il verso disegnato (36 episodi)

Comando: `node coordination/sonde/c27-testi-cortei.mjs . <uscita.md>` → per ognuna delle 85 ondate con un corteo disegnato o una chiamata su una strada: titolo, riga «i», testi delle chiamate e commenti. Li ho letti tutti; dove la direzione dipende dalla forma della mappa ho usato le misure del § 1 (avvicina/allontana per ogni settore). In 46 ondate i testi non danno una direzione o concordano (es. e02/4, e15/4, e31/4, e33/4: «tornano in stazione» e il corteo misurato va verso la stazione; e16/4, e18/4, e24/4, e36/4: «torna alle fonderie», «risale la collina» con il corteo «via»).

Casi in contrasto (candidati per `verso` dove il testo parla dello stadio; altrimenti `verso` non basta, scritto nella colonna):

| episodio, ondata | disegnato e misurato | frase che dice altro (file:riga) | basta `verso`? |
|---|---|---|---|
| e17/4, `piazza_municipio` (tipo strada) | ondata «entra»: 69/69 **verso** lo stadio | «Partita e corteo finiti: senza autobus, tutti devono tornare a casa a piedi.» (`data/testi/it/e17.json:98`); «il corteo è finito, il palco si smonta» (`:114`) | **sì**: `verso: dallo_stadio` su `piazza17b` (`data/missioni/e17.json:656`) |
| e30/2 e e30/4, `strada_cinderwick` | via dallo stadio **e via dal municipio** (0/70 verso il municipio) | «Il corteo si muove in silenzio dallo stadio verso il municipio» (`e30.json:38`) | no: C27-02 |
| e04/2, `parcheggi` | «entra», ma 56–59/69 si **allontanano** dallo stadio vuoto | «Poco prima del fischio: gli ultimi tifosi entrano» (`e04.json:50`) | no: C27-02 |
| e06/1, `viale_concerto` | «entra»: 69/69 verso lo stadio, si allontana da Piazza del concerto | «In rete: curva Kiln in corteo verso la piazza.» (`e06.json:27`) | no: la meta è la piazza |
| e13/4, `viale_concerto`, `parcheggi` | «esce»: si allontanano da Piazza del concerto (≥ 80 %) | «Finita la partita, tutti vanno verso il concertone in piazza» (`e13.json:109`); «vogliono andare al concerto cantando» (`:117`) | no: la meta è la piazza |
| e12/4, `strada_cinderwick` | «esce»: si allontana da Piazza del comune | «Le due curve vanno insieme in piazza.» (`e12.json:103`) | no |
| e22/4, `strada_cinderwick` | «esce»: si allontana dalla piazza del municipio | «vuole passare dal municipio, «per salutare il presidio»» (`e22.json:103`) | no (debole: «passare») |
| e04/3, chiamata `angolo` | ondata via (70/70), **chiamata verso** (39/39) | «Dopo la partita: i tifosi escono dallo stadio» (`e04.json:84`) | no: C27-01 |
| e17/4, chiamata `me_lo_dovete` | chiamata 40/40 verso lo stadio | «Li riporto a casa io, tutti insieme, per la strada di Kiln.» (`e17.json:99`) | no: C27-01 |
| e30/2, `silenzio_totale`; e30/4, `fiaccolata` | chiamata 36/39 e 36/40 verso lo stadio | `e30.json:38`; «dopo il municipio, fiaccolata fino al porto» (`:93`) | no: C27-01 |
| e27/4, chiamata `abbraccio` | nessun corteo dell'ondata (spalti «pieni»); chiamata: ≥ 80 % si allontana dalla stazione | «Dopo la partita: i gemellati tornano in stazione» (`e27.json:91`); «accompagnare i gemellati in stazione» (`:92`) | no: C27-04 |
| e19/3, chiamata `festa_davanti` | partita: nessun corteo dell'ondata; chiamata «entra» (misto) | «La curva vuole uscire prima, in corteo.» (`e19.json:93`) | no: in partita `folla.ts:25` scarta i cortei; solo la dinamica |
| e20/3, chiamata `fari_spenti20` | chiamata: corteo di 40 persone verso lo stadio | «un'auto scura è partita a fari spenti dal retro delle fonderie» (`e20.json:97`) | no: è un'auto in fuga, non un corteo (`fuga` è in `IN_STRADA`, `folla.ts:16`) |
| e07/4, chiamate `capodanno`, `batteria` | spalti «arrivo», chiamata «entra» | «A partita finita, di sera: la festa del Southwind continua per la città.» (`e07.json:99`) | no: C27-04 |

Casi dubbi che **non** conto: e30/3 «la coda del corteo… mentre torna indietro» (`e30.json:84`, chi torna e verso dove non è detto); e20/4 «festeggiare in strada, verso le fonderie» sulla strada di Skyfield (le fonderie non sono un settore della mappa); e35/1-2 (nessuno stadio; il corso va verso il centro, il nastro della banca è lì vicino: non posso confermarlo come contrasto).

## 3. Rilievi aperti del C-026 (stato nella 0.21.0)

Nessuno è corretto nella 0.21.0, come atteso: codice e testi coinvolti non cambiano (diff sopra). Riproduzione:

| rilievo | ancora presente | misura C-027 |
|---|---|---|
| C26-01 sfida coi gemellati «contro» | **sì** | sala-1 a 360, 375×812, 375×667, 412: e15 «RAILHEAD COUNTY contro KILN UNITED contro WALLGATE ROVERS», e27 «KILN UNITED contro RAILHEAD COUNTY contro WATERLINE CITY» |
| C26-02 Arches «di fuori» in e33 | **sì** | `data/testi/it/e33.json` «Sessanta Arches restano in città fino all'alba» (`e33.op.parte_mezzanotte.r`), testi invariati |
| C26-03 vignette a 375×667 | **sì** | verbale mostrato nel primo passo in 30/36 episodi, 61,7–99,0 px (mediana 72,4; C-026: 61,7–94,9, mediana 71,7; il massimo diverso: IPOTESI, più vignette nella stessa schermata contate insieme); sala mostrata in 4/36 (e04, e11, e30, e35) a 66,8–70,7 px |
| C26-04 calendario | **sì** | dati invariati (`git diff` vuoto su quei file) |
| C26-05 «terzo derby» | **sì** | `data/testi/it/e32.json:3` |
| C26-06 sfida con un club | **sì** | 6/36 con un club (e07, e13, e21, e25, e28, e31), 5 senza riga (e04, e11, e17, e30, e35), a ogni misura |
| C26-07 simboli degli stemmi | **sì** | `node coordination/sonde/c26-stemmi.mjs`: misure dei 16 simboli identiche al C-026; il giudizio sulle forme non l'ho rifatto |
| C26-08 colori degli stemmi | **sì** | ΔE2000 Skyfield–Railhead 27,4 / deut. 10,1 / prot. **6,1**; Kiln–Southwind deut. **7,3**; Kiln–Wallgate normale **17,9**; Waterline forma/bianco **1,00** |
| C26-09 stemma del Tramway mai mostrato | **sì** | 15/16 stemmi visti in sala, Tramway 0 |
| C26-10 «Urgente!» quasi ovunque | **sì** | 361/422 chiamate urgenti (85,5 %) a 360 e a 375×667 |
| C26-11 tocchi ed etichette a 360/375 | **sì** | e06 schieramento a 360: «ritira Mediatore da Piazza del concerto» coperto dal disco del Piazzale; e13 «Viale fra stadio e piazza» × «Parcheggi» 20,5×4,2 (360) e 16,8×3,4 (375); e16 «Magazzino delle fonderie» × «Strada da Kiln» 20,5×1,5 (360) |
| C26-12 testi vicini al limite | **sì** (informativo) | `node coordination/sonde/c26-storia.mjs`: 26 testi a ≤ 3 caratteri, 0 oltre |
| C26-13 ripresa a metà dopo l'aggiornamento | non riverificato | i salvataggi della 0.19.0 non li ho ricaricati nella 0.21.0; nessun nome è cambiato fra 0.20.0 e 0.21.0 |

## 4. Regressioni (FATTO MISURATO)

- **Bot:** `node tools/bot.mjs 1000` (96 s): 156 righe missione × strategia (36 episodi, stagioni 1-3), **0 blocchi** su 1000 semi ciascuna; «chiamate mai comparse» `[]` 36/36. Stessa corsa sulla 0.20.0: `diff` delle righe di blocchi, esiti, stelle e chiamate **vuoto** (il verso è solo resa).
- **Test:** `npx vitest run` → «Test Files 39 passed (39) · Tests 210 passed (210)». `npx tsc --noEmit -p .` → 0 errori. `node tools/offline.mjs` → «offline: verde (O1-O4)».
- **Salvataggi:** `EP=e02,e05,e07,e12,e15,e17,e21,e23,e25,e27,e30,e31 node coordination/sonde/c26-salvataggi.mjs <0.20.0> . coordination/sonde/salvataggi-020 <uscita>`: 12/12 salvataggi esportati dal pulsante della 0.20.0 a metà della prima ondata, importati nella 0.21.0 e ripresi sulla **stessa chiamata**, 0 nomi vecchi, 0 errori in entrambe (la sonda scrive «0.19.0/0.20.0» nei messaggi: sono 0.20.0/0.21.0; i file li ho rinominati `0.20.0-*`). `c25-ripresa.mjs` con e01, e07, e15, e17, e23, e30: R1 6/6 (ricarica, export, import), R2 3/3 salvataggi reali vecchi di `tests/salvataggi-reali/`.
- **Schermate:** `W=… [H=…] node coordination/sonde/c27-schermate.mjs . <foto> <uscita>` (copia di `c26-schermate.mjs` con l'altezza a scelta), 36 episodi, piano del bot attento, «i» aperta in ogni ondata:

| misura | schermate | scorrimento orizzontale | testi tagliati | nomi vecchi | comandi coperti | errori |
|---|---|---|---|---|---|---|
| 360×760 | 1916 | 0 | 0 | 0 | 1 (e06, C26-11) | 0 |
| 375×812 | 1916 | 0 | 0 | 0 | 1 (e32 `verbale_derby`, centro sul bordo: vedi C27-07) | 1 (C27-03) |
| 375×667 | 1916 | 0 | 0 | 0 | 142 («?» sotto la barra in cima, come nel C-026; la misura in fondo non l'ho rifatta) | 2 (C27-03) |
| 412×915 | 1916 | 0 | 0 | 0 | 1 (e01 `presidente`, centro sul bordo: vedi C27-07) | 1 (C27-03) |

- **Sovrapposizioni nuove rispetto alle righe del C-026:** e19 «Magazzino delle fonderie» × pastiglia «1» **34,6×22,6 px** a tutte le misure (16 schermate per misura) → C27-06; «Intanto…» × primo paragrafo della risposta, 42,1×2,6–5,6 px, 2–10 schermate per misura → C27-07.

## 5. Usabilità e realismo della mappa coi cortei (GIUDIZIO, sulle foto e sulle misure citate)

- Nella chiamata, che è il momento in cui il giocatore legge di quella strada, sulla strada da Kiln di e30 ci sono due cortei dello stesso colore che camminano in versi opposti (C27-01). Chi guarda vede gente che va e gente che torna: il silenzio «in cammino» non si capisce da che parte vada.
- Negli episodi senza partita il viale finisce al centro della mappa, non allo stadio né al municipio (`sfondo.ts:99`): «via dallo stadio» e «verso il municipio» non si possono disegnare insieme (C27-02). Per un giocatore di Valmora che conosce la mappa, il corteo di e30 sembra andare verso la periferia.
- In e27 dopo la partita gli spalti sono disegnati pieni e la strada senza corteo, mentre i testi parlano di gemellati accompagnati in stazione (C27-04); in e07 gli spalti restano «in arrivo» per tutta la partita e anche dopo.
- Un'auto in fuga (e20) diventa un corteo di 40 persone che va allo stadio (C27-05).
- Il verso del corteo si vede solo nel movimento: con «riduci movimento» attivo (`StratoPixi.tsx:21,130-131`) la folla è ferma e il verso non c'è. Non è un difetto, ma vuol dire che D-127 non arriva a chi usa quell'impostazione.
- Le persone arancioni a 2,2–2,6 px di lato sullo sfondo scuro della strada si vedono come una scia; a DPR 1 contarle a occhio non si può. Su telefono vero: non posso confermarlo.

## 6. Rilievi (per gravità)

### Alto

**C27-01 — Il corteo della chiamata cammina verso lo stadio negli episodi senza partita, al contrario del corteo dell'ondata (D-127 a metà).**
- Riproduzione: e30, ondata 2, chiamata «Strada da Kiln: silenzio totale» (o ondata 4 `fiaccolata`; e17 ondata 4 `me_lo_dovete`; e04 ondata 3 `angolo`). Guardare la strada da Kiln: due gruppi arancioni, uno scende verso il bordo, l'altro sale verso il centro e lo stadio.
- Misura: posizioni Pixi a 400 ms, 360×760: e30 `silenzio_totale` chiamata 36 verso / 3 via, ondata 1 / 68; `fiaccolata` 36 / 4 contro 0 / 69; e17 `me_lo_dovete` 40 / 0 contro 0 / 69; e04 `angolo` 39 / 0 contro 0 / 70. Su 96 cortei di chiamata della 0.21.0, **4 vanno in senso opposto** al corteo dell'ondata sulla stessa strada, tutti negli episodi senza curve (nella 0.20.0: 1, e04 `angolo`).
- Causa (FATTO, codice): il verso della dinamica non legge né `verso` né `cortei[].verso`: `StratoPixi.tsx:170` passa `esce = p.folla.spalti === 'deflusso'` a `costruisciDinamica` (`dinamica.ts:19,32`); negli episodi senza curve `folla.ts:40` dà sempre `spalti: 'vuoti'`, quindi la dinamica è sempre «entra».
- Guardiano: `tests/corteo-verso.test.ts` prova solo `follaDellOndata`; con la dinamica rotta resta verde, quindi per questo difetto è cieco.

### Medio

**C27-02 — Senza stadio pieno il viale va al centro della mappa: «via dallo stadio» non porta al municipio e «verso lo stadio» può allontanarsene.**
- Riproduzione: e30 ondata 2, schieramento; e04 ondate 1-2, corteo dei parcheggi.
- Misura: e30 ondate 2 e 4, corteo dell'ondata: 69–70/70 via dallo stadio **e** 0/70 verso Piazza del municipio (punti: stadio 122,32; municipio 253,127; foto `360x760-e30-schieramento-2.png`). e30 ondata 3 («Il corteo arriva in piazza del municipio», `e30.json:65`): 69/69 verso il municipio e verso lo stadio. e04 `parcheggi` «entra»: 56–59 su 69–70 si allontanano dallo stadio disegnato in 4 misure su 4 (uguale nella 0.20.0).
- Causa (FATTO, codice): `sfondo.ts:99` `meta` = centro dei settori quando lo stadio è vuoto; `sfondo.ts:104-107` il viale va dal bordo basso (o dalla stazione) alla meta. Il campo `verso` sceglie solo il senso su quel percorso.

**C27-03 — Errore di console «Cannot read properties of undefined (reading 'on')» in StratoCitta, saltuario, già nella 0.20.0.**
- Riproduzione: aprire la città (ricarica → «Riprendi»), più volte; compare sotto carico.
- Misura: 360×760 0, 412×915 1 (dopo e21 → città), 375×812 1 (dopo e23), 375×667 2 (all'avvio e dopo e04), corsa c27-pixel 0.21.0 0, corsa c27-pixel **0.20.0 1**: 5 errori in 6 corse con 36 aperture della città ciascuna, 4 corse in parallelo su 4 CPU. `c26-chiusi.mjs` parte S (150 giri città → sala → briefing → titolo): 0. Prova mirata `W=412 GIRI=150 node coordination/sonde/c27-citta-errori.mjs . <uscita>` (ricarica → «Riprendi» → città → sala, con altre corse in parallelo): **2 errori su 150 giri** (giri 17 e 39), 150/150 completati: **riprodotto**. Nessun blocco: il gioco è andato avanti in tutti i casi.
- Causa (FATTO, codice; IPOTESI sul momento): `src/resa/mappa/StratoCitta.tsx:20-22` legge `app.renderer` e chiama `r.on('resize', …)` senza controllare che il renderer ci sia; è la stessa famiglia di C24-03 (`schermo.ts:1-3`: renderer assente prima che l'app sia pronta o dopo lo smontaggio). Stesso schema in `StratoPixi.tsx:33`, senza errori misurati qui.

**C27-04 — Fase della partita sbagliata sulla mappa in e27, e07, e21, e23.**
- Misura (statica, `c27-verso.mjs`, riga «i» di ogni ondata): e27 ondata 1 «Prima della partita» e ondata 4 «Dopo la partita» → spalti **pieni**, nessun corteo dell'ondata (gli eventi `a_piedi` `e27.json:129` e `strada_sera` `:602` sono corteo ma non si disegnano); e07 ondate 2-3 «Si gioca» → spalti «arrivo» con corteo «entra», ondata 4 «A partita finita» → «arrivo»; e21 ondata 2 «Si gioca» e ondata 4 «Dopo la partita» → «arrivo»; e23 ondata 2 «Verso il fischio d'inizio» → «pieni».
- Effetto misurato: e27 `abbraccio` (accompagnare i gemellati in stazione) col corteo della chiamata che si allontana dalla stazione (≥ 80 % delle persone).
- Causa (FATTO, codice): `folla.ts:22,25` decide «partita» solo dalla presenza di un evento `curva` nell'ondata (`attesa_curva` `e27.json:135`, `ultimi_cori` `:608`); e07 non ha eventi `curva` (solo `festa`), quindi la partita non c'è mai e `dopo` (`folla.ts:29`) resta falso.

**C27-05 — Testi che dicono una direzione diversa da quella disegnata (candidati per `verso` e per altro).** Elenco completo nella tabella del § 2. Unico caso che `verso` risolve da solo: e17 ondata 4 `piazza17b` (`data/missioni/e17.json:656`, «tutti devono tornare a casa», disegnato 69/69 verso lo stadio). Gli altri chiedono una meta diversa dallo stadio (e06, e12, e13, e22, e30), la dinamica (C27-01: e04, e17, e19, e30) o la fase (C27-04: e07, e27); e20 `fari_spenti20` è un'auto, non un corteo.

### Basso

**C27-06 — Etichetta «Magazzino delle fonderie» coperta da una pastiglia in e19.**
- Misura: e19 schieramento (dalla prima ondata), sovrapposizione 34,6×22,6 px fra `settore-nome` e `pastiglia «1»`, 16 schermate per misura, a 360, 375 e 412; anche «Strada da Kiln» × pastiglia 13,0×9,0 (360). Foto: `docs/foto/c27/360x760-e19-schierato-1.png`. C-026 non l'aveva elencata.

**C27-07 — Piccole sovrapposizioni e centri sul bordo.**
- «Intanto…» (nome di chi parla nella risposta) sopra il primo paragrafo per 2,6–5,6 px di altezza, 2–10 schermate per misura. GIUDIZIO: non ho una foto che mostri lettere tagliate; non posso confermarlo come difetto visibile.
- e01 `presidente` a 412 (`manda_vice`) ed e32 `verbale_derby` a 375×812 (`nome_larkspire`): opzione col centro dove `elementFromPoint` non trova nulla. Il caso di e01 c'era già nel C-026 (1 su 1916): ora riprodotto, quindi è stabile; IPOTESI: il centro cade sul bordo inferiore della finestra (opzione a metà visibile). Non posso confermarlo come comando coperto.

## Verificati e chiusi

| rilievo / decisione | misura |
|---|---|
| D-127 sul corteo **dell'ondata** (C24-07 per e30 ondate 2 e 4, e17 ondata 4) | 67–70 su 68–70 persone via dallo stadio in 7/7 misure (0.20.0: 69–70 verso); rosso C73V01 rimette il difetto; `data-folla` «esce» |
| D-127, nessun effetto altrove | 3/142 ondate e 8/238 schermate cambiate, tutte attese; bot `diff` vuoto |
| D-127, schema e tipi | `schema/missione.schema.json` enum `verso_lo_stadio`/`dallo_stadio`; `tipi.ts:28`; test e tipi verdi |
| C24-07 nel suo insieme | **non chiuso**: corteo della chiamata (C27-01) e forma dei viali (C27-02) |
| C24-03 («reading 'screen'») | 0 in 150 giri (`c26-chiusi.mjs` parte S) e in tutte le corse; resta la variante «reading 'on'» → C27-03 |
| Regressioni | 0 blocchi del bot, 0 scorrimenti, 0 tagli a 4 misure, salvataggi 12/12 + 6/6 + 3/3, offline verde |

## Note di metodo e limiti

- **Misura ritirata:** il verso letto dall'accoppiamento dei pixel fra due foto (§ 1.1) era rumoroso e l'ho sostituito con le posizioni Pixi.
- Le posizioni Pixi sono quelle che il gioco disegna; che i pixel le seguano lo dico dalle foto e dal conteggio delle persone arancioni, non da un confronto punto per punto.
- Corse dell'interfaccia col piano del bot attento, seme 1: 96 chiamate su strada misurate, non tutte quelle dei dati; i testi invece li ho letti tutti (85 ondate).
- Quattro browser in parallelo su 4 CPU: carico alto, utile per C27-03, e causa delle misure «ferme» del § 1.3.
- Chromium headless a DPR 1 e senza «riduci movimento» nelle corse del movimento (con «riduci movimento» nelle corse delle schermate); telefono Android, tocco col dito e DPR reali: non posso confermarli.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c27-verso.mjs` | verso dei cortei di ogni ondata da `folla.ts` della build indicata, senza browser | `node coordination/sonde/c27-verso.mjs <radice> <uscita.json>` |
| `c27-pixel.mjs` | dall'interfaccia: `data-folla`, posizioni Pixi a 400 ms (ondata e chiamata), avvicina/allontana per stadio e settori, foto della mappa | `W=360 EP=… [ROSSI=…] [FOTO=1] node coordination/sonde/c27-pixel.mjs <radice> <foto> <uscita.json>` |
| `c27-analisi-verso.mjs` | riassunto: concordanza col verso scritto, cortei opposti, confronto fra build | `[TUTTI=1] node coordination/sonde/c27-analisi-verso.mjs <nuova.json> [vecchia.json]` |
| `c27-testi-cortei.mjs` | testi dell'ondata (titolo, «i», chiamate) per ogni ondata con gente in strada | `node coordination/sonde/c27-testi-cortei.mjs <radice> <uscita.md>` |
| `c27-schermate.mjs` | come `c26-schermate.mjs`, con `H=` per 375×812 | `W=… [H=…] node coordination/sonde/c27-schermate.mjs . <foto> <uscita.json>` |
| `c27-citta-errori.mjs` | N ricariche → «Riprendi» → città → sala, errori di console | `W=412 [GIRI=150] node coordination/sonde/c27-citta-errori.mjs <radice> <uscita.json>` |
| `c26-*.mjs` | come nel C-026 | vedi COLLAUDO_C26.md sul ramo claude/valmora-collaudo-c26 |
