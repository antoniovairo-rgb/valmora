# S-24 · Triade 2, riallineamento alla prima triade di oggi (PO-134, D-175, D-226)

Ramo claude/valmora-triade2. Merge (non rebase) da claude/valmora-l1-setup-schema-xdrbx7 a 3787b10, senza conflitti.
Solo storia: nessun file in data/, src/, nessun episodio, GAME_VERSION invariata.

## Che cosa è cambiato rispetto al 18/10 (d0ee8f8)
- docs/triade2/BIBBIA-T2.md: fatti riletti a 3787b10 con file:riga attuali; nuove sezioni «Regole ereditate»
  (D-137, D-138, D-186, D-189, D-190) e «I tre strati della rete» (D-016); raccordo con e36 riscritto; scommessa
  diventata «la quinta busta» (C47-01); S6 con processo o riapertura secondo i fili; nota di lessico sul «questore».
- docs/triade2/SCALETTA.md: e37, e61, e62, e66, e72 riallineati; regole ereditate; doppione e49-e50 segnalato.
- docs/triade2/CONTROLLO-36.md: righe aggiornate (epilogo.ts, App.tsx, foto-epilogo.mjs, coerenza-d153, fiducia-verso
  165→221); voci nuove: tests/testi-c44.test.ts:27, tests/c45.test.ts:34, tests/d211.test.ts:39, strumenti di misura
  con `[1, 2, 3]`; 14 esiti di e36 (nuovo `confermato_perse`).
- docs/triade2/approvazione.html (nuova): pagina per il PO come D-068, con questionario. FATTO MISURATO: a 360, 375 e
  412 px `scrollWidth` = larghezza (nessuno scorrimento orizzontale), 36 righe di episodio, 8 domande (Chromium,
  playwright-core).

## Incoerenze trovate (FATTO, file:riga)
Fra la bozza del 18/10 e il gioco di oggi:
1. **Busta chiusa nel degenerato**: la bozza diceva «la busta resta chiusa, "La apriamo la prossima volta"». Oggi il
   verbale degenerato la apre: «Nella busta c'era scritto «Non dura»… «Avevo ragione»» (data/testi/it/e36.json:124);
   la frase non esiste più (grep in data/testi/it: nessuna riga in e36). Tolto il «caso in più» di e37.
2. **Degenerato non arriva a e37**: è `fallita: true` (data/missioni/e36.json:1350); un episodio successivo resta
   «futuro» se i precedenti non sono superati (src/resa/episodi.ts:16; src/logica/episodi.ts:32). Nessun quarto raccordo.
3. **Quattro buste (C47-01, D-218)**: la bozza seguiva «tre responsabili ad interim» (docs/BIBBIA.md:25). Oggi:
   e01.json:16 «il quarto ad interim», e34.json:4 «Tre interim prima di te», e36.json:117 «Quattro interim, quattro
   buste». La busta di T2 diventa la quinta; la sorpresa di T2 è che è la prima per uno «di ruolo».
4. **Battuta del sostituito in e37**: la bozza faceva dire a Malvasi «avevo scommesso che tornavi»: in e36 la
   scommessa era «Non dura» e nel sostituito l'ha vinta lui (e36.json:134). Riscritta: «La prima l'ho vinta io. Questa
   la offro io.»
5. **Righe citate spostate**: verbali di e36 da :130-141 a :131-143; battuta del bar da finale.json:35 a :39; nuovo
   esito `confermato_perse` (e36.json:132; missioni/e36.json:1103); nuovo filo «faldoni» `carte` (finale.json:30-33,
   data/stato.json:102, D-189).
6. **Processo a Varrone in S6**: la bozza lo dava per certo. Oggi Varrone è «sotto inchiesta» in tutti i verbali, ma
   «a metà» (e36.json:134), col fascicolo che «dorme in cassaforte» (finale.json:29) o con l'inchiesta che «zoppica»
   (finale.json:32). Domanda D-T2-11.
7. **Testimone e busta di e24 in e62/e66**: possono essere «nessuno»/«nessuna» (finale.json:14, :18): aggiunte varianti.
8. **D-016 nomina «Dessì»**: oggi è Ferrigno (D-102; docs/BIBBIA.md:96). Fuga in e20 (e20.json:2, :74-75) e cattura
   in e29 in tutti gli esiti, anche il degenerato (e29.json:135-137): tenute. Ferrigno in carcere (e36.json:8).
   Nota solo di testo, D-016 non si tocca.

Nel gioco pubblicato (fuori dal mio perimetro, solo segnalazione alla principale):
9. **Sostituito: chi vince la scommessa?** Verbale «L'ho vinta io. Pago lo stesso» (e36.json:134; anche :141, :143)
   contro bar «hai perso il posto, non la scommessa» (finale.json:37). IPOTESI: il bar intende che il protagonista ha
   «durato» comunque; letto così smentisce il verbale.
10. **«Il questore»** in e36 (e36.json:156, :160, :164, :167-168, :172, :175): titolo di un ordinamento reale; CLAUDE.md
    chiede nessuna forza di polizia reale. Non posso confermare se rientri nel divieto: decide la principale.
11. IPOTESI: la carriera letta a fine triade è dell'esito «migliore» (più stelle), non dell'ultimo giocato
    (src/logica/epilogo.ts:74-77): rigiocando e36 si può cambiare carriera senza volerlo.

## Domande per il PO (nella pagina, in forma di questionario; consigliata per prima)
- D-T2-00 approvazione della bibbia come base (approvata / con modifiche / rimandata).
- D-T2-01 default senza salvataggio della triade 1 · D-T2-02 distribuzione · D-T2-03 club dei quartieri nuovi ·
  D-T2-04 la quinta busta · D-T2-05 Malvasi in S6 · D-T2-06 quando si scrivono episodi · D-T2-11 processo in S6.
- Tecniche (non per il PO ora): D-T2-07/08/09 in CONTROLLO-36.md.
- Nomi nuovi (Sarcone, Ferraris, Marzanti, Tavanti, Marblegate, Runway, Watertower, Newmarket): non verificati in rete.

## Hash
Commit di contenuto: vedi `git log` del ramo (il hash finale è nel messaggio alla principale); catena governo 3/3 in STABILITA.json.
