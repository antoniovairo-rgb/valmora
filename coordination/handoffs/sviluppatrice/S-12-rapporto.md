# S-12 – Dettagli delle mappe (D-095) e tocco sulla città a 360×760 · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Dettagli delle mappe (D-095)

Il codice è in `src/resa/mappa/dettagli.ts`: dieci disegni dall'alto, inventati, senza insegne né scritte e senza persone ferite in vista.

| id | disegno |
|---|---|
| `banca` | palazzo di pietra con colonnato e furgone portavalori |
| `zona_rossa` | perimetro di transenne con due varchi presidiati |
| `palco_concerto` | palco, torri delle luci, prato con la folla |
| `piazza_storica` | lastricato, fontana, portici |
| `fabbrica` | capannoni con tetto a denti di sega, ciminiera spenta, cancello |
| `stabile_occupato` | palazzo con cortile e striscioni colorati |
| `incidente` | due auto di traverso, mezzi di soccorso, nastro, lampeggianti |
| `cantiere_stadio` | terra recintata, gru, materiale |
| `porto` | acqua, moli, container, gru |
| `mercato` | file di bancarelle con tende a strisce |

- **Posizione**:
  - con `id@settore` il disegno sta accanto al settore, spostato di 40 px verso il centro perché il punto non lo copra;
  - con `id` sta al centro della mappa;
  - resta sempre dentro la mappa, con 50 px di margine;
  - i tetti sotto il disegno non si disegnano.
- **Di notte** i dettagli vengono ridisegnati sopra il velo scuro al 60%, come illuminati; senza questo non si vedevano (foto di e11 ed e35).
- **Colori**: 23 token nuovi `--mappa-*` in token.css.
- Anche `cartelloni_stadio_nuovo@settore` ora viene riconosciuto.
- **Interruttore rosso** `__NO_C15D01`: nessun dettaglio disegnato.
- **Guardiano**:
  - lo strato Pixi scrive sulla mappa `data-dettagli` con ciò che ha disegnato davvero;
  - `tools/foto-bozze.mjs` lo confronta con i dettagli dei dati, su ogni missione aperta.
- **Dati di prova**: nessuna missione vera usa ancora i dettagli nuovi.
  - `tools/dati-dettagli.mjs` crea `out/dati-dettagli` con i dettagli di `tests/resa/dati-dettagli/dettagli.json` su e11, e17, e30, e35;
  - due id sono ancorati a un settore diverso da quello naturale, perché quel settore manca in quella missione.

## Difetto: stelline che bloccano il tocco sulla città (360×760)

- **Riproduzione** (FATTO MISURATO):
  - salvataggio di prova con tutti gli episodi superati, finestra 360×760, si apre ogni episodio dalla città;
  - le stelline sotto un episodio intercettano il tocco sul punto vicino. Esempio: quelle di e12 coprono e11;
  - lo si vede da quando la mappa della città si stringe per stare nello schermo (PO-052).
- **Correzione**: `.episodio .settore-unita { pointer-events: none; }`. La principale ha messo la stessa regola in 2459e64: dopo il merge resta la sua, più il mio interruttore rosso. Le stelline sono solo decorative; il loro numero resta nell'etichetta del punto.
- **Interruttore rosso** `__NO_C14T01` (regola CSS su `main.rosso-c14t01`).
- **Guardiano**: `tools/foto-bozze.mjs` ora apre i 36 episodi con la finestra a 360×760, invece di 360×800.

## Misure

| comando | campione | esito |
|---|---|---|
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-det` | dati veri, 36 episodi aperti a 360×760 | verde |
| `… VALMORA_ROSSI=C14T01 …` | 360×760 | ROSSO: almeno 10 episodi non si aprono (e03, e04, e07, e11, e15, e16, e19, e23, e27, e28: «locator.click: Timeout»); l'elenco è troncato a 10 righe |
| `VALMORA_LARGHEZZE=360 node tools/foto.mjs out/foto-det2 out/dist-dettagli out/dati-dettagli` | dati di prova con i 10 dettagli | verde |
| `… VALMORA_ROSSI=C15D01 …` stessi dati di prova | 360 px | ROSSO: e11, e17, e30 senza dettagli; e35 solo con i cartelloni (che stanno in notte.ts) |
| `node tools/catena.mjs completa` | commit 767e7a5 (merge della principale 2459e64), 3 giri | 3 su 3 VERDI, nessun passo ritentato |

Foto in `docs/foto/s12/2026-10-11/`: mappe di e11, e17, e30, e35 con i dettagli di prova, a 360 px.

Limite visto nelle foto: a 360 px la mappa è piccola e i nomi dei settori coprono in parte i dettagli. Ad esempio, banca e porto di e35 nella prova sono tutti e due sotto «Perimetro della banca».
