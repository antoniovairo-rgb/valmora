# Architettura (D-006: stack A)

Stack scelto dal PO: opzione A di docs/FASE0_PROPOSTA.md (TypeScript + Vite + Capacitor). Versioni e strumenti: D-013. Schema dei dati: `schema/`, rifiniture in D-014.

## Moduli
| cartella | contenuto | può usare il browser? |
|---|---|---|
| `src/logica/` | stato di partita, condizioni ed effetti, ondate, fili narrativi, esiti. Funzioni pure | no |
| `src/logica/caso.ts` | generatore casuale con seme (unico punto di casualità; Math.random vietato in `src/logica/`) | no |
| `src/dati/` | caricamento dei JSON di `data/` e validazione con `schema/` | no |
| `src/salvataggi/` | `SAVE_VERSION`, migrazioni v→v+1, test su salvataggi veri in `tests/salvataggi-reali/` | no |
| `src/versione.ts` | `GAME_VERSION` con commento: causa, misura, guardiano | no |
| `src/interruttori.ts` | lettura degli interruttori rossi `__NO_XXX` da `globalThis` (= `window` nel browser), così valgono anche nei test Node | no |
| `src/resa/` | interfaccia React, mappa, audio; legge lo stato, non lo calcola | sì |
| `src/resa/token.css` | design system: colori, raggi, spaziature | sì |
| `android/` | progetto Capacitor | – |

Regole: nessun file sopra 400 righe (guardiano in catena); `src/logica` non importa mai da `src/resa` (guardiano in catena).

## Catene
| nome | quando | passi |
|---|---|---|
| governo | documenti, regole | documenti, backlog, segreti, modello, governo.html (ESISTE) |
| logica | `src/logica`, `src/dati`, `src/salvataggi`, `data/`, `schema/` | tipi, confini (400 righe, import da resa, Math.random), schema, test unitari, bot (3 strategie × semi 1…1000, 0 blocchi, ogni esito raggiunto), salvataggi-reali, bracci-rossi-logica (ESISTE). Da aggiungere: grafo narrativo (L2) |
| grafica | `src/resa` | foto a 360/375/412 px, errori di console, valori scritti a mano fuori dai token |
| completa | nel dubbio e prima di ogni rilascio | governo + logica + build (ESISTE); poi grafica + copyright |

Esecutore unico: `node tools/catena.mjs <nome>`, registra ogni giro in `STABILITA.json`. La CI su GitHub Actions eseguirà gli stessi comandi (dopo D-008).
