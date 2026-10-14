# Piano approvato: i 13 club di Valmora (PO-109)

Stato: **PIANO APPROVATO** dal PO il 2026-10-14, con tre questionari sulla proposta.
- Risposte del PO: 12 episodi per stagione; sei club di Valmora da Roma Sud (Pinegrove e Belltower confermati, quattro
  quartieri d'ispirazione nuovi); tre club esterni da Quartiere Africano, San Paolo e Anagnina; stemmi anche per i
  club che non li hanno.
- Restano da approvare solo i nomi nuovi e i punti della sezione 7.
- Nessun dato di gioco e nessun codice toccato da questo documento.

Legenda:
- **FATTO MISURATO** = letto nei file, con file:riga o comando;
- **PROPOSTA** = scelta ancora da confermare;
- **IPOTESI** = non verificata.

Il mondo resta finzione dichiarata: i quartieri di Roma sono solo l'immagine da cui nasce un prefisso inglese
(regola D-124), mai un nome reale portato nel gioco.

## 0. Il problema in breve

FATTO MISURATO
- La promessa: «Una metropoli inventata con 13 club di calcio. Ogni club è il simbolo del suo quartiere»
  (data/testi/it/comune.json:78); «13 club di calcio inventati» (docs/BIBBIA.md:8); «metropoli inventata con 13
  club di calcio» (docs/governo/VISIONE.md:6); anche docs/PROMPT_TEAM.md:37 e docs/FASE0_PROPOSTA.md:29.
- I dati: 7 file in data/club/ (`ls data/club`). Nomi mostrati (D-124, docs/governo/DECISIONI.md:135):
  Kiln United (`cinderwick_united`), Skyfield Athletic (`larkspire_athletic`), Square Rovers (`calderholt_rovers`),
  Arches Town (`mossgarth_town`), Studio Town (`ollerbrook_town`), Garden Albion (`quillhaven_albion`), Stoneway
  Wanderers (`saltmere_wanderers`); testi in comune.json:2,3,37,42, bozze_s1.json:2, bozze_s2.json:16, bozze_s3.json:2.
- Peggio della differenza 7 contro 13: **dei 7 club solo 2 sono di Valmora nei testi**. Gli altri 5 sono scritti
  come club di fuori città (sezione 1.2).
- L'indice della triade usa ancora i nomi vecchi e dice che i club «restano da nominare» (docs/INDICE_TRIADE.md:7-8).

## 1. Censimento misurato (e01–e36)

Metodo (riproducibile, dalla radice del repo):
- club nei dati: `grep -no '"club": "[a-z_]*"' data/missioni/eNN.json` (settori ed eventi);
- club nei testi: ricerca dei 7 prefissi (Kiln, Skyfield, Square, Arches, Studio, Garden, Stoneway) e dei suffissi
  brevi (Rovers, Albion, Wanderers, Town) in data/testi/it/eNN.json;
- casa–ospite: battute `eNN.intro1`/`eNN.intro2` (righe 3-4 di quasi tutti i file testi; e03 righe 119-120);
- «da fuori»: `grep -n -i 'fuori città\|da fuori\|trasferta\|provincia\|in treno\|pullman\|chilometri\|porto di'`.

### 1.1 Tabella episodio → club

Abbreviazioni: Ki Kiln · Sk Skyfield · Sq Square · Ar Arches · St Studio · Ga Garden · Sw Stoneway.
«Dati» = campo `club` in data/missioni/eNN.json (riga). «Partita» = chi gioca, dalla battuta citata.
«Citati» = club nominati nei testi senza essere in campo.

| ep | st. | partita (fonte) | dati: campo club (riga) | citati soltanto |
|----|-----|-----------------|-------------------------|-----------------|
| e01 | 1 | Ki–Sk derby (e01.json:17) | Ki 42 · Sk 51 | – |
| e02 | 1 | Sk–Sq, ospiti in treno (e02.json:3-4) | Sq 57,74 · Sk 83 | – |
| e03 | 1 | Sk–Ga, coppa (e03.json:119) | Ga 58,75 · Sk 84 | – |
| e04 | 1 | Ki–Sq, mercato (e04.json:3) | Ki 58 · Sq 75 | – |
| e05 | 1 | Sk–Ga, sciopero (e05.json:3) | Sk 74 · Ga 83 | – |
| e06 | 1 | Ki–Ga + concerto (e06.json:3) | Ki 74,141 · Ga 83 | Sk (presidente, e06.json:94) |
| e07 | 1 | Sk–Sw neopromossa (e07.json:3) | Sw 50,67,76 · Sk 346,490 | – |
| e08 | 1 | Ki–Sq, il Fabbro (e08.json:3-4) | Ki 50 · Sq 59 | Sk (presidente, e08.json:72) |
| e09 | 1 | Sk–Sq, tangenziale (e09.json:3; casa Sk da e09.json:22) | Sk 74 · Sq 83 | – |
| e10 | 1 | Sk–Ki derby di ritorno (e10.json:3) | Sk 50 · Ki 59 | – |
| e11 | 1 | Ki ha perso «fuori», notte nel quartiere (e11.json:3) | Ki 82 | Sk (presidente, e11.json:71); avversario mai nominato |
| e12 | 1 | Ki–Sw, ultima (e12.json:4) | Ki 50 · Sw 59 | Sk (presidente, e12.json:69) |
| e13 | 2 | Ki–Sq amichevole + concertone (e13.json:3) | Ki 74 · Sq 689 (evento) | – |
| e14 | 2 | Sk–Ga, biglietti doppi (e14.json:4) | Sk 66 · Ga 75 | – |
| e15 | 2 | Ki–Sq + gemellati St (e15.json:3-4) | St 66,631 · Ki 75,130,305 · Sq 84 | – |
| e16 | 2 | Ki–Ga, magazzino (e16.json:4) | Ki 66 · Ga 83 | – |
| e17 | 2 | Ki a porte chiuse + sciopero (e17.json:3-4) | Ki 643 | Sk (presidente e tifosi, e17.json:36,80); avversario mai nominato |
| e18 | 2 | Sk–Sq, testimone (e18.json:4) | Sq 50 · Sk 67 | – |
| e19 | 2 | Ki–Sq, retata (e19.json:4) | Ki 50 · Sq 83 | – |
| e20 | 2 | derby Ki–Sk, fuga (e20.json:3) | Ki 50 · Sk 59 | – |
| e21 | 2 | sgombero ex fonderia, niente partita (e21.json:3-4) | Ki 50 | Ga (porto, e21.json:119) |
| e22 | 2 | derby in collina (e22.json:4) | Ki 50 · Sk 59 | – |
| e23 | 2 | Ki–Ga, pista del porto (e23.json:3-4) | Ki 50 · Ga 59,68,85 | – |
| e24 | 2 | Sk–Ga, fine stagione (e24.json:3) | Ga 50 · Sk 67 | – |
| e25 | 3 | Ki–Sq, vertice (e25.json:4) | Ki 50 | Sq solo nei testi (e25.json:4,6,10) |
| e26 | 3 | Sk–Ga, finale di coppa (e26.json:3) | Ga 58,84 · Sk 67 | – |
| e27 | 3 | Ki–Sq + gemellati St (e27.json:3-4) | Ki 50 · St 59 · Sq 68 | – |
| e28 | 3 | Ki–Ar, trasferta vietata (e28.json:4) | Ki 50 · Ar 129 (evento) | – |
| e29 | 3 | Ki–Ga, cattura (e29.json:4) | Ki 50 · Ga 59 | – |
| e30 | 3 | partita rinviata, corteo (e30.json:3-4) | Ki 287,453,611 | Sk (gruppo, e30.json:84) |
| e31 | 3 | Sk–Sq, fascicolo (e31.json:4) | Sq 58,83 | Sk in testi, curva assente («diserta», e31.json:4) |
| e32 | 3 | derby Ki–Sk (e32.json:4) | Ki 50 · Sk 59 | – |
| e33 | 3 | Sk–Ar, la talpa (e33.json:4) | Sk 50 · Ar 59,76 | Ki (talpa, e33.json:118) |
| e34 | 3 | Ki–Ga, l'interim scade (e34.json:4) | Ki 58 · Ga 67,84 | – |
| e35 | 3 | rapina, niente partita (e35.json:3-4) | nessuno | nessuno |
| e36 | 3 | Ki–Sk, resa dei conti (e36.json:4) | Ki 50 · Sk 59 | – |

Conteggio degli episodi in cui un club è in campo o arriva come tifoseria (FATTO, dalla tabella):
Kiln 24 · Skyfield 17 · **Square 11** · **Garden 10** · Stoneway 2 (e07, e12) · Studio 2 (e15, e27) · Arches 2 (e28, e33).
Senza avversario nominato: e11, e17, e21, e30, e35.

Fonti di club usate nei briefing e nelle chiamate (FATTO, `grep -o '"fonte": "club[a-z_]*"'`):
`club_ospite` (= «Responsabile dei Square Rovers», comune.json:36) in e02, e04, e08, e09, e13, e15, e18, e19;
`club_quillhaven` (Garden, comune.json:41) in e03, e05, e06, e14, e16, e21, e23, e24, e26, e29, e34;
`club_saltmere` in e07, e12; `club_mossgarth` in e28, e33; `gemellati` in e27 (bozze_s3.json:6).

### 1.2 Chi oggi viene «da fuori città» (FATTO, file:riga)

| club | prova nei testi | conclusione |
|------|-----------------|-------------|
| Square | «Arrivano i Square Rovers, tutti in treno» e02.json:3 · «Se lo perdono, restano in città fino a domattina» e02.json:102 · «i Rovers arrivano lo stesso … con un treno solo» e25.json:6 · «l'ultimo treno per Square» e31.json:114 · BIBBIA: «arrivano in treno da fuori città» docs/BIBBIA.md:62 · D-071 «arriva in treno» DECISIONI.md:82 | fuori città |
| Garden | «società di traslochi del porto di Garden» e23.json:3 · «dieci pullman dal mare … Noi a Garden non andiamo» e23.json:4 · «Ufficio del porto di Garden» e23.json:5, bozze_s2.json:15 · «Indirizzo: il porto di Garden» e21.json:119 · «la richiesta fuori città ti costa fiducia» e23.json:24, 102 · «seicento, in pullman» e03.json:28 | fuori città, sul mare |
| Stoneway | «giornale di provincia … Prima trasferta in città» e07.json:3 · «arrivano per la prima volta in città» e07.json:10 | fuori città |
| Studio | «viene a cantare con la curva Kiln. Da trecento chilometri» e15.json:3 · «dopo trecento chilometri» e15.json:61 · «il treno per Studio» e27.json:102 | fuori città, lontano |
| Arches | «trasferta vietata, ma i tifosi del Arches arrivano lo stesso, in auto» e28.json:7 (anche :4, :10) · «trasferta tranquilla» e33.json:7 | ambiguo: «trasferta» si usa anche dentro la città («Siamo in trasferta, ma per noi la città è una», e10.json:51) |
| Kiln, Skyfield | quartieri di Valmora (BIBBIA.md:37, D-032) | in città |

Altre righe «da fuori» che **non** riguardano un club (restano come sono): l'avversario della sconfitta di Kiln
(«quattro a zero fuori … due ore di treno», e11.json:3, 12); gente e auto «da fuori» nei disordini (e11.json:39, 85);
il furgone e la fuga verso fuori (e04.json:104, e16.json:103, e20.json:100, 106).

### 1.3 Due anomalie trovate per strada (FATTO)
- **Articoli sbagliati dopo D-124** (84 occorrenze misurate su questo ramo): secondo la sessione principale
  sono già stati corretti sulla principale (109 correzioni). Non l'ho verificato su questo ramo, e qui non è più una decisione.
- **e21, fonte che non corrisponde al testo**: due chiamate hanno `"fonte": "club_quillhaven"` (data/missioni/e21.json:239, 708)
  ma il testo è «In rete: …» (e21.json:29 dei testi) e «Comando: …» (e21.json:108 dei testi).

## 2. I 13 club di Valmora (APPROVATO dal PO il 14/10, coi cambi della seconda risposta)

### 2.1 Mappa dei quartieri
- **Est, lungo le due grandi strade che escono dalla città**: Kiln (fonderie), Pinegrove, Domepark, Waterline,
  Lookout; in fondo, Tramway e le torri di Belltower.
- **Sopra l'Est**: la collina di Skyfield.
- **Sud-est, lungo la ferrovia e gli acquedotti**: Square, Arches, Studio.
- **Sud, sul fiume**: Garden.
- **Margine verde**: Stoneway, lungo la strada antica.

Le **banchine del porto fluviale** (settori `banchine` in e28, e29, e35) non appartengono a nessun club. Nei testi
non hanno mai un quartiere. FATTO, con `grep -n 'porto' data/testi/it/e2[7-9].json data/testi/it/e35.json`: nessuna
riga dice di chi è il porto. L'unica riga che nomina un club accanto al porto è e27.json:112, dove il responsabile
dei gemellati lascia un indirizzo del porto; dopo il cambio quel responsabile è di Railhead. È l'adattamento più semplice del ruolo che la prima stesura dava a Gasworks:
nessuna riga cambia.

### 2.2 I 7 club esistenti
Colori e stemmi come oggi (FATTO, data/club/*.json). Gli stemmi mancanti si aggiungono (risposta 4 del PO, sezione 2.4).

| club (id) | colori | stemma | quartiere |
|-----------|--------|--------|-----------|
| Kiln United (cinderwick_united) | #ff6a13 arancio · #1a1a1a nero | scudo, ciminiera | Kiln: fonderie e ciminiere (BIBBIA.md:37) |
| Skyfield Athletic (larkspire_athletic) | #2fa7ff azzurro · #ffffff bianco | tondo, collina | Skyfield: la collina elegante (BIBBIA.md:37) |
| Square Rovers (calderholt_rovers) | #1e7b4a verde · #f2c230 giallo | scudo, calderone | Square: lo scalo ferroviario |
| Arches Town (mossgarth_town) | #546e7a ardesia · #c0ca33 lime | **nuovo**: tondo, arco | Arches: le case sotto gli archi del vecchio acquedotto |
| Studio Town (ollerbrook_town) | #00897b verde acqua · #cfd8dc grigio chiaro | **nuovo**: rombo, ciak | Studio: i teatri di posa |
| Garden Albion (quillhaven_albion) | #1b2a6b blu notte · #d62839 rosso | rombo, penna | Garden: case popolari coi cortili-giardino, sul fiume |
| Stoneway Wanderers (saltmere_wanderers) | #5d4037 marrone · #e9c46a sabbia | **nuovo**: scudo, pietra miliare | Stoneway: la strada di pietra al margine verde |

### 2.3 I sei club nuovi
Regola D-124: inglese, suffisso classico, prefisso = immagine del quartiere di Roma Sud, mai il suo nome.
Pinegrove e Belltower erano già approvati. Gli altri quattro sono una PROPOSTA nata dalla seconda risposta del PO,
che va confermata.

| nome | ispirazione → immagine | quartiere di Valmora | colori | stemma | curva in una riga | rivalità |
|------|------------------------|----------------------|--------|--------|-------------------|----------|
| **Pinegrove Rangers** | Pigneto → il bosco di pini | Pinegrove: case basse fra i binari, osterie, muri dipinti | #6a1b9a viola · #ffc107 oro | tondo, pigna | tamburi e striscioni dipinti a mano, ironica, mai puntuale | Kiln (vicini di mercato) |
| **Belltower Harriers** | Tor Bella Monaca → la torre bella | Belltower: torri di case all'estremo est | #ec407a rosa · #263238 antracite | scudo, campanile | la più lontana: arriva tardi, tutta insieme, rumorosissima | Tramway («derby del capolinea») |
| **Waterline City** | Alessandrino → l'acqua che l'acquedotto porta attraverso il quartiere | Waterline: i lotti lungo la linea dell'acqua | #f5f5f5 bianco · #0d47a1 blu | rombo, tre onde | bandiere bianche e blu, cori lunghi e lenti | Lookout (vicini di casa) |
| **Lookout FC** | Torre Maura → la torre di vedetta in mezzo ai campi | Lookout: case basse attorno alla vecchia torre | #c62828 rosso · #f5f5f5 bianco | scudo, torre merlata con feritoia | pochi, sempre in piedi: la curva che fischia per prima | Waterline |
| **Domepark Villa** | Villa Gordiani → il parco con le rovine a cupola | Domepark: palazzine attorno al parco delle rovine | #121212 nero · #f5f5f5 bianco | tondo, cupola | si ritrova al parco prima della partita, tamburi sotto gli alberi | Skyfield (il parco contro la collina: si affrontano in e05 ed e26) |
| **Tramway Borough** | Giardinetti → il capolinea del trenino | Tramway: il capolinea e le case attorno ai binari del tram | #fbc02d giallo · #1565c0 blu royal | rombo, vettura del tram | arriva col trenino tutta insieme, cori a tempo di rotaia | Belltower |

Note sulle immagini:
- Giardinetti non si traduce con «giardini», perché Garden esiste già: per questo l'immagine è il trenino.
- Lookout e Belltower hanno entrambi una torre: le immagini restano diverse (vedetta contro campanile), e lo stesso
  vale per gli stemmi (torre merlata contro campanile).
- Waterline e Arches nascono entrambi da un acquedotto: Arches prende gli archi, Waterline l'acqua.

Ruoli della prima stesura che non esistono più, con l'adattamento più semplice:
- il gasometro e il porto fluviale di Gasworks → le banchine restano senza club (2.1);
- il «derby del fiume» Gasworks–Shardhill → non c'è più. Le rivalità nuove nascono dai vicini e dagli accoppiamenti
  del calendario (4.1);
- Marble, i «ricchi nuovi contro Skyfield» → Domepark–Skyfield, «il parco contro la collina»;
- l'ipotesi del cantiere dello stadio nuovo a Marble → cade: il cantiere resta dov'è nei dati (`cantiere_stadio_nuovo`
  in e35 ed e36), senza quartiere.

Rischio di contenuto (PROPOSTA): le curve nuove non devono richiamare stereotipi dei quartieri veri da cui viene
l'immagine, soprattutto per le periferie.

### 2.4 Stemmi da disegnare (risposta 4 del PO)
FATTO: gli stemmi si disegnano in src/resa/stemma.tsx.
- Forme: scudo, tondo e rombo.
- Simboli: tracciati SVG in un riquadro di circa 40×40, per esempio la ciminiera a stemma.tsx:16 e la collina a :18.
- Senza simbolo il gioco mostra le iniziali (stemma.tsx:32).

Descrizione dei 12 simboli nuovi, a tinta unita come quelli esistenti:

| club | forma | simbolo | come disegnarlo |
|------|-------|---------|-----------------|
| Arches | tondo | arco | due pilastri e un arco a tutto sesto, con un secondo arco più piccolo dietro, a metà altezza |
| Studio | rombo | ciak | rettangolo della lavagnetta con l'asta incernierata in alto, aperta di 20°, e tre strisce diagonali sull'asta |
| Stoneway | scudo | pietra miliare | cippo a colonna bassa con la cima arrotondata, una tacca orizzontale e la base squadrata |
| Pinegrove | tondo | pigna | ovale a punta in basso con le scaglie a rombi (tre file) e un ciuffo di tre aghi in alto |
| Belltower | scudo | campanile | torre stretta con la cella aperta in alto e la campana dentro, tetto a punta |
| Waterline | rombo | tre onde | tre linee ondulate parallele, spessore 2 |
| Lookout | scudo | torre di vedetta | torre larga con tre merli e una feritoia verticale |
| Domepark | tondo | cupola | mezza sfera su un tamburo con tre finestre ad arco |
| Tramway | rombo | tram | profilo della vettura (rettangolo coi bordi arrotondati, tre finestrini) col pantografo a V sul tetto |
| Railhead (esterno) | scudo | fine linea | due binari che convergono verso l'alto e finiscono contro un respingente |
| Southwind (esterno) | rombo | ancora | ancora con l'anello in alto e i bracci curvi |
| Wallgate (esterno) | scudo | porta nelle mura | arco d'ingresso fra due torri merlate |

**Colori** (FATTO MISURATO, distanza euclidea RGB fra colori primari, la stessa misura grezza di tools/foto-club.mjs):
- Minimo fra i 16 club (13 di Valmora + 3 esterni): 59 (Square–Studio), cioè quello che c'è già oggi fra i 7 esistenti.
- Per ogni club nuovo, la distanza dal primario più vicino:

| club | distanza | club più vicino |
|------|----------|-----------------|
| Pinegrove | 92 | Arches |
| Belltower | 94 | Lookout |
| Waterline | 113 | Railhead |
| Lookout | 90 | Kiln |
| Domepark | 93 | Garden |
| Tramway | 90 | Kiln |
| Railhead | 107 | Wallgate |
| Southwind | 131 | Square |
| Wallgate | 102 | Tramway |

Il salmone di Wallgate sta a 142 dall'arancio di Kiln.

Comando:
```
python3 -c "
P={'Kiln':'#ff6a13','Skyfield':'#2fa7ff','Square':'#1e7b4a','Arches':'#546e7a','Studio':'#00897b','Garden':'#1b2a6b','Stoneway':'#5d4037','Pinegrove':'#6a1b9a','Belltower':'#ec407a','Waterline':'#f5f5f5','Lookout':'#c62828','Domepark':'#121212','Tramway':'#fbc02d','Railhead':'#b39ddb','Southwind':'#64dd17','Wallgate':'#ffab91'}
rgb=lambda h:[int(h[i:i+2],16) for i in (1,3,5)]
d=lambda a,b:sum((x-y)**2 for x,y in zip(rgb(a),rgb(b)))**.5
for n in P: print(n,'%.0f %s'%min((d(P[n],v),k) for k,v in P.items() if k!=n))"
```
La misura non è percettiva. Le coppie da guardare nelle foto:
- Lookout (rosso) con Kiln (arancio);
- Wallgate (salmone) con Kiln;
- Southwind (lime) col colore secondario di Arches;
- il bianco di Waterline sugli sfondi chiari della mappa.

Nomi reali: Non posso confermarlo che nessun club reale porti uno di questi nomi.
- Rischio più alto: «Lookout», «Tramway», «Waterline» e «Pinegrove», che sono parole comuni o nomi di luogo.
- «Wallgate Rovers» ripete il suffisso dello Square (vedi 3.2).

## 3. Club di fuori città (APPROVATO: tre)

Risposta 3 del PO: tre club esterni, ispirati a Quartiere Africano, San Paolo e Anagnina.
SEGNALAZIONE (non cambio la scelta): San Paolo e Anagnina sono quartieri di Roma Sud, non di Roma Nord. La direttiva
precedente del PO diceva «Le squadre da fuori devono essere ispirate a Roma Nord»; vale la scelta più recente.

| nome | ispirazione → immagine | dove sta | colori | stemma | ruoli |
|------|------------------------|----------|--------|--------|-------|
| **Railhead County** | Anagnina → il capolinea, dove finisce la linea | città lontana, trecento chilometri di treno | #b39ddb lilla · #311b92 viola scuro | scudo, fine linea | **treno + gemellati**: ospiti in treno a Skyfield (e02); gemellati della curva Kiln (e15, e27, al posto di Studio); avversario di Skyfield nella sera del fascicolo (e31) |
| **Southwind Town** | Quartiere Africano → «Africus», il nome latino del vento di libeccio: un vento di mare. L'immagine evita di proposito ogni richiamo ai nomi delle strade del quartiere | città di provincia sul mare, oltre il casello | #64dd17 verde lime · #ffffff bianco | rombo, ancora | **neopromossa + porto**: prima trasferta in città (e07, al posto di Stoneway); ultima di campionato a Kiln (e12); il suo porto nella traccia del telefono (e21.json:119) e nella pista di Ferrigno (e23, al posto di Garden) |
| **Wallgate Rovers** | San Paolo → la porta nelle mura | città vicina, due ore di treno | #ffab91 salmone · #37474f grigio scuro | scudo, porta nelle mura | **avversario di e15** (al posto di Square): arriva in treno e non sopporta i gemellati della curva Kiln (e15.json:29). PROPOSTA facoltativa: è anche la squadra che in e11 batte Kiln «quattro a zero fuori» (e11.json:3), oggi senza nome; così e15 diventa la rivincita |

### 3.1 Perché i ruoli stanno così (FATTO dai testi)
- Il treno e i gemellati stanno insieme senza toccare le righe di viaggio:
  - e02, e31: arrivo e ripartenza in treno (e02.json:3, 102; e31.json:114);
  - e15, e27: «da trecento chilometri», il binario (e15.json:3, 61; e27.json:102).
- Il club del treno non gioca mai contro Kiln: e25 passa a un club di Valmora (4.1). Così il gemellaggio con la curva
  Kiln non ha mai una partita contro.
- La neopromossa e il porto stanno insieme: prima di e07 il club non compare, quindi «per la prima volta in città»
  (e07.json:10) resta vero. Le righe «quaranta pulmini» (e07.json:3) e «dieci pullman dal mare» (e23.json:4) stanno
  bene sulla stessa città.
- L'avversario di e15 è esterno: «ognuno sul suo treno» (e15.json:121) e «prima ancora di partire» (e15.json:25)
  restano veri.
- Suffisso «Rovers» per Wallgate: in e15 le 11 righe dicono già «i Rovers» (e15.json:4, 8, 25, 29, 62, 66, 71, 106,
  107, 121, 123) e lo Square non c'è più. Con questo suffisso cambia solo il prefisso nelle righe che nominano «Square»
  (e15.json:4, 71). Il costo è un secondo club «Rovers» nella guida. Alternativa: «Wallgate Athletic», con 11 righe da
  riscrivere.

### 3.2 Il porto
- e21 ed e23: il porto di mare di Southwind, fuori città.
- Da e27 in poi: le banchine del porto fluviale di Valmora, senza club (2.1).

FATTO a sostegno:
- in e23 l'informazione «Ferrigno è ancora in città» è segnata falsa (data/missioni/e23.json, briefing
  `info_comando`, `"vera": false`);
- in e28 ed e29 le banchine stanno sulla mappa della città (settori `banchine` di tipo `porto`).

## 4. Mappa club → episodi (APPROVATA: 12 episodi per stagione, opzione A)

### 4.1 Posti e assegnazione
FATTO sui posti:
- Gli episodi con un avversario che non sia un derby sono 24.
- Agli esterni ne vanno 5: e02, e07, e12, e15, e31 (e23 non era fra i 24, perché è già esterno). Ne restano 19.
- Si aggiunge un avversario con nome dove oggi manca, senza curve nuove: e17 (porte chiuse), e21 (la partita durante
  lo sgombero, «Partita in corso» e21.json:72) ed e30 (partita rinviata). I posti diventano 22.
- e25 passa da esterno a Valmora: i club di Valmora diversi da Kiln e Skyfield sono 11, per 2 apparizioni fanno 22.
  **Il posto mancante della prima stesura è chiuso**, senza ricomparse «solo come quartiere».

Gli episodi deboli sono e17, e21 ed e30, dove l'avversario è solo nominato. Li uso soltanto come ricomparsa, mai
come presentazione.

| club | presentazione | ricomparsa | rispetto a oggi |
|------|---------------|------------|-----------------|
| Kiln, Skyfield | e01 | ovunque | niente |
| Garden | e03 | e06 | niente; perde e05, e14, e16, e23, e24, e26, e29, e34 |
| Square | e04 | e08 | niente; perde e02, e09, e13, e15, e18, e19, e25, e27, e31 |
| Domepark | e05 (al posto di Ga) | e26 (al posto di Ga) | finale di coppa contro Skyfield |
| Belltower | e09 (al posto di Sq) | e25 (al posto di Sq) | pullman in tangenziale; «un treno solo» nella zona rossa |
| Tramway | e13 (al posto di Sq) | e17 (avversario nominato) | arriva col trenino all'amichevole del concertone |
| Waterline | e14 (al posto di Ga) | e27 (al posto di Sq, coi gemellati di Railhead) | |
| Pinegrove | e16 (al posto di Ga) | e21 (avversario nominato) | vicini delle fonderie: il magazzino; lo sgombero nel quartiere accanto |
| Lookout | e18 (al posto di Sq) | e34 (al posto di Ga) | il testimone; la commissione che guarda |
| Studio | e19 (al posto di Sq) | e30 (avversario nominato) | la retata; la partita rinviata |
| Stoneway | e24 (al posto di Ga) | e29 (al posto di Ga) | il titolo contro Skyfield; la sera della cattura |
| Arches | e28 | e33 | niente |
| Railhead (esterno) | e02 | e15, e27 (gemellati), e31 | |
| Southwind (esterno) | e07 | e12, e21 (porto), e23 | |
| Wallgate (esterno) | e15 | (e11, se si nomina) | |

Presentati per stagione:
- stagione 1: Kiln, Skyfield, Garden, Square, Domepark, Belltower, più Railhead e Southwind;
- stagione 2: Tramway, Waterline, Pinegrove, Lookout, Studio, Stoneway, più Wallgate;
- stagione 3: Arches.

### 4.2 Trama (BIBBIA) e conflitti
- Restano come sono:
  - Ferrigno (BIBBIA.md:96, :10);
  - la talpa Lavezzari (BIBBIA.md:90), con e33 che resta Skyfield–Arches;
  - Varrone (BIBBIA.md:91).
- CONFLITTO 1: D-071 («Calderholt Rovers arriva in treno», DECISIONI.md:82) è superata. Il treno di e02 resta «da
  fuori città» (BIBBIA.md:62, INDICE_TRIADE.md:16), ma è di Railhead. Serve una decisione nuova che la superi.
- CONFLITTO 2: il gemellaggio passa da Studio a Railhead (e15, e27). Il verbale di e15 nomina «il capo di Stu…»
  (e15.json:121).
- CONFLITTO 3: Stoneway non è più la neopromossa, che è un ruolo dell'indice (INDICE_TRIADE.md:21) e dei testi
  (e07.json:3). Il ruolo passa a Southwind.
- CONFLITTO 4: Arches viene presentato solo in stagione 3, come oggi.
- CONFLITTO 5 (da verificare riga per riga prima di scrivere): in e17 la sicurezza dello Skyfield dice «i nostri
  scendono a piedi dalla collina» (e17.json:80). Nominare Tramway come avversario non deve far sembrare che gli
  ospiti siano quelli dello Skyfield.
- Ritmo D-092 (src/dati/ritmo.ts:1-2): non cambia, perché nessuna curva viene aggiunta o tolta.
- D-108: non cambia, perché il campo `club` non entra nel motore (src/logica/tipi.ts:28, 40). Va comunque misurato
  (passo 8.6).

## 5. Episodi per stagione (APPROVATO: 12)

FATTO: D-009 fissa 36 missioni, uscita il 2026-11-30 e ambito congelato dal 2026-11-20 (docs/governo/DECISIONI.md:20).
- Con 12 episodi per stagione non si rinumera niente: l'ordine degli episodi segue il campo `episodio`
  (src/resa/dati.ts:40) e i salvataggi seguono gli id (src/salvataggi/salvataggio.ts:28-31).
- comune.json:83 («36 episodi in tre stagioni») resta vero.
- Le opzioni B (13×3) e C (stagione 4) sono scartate.

## 6. Costi in sintesi
- **Episodi toccati: 23.**
  - Cambia l'avversario o il ruolo: e02, e05, e07, e09, e12, e13, e14, e15, e16, e18, e19, e23, e24, e25, e26, e27,
    e29, e31, e34.
  - Si aggiunge un nome: e11 (facoltativo), e17, e21, e30.
- **Restano come sono:** e01, e03, e04, e06, e08, e10, e20, e22, e28, e32, e33, e35, e36.
- **Nuovi:** 9 file in data/club/ e 12 simboli di stemma.
- **Bot:** attesi identici.

## 7. Decisioni rimaste per il PO
1. I quattro nomi nuovi (Waterline City, Lookout FC, Domepark Villa, Tramway Borough) e i nomi dei tre esterni
   (Railhead County, Southwind Town, Wallgate Rovers): approvarli o chiedere alternative.
2. Wallgate col suffisso «Rovers», che riusa le righe di e15, oppure con un altro suffisso (11 righe in più da
   riscrivere).
3. Nominare Wallgate anche in e11, come la squadra che ha battuto Kiln: sì o no.
4. Le banchine del porto fluviale senza club (consigliato), oppure in un quartiere.

## 8. PIANO DI LAVORO
Regole per tutti i passi:
- Ogni passo è piccolo e si chiude con una verifica.
- I passi segnati **P** li fa la sessione principale (dati e testi); quelli segnati **S** la sviluppatrice (stemmi e
  resa).
- Dopo ogni passo che tocca data/ si fa girare la catena logica (tipi, confini, schema, storia; il pre-push di D-117).
- Prima della promozione si fa girare la catena «completa».

### 8.1 Dati dei club — P
1. Nove file nuovi in data/club/ (schema/club.schema.json: `id`, `nome`, `colori`, `stemma`; id in minuscolo con
   underscore):
   - di Valmora: `pinegrove_rangers`, `belltower_harriers`, `waterline_city`, `lookout_fc`, `domepark_villa`,
     `tramway_borough`;
   - esterni: `railhead_county`, `southwind_town`, `wallgate_rovers`.
   - Gli stemmi, finché manca il simbolo, cadono sulle iniziali (stemma.tsx:32): il passo non rompe nulla.
   - Verifica: lo schema è verde e src/dati/semantica.ts:149 trova il nome di ogni club.
2. In data/testi/it/comune.json: nove chiavi `club.<id>` e nove fonti `fonte.club_<prefisso>` («Responsabile del …»,
   con l'articolo giusto). Verifica: catena logica verde.
3. `stemma` per arches, studio e stoneway nei loro file. Si fa dopo il passo 8.2, altrimenti punta a simboli che non
   esistono ancora e quei club cadono sulle iniziali.

### 8.2 Stemmi — S
1. In src/resa/stemma.tsx, 12 tracciati nella tabella dei simboli (accanto a :16-19), secondo le descrizioni di 2.4.
2. Verifica:
   - foto dello stemma dei 16 club a 360, 375 e 412 px;
   - tools/foto-club.mjs («stemmi della sfida, uno per club delle curve»);
   - guardiano dei valori scritti a mano (CLAUDE.md, «Interfaccia»). I colori dei club restano dati, non token, come dice lo schema (schema/club.schema.json, descrizione di `colori`).
3. Bump di GAME_VERSION col commento causa/misura/guardiano.

### 8.3 Episodi — P, un episodio per commit
Per ognuno: cambiare il campo `club` dei settori e degli eventi (righe di data/missioni dalla sezione 1.1) e la
`fonte` dove serve, poi i testi alle righe indicate (data/testi/it/eNN.json). Verifica per episodio: catena logica
verde e `node tools/bot.mjs` sull'episodio con esiti identici a prima.

| ep | cosa | data/missioni (riga `club`) | testi da riscrivere (righe) | fonte |
|----|------|-----------------------------|-----------------------------|-------|
| e02 | Square → Railhead | 57, 74 | 3, 6, 8, 10, 23, 28, 38, 40, 55, 57, 65, 68, 96, 107, 113, 115, 127, 161 | `club_ospite` → `club_railhead` |
| e05 | Garden → Domepark | 83 | 3, 7, 29, 55, 76, 82, 120 | `club_quillhaven` → `club_domepark` |
| e07 | Stoneway → Southwind | 50, 67, 76 | 3, 5, 10, 11, 22, 28, 29, 43, 57, 60, 73, 90, 99, 100, 125, 126, 127 | `club_saltmere` → `club_southwind` |
| e09 | Square → Belltower | 83 | 3, 7, 10, 32, 35, 38, 46, 60, 63, 108, 123, 126, 129 | `club_ospite` → `club_belltower` |
| e11 | (facoltativo) nominare Wallgate | – | 3 | – |
| e12 | Stoneway → Southwind | 59 | 4, 7, 46, 54, 57, 94, 97, 103 | `club_saltmere` → `club_southwind` |
| e13 | Square → Tramway | 689 | 3, 6, 34, 49, 120, 122, 123 | `club_ospite` → `club_tramway` |
| e14 | Garden → Waterline | 75 | 4, 8, 26, 52, 110, 115 | `club_quillhaven` → `club_waterline` |
| e15 | Square → Wallgate; Studio (gemellati) → Railhead | 66, 84, 631 | Square: 4, 71 (con il suffisso «Rovers»); Studio: 3, 5, 6, 11, 21, 36, 99, 121 | `club_ospite` → `club_wallgate` |
| e16 | Garden → Pinegrove | 83 | 4, 7, 40, 66, 71, 114, 117 | `club_quillhaven` → `club_pinegrove` |
| e17 | nominare Tramway | – | 3-4, e una riga che leghi gli ospiti a Tramway (attenzione a e17.json:80) | – |
| e18 | Square → Lookout | 50 | 4, 6, 22, 47, 48, 92, 108, 109, 111 | `club_ospite` → `club_lookout` |
| e19 | Square → Studio | 83 | 4, 8, 69, 72, 109, 112, 115 | `club_ospite` → `club_ollerbrook` (esiste: bozze_s2.json:11) |
| e21 | nominare Pinegrove; porto → Southwind | – | 3-4 (avversario); 119 (porto) | correggere l'anomalia delle righe 239 e 708 (1.3) |
| e23 | Garden → Southwind | 59, 68, 85 | 3, 4, 5, 6, 10, 11, 22, 29, 36, 46, 80, 99, 107 | `club_quillhaven` → `club_southwind`; `fonte.ufficio_porto` (bozze_s2.json:15) |
| e24 | Garden → Stoneway | 50 | 3, 6, 49, 87, 106, 112, 116 | `club_quillhaven` → `club_saltmere` |
| e25 | Rovers (Square) → Belltower | – (gli ospiti non hanno campo `club`) | 4, 6, 10, 22, 46, 49, 53, 55, 66, 69, 90, 96 | – |
| e26 | Garden → Domepark | 58, 84 | 3, 6, 7, 11, 42, 57, 103 | `club_quillhaven` → `club_domepark` |
| e27 | Square → Waterline; Studio (gemellati) → Railhead | 59, 68 | Square: 4, 59, 61, 62, 68, 75, 83, 84, 86; Studio: 3, 5, 22, 75, 102, 112 | `gemellati` (bozze_s3.json:6) → Railhead |
| e29 | Garden → Stoneway | 59 | 4, 6, 29, 89, 97 | `club_quillhaven` → `club_saltmere` |
| e30 | nominare Studio | – | 3-4 | – |
| e31 | Square → Railhead | 58, 83 | 4, 6, 10, 11, 15, 18, 29, 35, 40, 59, 64, 65, 66, 87, 95, 104, 114, 120, 121 | `club_ospite` → `club_railhead` |
| e34 | Garden → Lookout | 67, 84 | 4, 6, 10, 29, 54, 74, 101 | `club_quillhaven` → `club_lookout` |

Le righe sono quelle che oggi contengono il prefisso o il suffisso del club uscente
(`grep -nE 'Square|Rovers' data/testi/it/eNN.json`, ecc.), misurate su questo ramo.
- Prima di scrivere, rifare il grep: la principale ha corretto gli articoli e i numeri di riga possono essere cambiati.
- Ordine consigliato: prima gli esterni (e02, e07, e12, e15, e21, e23, e27, e31), poi i cambi d'avversario per
  stagione.

### 8.4 Documenti — P
1. docs/BIBBIA.md:
   - riga 8 («13 club»), già giusta;
   - righe 37 e 62 e la sezione e02;
   - riga 75 (Garden «di Valmora»);
   - una sezione «Quartieri e club» con la mappa di 2.1 e i tre esterni.
2. docs/INDICE_TRIADE.md: nomi vecchi alle righe 7-8 e nelle tre tabelle, coi club per episodio di 4.1.
3. Prefazione (data/testi/it/comune.json:78, guida.1): è già vera («13 club»). Se il PO vuole, si aggiunge un terzo
   quartiere d'esempio, entro 140 caratteri per battuta (BIBBIA.md, consolidamento).
4. docs/governo/DECISIONI.md: una decisione che supera D-071 e registra i 13 club, i 3 esterni e la mappa.
5. docs/governo/BACKLOG.md: la voce PO-109, che oggi manca.
6. Roadmap e registro delle release, come nel rituale di docs/governo/ISTRUZIONI_PO.md §7.

### 8.5 Controlli finali — P per la catena, S per le foto
1. Test e catena «completa» (`node tools/catena.mjs completa`), attesa nel turno; nessuna pipe senza
   `set -o pipefail`.
2. Bot D-108: `node tools/bot.mjs 1000`.
   - Esiti per episodio identici a prima (atteso, perché il club non entra nel motore).
   - `controllaDifficolta` verde (tools/passi-logica.mjs:26).
   - Se un numero si sposta, prima si trova la causa: non si tocca nessuna soglia.
3. Foto delle curve coi colori nuovi (tools/foto-club.mjs) a 360, 375 e 412 px, con asset veri, prima e dopo. Le
   coppie da guardare sono in 2.4.
4. Audit dei nomi reali dei 16 club (ricerca in rete del nome esatto + «football club»), con le fonti in DECISIONI.
   Per ogni nome si scrive «Non posso confermarlo» finché la ricerca non è fatta.
5. Salvataggi: nessun campo nuovo e nessun id di episodio cambiato. Il passo «salvataggi-reali» della catena deve
   restare verde (tests/salvataggi-reali/).
