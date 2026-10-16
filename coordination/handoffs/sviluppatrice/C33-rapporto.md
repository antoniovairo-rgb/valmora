# C-033 (C33-01 … C33-05) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Rilievi in `docs/revisioni/COLLAUDO_C33.md` (ramo `claude/valmora-collaudo-c33`). Foto in `c33/`.
Codice: `src/resa/mappa/etichette.ts`; guardiano: `tools/foto-schieramenti.mjs` (catena grafica, `controllaSchieramenti`).

## C33-02 (D-141) – e30 ondata 4 dal municipio verso lo stadio

- Schema, `tipi.ts` e `e30.json` o4: verso `dalla_meta` (autorizzazione della principale per D-141); `StratoPixi.tsx`: sulle strade con meta il corteo e la chiamata escono verso lo stadio. **Rosso `__NO_C99M01`.**
- Misura (sonda dei cortei a 360, 69 passi del corteo dell'ondata; «verso» = la distanza scende): e30 o4 verde 69/69 verso lo stadio, 6/69 verso il municipio (63 se ne allontanano); rosso C99M01 0/69 verso lo stadio, 62/69 verso il municipio (il collaudo: 63/69). Il corteo della chiamata «fiaccolata»: verde 39/39 verso lo stadio e 0/39 verso il municipio, rosso 0/39 e 36/39. e17 o4 invariato.
- Test: `meta-fase.test.ts` (D-141), `corteo-verso.test.ts` adeguato (e30 o4 entra/esce falso; i rossi C73V01 e C74D01 restano provati su e17 o4).

## C33-01 – il testo del nome sotto le pastiglie

- Causa (FATTO MISURATO, registro dei costi del risolutore, e35 o2 a 360): due cause insieme.
  1. il risolutore misurava solo il riquadro del nome; stretto al 60 % il testo ne usciva;
  2. una pastiglia che si vede sopra un nome costava meno del tocco trasparente sopra il proprio nome nel posto pulito: 98 px² → 49 219 contro 1385 px² → 138 516, quindi vinceva il posto con la pastiglia sul nome.
- Correzione: il nome si misura col testo vero (riquadro ∪ righe del testo, `Range.getClientRects`); una larghezza in cui il testo non ci sta si salta; la pastiglia visibile sopra un nome pesa × 20 (quasi vincolo, sempre sotto il vincolo del disco, 1e8). **Rosso `__NO_C100N01`.**
- Guardiano: il nome si misura col testo vero; il giro con le unità del bot attento gira a 360×760, 375×812 e 412×915 (prima solo 360).
- Misura (guardiano completo, build finale): verde 0 pastiglie sopra i nomi a 360/375/412; rosso C100N01: 3 ondate (e13 o2 e e23 o1 a 360, e35 o2 a 412). Foto `c33/prima-e35-o2-360.png` (codice della 0.32.0, i tre rossi sotto) e `dopo-…`: prima «Cantiere dello stadio nuovo» usciva dal bordo sinistro.

## C33-03 – e06 schieramento 1, tocco coperto posando le unità una alla volta

- Guardiano nuovo: la prima ondata di ogni episodio a 360, unità messe coi tocchi (unità, poi settore) come il giocatore; dopo ogni tocco nessun tocco coperto né nome su nome.
- FATTO MISURATO: riprodotto in e06 o1 (dopo mediatore@piazza_concerto il tocco finisce sul disco del Piazzale). Con l'attesa giusta (vedi C33-04) il caso coincide con quello a fine schieramento, e lo stesso tocco era coperto anche caricando la bozza.
- Causa (registro dei costi): per piazza_concerto ogni posto aveva un centro coperto (1e8): «sopra» sul disco del Piazzale, «destra» sul tocco trasparente di un'unità del Piazzale. Il pareggio lo rompeva un costo minore, e il disco (fisso) perdeva contro il tocco (che si sposta quando tocca a quel settore).
- Correzione: il centro sotto un disco costa il doppio del centro sotto un tocco altrui (`sulDisco`). Interruttore: **`__NO_C103P01`** (insieme a C33-05, perché il caso è nato col costo di C33-05; vedi sotto). C101P01, dichiarato prima, non è servito.
- Misura: e06 o1 a 360 verde senza tocchi coperti, a fine schieramento e passo per passo; guardiano completo verde.
- Braccio rosso: nessun interruttore da solo fa tornare il caso (C100N01, C102D01, C103P01 singoli: prova passo per passo verde). Con i tre insieme (cioè il codice della 0.32.0) torna: «dopo mediatore@piazza_concerto: tocco coperto», come nel collaudo. Il guardiano non è cieco; il suo rosso è la combinazione. IPOTESI: il caso originale nasceva dallo stato del giro prima (C33-04) insieme al pareggio dei centri coperti; non l'ho separato oltre.
- Foto: caricando la bozza e06 o1 è uguale prima e dopo (`c33/*-e06-o1-*`); il caso si vede solo posando le unità una alla volta.

## C33-04 – disposizione non deterministica

- Causa trovata (FATTO MISURATO, sonda `c33-det`): `disponiEtichette` riparte dallo stato del giro prima (posto delle unità e larghezza dei nomi degli altri settori), e i giri sono più d'uno (a ogni disegno, ResizeObserver, caratteri pronti). Lo stesso stato finale dipendeva quindi da quanti giri erano passati.
- Correzione: all'inizio di ogni giro unità al primo posto e larghezza piena per tutti i settori. **Rosso `__NO_C102D01`.**
- Guardiano: a 360, per ogni ondata, stato sporcato (unità «sotto», nomi al 60 %), cambio di misura e ritorno, poi confronto dei posti.
  - Il primo controllo era **cieco**: con la finestra + 1 px la mappa non cambiava misura e non si ridisponeva niente (25 righe false). Ora + 24 px.
  - Le attese fisse (120 ms) leggevano uno stato di mezzo: dopo un caricamento o un cambio di misura il ResizeObserver arriva anche dopo 500 ms (sonda, 3 prove su e01 o1). Ora il guardiano conta le scritture di `data-unita`/`data-nome` e aspetta 500 ms di mappa ferma (al massimo 8 s), anche nel giro con le unità e nella prova passo per passo. IPOTESI: il 2/426 del collaudo era una misura presa prima dell'ultima disposizione; non posso confermarlo.
- Misura: verde 0 righe; rosso C102D01 93 righe.

## C33-05 – pastiglie più vicine al disco di un altro settore

- Misura come nel collaudo: centro dell'unione delle pastiglie di un settore più vicino a un disco altrui che al proprio.
- Correzione: costa la differenza delle distanze × VERA × 10 (meno di qualunque sovrapposizione vera). **Rosso `__NO_C103P01`.**
- Guardiano: conteggio per larghezza, al massimo i valori della 0.31.0 (36 / 29 / 9); elenco in `vicine-<larghezza>.txt` nella cartella delle foto.

| larghezza | 0.31.0 (collaudo) | 0.32.0 (collaudo) | verde | rosso C103P01 |
|---|---|---|---|---|
| 360 | 36 | 44 | 34 | 42 |
| 375 | 29 | 32 | 20 | 33 |
| 412 | 9 | 14 | 8 | 14 |

Con i tre rossi insieme (codice della 0.32.0): 44 / 32 / 14, gli stessi numeri del collaudo. Foto e31 o2 `c33/prima-e31-o2-*` e `dopo-…`.

## Interruttori

C99M01 (C33-02), C100N01 (C33-01), C102D01 (C33-04), C103P01 (C33-05 e il pareggio di C33-03). C101P01 non usato.

## Giri

- Test 242/242.
- Guardiano completo (`controllaSchieramenti`) sulla build finale: verde «nessun errore»; rossi come sopra; i tre rossi insieme: C33-01 1 ondata, C33-03 e06, C33-04 100 righe, C33-05 44/32/14, C26-11 e35 o2 a 375.
- Foto prima/dopo a 360, 375 e 412: `c33/` (prima = i tre rossi).
- Catena completa: vedi STABILITA.json.

## Ritiro

Nel messaggio alla principale del 16/10 sera ho scritto per C33-02 «0 su 69 verso lo stadio»: era sbagliato. Il dato giusto è sopra (69/69 verso lo stadio col codice nuovo).
