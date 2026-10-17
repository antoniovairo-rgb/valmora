# C-033 (C33-01 … C33-05) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Rilievi in `docs/revisioni/COLLAUDO_C33.md` (ramo `claude/valmora-collaudo-c33`). Foto in `c33/`.
Codice: `src/resa/mappa/etichette.ts`; guardiano: `tools/foto-schieramenti.mjs` (catena grafica, `controllaSchieramenti`).

## C33-02 (D-141) – e30 ondata 4 dal municipio verso lo stadio

- Schema, `tipi.ts` e `e30.json` o4: verso `dalla_meta` (autorizzazione della principale per D-141); `StratoPixi.tsx`: sulle strade con meta il corteo e la chiamata escono verso lo stadio. **Rosso `__NO_C99M01`.**
- Misura (sonda dei cortei a 360, 69 passi del corteo dell'ondata; «verso» = la distanza scende): e30 o4 verde 69/69 verso lo stadio, 6/69 verso il municipio (63 se ne allontanano); rosso C99M01 0/69 verso lo stadio, 62/69 verso il municipio (il collaudo: 63/69). Il corteo della chiamata «fiaccolata»: verde 39/39 verso lo stadio e 0/39 verso il municipio, rosso 0/39 e 36/39. e17 o4 invariato.
- Test: `meta-fase.test.ts` (D-141), `corteo-verso.test.ts` adeguato (e30 o4 entra/esce falso; i rossi C73V01 e C74D01 restano provati su e17 o4).

## C33-01 (D-143, decisione del PO: opzione A) – la pastiglia visibile mai sopra un nome; il tocco trasparente sì, ma non «ruba» il nome

- Consegnato a parte, dopo C34-01/C34-08/C33-02…05 (che erano senza C33-01).
- Risolutore (`etichette.ts`):
  - il nome si misura col testo vero (riquadro ∪ righe del testo, `Range.getClientRects`); una larghezza in cui il testo non ci sta si salta;
  - la pastiglia visibile sopra un nome pesa × 20 (quasi vincolo, sotto il disco 1e8). Causa misurata in e35 o2 a 360: 98 px² di pastiglia sul nome costavano 49 219 contro 138 516 del posto senza pastiglie sul nome (tocco trasparente sul proprio nome, 1385 px²). **Rosso `__NO_C100N01`** (riquadro e peso × 1, come nella 0.34.0).
  - nessun nome «rubato» da un'area di tocco: il centro di ogni riga di un nome non sta sotto un tocco (toccando il nome si ritirerebbe un'unità) e il centro di un tocco non cade sul nome di un altro settore; VERA × 1e4 per caso. **Rosso `__NO_C106T01`.**
- Regola C-008 nuova (D-143, proposta mia): un'area di tocco sopra un nome è ammessa; è un errore quando (a) il suo centro cade sul nome di un ALTRO settore, o (b) toccando il centro di una riga di un nome qualsiasi si colpisce un tocco. Nel giro foto (`tools/foto.mjs`) sostituisce «area > 4 px²»; negli schieramenti (`controllaSchieramenti`) è un controllo a tetto 0 a 360, 375 e 412.
- Misura del rischio (prova chiesta dal PO): il caso (b) è proprio «toccando il nome si ritira un'unità». Prima della regola nuova nel risolutore: 1 ondata su 426 (e35 o2 a 360: toccando «Perimetro della banca» si colpisce squadre@perimetro_banca); dopo: 0.
- Guardiano col testo vero: pastiglie sopra i nomi a 360, 375 e 412, tetto 0 (invariato).
- Misure (guardiano completo e giro foto, build finale):
  - verde: schieramenti «nessun errore», nomi rubati 0/0/0, C33-05 33/19/8; giro foto verde;
  - rosso C100N01: 3 ondate con pastiglie sopra i nomi (e13 o2 e e23 o1 a 360, e35 o2 a 412), misurato sulla build con C33-01 e C33-05 prima di C106T01 (vedi «Non verificato»);
  - rosso C106T01: giro foto rosso sul controllo D-143 (e35 o2 a 360, «toccando Perimetro della banca si colpisce squadre»).
  - e07 o2 a 360×800 (giro foto, tutte le unità a Parcheggi): con la patch di prima il tocco del mediatore copriva «Piazzale dello stadio» per 417 px²; ora nessun tocco sopra un nome. Col rosso C106T01 i 417 px² tornano, ma non «rubano» il nome (né il centro del tocco sul nome né il nome sotto il tocco), quindi la regola nuova non li conta.
- Il guardiano registra ancora, senza soglia, i tocchi sopra i nomi alla vecchia maniera (area > 4 px²) in `tocchi-<larghezza>.txt`: verde 7/0/1 ondate, 0.34.0 9/2/1.

## C33-03 – e06 schieramento 1, tocco coperto posando le unità una alla volta

- Guardiano nuovo: la prima ondata di ogni episodio a 360, unità messe coi tocchi (unità, poi settore) come il giocatore; dopo ogni tocco nessun tocco coperto né nome su nome.
- Causa (registro dei costi del risolutore): per piazza_concerto ogni posto aveva un centro di tocco coperto (1e8): «sopra» sul disco del Piazzale, «destra» sul tocco trasparente di un'unità del Piazzale. Il pareggio lo rompeva un costo minore, e il disco (fisso) poteva perdere contro il tocco (che si sposta quando tocca a quel settore).
- Correzione: il centro sotto un disco costa il doppio del centro sotto un tocco altrui (`sulDisco`). Interruttore **`__NO_C103P01`** (insieme a C33-05: il caso è riapparso col costo di C33-05). C101P01, dichiarato prima, non è servito.
- Misura: verde senza tocchi coperti a fine schieramento e passo per passo. Il caso del collaudo torna solo coi rossi C102D01 + C103P01 insieme (cioè lo stato del giro prima più il pareggio): «dopo mediatore@piazza_concerto: tocco coperto». Nessuno dei due da solo lo fa tornare; il guardiano non è cieco, il suo rosso è la combinazione.

## C33-04 – disposizione non deterministica

- Causa trovata (FATTO MISURATO, sonde `c33-det`): `disponiEtichette` ripartiva dallo stato del giro prima (posto delle unità e larghezza dei nomi degli altri settori), e i giri sono più d'uno (a ogni disegno, ResizeObserver, caratteri pronti). Lo stesso stato finale dipendeva quindi da quanti giri erano passati.
- Correzione: all'inizio di ogni giro unità al primo posto e larghezza piena per tutti i settori. **Rosso `__NO_C102D01`.**
- Guardiano: a 360, per ogni ondata, stato sporcato (unità «sotto», nomi al 60 %), cambio di misura e ritorno, poi confronto dei posti.
  - Il primo controllo era **cieco**: con la finestra + 1 px la mappa non cambiava misura e non si ridisponeva niente. Ora + 24 px.
  - Le attese fisse (120 ms) leggevano uno stato di mezzo: dopo un caricamento o un cambio di misura il ResizeObserver arriva anche dopo 500 ms (sonda, 3 prove su e01 o1). Ora il guardiano conta le scritture di `data-unita`/`data-nome` e aspetta 500 ms di mappa ferma (al massimo 8 s), anche nel giro con le unità e nella prova passo per passo. IPOTESI: il 2/426 del collaudo era una misura presa prima dell'ultima disposizione; non posso confermarlo.
- Misura: verde 0 righe; rosso C102D01 95 righe.

## C33-05 – pastiglie più vicine al disco di un altro settore

- Misura come nel collaudo: centro dell'unione delle pastiglie di un settore più vicino a un disco altrui che al proprio.
- Correzione: costa la differenza delle distanze × VERA × 10 (meno di qualunque sovrapposizione vera). **Rosso `__NO_C103P01`.**
- Guardiano: conteggio per larghezza, al massimo i valori della 0.31.0 (36 / 29 / 9); elenco in `vicine-<larghezza>.txt` nella cartella delle foto.

| larghezza | 0.31.0 (collaudo) | 0.32.0 (collaudo) | verde | rosso C103P01 | rossi C102D01 + C103P01 |
|---|---|---|---|---|---|
| 360 | 36 | 44 | 30 | 40 | 44 |
| 375 | 29 | 32 | 18 | 32 | 32 |
| 412 | 9 | 14 | 8 | 14 | 14 |

- Foto `c33/prima-*` (rossi C102D01 + C103P01) e `c33/dopo-*` a 360, 375 e 412: e06 o1 (piazza_concerto) ed e31 o2 (il Piazzale del collaudo).

## Interruttori

C99M01 (C33-02), C100N01 e C106T01 (C33-01), C102D01 (C33-04), C103P01 (C33-05 e il pareggio di C33-03). C101P01 non usato.

## Giri

- Test 242/242.
- Guardiano completo (`controllaSchieramenti`) sulla build finale: verde «nessun errore»; rossi come sopra.
- Catena completa: vedi STABILITA.json.

## Non verificato

- Il braccio rosso C100N01 non è stato rifatto sulla build finale (con C106T01): il numero (3 ondate) viene dalla build precedente con lo stesso guardiano. Fermato per tempo (PO-122).
- IPOTESI non provata: che il 2/426 del collaudo C33-04 fosse una misura presa prima dell'ultima disposizione.
- Il caso (b) di D-143 è provato al centro di ogni riga del nome, non in ogni punto del nome.

## Ritiro

Nel messaggio alla principale del 16/10 sera ho scritto per C33-02 «0 su 69 verso lo stadio»: era sbagliato. Il dato giusto è sopra (69/69 verso lo stadio col codice nuovo).
