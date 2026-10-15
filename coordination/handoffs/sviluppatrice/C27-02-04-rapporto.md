# C27-02 (`meta`) e C27-04 (`fase`) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Proposta approvata dalla principale: il codice entra prima dei campi nei dati, e senza i campi non cambia nulla.

## C27-02 – il viale finisce sul settore `meta`

- **Campo letto:** settore di tipo strada, `meta: "<id di un settore della stessa mappa>"`, facoltativo.
- **Codice:**
  - `disponi` (`sfondo.ts`): se la strada ha `meta` e il settore esiste, l'ultimo punto del viale è quel settore; altrimenti come prima (stadio con la partita, centro senza);
  - `Mappa.tsx` e `StratoPixi.tsx` portano `meta` dai dati fino a `disponi`.
- **Rosso `__NO_C85M01`:** `meta` ignorata.

## C27-04 – la fase dell'ondata dai dati

- **Campo letto:** ondata `fase: "prima" | "partita" | "dopo"`, facoltativo.
- **Codice** (`follaDellOndata`, `folla.ts`):
  - «partita»: spalti pieni;
  - «dopo»: deflusso e cortei che escono;
  - «prima»: spalti in arrivo.
  - Senza `fase`, la partita si ricava dagli eventi «curva», come prima. Anche il «dopo» delle ondate seguenti usa la stessa regola.
- **Rosso `__NO_C84F01`:** `fase` ignorata.
- **Guardiano del giro foto:** `controllaFolla` (`tools/foto-club.mjs`) segue `fase` quando c'è. Senza, è come prima.

## Guardiano `tests/meta-fase.test.ts` (5/5)

Su copie di episodi veri, coi campi aggiunti nel test:
- e30 con `meta` sulla strada: il viale finisce sul settore indicato; senza, al centro come oggi;
- e07 con le fasi «prima, partita, partita, dopo»:
  - ondate 2 e 3 «pieni», ondata 4 «deflusso»;
  - senza fasi l'ondata 4 resta «arrivo», come oggi.
- **Rossi:**
  - C85M01: il viale va al centro;
  - C84F01: e07 ondate 2 e 4 «arrivo», il difetto del collaudo.

## Esito

FATTO MISURATO:
- `npx vitest run`: 42 file, 226 test;
- catena completa 3/3 verde su fd49616 (unione con la 0.24.0).
- Giro foto senza i campi nei dati: nessun cambiamento atteso, e nessun errore nella catena.
