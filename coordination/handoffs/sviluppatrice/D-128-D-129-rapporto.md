# D-129 (urgenza) e D-128 (simboli degli stemmi) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Decisioni del PO (PO-111, PO-112), comunicate dalla principale. Foto in `d128/`.

## D-129 – «Urgente!» solo con pressione ≥ 4 (C26-10)

- `urgente()` (`vignette-evento.tsx`): urgente se un evento in corso sul settore della chiamata, nella sua ondata, ha pressione ≥ 4 («se» compreso, come C21-09).
  - La soglia è `URGENTE_DA = 4`.
  - Gli eventi del settore li dà `eventiSul()`, la stessa funzione della sagoma.
- **Rosso `__NO_C82U01`:** la regola di D-126 c, cioè un evento qualsiasi.
- **Guardiani:**
  - `tests/urgente.test.ts`: per ogni chiamata dei dati, urgente se e solo se c'è un evento ≥ 4, ricalcolato in modo indipendente; nel rosso, uguale a D-126 c;
  - `controllaVignettaEvento` (`tools/foto-c17.mjs`): spicchio e timbro secondo la regola nuova, su ogni chiamata del giro foto.
- **Quota** (FATTO MISURATO, sui dati, con «se» ignorato):
  - D-126 c: 415 chiamate urgenti su 498;
  - D-129: 235 su 498.
  - La cifra del collaudo, 361/422, è sulle chiamate giocate: non è confrontabile direttamente.
- **Giro foto** (`VALMORA_LARGHEZZE=360 node tools/foto.mjs`):
  - verde: exit 0;
  - rosso C82U01: exit 1, 41 righe. Per esempio «chiamata «ufficio_insiste»: non urgente per i dati, ma spicchio sì e timbro «Urgente!» (D-129)».

## D-128 – quattro simboli ridisegnati (C25-07, C26-07)

`stemma.tsx`, tabella `D128`, a tinta unita col colore secondario come gli altri:

| Club | Prima | Ora |
|---|---|---|
| Square Rovers (calderholt_rovers) | calderone | `fontana`: due vasche sulla piazza lastricata, getto al centro, acqua che cade dalla vaschetta |
| Garden Albion (quillhaven_albion) | penna | `albero_cortile`: chioma a lobi e tronco, suolo e due pilastri del cancello |
| Pinegrove Rangers | pigna con ciuffo e scaglie a rombi (sembrava un ananas) | ovale liscio a punta in basso, gambo corto, niente ciuffo, scaglie come file di archi del colore della forma |
| Belltower Harriers | torre stretta (sembrava un obelisco) | più larga, tetto con gronda, cella ad arco con la campana, cornice, orologio, porta |

- I dati hanno ancora gli id `calderone` e `penna`. Un alias (`VECCHI_ID`) li porta ai simboli nuovi; se la principale cambia gli id in `data/club/`, l'alias si toglie.
- Le scaglie della pigna usano `currentColor`, cioè il `color` dell'svg, preso dal colore del club (dati, D-086).
- **Rosso `__NO_C83S01`:** i disegni di prima.
- **Guardiano** (`tools/foto-stemmi.mjs`, nel passo foto della catena):
  - restano i controlli D-125: simbolo dentro la forma, misura ≥ 40%, contrasto C22-06;
  - in più, per i 4 club, il simbolo disegnato deve essere quello nuovo (`data-simbolo` «…@D-128»).
  - La prima stesura della fontana usciva dallo scudo (2 punti): base stretta.
- **Misure** (FATTO MISURATO, `node tools/foto-stemmi.mjs`):
  - verde: «stemmi: nessun errore»;
  - rosso C83S01: a 360, 375 e 412 «stemmi col disegno di prima (D-128): calderholt_rovers, quillhaven_albion, pinegrove_rangers, belltower_harriers».
- **Foto:**
  - `d128-{360,375,412}-dpr{1,3}.png`: prima (riga in alto) e dopo, alla misura vera (`--avatar`);
  - `stemmi-*.png`: i 16 stemmi.
- **GIUDIZIO sulle foto** (non è una misura; la decisione è del PO):
  - a DPR 3 la pigna si legge come pigna e il campanile come campanile;
  - a DPR 1 le scaglie della pigna diventano una trama. Sul telefono vero non posso confermarlo.
- Non toccati: Stoneway e Railhead. Non ho misurato su di loro i difetti indicati.

## Esito dei giri

FATTO MISURATO: catena completa 3/3 verde su ad38f7a (D-128, D-129, unione con la principale fino a e71d7a1). Il primo giro su b6890bd era rosso per il guardiano dei token: avevo messo uno `style` in linea sull'svg per il colore delle scaglie. Corretto usando l'attributo `color`.
