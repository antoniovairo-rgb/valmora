# Scheda di rifinitura e28–e30 (D-135, D-188)

Fonti: `data/missioni/e2x.json`, `e30.json` (M) e `data/testi/it/e2x.json`, `e30.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield (testi e mappa).
Esiti comuni ai tre episodi (M e28:793, e29:960, e30:755): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita). Terza stella: fiducia ≥ 7.
Le chiamate e le opzioni marcate *[se …]* compaiono solo con quella variabile o scelta precedente.

---

## e28 · «La trappola» (T e28:2)

**Partita:** Kiln in casa, Arches ospite (M e28:3-5); «trasferta vietata agli ospiti» (T e28:4), ma l'Arches arriva in auto (T e28:7).
Risultato: non dichiarato; c'è solo il «Gol dell'Arches» (T e28:91).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e28, blocco `risorse`).

**Trama.** Il comando prepara la cattura del Fabbro e arrivano voci su dove si nasconde (T e28:3-4). Il testimone dice
container al porto (vero), un anonimo dice magazzino delle fonderie (falso) (M e28 briefing). In curva compare
«CHI TOCCA IL CAPO TOCCA TUTTI» (T e28:38). Qualcuno avvisa chi sta al container: «qualcuno, da noi, parla» (T e28:70).
La scelta della pista (`pista_cattura`) decide la chiamata decisiva di e29.

**Ondata 1 – Quattro voci**
- Il carico alle fonderie (M e28:153): *squadra al magazzino* → −1 P magazzino, costa una squadra · *ignora* → nessun effetto (la fonte è falsa, regola D-152).
- Auto dell'Arches (M e28:185): *deviale* → −2 P strada Kiln, costa una squadra · *solo multe* → +1 fiducia, +2 P · *lascia parcheggiare* → +3 P.
- Luce nel container (M e28:237): *auto civetta* → −2 P banchine, costa una squadra · *aspetta conferma* → +2 P banchine.

**Ondata 2 – Primo tempo**
- Striscione per il capo (M e28:299): *steward in curva* → −2 P curva Kiln, costa due steward · *chiedi conto al club* → −1 P (il testo dice «Il club si offende», T e28:44) · *lascialo* → +2 P.
- Due fonti (M e28:348): *pista del porto* → +1 fiducia, +2 P magazzino, `pista_cattura` = porto · *pista della soffiata* → −1 P magazzino, +2 P banchine, = soffiata · *tutte e due* → −1 P banchine, −1 P magazzino, costa una squadra, = nessuna.
- Maxischermo (M e28:420): *accendi* → +2 P piazzale · *schermo spento* → −1 P piazzale (il testo dice «il club ospite si offende», T e28:65).

**Ondata 3 – Secondo tempo**
- La talpa (M e28:478): *cambia frequenza* → −2 P banchine, +2 P curva Kiln · *fingi niente* → +2 P banchine · *avvisa il comando* → −1 fiducia, +1 P banchine, −1 P magazzino.
- Il cronista (M e28:535): *smentisci* → nessun effetto (il testo dice «il cronista se la lega al dito», T e28:83) · *nessun commento* → +2 P curva Kiln · *lascia intendere* → +2 P banchine.
- Gol dell'Arches (M e28:574): *mediatore in curva* → −2 P curva Kiln, costa il mediatore · *cordone* → −1 P curva, −1 P piazzale, costa una squadra, +1 P banchine · *lasciale cantare* → +1 P curva, +1 P piazzale.

**Ondata 4 – L'uscita**
- Corteo «per il capo» (M e28:664): *bloccalo* → −2 P strada Kiln, costa una squadra, +1 T curva Kiln · *mediatore* → −1 P, costa il mediatore · *verso il porto* → +1 P strada, +2 P banchine.
- Rapporto con le fonti (M e28:725): *nomi compresi* → +2 P banchine · *senza nomi* → nessun effetto (il testo dice «il comando non gradisce», T e28:119).
- Ospiti chiusi (M e28:751): *escono per primi* → −2 P piazzale, +1 P strada Kiln · *escono dopo* → +1 fiducia, +2 P piazzale.

**Esiti**
- Contenuto: «Partita finita, curve a casa, una pista sul tavolo del comando. Il messaggio anonimo mentiva. Malvasi ha scritto chi poteva sapere della sorveglianza. Per ora lo tiene per sé.» (T e28:128)
- A fatica: «La sera ha retto a fatica: troppe voci, un porto spento troppo presto. Domani il comando decide. Malvasi: «Una trappola funziona se la prepara uno solo».» (T e28:129)
- Degenerato: «La trappola è scattata dalla parte sbagliata: la città fuori controllo, e al porto non c'era più nessuno. Qualcuno ha avvisato in tempo.» (T e28:130)

**Malvasi / il vice (scelta)**
- «Kiln–Arches, trasferta vietata agli ospiti. Arriveranno quattro voci sul Fabbro: scommetto che almeno due mentono.» (T e28:4)
- «Venite in tanti. Chi ti scrive così vuole sapere quanti siamo, non dove andare.» (T e28:12)
- «Tranquilla, diceva Lavezzari. Sanno già qualcosa. La domanda è chi glielo ha detto.» (T e28:39)
- «Avvisati. Allora qualcuno, da noi, parla. Lo sapevamo. Stasera lo sappiamo un po' di più.» (T e28:70)
- «Verso il porto. Allora lo sanno anche loro. Vanno a proteggerlo o a dargli tempo di andarsene?» (T e28:104)

---

## e29 · «La cattura» (T e29:2)

**Partita:** «Kiln–Stoneway» (T e29:4); il campo `partita` manca nei dati (facoltativo, D-130).
Risultato: non dichiarato. La cattura è fissa: il Fabbro viene preso con ogni scelta sulla pista della soffiata (T e29:150, 153, 156) e in tutti e tre i verbali (T e29:135-137), come vuole BIBBIA:10.
Risorse: 4 squadre, 6 steward, 1 mediatore (M e29, blocco `risorse`). Con `rapporto_dessi` = ostile si aggiunge un evento sulla strada di Kiln (M e29, ondata 4).

**Trama.** Mentre si gioca, il comando va a prendere il Fabbro al porto; a te tocca la città intorno (T e29:3).
In rete girano foto vecchie, «il capo torna in curva»; la curva riceve la notizia prima di te (T e29:57).
La chiamata dell'operazione cambia secondo la pista scelta in e28. Il Fabbro viene preso: la curva vuole
«riprenderselo» e scende verso il porto, e il comando ti vuole in prima fila alla conferenza stampa.

**Ondata 1 – Una sera normale**
- Foto vecchie (M e29:147): *smentita* → +1 fiducia, +2 P piazzale · *squadra* → −2 P, costa una squadra · *silenzio* → +1 P.
- Lontano dal porto (M e29:200): *rispetta l'ordine* → +1 fiducia, +2 P banchine · *auto in borghese* → −2 P, costa una squadra, −1 fiducia.
- Voce in pullman (M e29:244): *rassicura* → −1 P curva ospiti, −1 fiducia (fonte vera, D-169) · *steward* → −2 P, costa due steward · *nessuna risposta* → +2 P.
- [informatore pagato] Barca col telone blu (M e29:296): *passa la soffiata* → −3 P banchine, senza costo · *tienila* → nessun effetto.

**Ondata 2 – Primo tempo**
- [furgone visto] Furgone al porto (M e29:354): *segnalalo* → −3 P banchine, senza costo · *non ora* → nessun effetto.
- Il tamburo si ferma (M e29:386): *chiudi le uscite* → +2 T curva Kiln, −1 P strada Kiln · *mediatore* → −2 P curva, costa il mediatore · *lasciali uscire* → +2 P strada Kiln.
- Annuncio di Lavezzari (M e29:439): *generico* → +2 P curva Kiln · *niente annuncio* → nessun effetto (il testo dice «Il club si sente escluso», T e29:73).

**Ondata 3 – Il via al porto**
- [pista nessuna] Operazione (M e29:492): *mandane due* → +1 fiducia, costa due squadre, −2 P banchine · *una* → costa una squadra, −1 P · *nessuna* → −2 fiducia, +2 P.
- [pista porto] Porto circondato (M e29:556): *una ai cancelli* → costa una squadra, −2 P, +1 fiducia · *nessuna* → −1 fiducia, +1 P.
- [pista soffiata] Fonderie vuote (M e29:605): *due* → costa due squadre, −2 P, +1 fiducia · *una* → costa una squadra, −1 P, −1 fiducia · *nessuna* → −2 fiducia, +3 P.
- Il video in curva (M e29:674): *sospendi la partita* → −3 P curva Kiln, senza costo (il testo dice «lo Stoneway e la tv protestano», T e29:89) · *cordone di steward* → −2 P, costa due steward · *continua* → +2 P.
- Ospiti spaventati (M e29:722): *via scortati* → −2 P curva ospiti, costa una squadra, +1 P piazzale · *restano* → +1 fiducia, +2 P curva ospiti.

**Ondata 4 – La notte**
- Corteo al porto (M e29:802): *fermali* → −2 P strada Kiln, costa una squadra, +1 T curva · *mediatore* → −1 P, costa il mediatore · *lasciali scendere* → +1 P strada, +2 P banchine · [Fabbro «rispetto»] *parola del Fabbro* → −3 P strada Kiln, **nessun altro effetto** (M e29:861).
- Conferenza stampa (M e29:879): *prima fila* → +2 T curva Kiln · *in fondo* → nessun effetto (il testo dice «il comando nota l'assenza», T e29:123).
- Ultimi al piazzale (M e29:906): *luci* → −2 P, −1 fiducia · *squadra* → −2 P, costa una squadra · *aspetta* → +2 P.

**Esiti**
- Contenuto: «Tano Ferrigno, il Fabbro, è stato preso al porto senza feriti, mentre lo stadio teneva. La curva ha urlato, ma non è uscita. Malvasi: «Questa non l'avrei scommessa».» (T e29:135)
- A fatica: «Il Fabbro è stato preso; la città se n'è accorta subito. Una notte di cortei e cancelli che i rapporti chiamano «gestita». Malvasi la chiama «sopravvissuta».» (T e29:136)
- Degenerato: «Al porto l'operazione è riuscita; intorno, la città no. Domani si parlerà della notte, non della cattura.» (T e29:137)

**Malvasi / il vice (scelta)**
- «Malvasi tiene il caffè in mano e non lo beve. «Stanotte il comando va a prendere il Fabbro. A noi tocca la città intorno.»» (T e29:3)
- «L'hai pagato due anni fa, e continua a restituire.» (T e29:40)
- «Il furgone dei biglietti. Tutti i fili, prima o poi, finiscono allo stesso parcheggio.» (T e29:50)
- «Ecco. Lo sanno. Più presto di quanto pensassi, meno presto di quanto temessi.» (T e29:58)
- «Non lo riprendono. Lo sanno anche loro. Vogliono solo che si sappia che ci hanno provato.» (T e29:107)

---

## e30 · «Il giorno dopo» (T e30:2)

**Partita:** nessuna. «Il Fabbro è dentro. Kiln–Studio è rinviata. La curva no.» (T e30:3)
Risorse: **6 squadre**, 6 steward, 1 mediatore (M e30, blocco `risorse`).

**Trama.** Le due metà della curva sfilano insieme in silenzio dallo stadio al municipio, dietro uno striscione
bianco: «IL GIORNO DOPO» (T e30:4, 39). Sono duemila e non qualche centinaio come aveva detto Lavezzari (T e30:6, 11).
Sui muri del quartiere compare il nome del Fabbro accanto al tuo. Sotto il municipio il silenzio si rompe in un coro.
La notte finisce con una fiaccolata verso il porto e con una lettera della curva che chiede un incontro senza telecamere.

**Ondata 1 – Il raduno**
- Duemila in silenzio (M e30:143): *squadra in coda* → −2 P piazzale, costa una squadra · *mediatore* → −1 P, costa il mediatore · *percorso ridotto* → +1 fiducia, +2 T piazzale.
- Scritte sui muri (M e30:200): *presidio* → −2 P quartiere, costa una squadra · *cancellale* → +1 fiducia, +2 P quartiere.
- Autobus (M e30:240): *devia* → −2 P viale stazione, costa una squadra · *viale aperto* → +1 fiducia, +2 P.

**Ondata 2 – Il silenzio in cammino**
- «IL GIORNO DOPO» (M e30:308): *rispetta il silenzio* → +2 P strada Kiln · *steward ai lati* → −2 P, costa due steward, −1 fiducia · *parla il club* → −1 P, **nessun altro effetto** (il testo dice «il club ti chiede un favore», T e30:48).
- Clacson (M e30:361): *corsia alle auto* → −2 P viale, senza costo (il testo dice «il corteo si stringe e protesta», T e30:52) · *auto ferme* → +2 T strada Kiln.
- Troupe (M e30:393): *ai margini* → −2 P piazza municipio, −1 fiducia · *lasciale* → +1 fiducia, +2 P.

**Ondata 3 – Poi parleremo noi**
- Coro sotto il municipio (M e30:460): *mediatore* → −2 P, costa il mediatore · *identifica i capi* → +2 P · *nessuna sanzione* → −1 P (il testo dice «Il comando non gradisce», T e30:75).
- Scritte davanti alla scuola (M e30:509): *squadra* → −2 P quartiere, costa una squadra · *domattina* → +2 P.
- Saluto dello Skyfield (M e30:545): *devia la coda* → −2 P strada Kiln, costa una squadra, +1 P quartiere · *percorso fermo* → +2 P strada.

**Ondata 4 – La notte della curva**
- Fiaccolata (M e30:613): *scortata* → −2 P strada Kiln, costa una squadra · *vietala* → +2 T · *lasciala* → +1 P strada, +1 P piazzale.
- Lettera della curva, via Lavezzari (M e30:665): *accetta l'incontro* → −1 P piazzale, −1 P strada Kiln, **nessun altro effetto** (il testo dice «il comando non gradisce», T e30:106) · *rifiuta* → +2 T piazzale.
- Piazzale (M e30:701): *steward* → −2 P, costa due steward · *chiudi i bar* → −1 P, −1 fiducia · *aspetta* → +2 P.

**Esiti**
- Contenuto: «La curva ha attraversato la città e ha parlato a modo suo; la città ha ascoltato senza farsi male. Malvasi appende la foto di «IL GIORNO DOPO» accanto a quella del porto.» (T e30:121)
- A fatica: «Un corteo grande il doppio, clacson, cori sotto il municipio, muri da ripulire. Ha tenuto, a fatica. Domani la curva vuole parlarti. Malvasi: «Porta l'ombrello».» (T e30:122)
- Degenerato: «La curva ha parlato e la città ha risposto male: una notte di disordini, rapporti fino all'alba.» (T e30:123)

**Malvasi / il vice (scelta)**
- «Corteo dallo stadio al municipio, le due metà della curva insieme. È un diritto: va protetto per tutti. Scommetto sulla prima mezz'ora.» (T e30:4)
- «Un corteo piccolo, diceva Lavezzari. Piccolo come una città.» (T e30:12)
- «Il silenzio non si può sanzionare. L'hanno capito prima di noi.» (T e30:40)
- «Sei famoso. Te l'avevo detto che questo lavoro dava visibilità.» (T e30:67)
- «Un incontro senza telecamere con la curva del Fabbro, il giorno dopo. Io ci andrei. Con un vice. Ah, già.» (T e30:104)

---

## Punti da decidere

### 1 · Lavezzari in cinque episodi su sei, fonte falsa tre volte di fila
Lavezzari (la talpa, smascherata in e33: BIBBIA:90) parla in e25 (T e25:29), e27 (T e27:7, 41, 94), e28 (T e28:8, 45),
e29 (T e29:8, 68, 74) ed e30 (T e30:6, 103). Nei briefing di e28, e29 ed e30 la sua informazione è sempre falsa
(`vera: false` nei briefing di M e28, e29, e30). Due volte usa la stessa formula: «Garantisco io» (T e28:8; T e29:8).
Due volte il vice lo smentisce con la stessa frase: «Tranquilla, diceva Lavezzari» (T e28:39), «Un corteo piccolo,
diceva Lavezzari» (T e30:12). *Ipotesi:* tre falsità di fila mostrano la talpa prima di e33. Se questo sia voluto
come semina: Non verificato (D-100 elenca `sospetti_talpa` per e01, e16, e19, e23 → e33, non e28–e30).
- **A (consigliata) · Togliere il briefing falso da e29.** Al suo posto un'altra fonte del club o un'informazione vera di Lavezzari; e28 ed e30 restano. Costo: 1 briefing riscritto (fonte o testo), rimisura delle fonti.
- **B · Tenerlo, ma variare le frasi.** Niente secondo «Garantisco io» e niente secondo «diceva Lavezzari». Costo: 2 righe di testo; la catena di falsità resta.
- **C · Lasciare com'è.** Costo: la talpa si legge facilmente prima della rivelazione.

### 2 · Patti gratis: il Fabbro, il club, la curva
- e29 *parola del Fabbro* (con rapporto «rispetto»): −3 P strada Kiln, e il costo dice «Ti rispetta: la strada si calma, senza costi» (M e29:861; T e29:158). D-186 ha appena deciso che il patto col Fabbro costa −1 fiducia (e10–e12).
- e30 *parla il club*: −1 P senza costo, ma «il club ti chiede un favore» e l'ex giocatore «ti guarda come chi presenterà il conto» (M e30:347; T e30:48-49). Il conto non arriva mai nei dati.
- e30 *accetta l'incontro* proposto da Lavezzari: −1 P su due settori senza costo, «il comando non gradisce» (M e30:671; T e30:106).
- **A (consigliata) · −1 fiducia a tutti e tre.** In linea con D-186. Costo: 3 effetti e la rimisura col bot.
- **B · Solo il Fabbro.** Il favore del club e l'incontro restano gratis, magari con un seguito in e31+ (variabile nuova? Non verificato se lo schema la supporta). Costo: 1 effetto.
- **C · Lasciare gratis.** Costo: tre opzioni che conviene sempre scegliere, e il «senza costi» del Fabbro va contro D-186.

### 3 · Costi promessi che i dati non danno, e opzioni ovviamente migliori
Come in e11–e12 (D-186: «dove il testo promette una protesta o un costo si dà il prezzo promesso»):
- e28 *chiedi conto al club* −1, «Il club si offende» (M e28:322; T e28:44); *schermo spento* −1 contro +2 (M e28:438; T e28:65); *smentisci* senza effetti contro +2/+2, «il cronista se la lega al dito» (M e28:541; T e28:83); *senza nomi* senza effetti contro +2, «il comando non gradisce» (M e28:742; T e28:119).
- e29 *sospendi la partita* −3 gratis contro *cordone* −2 che costa due steward (M e29:680, 692; T e29:89); *niente annuncio* senza effetti contro +2 (M e29:457); *in fondo alla sala* senza effetti contro +2 T, «il comando nota l'assenza» (M e29:897; T e29:123).
- e30 *corsia alle auto* −2 gratis contro +2 T (M e30:367; T e30:52); *nessuna sanzione* −1, «Il comando non gradisce» (M e30:495; T e30:75).
- Premi di scelte precedenti, −3 senza costo contro nessun effetto: e29 *passa la soffiata* (M e29:307) e *segnala il furgone* (M e29:365). Il furgone grigio torna qui come fine del filo («Tutti i fili, prima o poi, finiscono allo stesso parcheggio», T e29:50); D-186 l'aveva tolto da e11.
Una parte può venire dalla neutralizzazione di D-160, col testo del costo rimasto com'era; quali opzioni precisamente: Non verificato.
- **A (consigliata) · −1 fiducia dove il testo promette una protesta.** Circa 8 opzioni; i premi della soffiata e del furgone restano gratis, perché si pagano con la scelta fatta prima. Costo: circa 8 effetti e la rimisura col bot (curva D-154, fiducia D-160).
- **B · Riscrivere i costi come «nessun costo».** Costo: circa 8 righe di testo; *sospendi la partita* e *corsia alle auto* restano le scelte ovvie.
- **C · Lasciare così.** Costo: promesse senza conseguenza, contro la regola data in e11–e12.

### 4 · Il finale di e29 smentisce le scelte possibili
Il verbale contenuto dice «La curva ha urlato, ma non è uscita» (T e29:135). Due opzioni però la fanno uscire:
*lasciali uscire* («Escono a gruppi. In strada si chiamano per nome», M e29:425; T e29:67) e *lasciali scendere*
verso il porto («Arrivano ai cancelli», M e29:845; T e29:116). L'esito dipende solo da tensione e fiducia (M e29:960),
quindi è raggiungibile anche con quelle scelte; quanto spesso: Non verificato col bot.
- **A (consigliata) · Testo neutro.** Per esempio «La curva ha urlato, ma la città ha tenuto». Costo: 1 riga.
- **B · Variante secondo la scelta.** Verbale in due versioni con `dopo` (come D-153). Costo: 1 verbale in più e il guardiano D-153 da estendere.
- **C · Lasciare com'è.** Costo: un finale che contraddice ciò che il giocatore ha appena visto.

**Note minori (non da decidere):** stessa risposta in due episodi, «… canta contro i cancelli, poi contro di te»
(T e25:84; T e29:61). L'introduzione di e28 annuncia «quattro voci sul Fabbro» (T e28:4); nell'ondata 1 le chiamate
sono tre (M e28:153, 185, 237). Quali siano le quattro voci: Non verificato.
