# C-03 · Riepilogo finale

Rapporto: [C-03-1](C-03-1.md). Consegna collaudata: `claude/valmora-resa-v2` a 5939b01. Sonda: `sonde/c03-resa.mjs`. Foto: `foto/C-03/`.

| gravità | id | in breve |
|---------|----|----------|
| media | C03-R01 | doppio tocco veloce durante l'uscita della scena: la seconda opzione sostituisce la prima |
| media | C03-R02 | «Nuova partita» cancella la partita (anche le missioni concluse) senza conferma |
| media | C03-R03 | il verbale elenca 13 scelte invece delle «due o tre che hanno pesato di più» del progetto |
| bassa | C03-R04 | ricaricando sul rapporto dell'ondata, il rapporto si salta |
| bassa | C03-R05 | pastiglie «ritira unità» alte 22 px (WCAG 2.5.8: 24 px, eccezione di spaziatura non misurata) |
| bassa | C03-R06 | nomi dei settori a 11 px; a 360 px toccano il bordo della mappa |
| bassa | C03-R07 | «CHIAMATA 1 DI / 5» va a capo a 360 px |

Bloccanti: nessuno.

Requisiti verificati senza difetti:
- e01 giocabile fino in fondo, con esito uguale al motore;
- fallimento e rigioco;
- tensione solo a colori;
- nessuno schieramento dopo le chiamate;
- ripresa a metà ondata;
- link APK;
- nessuno scorrimento orizzontale;
- 0 errori di console.

Una mia misura sbagliata (cifre nel rapporto) è ritirata in C-03-1.

**Da rifare dopo l'integrazione:** il ramo della resa usa il motore e i dati di c433c34, senza le correzioni di C-01/C-02 e senza il ribilanciamento. A integrazione fatta va rigirata `c03-resa.mjs`, in particolare C03-R01.

Limiti: Chromium headless con WebGL, nessun telefono vero. Il ramo senza WebGL (solo HTML) non è provato. Leggibilità: misure più giudizio.
