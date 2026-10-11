# S-10 – Sala, briefing e verbale a passi (PO-045) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata** insieme a S-11, con un'unica catena.

## Cosa ho fatto

- Componente `src/resa/schermate/Passi.tsx`:
  - una carta per schermata, indicatore del passo (pallini), «Indietro» e «Avanti» attaccati in basso;
  - all'ultimo passo compare il pulsante finale della schermata;
  - i passi non correnti restano nella pagina ma nascosti (`hidden`), così testi e controlli li trovano;
  - a ogni cambio di passo la pagina torna in cima.
- **Sala operativa**: primo passo «Stasera» con la sfida e gli stemmi (solo se la missione ha club), poi una battuta del vice per passo.
- **Briefing**: una fonte per passo, non più accumulate in colonna; l'etichetta «Briefing · 2 di 4 fonti» resta.
- **Verbale**: 5 passi:
  1. esito, stelle e sfida (con «Rigioca» se l'episodio è fallito);
  2. cosa ti ha aiutato;
  3. cosa ha pesato;
  4. dove sei rimasto scoperto e cosa manca per la stella;
  5. le fonti, in forma compatta (nome, timbro Vera/Falsa, testo).

  Alla fine c'è «Alla mappa della città».
- Per stare in 760 px:
  - nella sala e nel briefing la mappa è 4:3 invece che quadrata (token `--mappa-proporzione-passi`);
  - il testo radio passa da 20 a 16 px;
  - la sfida sta su una riga (club · contro · club).

  Limite visto nelle foto: con la mappa 4:3 lo stadio di e01 è tagliato in alto e il nome «Piazzale dello stadio» cade sul campo. Resta leggibile; si può rivedere.
- Interruttore rosso `__NO_C12P01`: tutto in colonna come prima.

## Guardiano

In `tools/foto-club.mjs`:
- `controllaAltezza`: in sala, briefing e verbale porta la finestra a 360×760 e misura `scrollHeight`, che deve essere al massimo 760;
- `avanzaFino`: attraversa i passi con «Avanti» fino al pulsante cercato, e fa una foto a ogni passo.

Il controllo «pulsante principale in vista» (C09-03) conta anche «Avanti» dei passi.

## Misure (FATTO MISURATO, `VALMORA_MISURE=1`)

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto-s10` | e01 ×2, e02, e03, 3 larghezze | verde: ogni passo ≤ 760 px a 360, 375 e 412 |
| `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C12P01 VALMORA_MISURE=1 …` | 360 px | ROSSO: sala 1149 / 1227 / 1251 px, briefing 908 / 1117 / 1325 px, verbale 1820 / 1838 / 1854 / 1926 px |
| `node tools/catena.mjs completa` | commit f952668 (merge della principale d1c680d), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Nota sul «prima»:
- il braccio rosso usa già la mappa 4:3 e il testo radio a 16 px; prima di S-10, con la mappa quadrata, le pagine erano più alte di circa 80 px;
- i numeri del «prima» sono quindi una stima per difetto.

Foto in `docs/foto/s10/2026-10-11/`: e01 prima (360 px) e dopo, passo per passo, a 360 e 412 px.
