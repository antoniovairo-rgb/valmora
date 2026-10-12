# S-17 – «Riparti dall'ondata N» a episodio perso (PO-060) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Cosa ho fatto

- **App.tsx**: alla chiusura dell'episodio l'esito tiene anche lo stato finale dell'episodio, con le partenze di ogni ondata (`InCorso.partenze`, PO-060).
- **Verbale di un episodio perso**: i pulsanti sono affiancati.
  - «Riparti dall'ondata N», con N = `ondataDaRiprendere(esito)` e lo stato `riprendiDallOndata(ic, N)`;
  - «Ricomincia», cioè l'episodio da capo, come prima.
- **Quando non c'è «Riparti»**: se N = 1, oppure se lo stato non c'è (salvataggi vecchi senza `partenze`), resta solo «Ricomincia l'episodio».
- **Cosa fa «Riparti»**: rimette in gioco lo stato dell'inizio dell'ondata N, lo salva come episodio in corso e porta allo schieramento di quell'ondata.
  - Il tentativo era già stato contato alla chiusura (D-062): ripartire non ne aggiunge un altro.
- **Avviso**: «Episodio fallito: riparti dall'ondata N, dove si è deciso, o da capo.»
- **Interruttore rosso** `__NO_C21R01`: solo «Ricomincia».
- **Spazio**: con due pulsanti uno sotto l'altro il primo passo del verbale arrivava a 825 px a 360×760. Il guardiano S-10 l'ha segnalato; affiancati, il passo sta di nuovo in 760.

## Guardiano

`tools/foto-club.mjs` → `controllaRipartenza`, a 360 px:
- con le variabili iniziali, fa perdere e01 dalla città col piano del giocatore peggiore;
- il verbale deve offrire «Riparti dall'ondata N» con la N calcolata dal motore (`ondataDaRiprendere`), oppure solo «Ricomincia» se N = 1;
- «Riparti» deve portare allo schieramento dell'ondata N, e l'ondata N deve essere nel salvataggio.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-s17` | partita completa, archivio, ripartenza e01 (N = 2), 36 episodi | verde |
| stesso comando con i pulsanti uno sotto l'altro | 360 px | ROSSO: «verbale 1/5: 825 px di pagina, a 360×760 si scorre» ×2 |
| `… VALMORA_ROSSI=C21R01 …` | 360 px | ROSSO: «il verbale offre «Riparti dall'ondata —», il motore dice 2» |
| `node tools/foto.mjs out/foto-s17` | 3 larghezze | verde |
| `node tools/catena.mjs completa` | commit c4a3da3 (merge della principale), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Foto in `docs/foto/s17/2026-10-12/`: verbale di e01 perso, prima e dopo, a 360, 375 e 412 px.
