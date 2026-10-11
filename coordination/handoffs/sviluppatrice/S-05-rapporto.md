# S-05 – Accenno di costo sotto le opzioni (D-078, PO-031) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`, con merge (non rebase) fino a c1333cb. Stato: **consegna completa.**

## Cosa ho fatto

1. Sotto ogni opzione A/B/C della chiamata compare l'accenno di costo `opzione.costo`. Passa da `t()`, quindi
   da `scegliTesto`, con la variante @f se esiste. Stile C: riga in Inter 13 px, grigio scuro, minuscolo,
   sotto il testo maiuscolo dell'opzione; colori e misure solo da token (`.costo` in stile.css). Mai numeri.
2. Le opzioni sono state rese più robuste:
   - l'evidenziazione al passaggio (`:hover`) vale solo sui dispositivi con un puntatore vero (`@media (hover: hover)`): sui telefoni restava accesa dopo il tocco e l'opzione nella stessa posizione della scena dopo sembrava già scelta;
   - foto.mjs porta il mouse fuori prima di ogni foto.
3. Etichette nere (affidabilità, settore della chiamata) più basse quando vanno su due righe.
4. **Interruttore rosso** `globalThis.__NO_C05S05`: nasconde l'accenno.
5. **tools/foto.mjs**, a ogni chiamata (e01 ed e02, 3 larghezze):
   - conta le opzioni visibili e gli accenni non vuoti: devono essere uguali;
   - nessun accenno deve contenere cifre.
6. Missione di prova (tests/resa/dati-prova): aggiunti gli accenni, perché il validatore ora li pretende.

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/foto.mjs out/foto` (verde) | e01 ×2 + e02, 3 larghezze, tutte le chiamate | verde: ogni opzione ha il suo accenno, nessuna cifra, 0 errori, 0 scorrimento |
| `VALMORA_LARGHEZZE=360 VALMORA_ROSSI=C05S05 node tools/foto.mjs out/foto-rossa-S05` (rosso) | 360 px, 40 chiamate | ROSSO come atteso: «0 accenni di costo su 2 opzioni» ×24, «0 accenni di costo su 3 opzioni» ×16 |
| build di prova + `node tools/foto.mjs out/foto-prova out/dist-prova tests/resa/dati-prova` | 3 larghezze | verde |
| `npx vitest run` | 100 test | verdi |
| `node tools/catena.mjs completa` | commit 273c829, 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Layout a 360 px con gli accenni più lunghi («vai»: «Il presidente ti deve un favore; la curva Cinderwick
resta senza di te.»; «chiudi»: «Ferma lo scontro, scalda la strada di Cinderwick e costa credito.»): due righe,
nessuna rottura. Si vede in docs/foto/e01/2026-10-11-costo/360-21-chiamata.png e 360-29-chiamata.png.

## Foto

docs/foto/e01/2026-10-11-costo/: tutte le scene «chiamata» di e01 ed e02 a 360/375/412 px.

## Problemi aperti

Nessuno.
