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
- Indici episodio per episodio: DA DECIDERE.

## Personaggi
- Dessì (D-017): capo di una curva inventata, che usa la curva come copertura per affari illeciti. Nessun simbolo, ideologia o riferimento reale (REGOLE_PLAY §2).
- Protagonista (D-018): è «ad interim» perché il predecessore è stato rimosso in fretta dopo una gestione contestata e nessuno voleva il posto.

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
- Testi di e01 (data/testi/it/e01.json): BOZZA della sessione principale, da approvare.

## Regole di gioco decise
- Risorse diverse per missione (D-023).
- Il verbale rivela sempre quali informazioni del briefing erano vere o false (D-024).
