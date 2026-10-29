# Vandel Falls – Cortina di fumo · regole di lavoro

Gioco Android a missioni, offline. Storia: docs/BIBBIA.md. Policy: docs/REGOLE_PLAY.md. Governo completo: docs/governo/ISTRUZIONI_PO.md.

## Ruoli e lingua
- Il PO (Antonio) parla solo con la sessione principale; la sessione principale dirige le altre.
- Sempre in italiano, dando del tu al PO.
- Ogni risposta al PO inizia con «Lotto in corso: … · Voci toccate: PO-… · Richieste nuove registrate: PO-…».
- Ogni domanda al PO si fa con il questionario a scelte (2-4 opzioni, consigliata per prima, costi di ciascuna), mai in testo libero.
- Il progetto lavora in cloud: sessioni su claude.ai/code sul repository GitHub, non in locale.

## Verità
- Mai inventare fatti, numeri, file, norme, procedure di polizia o comportamenti: se non verificabile, «Non posso confermarlo».
- Ogni affermazione sul codice cita file:riga; ogni affermazione su un comportamento cita comando, campione ed esito.
- FATTO MISURATO e IPOTESI sono sempre distinti; le ipotesi sono marcate.
- Una misura sbagliata si ritira dichiarandolo.
- Ogni riferimento reale (legge, policy, documentazione) ha la sua fonte (URL).
- Il mondo di gioco è finzione dichiarata: nessuna persona, club, stemma, forza di polizia, luogo o evento reale.
- Violenza fuori campo (rapporti, radio, verbali); il rating lo decide solo il questionario IARC.

## Governo
- Ogni richiesta del PO diventa subito una voce PO-xxx in docs/governo/BACKLOG.md.
- Ogni decisione va in docs/governo/DECISIONI.md; le zone congelate elencate lì non si toccano senza il via del PO.
- Scelte tecniche con default ovvio: le prende la sessione principale e le dichiara.
- Direttiva standard: prosegui senza fermarti; ci si ferma solo per una decisione del PO o un blocco reale.
- La storia delle release va in docs/RELEASE_HISTORY.md, mai qui.
- Dieci giorni prima della data di pubblicazione: ambito congelato, entrano solo difetti.

## Architettura
- Nessun codice di gioco prima delle decisioni D-006 (stack) e D-007 (schema).
- Moduli piccoli (massimo 400 righe), ricomposti dal build.
- Logica pura in src/logica, testabile senza browser; mai importa da src/resa.
- Casualità solo dal generatore con seme; Math.random vietato nel percorso deterministico.
- Salvataggi con SAVE_VERSION e migrazione retrocompatibile, testata su salvataggi vecchi reali.
- GAME_VERSION aumenta a ogni rilascio, con commento: causa, misura, guardiano.
- Contenuti (missioni, dialoghi, personaggi) sono dati validati da schema, non codice.
- Nessun soft-lock: ogni stato narrativo ha un'uscita, verificato in catena.

## Metodo
- Ogni difetto: riproduci e misura, patch minima, interruttore rosso globalThis.__NO_XXX, misura verde e rosso, guardiano permanente.
- Se il braccio rosso non mostra il difetto, il guardiano è cieco e va riparato.
- Mai abbassare la soglia di un guardiano per far passare una modifica.
- Le misure contano passi e minuti di gioco, mai tempo reale o fps.
- Campioni rumorosi: media, mediana, dispersione, numero di prove.
- Pianifica prima di toccare; leggi il minimo; patch con ancore univoche; niente refactoring non richiesti.
- Nessun identificativo del modello in commit, codice o documenti (niente righe Co-Authored-By).

## Catene
- Esecutore unico: node tools/catena.mjs <nome>; ogni giro finisce in STABILITA.json.
- Catena scelta in base a cosa si è toccato; nel dubbio «completa».
- Le catene si attendono nel turno; rossa o interrotta si rifà da capo sulla stessa build; mai ricostruire durante una catena.
- Rosso che passa al nuovo tentativo = instabile: si ripara lo strumento, non si ignora.
- Mai filtrare l'uscita di una catena con una pipe senza `set -o pipefail`: il 2026-10-11 un `| grep` ha nascosto un rosso pubblicato su main (afa4916).
- Ogni sessione, appena clonato: `git config core.hooksPath .githooks`. Il pre-push esegue tipi, confini, schema e storia (5 s) e ferma il push che farebbe rossa la CI (PO-100, D-117).
- Rilascio: rituale in 10 passi di docs/governo/ISTRUZIONI_PO.md §7, sempre completo.

## Interfaccia
- Ogni schermata verificata a 360, 375 e 412 px con foto prima e dopo.
- Colori, raggi e spaziature solo da token; un guardiano segnala i valori scritti a mano.
- Verifiche percettive solo con asset veri.

## Sessioni e git
- Sessioni parallele: collaudatrice (sola lettura), sviluppatrice (compiti delimitati), rilascio; ognuna sul suo ramo, con prompt autosufficiente.
- Solo la sessione principale promuove su main.
- Commit piccoli e chiari; mai force push, mai rebase di rami condivisi.
- Segreti (keystore, chiavi Play Console, token, password, .env) mai letti, stampati o committati; Play Console la usa solo il PO.
- Gioco offline, nessun dato personale, nessuna pubblicità invasiva.
