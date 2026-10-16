# D-139 («?» nella barra fissa), C32-01 (fuoco al comando più vicino), C32-06 (versione fuori dalla colonna) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, unito alla principale (0.32.0). Foto in `d139/` e `c32/`.

## D-139 (C30-04, PO-118) – il «?» nella barra fissa

- `Schieramento.tsx`: il «?» è un pulsante della barra fissa, fra «annulla» e «ricomincia». L'icona è grande (`--icona-aiuto`, 26 px), come prima nella riga.
- **Rosso `__NO_C96A01`:** nella riga sotto le unità, come prima.
- **Guardiano C17** (`controllaRigaAiuto`, rifatto):
  - il «?» sta nella barra, non coperto, con tocco ≥44 px e icona ≥24 px (soglie di PO-096 invariate);
  - «Conferma» almeno 44×44 px, col testo intero.
- Guardiano C18-07/C20-04 adeguato: per il «?», che ora sta nella barra, conta solo che sia nella finestra.
- **Misura** (sonda e01 schieramento con la riga «i» aperta). Il «?» è libero a ogni misura:

| finestra | verde: «?» | rosso C96A01: «?» |
|---|---|---|
| 360×760 | 632-683, libero | 609-653, libero |
| 375×667 | 608-659, libero | 624-668, coperto dalla barra |
| 412×915 | 653-704, libero | 629-673, libero |
| 1366×768 | 709-760, libero | 697-741, coperto dalla barra |

- **Giro foto:** rosso C96A01 14 righe «il «?» non è nella barra fissa (D-139)».
- **Foto** `d139/prima-*` e `dopo-*` a 360, 375, 412 e 1366: a 360 «Conferma» resta largo e leggibile.

## C32-01 – il fuoco perso va al comando più vicino

- `Scena.tsx`: si ricorda il centro dell'ultimo comando che ha avuto il fuoco. Quando il fuoco si perde, va al comando della scena più vicino a quel punto, senza scorrere.
  - Le opzioni delle chiamate sono escluse: Invio sceglierebbe senza aver letto.
  - Se non ci sono comandi, va sulla scena (C28-09).
- **Rosso `__NO_C97F01`:** sempre sulla scena.
- **Guardiano** `controllaFuoco`: se la scena ha comandi, il fuoco non sta sulla scena.
  - Esentato il titolo: si apre anche al caricamento, quando non c'è un comando perso. Misurato con una sonda: dopo «Torna al titolo» il fuoco va a un comando (BUTTON[idee]).
- **Giro foto:** rosso 76 righe, per esempio «crediti: il fuoco recuperato sta sulla scena»; verde 0 (a parte il titolo, ora esentato).
- Il primo giro di catena era rosso a 375: in una chiamata il fuoco restava sulla scena. IPOTESI: il comando più vicino si cercava solo nella scena, dove al montaggio c'erano solo le opzioni (escluse), mentre casa e «i» stanno nella testata. Ora la ricerca è su tutta la pagina del gioco (`main`): il giro foto a 375 esce con exit 0.
- Non ho rifatto il conto dei Tab con le sonde c32 del collaudo: non so di quanto scendono.

## C32-06 – la versione non tocca i pulsanti su tablet e PC

- `stile.css`: dove c'è spazio la versione sta subito fuori dal bordo destro della colonna. Sui telefoni non c'è e resta com'era.
- **Rosso `__NO_C98V01`:** dentro il margine della colonna.
- **Guardiano** `controllaLargo` (1366×768):
  - la versione sta nei 16 px oltre il bordo della colonna;
  - non tocca nessun comando.
- **Giro foto:** rosso 65 righe, «versione da 907 a 923 px, colonna fino a 923 px»; verde 0.
- **Foto** `c32/prima-*` e `dopo-*` a 1024 e 1366.
- I 4 casi del telefono segnalati dal collaudo sono uguali nei due bracci e non li ho toccati.

## Esito dei giri

FATTO MISURATO: catena completa 3/3 verde su 4348ab8 (il primo giro su 3ad010a era rosso a 375 per C32-01, corretto).

## e17 con la tua `meta: piazza_municipio` (C32-02), dopo il merge della 0.33.0

Con la meta, C31-02 vale anche per e17. FATTO MISURATO con la sonda `c27-pixel.mjs`, `RIF=piazza_municipio W=360 EP=e17`; persone via / verso lo stadio, e via / verso il municipio:

| | verde | rosso C95S01 |
|---|---|---|
| ondata 1 strada_cinderwick (raduno) | stadio 52/17, municipio 5/64 | 36/33, 0/69 |
| ondata 4 strada_cinderwick («dallo_stadio») | 51/18, 5/64 | 34/35, 69/0 (via dal municipio) |
| chiamata me_lo_dovete | 29/10, 3/36 | 7/33, 40/0 |
| chiamata ci_vediamo_dopo | 28/11, 2/37 | 22/17, 0/39 |
| piazza_municipio (ondate 3-4) | invariata | invariata |

- FATTO MISURATO: catena completa 3/3 verde su 56f8fe2, dopo il merge della 0.33.0.
