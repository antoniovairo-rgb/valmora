# Scheda di rifinitura e16–e18 (D-135)

Fonti: `data/missioni/e1x.json` (M) e `data/testi/it/e1x.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield (testi e mappa).
Esiti comuni ai tre episodi (M e16:779, e17:779, e18:847): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita). Tre stelle con fiducia ≥ 7 (e18: ≥ 8).
Le chiamate marcate *[se …]* compaiono solo con quella variabile.

---

## e16 · «Il magazzino delle fonderie» (T e16:2)

**Partita:** «Kiln–Pinegrove, i vicini di là dai binari» (T e16:4). Blocco `partita` assente nei dati.
Risultato: Non indicato nei testi. Risorse: 4 squadre, 5 steward, 1 mediatore (M e16:90).

**Trama.** L'informatore indica il magazzino sette: «oggi in partita il furgone grigio porta qualcosa» (T e16:11). Niente mandato:
guardare costa uomini (T e16:4). Il corteo di Kiln passa davanti al magazzino, i pullman del Pinegrove vogliono parcheggiare lì,
tre uomini scaricano scatole. In partita il Fabbro non è in curva, anche se Lavezzari giura di averlo «appena salutato»
(T e16:124); il proprietario del magazzino si lamenta. A fine partita il furgone esce a fari spenti.

**Ondata 1 – La pista**
- Magazzino sette (M e16:137): *una squadra a guardare* → −2 P magazzino, costa una squadra · *auto in borghese* → −2 P magazzino, −1 fiducia · *niente pista* → +1 T magazzino.
- Corteo dalle fonderie (M e16:189): *devia* → −1 P magazzino, +1 P strada Kiln · *lascia il percorso* → +1 fiducia, +2 P magazzino · *mediatore* → −2 P strada Kiln, costa il mediatore.
- [se furgone visto] Foto dal benzinaio (M e16:246): *ingrandisci la targa* → +1 fiducia, nessun costo · *non ora* → nessun effetto.
- Pullman alle fonderie (M e16:278): *va bene* → +1 fiducia, +1 P magazzino · *al piazzale* → +2 P piazzale.

**Ondata 2 – L'ingresso**
- Cancelli (M e16:346): *ingressi separati* → −2 P piazzale, costa uno steward · *tutti insieme* → +1 fiducia, +2 T piazzale.
- Scatole (M e16:386): *entra adesso* → +1 fiducia, +2 T strada Kiln, costa una squadra · *solo osservare* → +1 P magazzino.
- Annunci in rete (M e16:426): *avvisa il club ospite* → +1 P curva ospiti · *oscura gli annunci* → −1 P magazzino, **nessun altro effetto**.

**Ondata 3 – Dov'è il Fabbro?**
- Cori per nome (M e16:484): *speaker* → −1 fiducia, −2 P curva Kiln · *steward* → −2 P curva Kiln, costa uno steward · *lascia correre* → +2 T curva Kiln.
- Lavezzari (M e16:536): *annota il dubbio* → +1 `sospetti_talpa` · *ringrazia* → −1 P curva Kiln.
- Senza il Fabbro (M e16:569): *cercalo alle fonderie* → −2 P magazzino, costa una squadra · *chiedi alla curva* → +2 T curva Kiln.
- Il proprietario (M e16:606): *firma l'ordine* → −1 fiducia, −1 P magazzino · *ritira la sorveglianza* → +1 fiducia, +2 T magazzino.

**Ondata 4 – Il furgone esce**
- Fari spenti (M e16:673): *seguilo* → +2 P strada Kiln · *lascialo andare* → −1 P strada Kiln.
- Ritorno alle fonderie (M e16:705): *scorta* → −2 P strada Kiln, +1 T curva ospiti · *lasciali andare* → +2 P strada Kiln.
- Giro lungo (M e16:741): *giro lungo* → −1 fiducia, −2 P piazzale · *che aspettino* → +2 P piazzale.

**Esiti**
- Contenuto: «Lo stadio ha retto, e il magazzino sette ha un fascicolo suo: targhe, orari, facce. Malvasi lo chiude con un elastico. «Adesso abbiamo un indirizzo.»» (T e16:121)
- A fatica: «La partita è finita senza danni seri. Al magazzino qualcuno ha visto qualcosa, ma non abbastanza. Il furgone è uscito a fari spenti.» (T e16:122)
- Degenerato: «Mentre tutti guardavano le fonderie, lo stadio si è scaldato. O il contrario. I rapporti parlano di cortei, pullman bloccati e di un furgone che nessuno ha fermato.» (T e16:123)

**Malvasi / il vice (scelta)**
- «Coincidenze. Ne ho viste tante. Questa non mi piace.» (T e16:22)
- «Terza volta. Una volta è un caso, due una coincidenza, tre un appuntamento.» (T e16:33)
- «Se non è in curva, è da un'altra parte. Profondo, lo so.» (T e16:83)
- «Il proprietario è una società di un'altra società. Indovina dove finisce la catena. Io un'idea ce l'ho.» (T e16:91)
- «Appena salutato. Nella curva dove il binocolo non lo trova. Interessante.» (T e16:131)

---

## e17 · «La partita a porte chiuse» (T e17:2)

**Partita:** «Kiln–Tramway, stesso giorno» dello sciopero generale (T e17:3), a porte chiuse. Blocco `partita` assente nei dati.
Risultato: c'è un «Gol del Kiln» (T e17:73), il finale della partita Non indicato. Risorse: 5 squadre, 3 steward, 1 mediatore (M e17:89).

**Trama.** Stadio vuoto, autobus fermi, metà steward in sciopero, corteo in piazza del municipio (T e17:3-4). Trecento sciarpe
arrivano a piedi sul piazzale, il servizio d'ordine vuole il risultato sul palco dei comizi, il comitato ha gente sotto casa.
Il Fabbro vuole stare nel corteo e poi chiede di riportare a casa i suoi: «Me lo dovete» (T e17:99). Si festeggia un gol fuori
dallo stadio, lo Skyfield scende dalla collina, tre ragazzi appendono una bandiera nella curva vuota.

**Ondata 1 – Lo stadio vuoto**
- La sanzione (M e17:138): *sgombera* → +1 fiducia, +2 T piazzale · *presidio* → −2 P piazzale, costa una squadra · *tollera* → −1 fiducia, +2 P piazzale.
- Schermo dei comizi (M e17:195): *niente schermo* → +1 fiducia, +2 P piazza del municipio · *lascia lo schermo* → +2 P piazza, −2 P piazzale.
- Sotto casa (M e17:235): *una squadra* → −2 P quartiere, costa una squadra · *prometti* → +1 fiducia, +2 P quartiere.
- [presidente incontrato] Steward dal presidente (M e17:275): *accetta* → +2 steward, −1 fiducia · *declina* → +1 fiducia.

**Ondata 2 – Il corteo parte**
- Cancelli spinti (M e17:342): *steward* → −2 P tornelli, costa uno steward · *apri il recinto* → −3 P tornelli, **nessun altro effetto** · *che spingano* → +2 T tornelli.
- Radio del bar (M e17:390): *volume alto* → −1 fiducia, −1 P piazzale · *abbassa* → +1 fiducia, +2 T piazzale.
- «Ci vediamo dopo» (M e17:430): *una squadra sulla strada di Kiln* → −2 P strada Kiln, costa una squadra · *lascialo parlare* → +1 T strada Kiln.

**Ondata 3 – Gol fuori dallo stadio**
- Gol fuori (M e17:499): *steward ai fumogeni* → −2 P piazzale, costa uno steward · *lascia festeggiare* → +2 P piazzale.
- Dalla collina (M e17:535): *fermali* → −1 fiducia, −2 P quartiere · *mediatore* → +1 fiducia, −1 P quartiere, costa il mediatore · *lasciali passare* → +2 T quartiere.
- Bandiera (M e17:591): *accompagnali fuori* → +1 fiducia, +1 T tornelli · *lasciali in curva* → −1 fiducia, −1 P tornelli.

**Ondata 4 – Dopo il fischio, dopo il corteo**
- «Me lo dovete» (M e17:660): *li riporta lui* → −2 fiducia, −3 P strada Kiln · *ci pensiamo noi* → +1 fiducia, +2 T strada Kiln.
- Le undici (M e17:701): *giro dalla piazza* → −2 P quartiere, +1 T piazza · *aspetta* → +1 T quartiere.
- Fine corteo (M e17:737): *spegni e sciogli* → +1 fiducia, +2 T piazza · *ancora un'ora* → +1 P piazza, −1 P quartiere.

**Esiti**
- Contenuto: «Stadio vuoto, corteo sciolto all'ora prevista, nessun danno. Sciopero e partita nello stesso giorno, nessun incidente. Il servizio d'ordine ringrazia; il comando no, ma è normale.» (T e17:121)
- A fatica: «Spinte ai cancelli, fumogeni sul piazzale, quartiere sveglio fino a tardi. Nessun ferito grave. In rete mescolano corteo e tifosi; Malvasi li separa nel rapporto, riga per riga.» (T e17:122)
- Degenerato: «Tafferugli in città fino a notte fonda, molti fermati. In rete è «la giornata degli scontri», e nessuno ricorda più lo sciopero.» (T e17:123)

**Malvasi / il vice (scelta)**
- «Kiln–Tramway, stesso giorno. L'ha deciso il calendario, non noi.» (T e17:3)
- «Chiudi lo stadio e la gente viene lo stesso, a piedi. Lo stadio era la parte facile.» (T e17:12)
- «Stadio vuoto con gli steward dentro, gente fuori. Il presidente ha fatto i conti prima di noi.» (T e17:37)
- «Il Fabbro vuole stare in mezzo al corteo. Il corteo non lo vuole: il servizio d'ordine me l'ha già detto.» (T e17:64)
- «Il Fabbro che fa il servizio d'ordine. Ne ho viste tante, ma questa le batte.» (T e17:100)

---

## e18 · «Il testimone» (T e18:2)

**Partita:** Skyfield in casa, Lookout ospite (M e18:3-6), «Skyfield–Lookout» (T e18:4). Risultato: Non indicato nei testi.
Risorse: 4 squadre, 6 steward, 1 mediatore (M e18:94).

**Trama.** Un uomo della tipografia sa «chi stampa i doppioni» e parla solo se protetto, dietro la tribuna (T e18:11).
L'informatore lo riconosce: «Lavorava per quelli del furgone» (T e18:39). La curva Skyfield canta contro «chi parla»,
due incappucciati lo cercano, il Fabbro guarda il retro della tribuna dalla tribuna ospiti. Il testimone fa il nome della
tipografia alle fonderie e accenna a «Uno che vuole costruire» (T e18:69). La variabile `testimone` (protetto/esposto) viene
letta in e19 (M e19:334, 621).

**Ondata 1 – La telefonata**
- Telefonata (M e18:148): *due agenti con lui* → −2 P retro tribuna, costa una squadra · *aspetti la fine* → +1 T retro tribuna · *subito al comando* → −3 P retro tribuna, −1 fiducia.
- Biglietti del Lookout (M e18:201): *steward a verificarli* → −2 P curva ospiti, costa uno steward · *fidati* → +1 fiducia, +2 P curva ospiti.
- Corteo dalla collina (M e18:241): *percorso largo* → +2 P strada Skyfield, −1 P curva ospiti · *concedi* → +2 T curva ospiti · *mediatore* → −2 P strada Skyfield, costa il mediatore.
- [se informatore pagato] «Lo conosco» (M e18:293): *raddoppia* → −2 P retro tribuna, costa uno steward · *grazie* → nessun effetto.

**Ondata 2 – Primo tempo**
- «Chi parla» (M e18:354): *steward* → −2 P curva Skyfield, costa uno steward · *speaker* → −1 fiducia, −1 P curva Skyfield · *lascia correre* → +2 T curva Skyfield.
- Fumo (M e18:407): *steward in curva ospiti* → −2 P curva ospiti, costa uno steward · *lascia correre* → +2 P curva ospiti.
- Via fonderie (M e18:443, non compare se il testimone è al comando): *chiedi chi paga* → +1 fiducia, +2 T retro tribuna · *basta così* → −1 P retro tribuna.

**Ondata 3 – Qualcuno lo cerca**
- Cappucci (M e18:506): *identificali* → −3 P retro tribuna, costa una squadra · *in tribuna stampa* → −2 P retro tribuna, −1 fiducia (non compare se è al comando) · *aspetta* → +2 T retro tribuna.
- Etichetta «fonderie» (M e18:559): *sequestra* → +1 fiducia, +2 T piazzale · *lasciali vendere* → +1 P piazzale.
- Il Fabbro in tribuna (M e18:595): *fagli capire* → +1 fiducia, +2 T curva ospiti · *fai finta di niente* → +1 T retro tribuna.

**Ondata 4 – L'uscita del testimone**
- Con o senza di voi (M e18:657; gemella dal comando M e18:702): *auto con scorta* → −3 P retro tribuna, +2 P strada Skyfield, testimone «protetto» · *con la folla / da solo* → +2 P retro tribuna, testimone «esposto».
- Deflusso (M e18:747): *prima il Lookout* → −2 P strada Skyfield, +1 T curva Skyfield · *tutti insieme* → +2 P strada Skyfield.
- «Qualcuno ha parlato» (M e18:783): *conferma* → +2 P retro tribuna, testimone «esposto» (se non protetto) oppure +1 fiducia, +2 P retro tribuna (se protetto) · *nessun commento* → −1 fiducia.

**Esiti**
- Contenuto: «Il testimone ha lasciato un indirizzo: una tipografia alle fonderie. Malvasi lo scrive su un foglio nuovo. «Il primo che parla. Vediamo chi lo ascolta, oltre a noi.»» (T e18:132)
- A fatica: «La partita è passata, il testimone pure, spaventato. Ha detto poco, ma ha detto «tipografia». Malvasi dice che per oggi basta.» (T e18:133)
- Degenerato: «Nella confusione il testimone è sparito, prima di dire tutto. I rapporti parlano di cori, fumo e due uomini col cappuccio che nessuno ha fermato. Nessun ferito, ma nessun nome.» (T e18:134)

**Malvasi / il vice (scelta)**
- «Uno vuole parlare della rete dei biglietti. In cambio vuole protezione.» (T e18:3)
- «Skyfield–Lookout: lui aspetta dietro la tribuna. Ogni uomo che metti con lui è un uomo che manca in curva.» (T e18:4)
- «O è sincero, o è un'esca. Le esche sono sempre sincere, all'inizio.» (T e18:12)
- «Allo stadio le notizie viaggiano più veloci della radio. Soprattutto quelle che non dovrebbero.» (T e18:49)
- «Il primo che parla. Vediamo chi lo ascolta, oltre a noi.» (T e18:132)

---

## Punti da decidere

### 1 · Il presidente dello Skyfield aiuta di nuovo il Kiln (e17)
D-138 (DECISIONI.md:149) tiene il presidente «solo dove il favore pesa» e D-186 (DECISIONI.md:197) lo ha tolto da e11, dove
aiutava Kiln in una notte che non lo riguardava. In e17 la partita è Kiln–Tramway a porte chiuse e il presidente presta due
steward «in cambio, una buona parola sulla sanzione» (T e17:36, M e17:275). Il vice lo nota: «Il presidente ha fatto i conti
prima di noi» (T e17:37). Nella stessa stagione compare già in e14, dove la partita è in casa sua (M e14:570).
- **A (consigliata) · Cambiare chi offre, come in D-138.** Ad esempio Lavezzari (sicurezza del Kiln, come per e08). Effetti identici, nessuna rimisura. Costo: riscrivere 4 righe di testo e la fonte; la chiamata resta legata a `presidente_incontrato` o va slegata (da decidere in esecuzione).
- **B · Togliere la chiamata da e17.** Come D-186 per e11. Costo: l'ondata 1 scende a 3 chiamate; rimisura col bot.
- **C · Lasciare com'è.** Costo: il presidente torna in una partita non sua, contro la linea di D-138 e D-186.

### 2 · Seguire il furgone non conviene mai (e16)
Il furgone grigio è il filo del magazzino: compare in tre chiamate di e16 (M e16:137, 246, 673) e torna in e18 (T e18:39).
Alla chiamata finale, *seguilo* dà solo +2 P (M e16:679), anche se il testo dice «Il comando apprezza» (T e16:102); *lascialo
andare* dà −1 P e nient'altro (M e16:691), anche se il testo dice «Il comando chiede perché» (T e16:105). Seguire il filo
della trama è la scelta peggiore, senza nessun compenso.
- **A (consigliata) · Dare entrambi i prezzi scritti.** *seguilo* +1 fiducia, *lascialo andare* −1 fiducia. Costo: 2 effetti + rimisura col bot.
- **B · Solo il prezzo di «lascialo andare».** −1 fiducia, regola D-186. Costo: 1 effetto; seguire resta senza premio.
- **C · Lasciare così.** Costo: la scelta ovvia è voltarsi dall'altra parte, nell'episodio dedicato al furgone.

### 3 · Prezzi promessi e scelte senza prezzo
La regola di D-186 qui non è ancora applicata:
- e17 *apri il recinto* −3 P e nient'altro (M e17:364), ma «aprire in un giorno di sanzione non piace al comando» (T e17:51); batte lo steward (−2 P e lo consuma).
- e18 *prima il Lookout* −2 P, +1 T (M e18:753): il costo dice «il club di casa protesta e la curva brontola» (T e18:117); la curva brontola (+1 T), la protesta del club non c'è.
- e16 *oscura gli annunci* −1 P e nient'altro (M e16:444), contro *avvisa il club ospite* che dà solo +1 P (M e16:432).
- e16 *ingrandisci la targa* +1 fiducia «Nessun costo» (T e16:35, M e16:257) contro *non ora* che non fa nulla.
- **A (consigliata) · Prezzo promesso alle due prime, riequilibrio alle altre.** −1 fiducia ad *apri il recinto* e *prima il Lookout*; *avvisa il club* con +1 fiducia (il club ringrazia, T e16:65). Costo: 3 effetti + rimisura col bot.
- **B · Solo le due promesse (D-186 stretta).** Costo: 2 effetti; le due coppie di e16 restano scelte ovvie.
- **C · Lasciare così.** Costo: il testo promette conseguenze che non arrivano.

### 4 · Finali che non seguono le scelte (e16, e18)
- e16: il contenuto dice che il magazzino «ha un fascicolo suo: targhe, orari, facce» (T e16:121) anche se non lo si è mai
  guardato (*niente pista* M e16:175, *solo osservare* M e16:412, *ritira la sorveglianza* M e16:629). Gli esiti non hanno `dopo` (M e16:779).
- e18: il contenuto cita «una tipografia alle fonderie» (T e18:132), ma il testimone la nomina solo nella chiamata *via fonderie*
  (T e18:66), che non compare se è stato portato al comando (M e18:443-449). E il degenerato dice «il testimone è sparito»
  (T e18:134) anche quando è partito con la scorta e risulta «protetto» (M e18:664), stato che e19 legge (M e19:334).
- **A (consigliata) · Varianti con `dopo`, come D-158.** e18 su testimone protetto/esposto e sul ramo del comando; e16 su sorveglianza sì/no. Costo: ~4 testi nuovi, esiti con `dopo`, guardiano come tests/finale-e14.test.ts.
- **B · Testi neutri validi in tutti i rami.** Regola D-159. Costo: riscrivere 3 righe; i finali diventano più generici.
- **C · Lasciare com'è.** Costo: finali che raccontano cose che il giocatore non ha visto o ha evitato.
