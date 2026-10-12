# PO-089 – Dinamica della mappa e vignetta per ogni chiamata · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata la scelta A del PO**. Lo zero scorrimento resta una decisione aperta (vedi in fondo).

## Dinamica della mappa (`src/resa/mappa/dinamica.ts`, `StratoPixi.tsx`)

- Durante una chiamata, la mappa riceve `citato`, cioè `chiamata.settore`.
  - Se il settore è una **strada** con il suo viale, un corteo lo percorre: verso lo stadio prima della partita, via dallo stadio dopo il deflusso.
  - Altrimenti la **folla** si raduna e gira attorno al punto.
- Quando la risposta impegna squadre (effetto `riserva` negativo), l'unità **vola** dal bordo basso della mappa (la centrale) al punto della chiamata (`App.tsx`, `vola`). Con «riduci movimento» il volo non si vede, ma resta scritto in `data-volo`.
- La dinamica si rifà anche dopo il ridisegno dello sfondo (S-26).
- **Rosso `__NO_C32D01`**: niente dinamica e niente volo, come prima.

## Vignetta della chiamata (`src/resa/vignette-chiamata.tsx`, scelta A)

- Piccola, circa un terzo della larghezza, a sinistra del testo, dentro il fumetto.
- Disegnata dai dati, senza testi nuovi:
  - il luogo viene dal tipo del settore (strada, piazzale, curva, stazione, tornelli, quartiere, piazza o mercato, zona industriale, porto; senza settore, la sala operativa);
  - chi chiama viene dalla fonte (radio, telefono, rete e giornali, il vice, uffici e club).
- Il rosso C26V01 (nessuna vignetta) vale anche qui.
- Il disegno è ancora nello stile S-23: quando il PO sceglie lo stile del provino PO-092, si rifà nello stesso stile.

## Chiamata compatta

Solo nella chiamata: testata, fumetto, commento del vice e opzioni più stretti. La mappa resta intera e quadrata.
- Ho provato la mappa 4:3: il guardiano dei nomi (C-008) dava 47 nomi sovrapposti e 23 aree di tocco sopra un nome a 360 px, quindi l'ho tolta.

## Misure (FATTO MISURATO)

Prima chiamata di ogni ondata, 142 chiamate dei 36 episodi, a 360×760, giocatore equilibrato:

| Versione | Scorrimento minimo | Mediana | Massimo | Senza scorrimento |
|---|---|---|---|---|
| Con la vignetta, senza compattazione | 102 px | 359 px | 607 px | 0/142 |
| Con la compattazione consegnata (mappa quadrata) | 42 px | 271 px | 515 px | 0/142 |
| Prova scartata: compattazione con mappa 4:3 | 0 px | 151 px | 433 px | 5/142 |
| Prova scartata: mappa 4:3 e commento del vice nascosto | 0 px | 97 px | 303 px | 7/142 |

- Anche la mappa a 16:9 sovrappone i nomi (foto controllata).
- **Lo zero scorrimento con la mappa intera non si raggiunge.** Resta l'indicatore «Rispondi» (C09-03), che porta alle opzioni con un tocco. Alla principale ho mandato tre opzioni per il PO.

## Guardiani (`tools/foto-chiamata.mjs`, chiamati da `tools/foto.mjs` nelle partite di e01, e02 ed e03)

- `controllaDinamica`: in ogni chiamata `data-dinamica` vale `corteo:<settore>` per le strade e `folla:<settore>` altrove.
- `controllaVoloRisposta`: dopo una risposta che impegna squadre, `data-volo` vale `<risorsa>><settore della chiamata>`.
- Rosso `C32D01`: vedi il messaggio di consegna.
