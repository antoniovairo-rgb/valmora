# Scheda di rifinitura e19–e21 (D-135)

Fonti: `data/missioni/e1x.json` / `e2x.json` (M) e `data/testi/it/eNN.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield, `ollerbrook` = Studio (T e19:4).
Esiti comuni ai tre episodi (M e19:858, e20:814, e21:769): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita).
Le chiamate marcate *[se …]* compaiono solo con quella variabile.

---

## e19 · «La retata mancata» (T e19:2)

**Partita:** «Kiln–Studio, fonderie a dieci minuti» (T e19:4). Nessun risultato dichiarato nei testi (grep su gol/risultato: nessuna riga).
Risorse: 5 squadre, 5 steward, 1 mediatore (M e19, blocco `risorse`).

**Trama.** Il comando entra nel magazzino sette durante la partita e vuole le tue squadre (T e19:3, 11).
La curva parte un'ora prima, alle fonderie «lo sanno già. Da ieri sera» (T e19:40); il magazzino è «vuoto, pulito» (T e19:50).
In curva compare «MAGAZZINO VUOTO», Lavezzari dice di averlo saputo «dalla radio» (T e19:127), Malvasi fa la lista di chi sapeva (T e19:85).

**Ondata 1 – La vigilia**
- Il piano (M e19:143): *due squadre* → −2 P magazzino, costa due squadre · *una squadra* → −1 P magazzino, costa una squadra · *rimanda* → −2 fiducia.
- Un'ora prima (M e19:196): *scorta* → −2 P strada Kiln, costa una squadra · *mediatore* → −2 P strada Kiln, costa il mediatore · *lasciali andare* → +1 fiducia, +2 P strada Kiln.
- Fretta ai tornelli (M e19:253): *steward ai controlli* → −2 P tornelli, costa uno steward · *lascia entrare* → −1 P tornelli, −1 fiducia.
- [se informatore pagato] Lo sanno (M e19:293): *avvisa il comando* → −2 P magazzino, −1 fiducia · *tienilo per te* → nessun effetto.
- [se testimone protetto] Il testimone (M e19:329): *riferiscilo* → +1 fiducia, −1 P magazzino · *tienilo per te* → nessun effetto.

**Ondata 2 – L'ora X**
- Vuoto (M e19:391): *perquisite fino in fondo* → +1 fiducia, +1 T strada Kiln · *una squadra in più allo stadio* → +1 squadra, −1 fiducia.
- Striscione «MAGAZZINO VUOTO» (M e19:432): *fallo rimuovere* → +1 fiducia, +2 T curva Kiln · *steward sotto* → −2 P curva Kiln, costa uno steward · *lascialo* → −1 fiducia.
- Lavezzari «dalla radio» (M e19:485): *annota il dubbio* → +1 `sospetti_talpa` · *accetta il suo aiuto* → −1 P curva Kiln.
- Ridono (M e19:518): *calmali* → −1 P curva Kiln, +1 T curva ospiti · *lasciali ridere* → +1 T curva Kiln.

**Ondata 3 – Lo sanno tutti**
- Titolo in rete (M e19:580): *ammetti* → +1 fiducia, +2 T curva Kiln · *nessun commento* → −1 fiducia.
- [se testimone esposto] Il tipografo (M e19:616): *sotto protezione* → −1 fiducia, −1 P curva Kiln · *nessun commento* → +1 T curva Kiln.
- Chi sapeva? (M e19:657): *lista dei nomi* → nessun effetto · *chiedi al comando* → −1 fiducia.
- Festa davanti al magazzino (M e19:685): *blocca l'uscita* → −2 P strada Kiln, −1 fiducia · *lasciali uscire* → +2 P strada Kiln.

**Ondata 4 – Chi ha parlato?**
- Canto al magazzino (M e19:747): *presidia* → −2 P magazzino, +1 P strada Kiln · *lasciali cantare* → +2 P magazzino.
- Pullman dello Studio (M e19:783): *giro lungo* → −2 P curva ospiti, −1 fiducia · *trattienili* → −1 P strada Kiln, +2 T curva ospiti.
- Qualcuno in comune (M e19:823): *ringrazia* → +1 fiducia · *chiedi chi l'ha informato* → −1 fiducia.

**Esiti**
- Contenuto: «La retata è andata a vuoto, lo stadio no. Malvasi chiude in un cassetto una lista corta. «Chi sapeva, lo sappiamo. Chi ha parlato, no. Giochiamo a indovinare.»» (T e19:124)
- A fatica: «Magazzino vuoto, striscioni ironici, una serata lunga. Nessun danno grave, ma tutta la città sa che qualcuno ha avvisato la curva.» (T e19:125)
- Degenerato: «Retata fallita e stadio fuori controllo: la curva ha festeggiato fino a notte davanti al magazzino vuoto. I rapporti parlano di cortei e di una brutta figura che il comando non dimenticherà.» (T e19:126)

**Malvasi / il vice (scelta)**
- «Una retata il giorno della partita. Chi l'ha pensata non è mai stato allo stadio. O ci è stato troppo.» (T e19:12)
- «Un'ora prima. Come chi sa che più tardi certe strade saranno chiuse.» (T e19:23)
- «Da ieri sera. Il piano l'abbiamo scritto ieri pomeriggio.» (T e19:41)
- «Pulito. Qualcuno ha passato lo straccio pensando a noi.» (T e19:51)
- «Una talpa. Non lo dico ad alta voce: qui le pareti hanno il vizio di ascoltare.» (T e19:86)

---

## e20 · «La fuga» (T e20:2)

**Partita:** «Derby» (T e20:3), curve Kiln e Skyfield (M e20, blocco `settori`). Risultato: «Lo Skyfield ha vinto» (T e20:116).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e20, blocco `risorse`).

**Trama.** Il Fabbro guida il corteo «a viso scoperto» e saluta le telecamere (T e20:11); in curva ha «una borsa da viaggio» (T e20:36).
Nel primo tempo i fumogeni arancioni coprono la curva (T e20:45) e il comando lo perde (T e20:76); un'auto scura parte
a fari spenti «verso il mare» (T e20:97, 100). Di notte la curva senza capo crede che «l'avete preso voi» (T e20:109).

**Ondata 1 – Il derby**
- Viso scoperto (M e20:152): *scorta* → −2 P strada Kiln, costa una squadra · *mediatore* → −2 P strada Kiln, costa il mediatore · *lasciali sfilare* → +2 P strada Kiln · [Fabbro «rispetto»] *chiedi al Fabbro* (M e20:203) → −2 P strada Kiln, **nessun altro effetto**.
- Vederli passare (M e20:221): *entrata un'ora prima* → −2 P strada Skyfield, +1 T curva Skyfield · *quando vogliono* → +2 P strada Skyfield.
- Ogni minuto (M e20:257): *agente a vista* → costa una squadra, **nessun altro effetto** · *solo telecamere* → nessun effetto.
- [se informatore pagato] Borsa da viaggio (M e20:284): *steward sulla borsa* → +1 fiducia, costa uno steward · *grazie* → nessun effetto.

**Ondata 2 – Primo tempo**
- Fumo arancio (M e20:345): *steward in curva* → −2 P curva Kiln, costa uno steward · *pausa all'arbitro* → −3 P curva Kiln, **nessun altro effetto** · *lascia correre* → +2 P curva Kiln.
- Coro sulla retata (M e20:394): *steward in curva Skyfield* → −2 P, costa uno steward · *speaker* → −1 P, −1 fiducia · *lascia correre* → +2 T curva Skyfield.
- [presidente incontrato] All'intervallo (M e20:446): *accetta* → −3 P curva Skyfield, −1 fiducia · *declina* → +1 fiducia.

**Ondata 3 – Il Fabbro non c'è più**
- Sparito (M e20:513): *cerca dappertutto* → +1 T curva Kiln, costa una squadra · *chiudi le uscite* → −1 fiducia, +2 T curva Kiln · *prima il derby* → −1 P curva Kiln.
- Senza guida (M e20:566): *steward fra i gruppi* → −2 P, costa uno steward · *parla coi vecchi* → −2 P, −1 fiducia · *si arrangino* → +2 T curva Kiln.
- Fari spenti (M e20:618): *inseguila* → +1 fiducia, +2 P strada Kiln · *posto di blocco* → −1 P strada Kiln, costa una squadra · *annota* → −1 fiducia.

**Ondata 4 – La notte**
- «L'avete preso voi» (M e20:696): *comunicato* → −2 P strada Kiln, −1 fiducia · *nessuna dichiarazione* → +2 P strada Kiln.
- Festa Skyfield (M e20:732): *su per la collina* → −2 P strada Skyfield, +1 T curva Skyfield · *lasciali festeggiare* → +1 fiducia, +2 P strada Skyfield.
- Sotto gli occhi (M e20:772): *conferma* → +1 fiducia, +2 P piazzale · *smentisci* → −2 fiducia, −1 P piazzale.

**Esiti**
- Contenuto: «Il derby è finito senza danni; Tano Ferrigno è finito chissà dove. Malvasi appende la sua foto con un punto interrogativo. «Adesso è latitante. Prima era solo antipatico.»» (T e20:130)
- A fatica: «Il derby ha retto a fatica. Tano Ferrigno no: è sparito. Lo cercano la curva e il comando. Malvasi dice che almeno su questo sono d'accordo tutti.» (T e20:131)
- Degenerato: «Derby degenerato, Tano Ferrigno sparito nel fumo, cortei senza guida e una notte lunghissima. La città cerca un colpevole. Lo trova in sala operativa.» (T e20:132)

**Malvasi / il vice (scelta)**
- «Il Fabbro guida il corteo e si fa vedere tanto. Quando uno come lui si fa guardare, è perché guardiamo dalla parte sbagliata.» (T e20:4)
- «Chi saluta così le telecamere, di solito, sta preparando un'uscita di scena.» (T e20:12)
- «Non si vede più nessuno. Neanche lui.» (T e20:46)
- «Un giorno. Il giorno arriva sempre, coi presidenti.» (T e20:67)
- «Sparito durante un derby, davanti a ventimila persone. Bisogna riconoscergli lo stile.» (T e20:77)

---

## e21 · «Senza capo» (T e21:2)

**Partita:** Kiln contro Pinegrove (M e21:3), «Pinegrove in coppa» (T e21:3). Nessun risultato dichiarato nei testi (Non verificato altrove).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e21, blocco `risorse`).

**Trama.** Senza il Fabbro la curva si spacca: i vecchi allo stadio, i giovani all'ex fonderia col centro sociale, di cui il comune
ha annunciato lo sgombero (T e21:3-4). Un ragazzo si proclama «nuovo capo» in rete (T e21:22), vecchi e giovani si tirano
bottigliette (T e21:45), gira la voce «stanotte sgomberano» (T e21:73). La piazza obbedisce a «un telefono» (T e21:115).

**Ondata 1 – Dall'ex fonderia**
- Corteo dal cortile (M e21:146): *partono dalla strada* → +1 fiducia, +2 T ex fonderia · *squadra al cancello* → −2 P ex fonderia, costa una squadra · *mediatore* → −1 P ex fonderia, −1 P piazza fonderie, costa il mediatore.
- Nuovo capo (M e21:207): *ignoralo* → +2 P piazza fonderie · *convocalo* → −2 P piazza, −1 fiducia.
- Si va a vedere lo sgombero (M e21:243): *steward nel quartiere* → −2 P quartiere, costa uno steward · *smentisci* → +1 fiducia, +1 P quartiere.
- [se furgone visto] Furgone alla fonderia (M e21:283): *mandaci una squadra* → +1 fiducia, costa una squadra · *segna l'ora* → nessun effetto.

**Ondata 2 – Due curve in una città**
- Bottigliette (M e21:345): *steward in curva e piazza* → −2 P curva Kiln, −2 P piazza, costa due steward · *speaker* → −1 P curva Kiln, −1 fiducia · *lascia correre* → +1 T curva Kiln, +1 T piazza.
- «Dov'è il vostro capo?» (M e21:405): *steward nel quartiere* → −2 P quartiere, costa uno steward · *lascia correre* → +2 P quartiere.
- Striscione anti-sgombero (M e21:442): *toglilo* → −2 P curva Kiln, +2 T piazza · *niente patti* → +1 fiducia, +1 T curva Kiln.

**Ondata 3 – La voce dello sgombero**
- Stanotte sgomberano (M e21:510): *piazza separata* → +2 T piazza fonderie · *steward a spiegare* → −2 P piazza, costa uno steward · *nel cortile* → −1 P piazza, +1 P ex fonderia.
- Residenti divisi (M e21:562): *rassicura* → −2 P ex fonderia, **nessun altro effetto** · *nessun commento* → +2 P ex fonderia.
- Qualcuno in comune (M e21:595): *ascolta* → +1 T ex fonderia · *di testa tua* → −1 P ex fonderia, **nessun altro effetto**.

**Ondata 4 – Chi comanda adesso**
- Chi arriva primo (M e21:655): *vecchi per un'altra strada* → −2 P ex fonderia, +2 T piazza · *tutti insieme* → +2 P ex fonderia.
- Vie del quartiere (M e21:691): *riaprile* → +1 fiducia, +2 P piazzale · *chiuse un'ora* → −2 P piazzale, +1 T quartiere, −1 fiducia.
- [se informatore pagato] Un telefono (M e21:735): *passa il numero* → +1 fiducia · *non ora* → nessun effetto.

**Esiti**
- Contenuto: «Due fazioni, un cortile, una partita, nessun incidente serio. L'assemblea dice ai ragazzi: restate, se pulite. Malvasi riattacca il foglio con lo scotch. «Non sono amici, ma reggono.»» (T e21:123)
- A fatica: «Spintoni fra vecchi e giovani, cortile pieno fino a tardi, una voce di sgombero smentita tardi. Divisi, ma in piedi. Il centro sociale scrive un comunicato lungo, un po' anche contro di te.» (T e21:124)
- Degenerato: «Vecchi contro giovani davanti all'ex fonderia, fino a notte; assemblea sciolta, sedie del doposcuola in cortile. In comune hanno letto il rapporto: lo sgombero ora ha una data.» (T e21:125)

**Malvasi / il vice (scelta)**
- «Un'assemblea che chiede a te di decidere. Segnati la data: non succederà più.» (T e21:12)
- «Finalmente le due fazioni sono d'accordo su qualcosa.» (T e21:56)
- «La curva non fa politica. Lo dicono da trent'anni, sempre a voce molto alta.» (T e21:64)
- «Fonderia piena, sgombero urgente, area libera. Curva debole, stadio pericoloso. Lo dico così, a caso.» (T e21:92)
- «Latitante, ma con la ricarica. Il progresso.» (T e21:116)

---

## Punti da decidere

### 1 · «Qualcuno in comune» telefona in cinque episodi su sei, con prezzi incoerenti
Compare in e19 (M e19:823), e21 (briefing T e21:8 e chiamata M e21:595), e22 (M e22:560), e23 (M e23:616), e24 (M e24:542);
in e13–e18 la fonte `qualcuno_in_comune` non c'è (grep: 0). Le risposte si ripetono: «Molto saggio.» (T e19:120), «Saggio.» (T e21:95, T e23:94).
Il prezzo cambia senza motivo: obbedire dà +1 fiducia in e19 e e23 (M e19:830, e23:623), in e21 non dà nulla (M e21:602);
disobbedire costa −1 in e19 e e23 (M e19:842, e23:639) ma in e21 è gratis, anche se il testo dice «Il comune non gradisce» (T e21:97).
- **A (consigliata) · Toglierlo da e21, prezzo uniforme.** In e21 basta il briefing; altrove obbedire +1, disobbedire −1 fiducia. Costo: riscrivere 1 chiamata di e21 + rimisura col bot.
- **B · Tenerlo ovunque, solo prezzo uniforme.** In e21 «di testa tua» −1 fiducia, «ascolta» +1. Costo: 2 effetti; il telefono resta in 5 episodi.
- **C · Lasciare com'è.** Costo: lo stesso gesto 5 volte, e in e21 disobbedire al comune conviene sempre.

### 2 · Costi e guadagni promessi dal testo che i dati non applicano
Stessa classe di D-186 (DECISIONI.md:197):
- e20 *prima il derby* (M e20:552): «Il comando non perdona» (T e20:85), nessuna fiducia tolta.
- e20 *agente a vista* (M e20:263): «Il comando apprezza» (T e20:31), ma costa solo una squadra e non dà niente: peggio di *solo telecamere*, che è gratis (M e20:275).
- e21 *rassicura* (M e21:569): «in comune non gradiscono» (T e21:86), nessun costo; −2 P gratis contro +2 dell'altra opzione.
- e21 *piazza separata* (M e21:516), *lascia correre* (M e21:428): «Il comando apprezza» (T e21:75, 61), nessuna fiducia guadagnata; *tutti insieme* (M e21:677): «Il club apprezza» (T e21:106), idem.
- **A (consigliata) · Regola D-186 in entrambi i versi.** −1 fiducia dove si promette una protesta, +1 dove si promette apprezzamento. Costo: circa 6 effetti + rimisura col bot.
- **B · Riscrivere i testi dei costi.** I dati restano, il testo dice il vero. Costo: circa 6 righe; *agente a vista* resta un'opzione inutile.
- **C · Lasciare così.** Costo: il testo promette conseguenze che non arrivano.

### 3 · e20: il patto col Fabbro è di nuovo gratis
Con `rapporto_dessi` = rispetto, *chiedi al Fabbro di tenere il corteo in riga* (M e20:203) dà −2 P strada Kiln e nient'altro:
«Ti rispetta: lo fa, senza chiedere niente in cambio» (T e20:134). Le altre due opzioni con lo stesso −2 costano una squadra
o il mediatore (M e20:159, 175), quindi con «rispetto» la scelta è già fatta. D-186 ha dato −1 fiducia al patto di e11, come in e10/e12.
- **A (consigliata) · −1 fiducia, come gli altri patti.** Il testo diventa «lo fa, ma il comando vede la stretta di mano». Costo: 1 effetto + 1 riga + rimisura.
- **B · Gratis in fiducia, effetto ridotto a −1 P.** Il «saluto» del Fabbro resta un regalo, ma non batte più scorta e mediatore. Costo: 1 effetto.
- **C · Lasciarlo gratis.** Costo: l'opzione conviene sempre; incoerente con D-186.

### 4 · e20: la pausa all'arbitro non costa niente
*Chiedi una pausa all'arbitro* (M e20:368) dà −3 P curva Kiln senza costi, contro *steward in curva* −2 e uno steward (M e20:352).
In e24 la stessa mossa, *chiedi una pausa per calmare le curve*, costa −1 fiducia e dà solo −1/−1 (M e24:713, T e24:99).
- **A (consigliata) · Come in e24: −1 fiducia.** Il testo del costo diventa «la pausa ti costa fiducia». Costo: 1 effetto + 1 riga + rimisura.
- **B · Effetto ridotto a −2 P, gratis.** Pari allo steward ma senza consumo. Costo: 1 effetto; resta la migliore.
- **C · Lasciare così.** Costo: scelta già fatta in ondata 2, e la stessa mossa ha due prezzi in stagione 2.
