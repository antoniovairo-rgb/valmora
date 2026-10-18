# Bibbia della triade 2 (stagioni 4-6, e37-e72) – BOZZA, PO-134

Stato: **bozza da far decidere al PO**. Niente di questo file è deciso: ogni riga è PROPOSTA, salvo quelle che citano una
decisione (D-xxx) o un testo già nel gioco (file:riga). Nessun episodio giocabile prima del lancio (scelta del PO
«Ramo separato, solo storia», PO-134); l'ambito della prima pubblicazione resta di 36 missioni (D-009, D-050).

Finzione dichiarata: Valmora, i club, le persone, il comando, le procedure e gli eventi sono inventati (CLAUDE.md
«Verità»; docs/REGOLE_PLAY.md). Violenza solo fuori campo (rapporti radio, verbali). Nessuna procedura di polizia reale:
le «responsabilità» sono meccaniche di gioco (settori, unità, credito), non ordinamenti veri.

Nomi nuovi: inventati in questa bozza. **Non verificato** che non coincidano con persone note: vanno controllati in
rete come per D-098 prima di entrare nella bibbia.

## Fatti da cui si parte (verificati sul ramo claude/valmora-l1-setup-schema-xdrbx7, 05f98de)
- Il protagonista è «ad interim» perché il predecessore è stato rimosso in fretta e nessuno voleva il posto (D-018,
  docs/BIBBIA.md:23).
- Malvasi ha visto passare tre responsabili ad interim, scommette sul tuo fallimento ma ti aiuta (D-054, D-098,
  docs/BIBBIA.md:25).
- e36 chiude la scommessa: dentro la busta c'è scritto «Non dura» (data/testi/it/e36.json:119). Se e36 degenera la busta
  resta chiusa: «La apriamo la prossima volta» (e36.json:123).
- Tre esiti di carriera scelti dalla fiducia, quattro versioni del fascicolo (procura / stampa / comando / nessuno)
  (D-106; e36.json:130-141): confermato («niente più ad interim», :133), ancora ad interim (:131), sostituito («il
  comando nomina un altro», :132).
- Ultima tavola del finale: Malvasi al bar, «Doppio o niente sulla prossima?» (D-165, D-167;
  data/testi/it/finale.json:35); la battuta riprende il verbale di e01 (data/testi/it/e01.json:7).
- Fili di fine triade già mostrati nell'epilogo (D-161, D-165): Fabbro dietro il vetro con rispetto / neutro / ostile
  (finale.json:8-10), testimone protetto / esposto / nessuno (:12-14), busta consegnata / tenuta / nessuna (:16-18),
  talpa con 0-4 sospetti (:20-24), fascicolo (:26-29).
- Varrone & Figli è sotto inchiesta; Ferrigno «il Fabbro» è in carcere (e36.json:8, finale.json:8); Lavezzari è stato
  smascherato in e33 (D-098).
- Spunti registrati: corteo degli studenti nella triade successiva, violenza solo nei rapporti radio (D-156, PO-117);
  nuovi quartieri da PO-110 con la regola D-124 (immagine del quartiere, mai il nome reale); riserva di eventi per una
  stagione 4 «la città» (D-092, docs/RISERVA_EVENTI.md).

## Premessa della triade 2: «di ruolo»
Dal primo giorno della stagione 4 il protagonista è **responsabile di ruolo** dell'ordine pubblico di Valmora. Il
soprannome cambia: Malvasi prova «l'Eroe di ruolo», non attacca; resta «Killjoy». Più responsabilità, in gioco:
- non solo le partite: tutta la città nei giorni di grandi eventi (la riserva di D-092 diventa il cuore della stagione 4);
- più settori sulla mappa, quartieri nuovi (PO-110), due eventi nella stessa giornata in alcuni episodi;
- un vice-responsabile da far crescere (nuovo personaggio, sotto), che a volte gestisce un settore da solo;
- il credito ha un interlocutore in più: la nuova direttrice del comando, che giudica con metro diverso.

IPOTESI di meccanica (da misurare coi bot, non decisa): una nuova risorsa «turno lungo» o una seconda sala da
coordinare. Va decisa con D-006/D-007 e lo schema, non qui.

## Raccordo coi tre esiti di e36
Tutti e tre arrivano allo stesso punto («di ruolo») entro la fine di e37, così la scaletta è una sola. Cambia l'apertura,
il tono di Malvasi e una variabile di partenza.

| esito di e36 | apertura di e37 | partenza proposta |
|---|---|---|
| Confermato (e36.json:130, :133-135) | Si continua: la nomina arriva per iscritto, Malvasi apre la busta nuova, «doppio o niente». | credito alto; la direttrice si fida «per ora» |
| Ancora ad interim (:131, :136-138) | Il comando finalmente decide: confermato di ruolo, «perché nessuno ha durato quanto te». Malvasi: «Hai vinto per sfinimento.» | credito medio |
| Sostituito (:132, :139-141) | Il comando ci ripensa: in una settimana il sostituto ha fatto disastri (due partite sui giornali, un corteo lasciato senza scorta, il comune furioso: tutto nei rapporti, fuori campo). Ti richiamano, di ruolo. Malvasi: «Questa l'ho vinta io: avevo scommesso che tornavi.» | credito più basso; la curva Kiln ti accoglie come chi «è tornato» |

Caso in più: se e36 è degenerato la busta della prima scommessa è ancora chiusa (e36.json:123): e37 la apre in apertura.

Il sostituto (solo nominato, proposta): **Aurelio Tavanti**, uomo di manuale, «tutto per iscritto». Non è un cattivo:
è fuori posto. Torna una volta in S5 come consulente del comune, per un confronto a parole.

Variabile da leggere dal salvataggio della triade 1: esito di carriera e fili di D-161. Dove e come è salvato oggi:
docs/triade2/CONTROLLO-36.md. Se il salvataggio manca (giocatore che inizia dalla triade 2) serve un esito di default:
domanda al PO (D-T2-01 sotto).

## La scommessa, «Doppio o niente sulla prossima?»
Malvasi rilancia (finale.json:35): **scommette che «di ruolo» non arrivi alla fine della triade**. Busta nuova al primo
episodio, si apre in e72. Le tre stagioni gli danno ragioni per credere di vincere (S4 il peso della città, S5 il comune
contro, S6 la tentazione di lasciare). Finale agrodolce come D-099, con la stessa ironia di D-165.

Cosa resta di Malvasi: alleato, ironico, ora anche **maestro** del vice-responsabile nuovo; in S6 gli offrono un posto
fuori città e deve scegliere (filo personale, mai melodramma).

## Archi delle stagioni (proposta)
Rete a strati come D-016, un livello più su: dalla curva alla città.

### Stagione 4 «La città» (e37-e48)
Il protagonista impara il peso di tutta la città. Eventi di città dalla riserva (docs/RISERVA_EVENTI.md): maltempo,
blackout, fiera, sciopero dei trasporti, ordigno bellico al cantiere sequestrato, corteo degli studenti (D-156) che
incrocia il giorno di gara. Due quartieri nuovi entrano sulla mappa (PO-110). Filo: il cantiere di Varrone, sequestrato,
va all'asta; un consorzio senza volto si fa avanti.
Grande evento della stagione: **Capodanno in piazza** (e48), tutta la città in strada.

### Stagione 5 «Chi la vuole» (e49-e60)
Chi compra il cantiere: il **Consorzio Nuova Valmora**, volto affabile Ottavio Marzanti. Usa ancora le curve, ma al
contrario di Ferrigno: le «pacifica» a pagamento (biglietti regalati, trasferte offerte) per avere una città tranquilla
da vendere. Il protagonista deve capire se la pace comprata è pace. Torna il ragazzo delle sciarpe; Ferrigno parla dal
carcere (tono secondo finale.json:8-10).
Grande evento: **coppa internazionale inventata**, Skyfield contro un club straniero inventato, ospiti da un altro paese
(lingua, treni, città).

### Stagione 6 «Chi paga» (e61-e72)
Il processo a Varrone (fuori campo, solo notizie e verbali) e il Consorzio si toccano. Il fascicolo di e31 pesa: con
«procura» le carte reggono, con «stampa» il comune cerca un colpevole, con «comando» la direttrice sa più di quanto dice,
con «nessuno» la chiave della cassaforte è tua (finale.json:26-29). Malvasi deve scegliere se andarsene.
Grande evento: **l'ultima partita nello stadio vecchio**, prima della decisione su demolizione o restauro (e72): il
derby Kiln-Skyfield come in e01 ed e36, chiude la seconda scommessa.

## Personaggi nuovi (proposta, nomi non verificati)
- **Direttrice del comando Livia Sarcone**: nuova al comando, viene da fuori, giudica coi numeri. Né alleata né nemica.
- **Vice-responsabile Nicolò Ferraris** («il giovane»): il protagonista lo deve far crescere; Malvasi lo tormenta come
  faceva con te. Scelta di storia: a chi affidare un settore difficile.
- **Ottavio Marzanti**, Consorzio Nuova Valmora: affabile come Tullio Varrone, ma paziente. Antagonista di S5-S6.
- **Aurelio Tavanti**, il sostituto (solo nel raccordo e in un episodio di S5).
- **La portavoce degli studenti** (S4, corteo D-156): ragazza che tratta col mediatore; mai un simbolo politico reale.

Restano: Malvasi; il mediatore; il portavoce della curva Kiln e il ragazzo delle sciarpe (e36.json:8, :49, :51); il
guardiano del cantiere (e36.json:87); Ferrigno in carcere; Lavezzari (solo citato); Tullio Varrone (solo notizie).

## Quartieri nuovi (PO-110, regola D-124)
Il gioco mostra solo l'immagine e il nome inventato; il quartiere reale d'ispirazione resta in questa nota interna, come
in D-124, e non entra mai nei dati di gioco. Proposte:

| nome nel gioco | immagine | ispirazione (nota interna, PO-110) |
|---|---|---|
| Marblegate | palazzi bianchi a colonne, il laghetto, uffici vuoti la domenica | EUR |
| Runway | case lungo la pista dell'aeroporto, aerei bassi sopra lo stadio | Morena |
| Watertower | la torre dell'acqua a fungo che si vede da tutta la città | Torrino |
| Newmarket | centro commerciale enorme, palazzi nuovi, parcheggi a perdita d'occhio | Bufalotta |

Club per questi quartieri: domanda al PO (D-T2-03). Oggi i club di Valmora sono 13 (D-125): aggiungerne cambia la
sezione «Quartieri e club» della bibbia.

## Domande per il PO (da portare col questionario, non decise)
- **D-T2-01 · Chi inizia dalla triade 2 senza salvataggio della triade 1?**
  1) (consigliata) Esito «confermato» di default, fili neutri: il più semplice; costo: chi non ha giocato la triade 1
     perde il raccordo «sostituito».
  2) Il giocatore sceglie l'esito in una schermata d'apertura: più libertà; costo: una schermata nuova e i suoi test a
     360/375/412.
  3) La triade 2 si gioca solo dopo la 1: nessun default; costo: blocca chi installa più tardi.
- **D-T2-02 · Come si distribuisce la triade 2?**
  1) (consigliata) Aggiornamento dell'app con le 36 missioni nuove, coerente col gioco offline; costo: app più pesante.
  2) Una stagione alla volta, tre aggiornamenti; costo: tre rilasci col rituale completo (ISTRUZIONI_PO §7).
- **D-T2-03 · Club dei quartieri nuovi?**
  1) (consigliata) Nessun club nuovo: i quartieri nuovi sono luoghi di eventi di città; costo: niente partite nuove.
  2) Due club nuovi (Marblegate, Runway); costo: stemmi, colori, schema dei club e sezione D-125 da aggiornare.
  3) Tutti e quattro; costo: doppio di 2), mappa più affollata.
- **D-T2-04 · Che cosa scommette Malvasi?**
  1) (consigliata) Che non arrivi alla fine della triade di ruolo; costo: nessuno, regge le tre stagioni.
  2) Una scommessa per stagione, più piccola; costo: tre chiusure da scrivere e un'apertura per stagione.
- **D-T2-05 · Malvasi in S6?**
  1) (consigliata) Gli offrono un posto fuori città; resta o parte secondo una scelta di storia; costo: due finali per lui.
  2) Resta sempre; costo: arco personale più debole.
- **D-T2-06 · Quando si comincia la triade 2?**
  1) (consigliata) Dopo il lancio, quando i dati della Play Console dicono quanti giocatori arrivano a e36 (li vedi solo
     tu); costo: si aspetta. Non posso confermare quanti giocatori ci saranno.
  2) Subito dopo il lancio, senza aspettare i dati; costo: rischio di lavorare per pochi giocatori.
