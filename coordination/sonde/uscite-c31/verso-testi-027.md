
### e01 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio; strada_larkspire entra → stadio
- chiamate su strada: corteo_partito@strada_cinderwick entra → stadio; pullman@strada_larkspire entra → stadio
- eventi: corteo_cinderwick:corteo@strada_cinderwick, arrivo_larkspire:arrivo@strada_larkspire, folla_piazzale:folla@piazzale
- titolo: Arrivo delle tifoserie · «i»: Prima del derby: le due tifoserie arrivano allo stadio, ognuna dalla sua strada.
- ch corteo_partito: «È partito! Duecento dalle fonderie, cori e bandiere. Nessuno ha avvisato nessuno.» // «Il ragazzo delle sciarpe. Ha ragione più spesso di quanto gli si dia fiducia. Non dirglielo.»
- ch pullman: «Skyfield: due pullman in anticipo di mezz'ora. Tranquilli, per ora. Che facciamo?»

### e01 ondata 3 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso; strada_larkspire esce → bordo basso
- chiamate su strada: incrocio@strada_larkspire esce → bordo basso; sciarpe@strada_cinderwick esce → bordo basso
- eventi: deflusso_cinderwick:corteo@strada_cinderwick, deflusso_larkspire:deflusso@strada_larkspire, uscita_piazzale:folla@piazzale
- titolo: Il deflusso · «i»: Finita la partita, il pubblico esce dallo stadio (il deflusso) e torna verso casa.
- ch incrocio: «Gruppi di Kiln risalgono verso la strada di Skyfield. Sembrano cercare qualcuno.»
- ch sciarpe: «Te l'avevo detto, il corteo c'era. Ora però qualcuno mi deve qualcosa.» // «Un informatore pagato è un informatore che richiama. Uno non pagato pure, ma per lamentarsi.»

### e02 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: viale_stazione entra → stadio
- chiamate su strada: responsabile@viale_stazione entra → stadio
- eventi: treno1:arrivo@stazione, bandiere:corteo@viale_stazione
- titolo: Il primo treno · «i»: Prima della partita: in stazione arriva il primo treno di tifosi del Railhead County.
- ch responsabile: «Qui Railhead: i miei ragazzi sono tranquilli, garantisco io. Ci lasci il viale libero.»

### e02 ondata 2 — fase –, spalti arrivo
- corteo dell'ondata: viale_stazione entra → stadio
- chiamate su strada: corteo_viale@viale_stazione entra → stadio
- eventi: treno2:arrivo@stazione, corteo_ospiti:corteo@viale_stazione, falsi:biglietti@tornelli
- titolo: Il treno in ritardo · «i»: Prima del fischio d'inizio: arriva il treno in ritardo e il pubblico entra allo stadio.
- ch corteo_viale: «I ragazzi vogliono arrivare allo stadio tutti insieme, in corteo. È una tradizione, capisce.»

### e02 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: viale_stazione esce → stazione(stazione)
- chiamate su strada: responsabile_saluta@viale_stazione esce → stazione(stazione); vetrine@viale_stazione esce → stazione(stazione)
- eventi: ritorno:corteo@viale_stazione, treni_ritorno:arrivo@stazione, uscita:folla@tornelli
- titolo: Il ritorno in stazione · «i»: Dopo la partita: i tifosi ospiti tornano verso la stazione per ripartire in treno.
- ch responsabile_saluta: «Il responsabile del Railhead vuole salutarla e ringraziarla davanti alle telecamere.»
- ch vetrine: «Viale della stazione: segnalate due vetrine rotte. Nessun ferito. Chi è stato non si sa.»

### e03 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: —
- chiamate su strada: ospiti_arrivano@parcheggi entra → stadio
- eventi: arrivi:folla@piazzale, sosta:sosta@parcheggi, residenti:protesta@quartiere
- titolo: Il tramonto · «i»: Al tramonto, prima della partita di coppa: i tifosi arrivano, a due passi dalle case.
- ch ospiti_arrivano: «Garden Albion: siamo in seicento, in pullman. Parcheggiamo dove ci pare, vero?»

### e03 ondata 2 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: furgone_parcheggi@parcheggi entra → stadio
- eventi: cori_ospiti:curva@curva_ospiti, cori_casa:curva@curva_larkspire, clacson:protesta@quartiere
- titolo: Primo tempo · «i»: Primo tempo della partita di coppa: i tifosi sono in curva, a pochi metri dalle case.
- ch furgone_parcheggi: «Capo, il furgone grigio dei biglietti è nei parcheggi: stasera vende sciarpe false. Stessa gente.»

### e03 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: parcheggi esce → bordo basso
- chiamate su strada: risultato@parcheggi esce → bordo basso
- eventi: deflusso:folla@parcheggi, notte:protesta@quartiere, piazzale_notte:folla@piazzale
- titolo: L'uscita di notte · «i»: Finita la partita, a notte fonda: lo stadio si svuota e il quartiere vorrebbe dormire.
- ch risultato: «Garden vince ai rigori. Seicento in festa fra le case, mezzanotte e mezza. Indovina che fanno.»

### e04 ondata 1 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick entra → centro (stadio vuoto); parcheggi entra → centro (stadio vuoto)
- chiamate su strada: corteo_fonderie@strada_cinderwick entra → centro (stadio vuoto)
- eventi: spesa:folla@mercato, fonderie:corteo@strada_cinderwick, pullman:arrivo@parcheggi
- titolo: Le bancarelle · «i»: Sabato, prima della partita: è giorno di mercato, a due passi dalla strada dello stadio.
- ch corteo_fonderie: «Strada da Kiln: partiti in trecento dalle fonderie, coi tamburi. Tagliano per il mercato.»

### e04 ondata 2 — fase –, spalti vuoti
- corteo dell'ondata: parcheggi entra → centro (stadio vuoto)
- chiamate su strada: coro_fonderie@parcheggi entra → centro (stadio vuoto)
- eventi: bar_fonderie:raduno@piazza_fonderie, ritardatari:arrivo@parcheggi, falsi:biglietti@piazzale, banchi:folla@mercato
- titolo: Il fischio d'inizio · «i»: Poco prima del fischio: gli ultimi tifosi entrano, passando dalla zona del mercato.
- ch coro_fonderie: «Rovers: i ritardatari vogliono passare cantando dalla piazza delle fonderie. Garantisco io.»

### e04 ondata 3 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: angolo@strada_cinderwick esce → bordo basso
- eventi: uscita_mercato:deflusso@mercato, ritorno_fonderie:corteo@strada_cinderwick, piazzale_uscita:folla@piazzale
- titolo: Il ritorno tra i banchi · «i»: Dopo la partita: i tifosi escono dallo stadio e ripassano dalla zona del mercato.
- ch angolo: «Strada da Kiln: gruppo di casa all'angolo delle fonderie, aspetta i pullman ospiti.»

### e05 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_larkspire entra → stadio
- chiamate su strada: —
- eventi: presidio:picchetto@tornelli, arrivi_casa:arrivo@strada_larkspire, pullman_q:arrivo@piazzale
- titolo: Il picchetto · «i»: Prima della partita: gli steward in sciopero protestano ai tornelli e arrivano i tifosi.

### e05 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_larkspire esce → bordo basso
- chiamate su strada: fondo_strada@strada_larkspire esce → bordo basso
- eventi: uscita5:deflusso@strada_larkspire, piazzale_fine:folla@piazzale, presidio3:picchetto@tornelli
- titolo: Tutti fuori · «i»: Fine partita: il pubblico lascia lo stadio e i tifosi tornano verso casa.
- ch fondo_strada: «Strada da Skyfield: un gruppo di casa aspetta i pullman ospiti in fondo alla strada.»

### e06 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: viale_concerto entra → stadio
- chiamate su strada: corteo_cinderwick@viale_concerto entra → stadio
- eventi: prove:folla@piazza_concerto, pullman6:arrivo@piazzale, corteo_piazza:corteo@viale_concerto
- titolo: Le prove del palco · «i»: Prima di partita e concerto: in piazza si prova il palco e la gente comincia ad arrivare.
- ch corteo_cinderwick: «In rete: curva Kiln in corteo verso la piazza. Tamburi, bandiere, concerto non iniziato.»

### e06 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: viale_concerto esce → bordo basso
- chiamate su strada: furgone_palco@viale_concerto esce → bordo basso
- eventi: uscita6:deflusso@viale_concerto, piazza_fine:folla@piazza_concerto, navette:folla@piazzale
- titolo: Due folle, un viale · «i»: Finita la partita: chi esce dallo stadio e chi esce dal concerto ha un solo viale.
- ch furgone_palco: «Capo, il furgone grigio. È dietro il palco, in mezzo ai camion del concerto.» // «Il furgone dei biglietti va dove c'è gente. Logico. Troppo logico.»

### e07 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: parcheggi entra → centro (stadio vuoto)
- chiamate su strada: quaranta_pulmini@parcheggi entra → centro (stadio vuoto); foto_ricordo@viale_stazione entra → centro (stadio vuoto)
- eventi: pulmini:festa@viale_stazione, sosta7:arrivo@parcheggi, banda7:festa@piazzale
- titolo: Prima volta in città · «i»: Prima della partita: i neopromossi del Southwind arrivano per la prima volta in città.
- ch quaranta_pulmini: «Southwind Town! Quaranta pulmini e nessuna idea di dove parcheggiare. Ci aiutate, adesso?» // «Quaranta pulmini e nessuna idea. È la frase più onesta che sentirai quest'anno.»
- ch foto_ricordo: «In rete: il Southwind dal viale alla strada da Skyfield. Foto con chiunque, anche chi non vuole.»

### e07 ondata 2 — fase partita, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: coro_imparato@strada_larkspire entra → centro (stadio vuoto)
- eventi: festa_curva:festa@curva_ospiti, benvenuto7:raduno@strada_larkspire, piazzale7:folla@piazzale
- titolo: La partita, fuori · «i»: Si gioca: tu non guardi il campo, ma ciò che succede intorno, sugli spalti e nelle strade.
- ch coro_imparato: «In rete: coro anti-Skyfield del Southwind, preso da un video. In strada da Skyfield lo capiscono.»

### e07 ondata 3 — fase partita, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: pareggio_casa@strada_larkspire entra → centro (stadio vuoto); immagine_club@strada_larkspire entra → centro (stadio vuoto)
- eventi: gol_storia:festa@curva_ospiti, pareggio7:raduno@strada_larkspire, pulmini_aperti:festa@parcheggi
- titolo: Il gol della storia · «i»: La partita prosegue: un gol da ricordare cambia l'umore sugli spalti e nelle strade.
- ch pareggio_casa: «Lo Skyfield pareggia. In strada da Skyfield il gruppo del benvenuto esulta verso i pulmini.»
- ch immagine_club: «Il presidente dello Skyfield: festa ospiti da non rovinare, per l'immagine. Ti presta due steward.»

### e07 ondata 4 — fase dopo, spalti deflusso
- corteo dell'ondata: —
- chiamate su strada: capodanno@viale_stazione esce → bordo basso; batteria@parcheggi esce → bordo basso
- eventi: carovana:festa@viale_stazione, partenza:festa@parcheggi, uscita7:folla@piazzale
- titolo: La festa non finisce · «i»: A partita finita, di sera: la festa del Southwind continua per la città.
- ch capodanno: «Clacson, trombe, una grancassa sul viale. Sono le sette di sera e sembra capodanno. Fate qualcosa!»
- ch batteria: «Un pulmino non parte, batteria a terra. Dentro dodici tifosi cantano, fuori dodici spingono.»

### e08 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio
- chiamate su strada: dessi_chiama@strada_cinderwick entra → stadio; facce_nuove@strada_cinderwick entra → stadio
- eventi: corteo8:corteo@strada_cinderwick, arrivi8:arrivo@piazzale, varchi8:biglietti@tornelli
- titolo: L'appuntamento · «i»: Prima della partita: le tifoserie arrivano allo stadio e il Fabbro chiede «rispetto».
- ch dessi_chiama: «Il Fabbro. Rappresento la curva. Voglio rispetto: corteo dalla strada di sempre e va tutto liscio.» // «Lo chiamano il Fabbro, nessuno sa che lavoro faccia. Le sue parole valgono quanto le sue tasse: non risultano.»
- ch facce_nuove: «Strada da Kiln: corteo più grande del solito. Davanti, facce nuove, non tutte di Kiln.» // «Facce nuove dietro uno striscione vecchio. Annota.»

### e08 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: sedile@strada_cinderwick esce → bordo basso
- eventi: ritorno8:corteo@strada_cinderwick, piazzale8b:folla@piazzale, uscita8:deflusso@tornelli
- titolo: L'uscita · «i»: Fine partita: il pubblico esce dallo stadio e le tifoserie riprendono la via di casa.
- ch sedile: «Capo, il furgone grigio: fermo in fondo alla strada da Kiln. Il Fabbro ci è appena salito.» // «Il furgone dei biglietti e il capo della curva sullo stesso sedile. Questa la scrivo a penna.»

### e09 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: tangenziale entra → stadio; strada_larkspire entra → stadio
- chiamate su strada: furgone_coinvolto@tangenziale entra → stadio; a_piedi@strada_larkspire entra → stadio; pullman_fermi@tangenziale entra → stadio; passaggio@tangenziale entra → stadio
- eventi: coda9:arrivo@tangenziale, a_piedi9:corteo@strada_larkspire, piazzale9:folla@piazzale
- titolo: Il tamponamento · «i»: Prima della partita: un tamponamento in tangenziale ferma i pullman di Belltower.
- ch furgone_coinvolto: «Nel tamponamento c'è un furgone grigio senza targa davanti. Portiere aperte, conducente sparito.» // «Chi lascia il furgone in mezzo a un incidente ha molta fretta o non vuole conoscerci. Scommetto sulla seconda.»
- ch a_piedi: «In rete: trecento tifosi di casa scendono a piedi dall'uscita di Skyfield, coi fumogeni.»
- ch pullman_fermi: «Responsabile Belltower: sei pullman fermi da un'ora, senz'acqua. Scendono in corsia d'emergenza.»
- ch passaggio: «Capo, il furgone girava qui da stamani. Il conducente? Su un'auto che lo aspettava in rampa.» // «Uno che ha il passaggio pronto prima dell'incidente. Questo lo scrivo in grande.»

### e09 ondata 2 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: lite_coda@tangenziale entra → stadio; immagini_club@tangenziale entra → stadio
- eventi: cori9l:curva@curva_larkspire, cori9o:curva@curva_ospiti, lite9:rissa@tangenziale
- titolo: Fischio d'inizio, coda ferma · «i»: La partita comincia, ma in tangenziale la coda è ancora bloccata.
- ch lite_coda: «Tangenziale: lite fra automobilisti e una decina scesa dai pullman. Nessuno ha la sciarpa.» // «Nessuno ha la sciarpa. Nessuno tifa. Strano modo di andare allo stadio.»
- ch immagini_club: «Il presidente dello Skyfield ha immagini dalla tribuna: il furgone entra in coda prima del botto.» // «Vuole solo che il club non compaia nel rapporto. Il presidente non regala niente, ma oggi regala bene.»

### e09 ondata 3 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: corsia_unica@tangenziale entra → stadio
- eventi: cori9l2:curva@curva_larkspire, cori9o2:curva@curva_ospiti, piazzale9b:folla@piazzale
- titolo: Il secondo tempo · «i»: Si gioca il secondo tempo; fuori, gli effetti del tamponamento non sono finiti.
- ch corsia_unica: «Riapre una corsia sola. Chi è in coda vuole uscire dalla rampa dello stadio al fischio finale.»

### e09 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_larkspire esce → bordo basso; tangenziale esce → bordo basso
- chiamate su strada: furgone_sparito@tangenziale esce → bordo basso
- eventi: uscita9:deflusso@strada_larkspire, rampa9:folla@tangenziale, piazzale9c:folla@piazzale
- titolo: Il rientro · «i»: Fine partita: il pubblico lascia lo stadio e gli ospiti ripartono verso casa.
- ch furgone_sparito: «Col carro attrezzi in manovra, furgone grigio sparito. Pattuglia: uno in rampa, verso le fonderie.»

### e10 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio; strada_larkspire entra → stadio
- chiamate su strada: collina_risponde@strada_larkspire entra → stadio; ragazzo_ricorda@strada_cinderwick entra → stadio; ragazzo_offeso@strada_cinderwick entra → stadio
- eventi: corteo10c:corteo@strada_cinderwick, corteo10l:corteo@strada_larkspire, piazzale10:folla@piazzale
- titolo: Il ricordo del primo derby · «i»: Prima del derby: le due tifoserie arrivano in corteo, col primo derby ancora in mente.
- ch collina_risponde: «Sicurezza Skyfield: la curva di casa vuole sfilare fino al ponte, “per rispondere”. Giura calma.»
- ch ragazzo_ricorda: «Capo! Il ragazzo delle sciarpe. Il corteo di Kiln passa dal ponte, alle due. Muoviti.» // «Pagato una volta, informa per sempre. Quasi come un abbonamento.»
- ch ragazzo_offeso: «Il ragazzo delle sciarpe, ti ricordi? Io sì. Il corteo di Kiln da dove passa? Indovina.» // «Non l'hai pagato al primo derby. Lui se lo ricorda meglio di te.»

### e10 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso; strada_larkspire esce → bordo basso
- chiamate su strada: furgone_derby@strada_cinderwick esce → bordo basso; ponte_ritorno@strada_larkspire esce → bordo basso
- eventi: ritorno10c:corteo@strada_cinderwick, uscita10l:deflusso@strada_larkspire, piazzale10d:folla@piazzale
- titolo: Il deflusso · «i»: Partita finita, tutti escono: i tifosi tornano a casa per le strade attorno allo stadio.
- ch furgone_derby: «Capo, furgone grigio sulla strada da Kiln. Scarica gente senza sciarpa, come ai parcheggi.» // «Il furgone non si perde un derby. Neanche noi, purtroppo.»
- ch ponte_ritorno: «Strada da Skyfield: un gruppo di casa aspetta Kiln al ponte.»

### e11 ondata 2 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick entra → centro
- chiamate su strada: dirette@strada_cinderwick entra → centro
- eventi: fiamme11:incendio@quartiere, fonderie11b:assembramento@piazza_fonderie, strada11:folla@strada_cinderwick
- titolo: Il primo cassonetto · «i»: Notte nel quartiere: la rabbia per la sconfitta comincia a farsi vedere fra le vie.
- ch dirette: «In rete: dirette dal quartiere. Ogni cassonetto ha tre telefoni puntati davanti.»

### e11 ondata 3 — fase –, spalti vuoti
- corteo dell'ondata: —
- chiamate su strada: autoscala@strada_cinderwick entra → centro; contromano@strada_cinderwick entra → centro
- eventi: fiamme11b:incendio@quartiere, fiamme11c:incendio@strada_cinderwick, fonderie11c:assembramento@piazza_fonderie
- titolo: Mezzanotte · «i»: Mezzanotte passata: il quartiere è ancora sveglio e le strade non si calmano.
- ch autoscala: «I vigili del fuoco chiedono di liberare la strada da Kiln: con l'autoscala non passano.»
- ch contromano: «Capo, il furgone grigio. Esce dal quartiere in fiamme, contromano, senza fretta.» // «Il furgone non scappa mai. Va via. È diverso.»

### e11 ondata 4 — fase –, spalti vuoti
- corteo dell'ondata: viale_stazione entra → centro
- chiamate su strada: ultimo_fuoco@strada_cinderwick entra → centro; chiudete_stadio@viale_stazione entra → centro
- eventi: scope:folla@quartiere, fiamme11d:incendio@strada_cinderwick, viale11b:folla@viale_stazione
- titolo: L'alba · «i»: Primo mattino: la notte finisce e il quartiere fa i conti con quello che resta.
- ch ultimo_fuoco: «Strada da Kiln, cinque e mezza: un ultimo cassonetto acceso. Qualcuno è sveglio apposta.»
- ch chiudete_stadio: «In rete: un milione di visite al quartiere in fiamme. Il più votato: “chiudete quello stadio”.» // «Stanotte lo stadio non c'era. Eppure qualcuno lo vuole chiudere. Strano, no?»

### e12 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio
- chiamate su strada: ultimo_corteo@strada_cinderwick entra → stadio
- eventi: presidio12:presidio@piazza_comune, corteo12:corteo@strada_cinderwick, arrivi12:arrivo@piazzale
- titolo: Il consiglio comunale · «i»: Prima della partita: il consiglio comunale discute la chiusura dello stadio vecchio.
- ch ultimo_corteo: «Strada da Kiln: l'ultimo corteo della stagione. Lo striscione dice “Lo stadio è nostro”.»

### e12 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: —
- eventi: corteo12b:corteo@strada_cinderwick, piazzale12b:folla@piazzale, presidio12c:presidio@piazza_comune
- titolo: Fine stagione · «i»: Partita finita, stagione chiusa: la gente lascia lo stadio e le strade si riempiono.

### e13 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: viale_concerto entra → centro (stadio vuoto)
- chiamate su strada: viale_pieno@viale_concerto entra → centro (stadio vuoto); parcheggi_riservati@parcheggi entra → centro (stadio vuoto)
- eventi: viale13:arrivo@viale_concerto, parcheggi13:sosta@parcheggi
- titolo: Due pubblici, una strada · «i»: Prima dell'amichevole: tifosi e pubblico del concerto usano la stessa strada.
- ch viale_pieno: «Il viale fra stadio e piazza è pieno: sciarpe, sedie pieghevoli e auto, tutti in mezzo.»
- ch parcheggi_riservati: «Pettorine Varrone mandano via le auto dei tifosi: i parcheggi sono per gli ospiti dell'impresa.»

### e13 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: parcheggi esce → bordo basso; viale_concerto esce → bordo basso
- chiamate su strada: coda_auto@parcheggi esce → bordo basso; corteo_rovers@viale_concerto esce → bordo basso
- eventi: uscita13:deflusso@parcheggi, viale13b:corteo@viale_concerto, banchi13c:biglietti@piazza_concerto
- titolo: Tutti in piazza · «i»: Finita la partita, tutti vanno verso il concertone in piazza, auto e pedoni insieme.
- ch coda_auto: «Fine partita: si esce mentre arrivano le auto del concerto. Una sola uscita, e i clacson.»
- ch corteo_rovers: «I ragazzi vogliono andare al concerto cantando, tutti insieme. È un'amichevole, siamo amici.»

### e15 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: viale_stazione entra → stadio
- chiamate su strada: fratelli@viale_stazione entra → stadio
- eventi: treno_ollerbrook:arrivo@stazione, accoglienza:corteo@viale_stazione
- titolo: Arrivano gli amici · «i»: Prima della partita arrivano in stazione i gemellati, tifosi amici della curva Kiln.
- ch fratelli: «Il Fabbro aspetta gli amici di Railhead in stazione con uno striscione di dieci metri: «Fratelli».» // «Fratelli. Io ho un fratello, e non lo vado mai a prendere in stazione.»

### e15 ondata 2 — fase –, spalti arrivo
- corteo dell'ondata: viale_stazione entra → stadio
- chiamate su strada: mille@viale_stazione entra → stadio
- eventi: corteo_unito:corteo@viale_stazione, ingresso_gem:folla@settore_gemellati, arrivo_rovers:arrivo@curva_ospiti
- titolo: Il corteo unito · «i»: Curva Kiln e gemellati vanno insieme verso lo stadio; arrivano anche gli ospiti.
- ch mille: «Curva Kiln e gemellati vogliono un solo corteo fino allo stadio. Mille persone, un solo colore.»

### e15 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: viale_stazione esce → stazione(stazione)
- chiamate su strada: fondo_viale@viale_stazione esce → stazione(stazione)
- eventi: corteo_ritorno15:corteo@viale_stazione, treno_ritorno15:arrivo@stazione, uscita_rovers:folla@curva_ospiti
- titolo: Il saluto · «i»: Finita la partita, per i gemellati è ora di tornare a casa: il treno li aspetta.
- ch fondo_viale: «Un gruppo di Rovers aspetta il corteo in fondo al viale, sotto il cavalcavia.»

### e16 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio
- chiamate su strada: corteo_fonderie@strada_cinderwick entra → stadio
- eventi: furgone_arriva:furgone@magazzino, corteo_fonderie:corteo@strada_cinderwick
- titolo: La pista · «i»: Prima della partita: una pista porta al magazzino sette, alle fonderie vicino allo stadio.
- ch corteo_fonderie: «Lavezzari: la curva parte in corteo dalle fonderie. Il percorso passa davanti al magazzino sette.» // «Coincidenze. Ne ho viste tante. Questa non mi piace.»

### e16 ondata 2 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio
- chiamate su strada: —
- eventi: ospiti16:arrivo@curva_ospiti, cancelli16:folla@piazzale, scarico:furgone@magazzino, ritardatari16:corteo@strada_cinderwick
- titolo: L'ingresso · «i»: Ingresso allo stadio: i tifosi arrivano ai cancelli, le fonderie sono a dieci minuti.

### e16 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: ritorno16@strada_cinderwick esce → bordo basso
- eventi: partenza:furgone@magazzino, ritorno_fonderie:corteo@strada_cinderwick, pullman_via:folla@piazzale
- titolo: Il furgone esce · «i»: Dopo la partita: i tifosi ripartono, e al magazzino sette il furgone si rimette in moto.
- ch ritorno16: «Lavezzari: la curva torna alle fonderie a piedi, tutta insieme. Il Fabbro, adesso, è in testa.»

### e17 ondata 1 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick entra → centro (stadio vuoto)
- chiamate su strada: schermo_comizi@piazza_municipio entra → centro (stadio vuoto)
- eventi: raduno_strada:raduno@strada_cinderwick, raduno_piazzale:raduno@piazzale
- titolo: Lo stadio vuoto · «i»: Partita a porte chiuse, senza pubblico, nel giorno dello sciopero: autobus fermi.
- ch schermo_comizi: «Servizio d'ordine: vogliono il risultato dal palco dei comizi. Metà dei lavoratori in piazza tifa.»

### e17 ondata 2 — fase –, spalti vuoti
- corteo dell'ondata: —
- chiamate su strada: ci_vediamo_dopo@strada_cinderwick entra → centro (stadio vuoto)
- eventi: piazzale_pieno:raduno@piazzale, cancelli_spinti:folla@tornelli, sotto_casa17:raduno@quartiere
- titolo: Il corteo parte · «i»: Il corteo dello sciopero parte in centro; intorno allo stadio vuoto c'è comunque gente.
- ch ci_vediamo_dopo: «Ci vediamo dopo. Il corteo passa dalla strada di Kiln, e noi pure.» // «Il Fabbro vuole stare in mezzo al corteo. Il corteo non lo vuole: il servizio d'ordine me l'ha già detto.»

### e17 ondata 3 — fase –, spalti vuoti
- corteo dell'ondata: piazza_municipio entra → centro (stadio vuoto)
- chiamate su strada: —
- eventi: gol_radio:raduno@piazzale, scavalcano:folla@tornelli, collina:raduno@quartiere, piazza17:folla@piazza_municipio
- titolo: Gol fuori dallo stadio · «i»: Si gioca senza pubblico: un gol si festeggia fuori, dove i tifosi seguono la partita.

### e17 ondata 4 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick esce → bordo basso; piazza_municipio esce → bordo basso
- chiamate su strada: me_lo_dovete@strada_cinderwick esce → bordo basso; fine_corteo@piazza_municipio esce → bordo basso
- eventi: dopo_corteo:corteo@strada_cinderwick/dallo_stadio, notte_quartiere:raduno@quartiere, piazza17b:folla@piazza_municipio/dallo_stadio
- titolo: Dopo il fischio, dopo il corteo · «i»: Partita e corteo finiti: senza autobus, tutti devono tornare a casa a piedi.
- ch me_lo_dovete: «Corteo sciolto, i miei pure. Li riporto io, tutti insieme, per la strada di Kiln. Me lo dovete.» // «Il Fabbro che fa il servizio d'ordine. Ne ho viste tante, ma questa le batte.»
- ch fine_corteo: «Servizio d'ordine: corteo finito, palco giù. Qualcuno ha attaccato la radiocronaca all'impianto.»

### e18 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_larkspire entra → stadio
- chiamate su strada: collina18@strada_larkspire entra → stadio
- eventi: corteo_collina:corteo@strada_larkspire, arrivo_rovers18:arrivo@curva_ospiti, occhi:minaccia@retro_tribuna
- titolo: La telefonata · «i»: Prima della partita: un testimone della rete dei biglietti chiede protezione.
- ch collina18: «Sicurezza Skyfield: curva in corteo dalla collina, vuole passare davanti al settore ospiti.»

### e18 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_larkspire esce → bordo basso
- chiamate su strada: deflusso18@strada_larkspire esce → bordo basso
- eventi: uscita_t:minaccia@retro_tribuna, deflusso_collina:corteo@strada_larkspire, uscita18:folla@piazzale
- titolo: L'uscita del testimone · «i»: Verso la fine: lo stadio sta per svuotarsi e il testimone deve andarsene.
- ch deflusso18: «La curva Skyfield risale la collina cantando. Quelli del Lookout escono dall'altra parte.»

### e19 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio
- chiamate su strada: ora_prima@strada_cinderwick entra → stadio
- eventi: preparativi:retata@magazzino, corteo_presto:corteo@strada_cinderwick, coda19:folla@tornelli
- titolo: La vigilia · «i»: Prima della partita: i tifosi arrivano allo stadio e intanto si prepara la retata.
- ch ora_prima: «Lavezzari: la curva parte in corteo con un'ora di anticipo. Non era mai successo.» // «Un'ora prima. Come chi sa che più tardi certe strade saranno chiuse.»

### e19 ondata 3 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: festa_davanti@strada_cinderwick entra → stadio
- eventi: festa_curva:curva@curva_cinderwick, uscita_presto:corteo@strada_cinderwick, pressione19:folla@tornelli
- titolo: Lo sanno tutti · «i»: Partita in corso: quel che è successo al magazzino ormai si sa, in curva e in città.
- ch festa_davanti: «La curva vuole uscire prima, in corteo. Per «festeggiare» davanti al magazzino vuoto.»

### e19 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: consiglio@strada_cinderwick esce → bordo basso
- eventi: corteo_fonderie19:corteo@strada_cinderwick, uscita_rovers19:folla@curva_ospiti, davanti_magazzino:folla@magazzino
- titolo: Chi ha parlato? · «i»: Dopo la partita: i tifosi escono per le strade e resta da capire chi abbia parlato.
- ch consiglio: Qualcuno in comune: «Brutta serata. Retata in partita? Forse non è una buona idea. Ci pensi». // «Sapeva com'era andata prima del giornale. Interessante.»

### e20 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio; strada_larkspire entra → stadio
- chiamate su strada: viso_scoperto@strada_cinderwick entra → stadio; vederli_passare@strada_larkspire entra → stadio
- eventi: corteo_dessi20:corteo@strada_cinderwick, collina20:corteo@strada_larkspire, piazzale20:folla@piazzale, rancore20:corteo@strada_cinderwick
- titolo: Il derby · «i»: Prima del derby: le curve delle due città scendono in corteo e il piazzale si riempie.
- ch viso_scoperto: «Lavezzari: il Fabbro guida il corteo dalle fonderie, a viso scoperto. Saluta le telecamere.» // «Chi saluta così le telecamere, di solito, sta preparando un'uscita di scena.»
- ch vederli_passare: «Sicurezza Skyfield: curva giù dalla collina all'ora del corteo di Kiln. Per «vederli passare».»

### e20 ondata 3 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: fari_spenti20@strada_cinderwick entra → stadio
- eventi: senza_capo20:curva@curva_cinderwick, auto_scura:fuga@strada_cinderwick, cori_lark20b:curva@curva_larkspire
- titolo: Il Fabbro non c'è più · «i»: La partita va avanti: del Fabbro si sono perse le tracce, fra curva e strade intorno.
- ch fari_spenti20: «Strada da Kiln: un'auto scura è partita a fari spenti dal retro delle fonderie.»

### e20 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso; strada_larkspire esce → bordo basso
- chiamate su strada: lo_avete_preso@strada_cinderwick esce → bordo basso; festa_strada@strada_larkspire esce → bordo basso
- eventi: ritorno20:corteo@strada_cinderwick, festa_lark:corteo@strada_larkspire, piazzale20c:folla@piazzale
- titolo: La notte · «i»: A partita finita, di notte: le due curve tornano a casa per le strade della città.
- ch lo_avete_preso: «Lavezzari: curva alle fonderie senza capo, e arrabbiata. Dicono che il Fabbro l'avete preso voi.»
- ch festa_strada: «Lo Skyfield ha vinto. La curva vuole festeggiare in strada, verso le fonderie.»

### e22 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio
- chiamate su strada: ridateci@strada_cinderwick entra → stadio
- eventi: presidio22:protesta@piazza_municipio, salita22:corteo@strada_cinderwick, piazzale22:folla@piazzale
- titolo: La città accusa · «i»: Prima del derby in collina: la curva sale allo stadio e la città accusa la sicurezza.
- ch ridateci: «Lavezzari: niente pullman, corteo. Due capi e uno striscione: «RIDATECI IL FABBRO».»

### e22 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: salutare_presidio@strada_cinderwick esce → bordo basso
- eventi: discesa22:corteo@strada_cinderwick, presidio22c:protesta@piazza_municipio, festa_piazzale:folla@piazzale
- titolo: Il ritorno · «i»: Dopo il derby: la curva scende dalla collina e torna verso la città.
- ch salutare_presidio: «Lavezzari: la curva scende dalla collina, vuole passare dal municipio «per salutare il presidio».»

### e23 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: casello entra → stadio
- chiamate su strada: traslochi@casello entra → stadio; traghetto_extra@casello entra → stadio; dieci_pullman@parcheggi entra → stadio; barca@casello entra → stadio
- eventi: pullman_casello:arrivo@casello, sosta23:sosta@parcheggi, piazzale23:folla@piazzale
- titolo: Dal mare · «i»: Prima della partita: dal casello arrivano i pullman del Southwind, tifosi dal mare.
- ch traslochi: Malvasi legge: «Camion della società di traslochi: stasera al casello, fra i pullman del Southwind.» // «Un camion di traslochi la sera di una partita. Chi trasloca di sera? Chi non vuole farsi vedere.»
- ch traghetto_extra: «Porto di Southwind: stanotte traghetto extra, fuori orario. Lo chiede una società di traslochi.»
- ch dieci_pullman: «Southwind Town: siamo in dieci pullman. Qui ci siamo salvati, vengono tutti. Dove parcheggiamo?»
- ch barca: «Capo, il Fabbro è a Southwind, su una barca. Me l'ha detto uno che gli porta da mangiare.» // «Uno che gli porta da mangiare. Il Fabbro ha sempre avuto chi lo serve.»

### e23 ondata 2 — fase prima, spalti arrivo
- corteo dell'ondata: —
- chiamate su strada: in_tondo@parcheggi entra → stadio
- eventi: parcheggi_pieni:sosta@parcheggi, ingresso_quill:arrivo@curva_ospiti, cinder_attesa:curva@curva_cinderwick
- titolo: I pullman · «i»: Verso il fischio d'inizio: i pullman cercano posto e i tifosi entrano allo stadio.
- ch in_tondo: «Parcheggi pieni. Tre pullman del Southwind girano in tondo cercando posto.»

### e23 ondata 3 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: camion_targa@casello entra → stadio
- eventi: cori_cinder23:curva@curva_cinderwick, cori_quill23:curva@curva_ospiti, camion_coda:arrivo@casello
- titolo: La partita · «i»: Si gioca: le due curve sono sugli spalti, fuori restano parcheggi e casello.
- ch camion_targa: «Casello: il camion dei traslochi è in coda dietro i pullman di ritorno. Targa di Southwind.»

### e23 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: casello esce → bordo basso
- chiamate su strada: imbarco@casello esce → bordo basso; ripartire@parcheggi esce → bordo basso
- eventi: ritorno_casello:arrivo@casello, uscita_parcheggi:sosta@parcheggi, piazzale23b:folla@piazzale
- titolo: Ritorno al mare · «i»: Fine partita: i tifosi del Southwind ripartono verso il casello e il mare.
- ch imbarco: «Ufficio del porto: il traghetto in più parte tra un'ora. Il camion è già sul piazzale d'imbarco.»
- ch ripartire: «Southwind: i pullman vogliono ripartire tutti insieme, subito. Domani si lavora.»

### e24 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_larkspire entra → stadio
- chiamate su strada: ci_crede@strada_larkspire entra → stadio
- eventi: doppi24:biglietti@tornelli, corteo24:corteo@strada_larkspire, arrivo_quill24:arrivo@curva_ospiti
- titolo: L'ultima giornata · «i»: Prima dell'ultima giornata: le curve arrivano allo stadio, in palio c'è il titolo.
- ch ci_crede: «La curva Skyfield scende dalla collina in corteo. Ultima giornata, titolo possibile. Ci crede.»

### e24 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_larkspire esce → bordo basso
- chiamate su strada: delusi@strada_larkspire esce → bordo basso
- eventi: festa_piazza:festa@piazza_municipio, collina_giu:corteo@strada_larkspire, uscita_quill24:folla@curva_ospiti
- titolo: Festa e rabbia · «i»: Fischio finale della stagione: chi festeggia e chi è deluso si muovono per la città.
- ch delusi: «La curva Skyfield risale la collina. Arrabbiata, delusa, e la strada passa vicino al municipio.»

### e26 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: parcheggi entra → stadio
- chiamate su strada: pullman_sparsi@parcheggi entra → stadio
- eventi: pullman:arrivo@parcheggi, auto_blu:folla@piazzale, autorita:cerimonia@tribuna_autorita
- titolo: I pullman · «i»: Prima della finale: arrivano i pullman dei tifosi e le auto delle autorità.
- ch pullman_sparsi: «Parcheggi: pullman del Domepark, uno alla volta. Ognuno col suo coro e la sua idea di parcheggio.» // «Compatti, dicevano. Compatti come i coriandoli.»

### e26 ondata 2 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: parcheggi_ritardatari@parcheggi entra → stadio
- eventi: cori_ospiti:curva@curva_ospiti, cori_casa:curva@curva_larkspire, diretta:cerimonia@tribuna_autorita
- titolo: Primo tempo · «i»: Primo tempo della finale: curve piene, autorità in tribuna e diretta tv accesa.
- ch parcheggi_ritardatari: «Parcheggi: gli ultimi pullman del Domepark arrivano a gara iniziata. Tutti dallo stesso cancello.»

### e26 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: parcheggi esce → bordo basso
- chiamate su strada: pullman_sconfitti@parcheggi esce → bordo basso
- eventi: festa:folla@piazzale, pullman_ritorno:arrivo@parcheggi, uscita_tribuna:cerimonia@tribuna_autorita
- titolo: La notte della coppa · «i»: Dopo la finale, di notte: c'è chi festeggia per le strade e chi riparte.
- ch pullman_sconfitti: «Domepark: i nostri vogliono ripartire subito, ma i pullman sono chiusi dalle auto del carosello.»

### e27 ondata 1 — fase prima, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio
- chiamate su strada: fermata_prima@strada_cinderwick entra → stadio
- eventi: treno_gemellati:arrivo@stazione, a_piedi:corteo@strada_cinderwick, attesa_curva:curva@curva_cinderwick
- titolo: Il treno dei gemellati · «i»: Prima della partita: arrivano in treno i gemellati, tifosi amici della curva Kiln.
- ch fermata_prima: «Una cinquantina di gemellati scesi prima: verso la strada di Kiln, coi cori della curva di casa.» // «Conoscono le parole meglio dei padroni di casa. Brutto segno, o bel segno. Dipende da chi le canta dopo.»

### e27 ondata 4 — fase dopo, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → stazione(stazione)
- chiamate su strada: abbraccio@strada_cinderwick esce → stazione(stazione)
- eventi: ritorno_gemellati:arrivo@stazione, strada_sera:corteo@strada_cinderwick, ultimi_cori:curva@curva_cinderwick
- titolo: Il ritorno in stazione · «i»: Dopo la partita: i gemellati tornano in stazione per prendere il treno di casa.
- ch abbraccio: «Lavezzari: la curva vuole scortare i gemellati in stazione. I due gruppi insieme, per una volta.»

### e28 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → centro (stadio vuoto)
- chiamate su strada: ospiti_in_auto@strada_cinderwick entra → centro (stadio vuoto)
- eventi: auto_ospiti:arrivo@strada_cinderwick, container:movimento@banchine, carico:movimento@magazzino_fonderie
- titolo: Quattro voci · «i»: Prima del fischio: trasferta vietata, ma gli ospiti arrivano e sul Fabbro girano voci.
- ch ospiti_in_auto: «Strada da Kiln: l'Arches cerca parcheggio sotto le case della curva. Clacson e finestrini giù.»

### e28 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: corteo_capo@strada_cinderwick esce → bordo basso
- eventi: deflusso_casa:corteo@strada_cinderwick, ospiti_auto:arrivo@piazzale, ultimo_movimento:movimento@banchine
- titolo: L'uscita · «i»: Fischio finale: lo stadio si svuota e tifosi di casa e ospiti tornano in strada.
- ch corteo_capo: «In rete: la curva Kiln annuncia un corteo «per il capo» dopo la partita. Verso il porto.» // «Verso il porto. Allora lo sanno anche loro. Vanno a proteggerlo o a dargli tempo di andarsene?»

### e29 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: corteo_al_porto@strada_cinderwick esce → bordo basso
- eventi: corteo_porto:corteo@strada_cinderwick, cancelli_porto:folla@banchine, piazzale_notte:folla@piazzale, rabbia_fabbro:corteo@strada_cinderwick
- titolo: La notte · «i»: Dopo la partita è notte: lo stadio si svuota, ma in città molti restano in giro.
- ch corteo_al_porto: «In rete: la curva Kiln scende verso il porto. «Andiamo a riprendercelo».» // «Non lo riprendono. Lo sanno anche loro. Vogliono solo che si sappia che ci hanno provato.»

### e30 ondata 1 — fase –, spalti vuoti
- corteo dell'ondata: —
- chiamate su strada: autobus_sera@viale_stazione entra → centro (stadio vuoto)
- eventi: raduno_nero:corteo@piazzale, scritte:protesta@quartiere, viale_presto:traffico@viale_stazione
- titolo: Il raduno · «i»: Il giorno dopo, niente partita: la curva si raduna allo stadio per il corteo al municipio.
- ch autobus_sera: «Centrale radio: il corteo taglia il viale della stazione in ora di punta. Ci passano dodici linee.» // «Le ferrovie dicevano lontano dalla stazione. Lontano, per le ferrovie, sono duecento metri.»

### e30 ondata 2 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: silenzio_totale@strada_cinderwick esce → bordo basso; clacson@viale_stazione entra → centro (stadio vuoto)
- eventi: silenzio_strada:corteo@strada_cinderwick/dallo_stadio, pendolari:traffico@viale_stazione, troupe:folla@piazza_municipio
- titolo: Il silenzio in cammino · «i»: Il corteo si muove in silenzio dallo stadio verso il municipio, in mezzo al traffico.
- ch silenzio_totale: «Strada da Kiln: nessun coro, solo lo striscione bianco: «IL GIORNO DOPO». Serrande a metà.» // «Il silenzio non si può sanzionare. L'hanno capito prima di noi.»
- ch clacson: «Viale della stazione: auto ferme, clacson e urla. In coda al corteo venti ragazzi si girano.»

### e30 ondata 3 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick entra → meta:piazza_municipio
- chiamate su strada: saluto_larkspire@strada_cinderwick entra → meta:piazza_municipio
- eventi: sotto_comune:corteo@piazza_municipio, coda_corteo:folla@strada_cinderwick, quartiere_sera:protesta@quartiere
- titolo: Poi parleremo noi · «i»: Il corteo arriva in piazza del municipio: qui la curva vuole farsi sentire.
- ch saluto_larkspire: «In rete: gruppo di Skyfield «saluterà» la coda del corteo che torna, all'incrocio delle fonderie.»

### e30 ondata 4 — fase –, spalti vuoti
- corteo dell'ondata: strada_cinderwick esce → bordo basso
- chiamate su strada: fiaccolata@strada_cinderwick esce → bordo basso
- eventi: fiaccole:corteo@strada_cinderwick/dallo_stadio, piazzale_tardi:folla@piazzale, quartiere_notte:protesta@quartiere
- titolo: La notte della curva · «i»: È sera, dopo il corteo al municipio: la curva resta in strada e la giornata non è finita.
- ch fiaccolata: «In rete: dopo il municipio, fiaccolata fino al porto. «Dove l'hanno preso, lì lo aspettiamo».»

### e31 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: viale_stazione entra → centro (stadio vuoto)
- chiamate su strada: viale_lavori@viale_stazione entra → centro (stadio vuoto)
- eventi: treno1:arrivo@stazione, viale_aperto:corteo@viale_stazione, ospiti_tribuna:cerimonia@tribuna_autorita
- titolo: Due treni · «i»: Prima della partita: il Railhead arriva in treno e la tribuna delle autorità si riempie.
- ch viale_lavori: «Viale della stazione: lavori del comune inesistenti. Quelli del Railhead ci passano in corteo.» // «Lavori annunciati e mai iniziati. Da queste parti è un genere letterario.»

### e31 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: viale_stazione esce → stazione(stazione)
- chiamate su strada: ritorno_rovers@viale_stazione esce → stazione(stazione)
- eventi: ritorno_viale:corteo@viale_stazione, treni_ritorno:arrivo@stazione, uscita_tribuna:cerimonia@tribuna_autorita
- titolo: Mezzanotte · «i»: Partita finita, verso mezzanotte: quelli del Railhead tornano in stazione per ripartire.
- ch ritorno_rovers: «Railhead in corteo sul viale verso la stazione. Ha perso e canta più forte contro lo stadio nuovo.»

### e32 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_cinderwick entra → stadio; strada_larkspire entra → stadio
- chiamate su strada: due_cortei@strada_larkspire entra → stadio
- eventi: corteo_cinderwick:corteo@strada_cinderwick, corteo_larkspire:corteo@strada_larkspire, appuntamento:folla@piazzale
- titolo: Due cortei · «i»: Prima del derby: le due tifoserie partono in corteo, ognuna dalla sua parte di città.
- ch due_cortei: «Kiln dalle fonderie, Skyfield dalla collina. Senza blocchi, i cortei al piazzale fra venti minuti.» // «Venti minuti. Il primo derby ne avevi quaranta. Si migliora.»

### e32 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_cinderwick esce → bordo basso; strada_larkspire esce → bordo basso
- chiamate su strada: collina@strada_larkspire esce → bordo basso
- eventi: deflusso_cinderwick:corteo@strada_cinderwick, deflusso_larkspire:corteo@strada_larkspire, piazzale_notte:folla@piazzale
- titolo: Dopo il fischio · «i»: Fischio finale: le due tifoserie escono dallo stadio nello stesso momento.
- ch collina: «In rete: gruppi di Kiln salgono verso la collina di Skyfield, «a restituire la visita».»

### e33 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: viale_stazione entra → stadio
- chiamate su strada: —
- eventi: treno_anticipo:arrivo@stazione, viale_nostro:corteo@viale_stazione, biglietti:biglietti@tornelli
- titolo: Ordini diversi · «i»: Prima della partita: arriva l'Arches, e ogni unità ha un ordine un po' diverso.

### e33 ondata 2 — fase –, spalti pieni
- corteo dell'ondata: —
- chiamate su strada: parcheggio_vuoto@viale_stazione entra → stadio
- eventi: cori_larkspire:curva@curva_larkspire, cori_mossgarth:curva@curva_ospiti, ritardatari:biglietti@tornelli
- titolo: Primo tempo · «i»: Si gioca il primo tempo: le due curve sono piene, mentre si cerca chi passa le notizie.
- ch parcheggio_vuoto: «Stazione vecchia: un'auto entra nel parcheggio vuoto, vede la squadra e se ne va. Targa annotata.» // «Qualcuno ha ascoltato l'ordine finto e ha mandato a vedere. Adesso abbiamo una targa. Le targhe parlano.»

### e33 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: viale_stazione esce → stazione(stazione)
- chiamate su strada: viale_ritorno@viale_stazione esce → stazione(stazione)
- eventi: ritorno_mossgarth:corteo@viale_stazione, treno_notte:arrivo@stazione, uscita:folla@tornelli
- titolo: Il treno di mezzanotte · «i»: Fine partita: i tifosi dell'Arches tornano verso la stazione per il treno di mezzanotte.
- ch viale_ritorno: «L'Arches torna in stazione in corteo. Hanno vinto. Il viale lo sa, e anche i negozi del viale.»

### e34 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: parcheggi entra → stadio
- chiamate su strada: pullman_quillhaven@parcheggi entra → stadio
- eventi: pullman:arrivo@parcheggi, mercato:folla@piazzale, commissione:cerimonia@tribuna_autorita
- titolo: La commissione · «i»: Prima della partita: arrivano gli ospiti del Lookout e la commissione è in tribuna.
- ch pullman_quillhaven: «Lookout: i nostri pullman sono il doppio di quelli annunciati. Ci date un parcheggio in più?»

### e34 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: parcheggi esce → bordo basso
- chiamate su strada: pullman_ritorno@parcheggi esce → bordo basso
- eventi: deflusso:corteo@parcheggi, uscita_casa:folla@piazzale, commissione_esce:cerimonia@tribuna_autorita
- titolo: Il verdetto · «i»: Fischio finale: i tifosi escono verso piazzale e parcheggi, ultimo tratto sotto esame.
- ch pullman_ritorno: «Lookout: abbiamo vinto e vogliamo partire. Ma i pullman sono bloccati dai furgoni del mercato.»

### e35 ondata 1 — fase –, spalti vuoti
- corteo dell'ondata: —
- chiamate su strada: corso_chiuso@corso_centro entra → centro
- eventi: curiosi_banca:folla@perimetro_banca, corso_bloccato:traffico@corso_centro, barca:movimento@banchine
- titolo: Le sette di sera · «i»: Le sette di sera: rapina in banca sul corso, il comando tratta e il centro si riempie.
- ch corso_chiuso: «Corso chiuso alla banca: bus fermi, coda fino alla stazione. Gente a piedi verso il nastro.»

### e35 ondata 2 — fase –, spalti vuoti
- corteo dell'ondata: corso_centro entra → centro
- chiamate su strada: familiari@corso_centro entra → centro
- eventi: dirette:folla@perimetro_banca, luci_cantiere:movimento@cantiere_stadio_nuovo, familiari:folla@corso_centro
- titolo: Le dieci · «i»: Le dieci di sera: la trattativa in banca continua e la città intorno non si ferma.
- ch familiari: «Al nastro sul corso i familiari dei dipendenti della banca. Chiedono notizie, e di avvicinarsi.» // «Questa è la parte che nei film non fanno vedere. Per fortuna, perché nei film la sbagliano.»

### e36 ondata 1 — fase –, spalti arrivo
- corteo dell'ondata: strada_larkspire entra → stadio
- chiamate su strada: coreografia_collina@strada_larkspire entra → stadio
- eventi: cantiere_raduno:folla@cantiere_stadio_nuovo, collina:corteo@strada_larkspire, festa:folla@piazzale
- titolo: Lo stadio vecchio · «i»: Prima del derby nello stadio vecchio: il cantiere è sequestrato e mezza città fa festa.
- ch coreografia_collina: «Curva Skyfield giù dalla collina, coreografia arrotolata: cento metri di stoffa. Tutta la strada.»

### e36 ondata 4 — fase –, spalti deflusso
- corteo dell'ondata: strada_larkspire esce → bordo basso
- chiamate su strada: ritorno_collina@strada_larkspire esce → bordo basso
- eventi: deflusso_larkspire:corteo@strada_larkspire, festa_notte:folla@piazzale, cantiere_ultimo:folla@cantiere_stadio_nuovo
- titolo: Mezzanotte · «i»: Partita finita, si va verso mezzanotte: le curve tornano a casa e la serata si chiude.
- ch ritorno_collina: «In rete: Skyfield battuti, su per la collina con la coreografia. Alcuni di Kiln li accompagnano.»