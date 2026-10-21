# Bibbia della triade 2 (stagioni 4-6, e37-e72) – BOZZA, PO-134

Stato: **bozza da far decidere al PO** (pagina di approvazione: docs/triade2/approvazione.html, come D-068 per la
triade 1). Niente di questo file è deciso: ogni riga è PROPOSTA, salvo quelle marcate FATTO, che citano una decisione
(D-xxx) o un testo/dato già nel gioco (file:riga). Nessun episodio giocabile prima del lancio (D-175, «Ramo separato,
solo storia»); l'ambito della prima pubblicazione resta di 36 missioni (D-009, D-050). La triade 2 si scrive in
parallelo al test chiuso (D-226) senza toccare il gioco pubblicato.

Finzione dichiarata: Valmora, i club, le persone, il comando, le procedure e gli eventi sono inventati (CLAUDE.md
«Verità»; docs/REGOLE_PLAY.md). Violenza solo fuori campo (rapporti radio, verbali). Nessuna procedura di polizia reale:
le «responsabilità» sono meccaniche di gioco (settori, unità, credito), non ordinamenti veri.

Nomi nuovi: inventati in questa bozza. **Non verificato** che non coincidano con persone note: vanno controllati in
rete come per D-098/D-102 prima di entrare nella bibbia. Non posso confermarlo oggi.

Riallineamento del 21/10 (S-24): i fatti sotto sono riletti sul ramo claude/valmora-l1-setup-schema-xdrbx7 a 3787b10,
dopo le rifiniture D-137, D-138, D-186, D-189, D-190, D-209 e i rilievi C-047 (D-218). La bozza del 18/10 (d0ee8f8)
citava 05f98de: le differenze sono in coordination/handoffs/sviluppatrice/S-24-triade2.md.

## Fatti da cui si parte (FATTO, ramo l1 a 3787b10)
- Il protagonista è «ad interim» perché il predecessore è stato rimosso in fretta e nessuno voleva il posto (D-018,
  docs/BIBBIA.md:23; data/testi/it/comune.json:120).
- **Quattro interim, quattro buste** (C47-01, D-218): «Sei il quarto ad interim in due anni» (data/testi/it/e01.json:16),
  «Tre interim prima di te» (e34.json:4), «Quattro interim, quattro buste. Le prime tre non le ho mai aperte davanti a
  nessuno» (e36.json:117). La busta del protagonista è la quarta e l'ultima della serie.
- La busta si apre sempre in e36: è «col tuo nome», aperta al primo derby e chiusa all'ultimo (e36.json:3); dentro
  c'è scritto «Non dura» in tutti i 14 verbali, compreso quello degenerato (e36.json:124, :131-143). Non c'è più una
  busta che resta chiusa (la frase «La apriamo la prossima volta» del 18/10 non esiste nei testi: grep su
  data/testi/it, 0 righe in e36).
- Tre esiti di carriera più il degenerato (D-099, D-106): 14 esiti in data/missioni/e36.json:1074-1347.
  - confermato (credito ≥ 6, :1076-1190): 5 verbali, compreso il nuovo `confermato_perse` (e36.json:132, carte perse);
    «Il comando ti conferma» e Malvasi paga (e36.json:131-137); epilogo «niente più "ad interim"» (epilogo.json:5);
  - ancora ad interim, `prorogato` (credito ≥ 3, :1191-1274): 4 verbali, «Il comando non decide» (e36.json:133,
    :138-140); epilogo.json:6;
  - sostituito (gli altri, :1275-1346): 4 verbali, «il comando nomina un altro» (e36.json:134, :141-143);
    epilogo.json:7;
  - degenerato (`se: {}`, `fallita: true`, :1347-1350): un verbale, busta aperta, «Avevo ragione» (e36.json:124); la carriera risulta
    «ignota» (src/logica/epilogo.ts:76-77; epilogo.json:8; bar: finale.json:38).
- Ultima tavola dell'epilogo: Malvasi al bar, «Doppio o niente sulla prossima?» (finale.json:39, D-165, D-167); la
  battuta riprende il verbale di e01 (e01.json:7).
- Fili di fine triade mostrati nell'epilogo (D-161, D-165, D-189): Fabbro dietro il vetro con rispetto / neutro / ostile
  (finale.json:8-10), testimone protetto / esposto / nessuno (:12-14), busta di e24 consegnata / tenuta / nessuna
  (:16-18), talpa con 0-4 sospetti (:20-24), fascicolo (:26-29), **nuovo dal 18/10: i faldoni della stazione**
  fermati / persi / nessuno (:30-33; variabile `carte`, data/stato.json:102; D-189).
- Fuga e cattura (D-016): Ferrigno «il Fabbro» (D-102, prima «Dessì») sparisce in e20 (e20.json:2, :74-75); è preso al
  porto in e29 in tutti e tre gli esiti, anche nel degenerato («l'operazione è riuscita», e29.json:135-137); in e36 è in
  carcere (e36.json:8) e nell'epilogo «dietro il vetro» (finale.json:8-10).
- Varrone & Figli è «sotto inchiesta» in tutti i verbali di e36 (e36.json:131-143), con forza diversa: «a metà» se
  sostituito senza fascicolo (:134), «l'inchiesta zoppica» con i faldoni persi (finale.json:32); il fascicolo
  «dorme in cassaforte» se non consegnato (finale.json:29). Lavezzari è caduto in ogni caso (finale.json:20-24).
- Spunti registrati: corteo degli studenti nella triade successiva, violenza solo nei rapporti radio (D-156, PO-117);
  quartieri nuovi da PO-110 con la regola D-124 (immagine del quartiere, mai il nome reale); riserva di eventi di
  città (D-092, docs/RISERVA_EVENTI.md).

## Regole della triade 1 che la triade 2 eredita (FATTO, decisioni)
- Il risultato della partita è fisso in ogni episodio; l'ordine pubblico non decide il punteggio (D-137).
- Nessun conto alla rovescia in nessuna forma; imprevisti senza timer, uno per ondata (D-190, modello D-194).
- Ogni patto o favore costa fiducia (−1), ogni protesta o costo promesso dal testo si applica nei dati (D-186, D-189
  regole 1-2, con l'eccezione D-160/D-190).
- Niente doppioni: lo stesso personaggio o oggetto non torna in episodi di fila senza ragione (D-138, D-186, D-189
  regola 4).
- Testi che non smentiscono le scelte: varianti «dopo» per i fili importanti (D-189 regola 3, guardiano D-153).

## Premessa della triade 2: «di ruolo»
Dal primo giorno della stagione 4 il protagonista è **responsabile di ruolo** dell'ordine pubblico di Valmora. È il
primo dei cinque, dopo quattro interim, a non avere una busta con scritto «Non dura». Il soprannome cambia: Malvasi
prova «l'Eroe di ruolo», non attacca; resta «Killjoy».

### Le nuove responsabilità (PROPOSTA, in termini di gioco)
- non solo le partite: tutta la città nei giorni di grandi eventi (la riserva di D-092 diventa il cuore della stagione 4);
- più settori sulla mappa, quartieri nuovi (PO-110), in alcuni episodi due eventi nella stessa giornata;
- un vice-responsabile da far crescere (Nicolò Ferraris, sotto), che a volte tiene un settore da solo;
- il credito ha un interlocutore in più: la nuova direttrice del comando, che giudica coi numeri.

IPOTESI di meccanica (non misurata, non decisa): una seconda sala da coordinare o un settore affidato al vice. Mai a
tempo (D-190). Va decisa con D-006/D-007 e lo schema dopo il lancio, non qui.

## Raccordo con gli esiti di e36
Tutti arrivano allo stesso punto («di ruolo») entro la fine di e37, così la scaletta è una sola. Cambiano l'apertura, il
tono di Malvasi e il credito di partenza.

| esito di e36 (FATTO) | apertura di e37 (PROPOSTA) | partenza proposta |
|---|---|---|
| Confermato: e36.json:131-132, :135-137 | La nomina arriva per iscritto. Malvasi ha pagato l'anno di caffè (e36.json:131, finale.json:35) e posa una busta nuova: «Doppio o niente.» | credito alto; la direttrice si fida «per ora» |
| Ancora ad interim: e36.json:133, :138-140 | Il comando finalmente decide: di ruolo, «perché nessuno ha durato quanto te». Malvasi: «Hai vinto per sfinimento.» | credito medio |
| Sostituito: e36.json:134, :141-143 | Il comando ci ripensa: in poche settimane il sostituto ha fatto disastri (due partite sui giornali, un corteo senza scorta, il comune furioso: tutto nei rapporti, fuori campo). Ti richiamano, di ruolo. Malvasi: «La prima l'ho vinta io. Questa la offro io.» | credito più basso; la curva Kiln ti accoglie come chi «è tornato» |

Degenerato: nessun raccordo serve (FATTO). L'esito ha `fallita: true` (data/missioni/e36.json:1350); un episodio è
superato solo con un risultato migliore non fallito (src/logica/episodi.ts:32, `migliore` null finché non superato,
:24), e un episodio successivo resta «futuro» finché i precedenti non sono superati (src/resa/episodi.ts:16). Chi
degenera rigioca e36 e arriva a e37 con uno dei tre esiti. IPOTESI da tenere d'occhio: l'esito letto è il «migliore»
(più stelle), non l'ultimo giocato; chi rigioca e36 per curiosità può cambiare carriera senza volerlo.

Il sostituto (solo nominato, proposta): **Aurelio Tavanti**, uomo di manuale, «tutto per iscritto». Non è un cattivo:
è fuori posto. Torna una volta in S5 come consulente del comune, per un confronto a parole.

Variabili da leggere dal salvataggio della triade 1: carriera (oggi solo come prefisso dell'esito migliore di e36,
src/logica/epilogo.ts:74-77) e i sette fili dell'epilogo (epilogo.ts:13). Dove e come è salvato oggi:
docs/triade2/CONTROLLO-36.md sezione E. Senza salvataggio serve un default: D-T2-01.

## La scommessa, «Doppio o niente sulla prossima?»
Malvasi rilancia (finale.json:39): **la quinta busta, la prima per uno di ruolo**. Scommette che «di ruolo» non arrivi
alla fine della triade. Busta nuova in e37, si apre in e72. Le tre stagioni gli danno ragioni per crederci (S4 il peso
della città, S5 il comune contro, S6 la tentazione di lasciare). Finale agrodolce come D-099, stessa ironia di D-165.

Cosa resta di Malvasi: alleato, ironico, ora anche **maestro** del vice-responsabile; in S6 gli offrono un posto fuori
città e deve scegliere (filo personale, mai melodramma).

## I tre strati della rete (D-016, un livello più su: dalla curva alla città)
| strato | triade 1 (FATTO) | triade 2 (PROPOSTA) |
|---|---|---|
| S1 superficie | i disordini delle curve (D-016) | **S4 «La città»**: eventi di città, quartieri nuovi; volantini e biglietti regalati, senza volto |
| S2 chi organizza | Ferrigno, fuga in e20 (e20.json:74-75) | **S5 «Chi la vuole»**: il Consorzio Nuova Valmora compra il cantiere sequestrato e «pacifica» le curve a pagamento |
| S3 chi protegge | Varrone, cattura di Ferrigno in e29 (e29.json:135), resa dei conti in e36 | **S6 «Chi paga»**: chi in comune copre il Consorzio; l'inchiesta su Varrone e il Consorzio si toccano |

La fuga e la cattura non si ripetono come formula (doppione D-189): in T2 non c'è un latitante; il «colpo» di S5 è un
documento (le prove dei biglietti, `prove_consorzio`) e quello di S6 una decisione pubblica (lo stadio vecchio).

## Archi delle stagioni (PROPOSTA)
### Stagione 4 «La città» (e37-e48)
Il protagonista impara il peso di tutta la città. Eventi dalla riserva (docs/RISERVA_EVENTI.md): maltempo, blackout,
fiera, sciopero dei trasporti, ordigno bellico al cantiere sequestrato, corteo degli studenti (D-156) che incrocia il
giorno di gara. Due quartieri nuovi entrano sulla mappa (PO-110). Filo: il cantiere di Varrone, sequestrato, va all'asta;
un consorzio senza volto si fa avanti. Grande evento: **Capodanno in piazza** (e48).

### Stagione 5 «Chi la vuole» (e49-e60)
Chi compra il cantiere: il **Consorzio Nuova Valmora**, volto affabile Ottavio Marzanti. Usa ancora le curve, ma al
contrario di Ferrigno: le «pacifica» a pagamento (biglietti regalati, trasferte offerte) per avere una città tranquilla
da vendere. Accettare la pace comprata è un patto: costa fiducia (regola D-189). Torna il ragazzo delle sciarpe
(e36.json:8, :49-50); Ferrigno scrive dal carcere, tono secondo il filo `rapporto_dessi` (finale.json:8-10).
Grande evento: **coppa internazionale inventata**, Skyfield contro un club straniero inventato.

### Stagione 6 «Chi paga» (e61-e72)
L'inchiesta su Varrone va avanti fuori campo (solo notizie e verbali), con forza diversa secondo i fili: fascicolo
(finale.json:26-29) e faldoni (finale.json:31-33). Con «nessuno» la chiave della cassaforte è tua (finale.json:29). Se
l'inchiesta della triade 1 «zoppica» (carte perse) o il fascicolo dorme, in S6 non c'è un processo ma una riapertura:
domanda D-T2-11. Malvasi deve scegliere se andarsene. Grande evento: **l'ultima partita nello stadio vecchio** (e72), il
derby Kiln-Skyfield come in e01 ed e36; si apre la quinta busta.

## Personaggi nuovi (PROPOSTA, nomi non verificati)
- **Direttrice del comando Livia Sarcone**: nuova al comando, viene da fuori, giudica coi numeri. Né alleata né nemica.
- **Vice-responsabile Nicolò Ferraris** («il giovane»): il protagonista lo deve far crescere; Malvasi lo tormenta come
  faceva con te. Scelta di storia: a chi affidare un settore difficile.
- **Ottavio Marzanti**, Consorzio Nuova Valmora: affabile come Tullio Varrone, ma paziente. Antagonista di S5-S6.
- **Aurelio Tavanti**, il sostituto (solo nel raccordo e in un episodio di S5).
- **La portavoce degli studenti** (S4, corteo D-156): tratta col mediatore; nessun simbolo politico reale.

Restano (FATTO, presenti in e36): Malvasi; il mediatore; il portavoce della curva Kiln (e36.json:51-53) e il ragazzo
delle sciarpe (e36.json:8, :49-50); il guardiano del cantiere (e36.json:88-89); Ferrigno in carcere (e36.json:8);
Lavezzari (solo citato, finale.json:20-24); Tullio Varrone (solo notizie, e36.json:125).

Nota di lessico: e36 usa «il questore» (e36.json:156, :160, :164, :167-168, :172, :175). È un titolo di un ordinamento reale;
nella triade 2 la proposta è usare solo «il comando» e «la direttrice». Segnalato alla principale, il gioco pubblicato
non si tocca da qui.

## Quartieri nuovi (PO-110, regola D-124)
Il gioco mostra solo l'immagine e il nome inventato; il quartiere reale d'ispirazione resta in questa nota interna, come
in D-124, e non entra mai nei dati di gioco. Proposte:

| nome nel gioco | immagine | ispirazione (nota interna, PO-110) |
|---|---|---|
| Marblegate | palazzi bianchi a colonne, il laghetto, uffici vuoti la domenica | EUR |
| Runway | case lungo la pista dell'aeroporto, aerei bassi sopra lo stadio | Morena |
| Watertower | la torre dell'acqua a fungo che si vede da tutta la città | Torrino |
| Newmarket | centro commerciale enorme, palazzi nuovi, parcheggi a perdita d'occhio | Bufalotta |

Club per questi quartieri: D-T2-03. Oggi i club sono 13 di Valmora più 3 di fuori città (D-125; docs/BIBBIA.md:113-136).

## Domande per il PO
Sono nella pagina docs/triade2/approvazione.html, in forma di questionario (D-T2-01 … D-T2-06, D-T2-11), e in
coordination/handoffs/sviluppatrice/S-24-triade2.md. Le D-T2-07/08/09 tecniche restano in CONTROLLO-36.md.
