# Scheda di rifinitura e31–e33 (D-135)

Fonti: `data/missioni/e3x.json` (M) e `data/testi/it/e3x.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield, `railhead_county` = Railhead,
`mossgarth_town` = Arches (testi e mappa).
Esiti comuni ai tre episodi (M e31:888, e32:781, e33:750): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita). Tre stelle con fiducia ≥ 7
(e33: ≥ 8).
Le chiamate e le opzioni marcate *[se …]* compaiono solo con quella variabile o dopo quella scelta.

---

## e31 · «Il fascicolo» (T e31:2)

**Partita:** Skyfield–Railhead, Tullio Varrone in tribuna, la curva Skyfield diserta (T e31:4; M e31:3-6).
Risultato: il Railhead «Ha perso» (T e31:104).
Risorse: 5 squadre, 6 steward, 1 mediatore (M e31:94-122).

**Trama.** Malvasi apre la cartella grigia: biglietti, furgone, conti delle fonderie, «una firma: Varrone & Figli»
(T e31:3). Il Railhead arriva con due treni, il viale è «chiuso per lavori» che non esistono (T e31:11).
Varrone chiede un saluto informale, arriva un'offerta anonima («Incarico confermato a tempo pieno, per una cartella
grigia», T e31:79), la segreteria vuole «visionare» il fascicolo. A mezzanotte si decide a chi darlo (T e31:124).

**Ondata 1 – Due treni**
- Viale «in lavori» (M e31:153): *scorta* → −2 P viale, costa una squadra · *mediatore* → −1 P viale, costa il mediatore · *chiedi alla segreteria* → +2 P viale, −1 P stazione, −1 fiducia.
- Il comando vuole l'indice (M e31:214): *consegnalo subito* → +2 P tribuna, costa uno steward · *prima una copia* → **nessun effetto**.
- Secondo treno (M e31:245): *trattienili* → −1 P viale, +2 T stazione · *squadra in stazione* → −2 P stazione, costa una squadra · *lasciali andare* → +1 P stazione, +1 P viale.

**Ondata 2 – Primo tempo**
- Varrone saluta (M e31:327): *vai* → +1 fiducia, +2 P piazzale · *manda Malvasi* → −1 P tribuna · *resta al tuo posto* → +2 P tribuna.
- Coreografia contro lo stadio nuovo (M e31:376): *steward alle uscite* → −2 P piazzale, costa due steward · *chiedi di ridurla* → +1 fiducia, +2 T piazzale.
- Cori del Railhead verso la tribuna (M e31:416): *lasciali* → +2 P curva ospiti, −1 fiducia · *ferma il coro* → +1 fiducia, +2 T e +1 P curva ospiti · *chiedi al responsabile* → −2 P curva ospiti, −2 fiducia.

**Ondata 3 – L'intervallo lungo**
- Il cronista (M e31:512): *conferma* → −2 P piazzale · *niente stampa* → +2 P piazzale.
- Offerta anonima (M e31:545): *ignora* → +2 P tribuna · *inoltra al comando* → +1 fiducia, −1 P tribuna, costa due steward · [se busta tenuta] *foto della busta* (M e31:584) → −2 P tribuna · [se busta consegnata] *giralo al comando* (M e31:600) → +1 fiducia, −1 P tribuna.
- Railhead al bar della stazione (M e31:622): *una squadra* → −2 P stazione, costa una squadra · *lascia stare* → +2 P stazione.

**Ondata 4 – Mezzanotte**
- La segreteria vuole «visionare» (M e31:684): *rifiuta* → **nessun effetto** · *solo l'indice* → +2 P tribuna · [se testimone protetto] *il testimone ha firmato* (M e31:710) → +1 fiducia.
- Corteo di ritorno (M e31:728): *scorta* → −2 P viale, costa una squadra · *percorso lungo* → −2 P viale, +2 P stazione · *lascia* → +2 P viale.
- Ultimo treno (M e31:780): *fallo trattenere* → −2 P stazione · *parte all'orario* → +2 P stazione.
- A chi il fascicolo (M e31:812): *procura* → costa una squadra, +1 P stazione, `fascicolo=procura` · *giornale* → solo `fascicolo=stampa` · *comando* → +1 fiducia, +2 P tribuna, `fascicolo=comando` · *lo tieni tu* → solo `fascicolo=nessuno`.

**Esiti**
- Contenuto: «Partita finita, ospiti ripartiti, e il fascicolo su Varrone & Figli ha preso la sua strada. Malvasi: «Se sparisce adesso, almeno sappiamo dove cercare».» (T e31:121)
- A fatica: «Una sera lunga, fra treni, cori e offerte. Il fascicolo è salvo, la città un po' meno. Malvasi dice che ogni pagina pesa un'ora di sonno.» (T e31:122)
- Degenerato: «Mentre pensavi al fascicolo, la città ha pensato ad altro: disordini fino a notte. Domani si parlerà di quelli. A qualcuno conviene.» (T e31:123)

**Malvasi / il vice (scelta)**
- «Lavori annunciati e mai iniziati. Da queste parti è un genere letterario.» (T e31:12)
- «Niente di formale. Sono le parole più formali che esistano.» (T e31:42)
- «Un'offerta per te. Io in dieci anni non ne ho mai ricevuta una. Sono quasi offeso.» (T e31:80)
- «Per conoscenza. La conoscenza, in comune, ha sempre un indirizzo di consegna.» (T e31:97)
- «Ognuno ha un prezzo. Io scelgo sempre quello che si paga subito.» (T e31:125)

---

## e32 · «Il derby della città» (T e32:2)

**Partita:** il quinto derby Kiln–Skyfield, «Senza il Fabbro» (T e32:3-4). Il file non ha il blocco `partita`.
Risultato: **non fissato**; il rigore Skyfield all'80' (T e32:68) «va dentro» solo nella risposta di
*nessun intervento* (T e32:77). Risorse: 5 squadre, 6 steward, 1 mediatore (M e32:90-115).

**Trama.** Malvasi rimette sul tavolo la cartina del primo giorno con «le stesse cinque crocette» (T e32:3).
Due cortei, Kiln dalle fonderie e Skyfield dalla collina; Lavezzari presenta il nuovo portavoce della curva Kiln
(T e32:6, 22). In curva Skyfield uno striscione sul «capo arrestato» (T e32:38); alla fine il comando vuole
«una curva, un nome» per il rapporto (T e32:116).

**Ondata 1 – Due cortei**
- Due cortei (M e32:142): *aspetta Skyfield* → −2 P strada Skyfield · *aspetta Kiln* → −2 P strada Kiln, costa una squadra · *mediatore all'incrocio* → −1 P su entrambe le strade, costa il mediatore.
- Il portavoce (M e32:199): *accetta, steward lontani* → +1 fiducia, +2 P curva Kiln · *nessun accordo* → −1 fiducia, +1 T curva Kiln.
- «Appuntamento al piazzale» (M e32:239; voce falsa, M e32:41): *presidia* → −2 P piazzale, costa una squadra · *ignora* → nessun effetto.

**Ondata 2 – Primo tempo**
- Striscione sul capo arrestato (M e32:296): *rimuovi* → −2 P curva Kiln, +2 T curva Skyfield · *lascialo* → +3 P curva Kiln · *speaker* → −1 P su entrambe le curve, −1 fiducia.
- Fumogeni in curva Kiln (M e32:352): *steward* → −2 P, costa due steward · *pausa all'arbitro* → **−3 P, nessun costo** · *lascia correre* → +1 fiducia, +2 P curva Kiln.
- Skyfield senza biglietto sul piazzale (M e32:405): *allontanali* → −2 P piazzale, +1 P strada Skyfield · *lasciali* → +2 P piazzale.

**Ondata 3 – Secondo tempo**
- Rigore Skyfield (M e32:467): *barriera* → −2 P curva Kiln, costa una squadra · *cerca il portavoce* → −1 P curva Kiln, +2 P piazzale · *nessun intervento* → +2 P curva Kiln.
- Uscita «a festa» (M e32:519): *trattieni Skyfield* → +2 T curva Skyfield, −1 P piazzale · *uscita scortata in collina* → −2 P curva Skyfield, costa una squadra.
- Curve chiuse mezz'ora? (M e32:559): *chiudi* → +2 fiducia, +1 T su entrambe le curve · *uscite normali* → −1 fiducia, +1 P strada Kiln.

**Ondata 4 – Dopo il fischio**
- [se non scortata la festa in collina] Incrocio (M e32:629): *cordone* → −3 P piazzale, +1 P strada Kiln, costa una squadra · *spegni le luci* → −2 P piazzale · *lascia ai portavoce* → +2 P piazzale.
- Kiln sale in collina (M e32:683): *blocca* → −2 P strada Skyfield, costa una squadra · *steward* → −1 P, costa due steward · *lasciali* → +2 P strada Skyfield.
- Chi ha cominciato (M e32:735): *Kiln* → +1 fiducia, +2 P strada Kiln · *Skyfield* → +2 P strada Skyfield · *nessun nome* → nessun effetto.

**Esiti**
- Contenuto: «Il derby più teso della triade è finito sul campo, e solo lì. Le curve se ne sono andate senza incrociarsi. Malvasi cancella le cinque crocette e ne disegna una sola.» (T e32:126)
- A fatica: «Un derby tenuto per i capelli: un incrocio sfiorato, una collina, le vetrate. «Nessun ferito grave», dicono i rapporti. Malvasi: «Il titolo della mia autobiografia».» (T e32:127)
- Degenerato: «Il derby è uscito dallo stadio. I rapporti parlano di una notte di sirene. Domani il comando vorrà sapere perché il quinto derby è andato peggio del primo.» (T e32:128)

**Malvasi / il vice (scelta)**
- «Senza il Fabbro, Kiln ha qualcosa da dimostrare e Skyfield qualcosa da rispondere. La scommessa stasera vale doppio.» (T e32:4)
- «Venti minuti. Il primo derby ne avevi quaranta. Si migliora.» (T e32:12)
- «Non sono mai i suoi. È la frase che i portavoce imparano per prima.» (T e32:49)
- «Decidi tu ma decidi bene. È la frase con cui il comando scarica le responsabilità da trent'anni.» (T e32:86)
- «Il primo giorno era lo stesso incrocio. Allora sapevi poco. Adesso sai troppo, e non serve a niente.» (T e32:96)

---

## e33 · «La talpa» (T e33:2)

**Partita:** Skyfield–Arches (T e33:4). Il file non ha il blocco `partita`. Risultato: gol dell'Arches (T e33:74),
«Hanno vinto» (T e33:101). Risorse: 5 squadre, 6 steward, 1 mediatore (M e33:91-118).

**Trama.** «Al porto qualcuno sapeva della sorveglianza»: ordini diversi per ogni unità per stanare la talpa
(T e33:3-4). Biglietti falsi ai tornelli contro il messaggio anonimo, un'auto al parcheggio vuoto, il cambio di
frequenza. Nel secondo tempo il nome: «Gianni Lavezzari. Il più gentile di tutti» (T e33:66); a fine partita
chiede un'auto del club per uscire dal retro (T e33:93).

**Ondata 1 – Ordini diversi**
- Ordini segnati (M e33:145): *ordini segnati* → costa una squadra · *ordini normali* → nessun effetto · [se sospetti_talpa ≥ 2] *solo a Lavezzari* (M e33:170) → +1 fiducia.
- Arches in anticipo (M e33:188): *squadra* → −2 P stazione, costa una squadra · *trattienili* → −1 P viale, +2 T stazione · *lasciali* → +2 P viale.
- Biglietti falsi (M e33:240): *respingili* → +1 fiducia, +2 T tornelli · *steward* → −2 P tornelli, costa due steward · *chiudi un occhio* → **−2 P tornelli, nessun costo**.

**Ondata 2 – Primo tempo**
- [dopo «ordini segnati», fiducia ≥ 5] Parcheggio vuoto (M e33:319): *fai seguire* → +2 P viale · *annota la targa* → nessun effetto.
- Fumo in curva ospiti (M e33:352): *steward* → −2 P curva ospiti, **nessun costo** · *lascia* → +2 P curva ospiti, +1 P curva Skyfield.
- Cambio di frequenza (M e33:388): *ora* → +2 P curva Skyfield · *all'intervallo* → nessun effetto.

**Ondata 3 – Il nome**
- Il nome (M e33:441): *rapporto subito* → +2 P curva Skyfield · *aspetta la fine* → nessun effetto · [se busta tenuta] *apri la busta* (M e33:466) → +2 fiducia.
- Gol dell'Arches (M e33:484): *mediatore* → −2 P curva Skyfield, costa il mediatore · *squadra* → −1 P, costa una squadra · *lascia sfogare* → +2 P.
- Festa degli ospiti (M e33:536): *in curva* → −1 P viale, +2 T curva ospiti · *breve sul viale* → −2 P curva ospiti, +1 P viale, costa una squadra.

**Ondata 4 – Il treno di mezzanotte**
- Lavezzari scappa (M e33:606): *trattienilo* → +1 fiducia, +1 P stazione, costa una squadra · *lascialo, lo si segue* → −1 fiducia · [se busta consegnata] *lo ferma il comando* (M e33:644) → +1 fiducia.
- Corteo di ritorno (M e33:662): *scorta* → −2 P viale, costa una squadra · *chiudi il viale* → −2 P viale, +2 P stazione · *lascia* → +2 P viale.
- Treno di mezzanotte (M e33:714): *trattieni* → −2 P stazione · *parte* → +2 P stazione.

**Esiti**
- Contenuto: «Gianni Lavezzari, sicurezza del Kiln, era la talpa: il suo nome è in un rapporto firmato con Malvasi. La partita è finita senza danni. «Speravo di sbagliarmi.»» (T e33:118)
- A fatica: «Lavezzari è smascherato, ma la sera ha retto a fatica. Il comando dice che il rapporto è «solido». Malvasi: «Anche il muro».» (T e33:119)
- Degenerato: «Il nome di Lavezzari è venuto fuori mentre la città scappava di mano. Il rapporto finirà in fondo a una pila.» (T e33:120)

**Malvasi / il vice (scelta)**
- «Il trucco è vecchio. Le talpe sono più vecchie del trucco.» (T e33:12)
- «Chi scrive messaggi anonimi sui biglietti falsi di solito li conosce da vicino.» (T e33:30)
- «Qualcuno ha ascoltato l'ordine finto e ha mandato a vedere. Adesso abbiamo una targa. Le targhe parlano.» (T e33:43)
- «Il corteo del primo giorno, ricordi? Ti disse che non c'era. Lo scrivo: le cose scritte non spariscono.» (T e33:67)
- «Un'auto del club, per scappare. Cordiale fino in fondo.» (T e33:94)

---

## Punti da decidere

### 1 · e31 ed e33 sono quasi lo stesso episodio: treno, viale, treno di mezzanotte
Tre chiamate di e33 ripetono e31 con gli stessi effetti e a volte con lo stesso costo scritto:
- arrivo in treno: e31 *trattieni / squadra / lascia* (M e31:245) ed e33 (M e33:188) hanno le prime due opzioni identiche; «Il viale respira; la stazione si scalda.» c'è in tutti e due (T e31:31, T e33:24);
- corteo di ritorno sul viale: *scorta / percorso lungo-laterale / lascia* con −2 squadra, −2 +2 stazione, +2 (M e31:728, M e33:662);
- ultimo treno: «Fallo trattenere / Parte all'orario», −2 contro +2 (M e31:780, M e33:714); il costo «Nessun costo subito; chi resta a terra fa salire la stazione.» è identico (T e31:119, T e33:116).
In e31 manca anche la curva Skyfield come settore (diserta, T e31:4): la partita la vivono solo ospiti e stazione, come in e33.
- **A (consigliata) · Cambiare il treno di e33.** In e33 il finale diventa un'altra scena (ad esempio la talpa in fuga che usa il treno). Costo: riscrivere 2 chiamate di e33 (M e33:662, 714) e rimisurare col bot.
- **B · Togliere l'ultimo treno da e31.** e31 resta sul fascicolo, l'ondata 4 scende a 3 chiamate. Costo: 1 chiamata in meno; l'effetto sugli esiti va rimisurato.
- **C · Lasciare com'è.** Costo: due episodi su tre con la stessa serata di stazione.

### 2 · Il fascicolo al giornale: «il comando non te lo perdona», ma nei dati è gratis
*Al giornale* (M e31:838) imposta solo `fascicolo=stampa`; il costo dice «il comando non te lo perdona» (T e31:130).
Le altre strade costano o rendono: procura una squadra e +1 P stazione (M e31:818), comando +1 fiducia e +2 P tribuna
(M e31:850). Il conto promesso torna nel finale («Il conto lo paghi tu», T e36:140) ma in e34 ed e36 le varianti
del fascicolo hanno effetti identici fra loro (M e34:571-690, M e36:543-686): nessuna lo applica.
- **A (consigliata) · −1 fiducia subito in e31.** In linea con D-186 («si dà il prezzo promesso»). Costo: un effetto e la rimisura col bot (tocca anche le soglie del finale).
- **B · Il conto in e34.** La variante «stampa» della commissione (M e34:611) costa 1 fiducia in più. Costo: un effetto in e34; il giocatore lo paga due episodi dopo.
- **C · Lasciarlo gratis e riscrivere il costo.** Costo: il giornale resta la scelta più comoda e il «conto» di e36 è solo testo.

### 3 · Costi promessi che i dati non applicano (stesso caso di D-186)
Il testo annuncia una protesta o un rimprovero, l'effetto non c'è; spesso l'opzione diventa la migliore:
- e31 *prima una copia* (M e31:236): «il comando aspetta e non gradisce» (T e31:27), contro *consegna* che costa uno steward e +2 P;
- e31 *manda Malvasi* (M e31:350): «in comune la prendono come uno sgarbo» (T e31:47), ma dà −1 P;
- e31 *conferma al cronista* (M e31:519): «il comando non gradisce» (T e31:74);
- e32 *aspetta Skyfield* (M e32:149): «la collina se la prende» (T e32:14), contro Kiln che costa una squadra;
- e32 *spegni le luci* (M e32:657): «in comune giudicano la mossa rischiosa» (T e32:101);
- e32 *nessun nome* (M e32:768): «il comando voleva un nome» (T e32:124);
- e33 *steward in curva ospiti* (M e33:358): «il club ospite protesta» (T e33:52);
- e33 *trattieni il treno* (M e33:720): «le ferrovie non gradiscono» (T e33:113).
Opzioni gratis e migliori senza nemmeno un costo scritto: e32 *pausa all'arbitro* −3 (M e32:375) contro gli steward −2 che costano due steward; e33 *chiudi un occhio* −2 (M e33:279) contro gli steward −2 che costano due steward, coi biglietti falsi che entrano senza conseguenze.
- **A (consigliata) · −1 fiducia dove il testo lo promette.** Come D-186 per e10–e12; per *pausa* e *chiudi un occhio* un costo scritto e applicato. Costo: circa 10 effetti, 2 righe di testo e la rimisura col bot.
- **B · Riscrivere i costi come «nessun costo».** Costo: circa 8 righe; le scelte restano facili.
- **C · Lasciare così.** Costo: contraddice D-186, appena decisa su e10–e12.

### 4 · La talpa si scopre comunque, anche senza trappola
*Ordini normali* risponde «La talpa resta dov'è» (T e33:18), ma il nome arriva lo stesso: la chiamata «Ordini, turni di
stasera, frequenza: un nome solo» (T e33:66, M e33:441) non ha condizioni. Anche le mosse contro la talpa non costano
il ritardo che promettono: *cambia all'intervallo* («la talpa sente un altro tempo intero», T e33:62) e *aspetta la fine*
(«la talpa ha un'ora in più», T e33:72) sono senza effetti (M e33:406, 459), mentre le alternative danno +2 P.
- **A (consigliata) · Il nome arriva solo con una prova.** «Il nome» compare dopo *ordini segnati*, *solo a Lavezzari* o con la busta tenuta; altrimenti una chiamata diversa (sospetto senza prova). Costo: una condizione, una chiamata nuova e la rimisura; va verificato che gli esiti (T e33:118-120, sempre «smascherato») reggano.
- **B · Dare un prezzo all'attesa.** −1 fiducia su *cambia all'intervallo* e *aspetta la fine*. Costo: 2 effetti; la trappola resta facoltativa.
- **C · Lasciare com'è.** Costo: la trappola del titolo non serve, e la talpa esce comunque.
