# Partita dalla A alla Z (PO-126) · sessione S-06

Consegna: commit `4217997` (421799726dbccd5410105efc80757605196fe787) sul ramo `claude/valmora-partita-az`. Sola lettura sul gioco: nessun file di gioco, dato o test cambiato. Consegna: pagina `docs/partita-az/index.html` (foto in `docs/partita-az/foto/`).

## Cosa è stato giocato

- **Build**: commit `9782eba1bcff2dab3c172ddc1f73b970cead3313` (ramo `claude/valmora-l1-setup-schema-xdrbx7`), `GAME_VERSION` 0.38.0 (`src/versione.ts:272`); la home della build diceva «Versione 0.38.0 · build 9782eba · 2026-10-17 19:28 UTC».
- **Come**: `npx vite build`, poi `node docs/partita-az/gioca.mjs` (seme `partita-az:1`): Chromium di /opt/pw-browsers, finestra 360×760, movimento ridotto, asset veri della build. Da «Nuova partita» (genere m, guida introduttiva vista tutta) fino all'ultimo passo del verbale di e36 e alla città, **un solo salvataggio**, nessun episodio saltato, nessuna variabile scritta a mano (il salvataggio si legge e basta). Al cambio di stagione il giocatore passa dalla mappa della città.
- **Giocatore**: per ogni schieramento e ogni chiamata la decisione la prende il bot `attenta` (`src/logica/bot.ts:44-60`) sullo stato letto dal salvataggio della pagina; con probabilità 15% risponde a caso fra le opzioni valide e con probabilità 20% per ondata sposta un'unità in un settore ammesso a caso (sbagli registrati per episodio in `partita.json`). Era prevista la ripartenza dall'ondata in caso di fallimento («Riparti» o «Ricomincia», tentativi contati), ma non è servita.
- **Registro**: `docs/partita-az/partita.json` (testi a schermo, scelte, rapporti, verbali, variabili prima e dopo, errori di console); pagina generata con `node docs/partita-az/genera.mjs`; curva di difficoltà col solo motore con `node docs/partita-az/curva.mjs 200` → `curva.json`.

## Numeri principali (FATTO MISURATO)

| | Stagione 1 (e01–e12) | Stagione 2 (e13–e24) | Stagione 3 (e25–e36) |
|---|---|---|---|
| Episodi superati / tentativi | 12 / 12 | 12 / 12 | 12 / 12 |
| Stelle | 28/36 (2-2-2-2-3-2-2-2-3-3-3-2) | 27/36 (3-2-1-3-3-3-1-3-1-3-3-1) | 28/36 (1-3-3-2-2-2-2-2-2-3-3-3) |
| Tensione massima per episodio (su 10) | 1-1-2-3-2-2-3-2-2-3-2-2 | 3-2-4-3-3-3-4-1-4-1-3-4 | 5-0-2-3-1-2-1-3-2-0-3-2 |
| Sbagli del giocatore | 19 | 25 | 25 |
| Minuti stimati | ~88 | ~93 | ~95 |

- Partita intera: 36/36 episodi al primo tentativo, **0 blocchi, 0 errori di console** (esclusi 4 avvisi di prestazioni WebGL del driver all'avvio), **0 schermate con scorrimento orizzontale**, 430 chiamate, 3096 tocchi, 262 foto (≤ 40 KB l'una, 9,9 MB).
- Minuti stimati = parole a schermo / 200 al minuto + 2 s per tocco: **stima**, non tempo reale; totale ~276 minuti, ~7-8 a episodio.
- Ogni chiamata aperta a schermo era quella attesa dal motore (`[data-messaggio="chiamata-<id>"]`, 430/430).

### Curva di difficoltà col solo motore (200 campagne per livello, variabili portate, fallito = rigiocato)

| Giocatore | Prime fallite S1 / S2 / S3 | Stelle medie S1 / S2 / S3 |
|---|---|---|
| attento (come nel browser: 15% / 20%) | 0,4% / 1,3% / 0,5% | 2,11 / 2,20 / 2,16 |
| distratto (40% risposte a caso; un'unità spostata nel 50% delle ondate) | 1,9% / 4,2% / 3,3% | 1,99 / 1,98 / 1,93 |
| a caso (tutto a caso) | 62,5% / 63,3% / 65,3% | 1,04 / 1,05 / 1,04 |

Episodi più duri per l'attento: e17 5%, e18 4%, e35 3%; per il distratto e17 10%, e18 9%, e28 8%; a caso e35 79%, e12 76%, e36 75%.

## Come evolve il gioco

- **Stagione 1**: club e città; derby, coppa, mercato, sciopero degli steward, concerto. Fili aperti: Dessì «il Fabbro» → `rapporto_dessi` rispetto (e08; letto in e10, e12, e20, e29), furgone grigio → `furgone_visto` (a e02 non annotato, poi a e09; letto in e10, e11, e12, e13, e16, e21, e29). Le scelte di e01 (informatore pagato, presidente incontrato) non sono state prese. e12 chiude con la lavagna di Malvasi: «Sono organizzati. A chi conviene chiudere lo stadio?».
- **Stagione 2**: la Varrone & Figli (concertone, biglietti doppi), il magazzino delle fonderie, il testimone (`testimone` protetto a e18), retata mancata e talpa (`sospetti_talpa` 0→3 a e16, e19, e23), latitanza del Fabbro, la busta (`busta` consegnata a e24). Le 1 stella (e15, e19, e21, e24) sono «contenuto a fatica» con tensione 4.
- **Stagione 3**: vertice e «Struttura» (e25, tensione 5, la più alta), cattura del Fabbro al porto (e29; `pista_cattura` resta «nessuna» perché a e28 si sono tenute aperte le due piste e e29 ha la chiamata `radio_operazione` per questo caso), fascicolo alla procura (`fascicolo` = procura a e31), Lavezzari smascherato (e33), commissione (e34), rapina (e35), derby finale (e36).
- **Finale**: «Ancora ad interim» (esito `prorogato_procura`), 3 stelle, fiducia 5.

## Problemi trovati (gravità, opzioni; raccomandata per prima)

1. **P-01 · media · FATTO** — Il finale non si sente. Verbale di e36: 5 passi, l'ultimo «Le fonti» con il solo «Alla mappa della città»; la città mostra e36 «Superato: puoi rigiocarlo». Nessuna schermata di fine campagna. Foto `e36-finale-ultimo-passo.jpg`, `99-citta-finale.jpg`. Opzioni: A) schermata di epilogo dopo e36 con le scelte di storia della partita e l'esito della carriera; B) un passo «Fine della campagna» nel verbale di e36 + crediti; C) lasciare.
2. **P-02 · media · FATTO** — La difficoltà non cresce da una stagione all'altra (tabella sopra, per tutti e tre i giocatori). D-108/D-154 regolano la curva dentro la stagione, non fra stagioni. IPOTESI: un giocatore vero sta fra «distratto» e «a caso», perché il bot attento conosce l'effetto esatto delle unità che l'interfaccia mostra solo a colori. Opzioni: A) decisione del PO sulla curva fra stagioni e, se crescente, taratura di S2/S3 misurata anche col giocatore distratto; B) solo soglie delle stelle più alte nelle stagioni dopo; C) lasciare e verificarlo coi test chiusi.
3. **P-03 · media · FATTO** — e36: 3 stelle con il finale intermedio. `data/missioni/e36.json`: `stelle.tre` chiede credito ≥ 5, gli esiti `confermato*` credito ≥ 6; in partita credito 5 → 3★ e «Ancora ad interim» (foto `e36-1-verbale.jpg`). Opzioni: A) terza stella di e36 a credito ≥ 6 (ricontrollando D-105); B) verbale che spiega perché non sei confermato nonostante le 3 stelle; C) lasciare.
4. **P-04 · bassa · FATTO** — Cambio di stagione senza passaggio a schermo: il verbale di e12 e di e24 offre «Prossimo episodio» che porta dritto in sala; la città mostra la stagione nuova senza riepilogo (il passaggio c'è solo nel testo del vice). Foto `00-citta-fine-s1.jpg`. Opzioni: A) passo «Fine stagione N» nel verbale dell'ultimo episodio; B) etichetta «Stagione N» nella sala del primo episodio; C) lasciare.
5. **P-05 · bassa · FATTO + IPOTESI** — In stagione 1 la fiducia resta schiacciata: 9 episodi su 12 la fanno scendere (fino a 1/10, e04, e07, e08), ogni episodio riparte dal minimo 3. IPOTESI: un giocatore nuovo lo vive come punizione continua. Opzioni: A) domanda nel questionario dei test chiusi; B) ritocco del guadagno nelle prime puntate; C) riga nella guida.
6. **P-06 · bassa · IPOTESI** — In campagna (variabili portate) il giocatore a caso fallisce e01 64%, e02 61%, e03 52%, e04 60% … e12 76%: non sempre crescente, contro l'intento di D-108/D-154; dispersione ~3,5 punti con 200 campagne. Non ho letto `controllaDifficolta`: Non posso confermare se misura con variabili iniziali o portate. Opzioni: A) la principale confronta le due misure; B) ignorare finché il guardiano è verde.
7. **P-07 · bassa · IPOTESI** — Città, stagione 3 con tutti gli episodi superati: a 360 px le stelline sembrano sovrapporsi ai bollini vicini (es. 31 sotto 28, foto `99-citta-finale.jpg`); solo guardato. Opzioni: A) sonda delle sovrapposizioni stelle/bollini a 360-412; B) lasciare.

Rilievi già aperti rivisti: **C35-02** (chiamate con una sola risposta): 2 su 430 in questa partita, e29 `ospiti_spaventati` ed e35 `posto_prenotato`. Nessun testo letto in questa partita smentiva la scelta appena fatta (lettura a campione di e24, e28, e29, e31, e36, non sistematica).

## Non verificato

- Una sola partita nel browser, un ramo della storia: gli altri valori di `rapporto_dessi`, `testimone`, `busta`, `pista_cattura`, `fascicolo` e gli altri 11 finali di e36 non sono stati visti a schermo.
- Il flusso «episodio fallito → Riparti/Ricomincia» non è stato percorso: nessun fallimento col giocatore scelto.
- Solo 360 px (non 375 e 412), solo genere m, solo movimento ridotto; nessuna ricarica a metà.
- Testi letti a campione, non tutti i 34 626 parole a schermo; coerenza della mappa e dei cortei non misurata (affidata ai guardiani esistenti).
- Durata: stima a parole e tocchi, non misurata su persone.
- Catena non lanciata (STABILITA.json non scritto), come da consegna.
