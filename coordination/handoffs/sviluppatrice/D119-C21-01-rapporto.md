# D-119 (nomi in città a 360/375) e C21-01 (neutro grigio dei cortei) con club sull'evento · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`.

## D-119 – il nome sulla mappa della città resta, rimpicciolito quanto serve

- Il nome è già a 12 px (`--testo-mini`, misura minima leggibile di C-005 R06): il carattere non scende.
- Si stringe il **riquadro**: interlinea 1 e margini interni di 1 px (classe `.stretto`). È una variante in più che `disponiNomeCitta` prova solo se serve: a parità di costo vince il riquadro normale.
- **Rosso `__NO_C48N01`:** niente riquadro stretto.
- **Guardiano** `controllaNomiCittaTutti`, ora a **360×760 e a 375×667**, su tutti i 36 episodi conclusi: il nome non tocca il cerchio di altri dischi, **né le loro stelline, né il bordo della mappa (5 px)**.
- **Misure:**
  - sonda C-020 (dischi e stelline): 360 da 2/36 (max 51 px²) a 0/36; 375 da 2/36 (max 31 px²) a 0/36; 412 0/36. Col rosso C48N01 si torna a 2, 2 e 0;
  - giro foto: verde 0; rosso C48N01 «e05 su stelle e09, e06 su stelle e05+stelle e07» a 360×760, «e05 su stelle e09, e06 su stelle e05» a 375×667.
- **Foto** in `d119/`: e05 ed e06 a 360, 375 e 412, prima (rosso) e dopo.
- Insieme al controllo instabile del 14/10 (C47N01/C47N02, già consegnato in f426019): il posto non dipende più dall'animazione d'entrata né dall'arrivo tardivo del carattere.

## C21-01 – il corteo «neutro» non è più arancio

- FATTO MISURATO (ΔE CIE76 in Lab): il neutro di prima `--mappa-corteo-1` #ff7a1a dista **8** dal Cinderwick #ff6a13.
- Ora il neutro usa i grigi della folla, `--mappa-folla-2` #c9c2b4 e `--mappa-folla-3` #9a958c. Distanza minima dai colori principali dei club: 24, dal Mossgarth #546e7a.
- **Soglia dichiarata:** ogni colore del neutro a ΔE ≥ 20 dal colore principale di ogni club dei dati. I colori secondari chiari (bianco Larkspire, grigio Ollerbrook) sono vicini a qualsiasi grigio chiaro e restano fuori dalla soglia.
- `neutroCorteo()` (`src/resa/mappa/folla.ts`) dà i token: li usano lo sfondo dei cortei e la dinamica delle chiamate.
- **Rosso `__NO_C49C01`:** neutro arancio.
- **Foto** in `c21-01/`: e09 (tangenziale), e13 (viale_concerto), e23 (casello, oggi Quillhaven dai dati della principale), e35 (corso_centro). Prima ondata con un corteo, a 360/375/412: pagina a 412 e mappa a tutte le larghezze.

## Club sull'evento (precedenza: club dell'evento → club della strada → curva omonima → neutro grigio)

- `schema/missione.schema.json`: campo facoltativo `club` sull'evento.
- `src/logica/tipi.ts`: `Evento.club?`.
- `src/dati/semantica.ts`: controlla che il club esista in `data/club/`.
- `src/resa/mappa/folla.ts`: il corteo prende il club da un evento della sua strada nell'ondata. Rosso `__NO_C49E01`.
- `StratoPixi.tsx`: colori del club dell'evento; `data-colori-cortei` dice l'origine.
- `controllaColoriCortei`: nell'ondata con un corteo vuole il club dell'evento. Oggi nessun evento ha `club`, quindi nel giro foto il controllo si attiverà coi dati della principale (e28, e13, e15, e06, e07). Fino ad allora lo tiene il test unitario.

## Guardiano unitario: `tests/corteo-club.test.ts`

- Neutro a ΔE ≥ 20 da ogni colore principale: verde 4/4; rosso C49C01: fallisce (Cinderwick).
- Club dell'evento passato al corteo (missione di prova): verde; rosso C49E01: fallisce.

## Esito del giro foto (`VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

Verde: 0 errori.
