# D-125 (PO-109), passo S – 12 stemmi nuovi · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Piano: `docs/proposte/13-club.md` §2.4 e §8.2 (sul ramo della principale). Foto in `d125-stemmi/`.

## Cosa ho fatto

`src/resa/stemma.tsx`: 12 simboli nuovi, a tinta unita col colore secondario del club come gli altri. I fori (finestre, feritoie, tacche) sono sottotracciati evenodd.

| Club (id del piano) | Forma | Id del simbolo (da mettere in `stemma.simbolo`) | Disegno |
|---|---|---|---|
| Arches (mossgarth_town) | tondo | `arco` | due pilastri e arco a tutto sesto, arco più piccolo dietro a metà altezza |
| Studio (ollerbrook_town) | rombo | `ciak` | lavagnetta col bordo, asta incernierata aperta di 20°, tre strisce diagonali |
| Stoneway (saltmere_wanderers) | scudo | `pietra_miliare` | cippo con la cima arrotondata, tacca orizzontale, base squadrata |
| Pinegrove (pinegrove_rangers) | tondo | `pigna` | ovale a punta in basso con le scaglie a rombi su tre file, ciuffo di tre aghi |
| Belltower (belltower_harriers) | scudo | `campanile` | torre stretta, cella aperta con la campana, tetto a punta |
| Waterline (waterline_city) | rombo | `onde` | tre linee ondulate parallele |
| Lookout (lookout_fc) | scudo | `torre_vedetta` | torre larga con tre merli e feritoia verticale |
| Domepark (domepark_villa) | tondo | `cupola` | mezza sfera su tamburo con tre finestre ad arco |
| Tramway (tramway_borough) | rombo | `tram` | vettura coi bordi arrotondati, tre finestrini, pantografo a V |
| Railhead (railhead_county) | scudo | `fine_linea` | due binari che convergono verso l'alto contro un respingente |
| Southwind (southwind_town) | rombo | `ancora` | anello in alto, ceppo, bracci curvi con le punte |
| Wallgate (wallgate_rovers) | scudo | `porta_mura` | arco d'ingresso fra due torri merlate |

- **Rosso `__NO_C62S01`:** i 12 simboli non ci sono; i club cadono sulle iniziali, come oggi.
- Gli id dei club sono quelli del piano. Finché i file in `data/club/` non ci sono, il guardiano usa forma e colori del piano. Quando ci sono, vincono i dati.

**Difetto trovato in uno stemma esistente: la penna di Garden usciva dal rombo.**
- Il guardiano nuovo misura 17 punti del simbolo fuori dalla forma, in alto e in basso.
- Ora la penna è al 78% attorno al centro.
- **Rosso `__NO_C62P02`:** com'era.
- Foto `d125-stemmi/prima-penna-412.png`.

## Guardiano (`tools/foto-stemmi.mjs`, permanente nel giro foto)

È chiamato da `apriTutte` (`tools/foto-bozze.mjs`), cioè dal passo «foto» della catena.

**Come funziona:**
- disegna i 16 stemmi (13 di Valmora e 3 di fuori città) con `stemma.tsx` vero, tramite il server di vite in SSR;
- li misura in Chromium alla misura del gioco (`--avatar`, 42 px), col CSS del gioco, a 360, 375 e 412 px.

**Per ogni club controlla, sulla geometria vera** (punti ogni 0,5 unità del disegno, `isPointInFill`/`isPointInStroke` nello spazio di ogni elemento):
- il simbolo c'è, non le iniziali;
- ogni punto del simbolo sta dentro la forma;
- il lato maggiore del simbolo è almeno il 40% di quello dello stemma.
  - Scelta dichiarata: il lato maggiore, perché onde e collina sono larghe e basse.
  - Con la sola altezza la collina di Skyfield, esistente, misurava 9,7 px, cioè il 23%: lo stesso valore del collaudo C22.
- poi il contrasto di C22-06 (`controllaStemmi`).

## Misure (FATTO MISURATO)

**Sonda diretta**, `node tools/foto-stemmi.mjs <cartella>`:
- verde: «stemmi: nessun errore» a 360, 375 e 412;
- rosso C62S01: 12 club su 12 con «iniziali al posto del simbolo», da «arco» a «porta_mura»;
- rosso C62P02: «quillhaven_albion: 17 punti del simbolo fuori dalla forma».

**Prima stesura bocciata dal guardiano, poi corretta:**
- binari di Railhead fuori dallo scudo: 14 punti;
- torri di Wallgate fuori dallo scudo: 2 punti;
- pigna, ciak e cupola piccoli: ingranditi del 12-25%.

**Foto:** `prima-stemmi-*.png` (rosso C62S01) e `dopo-stemmi-*.png`, 16 stemmi a 360/375/412 con DPR 2.

## Da guardare nelle foto (per il PO)

- Le coppie di colore indicate nel piano: Lookout con Kiln, Wallgate con Kiln, Southwind col lime di Arches, il bianco di Waterline.
- Belltower: il campanile antracite sul rosa si legge, la campana nella cella è piccola.
- Pinegrove: le scaglie della pigna sono fori di circa 2,5 px. Non posso confermare che a DPR 1 la pigna non sembri un frutto qualunque.

## Non fatto, di proposito

- `GAME_VERSION`: il piano mette l'aumento nel passo S, ma la versione cresce a ogni rilascio e il rilascio lo fa la principale col suo rituale (ISTRUZIONI_PO §7). Lo lascio a lei, per non toccare la numerazione dal ramo.
- I file in `data/club/` e i campi `stemma` di arches, studio e stoneway sono passi P (8.1).

## Esito dei giri

FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs` (il controllo degli stemmi gira da sé a 360, 375 e 412):
- verde: exit 0;
- rosso C62S01: exit 1, una riga per larghezza: «stemmi: mossgarth_town: iniziali al posto del simbolo «arco»; ollerbrook_town: … «ciak»; …».
