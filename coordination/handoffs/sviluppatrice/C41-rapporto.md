# C41-03, C41-04 (D-182, collaudo C-041) · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: 09c1240. Base: merge della principale (a76301a).

## C41-04 – testi che affermano fatti di schieramento falsi: CORRETTO

- **Riproduzione (FATTO, dati):** i 5 casi del collaudo ci sono tutti.

  | episodio | chiave | testo di prima |
  |---|---|---|
  | e33 | `e33.json:96-97` | «tolta alla stazione», «lascia la stazione» |
  | e33 | `:88,90` | «Festa breve sul viale, scortata», «Una squadra la tiene breve» |
  | e25 | `e25.json:103` | «I varchi restano presidiati» |
  | e36 | `e36.json:118` | «resta scoperto e sale» |
  | e02 | `e02.json:37` | «con squadre e steward», senza costo in unità |

- **Correzione:** 8 testi resi neutri sullo schieramento (opzione 1 del collaudo); gli effetti sono invariati.
  - «ti costa una squadra, e la stazione sale»;
  - «Una squadra va al retro»;
  - «Festa breve sul viale»;
  - «Per chiuderla ti serve una squadra»;
  - «I varchi restano come li hai lasciati»;
  - «il cantiere, intanto, sale»;
  - «Accoglienza in banchina»;
  - «Un comitato di accoglienza in banchina».
- **Guardiano:** `tests/testi-schieramento.test.ts`. Verde: 0 casi su 5. Rosso `__NO_C41T01` (il test rimette i testi di prima): 5 su 5.

| misura | prima | dopo |
|---|---|---|
| casi del collaudo con un'affermazione di schieramento falsa | 5 | 0 |

- **Test:** 345 su 345 verdi.

## C41-03 – risposte che costano un'unità con tutte le unità schierate: RIPRODOTTO, NON corretto (serve una decisione)

- **Riproduzione (FATTO MISURATO):** script `c41-03-misura.ts`. Bot su 36 episodi, 4 strategie, la casuale con 5 semi: 1620 offerte su 3355 chiamate con unità non libere (disponibili − schierate ≤ 0), 216 casi distinti. Sono compresi e02 o2 `corteo_scortato`, e02 o4 `indaga`, e24 o2 `steward_bal`.
- **Patch minima provata:** `c41-03-patch.diff`, `unitaFinita`: le schierate dell'ondata non sono libere; rosso `__NO_C41U01`. Dopo: 0 offerte; rosso: 1620.
- **Effetto della patch:** 19 test rossi e catena logica rossa. Fra questi i guardiani di bilanciamento:
  - D-160, fiducia nel verso del risultato: e08 più altri 7 episodi;
  - PO-083, ripartenza vincibile: 5 ondate sotto una possibilità su tre;
  - C36-03, verbali di fallimento;
  - D-174, tabella di confronto;
  - catene narrative C34-03 (e35) e C34-10 (e02);
  - C14-03: e10 non si gioca più fino al verbale, possibile soft-lock da verificare.

  La causa è che il bot schiera quasi sempre tutte le unità, e allora le risposte con costo si spengono quasi sempre.
- **Stato:** la patch non è nel ramo. Le opzioni sono state mandate alla principale:
  - **A) (consigliata)** scrivere nel costo il significato attuale: «dalla prossima ondata». Nessun cambio di equilibrio.
  - **B)** D-182 alla lettera, con ritaratura dei dati.
  - **C)** la risposta toglie un'unità dalla mappa.

## Errori miei dichiarati

- Tornando indietro con `git checkout` ho scartato da STABILITA due giri non committati:
  - la catena «logica» ROSSA su a76301a, con la patch C41-03;
  - poi la catena «governo» VERDE su a76301a, con i testi C41-04.

## Non verificato

- **Testi a schermo:** i testi nuovi non li ho visti a 360/375/412.
- **Residuo:** le stesse formule («resta scoperto/a», «tolta dal …», «scortata/o») compaiono in circa 25 altri testi fuori dai 5 casi (`grep` su `data/testi/it`). Non li ho toccati: il collaudo non li segnala e potrebbero essere veri nel loro contesto. Da decidere se allargare la regola.
- **Soft-lock in e10:** con la patch C41-03 l'ho visto solo come test rosso, non l'ho analizzato.
