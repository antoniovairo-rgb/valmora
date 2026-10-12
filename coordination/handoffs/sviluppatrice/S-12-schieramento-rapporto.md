# S-12 – Schieramento più chiaro, con doppia conferma e «Annulla l'ultima» (PO-061, PO-054) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Cosa ho fatto

- **(a) Doppia conferma, sempre.**
  - «Conferma» apre il riepilogo «Il tuo schieramento»: per ogni settore, cosa ci hai messo (es. «Curva Cinderwick: 4 Steward e 1 Mediatore»).
  - Se avanzano unità, compare un avviso esplicito: «Ti restano 2 Steward: confermi lo stesso?».
  - I pulsanti sono «Torna allo schieramento» e «Sì, conferma».
  - Interruttore rosso `__NO_C17C01`: si conferma subito, come prima.
- **(b) Posizionamento più chiaro.**
  - Sopra il vassoio, la riga «In mano: Squadre, ne restano 3. Tocca un settore sulla mappa.» (oppure «Tocca un'unità qui sotto per prenderla.»).
  - Quante unità restano per risorsa: il numero nel vassoio. Quante ce ne sono per settore: i segnalini sulla mappa, come prima.
- **(c) Ritiro e annullamento.**
  - Il tocco su un segnalino ritira una sola unità, come prima; ora il testo lo dice («Tocca un segnalino sulla mappa per ritirare una sola unità»).
  - Nuovo pulsante «Annulla l'ultima»: annulla l'ultima mossa (unità messa, ritirata, o «Ritira tutte») grazie a una cronologia per ondata in App.tsx.
  - Interruttore rosso `__NO_C17C02`: «Annulla» non fa niente.
- **Pulsanti**: «Annulla», «Ritira tutte» e «Conferma» su una riga sola, con etichette corte; i nomi completi restano per i lettori di schermo. Su due righe la barra fissa copriva il vassoio e a 412 px il trascinamento falliva.
  - Con tre pulsanti sulla stessa riga «Conferma» usciva dallo schermo a destra.
  - Nessun controllo lo vedeva, perché `#app` taglia l'eccedenza orizzontale. Ora il controllo «pulsante principale in vista» (C09-03) guarda anche i bordi destro e sinistro: col difetto ha dato 7 righe rosse, «Conferma … fuori dallo schermo».
- `coordination/sonde/rev-schermate.mjs` (la sonda della revisione) ora prosegue con «Sì, conferma» dopo «Conferma».

## Guardiano

`tools/foto-club.mjs` → `confermaSchieramento`, a ogni schieramento:
- all'ondata 1 della partita completa, «Annulla l'ultima» deve togliere esattamente un'unità, che poi si rimette;
- «Conferma» deve aprire il riepilogo, col totale uguale alle unità sulla mappa;
- «Ti restano N» compare se e solo se avanzano unità, con N giusto;
- poi «Sì, conferma».

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s12` | e01 ×2, e02, e03, e13, e25 | verde |
| stesso comando, controllo C09-03 ampliato, prima di sistemare i pulsanti | 360 px | ROSSO: 7 righe «Conferma … fuori dallo schermo» |
| `… VALMORA_ROSSI=C17C01 …` | 360 px | ROSSO: 22 righe «Conferma senza riepilogo di cosa va dove» |
| `… VALMORA_ROSSI=C17C02 …` | 360 px | ROSSO: «Annulla l'ultima da 11 a 11 unità» |
| `node tools/foto.mjs out/foto-s12` | 3 larghezze | verde (dopo i pulsanti su una riga: su due righe coprivano il vassoio e a 412 px il trascinamento falliva) |
| `node tools/catena.mjs completa` | commit 9fe2d14 (merge della principale a5fbe11), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Visto nelle foto e lasciato a S-13 (PO-053 punto 2, PO-058): la barra fissa dei pulsanti copre l'ultima voce del vassoio finché non si scorre.

Foto in `docs/foto/s12/2026-10-12/`: schieramento di e01 prima (360 px) e dopo, più il riepilogo, a 360, 375 e 412 px.
