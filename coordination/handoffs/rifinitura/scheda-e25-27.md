# Scheda di rifinitura e25–e27 (D-135, D-188)

Fonti: `data/missioni/e2x.json` (M) e `data/testi/it/e2x.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield (testi e mappa).
Esiti comuni ai tre episodi (M e25:752, e26:731, e27:775): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita). Terza stella: fiducia ≥ 7
(e25, e27), ≥ 8 in e26 (D-181).
Le chiamate e le opzioni marcate *[se …]* compaiono solo con quella variabile o scelta precedente.

---

## e25 · «Nuove regole» (T e25:2) — apre la stagione 3

**Partita:** Kiln in casa, Belltower ospite (M e25:3-5); «Curva ospiti chiusa per ordinanza, ma il Belltower arriva lo stesso» (T e25:4).
Risultato: non dichiarato; c'è solo il «Rigore per il Belltower al settantesimo» (T e25:66).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e25:93-119).

**Trama.** Un vertice internazionale chiude il centro in zona rossa e una «Struttura» decide tutto (T e25:3).
Moduli, nulla osta, ispettori e verbali da firmare si mettono in mezzo a ogni scelta. Il Belltower arriva in treno
in una stazione con la sola uscita laterale. Il ragazzo delle sciarpe giura di aver visto il Fabbro ai varchi, ma
non è vero (briefing `vera: false`, M e25:42-46; T e25:60). Il verbale contenuto chiude con le regole che «restano anche dopo» (T e25:115).

**Ondata 1 – La zona rossa**
- Nulla osta (M e25:151): *aspetta il modulo* → +2 P piazza municipio, +1 fiducia · *accompagna lo stesso* → −2 P, −1 fiducia · *mediatore* → −1 P, costa il mediatore · [busta tenuta] *mostra la busta* → −2 P, **nessun altro effetto** (M e25:206) · [busta consegnata] *chiama il comando* → −1 P, +1 fiducia (M e25:222).
- Treno pieno (M e25:244): *squadra in stazione* → −2 P stazione, costa una squadra · *falli aspettare* → +2 T stazione.
- Il club garantisce (M e25:280, parla Lavezzari): *lascia al club* → +1 fiducia, +2 P curva Kiln · *steward restano* → −1 fiducia.

**Ondata 2 – Primo tempo, primo giorno**
- Striscione «LO STADIO NON È ZONA ROSSA» (M e25:342): *fallo togliere* → +1 fiducia, +2 T curva Kiln · *fotografa e lascia* → −1 fiducia, −1 P curva Kiln.
- Articolo dodici (M e25:383): *scrivi la richiesta* → +2 P piazzale · *mediatore subito* → −2 P, costa il mediatore · *steward fra gli ospiti* → −2 P, costa due steward.
- Il ragazzo giura (M e25:435): *squadra ai varchi* → −2 P zona rossa, costa una squadra · *non è il momento* → +2 P zona rossa.

**Ondata 3 – Secondo tempo**
- Rigore (M e25:498): *steward fra le auto* → −2 P piazzale (il testo dice «il club ospite protesta», T e25:68) · *lascia festeggiare* → +2 P piazzale.
- Ispettore (M e25:530): *ritira le squadre* → +2 P curva Kiln · *spiegagli perché restano* → −1 P curva Kiln.
- Uscite anticipate (M e25:563): *chiudi le uscite* → −2 P piazza municipio, +1 T curva Kiln · *lasciali uscire* → +2 P piazza.

**Ondata 4 – Il deflusso**
- Treno per Belltower (M e25:625): *trattieni il treno* → −2 P stazione, senza costo · *parte all'orario* → +2 P stazione.
- Verbale sull'ordinanza (M e25:657): *firme subito* → +1 fiducia, +2 P zona rossa · *firme domani* → −1 fiducia.
- Corteo di ritorno (M e25:694): *giro lungo* → −2 P piazza, costa una squadra, +1 P stazione · *percorso corto* → −1 P, +1 T piazza (il testo dice «la Struttura protesta», T e25:110) · *lasciali andare* → +2 P piazza.

**Esiti**
- Contenuto: «Vertice, partita e corteo: tutto in ordine. La Struttura si congratula con tre allegati e una nota: le regole restano anche dopo. Malvasi ne usa una per il caffè.» (T e25:115)
- A fatica: «Qualche regola piegata. L'ispettore scrive «con riserva» e la Struttura chiede di vederti. Malvasi: «Con riserva è il mio stato civile».» (T e25:116)
- Degenerato: «La sera è scappata di mano: cortei incrociati, rapporti fino a notte. La Struttura chiede più poteri, e in comune qualcuno glieli promette.» (T e25:117)

**Malvasi / il vice (scelta)**
- «Curva ospiti chiusa per ordinanza, ma il Belltower arriva lo stesso. Tu firmi, la Struttura decide. Scommetto che resta anche dopo.» (T e25:4)
- «Il corteo parte alle sedici. Il modulo B l'ha disegnato qualcuno che un corteo non l'ha mai visto.» (T e25:12)
- «Il nome lo conosco. Lo conosce anche lui, adesso.» (T e25:39)
- «L'ultima volta che ha giurato era un manichino. Ma ai varchi c'è gente, e va guardata.» (T e25:57)
- «Un ispettore durante la partita. Ci avrei scommesso, se fossi uno che scommette. Ah, già.» (T e25:74)

---

## e26 · «La finale» (T e26:2)

**Partita:** finale di coppa, Skyfield in casa, Domepark ospite (M e26:3-5; T e26:3).
Risultato fisso: «Gol dello Skyfield al centodecimo» (T e26:66); la curva ospiti è «sconfitta» (T e26:79).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e26, blocco `risorse`).

**Trama.** Mezza città che conta in tribuna e un foglio del comune: «niente immagini brutte in diretta» (T e26:4).
I pullman del Domepark arrivano sparsi. In tribuna ci sono tre ospiti fuori lista, e uno ha il distintivo della
Varrone & Figli (T e26:30). La curva Skyfield canta il nome dello striscione di e25 (T e26:50). Si va ai supplementari,
lo Skyfield vince e la notte finisce con una foto con la coppa accanto all'uomo della Varrone (T e26:116).

**Ondata 1 – I pullman**
- Pullman sparsi (M e26:149): *raduna* → −2 P parcheggi, costa una squadra · *dove trovano* → +2 P parcheggi.
- Auto delle autorità (M e26:186): *corridoio con gli steward* → +2 P piazzale (il testo dice «In comune apprezzano», T e26:21, ma la fiducia non sale) · *ingresso laterale* → −1 P piazzale (il testo dice «in comune non gradiscono», T e26:24).
- Ospiti fuori lista (M e26:218): *falli entrare* → +1 fiducia, +2 P tribuna · *controlla gli inviti* → −2 P, costa due steward, −1 fiducia · *mediatore* → −1 P, costa il mediatore.

**Ondata 2 – Primo tempo**
- Fumogeni (M e26:305): *steward in curva ospiti* → −2 P curva ospiti, senza costo di unità · *lascia correre* → +3 P · *regia* → +1 fiducia, +1 P.
- Cori contro l'ospite in tribuna (M e26:353): *fai smettere* → +2 T curva Skyfield · *sposta l'ospite* → −1 P tribuna («l'ospite non gradisce», T e26:55).
- Ritardatari (M e26:386): *apri un cancello* → −2 P parcheggi, costa una squadra · *uno alla volta* → +2 P parcheggi.

**Ondata 3 – I supplementari**
- Invasione (M e26:448): *barriera di steward* → −2 P curva Skyfield, costa due steward · *capitano allo speaker* → −1 P · *nessun intervento* → +2 P.
- Premiazione (M e26:496): *in campo* → +2 T curva ospiti · *in tribuna* → −1 P curva ospiti («in comune storcono il naso», T e26:82).
- Maxischermo (M e26:529): *spegnilo* → −2 P piazzale, senza costo · *una squadra* → −2 P, costa una squadra · *lascialo* → +2 P.

**Ondata 4 – La notte della coppa**
- Carosello (M e26:603): *percorso concordato* → −2 P piazzale, costa il mediatore · *blocca* → +2 T curva Skyfield · [mediatore lasciato in tribuna] *blocca* → +1 fiducia, +2 T (M e26:642).
- Pullman sconfitti (M e26:665): *liberali per primi* → −2 P parcheggi, +1 P piazzale · *aspettano* → +2 P parcheggi.
- Foto con la coppa (M e26:701): *fai la foto* → +3 P tribuna · *declina* → nessun effetto («in comune se lo ricordano», T e26:118).

**Esiti**
- Contenuto: «Coppa alzata, immagini pulite, pullman ripartiti. Il comune si congratula con una foto allegata. Malvasi la guarda a lungo e indica il distintivo della Varrone & Figli.» (T e26:120)
- A fatica: «Una finale con qualche ombra: fumo, cori, un piazzale troppo pieno. In diretta si è visto poco. In comune si è visto tutto.» (T e26:121)
- Degenerato: «La notte della coppa è finita nei rapporti: festa fuori controllo, ore di confusione. Le immagini girano in rete. La segreteria chiede un incontro, domattina presto.» (T e26:122)

**Malvasi / il vice (scelta)**
- «Malvasi ha la cravatta. Non l'ha mai avuta. «Finale di coppa in casa: Skyfield contro Domepark. In tribuna, mezza città che conta.»» (T e26:3)
- «Inviti firmati a mano. Mi piacerebbe vedere la firma. Anzi, mi piacerebbe fotografarla.» (T e26:27)
- «È lo stesso nome dello striscione dell'altra volta. La città ha poca fantasia, ma molta memoria.» (T e26:50)
- «Tutte. Anche quello della Varrone & Figli. Ci tiene a farsi vedere con la coppa.» (T e26:77)
- «Due minuti di foto. Due anni di didascalie. Io ci andrei, ma io non ho niente da perdere.» (T e26:113)

---

## e27 · «Il ritorno dei gemellati» (T e27:2)

**Partita:** «Kiln–Waterline» (T e27:4); il campo `partita` manca nei dati (facoltativo, D-130). Gemellati del Railhead in un settore a parte.
Risultato: non dichiarato; c'è solo il «Gol del Waterline» (T e27:68).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e27, blocco `risorse`).

**Trama.** Il Fabbro è latitante e la curva Kiln è divisa in due gruppi che si contendono il tamburo (T e27:4, 41).
I gemellati del Railhead arrivano in treno, alcuni a piedi prima della stazione, e vogliono stare in curva Kiln.
Il Waterline li provoca. Gira un video con un messaggio «da parte di un amico lontano» (T e27:52). A fine serata il
responsabile del Railhead ti dà un biglietto con un indirizzo del porto: «Non è da parte mia» (T e27:114).

**Ondata 1 – Il treno dei gemellati**
- Scesi prima (M e27:144): *intercettali* → −2 P strada Kiln, costa una squadra · *mediatore* → −1 P, costa il mediatore · *lasciali camminare* → +2 P.
- Settore assegnato (M e27:197): *restano separati* → −1 fiducia, +2 P settore gemellati · *in curva Kiln* → +1 fiducia, +3 P curva Kiln.
- Pensilina (M e27:237): *scortali* → −2 P stazione, costa una squadra · *chiudi il bar* → −1 P, −1 fiducia · *aspettino* → +2 T stazione.

**Ondata 2 – Due gruppi, una curva**
- Il tamburo (M e27:315, parla Lavezzari): *sequestralo* → +1 fiducia, +3 T curva Kiln · *steward in mezzo* → −2 P, costa due steward · *aspetta* → +2 P.
- Il video (M e27:368): *acquisiscilo* → +2 P settore gemellati · *lascia perdere* → nessun effetto («il comando non gradisce», T e27:57).
- Coro del Waterline (M e27:395): *steward in curva ospiti* → −2 P curva ospiti, senza costo di unità («quelli del Waterline protestano», T e27:61) · *lascia che si rispondano* → +1 P curva ospiti, +1 P settore gemellati.

**Ondata 3 – Secondo tempo**
- Gol del Waterline (M e27:457): *mediatore* → −2 P curva Kiln, costa il mediatore · *annuncio* → +2 P · [mediatore già coi gemellati] *annuncio* → +1 fiducia, +2 P (M e27:496).
- «Salutare» il Waterline (M e27:519): *trattienili* → +2 T settore gemellati · *uscita scortata* → −2 P, costa una squadra, +2 P stazione.
- Festa sotto la curva (M e27:560): *uscita separata* → −2 P curva ospiti, −1 fiducia · *lasciali* → +1 fiducia, +2 P curva Kiln.

**Ondata 4 – Il ritorno in stazione**
- [se i gemellati non sono già usciti] Abbraccio (M e27:627): *corteo scortato* → −2 P strada Kiln, costa una squadra · *pullman* → −1 P, −1 fiducia, +1 T curva Kiln · *insieme* → +1 fiducia, +2 P.
- Ritardo del treno (M e27:688): *sala d'attesa* → −2 P stazione, senza costo («le ferrovie non gradiscono», T e27:106) · *steward in banchina* → −2 P, costa due steward · *aspettano* → +2 P.
- Il biglietto del porto (M e27:736): *tienilo* → +2 P stazione · *al comando* → −1 P, costa uno steward.

**Esiti**
- Contenuto: «I gemellati sono ripartiti e la curva Kiln ha cantato con una voce sola, per una sera. Malvasi archivia la sciarpa, e il biglietto del porto in un cassetto a parte.» (T e27:122)
- A fatica: «Due gruppi in curva, uno in più fuori: la sera ha tenuto, a fatica. Malvasi segna sulla cartina dove hanno litigato. Tre punti, e uno è al porto.» (T e27:123)
- Degenerato: «La curva senza capo ha trovato un capo per una sera: il disordine. I rapporti parlano di una notte lunga. Da qualche parte, qualcuno se la ride.» (T e27:124)

**Malvasi / il vice (scelta)**
- «Il Fabbro è latitante, loro tornano lo stesso per Kiln–Waterline. Chi comanda in curva stasera? Punto su nessuno. È il peggio.» (T e27:4)
- «Conoscono le parole meglio dei padroni di casa. Brutto segno, o bel segno. Dipende da chi le canta dopo.» (T e27:12)
- «Senza il Fabbro il tamburo è il trono. Io lo farei sparire. Ma io sono un vice.» (T e27:42)
- «Salutare. Bella parola. La metterei nel dizionario delle parole che non vogliono dire quello che dicono.» (T e27:78)
- «Un indirizzo del porto, a mano. Regalo o esca. I regali, da queste parti, si pagano dopo.» (T e27:115)

---

## Punti da decidere

### 1 · L'inizio della stagione 3 non riprende la fine della stagione 2, e la busta diventa un ricatto gratis
e24 chiude con la busta (consegnata o tenuta, M e24:482/498) e con «La scommessa resta aperta. Hai chiuso una stagione:
io alzo la posta» (T e24:120). L'introduzione di e25 parla solo di vertice e Struttura (T e25:3-4): niente busta,
niente titolo dello Stoneway, niente nome. La busta torna solo come opzione nella prima chiamata. Lì *mostra la busta*
dà −2 senza costo (M e25:206) e vale più di *accompagna lo stesso*, che dà lo stesso −2 ma costa −1 fiducia (M e25:174).
*Chiama il comando* (−1 P, +1 fiducia, M e25:222) vale più di *aspetta il modulo* (+2 P, +1 fiducia, M e25:158).
In tutti e due i rami di e24 c'è quindi un'opzione che batte le altre.
- **A (consigliata) · Riga di raccordo e busta che costa.** Una frase di Malvasi nell'introduzione ricorda busta e posta alzata; *mostra la busta* costa −1 fiducia («la Struttura se lo segna»). Costo: 1 testo nuovo, 1 effetto, rimisura col bot.
- **B · Solo il prezzo alla busta.** L'introduzione resta com'è. Costo: 1 effetto; il passaggio fra le due stagioni resta brusco.
- **C · Lasciare com'è.** Costo: la busta conviene sempre, e l'inizio della stagione 3 resta staccato dalla fine della 2.

### 2 · La Struttura promette di restare e sparisce
La Struttura è la fonte di 5 chiamate di e25 (M e25:151, 280, 383, 530, 657). I testi promettono che resta:
«Scommetto che resta anche dopo» (T e25:4), «le regole restano anche dopo» (T e25:115), «La Struttura chiede più poteri» (T e25:117).
In tutti i testi da e26 a e36 la parola «Struttura» non compare mai (grep: 0 occorrenze). D-091 dice solo «e25 vertice internazionale
inventato (…) che porta le nuove regole» (docs/governo/DECISIONI.md:102), senza dire per quanto restano. Se fosse prevista una ripresa in e31–e36 sotto un altro nome: Non verificato.
- **A (consigliata) · Togliere la promessa.** Le tre frasi chiudono il vertice («finito il vertice, la Struttura smonta le transenne»). Costo: 3 righe di testo.
- **B · Farla tornare una volta.** Una chiamata in un episodio successivo (per esempio e31) cita la Struttura o le sue regole. Costo: 1 chiamata nuova con effetti e rimisura.
- **C · Lasciare com'è.** Costo: un filo aperto in tre frasi che il gioco non chiude.

### 3 · Costi promessi che i dati non danno, e opzioni ovviamente migliori
D-186 ha deciso per e11–e12 che, dove il testo promette una protesta, si paga −1 fiducia. Qui ci sono gli stessi casi:
- e25 *steward fra le auto* −2 senza costo, «il club ospite protesta» (M e25:504; T e25:68); *percorso corto*, «la Struttura protesta», nessuna fiducia (M e25:720; T e25:110); *trattieni il treno* −2 gratis contro +2 (M e25:631, 643).
- e26 *ingresso laterale* −1, «in comune non gradiscono» (M e26:204; T e26:24); *sposta l'ospite* −1 (T e26:55); *premiazione in tribuna* −1 (T e26:82); *declina la foto* senza effetti contro +3 P, «in comune se lo ricordano» (M e26:720; T e26:118); *spegni lo schermo* −2 gratis contro *una squadra* −2 che costa una squadra (M e26:535, 547).
- e27 *lascia perdere il video* senza effetti contro +2 P, «il comando non gradisce» (M e27:386; T e27:57); *steward sul Waterline* −2 senza costo (M e27:401); *sala d'attesa* −2 gratis contro *steward in banchina* −2 che costa due steward (M e27:694, 706).
Una parte potrebbe venire dalla neutralizzazione di D-160 (fiducia tolta dove andava contro il risultato), col testo
del costo non aggiornato. Quali opzioni precisamente: Non verificato.
- **A (consigliata) · Dare il prezzo promesso, come D-186.** −1 fiducia dove il testo annuncia una protesta, circa 8 opzioni. Costo: circa 8 effetti e la rimisura col bot (curva D-154, fiducia D-160).
- **B · Riscrivere i costi.** Dove il dato è gratis il testo dice «nessun costo». Costo: circa 8 righe di testo; le scelte restano facili.
- **C · Lasciare così.** Costo: il testo promette conseguenze che non arrivano, contro la regola appena data in e11–e12.

### 4 · Testi che smentiscono la storia
- e27, verbale contenuto: Malvasi archivia «il biglietto del porto in un cassetto a parte» (T e27:122). Ma con *al comando* il biglietto «parte con uno steward» (T e27:121). L'esito si può raggiungere anche con quella scelta: Non verificato col bot, nei dati non c'è nessun vincolo (M e27:775).
- e26, introduzione: «Malvasi ha la cravatta. Non l'ha mai avuta.» (T e26:3). Due episodi prima: «Ultima giornata, e Malvasi ha messo la cravatta.» (T e24:3).
- **A (consigliata) · Correggere tutti e due.** Variante di testo del verbale secondo la scelta (`dopo`, come D-153) e in e26 «L'ha messa solo per lo Stoneway» o simile. Costo: 1 verbale in due varianti + 1 riga.
- **B · Solo testi neutri.** «Malvasi archivia la sciarpa e il biglietto del porto» diventa «… e l'indirizzo del porto»; la cravatta senza «mai». Costo: 2 righe, nessun dato.
- **C · Lasciare com'è.** Costo: due contraddizioni che un giocatore attento nota.
