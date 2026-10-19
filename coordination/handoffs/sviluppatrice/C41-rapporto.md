# C41-03, C41-04 (D-182, collaudo C-041) · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: 09c1240 (C41-04), 56519a2 (C41-03, D-183). Base: merge della principale (a76301a).

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

## C41-03 – risposte che costano un'unità con tutte le unità schierate: RIPRODOTTO, corretto con D-183 (opzione A)

- **Riproduzione (FATTO MISURATO):** script `c41-03-misura.ts`. Bot su 36 episodi, 4 strategie, la casuale con 5 semi: 1620 offerte su 3355 chiamate con unità non libere (disponibili − schierate ≤ 0), 216 casi distinti. Sono compresi e02 o2 `corteo_scortato`, e02 o4 `indaga`, e24 o2 `steward_bal`.
- **Patch provata e scartata:** `c41-03-patch.diff` (in `unitaFinita` le unità schierate dell'ondata non erano libere; rosso `__NO_C41U01`). Portava le offerte a 0, ma faceva diventare rossi 19 test e la catena logica, compresi i guardiani di bilanciamento:
  - D-160, fiducia nel verso del risultato;
  - PO-083, ripartenza vincibile;
  - C36-03, verbali di fallimento;
  - D-174, tabella di confronto;
  - C34-03 e C34-10, catene narrative di e35 ed e02;
  - C14-03, aggiornamento: e10 non si gioca più fino al verbale.

  Per D-183 la patch NON entra.
- **D-183 (opzione A):** il meccanismo resta com'è (le unità della serata escono dalla prossima ondata) e ora il gioco lo dice.
  - **Costo:** sotto il costo di ogni risposta che impegna unità c'è una riga generata dagli effetti, per esempio «Ti costa 1 squadra dalla prossima ondata» (`effetti-opzione.tsx`, `quandoCosta`; `Ondata.tsx`). **Rosso `__NO_C183Q01`.**
  - **Pannello delle unità** (schieramento): «Le risposte che costano unità le tolgono dalla prossima ondata.» (`Schieramento.tsx`). **Rosso `__NO_C183P01`.**
  - Testi in `data/testi/it/comune.json` (`costo.*`). Nessun numero di gioco cambia.
- **Guardiano:** `tests/costo-quando.test.ts`. Su tutti i 36 episodi, 230 risposte con costo in unità.
  - Verde: tutte dicono «dalla prossima ondata», con tutte le unità che impegnano.
  - Rosso C183Q01: 230 su 230 segnalate.

| misura | prima (rosso C183Q01, C183P01) | dopo |
|---|---|---|
| risposte con costo in unità che dicono da quando vale | 0 su 230 | 230 su 230 |
| e02 o2, chiamata del corteo, 360/375/412 | nessuna riga | «Ti costa 1 squadra dalla prossima ondata», «Ti costa 1 mediatore dalla prossima ondata» |
| pannello dello schieramento, 360/375/412 | nessuna nota | nota presente |
| altezza della pagina dello schieramento (360×760, 375×812, 412×915) | 760, 812, 915 | 760, 812, 915 (non scorre) |

- **Foto:** `c41/prima/` e `c41/dopo/`, schieramento e chiamata, a 360/375/412 (sonda `c41/c41-foto.mjs`).

## Errori miei dichiarati

- Tornando indietro con `git checkout` ho scartato da STABILITA due giri non committati:
  - **giro «logica» ROSSO** su a76301a, con le modifiche non committate della patch C41-03 (`unitaFinita`). Causa del rosso: i 19 test elencati sopra. È stato perso col checkout e non l'ho riscritto a mano;
  - **giro «governo» VERDE** su a76301a, con i testi C41-04 non committati; perso allo stesso modo.

## Non verificato

- **Testi a schermo:** i testi nuovi non li ho visti a 360/375/412.
- **Residuo:** le stesse formule («resta scoperto/a», «tolta dal …», «scortata/o») compaiono in circa 25 altri testi fuori dai 5 casi (`grep` su `data/testi/it`). Non li ho toccati: il collaudo non li segnala e potrebbero essere veri nel loro contesto. Da decidere se allargare la regola.
- **Soft-lock in e10:** con la patch scartata di C41-03 l'ho visto solo come test rosso, non l'ho analizzato.
- **Leggibilità:** la nota del pannello a 360 sta su due righe; contrasto e leggibilità li ho giudicati a occhio.
- **Altre chiamate:** la riga «dalla prossima ondata» l'ho vista a schermo solo nella chiamata del corteo di e02; per le altre 229 risposte la prova è il test sulla funzione, non una foto.
