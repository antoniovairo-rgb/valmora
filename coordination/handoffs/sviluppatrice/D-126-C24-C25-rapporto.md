# D-126 (b, c, d) e rilievi C-024 / C-025 · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Ordine della principale: D-123 e C24-02 (già consegnati con 8ea156c), poi b, c, C24-03, d, C24-06/07, poi i rilievi del C-025. Foto in `d126-c25/`.

## D-126 b – nel briefing torna l'avatar (C24-01)

- `schermate/Briefing.tsx`: niente più vignetta come figura della fonte.
- **Rosso `__NO_C63A01`:** la vignetta 42×42 di D-118.
- **Guardiano** (`controllaRiempi`, `tools/foto-c17.mjs`): la fonte visibile del briefing ha l'avatar e non la vignetta (invertito rispetto a D-118).
- Rosso: 14 righe «fonte del briefing con la vignetta 42×42 senza avatar».

## D-126 c – spicchio e «Urgente!» solo sulle chiamate con un evento (C24-04)

- `urgente()` (`vignette-evento.tsx`): un evento in corso sul settore della chiamata, nella sua ondata, con la stessa regola della sagoma (`gruppoSul`, «se» compreso).
- `Ondata.tsx`: senza evento niente timbro né spicchio.
- **Rosso `__NO_C64U01`:** urgenti tutte.
- **Guardiano** (`controllaVignettaEvento`): spicchio e timbro presenti se e solo se i dati dicono urgente, con la regola ricalcolata in modo indipendente.
- Rosso: 18 righe, per esempio «rinforzi», «striscione»: «non urgente per i dati, ma spicchio sì e timbro «Urgente!»».
- Foto `conf-360-e01-rinforzi-urgenza.png`: sopra prima, sotto dopo.

**C24-05 – posizione dello spicchio.**
- D-122 lo mette sull'angolo in alto a destra del fumetto. Lì, misurato il 14/10, copriva «Urgente!» in 13 chiamate; sull'angolo dell'avatar 0/142.
- Lo lascio sull'avatar. La scelta finale è della principale.

## C24-03 / C25-03 – «reading 'screen'» (e «reading 'canvas'»)

**Causa.** In Pixi `app.screen` e `app.canvas` leggono il renderer. Il renderer non c'è prima dell'avvio e dopo lo smontaggio (città → briefing).

**Correzione.**
- Nuovo `src/resa/mappa/schermo.ts`: `schermo(app)` e `tela(app)` restituiscono null senza renderer.
- Le usano `StratoCitta.tsx`, `StratoPixi.tsx` e `ridisegno.ts`. L'errore su `canvas` è comparso in una mia sonda: stessa causa.
- **Rosso `__NO_C65S01`:** lettura diretta.

**Guardiano** `tests/schermo.test.ts`: un `app` costruito come Pixi (getter sul renderer).
- Verde: null e nessun errore.
- Rosso: «reading 'screen'» e «reading 'canvas'», gli errori del collaudo.
- IPOTESI: il caso raro del collaudo (3 su 612, 1 su 17) è questo. Sulla corsa vera non l'ho riprodotto, quindi non posso confermarlo.

## D-126 d – vignette di sala e verbale nascoste sotto la soglia (C22-04)

- `vignetta.tsx`: le vignette «apertura-» ed «esito-» si nascondono se lo spazio libero non arriva al minimo.
- Da nascosta, nel conto dello spazio libero si tolgono i suoi margini, così non riappare e sparisce a ogni misura.
- **Rosso `__NO_C66V01`:** restano al minimo.

**Guardiano** (`controllaVignetta`, spostata in `tools/foto-c22.mjs` per la misura dei moduli):
- visibile solo se arriva almeno al minimo e la pagina non scorre;
- nascosta solo se lo spazio non c'è;
- per sala e verbale, prova anche a 375×667.
- Rosso: 11 righe, per esempio «e01 sala a 375×667: … alta 56 px (minimo 56) con la pagina che scorre di 82 px».

**Nota.** Senza la vignetta, la sala di e01 a 375×667 scorre ancora di circa 10 px (82 − 56 − 16 di margini). Non l'ho misurato a parte.

**Foto:** non ho foto di sala e verbale a 375×667; ci sono solo la misura del guardiano e il rosso.

## C24-06 – il nome di e36 saltava a 412

**Riproduzione** (copia della sonda `coordination/sonde/c23-citta.mjs`, con i caratteri ritardati di 700 ms, 412, 10 caricamenti):
- 1/10, con le stesse coordinate del collaudo (240,7/332,9, 90×30,8 → 197,8/303,7, 89×12);
- senza ritardo 0/10.

**Causa.** Il posto era calcolato col carattere di riserva e poi rifatto all'arrivo del carattere vero (C47N02, corretto). Il salto si vedeva.

**Correzione** (`MappaCitta.tsx`, `useCaratteri`):
- il nome si mostra solo coi caratteri caricati;
- sparisce se un carattere ricomincia a caricare e torna a fine caricamento.
- **Rosso `__NO_C68N01`:** subito.

**Guardiano deterministico** (`controllaNomiCittaTutti`, a 412):
- si mandano a mano gli eventi `loading` e `loadingdone` di FontFaceSet;
- durante il caricamento il nome non deve vedersi, dopo sì.
- Rosso: «col carattere in arrivo il nome si vede (poi salta)».
- Il rosso misurato con la sola sonda a tempo è instabile (1/10, poi 0/10): per questo il guardiano usa gli eventi.

## C24-07 – e30: spalti «in arrivo» in un giorno senza partita

- **FATTO.** Negli episodi senza curve (e04, e11, e17, e30, e35) lo stadio, se c'è, è disegnato vuoto (S-25, `sfondo.ts`).
- **Correzione** (`folla.ts`): lì gli spalti sono «vuoti», non «in arrivo».
- **Rosso `__NO_C67S01`:** «arrivo».
- **Guardiani:**
  - `tests/spalti-vuoti.test.ts`: e30 ed e04 vuoti in ogni ondata, e01 invariato, rosso «arrivo» su e30 ondata 2;
  - `controllaFolla` (foto): vuole «vuoti» senza curve. Nel giro foto non passa nessun episodio senza curve, quindi lo copre il test.
- **Non fatto: il verso del corteo.** I dati non lo dicono, e i testi cambiano da episodio a episodio:
  - e04 «prima della partita»: verso lo stadio, ed è giusto;
  - e30 «dallo stadio al municipio»;
  - e17 «in piazza del municipio».
  - Proposta alla principale: un campo facoltativo `verso` sull'evento corteo, nello schema e nei dati (sono suoi). Il codice lo leggerei io.

## C25-02 – la riga «i» faceva perdere il tocco sulla mappa

**Causa** (FATTO, codice): la riga si chiudeva al `pointerdown`. La pagina saliva prima del `click` e il click finiva altrove.

**Correzione** (`Fumetto.tsx`): si chiude al `click`. Il tocco va al settore, poi la pagina si risistema.
- Scelta dichiarata: la riga non diventa sovrapposta, perché PO-101 vuole che non copra la mappa.
- **Rosso `__NO_C69I01`:** al `pointerdown`.

**Guardiano sul tocco vero** (`tools/foto-schieramenti.mjs`, e07 ondata 2, 360×760, 375×667, 412×915): riga aperta, click col mouse al centro di un settore, si registra dove arriva il click.
- Rosso: «il tocco su «viale_stazione» arriva a «(altrove)»» a 360×760 e 375×667.

## C25-04 – guardiano dell'icona di chi chiama

- Ora misura il glifo DISEGNATO (unione dei tracciati più il tratto), non il riquadro dell'svg.
- Il contrasto del contorno si misura contro il fumetto, il fondo vero.
- La sovrapposizione si conta con tutti i testi del messaggio.
- **Misura:** col riquadro da 24 px il glifo disegnato aveva il lato maggiore di 22 px (telefono 22×22, ufficio 18×22, radio 22×16), sotto i 24 chiesti per C22-01.
- **Correzione:** `--icona-chi` da 24 a 27 px (lato maggiore circa 24,8); margine interno da 4 a 1 px, così il riquadro scende da 36 a 33 px.
- Non c'è un rosso nuovo: il rosso C54C01 (riquadro dentro la vignetta) resta. La misura «prima» è quella sopra.

## C25-05 – anello bianco dei pallini sotto 1 px

- Alone da 15 a 15,5 unità: anello 3,5 unità, cioè 1,1 px a 360.
- Il centro non scende sotto 180 − 15,5 − 2: i pallini in fondo toccavano il bordo della vignetta.
- **Rosso `__NO_C72A01`:** com'era.
- **Guardiano** (`controllaVignettaEvento`): anello ≥1 px e alone dentro la vignetta.
- Rosso: 77 righe «anello 0.89 px» (come il collaudo: 0,88).

## C25-06 – folla di sfondo a 3 px

- Strada e piazzale disegnano la folla coi pallini nuovi (`PallinoPersona`), meno numerosi: 8 sulla strada, 9 sul piazzale.
- **Rosso `__NO_C70F01`:** i puntini.
- **Guardiano:** nessun cerchio semplice nel gruppo `[data-folla-sfondo]`.
- Rosso: 45 righe, per esempio «14 puntini nella folla di sfondo».

## C25-08 – icona di chi chiama tagliata a 375×667

- `vista.ts`: `scorriPerIntero`, funzione pura.
- `Ondata.tsx`: all'apertura, e quando compare «Rispondi», se l'icona è tagliata dal fondo della finestra la pagina scorre quanto basta più `--spazio-2`. La posizione si legge dall'impaginazione (`offsetTop`), non dall'animazione.
- **Rosso `__NO_C71S01`:** non si muove.
- **Guardiano** `tests/vista.test.ts`, col caso del collaudo.
- **Misura** (sonda `chi-taglio.mjs`, prima chiamata di ogni ondata dei 36 episodi, 375×667): rosso 10 icone tagliate su 142 (per esempio e08 «dessi_chiama» 642-675), verde 0/142.

## Esito dei giri (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: exit 0, due volte: dopo b/c/d, e dopo tutto il resto.
- Rossi `C63A01,C64U01,C66V01` insieme: D-126 b 14 righe, c 18, d 11.
- Rossi `C67S01,C68N01,C69I01,C70F01,C72A01` insieme:
  - C24-06: 1 riga;
  - C25-02: 3 righe;
  - C25-06: 45 righe;
  - C72A01: 77 righe;
  - C24-07: 0 righe nel giro foto (coperto dal test).
- Test unitari: `schermo` 2/2, `spalti-vuoti` 3/3, `vista` 2/2, `corteo-club` 6/6.
