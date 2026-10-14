# C23-01 (corteo della chiamata col club dell'evento) e C23-02 (nome sulle proprie stelline) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Foto in `c23/`.

## C23-01 – il corteo della chiamata ignorava il club dell'evento

**Difetto (FATTO, dal codice).**
- Il club dell'evento (`Evento.club`) arrivava ai cortei dello sfondo (C49E01).
- Il corteo della dinamica della chiamata (PO-089) usava solo il club della strada o della curva omonima, altrimenti neutro.
- Con i dati nuovi della principale, in e07 e e13 il corteo della chiamata restava neutro anche se l'evento sulla strada ha un club.

**Correzione:**
- `src/resa/mappa/folla.ts`: `follaDellOndata` espone `club`, cioè strada → club, preso dagli eventi dell'ondata. Vale anche durante la partita.
- `src/resa/mappa/StratoPixi.tsx`: il corteo della chiamata usa prima quel club, poi i colori della strada, poi il neutro. La mappa espone `data-dinamica-colori`.
- **Rosso `__NO_C53D01`:** il club dell'evento si perde, come prima.

**Guardiani:**
- `controllaDinamica` (`tools/foto-chiamata.mjs`): per ogni chiamata su una strada vuole in `data-dinamica-colori` il club dell'evento, se c'è. Altrimenti vuole quello della strada o della curva omonima, altrimenti «neutro».
- `tests/corteo-club.test.ts`: il club in partita e il braccio rosso.

**Misure (FATTO MISURATO):**
- `VALMORA_LARGHEZZE=360 node tools/foto.mjs`:
  - verde 0;
  - rosso C53D01: 3 righe, «corteo_rovers» (e13, Calderholt #1e7b4a), «pareggio_casa» e «coro_imparato» (e07, Larkspire #2fa7ff): «ha i colori «neutro»».
- Sonda sulle chiamate (`data-dinamica-colori` a 360, 375 e 412):
  - e13 corteo_rovers: rosso «neutro», verde «#1e7b4a»;
  - e07 pareggio_casa: rosso «neutro», verde «#2fa7ff».
- `npx vitest run tests/corteo-club.test.ts`: 6/6.

**Foto** in `c23/`:
- `prima-*` (rosso C53D01) e `dopo-*` di e13 corteo_rovers, e07 pareggio_casa ed e28 ospiti_in_auto, a 360/375/412;
- `conf-*-412.png`: ritaglio della mappa, prima a sinistra e dopo a destra. In e07 il corteo sulla Strada da Larkspire passa da grigio e bianco a blu e bianco.

## C23-02 – il nome dell'episodio scelto copriva le sue stelline

**Difetto (FATTO, dal codice).** `disponiNomeCitta` evitava solo i dischi e le stelline degli ALTRI episodi. Il nome poteva coprire le stelline del proprio disco (C-023: 13/36 a 412).

**Correzione** (`src/resa/mappa/etichette.ts`):
- il disco del proprio episodio (esatto, rimpicciolito di 1 px) e le sue stelline diventano ostacoli;
- per avere un posto libero, la griglia di spostamenti va fino a 10/8 di disco (prima 8/8);
- si aggiunge la larghezza 40% di `--nome-max`.
- **Rosso `__NO_C53N01`:** solo gli altri episodi, come prima.

**Guardiano** `controllaNomiCittaTutti` (`tools/foto-c17.mjs`):
- conta anche il proprio disco e le proprie stelline;
- ora gira anche a 412×915, oltre che a 360 e 375.

**Misure (FATTO MISURATO, sonda `c23-citta-d.mjs`, 36 episodi scelti a turno):**

| Larghezza | Verde: nomi sopra dischi o stelline | Rosso C53N01 |
|---|---|---|
| 360 | 0/36 | 15/36 (max 605 px²) |
| 375 | 0/36 | 15/36 (max 605 px²) |
| 412 | 0/36 | 13/36 (max 605 px²) |

Nel rosso la sonda stampa «VERDE» come etichetta della riga: la riga è il risultato col rosso acceso.

Il giro foto del rosso C53N01 è nella sezione «Esito dei giri».

**Foto** in `c23/`: `prima-*-citta-*` (rosso C53N01) e `dopo-*-citta-*` di e02, e14, e20 ed e26 a 360/375/412.

## DECISIONE DEL PO – vicinanza del nome al disco

Per non coprire nulla, a 360/375 alcuni nomi finiscono lontani dal loro disco: e14 «Biglietti doppi» sta nell'angolo in alto a sinistra, a 55 px. Ho misurato a 360 il peso della distanza (`LONTANO`, `etichette.ts`):

| LONTANO | Nomi sopra stelline altrui | Distanza massima dal proprio disco |
|---|---|---|
| 0 (scelto ora) | 0/36 | 55 px |
| 20 | 1/36 | 44 px |
| 400 | 7/36 (fino a 606 px²) | 11 px |

A 412 la distanza resta entro 18 px in ogni caso.

Ho scelto 0 perché il guardiano D-119 non ammette sovrapposizioni. In alternativa, la proposta già fatta in C20-03 è non mostrare il nome a 360/375. La scelta è del PO.

## Esito dei giri (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori (exit 0).
- Rosso C53D01: 3 righe (vedi sopra).
- Rosso C53N01: 3 righe di `controllaNomiCittaTutti`. Il nome tocca il proprio disco o le proprie stelline in 31 casi a 360×760, 31 a 375×667 e 32 a 412×915 (per esempio «e02 su e02+stelle e02», «e06 su e06»).
- Il guardiano conta di più della sonda (15/15/13) perché vuole anche il cerchio del proprio disco libero, con 0,5 px di tolleranza.
