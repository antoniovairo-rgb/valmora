# Scheda di rifinitura e34–e36 (D-135)

Fonti: `data/missioni/e3x.json` (M) e `data/testi/it/e3x.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield, `lookout_fc` = Lookout (testi e mappa).
Esiti di e34 ed e35 (M e34:862, e35:796): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3; **a fatica** se
tensione massima ≤ 6; altrimenti **degenerato**. Gli esiti di e36 sono a parte (sotto).
Fiducia a inizio episodio: risale almeno a 3 (`fiduciaMinima`, src/logica/missione.ts:62-66; D-105, D-110).
Le chiamate marcate *[se …]* compaiono solo con quella variabile o dopo quella scelta.

---

## e34 · «L'interim scade» (T e34:2)

**Partita:** Kiln–Lookout, con la commissione del comando in tribuna (T e34:3-4). Il file non ha il blocco `partita`.
Risultato: gol del Lookout (T e34:74), «abbiamo vinto» (T e34:101). Risorse: 5 squadre, 6 steward, 1 mediatore (M e34:91-118).

**Trama.** «Oggi scade il tuo interim»: «Tre interim prima di te, nessuno ha passato questo giorno» (T e34:3-4).
Il mercato del sabato non è stato spostato, i pullman del Lookout sono il doppio, la curva Kiln canta il tuo nome,
la commissione chiede a bassa voce dov'è il fascicolo (T e34:84) e alla fine vuole uscire a piedi «per sentire la città».

**Ondata 1 – La commissione**
- Mercato non spostato (M e34:145): *sposta le bancarelle* → −2 P piazzale, −1 fiducia · *squadra* → −2 P, costa una squadra · *lascia* → +2 P.
- Schieramento a voce (M e34:198): *sali a spiegare* → +1 fiducia, +2 P parcheggi · *per iscritto* → −1 fiducia.
- Pullman doppi (M e34:234): *parcheggio del mercato* → −2 P parcheggi, +1 P piazzale · *squadra* → −2 P parcheggi, costa una squadra.
- [se fiducia ≥ 7] Steward dalla commissione (M e34:274): *accetta* → +2 steward · *declina* → nessun effetto.

**Ondata 2 – Primo tempo**
- Coro sul tuo nome (M e34:332): *fai finta di niente* → nessun effetto · *fai smettere* → +2 T curva Kiln.
- Ospiti alla balaustra (M e34:360): *steward* → −2 P curva ospiti, costa due steward · *apri un settore* → −2 P curva ospiti, +2 P tribuna · *non toccare* → +2 P curva ospiti.
- [se fiducia ≤ 3] Osservatore in sala (M e34:412): *accoglilo* → +1 fiducia, +2 P tribuna · *lavora da solo* → −1 fiducia.

**Ondata 3 – Secondo tempo**
- Gol del Lookout (M e34:479): *mediatore* → −2 P curva Kiln, costa il mediatore · *squadra in tribuna* → +2 P curva Kiln, costa una squadra · *lascia* → +2 P curva Kiln.
- Il fascicolo, quattro varianti secondo `fascicolo` (M e34:531 nessuno, 571 procura, 611 stampa, 651 comando): in tutte *difendi/rispondi* → +2 fiducia, +2 P tribuna · *glissa/non rispondere* → −1 fiducia.
- Il mercato chiude (M e34:691): *steward* → −2 P piazzale, costa due steward · *chiudi il piazzale* → −2 P piazzale, +2 P parcheggi.

**Ondata 4 – Il verdetto**
- Pullman bloccati (M e34:757): *libera con una squadra* → −2 P parcheggi, costa una squadra · *aspettano* → +1 fiducia, +2 P parcheggi.
- La commissione esce a piedi (M e34:797): *accompagnala* → +2 P piazzale · *uscita laterale* → nessun effetto.
- [se il piazzale non è stato chiuso] Ultimo coro (M e34:825): *ricambia* → −2 P piazzale · *impassibile* → +2 P piazzale.

**Esiti**
- Contenuto: «La commissione se n'è andata in silenzio: è così che dice le cose buone. Partita in ordine. Malvasi ripone la camicia. «La rimetto per la conferma. O per il funerale.»» (T e34:123)
- A fatica: «La giornata ha retto, con qualche crepa che la commissione ha visto tutta. Domani decidono. Malvasi: «Si decide bene anche guardando le crepe».» (T e34:124)
- Degenerato: «La commissione ha visto il peggio: una sera fuori controllo, dentro e fuori dallo stadio. La decisione sembra già scritta. Malvasi, per una volta, non scommette.» (T e34:125)

**Malvasi / il vice (scelta)**
- «Il comune sposta i mercati sulla carta. È più comodo.» (T e34:12)
- «La fiducia si spende, ma ogni tanto rende. Questo è uno di quei giorni.» (T e34:37)
- «Ti salutano. Il che, per la commissione, è peggio di un insulto. Vuol dire che vi conoscete.» (T e34:47)
- «Un osservatore accanto. È il modo gentile di dirti che hanno già un nome per il dopo.» (T e34:65)
- «Ecco il conto della prima pagina. Lo pagavi adesso o mai.» (T e34:135)

---

## e35 · «La notte lunga» (T e35:2)

**Partita:** nessuna. Rapina in banca sul corso alle sette; all'una il comando entra «al porto, alle fonderie e al
cantiere della Varrone & Figli» (T e35:3-4). Risorse: 6 squadre, 4 steward, 1 mediatore (M e35:88-119).

**Trama.** La trattativa è del comando, a te il perimetro, il corso bloccato, i familiari. Il testimone segnala una
barca che carica scatoloni (T e35:22), negli uffici del cantiere si lavora alle dieci (T e35:48), alle cinque un uomo
con la valigia cerca il binario (T e35:105). All'alba il comando: «la rapina copriva le carte del cantiere» (T e35:121).

**Ondata 1 – Le sette di sera**
- Il perimetro (M e35:146): *squadra* → −2 P perimetro, costa una squadra · *rinforzi dal porto* → +1 fiducia, +2 P banchine · *aspetta* → +2 P perimetro.
- La barca (M e35:199): *blocca il pontile* → −2 P banchine, costa una squadra · *falla seguire* → +1 fiducia, +2 P banchine.
- Corso chiuso (M e35:239): *steward* → −2 P corso, costa due steward · *annuncio alle radio* → −1 P corso · *lascia la coda* → +2 P corso.

**Ondata 2 – Le dieci**
- Le dirette (M e35:293): *allarga il perimetro* → −2 P perimetro, costa una squadra · *punto stampa* → +2 P perimetro.
- Cantiere acceso (M e35:349): *squadra al cantiere* → −2 P cantiere, +1 P perimetro, costa una squadra · *anticipa l'ingresso* → +1 fiducia, +1 P cantiere.
- I familiari (M e35:394): *mediatore* → −2 P corso, costa il mediatore · *steward* → −2 P corso, costa due steward · *al comando* → +2 P corso.

**Ondata 3 – L'una**
- Posto prenotato sul treno (M e35:473): *presidia* → −2 P stazione, costa una squadra · *ferrovie avvisano* → −1 P stazione · *ignora* → +2 P stazione.
- Curiosi all'una (M e35:521): *mediatore* → −1 P perimetro, costa il mediatore · *lasciali guardare* → +2 P perimetro · *sgombera* → −2 P perimetro, +2 P corso.
- [dopo *falla seguire*] Barca tornata vuota (M e35:573): *cerca lungo la costa* → −2 P banchine, costa una squadra · *ferma l'equipaggio* → +2 P banchine.
- [dopo *blocca il pontile*] Barca ormeggiata (M e35:610): *apri gli scatoloni* → −2 P banchine, costa una squadra · *identifica l'equipaggio* → +1 fiducia, +2 P banchine.

**Ondata 4 – L'alba**
- Uomo con la valigia (M e35:677): *fermalo* → +1 P perimetro, costa una squadra · *lascialo partire* → −1 P stazione.
- Fine della trattativa (M e35:714): *corridoio* → −2 P perimetro, costa due steward · *stampa all'uscita* → +2 T perimetro.
- Il rapporto (M e35:751): *il nome, intero* → −1 fiducia, +2 P cantiere · *«un imprenditore»* → +1 fiducia, +2 P corso.

**Esiti**
- Contenuto: «Una rapina, tre ingressi, nessuna città svegliata male. Ostaggi a casa, corso riaperto all'alba, e carte che portano tutte alla Varrone & Figli. Malvasi scrive sul fascicolo: «Fine».» (T e35:129)
- A fatica: «Una notte lunga davvero: nastro, corso bloccato, stazione, porto. Ostaggi fuori tutti; le carte, quasi tutte. Malvasi: «Quasi è la nostra parola».» (T e35:130)
- Degenerato: «La notte ci è scappata di mano. Gli ostaggi stanno bene. La rapina ha fatto il suo lavoro.» (T e35:131)

**Malvasi / il vice (scelta)**
- «Il perimetro è la parte del lavoro che nessuno vede, finché qualcuno non ci entra.» (T e35:12)
- «Nessuno lavora alle dieci in un cantiere. Tranne chi fa sparire il lavoro degli altri mentre tutti guardano altrove.» (T e35:49)
- «Tullio Varrone non prende treni. Ma chi lavora per lui sì.» (T e35:106)
- «Tutti fuori, tutti in piedi. È la frase più bella che sentirai stanotte. Adesso facciamo in modo che resti vera fino a casa.» (T e35:114)
- «Il nome lo sappiamo tutti. Scriverlo è un'altra faccenda. Io, a questo punto, lo scriverei. Ma io non ho niente da perdere.» (T e35:122)

---

## e36 · «Resa dei conti» (T e36:2)

**Partita:** Kiln–Skyfield nello stadio vecchio, davanti al cantiere sequestrato (T e36:4). Il file non ha il blocco
`partita`. Risultato: gol del Kiln all'80' (T e36:69), «Skyfield battuti» (T e36:97). Risorse: 5 squadre, 6 steward, 1 mediatore (M e36:90-120).

**Trama.** Malvasi posa la busta della scommessa, «Aperta al tuo primo derby, si chiude stasera all'ultimo» (T e36:3).
Le due curve cantano insieme al cantiere, un palco non autorizzato sul piazzale, il messaggio del Fabbro dal carcere
che non esiste (T e36:49), la frase per il comando su Varrone, e a mezzanotte la busta (T e36:115).

**Ondata 1 – Lo stadio vecchio**
- Cantiere in festa (M e36:147): *squadra ai cancelli* → −2 P cantiere, costa una squadra · *un cartellone* → +2 P cantiere, +1 P piazzale · *lasciali cantare* → +2 P cantiere.
- Coreografia dalla collina (M e36:200): *scorta* → −2 P strada Skyfield, costa una squadra · *mediatore* → −1 P, costa il mediatore · *strada libera* → +1 fiducia, +2 P.
- Palco non autorizzato (M e36:256): *smonta* → +1 fiducia, +2 T piazzale · *lascialo* → −1 fiducia, −1 P piazzale.

**Ondata 2 – Primo tempo**
- «LO STADIO È NOSTRO» (M e36:322): *lascia fare* → +1 P su entrambe le curve · *steward* → −2 P curva Skyfield, costa due steward.
- Messaggio dal carcere (M e36:363): *il portavoce smentisce* → −2 P curva Kiln · *lascia che aspettino* → +2 P curva Kiln.
- [se il palco non è stato smontato] Piazzale pieno (M e36:396): *squadra* → −2 P, costa una squadra · *chiudi gli accessi* → −2 P piazzale, +2 P cantiere · *lascia entrare tutti* → +1 fiducia, +2 P piazzale.

**Ondata 3 – Secondo tempo**
- Gol del Kiln (M e36:479): *mediatore* → −1 P su entrambe le curve, costa il mediatore · *barriera* → −2 P curva Kiln, costa una squadra · *è il loro momento* → +2 P curva Kiln, +1 P curva Skyfield, −1 fiducia.
- La frase su Varrone, quattro varianti secondo `fascicolo` (M e36:543, 579, 615, 651): in tutte *frase dura* → −1 P curva Kiln · *frase neutra* → +2 P piazzale.
- Muri del cantiere (M e36:687): *steward* → −2 P cantiere, costa due steward · *lascia scrivere* → +2 P cantiere.

**Ondata 4 – Mezzanotte**
- Ritorno in collina (M e36:750): *scorta* → −2 P strada Skyfield, costa una squadra · *separa i gruppi* → −2 P strada, +2 T curva Kiln · *lasciali insieme* → +2 P strada.
- Festa fino a mezzanotte (M e36:802): *chiudi* → +1 fiducia, +1 P piazzale · *mezz'ora in più* → −1 fiducia, −2 P piazzale.
- La busta (M e36:843): *aprila adesso* → +2 P cantiere · *dopo l'ultimo giro* → −2 P cantiere, costa una squadra.

**Esiti** (M e36:883-1140): tutti con tensione massima ≤ 6, divisi per `fascicolo`. **Confermato** con fiducia ≥ 6,
**ancora ad interim** con fiducia ≥ 3, **sostituito** altrimenti; oltre 6 di tensione **degenerato**.
- Confermato (fascicolo tenuto): «Varrone & Figli sotto inchiesta, ma solo per le carte della rapina: il resto del fascicolo dorme in cassaforte. Il comando ti conferma. Malvasi paga un anno di caffè. «Metà verità, posto intero.»» (T e36:130)
- Ancora ad interim (fascicolo tenuto): «Varrone & Figli sotto inchiesta per la rapina, non per il resto: il fascicolo è ancora in cassaforte. Il comando non decide: ancora ad interim. Malvasi paga lo stesso. «Hai durato più di tutti.»» (T e36:131)
- Sostituito (fascicolo tenuto): «Varrone & Figli sotto inchiesta, ma a metà: il fascicolo resta in cassaforte, e il resto con lui. La fiducia è finita, il comando nomina un altro. Malvasi paga al bar: «Hai perso il posto, non la scommessa».» (T e36:132)
- Degenerato: «L'ultimo derby è finito come il primo rischiava di finire: fuori controllo. La busta resta chiusa. «La apriamo la prossima volta.»» (T e36:123)
- Le varianti procura/stampa/comando: T e36:133-141 (es. «Il conto lo paghi tu: fiducia finita, il comando nomina un altro», T e36:140).

**Malvasi / il vice (scelta)**
- «Un cartellone come ricordo. Io mi prenderei il guardiano.» (T e36:12)
- «Due curve che si applaudono. Ho visto cose strane in questo lavoro. Questa le batte tutte.» (T e36:42)
- «Una frase. La migliore che hai detto in tre stagioni era «non ora». Ripetila.» (T e36:80)
- «Il guardiano che non vedeva niente adesso vede tutto. Il sequestro fa bene alla vista.» (T e36:88)
- «Tre interim, tre buste. Le prime due non le ho mai aperte davanti a nessuno.» (T e36:116)

---

## Punti da decidere

### 1 · La busta della scommessa contraddice due dei finali
*Aprila adesso* (M e36:849) arriva prima dell'esito e risponde sempre: «Dentro c'è scritto, del primo giorno: «Non dura».
Malvasi la strappa. «Ho perso. Pago io.»» (T e36:119). Ma:
- con **sostituito** il protagonista non è durato, quindi la scommessa «Non dura» l'ha vinta Malvasi; il verbale dice invece «Hai perso il posto, non la scommessa» (T e36:132, 139-141);
- con **degenerato** il verbale dice «La busta resta chiusa» (T e36:123), anche se l'hai appena aperta e strappata.
D-165/D-167 chiudono il finale con la scommessa al bar («Doppio o niente sulla prossima?»): la busta è il filo che lo porta.
- **A (consigliata) · Rivelare la busta nel verbale.** La risposta di *aprila adesso* non dice il contenuto («Malvasi la tiene chiusa ancora un minuto»); ogni verbale svela «Non dura» con la sua battuta (confermato/ad interim: Malvasi perde; sostituito: vince e paga lo stesso). Costo: 1 risposta e 13 verbali da ritoccare.
- **B · Correggere solo le due frasi in contrasto.** Sostituito: «Hai vinto tu la scommessa? No: l'ho vinta io. Pago lo stesso»; degenerato senza «resta chiusa». Costo: 5 righe di testo.
- **C · Lasciare com'è.** Costo: due finali su tre smentiscono la battuta appena letta.

### 2 · La carriera la decide la festa di e36, non i fili di e31–e35
A inizio episodio la fiducia risale ad almeno 3 (src/logica/missione.ts:62-66), e «ancora ad interim» chiede fiducia ≥ 3
(M e36:967). Quindi **sostituito** si raggiunge solo perdendo fiducia dentro e36 (FATTO dai dati e dal codice; quanto
spesso succede: Non verificato, va misurato col bot). Le opzioni di e36 che muovono la fiducia sono tutte della festa:
−1 *lascia il palco*, *è il loro momento*, *mezz'ora in più* (M e36:278, 521, 825); +1 *strada libera*, *smonta*,
*lascia entrare*, *chiudi la festa* (M e36:238, 262, 435, 809). Nessuna lega fascicolo, talpa, testimone o busta alla
fiducia: le quattro varianti della frase su Varrone hanno effetti identici (M e36:543-686). Così «La fiducia è finita»
(T e36:132) può voler dire «mezz'ora di festa in più». Anche la variante «comando» dice «fascicolo in procura stamattina»
(T e36:128) qualunque cosa si sia risposto in e34 (*«Decide il comando»*, T e34:147).
- **A (consigliata) · Far pesare i fili sulla fiducia di e36.** Le quattro varianti della frase su Varrone smettono di essere uguali (es. stampa −1 col conto promesso, procura +1), e una chiamata legge `sospetti_talpa` o `testimone`. Costo: 4-6 effetti, una condizione e la rimisura delle tre carriere col bot.
- **B · Spostare le soglie.** «Ad interim» con fiducia ≥ 4 o 5, così si arriva a «sostituito» anche con la fiducia portata da e34. Costo: 4 soglie nei dati (M e36:967-1050) e la rimisura; i fili restano muti.
- **C · Lasciare com'è.** Costo: la carriera dipende da una sola serata, e l'epilogo (D-161) mette accanto scelte che non hanno pesato.

### 3 · e35 non lascia fili: fermare l'uomo di Varrone è la scelta peggiore
In e35 nessuna opzione imposta una variabile (nessun `imposta`/`aggiungi` di storia nel file): barca bloccata o lasciata
partire, scatoloni trovati o no, l'uomo con i faldoni fermato o no, il finale dice sempre «carte trovate dopo la rapina,
portano alla Varrone & Figli» (T e36:79). Nei numeri conviene lasciar scappare: *fermalo* costa una squadra e +1 P
(M e35:684) anche se il testo dice «Il comando apprezza» (T e35:108); *lascialo partire* dà −1 P (M e35:700) anche se
promette «se lo perdi, il comando non perdona» (T e35:111). Lo stesso per *ferma l'equipaggio*: «Il comando apprezza»
(T e35:94), nei dati solo +2 P (M e35:596).
- **A (consigliata) · Una variabile «carte» letta da e36.** e35 imposta `carte` (salvate/perse) da barca, scatoloni e uomo; e36 cambia la chiamata del comando e il verbale secondo `carte`. Costo: una variabile nuova nello schema, 2-4 testi, e il filo va aggiunto all'epilogo (src/logica/epilogo.ts:11).
- **B · Solo i prezzi promessi.** *Fermalo* e *ferma l'equipaggio* +1 fiducia, *lascialo partire* −1 fiducia. Costo: 3 effetti e la rimisura; e35 resta senza seguito.
- **C · Lasciare com'è.** Costo: la notte della rapina non cambia niente, e lasciare scappare i faldoni conviene.

### 4 · La frase su Varrone: in e35 costa, in e36 conviene; e altri costi promessi assenti
In e35 *il nome, intero* costa −1 fiducia (M e35:758, «Il comando teme le querele», T e35:124). In e36 la *frase dura*
promette lo stesso («il comando teme le querele», T e36:82) ma dà solo −1 P, contro +2 P della neutra: domina in tutte e
quattro le varianti (M e36:549, 589, 625, 661). Altri costi scritti e non applicati: e34 *fai finta di niente* («la
commissione si fa domande», T e34:49; M e34:339), *uscita laterale* («la commissione si sente portata via», T e34:114;
M e34:816); e36 *il portavoce smentisce* («ti chiede un favore», T e36:52; M e36:370), un favore gratis. E in e34 gli
steward della commissione (M e34:274) sono gratis, mentre il vice dice «La fiducia si spende» (T e34:37).
- **A (consigliata) · Prezzo promesso, come D-186.** *Frase dura* −1 fiducia (come in e35), −1 fiducia sui costi scritti, il favore del portavoce −1 fiducia. Costo: circa 8 effetti (4 sono le copie della frase) e la rimisura; tocca le soglie del punto 2.
- **B · Togliere la contraddizione col testo.** In e36 la frase dura «piace al comando, ora che c'è il sequestro»: resta gratis, cambia la riga del costo. Costo: 1 riga (T e36:82, condivisa dalle 4 varianti) + 3 righe per gli altri costi.
- **C · Lasciare com'è.** Costo: la stessa frase costa in e35 e conviene in e36.
