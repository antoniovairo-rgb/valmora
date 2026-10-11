# S-04 – e02 nella resa, e01 → e02 dalla città · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, con merge (non rebase) fino a d196ae6 (integrazione di S-03 ed e02).
Stato: **consegna completa.**

## Punto 2 (R01-R07): già fatto in S-03

Le correzioni dei rilievi C-005 R01-R07 sono nel commit 9fcaae7 (S-03, inviato prima che arrivasse
questo compito: i messaggi si sono incrociati). Ognuna ha il suo interruttore rosso `__NO_C05R01`…`__NO_C05R07`
e un controllo permanente in tools/foto.mjs. I bracci rossi sono stati misurati uno per volta, tutti rossi.
Dettagli e criterio di R03 in coordination/handoffs/sviluppatrice/S-03-rapporto.md, sezione «Rilievi del collaudo C-005».

## Cosa ho fatto

1. **Mappa aerea per e02** (`src/resa/mappa/sfondo.ts`):
   - lo stadio si mette da solo fra `curva_ospiti` (28,40) e `curva_larkspire` (80,40);
   - il settore di tipo `stazione` (14,18) disegna un fascio di binari dal bordo sinistro, pensilina e fabbricato viaggiatori, e libera gli isolati intorno;
   - se c'è una stazione, i viali partono da lì: corteo e folla di ospiti vanno dalla stazione allo stadio lungo `viale_stazione`.
2. **Settori vicini** (`src/resa/mappa/Mappa.tsx`): in e02 stazione, curva ospiti e viale della stazione stanno uno sopra l'altro e nomi e unità si coprivano. Regola generale (Δx < 18, Δy < 24 sulla scala 0-100 dei dati):
   - con un punto subito sotto, il nome va sopra;
   - con punti sopra e sotto, il nome va di lato e le unità dall'altro lato;
   - con un punto subito sopra o sotto, le unità vanno di lato.

   Il controllo R06 (nomi dentro la mappa, testi ≥ 12 px) resta verde.
3. **Città**: e02 compare in `missione.luogo` (22,30), spento finché e01 non è superato, poi «disponibile».
4. **tools/foto.mjs** gioca, a 360/375/412 px:
   - e01: fallimento, rigioco, partita completa con tutti i controlli;
   - ritorno alla città;
   - **e02 scelto toccando il suo punto sulla città** e giocato dall'interfaccia, partendo dalle variabili lasciate da e01 come fa il gioco (D-062), con le foto della prima volta di ogni scena;
   - controlli su e02: esito a schermo = esito previsto dal motore = esito migliore; e02 «superato» sulla città;
   - in fondo la conferma di «Nuova partita» (R02).

   `pianoAttento` ora accetta indice della missione e variabili iniziali.

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto` | 3 larghezze; e01 giocata due volte (fallita, poi «contenuto») + e02 una volta | verde: 0 errori, 0 scorrimento, controlli R01-R07, e02 «contenuto» = motore |
| giocatore usato (stampato da foto.mjs) | e01 ed e02 | «equilibrato» per entrambe; il giocatore attento di bot.ts arriva a «contenuto_a_fatica» in tutte e due (FATTO MISURATO) |
| `npx vitest run` | 98 test | verdi |
| `node tools/catena.mjs completa` | commit 7be29c6, 3 giri | 3 su 3 VERDI, nessun passo ritentato |

## Foto

docs/foto/e02/2026-10-11-stile-c/: sala, briefing, schieramento, chiamata, risposta, chiusura, rapporto,
verbale di e02, la città con e01 ed e02 a 3 stelle e la conferma di «Nuova partita», a 3 larghezze.
Le foto di e01 restano in docs/foto/e01/2026-10-11-stile-c/.

## Problemi aperti

1. IPOTESI: i colori delle curve sono fissi (sinistra arancio, destra azzurro). In e02 la curva a sinistra è
   quella degli ospiti (Calderholt Rovers), quindi resta arancio come Cinderwick. Se i club devono avere un
   colore, serve un dato (per esempio `club.colore`) e una decisione.
2. La disposizione dei nomi è una regola semplice sui vicini: con mappe più fitte (36 episodi) va riverificata
   dal controllo R06 di foto.mjs, che c'è già.
