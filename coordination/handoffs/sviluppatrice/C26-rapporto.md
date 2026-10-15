# Collaudo C-026 (0.20.0): C26-01, C26-03, C26-11 · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, unito al ramo della principale (70a7165). Rapporto del collaudo: `docs/revisioni/COLLAUDO_C26.md` sul ramo `claude/valmora-collaudo-c26`.

## C26-01 – la sfida «Stasera» con tre club (e15, e27)

- **Causa** (FATTO, codice): la riga prendeva i club di tutte le curve (`stemma.tsx`), compresa la curva dei gemellati (Railhead).
- **Correzione:**
  - `sfidanti(m)` (`stemma.tsx`) esclude le curve dei gemellati, riconosciute dall'id del settore («…gemellati»), come già in C21-04 (`sfondo.ts`);
  - `controllaSfida` (`tools/foto-club.mjs`) fa lo stesso.
- **Rosso `__NO_C75G01`:** anche i gemellati.
- **Guardiano** `tests/sfida.test.ts`:
  - e15 «cinderwick_united, wallgate_rovers»;
  - e27 «cinderwick_united, waterline_city»;
  - e01 invariato;
  - rosso: tre club in e15.
- Il giro foto non passa da e15 ed e27: lo copre il test.

## C26-03 – D-126 d: a 375×667 il verbale restava a 62-95 px

- **Causa** (FATTO, codice): la vignetta si nascondeva solo sotto il minimo (56/54 px).
- **Correzione** (`vignetta.tsx`): conta anche l'altezza della finestra.
  - Nuovo token `--vignetta-finestra-min: 700px`: sotto, le vignette di sala e verbale non compaiono.
  - Scelta della soglia dichiarata: fra 667 (dove la decisione del PO le vuole nascoste) e 760 (il telefono di riferimento, dove restano).
- **Rosso `__NO_C76V01`:** solo il minimo.
- **Guardiano** (`controllaVignetta`, `tools/foto-c22.mjs`):
  - a 375×667 sala e verbale devono essere nascoste;
  - altrove la vignetta è nascosta solo per mancanza di spazio o finestra bassa.
- **Rosso nel giro foto:** «e01 verbale a 375×667: vignetta «esito-…» mostrata a 92.9 px, va nascosta», e02 69,7 px, e13 71,7 px (gli stessi ordini del collaudo).

## C26-11 – tocco della pastiglia coperto (e06) e nomi sovrapposti (e13, e16)

**Riproduzione** (sonda del collaudo `coordination/sonde/c26-schermate.mjs`, copia nella mia scratchpad con l'id del settore che copre; e06, e13, e16 a 360 e 375):
- e06 a 360: la pastiglia «ritira Mediatore da Piazza del concerto» (posto «sopra») ha il centro sotto il disco del Piazzale;
- nomi sovrapposti: e13 «Viale fra stadio e piazza» × «Parcheggi» 20,5×4,2 (360) e 16,8×3,4 (375); e16 «Magazzino delle fonderie» × «Strada da Kiln» 20,5×1,5; «Piazza del concerto» × «Viale…» 1,0×6,4.

**Causa** (FATTO, codice): in `disponiEtichette` (`etichette.ts`, passo nome + unità) avere il centro del pulsante di tocco sotto un disco, o un nome sopra un altro nome, costava come una sovrapposizione qualunque.
- Il pulsante di tocco è alto almeno 44 px, con la pastiglia in basso (`stile.css:98`): il suo centro sta circa 10 px sopra la pastiglia.

**Correzione:**
- il centro di ogni pulsante di tocco sotto il disco di un altro settore costa VERA × 10⁶: con VERA × 10³ vinceva ancora un posto coperto;
- un nome sopra un altro nome costa VERA × 5 in più. Il primo tentativo era ×10: in e13, a 360, sala e verbale scorrevano di 3-4 px, perché un nome usciva dalla mappa (fuori costa VERA × 10), quindi l'ho portato sotto.
- **Rosso `__NO_C77E01`:** i pesi di prima.

**Misure** con la sonda del collaudo (e06, e13, e16):

| | 360 | 375 |
|---|---|---|
| verde: pastiglie coperte | 0 | 0 |
| verde: nomi su nomi | 0 | 0 |
| verde: sovrapposizioni totali della sonda (prima 86 e 101) | 86 | 100 |
| rosso C77E01: pastiglie coperte | 1 (e06) | — |
| rosso C77E01: nomi su nomi | 3 coppie | — |

- I 12 «tocchi coperti» a 375 della sonda sono il «?» dello schieramento sotto la barra fissa con la riga «i» aperta: il collaudo non li assegna (tornano visibili scorrendo).

**Guardiano** (`tools/foto-schieramenti.mjs`, `mappaSchieramento`):
- ogni ondata di ogni episodio a 360×760, con le unità del bot attento già messe (bozza nel salvataggio, come gioca la sonda del collaudo);
- nessun nome sopra un altro, e ogni pastiglia toccabile prende il tocco al suo centro.
- Verde: nessun errore. Rosso C77E01: nomi sovrapposti in e07 ondata 1, e13 ondata 2, e16 ondata 4, e23 ondate 3 e 4, e26 ondata 4.
- Nel giro foto completo il rosso C77E01 fa scattare anche il ramo delle pastiglie, col caso del collaudo: «e06 ondata 1 … pastiglie col centro coperto mediatore@piazza_concerto».
- In una mia prova ridotta (solo `controllaSchieramenti`, rosso C77E01) quel caso non era comparso: lì ho visto solo i nomi.

## Non toccati (dati o testi, della principale; segnalati a lei)

- C26-06: chi gioca in casa quando manca la sua curva. Proposto un campo `partita`.
- C26-08: colori dei club.
- C26-09: nessun episodio col Tramway.
- C26-02/04/05/12/13: testi e calendario.
- C26-10: regola dell'urgenza.

## Esito dei giri

FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`:
- verde: exit 0;
- rossi `C75G01,C76V01,C77E01` insieme: exit 1.
  - C26-03: 5 righe (e01 verbale 92,9 px, e02 69,7 px, …).
  - C26-11: 10 righe (per esempio e05 ondata 1 «Piazzale dello stadio × Strada da Skyfield», e06 ondata 1 pastiglia mediatore@piazza_concerto).
  - C26-01: 0 righe nel giro foto, perché e15 ed e27 non ci passano; lo copre il test.
- Primo giro verde, col peso ×10 dei nomi: rosso in e13, sala e verbale scorrevano di 3-4 px. Corretto col peso ×5, poi verde.
- `npx vitest run tests/sfida.test.ts`: 2/2.

## Foto (`c26/`)

- `prima-*` sono coi rossi, `dopo-*` col codice nuovo.
- Sfida nella città di e15 ed e27 a 360/375/412 (rosso C75G01).
- Mappa dello schieramento con le unità del bot attento, e06 ondata 1, e13 ondata 2, e16 ondata 4, a 360/375/412 (rosso C77E01).
- `conf-360-e13-mappa.png`: a sinistra prima («Viale fra stadio e piazza» sopra «Parcheggi»), a destra dopo.
- C26-03: nessuna foto mia di sala e verbale a 375×667; ci sono la misura del guardiano e quelle del collaudo.

## Catena instabile su e25 sala: vignetta misurata durante la molla d'entrata

**Rilevato** (FATTO MISURATO): catena «completa» su 8801b7d verde, instabile, verde. Nel giro 2 il passo foto è fallito al primo tentativo con «360px: e25 sala: vignetta «apertura-…» alta 106 px (minimo 56) con la pagina che scorre di 3 px».

**Riproduzione** (sonda in scratchpad, e25 aperto dalla città a 360×760 come `apriTutte`, misura a ogni frame per 2 s):
- 8 prove su 8 con la pagina che scorre di 3,3 px a riposo;
- vignetta di 105,9 px, `main` fermo a 711,3 px.

**Causa** (FATTO, codice e misura):
- la scena entra con una molla di scala (`Scena.tsx`: scala da 0,9 a 1, con rimbalzo sopra 1);
- `useRiempi` (`vignetta.tsx`) prendeva l'altezza della vignetta dal riquadro a schermo, che è scalato;
- finita la molla l'impaginazione non cambia, quindi né il ResizeObserver né altro rifà la misura;
- nella sonda il riquadro passa da 108,2 a 105,9 px a impaginazione ferma.
- Nel giro foto il difetto si vede solo a volte: di solito un'altra misura arriva dopo la molla (mappa pronta).

**Correzione:** l'altezza si legge dall'impaginazione (`getComputedStyle().height`), senza trasformazioni.
- **Rosso `__NO_C78V01`:** dal riquadro, come prima.
- **Misura con la sonda:**
  - e25: verde 0/6, rosso 6/6;
  - e01, e02, e05, e10, e13, e16, e20, e30, e33, e36: verde 0 su 10, rosso 10 su 10 (una prova ciascuno).

**Guardiano** (`controllaVignetta`, `tools/foto-c22.mjs`):
- misura a scena ferma: aspetta che la scena non abbia più trasformazioni;
- prova della molla, deterministica, su ogni episodio aperto dalla città (`apriTutte`, `tools/foto-bozze.mjs`):
  1. scena scalata a 1,03 come all'entrata;
  2. evento `resize`, che rifà la misura;
  3. due frame, per il ResizeObserver;
  4. scala tolta senza altri eventi;
  5. la pagina non deve scorrere.
- La prima versione, senza la prova della molla, nel rosso dava solo 2 righe (e05, e22): dipendeva dai tempi, quindi era quasi cieca. Riparata con la prova della molla.

**Esito** (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`):
- verde: exit 0;
- rosso C78V01: exit 1, 36 righe, di cui 34 della prova della molla. Per esempio «e01 sala dalla città (molla): … alta 80 px … scorre di 2 px», «e04 … 149 px … 2 px».
