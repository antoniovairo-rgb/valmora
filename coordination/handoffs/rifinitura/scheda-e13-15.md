# Scheda di rifinitura e13–e15 (D-135)

Fonti: `data/missioni/e1x.json` (M) e `data/testi/it/e1x.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield (testi e mappa).
Esiti comuni ai tre episodi (M e13:777, e14:788, e15:717): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita). Tre stelle con fiducia ≥ 7.
Le chiamate marcate *[se …]* compaiono solo con quella variabile.

---

## e13 · «Il concertone d'estate» (T e13:2)

**Partita:** amichevole Kiln–Tramway (M e13:3-6), settore ospiti inagibile; alle nove concertone gratis della Varrone & Figli (T e13:3-4).
Risultato: Non indicato nei testi. Risorse: 4 squadre, 5 steward, 1 mediatore (M e13:93).

**Trama.** Stessa strada per tifosi e pubblico del concerto; gli addetti Varrone riservano i parcheggi «per gli ospiti dell'impresa»
(T e13:21). Il Fabbro vuole la foto sul palco davanti al plastico dello stadio nuovo e poi offre di tenere a bada i suoi
in cambio di «niente nomi nel rapporto» (T e13:93). Ai banchi girano abbonamenti falsi; il furgone grigio scarica stampati
dietro il palco. Malvasi chiude confrontando abbonamento falso e volantino Varrone: «Stessa carta» (T e13:124).

**Ondata 1 – Due pubblici, una strada**
- Viale pieno (M e13:142): *una squadra* → −2 P viale, costa una squadra · *chiudi alle auto* → −2 P viale, +2 P parcheggi · *lascia aperto* → +2 P viale.
- Parcheggi riservati (M e13:194): *parcheggi pubblici* → +1 fiducia, +1 T parcheggi · *uno steward* → −2 P parcheggi, costa uno steward · *lascia fare agli addetti* → −1 fiducia, +1 P parcheggi.
- Il palco (M e13:250): *concedi la foto* → +2 T piazzale · *niente palco* → +2 T curva Kiln.
- [se informatore pagato] Abbonamenti a metà prezzo (M e13:283): *steward al banco* → −3 P piazza del concerto, costa uno steward · *ci pensi dopo* → nessun effetto.

**Ondata 2 – Primo tempo, prove del suono**
- Microfono (M e13:345): *sospendi le prove* → −2 P piazzale, +1 T curva Kiln · *cori d'estate* → +2 P piazzale.
- Abbonamenti finti (M e13:381): *sequestra* → +1 fiducia, +2 T piazza · *steward ai banchi* → −2 P piazza, costa uno steward · *fotografa i venditori* → +1 P piazza.
- Caldo (M e13:433): *acqua in curva* → −2 P curva Kiln, costa uno steward · *che resistano* → +2 P curva Kiln.

**Ondata 3 – Fra la porta e il palco**
- Spintoni (M e13:496): *una squadra in mezzo* → −2 T piazzale, costa una squadra · *sospendi l'amichevole* → −3 P piazzale, −2 P curva Kiln, **nessun altro effetto** · *aspetta* → +2 T piazzale, +1 T curva Kiln.
- Video in rete (M e13:552): *comunicato* → +1 T curva Kiln · *nessun commento* → nessun effetto.
- Patto del Fabbro (M e13:579): *accetta* → −3 P curva Kiln, **nessun altro effetto** · *niente patti* → +2 T curva Kiln.
- [se furgone visto] Furgone dietro il palco (M e13:612): *manda una squadra* → −3 P piazza, costa una squadra · *non ora* → nessun effetto.

**Ondata 4 – Tutti in piazza**
- Coda d'auto (M e13:674): *senso unico* → −2 P parcheggi, +1 P viale (non compare se si è chiuso il viale) · *vigili urbani* → −2 P parcheggi, **nessun altro effetto**.
- Corteo del Tramway (M e13:711): *corteo concesso* → +2 P viale · *a piccoli gruppi* → −1 P viale, +1 T piazzale.
- Abbonamento e volantino (M e13:747): *agli atti* → nessun effetto · *al club* → +1 P piazza.

**Esiti**
- Contenuto: «Amichevole finita, concerto finito, piazza intera. Malvasi archivia un abbonamento falso accanto a un volantino della Varrone & Figli. «Stessa carta. Hanno cominciato. Anche noi.»» (T e13:132)
- A fatica: «Qualche spintone, qualche clacson, concerto partito con mezz'ora di ritardo. In rete si parla della musica, non di noi. Malvasi lo chiama un successo.» (T e13:133)
- Degenerato: «La serata è sfuggita di mano: due ore di caos nei rapporti, nessun ferito grave. Dietro il palco della Varrone nessuno ha visto niente.» (T e13:134)

**Malvasi / il vice (scelta)**
- «Il Fabbro col plastico dello stadio nuovo alle spalle. Qualcuno, quella foto, la voleva proprio.» (T e13:32)
- «Il ragazzo delle sciarpe è tornato dalle vacanze prima di noi.» (T e13:40)
- «Lo stadio vecchio non lo aggiusta più nessuno. Ci sarà un motivo, e avrà dei cartelloni.» (T e13:67)
- «Il Fabbro sul palco di Varrone due volte in una sera. Io i favori li conto. Anche lui.» (T e13:94)
- «Chi stampa così ha una tipografia. E una tipografia ha un indirizzo, e dei clienti.» (T e13:125)

---

## e14 · «Biglietti doppi» (T e14:2)

**Partita:** «Skyfield contro Waterline, stadio esaurito. Anzi, esaurito due volte» (T e14:4). Blocco `partita` assente nei dati.
Risultato: Non indicato nei testi. Risorse: 3 squadre, 7 steward, 1 mediatore (M e14:90).

**Trama.** I biglietti sono veri ma venduti due volte: «stessa carta del club, stesso codice» (T e14:35). Trecento seggiolini
con due persone, ospiti finiti in curva Skyfield, tornelli che respingono il secondo codice, una fila di rimborsi intorno
allo stadio. Il presidente dello Skyfield offre di rimborsare lui; Malvasi trova lo stesso numero di serie e la tipografia
del club (T e14:93). Il finale cambia se alla stampa si risponde «Indagini in corso» (M e14:788, D-158).

**Ondata 1 – Apertura dei cancelli**
- Doppioni (M e14:136): *chiudi la vendita* → −1 fiducia, −2 P tornelli · *lascia vendere* → +1 fiducia, +2 P tornelli · *steward ai codici* → −2 P biglietteria, costa uno steward.
- Ospiti con posti in curva Skyfield (M e14:192): *cambio in biglietteria* → +2 P biglietteria, −1 P curva Skyfield · *dentro comunque* → +1 fiducia, +2 P curva ospiti.
- Il cronista (M e14:232): *conferma* → +1 fiducia, +2 P piazzale · *smentisci* → −1 fiducia, −1 P tornelli.
- [se informatore pagato] Stessa carta (M e14:272): *avvisa il club* → −1 fiducia, −3 P biglietteria · *lo tieni per te* → nessun effetto.

**Ondata 2 – Posti occupati**
- Seduti in due (M e14:340): *in piedi nei corridoi* → +1 fiducia, +2 T curva Skyfield · *settore chiuso per lavori* → −3 P curva Skyfield, costa due steward.
- Ospiti sbagliati (M e14:380): *una squadra* → −2 T curva Skyfield, costa una squadra · *lasciali* → +2 T curva Skyfield, +1 T curva ospiti · *speaker* → −1 fiducia, −1 P curva Skyfield.
- Tornelli (M e14:436): *sblocca a mano* → −1 fiducia, −2 P tornelli · *tienili fuori* → +1 fiducia, +2 T tornelli.

**Ondata 3 – Primo tempo**
- Fumo (M e14:502): *steward in curva ospiti* → −2 P curva ospiti, costa uno steward · *lascia correre* → +2 P curva ospiti.
- Fila dei rimborsi (M e14:538): *rimborsi subito* → −2 P biglietteria, **nessun altro effetto** · *dopo la partita* → +2 P biglietteria.
- [presidente incontrato] Rimborsa il presidente (M e14:570): *accetta* → −1 fiducia, −3 P curva Skyfield · *declina* → +1 fiducia.
- Numero di serie (M e14:611): *chiedi chi stampa* → −1 fiducia, −2 P tornelli · *aspetta prove* → +1 P tornelli.

**Ondata 4 – I rimborsi**
- Sportelli (M e14:674): *altri sportelli* → −1 fiducia, −3 P biglietteria · *modulo da casa* → +2 P biglietteria.
- Uscita ospiti (M e14:710): *trattieni dieci minuti* → −2 P piazzale, +2 T curva ospiti · *fuori subito* → +1 fiducia, +1 P piazzale.
- Titolo di domani (M e14:750): *una tipografia da controllare* → +1 fiducia, +1 P piazzale · *«Indagini in corso»* → −1 fiducia (e finale proprio).

**Esiti**
- Contenuto: «Ogni doppione ha trovato un posto o un rimborso. Malvasi archivia i due biglietti identici accanto all'abbonamento del concertone. «La busta comincia a pesare.»» (T e14:124)
- A fatica: «Code, liti, rimborsi promessi. Lo stadio ha retto. Domani i giornali diranno «errore della tipografia». Malvasi rigira tra le dita due biglietti con lo stesso numero di serie e non dice niente.» (T e14:125)
- A fatica (dopo «Indagini in corso»): «Code, liti, rimborsi promessi. Lo stadio ha retto. Accanto ai due biglietti identici, sul tavolo di Malvasi, ora c'è un fascicolo con scritto «indagini». Il club non ha gradito.» (T e14:126)
- Degenerato: «Due persone per ogni posto e nessuno disposto a cedere. I rapporti parlano di spinte e proteste fino a notte. Il club parla di «disguido tecnico».» (T e14:127)

**Malvasi / il vice (scelta)**
- «Trova le differenze. Io ci ho messo un'ora: non ce ne sono.» (T e14:3)
- «Il ragazzo ha studiato. O ha un cugino in tipografia.» (T e14:36)
- «Generoso. O ha paura di cosa troveremmo cercando chi stampa.» (T e14:86)
- «O il club si vende i posti due volte da solo, o qualcuno in tipografia lavora per due padroni.» (T e14:94)
- «La busta comincia a pesare.» (T e14:124)

---

## e15 · «La tifoseria gemellata» (T e15:2)

**Partita:** «Kiln–Wallgate, la rivincita del quattro a zero» (T e15:4), con i gemellati del Railhead County in un settore loro (T e15:6). Blocco `partita` assente nei dati.
Risultato: compare solo nella risposta *guarda la partita*: «Zero a zero.» (T e15:96). Risorse: 4 squadre, 5 steward, 1 mediatore (M e15:91).

**Trama.** Il comando vuole sapere «chi sono gli amici del Fabbro» (T e15:4). Da Railhead arrivano duecento tifosi più del previsto,
il Fabbro li aspetta con lo striscione «Fratelli»; l'informatore vede passare una borsa pesante. Corteo unito di mille persone,
settore gemellati troppo piccolo, i Rovers che vogliono «salutarli». In partita il Fabbro parla tutto il primo tempo col capo
dei gemellati; a fine giornata la borsa finisce «in un magazzino, giù alle fonderie» (T e15:113), che apre e16.

**Ondata 1 – Arrivano gli amici**
- Treno da Railhead (M e15:138): *scortali* → −2 P viale, costa una squadra · *contali in stazione* → +2 P stazione · *lasciali andare* → +2 P viale.
- «Fratelli» (M e15:186): *lascia fare* → +1 T curva ospiti · *togli lo striscione* → +2 T viale.
- I Rovers in rete (M e15:219): *uno steward agli ospiti* → −2 P curva ospiti, costa uno steward · *chiacchiere* → +2 T curva ospiti.
- [se informatore pagato] La borsa (M e15:255): *falla seguire* → +1 fiducia, costa una squadra · *non ora* → nessun effetto.

**Ondata 2 – Il corteo unito**
- Mille (M e15:317): *scortato* → −2 P viale, costa una squadra · *due cortei* → +2 T viale · *mediatore* → −1 P viale, costa il mediatore.
- Settore pieno (M e15:369): *in curva Kiln* → −2 P settore gemellati, +2 P curva Kiln · *fuori* → +2 T settore gemellati.
- «Salutarli» (M e15:405): *chiudi il settore ospiti* → −1 P viale, +2 T curva ospiti · *fidati* → +2 P curva ospiti.

**Ondata 3 – La partita**
- Telone (M e15:468): *steward sotto* → −2 P settore gemellati, costa uno steward · *lascia fare* → +1 fiducia, +1 T settore gemellati.
- Fumo verde (M e15:508): *steward* → −2 P curva ospiti, costa uno steward · *pausa dall'arbitro* → −3 P curva ospiti, **nessun altro effetto** · *lascia correre* → +2 P curva ospiti.
- Binocolo (M e15:556): *fotografa l'incontro* → +1 fiducia, +1 T curva Kiln · *guarda la partita* → nessun effetto.

**Ondata 4 – Il saluto**
- Accompagnarli (M e15:615): *corteo fino alla stazione* → +2 P viale · *navette* → −2 P viale, **nessun altro effetto**.
- Fondo viale (M e15:647): *trattieni i Rovers* → −2 P viale, +2 T curva ospiti · *lascia stare* → +2 T viale.
- [se informatore pagato] Borsa al magazzino (M e15:683): *annota l'indirizzo* → +1 fiducia, nessun costo · *lascia perdere* → nessun effetto.

**Esiti**
- Contenuto: «Gemellati e Rovers ripartono cantando, ognuno sul suo treno. Malvasi appende in bacheca la foto di Tano Ferrigno col capo di Railhead. «Ha degli amici. Ora sappiamo che faccia hanno.»» (T e15:121)
- A fatica: «Il corteo unito è arrivato e ripartito, con qualche spintone sul viale. Tano Ferrigno ha salutato gli amici in stazione come si saluta un socio.» (T e15:122)
- Degenerato: «Gemellati, curva di casa e Rovers sul viale della stazione nello stesso momento. I rapporti parlano di ore di tensione. Tano Ferrigno, nei video, non c'è mai.» (T e15:123)

**Malvasi / il vice (scelta)**
- «Gemellaggio. Vuol dire che il Railhead County viene a cantare con la curva Kiln. Da trecento chilometri.» (T e15:3)
- «Fratelli. Io ho un fratello, e non lo vado mai a prendere in stazione.» (T e15:22)
- «Quando dicono salutare, intendono un'altra cosa. Lo dico per esperienza.» (T e15:63)
- «Due capi curva che non guardano la partita. O è una brutta partita, o stanno facendo affari.» (T e15:90)
- «Le fonderie. Lì non fondono niente da vent'anni. Però ci si parcheggia bene.» (T e15:114)

---

## Punti da decidere

### 1 · In e13 il patto col Fabbro è di nuovo gratis
Il Fabbro chiede «niente nomi nel rapporto» (T e13:93); accettare toglie 3 di pressione e non costa altro (M e13:586-597),
mentre il costo scritto dice «ma è un patto» (T e13:96). È lo stesso caso che D-186 (DECISIONI.md:197) ha chiuso in e11
con −1 fiducia «come in e10/e12». Il vice sottolinea che è il secondo favore della serata (T e13:94).
- **A (consigliata) · −1 fiducia, come e11.** Stessa regola di D-186. Costo: un effetto nei dati + rimisura col bot.
- **B · −2 fiducia (secondo favore).** Pesa la foto sul palco già concessa. Costo: un effetto e un `dopo` sulla scelta del palco (M e13:257); rimisura.
- **C · Lasciarlo gratis.** Costo: l'opzione conviene sempre e «è un patto» non ha peso, contro la regola appena decisa.

### 2 · Prezzi promessi e scelte senza prezzo
La regola di D-186 («dove il testo promette una protesta o un costo si dà il prezzo promesso») qui non è ancora applicata:
- e13 *vigili urbani* −2 P e nient'altro (M e13:697), ma il testo dice «i rinforzi fuori orario non piacciono al comando» (T e13:115); l'alternativa costa +1 P sul viale.
- e14 *rimborsi subito* −2 P e nient'altro (M e14:544), ma «il club protesta» (T e14:80); l'alternativa è solo +2 P.
- e15 *navette* −2 P e nient'altro (M e15:633), ma «il comune paga le navette» (T e15:104): è il gemello di e11 *paga il comune*, già deciso in D-186.
Senza testo che prometta un costo, ma comunque gratis e migliori di tutto il resto: e13 *sospendi l'amichevole* −3 e −2 P (M e13:518), e15 *pausa dall'arbitro* −3 P (M e15:530) contro lo steward che dà −2 e lo consuma.
- **A (consigliata) · −1 fiducia a tutte e cinque.** Le tre promesse come da D-186, più le due sospensioni (fermare una partita non piace al comando). Costo: 5 effetti, 2 righe di costo da riscrivere, rimisura col bot.
- **B · Solo le tre promesse.** Costo: 3 effetti; le due sospensioni restano la scelta ovvia.
- **C · Lasciare così.** Costo: il testo promette conseguenze che non arrivano, in contrasto con D-186.

### 3 · Il finale di e15 cita una foto che il giocatore può non aver scattato
Il contenuto dice «Malvasi appende in bacheca la foto di Tano Ferrigno col capo di Railhead» (T e15:121), ma la foto esiste solo
con *fotografa l'incontro* (M e15:563); con *guarda la partita* (M e15:579) non c'è. Gli esiti non hanno `dopo` (M e15:717).
Stessa classe del finale di e14, risolto con D-158 (varianti legate alle scelte).
- **A (consigliata) · Due varianti con `dopo`.** Foto se si è fotografato, altrimenti un testo senza foto. Costo: 1 testo nuovo + 1 esito con `dopo` + guardiano come tests/finale-e14.test.ts.
- **B · Un testo neutro valido in tutti i rami.** Regola D-159. Costo: riscrivere 1 riga; si perde il premio narrativo della foto.
- **C · Lasciare com'è.** Costo: chi non ha fotografato legge di una foto mai fatta.

### 4 · Le risposte «Nessun costo, nessun aiuto»
Sette risposte in tre episodi non fanno nulla e lo dicono: e13 *ci pensi dopo* (T e13:45), *non ora* al furgone (T e13:106),
*agli atti* (T e13:127); e14 *lo tieni per te* (T e14:41); e15 *non ora* alla borsa (T e15:41), *guarda la partita* (T e15:95),
*lascia perdere* (T e15:119). Quasi tutte sono la risposta all'informatore o al vice. Contro di loro, in e15 *annota
l'indirizzo* dà +1 fiducia senza costo (M e15:694): l'altra scelta non ha senso. In e13 anche *nessun commento* (M e13:570)
batte *comunicato*, che dà solo +1 T (M e13:558).
- **A (consigliata) · Dare un piccolo prezzo al «non ora».** +1 P sul settore della chiamata, così è una scelta di risorse. Costo: ~7 effetti e i testi di costo da riallineare; rimisura col bot.
- **B · Togliere il premio gratis.** *annota l'indirizzo* senza +1 fiducia, *comunicato* con un vantaggio (−1 P). Costo: 2-3 effetti; i «non ora» restano vuoti.
- **C · Lasciare così.** Costo: chiamate che non chiedono una decisione vera.
