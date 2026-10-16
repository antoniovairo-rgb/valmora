# PO-119 / D-140 – tavole prima/dopo del ridisegno di protagonista e vice (bozza, da approvare)

Le tavole sono per il sì del PO. Il codice del gioco **non** è ancora cambiato: il disegno nuovo è in `bozza-persona.mjs` e va portato in `src/resa/vignetta.tsx` (`Persona`) solo dopo il sì.

- File `tavola-{m,f}-{360,412}-dpr{1,2}.png`, protagonista uomo (m) e donna (f).
  - In ogni riga: a sinistra PRIMA (le vignette di oggi, disegnate dal codice del gioco), a destra DOPO (la bozza).
  - Le righe: rapporto calmo, teso e critico; verbale bene, medio, male e fallita.
  - Le espressioni sono quelle di `espressioni.ts` (D-133): festa a braccia alzate, mano alla nuca, sopracciglia.
- **Cosa cambia:**
  - proporzioni adulte: testa più piccola rispetto al corpo, spalle vere, inquadratura a mezzo busto;
  - volto con naso, sopracciglia e bocca; capelli con volume e ciocche (uomo: ciuffo; donna: lunghi con frangia);
  - divisa: colletto, cravatta, spalline gialle, distintivo, taschini;
  - vice: berretto con stemma, baffi, camicia scura, spalline.
- **Resta uguale:** stile C (D-066), colori solo dalle classi `v-*`, ombra a retino, contorni spessi.
- **GIUDIZIO** (non misura): a DPR 1 e 360 px i volti sono piccoli; le espressioni si leggono meno che a DPR 2.
