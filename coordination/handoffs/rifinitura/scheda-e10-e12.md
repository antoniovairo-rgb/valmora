# Scheda di rifinitura e10–e12 (D-135)

Fonti: `data/missioni/e1x.json` (M) e `data/testi/it/e1x.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield (testi e mappa).
Esiti comuni ai tre episodi (M e10:894, e11:777, e12:866): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita).
Le chiamate marcate *[se …]* compaiono solo con quella variabile.

---

## e10 · «Derby di ritorno» (T e10:2)

**Partita:** derby di ritorno, Skyfield in casa, Kiln ospite (T e10:3). Risultato fisso: «Gol del Kiln al novantesimo: uno a uno» (T e10:80).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e10:89-109).

**Trama.** Malvasi rifà «i due caffè del primo giorno» e avverte che la città «passa a riscuotere» (T e10:3-4).
Le due tifoserie arrivano in corteo col primo derby in mente; il Kiln pareggia al 90' e le curve esplodono;
al deflusso torna il furgone grigio e un gruppo di casa aspetta Kiln al ponte. Quasi ogni chiamata
è il conto di una scelta fatta prima (informatore pagato, presidente incontrato, rapporto col Fabbro).

**Ondata 1 – Il ricordo del primo derby**
- Foto cerchiate (M e10:142): *comunicato di pace* → +1 fiducia, +1 T curva Skyfield · *silenzio* → +2 P strada Kiln.
- Corteo della collina (M e10:178): *niente corteo* → +1 fiducia, +1 T strada Skyfield · *corteo scortato* → −2 P strada Skyfield, costa uno steward.
- [se informatore pagato] Il ragazzo ricorda (M e10:218): *squadra al ponte* → −3 P strada Kiln, costa una squadra · *mediatore al ponte* → −2 P strada Kiln, costa il mediatore.
- [se informatore non pagato] Il ragazzo offeso (M e10:263): *pagalo ora* → −2 P strada Kiln, −1 fiducia · *niente soldi* → +2 P strada Kiln.

**Ondata 2 – Il derby**
- Due coreografie (M e10:330): *steward al confine* → −2 P curva Kiln, costa uno steward · *lascia fare* → +2 P curva Kiln.
- [Fabbro neutro] Rispetto in trasferta (M e10:366): *rispetto, nei limiti* → −2 P curva Kiln, −1 fiducia · *nessun trattamento* → +1 fiducia, +2 T curva Kiln.
- [Fabbro «rispetto»] Patto in trasferta (M e10:411): *lasciagli la curva* → −3 P curva Kiln, −1 fiducia · *ci metto i miei steward* → −1 P curva Kiln, costa uno steward.
- [Fabbro ostile] Sgarbo (M e10:456): *chiarisci* → −1 P curva Kiln, −1 fiducia · *nessuna telefonata* → +1 fiducia, +3 T curva Kiln.
- [presidente incontrato] Tribuna (M e10:501): *steward e tribuna* → +3 steward, −2 fiducia · *solo steward* → +2 steward, −1 fiducia · *declina* → +1 fiducia.
- [presidente non incontrato] Mai presentato (M e10:558): *presentati ora* → −2 P curva Skyfield, −1 fiducia · *lascia la stampa* → +1 T curva Skyfield.

**Ondata 3 – Il gol**
- Novantesimo (M e10:625): *ripartenza calma* → −2 P curva Skyfield, −1 P curva Kiln · *lascia esplodere* → +1 P su entrambe.
- Scavalca (M e10:665): *cordone* → −2 P curva Skyfield, −1 fiducia · *steward già lì* → +1 T curva Skyfield.
- Fumo arancione (M e10:701, non compare se si è scelto «lasciagli la curva»): *steward in curva Kiln* → −2 P e +1 T curva Kiln · *lascia correre* → +1 fiducia, +1 T curva Skyfield.

**Ondata 4 – Il deflusso**
- Al contrario (M e10:768): *prima Kiln* → −2 P strada Kiln, +1 T curva Skyfield · *prima Skyfield* → −2 P strada Skyfield, +1 T curva Kiln.
- [se furgone visto] Furgone al derby (M e10:807): *blocca* → −2 P strada Kiln, +1 T piazzale · *annota* → +1 fiducia, +1 P strada Kiln.
- Ponte al ritorno (M e10:852): *chiudi il ponte* → −2 P strada Skyfield, +2 P piazzale · *manda a parlarci* → −1 P strada Skyfield, +1 fiducia.

**Esiti**
- Contenuto: «Il derby di ritorno è finito senza danni, e la città se ne accorge. Malvasi paga una scommessa piccola e ne apre una grande. «Quella la vinco io.» Non sembra convinto.» (T e10:126)
- A fatica: «Un derby teso, qualche spintone sul ponte, nessun ferito grave. In rete le foto del ritorno accanto a quelle dell'andata: per qualcuno hai fatto progressi. Per qualcuno no.» (T e10:127)
- Degenerato: «Il derby di ritorno è finito come la città temeva: strade chiuse, rapporti fino all'alba, cerchi rossi su ogni foto. Malvasi mette in fila i giornali accanto a quelli dell'andata.» (T e10:128)

**Malvasi / il vice (scelta)**
- «Il primo derby non si scorda mai. Purtroppo vale per tutti.» (T e10:12)
- «Pagato una volta, informa per sempre. Quasi come un abbonamento.» (T e10:27)
- «Il posto accanto al presidente. Comodo, in vista, e fotografato.» (T e10:60)
- «Pareggio nel derby. Lo dico da due anni. Nessuno mi ascolta.» (T e10:81)
- «Il furgone non si perde un derby. Neanche noi, purtroppo.» (T e10:112)

---

## e11 · «Cassonetti in fiamme» (T e11:2)

**Partita:** nessuna partita in città. Il Kiln «ha perso quattro a zero a Wallgate», il treno dei tifosi torna alle undici (T e11:3).
Risorse: 5 squadre, 3 steward, 1 mediatore (M e11, blocco `risorse`).

**Trama.** Notte nel quartiere di Kiln dopo la sconfitta. In rete gira «Stanotte alle fonderie, per la squadra»;
bruciano i cassonetti, ma in strada «non sembrano tutti di qui» (T e11:81) e c'è chi arriva con le taniche.
Il Fabbro si chiama fuori e offre di ritirare i suoi; il furgone grigio esce dal quartiere contromano.
All'alba la rete chiede «chiudete quello stadio», anche se lo stadio non c'entrava (T e11:121-122).

**Ondata 1 – Il treno della sconfitta**
- Treno al ritorno (M e11:144): *squadre in stazione* → −3 P stazione, costa una squadra · *binario lontano* → −1 P stazione, +1 P viale · *arrivo normale* → +2 P stazione.
- Pattuglia per il comitato (M e11:197): *promettila* → +1 fiducia, +1 P stazione · *nessuna promessa* → −1 fiducia.
- «Per la squadra» (M e11:233): *mediatore alle fonderie* → −2 P piazza fonderie, costa il mediatore · *chiudi la piazza* → −2 P piazza, +1 T quartiere · *aspetta* → +2 P piazza.
- [se informatore pagato] Taniche (M e11:285): *controlla i bagagliai* → −2 P piazza, −1 fiducia · *niente prove* → +1 P piazza.

**Ondata 2 – Il primo cassonetto**
- Primo fuoco (M e11:352): *scorta ai vigili del fuoco* → −2 P quartiere, costa una squadra · *isola la via* → −2 P quartiere, +1 T strada Kiln.
- Il Fabbro «non c'entra» (M e11:392, non compare se si è chiusa la piazza): *accetta* → −3 P piazza fonderie, **nessun altro effetto** · *rifiuta* → +2 T piazza.
- Dirette in rete (M e11:426): *comunicato* → +2 P strada Kiln · *allontana i curiosi* → −2 P strada Kiln.
- [presidente incontrato] «Fra vicini» (M e11:458): *accetta* → +2 steward, −1 fiducia · *declina* → +1 fiducia.

**Ondata 3 – Mezzanotte**
- Non di qui (M e11:525): *posti di blocco* → −3 P quartiere · *solo le fiamme* → +2 P quartiere.
- Autoscala (M e11:558): *libera la strada* → −2 P strada Kiln, +1 P quartiere · *prima il quartiere* → +1 T strada Kiln.
- [se furgone visto] Contromano (M e11:594): *fallo fermare* → +1 fiducia, +1 T strada Kiln · *annota* → +1 P strada Kiln.

**Ondata 4 – L'alba**
- Chi paga (M e11:661): *paga il comune* → −2 P quartiere · *assicurazioni* → +1 T quartiere.
- Ultimo fuoco (M e11:694): *manda le squadre* → −2 P strada Kiln, +1 P quartiere · *vigili del fuoco* → +1 fiducia, +1 T strada Kiln.
- «Chiudete quello stadio» (M e11:734): *rispondi* → +1 fiducia, +2 P viale · *taci* → −1 P viale, −1 fiducia.

**Esiti**
- Contenuto: «Qualche cassonetto annerito, nessun ferito, il quartiere si sveglia quasi normale. Nel rapporto Malvasi aggiunge: «molti dei presenti non erano residenti». E la sottolinea.» (T e11:129)
- A fatica: «Una notte di fumo e sirene, dieci cassonetti, nessun ferito grave. Il comitato chiede la chiusura dello stadio. Malvasi fa notare che stanotte lo stadio non c'entrava. Nessuno ascolta.» (T e11:130)
- Degenerato: «Il quartiere ha bruciato fino all'alba: strade chiuse, negozi danneggiati, una città che si sveglia arrabbiata. In comune, ufficialmente, qualcuno dice «chiusura dello stadio».» (T e11:131)

**Malvasi / il vice (scelta)**
- «Taniche nel bagagliaio. I tifosi arrabbiati di solito portano solo la rabbia.» (T e11:40)
- «Il Fabbro non c'entra niente, ma la può spegnere. Bel talento.» (T e11:57)
- «Il presidente dello Skyfield che aiuta Kiln. Stanotte succedono cose strane.» (T e11:72)
- «Il furgone non scappa mai. Va via. È diverso.» (T e11:97)
- «All'alba sono tutti più onesti. Anche i cassonetti.» (T e11:107)

---

## e12 · «Ultima di campionato» (T e12:2)

**Partita:** «Kiln contro Southwind», ultima giornata; la sera il consiglio comunale vota la chiusura dello stadio vecchio (T e12:4).
Risultato fisso: gol del Southwind all'85', «sono salvi» (T e12:94); «Kiln battuto, Southwind salvo, voto rinviato» (T e12:103).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e12, blocco `risorse`).

**Trama.** Malvasi ha riempito la lavagna di fili rossi: biglietti falsi, furgone grigio, il Fabbro, cartelloni (T e12:3).
Le due curve presidiano insieme il comune; l'informatore dice che tutto è «pagato dallo stesso posto. E non è la curva» (T e12:37).
Il voto viene rinviato, compare il manifesto dello stadio nuovo e il furgone risulta di una ditta di cartelloni.
Chiude la prima stagione con la domanda: «A chi conviene chiudere lo stadio?» (T e12:126).

**Ondata 1 – Il consiglio comunale**
- Al portone (M e12:147): *mediatore in piazza* → −2 P piazza comune, costa il mediatore · *chiudi la piazza* → −2 P piazza comune · *presidio libero* → +1 fiducia, +2 P piazza comune.
- La lavagna (M e12:200): *tutto nel rapporto ora* → +2 P piazzale, segna «furgone visto» · *prima la partita* → nessun effetto.
- Ultimo corteo (M e12:231): *scorta* → −3 P strada Kiln, costa una squadra · *devialo* → −1 P piazza comune, +1 T strada Kiln.
- [se informatore pagato] Stesso posto (M e12:271): *chiedi dei soldi* → −2 P piazzale, −1 fiducia · *ringrazia* → +1 P piazzale.

**Ondata 2 – L'ultima partita**
- Coreografia (M e12:338): *steward in curva* → −2 P curva Kiln, costa uno steward · *lasciala* → +1 fiducia, +2 P curva Kiln.
- Salvezza (M e12:378): *cordone davanti agli ospiti* → −2 P curva ospiti · *fidati del loro responsabile* → +2 P curva ospiti.
- [Fabbro neutro] Chiudiamo la città (M e12:410): *tratta* → −3 P piazza comune, −2 fiducia · *niente trattative* → +1 fiducia, +2 T piazza comune.
- [Fabbro «rispetto»] Parola del Fabbro (M e12:455): *lasciagli la piazza* → −3 P, −1 fiducia · *alle tue regole* → −1 P, +1 fiducia.
- [Fabbro ostile] Il conto (M e12:500): *chiamalo e tratta* → −2 P, −2 fiducia · *nessuna telefonata* → +1 fiducia, +3 T piazza comune.
- [presidente incontrato] Voto deciso (M e12:545): *accetta gli steward* → +2 steward, −1 fiducia · *declina* → +1 fiducia.

**Ondata 3 – Il voto rinviato**
- Il manifesto (M e12:612): *toglilo* → −2 P piazza comune, −1 fiducia (protesta Varrone & Figli) · *lascialo* → +1 T piazza comune.
- [se furgone visto] Targa davanti (M e12:648): *annota la ditta* → +1 fiducia, +2 P piazzale · *ferma il furgone* → −1 P piazzale, −1 fiducia.
- Salvi (M e12:693): *steward sulla pista* → −2 P curva ospiti, +1 T curva Kiln · *lascia festeggiare* → +2 P curva ospiti.

**Ondata 4 – Fine stagione**
- Insieme in piazza (M e12:755): *accompagnale* → −2 P strada Kiln, +1 T piazza comune · *fermale prima* → −2 P piazza comune, +1 T strada Kiln.
- Entro le dieci (M e12:795): *sgombera* → +2 T piazza comune · *chiedi l'ordine scritto* → −1 P piazza comune.
- Rinforzi (M e12:828): *manda i rinforzi* → −2 P piazzale, +1 P strada Kiln · *chiudi i cancelli* → −2 P piazzale.

**Esiti**
- Contenuto: «Stagione chiusa senza danni. Malvasi scopre la lavagna: biglietti, furgone, gente senza sciarpa, Tano Ferrigno, cartelloni. «Sono organizzati. A chi conviene chiudere lo stadio?»» (T e12:126)
- A fatica: «La stagione finisce a fatica, ma finisce. Malvasi tira l'ultimo filo di lana rossa fino ai cartelloni dello stadio nuovo. «Qualcuno li organizza. E qualcuno ci guadagna.»» (T e12:127)
- Degenerato: «Una notte di rapporti, il voto sulla chiusura di nuovo in agenda. Malvasi scrive sotto i cartelloni: «a chi conviene?». Stanotte qualcuno ha lavorato per qualcuno.» (T e12:128)

**Malvasi / il vice (scelta)**
- «Fonderie e collina dalla stessa parte. Se serviva qualcosa per unirli, era chiudere lo stadio.» (T e12:12)
- «Non è la curva. Allora qualcuno paga perché sembri la curva.» (T e12:38)
- «Il voto è deciso prima di votare. Il presidente lo sa. Chi altro lo sa?» (T e12:70)
- «Ultima partita della stagione. La scommessa non l'ho ancora persa. Non l'ho neanche vinta.» (T e12:104)
- «La parola del Fabbro. Finora l'ha mantenuta. Mi preoccupa più questo che il resto.» (T e12:130)

---

## Punti da decidere

### 1 · Il presidente dello Skyfield torna in tutti e tre gli episodi
D-138 (docs/governo/DECISIONI.md:149) ha deciso che il presidente «resta solo dove il favore pesa (e05, e06, e09)».
In e10–e12 compare di nuovo in ogni episodio: tribuna (T e10:59) o stampa (T e10:70), «Fra vicini ci si aiuta» a Kiln
a mezzanotte (T e11:71), «voto già deciso» con due steward (T e12:69). In e11 è il vice stesso a trovarlo strano (T e11:72).
- **A (consigliata) · Toglierlo da e11.** e10 (derby in casa sua) ed e12 (voto) restano, dove il filo pesa. Costo: riscrivere 1 chiamata (M e11:458), le cui due opzioni sono steward in cambio di fiducia.
- **B · Tenerlo solo in e12.** Costo: riscrivere anche le 2 chiamate di e10 (M e10:501, 558), che sono il conto di `presidente_incontrato`.
- **C · Lasciare tutto com'è.** Costo: nessuno nei dati; il presidente arriva a comparire in molti episodi di fila (quanti in e01–e09 lo dice D-138, il conto preciso qui è Non verificato).

### 2 · In e11 il patto col Fabbro è gratis
Accettare l'offerta del Fabbro (dove chiede «domani nessuno fa nomi», T e11:56) toglie 3 di pressione e non costa altro
(M e11:400), anche se il testo del costo dice «ma è un patto» (T e11:59). Gli altri patti col Fabbro costano fiducia:
e10 «lasciagli la curva» −1 (M e10:422), e12 «tratta» −2 (M e12:417), «lasciagli la piazza» −1 (M e12:466).
- **A (consigliata) · Aggiungere −1 fiducia.** In linea con e10 ed e12. Costo: un effetto nei dati + la misura col bot.
- **B · Costo diverso, segnare il patto.** Ad esempio far scattare un rapporto o una variabile per gli episodi dopo. Costo: una variabile nuova (lo schema la supporta? Non verificato) e il suo seguito in stagione 2.
- **C · Lasciarlo gratis.** Costo: l'opzione conviene sempre, e il testo «è un patto» non ha peso.

### 3 · Opzioni senza prezzo: scelte già fatte
In diverse chiamate un'opzione abbassa la pressione senza costare nulla, mentre l'altra la alza e basta.
L'ipotesi è che pressione e tensione siano entrambe da tenere basse (BIBBIA:52 le conta come «prezzo»):
- e11 «allontana i curiosi» −2, contro «comunicato» +2 (M e11:432-444). Il costo dice «la stampa protesta» (T e11:69), ma nei dati non succede nulla.
- e11 «paga il comune» −2 (M e11:668). Il testo dice «il comune paga a malincuore» (T e11:109), ma nei dati non costa nulla.
- e12 «chiedi l'ordine scritto» −1, contro «sgombera» +2 tensione (M e12:802-814).
- e12 «cordone» −2, contro «fidati» +2 (M e12:384-396).
- e12 «chiudi i cancelli» −2 senza costo (M e12:850). Il testo dice «i tifosi chiusi fuori protestano» (T e12:124).
- e12 «chiudi la piazza» −2 senza costo (M e12:170), contro il mediatore che dà lo stesso −2 e costa il mediatore. Il testo dice «il comune chiede perché» (T e12:17).
- **A (consigliata) · Dare il prezzo promesso.** Si aggiunge −1 fiducia dove il testo del costo annuncia una protesta. Costo: circa 5 effetti e la rimisura col bot (gli esiti si spostano).
- **B · Riscrivere i costi come «nessun costo».** I dati restano onesti e le scelte restano facili. Costo: circa 5 righe di testo; gli episodi restano più semplici.
- **C · Lasciare così.** Costo: il testo promette conseguenze che non arrivano.

### 4 · Il furgone grigio in tre episodi di fila, sempre con «annota o ferma»
e10 «blocca / annota» (M e10:807), e11 «ferma / annota» (M e11:594), e12 «annota la ditta / ferma» (M e12:648).
Tutte e tre le risposte finiscono con Malvasi che scrive: «aggiunge una riga alla lista» (T e10:118), «lo scrive in
stampatello» (T e11:103), «scrive il nome della ditta sulla lavagna» (T e12:90). Il filo porta alla ditta dei cartelloni
in e12, e la progressione c'è: in e11 fermarlo dà +1 fiducia, in e12 costa −1 perché «la ditta ha amici in comune».
Se compariva già in e01–e09: e10 rimanda ai parcheggi (T e10:111), il resto è Non verificato.
- **A (consigliata) · Togliere il furgone da e11.** e10 e la rivelazione di e12 bastano. Costo: l'ondata 3 di e11 scende a 2 chiamate (la chiamata è comunque condizionata da `furgone_visto`). L'effetto sugli esiti non è verificato e va rimisurato col bot.
- **B · Tenerlo, ma con un gesto diverso in e11.** Ad esempio una foto o una targa parziale invece di «annota». Costo: riscrivere 2 opzioni.
- **C · Lasciare com'è.** Costo: la stessa scelta tre volte di fila.
