# Scheda di rifinitura e22–e24 (D-135)

Fonti: `data/missioni/eNN.json` (M) e `data/testi/it/eNN.json` (T). Le righe sono `file:riga`.
Legenda effetti: **P** = pressione sul settore, **T** = tensione sul settore, **fiducia** = variabile `credito`.
Nomi dei settori: gli id interni `cinderwick` = Kiln, `larkspire` = Skyfield, `saltmere` = Stoneway (T e24:3, 6).
Esiti comuni ai tre episodi (M e22:784, e23:793, e24:887): **contenuto** se tensione massima ≤ 3 e fiducia ≥ 3;
**a fatica** se tensione massima ≤ 6; altrimenti **degenerato** (missione fallita). Gli esiti non leggono altre variabili.
Le chiamate marcate *[se …]* compaiono solo con quella variabile.

---

## e22 · «Il derby dei sospetti» (T e22:2)

**Partita:** «Derby in collina» (T e22:4). Risultato: la curva Skyfield «Ha vinto il derby» (T e22:117).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e22, blocco `risorse`).

**Trama.** Dopo la fuga del Fabbro la tua foto è in prima pagina accanto alla sua (T e22:3). Presidio al municipio
«Chi ha lasciato scappare il Fabbro?» (T e22:11), corteo Kiln con «RIDATECI IL FABBRO» (T e22:22), sindaco in tribuna.
Qualcuno in comune chiede se lo stadio vecchio è sicuro, «Accanto a lui, Tullio Varrone» (T e22:86). La sera, il presidio vuole le tue dimissioni (T e22:110).

**Ondata 1 – La città accusa**
- Il cartello (M e22:142): *vai a parlare* → +1 fiducia, +2 T piazza municipio · *mediatore* → −2 P piazza municipio, costa il mediatore · *ignoralo* → −1 fiducia, +1 P.
- «Ridateci il Fabbro» (M e22:199): *scorta* → −2 P strada Kiln, costa una squadra · *togli lo striscione* → +1 fiducia, +2 T strada Kiln · *lascia sfilare* → −1 fiducia, +1 P.
- Sindaco in tribuna (M e22:255): *rinforza la tribuna* → +1 fiducia, costa uno steward · *servizio normale* → −1 fiducia.
- [presidente incontrato] «Ti difendo in tv» (M e22:292): *accetta* → +2 fiducia, +2 T curva Kiln · *declina* → nessun effetto.

**Ondata 2 – Primo tempo**
- In rima (M e22:354): *steward* → −2 P curva Kiln, costa uno steward · *speaker* → −1 P, −1 fiducia · *lascia correre* → +2 T curva Kiln.
- Il coniglio (M e22:406): *chiedi al club di casa* → −2 P curva Skyfield, **nessun altro effetto** · *lascia correre* → +2 P curva Skyfield.
- Diretta dal presidio (M e22:438): *intervista* → +1 fiducia, +2 P piazza municipio · *niente intervista* → −1 fiducia, −1 P.

**Ondata 3 – Gli striscioni**
- Due striscioni (M e22:504): *rimuovili tutti e due* → +1 fiducia, +1 T su entrambe le curve · *steward sotto quello Kiln* → −2 P curva Kiln, costa uno steward · *lasciali* → −1 fiducia.
- Stadio sicuro? (M e22:560): *è sicuro* → −1 fiducia, −1 P piazzale · *dipende da oggi* → +1 fiducia, +1 P piazzale.
- [se informatore pagato] «Te lo sei venduto» (M e22:601): *manda la verità* → −1 fiducia, −2 P curva Kiln · *lascia perdere* → nessun effetto.

**Ondata 4 – Il ritorno**
- Salutare il presidio (M e22:662): *devia* → −2 P piazza municipio, +1 P strada Kiln · *lasciali passare* → +1 fiducia, +2 P piazza municipio.
- Dimissioni (M e22:702): *tieni il punto* → +1 fiducia, +1 P piazza municipio · *sciogli il presidio* → −2 fiducia, −3 P.
- Festa sul piazzale (M e22:742): *sgombra* → −1 fiducia, −2 P piazzale · *lasciali festeggiare* → +1 fiducia, +2 P piazzale.

**Esiti**
- Contenuto: «Derby finito, piazza svuotata, domani il giornale parlerà di calcio. Malvasi appende in bacheca la tua foto. «Così ti ricordi la faccia che avevi stamattina.»» (T e22:124)
- A fatica: «Il derby ha retto, la città un po' meno. Il presidio ha cambiato cartello: ora chiede «trasparenza». Malvasi dice che è un passo avanti.» (T e22:125)
- Degenerato: «Derby degenerato e notte lunga. I rapporti parlano di cortei per la città e di cartelli con la tua foto. Il comando chiede una relazione per domattina. Il sindaco, una per stasera.» (T e22:126)

**Malvasi / il vice (scelta)**
- «Derby in collina. La curva sale senza capo, convinta che l'abbiamo fatto scappare noi. Oggi ogni errore costa doppio.» (T e22:4)
- «La tua foto su un cartello. Io ci ho messo quindici anni ad arrivarci. Complimenti.» (T e22:12)
- «Il sindaco in tribuna. Di solito ci viene solo sotto elezioni. Fai i conti.» (T e22:33)
- «Un presidente che ti difende in tv. Domani ti chiederà qualcosa, sempre in tv.» (T e22:41)
- «Stadio vecchio non sicuro, stadio nuovo pronto. Il discorso l'ha scritto chi siede accanto al sindaco.» (T e22:87)

---

## e23 · «La pista del porto» (T e23:2)

**Partita:** il Southwind gioca a Kiln, «dieci pullman dal mare» (T e23:4). Nessun risultato dichiarato nei testi.
Risorse: 4 squadre, 6 steward, 1 mediatore (M e23, blocco `risorse`).

**Trama.** «Il telefono dei giovani porta a una società di traslochi del porto di Southwind» (T e23:3). Mentre arrivano i pullman,
un camion della stessa società passa al casello e al porto è chiesto un traghetto extra (T e23:11, 22). In curva Kiln
compare «SALUTI DAL MARE» (T e23:72); il camion porta mobili e «una sciarpa arancio e nera» (T e23:83). Il traghetto parte.

**Ondata 1 – Dal mare**
- Traslochi (M e23:144): *squadra al casello* → +1 fiducia, −2 P casello, costa una squadra · *telecamere* → −1 fiducia, −1 P · *lo stadio prima* → +1 T casello.
- Traghetto extra (M e23:201): *chiedi di ritardarlo* → −2 fiducia, −2 P casello · *annota l'orario* → nessun effetto.
- Dieci pullman (M e23:232): *steward al parcheggio riservato* → −2 P parcheggi, costa uno steward · *dove trovano posto* → +1 fiducia, +2 P parcheggi.
- [se informatore pagato] Una barca (M e23:272): *passa la soffiata* → +1 fiducia · *tienila per te* → nessun effetto.

**Ondata 2 – I pullman**
- In tondo (M e23:331, solo se non si è scelto il parcheggio riservato): *sul piazzale* → −2 P parcheggi, +2 P piazzale · *parcheggio della scuola* → −2 P parcheggi, −1 fiducia · *che girino* → +2 T parcheggi.
- Sirena (M e23:384): *steward* → −2 P curva ospiti, costa uno steward · *lascia suonare* → +1 fiducia, +2 P curva ospiti.
- Saluto da lontano (M e23:424): *controlla gli striscioni* → +1 fiducia, +2 T curva Kiln · *steward in curva* → −2 P, costa uno steward.

**Ondata 3 – La partita**
- Saluti dal mare (M e23:490): *rimuovi* → +1 fiducia, +2 T curva Kiln · *fotografalo* → −1 fiducia, −1 P curva Kiln.
- Lavezzari e il porto (M e23:531): *annota il dubbio* → +1 `sospetti_talpa` · *calmi la curva* → −1 P curva Kiln.
- Targa di Southwind (M e23:564): *fermalo* → +1 fiducia, +2 T casello · *seguilo* → −1 P casello, costa una squadra · *lascialo* → −1 fiducia.
- Non è affar suo (M e23:616): *resto sullo stadio* → +1 fiducia, +1 T casello · *continuo a guardare* → −1 fiducia, −1 P casello.

**Ondata 4 – Ritorno al mare**
- Imbarco (M e23:683): *chiedi al porto di controllare* → −2 P casello, **nessun altro effetto** · *lascia partire* → +2 P casello.
- Ripartire (M e23:715): *a scaglioni* → −1 fiducia, −2 P parcheggi · *tutti insieme* → +1 fiducia, +2 P parcheggi.
- Mescolati (M e23:755): *separa* → −2 P piazzale, +1 T curva ospiti · *lascia fare* → +1 P piazzale.

**Esiti**
- Contenuto: «Lo stadio ha retto e il casello ha parlato: un camion, una targa, un traghetto. Malvasi cerchia il porto sulla carta nautica. «Sappiamo dove guardare. Da lontano, per ora.»» (T e23:121)
- A fatica: «Pullman, tamburi e una coda al casello. La pista del porto c'è, ma è tutta da seguire. Il traghetto è partito in un orario che nessuno aveva previsto.» (T e23:122)
- Degenerato: «Tra pullman bloccati, curve accese e un camion che nessuno ha fermato, la serata è andata storta. I rapporti parlano di code fino a notte. Il traghetto, intanto, è partito.» (T e23:123)

**Malvasi / il vice (scelta)**
- «Un camion di traslochi la sera di una partita. Chi trasloca di sera? Chi non vuole farsi vedere.» (T e23:12)
- «Uno che gli porta da mangiare. Il Fabbro ha sempre avuto chi lo serve.» (T e23:37)
- «Saluti dal mare. Adesso sappiamo che manda le cartoline.» (T e23:73)
- «Strano che in comune sappiano già che guardiamo fuori città.» (T e23:91)
- «Due ore fa non sapeva cosa voleva dire il saluto. Ora garantisce da dove arriva.» (T e23:131)

---

## e24 · «Fine stagione» (T e24:2) — finale della stagione 2

**Partita:** Skyfield–Stoneway (M e24:3), «il titolo si decide qui. Un punto di differenza» (T e24:3).
Risultato: «Pari dello Skyfield all'ottantesimo» (T e24:97), «Stoneway campione per un punto» (T e24:106).
Risorse: 4 squadre, 6 steward, 1 mediatore (M e24, blocco `risorse`).

**Trama.** Ultima giornata con biglietti doppi «stesso codice e carta» (T e24:19) e sindaco in tribuna. Malvasi consegna la busta
del testimone col nome di chi ha avvisato la curva della retata (T e24:11). Il comando ordina di consegnarla (T e24:69),
qualcuno in comune minaccia con gentilezza (T e24:79). Lo Stoneway vince il titolo e festeggia sotto il municipio; Malvasi alza la posta della scommessa (T e24:120).

**Ondata 1 – L'ultima giornata**
- La busta (M e24:148): *aprila adesso* → +1 fiducia, +1 P piazza municipio · *dopo la partita* → nessun effetto.
- Stessa carta (M e24:180): *steward ai codici* → −2 P tornelli, costa uno steward · *chiudi un occhio* → −1 fiducia, −2 P · *respingili* → +1 fiducia, +2 T tornelli.
- Ci crede (M e24:236): *scorta* → −2 P strada Skyfield, costa una squadra · *mediatore* → −1 P, +1 fiducia, costa il mediatore · *lasciali scendere* → +1 fiducia, +2 P.
- [presidente incontrato] Festa in piazza (M e24:296): *d'accordo* → +1 fiducia, +2 P piazza municipio · *meglio allo stadio* → −1 fiducia, −1 P.

**Ondata 2 – Il titolo in bilico**
- Balaustre (M e24:367): *steward* → −2 P curva ospiti, costa uno steward · *speaker* → −1 P, −1 fiducia · *lascia festeggiare* → +1 fiducia, +2 P.
- Il titolo scappa (M e24:423): *steward* → −2 P curva Skyfield, costa uno steward · *il capitano sotto la curva* → −2 P, −1 fiducia · *lascia correre* → +2 T.
- Consegna (M e24:475): *consegnala* → +2 fiducia, `busta` = consegnata · *tienila tu* → −2 fiducia, `busta` = tenuta.

**Ondata 3 – Il nome**
- Il foglio (M e24:542): *registra la telefonata* → +1 fiducia, +2 P piazza municipio · *riattacca* → nessun effetto.
- [se testimone esposto] Ritratta (M e24:574): *difendilo* → −1 fiducia, −1 P · *nessun commento* → +1 T piazza municipio.
- [se testimone protetto] Conferma (M e24:615): *agli atti* → +1 fiducia, −1 P piazza municipio · *ringrazia* → nessun effetto.
- Senza biglietto (M e24:651): *steward* → −2 P tornelli, costa uno steward · *nel settore ospiti* → −1 fiducia, −2 P tornelli, +1 P curva ospiti · *tienili fuori* → +2 T tornelli.
- Pareggio (M e24:707): *pausa* → −1 fiducia, −1 P su entrambe le curve · *lascia esplodere* → +1 T su entrambe.

**Ondata 4 – Festa e rabbia**
- Campioni (M e24:777): *festa ai pullman* → −1 fiducia, −2 P piazza municipio · *festa in piazza scortata* → +1 fiducia, +2 P.
- Delusi (M e24:817): *devia* → −1 P piazza municipio, +1 P strada Skyfield · *scortali* → −1 fiducia, −2 P strada Skyfield.
- La posta (M e24:857): *accetta il caffè* → nessun effetto · *prima finisci il turno* → −1 P curva ospiti.

**Esiti**
- Contenuto: «Stagione chiusa: un campione, una città intera, nessun disastro. La busta resta un problema. Malvasi la mette via. «Il nome ce l'abbiamo. Ora serve sapere chi lo protegge.»» (T e24:128)
- A fatica: «Stagione chiusa fra mezza festa e mezza rabbia. Il nome nella busta pesa più del titolo. Il comando non chiede niente, ed è questo che preoccupa Malvasi.» (T e24:129)
- Degenerato: «Ultima giornata degenerata: festa e rabbia insieme, fino a tardi. I rapporti non finiscono più. La busta, almeno, è ancora nel cassetto.» (T e24:130)

**Malvasi / il vice (scelta)**
- «Io l'ho letta. Mi è passata la fame. E io la fame non la perdo mai.» (T e24:12)
- «Il sindaco è d'accordo. Il sindaco è d'accordo con tutti, a fine stagione.» (T e24:40)
- «Chi di dovere. Che di solito è chi non ha nessun dovere.» (T e24:70)
- «Una minaccia gentile. In comune le fanno ancora a mano, come una volta.» (T e24:80)
- «Un anno fa avrei giurato il contrario. Sbaglio, ogni tanto. Lo ammetto solo a fine stagione.» (T e24:121)

---

## Punti da decidere

### 1 · e24: i tre verbali smentiscono la scelta sulla busta
La scelta della stagione è *consegnala* / *tienila tu* (M e24:482, 498): consegnandola, «il nome finisce in un cassetto che non è il tuo» (T e24:72).
Ma gli esiti leggono solo tensione e fiducia (M e24:887) e tutti e tre parlano di una busta ancora tua: «Malvasi la mette via» (T e24:128),
«Il comando non chiede niente» (T e24:129, mentre il comando ha appena ordinato la consegna, T e24:69), «è ancora nel cassetto» (T e24:130).
Inoltre la scelta vale ±2 fiducia (4 punti di scarto sulla soglia fiducia ≥ 3); il peso in e25/e31/e33 (stato.json:68) è Non verificato.
- **A (consigliata) · Riscrivere i 3 verbali neutri.** Frasi vere in entrambi i casi (es. «Il nome, ora, sta in un cassetto»). Costo: 3 righe di testo.
- **B · Verbali diversi per busta consegnata/tenuta.** Costo: 3 verbali in più e un esito che legge `busta` (lo schema degli esiti accetta più condizioni con `tutte`, M e24:887; la resa nel verbale è Non verificata).
- **C · Lasciare così.** Costo: chi consegna la busta legge un finale che dice il contrario.

### 2 · Il finale dà per acquisite piste che il giocatore può non avere
- e23 si apre con «Il telefono dei giovani porta a una società di traslochi» (T e23:3), ma quel numero si scopre solo con `informatore_pagato`
  **e** l'opzione *passa il numero* in e21 (M e21:735, 746; T e21:119). Altrimenti l'introduzione cita un fatto mai visto.
- e24 consegna la busta del testimone e il briefing gli fa dire «Il nome ve l'ho scritto» (T e24:5) in ogni caso, anche col testimone
  `esposto`, che ha «cambiato casa. E idea» (T e19:143) e in e24 «ritratta tutto» (T e24:139).
- Il Fabbro, filo di e20–e23 (fuga, barca a Southwind, «SALUTI DAL MARE»: T e20:100, T e23:36, T e23:72), in e24 non è mai nominato (grep «Fabbro|Ferrigno» su T e24: 0 righe).
- **A (consigliata) · Rendere neutre le premesse + una riga sul Fabbro.** Intro e23 «una pista porta al porto di Southwind»; in e24 la busta arriva «prima della ritrattazione»; un cenno al porto nel verbale contenuto. Costo: circa 4 righe di testo.
- **B · Solo le premesse e23/e24.** Costo: circa 3 righe; il finale resta senza il Fabbro.
- **C · Lasciare così.** Costo: chi non ha pagato l'informatore o ha esposto il testimone trova fatti che non ha vissuto.

### 3 · Il presidente dello Skyfield torna in e22 e e24 (5 volte in stagione 2)
D-138 (DECISIONI.md:149) lo vuole «solo dove il favore pesa»; D-186 (DECISIONI.md:197) l'ha tolto da e11. In stagione 2 compare in e14 (M e14:570),
e17 (M e17:275), e20 (M e20:446), e22 (M e22:292), e24 (M e24:296). In e22 il favore pesa (ti difende in tv, +2 fiducia, la mossa più redditizia dell'episodio);
in e24 chiede solo l'assenso alla festa in piazza, «Il sindaco ci sta» (T e24:39).
- **A (consigliata) · Toglierlo da e24.** La festa la chiede la sicurezza dello Skyfield, come in e07 (D-138). Costo: riscrivere 1 chiamata (M e24:296) + rimisura.
- **B · Toglierlo da e22.** Costo: si perde l'unico favore «pubblico» della stagione; riscrivere 1 chiamata.
- **C · Lasciare com'è.** Costo: 5 comparse in 11 episodi, contro la regola D-138.

### 4 · Favori e costi promessi che i dati non applicano
- e22 *chiedi al club di casa* (M e22:412): «il club ti chiede un favore» (T e22:62), gratis; in e24 la stessa mossa (*il capitano sotto la curva*) costa −1 fiducia, «il favore ti costa fiducia» (M e24:445, T e24:64).
- e22 *lascia correre* (M e22:424): «Il club di casa apprezza» (T e22:65), nessuna fiducia: resta solo +2 P.
- e23 *chiedi al porto di controllare* (M e23:689): «fa storcere il naso» (T e23:102), gratis; la stessa richiesta fuori città in ondata 1 costa −2 fiducia (M e23:207).
- **A (consigliata) · Regola D-186.** −1 fiducia dove si promette favore/protesta, +1 dove si promette apprezzamento. Costo: 3 effetti + rimisura col bot.
- **B · Riscrivere i testi dei costi.** Costo: 3 righe; le stesse mosse restano con prezzi diversi in e22/e24 e in e23.
- **C · Lasciare così.** Costo: due opzioni gratis che battono le alternative, e prezzi incoerenti.
