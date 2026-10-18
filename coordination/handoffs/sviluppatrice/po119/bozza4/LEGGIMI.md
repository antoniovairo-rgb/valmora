# PO-119 – quarta prova di protagonista e vice (PO-133, PO-135), da approvare

Il codice del gioco **non** cambia. Il disegno è in `bozza-persona-4.mjs`, una stringa SVG con la stessa firma della terza prova più due novità: `peso` (in gradi) e la posa `braccia: 'cinturone'`. Le tavole le fa `tavole-4.mjs`: dalla radice del repository, `node coordination/handoffs/sviluppatrice/po119/bozza4/tavole-4.mjs <cartella>`. Il taglio a busto resta invariato.

Commit: 1280934 (ramo `claude/valmora-resa-v2`).

## File

- `tavola-{m,f}-{360,375,412}.png` (DPR 2): a sinistra PRIMA (terza prova), a destra DOPO (quarta). Righe: rapporto calmo, teso, critico; verbale bene, medio, male, fallita. Inquadratura della vignetta (busto).
- `intere-{360,375,412}.png`: figure intere a riposo, prima e dopo affiancate:
  - protagonista uomo e donna, a riposo e con la mano sul cinturone;
  - vice, a riposo e a braccia conserte.
- `volti-{m,f}.png`: primi piani di ogni tono. I volti sono quelli della terza prova.

## Cosa cambia («Le braccia continuano ad essere incollate al busto fermo», PO-133)

- **Braccia separate dal busto.** Hanno un contorno proprio, disegnato sopra il busto, e uno spazio visibile fra braccio e fianco sotto l'ascella. Il gomito è un po' piegato e in fuori. L'avambraccio viene in avanti, verso il centro e scorciato, con la mano in asse e la piega del gomito. Il busto è più stretto (petto 33 unità per l'uomo, 27 per la donna, contro 43 e 37 di prima), così il braccio non ne è più il bordo.
- **Busto non rigido.** La figura si inclina sui fianchi (spostamento di peso) con un angolo diverso per tono e per figura:

  | tono | protagonista | vice |
  |---|---|---|
  | calmo | −3° | +2° |
  | teso | +1,5° | −1° |
  | critico | 0° | +1° |
  | bene | 0° | 0° |
  | medio | −2° | +2° |
  | male | +1° | −1° |
  | fallita | +2° | −2° |

- **Mano sul cinturone** nel tono calmo, per il protagonista. Il gomito è aperto e in fuori, la mano sta sul cinturone e fra braccio e fianco resta un triangolo vuoto. Il cinturone ha la fibbia. Nella figura femminile la vita è segnata.
- **Braccia conserte** (vice): le braccia sono staccate dai fianchi fino al gomito e gli avambracci sono incrociati a X.
- **Figura femminile più femminile, non volgare (PO-135: «il personaggio femminile deve avere un seno accennato, deve essere più femminile ma non volgare»).** Seno appena accennato dalla linea della giacca: una curva sotto il petto con un'ombra a retino stretta, da cui partono le pinces; il contorno della giacca sul petto è appena più pieno (1,5 unità). Nessuna scollatura, nessuna forma marcata. I taschini scendono di 5 unità per lasciare libera la linea. Spalle e vita come nella terza prova approvata: la vita è appena segnata (rapporto vita/petto circa 0,9, come nella terza).
- **Restano:** festa e mano alla nuca come nella terza prova (spalle riposizionate), i volti, lo stile C, i colori solo dalle classi `v-*`.

## Non verificato

- **Mano sul cinturone nella vignetta.** Nelle vignette il busto è tagliato circa a metà petto (unità 71 del disegno), quindi la mano e il cinturone nel tono calmo si vedono solo nelle figure intere. Nella vignetta del tono calmo si vede il gomito aperto. La misura viene dalla geometria (cornice 180, figura a y 72, scala 1,52), non da un'altra prova.
- **Giudizio a occhio.** Ho giudicato «naturale» a occhio sulle tavole: non c'è una misura. L'inclinazione è di 1–3 gradi, e sulle vignette piccole a 360 px l'ho vista solo a DPR 2.
- **Tavole fuori dal gioco.** Le tavole non passano dal guardiano dei token, perché sono fuori dal gioco.

- PO-135: il risultato l'ho giudicato a occhio. Il grado «accennato ma leggibile» a 360 px nelle vignette (busto) è al limite: la curva si legge bene nelle figure intere e nei primi piani, meno nella vignetta piccola.

## Opzioni per il PO (non scelte da me)

- **Mano sul cinturone nella vignetta:**
  - A) lasciare il taglio a busto: la posa si legge dal gomito aperto (consigliata, il taglio è deciso in D-171);
  - B) nel solo tono calmo, inquadratura un po' più larga, fino alla vita: figure più piccole in quella vignetta;
  - C) mano sul petto o sulla spallina invece che sul cinturone: si vede col taglio a busto, ma è una posa più rigida.
