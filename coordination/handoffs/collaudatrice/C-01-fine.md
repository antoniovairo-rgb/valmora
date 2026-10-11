# C-01 · Riepilogo finale

Rapporti: [C-01-1](C-01-1.md) (motore, base 759f0b7) · [C-01-2](C-01-2.md) (dati e01 v2, base 21ea6c7). Sonde in `sonde/` (c01-motore.mjs, c01-riserva.mjs, c01-e01.mjs), tutte con semi fissi e riproducibili.

## Per gravità

| gravità | id | in breve |
|---------|----|----------|
| alta | C01-B01 | «più credito sempre» è una strategia dominante: contenuto con credito 9 |
| alta | C01-B02 | con schieramento buono «degenerato» è irraggiungibile (0/62.208) e il 77,7% dei «a fatica» dipende solo dal credito |
| media | C01-A01 / A02 | si può ri-schierare dopo aver risposto; i rinforzi si usano nella stessa ondata (anche su e01 vera, B10) |
| media | C01-A04 | la riserva scende sotto −quantità e assorbe i rinforzi successivi |
| media | C01-B03 | la chiamata «incrocio» non cambia mai l'esito |
| media | C01-B04 | 5 opzioni su 31 dominate da un'altra della stessa chiamata |
| media | C01-B05 | il prezzo «mediatore −1» in ondata 2 è finto (nessun corteo dopo l'ondata 1) |
| media | C01-B06 | testo «te le daranno subito» non coerente con l'effetto |
| media → risolto | C01-A07 | guardiano «le scelte contano» ora in catena (fd00094); ignora ancora le opzioni con `se` |
| bassa | C01-A03, A05, A06, O01, B07, B08 | perdite dopo lo schieramento; chiavi ereditate e disposizioni malformate; settore vuoto che dimezza; battuta della scommessa; protagonista al maschile |

Bloccanti: nessuno.

## Prove fatte senza difetti

- Soft-lock/eccezioni: 6000 partite (sintetica + e01 v1, 3 strategie × 1000 semi) e 3000 su e01 v2: 0 blocchi.
- Invarianti per ondata (tensione: metà se coperto, somma se scoperto, limite 10; riposo D-056; disponibili ≥ 0): 0 violazioni.
- Determinismo, anche passando dal JSON a ogni passo: 0 differenze su 1000 semi.
- Ordine dei passi: tutti i casi illegali provati vengono rifiutati, tranne il ri-schieramento (A01).
- Effetti delle opzioni: tutti applicati. L'esito segue tensione_max e variabili.
- e01 v2: tre esiti raggiunti, le scelte cambiano l'esito, nessun riferimento reale né violenza in campo, nessun refuso trovato.

## Limiti dichiarati

- Lo schieramento «attento» vede le pressioni vere (D-041 le nasconde al giocatore): i numeri di B1-B9 sono un tetto, non il giocatore reale.
- Durata solo in passi (16 decisioni, fino a 33 piazzamenti); il tempo reale non lo posso confermare.
- Tono: giudizio, non misura.
