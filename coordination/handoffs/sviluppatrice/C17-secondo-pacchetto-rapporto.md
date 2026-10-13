# Secondo pacchetto C17 · rapporto della sviluppatrice

Vignette in stile C (PO-092, D-114), PO-096, PO-097, C17-15, C17-22.

Ramo `claude/valmora-resa-v2`. Stato: **in consegna**. Catena completa e CI di GitHub: vedi il messaggio di consegna.

| Voce | Cosa | Rosso | Guardiano |
|---|---|---|---|
| PO-092 | Tutte le vignette in stile C «pop retinato»: contorno nero spesso, ombre a retino di punti, stadio di «Stasera» in prospettiva con la folla nei colori dei club, busti nuovi (verbale, guida), ombra a retino nelle vignette delle chiamate. Le vignette fuori dalla chiamata prendono lo spazio libero della pagina (misurato, con 4 px di margine) invece di una riserva fissa: a 360×760 la vignetta del verbale passava da 54 px a riempire la scheda. | `C26V01` (nessuna vignetta), `C36V01` (misura fissa, come prima) | Guardiani di presenza già esistenti; `controllaRiempi`: o la pagina è piena (≤ 8 px liberi) o la vignetta è al massimo |
| PO-096 | Riga dell'aiuto dello schieramento: va a capo invece di troncarsi, carattere piccolo e non minimo; «?» tondo giallo col bordo, icona da 26 px | `C38A01` | `controllaRigaAiuto`: riga non troncata, tocco ≥ 44 px, icona ≥ 24 px |
| PO-097 | «vX.Y.Z» in basso a destra su ogni schermata, dentro il margine inferiore di `#app`: non aggiunge altezza e non copre comandi | `C38V01` | `controllaVersione`: c'è, è la versione del gioco, non interseca pulsanti né link |
| C17-15 | Chiamata con scorrimento accettato (D-114). «Rispondi ↓» porta già alla prima opzione intera: nessun cambio di codice | – | `controllaRispondi`: dopo il tocco la prima opzione è intera nella finestra |
| C17-22 | Nel riepilogo dello schieramento i pulsanti stanno sotto l'elenco, non fissi | `C38R01` | In `controllaSchieramenti`, a 375×667: nessun pulsante sopra il testo del riepilogo |

## Misure (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori sul merge aae4d34 (+ margine 4 px).
- Rossi: ogni guardiano scatta col suo rosso.
  - `C26V01`: vignette mancanti in sala, verbale e guida.
  - `C38V01`: «manca il numero di versione» su tutte le schermate.
  - `C38R01`: «pulsanti sopra Ti restano 3 squadre».
  - `C38A01`: riga troncata e «?» piccolo in 14 schieramenti.
  - `C36V01`, misurato da solo perché `C26V01` lo nascondeva: 5 sale e 8 verbali con spazio libero sotto la vignetta.

## Difetti miei trovati prima della consegna

- La versione, prima fissa sullo schermo, copriva le opzioni delle chiamate. Il suo attributo era lo stesso della versione della home.
- Il calcolo dello spazio libero ignorava il padding di `#app`, quindi la pagina scorreva in 5 sale e 6 verbali.
- Due guardiani misuravano prima che la pagina reagisse al cambio di finestra (800 → 760 → 800) o allo scorrimento. Ho aggiunto un'attesa, senza abbassare soglie.
- Corretti tutti prima della catena.
