# S-09 – Abbozzi giocabili, segno «bozza», mappe senza stadio (PO-039, D-087) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata la parte di resa**. I disegni per `mappa.dettagli` aspettano la risposta della principale sull'elenco degli id che ho proposto.

## Cosa ho fatto

1. **Filtro D-090 tolto**: in `src/resa/dati.ts` tutte le missioni sono visibili e giocabili, abbozzi compresi.
2. **Città per stagione**: tengo il comportamento PO-044 della principale (una stagione alla volta). La stagione iniziale è quella dell'episodio scelto, cioè il prossimo da giocare: quando l'ultimo episodio di una stagione è superato, la città si apre sulla stagione dopo. Non ho cambiato codice per questo.
3. **Segno «bozza»** (discreto):
   - bordo tratteggiato sul punto della città;
   - «, bozza» nell'etichetta per i lettori di schermo;
   - sulla scheda, l'etichetta «Bozza» con «Episodio abbozzato: testi e numeri ancora provvisori.»;
   - interruttore rosso `__NO_C14B01`.
4. **Mappe con tipi nuovi o senza stadio** (e11, e17, e30, e35 non hanno curve):
   - prima i punti dei settori cadevano sui tetti;
   - ora, sotto ogni settore di un tipo senza un disegno suo (piazza, porto, mercato, magazzino, zona, tribuna, viale, cantiere, perimetro, piazzale fuori dallo stadio…), c'è una piazza lastricata;
   - curve, strade, stazione e quartiere restano come prima;
   - interruttore rosso `__NO_C14M01` (solo per le foto prima/dopo: nessun guardiano automatico, perché è un ripiego grafico e non un difetto).
5. **Foto senza giocare 36 episodi** (`tools/foto-bozze.mjs`, solo a 360 px):
   - un salvataggio di prova con ogni episodio superato (1 stella, variabili iniziali) li rende tutti avviabili;
   - ognuno si apre dalla città: stagione, segno «bozza» sul punto e sulla scheda, poi sala, briefing e primo schieramento;
   - si controlla che non ci siano errori di console né chiavi di testo mancanti `[[…]]`;
   - il primo episodio delle stagioni 2 e 3 (e13, e25) si gioca per intero;
   - e01-e03 si giocano come prima.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s09` | e01 ×2, e02, e03 giocati; 36 episodi aperti; e13 ed e25 giocati | verde |
| `… VALMORA_ROSSI=C14B01 …` | 360 px | ROSSO: «abbozzo senza segno bozza» su città e scheda, da e04 in poi |
| build con dati rotti (`out/dati-rotti`: tolta la chiave `e20.intro1`) + `node tools/foto.mjs out/foto-rosso out/dist-rotti out/dati-rotti` | 360 px | ROSSO: «e20: chiavi di testo mancanti [[testi:e20.intro1]]» |
| `node tools/foto-mappe.mjs out/mappe-dopo` e `… out/mappe-prima C14M01` | e11, e17, e30, e35 | foto prima/dopo |
| `node tools/catena.mjs completa` | vedi sotto | |

Visti nelle foto (FATTO MISURATO, non sono difetti di questa consegna):
- nella città (disposizione PO-044) il nome dell'episodio scelto, per esempio «Il mercato del sabato» su e04, copre il punto vicino (e07);
- in e30 il settore «viale della stazione» ha tipo `viale`, non `strada`: per questo prende la piazza e non il viale disegnato.

Foto in `docs/foto/s09/2026-10-11/`: città con gli abbozzi, mappe di e11, e17, e30, e35 prima e dopo.
