# S-24 – Schieramento «Compatto» (PO, C16-02) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Difetto (dalla foto del PO, e03 ondata 3)

La barra Annulla/Ritira tutte/Conferma copriva la fila delle unità e la nota sulle transenne, e c'erano troppe righe di testo.
- Riprodotto (FATTO MISURATO) con l'interruttore rosso `__NO_C27S01`, che rimette la disposizione di prima.
- A 360×760 lo schieramento scorre in **144 ondate su 144** dei 36 episodi, e nelle stesse 144 la barra copre qualcosa.

## Cosa ho fatto (scelta del PO «Compatto»)

- **Sotto la mappa solo la fila delle unità**: chip compatti con icona, nome e numero (il nome sotto, senza maiuscolo per farlo stare); il chip selezionato è evidenziato. Sul chip compaiono anche:
  - il lucchetto, per le unità fisse (transenne);
  - le unità a riposo e quelle già montate, in piccolo.
- **Una sola riga sotto la fila**: «Squadre (3) · Rende di più: …» (C14-11); se è lunga si taglia coi puntini, e il testo intero resta nel `title` e per i lettori di schermo.
- **«?» piccolo in fondo alla riga**: apre le istruzioni («Trascina le unità…») e la nota sulle transenne, che prima erano sempre visibili.
- **Barra in basso**: Annulla e Ritira tutte a sola icona (con `aria-label` e `title`), «Conferma» grande. È `sticky` in fondo alla scena e non `fixed`, perché la scena animata ha una `transform`.
  - Con lo scorrimento a zero la barra sta nel flusso, sotto tutto: nessun contenuto le finisce sotto.
- Rosso `__NO_C27S01`: la disposizione di S-12.

**Ancora da fare** (`data/`, non è mio): la riga sulle transenne nella guida. Chiedo alla principale di aggiungerla ai testi `guida.*`.

## Guardiani

- In ogni foto dello schieramento: la barra (`[data-barra]`) non interseca nessun pulsante, link, paragrafo, chip, nome di settore o segnalino.
- `tools/foto-schieramenti.mjs`, a 360×760:
  - per **ogni ondata dei 36 episodi** (144 stati calcolati dal motore col giocatore equilibrato), si riprende dalla home;
  - zero scorrimento, e la barra non copre niente;
  - e03 ondata 3 anche a 375×812 e 412×915, con foto.

Ho riparato una cecità del guardiano stesso: le pagine nuove non ricevevano gli interruttori rossi. Col primo braccio rosso il controllo sulle 144 ondate era verde; dopo la riparazione è rosso su tutte e 144.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s24` | partita completa + 144 ondate | verde |
| `… VALMORA_ROSSI=C27S01 …` | 360 px | ROSSO: 144 «px di scorrimento nello schieramento», 144 «la barra in basso copre», 10 foto con la barra sopra il contenuto |
| `node tools/foto.mjs out/foto-s24` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | vedi sotto | |

Foto in `docs/foto/s24/2026-10-12/`: e03 ondata 3 prima e dopo, a 360×760, 375×812 e 412×915.
