# PO-119 – terza prova di protagonista e vice (PO-131 braccia, PO-132 figura femminile), da approvare

Il codice del gioco **non** cambia: il disegno è in `bozza-persona-3.mjs` (stringa SVG, stessa forma della seconda bozza); le tavole le fa `tavole-3.mjs` (dalla radice del repository: `node coordination/handoffs/sviluppatrice/po119/bozza3/tavole-3.mjs <cartella>`). Taglio a busto (D-171) invariato.

Commit: 07c48c5 (ramo `claude/valmora-resa-v2`).

## File

- `tavola-{m,f}-{360,375,412}.png` (DPR 2): a sinistra PRIMA (seconda bozza), a destra DOPO (terza prova); righe: rapporto calmo, teso, critico; verbale bene, medio, male, fallita.
- `volti-{m,f}.png`: primi piani di ogni tono: protagonista seconda · terza | vice seconda · terza.

## Cosa cambia (parole del PO)

- **«Le braccia non sono disegnate in maniera naturale» (PO-131).** Le braccia sono arti in due tratti, spalla → gomito → polso, che si assottigliano, col polsino e la mano in asse con l'avambraccio. Festa: gomiti aperti all'altezza delle spalle, avambracci in su. Preoccupazione: gomito alto e in fuori, mano dietro la testa. Vice tranquillo: braccia conserte incrociate a X sopra la vita, ogni mano appoggiata sul braccio opposto (prima erano due fasce). A riposo le braccia si leggono lungo i fianchi: cucitura della manica dalla spalla al taglio della vignetta.
- **«Il personaggio con i capelli lunghi non sembra una donna» (PO-132).** Volto ovale con zigomi alti e mento fine (prima era la mascella dell'uomo); collo più sottile; spalle più strette (37 contro 43 unità); naso più piccolo; occhi un po' più grandi con le ciglia; labbro superiore disegnato e inferiore pieno; sopracciglia sottili e arcuate; capelli con volume e riga di lato che incorniciano il viso fino alle spalle, fronte scoperta. Divisa che segue la figura: pinces, vita appena segnata, cravatta e colletto più sottili, taschini più piccoli. Nessun trucco, nessuna forma esagerata, nessun riferimento a persone reali.
- **Restano:** stile C (D-066), colori solo dalle classi `v-*`, espressioni D-133, volto dell'uomo e del vice uguale alla seconda bozza (cambiano solo le braccia).

## Non verificato

- «Naturale» e «riconoscibile» li ho giudicati a occhio sulle tavole: non c'è una misura.
- A 360 px e DPR 1 non l'ho guardata (tavole a DPR 2).
- Nella figura femminile la ciocca sulla tempia destra arriva vicino all'angolo dell'occhio nei primi piani; a dimensione di gioco non si nota, ma è da guardare.
- Le tavole non passano dal guardiano dei token (sono fuori dal gioco); il tratto sottile usa il token `--vignetta-tratto-fine` (1,1) già previsto per il porting.

## Opzioni per il PO (non scelte da me)

- Braccia a riposo: A) lungo i fianchi con la cucitura della manica, come qui (consigliata: si legge la spalla senza cambiare la sagoma); B) mani visibili in basso (busto più lungo, figure più piccole); C) una mano in tasca o sul cinturone (posa più varia, più lavoro di disegno).
