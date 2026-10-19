# S-13 · Rifinitura e10–e12 (D-186, PO-039)

Partenza: `claude/valmora-l1-setup-schema-xdrbx7` @ 9424e68. Ramo: `claude/valmora-rifinitura`.
Esito in breve: **punti 1 e 4 applicati; punti 2 e 3 NON applicati**, perché vanno contro D-160 e il guardiano
`tests/fiducia-verso.test.ts` diventa rosso (misura sotto). Serve una decisione: opzioni in fondo.

## Modifiche applicate

| Punto D-186 | Prima (9424e68) | Dopo |
|---|---|---|
| 1 · presidente fuori da e11 | chiamata `fra_vicini` in M e11:457-496 (ondata 2, `se presidente_incontrato`); testi T e11:71-78 | chiamata tolta (ondata 2 chiude con `dirette`, M e11:425-456); 8 testi tolti |
| 4 · furgone fuori da e11 | chiamata `contromano` in M e11:593-632 (ondata 3, `se furgone_visto`); testi T e11:96-103 | chiamata tolta (ondata 3 chiude con `autoscala`, M e11:516-550); 8 testi tolti |

Ho scelto di **togliere** `fra_vicini` invece di riscriverla (D-186 dice «riscritta o tolta»): è il default più
semplice, nessun testo nuovo da inventare. L'ondata 3 di e11 resta con `non_di_qui` e `autoscala` (2 chiamate).
Dopo la modifica e11 non legge più `presidente_incontrato` né `furgone_visto`, e non ha più testi con «presidente» o
«furgone» (`grep -n "presidente\|furgone" data/testi/it/e11.json data/missioni/e11.json` → nessuna riga).

**Coerenza di e12 senza e11 (punto 4).** FATTO: la chiamata `contromano` di e11 *leggeva* `furgone_visto` ma non lo
impostava (M e11:599-602 prima; nessun `imposta` nelle due opzioni). `furgone_visto` lo impostano e02:723, e03:529,
e04:290, e06:489, e09:177, e09:744 ed e12:215 (la lavagna); e12 lo legge per `targa_davanti` (M e12:648).
I testi di e12 sul furgone (T e12:3, 22, 37, 86, 91-93, 126) non citano la notte di e11; T e12:86 «oggi targato anche
davanti» rimanda a un avvistamento precedente, che resta e10 (T e10:111) o e02–e09. Quindi il filo e10 → e12 regge.

## Punti 2 e 3: non applicati in fiducia (D-160), risolti col testo (D-190, sotto)

FATTO MISURATO. Le 5 opzioni a cui D-186 chiede −1 fiducia sono tutte nell'elenco delle risposte a cui **D-160** ha
tolto la fiducia apposta (verso opposto al risultato), con il valore che avevano prima (`tests/dati/fiducia-d160.json`):
`e11/non_centro/accetta_dessi11` −2, `e11/dirette/allontana_curiosi` −1, `e11/chi_paga/paga_comune` −1,
`e12/portone/chiudi_portone` −1, `e12/rinforzi/chiudi_cancelli` −1.
Ho applicato i 5 effetti (−1 `credito`) e i testi del costo, poi:
`npx vitest run tests/fiducia-verso.test.ts` → **1 rosso su 5**, «le 224 risposte corrette non toccano la fiducia»
(tests/fiducia-verso.test.ts:31): `expected [ …(5) ] to deeply equal []`, le 5 voci sopra «muove di nuovo la fiducia».
Non ho cambiato il guardiano né il suo elenco: le modifiche sono state ritirate.

Misura del bot con i punti 2-3 applicati (ritirata, solo per la decisione; `node tools/bot.mjs 200` e giocata singola
attenta/equilibrata da variabili iniziali): e11 attenta 3★ → **2★** (credito finale 8 → 5); e12 attenta resta 2★
(credito 5 → 4); e11 equilibrata 3★ (credito 9 → 8); 3★ del bot attento su 36: **17 → 16**. Casuale: 0★ invariate
(e11 140/200, e12 146/200), quindi curva invariata.

Altri casi della scheda (punto 3, ultimo trattino): `e12 ordine_scritto` (T e12:117 «La piazza resta più tranquilla») e
`e12 cordone12` (T e12:56 «La curva ospiti si calma davanti alle divise») **non promettono un costo**: regola non
applicabile. Anche loro sono comunque nell'elenco D-160.

### Opzioni per la principale (da portare al PO)
- **A (consigliata) · I 5 costi in testo, non in fiducia.** Si tiene D-160 e si riscrivono i 5 testi del costo perché
  non promettano più un prezzo che non arriva (o lo dicano narrativo, senza fiducia). Costo: 5 righe di testo, bot
  invariato, nessun guardiano toccato. Il patto col Fabbro in e11 resta senza prezzo in fiducia (e10/e12 lo hanno).
- **B · Prezzo diverso dalla fiducia.** Ad esempio +1 tensione o +1 pressione su un altro settore, nel verso del
  risultato. Costo: 5 effetti, rimisura col bot (le stelle e gli esiti si spostano, da misurare); da verificare che
  `perverseRapide` (tests/fiducia-verso.test.ts:39) resti sotto soglia.
- **C · Eccezione a D-160 per queste 5.** Si tolgono dall'elenco `fiducia-d160.json` (224 → 219) e si aggiungono i −1.
  Costo: è una revoca parziale di una decisione del PO e cambia il guardiano; e11 attenta perde la 3★ (17 → 16 su 36).

## Misure del bot prima e dopo (modifiche applicate: punti 1 e 4)

Comando: `node tools/bot.mjs 200` su 9424e68 e sul ramo; `diff` delle due uscite complete → **nessuna differenza**
(tutte le 36 missioni, tutte le strategie). Estratto e10–e12 (identico prima e dopo):

| Episodio | casuale (200) esiti · stelle | attenta | equilibrata | peggiore |
|---|---|---|---|---|
| e10 | degenerato 140, a fatica 56, contenuto 4 · 0★140 1★56 2★4 | contenuto · 3★ | contenuto · 3★ | degenerato · 0★ |
| e11 | degenerato 140, a fatica 58, contenuto 2 · 0★140 1★58 2★2 | contenuto · 3★ | contenuto · 3★ | degenerato · 0★ |
| e12 | degenerato 146, a fatica 54 · 0★146 1★54 | contenuto · 2★ | contenuto · 3★ | degenerato · 0★ |

Il bot parte dalle variabili iniziali (`presidente_incontrato` e `furgone_visto` = false, data/stato.json:26-35),
quindi le due chiamate tolte non comparivano: la misura qui sopra non le vede. Misura aggiuntiva con entrambe a
`true` (script di sola misura, casuale 200 semi, deterministiche 1): esiti e stelle **identici prima e dopo** in
e10, e11, e12 (es. e11 casuale degenerato 140, a fatica 58, contenuto 2; attenta ed equilibrata 3★). Controllo che
la misura non sia cieca: con le variabili a `true` la partita casuale di e11 prima mostrava `fra_vicini` e
`contromano`, dopo no (elenco delle chiamate viste, 13 → 11).

Vincoli: curva D-154/D-162 invariata (le 0★ del casuale non cambiano in nessun episodio); 3★ del bot attento 17/36
prima e dopo; fiducia nel verso (tests/fiducia-verso.test.ts) e bilancio C41/C42 (tests/confronto.test.ts) nelle
catene sotto.

## Catene (D-177)

3 giri di `node tools/catena.mjs governo && node tools/catena.mjs logica` su **c858edc**: governo 0/0/0, logica 0/0/0 (uscite: «Catena «logica» su c858edc: VERDE»). Le catene logica comprendono tests/fiducia-verso.test.ts e tests/confronto.test.ts (C41/C42). Questo commit aggiunge solo il rapporto e i prodotti della catena (STABILITA.json, governo.html), nessun dato di gioco.

## Non verificato
- Perché gli esiti aggregati di e11 con le variabili a `true` restano identici togliendo due chiamate con effetti
  (±1 fiducia, ±1 tensione/pressione): IPOTESI, i 200 semi non cambiano fascia di esito; non l'ho misurato voce per voce.
- `docs/partita-az/` (index.html:308, 321; partita.json:3397-3402, 3525) registra una partita passata con la chiamata
  `contromano`: è un documento storico, non l'ho rigenerato. Se la principale lo vuole allineato, va rigiocato.
- Il conto delle apparizioni del presidente in e01–e09 (scheda, punto 1C) non l'ho fatto.

---

# Blocco 2 · Rifinitura e13–e24 (D-189)

Base: 3f8cac5 + merge della principale 4f09545 (d4fc52f; conflitto solo su docs/governo/governo.html, file generato:
presa la versione della principale). Commit dei dati: **4710a90**, poi 4cbec99 (etichette `esito.*` in data/testi/it/comune.json, chieste dallo schema) e 6cc07f7 (verbale e24 consegnata da 222 a 213 caratteri, limite 220 di tools/consolidamento.mjs:7, soglia invariata). Righe «prima» su 3f8cac5, «dopo» su 4710a90.

## Regole 1 e 2 contro D-160 (blocco, riferito alla principale)

FATTO (controllo statico su tests/dati/fiducia-d160.json; il guardiano tests/fiducia-verso.test.ts:31 diventa rosso per
qualunque chiave dell'elenco che torni a toccare `credito`, come misurato in e10–e12): **19 opzioni su 20** a cui le
regole 1-2 darebbero ±1 fiducia sono nell'elenco D-160:
e13 accetta_dessi (patto, era −2), vigili_urbani; e14 rimborsa_ora; e15 navette15; e16 segui_furgone, lascia_andare,
avvisa_ospiti; e17 apri_recinto; e18 separa18; e20 prima_derby, agente_dessi, pausa20; e21 rassicura21, chiudi_anello,
lascia_ospiti21, insieme21; e22 club_l22 (favore del club), lascia_l22; e23 chiama_porto.
Non applicate in fiducia. Il PO ha scelto l'opzione A (**D-190**, via principale): si tiene D-160 e si correggono i testi (sezione «D-190» sotto). Solo **e20 patto_fabbro20** è fuori dall'elenco ed è applicato (sotto).

## Modifiche applicate

| Regola | Prima (3f8cac5) | Dopo (4710a90) |
|---|---|---|
| e13–e15 «non ora» | 7 opzioni con `"effetti": []` e costo «Nessun costo, nessun aiuto.»: e13 dopo_banco (M e13:313, T e13:45), lascia_furgone (M e13:641, T e13:106), agli_atti (M e13:757, T e13:127); e14 tieni_per_te (M e14:302, T e14:41); e15 lascia_borsa (M e15:284, T e15:41), guarda_partita (M e15:582, T e15:95), lascia15 (M e15:709, T e15:119) | +1 pressione sul settore della chiamata (M e13:313-318, 646-651, 767-772; M e14:302-307; M e15:284-289, 587-592, 719-724); costo «Non ora: nessun aiuto, e … si carica.» (stesse righe T) |
| 2 · patto e20 | patto_fabbro20 solo −2 P strada Kiln (M e20:203-213); T e20:134 «Ti rispetta: lo fa, senza chiedere niente in cambio.» | + `credito` −1 (M e20:214-217); T e20:134 «Ti rispetta: lo fa, ma il comando vede la stretta di mano e ti costa fiducia.» |
| 4 · presidente via da e17 | steward_presidente con fonte `vice` (M e17:276), testi del presidente (T e17:36-37, 43) | fonte `ufficio_sicurezza_cinderwick` (Lavezzari), come e08 in D-138 (M e17:276); T e17:36 «Lavezzari: due steward del club ai tornelli…», :37 «Il club ha fatto i conti…», :43 «Lavezzari non insiste…». Effetti e `se presidente_incontrato` invariati (come e08) |
| 4 · presidente via da e24 | festa_presidente con fonte `vice` (M e24:297); T e24:39, 42-43, 45-46 col presidente | fonte `ufficio_sicurezza_larkspire` (come e07 in D-138); T e24:39 «Sicurezza dello Skyfield: …», :42/:45 «Lo Skyfield apprezza / non gradisce», :43 «La sicurezza dello Skyfield ringrazia», :46 «Dall'altra parte ripetono…». Effetti invariati |
| 4 · telefono di e21 | curva_debole con fonte `qualcuno_in_comune` (M e21:596), T e21:91-92, 95, 97-98 | fonte `centro_sociale` (M e21:596), testi riscritti (T e21:91-92, 95, 97-98); effetti identici. Il briefing T e21:8 resta |
| 3 · e15 finale | T e15:121 «…la foto di Tano Ferrigno col capo di Railhead…» | testo neutro: «…il volantino del gemellaggio. «Ha degli amici. Ora sappiamo da dove vengono.»» |
| 3 · e16 finale | T e16:121 «…ha un fascicolo suo: targhe, orari, facce…» | testo neutro: «…resta cerchiato sulla mappa delle fonderie…» |
| 3 · e18 finale | T e18:132 «una tipografia alle fonderie»; degenerato T e18:134 «il testimone è sparito» in ogni ramo | T e18:132 «la tipografia dove lavora» (la tipografia la dice già la telefonata, T e18:11); 2 esiti nuovi `degenerato_protetto` e `degenerato_protetto_comando` (M e18:876-905), `dopo` gia auto_scorta (nelle due chiamate gemelle) e mai qualcuno_ha_parlato/conferma18; testo T e18:135 «il testimone è uscito sotto scorta» |
| 3 · e24 verbali | 3 esiti senza `dopo` (M e24:887-915) che dicono la busta ancora tua (T e24:128-130) | 3 esiti `…_consegnata` con `dopo` gia consegna/consegna_chiusa, prima di ciascun esito di base (M e24:888-910, 929-943, 954-965); testi T e24:131-133 |
| e23–e24 premesse | T e23:3 «Il telefono dei giovani porta a una società di traslochi…»; T e24:5 «Il testimone: «Il nome ve l'ho scritto. Leggetelo…»» | T e23:3 «Una pista porta al porto di Southwind.»; T e24:5 «Busta del testimone, di settimane fa: «Il nome è qui. Attenti a chi lo dite».» |
| riga sul Fabbro | T e24:128 senza Fabbro | T e24:128 e :131 chiudono con «Il Fabbro, intanto, resta una voce dal porto di Southwind.» |

Telefono «qualcuno in comune», prezzo uniforme (obbedire +1, disobbedire −1): FATTO, e19 consiglio (ringrazia +1,
chi_ti_ha −1), e22 stadio_sicuro (dubbio +1, sicuro −1), e23 non_affar_suo (obbedisci +1, continua23 −1) sono già così,
quindi nessuna modifica. e24 foglio (registra +1, riattacca 0) è una minaccia, non un ordine da obbedire: lasciata com'è
e segnalata.

**Telefono di e21: riscritto, non tolto.** MISURATO: togliendo la chiamata, le fallite del casuale in e21 salgono da 69,2% a
71,0% (1000 semi) e il passo bot dà «stagione 2: il casuale fallisce in e22 il 69.6%, meno di e21 (71.0%) oltre la
tolleranza di 1 punto (D-108)» (D-154 rosso). Come per e15/e19 in D-153/D-159, la chiamata resta con gli stessi effetti e
cambia solo chi parla. Ho ripristinato anche tests/dati/fiducia-d160.json (le due opzioni sono di nuovo presenti, 224).

**Guardiani.** Nuovo tests/finale-scelte-d189.test.ts (rosso `__NO_C189F01`, toglie i `dopo` degli esiti): verde
e18 0/900 e e24 0/900 partite con verbale che smentisce il filo; rosso e18 395/900, e24 751/900
(`npx vitest run tests/finale-scelte-d189.test.ts --silent=false`). D-153 esteso: 5 voci nuove in TESTI
(tests/coerenza-d153.test.ts, dopo la voce C37-06). tests/brevita.test.ts ha fermato due testi troppo lunghi
(e17 113 > 100, e24 92 > 80): accorciati, soglia invariata. src/logica/confronti.json rigenerato con
`node tools/confronti.mjs`, come chiede tests/confronto.test.ts (D-174).

## Misure del bot, e13–e24

`node tools/bot.mjs 200` su 9424e68 (stessi dati e13–e24 di 3f8cac5) e su 4710a90, `diff` delle uscite complete:
e01–e12 ed e25–e36 identici. In e13–e24 cambiano solo:
- **stelle: nessun cambiamento** in nessuna strategia di nessun episodio (0★/1★/2★/3★ identiche);
- e18 ed e24: gli esiti si dividono nelle varianti (es. e24 attenta `contenuto` 200 → `contenuto_consegnata` 200;
  e18 casuale `degenerato` 128 → `degenerato` 67 + `degenerato_protetto` 46 + `degenerato_protetto_comando` 15);
- e15 casuale: tensione_max media 7,20 → 7,22; «scelte a caso con schieramento attento» contenuto 72 → 52, a fatica 190 → 210.

Curva D-154, casuale a 1000 semi, stagione 2, quota a 0 stelle (dopo): e13 50,7 · e14 59,0 · e15 60,8 · e16 60,8 ·
e17 60,6 · e18 65,0 · e19 68,4 · e20 67,9 · e21 69,2 · e22 69,6 · e23 68,8 · e24 70,4; `controllaDifficolta(…, 2)` → [].
3★ del bot attento su 36: 17 prima e dopo (equilibrata 32).
e20 con `rapporto_dessi` = rispetto (dove compare il patto): casuale 1000 semi 0★ 653 prima e dopo (3★ 3 → 2, 2★ 19 → 20);
attenta 2★, equilibrata 3★, peggiore 0★, invariati.

## Non verificato (blocco 2)
- Perché i «non ora» (+1 P su 7 opzioni) non cambiano le stelle del casuale: IPOTESI, +1 di pressione raramente cambia la
  fascia di tensione; non l'ho misurato voce per voce.
- e17: la chiamata di Lavezzari resta legata a `presidente_incontrato` (come e08); se va slegata, decide la principale.
- e24 foglio (qualcuno in comune) non segue lo schema obbedire/disobbedire: lasciato com'è.
- Il ramo e24 `dopo_busta` + `rifiuta24` (busta letta e tenuta) usa i verbali di base; non ho rifatto il controllo di
  ogni frase in quel ramo oltre a quelle elencate nella scheda.
- S-15 lavora su e25–e36 in parallelo: tests/coerenza-d153.test.ts e src/logica/confronti.json sono file comuni, quindi
  al momento dell'unione possono esserci conflitti; confronti.json va rigenerato, non unito a mano.

## D-190 · testi dei costi (e10–e24)

Il PO ha scelto l'opzione A (D-190): si tiene D-160, effetti e guardiani invariati, e i testi del costo non promettono
più un prezzo in fiducia. Ho seguito la forma già usata nei dati, «Nessun costo in fiducia; …» (T e24 `e24.op.taci_t24.c`).
23 testi riscritti (prima → dopo, chiave `…c` in data/testi/it/eNN.json):
- e11 accetta_dessi11 «…si svuota, ma è un patto.» → «…si svuota. Nessun costo in fiducia; in cambio, domani nessun nome.» (il Fabbro chiede «domani nessuno fa nomi», T e11:56)
- e11 allontana_curiosi «…; la stampa protesta.» → «…. Nessun costo in fiducia, ma in rete qualcuno parla di censura.»
- e11 paga_comune «…; il comune paga a malincuore.» → «…. Nessun costo in fiducia: il conto arriva al comune.»
- e12 chiudi_portone «…; il comune chiede perché.» → «…. Nessun costo in fiducia; i consiglieri entrano dal retro.» (come la risposta T e12:18)
- e12 chiudi_cancelli «…; i tifosi chiusi fuori protestano.» → «…. Nessun costo in fiducia; chi resta fuori si lamenta ai cancelli.»
- e13 accetta_dessi «…, ma è un patto.» → «…. Nessun costo in fiducia; in cambio, niente nomi nel rapporto.» (T e13:93)
- e13 vigili_urbani «…non piacciono al comando.» → «…. Nessun costo in fiducia; i vigili fanno gli straordinari.»
- e14 rimborsa_ora «…; il club protesta.» → «…. Nessun costo in fiducia; il club conta i rimborsi a malincuore.»
- e15 navette15 «…; il comune paga le navette.» → «…. Nessun costo in fiducia: le navette le paga il comune.»
- e16 segui_furgone «Il comando apprezza; …» → «Nessun guadagno in fiducia; la strada da Kiln resta scoperta e si carica.»
- e16 lascia_andare «Il comando chiede perché; …» → «Nessun costo in fiducia; la strada da Kiln respira un poco.»
- e16 avvisa_ospiti «Il club ospite ringrazia; …» → «Nessun guadagno in fiducia; la curva ospiti sente l'avviso e si agita.»
- e17 apri_recinto «…non piace al comando.» → «…. Nessun costo in fiducia, anche in un giorno di sanzione.»
- e18 separa18 «…il club di casa protesta e la curva brontola.» → «La strada è più sicura, ma la curva brontola. Nessun costo in fiducia.» (la curva brontola = +1 T, c'è)
- e20 prima_derby «Il comando non perdona; …» → «Nessun costo in fiducia; la curva si calma un poco.»
- e20 agente_dessi «Il comando apprezza, ma ti costa una squadra.» → «Nessun guadagno in fiducia, e ti costa una squadra.»
- e21 rassicura21 «…; in comune non gradiscono.» → «…. Nessun costo in fiducia; in comune storcono il naso.»
- e21 chiudi_anello «Il comando apprezza; ma la piazza…» → «Nessun guadagno in fiducia; la piazza si sente in gabbia e si infuria.»
- e21 lascia_ospiti21 «Il comando apprezza che non sprechi uomini; …» → «Non sprechi uomini, ma nessun guadagno in fiducia; il quartiere si carica.»
- e21 insieme21 «Il club apprezza i tempi rapidi; …» → «Tempi rapidi, ma nessun guadagno in fiducia; l'ex fonderia si carica.»
- e22 club_l22 «…; il club ti chiede un favore.» → «…. Nessun costo in fiducia; il club se lo segna.» (la risposta T e22:63 dice «il club segna il favore»)
- e22 lascia_l22 «Il club di casa apprezza; …» → «Nessun guadagno in fiducia; la curva Skyfield si carica.»
- e23 chiama_porto «La richiesta fuori città fa storcere il naso; …» → «Il casello si alleggerisce. Nessun costo in fiducia, anche se la richiesta fuori città fa storcere il naso.»
Non toccato: e20 pausa20 «Fumo spento, la curva si calma.» (non promette nessun prezzo).
Verifica: `npx vitest run` su fiducia-verso, coerenza-d153, brevita, testi, opzioni-spiegate, costo-quando, c36-dati → 35/35;
controllo storia (`controllaConsolidamento`) → []. Gli effetti non cambiano, quindi le misure del bot sopra restano valide.
