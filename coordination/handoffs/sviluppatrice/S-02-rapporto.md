# S-02 – Mappa della città, rigioco, stelle, registro · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, sopra S-01 e il merge di d1623ef. Stato: **consegna completa, in attesa di
collaudo/integrazione della principale.**

## Cosa ho fatto

1. **Mappa della città** (D-061), schermata `citta` dopo «Nuova partita» e dopo ogni verbale:
   - strato PixiJS (`src/resa/mappa/StratoCitta.tsx`) con isolati, fiume e viali di una città inventata, caricato a parte e solo se c'è WebGL;
   - strato HTML (`MappaCitta.tsx`): un punto per episodio in `missione.luogo`, con il numero, il titolo e le stelle (se superato). I futuri sono spenti e non si toccano; quelli da giocare o da rigiocare hanno un alone;
   - tocchi un punto e sotto compare la scheda: tentativi, stelle, stato, pulsante «Avvia l'episodio» o «Rigioca l'episodio».
2. **Stelle nel verbale** (D-060), da 0 a 3 (icone lucide piene o vuote), con la scritta «Nuovo miglior risultato» oppure «Resta il risultato migliore».
3. **Fallimento** (D-059): il verbale dice «Episodio fallito: va rigiocato» e porta a «Rigioca l'episodio». La storia non cambia.
4. **Registro** (`src/resa/episodi.ts`, sopra `src/logica/episodi.ts` della principale):
   - ogni tentativo parte da `variabiliDiPartenza`;
   - alla fine `registra` tiene il migliore;
   - le variabili della storia prendono quelle della partita solo se è il nuovo migliore E nessun episodio successivo è superato (D-062);
   - `missioni_concluse` = episodi superati.
5. **Salvataggio**: campo `episodi` (Registro) nella stessa SAVE_VERSION 2, controllato voce per voce. La migrazione 1→2 trasforma ogni missione conclusa in v1 in una voce superata: 1 stella, 1 tentativo, esito `concluso_v1`, variabili attuali come «prima» e «dopo». La v1 non salvava né l'esito né le variabili di prima: è la sola ricostruzione possibile.
6. **tools/foto.mjs**, a 360/375/412 px:
   - titolo, crediti, città;
   - fallimento col giocatore peggiore (verbale «fallito», 0 stelle) → «Rigioca l'episodio»;
   - partita completa col giocatore migliore (trascinamento, ricariche a metà ondata, foto di ogni scena);
   - verbale con le stelle uguali a quelle previste dal motore;
   - ritorno alla città: l'episodio deve essere `superato` e mostrare le stesse stelle.

## File toccati

src/resa/{App.tsx, episodi.ts, stelle.tsx, stile.css, token.css}, src/resa/mappa/{MappaCitta.tsx, StratoCitta.tsx},
src/resa/schermate/{Citta.tsx, Verbale.tsx}, src/salvataggi/salvataggio.ts, tests/salvataggi.test.ts,
tests/episodi-resa.test.ts (nuovo), tests/resa/dati-prova/ (stelle, fallita), tools/foto.mjs,
docs/foto/e01/2026-10-11-s02/ (città e verbali, 3 larghezze).

## Misure

| comando | campione | esito |
|---|---|---|
| `npx vitest run` | 8 file, 90 test | verdi; nuovi: fallimento, rigioco dalle variabili di prima, resta il migliore, registro malformato, migrazione v1 |
| `node tools/foto.mjs out/foto` (e01 v2) | 3 larghezze | verde: peggiore → fallito (0 stelle) → rigioca; equilibrato → «contenuto», stelle a schermo = motore; città con l'episodio superato |
| build di prova + `node tools/foto.mjs out/foto-prova out/dist-prova tests/resa/dati-prova` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | commit 8602119, 3 giri | 3 su 3 VERDI, nessun passo ritentato |

## Problemi aperti

1. IPOTESI: con un solo episodio nei dati, la città mostra un solo punto. La disposizione con 36 episodi (sovrapposizioni dei nomi) non è verificata: dipende da `luogo` nei dati.
2. La città è disegnata con un motivo fisso (isolati, fiume, viali), non presa dai dati: se il PO vuole una pianta precisa serve un dato nuovo.
3. Salvataggi v2 scritti dalla build di S-01 senza `episodi` vengono rifiutati (si riparte). Nessuna build S-01 è stata pubblicata su main: se invece è uscita, serve SAVE_VERSION 3.

## Cosa mi serve

- Collaudo e integrazione di S-01 + S-02.
