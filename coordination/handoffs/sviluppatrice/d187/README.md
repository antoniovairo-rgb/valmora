# D-187 · scorrimenti e sovrapposizioni (PO-052, PO-058) — S-11

Ramo `claude/valmora-home`, merge (non rebase) della principale `0908c2fa`. Build 0.42.0.
Metodo: riproduci (sonda di S-12), patch minima, rosso, guardiano. Misure con `tools/sonda-altezze.mjs` (nuova, dalla sonda
`coordination/sonde/s12-altezze.mjs` di S-12): partita e01 intera col piano del bot attento, a ogni scena eccedenza della
pagina sullo schermo (px). Prima = build di `0908c2fa` (worktree), dopo = build di questo ramo. Un giro per altezza:
l'impaginazione è deterministica, ma i campioni per schermata cambiano un po' fra un giro e l'altro (la sonda conta gli
stati che vede): per questo le soglie sono il massimo misurato.

## 1. Scorrimenti (FATTO MISURATO, massimo per schermata, px)

| schermata | 360×640 | 360×760 | 375×667 | 375×812 | 412×830 |
|---|---|---|---|---|---|
| titolo (home) | 4 → **0** | 0 → 0 | 4 → **0** | 0 → 0 | 0 → 0 |
| città | 133 → 117 | 13 → **0** | 106 → 90 | 13 → **0** | 1 → **0** |
| sala | 82 → 36 | 0 → 0 | 66 → 9 | 0 → 0 | 0 → 0 |
| briefing | 80 → 34 | 0 → 0 | 64 → 7 | 0 → 0 | 0 → 0 |
| schieramento | 53 → **0** | 0 → 0 | 41 → **0** | 0 → 0 | 0 → 0 |
| risposta | 241 → 113 | 104 → **0** | 212 → 69 | 67 → **0** | 86 → **0** |
| chiusura | 95 → **0** | 0 → 0 | 83 → **0** | 0 → 0 | 0 → 0 |
| rapporto | 366 → 238 | 246 → 118 | 330 → 187 | 185 → **0** | 166 → **0** |
| chiamata (D-114) | invariata: mappa 328/343/380 px come prima | | | | |
| crediti | possono scorrere (invariati) | | | | |

Cosa è cambiato:
- `src/resa/mappa/adatta.ts` (nuovo) + `Mappa.tsx`: nelle schermate di gioco la mappa si abbassa quanto basta perché la
  pagina non scorra, fino a `--mappa-altezza-min` (200 px: sotto, a 360, i nomi in alto finiscono sotto il tasto casa).
  La chiamata è esclusa (D-114). Le vignette nascondibili (D-126 d) cedono per prime. Rosso `__NO_C187M01`.
- Città: `--citta-riserva` 500 → 516 e `--citta-altezza-min` 260 → 244 (la scheda è cresciuta di 13 px). Rosso `C187C01`.
- Home: il margine dell'ultimo paragrafo usciva da `main` e la vignetta lo ignorava (4 px). Rosso `C187C01`.

Resta da decidere (oltre il ridimensionamento cambierebbe l'aspetto): vedi «Opzioni».

## 2. Pulsante fisso sopra le righe del rapporto
Dove il rapporto non scorre più (375×812, 412×830) il pulsante non copre niente. Dove scorre ancora (360×640, 360×760,
375×667) il pulsante fisso (`stile.css:186`) copre per forza le righe sotto: è il comportamento di C09-03. Vedi «Opzioni».

## 3. «v0.42.0» sopra le lettere delle opzioni
Causa (FATTO MISURATO): con `reducedMotion` la scena che esce salta subito a x −40 px (`Scena.tsx:55`) e resta visibile
mentre sfuma: la lettera arriva a x −16, sotto la versione fissa (z-index 3); 450 px² misurati. A riposo nessuna
sovrapposizione. Correzione: la versione sta sotto la scena che si muove (`z-index: auto`, `stile-c18.css`). Rosso
`C187V01`. Guardiano: nel cambio di scena, al centro della versione dev'esserci la scena (rosso: rosso; verde: verde).

## 4. Nomi della mappa sopra i segni (chiamata e risposta)
`etichette.ts`: i segni dell'ultima risposta sono ostacoli per i nomi. Rosso `C187S01`. Misura: col rosso 506 px², col
verde 183 px² in un giro e 350 px² in un altro con la stessa build (la misura è rumorosa): NON è un guardiano bloccante,
la sonda la stampa. I segni stanno già sopra i nomi (z-index 4): la sovrapposizione è geometrica, il segno resta leggibile.

## 5. C28-02 (opzione accesa sotto il puntatore fermo)
FATTO MISURATO (sonda col mouse, build 0908c2fa): a 1024×768, 1280×800 e 1366×768 l'opzione è sotto la piega alla ripresa,
quindi si porta sotto il puntatore con la rotellina: spenta (data-fermo); dopo una mossa del mouse si accende. A 1920×1080
spenta col puntatore fermo, accesa dopo una mossa. Il «resta bianca» di S-12 è una lettura 150 ms dopo la mossa: a 1280
a 150 ms ho letto ancora bianco con `data-fermo` già tolto, a 300 ms ciano in tutti i casi (render + transizione di
80 ms). Nessun difetto del gioco: nessuna correzione.

## 6. rev-schermate.mjs
Sostituita come guardiano da `tools/sonda-altezze.mjs`, nella catena grafica (passo `altezze`, per larghezza:
360 → 360×640 e 360×760, 375 → 375×667, 412 → 412×830), con le soglie misurate e i rossi C187M01 e C187V01 nei bracci
rossi (a 360×760).

## Opzioni (decide il PO, tramite la principale)
- Rapporto (238/118/187 px a 360×640, 360×760, 375×667):
  A) a schermo basso il rapporto mostra la mappa piccola sopra la scheda solo se ci sta, altrimenti la scheda dei settori
     da sola (i colori dei settori dicono già lo stato) — 0 px a 360×760, ~24 px a 360×640; costo basso; cambia l'aspetto.
  B) pulsante «Prossima ondata» non fisso nel rapporto: niente copertura, ma per arrivarci si scorre.
  C) com'è (scorre, il pulsante copre le righe finché non si scorre).
- Risposta a 360×640 e 375×667 (113/69 px), sala e briefing a 360×640 (36/34 px): mappa più bassa (160 px) nelle schermate
  senza tocchi sulla mappa; i nomi in alto rischiano il tasto casa. Da provare con foto.
- Città a 360×640 e 375×667 (117/90 px): sotto 244 px i dischi degli episodi si coprono (C17-12): serve una scheda più
  compatta o a comparsa. Cambia l'aspetto.

## Non verificato
Telefono vero; episodi diversi da e01; passi del verbale oltre il primo; sovrapposizioni a metà scorrimento; lettore di
schermo; la scheda della città con episodi già giocati (stelle, tentativi) a 360×760.

## Foto
`prima-<vp>-<schermata>.png` e `dopo-<vp>-<schermata>.png` per 360×640, 360×760, 375×667, 375×812, 412×830 (titolo,
città, sala, briefing, schierato, risposta, rapporto). Il primo campione di ogni schermata: prima e dopo possono essere
ondate diverse (es. rapporto dell'ondata 1 prima, dell'ondata 2 dopo).
