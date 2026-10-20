# Scheda di rifinitura e01–e03 (D-135)

Fonti: `data/missioni/e0x.json` (M), `data/testi/it/e0x.json` (T), `data/imprevisti/e0x.json` (I). Le righe sono `file:riga`.
Gli imprevisti di e01–e03 non hanno un file `imp_e0x.json`: i loro testi stanno in T (chiavi `e0x.imp.*`).
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield (testi e mappa).
Esiti comuni ai tre episodi (M e01:749, e02:914, e03:901): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita).
Le chiamate marcate *[se …]* compaiono solo con quella variabile o dopo quella scelta. Gli **⚡ imprevisti** arrivano
sempre, una volta per ondata, inseriti nella lista dopo `dopo` chiamate (src/dati/imprevisti.ts:19; D-190, D-201):
non impegnano unità e «lascia correre» non ha effetto. Le risposte senza fiducia per D-160 sono in
tests/dati/fiducia-d160.json:4-18, 177-182 (e01 ed e02; nessuna voce di e03).

---

## e01 · «Primo giorno, primo derby» (T e01:2)

**Partita:** derby «fonderie contro collina» (T e01:17), Kiln contro Skyfield. Risultato fisso: «Pareggio al novantesimo, nessuno contento» (T e01:82). Chi gioca in casa: Non posso confermarlo (i testi non lo dicono).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e01:84, 92, 100). Tre ondate.

**Trama.** Primo giorno ad interim: Malvasi aspetta con due caffè e una scommessa su quanto duri (T e01:16). Il briefing
mette una contro l'altra due fonti: il ragazzo delle sciarpe giura che da Kiln parte un corteo (vera, M e01:12),
Lavezzari giura di no (falsa, M e01:19). Il corteo c'è; durante la partita il Fabbro chiede di parlare e il presidente
dello Skyfield ti vuole in tribuna; all'uscita Lavezzari offre i suoi steward e il ragazzo passa a riscuotere.
L'episodio apre tre fili: `presidente_incontrato` (M e01:452), `informatore_pagato` (M e01:722, 738), `sospetti_talpa` (M e01:661).

**Ondata 1 – Arrivo delle tifoserie**
- Corteo partito (M e01:134): *scorta* → −2 P strada Kiln, costa una squadra · *fermalo* → +2 P strada Kiln, +1 T curva Kiln · *osserva* → +1 P strada Kiln.
- L'ufficio insiste (M e01:187): *asseconda* → +2 P piazzale · *ignora* → nessun effetto (fonte falsa, regola D-152).
- ⚡ Ambulanza ferma (I e01:8, dopo 2): *apri un varco* → −3 P strada Skyfield, +2 T piazzale · *pullman a mano* → −1 P, +1 T strada Skyfield · *aspetta* → nulla.
- Pullman in anticipo (M e01:215): *scarico lontano* → −1 P strada Skyfield · *si aspetta* → +1 P strada Skyfield, +1 fiducia.
- Rinforzi (M e01:251): *chiedi* → +2 squadre (fiducia tolta da D-160) · *rifiuta* → nessun effetto.
- Striscione KILLJOY (M e01:278): *rimuovi* → +2 T curva Skyfield, +1 fiducia · *lascia* → −1 fiducia · *foto* → +1 T curva Skyfield.

**Ondata 2 – La partita**
- Fumogeni al decimo (M e01:352): *steward* → −1 P, +1 T curva Kiln · *sospendi due minuti* → −3 P curva Kiln, **nient'altro** · *lascia correre* → +3 P.
- Porta di servizio (M e01:401): *presidia* → −1 P piazzale, costa due steward · *finta di niente* → +2 P curva Skyfield.
- ⚡ Buio in curva Skyfield (I e01:60, dopo 2): *torce* → −3 P curva Skyfield, +2 T curva Kiln · *speaker* → −1 P, +1 T · *aspetta il tecnico* → nulla.
- Il presidente (M e01:437): *vai* → +2 fiducia, +2 T curva Kiln, segna `presidente_incontrato` · *manda il vice* → +1 fiducia, +1 P piazzale · *aspetti* → nulla.
- Il Fabbro (M e01:488): *mediatore* → −2 P curva Kiln, costa il mediatore · *nessuna trattativa* → +1 T · *ascoltalo tu* → −1 P, −1 fiducia.

**Ondata 3 – Il deflusso**
- Pareggio (M e01:566): *trattieni gli ospiti* → −2 P strada Skyfield, +1 T curva Skyfield · *tutti insieme* → +3 P piazzale.
- Incrocio (M e01:602): *chiudi* → +1 T strada Kiln, −1 fiducia · *lascia scorrere* → +3 T strada Skyfield.
- ⚡ Tram guasto (I e01:112, dopo 2): *sgombera* → −3 P piazzale, +1 T strada Skyfield · *tram a vuoto* → −1 P, +1 T piazzale · *aspetta* → nulla.
- Lavezzari (M e01:638): *accetta i suoi steward* → −1 P piazzale, +1 T curva Kiln · *annota il dubbio* → +1 `sospetti_talpa`, +1 P strada Kiln.
- Troupe (M e01:679): *intervista* → +2 T piazzale · *niente* → nulla (fiducia tolta da D-160 a entrambe).
- Il ragazzo delle sciarpe (M e01:706): *paga* → −2 P strada Kiln, −1 fiducia, segna `informatore_pagato` · *non si paga* → nulla.

**Esiti**
- Contenuto: «Derby concluso senza danni gravi né titoli in prima pagina. Il vice paga la scommessa con una smorfia: «Doppio o niente sulla prossima.»» (T e01:7)
- A fatica: «Qualche momento teso fra piazzale e strade, nessuna conseguenza grave. Domattina in città si pronuncerà il tuo nome, non sempre con affetto.» (T e01:8)
- Degenerato: «La situazione è sfuggita di mano fuori dallo stadio. I rapporti arriveranno domattina, i giornali stasera. Il vice incassa la scommessa senza sorridere.» (T e01:9)

**Malvasi / il vice (scelta)**
- «Famiglie. Con i fumogeni in tasca, ma famiglie.» (T e01:31)
- «È una prova, sai. Tutti chiedono rinforzi il primo giorno.» (T e01:42)
- «Il pareggio è il risultato peggiore. Lo dico da anni, nessuno mi ascolta.» (T e01:83)
- «Cordiale, Lavezzari. Stamattina giurava che il corteo non esisteva.» (T e01:136)

---

## e02 · «Ospiti numerosi» (T e02:2)

**Partita:** «Gioca lo Skyfield in casa» contro il Railhead County, ottocento ospiti in treno (T e02:3-4, 6). Risultato fisso: «Uno a zero Railhead al novantesimo» (T e02:97).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e02:96, 105, 114). Quattro ondate.

**Trama.** Malvasi appende la cartina dei treni (T e02:3). Il secondo treno arriva con quaranta minuti di ritardo, ai
tornelli girano biglietti falsi, il responsabile del Railhead garantisce per i suoi (fonte falsa, M e02:31) e vuole il
corteo «per tradizione». Se il ragazzo è stato pagato, indica il furgone grigio dei biglietti (segna `furgone_visto`,
M e02:723). Il Railhead vince, la casa è furiosa, due vetrine rotte sul viale.

**Ondata 1 – Il primo treno**
- Ritardo (M e02:142): *scorta subito* → −2 P viale, costa una squadra · *trattienili* → +2 P, +1 T stazione · *lasciali* → +2 P viale.
- Il responsabile garantisce (M e02:195): *fidati* → +3 P viale · *presidiamo noi* → nulla (fonte falsa).
- ⚡ Cambio di binario (I e02:8, dopo 2): *scala giusta* → −2 P stazione, +2 T viale · *scala di servizio* → −1 P, +1 T stazione · *altoparlante* → nulla.
- Giro turistico (M e02:222): *devia* → +1 P viale, −1 T curva Skyfield · *chiacchiere* → +2 T curva Skyfield.
- [se informatore pagato] Biglietti alla fermata (M e02:258): *fatti vedere* → −3 P tornelli · *concentrati sui tornelli* → nulla.

**Ondata 2 – Il treno in ritardo**
- Secondo treno (M e02:316): *accoglienza* → −2 P stazione · *binario lontano* → −1 P stazione, +1 P viale · *normale* → +1 P stazione.
- Biglietti falsi (M e02:364): *respingi* → +3 T tornelli · *settore separato* → −2 P tornelli, +2 P curva ospiti, −1 fiducia · *chiudi un occhio* → −2 P, +1 T tornelli.
- Corteo «per tradizione» (M e02:421): *scortato* → −2 P viale, costa una squadra · *niente corteo* → +2 T viale · *mediatore* → −1 P viale, +1 fiducia, costa il mediatore.
- ⚡ Sciarpa strappata (I e02:60, dopo 3): *recuperala* → −2 P stazione, +2 T tornelli · *trattieni sul binario* → −1 P, +1 T stazione · *lasciali cercare* → nulla.
- Comitato di Skyfield (M e02:477): *presidio* → −1 P curva Skyfield, +1 T curva ospiti · *comunicato* → +2 T curva Skyfield (fiducia tolta da D-202).
- [se presidente incontrato] Due steward del club (M e02:513): *accetta* → +2 steward, −1 fiducia · *declina* → +1 fiducia.

**Ondata 3 – La partita**
- «RAILHEAD NON DIMENTICA» (M e02:580): *chiedi spiegazioni* → +2 P curva ospiti · *rimuovi* → +2 T · *lascialo* → nulla.
- Fumogeni ospiti (M e02:619): *steward* → −2 P, +1 T curva ospiti · *pausa dall'arbitro* → −3 P, **nient'altro** · *lascia correre* → +2 P.
- ⚡ Acquazzone (I e02:112, dopo 2): *teli* → −1 P curva ospiti, +1 T curva Skyfield · *sotto la tettoia* → −1 P, +1 T curva ospiti · *pioggia* → nulla.
- Curva di casa (M e02:667): *mediatore* → −1 P curva Skyfield, costa il mediatore · *non intervenire* → nulla (variante col mediatore già al corteo, M e02:698).
- [se informatore pagato] Il furgone (M e02:708): *annota* → −1 P tornelli, segna `furgone_visto` · *non ora* → nulla.

**Ondata 4 – Il ritorno in stazione**
- Uno a zero (M e02:769): *trattieni gli ospiti* → −2 P viale, +2 T curva ospiti · *prima gli ospiti, scortati* → −1 P viale, +1 T curva Skyfield, costa una squadra.
- Ultimo treno (M e02:813): *trattieni il treno* → −2 P stazione, **nient'altro** · *parte all'orario* → +3 P stazione.
- ⚡ Ultimo treno soppresso (I e02:164, dopo 2): *pullman del comune* → −2 P stazione, +1 T viale · *sala d'attesa* → −1 P, +1 T stazione · *annuncio* → nulla.
- Il saluto in tv (M e02:845): *accetta* → +3 T curva Skyfield · *declina* → nulla.
- Vetrine (M e02:872): *immagini* → +1 fiducia, costa due steward · *chiudi il viale* → −2 P viale, +1 T stazione.

**Esiti**
- Contenuto: «Ottocento ospiti arrivati, quasi tutti ripartiti in giornata. Il Railhead manda un comunicato di ringraziamento. Malvasi lo appende accanto alla cartina dei treni.» (T e02:114)
- A fatica: «Qualche momento teso tra stazione e tornelli, ma i treni sono partiti tutti. Le ferrovie chiedono una riunione. Malvasi chiede ferie.» (T e02:115)
- Degenerato: «La serata dei treni è diventata la più calda della città. I rapporti parlano di ritardi, vetrine e una notte lunghissima. Il Railhead, almeno, ha vinto.» (T e02:116)

**Malvasi / il vice (scelta)**
- «Benvenuto nel mondo dei tornelli. Qui ogni scelta è sbagliata, devi solo scegliere quanto.» (T e02:51)
- «Il turno è tuo. Il caffè è mio.» (T e02:85)
- «Io ho sempre tifato per il pareggio. È il risultato più sicuro. Non mi ascolta nessuno.» (T e02:98)
- «Una stretta di mano vale due steward. Il listino dei presidenti è sempre interessante.» (T e02:119)

---

## e03 · «Notte di coppa» (T e03:118)

**Partita:** coppa di notte, Skyfield contro il Garden Albion, «le case sono a cinquanta metri dalla curva» (T e03:119). Risultato fisso: «Uno a uno: supplementari» (T e03:77), «Garden vince ai rigori» (T e03:100).
Risorse: 3 squadre, 5 steward, 1 mediatore, **2 transenne fisse** (efficacia quartiere 4, strada 2, piazzale 1; M e03:97, 106, 115, 121-128). Ora: notte (M e03:131). Quattro ondate.

**Trama.** Il comitato dei residenti ha mandato tre pagine fitte; il comune presta transenne che «una volta montate
restano lì fino a fine serata» (T e03:120). Seicento ospiti in pullman parcheggiano dove capita, il quartiere protesta
per luci, clacson e bottiglie, la partita va ai rigori e finisce a mezzanotte e mezza. Sullo sfondo i cartelloni
«Varrone & Figli» dello stadio nuovo, montati senza permesso (T e03:123) e citati nel verbale degenerato (T e03:127).

**Ondata 1 – Il tramonto**
- Auto sui passi carrabili (M e03:162): *rimozione* → −2 P quartiere, costa una squadra · *solo multe* → +1 fiducia, +1 P quartiere · *una sera sola* → +2 T quartiere.
- I cartelloni (M e03:214): *ascoltali* → −2 P quartiere, costa il mediatore · *prometti un presidio* → +1 fiducia, +2 P quartiere.
- ⚡ Carro attrezzi incastrato (I e03:8, dopo 2): *guida la manovra* → −3 P quartiere, +2 T parcheggi · *auto in retromarcia* → −1 P, +1 T quartiere · *aspetta* → nulla.
- Seicento in pullman (M e03:255): *parcheggio lontano* → −2 P parcheggi, +2 P piazzale · *dove capita* → +1 fiducia, +2 P parcheggi.
- [se presidente incontrato] Luci spente prima (M e03:295): *accetta* → −3 P quartiere, −1 fiducia · *le luci servono* → +1 fiducia.

**Ondata 2 – Primo tempo**
- Laser sul portiere (M e03:361): *steward* → −2 P, +1 T curva ospiti · *speaker* → −1 P, −1 fiducia · *lascia correre* → +2 P.
- Le finestre (M e03:413): *pattuglia* → −2 P quartiere, +1 P piazzale · *comunicato* → +1 fiducia, +2 T quartiere.
- ⚡ Cane in campo (I e03:60, dopo 2): *portalo fuori* → −3 P curva ospiti, +1 T curva Skyfield · *custode* → −1 P, +1 T curva ospiti · *arbitro* → nulla.
- Una torcia (M e03:453): *steward* → −2 P curva Skyfield, −1 fiducia · *solo una torcia* → +2 P.
- [se informatore pagato e furgone visto] Furgone ai parcheggi (M e03:489): *controlla* → −2 P parcheggi, costa due steward · *annota* → segna `furgone_visto` (già vero per la condizione, M e03:493-529), nient'altro.

**Ondata 3 – I supplementari**
- Supplementari (M e03:569): *due squadre per la notte* → +2 squadre, −2 fiducia · *tieni duro* → nulla.
- ⚡ Guerra dei balconi (I e03:112, dopo 1): *telefona* → −1 P quartiere, +1 T parcheggi · *prometti* → +1 T quartiere · *lasciali suonare* → nulla.
- Bottiglie dal balcone (M e03:600): *presidio* → −2 P quartiere, −1 fiducia · *devia* → −1 P quartiere, +2 P parcheggi.
- Rigori (M e03:640): *cordone* → −1 P su entrambe le curve, −1 fiducia · *sfogo* → +1 fiducia, +1 T su entrambe.

**Ondata 4 – L'uscita di notte**
- Garden vince (M e03:714): *trattieni gli ospiti* → −2 P parcheggi, +2 T curva ospiti · *scorta ai pullman* → −2 P parcheggi, +1 P quartiere, costa una squadra.
- [dopo «prometti un presidio»] «Avevate promesso» (M e03:758) / [senza promessa] «Fino a quando?» (M e03:810): *vie chiuse* → −3 P quartiere, +2 P piazzale · *scuse* → −1 P, −1 fiducia · *non rispondere* → +3 T quartiere.
- ⚡ Bus notturno (I e03:160, dopo 2): *ai pullman per le vie* → −3 P parcheggi, +1 T quartiere · *secondo bus* → −1 P, +1 T parcheggi · *a piedi* → nulla.
- Pigiami in rete (M e03:863): *commento* → +1 fiducia, +2 T quartiere · *niente commenti* → −1 fiducia.

**Esiti**
- Contenuto: «La coppa è finita e il quartiere, alla fine, è riuscito a dormire. Il comitato scrive una lettera di una pagina sola: è il massimo dei complimenti.» (T e03:125)
- A fatica: «Qualche bottiglia, molti clacson, nessun ferito. Il comitato chiede un incontro. Malvasi chiede che l'incontro sia di giorno.» (T e03:126)
- Degenerato: «Il quartiere è rimasto sveglio fino all'alba, e non per la festa. Il comune convoca una riunione sulla «convivenza fra stadio e città». Davanti ai cartelloni qualcuno sorride.» (T e03:127)

**Malvasi / il vice (scelta)**
- «Varrone & Figli. Cartelloni montati stanotte, senza permesso. Io so solo chi li ha attaccati storti.» (T e03:21)
- «Una sera sola», ripete Malvasi. «Lo dicono anche delle guerre.» (T e03:12)
- «Le luci servono», dici. Malvasi annuisce: «Anche al presidente, per vederti meglio.» (T e03:34)
- «Il carro attrezzi del residente. Giustizia poetica.» (T e03:130)

---

## Punti da decidere

### 1 · Imprevisti che smentiscono la chiamata accanto
Un imprevisto non può essere condizionato (src/dati/imprevisti.ts:60), quindi deve reggere qualunque scelta vicina:
- e02: subito dopo la chiamata sull'ultimo treno (M e02:813; «trattieni» o «parte all'orario», T e02:99, 101) arriva
  «ultimo treno soppresso per guasto. Il prossimo domattina» (I e02:164, `dopo` 2 = dopo l'ultimo treno; T e02:199).
  E il verbale a fatica dice «i treni sono partiti tutti» (T e02:115) anche con *sala d'attesa* o *annuncio*.
- e03: «Il bus notturno salta la fermata … Seicento ospiti a piedi» (T e03:162), ma gli ospiti sono venuti in pullman
  (T e03:28, 122) e la chiamata prima li scorta «fino ai pullman» (T e03:97-99).
- e01: l'ambulanza bloccata «dai pullman in anticipo» (T e01:143) arriva prima della chiamata che li annuncia (I e01:8 `dopo` 2; M e01:215, T e01:36).
- **A (consigliata) · Riscrivere i tre imprevisti.** e02: un treno *ritardato* o un guasto ai tornelli della stazione; e03: navetta dei residenti o pullman che non trova l'uscita; e01: `dopo` 3. Costo: 3 testi + 1 numero; effetti invariati, nessuna rimisura.
- **B · Spostare l'imprevisto di e02 e la sola `dopo` di e01.** e02 soppresso a `dopo` 1 (prima dell'ultimo treno) e testo «treno in ritardo». Costo: e03 resta contraddetto.
- **C · Lasciare così.** Costo: il giocatore sceglie sul treno e un attimo dopo il treno non c'è più.

### 2 · Testi che promettono ciò che i dati non fanno
- e01 *chiedi i rinforzi*: «Se lo ricorderanno a lungo» (T e01:41), «qualcuno scrive il tuo nome su un quaderno» (T e01:38); la fiducia l'ha tolta D-160 (fiducia-d160.json:7). In e03 la stessa scelta costa −2 fiducia (M e03:575-590).
- e02 *trattieni il treno*: «le ferrovie non gradiscono» (T e02:160), «annotano il favore» (T e02:100); fiducia tolta da D-160 (fiducia-d160.json:180).
- e01 *sospendi*: «la curva si svuota di tensione» (T e01:117), ma l'effetto è solo −3 P (M e01:375-386).
- e01 Lavezzari *accetta*: «Arrivano sei pettorine arancioni» (T e01:139), nessuno steward nei dati (M e01:645-660).
- e03 *presidio sotto il balcone*: «Una squadra sotto il balcone» (T e03:80), nessuna squadra impegnata (M e03:606-621).
- **A (consigliata) · Testi allineati ai dati.** Per le due voci D-160 vale D-190 (si corregge il testo, non la fiducia); le altre tre risposte si riscrivono. In e01 la differenza coi rinforzi di e03 la spiega già il vice («Tutti chiedono rinforzi il primo giorno», T e01:42). Costo: 7 righe di testo, nessuna rimisura.
- **B · Dare il prezzo dove D-160 non c'entra.** Ad esempio +1 T curva Kiln a *sospendi*, −1 steward a Lavezzari. Costo: 2-3 effetti e la rimisura col bot.
- **C · Lasciare così.** Costo: il testo promette conseguenze che non arrivano, contro D-189 regola 1.

### 3 · Risposte gratis che vincono sempre (dopo D-160)
Tolta la fiducia (D-160), diverse chiamate hanno una risposta che abbassa la pressione senza costo, o che non fa nulla
mentre le altre fanno solo danno:
- *sospendi* (e01) −3 P (M e01:375) e *pausa dall'arbitro* (e02) −3 P (M e02:641), contro lo steward che dà −1/−2 e +1 T.
- *accoglienza* (e02) −2 P (M e02:322) e *trattieni il treno* (e02) −2 P (M e02:819), senza alcun costo.
- «non fare» che vince: *niente interviste* (M e01:697) contro +2 T, *declina il saluto* (M e02:863) contro +3 T, *lascialo* lo striscione (M e02:610) contro +2 P o +2 T.
- Restano fuori di proposito *ignora* l'ufficio (M e01:206) e *presidiamo noi* (M e02:213): le fonti sono false (M e01:19, e02:31), regola D-152.
- **A (consigliata) · Prezzo in pressione o tensione, mai in fiducia.** Le due pause +1 T sulla curva avversaria (i testi parlano di «fischi da tutto lo stadio», T e01:53; «da entrambe le curve», T e02:75); *accoglienza* e *trattieni il treno* +1 P sul viale; le tre «non fare» restano (sono scelte prudenti, non gratuite). Costo: 4 effetti, 4 righe di costo, rimisura col bot (D-154, D-160).
- **B · Solo le due pause.** Costo: 2 effetti; e02 resta con due risposte ovvie.
- **C · Lasciare così.** Costo: nel primo episodio s'impara che fermare la partita non costa mai.

### 4 · e03 dà fiducia a scelte che alzano tensione o pressione
In e02 D-202 ha tolto la fiducia a *comunicato* perché «dava fiducia alzando la tensione di 2» (DECISIONI.md:213).
In e03 lo stesso schema c'è sei volte: *comunicato* +1 fiducia/+2 T (M e03:435), *commento* in tv +1/+2 T (M e03:869),
*sfogo* ai rigori +1/+1 T su due curve (M e03:666), *prometti un presidio* +1/+2 P (M e03:237), *dove capita* +1/+2 P (M e03:277),
*solo multe* +1/+1 P (M e03:184). La gemella di e01 (*intervista*) ha perso la fiducia con D-160 (fiducia-d160.json:10).
fiducia-d160.json non ha voci di e03: se e03 sia stato misurato e trovato a posto, Non posso confermarlo.
- **A (consigliata) · Misurare prima.** `tools/misura-fiducia.mjs` su e03 e correzione D-160 solo dove la misura lo dice. Costo: un giro di misura, poi 0-6 effetti e testi del costo.
- **B · Allineare subito le due gemelle.** *comunicato* e *commento* senza fiducia, come e02 ed e01. Costo: 2 effetti, 2 testi, rimisura (D-180).
- **C · Lasciare così.** Costo: in e03 conviene ancora parlare alla stampa, in e01 no.

### 5 · Il presidente dello Skyfield in tutti e tre gli episodi
e01 lo presenta (M e01:437, segna `presidente_incontrato` a M e01:452); poi offre un favore in e02 (due steward, M e02:513)
e in e03 (luci spente, M e03:295), sempre in cambio di −1 fiducia. D-138 lo tiene «solo dove il favore pesa (e05, e06, e09)»
(DECISIONI.md:149); D-186 e D-189 lo hanno tolto da e11, e17, e24 (DECISIONI.md:197, 200).
- **A (consigliata) · Toglierlo da e02.** e01 apre il filo, e03 ha un favore legato alla storia (le luci del suo stadio); il primo ritorno resta e05. Costo: 1 chiamata condizionata in meno (M e02:513), l'ondata 2 resta con 4 chiamate + imprevisto; rimisura col bot.
- **B · Toglierlo da e03.** Costo: 1 chiamata in meno (M e03:295); il quartiere perde il suo unico −3 P.
- **C · Lasciare com'è.** Costo: il presidente arriva in cinque dei primi sei episodi (e01, e02, e03, e05, e06; in e04 nessuna chiamata, M e04 senza «presidente»).

### 6 · La stessa chiamata tre volte, e Malvasi che cambia idea sul pareggio
- *Fumogeni* con steward / pausa / lascia correre in e01 e in e02, stessa struttura (M e01:352, M e02:619).
- *Trattieni gli ospiti in curva* all'ultima ondata in tutti e tre (M e01:572, e02:775, e03:720), sempre dal vice, sempre −2 P fuori e +1/+2 T in curva.
- *Striscione* da togliere o lasciare (M e01:278, e02:580), *troupe* da concedere o no (M e01:679, e03:863).
- Malvasi sul pareggio: «il risultato peggiore» (T e01:83), poi «il risultato più sicuro» (T e02:98), e in e10 di nuovo «Lo dico da due anni. Nessuno mi ascolta» (T e10:81). Stessa battuta tre volte, con due opinioni opposte.
- **A (consigliata) · Togliere il doppione dei fumogeni da e02 e sistemare la battuta di e02.** «Trattieni» resta (è lo strumento del deflusso, in-mondo); la riga del vice in e02 diventa un'altra scommessa sul risultato. Costo: 1 chiamata in meno (l'ondata 3 resta con 2 + condizionate + imprevisto), 1 riga, rimisura col bot.
- **B · Solo la battuta.** Costo: 1 riga; i fumogeni restano due volte di fila.
- **C · Lasciare così.** Costo: i primi due episodi si somigliano proprio dove il giocatore impara.

### 7 · Le transenne di e03 (PO-035)
PO-035 è ancora PARZIALE: «resta: giudizio del PO sui testi di e03» (BACKLOG.md:41). Le transenne esistono solo in e03
(D-203, DECISIONI.md:214) e la guida non ne parla più (comune.json:124). Le spiega solo Malvasi: restano montate fino a fine
serata (T e03:120, regola D-082, DECISIONI.md:93); dove rendono di più (quartiere 4, M e03:124) non lo dice nessun testo, la mappa
vieta solo i settori dove non servono (src/resa/App.tsx:269). Il quartiere riceve la pressione più alta della notte (7, M e03:700-703):
se due transenne montate subito lo chiudano per tutta la sera, Non posso confermarlo senza la misura (tools/fisse.mjs).
- **A (consigliata) · Mezza frase in più e PO-035 chiusa.** intro2: «… dopo non si spostano. Fra le case rendono il doppio.» Costo: 1 riga; nessuna rimisura.
- **B · A + misura della scelta ovvia.** Bot su e03 con e senza transenne nel quartiere all'ondata 1; se domina, si scende a 1 transenna. Costo: un giro di misura ed eventuale taratura.
- **C · Lasciare così e chiudere PO-035.** Costo: il giocatore scopre l'efficacia solo provando.

### 8 · e01 è il primo episodio: l'obiettivo si capisce?
La guida si apre prima del primo episodio (src/resa/App.tsx:126) e dice come si vince (guida.6, comune.json:128);
la home dice «Tieni la città calma nei giorni di partita» (comune.json:32). Dentro e01 però l'intro parla di scommessa e fonti
(T e01:16-17), mai di tensione e fiducia; e01 è anche denso: 5 chiamate + imprevisto in ondata 1 e in ondata 3 (M e01:134-278,
566-706), quasi tutte a tre risposte, e un'ultima chiamata (pagare il ragazzo) che apre un filo di dodici episodi.
- **A (consigliata) · Una riga di obiettivo nell'intro.** intro2: «… fidati di poche. E ricorda: stasera conta che le strade restino fredde e che il comando si fidi di te.» Costo: 1 riga (+ variante @f se serve).
- **B · A + alleggerire l'ondata 1.** Togliere lo striscione (M e01:278) dalla prima ondata. Costo: 1 chiamata, rimisura col bot.
- **C · Lasciare alla guida.** Costo: chi salta la guida entra in e01 senza sapere cosa conta.
