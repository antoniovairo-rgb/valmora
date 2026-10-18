# C39-02 – unità impegnate «per il resto della sera» in un'ondata precedente · sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit: 1638c0c.

- **Riproduzione (prima della correzione):** test `tests/causa-risposte.test.ts`, caso del collaudo e25: «Steward fra gli ospiti» (`permesso_mediatore` → `steward_ospiti`, riserva steward −2) in ondata 2; nel rapporto dell'ondata 3, piazzale scoperto con copertura 0. Il codice di prima contava 0 unità impegnate e il testo era «nessuna unità a coprirlo» (test rosso).
- **Correzione (opzione 1 del collaudo):** `src/resa/causa.ts`, `impegnateDaRisposte` conta le risposte di tutte le ondate fino a quella del rapporto, non solo di quella; la chiamata si cerca nell'ondata della scelta. Le risposte di ondate successive non contano. **Rosso `__NO_C116R01`:** solo l'ondata del rapporto, come prima.

| caso e25, rapporto dell'ondata 3, piazzale | prima (rosso C116R01) | dopo |
|---|---|---|
| unità impegnate dalle risposte | 0 | 2 (ondata 2) |
| testo | «nessuna unità a coprirlo» | «le tue risposte non bastano» |

- Test: 316 su 316 verdi; tsc pulito.

## Non verificato

- Quanti rapporti cambiano testo negli altri episodi (l'IPOTESI del collaudo «succede in ogni episodio con risposte fino a sera»): non contato.
- Che ogni effetto di riserva negativo valga «per il resto della sera»: lo dice il motore (`InCorso.riserva`, «variazione permanente», `src/logica/missione.ts:38`); non ho controllato ogni testo delle opzioni.
- Il testo nuovo non l'ho visto a schermo (360/375/412): provato col rapporto disegnato nel test.
