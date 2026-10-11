# Bibbia di Valmora – IN SCRITTURA (D-012)

Si scrive insieme al PO, una decisione alla volta. Qui sta SOLO ciò che il PO ha deciso: ogni riga cita la sua decisione.
Ciò che non è qui non esiste ancora: nessuno lo inventa per riempire il vuoto.

## Fatti dal pacchetto di prompt (da confermare)
- Protagonista: responsabile dell'ordine pubblico di Valmora; soprannomi «Killjoy ad interim», «l'Eroe ad interim».
- 13 club di calcio inventati.
- Triadi di 3 stagioni × 12 missioni (36 per triade), missioni di circa 7 minuti.
- Dessì: fuga all'episodio 20, cattura all'episodio 29.
- Ogni indizio importante compare almeno due volte in episodi diversi.

## Triade 1 – arco (D-016)
- Stagione 1 (e01–e12): i disordini in superficie.
- Stagione 2 (e13–e24): chi li organizza; e20 fuga di Dessì.
- Stagione 3 (e25–e36): chi li protegge; e29 cattura di Dessì; resa dei conti.
- Indice episodio per episodio: docs/INDICE_TRIADE.md, approvato come base (D-068).
- Chi protegge Dessì (D-069): un costruttore inventato dello stadio nuovo, che usa i disordini per far chiudere lo stadio vecchio.
- Il vice è alleato fino in fondo (D-070).

## Personaggi
- Dessì (D-017): capo di una curva inventata, che usa la curva come copertura per affari illeciti. Nessun simbolo, ideologia o riferimento reale (REGOLE_PLAY §2).
- Protagonista (D-018): è «ad interim» perché il predecessore è stato rimosso in fretta dopo una gestione contestata e nessuno voleva il posto.

- Il vice (D-054, D-098): Ettore Malvasi, consigliere del protagonista. Ha visto passare tre responsabili ad interim, è disilluso e ironico, scommette sul tuo fallimento ma ti aiuta. Nome deciso: Ettore Malvasi (D-098).

## Episodio 1 (D-019, D-021, D-022)
- Primo giorno del protagonista: derby cittadino, con fonti del briefing in contraddizione.
- Il derby è fra due quartieri rivali: ogni club è il simbolo del suo quartiere (D-021). La mappa comprende stadio e strade dei quartieri.
- Le fonti si contraddicono sul corteo: una annuncia un corteo non autorizzato, l'altra lo smentisce (D-022).
- Risorse (D-025): squadre, steward, mediatore (può trattare con il corteo).
- Ondate (D-027): 1 arrivo delle tifoserie · 2 partita · 3 deflusso.
- Esiti (D-026): contenuto · contenuto a fatica · degenerato fuori campo (sempre raggiungibile, la storia prosegue).
- Fonti del briefing (D-028): informatore di strada (affidabilità bassa), ufficio sicurezza di un club (media), voce dalla centrale radio, voci in rete.
- Affidabilità (D-030): radio alta, rete media.
- Verità (D-031): il corteo c'è davvero; lo annuncia l'informatore di strada, la fonte meno affidabile. Il verbale lo rivela.
- Quartieri (D-032): Cinderwick, fonderie e ciminiere, contro Larkspire, la collina elegante.
- Club (D-033): Cinderwick United contro Larkspire Athletic.
- Settori (D-034): curva Cinderwick, curva Larkspire, piazzale dello stadio, strada da Cinderwick, strada da Larkspire.
- Esito (D-035): decide la tensione massima raggiunta (bassa → contenuto, media → contenuto a fatica, altrimenti degenerato).
- Regole della plancia (D-037, D-038): squadre 2 in strada e 1 in curva, steward 2 in curva e 1 in strada, entrambi 1 in piazzale; il mediatore dimezza un corteo; prima di ogni ondata si ridistribuisce tutto.
- Numeri iniziali (D-036, scelti dalla sessione principale, misurati col bot): 4 squadre, 6 steward, 1 mediatore. Pressioni per ondata: corteo 6 dalla strada di Cinderwick, arrivi 2, piazzale 2 · curve 5 e 4, piazzale 1 · deflusso 4 e 3, piazzale 3. Soglie: contenuto se tensione massima ≤ 2, a fatica se ≤ 5.
- Misura (node tools/bot.mjs 1000, semi 1…1000): giocatore casuale 28 contenuto / 565 a fatica / 407 degenerato (tensione massima media 5,19, mediana 5, da 1 a 9); giocatore attento 1000 contenuto; giocatore peggiore 1000 degenerato. 0 blocchi.
- Testi di e01 (data/testi/it/e01.json): approvati per ora (D-043), da rivedere dopo la prova sul telefono.

## Regole di gioco decise
- Risorse diverse per missione (D-023).
- Il verbale rivela sempre quali informazioni del briefing erano vere o false (D-024).

## e01 v2 a scene (D-053…D-056, P-02)
- Il vice apre la giornata in sala operativa (tre battute, `introduzione`): ha una scommessa aperta su quanto duri.
- 13 chiamate in tre ondate (5 · 4 · 4), ognuna con 2-3 scelte che hanno un prezzo: tensione dei settori, unità impegnate per il resto della missione, credito politico.
- Variabili nuove: `credito` (0-10, parte da 5: comando, club e stampa), `informatore_pagato`, `presidente_incontrato` (fili per gli episodi successivi).
- Esiti: contenuto se tensione massima ≤ 3 e credito ≥ 3; a fatica se tensione ≤ 6; altrimenti degenerato.
- Misura (node tools/bot.mjs 1000): casuale 16 / 693 / 291 (contenuto / a fatica / degenerato), tensione massima mediana 6; attento solo sulla tensione 0 / 1000 / 0 (spende troppo credito); peggiore 0 / 0 / 1000; schieramento attento con scelte a caso 126 / 174 / 0 su 300. 0 blocchi.
- Ribilanciamento dopo il collaudo C-01 (C-002): il credito costa tensione, niente opzioni dominate, «incrocio» pesa, nel deflusso si riforma il corteo di Cinderwick. Misura nuova (node tools/bot.mjs 1000): casuale 2 / 401 / 597, stelle 0★ 597 · 1★ 393 · 2★ 10 · 3★ 0; attento 0 / 1000 / 0 (2★); equilibrato 1000 / 0 / 0 (3★); peggiore 0 / 0 / 1000. Su tutte le 62.208 combinazioni di risposte con schieramento attento: 0★ 7.432 · 1★ 39.656 · 2★ 12.886 · 3★ 2.234.
- Testi: bozza della sessione principale, da far giudicare al PO dopo la prova della resa v2.

- Giudizio del PO su e01 (2026-10-11, PO-037): «Primo episodio carino».

## e02 «Ospiti numerosi» (D-071…D-074)
- Larkspire Athletic in casa contro i Calderholt Rovers, che arrivano in treno da fuori città. Due treni, uno in ritardo; gira una voce di biglietti falsi.
- Settori: stazione, viale della stazione, tornelli, curva ospiti, curva Larkspire. Quattro ondate brevi (D-074): primo treno, treno in ritardo, partita, ritorno in stazione. 16 chiamate.
- Dilemma (D-073): scortare gli ospiti o contenerli in stazione. Novità (D-072): stazione e biglietti falsi ai tornelli.
- Fili: se in e01 hai pagato l'informatore, ti segnala i venditori di biglietti e un furgone grigio senza targa (variabile nuova `furgone_visto`, prima comparsa del furgone, indice e09).
- Testi: bozza della sessione principale, da far giudicare al PO.
- Misura (node tools/bot.mjs 1000):
e02 · casuale: blocchi 0/1000 · esiti {"degenerato":597,"contenuto_a_fatica":385,"contenuto":18} · stelle {"0":597,"1":370,"2":29,"3":4}
e02 · attenta: blocchi 0/1000 · esiti {"contenuto_a_fatica":1000} · stelle {"0":0,"1":0,"2":1000,"3":0}
e02 · equilibrata: blocchi 0/1000 · esiti {"contenuto":1000} · stelle {"0":0,"1":0,"2":0,"3":1000}
e02 · peggiore: blocchi 0/1000 · esiti {"degenerato":1000} · stelle {"0":1000,"1":0,"2":0,"3":0}
e02 · scelte a caso con schieramento attento: {"contenuto":82,"contenuto_a_fatica":181,"degenerato":37}

## e03 «Notte di coppa» (D-081…D-083)
- Coppa, sera infrasettimanale: Larkspire Athletic in casa contro il Quillhaven Albion (club inventato, D-083), seicento ospiti in pullman. Lo stadio è a cinquanta metri dalle case: il comitato dei residenti protesta.
- Settori: vie del quartiere, parcheggi, piazzale, curva ospiti, curva Larkspire. Quattro ondate: il tramonto, primo tempo, supplementari, l'uscita di notte. 14 chiamate.
- Dilemma (D-081): quartiere o stadio. Novità (D-082): transenne fisse (2), che una volta montate restano fino a fine serata e si montano solo dove servono (quartiere, strade, piazzale). Trappola voluta: i parcheggi si riempiono subito, le proteste del quartiere crescono verso mezzanotte.
- Fili: cartelloni dello stadio nuovo (prima comparsa, D-069), nel briefing (centrale radio: nessun permesso in comune) e nella chiamata del comitato, senza scelta (D-084). Premi di campagna: il presidente spegne le luci esterne se lo hai incontrato in e01; il furgone grigio torna nei parcheggi se hai pagato l'informatore e lo hai annotato in e02.
- Testi: bozza della sessione principale, da far giudicare al PO.
- Misura (node tools/bot.mjs 1000):
e03 · casuale: blocchi 0/1000 · esiti {"contenuto_a_fatica":314,"degenerato":677,"contenuto":9} · stelle {"0":677,"1":297,"2":22,"3":4}
e03 · attenta: blocchi 0/1000 · esiti {"contenuto_a_fatica":1000} · stelle {"0":0,"1":0,"2":1000,"3":0}
e03 · equilibrata: blocchi 0/1000 · esiti {"contenuto":1000} · stelle {"0":0,"1":0,"2":0,"3":1000}
e03 · peggiore: blocchi 0/1000 · esiti {"degenerato":1000} · stelle {"0":1000,"1":0,"2":0,"3":0}
- Dove si montano le transenne (tools/fisse.mjs, giocatore equilibrato, prima ondata forzata): quartiere+quartiere 3★, quartiere+parcheggi 3★, quartiere+piazzale 3★, parcheggi+piazzale 3★, parcheggi+parcheggi 1★, piazzale+piazzale 1★. Con le prime tarature (4 squadre, proteste basse) le stelle erano 2★ o 3★ in ogni posizione: novità vuota, scartata.
- Difficoltà: il casuale fallisce il 67,7% (e02: 59,7%). È più difficile di e02 di proposito, perché la trappola delle transenne esiste solo con risorse strette; si ritara dopo il collaudo del PO (D-065).


## Decisioni del consolidamento (2026-10-11, D-098…D-101)
- Talpa: Gianni Lavezzari, responsabile della sicurezza del Cinderwick United; in e01 è la fonte che dà l'informazione falsa sul corteo. Smascherato in e33.
- Costruttore: impresa «Varrone & Figli»; l'erede Tullio Varrone guida il progetto dello stadio nuovo e protegge Dessì. Sotto inchiesta grazie al fascicolo (e31).
- Finale agrodolce (e36): inchiesta sul costruttore; conferma o sostituzione del protagonista secondo la fiducia; il vice paga la scommessa.
- Scelte che contano: rapporto_dessi, testimone, busta, pista_cattura, fascicolo, sospetti_talpa (data/stato.json).
- Testi: battute entro 140 caratteri, introduzioni di 2 battute.
