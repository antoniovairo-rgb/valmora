# Controllo: che cosa del gioco presuppone 36 episodi o 3 stagioni – PO-134

Sola lettura, nessun file cambiato. Ramo claude/valmora-l1-setup-schema-xdrbx7 a 05f98de, 2026-10-18.
Metodo: ricerca in src/, tools/, tests/, schema/, data/, package.json, vite.config.ts, .github/, .githooks/ di «36», «e36»,
«e12», «e24», «stagion», «[1, 2, 3]», «length: 36», «padStart», pattern di id e cicli. Le righe segnate ✔ le ho
rilette io con `sed -n`; le altre vengono dalla ricerca e vanno rilette prima di toccarle.

## In breve (FATTO MISURATO)
- Quasi tutto il gioco ricava stagioni ed episodi dai dati: schema, caricamento, sblocco e salvataggi non hanno limiti.
- Il nodo è il significato di «ultimo episodio»: src/logica/epilogo.ts lo prende come l'ultimo caricato. Basta
  aggiungere e37 e l'epilogo, il fischio e la lettura della carriera si spostano da soli su e72, mentre e36 riceve il
  passo «Fine stagione 3». IPOTESI da decidere col PO: e36 deve restare un finale (di triade) anche dopo?
- I numeri scritti a mano (36, 3 stagioni, e12/e24/e36) stanno nei guardiani di tools/ e nei test.
- L'esito di carriera di e36 non è una variabile: gli episodi nuovi oggi non potrebbero leggerlo (sezione E).

## A. Gioco (src/)
| file:riga | che cosa presuppone | che cosa servirebbe cambiare (non fatto) |
|---|---|---|
| ✔ src/logica/epilogo.ts:54 `ultimoEpisodio = ordina(missioni).at(-1)` | fine campagna = ultimo episodio caricato | si sposta su e72 da solo; se e36 resta un finale serve un dato (es. `finale: true` su e36 ed e72) o una funzione per triade |
| ✔ src/logica/epilogo.ts:48-52 `chiudeStagione` | nessun «Fine stagione» nell'ultima stagione | e36 avrebbe «Fine stagione 3» al posto dell'epilogo: decidere se ha tutti e due |
| ✔ src/logica/epilogo.ts:73-76 | carriera = prefisso dell'esito dell'ultimo episodio | e72 dovrebbe avere esiti `confermato*/prorogato*/sostituito*`, oppure leggere e36 esplicitamente |
| ✔ src/logica/epilogo.ts:11-13 `FILI`, `EPILOGO`, `CARRIERE` | fili e carriere della triade 1 | aggiungere i fili nuovi (es. `fiducia_ferraris`, `prove_consorzio`, `malvasi_resta`, SCALETTA.md) |
| ✔ src/resa/App.tsx:174-175 | «Fine stagione» ed epilogo dopo l'ultimo episodio | segue epilogo.ts |
| src/resa/App.tsx:181-185 | fischio «dell'ultimo derby» sull'episodio finale; testo finale.json:3 «Ultimo derby» | decidere dove va il fischio (e36, e72 o entrambi) |
| ✔ src/resa/App.tsx:187-189 | «Rileggi l'epilogo» solo se l'ultimo episodio è superato | chi ha finito e36 perderebbe il pulsante fino a e72: serve un finale legato a e36 |
| src/resa/tavole-finale.tsx (`TAVOLE`), ✔ src/resa/schermate/Epilogo.tsx:54 (`finale.bar.<carriera>`) | tavole dei fili della triade 1 e bar | tavole e testi nuovi per la triade 2 |
| ✔ src/resa/schermate/Citta.tsx:37-42 (e stile.css:54-55) | un pulsante «Stagione N» per stagione, in una riga | 6 pulsanti a 360 px: IPOTESI testo troppo stretto, da verificare con foto a 360/375/412 |
| src/resa/schermate/Fumetto.tsx:8 `padStart(2)` | numero a 2 cifre | regge fino a e99: nessun cambio |
| ✔ src/resa/schermate/Verbale.tsx:23, ✔ src/logica/missione.ts:22 («36/36», `FIDUCIA_MIN`), Epilogo.tsx:3, Fischio.tsx:1-3 | solo commenti | aggiornare i commenti; `FIDUCIA_MIN` è già controllata su ogni episodio da `controllaFiduciaMinima` (tools/bot.mjs:112) |

Già generici, nessun cambio: sblocco (src/resa/episodi.ts:13-21), ✔ `stagioneDi` e massimo stelle (epilogo.ts:41-44),
schema/missione.schema.json:34-41 (`stagione`, `episodio` con solo `minimum: 1`), id `^[a-z0-9_]+$`
(schema/comune.schema.json:8), caricamento con glob (src/resa/dati.ts:7-40), ritmo per stagione (src/dati/ritmo.ts:15-18).
Nessun pattern `^e[0-9]{2}$`, nessun enum di stagioni, nessun trofeo «completa tutte» trovato.

## B. Guardiani (tools/)
| file:riga | che cosa presuppone | che cosa servirebbe cambiare |
|---|---|---|
| ✔ tools/crescita.mjs:45-46 `[1, 2, 3].map(media)` | D-162 su 3 stagioni | stagioni dai dati; domanda al PO: la crescita vale 1→6 o riparte a S4? |
| ✔ tools/passi-logica.mjs:61 `[1, 2, 3].flatMap(controllaDifficolta…)` | D-108/D-154 solo su S1-S3 | stagioni dai dati: oggi S4-S6 resterebbero senza controllo **senza nessun rosso** |
| ✔ tools/passi-logica.mjs:109 `s === 3 ? q - 10 : q` | braccio rosso di D-162 sull'ultima stagione = 3 | usare l'ultima stagione dei dati, altrimenti il rosso diventa cieco |
| ✔ tools/passi-logica.mjs:87-89 `structuredClone(d['missioni/e36.json'])` | varianti di esito per fascicolo in e36 (D-106) | resta valido; aggiungere e72 se avrà varianti |
| ✔ tools/misura-fiducia.mjs:158 `for (const st of [1, 2, 3])` | 3 stagioni | stagioni dai dati |
| ✔ tools/foto-epilogo.mjs:42 `['e12', 'e24', 'e36']` | fine stagione e12/e24, finale e36 | aggiungere e36 (fine S3), e48, e60 e il finale e72 |
| ✔ tools/foto-epilogo.mjs:85 `[['e12',1,'e13'],['e24',2,'e25']]` | due passi «Fine stagione» | aggiungere `['e36',3,'e37']`, `['e48',4,'e49']`, `['e60',5,'e61']` |
| tools/foto-epilogo.mjs:98-139 `alVerbale('e36')` | finale = e36 | spostare su e72 o tenerli entrambi |
| ✔ tools/foto-epilogo.mjs:17-22 `FINALE = tests/salvataggi-reali/v2-0.38.0-fine-campagna.json` | salvataggio vero con 36 voci | serve anche un salvataggio vero fino a e72, tenendo il vecchio (retrocompatibilità) |
| tools/foto-tavole.mjs:2,24 | stesso salvataggio, «Rileggi l'epilogo» | col pulsante legato a e72 il giro diventerebbe rosso su quel salvataggio |
| tools/crescita.mjs:1-2, tools/passi-logica.mjs:26 | commenti «tutte e 3» | commenti |

Già generici: tools/ritmo.mjs:5, tools/foto-bozze.mjs:52-61, tools/consolidamento.mjs:37 (`padStart(2)`, fino a e99).

## C. Test (tests/)
| file:riga | che cosa presuppone | che cosa servirebbe cambiare |
|---|---|---|
| ✔ tests/coerenza-d153.test.ts:135 `toBe(36)` | 36 missioni | contarle dai file o 72 |
| ✔ tests/fiducia.test.ts:19 `toHaveLength(36)` | 36 | idem |
| ✔ tests/settori-copribili.test.ts:26 `toBe(36)` | 36 | idem |
| ✔ tests/stella-colore.test.ts:23,30 `toBe(72)` | 36 episodi × 2 soglie | ricavarlo dai dati (144 con 72 episodi) |
| ✔ tests/brevita.test.ts:8 `Array.from({ length: 36 })` | elenco e01-e36 | elenco dai dati: oggi gli episodi nuovi verrebbero **saltati in silenzio** |
| ✔ tests/c36-dati.test.ts:16 (usato a :64, :134) | stesso elenco di 36 | idem |
| ✔ tests/epilogo.test.ts:41-43 `['e12','e24']`, `'e36'` | 3 stagioni | `['e12','e24','e36','e48','e60']`, `'e72'` (o la regola decisa per e36) |
| tests/epilogo.test.ts:46-65 | carriera da e36 sul salvataggio di 36 voci; fili aperti di S1-S2 | con l'epilogo su e72 la carriera sarebbe null: salvataggio nuovo o epilogo legato a e36 |
| tests/rapporto-caldo.test.ts:17, tests/segni-cambio.test.ts:19 `slice(0, 12)` | 12 episodi = stagione 1 | resta corretto; più robusto `filter(stagione === 1)` |
| tests/fiducia-verso.test.ts:30,35 `toHaveLength(165)` | effetti D-160 di e01-e36 | resta verde, ma non copre gli episodi nuovi (dubbio) |
| tests/salvataggi-reali/v2-0.38.0-fine-campagna.json | campagna di 36 voci, e36 `prorogato_procura` | tenerlo e aggiungerne uno fino a e72 |
| causa-scoperto:31, fiducia-risultato:30-32, ripartenza-po083:10, ripartenza:63, c35-06:37, aggiornamento:62, coerenza-d153:109,160 | solo testo («/36») | descrizioni |

## D. Salvataggi, dati, build
- ✔ `SAVE_VERSION = 2` (src/salvataggi/salvataggio.ts:13): nessun campo dipende dall'ultimo episodio; per aggiungere
  e37-e72 da soli non serve migrazione.
- `episodio` è globale (e13 è il primo di S2): e37 avrà `stagione: 4, episodio: 37`.
- package.json, vite.config.ts, .github/workflows/catene.yml, .githooks/pre-push: nessun riferimento a 36 o a 3 stagioni.

## E. Come è salvato oggi l'esito di e36
- Solo come `Salvataggio.episodi['e36'].migliore.esito` (✔ campo `episodi: Registro`, src/salvataggi/salvataggio.ts:30;
  tipo `Risultato`, src/logica/episodi.ts:13, 23-30); resta il risultato con più stelle.
- Non è una variabile: ✔ in data/stato.json non c'è «carriera» (grep: 0 righe); gli esiti di e36 hanno `effetti: []`
  (13 righe in data/missioni/e36.json). La carriera si ricalcola dal prefisso dell'esito (✔ epilogo.ts:73-76).
- Valori: `confermato` / `prorogato` / `sostituito`, ciascuno con `_procura` / `_stampa` / `_comando`, più `degenerato`.
- Conseguenza: il raccordo di BIBBIA-T2.md non può leggere la carriera dalle condizioni degli episodi. Servirebbe:
  1) una variabile enum nuova in data/stato.json impostata dagli esiti di e36;
  2) una migrazione (SAVE_VERSION 3) che la ricavi da `episodi.e36.migliore.esito` per chi ha già finito e36, perché
     ✔ `completaVariabili` (src/logica/aggiornamento.ts:18-22) darebbe solo il valore iniziale;
  3) test su salvataggi vecchi reali (CLAUDE.md, «Salvataggi»).

## Domande per il PO (questionario, non decise)
- **D-T2-07 · e36 dopo l'arrivo della triade 2**
  1) (consigliata) e36 resta finale di triade (fischio, epilogo, «Rileggi l'epilogo»), poi «Fine stagione 3» e via a
     e37; e72 ha il suo finale. Costo: un dato `finale` nello schema e due epiloghi da mantenere.
  2) e36 diventa una fine stagione qualunque, l'unico epilogo è e72. Costo: chi ha finito e36 perde l'epilogo fino a e72.
- **D-T2-08 · Curva D-162 nella triade 2**
  1) (consigliata) Riparte a S4 un gradino sopra S3 e cresce fino a S6. Costo: guardiano per triade.
  2) Crescita continua da S1 a S6. Costo: S6 molto difficile, da misurare.
- **D-T2-09 · Quando sistemare i guardiani ciechi (passi-logica.mjs:61, brevita.test.ts:8, c36-dati.test.ts:16)**
  1) (consigliata) Dopo il lancio, nel primo lotto della triade 2, prima del primo episodio nuovo. Costo: nessuno ora.
  2) Subito, prima del lancio. Costo: tocca guardiani a ridosso del congelamento dell'ambito (CLAUDE.md, dieci giorni).
