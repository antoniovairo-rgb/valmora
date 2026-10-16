# C-028, tablet e PC: correzioni piccole (C28-01, C28-02, C28-09, C28-11) e vignetta instabile (C29-01) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Collaudo: `docs/revisioni/COLLAUDO_C28.md` sul ramo `claude/valmora-collaudo-c28`. Foto in `c28/`, a 1024×768 e 1366×768.

## C28-01 – fascia scura sulla mappa

- **Causa** (dal collaudo, FATTO, codice): il ResizePlugin di Pixi ascolta solo il `resize` della finestra. Quando la mappa passa da 4:3 (sala) a 1:1 (schieramento), la tela resta come prima.
- **Correzione:** `seguiContenitore()` in `schermo.ts`, un ResizeObserver sul contenitore che chiama `queueResize` di Pixi. È usato in StratoPixi e StratoCitta.
- **Rosso `__NO_C86T01`:** solo la finestra.
- **Guardiano** `controllaTela` (`tools/foto-c22.mjs`), su ogni scena del giro foto: la tela copre l'area interna della mappa entro 2 px.
  - La prima versione del guardiano confrontava la tela col bordo esterno, cornice compresa (6 px): corretta.
- **Esito:** rosso 5 righe, per esempio «schieramento: tela della mappa 322×240 dentro 322×322»; verde 0.
- **Foto:**
  - `prima-1366.png`: tela 442×330 in 442×442, fascia scura;
  - `dopo-1366.png`: 442×442.

## C28-02 – opzione già accesa sotto il puntatore fermo

- **Correzione** (`Ondata.tsx`, `stile.css`): l'evidenza al passaggio (`:hover`) vale solo dopo un `pointermove` successivo all'apertura della chiamata (`data-fermo` sulle opzioni).
- **Rosso `__NO_C87H01`:** subito, come prima.
- **Guardiano** `controllaOpzioneFerma`:
  1. finestra alta, così le opzioni stanno nello schermo;
  2. puntatore sulla prima opzione mentre c'è il titolo;
  3. «Riprendi» con la tastiera;
  4. si legge lo sfondo dell'opzione sotto il puntatore.
  - La prima versione era cieca a 360×760 (opzioni sotto il bordo): riparata con la finestra alta.
  - Nella catena era ancora cieca a 412: dopo la ripresa le opzioni non stavano dove le avevo misurate prima della ricarica. Ora la posizione si misura dopo una prima ripresa da tastiera.
  - Esito: verde a 375 e 412 exit 0; rosso C87H01 a 412 «già accesa» su «scorta».
- **Esito:** rosso 3 righe, «già accesa (rgb(0, 194, 255))»; verde 0.

## C28-09 – fuoco della tastiera

- **Fuoco perso:** quando il fuoco finisce sul body, `Scena.tsx` lo porta sulla scena (`tabIndex -1`, nessun contorno). Il Tab dopo arriva al primo comando della scena.
  - **Rosso `__NO_C88F01`.**
  - **Guardiano** `controllaFuoco`: in ogni scena del giro il fuoco non è sul body. Ci si arriva sempre col clic su un comando che poi sparisce, come nel collaudo.
  - **Esito:** rosso 100 righe, verde 0.
- **Contorno del gioco su casa, «i», «?», pastiglie e «Rispondi»:** prima avevano l'anello del browser.
  - **Rosso `__NO_C89C01`.**
  - **Guardiano** `controllaLargo`, a 1366×768, su schieramento e chiamata, col fuoco da tastiera: `outline` solid.
  - La prima versione leggeva lo stile dopo il `blur` e dava falsi rossi; poi contava anche la pastiglia fissa, che è un'immagine e non un comando. Corretto tutte e due le volte.
  - **Esito:** rosso 65 righe («auto»), verde 0.
- **Scelta dichiarata:** il fuoco va sulla scena e non sulla prima opzione. Con la prima opzione, Invio sceglierebbe subito una risposta senza averla letta.

## C28-11 – versione accanto alla colonna

- **Correzione** (`stile.css`): `right: max(0px, (100vw − --larghezza-max) / 2)`, cioè nel margine destro della colonna. Fino a 480 px resta come prima.
- **Rosso `__NO_C90V01`.**
- **Guardiano** in `controllaLargo`: a 1366×768 il bordo destro della versione sta fra il bordo della colonna e 16 px dentro.
- **Esito:** rosso 65 righe, «versione col bordo destro a 1366 px, colonna fino a 923 px»; verde 0.

## Difetto mio trovato facendo le foto: la vignetta della sala appariva e spariva a ogni frame (1366×768)

- **Misura** (sonda in scratchpad, e01 sala a 1366×768, 40 frame): pagina 822 ↔ 768 px, un frame sì e uno no. La vignetta passava da 78,6 px a nascosta. Il pulsante «passo» non si fermava mai, e il clic di Playwright falliva per 30 s («element is not stable»).
- **Causa** (FATTO, codice e misura): la correzione C78V01 (0.23.0) legge l'altezza dal CSS. Da nascosta (`display: none`) quell'altezza non è zero, quindi il calcolo la rimostrava.
  - Col rosso C78V01 non oscilla: il difetto è mio, entrato nella 0.23.0.
  - Sopra 412 px nessun guardiano lo vedeva (C28-13).
  - IPOTESI: a 1024×768 e 1366×768 si vede su ogni sala e verbale abbastanza alti. Ho misurato solo e01 nella sonda; il guardiano trova e01 ed e02.
- **Correzione:** da nascosta l'altezza conta 0. La principale ha fatto la stessa correzione sul suo ramo (C29-01, rosso C89V01, guardiano su 30 frame a 1366×768 e 360×700). Nel merge ho tenuto la sua e tolto il mio rosso C91V01 e il mio guardiano, che erano un doppione.
- Le mie misure col rosso C91V01, prima del merge: 8 righe, «e01 sala a 1366×768: la pagina cambia altezza a ogni frame (822 ↔ 768 px)»; verde 0.

## Esito dei giri

FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`:
- verde: exit 0;
- rossi `C86T01,C87H01,C88F01,C89C01,C90V01` insieme: exit 1, con le righe sopra;

## Foto (`c28/`)

- `prima-{1024,1366}.png`: rossi C86T01, C88F01, C89C01, C90V01. Fascia scura, anello del browser sulla «i», versione sul bordo.
- `dopo-…`: tela intera, contorno magenta sulla «i», versione accanto alla colonna.
