# S-01 – Resa v2 «sala operativa» · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, partito da 759f0b7; contiene il merge (non rebase) di
`origin/claude/valmora-l1-setup-schema-xdrbx7` fino a c433c34 (P-02 chiuso).
Stato: **consegna completa dei punti 1-8, in attesa di collaudo/integrazione della principale.**

## Cosa ho fatto

1. **Titolo**: link APK (nascosto nell'app nativa) e avviso di finzione invariati; pulsante «Crediti».
2. **Sala operativa**: il vice presenta la giornata con le battute di `missione.introduzione` (P-02); se il
   campo manca si vede la chiave `[[<missione>.introduzione]]`, senza crash. Sulla mappa si accendono tutti i settori.
3. **Briefing sulla mappa**: le fonti arrivano una alla volta («Prossimo messaggio»); ognuna accende il suo
   `settore` sulla mappa e dichiara l'affidabilità.
4. **Ondate**: (a) schieramento con unità da **trascinare** dal vassoio ai settori (pointer event: dito e mouse),
   alternativa a tocco (tocchi l'unità, poi il settore; tocchi un'unità sulla mappa per ritirarla), unità
   «a riposo» mostrate a parte (D-056); (b) chiamate una alla volta con fonte, testo, commento del vice
   (`chiamata.commento`) e opzioni; dopo la scelta compare la `opzione.risposta`; (c) chiusura e rapporto:
   la mappa colora i settori dal verde al rosso (6 livelli, token `--tensione-0…5`), **mai il numero** (D-055);
   nell'elenco solo «sotto controllo / scoperto» e le unità a riposo.
5. **Verbale**: esito (tono dal primo = migliore all'ultimo = peggiore), testo, fonti vere/false (D-024),
   tutte le scelte fatte (ondata, fonte, opzione). Esito con `fallita` (D-059): scritto «Episodio fallito:
   va rigiocato», l'episodio NON entra in `missioni_concluse` e la storia non cambia, così «Riprendi» lo
   ripropone. Stelle, registro e mappa degli episodi NON fatti: sono S-02.
   Mappa: PixiJS 8.22.0 + @pixi/react 8.0.5 (griglia, campo fra le due curve, tracciati, aloni per tensione,
   impulso sui settori accesi, lancetta radar), caricata a parte (lazy) e solo se WebGL c'è; sopra, uno strato
   HTML con un pulsante vero per settore (tocco, lettori di schermo). Senza WebGL resta lo strato HTML.
   motion 14.1.0 per le scene e i messaggi (con «riduci movimento» restano le dissolvenze); lucide-react 1.55.0
   per le icone. **Nessuna icona game-icons.net**: non serviva con lucide; CREDITI.md e schermata Crediti
   ci sono comunque (librerie con licenza e riga Copyright letta dai file LICENSE in node_modules).
6. **Salvataggi**: SAVE_VERSION 2, `in_corso` = InCorso di missione.ts, salvato dopo ogni passo
   (inizio missione, schieramento, ogni risposta, chiusura ondata). Migrazione 1→2: `in_corso` → null.
   Due salvataggi v1 **veri** in tests/salvataggi-reali/, scritti dalla build 0.1.0 (759f0b7) giocata da
   Chromium headless a 360 px PRIMA di cambiare la resa: `v1-nuova-partita.json`, `v1-dopo-ondata-1.json`.
7. **Rimossi**: src/logica/plancia.ts, src/logica/bot-v1.ts, tests/plancia.test.ts (nel merge: il ramo della
   principale lo aveva modificato, l'ho tolto come chiede il compito), Plancia.tsx, RisultatoOndata.tsx.
8. **tools/foto.mjs** riscritto: gioca la prima missione a 360/375/412 px, foto di ogni scena, 0 errori di
   console, 0 scorrimento orizzontale, link APK, Crediti, un'unità **trascinata davvero** col mouse,
   ricarica a metà ondata (dopo lo schieramento e dopo la prima risposta) con ripresa alla stessa scena e
   stesse unità sulla mappa, controllo che il rapporto non mostri cifre, esito della resa = esito previsto dal
   motore, esito = il migliore della missione. Argomenti facoltativi: cartella foto, cartella build, cartella dati.

## File toccati

- src/resa/: App.tsx, partita.ts (fase dal salvataggio, livello di colore, tono), dati.ts (alias `@dati`),
  icone.tsx, crediti.ts, mappa/{Mappa.tsx, StratoPixi.tsx, webgl.ts}, schermate/{Scena, Titolo, Crediti, Sala,
  Briefing, Schieramento, Ondata, Rapporto, Verbale}.tsx, stile.css, token.css (token nuovi: mappa, radio,
  tensione 0-5, misure della mappa).
- src/salvataggi/salvataggio.ts; tests/salvataggi.test.ts; tests/salvataggi-reali/{LEGGIMI.md, v1-*.json}.
- tests/resa.test.ts (guardiani: crediti ↔ package.json ↔ CREDITI.md; livelli di colore; missione di prova
  valida e vinta dal giocatore attento); tests/resa/dati-prova/ (missione di prova, nomi neutri, solo per la resa).
- tools/foto.mjs, tools/passi-grafica.mjs (solo il nome di schermata nel braccio rosso); vite.config.ts
  (alias `@dati` = data/, oppure `VALMORA_DATI` per una build di prova a parte); package.json/lock
  (pixi.js 8.22.0, @pixi/react 8.0.5, motion 14.1.0, lucide-react 1.55.0, versioni esatte); CREDITI.md.
- docs/foto/e01/2026-10-11-resa-v2/ (93 foto). Ho usato un nome diverso da `2026-10-11/` perché quella
  cartella, con la stessa data, contiene già le foto della 0.1.0 (il «prima»).

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/catena.mjs completa` | commit c537f73 (1 giro) e 5c6cdcd (2 giri) | 3 giri su 3 VERDI, nessun passo ritentato |
| `node tools/foto.mjs out/foto` (dati e01 v2) | 3 larghezze × 31 scene = 93 foto | verde: 0 errori, 0 scorrimento, ripresa ok, esito = migliore |
| `VALMORA_DATI=tests/resa/dati-prova npx vite build --outDir out/dist-prova` + `node tools/foto.mjs out/foto-prova out/dist-prova tests/resa/dati-prova` | 3 larghezze, missione di prova | verde, giocatore attento puro |
| `npx vitest run` | 6 file, 80 test | verdi |
| braccio rosso del test crediti (tolta a mano la voce di `motion`) | 1 prova | il test fallisce («motion: expected false to be true»), poi ripristinato |
| `npx vite build` | build di c537f73 | JS iniziale 130,40 KB gzip; PixiJS a parte 116,24 KB gzip (caricato dopo il titolo) |

## Problemi aperti (servono alla principale)

1. RISOLTO dopo il merge di d1623ef – il giocatore attento di bot.ts arriva a `contenuto_a_fatica`
   (FATTO MISURATO con `node tools/foto.mjs`, che lo stampa). foto.mjs ora usa, in ordine: attento →
   **equilibrato** (strategia nuova della principale, arriva a «contenuto») → ricerca per seme. Giro del
   2026-10-11 dopo il merge: giocatore «equilibrato», esito a schermo = esito del motore = «contenuto», a 3 larghezze.
2. IPOTESI – su un telefono senza WebGL la mappa resta solo HTML (non provato su un telefono vero; in
   Chromium headless WebGL c'è e la mappa usa Pixi).
3. GAME_VERSION resta 0.1.0 anche se i salvataggi ora sono v2: aumentarla è del rilascio (della principale).
4. Durata della missione non misurata (passi e minuti di gioco): da fare col collaudo.
5. Le foto sono con «riduci movimento» attivo (transizioni ridotte, mappa ferma) per renderle stabili.

## Dopo i merge di e46eba7 e d1623ef (collaudi C-01, C-02)

- Lo schieramento era già chiuso prima delle chiamate (nessun cambio). Il rapporto ora mostra anche le unità
  disponibili nella prossima ondata (`disponibili()`, con rinforzi e perdite). La tensione per colore viene
  dal motore, quindi segue da sola le regole nuove del presidio.
- Conflitti solo su STABILITA.json (giri uniti, ordinati per data) e governo.html (rigenerato dalla catena).

## Cosa mi serve

- Il via per S-02 (mappa della città, rigioco, stelle, registro nel salvataggio): tocca ancora SAVE_VERSION.
