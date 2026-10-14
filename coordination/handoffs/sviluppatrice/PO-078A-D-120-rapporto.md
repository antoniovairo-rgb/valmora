# PO-078 A (D-118, vignetta della fonte nel briefing) e D-120 (spicchio d'orologio, PO-085) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`.

## PO-078 A – vignetta della fonte al posto dell'avatar nel briefing (D-118)

**Misura che ritiro.** Avevo proposto «78×44 px, zero altezza in più» guardando solo l'altezza dell'avatar. È sbagliata: una vignetta più larga dell'avatar stringe la colonna del nome e i nomi lunghi vanno a capo.
- FATTO MISURATO (sonda sul fondo di main, 36 episodi, 108 passi a 360×760, confronto col rosso):
  - larga 75 o 56 px: 12 passi su 108 crescono di 19 px (per esempio e13 passo 2 «Gianni Lavezzari, sicurezza del Cinderwick United», da 2 a 3 righe), e 5 passi scorrono;
  - quadrata 42×42 (impronta dell'avatar): **0 passi su 108** crescono.

**Fatto:**
- `Mittente` accetta una `figura` al posto dell'avatar.
- Il briefing passa la vignetta della fonte (`VignettaChiamata`): 42×42 px, inquadrata sul lato di chi parla (`preserveAspectRatio="xMaxYMid slice"`), con la curva o la strada del settore.
- **Rosso `__NO_C51A01`:** l'avatar di prima.
- **Guardiano** (in `controllaRiempi`, ogni schermata del giro foto): nel briefing la fonte visibile ha la vignetta di 42×42 px (±1).
- Il guardiano PO-092 «vignetta che riempie lo spazio» esclude le vignette fisse per scelta: quella della chiamata (PO-089 A) e quella della fonte (D-118).

## D-120 (PO-085) – spicchio d'orologio che si svuota

**Fatto:** cerchio magenta su bianco col bordo nero, che si svuota in 8 s e ricomincia (provino B); con movimento ridotto resta fermo a metà. Solo grafica, nessun tempo limite.

**Misura e posto:**
- accanto al timbro «Urgente!» mandava a capo il nome in **109 chiamate su 142** (prima chiamata di ogni ondata, 360×760), fino a +37 px;
- sull'angolo destro del fumetto copriva «Urgente!» in 13 chiamate;
- ora è un **bollino sull'angolo in alto a sinistra dell'avatar** (fuori dalla riga): **0/142** chiamate più alte e nessun testo o comando coperto.

**Rosso `__NO_C51O01`:** niente orologio.

**Guardiano** (in `controllaRiempi`): in ogni chiamata lo spicchio c'è, sta nella finestra e non copre testi né comandi.

## Esito dei giri (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori.
- Rosso C51A01: 14 righe «fonte del briefing senza vignetta».
- Rosso C51O01: 41 righe «spicchio d'orologio assente».

## Foto

In `po078-d120/`, `prima-*` (rossi) e `dopo-*`:
- briefing di e01 ed e07, ogni passo, a 360, 375 e 412;
- chiamata e01 «pullman» a 360, 375 e 412 (la sonda non ha raggiunto e07 «benvenuto7» col giocatore equilibrato).

## Collegamento con C22-01 / C22-09

Il riquadro di chi chiama dentro la vignetta va sostituito da un'icona HTML leggibile (prossimo lavoro). Nel briefing, a 42×42, la vignetta mostrerà il luogo; chi parla resta nel nome sopra il testo.
