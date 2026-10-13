# Collaudo C-018 — correzioni della 0.12.0/0.13.0, coerenza scelte → testi, grafica, regressioni

- **Build collaudata:** main 5bcaf6b, GAME_VERSION 0.13.0 (`src/versione.ts:96`). Ricostruita in locale con `npm ci` e `npx vite build`.
- **Ramo:** claude/valmora-collaudo-c18 (da main). La sessione ha lavorato in sola lettura sul codice di gioco.
- **Data:** 2026-10-13.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core 1.64.0) e le funzioni di `src/logica`.
- **Sonde:** quelle del C-017 (`coordination/sonde/c17-*.mjs`) rilanciate senza modifiche, più tre nuove (`c18-*.mjs`, sezione «Sonde»).
- **Foto:** `docs/foto/c18/`, JPEG della **finestra** (non della pagina intera) a 360×760, 375×667 e 412×915. Il suffisso `-fondo` è la stessa schermata scorsa fino in fondo; `-dopo-rispondi` è la chiamata dopo il tocco su «Rispondi»; `-aiuto` è lo schieramento col «?» aperto.

Convenzioni:
- **FATTO MISURATO:** comando, campione ed esito.
- **IPOTESI:** marcata come tale.
- **LETTURA:** testo copiato dai dati (`data/testi/it/*.json`), con la chiave tra parentesi.

## 1. Le correzioni dichiarate reggono?

Riepilogo: **13 CHIUSE, 6 PARZIALI, 0 NON CHIUSE** (19 righe: C17-02 è diviso nei suoi cinque casi; PO-095 sta con C17-02 (e)).

| voce | dichiarato | esito | misura |
|---|---|---|---|
| C17-01 (e04, mercato chiuso) | campo «dopo»: verdura, casalinghi e risultato non si aprono dopo la chiusura | **CHIUSO** per i testi citati | FATTO MISURATO, `node coordination/sonde/c17-coerenza.mjs 1000`: chiudi_mercato → verdura 0/1000, → casalinghi 0/1000; sgombera → casalinghi 0/655. Braccio rosso (`__NO_PO086`, 200 partite): 200/200, 200/200, 200/200: la sonda vede il difetto. Il risultato ha due varianti «mercato già smontato» (`risultato_chiuso`, `risultato_sgombero`). **Restano altri testi dello stesso episodio che parlano di bancarelle aperte: C18-02.** |
| C17-02 (a) e06 bis | varianti del risultato secondo il bis | **CHIUSO** | c17-coerenza 1000: niente_bis → risultato 0/1000; bis_lungo → risultato 0/1000. Rosso: 200/200 e 200/200. |
| C17-02 (b) e09 pullman scaricati | rigore9 e contro_tutti con «dopo» | **PARZIALE** | c17-coerenza 1000: scarica_pullman → rigore9 0/1000 (rosso 200/200). Però il risultato dell'ondata 4 dice ancora «pullman dei Rovers dall'altra parte della tangenziale» e il vice «Arrivati tardi, ripartono tardi» in **1000/1000** partite: C18-01. |
| C17-02 (c) e10 fumogeni | fumo_pareggio con «dopo» | **CHIUSO** | c17-coerenza 1000 (rapporto_dessi=rispetto): fidati10 → fumo_pareggio 0/1000. Rosso 200/200. |
| C17-02 (d) e03 promessa | silenzio solo dopo la promessa, silenzio_np altrimenti | **CHIUSO** | FATTO MISURATO, `node coordination/sonde/c18-coerenza.mjs 1000 V02d,V02d2`: senza promessa → «Avevate promesso» 0/1000; con promessa → variante senza promessa 0/1000. |
| C17-02 (e) e05 + PO-095 | chiamate «non c'è nessuno» solo con settore sguarnito (campo «senza») | **CHIUSO** | FATTO MISURATO, `node coordination/sonde/c18-verifica.mjs 500` (giocatore casuale, e01–e12, 6000 partite): 590 chiamate «senza» aperte, **0** con un'unità delle risorse indicate nel settore. Rosso (`ROSSO=1`): 922 su 1500. Il controllo è in `src/logica/missione.ts:130,134-137`. |
| C17-03 mediatore già impegnato | opzione che impegna un'unità non offerta se l'unità è finita | **CHIUSO** | c17-coerenza 1000: e02 mediatore_casa 0/1000, e07 mediatore_festa 0/1000 (rosso 200/200 e 200/200). c18-verifica, 6000 partite: 7752 scelte che impegnano un'unità, 0 senza unità rimaste; rosso 129. Codice `missione.ts:149-152`. **Resta la risposta dell'altra opzione, che dice il contrario: C18-04.** |
| C17-09 verbali | verbali di e01–e04 resi neutri | **PARZIALE** | Testi cambiati in 8c68c8f (`git show 8c68c8f -- data/testi/it/e0[1-4].json`), per esempio e04: «nessuna arancia di troppo per terra» → «qualche cassetta fuori posto, nessun ferito» (e04.verbale_contenuto). LETTURA: i quattro nuovi testi non contraddicono più le scelte citate dal C-017. **Non toccato e08:** «Tano Ferrigno non ha avuto più di quanto gli spettasse» (e08.verbale_contenuto) compare dopo «Concedi l'accesso senza controlli» in 777/1000 partite e dopo «Stringigli la mano» in 563/1000 (c18-coerenza, casi R09a, R09b). Nuovo verbale contraddittorio in e09: C18-01. |
| C17-04 Riparti dopo ricarica | sconfitta conservata nel salvataggio | **CHIUSO** | FATTO MISURATO, `node coordination/sonde/c17-affidabilita.mjs .`, A2 (e01, partita c17:e01:casuale:3): verbale con «Riparti dall'ondata 2»; ricarica → titolo → «Riprendi» → **verbale, «Riparti» presente (1)**. Nel C-017 era 0. Tasto indietro sul verbale → resta sul verbale, «Riparti» presente. |
| C17-05 fiducia e «degenerati» | la fiducia scende solo per settori scoperti e degenerati | **PARZIALE** | FATTO MISURATO, `node coordination/sonde/c17-rapporto.mjs 200` (9246 rapporti): rapporti con tutti i settori «sotto controllo» e fiducia negativa **0** (C-017: 20; rosso `__NO_C17R05`: 21). Resta l'altra metà del rilievo: in **235 dei 2099** rapporti con un settore a tensione ≥ 7 (11%) quel settore è scritto «sotto controllo» in verde accanto a un pallino rosso (C-017: 232). Esempio: foto 412-persa-rapporto-3.jpg, «Curva Larkspire» pallino rosso, «SOTTO CONTROLLO». FATTO (codice): l'etichetta guarda solo «scoperto» (`src/resa/schermate/Rapporto.tsx:39`), il colore la tensione (riga 36). |
| C17-06 Riparti lento | calcolo più leggero, stima oltre 1000 stati | **CHIUSO** | FATTO MISURATO, `node coordination/sonde/c17-tempi.mjs` (2255 sconfitte casuali, 36 episodi): massimo **256 ms** (e01 seme 3), e02 massimo 167 ms; nel C-017 1035 ms. Nel browser (c17-affidabilita A6, e02 partita c17:e02:casuale:45, una prova per velocità): dal tocco al verbale **583 ms** a CPU 1× e **1759 ms** a CPU 4× (C-017: 1743 e 6489 ms); «Riparti dall'ondata 2» proposto come prima. |
| C17-12 città a 360/375 | mappa bassa ma larga, episodio scelto in primo piano | **PARZIALE** | FATTO MISURATO, `node coordination/sonde/c17-schermate.mjs . <cartella>`: nessuna sovrapposizione fra dischi a nessuna larghezza (C-017: 158 px²). Ma l'etichetta dell'episodio scelto («Primo giorno, primo derby») copre il disco 5 per **1812 px²** a 360 e a 375 (quasi tutto il disco) e il 6 per 258 e 82 px²; a 412 copre il 5 per 107 px². Mappa alta 260 px a 360 e 375, 415 px a 412. Foto 360-citta.jpg, 375-citta.jpg. |
| C17-15 «Rispondi» | il tocco porta alla prima opzione | **PARZIALE** | FATTO MISURATO, `node coordination/sonde/c18-grafica.mjs . docs/foto/c18` (e01 dall'interfaccia, 84 chiamate): «Rispondi» compare in 18/28 chiamate a 360, 28/28 a 375, 0/28 a 412. Dopo il tocco la prima opzione è intera nella finestra in **46/46** casi, coperta da elementi fissi in 0. Però, prima del tocco, «Rispondi» copre il testo della chiamata o il commento del vice in 42/46 casi: C18-05. |
| C17-16 bozza dello schieramento | bozza nel salvataggio | **CHIUSO** | FATTO MISURATO, c17-affidabilita A4: 6 unità piazzate e non confermate, ricarica, «Riprendi» → schieramento con **6** pastiglie (C-017: 0). |
| C17-17 sala | in sala non pulsa niente; nel briefing pulsa il settore del passo | **CHIUSO** | FATTO MISURATO, c18-grafica: in sala `data-lampeggianti` vuoto in 3 passi × 3 larghezze × 2 partite; nel briefing pulsa un settore solo, quello della fonte del passo: strada_cinderwick, strada_cinderwick, strada_larkspire, curva_larkspire (= `briefing[i].settore` di e01). Nota: il compito parla di «in sala pulsa solo il settore del passo»; il codice dice «in sala non pulsa niente» (`src/resa/App.tsx:161-162`) e il settore del passo pulsa nel briefing (riga 167). |
| C17-22 riepilogo a 375 | pulsanti sotto l'elenco, non fissi | **PARZIALE** | FATTO MISURATO, c18-grafica: riepilogo a 375×667, 0 righe coperte (C-017: fino a 3578 px²); i due pulsanti si raggiungono scorrendo 135 px (foto 375-riepilogo.jpg, 375-riepilogo-fondo.jpg). **Non toccata** l'altra metà del rilievo: ultimo passo del verbale perso a 375, a inizio pagina «Voci in rete» e il suo testo stanno sotto «Indietro / Alla mappa della città» (11796 px²); scorrendo 110 px si leggono (0 px² coperti a fondo pagina). Foto 375-persa-verbale-5.jpg e -fondo. |
| PO-092 vignette stile C | sala, verbale, chiamate | **CHIUSO** (lettura delle foto) | Vignette a retino: «Stasera» in sala (360-sala-1.jpg), busti nel verbale (360-verbale-1.jpg), vignetta in 84/84 chiamate (c17-schermate), guida (375-guida.jpg). Id SVG duplicati nella pagina: 0 in 330 schermate (c18-grafica). Osservazione percettiva sul verbale: C18-08. |
| PO-096 aiuto del «?» | «?» grande, riga leggibile | **CHIUSO** | FATTO MISURATO, c18-grafica: tasto 44×44 px, icona 26×26 px, giallo con bordo nero (`src/resa/stile.css:357-358`); testo d'aiuto 13 px, nero (rgb 17,17,17) su bianco. A 375 il riquadro aperto spinge le unità sotto la barra: C18-07. |
| PO-097 versione | in basso a destra su ogni schermata, senza coprire comandi | **CHIUSO** | FATTO MISURATO, c18-grafica: «v0.13.0» presente in **330/330** schermate, 12 px; sovrapposta a un comando in **0** (a inizio pagina e a fondo pagina); dentro la finestra a fondo pagina in 330/330. Sta nel margine sotto la pagina (`stile.css:362`), quindi sulle schermate che scorrono si vede solo scorrendo: C18-10. |

## 2. Nuove contraddizioni scelta → testo successivo (stagione 1)

Metodo: ho letto il copione completo di e01–e12 con condizioni, «dopo» e «senza» (`node coordination/sonde/c18-copione.mjs > copione.txt`, 1417 righe; 13 «dopo» e 3 «senza» in tutta la stagione). Per ogni scelta che chiude, sgombera, presidia, promette o impegna ho cercato i testi successivi senza «dopo». Ogni caso trovato è misurato in partita con `node coordination/sonde/c18-coerenza.mjs 1000`: giocatore che schiera col bot attento e risponde a caso, salvo le scelte forzate.

| caso | scelta (LETTURA) | testo successivo (LETTURA) | FATTO MISURATO (1000 partite) | rilievo |
|---|---|---|---|---|
| N1a | e09 ondata 1, «Fai uscire i pullman e scaricali sul piazzale»: «Il piazzale si riempie di Rovers due ore prima del previsto.» (e09.op.scarica_pullman.r) | ondata 4, chiamata risultato: «… pullman dei Rovers dall'altra parte della tangenziale.» (e09.ch.risultato); vice: «Arrivati tardi, ripartono tardi.» (e09.ch.risultato.vice) | 1000/1000 | C18-01 |
| N1b | idem | verbale «contenuto a fatica»: «… tifosi entrati a partita iniziata.» (e09.verbale_a_fatica) | 359/1000 (36%) | C18-01 |
| N1c | idem | ondata 2: «Tangenziale: lite fra automobilisti e un gruppo sceso dai pullman.» (e09.ch.lite_coda) | 1000/1000 | C18-01 |
| N2a | e04 ondata 1, «Chiedi di chiudere il mercato subito»: «Si smonta borbottando.» (e04.op.chiudi_mercato.r) | ondata 2: «Il vento porta il fumo sulle bancarelle.» (e04.ch.fumo_arancio) | 1000/1000 | C18-02 |
| N2b | idem | opzione «Lascia correre» (offerta): «Il fumo arriva sulle bancarelle. I formaggi prendono un aroma nuovo.» (e04.op.lascia_fumo4.r) | offerta 1000/1000 | C18-02 |
| N2c | idem (stessa ondata, chiamata dopo) | opzione «Lascialo passare fra i banchi»: «Tamburi fra le cassette di pesce. Il pesce non protesta, i clienti sì.» (e04.op.corteo_banchi.r) | offerta 1000/1000 | C18-02 |
| N2d | idem, con informatore pagato | «al banco dei calzini vendono anche biglietti» (e04.ch.banco_calzini), opzione «Fai chiudere quel banco» | 1000/1000 | C18-02 |
| N2e | idem | ondata 3, risultato «mercato già smontato», opzione «Tieni la festa sul piazzale»: «Le bancarelle smontano in pace.» (e04.op.festa_piazzale.r) | offerta 1000/1000 | C18-02 |
| N2f | e04 ondata 2, «Fai sgomberare il mercato con calma» (e04.op.sgombera) | stessa ondata, chiamata dopo: fumo «sulle bancarelle» (e04.ch.fumo_arancio) | 691/691 | C18-02 |
| N2g | idem | ondata 3, risultato_sgombero → «Le bancarelle smontano in pace.» | offerta 677/677 | C18-02 |
| N3 | e02 ondata 2, «Manda il mediatore a trattare il percorso»: «Il mediatore resta col corteo fino a sera.» (e02.op.mediatore_corteo.r) | ondata 3, chiamata caldo_casa: dopo la correzione C17-03 l'unica opzione offerta è «Non intervenire», con risposta «… e il mediatore resta a tua disposizione.» (e02.op.niente.r) | offerta 1000/1000 | C18-04 |
| N4a | e06 ondata 3, «Bis lungo, che finisca dopo la partita» (e06.op.bis_lungo), con presidente_incontrato | stessa ondata: «può farlo finire in orario» (e06.ch.favore_impresa), opzione «Accetta il favore»: «Il concerto finisce in orario, al minuto.» (e06.op.accetta_favore.r) | offerta 1000/1000 | C18-03 |
| N4b | bis_lungo + accetta_favore | ondata 4: «Lo stadio si svuota mentre in piazza suona ancora il bis.» (e06.ch.risultato_bislungo) | 1000/1000 | C18-03 |
| N4c | e06, «Niente bis»: «Il concerto finisce senza bis.» (e06.op.niente_bis.r) | stessa ondata: il presidente «può farlo finire in orario» (e06.ch.favore_impresa) | 1000/1000 | C18-03 |
| N4d | niente_bis + accetta_favore | ondata 4: «Niente bis, ma la piazza esce solo adesso, insieme allo stadio.» (e06.ch.risultato_senzabis), dopo «finisce in orario, al minuto» | 1000/1000 | C18-03 |

Rilievi del C-017 **non dichiarati corretti** e ancora presenti (C17-10), misurati con la stessa sonda:

| caso | scelta → testo (LETTURA) | FATTO MISURATO |
|---|---|---|
| R10a | e09 «Manda una squadra al furgone» («la squadra resta in tangenziale fino a sera») → «il furgone grigio non è più nella piazzola» (e09.ch.furgone_sparito) | 1000/1000 |
| R10b | e07 «Che facciano il giro che vogliono» → «I pulmini restano ai parcheggi» (e07.op.chiudi_viale7.r) | offerta 1000/1000 |
| R10c | e11 «Fai chiudere la piazza» → «la piazza si svuota in cinque minuti» (e11.op.accetta_dessi11.r) | offerta 1000/1000 |
| R10d | e11 senza informatore pagato → «Le taniche, però, restano in giro.» (stessa risposta) | offerta 1000/1000 |
| R10e | e06 senza furgone visto → «Malvasi scrive «Varrone» sotto «furgone».» (e06.op.annota_sponsor.r) | offerta 1000/1000 |
| R10f | e04 senza furgone visto → «Furgone grigio, dietro il mercato. Lo stesso.» (e04.op.segui_banco.r) | offerta 1000/1000 |

Il guardiano della 0.12.0 (`tests/dopo-scelte.test.ts`, «0 contraddizioni su 461 scelte forzate» nel commit 8c68c8f) copre i casi del C-017; i casi N1–N4 non sono fra quelli.

## 3. Grafica (360 / 375 / 412)

FATTO MISURATO con `node coordination/sonde/c18-grafica.mjs . docs/foto/c18` (e01 giocato dall'interfaccia, piano del bot attento e del peggiore, 330 schermate misurate a inizio e a fondo pagina) e con `node coordination/sonde/c17-schermate.mjs` (stesse schermate, misure del C-017).

- **Versione (PO-097):** presente in 330/330 schermate, mai sopra un comando. Visibile senza scorrere: 42/110 schermate a 360, **15/110 a 375**, 86/110 a 412 (C18-10).
- **Scorrimento orizzontale:** 0 in ogni schermata e a ogni larghezza (c17-schermate).
- **Carattere minimo:** 12 px; nessun tocco sotto 44 px (c17-schermate).
- **Testi irraggiungibili:** a fondo pagina nessun testo resta sotto un elemento fisso (0 in 330 schermate). A inizio pagina sì, e allora serve scorrere:
  - chiamata: «Rispondi» sopra il testo della chiamata (C18-05);
  - rapporto: righe dei settori e la riga «Fiducia −N» sotto «Prossima ondata» o «Leggi il verbale» (C18-09);
  - briefing a 375: «Settore: …» sotto «Indietro / Avanti» (5747 px²).
- **Vignette (PO-092):** retino giallo, bordo nero, sagome a fumetto in sala, verbale, chiamate e guida (foto citate in sezione 1).
- **Errori di console:** 0 in c18-grafica (6 partite e01 complete) e 0 in c17-schermate (6 partite).

## 4. Regressioni

- **Caricamento** (A1, 5 prove, Chromium headless):
  - CPU 1×: titolo visibile in 333 ms di media (mediana 344, dispersione 28); sala con mappa pronta in 1004 ms (mediana 951, dispersione 91);
  - CPU 4×: titolo in 1233 ms (mediana 1161, dispersione 110); sala in 1636 ms (mediana 1495, dispersione 243).
  - C-017: 318 e 893 ms a 1×, 1047 e 1585 ms a 4×. IPOTESI: le differenze stanno dentro la dispersione della macchina; non ho ripetuto le misure su più corse.
- **Riparti dopo ricarica e tasto indietro** (A2): vedi C17-04.
- **Riparti** (A3): «Riparti» → schieramento dell'ondata 2, salvataggio con ondata 2; dallo stato salvato il bot attento vince («contenuto»).
- **Ripresa a metà ondata** (A4):
  - ricarica sulla risposta → «Riprendi» → chiamata successiva (ufficio_insiste), risposta salvata (`{"corteo_partito":"scorta"}`);
  - tasto indietro in chiamata → titolo; «Riprendi» → stessa chiamata;
  - ricarica sul rapporto → rapporto;
  - ricarica a schieramento non confermato → 6 pastiglie prima e dopo (C17-16).
- **Esporta e importa** (A5): file valmora-2026-10-13.json; dopo «cancella e importa» il salvataggio è identico (confronto del JSON: uguale); «Riprendi» porta allo schieramento.
- **Fotogrammi in chiamata** (A7, headless con SwiftShader, n=3): 360 px 59 fps a CPU 1× e 37 a 4×; 412 px 55 e 33 (C-017: 59/38 e 53/31).
- **Offline e aggiornamento con la scheda aperta:** `node tools/offline.mjs dist` → «offline: verde (O1-O4)».
- **Errori di console:** 0 in tutto il giro di c17-affidabilita, 0 in c17-schermate, 0 in due corse di c18-grafica.
- **Soft-lock:** 0 eccezioni e ogni partita chiusa con un esito:
  - c18-verifica: 6000 partite del giocatore casuale su e01–e12, con variabili di partenza a caso (anche nel braccio rosso);
  - c18-coerenza: 28 casi × 1000 partite;
  - c17-coerenza: 13 casi × 1000 partite;
  - c17-rapporto: 2412 partite; c17-tempi: 3600 partite casuali su 36 episodi.

## Rilievi nuovi (ordinati per gravità)

Riepilogo: **2 alte, 3 medie, 5 basse** (10 rilievi).

| id | gravità | asse | riproduzione esatta | misura | foto | ipotesi di causa |
|---|---|---|---|---|---|---|
| C18-01 | alta | credibilità | e09, ondata 1, chiamata pullman_fermi → «Fai uscire i pullman e scaricali sul piazzale» («Il piazzale si riempie di Rovers due ore prima del previsto», e09.op.scarica_pullman.r). Ondata 2: «Tangenziale: lite fra automobilisti e un gruppo sceso dai pullman» (e09.ch.lite_coda). Ondata 4: «… pullman dei Rovers dall'altra parte della tangenziale» (e09.ch.risultato), vice: «Arrivati tardi, ripartono tardi. Almeno sono coerenti.» (e09.ch.risultato.vice). Verbale «contenuto a fatica»: «… tifosi entrati a partita iniziata» (e09.verbale_a_fatica). | FATTO MISURATO, c18-coerenza 1000: risultato 1000/1000, lite_coda 1000/1000, verbale 359/1000. FATTO (dati): solo contro_tutti e rigore9 hanno `"dopo": {"mai": ["pullman_fermi/scarica_pullman"]}` (`data/missioni/e09.json:410,586`); la chiamata risultato (`e09.json:688`) e lite_coda (`e09.json:368`) no. | – (testo) | La correzione di C17-02(b) ha coperto le due chiamate citate dal C-017, non gli altri testi che danno i Rovers in ritardo. |
| C18-02 | alta | credibilità | e04, ondata 1, «Chiedi di chiudere il mercato subito» («Si smonta borbottando», e04.op.chiudi_mercato.r). Subito dopo nella stessa ondata: opzione «Lascialo passare fra i banchi» → «Tamburi fra le cassette di pesce. Il pesce non protesta, i clienti sì.» (e04.op.corteo_banchi.r); con informatore pagato, «al banco dei calzini vendono anche biglietti» (e04.ch.banco_calzini). Ondata 2: «Il vento porta il fumo sulle bancarelle» (e04.ch.fumo_arancio), opzione «Lascia correre» → «I formaggi prendono un aroma nuovo» (e04.op.lascia_fumo4.r). Ondata 3: risultato «mercato già smontato», opzione «Tieni la festa sul piazzale» → «Le bancarelle smontano in pace.» (e04.op.festa_piazzale.r). Lo stesso dopo «Fai sgomberare il mercato con calma» (ondata 2): fumo sulle bancarelle nella chiamata successiva e «Le bancarelle smontano in pace» nell'ondata 3. | FATTO MISURATO, c18-coerenza 1000: N2a 1000/1000, N2b 1000/1000, N2c 1000/1000, N2d 1000/1000, N2e 1000/1000, N2f 691/691, N2g 677/677. FATTO (dati): fumo_arancio (`data/missioni/e04.json:474`), corteo_fonderie (`:203`) e banco_calzini (`:255`) non hanno «dopo»; le tre varianti del risultato riusano la stessa opzione festa_piazzale con la stessa risposta. | – | È lo stesso episodio di C17-01 (l'esempio del PO in PO-086): il «dopo» copre verdura, casalinghi e risultato, non gli altri testi che danno il mercato aperto. Gli sviluppatori stessi hanno giudicato contraddittorio «il mercato è ancora mezzo pieno» all'ondata 2; con lo stesso metro lo sono anche questi. |
| C18-03 | media | credibilità | Con presidente_incontrato (e01, «Vai in tribuna»). e06, ondata 3: «Bis lungo, che finisca dopo la partita» (e06.op.bis_lungo), poi nella stessa ondata «Il presidente del Larkspire … può farlo finire in orario» (e06.ch.favore_impresa) → «Accetta il favore»: «Il concerto finisce in orario, al minuto.» (e06.op.accetta_favore.r). Ondata 4: «Lo stadio si svuota mentre in piazza suona ancora il bis.» (e06.ch.risultato_bislungo). Con «Niente bis» («Il concerto finisce senza bis», e06.op.niente_bis.r) il presidente propone lo stesso di farlo finire in orario, e l'ondata 4 dice «Niente bis, ma la piazza esce solo adesso» (e06.ch.risultato_senzabis). | FATTO MISURATO, c18-coerenza 1000 (presidente_incontrato=true): N4a offerta 1000/1000, N4b 1000/1000, N4c 1000/1000, N4d 1000/1000. FATTO (dati): favore_impresa (`data/missioni/e06.json:623`) ha solo il «se» sul presidente. | – | Le varianti del risultato guardano solo la scelta del bis, non il favore accettato dopo. Gravità media perché serve una scelta di e01. |
| C18-04 | media | credibilità | e02, ondata 2, «Manda il mediatore a trattare il percorso» («Il mediatore resta col corteo fino a sera», e02.op.mediatore_corteo.r). Ondata 3, chiamata caldo_casa: l'opzione del mediatore ora è nascosta (C17-03), resta solo «Non intervenire», la cui risposta dice «I cori continuano. Per ora restano cori, e il mediatore resta a tua disposizione.» (e02.op.niente.r, `data/testi/it/e02.json:79`). | FATTO MISURATO, c18-coerenza 1000: opzione offerta in 1000/1000 partite dopo mediatore_corteo. LETTURA: in quel caso la chiamata ha una sola opzione, quindi il giocatore è obbligato a leggere la frase. | – | Effetto collaterale di C17-03: nascondere un'opzione ha lasciato una scelta unica, con un testo scritto per il caso in cui il mediatore è libero. |
| C18-05 | media | grafica | Chiamate di e01 a 375×667 e 360×760, a inizio pagina. | FATTO MISURATO, c18-grafica: a 375 «Rispondi» compare in 28/28 chiamate e copre il **testo della chiamata** in 28/28 (fino a 4539 px²; per esempio corteo_partito: «cori e bandiere. Nessuno ha avvisato nessuno» coperto) e la vignetta in 28/28 (fino a 659 px²). A 360 compare in 18/28 e copre il commento del vice in 14/18 (fino a 4433 px²) e il testo in 4/18 (fino a 1096 px²). Due corse della sonda, stessi numeri. A 412 non compare. Nel C-017 il caso era uno (982 px²). | 375-chiamata-corteo_partito.jpg, 375-chiamata-fumogeni.jpg, 360-chiamata-pareggio.jpg; dopo il tocco: -dopo-rispondi.jpg | FATTO (codice): «Rispondi» è `position: sticky; bottom` (`src/resa/stile.css:179`) e sta nel flusso dopo il fumetto (`src/resa/schermate/Ondata.tsx:51-55`): quando le opzioni sono sotto la piega si appoggia sull'ultima parte del fumetto. |
| C18-06 | bassa | credibilità | Rilievi del C-017 non dichiarati corretti e ancora presenti, per completezza: C17-10 (sei casi, tabella R10 della sezione 2, tutti 1000/1000); C17-14: la riserva non ha tetto verso l'alto (`src/logica/missione.ts:160`, `Math.max(-q, v)`), in e05 tre opzioni da +2 steward su 3; C17-19: e12 «nessuna decisione stasera» ancora `"vera": false` (`data/missioni/e12.json:27`) mentre il consiglio rinvia il voto. | FATTO MISURATO (R10) e FATTO (codice, dati). | – | Non nel perimetro della 0.12.0/0.13.0. |
| C18-07 | bassa | grafica | Schieramento della prima ondata a 375×667, tocca «?». | FATTO MISURATO, c18-grafica: il riquadro d'aiuto si apre sopra le unità e le spinge sotto la barra «Conferma»: a inizio pagina «Squadre» e «Steward» sono coperti (1520 px² ciascuno) e il «?» per richiudere è fuori dalla finestra; bisogna scorrere 142 px. A 360 la pagina scorre 34 px. | 375-schieramento-aiuto.jpg | Riquadro inserito nel flusso prima del vassoio, su uno schermo corto. |
| C18-08 | bassa | grafica (PO-092) | Verbale, prima pagina, qualsiasi episodio. | FATTO (foto): nella vignetta dell'esito i due busti sono la protagonista e il vice (`src/resa/vignette-gioco.tsx:4`), ma sopra ciascuno c'è il nome di un club («CINDERWICK UNITED» sul busto di sinistra, «LARKSPIRE ATHLETIC» su quello di destra, con «contro» in mezzo). IPOTESI percettiva: un giocatore legge la protagonista come «Cinderwick» e il vice come «Larkspire». | 360-verbale-1.jpg, 375-persa-verbale-1.jpg | La riga «Sfida» (`src/resa/schermate/Verbale.tsx:32`) è sovrapposta alla vignetta. |
| C18-09 | bassa | grafica | Rapporto d'ondata a 412 (episodio perso) e a 360/375. | FATTO MISURATO, c18-grafica: a 412 la riga «Fiducia −1/−2/−3: … settori sono degenerati», cioè la spiegazione del calo, è sotto «Prossima ondata» / «Leggi il verbale» in 3/3 rapporti persi (6122-8811 px²); a 360 e 375 sono sotto le ultime righe dei settori. Tutto si legge scorrendo (0 px² coperti a fondo pagina). Nel riepilogo a 375 nessun pulsante è visibile senza scorrere (135 px). | 412-persa-rapporto-3.jpg e -fondo | Pulsanti `sticky` in fondo a una scheda più alta della finestra. IPOTESI: chi tocca subito il pulsante non vede perché la fiducia è scesa. |
| C18-10 | bassa | grafica (PO-097) | Ogni schermata che scorre. | FATTO MISURATO, c18-grafica: la versione si vede senza scorrere in 42/110 schermate a 360, **15/110 a 375**, 86/110 a 412. | 375-chiamata-corteo_partito.jpg (versione assente), -fondo (presente) | Scelta di c8c7550: la versione sta nel margine inferiore della pagina per non coprire comandi. Non so se il PO intendesse «sempre visibile». **Non posso confermarlo.** |

## Ritiri e note di metodo

- **Foto a pagina intera:** la sonda c17-schermate fotografa la pagina intera. Con i pulsanti `sticky`, in quelle foto un pulsante appare sopra testi che sul telefono si leggono scorrendo (per esempio «Voci in rete» nel verbale a 375). Per questo le foto di questo rapporto sono della finestra, a inizio e a fondo pagina, e le sovrapposizioni contano solo se restano a fondo pagina. Le misure «sovr» della c17-schermate citate qui sono solo quelle confermate da c18-grafica.
- **C17-05:** la sonda c17-rapporto conta come «degenerato» ogni settore a tensione ≥ 7; dopo la correzione la fiducia conta solo i settori anche scoperti. Il numero 235 misura quindi l'etichetta verde accanto al pallino rosso, non più un errore di fiducia.
- **Gravità:** «alta» solo per contraddizioni misurate al 100% della scelta, senza condizioni esterne all'episodio.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `coordination/sonde/c18-copione.mjs` | copione di e01–e12 come c17-copione, con «dopo» e «senza» | `node coordination/sonde/c18-copione.mjs [e01,…] > copione.txt` |
| `coordination/sonde/c18-coerenza.mjs` | frequenza delle contraddizioni scelta → testo, con più scelte forzate | `node coordination/sonde/c18-coerenza.mjs 1000 [id,…]` |
| `coordination/sonde/c18-verifica.mjs` | PO-095, PO-086, C17-03 su 6000 partite casuali, verde e rosso | `node coordination/sonde/c18-verifica.mjs 500` e `ROSSO=1 node …` |
| `coordination/sonde/c18-grafica.mjs` | versione, «Rispondi», sala, «?», vignette, testi sotto elementi fissi; foto della finestra | `node coordination/sonde/c18-grafica.mjs . docs/foto/c18` |
| `coordination/sonde/c17-*.mjs` | come nel C-017, rilanciate senza modifiche | vedi COLLAUDO_C17.md |

Bracci rossi usati: `node --import 'data:text/javascript,globalThis.__NO_PO086=true;globalThis.__NO_C17R03=true' coordination/sonde/c17-coerenza.mjs 200` e `node --import 'data:text/javascript,globalThis.__NO_C17R05=true' coordination/sonde/c17-rapporto.mjs 200`.
