# Proposta: i 13 club di Valmora (PO-109)

Stato: PROPOSTA della sessione sviluppatrice, da decidere col PO. Nessun dato di gioco e nessun codice toccato.
Legenda: **FATTO MISURATO** = letto nei file, con file:riga o comando; **PROPOSTA** = scelta da approvare;
**IPOTESI** = non verificata. Il mondo resta finzione dichiarata: i quartieri di Roma Sud sono solo l'immagine da
cui nasce un prefisso inglese (regola D-124), mai un nome reale portato nel gioco.

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

## 2. I 13 club di Valmora

### 2.1 Mappa dei quartieri (PROPOSTA)
Valmora divisa in cinque zone, per dare un senso alle rivalità e ai tragitti:
- **Est industriale**: Kiln (fonderie), Pinegrove; sopra, la collina di Skyfield.
- **Sud-est, lungo la ferrovia e gli acquedotti**: Square, Arches, Studio; in fondo, le torri di Belltower.
- **Sud, sul fiume**: Garden, Shardhill, Gasworks (con le banchine del porto fluviale).
- **Sud nuovo**: Marble, Laurel.
- **Margine verde**: Stoneway, lungo la strada antica, quasi campagna.

### 2.2 I 7 club esistenti: stessi colori, stessi stemmi, una casa in città

Colori e stemmi FATTO da data/club/*.json; quartiere = PROPOSTA (dove il prefisso è già il nome del quartiere).

| club (id) | colori | stemma | quartiere di Valmora (PROPOSTA) |
|-----------|--------|--------|---------------------------------|
| Kiln United (cinderwick_united) | #ff6a13 arancio · #1a1a1a nero | scudo, ciminiera | Kiln: fonderie e ciminiere (già BIBBIA.md:37) |
| Skyfield Athletic (larkspire_athletic) | #2fa7ff azzurro · #ffffff bianco | tondo, collina | Skyfield: la collina elegante (già BIBBIA.md:37) |
| Square Rovers (calderholt_rovers) | #1e7b4a verde · #f2c230 giallo | scudo, calderone | Square: il quartiere dello scalo ferroviario; i tifosi arrivano col treno della linea urbana |
| Arches Town (mossgarth_town) | #546e7a ardesia · #c0ca33 lime | **nessuno** (iniziali, src/resa/stemma.tsx:32) | Arches: case sotto gli archi del vecchio acquedotto |
| Studio Town (ollerbrook_town) | #00897b verde acqua · #cfd8dc grigio chiaro | **nessuno** | Studio: i teatri di posa e le case dei tecnici del cinema |
| Garden Albion (quillhaven_albion) | #1b2a6b blu notte · #d62839 rosso | rombo, penna | Garden: case popolari coi cortili-giardino, sul fiume |
| Stoneway Wanderers (saltmere_wanderers) | #5d4037 marrone · #e9c46a sabbia | **nessuno** | Stoneway: la strada di pietra al margine verde |

PROPOSTA facoltativa: dare uno stemma ai tre che non l'hanno (Arches: tondo, arco · Studio: rombo, ciak ·
Stoneway: scudo, pietra miliare). Il PO ha chiesto «stessi stemmi»: se vuole lasciarli alle iniziali, si salta.

### 2.3 Sei club nuovi (PROPOSTA)

Regola D-124: inglese, suffisso classico, prefisso = immagine di un quartiere di Roma Sud, mai il suo nome.

| nome | ispirazione → immagine | quartiere di Valmora | colori | stemma | curva in una riga | rivalità |
|------|------------------------|----------------------|--------|--------|-------------------|----------|
| **Pinegrove Rangers** | Pigneto → il bosco di pini | Pinegrove: case basse fra i binari, osterie, muri dipinti | #6a1b9a viola · #ffc107 oro | tondo, pigna | tamburi e striscioni dipinti a mano, ironica, mai puntuale | Kiln (vicini: stesso mercato, e04) |
| **Shardhill Borough** | Testaccio → la collina di cocci | Shardhill: la collinetta di cocci e i vecchi macelli sul fiume | #c62828 rosso · #f5f5f5 bianco | scudo, anfora | la più antica, cori lenti e orgoglio di bottega | Gasworks («derby del fiume») |
| **Gasworks FC** | Ostiense → il gasometro e il vecchio porto fluviale | Gasworks: gasometro, magazzini, banchine del porto | #121212 nero · #f5f5f5 bianco | rombo, gasometro | gente di banchina, poche parole, si muove compatta | Shardhill; Kiln (le due anime operaie) |
| **Marble Villa** | EUR → il marmo bianco e i colonnati | Marble: palazzi bianchi degli uffici e il lago | #f5f5f5 bianco · #0d47a1 blu | tondo, colonna | composta, da tribuna, cori ironici sui soldi | Skyfield (ricchi vecchi contro ricchi nuovi) |
| **Belltower Harriers** | Tor Bella Monaca → la torre bella | Belltower: le torri di case popolari all'estremo est | #ec407a rosa · #263238 antracite | scudo, torre | la più lontana: arriva tardi, tutta insieme, rumorosissima | Square («chi arriva col treno») |
| **Laurel City** | Laurentino → l'alloro | Laurel: il quartiere nuovo dei palazzi-ponte | #fbc02d giallo · #1565c0 blu royal | rombo, corona d'alloro | giovane e di famiglie, la prima curva con le bambine in prima fila | Marble (vicini a sud) |

Rivalità fra esistenti (PROPOSTA, in aggiunta a Kiln–Skyfield, D-032/D-033): Arches–Stoneway («derby dei sassi»),
Studio–Arches (vicini sotto gli acquedotti), Garden–Shardhill (stesso fiume, ma meno accesa di Gasworks–Shardhill).

**Colori a colpo d'occhio** (FATTO MISURATO, distanza euclidea RGB fra colori primari, la stessa grandezza
grezza che usa tools/foto-club.mjs per campionare le curve): coppia più vicina fra i 7 esistenti = 59 (Square–Studio);
fra i 6 nuovi e tutti gli altri il minimo è 90 (Shardhill–Kiln, Laurel–Kiln); Marble 207. Non è una misura
percettiva: va confermata con le foto delle curve (tools/foto-club.mjs) a 360/375/412 px. Rischio da guardare:
il bianco primario di Marble su sfondi chiari della mappa (IPOTESI).

**Nomi reali**: Non posso confermarlo che nessun club reale (anche amatoriale) porti uno di questi sei nomi;
«Gasworks», «Marble», «Laurel» e «Pinegrove» sono parole comuni o nomi di luogo, quindi il rischio è più alto.
Vale il controllo dei nomi reali prima della pubblicazione su Play, come per D-124.
Prudenza (PROPOSTA): i caratteri delle curve nuove non devono richiamare stereotipi dei quartieri veri da cui
viene l'immagine (vale soprattutto per le periferie): la curva di Belltower è «lontana e rumorosa», non altro.

## 3. Club di fuori città (rivista il 14/10: nomi da Roma Nord)

Direttiva del PO (14/10, dopo la prima stesura): «Le squadre da fuori devono essere ispirate a Roma Nord». Stessa
regola di D-124 (inglese, suffisso classico, prefisso = immagine del quartiere, mai il suo nome), ma con quartieri
di Roma Nord. I sei club nuovi di Valmora restano ispirati a Roma Sud (sezione 2.3).

### 3.1 Quanti ne servono: il minimo che rispetta i testi

FATTO MISURATO: i ruoli che i testi scrivono come «da fuori» sono quelli della sezione 1.2.
- **Treno** (oggi Square): e02 (e02.json:3, 102), e25 (e25.json:6, 22, 90), e31 (e31.json:114).
- **Gemellati da trecento chilometri** (oggi Studio): e15 (e15.json:3, 61), e27 (e27.json:3, 102, 112).
- **Neopromossa di provincia** (oggi Stoneway): e07 (e07.json:3, 10), che torna in e12 (e12.json:4).
- **Porto sul mare** (oggi Garden): e21 (e21.json:119), e23 (e23.json:3-5, 10, 24, 90, 102).
- **Avversario della sconfitta di Kiln** (e11.json:3, 12): mai nominato.

PROPOSTA: **bastano due club esterni con nome**, più l'avversario di e11, che resta senza nome. I quattro ruoli si
uniscono a due a due senza toccare le righe di viaggio:
- **treno + gemellati = un solo club.** In e02, e25 ed e31 arriva in treno da lontano; in e15 ed e27 la sua curva
  viene «da trecento chilometri», sempre in treno, a cantare con la curva Kiln. È un club gemellato con Kiln che gioca
  contro Skyfield (e02, e31) e una volta contro Kiln (e25): FATTO, in e25 non c'è nessuna riga di ostilità fra gli
  ospiti e la curva Kiln (`grep -n 'Rovers\|Kiln' data/testi/it/e25.json`). La serie torna: prima trasferta (e02),
  gemellaggio annunciato (e15), ritorno dei gemellati (e27).
- **neopromossa + porto = un solo club.** Una città di provincia sul mare: in e07 è appena promossa e viene «per la
  prima volta in città» (FATTO: prima di e07 non compare, quindi la frase resta vera), in e12 chiude la stagione a
  Kiln, in e21 ed e23 il suo porto è la pista di Ferrigno. «Quaranta pulmini» (e07.json:3) e «dieci pullman dal mare»
  (e23.json:4) stanno bene sulla stessa città.

Perché non meno di due: le due coppie non si uniscono fra loro. FATTO: il club del treno arriva già in e02, quindi non
può essere la neopromossa che in e07 viene «per la prima volta in città».
Perché non tre: un terzo club servirebbe solo a non toccare l'avversario di e15. Oggi lì gli avversari («i Rovers»)
arrivano anche loro in treno («ognuno sul suo treno», e15.json:121), ma con Stoneway di Valmora la riga regge col
treno urbano. Alternativa per il PO (sezione 7): tre esterni e nessun ritocco.

### 3.2 I due club esterni (PROPOSTA)

| nome | ispirazione → immagine | dove sta | colori | stemma | ruolo negli episodi |
|------|------------------------|----------|--------|--------|---------------------|
| **Lockbridge County** | Ponte Milvio → il ponte coi lucchetti: un legame che non si scioglie, cioè il gemellaggio | città lontana, trecento chilometri di treno | #b39ddb lilla · #311b92 viola scuro | tondo, lucchetto | ospiti in treno a Skyfield (e02); gemellati della curva Kiln (e15, e27); avversario di Kiln nel giorno del vertice (e25); avversario di Skyfield nella sera del fascicolo (e31) |
| **Saltway Town** | Salario → la via del sale: una città di saline e di porto | città di provincia sul mare, oltre il casello | #64dd17 verde lime · #ffffff bianco | rombo, ancora | neopromossa alla prima trasferta in città (e07); ultima di campionato a Kiln (e12); il suo porto nella traccia del telefono (e21) e nella pista di Ferrigno (e23) |

Colori (FATTO MISURATO, distanza euclidea RGB fra colori primari, la stessa misura della sezione 2.3): Lockbridge
ha il primario più vicino a Marble (113), Saltway a Square (131). Distanza fra Lockbridge e Pinegrove, l'altro viola:
163. Tutti e 15 i club restano sopra il minimo di oggi (59, Square–Studio). Rischio da guardare nelle foto: il lime
di Saltway assomiglia al colore secondario di Arches (#c0ca33). La misura non è percettiva (vedi 2.3).

I suffissi «County» e «Town» dicono già che il club non è un quartiere ma un'altra città. Lockbridge prende un
suffisso diverso da United, Athletic e Rovers, perché in e02, e25 ed e31 il testo dice oggi «i Rovers»: tenere
«Rovers» lo confonderebbe con lo Square.

Nomi reali: Non posso confermarlo che nessun club reale porti «Lockbridge County» o «Saltway Town». Il controllo va
fatto prima della pubblicazione su Play.

Prudenza (PROPOSTA): le due città esterne sono finzione, senza regione né distanza da luoghi reali; «trecento
chilometri» resta l'unica indicazione, com'è oggi.

### 3.3 Il porto: conflitto da chiarire
FATTO: in e23 il porto è fuori città (e23.json:3-5) e l'informazione «Ferrigno è ancora in città» è segnata falsa
(data/missioni/e23.json, briefing `info_comando`, `"vera": false`). In e28 ed e29 invece le banchine stanno sulla stessa
mappa della curva Kiln (settori `banchine` di tipo `porto` in data/missioni/e28.json ed e29.json) e la curva va
«verso il porto» a piedi (e28.json:103).
PROPOSTA: due porti distinti.
- e21 ed e23: il porto di mare di Saltway, fuori città. Lì porta la pista e lì arriva il traghetto.
- Da e27 in poi: il porto fluviale di Valmora, nel quartiere Gasworks. L'indirizzo lasciato in e27.json:112 riporta
  Ferrigno in città.

## 4. Mappa club → episodi (PROPOSTA, rivista: restando a 36 episodi)

Criteri:
- ogni club di Valmora ha un episodio di presentazione (P) e almeno una ricomparsa (R);
- derby, eventi di città e fili restano dove sono;
- i ruoli «da fuori» passano a Lockbridge e Saltway, che ereditano le righe di viaggio così come sono.

FATTO sui posti disponibili: gli episodi con un avversario che non sia un derby sono 24; ne tolgo e02, e07, e12, e25
ed e31 (esterni) e restano 19. Aggiungendo un avversario con nome in e17 (porte chiuse, oggi senza nome) ed e30
(partita rinviata, oggi senza nome) i posti diventano 21. Ma 11 club per 2 apparizioni fanno 22: **uno resta corto**.
PROPOSTA: per Gasworks la ricomparsa è il suo quartiere. Le banchine del porto fluviale ci sono già in e28, e29 ed
e35, senza la sua curva.

| club | P | R | cosa cambia rispetto a oggi |
|------|---|---|-----------------------------|
| Kiln | e01 | ovunque | niente |
| Skyfield | e01 | ovunque | niente |
| Garden | e03 | e06 | niente; perde e05, e14, e16, e24, e26, e29, e34 e il porto (e21, e23) |
| Square | e04 | e08 | niente; perde il treno (e02, e25, e31) e e09, e13, e15, e18, e19, e27 |
| **Marble** | e05 (al posto di Ga) | e26 (al posto di Ga) | finale di coppa contro Skyfield |
| **Belltower** | e09 (al posto di Sq) | e19 (al posto di Sq) | i pullman in tangenziale; la retata |
| Studio | e13 (al posto di Sq) | e29 (al posto di Ga) | il palco del concertone; la sera della cattura |
| **Laurel** | e14 (al posto di Ga) | e24 (al posto di Ga) | biglietti doppi; il titolo contro Skyfield |
| Stoneway | e15 (al posto di Sq come avversario) | e30 (avversario nominato della partita rinviata) | perde e07/e12 (passano a Saltway) e diventa di Valmora |
| **Gasworks** | e16 (al posto di Ga) | e28, e29, e35 come quartiere del porto | l'unico con la ricomparsa senza curva |
| **Pinegrove** | e17 (avversario nominato a porte chiuse) | e27 (al posto di Sq) | i vicini «arrivati a piedi» (e17.json:11) |
| **Shardhill** | e18 (al posto di Sq) | e34 (al posto di Ga) | il testimone; l'interim |
| Arches | e28 | e33 | niente |
| Lockbridge (esterno) | e02 (al posto di Sq) | e15, e25, e27, e31 | gemellati in e15/e27 al posto di Studio |
| Saltway (esterno) | e07 (al posto di Sw) | e12, e21, e23 | e21/e23 al posto di Garden |

Restano come oggi: e01, e03, e04, e06, e08, e10, e11, e20, e22, e28, e32, e33, e35, e36, più il resto di e21 ed
e30. Presentati in stagione 1: Kiln, Skyfield, Garden, Square, Marble, Belltower più Lockbridge e Saltway. In
stagione 2: Studio, Laurel, Stoneway, Gasworks, Pinegrove, Shardhill. In stagione 3: Arches.

**Rispetto della trama (BIBBIA) e conflitti**
- Ferrigno capo della curva Kiln (BIBBIA.md:96), fuga in e20 e cattura in e29 (BIBBIA.md:10): restano come sono.
- La talpa Lavezzari (BIBBIA.md:90), smascherata in e33: e33 resta Skyfield–Arches, nessun conflitto.
- Varrone & Figli (BIBBIA.md:91): nessun club coinvolto.
- CONFLITTO 1 — i treni di e02 «da fuori città» (BIBBIA.md:62, INDICE_TRIADE.md:16): restano veri, ma il club
  cambia. D-071 («Calderholt Rovers arriva in treno», DECISIONI.md:82) è superata: serve una decisione nuova.
- CONFLITTO 2 — il gemellaggio è fra la curva Kiln e Lockbridge, non più con Studio (BIBBIA e INDICE: e15, e27). Il
  verbale di e15 nomina «il capo di Stu…» (e15.json:121): va rinominato.
- CONFLITTO 3 — Stoneway lascia il ruolo di neopromossa che le danno l'indice (INDICE_TRIADE.md:21) e i testi di e07 (e07.json:3)
  e diventa di Valmora: è il club che cambia identità più di tutti.
- CONFLITTO 4 — il porto (sezione 3.3).
- CONFLITTO 5 — Arches viene presentato solo in stagione 3. Alternativa: e19 ad Arches, e Belltower ricompare in e25
  al posto di Lockbridge (Lockbridge resterebbe con e02, e15, e27, e31).
- CONFLITTO 6 — e17 ed e30 oggi non nominano l'avversario. Nominarlo aggiunge una o due righe per episodio, nessuna
  curva nuova: il ritmo D-092 (src/dati/ritmo.ts:1-2), che conta le curve sulla mappa, non cambia.

## 5. Quanti episodi per stagione

FATTO che pesa sulla scelta:
- D-009 (docs/governo/DECISIONI.md:20): prima pubblicazione = triade intera di **36 missioni**, data **2026-11-30**,
  ambito congelato dal **2026-11-20**. Oggi è il 2026-10-14.
- Il campo `club` non entra nel motore: in src/logica compare solo nelle dichiarazioni di tipo (src/logica/tipi.ts:28, 40).
  Cambiare avversario non cambia i numeri dei bot (D-108).
- L'ordine degli episodi è il campo `episodio` (src/resa/dati.ts:40); un episodio si gioca se tutti quelli con
  numero minore sono superati (src/resa/episodi.ts:12-16). I salvataggi registrano gli episodi per id
  (src/salvataggi/salvataggio.ts:28-31).
- Un episodio oggi: circa 134 righe di testi in media (4844 righe in 36 file, `wc -l data/testi/it/e*.json`) e
  14-17 chiamate (e02 17, e04 15, e09 14, e14 14).

| opzione | cosa | costo | rischio |
|---------|------|-------|---------|
| **A. Restare a 12 (36)** — consigliata | redistribuire gli avversari (sezione 4) | 22 episodi toccati, quasi tutti per sostituire un nome: le righe di viaggio restano; nessun episodio nuovo; bot invariati | presentazione tarda di Arches; Gasworks ricompare solo come quartiere; i nuovi si vedono 2 volte |
| B. 13 per stagione (39) | un episodio in più a stagione, dedicato a un club | 3 episodi nuovi (~400 righe di testi, ~45 chiamate) + tutto A; rinumerare `episodio` da e13 in poi; ritaratura D-108 della stagione 1 (sequenza non decrescente); ricontrollo del ritmo D-092; testo «36 episodi» in comune.json:83; cambia l'ambito di D-009 | i salvataggi già oltre il punto d'inserimento trovano un episodio nuovo da giocare prima di proseguire, con variabili di partenza prese da episodi successivi (D-062): va provato sui salvataggi veri (tests/salvataggi-reali/). In cambio risolve il posto mancante (sezione 4) |
| C. 12 + episodi in stagione 4 | A adesso; i club con 2 sole apparizioni tornano nella stagione 4 «la città» (docs/RISERVA_EVENTI.md) | come A, poi lavoro dopo la triade | nessuno sul 30/11 |

Perché A (o A+C):
- rispetta D-009 senza toccare l'ambito;
- non sposta i bot;
- racconta comunque tutti i 13 club.

«Un episodio per club» con 13 per stagione non regge da solo: e01 presenta già due club e cinque episodi (e11, e17,
e21, e30, e35) non hanno avversario, quindi anche a 13 servirebbe la redistribuzione.

## 6. Elenco dei costi (opzione A, rivista)

**Dati**
- data/club/: 8 file nuovi (6 di Valmora + Lockbridge + Saltway). Facoltativo: `stemma` per arches, studio e stoneway.
- data/testi/it/comune.json: 8 nomi `club.*` e le fonti `fonte.club_*` nuove (una per club nuovo).
  guida.1 (riga 78) può restare: dice già 13.
- data/missioni: `club` dei settori e degli eventi, e dove serve la `fonte`, in e02, e05, e07, e09, e12, e13, e14,
  e15, e16, e18, e19, e23, e24, e26, e27, e29, e31, e34. Gli id dei settori restano gli stessi (`curva_ospiti`,
  `settore_gemellati`, `curva_gemellati`).
- e17, e25, e30: cambiano solo i testi. e25 non ha un campo `club` per gli ospiti.

**Fonti condivise**
- `club_ospite` (Square, comune.json:36): resta in e04 ed e08. Passa a Lockbridge in e02; ai club nuovi in e09, e13,
  e18, e19; in e15 diventa `club_saltmere` (Stoneway, id già esistente).
- `club_quillhaven` (Garden): resta in e03 ed e06; cambia in e05, e14, e16, e23, e24, e26, e29, e34.
- `club_saltmere` in e07 ed e12: passa a Saltway.
- `gemellati` (e27, bozze_s3.json:6): il testo diventa «Responsabile del Lockbridge County».

**Testi**
- Solo sostituzione del nome, righe di viaggio intatte: e02 («Rovers» in 18 righe), e07, e12, e15 (parte dei
  gemellati), e21.json:119, e23, e25 (12 righe), e27 (parte dei gemellati), e31 (18 righe); bozze_s2.json:15 (porto).
- Cambio d'avversario con riscrittura delle battute che lo nominano: e05, e09, e13, e14, e15 (avversario), e16, e18,
  e19, e24, e26, e27 (avversario), e29, e34.
- Avversario nominato per la prima volta: e17, e30.
- Studio Town esce dalle righe dei gemellati (e15.json:3, 121; e27.json:3, 102, 112).

**Codice** (esce dal perimetro «solo dati»: catena completa)
- src/resa/stemma.tsx: 8 simboli nuovi (pigna, anfora, gasometro, colonna, torre, alloro, lucchetto, ancora) + 3 facoltativi.

**Documenti**
- docs/BIBBIA.md: righe 8, 62, 75 e la geografia dei quartieri e delle due città esterne.
- docs/INDICE_TRIADE.md: nomi vecchi alle righe 7-8 e nelle tre tabelle.
- docs/governo/DECISIONI.md: una decisione nuova, che supera D-071.

**Prove**
- Catena «completa», perché tocca missioni e codice.
- Bot: attesi identici, perché il club non entra nel motore. Va misurato, non dato per scontato.
- Foto delle curve coi colori nuovi (tools/foto-club.mjs) a 360/375/412 px.
- Controllo dei nomi reali prima di Play.

## 7. Decisioni che servono al PO
1. Numero di episodi: A (12×3, consigliata), B (13×3), C (A ora + stagione 4).
2. I sei nomi nuovi di Valmora (Roma Sud) e i loro colori: approvarli o chiedere alternative.
3. I due esterni (Roma Nord): Lockbridge County (dal Ponte Milvio: treno + gemellati) e Saltway Town (dal Salario:
   neopromossa + porto). Va bene unire i ruoli a due a due, oppure tre esterni per non toccare l'avversario di e15?
4. Stoneway lascia il ruolo di neopromossa a Saltway e diventa di Valmora (cambio d'identità più grande).
5. Il porto: due porti distinti (Saltway fuori, Gasworks in città)?
6. Il posto mancante: Gasworks ricompare solo come quartiere del porto, oppure si prende l'opzione B.
7. Lo stemma per Arches, Studio e Stoneway, oppure restano con le iniziali.
