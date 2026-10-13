# Collaudo C-020 — 0.15.0: riga «i» delle ondate (PO-101), contrasto (C19-04, PO-098), segni e icone dell'effetto (PO-085), correzioni C-018 e C-019, regressioni

- **Build collaudata:** main 4eecaa6 (rilascio 6a5e919), GAME_VERSION 0.15.0 (`src/versione.ts:111`). Ricostruita in locale con `npm ci` e `npx vite build`.
- **Ramo:** claude/valmora-collaudo-c20. Sola lettura sul codice di gioco.
- **Data:** 2026-10-13.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core del repository), funzioni di `src/logica` e, per le funzioni della resa senza browser, `vite` (`ssrLoadModule`).
- **Sonde:** nuove `coordination/sonde/c20-*.mjs`; riprese dal ramo del C-019 `c19-coerenza.mjs`, `c19-grafica.mjs`, `c19-riserva.mjs` (copiate senza modifiche); rilanciate quelle del C-018 già su main.
- **Foto:** `docs/foto/c20/`, JPEG della finestra a 360×760, 375×667, 412×915; nome `<larghezza>-<episodio>-<vinto|perso|mercato>-<scena>[-i|-fondo].jpg` («-i» = riga «i» aperta; «mercato» = e04 con «Chiedi di chiudere il mercato subito»); `<larghezza>-citta-<episodio>.jpg` per C17-12.

Convenzioni: **FATTO MISURATO** (comando, campione, esito) · **FATTO (codice/dati)** (file:riga) · **LETTURA** (testo copiato dai dati, chiave tra parentesi) · **GIUDIZIO** e **IPOTESI** marcati.

## Riepilogo

| verifica | esito |
|---|---|
| 1. PO-101 riga «i» | icona e riga **funzionano** in 450/450 scene dell'ondata e 117/117 prove al tocco; nessuna sovrapposizione a mappa o comandi. Lettura delle 142 righe: **1 contraddizione** (e04 ondata 2, C20-01, alta) e 2 righe dubbie (C20-05); 0 righe con indicazioni su dove schierare (vedi nota). Zona di tocco 38×38 invece dei 44 dichiarati (C20-06) |
| 2. C19-04 / PO-098 contrasto | **CHIUSO**: 0 testi sotto soglia su 1422 misure (711 schermate, 32 784 testi), anche con la riga «i» aperta e con icone e segni a vista |
| 3. PO-085 segni e icone | icone e segni **uguali agli effetti dei dati** in 398/398 opzioni della stagione 1 (1155/1155 su tutte) e in 405/405 opzioni e 174/174 risposte viste nell'interfaccia. Rilievi: e04 kebab_chiuso indica il mercato invece delle fonderie (C20-02, media); 2 riserve senza segno, segni su stati che non cambiano, ⚑ uguale in andata e ritorno, segni fuori dalla finestra (C20-07, bassa) |
| 4. C-018 resa | C18-05/C17-15 **CHIUSO**; C17-05 **CHIUSO**; C17-12 **PARZIALE** (C20-03); C17-22 **CHIUSO**; C18-07 **PARZIALE** (chiuso a 375, nuovo caso a 360: C20-04); C18-08 **CHIUSO**; C18-09 **CHIUSO** |
| 5. C-019 | C19-01 **CHIUSO**, C19-02 **CHIUSO**, C19-03 **CHIUSO** per la chiamata (residuo nella variante nuova: C20-02), C19-05 **CHIUSO** |
| 6. Regressioni | offline verde; ripresa, indietro, Riparti, export/import ok; 0 errori di console; 0 blocchi su 49 200 partite |

Rilievi nuovi: **1 alto, 3 medi, 3 bassi** (tabella in fondo).

## 1. PO-101: riga «i» dell'ondata

**Codice (FATTO):** la riga è la chiave `eXX.ondataN.i` (o `<titolo>.i`), senza varianti (`src/resa/partita.ts:27-30`, `src/resa/dati.ts:21`); l'icona è nella testata (`src/resa/schermate/Fumetto.tsx:18-39`), mostrata in schieramento, chiamata, risposta e chiusura (`src/resa/App.tsx:197,205`); il rapporto ha una testata propria senza `info` (`src/resa/App.tsx:183`).

**Dati (FATTO MISURATO,** `node -e` su `data/testi/it/*.json`**):** 142 righe, una per ognuna delle 142 ondate dei 36 episodi; lunghezza minima 65, mediana 83, massima 90 caratteri; 0 oltre 90.

**Interfaccia (FATTO MISURATO,** `node coordination/sonde/c20-grafica.mjs . docs/foto/c20`**, 15 partite: e01 ed e06 vinto e perso, e04 con il mercato chiuso, a 360/375/412):**
- icona presente in **450/450** scene dell'ondata (schieramento, chiamata, risposta, chiusura); **0/51** rapporti (per costruzione, vedi sopra);
- 117 prove al tocco (schieramento e prima chiamata di ogni ondata, chiusura dell'ondata 1): si apre 117/117; testo uguale ai dati 117/117; sotto il titolo 117/117; dentro la finestra 117/117; non coperta da altro 117/117; `aria-expanded="true"` 117/117; si chiude al secondo tocco 117/117 e toccando il titolo 117/117;
- area sovrapposta alla mappa **0 px²**, ai comandi **0** (la riga sta nella testata, che è nel flusso: apre spazio e **sposta la mappa in giù di 59 px** a 360 e 375, 43–59 a 412);
- testi sotto soglia con la riga aperta: 0.
- Foto: `360-e01-vinto-schieramento-1-i.jpg`, `375-e01-vinto-chiamata-1-i.jpg`, `412-e06-vinto-schieramento-1-i.jpg`, `375-e04-mercato-schieramento-2-i.jpg`.
- **Zona di tocco:** tasto 32×32; la griglia di 8×8 punti su 42 px attorno al centro colpisce il tasto in 36/64 punti a tutte le larghezze, cioè circa 38×38. Il commento in `src/resa/stile-c18.css:17-19` dichiara «il tocco resta 44 px (::after)»: il `::after` misura 38×38 (stile calcolato: `inset: -6px` sul riquadro interno di 26 px, perché il bordo è 3 px). C20-06.

**Lettura delle 142 righe** (LETTURA; elenco con titoli, eventi e chiamate di ogni ondata prodotto con lo script nel blocchetto «Sonde»):
- **Contraddizione con i dati (C20-01):** «Poco prima del fischio d'inizio: gli ultimi tifosi entrano e il mercato è ancora lì.» (e04.ondata2.i). Dopo «Chiedi di chiudere il mercato subito» (e04.op.chiudi_mercato, risposta «Si smonta borbottando.») la riga si legge identica: FATTO MISURATO, `node coordination/sonde/c20-coerenza.mjs 1000`, caso I1: scelta fatta 1000/1000, ondata 2 raggiunta (riga visibile) **1000/1000**. Il gioco stesso nasconde in quel caso «Mercato ancora mezzo pieno» (e04.ch.verdura, `"dopo": {"mai": ["arance/chiudi_mercato"]}`, `data/missioni/e04.json:256`) e nell'ondata 3 dice «Mercato già smontato» (e04.ch.risultato_chiuso). Foto `375-e04-mercato-schieramento-2-i.jpg`. Più lieve, stessa causa: «il mercato è aperto fino alla strada dello stadio» (e04.ondata1.i) resta nelle chiamate dell'ondata 1 dopo la chiusura. Causa (FATTO, codice): la riga non ha varianti.
- **Dubbie (C20-05, bassa):** «Secondo tempo: la partita è ancora aperta, e intanto la busta col nome pesa.» (e24.ondata3.i) anche dopo «Consegnala chiusa» («La busta esce in una cartellina rossa.», e24.op.consegna_chiusa.r): caso I3, 1000/1000; GIUDIZIO: si può leggere in senso figurato. «Il gol della storia» / «un gol da ricordare» (e07.ondata3.i), «un gol scuote lo stadio» (e10.ondata3.i), «un testimone della rete dei biglietti chiede protezione» (e18.ondata1.i), «il Fabbro chiede «rispetto»» (e08.ondata1.i), «la curva Larkspire diserta» (e31.ondata2.i): anticipano una chiamata, ma lo stesso fatto è già nel titolo dell'ondata o nell'introduzione (LETTURA: e18.intro1 «Uno vuole parlare della rete dei biglietti. In cambio vuole protezione.»; e08.intro2 «il Fabbro chiede «rispetto»»; e31.intro2 «La curva Larkspire diserta.»). GIUDIZIO: non anticipano niente di nuovo; le segnalo perché il PO decida se vanno bene.
- **Esiti:** nessuna riga anticipa un risultato o un esito che i dati non abbiano già nel titolo («I supplementari», «Il voto rinviato», «Il gol»). I fatti controllati contro le introduzioni: «a quattrocento metri» (e06.intro1), «l'ora fissata per il comando al porto, alle fonderie e al cantiere» (e35.intro1 «All'una il comando entra al porto, alle fonderie e al cantiere»), «sconfitta fuori casa» (e11.intro1 «ha perso quattro a zero fuori»), «Cinderwick–Saltmere» (e12.intro2), «Cinderwick–Quillhaven» (e16.intro2): combaciano.
- **Dove schierare (D-116):** FATTO MISURATO, `grep -iE "serv|convien|meglio|attent|tieni|mand|copr|squadr|schier|rischi|pericol|…"` sulle 142 righe: nessuna parola che dica dove mettere un'unità (le 14 righe trovate contengono «steward» come persone in sciopero, «gol», «rischia lo sgombero», «comando»). Con un riconoscimento per parole chiave (approssimato, script `nomina.mjs` nel blocchetto «Sonde») 50 righe su 142 nominano il settore con più pressione dagli eventi dell'ondata, 25 nominano solo quello (es. «lo stadio si svuota e il quartiere vorrebbe dormire», e03.ondata4.i). GIUDIZIO: descrivono dove si trova la gente, come il titolo e le chiamate, non quale unità rende di più; **non posso confermare** se il PO le consideri un suggerimento.

## 2. Contrasto (C19-04, PO-098)

- FATTO (codice): `--colore-bene: #0b7d3e` (`src/resa/token.css:23`), rosso C40C01 rimette #0f9d4f (`src/resa/token.css:205`).
- FATTO MISURATO, c20-grafica: **0 testi sotto soglia su 1422 misure** (711 schermate, ognuna a inizio e a fondo pagina; 32 784 testi misurati), soglia 4,5:1 (3:1 per testo grande), formula https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio. Comprese: sala, briefing, schieramento, chiamate con le icone dell'effetto, risposte con i segni, rapporti con «sotto controllo / ma ancora caldo», verbale; più le 117 misure con la riga «i» aperta (0 sotto soglia). Nel C-019: 235/1212.
- Calcolo dal valore del token: #0b7d3e sul bianco = 5,23:1 (dichiarato nel commento, rifatto con la stessa formula della sonda: coincide).
- Braccio rosso: vedi sezione «Braccio rosso».

## 3. PO-085: segni sul settore e icone sotto le opzioni

**Attesa scritta dai dati, senza usare il codice della resa** (`coordination/sonde/c20-effetti.mjs`): tensione/pressione ≠ 0 → icona del settore, segno ▲ se > 0 e ▼ se < 0; credito ≠ 0 → icona fiducia; riserva ≠ 0 → icona della risorsa e segno ⚑ sul settore della chiamata.

- FATTO MISURATO, `node coordination/sonde/c20-effetti.mjs 300`, parte A: **stagione 1: 398 opzioni (707 effetti), icone diverse dall'attesa 0, segni diversi 0**; settori degli effetti fuori dalla mappa 0; nomi di settore mancanti 0. Tutti i 36 episodi: 1155 opzioni, 0 e 0. Opzioni senza nessuna icona: 14 in stagione 1 (12 senza effetti, 2 con sole variabili di storia).
- Nell'interfaccia (c20-grafica): **405/405** opzioni mostrate con le icone uguali all'attesa (393 con almeno un'icona); **174/174** risposte con i segni uguali all'attesa (210 segni). Foto `360-e01-vinto-segni-corteo_partito.jpg`, `375-e06-vinto-segni-palco.jpg`.
- **Settore giusto rispetto al testo** (LETTURA aiutata da `node coordination/sonde/c20-luoghi.mjs 1`, parole chiave scritte a mano): 352 opzioni della stagione 1 con effetti su un settore; nelle 82 in cui la sonda non trova il nome del settore nell'accenno ho letto ogni accenno: quasi sempre dice «la curva», «la piazza», «il picchetto» per il settore della chiamata. Due casi non combaciano:
  - **e04 kebab_chiuso / «Accompagnali allo stadio»** (C20-02): chiamata «In rete: mercato chiuso, i Rovers cercano panini alle fonderie.» (e04.ch.kebab_chiuso, settore piazza_fonderie); l'opzione ha l'accenno «La zona del mercato si alleggerisce; ti costa una squadra fino a sera.» (e04.op.scorta_ospiti.c) e l'effetto `"pressione": "mercato", "valore": -1` (`data/missioni/e04.json`, chiamata kebab_chiuso): icona «Mercato» e segno ▼ sul mercato chiuso, mentre i Rovers sono alle fonderie. FATTO MISURATO, c20-coerenza G3c: opzione offerta **1000/1000** dopo la chiusura del mercato. Causa (FATTO, dati): la variante nuova di C19-03 ha ripreso opzioni, accenni ed effetti della chiamata kebab.
  - e02 comitato_quartiere / «Presidio nel quartiere»: accenno «Il quartiere si calma, la curva ospiti si irrita.» (e02.op.presidio_quartiere.c), effetto sulla pressione di curva_larkspire: l'icona dice «Curva Larkspire» per «il quartiere» (il quartiere non è un settore di e02). GIUDIZIO: lieve, la chiamata è del comitato di Larkspire; in C20-07.
- **Segni che non corrispondono a un cambiamento** (parte B, 300 partite casuali per episodio, variabili di partenza a caso): stagione 1, 44 261 risposte, 54 894 segni (pressione 34 947, tensione 14 485, squadra 5 462); **184** segni (0,34%) su una tensione già a 0 (▼) o a 10 (▲), o su una riserva già al tetto. Esempio: e02 selfie «devia» ▼ su curva_larkspire con tensione 0. Tutti gli episodi: 365 su 166 316.
- **Riserva senza segno:** 2 opzioni della stagione 1 cambiano le unità ma la chiamata non ha settore, quindi niente ⚑: e01 rinforzi «chiedi» (+2 squadre), e02 risultato «prima_ospiti» (−1 squadra). 7 su tutti gli episodi.
- **⚑ uguale nei due versi:** FATTO (codice) `src/resa/mappa/Mappa.tsx:116`: il carattere è ⚑ sia per «squadre in arrivo» sia per «squadre richiamate»; il verso è solo nell'`aria-label`.
- **Segni fuori dalla finestra:** 2 su 210 (375, e06 vinto, «saluto_cantante» → «saluti_tutti»: ▲ curva_cinderwick e ▼ curva_ospiti fuori dalla finestra perché la mappa è scrollata via dopo il tocco sull'opzione). 0 a 360 e 412.
- Durata: 1,8 s (`src/resa/App.tsx:76`); con «riduci movimento» senza animazione.

## 4. Correzioni grafiche del C-018

| voce | esito | misura |
|---|---|---|
| C18-05 / C17-15 «Rispondi» | **CHIUSO** | c20-grafica: 174 chiamate, «Rispondi» in 124 (57/58 a 360, 58/58 a 375, 9/58 a 412); **sopra testo-radio, vice, mittente o vignetta 0**; dopo il tocco prima opzione intera 124/124, coperta 0. Stesso esito con `node coordination/sonde/c18-grafica.mjs`: sopra testo-radio 0/28 a 360 e a 375 (C-019: 28/28 a 375, fino a 4539 px²). FATTO (codice): ora nel fumetto, `src/resa/schermate/Ondata.tsx:51` e `stile-c18.css:4` |
| C17-05 «sotto controllo, ma ancora caldo» | **CHIUSO** | `c20-effetti.mjs 300`, parte C: settori coperti con tensione ≥ 7 nei rapporti **852, mostrati «caldo» 852**; scoperti mostrati diversamente 0. Nell'interfaccia: 51 rapporti, 3 settori «caldo», contrasto ok. Braccio rosso `__NO_C42C01`: 0 su 53 |
| C17-12 nome dell'episodio nella città | **PARZIALE** | `node coordination/sonde/c20-citta.mjs . docs/foto/c20` (salvataggio con i 36 episodi conclusi, ogni episodio scelto a turno): il nome copre altri dischi in **15/36 a 360 (max 1451 px²), 13/36 a 375 (max 1304), 0/36 a 412**; fuori dalla mappa 0. Rosso `ROSSO=1` (`__NO_C42N01`): 29/36, 29/36, 18/36 (max 4257 px²). e01 libero a tutte le larghezze. Foto `375-citta-e07.jpg` («La neopromossa» copre per intero il disco 6), `360-citta-e06.jpg`. C20-03 |
| C17-22 verbale a 375 | **CHIUSO** | c20-grafica: 75 schermate del verbale, testi coperti da elementi fissi **a fondo pagina 0**; all'inizio pagina 2 (375 e01 e06 persi, primo passo: «Ricomincia l'episodio» sotto «Avanti», si scopre scorrendo di 45 px). FATTO (codice) `stile-c18.css:8-9` |
| C18-07 «?» a 375 | **CHIUSO a 375, PARZIALE in tutto** | c20-grafica: aiuto aperto dentro la finestra 15/15; coperto dalla barra fissa **0 a 375 e 412, 2470 px² a 360** (e01 ed e06, 4/4: riquadro 602–701 px in una finestra di 760, sotto «Conferma»). A 360 con e04 0. C20-04 |
| C18-08 stemmi della sfida | **CHIUSO** | 60 schermate del verbale con la sfida sulla riga delle stelle; nomi dei club visibili 0; sopra la vignetta 0 px²; nome del club nell'etichetta dello stemma («stemma di Cinderwick United», «stemma di Quillhaven Albion») |
| C18-09 «Fiducia ±N» | **CHIUSO** | 48 rapporti con la riga (16 per larghezza): coperta da elementi fissi 0 a inizio e a fondo pagina; dentro la finestra senza scorrere 48/48 |

Errori di console: 0 (c20-grafica 15 partite, c20-citta 3 larghezze × 36 episodi, c18-grafica 6 partite).

## 5. Correzioni del C-019

| voce | esito | misura |
|---|---|---|
| C19-01 e09 non_erano_nostri dopo lo scarico | **CHIUSO** | `node coordination/sonde/c19-coerenza.mjs 1000`, F2a: **0/1000** (C-019: 1000/1000); c20-coerenza G1a 0/1000, rosso `__NO_PO086` 200/200. Verbale «a fatica» ora neutro: «Cori di troppo, ingressi a singhiozzo. …» (e09.verbale_a_fatica), mostrato 178/1000 (F2b) senza più la lite |
| C19-02 e06 bis corto + favore | **CHIUSO** | c20-coerenza G2a (risultato «nello stesso momento») **0/1000**, G2b risultato_favore **1000/1000**, rosso 200/200 per entrambi. LETTURA: «Uno a uno. Concerto finito in orario, ma la piazza non si è svuotata: esce ora, con lo stadio.» (e06.ch.risultato_favore). G2c: favore_impresa dopo «Un bis corto» 1000/1000 |
| C19-03 e04 kebab a mercato chiuso | **CHIUSO** per la chiamata | G3a kebab **0/1000**, G3b kebab_chiuso 1000/1000 (rosso: kebab 200/200). LETTURA: «In rete: mercato chiuso, i Rovers cercano panini alle fonderie.» Residui: l'opzione «Accompagnali allo stadio» della variante parla del mercato (C20-02); «Lascialo passare fra i banchi» (e04.op.corteo_banchi) resta offerta 1000/1000 (G3d), già giudicata lieve nel C-019 |
| C19-05 testi accorciati | **CHIUSO** | LETTURA: «Comitato residenti: «sabato, amichevole: auto sui passi carrabili fino alle 2».» (e03.info_comitato, punto messo); «Centrale radio:» in e04.info_radio ed e06.info_radio; «Il capotreno vuole qualcuno di grosso ad aspettarli.» (e11.ch.treno_ritorno); «Tranquilli, per ora. Che facciamo?» (e01.ch.pullman) con «Tutto tranquillo, si aspetta» che ora risponde. GIUDIZIO: «fino alle 2» in una notte di coppa si legge come le due di notte |

Logica (FATTO MISURATO, `node coordination/sonde/c18-verifica.mjs 1000`): VERDE, 12 000 partite, 1265 chiamate «senza», 0 violazioni; 8988 scelte con «dopo», 0 violazioni; 15 535 impegni, 0 violazioni; 0 eccezioni. Chiamate della stagione 1 mai aperte su 1000 partite casuali per episodio: nessuna (c19-coerenza, parte 2).

## 6. Regressioni

- **Offline:** `node tools/offline.mjs dist` → «offline: verde (O1-O4)».
- **Ripresa, indietro, Riparti, export/import** (FATTO MISURATO, `node coordination/sonde/c17-affidabilita.mjs .`, 360×760):
  - sconfitta di e01 (partita c17:e01:casuale:3) → verbale con «Riparti dall'ondata 2»; ricarica → «Riprendi» → verbale; tasto indietro sul verbale → resta sul verbale;
  - «Riparti» → schieramento dell'ondata 2, ondata salvata 2; dal salvataggio il bot attento vince («contenuto»);
  - ricarica sulla risposta → «Riprendi» → chiamata successiva con la risposta salvata; tasto indietro in chiamata → titolo, «Riprendi» → stessa chiamata; ricarica sul rapporto → rapporto; bozza dello schieramento 6 pastiglie prima e dopo;
  - esporta (valmora-2026-10-13.json) → cancella → importa: salvataggio uguale; «Riprendi» → schieramento;
  - errori di console 0.
  - Tempi (una corsa, solo confronto, vedi «Ritiri e note»): titolo 205 ms a CPU 1× e 751 a 4× (C-019: 330 e 962); Riparti e02 506 e 1172 ms (C-019: 753 e 1407); fotogrammi in chiamata 60/59 a 360 e 60/51 a 412 (C-019: 41/37 e 55/31). IPOTESI: macchina diversa da quella del C-019; non sono misure di gioco.
- **Errori di console:** 0 in c20-grafica (15 partite, 711 schermate), c20-citta (216 scelte), c18-grafica (6 partite), c17-affidabilita.
- **Soft-lock:** 0 blocchi e 0 eccezioni, ogni partita chiusa con un esito:
  - `node tools/bot.mjs 100`: 156 righe strategia × episodio, «blocchi 0/100» in 156/156 (15 600 partite) più 300 partite per episodio «scelte a caso con schieramento attento» (10 800), nessuna chiamata «mai comparsa» in campagna;
  - c18-verifica: 12 000 partite casuali della stagione 1;
  - c20-effetti: 10 800 partite casuali su 36 episodi;
  - c20-coerenza 12 casi × 1000 e c19-coerenza 10 casi × 1000 più 12 000 partite casuali.
  - Totale contato una volta sola: **49 200 partite** (15 600 + 10 800 + 12 000 + 10 800), 0 blocchi.

## Braccio rosso

Ogni correzione misurata ha il suo braccio rosso, con la stessa sonda:
- **Interfaccia** (`ROSSO=C43I01,C40C01,C39I01,C39E01,C42R01,C42F01,C42V01,C42A01,C42S01,C42C01 EP=e01 node coordination/sonde/c20-grafica.mjs . <cartella>`, 6 partite): «i» in **0/204** scene (verde 450/450); testi sotto soglia **138/612** misure (verde 0/1422), gli stessi del C-019: «+1» 3,53:1, «sotto controllo» 3,53:1, «Cosa ti ha aiutato» 3,53:1, e «Fiducia +1: …» 2,46:1 sul giallo (col C42F01 la riga torna in fondo); icone uguali all'attesa 12/198 (solo le opzioni senza effetti; verde 405/405); segni 0 (verde 210); «Rispondi» sopra il testo **42/44** (verde 0); «caldo» 0; «Fiducia ±N» dentro la finestra senza scorrere 6/18 e coperta 3 (verde 48/48 e 0); sfida sulla riga delle stelle 0 (verde 60); verbale a 375, passo 5: «In rete: la curva …» sotto i pulsanti fissi, 11 620 px² a fondo pagina (verde 0).
- **Cieco:** la misura dell'aiuto «?» non vede il difetto originale di C18-07 (unità spinte sotto «Conferma» a 375): col rosso C42A01 l'aiuto torna sopra le unità e il riquadro risulta non coperto (0/6). L'esito di C18-07 a 375 si basa sul verde (riquadro dentro la finestra e non coperto, 5/5 a 375) e sulla foto `375-e01-vinto-schieramento-aiuto.jpg`; il caso nuovo a 360 (C20-04) la sonda invece lo vede.
- **Città** (`ROSSO=1 node coordination/sonde/c20-citta.mjs .`): 29/36, 29/36, 18/36 nomi sopra altri dischi (verde 15, 13, 0).
- **Logica:** c20-effetti `ROSSO=1` (20 partite per episodio): segni 0, segni diversi dall'attesa 365/398 in stagione 1 (le opzioni con segni); «caldo» 0 su 53. c20-coerenza con `__NO_PO086` (200): G1a, G2a, G3a tornano 200/200.

## Rilievi nuovi (per gravità)

Metro delle gravità come nel C-019: «alta» = contraddizione misurata al 100% di una scelta dell'episodio.

| id | gravità | asse | riproduzione | misura | foto | ipotesi di causa |
|---|---|---|---|---|---|---|
| C20-01 | **alta** | credibilità (PO-101) | e04, ondata 1, «Chiedi di chiudere il mercato subito». Ondata 2, tocco sulla «i»: «Poco prima del fischio d'inizio: gli ultimi tifosi entrano e il mercato è ancora lì.» (e04.ondata2.i) | c20-coerenza I1: **1000/1000**; nell'interfaccia a 360/375/412 (foto). Il gioco nasconde e04.ch.verdura per lo stesso motivo (`data/missioni/e04.json:256`); ondata 3: «Mercato già smontato» | `375-e04-mercato-schieramento-2-i.jpg`, `360-e04-mercato-chiamata-2-i.jpg` | La riga «i» non ha varianti (`src/resa/partita.ts:27-30`); il guardiano `tests/ondata-info.test.ts` controlla presenza e lunghezza, non le scelte. Più lieve: e04.ondata1.i «il mercato è aperto» dopo la chiusura, nella stessa ondata |
| C20-02 | media | credibilità + PO-085 (settore) | e04, «Chiedi di chiudere il mercato subito» → «In rete: mercato chiuso, i Rovers cercano panini alle fonderie.» → opzione «Accompagnali allo stadio»: accenno «La zona del mercato si alleggerisce», icona «Mercato», dopo la risposta ▼ sul mercato | c20-coerenza G3c **1000/1000**; FATTO (dati): `"pressione": "mercato"` nella chiamata kebab_chiuso | `375-e04-mercato-chiamata-arance.jpg` (scena prima) | La variante kebab_chiuso (correzione di C19-03) ha copiato opzioni, accenni ed effetti di kebab |
| C20-03 | media | grafica (C17-12) | Città, salvataggio con gli episodi conclusi, a 360 o 375: toccare il disco 7 (e07) | c20-citta: nome sopra altri dischi 15/36 a 360 (max 1451 px²), 13/36 a 375 (max 1304), 0/36 a 412; rosso 29/29/18 | `375-citta-e07.jpg`, `375-citta-e19.jpg`, `375-citta-e31.jpg` | IPOTESI: a 360/375 nessuno dei posti provati da `disponiNomeCitta` (`src/resa/mappa/etichette.ts:93-112`) è libero e vince il meno costoso; il guardiano `tools/foto-c17.mjs:15-35` misura solo le città delle foto |
| C20-04 | media | grafica (C18-07) | e01 o e06, schieramento dell'ondata 1, a 360×760, tocco su «?» | c20-grafica: riquadro 602–701 px, **2470 px² sotto la barra fissa «Conferma»**, 4/4 partite a 360; 0 a 375 e 412 | – | IPOTESI: a 360×760 il riquadro aperto è già dentro la finestra (602–701 px), quindi `scrollIntoView({ block: 'nearest' })` (`src/resa/schermate/Schieramento.tsx:77`) non scorre e `scroll-margin-bottom` (`stile-c18.css:12-13`) non entra in gioco; resta sotto la barra fissa. Non posso confermarlo senza toccare il codice |
| C20-05 | bassa | testi (PO-101) | e24 «Consegnala chiusa», ondata 3: «… intanto la busta col nome pesa.» (e24.ondata3.i); righe che anticipano una chiamata già annunciata da titolo o introduzione (e07, e08, e10, e18, e31) | c20-coerenza I3 1000/1000 | – | GIUDIZIO: figurato; da rileggere |
| C20-06 | bassa | grafica (PO-101) | Tasto «i» nella testata | Tasto 32×32, zona di tocco misurata 38×38 (36/64 punti su 42 px), contro i 44 dichiarati in `stile-c18.css:17-19` | `375-e01-vinto-schieramento-1-i.jpg` | Il `::after` con `inset: -6px` parte dal riquadro interno (26 px, bordo 3 px): 26 + 12 = 38 |
| C20-07 | bassa | PO-085 | Segni e icone | 184/54 894 segni della stagione 1 su uno stato che non cambia (tensione già a 0 o 10, riserva al tetto); 2 opzioni con riserva senza ⚑ (chiamata senza settore: e01 rinforzi, e02 risultato); ⚑ uguale per squadre in arrivo e richiamate (`src/resa/mappa/Mappa.tsx:116`); 2/210 segni fuori dalla finestra (375, e06 saluto_cantante); e02 «Presidio nel quartiere» con icona «Curva Larkspire» | `375-e06-vinto-segni-palco.jpg` | Il segno legge l'effetto, non il cambiamento dello stato |

## Ritiri e note di metodo

- **Icone, braccio rosso:** `__NO_C39I01` spegne il componente `EffettiOpzione`, non la funzione `vociEffetti`: la parte A di c20-effetti (che chiama la funzione) non lo vede, e lo dichiaro; il rosso delle icone è misurato nell'interfaccia (sezione «Braccio rosso»).
- **c20-luoghi:** riconoscimento a parole chiave scritte a mano: serve a scegliere che cosa leggere, non è una misura; gli esiti della sezione 3 vengono dalla lettura.
- **«nomina» delle righe «i»:** stesso limite (per esempio «sugli spalti» assegnato alla curva ospiti); i numeri 50 e 25 sono indicativi.
- **Testi coperti da elementi fissi a inizio pagina** (172 schermate su 711): è il comportamento atteso di una barra fissa su una pagina che scorre; conta solo a fondo pagina (0 nel verbale).
- **Tempi** (c17-affidabilita): CLAUDE.md vuole misure in passi; li riporto solo come confronto col C-019, una corsa, con altre sonde in parallelo: non li uso per nessun esito.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `c20-grafica.mjs` | PO-101 (icona, tocco, sovrapposizioni, zona di tocco), contrasto di ogni testo, icone e segni PO-085 contro i dati, C18-05, C17-05, C18-09, C17-22, C18-08, C18-07, errori; foto | `node coordination/sonde/c20-grafica.mjs . docs/foto/c20` (filtri `EP=`, `LARG=`; rosso `ROSSO=C43I01,…`) |
| `c20-citta.mjs` | C17-12, nome dell'episodio sopra gli altri dischi, 36 episodi × 3 larghezze | `node coordination/sonde/c20-citta.mjs . [foto]` · `ROSSO=1` |
| `c20-effetti.mjs` | PO-085 parte A (tutte le opzioni), B (segni senza cambiamento), C (C17-05) | `node coordination/sonde/c20-effetti.mjs 300` · `ROSSO=1` |
| `c20-luoghi.mjs` | settori nominati negli accenni contro i settori degli effetti (aiuto alla lettura) | `node coordination/sonde/c20-luoghi.mjs 1` |
| `c20-coerenza.mjs` | C19-01/02/03 e righe «i» dopo una scelta | `node coordination/sonde/c20-coerenza.mjs 1000` · rosso `node --import 'data:text/javascript,globalThis.__NO_PO086=true' … 200` |
| `c19-*.mjs`, `c18-*.mjs`, `c17-affidabilita.mjs` | come nei rapporti C-019 e C-018 | vedi COLLAUDO_C19.md |

Elenco delle 142 righe con titolo, eventi e chiamate (usato per la lettura): `node -e` che per ogni `data/missioni/eXX.json` stampa titolo dell'ondata, riga `.i`, eventi `tipo@settore:pressione` e chiamate con il testo da `data/testi/it/eXX.json`. Parole chiave delle righe: script `nomina.mjs` (cartella di lavoro, non nel ramo; stesso metodo di c20-luoghi).
