# D-123 – niente nome dell'episodio sulla mappa della città a 360 e 375 · rapporto della sviluppatrice

Decisione del PO, riportata dalla principale: «Via il nome a 360/375».
- A 360 e 375 la mappa mostra solo il disco con numero e stelline; il nome si legge nella scheda sotto.
- A 412 resta la regola attuale.

## Correzione

- `src/resa/mappa/MappaCitta.tsx`: il nome dell'episodio scelto si mostra solo con la finestra larga almeno 400 px (`matchMedia('(min-width: 400px)')`, aggiornato quando la finestra cambia misura).
- Soglia scelta dalla sviluppatrice fra 375 e 412.
- **Rosso `__NO_C61N01`:** il nome a ogni larghezza, come prima.

## Guardiano (`controllaNomiCittaTutti`, `tools/foto-c17.mjs`)

- **Giri sui 36 episodi:**
  - a 360×760 e 375×667: nessun nome; se c'è, «nome mostrato a questa larghezza (D-123)»;
  - a 412×915: il nome c'è e non tocca dischi, stelline né bordo, come prima.
- **Prove di stabilità del posto (C47N01 e C47N02).** Prima giravano a 360: senza nome a 360 sarebbero diventate cieche in silenzio, ora girano a 412.
- **A 412 il controllo del ricalcolo (C47N02) ha mostrato un caso nuovo, riprodotto 4 volte su 4** (sonda `c47-412.mjs`):
  - in e27, con la larghezza del nome fissata al 65% e le stesse righe, la spaziatura più larga non cambia il riquadro del nome, quindi il ricalcolo non parte;
  - un calcolo da capo sceglie l'80%, ugualmente libero;
  - il riquadro mostrato è identico, quindi le sovrapposizioni sono le stesse (zero).
  - Criterio precisato: il ricalcolo è dovuto quando il riquadro del nome cambia misura, e il guardiano confronta solo quei casi. Ora vuole anche che ce ne sia almeno uno, così non diventa cieco.
  - La soglia non è abbassata: nei casi confrontati vale l'uguaglianza di prima (posto, larghezza, spostamento entro 1 px).

## Misure (FATTO MISURATO)

- **Sonda `c23-citta-d.mjs`** (36 episodi scelti a turno):

  | | 360 | 375 | 412 |
  |---|---|---|---|
  | dopo: nomi mostrati | 0 | 0 | 36 |
  | rosso C61N01: nomi mostrati | 36 | 36 | 36 |

  - Sovrapposizioni e nomi fuori dalla mappa: 0 in ogni caso.
- **Foto** in `d123/`: `prima-*` (rosso C61N01) e `dopo-*`, e02 ed e14, a 360/375/412.

## Esito dei giri (`VALMORA_LARGHEZZE=360 node tools/foto.mjs`; il guardiano della città gira da sé a 412, 375 e 360)

FATTO MISURATO:
- verde: exit 0;
- rosso C61N01: a 375×667 e a 360×760 «nome mostrato a questa larghezza (D-123)» in 36 casi su 36 ciascuna;
- rosso C47N02, ora a 412: «il posto non si rifà in 4 casi» (e25, e31, e32, e36);
- rosso C47N01, ora a 412: «posto diverso in 2 casi» (e25, e27).
