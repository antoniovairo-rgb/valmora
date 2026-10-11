# S-07 (e03) – Resa di «Notte di coppa» · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, con merge (non rebase) fino a 2cd8a7b. Il file si chiama S-07-e03 perché
S-07-rapporto.md è già la consegna del controllo di versione. Stato: **consegna completa.**

## Cosa ho fatto

1. **Mappa aerea di e03**:
   - nuovo src/resa/mappa/notte.ts, chiamato da sfondo.ts, tutto dentro la texture disegnata una volta;
   - quartiere di case basse a schiera con orti, attorno al settore di tipo «quartiere», attaccato allo stadio;
   - parcheggio con strisce e auto attorno al settore il cui id contiene «parcheggi»;
   - notte se `mappa.ora` = "notte": velo scuro, finestre accese, lampioni lungo i viali, fari smorzati;
   - cartelloni dello «stadio nuovo» in fondo al primo viale se `mappa.dettagli` contiene "cartelloni_stadio_nuovo" (D-084), senza scritte;
   - token nuovi `--mappa-notte`, `--mappa-finestra`, `--mappa-lampione`, `--mappa-parcheggio`, `--mappa-cartellone`.
2. **Transenne (D-082)**:
   - icona propria (barriera da cantiere, lucide «Construction»);
   - quelle già montate (`ic.fisse`) si vedono in tutte le ondate dopo col lucchetto, su fondo nero e testo giallo. Sono un'immagine, non un pulsante: non si ritirano;
   - nel vassoio: «N già montate»;
   - con le transenne scelte, i settori non ammessi (`settoriAmmessi`) si spengono. Un tocco o un trascinamento lì mostra l'avviso «Transenne: in «Curva ospiti» non hanno effetto, qui non si montano.» e non mette niente;
   - nello schieramento una nota: «Transenne: una volta montate restano fino a fine serata. Si montano solo dove servono, mai sugli spalti.»
3. Unità sulla mappa su due righe (massimo 3 per riga): in e03 nel quartiere stanno 4 tipi di unità.
4. **tools/foto.mjs** gioca e01 → e02 → **e03 dalla città**, con le variabili ereditate, a 3 larghezze. Controlli generali per le risorse fisse:
   - all'ondata 1, transenne su una curva: deve comparire l'avviso e non deve esserci nessuna presenza;
   - dall'ondata 2, le transenne montate all'ondata 1 si vedono (`[data-fissa]`) e dopo un tocco sono ancora lì;
   - esito della resa = esito del motore;
   - e03 «superato» sulla città.
5. Interruttori rossi:
   - `__NO_C09S01`: le transenne si accettano ovunque;
   - `__NO_C09S02`: le transenne montate non si vedono.

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto` | e01 ×2 + e02 + e03, 3 larghezze | verde. e03 col giocatore equilibrato: «contenuto», 3 stelle, uguale al motore. Il giocatore attento di bot.ts: «contenuto_a_fatica» |
| `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C09S01 node tools/foto.mjs …` | 360 px | ROSSO: «transenne in «curva_ospiti» senza avviso» e «transenne accettate in «curva_ospiti»». Poi il giro si interrompe, perché la partita diverge |
| `… VALMORA_ROSSI=C09S02 …` | 360 px | ROSSO: «transenne montate in «quartiere» all'ondata 1 non si vedono» e «ritirabili», ondate 2, 3 e 4 |
| `node tools/catena.mjs completa` | commit 385e690, 3 giri | 3 su 3 VERDI, nessun passo ritentato |

## Foto

docs/foto/e03/2026-10-11/: sala, briefing, avviso sulle transenne, schieramento delle ondate 1 e 2 (col
lucchetto), chiamata, risposta, chiusura, rapporto, verbale e città, a 360/375/412 px.

## Problemi aperti

1. Il parcheggio si riconosce dall'id del settore (contiene «parcheggi»): se servono altri parcheggi, meglio un tipo o un dettaglio nei dati.
2. Colori e stemmi dei club: proposta approvata dal PO in questa sessione, questionario, «proposta così com'è».
   Immagine: proposte/club-2026-10-11.png. Aspetto i dati dalla principale (vedi messaggio).
