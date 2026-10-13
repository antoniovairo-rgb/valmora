# Collaudo C-019 — 0.14.0: testi della stagione 1 (PO-084/085), correzioni del C-018, tetto della riserva, contrasto, regressioni

- **Build collaudata:** main aacbfc0, GAME_VERSION 0.14.0 (`src/versione.ts:104`). Ricostruita in locale con `npm ci` e `npx vite build`.
- **Confronto:** 5bcaf6b (0.13.0, la build del C-018). Copia dei dati di allora estratta con `git archive 5bcaf6b data` per far girare le stesse sonde sui dati vecchi (`DATI=<cartella>`).
- **Ramo:** claude/valmora-collaudo-c19. La sessione ha lavorato in sola lettura sul codice di gioco.
- **Data:** 2026-10-13.
- **Strumenti:** Chromium headless `/opt/pw-browsers/chromium` (playwright-core 1.64.0) e le funzioni di `src/logica`.
- **Sonde:** quelle del C-018 (`coordination/sonde/c18-*.mjs`, su main) rilanciate senza modifiche, più tre nuove (`c19-*.mjs`, sezione «Sonde»).
- **Foto:** `docs/foto/c19/`, JPEG della **finestra** a 360×760, 375×667 e 412×915; nome `<larghezza>-<episodio>-<vinto|perso>-<scena>[-fondo].jpg`.

Convenzioni:
- **FATTO MISURATO:** comando, campione ed esito.
- **FATTO (codice/dati):** file:riga.
- **LETTURA:** testo copiato dai dati (`data/testi/it/*.json`), chiave tra parentesi.
- **GIUDIZIO** e **IPOTESI:** marcati come tali.

## 1. Correzioni del C-018 (COLLAUDI.md, riga C-018.2)

Riepilogo: **11 CHIUSE, 1 PARZIALE, 0 NON CHIUSE** (le 6 righe di C17-10 contano una per una).

| voce | dichiarato | esito | misura |
|---|---|---|---|
| C18-01 e09 dopo scarica_pullman | testi neutri; «dopo» su lite_coda | **CHIUSA** | FATTO MISURATO, `node coordination/sonde/c18-coerenza.mjs 1000`: N1c (lite_coda dopo scarica_pullman) **0/1000** (C-018: 1000/1000); rosso `__NO_PO086` (200 partite) 200/200. N1a (risultato) e N1b (verbale «a fatica») si aprono ancora 1000/1000 e 287/1000, ma il testo è cambiato. LETTURA: risultato «… pullman dei Rovers da far ripartire.» (e09.ch.risultato), vice «Sono arrivati a modo loro, ripartiranno a modo loro.» (e09.ch.risultato.vice), verbale «… ingressi a singhiozzo.» (e09.verbale_a_fatica): nessuno dice più che i Rovers sono arrivati tardi. **Effetto collaterale:** la lite non si vede più, ma due testi successivi la citano ancora: C19-01. |
| C18-02 e04 dopo mercato chiuso / sgomberato | testi neutri; «dopo» su banco_calzini | **CHIUSA** per i sette casi del C-018 | FATTO MISURATO, c18-coerenza 1000: N2d (banco_calzini) **0/1000** (rosso 200/200). N2a/N2b/N2c/N2e/N2f/N2g si aprono ancora (1000, 1000, 1000, 1000, 691, 677), con testi nuovi. LETTURA: «Il vento porta il fumo sul mercato.» (e04.ch.fumo_arancio); «Il fumo arriva sulla piazza del mercato. Domani profumerà ancora di fumogeno.» (e04.op.lascia_fumo4.r); «Tamburi fra le cassette rimaste in piazza. Le cassette non protestano, i commercianti sì.» (e04.op.corteo_banchi.r); «La festa resta sul piazzale. Nella piazza del mercato non arriva nessuno.» (e04.op.festa_piazzale.r). Nessuno parla più di bancarelle aperte. **Restano altri testi non citati dal C-018:** C19-03. |
| C18-03 e06 bis e favore del presidente | «dopo» su favore_impresa | **PARZIALE** | FATTO MISURATO, c18-coerenza 1000 (presidente_incontrato=true): N4a e N4c **0/1000** (C-018: 1000/1000), rosso 200/200 e 200/200; N4b e N4d non si possono più giocare (scelte fatte 0/1000). FATTO (dati): `"dopo": {"mai": ["bis/niente_bis", "bis/bis_lungo"]}` (`data/missioni/e06.json:624`), e la chiamata bis viene prima nella stessa ondata. Resta la terza scelta del bis, «Un bis corto», con la stessa causa scritta nel C-018 («le varianti del risultato guardano solo la scelta del bis, non il favore accettato dopo»): C19-02. |
| C18-04 e02 caldo_casa con una sola opzione | risposta neutra | **CHIUSA** | LETTURA: «I cori continuano. Per ora restano cori.» (e02.op.niente.r); prima «… e il mediatore resta a tua disposizione». FATTO MISURATO, c18-coerenza 1000 (N3): dopo mediatore_corteo l'opzione è ancora offerta 1000/1000, ora senza la frase sul mediatore. |
| C18-06 / C17-10 R10a e09 furgone_sparito | testo rivisto | **CHIUSA** (GIUDIZIO) | c18-coerenza 1000: la chiamata si apre 1000/1000 dopo «Manda una squadra al furgone». LETTURA: «Col carro attrezzi in manovra, furgone grigio sparito. Pattuglia: uno in rampa, verso le fonderie.» (e09.ch.furgone_sparito). GIUDIZIO: con la squadra in tangenziale il furgone che sparisce durante una manovra è plausibile; prima («non è più nella piazzola») no. |
| C17-10 R10b e07 | | **CHIUSA** | LETTURA: «Il viale chiude. Chi doveva passare di lì aspetta, col motore acceso.» (e07.op.chiudi_viale7.r); offerta 1000/1000 dopo carovana_libera. |
| C17-10 R10c e11 | | **CHIUSA** | LETTURA: «Una telefonata, e chi era rimasto in piazza se ne va in cinque minuti.» (e11.op.accetta_dessi11.r); dopo «La piazza chiude. I trenta si spostano nelle vie» (e11.op.chiudi_fonderie.r) non contraddice. |
| C17-10 R10d e11 | | **CHIUSA** | Stessa risposta: «Le taniche, però, restano in giro» tolto. |
| C17-10 R10e e06 | | **CHIUSA** | LETTURA: «Malvasi scrive «Varrone» sul taccuino.» (e06.op.annota_sponsor.r); prima «sotto «furgone»» anche senza furgone visto. |
| C17-10 R10f e04 | | **CHIUSA** | LETTURA: «Furgone grigio, dietro il mercato. Carica scatoloni.» (e04.op.segui_banco.r); prima «Lo stesso.» anche senza furgone visto. |
| C17-09 e08 verbale | testo neutro | **CHIUSA** | LETTURA: «Partita finita, curva uscita in ordine. Malvasi appoggia la foto sfocata di Tano Ferrigno sul rapporto.» (e08.verbale_contenuto). Compare ancora dopo accesso_libero (777/1000) e stringi (563/1000) (c18-coerenza R09a, R09b), ma non dice più che Ferrigno «non ha avuto più di quanto gli spettasse». |
| C17-14 riserva senza tetto | rientri da 1, tetto «massimo» 6 in e05 | **CHIUSA** | Sezione 3. |
| C17-19 e12 fonte del comune | | **CHIUSA** | LETTURA: «In rete, dal comune: «voto già deciso, stasera chiudono lo stadio».» (e12.info_comune), `"vera": false` (`data/missioni/e12.json:27`). La serata dice «voto rinviato» (e12.ch.manifesto, e12.ch.insieme, titolo dell'ondata 3 «Il voto rinviato», e12.ondata3): la fonte ora è falsa davvero. L'affermazione è cambiata apposta (vedi sezione 2). |
| C18-10 versione visibile | in basso a destra, sempre nella vista | **CHIUSA** | Sezione 4. |

Rilievi del C-018 assegnati alla sviluppatrice e **non** dichiarati corretti nella 0.14.0: C18-05 misurato di nuovo con `node coordination/sonde/c18-grafica.mjs`: invariato (a 375 «Rispondi» copre il testo della chiamata in 28/28 chiamate di e01, fino a 4539 px²; a 360 il commento del vice in 14/16). C18-07, C18-08, C18-09 non li ho rimisurati: **non posso confermare** il loro stato.

Verifiche di logica sulla build nuova (FATTO MISURATO, `node coordination/sonde/c18-verifica.mjs 1000`, giocatore casuale, 12 episodi × 1000 partite, variabili di partenza a caso): 1265 chiamate «senza» aperte, **0** con unità nel settore; 7333 scelte con «dopo», **0** violazioni; 15535 scelte che impegnano un'unità, **0** senza unità rimaste; 0 eccezioni. Rosso (`ROSSO=1`, 200 × 12): 347, 1530 e 54 violazioni: la sonda vede i difetti.

## 2. Testi della stagione 1 (PO-084, PO-085)

Metodo: confronto chiave per chiave fra `git show 5bcaf6b:data/testi/it/eXX.json` e il file di oggi, con fonte, affidabilità, `vera` e settore presi da `data/missioni/eXX.json` (script nel blocchetto della sezione «Sonde»). Cambiati: **44 fonti su 48**, **135 chiamate** e 1 commento del vice, più 17 risposte, costi e verbali delle correzioni del C-018 e di C17-14.

**Lunghezze** (FATTO MISURATO, conteggio dei caratteri su tutti i testi di fonti e chiamate di e01–e12, varianti `@f` comprese): fonti 48, la più lunga 80 caratteri, 0 oltre 80; chiamate 177, la più lunga 100, 0 oltre 100.

**(a) Le fonti fanno la stessa affermazione?** LETTURA delle 44 coppie prima/dopo:
- 43 fanno la stessa affermazione, accorciata; `vera` non è cambiato in nessuna (`git diff 5bcaf6b aacbfc0 -- data/missioni` tocca solo «dopo» e «massimo»).
- 1 cambia affermazione **di proposito**: e12.info_comune, correzione di C17-19 (sezione 1). Prima «il voto sulla chiusura è solo una formalità, nessuna decisione stasera» (era vera nei fatti, segnata falsa); ora «voto già deciso, stasera chiudono lo stadio», falsa come dice il campo.
- Dettagli persi senza effetto sulla verità (LETTURA): e02.info_rete perde «in stazione partenze»; e03.info_radio perde «in fondo al viale»; e01.info_rete perde «gira voce che»; e07.info_comitato passa da «subito dopo la partita» a «a fine partita» (resta falsa: i Saltmere vogliono il giro della città, e07.ch.risultato); e09.info_informatore passa da «gira intorno allo stadio … poi succede qualcosa» a «allo stadio da stamani. Porta guai».
- Una fonte diventa ambigua: e03.info_comitato «sabato, amichevole, auto sui passi carrabili fino alle due» (prima «fino alle due di notte»), senza punto finale: C19-05.

**(b) Le chiamate accorciate hanno perso un fatto citato dopo?** Metodo: per ogni chiamata cambiata, le parole di almeno 5 lettere tolte e cercate nelle opzioni, nei costi, nelle risposte e nel vice della stessa chiamata (27 chiamate con almeno una parola tolta che ricompare); poi lettura di ognuna e delle chiamate successive dell'episodio.
- LETTURA: nessuna opzione, risposta o vice cita un fatto sparito dalla chiamata. Esempi controllati: e08.ch.mano perde «Poi la riabbassa», ma la risposta di «fai_finta» lo racconta («Il Fabbro riabbassa la mano», e08.op.fai_finta.r): ora non è più detto due volte; e01.ch.pareggio perde «escono tutti insieme» e l'opzione «Fai uscire tutti insieme» resta comprensibile; e03.ch.cartelloni, e03.ch.finestre ed e07.ch.capodanno perdono «Comitato dei residenti», che però compare come mittente della chiamata (`src/resa/schermate/Ondata.tsx:41`, `fonte.comitato_residenti` = «Comitato dei residenti», `data/testi/it/comune.json:40`).
- Il fatto perso che conta non viene dall'accorciamento ma da una chiamata nascosta (C18-01): C19-01.
- Una domanda nuova non combacia con una delle opzioni: e01.ch.pullman ora chiude con «Dove li scarichiamo?», e l'opzione «Tutto tranquillo, si aspetta» non risponde alla domanda (C19-05).

**(c) Leggono come radio d'impatto?** GIUDIZIO (non misurabile, è la mia lettura): sì nella grande maggioranza. Mittente in testa, frasi nominali, presente, e spesso una domanda o un'urgenza in coda che chiede la decisione: «Sicurezza Larkspire: volontari del club sul piazzale? Tanti, ma non formati. Li mandiamo?» (e05.ch.volontari), «Curva ospiti: un pupazzo gigante del loro centravanti blocca una via di fuga. Va deciso subito.» (e07.ch.pupazzo), «Capo! Il ragazzo delle sciarpe. Il corteo di Cinderwick passa dal ponte, alle due. Muoviti.» (e10.ch.ragazzo_ricorda). Le battute dei personaggi restano (e03.ch.torcia_casa «Le torce sono come le ciliegie»). Più deboli, sempre a giudizio mio: «Il capotreno vuole qualcuno ad aspettarli. Di grosso.» (e11.ch.treno_ritorno, il «di grosso» resta appeso); due fonti della centrale firmate «Centrale:» (e04.info_radio, e06.info_radio) contro «Centrale radio:» nelle altre dieci.

## 3. Tetto della riserva (C17-14)

- FATTO (dati): e05 steward `"quantita": 3, "massimo": 6` (`data/missioni/e05.json:101-102`); i tre rientri valgono +1 (righe 158, 476, 574). FATTO (codice): `Math.min(tetto - q, v)` con rosso `__NO_C17R14` (`src/logica/missione.ts:160-163`).
- FATTO MISURATO, `node coordination/sonde/c19-riserva.mjs 2000` (e05, variabili di partenza a caso):
  - giocatore «avido» (sceglie sempre il rientro se c'è), 2000 partite, 4982 rientri: massimo **6** steward (quantità + riserva) e **6** disponibili allo schieramento; picco 5 in 1018 partite, 6 in 982;
  - giocatore casuale, 2000 partite: massimo **6**; picco 3/4/5/6 in 491/940/502/67 partite;
  - stessi numeri col rosso `__NO_C17R14`: con i dati di oggi il tetto non scatta mai, perché 3 + 3 × 1 = 6. Il braccio rosso che vede il difetto è quello sui dati di 5bcaf6b (`DATI=… node coordination/sonde/c19-riserva.mjs 2000`): massimo **9** (picco 9 in 982 partite dell'avido). Anche `tests/riserva-tetto.test.ts` prova il rosso su una copia di e05 coi rientri da due.
- LETTURA, testi «uno steward torna»: «Uno steward torna dalla prossima fase…» (e05.op.impegno_firmato.c), «Una pettorina si stacca dal picchetto.» (.r), «paga gli straordinari a uno steward in sciopero» (e05.ch.straordinari), «Uno steward rientra.» (e05.op.accetta_straordinari.r), «un collega rientra per l'uscita» (e05.ch.parola_gentile), «Uno steward torna per l'uscita» (e05.op.di_parola.c), «Una pettorina torna al lavoro.» (.r). Tutti dicono uno, come l'effetto +1. «Ne hai tre su sei» (e05.intro1) e il massimo misurato (6) combaciano.

## 4. Grafica: PO-098, PO-099, C18-10

FATTO MISURATO con `node coordination/sonde/c19-grafica.mjs . docs/foto/c19`: e01 ed e06 giocati dall'interfaccia, piano del bot attento (vinto) e del peggiore (perso), 3 larghezze, **606 schermate**, ognuna misurata a inizio e a fondo pagina (1212 misure).

- **C18-10, versione:** presente in 606/606; dentro la finestra **senza scorrere** in 202/202 schermate a 360, 202/202 a 375, 202/202 a 412 (C-018: 42/110, 15/110, 86/110). Sovrapposta a comandi 0, a righe di testo 0 (rettangoli dei nodi di testo), a inizio e a fondo pagina. Sta in verticale nel margine destro, 16×51 px (`src/resa/stile.css:370`). Foto: per esempio 375-e01-perso-rapporto-1.jpg, 375-e06-vinto-verbale-4.jpg.
- **PO-098, sul giallo:**
  - «Per la stella successiva» nel verbale di e06 vinto e perso (360) e di e01 (360, 375, 412): testo nero su bianco **18,88:1**; il riquadro ha bordi neri 13,19:1 sulla pagina e la striscia sinistra nera 13,19:1. Prima (striscia gialla) 1,00:1 sul giallo, come dichiarato in `stile.css:191`. Foto 360-e06-vinto-verbale-4.jpg, 375-e06-perso-verbale-4.jpg.
  - Riga «Fiducia ±N» del rapporto: nero su bianco **18,88:1**, riquadro con bordo nero 13,19:1; la striscia sinistra colorata è 2,46:1 (verde) e 3,32:1 (magenta) sulla pagina, ma il riquadro si stacca col bordo nero e il segno + o − è scritto: il colore non è l'unica informazione. Foto 360-e01-vinto-rapporto-1.jpg, 360-e01-perso-rapporto-1.jpg.
  - Nessun testo sul giallo sotto 4,5:1 nelle 1212 misure.
  - **Fuori dal giallo**, sotto 4,5:1 in 235 misure su 1212, sempre gli stessi tre elementi, tutti 3,53:1: C19-04.
- **PO-099:** «Rende di più» o `[data-rende]` in **0** misure su 1212; con un'unità in mano (prima unità toccata nello schieramento, 12 partite) la riga dice solo «Squadre (4)». FATTO (codice): il suggerimento esce solo col rosso `C41R01` (`src/resa/schermate/Schieramento.tsx:117`). Foto *-schieramento-in-mano.jpg.
- **Errori di console:** 0 (c19-grafica, 12 partite; c18-grafica, 6 partite).

## 5. Regressioni

- **Ripresa, indietro, Riparti, export/import** (FATTO MISURATO, `node coordination/sonde/c17-affidabilita.mjs .`):
  - verbale di una sconfitta (e01, partita c17:e01:casuale:3) → ricarica → «Riprendi» → verbale con «Riparti dall'ondata 2»; tasto indietro sul verbale → resta sul verbale;
  - «Riparti» → schieramento dell'ondata 2, ondata salvata 2; dal salvataggio il bot attento vince («contenuto»);
  - ricarica sulla risposta → chiamata successiva con la risposta salvata; tasto indietro in chiamata → titolo, «Riprendi» → stessa chiamata; ricarica sul rapporto → rapporto; bozza dello schieramento 6 pastiglie prima e dopo;
  - esporta (valmora-2026-10-13.json) → cancella → importa: salvataggio uguale; «Riprendi» → schieramento.
- **Caricamento** (A1, n=5): CPU 1× titolo 330 ms di media (mediana 317, dispersione 43), sala 1024 ms (mediana 997, dispersione 49); CPU 4× titolo 962 ms (mediana 938, dispersione 85), sala 1696 ms (mediana 1714, dispersione 232). C-018: 333/1004 e 1233/1636 ms. IPOTESI: differenze dentro la dispersione della macchina, una sola corsa.
- **Riparti, calcolo** (A6, e02 seme 45, una prova per velocità): 753 ms a CPU 1×, 1407 ms a 4× (C-018: 583 e 1759 ms).
- **Fotogrammi in chiamata** (A7, headless con SwiftShader, n=3): 360 px 41 fps a CPU 1× e 37 a 4×; 412 px 55 e 31 (C-018: 59/37 e 55/33). IPOTESI: il calo a 360 / 1× (59 → 41) non lo so spiegare con una corsa sola; SwiftShader non è un telefono. **Non posso confermare** che sia una regressione.
- **Offline:** `node tools/offline.mjs dist` → «offline: verde (O1-O4)».
- **Errori di console:** 0 in c17-affidabilita, c18-grafica, c19-grafica.
- **Soft-lock:** 0 eccezioni, ogni partita chiusa con un esito:
  - c18-verifica: **12000** partite del giocatore casuale su e01–e12 (più 2400 nel rosso);
  - c18-coerenza: 26 casi × 1000; c19-coerenza: 10 casi × 1000 più 12000 partite casuali (parte 2);
  - c19-riserva: 4000 partite di e05.
- **Contenuti mai mostrati** (c19-coerenza, parte 2, 1000 partite casuali per episodio con variabili a caso): nessuna chiamata della stagione 1 resta chiusa in tutte le partite. Nota: e06.ch.favore_impresa con presidente_incontrato=true ora si apre in **324/1000** partite (solo dopo «Un bis corto»), prima in 1000/1000 (c19-coerenza F1a, sui dati di 5bcaf6b).

## Rilievi nuovi (ordinati per gravità)

Riepilogo: **0 alte, 4 medie, 1 bassa** (5 rilievi).

| id | gravità | asse | riproduzione esatta | misura | foto | ipotesi di causa |
|---|---|---|---|---|---|---|
| C19-01 | media | credibilità | e09, ondata 1, «Fai uscire i pullman e scaricali sul piazzale» (e09.op.scarica_pullman). La lite in tangenziale non viene più segnalata (lite_coda nascosta). Ondata 4: «Responsabile Rovers: chi erano quelli della lite in coda? I miei dicono che non erano dei loro.» (e09.ch.non_erano_nostri). Verbale «contenuto a fatica»: «Una lite in coda, cori di troppo, …» (e09.verbale_a_fatica). | FATTO MISURATO, `node coordination/sonde/c19-coerenza.mjs 1000`: F2c lite_coda **0/1000**; F2a non_erano_nostri **1000/1000**; F2b verbale «a fatica» 302/1000. Sui dati di 5bcaf6b la lite si vedeva 1000/1000. FATTO (dati): `"dopo"` solo su lite_coda (`data/missioni/e09.json:369`), non su non_erano_nostri. | – (testo) | Effetto collaterale della correzione di C18-01: nascosta la chiamata, restano due testi che la citano. Non è una contraddizione, è un riferimento a un fatto che il giocatore non ha mai sentito. |
| C19-02 | media | credibilità | Con presidente_incontrato (e01, «Vai in tribuna»). e06, ondata 3: «Un bis corto» (e06.op.bis_corto), poi «… fa finire il concerto in orario, se poi ricambi» (e06.ch.favore_impresa) → «Accetta il favore»: «Il concerto finisce in orario, al minuto.» (e06.op.accetta_favore.r). Ondata 4: «Uno a uno. Stadio e concerto si svuotano nello stesso momento.» (e06.ch.risultato). | FATTO MISURATO, c19-coerenza 1000, F1c: **1000/1000**; sui dati di 5bcaf6b anche 1000/1000 (non è nuovo, è il caso del C-018 rimasto). LETTURA: «Se lo facciamo [il bis], finisce insieme alla partita» (e06.ch.bis): «in orario» vuol dire prima dello stadio. | – | Stessa causa scritta per C18-03: la variante del risultato guarda la scelta del bis ma non il favore. La correzione ha tolto il favore dopo «Niente bis» e «Bis lungo», non dopo «Un bis corto». |
| C19-03 | media | credibilità | e04, ondata 1, «Chiedi di chiudere il mercato subito» («Si smonta borbottando.», e04.op.chiudi_mercato.r). Nella stessa ondata: «In rete: i Rovers mangiano al mercato e postano foto.» (e04.ch.kebab), opzione «Accompagnali allo stadio» col costo «Il mercato si alleggerisce» (e04.op.scorta_ospiti.c); prima ancora, opzione «Lascialo passare fra i banchi» (e04.op.corteo_banchi, la risposta invece è stata resa neutra). | FATTO MISURATO, c19-coerenza 1000: F3a kebab **1000/1000**, F3b lascia_panino offerta 1000/1000, F3c corteo_banchi offerta 1000/1000; uguale sui dati di 5bcaf6b. FATTO (dati): kebab senza «dopo» (`data/missioni/e04.json`, chiamata kebab). | – | Lo stesso schema di C17-01/C18-02 su testi che né il C-018 né la correzione hanno elencato. GIUDIZIO: «fra i banchi» è lieve (i banchi si stanno smontando); «mangiano al mercato» no. |
| C19-04 | media | grafica (accessibilità) | Rapporto, verbale e testata di qualunque episodio, a ogni larghezza. | FATTO MISURATO, c19-grafica: in **235 misure su 1212** tre testi sono a **3,53:1** (soglia WCAG AA 4,5:1 per testo normale, https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio): «SOTTO CONTROLLO» (`strong.bene`, 13 px, verde rgb(15,157,79) su bianco); titolo «Cosa ti ha aiutato» del verbale (`h3`, 16 px grassetto, stesso verde su bianco: sotto i 18,66 px non conta come testo grande); variazione «+N» della fiducia (`span.fiducia-delta.su`, 12 px, bianco su verde). | 375-e01-perso-rapporto-1.jpg («SOTTO CONTROLLO»), 360-e06-vinto-verbale-2.jpg | Non sono sul giallo, quindi fuori dal controllo di `tools/foto-contrasto.mjs` (guarda solo i testi senza fondo proprio). IPOTESI: il PO con PO-098 chiedeva la leggibilità in generale; se il perimetro era solo il giallo, il rilievo va riletto come proposta. **Non posso confermare** l'intenzione. |
| C19-05 | bassa | testi | Briefing di e03 ed e04/e06, chiamate di e01 ed e11. | LETTURA: «Comitato residenti: «sabato, amichevole, auto sui passi carrabili fino alle due»» (e03.info_comitato): manca il punto, «alle due» senza «di notte» si legge anche come pomeriggio; «Centrale:» (e04.info_radio, e06.info_radio) contro «Centrale radio:» nelle altre dieci fonti della centrale; «Di grosso.» appeso (e11.ch.treno_ritorno); «Dove li scarichiamo?» (e01.ch.pullman) con un'opzione «Tutto tranquillo, si aspetta» che non risponde. | – | GIUDIZIO: effetti dell'accorciamento a 80/100 caratteri. |

## Ritiri e note di metodo

- **c18-coerenza sui testi riscritti:** i casi N1a, N2a, N2b, N2c, N2e, N2f, N2g contano quando un testo si apre, non che cosa dice. Dopo la 0.14.0 i testi sono cambiati, quindi «mostrato 1000/1000» non vuol dire più contraddizione: l'esito della sezione 1 viene dalla LETTURA dei testi nuovi.
- **Tetto della riserva:** col rosso `__NO_C17R14` sui dati di oggi la sonda dà gli stessi numeri del verde. Non è un guardiano cieco: la correzione vera è nei dati (+1 invece di +2), il tetto è una difesa in più; il difetto si vede sui dati di 5bcaf6b (massimo 9).
- **c19-grafica, contrasto:** prima corsa con la stampa dei dettagli raggruppata per larghezza; per i dettagli di e06 ho rifatto la corsa a 360 con `EP=e06 LARG=360` (foto in una cartella di lavoro, non nel ramo). I colori vengono dal CSS e non dipendono dalla larghezza.
- **Gravità:** «alta» solo per contraddizioni misurate al 100% della scelta, senza condizioni esterne all'episodio (stesso metro del C-018). C19-01 non è una contraddizione; C19-02 richiede una scelta di e01; C19-03 è lieve a giudizio mio.

## Sonde

| sonda | cosa misura | comando |
|---|---|---|
| `coordination/sonde/c19-coerenza.mjs` | casi F1–F4 (dopo le correzioni del C-018) e chiamate mai aperte; con `DATI=` sui dati di un'altra build | `node coordination/sonde/c19-coerenza.mjs 1000 [id,…]` · `DATI=<copia>/data node …` |
| `coordination/sonde/c19-riserva.mjs` | massimo di steward in e05 (avido e casuale), verde e rosso | `node coordination/sonde/c19-riserva.mjs 2000` · `node --import 'data:text/javascript,globalThis.__NO_C17R14=true' …` |
| `coordination/sonde/c19-grafica.mjs` | versione senza scorrere e sovrapposizioni, contrasto di ogni testo col suo fondo, «Per la stella successiva» e «Fiducia ±N», «Rende di più», errori; foto | `node coordination/sonde/c19-grafica.mjs . docs/foto/c19` (filtri `EP=e06 LARG=360`) |
| `coordination/sonde/c18-*.mjs` | come nel C-018, rilanciate senza modifiche | vedi COLLAUDO_C18.md; rosso: `node --import 'data:text/javascript,globalThis.__NO_PO086=true' coordination/sonde/c18-coerenza.mjs 200 N1c,N2d,N4a,N4c,V02d` |
| `coordination/sonde/c17-affidabilita.mjs` | ripresa, indietro, Riparti, export/import, tempi | `node coordination/sonde/c17-affidabilita.mjs .` |

Confronto dei testi (sezione 2), comando usato: per ogni episodio `git show 5bcaf6b:data/testi/it/eXX.json` contro il file di oggi, chiave per chiave, con `fonte/affidabilita/vera/settore` dalla missione; lunghezze contate su `briefing[].testo` e `ondate[].chiamate[].testo` (con le varianti `@f`).
