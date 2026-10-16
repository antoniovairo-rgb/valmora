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

## Ancora da fare

- **C29-02:** geometria del viale in e04, stessa famiglia di C28-05.
- **C29-04:** riga della guida su «Urgente!»: testo da approvare.
