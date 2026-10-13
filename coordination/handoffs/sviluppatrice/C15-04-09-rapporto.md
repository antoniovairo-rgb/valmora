# C15-04…09 – Difetti bassi del collaudo C-015 · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**. Catena completa verde 3/3 su 6d89dfe, registrata in `STABILITA.json` (1f8574d).

| Voce | Difetto | Correzione | Rosso | Guardiano |
|---|---|---|---|---|
| C15-04 | Nomi dei settori sovrapposti nella sala (a 360: e25, e31, e34; a 375: e21, e32) | `src/resa/mappa/etichette.ts`: le posizioni dei nomi si scelgono fra tutte le combinazioni (ricerca con taglio, al più 200 000 nodi), più due posizioni nuove («sopra-sx», «sopra-dx») | `C34N01` | `controllaNomiSala` (`tools/foto-c15.mjs`): nella sala la disposizione deve costare quanto la migliore possibile |
| C15-05 | «Ti restano 1 Squadre» | `quante(n, r)` in `src/resa/dati.ts` con i testi `risorsa.<r>.uno/.molti` (aggiunti dalla principale) | `C34T01` | Nel riepilogo nessun «1 squadre/transenne/mediatori» e nessun «N mediatore» con N > 1 |
| C15-06 | Mappa toccabile col riepilogo aperto | Lo schieramento dice all'App quando il riepilogo è aperto; allora la mappa non ha comandi | `C34R01` | Col riepilogo aperto, 0 punti e segnalini della mappa abilitati |
| C15-07 | Fiducia assente in sala, briefing e verbale | Sala e briefing: valore da cui parte il tentativo. Verbale: valore finale, con gli effetti dell'esito. Testata e vignette un po' più basse per restare a zero scorrimento a 360×760 | `C34F01` | Una barra in sala, briefing e verbale; nello schieramento lo stesso valore della schermata prima |
| C15-08 | Messaggio tecnico all'importazione | Tre messaggi in parole: file non di Valmora, versione più nuova, salvataggio rovinato | `C34I01` | File estraneo, futuro e rotto: il messaggio dice «non è cambiata» e non contiene save_version, JSON, undefined o oggetto |
| C15-09 | Salvataggio e riserva rovinati senza avviso | La home dice che la partita di prima non si può riprendere e suggerisce «Importa» | `C34S01` | Con entrambi rovinati compare l'avviso |

## Misure (FATTO MISURATO)

- **C15-04**, sonda `c15-resa.mjs etichette` della collaudatrice:
  - prima: 3/36 episodi con nomi che si toccano a 360 e 2/36 a 375;
  - dopo: 2/36 a 360 (e21, e31) e 1/36 a 375 (e21);
  - area sovrapposta a 360 da 461 a 238 px².
  - e21 ed e31 non hanno una disposizione senza contatti con le posizioni disponibili: la mappa 4:3 della sala è troppo piccola per quei nomi su due righe. La ricerca su tutte le combinazioni conferma che quella scelta è già la migliore. Per toglierli serve una decisione: nomi più corti (dati) oppure una mappa più alta in sala, che però fa scorrere la pagina.
- **Rossi**: verde e rossi misurati a 360 px (`VALMORA_ROSSI=C34T01,C34R01,C34F01,C34I01,C34S01,C34N01`). Ogni guardiano scatta col suo rosso.
  - Il guardiano di C15-06 era cieco nella prima versione (provava un tocco senza risorsa scelta): l'ho riparato per contare i comandi abilitati.

## Fuori elenco

- Il rapporto di PO-087 (commit 09ff232 della principale) scriveva «pressione N, copertura N»: il guardiano D-055 lo vieta.
- Ora è in parole: «nessuna unità a coprirlo», «unità troppo poche», «unità non abbastanza». Rosso `__NO_C34P01`. Scelta concordata con la principale.
