# C-10 · Riepilogo finale

Rapporto: [C-10-1](C-10-1.md). Base 49ab36e (con afe87d3). Sonde: `sonde/c10-e03.mjs` (uscita `sonde/c10-uscita.txt`), tabella `sonde/c10-costi-e03.tsv`.

| gravità | id | in breve |
|---------|----|----------|
| media | C10-01 | `promessa`: pressione quartiere +2 taciuta («ora devi mantenere») |
| bassa | C10-02 | `scorta_pullman`: pressione quartiere +1 taciuta |
| bassa | C10-03 | `luci_accese`: «il quartiere resta illuminato» fa pensare a un costo che non c'è |
| — | conteggio | e03 ha 31 opzioni (non 37), tutte con accenno |

- **Transenne fisse:** corrette in tutti i casi provati, con 0 violazioni su 1200 partite. Osservazioni senza difetto: una perdita dopo il montaggio non toglie transenne (nessun dato lo usa); un salvataggio senza `fisse` fa tornare disponibili le transenne montate (nessun salvataggio reale in quel caso: IPOTESI).
- **Picco:** max dei picchi = `tensione_max` in 3600 partite su 3600.
- **Bilancio:** coerente in 150 partite casuali.

Bloccanti: nessuno.
