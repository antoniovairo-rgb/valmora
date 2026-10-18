# PO-119 / D-140 – seconda bozza di protagonista e vice («Non basta, più cura»), da approvare

Il codice del gioco **non** è cambiato: il disegno è in `bozza-persona-2.mjs` (stringa SVG); le tavole le fa `tavole-2.mjs`. Va portato in `src/resa/vignetta.tsx` (`Persona`) solo dopo il sì.

## File

- `tavola-{m,f}-{360,412}-dpr{1,2}.png`: a sinistra PRIMA (le vignette di oggi, dal codice del gioco), a destra DOPO; righe: rapporto calmo, teso, critico; verbale bene, medio, male, fallita.
- `volti-{m,f}-3x.png`: primo piano del solo volto in ogni tono, a 3× (protagonista e vice).

## Cosa cambia rispetto alla prima bozza (punti del PO)

- **Volto:** ombre a campitura su guancia e zigomo (lato lontano), mento e sotto il naso; occhi con bianco, pupilla con la luce, palpebra superiore marcata e linea sotto; bocca con le labbra (labbro inferiore pieno); orecchie col padiglione. Uomo: mascella più squadrata, sopracciglia spesse; donna: viso più morbido, sopracciglia sottili, ciglia, labbra più piene. Volti di tre quarti (girati di poco).
- **Divisa:** pieghe del tessuto, colletto a due lembi con la loro ombra, cravatta col nodo e la luce, distintivo a scudo con la stella, spalline con l'impuntura, taschini con la patta.
- **Mani** con quattro dita e il pollice nella festa (braccia alzate) e nella mano alla nuca.
- **Pose:** spalle non simmetriche (busto un po' girato); il vice a braccia conserte quando è tranquillo (rapporto calmo e teso, verbale medio), braccia alzate nella festa, preoccupato nel critico.
- **Inquadratura** più stretta: figure 1,15 volte più grandi della prima bozza (circa 1,4 volte quelle di oggi), busto fino al petto.
- **Restano:** stile C (D-066), colori solo dalle classi `v-*`, espressioni D-133.

## Da sapere per il porting

- I dettagli del volto usano un tratto sottile: nella bozza è la classe `v-fine` (1,1 unità); nel gioco diventa un token nuovo (`--vignetta-tratto-fine`) e la classe in `stile.css`. Col tratto normale (2,4) a 3× gli occhi diventavano macchie nere (misurato sulla prima versione della bozza).
- Le impunture delle spalline usano `stroke-dasharray` (attributo SVG, non stile in linea).

## Non verificato

- A 360 px e DPR 1 i volti misurano circa 50 px di altezza: si leggono meglio della prima bozza, ma l'ho giudicato a occhio sulle tavole, non con una misura.
- Le tavole non passano dal guardiano dei token (sono fuori dal gioco).

## Opzioni per il PO (non scelte da me)

- Inquadratura: A) busto fino al petto come qui (consigliata: si vede la divisa); B) più stretta, solo testa e spalle (volti più grandi, la divisa quasi sparisce); C) figura fino alla vita (divisa intera, volti più piccoli).
