# S-13 · Rifinitura e10–e12 (D-186, PO-039)

Partenza: `claude/valmora-l1-setup-schema-xdrbx7` @ 9424e68. Ramo: `claude/valmora-rifinitura`.
Esito in breve: **punti 1 e 4 applicati; punti 2 e 3 NON applicati**, perché vanno contro D-160 e il guardiano
`tests/fiducia-verso.test.ts` diventa rosso (misura sotto). Serve una decisione: opzioni in fondo.

## Modifiche applicate

| Punto D-186 | Prima (9424e68) | Dopo |
|---|---|---|
| 1 · presidente fuori da e11 | chiamata `fra_vicini` in M e11:457-496 (ondata 2, `se presidente_incontrato`); testi T e11:71-78 | chiamata tolta (ondata 2 chiude con `dirette`, M e11:425-456); 8 testi tolti |
| 4 · furgone fuori da e11 | chiamata `contromano` in M e11:593-632 (ondata 3, `se furgone_visto`); testi T e11:96-103 | chiamata tolta (ondata 3 chiude con `autoscala`, M e11:516-550); 8 testi tolti |

Ho scelto di **togliere** `fra_vicini` invece di riscriverla (D-186 dice «riscritta o tolta»): è il default più
semplice, nessun testo nuovo da inventare. L'ondata 3 di e11 resta con `non_di_qui` e `autoscala` (2 chiamate).
Dopo la modifica e11 non legge più `presidente_incontrato` né `furgone_visto`, e non ha più testi con «presidente» o
«furgone» (`grep -n "presidente\|furgone" data/testi/it/e11.json data/missioni/e11.json` → nessuna riga).

**Coerenza di e12 senza e11 (punto 4).** FATTO: la chiamata `contromano` di e11 *leggeva* `furgone_visto` ma non lo
impostava (M e11:599-602 prima; nessun `imposta` nelle due opzioni). `furgone_visto` lo impostano e02:723, e03:529,
e04:290, e06:489, e09:177, e09:744 ed e12:215 (la lavagna); e12 lo legge per `targa_davanti` (M e12:648).
I testi di e12 sul furgone (T e12:3, 22, 37, 86, 91-93, 126) non citano la notte di e11; T e12:86 «oggi targato anche
davanti» rimanda a un avvistamento precedente, che resta e10 (T e10:111) o e02–e09. Quindi il filo e10 → e12 regge.

## Punti 2 e 3: non applicati (blocco reale)

FATTO MISURATO. Le 5 opzioni a cui D-186 chiede −1 fiducia sono tutte nell'elenco delle risposte a cui **D-160** ha
tolto la fiducia apposta (verso opposto al risultato), con il valore che avevano prima (`tests/dati/fiducia-d160.json`):
`e11/non_centro/accetta_dessi11` −2, `e11/dirette/allontana_curiosi` −1, `e11/chi_paga/paga_comune` −1,
`e12/portone/chiudi_portone` −1, `e12/rinforzi/chiudi_cancelli` −1.
Ho applicato i 5 effetti (−1 `credito`) e i testi del costo, poi:
`npx vitest run tests/fiducia-verso.test.ts` → **1 rosso su 5**, «le 224 risposte corrette non toccano la fiducia»
(tests/fiducia-verso.test.ts:31): `expected [ …(5) ] to deeply equal []`, le 5 voci sopra «muove di nuovo la fiducia».
Non ho cambiato il guardiano né il suo elenco: le modifiche sono state ritirate.

Misura del bot con i punti 2-3 applicati (ritirata, solo per la decisione; `node tools/bot.mjs 200` e giocata singola
attenta/equilibrata da variabili iniziali): e11 attenta 3★ → **2★** (credito finale 8 → 5); e12 attenta resta 2★
(credito 5 → 4); e11 equilibrata 3★ (credito 9 → 8); 3★ del bot attento su 36: **17 → 16**. Casuale: 0★ invariate
(e11 140/200, e12 146/200), quindi curva invariata.

Altri casi della scheda (punto 3, ultimo trattino): `e12 ordine_scritto` (T e12:117 «La piazza resta più tranquilla») e
`e12 cordone12` (T e12:56 «La curva ospiti si calma davanti alle divise») **non promettono un costo**: regola non
applicabile. Anche loro sono comunque nell'elenco D-160.

### Opzioni per la principale (da portare al PO)
- **A (consigliata) · I 5 costi in testo, non in fiducia.** Si tiene D-160 e si riscrivono i 5 testi del costo perché
  non promettano più un prezzo che non arriva (o lo dicano narrativo, senza fiducia). Costo: 5 righe di testo, bot
  invariato, nessun guardiano toccato. Il patto col Fabbro in e11 resta senza prezzo in fiducia (e10/e12 lo hanno).
- **B · Prezzo diverso dalla fiducia.** Ad esempio +1 tensione o +1 pressione su un altro settore, nel verso del
  risultato. Costo: 5 effetti, rimisura col bot (le stelle e gli esiti si spostano, da misurare); da verificare che
  `perverseRapide` (tests/fiducia-verso.test.ts:39) resti sotto soglia.
- **C · Eccezione a D-160 per queste 5.** Si tolgono dall'elenco `fiducia-d160.json` (224 → 219) e si aggiungono i −1.
  Costo: è una revoca parziale di una decisione del PO e cambia il guardiano; e11 attenta perde la 3★ (17 → 16 su 36).

## Misure del bot prima e dopo (modifiche applicate: punti 1 e 4)

Comando: `node tools/bot.mjs 200` su 9424e68 e sul ramo; `diff` delle due uscite complete → **nessuna differenza**
(tutte le 36 missioni, tutte le strategie). Estratto e10–e12 (identico prima e dopo):

| Episodio | casuale (200) esiti · stelle | attenta | equilibrata | peggiore |
|---|---|---|---|---|
| e10 | degenerato 140, a fatica 56, contenuto 4 · 0★140 1★56 2★4 | contenuto · 3★ | contenuto · 3★ | degenerato · 0★ |
| e11 | degenerato 140, a fatica 58, contenuto 2 · 0★140 1★58 2★2 | contenuto · 3★ | contenuto · 3★ | degenerato · 0★ |
| e12 | degenerato 146, a fatica 54 · 0★146 1★54 | contenuto · 2★ | contenuto · 3★ | degenerato · 0★ |

Il bot parte dalle variabili iniziali (`presidente_incontrato` e `furgone_visto` = false, data/stato.json:26-35),
quindi le due chiamate tolte non comparivano: la misura qui sopra non le vede. Misura aggiuntiva con entrambe a
`true` (script di sola misura, casuale 200 semi, deterministiche 1): esiti e stelle **identici prima e dopo** in
e10, e11, e12 (es. e11 casuale degenerato 140, a fatica 58, contenuto 2; attenta ed equilibrata 3★). Controllo che
la misura non sia cieca: con le variabili a `true` la partita casuale di e11 prima mostrava `fra_vicini` e
`contromano`, dopo no (elenco delle chiamate viste, 13 → 11).

Vincoli: curva D-154/D-162 invariata (le 0★ del casuale non cambiano in nessun episodio); 3★ del bot attento 17/36
prima e dopo; fiducia nel verso (tests/fiducia-verso.test.ts) e bilancio C41/C42 (tests/confronto.test.ts) nelle
catene sotto.

## Catene (D-177)

Vedi la sezione finale, scritta dopo i giri.

## Non verificato
- Perché gli esiti aggregati di e11 con le variabili a `true` restano identici togliendo due chiamate con effetti
  (±1 fiducia, ±1 tensione/pressione): IPOTESI, i 200 semi non cambiano fascia di esito; non l'ho misurato voce per voce.
- `docs/partita-az/` (index.html:308, 321; partita.json:3397-3402, 3525) registra una partita passata con la chiamata
  `contromano`: è un documento storico, non l'ho rigenerato. Se la principale lo vuole allineato, va rigiocato.
- Il conto delle apparizioni del presidente in e01–e09 (scheda, punto 1C) non l'ho fatto.
