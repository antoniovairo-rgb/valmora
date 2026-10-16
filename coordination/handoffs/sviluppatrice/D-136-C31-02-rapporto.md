# D-136 (C28-14 e i 7 casi di C27-06) e C31-02 · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Foto in `d136/`.

## D-136 – nessuna pastiglia sopra un nome (tetto del guardiano a 0)

**Correzione** (`etichette.ts`, passo nome + unità):
- due posti in più per le unità, «destra-basso» e «sinistra-basso» (`stile.css`);
- se il posto migliore costa ancora qualcosa, il nome si prova anche più stretto, su più righe (80% e 60% di `--nome-max`), come nella città;
- il centro di ogni tocco non può finire sotto il tocco di un'altra pastiglia. Con i posti nuovi era successo in e31 ondata 2 («squadre@piazzale» sotto la pastiglia di curva_ospiti).
- **Rosso `__NO_C94N01`:** posti e larghezza di prima.

**Guardiano** (`tools/foto-schieramenti.mjs`): tetto `PASTIGLIE_SU_NOMI` portato da 7 a 0. Restano e19 a zero, nomi su nomi, tocchi coperti e pastiglie fuori dalla mappa.

**Misure** (FATTO MISURATO, sonda `attente.mjs`, 142 ondate col bot attento):

| | 360×760 | 375×812 | 412×915 |
|---|---|---|---|
| verde | 0 errori | 0 errori | 0 errori |
| rosso C94N01 (360) | 7 ondate: e05 o3, e13 o1/o2/o4, e16 o1/o2, e35 o2 | | |

**Foto** `d136/prima-*` (rosso) e `dopo-*`: e13 ondata 1 ed e16 ondata 1, a 360, 375 e 412. In e13 «Viale fra stadio e piazza» va su tre righe; in e16 «Magazzino delle fonderie» è libero.

## C31-02 – e30: col la meta, il viale parte dallo stadio

**Causa** (dal collaudo): con `meta: piazza_municipio` il viale partiva dal bordo basso. Il corteo andava al municipio ma si avvicinava allo stadio (57/69), mentre il testo dice «dallo stadio verso il municipio».

**Correzione** (`sfondo.ts`):
- con la meta e lo stadio disegnato, il viale parte dal bordo dello stadio dalla parte della strada;
- su quel viale il corteo cammina sempre verso la meta, nell'ondata e nella chiamata (`versoMeta`, `StratoPixi.tsx`). Così anche l'ondata 4 («dallo_stadio», «dopo il corteo al municipio») va via dallo stadio.
- `data-folla` riporta il verso disegnato.
- **Rosso `__NO_C95S01`:** dal bordo basso, come prima.

**Guardiano** `tests/viale.test.ts`:
- e30: `versoMeta`, e il corteo in avanti si allontana dallo stadio in almeno il 90% dei passi;
- rosso: no.

**Misure** con la sonda del collaudo, `RIF=piazza_municipio W=360 EP=e30`. Persone via / verso lo stadio, e via / verso il municipio:

| ondata | verde | rosso C95S01 |
|---|---|---|
| 2 (corteo) | stadio 69/0, municipio 6/63 | stadio 12/57, municipio 0/69 |
| 3 | 70/0, 6/64 | 12/57, 0/69 |
| 4 («dallo_stadio») | 69/0, 7/62 | 58/12, 70/0 (via dal municipio) |
| chiamate su strada_cinderwick | 39-40/0, 3-4/36-37 | 9/30, 19/20 |

## Esito dei giri

FATTO MISURATO: catena completa 3/3 verde su 1a42d48 (un giro rifatto dopo un riavvio del contenitore).
