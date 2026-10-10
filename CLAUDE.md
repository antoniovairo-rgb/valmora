# Progetto: Valmora – Cortina di fumo

Gioco Android a missioni per Google Play. Il giocatore è il responsabile dell'ordine pubblico di Valmora, metropoli immaginaria con 13 club di calcio. Soprannome tra gli ultras: "Killjoy ad interim". Struttura: triadi di 3 stagioni da 12 missioni, rilasciate a blocchi. Storia: docs/BIBBIA.md. Regole policy: docs/REGOLE_PLAY.md.

Tecnologia: DA DECIDERE (Fase 0, decisione del PO). Proposta in docs/FASE0_PROPOSTA.md. Nessuno scrive codice di gioco prima della decisione.

## Persone
- Product Owner (PO): Antonio, 2-3 ore al giorno. Decide scelte di prodotto e storia. Non va disturbato per dettagli tecnici.

## Regole di verità (valgono per tutti)
- Non inventare fatti, norme, procedure di polizia, dati di mercato o citazioni. Se un'affermazione non è verificata, scrivere "Non posso confermarlo".
- Ogni riferimento reale (legge, policy, documentazione) va con fonte (URL).
- Tutto ciò che appartiene al mondo di gioco è finzione dichiarata: città, club, gruppi, persone e fatti sono inventati. Nessun riferimento a persone, squadre, stemmi o eventi reali.
- Nessuna imitazione di forze di polizia reali: niente stemmi, nomi ufficiali o loghi reali. Il gioco ha un avviso di non affiliazione.
- Violenza stilizzata e fuori campo (rapporti, radio, verbali). Target 16+. Il rating definitivo si ottiene solo dal questionario IARC su Play Console: non dichiarare un rating come certo.

## Regole tecniche
- Contenuti (missioni, dialoghi, personaggi, eventi) sono DATI in file strutturati con schema validato, non codice.
- Nessun soft-lock: ogni stato narrativo deve avere almeno un'uscita. Un test automatico lo verifica.
- Segreti (keystore, chiavi Play Console, token, password, file *.jks, *.keystore, keystore.properties, google-services*.json, .env*) FUORI LIMITE: mai nel repository, nei prompt o nei log; mai letti né stampati dalle sessioni. Il rilascio su Google Play e le azioni su Play Console le fa solo il PO.
- Gioco offline. Nessun dato personale raccolto. Nessuna pubblicità invasiva.
- Lingue: italiano per primo; inglese dopo, con le stringhe in file separati.
- Ogni modifica ha test. Nessun merge senza esito dei collaudatori.

## Git e coordinamento
- Un branch per ruolo: worktree-dev-engine, worktree-dev-contenuti, worktree-test-auto, worktree-test-play (creati da `claude --worktree <nome>`). Il Leader lavora su main nella cartella principale.
- Tutti i worktree condividono lo stesso repository: i branch degli altri si leggono senza fetch (git log <branch>, git show <branch>:percorso).
- Commit piccoli, messaggi chiari. Mai force push, mai rebase di branch condivisi.
- Solo il Team Leader fa merge su main e scrive coordination/BOARD.md.
- Gli altri ruoli scrivono consegne in coordination/handoffs/<ruolo>/<ID>.md e committano sul proprio branch.
- All'avvio di ogni sessione e a ogni ciclo: aggiornare il proprio branch con `git merge main`, poi leggere questo file, docs/BIBBIA.md e la lavagna (git show main:coordination/BOARD.md).
- Collaudatori: per provare il compito <ID> fanno `git merge <branch-dev>` nel proprio branch, eseguono i test, scrivono la consegna. Non modificano codice o contenuti degli sviluppatori.
- Se sulla lavagna non c'è un compito per il proprio ruolo, la sessione si ferma e lo scrive in una riga (non inventa lavoro).

## Comunicazione con il PO
- Report giornaliero del Leader in coordination/REPORT.md (in cima il più recente): massimo 15 righe, con "Fatto", "In corso", "Bloccato" e "Decisioni richieste al PO" (con 2-3 opzioni e la raccomandazione).
