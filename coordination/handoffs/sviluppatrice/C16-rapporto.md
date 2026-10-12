# C16-03, C16-04, C16-06 (collaudo C-016) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnati**.

## C16-03 · online durante un rilascio: «Forse manca la rete»

- **Causa** (dal rapporto della collaudatrice): `public/sw.js` restituiva la risposta della rete anche quando era un 404 e leggeva la cache solo se la rete mancava del tutto.
- **Correzione**: se la rete risponde con un errore e il file è in cache, si usa la cache.
- **Rosso** `__NO_C28W01`: arriva al worker come `?rossi=`.
- **Guardiano**: `tools/offline.mjs`, passaggio nuovo **O5**. Online, con la scheda della build vecchia aperta, il server non ha più il modulo della città (404); la città si deve aprire dalla cache, senza «Riprova». Anche il passo «bracci-rossi-grafica» lo prova col rosso.
- **Misure**:
  - `node tools/offline.mjs` → verde, O1-O5;
  - `VALMORA_ROSSI=C28W01 node tools/offline.mjs` → ROSSO: «O5 … la città non si apre».

## C16-04 · la guida introduttiva si segna «vista» prima di essere vista

- **Correzione**: `segnaGuidaVista()` si chiama quando la guida si chiude («Salta») o si finisce («Iniziamo»), non prima di mostrarla (App.tsx). Se l'app si chiude a metà, alla prossima partita nuova la guida torna.
- **Rosso** `__NO_C28G01`: si segna prima, come allora.
- **Guardiano**: in `controllaGuida`, al passo 3 la guida non dev'essere ancora segnata «vista».
- **Misure**: verde; col rosso, ROSSO: «guida introduttiva: segnata vista prima di finirla».

## C16-06 · «Riparti dall'ondata 3» con il numero da solo sulla seconda riga

- **Correzione**: spazio non separabile fra «ondata» e il numero.
- **Rosso** `__NO_C28R01`.
- **Guardiano**: `controllaRipartiTesto`. Misura con un Range la larghezza dell'ultima riga del testo del pulsante, che deve superare 30 px.
  - Dopo C16-01 (della principale) il fallimento di e01 offre solo «Ricomincia», quindi lì il controllo era cieco: col rosso restava verde.
  - Ora il controllo cerca col motore il primo episodio che si perde con ripartenza N > 1 (e07), lo fa perdere dalla città e misura lì.
- **Misure**: verde; col rosso, ROSSO: «e07 verbale perso: l'ultima riga … è larga 8 px, il numero è rimasto solo».

## Visto strada facendo

- **Indicatore «Rispondi ↓»** (C09-03): nella chiamata di e07 il controllo ha segnalato una volta le opzioni sotto la piega senza indicatore.
  - IPOTESI: l'IntersectionObserver risponde in ritardo e solo quando si attraversano le soglie, quindi non ha fatto in tempo a reagire a uno spostamento della pagina.
  - Ora la visibilità si calcola prima del disegno e a ogni scorrimento, ridimensionamento o cambio di layout (`Ondata.tsx`).
  - Verde, e il rosso C10S03 è sempre rosso (18 chiamate).
- **Verbale perso di e07**: 774 px a 360×760. La vignetta dell'esito ora si stringe di più (riserva 680 px, minimo 70 px), e torna a 760.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-c16` | partita, archivio, ripartenze e01 ed e07, indietro, 144 ondate, 36 episodi | verde |
| `… VALMORA_ROSSI=C10S03 …` | 360 px | ROSSO: 18 chiamate, 15 pulsanti sotto la piega |
| `node tools/catena.mjs completa` | vedi sotto | |
