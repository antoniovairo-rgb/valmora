# S-19 – Barra della fiducia sempre in vista (PO-067, D-097) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Cosa ho fatto

- `src/resa/fiducia.tsx`: barra a 10 tacche, nello stile C, con i colori presi dai token.
  - Sta sotto la testata, sopra la mappa, in schieramento, chiamata, risposta, chiusura e rapporto.
  - Mostra il valore della variabile del motore `credito` (0-10, da `data/stato.json`).
  - L'etichetta è quella di `var.credito`, cioè «Fiducia».
  - C'è anche il valore «N/10»: la fiducia può stare in cifre (D-097), la tensione no (D-055).
- Quando una scelta cambia la fiducia, accanto alla barra compare «+N» (verde) o «−N» (magenta), con un salto animato, per 2,5 secondi.
  - La barra resta montata fra una schermata e l'altra (sta fuori dalla scena), quindi la variazione si calcola sul valore di prima.
- Accessibilità: `role="meter"`, con valori minimo, massimo e attuale.
- Interruttori rossi: `__NO_C16F01` toglie la barra; `__NO_C16F02` toglie il «+N/−N».

## Guardiano

`tools/foto-club.mjs` → `controllaFiducia`, chiamato su ogni foto delle schermate dell'episodio. Controlla che:
- ci sia una e una sola barra;
- il valore della barra sia uguale a `in_corso.variabili.credito` del salvataggio;
- nella risposta, se la fiducia è cambiata rispetto alla schermata prima, compaia la variazione col segno giusto.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s19` | e01 ×2, e02, e03, e13, e25 | verde |
| `… VALMORA_ROSSI=C16F01 …` | 360 px | ROSSO: «0 barre della fiducia» su chiamate e chiusure (20 righe), valore NaN contro quello salvato |
| `… VALMORA_ROSSI=C16F02 …` | 360 px | ROSSO: «risposta: fiducia da 4 a 5 senza «1» accanto alla barra» |
| `node tools/catena.mjs completa` | prima: ROSSA su 5dca100 per docs/governo/BACKLOG.md:77 (riga della principale, corretta in a5fbe11); poi commit 9fe2d14 (merge della principale a5fbe11), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Limite del guardiano del «+N/−N» (FATTO MISURATO): nel giro delle foto lo scatta una sola risposta fotografata che cambia la fiducia. Le partite delle stagioni 2 e 3 si fotografano solo nelle scene chiave.

Foto in `docs/foto/s19/2026-10-12/`: e01 a 360 px, risposta prima e dopo, schieramento dopo.
