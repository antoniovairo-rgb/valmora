# Consolidamento degli episodi (PO-068, 2026-10-11)

Obiettivo del PO: tutti gli episodi pronti, non più bozze, entro il 2026-10-12. Decisioni: D-098 (personaggi),
D-099 (finale), D-100 (scelte che contano), D-101 (lunghezze), D-091/D-092 (eventi e ritmo), D-097 (fiducia).

## Regole per ogni episodio
1. `bozza` tolto. Meccaniche esistenti (D-087); le novità non costruite restano annotate nelle schede.
2. **Testi corti (D-101)**: introduzione di 2 battute; ogni battuta, chiamata, risposta, informazione e accenno ≤ 140
   caratteri; verbali ≤ 220. Tono: il vice Ettore Malvasi ironico e asciutto; niente spiegoni.
3. **Nomi (D-098)**: Ettore Malvasi (il vice; «Malvasi» nei testi, «il vice» va bene), Gianni Lavezzari (sicurezza del
   Cinderwick United, cordiale e disponibile, la talpa), Tullio Varrone e l'impresa «Varrone & Figli» (stadio nuovo),
   Ferrigno (capo della curva Cinderwick). Fonte `ufficio_sicurezza_cinderwick` = Lavezzari. Mai altri nomi propri di
   persone chiave senza chiederli alla principale.
4. **Scelte che contano (D-100)** — chi imposta, chi legge (condizioni «se» di chiamate/opzioni/eventi o esiti):
   - `sospetti_talpa` (int 0-4): +1 quando il giocatore nota un'incongruenza di Lavezzari in e01, e16, e19, e23
     (opzione tipo «annota il dubbio», costo leggero); letta in e33 (con ≥2 lo smascheri prima: chiamata premio).
   - `rapporto_dessi` (ostile/neutro/rispetto): impostata in e08; letta in e10, e12, e20, e29.
   - `testimone` (nessuno/protetto/esposto): impostata in e18; letta in e19, e24, e31.
   - `busta` (nessuna/consegnata/tenuta): impostata in e24; letta in e25, e31, e33.
   - `pista_cattura` (nessuna/porto/soffiata): impostata in e28; letta in e29 (forma della cattura, D-016).
   - `fascicolo` (nessuno/procura/stampa/comando): impostato in e31; letto in e34 ed e36 (varianti del finale).
   - già esistenti: informatore_pagato (e01), presidente_incontrato (e01), furgone_visto (e02); `credito` = **fiducia**.
5. **Finale (D-099)** e36: tre esiti/verbali agrodolci (costruttore sotto inchiesta; tu confermato se fiducia alta,
   sostituito se bassa; il vice paga la scommessa); il degenerato resta «fallita».
6. Fili dell'indice e degli eventi (D-091), ritmo (D-092: mai più di 3 episodi di stadio di fila), finzione dichiarata,
   violenza fuori scena, «fiducia» mai «credito» (D-097), nessuna cifra negli accenni.
7. Taratura: casuale fallisce 50–75% e cresce lungo la stagione; attenta ≥ a fatica; equilibrata contenuto o 3★
   trovate; peggiore fallisce; nessuna opzione dominata; ogni chiamata compare in campagna.

## Verifica
- `node tools/consolidamento.mjs eNN …` = 0 problemi per i propri episodi (lunghezze, bozza); alla fine, senza argomenti,
  anche le variabili. Misura di partenza (2026-10-11 22:50 UTC): 259 problemi, 184 testi troppo lunghi.
- `set -o pipefail; node tools/catena.mjs logica` VERDE; `node tools/ritmo.mjs` uscita 0 a fine lavori.
