# D-187 · scorrimenti e sovrapposizioni (PO-052, PO-058) — S-11

Nota: le foto «dopo» sono della prova senza il controllo di «Home» (mappa fino a 200 px, 8 px più bassa della versione finale dove la casa toccava la curva). Le misure della tabella sono quelle finali (due giri uguali).

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
| sala | 82 → 44 | 0 → 0 | 66 → 17 | 0 → 0 | 0 → 0 |
| briefing | 80 → 42 | 0 → 0 | 64 → 15 | 0 → 0 | 0 → 0 |
| schieramento | 53 → **0** | 0 → 0 | 41 → **0** | 0 → 0 | 0 → 0 |
| risposta | 241 → 113 | 104 → **0** | 212 → 77 | 67 → **0** | 86 → **0** |
| chiusura | 95 → **0** | 0 → 0 | 83 → **0** | 0 → 0 | 0 → 0 |
| rapporto | 366 → 246 | 246 → 126 | 330 → 195 | 185 → **0** | 166 → **0** |
| chiamata (D-114) | invariata: mappa 328/343/380 px come prima | | | | |
| crediti | possono scorrere (invariati) | | | | |

Cosa è cambiato:
- `src/resa/mappa/adatta.ts` (nuovo) + `Mappa.tsx`: nelle schermate di gioco la mappa si abbassa quanto basta perché la
  pagina non scorra, fino a `--mappa-altezza-min` (200 px) e mai sotto l'altezza a cui il pulsante «Home» tocca un punto o un nome dei settori (si rialza di 8 px alla volta; S-21: senza, la CI era rossa a 375, «Home» sopra la curva di Kiln). In e01 questo porta la mappa a 208 px dove serve.
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
rossi (a 360×760). Controlla anche che il pulsante «Home» della mappa abbassata non copra settori (S-21), e imposta
`__VALMORA_SECONDO_MS = 1` come foto.mjs (senza, in CI a 412 «bloccato su chiamata» nella finestra «Annulla»).

## Opzioni (decide il PO, tramite la principale)
- Rapporto (246/126/195 px a 360×640, 360×760, 375×667):
  A) a schermo basso il rapporto mostra la mappa piccola sopra la scheda solo se ci sta, altrimenti la scheda dei settori
     da sola (i colori dei settori dicono già lo stato) — 0 px a 360×760, ~24 px a 360×640; costo basso; cambia l'aspetto.
  B) pulsante «Prossima ondata» non fisso nel rapporto: niente copertura, ma per arrivarci si scorre.
  C) com'è (scorre, il pulsante copre le righe finché non si scorre).
- Risposta a 360×640 e 375×667 (113/77 px), sala e briefing a 360×640 (44/42 px) e 375×667 (17/15 px): mappa più bassa (160 px) nelle schermate
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

---

# D-191 (decisione del PO sull'opzione consigliata) · S-11

Merge (non rebase) dalla principale `e8bf9c6` (S-13, S-15). FATTO MISURATO con `tools/sonda-altezze.mjs`, due giri uguali.

| schermata | 360×640 | 360×760 | 375×667 | 375×812 | 412×830 |
|---|---|---|---|---|---|
| città | 117 → **0** | 0 | 90 → **0** | 0 | 0 |
| sala / briefing | 44/42 → 16/16 | 0 | 17/15 → **0** | 0 | 0 |
| risposta | 113 → 104 | 0 | 77 → 77 | 0 | 0 |
| rapporto | 246 → **0** | 126 → **0** | 195 → **0** | 0 | 0 |
(prima = dopo D-187; chiamata invariata per D-114; crediti liberi; le altre schermate 0)

1. Rapporto (`adatta.ts`, rosso `C191R01`): se con la mappa al minimo la pagina scorre ancora, la mappa non si mostra; resta
   la scheda dei settori (righe un po' più strette) e «Home» passa nella testata (`App.tsx`, `Testata home`). Senza mappa
   si nasconde anche la vignetta di fine ondata (già vista nella scena del tono, D-143): prendeva il posto della mappa e
   sforava di 12 px a 375×812.
2. Risposta, sala, briefing: la mappa scende fino a `--mappa-altezza-min-lettura` 160 px (rosso `C191L01`); i nomi dei
   settori evitano il pulsante «Home» come i punti (`etichette.ts`, rosso `C191H01`). A 360×640 sala e briefing restano a
   16 px: sotto 176 px «Home» tocca la curva di Kiln (S-21) e la mappa si ferma lì. La risposta a 360×640 (104 px) e
   375×667 (77 px) non ci sta neanche a 160 px: servirebbe un'altra decisione (per esempio i due messaggi in uno).
3. Città: scheda dell'episodio più compatta (stemmi piccoli accanto ai nomi, margini ridotti; rosso `C191C01`).

Guardiano: `tools/sonda-altezze.mjs` con le soglie nuove; bracci rossi C191R01, C191L01, C191C01, C191H01 verificati
(rapporto 118 px, sala 36, città 117, sala 40 col rispettivo rosso).

Foto D-191: `d191/<vp>-<schermata>-<n>.png`.

Non verificato: telefono vero; episodi diversi da e01 (in altri episodi i settori in alto possono fermare la mappa più in
alto); passi del verbale oltre il primo; lettore di schermo (la testata con «Home» nel rapporto senza mappa).

---

# D-193 (risposta in un solo blocco) e chiusura di D-191 · S-11

FATTO MISURATO (`tools/sonda-altezze.mjs`, build finale): **0 px di scorrimento su tutte le schermate a 360×640, 360×760,
375×667 e 412×830**, tranne la chiamata (D-114, invariata) e i crediti (liberi).

| schermata | 360×640 | 375×667 |
|---|---|---|
| risposta | 104 → **0** | 77 → **0** |
| sala / briefing | 16 → **0** (mappa ≥ 176 px) | 0 |

1. Risposta (`Ondata.tsx`, rosso `C193R01`): esito e conseguenza in un solo fumetto: la scelta in testa come striscia
   ciano, poi «☕ Intanto…» in linea col testo della conseguenza. La mappa resta.
2. Sala e briefing (rosso `C193S01`): 8 px in meno sopra il passo e 4+4 attorno ai pulsanti dei passi; la mappa non scende
   sotto i 176 px (S-21).
3. Controllo di «Home» (`adatta.ts`): prima i punti (fermi), poi i nomi ridisposti solo quando i punti sono liberi; una
   ridisposizione per passo rallentava ogni disegno (IPOTESI sulla CI rossa a 375, segni della risposta spariti prima del
   controllo PO-085: non riprodotta in locale).
4. Guardiano R06 di `tools/foto.mjs`: col rapporto senza mappa misurava i nomi contro una mappa nascosta (rettangolo 0×0):
   ora salta la mappa nascosta (CI locale a 375, 20 rossi falsi).

Bracci rossi verificati rossi (360×640 o 360×760): C187M01, C187V01, C191R01, C191L01, C191C01, C191H01, C193R01, C193S01.
Guardiani di brevità e C42-02 (testi): non toccati, i testi sono gli stessi (Non verificato in catena finché non passa la CI).

Foto dopo: `d193/dopo-<vp>-<schermata>.png`; prima: le foto `prima-*` in cima a questa cartella.

---

# D-197 (opzione A del PO), job grafica 360, C43-06, C43-07 · S-11

Merge (non rebase) dalla principale `5d57e29` (imprevisti di S-14, D-190).

## D-197: nella risposta la mappa resta piena
- Perché (FATTO MISURATO, Chrome 156 della CI in locale): con la mappa abbassata solo nella risposta, a ogni risposta la
  mappa cambiava altezza due volte; la scena di Pixi e i nomi si rifacevano (lavori lunghi sul thread principale: a CPU 4×
  1,6–4,6 s in più senza WebGL) e i segni di PO-085, che durano 1,8 s di tempo vero, potevano scadere prima del controllo
  (CI rossa a 375 e 360 su ae4545f).
- Correzione: `adatta.ts` non adatta la risposta (rosso `C197R01`). Il blocco unico di D-193 resta.
- Scorrimento della risposta (FATTO MISURATO, `tools/sonda-altezze.mjs`): **116 px a 360×640, 104 px a 375×667**; 0 a
  360×760, 375×812 e 412×830. Soglie del guardiano solo per queste due; le altre invariate.
- Guardiano nuovo: nella risposta la mappa è alta come nella chiamata prima (col rosso C197R01: 218–242 px contro 328).
- Segni PO-085 su Chrome 156: sonda a 375×800, 32 risposte (16 a CPU normale, 16 a CPU 4×): 0 senza segni al momento del
  controllo. Guardiano `foto` con Chrome 156: vedi la consegna (due giri a 375, uno a 360).

## Job grafica 360 (35–38 minuti)
- Misura (Chrome 156 in locale, passo «foto» a 360 = 2830 s): `controllaSchieramenti` 1626 s, `apriTutte` 391,
  `controllaRipartiTesto` 153, `controllaRipartenza` 147.
- Causa: `controllaSchieramenti` stava solo nel giro a 360 ma faceva anche 375 e 412; e a 360 ricarica ogni ondata di ogni
  episodio col carattere rallentato di 1,5 s (CARATTERE_LENTO) e 500 ms di quiete: quasi tutto attesa.
- Correzioni: ogni job fa la sua larghezza (`sola`); gli stati con le unità su 3 pagine insieme (contesti separati).
  Soglie invariate (PASTIGLIE_SU_NOMI resta 0). In locale: `controllaSchieramenti` 1626 → 778 s, «foto» 2830 → 1969 s,
  verde. CI su 057502a (solo la divisione): «foto» 2045 → 1891 s.

## C43-06: passo «Fine stagione»
- Riprodotto (Chrome 156): e24 a 360×760 scorre 250 px, «Prossimo episodio» top 896; e12 51 px.
- Correzione: passo più compatto (filo «nome — esito» in un paragrafo, spaziature strette; i pulsanti restano sotto il
  testo per C17-22). Rosso `C196V01`. Dopo: 0 px a 360×760, 375×812, 412×915 (e24 passo 744 → 460, «Prossimo» top 592).
- Guardiano in `foto-epilogo.mjs` (verde; rosso: e24 210 px, «Prossimo» 147 px sotto la piega). Foto `c43/`.

## C43-07: home 764 su 760
- Già corretto da D-187 (margine dell'ultima nota che usciva da main): 764 → 760 a 360, 375 e 412 (Chrome 156).
- Guardiano `foto-home.mjs`: scrollHeight a 760, rosso `C187C01` nei bracci rossi. Dichiarato: a 640 px d'altezza con un
  salvataggio la home scorre 29/10/10 px (vignetta già al minimo di 96 px). Foto `c43/`.

## Altro trovato dalla CI
- Città: col minimo a 244 px (D-187) i dischi degli episodi si sovrapponevano per 587 px² a 360×760 (C17-12): tornato a
  260 px; a 360×640 i pulsanti delle stagioni più vicini alla mappa (0 px).

## C44-08 e C44-09 (D-201) — S-11, 20/10

Base: merge del ramo della principale fino a 16ecffb2 (contiene 335e7059). Misure con Chrome Headless Shell 156 (`tools/chrome-ci.mjs`).

FATTO MISURATO, `tools/sonda-altezze.mjs` (e01, bot attento), scorrimento massimo in px, prima → dopo:

| schermata | 360×760 | 375×760 | 412×760 | 360×640 | 375×667 | 412×830 |
|---|---|---|---|---|---|---|
| risposta | 0 → 0 | 11 → **0** | 24 → **0** | 116 → 68 | 104 → 56 | 0 → 0 |
| città, 36 episodi conclusi | 3 → **0** | 0 → 0 | 0 → 0 | — | — | — |

Imprevisti: `coordination/sonde/c44-giocatore.mjs` su e12 ed e14 (bot attento) a 360, 375 e 412×760: 102 risposte (24 imprevisti),
tutte a 0 px dopo la correzione. Altri episodi: non misurati.

Cosa è cambiato (`src/resa/stile-c18.css`, solo token):
- Risposta (rosso `C201R01`): testata e margine sotto la mappa come nella chiamata, «Avanti» a `--spazio-2` dal blocco,
  margine in fondo alla pagina `--spazio-3` invece di `--spazio-6`. La mappa resta piena (D-197): stessa altezza della chiamata.
- Città (rosso `C201C01`): «Rileggi l'epilogo» a `--spazio-2` dalla scheda e senza margine sotto.

Guardiano: `tools/sonda-altezze.mjs` gira anche a 375×760 (giro 375) e 412×760 (giro 412), e a ogni altezza 760 apre la città
con tutti gli episodi conclusi (`citta36`, soglia 0). Soglie della risposta abbassate al nuovo massimo misurato: 360×640 116 → 68,
375×667 104 → 56; chiamata a 375×760 512 e a 412×760 473 (D-114, il massimo misurato). Bracci rossi nella catena grafica:
`C201R01` a 412×760 (24 px, rosso visto), `C201C01` a 360×760 (città 3 px, rosso visto).

Foto in `c44/`: `prima-`/`dopo-<w>x760-risposta.png` (360, 375, 412), `prima-360x760-citta36.png`, `dopo-<w>x760-citta36.png`.

Non verificato: telefono vero; risposte e imprevisti degli episodi diversi da e01, e12, e14; città con un salvataggio vero a 36 episodi.

## D-202: job «grafica (360)» sotto i 20 minuti — S-11, 20/10

Base: ramo della principale fino a 84245887 (64707305 non era su origin al momento del merge).

FATTO MISURATO, CI (log dei job), tempi per passo del job 360:

| passo | c7085118 (33:34) | d36f26cd (41:22) | 730697db | d2f77f37 (3 job) |
|---|---|---|---|---|
| foto | 1328 s | 1537 s | 1387 s | 731 s (job «360 foto», 13:21) |
| schieramenti (dentro foto fino a 730697db) | — | — | — | 637 s (job «360 schieramenti», 12:53) |
| offline + altezze | 9 + 76 s | 9 + 102 s | 9 + 104 s | 9 + 80 s (job «360 schieramenti») |
| bracci-rossi-grafica | 559 s | 790 s | 530 s | 398 s (job «360 bracci», 7:28) |

I minuti in più (33:34 → 41:22): foto +209 s, altezze +26 s, bracci rossi +231 s (bracci C201R01 e C201C01 e passi arrivati con 0.44.0).
Dentro foto a 360 (locale, Chrome 156, carico misto): giro e01-e03 392 s, schieramenti 800, apriTutte 279, ripartiTesto 106,
ripartenza 100, Annulla 16, tono 16. Ogni braccio delle altezze gioca e01 intera: 71–94 s, 11 bracci.

Cosa è cambiato (stesse verifiche, stesse soglie, nessun controllo tolto):
- `passi-grafica.mjs`: bracci rossi indipendenti, 5 insieme (`VALMORA_PARALLELI`), rossi passati come parametro a `giraOffline`,
  `giraEpilogo`, `giraC41` (prima `process.env.VALMORA_ROSSI` globale) e cartelle separate; passo foto: giro, epilogo e C41 insieme;
  nuovo passo `schieramenti` (prima dentro il giro foto).
- `foto-bozze.mjs` (apriTutte): episodi su 3 pagine; gli episodi che giocano una partita restano sulla pagina del giro; ogni
  pagina conta i suoi errori di console (e li aggiunge al giro).
- `catena.mjs`: `VALMORA_PASSI` sceglie un sottoinsieme dei passi (un passo estraneo ferma la catena); il giro lo registra in
  `passi_scelti`, così non passa per completo.
- `.github/workflows/catene.yml`: la 360 su tre job (foto / schieramenti, offline, altezze / bracci rossi); 375 e 412 interi.
  La CI ha 9 job invece di 7. IPOTESI (non misurata con un profilo): il runner è limitato dalla CPU (mappe WebGL disegnate in
  software), per questo più pagine nello stesso job rendevano poco (foto 1537 → 1387 s) e più job sì.

Bracci rossi: tutti visti rossi in CI (passo verde = nessun braccio cieco), locale verde due volte (1712 s e 1832 s di catena 360).

## C45-06 (D-203): rapporto che scorre a 360×760 — S-11, 20/10

Base: 0.45.0 (merge c1685a62). FATTO MISURATO con Chrome 156, 360×760: 742 rapporti costruiti col motore (tutti gli episodi,
strategie attenta, equilibrata, peggiore, casuale semi 1-4, variabili della partita attenta), aperti da salvataggio
(`rapporto_aperto`). Aperti sul rapporto: 740 (42 oltre i 5 s d'attesa, macchina carica; 1 si è fermato sulla scena del tono, 1 sul titolo:
non misurati). Prima: 7 scorrevano (e35 casuale4 o3 34 px, e30 casuale1 o3 32, e35 casuale1 o3 21, e22 casuale3 o2 11,
e36 peggiore o3 10, e36 casuale1 o3 7, e16 casuale1 o3 2). Dopo: 0 px in tutti quelli aperti.
Correzione (`stile-c18.css`, solo token, rosso `C203R01`): nel rapporto senza mappa la scheda, «A riposo», «Disponibili» e
«Prossima ondata» più vicini, margine sotto la pagina `--spazio-3`.
Guardiano: `tools/sonda-altezze.mjs` apre i 7 rapporti a 360×760 (soglia 0); col rosso C203R01 tornano 34/32/21/11/10/7/2 px
(visto); braccio rosso nella catena grafica. Foto: `c45/prima-360x760-rapporto-e35.png`, `c45/dopo-<w>x760-rapporto-e35.png`.
Non verificato: il caso esatto del collaudo (e31 o3 con le sue scelte, che il file del collaudo non registra come comandi).

## C45-05 (D-203): opzioni misurate per la chiamata d'imprevisto (NON applicate, sceglie la principale o il PO)

FATTO MISURATO, Chrome 156, 360×760: 594 chiamate di tutti gli episodi aperte da salvataggio sulla partita attenta (142
imprevisti, 452 normali); varianti applicate dalla sonda con un foglio di stile sulla sola chiamata d'imprevisto. Scorrimento px:

| variante | imprevisti max | mediana | media | cosa cambia |
|---|---|---|---|---|
| oggi | 545 | 466 | 464 | — (normali: max 664, mediana 271, media 287) |
| A vignetta nascosta | 488 | 412 | 414 | niente vignetta piccola nel fumetto dell'imprevisto (PO-089 la vuole in ogni chiamata) |
| B avviso tolto | 473 | 394 | 392 | niente riga magenta «Imprevisto: interrompe le chiamate» (D-190), resta «Urgente!» nel fumetto |
| C opzioni strette | 513 | 434 | 432 | padding e spazio fra le opzioni a 4 px (solo stile) |
| A+B+C | 384 | 308 | 310 | le tre insieme: mediana come le chiamate normali |

Peggiori in tutte le varianti: e06 `imp_corrente`, e13 `imp_sedie` (545 oggi). Foto: `c45/c4505/<variante>-360x760-e06-imp_corrente.png`.
Nota: oggi 545 px (e06, e13) supera di 1 px la soglia della chiamata a 360×760 (544), che il guardiano misura solo su e01; le
chiamate normali di altri episodi arrivano a 664. D-114 accetta lo scorrimento della chiamata: segnalo, non tocco la soglia.
A e B cambiano il prodotto (PO-089, D-190); C è solo spaziatura.

## D-206 + D-207 (C45-05): chiamata d'imprevisto più corta — S-11, 20/10

Base: ramo della principale fino a 701045f3 (merge 382bb11c). Scelta del PO A+B+C (D-206) più strette di solo stile (D-207,
la principale; «Rispondi ↓» resta). Correzione dichiarata: avevo scritto che A+B+C portava la mediana «come le normali»: 308 contro 271, ritirata.
- `Ondata.tsx`: nell'imprevisto niente vignetta nel fumetto e niente riga «Imprevisto: interrompe le chiamate» (rosso `C206I01`).
- `stile-c18.css` (solo token, stesso rosso): opzioni con `--spazio-1` di padding e spazio, effetti a `--spazio-px`, testo
  delle opzioni a `--linea-stretta`, fumetto dell'imprevisto a `--spazio-2`. Prove della sonda con 2 px: 346/291; coi token: 339/285.

FATTO MISURATO, Chrome 156, 360×760, tutte le 594 chiamate (142 imprevisti) aperte da salvataggio sulla partita attenta:

| | imprevisti max | imprevisti mediana | normali max / mediana |
|---|---|---|---|
| prima (rosso C206I01) | 545 (e06 imp_corrente, e13 imp_sedie) | 466 | 664 / 271 |
| A+B+C | 384 | 308 | 664 / 271 |
| A+B+C + D-207 (applicato) | 339 | 285 | 664 / 271 |

Guardiano (`tools/sonda-altezze.mjs`, a 360×760): imprevisti ≤ 339 e mediana ≤ 285 (valori misurati, D-207), soglia storica
544 invariata, normali ≤ 664 (massimo misurato, D-114). Verde sulle sei misure; col rosso C206I01: 5+ imprevisti oltre 339
(e01 imp_tram 489 px). Braccio rosso C206I01 nella catena grafica.
Foto: `c45/d206/prima` (rosso C206I01) e `c45/d206/dopo`, e01 imp_ambulanza, e17 imp_lampioni, e30 imp_mercatino a 360, 375, 412
(`tools/foto-imprevisti.mjs`, adeguato: controlla il fumetto dell'imprevisto; PRIMA=1 per le foto di prima).

## D-208 + D-210 (PO-140 fase 2, opzione 1 del PO): striscia della home nella città, vignetta della home nella guida — S-11, 20/10

- `Citta.tsx`: in testa la vignetta della home (96 px, `fissa`) con «La città · stasera si gioca» al posto della testata
  («S1 · Stagione 1 · mappa della città / Valmora»); il titolo resta per il lettore di schermo (`h1.solo-lettore`
  «Valmora · stagione N · mappa della città»). Rosso `C210C01`: la testata di prima. Sotto `--vignetta-finestra-min` (700 px,
  la stessa soglia delle vignette di sala e verbale) resta la testata di prima: a 360×640 la striscia faceva scorrere la città
  con 0 episodi di 21 px (scelta tecnica, dichiarata).
- `Guida.tsx`: al primo passo la vignetta della home con «La città e il gioco» al posto della vignetta del passo. Rosso `C210G01`.
- La mappa della città resta a 260 px. Correzione dichiarata: avevo proposto 252 px; in CI (run 39486684643, «360 foto») a 252
  i dischi degli episodi si coprivano per 255 px² a 360×760 (C17-12). Lo spazio viene invece da: sotto la striscia
  `--spazio-1`; con la striscia «Rileggi l'epilogo» e la scheda sopra a `--spazio-1`; margine sotto la pagina `--spazio-3`
  (era `--spazio-6`, come per la risposta in D-201).
- Altra correzione dichiarata: avevo stimato 0 px a 360 con 96 px di striscia e mappa a 252; la misura dava 11 px (e 4 con 0
  episodi, per la vignetta che si allungava: ora `fissa`).

FATTO MISURATO, Chrome 156, scorrimento px (`tools/sonda-altezze.mjs` e sonda della città con 0 episodi):

| | 360×760 | 375×760 | 412×760 | 360×640 |
|---|---|---|---|---|
| città, partita e01 | 0 | 0 | 0 | 0 (testata) |
| città, 36 episodi | 0 | 0 | 0 | — |
| guida, passo 1 | 0 | 0 | 0 | 0 |

Lettore di schermo (albero di accessibilità di Chromium, città a 360×760): «heading Valmora · stagione 3 · mappa della città
[level 1]», poi la figura, «Torna alla home», «Stagione 1», «Stagione 2», «Stagione 3 [pressed]»; dopo il tocco su Stagione 2
il titolo dice «stagione 2» e «Stagione 2 [pressed]». I tasti dicono la stagione anche senza la testata.
Guardiani: `tools/sonda-altezze.mjs` (a ogni 760: città36 con la striscia ≥ 96 px e senza scorrere; passo 1 della guida con la
vignetta della home e senza scorrere), bracci rossi C210C01 e C210G01 visti; nel giro foto PO-092 esclude la striscia fissa
e S-23 accetta al passo 1 la vignetta della home.
Foto: `home/d210/prima-*` (rossi) e `home/d210/dopo-*`, città con 0 e 36 episodi e guida, a 360, 375 e 412 × 760.
