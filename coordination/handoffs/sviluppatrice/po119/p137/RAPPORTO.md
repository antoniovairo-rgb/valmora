# PO-137 – braccia smussate in tutte le immagini (PO: «riesci a smussare gli angoli delle braccia in tutte le immagini?») · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: COMMIT_P137. Base: quarta prova (D-176) + C117B01.

## Causa (FATTO, dal codice)

- `src/resa/persona2.ts`, `arto`: i lati del braccio erano già curve raccordate, ma il contorno aveva quattro spigoli:
  - due ai lati del polso, per il taglio dritto (`L`);
  - due ai lati della spalla, per la chiusura dritta (`Z`).
- Vale per tutte le braccia di tutte le figure.

## Correzione

- Il polso e la spalla hanno un cappuccio arrotondato. Il contorno è un'unica curva chiusa, fatta di quadratiche fra i punti medi, quindi raccordata in ogni punto: gomiti, spalle e polsi senza vertici.
- Pose, punti di spalla, gomito e polso, larghezze, mani, busto e volti sono invariati.
- **Rosso `__NO_C118S01`:** il contorno di prima.
- Ogni tracciato di braccio porta `data-arto` per il guardiano.

## Misure

| guardiano `tests/braccia.test.ts`, 14 vignette (7 toni × uomo/donna, col vice), 68 braccia | prima (rosso C118S01) | dopo |
|---|---|---|
| braccia con una svolta del contorno oltre 30° (angolo interno sotto 150°) | 68 su 68 (spigoli di circa 90°) | 0 su 68 |
| svolta massima | circa 94° | 1,8° |
| due braccia per figura, attaccate e disegnate dopo il busto (C117B01) | verde | verde |

- **Resto del disegno:** fuori da `nuca`, togliendo i contorni colorati (braccia e busto) e gli attributi, il resto del disegno è identico alla quarta prova in 432 casi su 432 (volti, cinturone, spalline, mani, colletto).
- **Test:** 320 su 320 verdi; tsc pulito.
- **Foto:**
  - `smussate-{m,f}-{360,412}.png`: tutti i toni, a sinistra il rosso C118S01 e a destra la correzione;
  - `intere-{360,412}.png`: figure intere di uomo, donna e vice in tutte le pose (riposo, cinturone, conserte, festa, nuca), prima e dopo.

## Non verificato

- **Busto:** il confronto sopra esclude anche il contorno del busto, che ha la stessa classe di colore. Il codice del busto non è cambiato (diff solo in `arto`), ma non l'ho misurato.
- **Arrotondamento:** il cappuccio arrotondato accorcia appena la manica sotto la mano (raggio metà larghezza); l'ho giudicato a occhio.
- **`busto.tsx` di S-09:** lo porta S-09.
