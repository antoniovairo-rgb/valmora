# C-029: C29-05, C29-06 (e C29-01 unito) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Collaudo: `docs/revisioni/COLLAUDO_C29.md` sul ramo `claude/valmora-collaudo-c29`.

## C29-01 – vignetta che appare e sparisce

- La principale l'ha corretta sul suo ramo (rosso C89V01); io avevo fatto la stessa correzione (rosso C91V01, `C28-rapporto.md`).
- Nel merge ho tenuto la sua, col suo guardiano su 30 frame a 1366×768 e 360×700, e tolto il mio doppione.

## C29-05 – il rosso C83S01 non rimetteva Square e Garden

- **Causa:** con gli id nuovi nei dati (`fontana`, `albero_cortile`) il rosso cercava disegni vecchi con quegli id, che non esistono.
- **Correzione:** nel commit 358cdbe (non ancora sul tuo ramo quando hai fatto il collaudo), il rosso passa per `PRIMA_ID`: fontana → calderone, albero_cortile → penna.
- **Misura** (`VALMORA_ROSSI=C83S01 node tools/foto-stemmi.mjs`):
  - a 360, 375 e 412 solo «stemmi col disegno di prima (D-128): calderholt_rovers, quillhaven_albion, pinegrove_rangers, belltower_harriers»;
  - nessuna riga «iniziali al posto del simbolo».

## C29-06 – scaglie della pigna sotto il pixel a DPR 1

- **Prima:** archi da 0,9 unità del disegno, cioè 0,76 px alla misura vera (42 px), come nel collaudo.
- **Correzione:** 4 file al posto di 5, archi più larghi (4,2 unità), tratto da 1,4 unità, cioè 1,18 px.
- **Rosso `__NO_C92P01`:** come prima.
- **Guardiano** (`tools/foto-stemmi.mjs`, nel passo foto della catena): ogni tratto senza riempimento di un simbolo è largo almeno 1 px a schermo.
- **Misura:**
  - verde: «stemmi: nessun errore»;
  - rosso C92P01: a 360, 375 e 412 «tratti dei simboli sotto 1 px: pinegrove_rangers 0.76 px (C29-06)».
- **Foto** `c29/d128-*-dpr{1,3}.png`: riga «prima» col rosso C92P01, riga «dopo» col codice nuovo.
- **GIUDIZIO:** a DPR 1 gli archi ora si vedono come tratti; sul telefono vero non posso confermarlo.

## C29-02 (e C28-05) – il corteo dei parcheggi di e04 si allontanava dallo stadio

**Causa** (FATTO, codice e misura):
- il viale partiva sempre dal bordo basso della mappa (`sfondo.ts`);
- i parcheggi di e04 stanno in alto (220, 98) e lo stadio vuoto in basso a destra;
- quindi il corteo «entra» saliva verso il settore e si allontanava dallo stadio.

**Correzione:** `bordoLontano()`, il viale parte dal bordo più vicino alla strada fra quelli dalla parte opposta alla fine del viale.
- Solo per le strade senza `meta`: con la meta (e30) il viale l'hai tarato tu coi dati, e lì il bordo nuovo peggiorava (49/21 contro 58/11).
- **Rosso `__NO_C93V01`:** sempre dal bordo basso.

**Guardiano** `tests/viale.test.ts`, coi margini di StratoPixi dichiarati (22 e 20 px):
- e04 parcheggi «entra» si avvicina allo stadio in almeno il 90% dei passi;
- e01 invariato;
- rosso: sotto il 50%.

**Misura** con la tua sonda `c27-pixel.mjs`, 360×760: persone del corteo che si allontanano / avvicinano dallo stadio.

| episodio | corteo | col codice nuovo | rosso C93V01 |
|---|---|---|---|
| e04 | parcheggi «entra» | 0/69 | 62/7 |
| e04 | strada_cinderwick «esce» | 69/0 | 69/0 |
| e17 | strada_cinderwick «entra» | 20/48 | 33/36 |
| e17 | strada_cinderwick «esce» | 48/21 | 36/33 |
| e30 (con meta) | strada_cinderwick «esce» | 57/12 | 58/11 (invariato) |

- e01: tutti e due i cortei 0/69 in «entra» e 70/0 in «esce», come prima.
- **Restano:**
  - in e17 e in e30 il corteo della chiamata su strada_cinderwick è ancora misto (16/24, 20/20). È il tratto 0,2-1 del viale percorso dalla chiamata (`dinamica.ts`), il resto di C28-05; non l'ho toccato.
  - in e30 la misura «distanza dallo stadio» e la `meta` (municipio) dicono due cose diverse: il corteo va dallo stadio al municipio.

## C29-04 – la guida spiega «Urgente!»

- In `guida.5` ho aggiunto il testo approvato, nella versione corta (la riga lunga superava i 150 caratteri): «"Urgente!": nel settore della chiamata, in questa ondata, c'è un evento grave. Vale per il posto, anche se chi chiama parla d'altro.»
- Guardiano in `tests/urgente.test.ts`. Il controllo d'altezza del giro foto (guida a 360×760) è nella catena.
