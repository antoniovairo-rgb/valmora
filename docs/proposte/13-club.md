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

### 1.3 Due anomalie trovate per strada (FATTO, non corrette qui)
- **Articoli sbagliati dopo D-124**: «del Skyfield» 42 volte, «del Arches» 12, «dei Stoneway» 9, «i Stoneway» 5,
  «il Skyfield» 4, «il Arches» 3, più casi su Square e Studio (es. «Responsabile dell'Studio Town», bozze_s2.json:11;
  «Il Arches Town comunica», e33.json:7). Comando: `grep -oE "\b(del|il|al|dal|nel|sul|dei|i|un) (Skyfield|Square|Studio|Stoneway|Arches)" data/testi/it/*.json | sort | uniq -c` → 84 occorrenze.
  Servono «dello Skyfield», «dell'Arches», «degli Stoneway», «lo Square», «dello Studio».
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

## 3. Club di fuori città

PROPOSTA: **sì, ne servono due, con nome; un terzo resta senza nome**. Criterio: un ruolo resta esterno solo se la
storia o la meccanica hanno bisogno della distanza; altrimenti diventa un club di Valmora.

| ruolo oggi (chi lo fa) | diventa | motivo |
|------------------------|---------|--------|
| ospiti in treno, e02 / e25 / e31 (Square) | **Valmora** (treno della linea urbana) | la stazione resta (novità D-072), cambia il viaggio: e02.json:102 «restano in città fino a domattina» → «restano dall'altra parte della città». Conflitto con BIBBIA.md:62 e INDICE_TRIADE.md:16 («da fuori città»): serve il via del PO |
| ospiti in pullman, e03 / e16 / e34 (Garden) | **Valmora** | seicento in pullman da un altro quartiere regge; cambia solo «dal mare» |
| neopromossa, e07 (Stoneway) | **Valmora** | «prima volta in città» → «prima volta nello stadio grande»: il quartiere al margine verde sale per la prima volta in serie; ritocco a e07.json:3, 10 |
| ospiti con trasferta vietata, e28 / e33 (Arches) | **Valmora** | il divieto riguarda il settore ospiti, non la città (vedi e10.json:51) |
| **gemellati da 300 km**, e15 / e27 (Studio) | **esterno**: club nuovo, proposta «Ironvale Town» (una valle di ferriere: spiega l'amicizia con le fonderie di Kiln) | un gemellaggio fra due curve della stessa città contraddice «si odiano» (comune.json:78); il treno lungo e il binario (e27.json:102) sono parte della scena. Studio Town resta, da club di Valmora, con episodi suoi (sezione 4) |
| **porto della pista**, e21 / e23 (Garden) | **esterno**: club nuovo della città di mare, proposta «Saltport Albion» | e23 vive sulla giurisdizione: «la richiesta fuori città ti costa fiducia» (e23.json:24, 102), «Quello che succede fuori città non è affar suo» (e23.json:90). Se il porto fosse in città, la scelta perde senso |
| avversario della sconfitta «fuori», e11 | **esterno, senza nome** | non è mai nominato (e11.json:3, 12); non serve nominarlo |

Nomi dei due esterni: la regola D-124 parla delle squadre in generale e chiede prefissi da Roma Sud; per i club di
fuori città quell'immagine confonderebbe (sembrerebbero quartieri). Decisione del PO (sezione 7). Non posso
confermarlo che «Ironvale Town» e «Saltport Albion» non esistano come club reali.

**Conflitto di trama da chiarire: quale porto?** FATTO: in e23 il porto è di Garden ed è fuori città (e23.json:3-5);
l'informazione «Ferrigno è ancora in città» è segnata falsa (data/missioni/e23.json, briefing `info_comando`, `"vera": false`).
In e28 e e29 le banchine stanno sulla stessa mappa della curva Kiln (settori `banchine` tipo `porto` in
data/missioni/e28.json e e29.json) e la curva va «verso il porto» a piedi (e28.json:103). PROPOSTA: due porti
distinti — e23 è il porto di Saltport (fuori città, dove porta la pista e dove arriva il traghetto); da e27 in poi
il porto è quello fluviale di Valmora, nel quartiere Gasworks (l'indirizzo che il responsabile dei gemellati lascia,
e27.json:112, riporta Ferrigno in città). Va scritto nella BIBBIA solo col via del PO.

## 4. Mappa club → episodi (PROPOSTA, restando a 36 episodi)

Criterio: ogni club ha un episodio di presentazione (P) e almeno una ricomparsa (R); derby, eventi di città e
fili restano dove sono; si cambia **solo l'avversario** dove oggi Square (11 episodi) e Garden (10) si ripetono.

| club | P | R | note |
|------|---|---|------|
| Kiln | e01 | ovunque | invariato |
| Skyfield | e01 | ovunque | invariato |
| Square | e02 | e08, e15 | invariati |
| Garden | e03 | e06, e24 | invariati |
| **Pinegrove** | e04 (al posto di Sq) | e27 (al posto di Sq) | il mercato di Kiln è anche suo |
| **Marble** | e05 (al posto di Ga) | e26 (al posto di Ga) | finale di coppa contro Skyfield: la rivalità dei ricchi |
| Stoneway | e07 | e12 | invariati, ritocco «città» in e07 |
| **Belltower** | e09 (al posto di Sq) | e25 (al posto di Sq) | i pullman in tangenziale sono i loro: è la curva più lontana |
| Studio | e13 (al posto di Sq) | e31 (al posto di Sq) | il palco del concertone; Varrone in tribuna davanti alle telecamere |
| **Laurel** | e14 (al posto di Ga) | e19 (al posto di Sq) | biglietti doppi; la retata |
| **Gasworks** | e16 (al posto di Ga) | e29 (al posto di Ga) | il magazzino e poi la cattura: il porto è il loro quartiere |
| **Shardhill** | e18 (al posto di Sq) | e34 (al posto di Ga) | il testimone; la commissione dell'interim |
| Arches | e28 | e33 | invariati; presentazione tarda (stagione 3): vedi conflitti |
| Ironvale (esterno) | e15 (al posto di St come gemellati) | e27 | |
| Saltport (esterno) | e21 (solo traccia) | e23 (al posto di Ga) | |

Conteggio dopo la proposta: Kiln e Skyfield come oggi; Square 3, Garden 3, gli altri 2 ciascuno; tutti i 13 hanno
P e R. Stagione 1 presenta 8 club (Kiln, Skyfield, Square, Garden, Pinegrove, Marble, Stoneway, Belltower), la
stagione 2 altri 4 (Studio, Laurel, Gasworks, Shardhill), la 3 l'ultimo (Arches).

**Rispetto della trama (BIBBIA) e conflitti da segnalare**
- Ferrigno capo della curva Kiln (BIBBIA.md:96), fuga e20 e cattura e29 (BIBBIA.md:10): invariati, Kiln resta.
- Talpa Lavezzari, sicurezza del Kiln (BIBBIA.md:90), smascherata in e33: e33 resta Skyfield–Arches, nessun conflitto.
- Varrone & Figli (BIBBIA.md:91): nessun club coinvolto. IPOTESI da non scrivere senza il PO: il cantiere dello
  stadio nuovo potrebbe stare a Marble.
- CONFLITTO 1 — e02 «da fuori città» (BIBBIA.md:62, INDICE_TRIADE.md:16, D-071): Square diventa di Valmora.
- CONFLITTO 2 — il porto (sezione 3): «porto di Garden» va spostato su Saltport (e21.json:119, e23.json:3-5,
  bozze_s2.json:15 `fonte.ufficio_porto`).
- CONFLITTO 3 — e29 a Gasworks: la curva ospiti viene dal quartiere del porto dove si cattura Ferrigno. Il testo non
  deve far pensare che quel club lo protegga (la protezione è di Varrone, D-069).
- CONFLITTO 4 — Arches presentato solo in stagione 3. Alternativa: e19 ad Arches e Laurel in e14 + e24 (Garden
  scende a 2: e03, e06).
- CONFLITTO 5 — D-083 nomina Garden come «club nuovo inventato» di e03 e i testi di e03 restano; nessun problema, ma
  la BIBBIA (BIBBIA.md:75) andrà aggiornata con «di Valmora».
- Ritmo D-092 (mai più di 3 episodi di stadio di fila, src/dati/ritmo.ts:1-2): cambiare l'avversario non cambia il
  numero di curve sulla mappa, quindi le serie restano le stesse (FATTO: la misura conta settori `curva`, non club).

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
| **A. Restare a 12 (36)** — consigliata | redistribuire gli avversari (sezione 4) | 14 episodi con avversario cambiato + 4 ritocchi (e02, e07, e15, e21/e23); nessun episodio nuovo; bot invariati | presentazione tarda di Arches; densità: 13 club in 36 episodi, i nuovi si vedono 2 volte |
| B. 13 per stagione (39) | un episodio in più a stagione, dedicato a un club | 3 episodi nuovi (~400 righe di testi, ~45 chiamate) + tutto A; rinumerare `episodio` da e13 in poi; ritaratura D-108 della stagione 1 (sequenza non decrescente); ricontrollo del ritmo D-092; testo «36 episodi» in comune.json:83; cambia l'ambito di D-009 | i salvataggi già oltre il punto d'inserimento trovano un episodio nuovo da giocare prima di proseguire, con variabili di partenza prese da episodi successivi (D-062): va provato sui salvataggi veri (tests/salvataggi-reali/) |
| C. 12 + episodi in stagione 4 | A adesso; i club con 2 sole apparizioni tornano nella stagione 4 «la città» (docs/RISERVA_EVENTI.md) | come A, poi lavoro dopo la triade | nessuno sul 30/11 |

Motivo della scelta A (o A+C): rispetta D-009 senza toccare l'ambito, non sposta i bot e racconta comunque tutti i
13 club. «Un episodio per club» con 13 per stagione non regge da solo: e01 presenta già due club e cinque episodi
(e11, e17, e21, e30, e35) non hanno avversario, quindi anche a 13 servirebbe la redistribuzione.

## 6. Elenco dei costi (opzione A)

Dati
- data/club/: 8 file nuovi (6 di Valmora + Ironvale + Saltport); facoltativo `stemma` per arches/studio/stoneway.
- data/testi/it/comune.json: 8 nomi `club.*` e 8 fonti `fonte.club_*` nuove; guida.1 (riga 78) può restare (dice già 13).
- data/missioni: cambiare `club` dei settori e degli eventi e, dove serve, la `fonte` in 16 episodi:
  e04, e05, e09, e13, e14, e15, e16, e18, e19, e23, e25, e26, e27, e29, e31, e34. Id dei settori invariati
  (`curva_ospiti`, `settore_gemellati`, `curva_gemellati`).
- Fonti condivise: `club_ospite` (Square) va sostituita nei 5 episodi passati ad altri (e04, e09, e13, e18, e19);
  `club_quillhaven` (Garden) in e05, e14, e16, e23, e26, e29, e34; `gemellati` (e27) e il responsabile di Studio in e15.

Testi da riscrivere (righe che nominano il club o il suo viaggio)
- Cambio d'avversario: e04, e05, e09, e13, e14, e16, e18, e19, e23, e25, e26, e27, e29, e31, e34 (righe con i nomi:
  vedi il comando della sezione 1; esempio e09: «Rovers» in 13 righe, e31: 18).
- Ritocchi «città»: e02.json:3, 91, 102, 115; e07.json:3, 10, 100, 125; e15.json:3, 61 (diventa Ironvale);
  e27.json:3, 102, 112; e21.json:119; e23.json:3-5, 10, 24, 90-91, 102; bozze_s2.json:15.
- Articoli dopo D-124 (sezione 1.3): 84 occorrenze, utile farle nello stesso giro.

Codice (esce dal perimetro «solo dati»: catena completa)
- src/resa/stemma.tsx: 6 simboli nuovi (pigna, anfora, gasometro, colonna, torre, alloro) + 3 facoltativi.

Documenti
- docs/BIBBIA.md: righe 8, 62, 75 e la geografia dei quartieri; docs/INDICE_TRIADE.md (nomi vecchi: righe 7-8 e le tre tabelle); docs/governo/VISIONE.md:6 è già corretto; DECISIONI.md: una decisione nuova.

Prove
- Catena «completa» (tocca missioni e codice). Bot: attesi identici (il club non entra nel motore) — va misurato,
  non dato per scontato. Foto delle curve coi colori nuovi (tools/foto-club.mjs) a 360/375/412 px. Controllo dei
  nomi reali prima di Play.

## 7. Decisioni che servono al PO
1. Numero di episodi: A (12×3, consigliata), B (13×3), C (A ora + stagione 4).
2. I sei nomi nuovi (e i colori): approvarli o chiedere alternative.
3. Square di Valmora col treno urbano (conflitto con BIBBIA.md:62 e D-071) oppure e02 a un ospite esterno.
4. Club esterni: due con nome (gemellati, porto) come proposto? Con quale regola per i nomi (Roma Sud anche per loro,
   o immagini di mare/valle)?
5. Il porto: due porti distinti (Saltport fuori, Gasworks in città) come proposto?
6. Stemma per Arches, Studio, Stoneway, o restano alle iniziali.
7. Correzione degli 84 articoli nello stesso giro.
