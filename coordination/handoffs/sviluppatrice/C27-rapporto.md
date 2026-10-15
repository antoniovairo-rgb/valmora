# C-026 (C26-06) e C-027 (C27-03, C27-06) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Collaudo: `docs/revisioni/COLLAUDO_C27.md` sul ramo `claude/valmora-collaudo-c27`. Foto in `c27/`.

## C26-06 – la sfida «Stasera» dal campo `partita` (D-130)

- `sfidanti(m)` (`stemma.tsx`):
  - con `m.partita` dà casa contro ospiti, anche se manca la curva di uno dei due;
  - senza `partita` dà le curve, gemellati esclusi (C26-01).
- **Rosso `__NO_C79P01`:** dalle curve, come prima.
- **Guardiani:**
  - `tests/sfida.test.ts`: e13, e25, e07, e31 col campo; rosso: e13 e e07 con un solo club;
  - `controllaSfida` (`tools/foto-club.mjs`), che prende i club attesi da `partita` quando c'è.
- **Esito** (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`):
  - verde: exit 0;
  - rosso C79P01: exit 1, 6 righe. Per esempio «e13 sala: stemmi «cinderwick_united», servono «cinderwick_united,tramway_borough»», ed e07, e25 in sala e verbale.

## C27-03 – «reading 'on'» in StratoCitta (e StratoPixi)

- **Causa** (FATTO, codice): `StratoCitta.tsx:20-22` e `StratoPixi.tsx:33` chiamavano `app.renderer.on('resize', …)` senza renderer. È la stessa famiglia di C24-03.
- **Correzione:** `seguiMisura(app, aggiorna)` in `schermo.ts`.
  - Senza renderer aspetta, un frame alla volta, che arrivi; allora si attacca e misura.
  - Allo smontaggio si stacca, anche se il renderer non è mai arrivato.
  - La usano tutte e due le strate.
- **Rosso `__NO_C80R01`:** chiamata diretta.
- **Guardiano** `tests/schermo.test.ts`:
  - verde: nessun errore senza renderer, aggancio e misura all'arrivo, stacco allo smontaggio;
  - rosso: «reading 'on'», l'errore del collaudo.
- IPOTESI: il caso raro del collaudo (2 su 150) è questo. La corsa a carico del collaudo non l'ho rifatta, quindi non posso confermarlo sulla corsa vera.

## C27-06 – pastiglia sopra «Magazzino delle fonderie» (e19)

**Riproduzione** (sonda in scratchpad: e19 ondata 1 con le unità del bot attento, 360×760):
- la pastiglia «1» del magazzino, posta «sinistra-alto», copre il suo nome per 782 px² (il collaudo: 34,6×22,6).

**Causa** (FATTO, codice, `etichette.ts`, passo 2):
- una pastiglia sopra un nome costava come una sovrapposizione qualunque;
- il bordo della mappa per le unità si contava sul pulsante di tocco da 44 px, trasparente sopra la pastiglia. Così «sopra», al bordo alto, costava più che coprire il nome.
- Prima prova, col solo peso: la pastiglia andava «destra» e usciva dal bordo destro della mappa (foto). Da qui la seconda parte della correzione.

**Correzione** (rosso `__NO_C81P01`: tutto come prima):
- pastiglia sopra un nome, suo o altrui, e nome sotto le pastiglie altrui costano VERA × 5 in più;
- il bordo per le unità si conta sulle pastiglie visibili, e il centro di ogni tocco deve restare nella mappa;
- nome sopra nome e nome fuori dalla mappa diventano quasi vincoli. Senza, le prove davano nomi sovrapposti in e07 ondata 1 ed e26 ondata 4, cioè regressioni C26-11.
- e19: ora la pastiglia è «sopra» il disco, dentro la mappa, e il nome si legge intero.

**Guardiano** (`mappaSchieramento`, `tools/foto-schieramenti.mjs`, ogni ondata a 360×760 con le unità del bot attento):
- pastiglia sopra un nome, misurata come la sonda del collaudo (più di 1 px in tutte e due le direzioni):
  - e19 a zero, il caso del collaudo;
  - le ondate con una pastiglia sopra un nome al massimo 7 su 142. È il verde misurato, un tetto che può solo scendere.
- nessuna pastiglia oltre il bordo della mappa;
- restano i controlli C26-11.

**Misure** (FATTO MISURATO, sonda `attente.mjs`, le 142 ondate):

| | ondate con pastiglie sopra i nomi | nomi su nomi | pastiglie fuori dalla mappa |
|---|---|---|---|
| rosso C81P01 | 19 (e19 782 px², e23 840 px², …) | 0 | 0 |
| verde | 7 | 0 | 0 |

**Restano 7 casi, mappe affollate:**
- e05 ondata 3: 11 px²;
- e13 ondate 1 e 4: «Viale fra stadio e piazza», 164 px²;
- e13 ondata 2: 35 px²;
- e16 ondate 1 e 2: «Magazzino delle fonderie», 208 px²;
- e35 ondata 2: 149 px².

Con i 6 posti per le unità e gli 8 per i nomi, la ricerca un settore alla volta non trova di meglio. Per andare a zero servono più posti, oppure nomi su più righe come nella città (C20-03). Non l'ho fatto: è un lavoro più ampio, che propongo alla principale.

## Esito dei giri

FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`:
- verde: exit 0;
- rosso C79P01: exit 1, 6 righe (C26-06);
- rosso C81P01: exit 1:
  - «e19 ondata 1/2/4 … «1» di magazzino × Magazzino delle fonderie 782 px² (C27-06, il caso del collaudo)»;
  - «19 ondate con pastiglie sopra i nomi (al massimo 7)».
- Il rosso C80R01 (C27-03) è solo nel test unitario: `npx vitest run tests/schermo.test.ts`, 4/4.
- `npx vitest run tests/sfida.test.ts`: 4/4.

## Foto (`c27/`)

- `prima-e19-ondata1-{360,375,412}.png`: rosso C81P01, pastiglia «1» sopra «Magazzino delle fonderie».
- `dopo-…`: col codice nuovo, a 360×760, 375×812 e 412×915.
