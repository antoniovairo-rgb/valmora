# C12-01 – Tensione mai in cifre nel verbale (D-055) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Difetto

Il verbale scriveva la tensione in numeri, contro la decisione D-055 del PO: la tensione si dice solo col colore.
- Nella stella successiva: «Tensione massima ≤ 3: hai 7».
- In «Cosa ti ha aiutato» e «Cosa ti ha penalizzato»: «+3 tensione su Strada da Larkspire».

## Correzione (`src/resa/schermate/Bilancio.tsx`)

- Stella successiva: il requisito si dice coi nomi dei colori della scala (verde, verde chiaro, giallo, arancione, rosso, rosso acceso, come i token `--tensione-0…5`).
  Esempio: «Per la seconda stella la tensione non deve passare il giallo: è arrivata al rosso.»
- Impatti delle scelte sulla tensione: «abbassa la tensione su …» oppure «alza la tensione su …», con «molto» se lo scarto è di 3 o più.
- Pressione, fiducia e riserve restano in cifre: D-097 ammette la fiducia in numero.
- Interruttore rosso `__NO_C12T01`: le frasi di prima.

## Guardiano

`tools/foto-club.mjs` → `controllaCifreTensione`, chiamato su ogni rapporto e su ogni verbale:
- divide il testo della scena in frasi, ai segni «·», «,», «:» e «;»;
- nessuna frase che parla di tensione può contenere cifre;
- legge anche i passi nascosti del verbale.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-c12` | e01 ×2, e02, e03, e13, e25 | verde |
| `… VALMORA_ROSSI=C12T01 …` | 360 px | ROSSO: verbali di e01 ×2, e02, e03, e13, e25 (per esempio «+3 tensione su Strada da Larkspire», «Tensione massima ≤ 3») |
| `node tools/catena.mjs completa` | commit 6651fa0 (con merge della principale 2459e64), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Nota: la prima versione diceva «Per 2 stelle…». Il guardiano l'ha segnalata, perché la cifra delle stelle stava nella stessa frase della tensione. Ora dice «Per la seconda stella…».
