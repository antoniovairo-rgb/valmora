# S-25 – Stadio negli episodi di città (PO-080) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Difetto

In e04 (e anche in e17 ed e30) c'è il settore «Piazzale dello stadio», ma sulla mappa lo stadio non c'era. Lo sfondo disegnava lo stadio solo fra due settori di tipo `curva` (`src/resa/mappa/sfondo.ts`, `disponi`), e questi tre episodi di curve non ne hanno.
- FATTO MISURATO: col rosso `__NO_C29P01` la mappa di e04, e17 ed e30 ha `data-stadio=""`, cioè nessuno stadio (foto `docs/foto/s25/prima-*.png`).

## Cosa ho fatto

- `stadioVuoto` in `src/resa/mappa/sfondo.ts`: se l'episodio non ha curve ma ha un settore di tipo `piazzale`, lo stadio si disegna **vuoto** accanto al piazzale. Vuoto vuol dire:
  - niente tifosi e niente curve colorate (gradinate neutre);
  - i viali non ci vanno, perché non c'è la partita.
- Posizione: fra 8 direzioni attorno al piazzale e 4 misure, si sceglie la più grande che rispetta tre condizioni:
  - gli spalti stanno quasi tutti dentro la mappa (al più un quarto fuori);
  - i **pallini** degli altri settori distano almeno 1,3 raggi dell'ellisse;
  - il pallino del piazzale resta fuori dagli spalti (1,45 raggi).
- Scelta tecnica dichiarata: i **nomi** dei settori possono stare sopra gli spalti.
  - Hanno il fondo nero e stanno sopra il disegno, quindi restano leggibili.
  - Con il vincolo anche sui nomi, una prima versione rimpiccioliva lo stadio fino a renderlo quasi irriconoscibile in e17 ed e30 (foto controllate a 360).
- La mappa espone `data-stadio` (`pieno`, `vuoto` o vuoto) e `data-stadio-ellisse` (centro e raggi), per il guardiano.

## Interruttori rossi

- `__NO_C29P01`: niente stadio, come prima.
- `__NO_C29P02`: stadio centrato sul piazzale (copre il settore). Serve a dimostrare che il guardiano di copertura non è cieco.

## Guardiani (`tools/foto-bozze.mjs`, `apriTutte`, 36 episodi aperti dalla città a 360×760)

- `data-stadio` coerente coi dati: con due curve `pieno`; senza curve ma col piazzale `vuoto`; altrimenti vuoto.
- Con lo stadio vuoto, nessun pallino di settore dista meno di 1,1 raggi dal centro degli spalti.
- Foto della mappa per ogni stadio vuoto, salvata nella cartella del giro.

## Misure (FATTO MISURATO)

- Verde sulla versione finale: misurato dalla catena completa della consegna (vedi `STABILITA.json`).
  - Una versione intermedia era rossa: in e04 gli spalti coprivano il nome «Mercato rionale». Il guardiano allora controllava anche i nomi; l'ho corretto come descritto sopra.
- Rosso `C29P01`: «e04/e17/e30: stadio disegnato «», i dati dicono «vuoto»».
- Rosso `C29P02`: «lo stadio vuoto copre …» in e04, e17 ed e30.
- Prova a 360, 375 e 412 (e04, e17, e30, sala dell'episodio aperta dalla città): stadio presente in 9 casi su 9. Distanza minima di un pallino dal centro degli spalti: 1,37 raggi (e30 a 375 e 412).
  - Foto: `docs/foto/s25/prima-<larghezza>-<episodio>.png` e `dopo-<larghezza>-<episodio>.png`.

## Non fatto

La vignetta d'apertura di questi episodi mostra ancora la «città», senza stadio (`src/resa/vignette-gioco.tsx`). Si può aggiungere lo stadio vuoto anche lì, se il PO lo vuole.
