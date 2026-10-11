# C-02 · Riepilogo finale

Rapporti: [C-02-1](C-02-1.md) (verifica delle correzioni) · [C-02-2](C-02-2.md) (difetti nuovi, testi). Base e46eba7. Sonde nuove: `sonde/c02-motore.mjs` (con `SPENTI=` per i bracci rossi), `sonde/c02-e01.mjs`, `sonde/c02-episodi.mjs`.

## Correzioni di C-01

- **Verificate, verde e rosso:** A01/A02, A04, A05, O01. Ogni interruttore rosso fa tornare il difetto e il verde lo corregge.
- **Chiuse per decisione o lettura:** A03, A07.
- **B01-B07:** tutti i numeri di COLLAUDI.md C-002.7-13 rimisurati, coincidono.
- **A06:** corretto, ma senza braccio rosso (C02-N04).

Su 5 bracci × 8000 partite: 0 blocchi, 0 violazioni delle regole, 0 differenze di determinismo.

## Difetti nuovi

| gravità | id | in breve |
|---------|----|----------|
| media | C02-N01 | 3★ solo a margine zero: il bot perfetto finisce sempre con tensione_max esattamente 3; con schieramento attento solo il 3,6% delle combinazioni di risposte dà 3★ |
| bassa | C02-N02 | «sciarpe»: dentro e01 «non_paga» domina «paga»; `informatore_pagato` e `presidente_incontrato` oggi non le legge nessuno |
| bassa | C02-N03 | «a fatica ★★» e «contenuto ★★» uguali (regola D-060 alla lettera) |
| bassa | C02-N04 | manca il braccio rosso per C01-A06 |
| bassa | C02-N05 | il mediatore da solo non presidia: il settore resta «vuoto» |
| bassa | testi | `presidente.vai` scalda la curva Cinderwick e `manda_vice` il piazzale senza che il testo lo dica |
| misura | C02-N06 | 59,2% di fallimenti del casuale = schieramento casuale × risposte casuali; ciascuno dei due da solo fa 2,8% e 12,1% |

Bloccanti: nessuno. Nessuna opzione dominata effetto per effetto. Nessuna chiamata a peso zero (minimo «sciarpe» 3,7%). Testi cambiati coerenti con gli effetti. Policy: 0 righe. Nessun refuso.

## Limiti dichiarati

Lo schieramento attento ed equilibrato vede le pressioni (D-041 le nasconde): le difficoltà per una persona restano IPOTESI finché il PO non gioca. Durata misurata solo in passi, invariata: 16 decisioni.
