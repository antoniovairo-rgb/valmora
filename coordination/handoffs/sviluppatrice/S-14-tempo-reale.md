# S-14 · Eventi in tempo reale (PO-022, D-188) · FASE 1: progetto e prototipo

Ramo `claude/valmora-tempo-reale` da `claude/valmora-l1-setup-schema-xdrbx7` (51188cd). Nessun file di main toccato.
Il prototipo è **spento di norma**: si accende solo con `globalThis.__VALMORA_TEMPO_REALE = 'a' | 'b' | 'c'` e solo su e02
(`src/logica/tempo.ts:17-20`). Senza interruttore il gioco è identico: 68 file di test / 353 test verdi (`npx vitest run`).

## 1. Come funziona oggi un'ondata (FATTO, dal codice)

- Ogni ondata: schieramento una volta (`src/logica/missione.ts:125`), poi le chiamate una alla volta nell'ordine dei dati
  (`missione.ts:134`, `src/resa/partita.ts:13`), poi la chiusura che calcola pressione contro copertura per settore
  (`missione.ts:200`, tensione a `:228`, fiducia +1/−1 a `:236`).
- Il tempo **non esiste** nella logica: il giocatore può restare su una chiamata quanto vuole. L'unico conto alla rovescia
  è «Annulla» di PO-121 (`src/resa/schermate/Ondata.tsx:23`, 5 s), che vive solo nella resa (`src/logica/sospesa.ts:1-4`).
  Questo è il modello che il prototipo riusa: la logica riceve un'azione («scaduta»), mai l'orologio.
- Già fatto per PO-022 (`docs/governo/BACKLOG.md:28`): tensione che passa fra le ondate, riposo, fiducia col risultato,
  scelte che cambiano il seguito, riga «i». Manca solo il tempo reale.
- Dimensione dei dati: 36 episodi, 142 ondate, 500 chiamate (conteggio su `data/missioni/*.json`).

## 2. Le tre opzioni

### A (consigliata) · Chiamate a tempo, con pausa e ritmo regolabile

**Cosa vede il giocatore.** Sopra ogni chiamata una barra: secondi che restano (20 s al ritmo normale), barra rossa che si
accorcia, «Se non rispondi in tempo, la sala fa da sé». Due tasti da 44 px: ritmo (normale → lento ×1,5 → lento ×2 →
senza tempo) e Pausa, che copre la chiamata e ferma il tempo. Scaduto, vale la risposta predefinita e si passa alla
chiamata dopo.
Foto: `s14/prima-360.png` (oggi) · `s14/a-360.png` · `s14/a-pausa-360.png` · `s14/a-dopo-scadenza-360.png`
(anche `-375`, `-412` per `prima` e `a`).

**Logica e schema.**
- `scadi(m, s, chiamata)` = `rispondi` con l'opzione predefinita, più il segno `scaduta: true` fra le scelte
  (`src/logica/tempo.ts:59-65`). Nessun orologio nella logica.
- Schema (fase 2): campo `scade: "<id opzione>"` su ogni chiamata (500 chiamate). Nel prototipo le 17 predefinite di e02
  sono in una tabella (`tempo.ts:35-42`); se la predefinita non è valida in quello stato vale l'ultima opzione valida,
  quindi c'è sempre un'uscita (`tempo.ts:45-49`).
- Salvataggio (fase 2): `scaduta` nelle scelte e il ritmo scelto nelle impostazioni → SAVE_VERSION 2 → 3 con migrazione
  (campi facoltativi, i vecchi salvataggi valgono «niente scadute, ritmo normale»). Non fatto nel prototipo.
- Bot e catene: `giocaConOrologio` (`tempo.ts:89-103`) con probabilità di scadenza dal seme; il percorso
  deterministico di oggi (`giocaMissione`) non cambia.

**Bilanciamento (FATTO MISURATO, `node tools/misura-tempo.mjs e02`, 200 semi per riga, tabella intera in `s14/misura-e02.md`).**

| e02 | fallite | stelle media | mediana | ds | 3★ |
|---|---|---|---|---|---|
| attento, senza tempo | 0,0% | 3,00 | 3 | 0,00 | 100% |
| attento, 10% scadute | 0,0% | 2,50 | 3 | 0,84 | 72,5% |
| attento, 25% scadute | 1,0% | 2,02 | 3 | 1,00 | 50,0% |
| attento, 50% scadute | 0,5% | 1,37 | 1 | 0,77 | 17,5% |
| casuale, senza tempo | 56,5% | 0,49 | 0 | 0,62 | 1,0% |
| casuale, 25% scadute | 65,0% | 0,35 | 0 | 0,49 | 0,0% |

- Curva D-154 (fallite del casuale): +8,5 punti su e02 col 25% di scadute. Su 36 episodi: **Non verificato** (le
  predefinite esistono solo per e02). Rischio: la regola «non scendere più di 1 punto fra episodi consecutivi» va rimisurata
  con un bot «lento» fisso, e le predefinite scritte con lo stesso peso negli episodi vicini.
- Fiducia D-160: le predefinite di e02 muovono la fiducia solo in `comitato_quartiere/comunicato` (+1) e
  `presidente_aiuta/declina_aiuto` (+1). Rischio: una predefinita che dà fiducia premia chi non risponde. Regola proposta
  per la fase 2: predefinite senza effetto sulla fiducia, con guardiano. IPOTESI, non misurata.
- Stelle D-181: chi lascia scadere perde stelle (attento 3,00 → 2,02 con 25%), ma non fallisce (≤ 1%). Con «senza tempo»
  i numeri sono quelli di oggi.

**Accessibilità.** Pausa sempre presente (ferma il tempo, misurato: 18 → 18 dopo 3 s in pausa); ritmo fino a «senza tempo»
(gioco di oggi); tasti a 44 px (misurato); a una mano: tasti nella barra sotto la mappa, non in alto. Mancano nel
prototipo: ritmo salvato fra le sessioni, lettura del tempo per lettori di schermo (la barra ha `aria-live="off"` per non
parlare ogni secondo), fermarsi da solo quando l'app va in secondo piano. **Non verificati.**

**Costo (IPOTESI, stima non misurata).** 6-8 giorni: logica, schema e migrazione 1,5; 500 predefinite scritte e
controllate 2-3; resa definitiva, impostazioni, secondo piano 1,5; guardiani, bot «lento», ritaratura D-154/D-181 1,5.

### B · L'imprevisto a metà ondata

**Cosa vede il giocatore.** Le chiamate normali restano senza tempo. Una per ondata è un «Imprevisto»: barra magenta
«Imprevisto: rispondi entro 12 s», stessa pausa e stesso ritmo di A. Scaduto, vale la predefinita.
Foto: `s14/b-360.png` · `s14/b-pausa-360.png` · `s14/b-dopo-scadenza-360.png`.

**Logica e schema.** Stessa `scadi` di A; in più l'elenco delle chiamate improvvise per ondata (`tempo.ts:31-32`, e02:
ritardo, corteo_viale, fumogeni_ospiti, vetrine). Fase 2: campi `improvvisa: true` e `scade` su 142 chiamate (una per
ondata). Nel prototipo l'imprevisto è una chiamata già esistente, non interrompe a metà: **Non verificato** l'«interrompe»
vero (una chiamata nuova che salta davanti alle altre), che chiederebbe testi nuovi.

**Bilanciamento (FATTO MISURATO, e02).** Attento con l'imprevisto scaduto il 50% delle volte: 0% fallite, stelle 1,77, 3★
38,5%; sempre scaduto: 1,00 stelle, 0% 3★. Casuale: 56,5% → 71,0% fallite con 50% scaduti. Rischio D-154 come A ma su
meno chiamate; rischio D-181 forte: in e02 l'imprevisto sempre mancato toglie tutte le 3★.

**Accessibilità.** Come A. Più breve (12 s) e più stressante: «senza tempo» indispensabile.

**Costo (IPOTESI).** 5-7 giorni se l'imprevisto è una chiamata esistente; +4-6 giorni se si scrivono 142 imprevisti nuovi
che interrompono davvero (testi, voce, vignette).

### C · L'orologio di partita e i settori che peggiorano

**Cosa vede il giocatore.** Al posto dei secondi, l'ora della serata (20:30 che avanza: un minuto di gioco ogni 10 s al ritmo
normale) e i settori scoperti che peggiorano: «Senza nessuno e lasciati soli: Viale della stazione. Peggiorano fra 25 s».
Foto: `s14/c-360.png` · `s14/c-pausa-360.png` · `s14/c-dopo-minuti-360.png` (foto prese con il secondo accelerato a 100 ms,
e con il viale lasciato senza unità apposta).

**Logica e schema.** Nuova azione `peggiora(m, s, trascorsi, minuti, guardato)`: ogni 3 minuti di gioco +1 di pressione
ai settori con un evento, senza unità e non guardati (`tempo.ts:68-83`). Misurato nel browser: da 20:32 a 20:36 il viale
prende +2 (`modifiche.viale_stazione = 2`). Fase 2: minuti di gioco nel salvataggio (oggi non salvati, `tempo-reale.tsx:17`),
taratura del passo per episodio. Limite del prototipo: la mappa mostra la tensione, non la pressione dell'ondata, quindi il
settore che peggiora non cambia colore finché l'ondata non si chiude (**Non verificato** un segno sulla mappa).

**Bilanciamento (FATTO MISURATO, e02).** Attento ed equilibrato: **nessun effetto** (3,00 stelle a 1-2, 1-4, 1-6 minuti
per chiamata), perché coprono tutti i settori con un evento. Casuale: 56,5% → 65,5% / 73,5% / 79,0% fallite. Quindi C
punisce solo chi schiera male e non crea tensione per chi gioca bene: risponde poco alla richiesta del PO («nessuna
tensione»). La regola «guardato = settore della chiamata» non è un gesto del giocatore: **Non verificato** se si capisce.

**Accessibilità.** Pausa e ritmo come A. Più difficile da leggere: l'effetto arriva dopo e non è legato a un tocco.

**Costo (IPOTESI).** 9-12 giorni: nuova dinamica di tensione, segni sulla mappa, minuti nel salvataggio, ritaratura completa
D-154/D-160/D-181 su 36 episodi (cambia la pressione di tutte le ondate).

## 3. Vincoli fermi, come li rispettano le tre opzioni

- Determinismo: la logica non legge mai l'orologio; riceve `scadi` o `peggiora` come azioni. Orologio simulato con seme:
  stessa partita a ogni giro nei tre modi (guardiano `tests/tempo-reale.test.ts`, 4 test verdi). Nessun `Math.random`.
- Nessun soft-lock: lasciando scadere tutte le 17 chiamate di e02 la missione arriva sempre a un esito (stesso test).
- Salvataggi: scadenza = una scelta normale salvata subito (misurato: dopo la scadenza il salvataggio ha
  `{chiamata: ritardo, opzione: lasciali, scaduta: true}`). Migrazione SAVE_VERSION 3: da fare in fase 2, **Non verificata**.
- Offline: nessuna rete, il tempo è quello del dispositivo.

## 4. Misure e strumenti

- `node tools/misura-tempo.mjs e02` → `s14/misura-e02.md` (attento, equilibrato, casuale × a/b/c, 200 semi per riga).
- `npx vite build && node tools/foto-s14.mjs` → foto e controlli: barra presente a 360/375/412, nessuno scorrimento
  orizzontale, tasti ≥ 44 px, pausa che ferma il tempo, scadenza che passa alla chiamata dopo.
- Catena logica: VERDE (tipi, confini, schema, test, bot, storia, salvataggi-reali, bracci-rossi-logica), giro su 51188cd con le modifiche di questo prototipo non ancora committate (STABILITA.json). La catena grafica non è stata girata: **Non verificata**.

## 5. Cosa NON è verificato

- Effetto sui 36 episodi (solo e02 misurato); curva D-154 fuori da e02.
- Collaudo con persone vere (sensazione di tensione, stress, lettura).
- Pausa automatica quando l'app va in secondo piano su Android; lettori di schermo.
- Migrazione dei salvataggi; ritmo salvato.
- Le stime in giorni sono IPOTESI.
