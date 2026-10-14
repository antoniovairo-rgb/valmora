# D-112 punto 5 (PO-089, «fumetti scena per scena») – vignetta di ogni chiamata con l'evento · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Insieme a strati confermato dalla principale: 10 luoghi, 5 «chi chiama», 7 sagome di evento.

## Misura prima del lavoro (FATTO MISURATO, sonda sulle chiamate dei 36 episodi)

| Voce | Numero |
|---|---|
| chiamate | 498 |
| fonti distinte | 32 |
| tipi di settore | 16 (40 chiamate senza settore) |
| tipi di evento sul settore nell'ondata | 25 (83 chiamate senza evento) |
| fonte × tipo di settore | 106 combinazioni |
| luogo × chi (vignetta di PO-089 A) | 44 |
| luogo × chi × gruppo di evento | 112 |

Chiamate per gruppo di evento:

| Gruppo | Chiamate |
|---|---|
| gente | 157 |
| tifo | 117 |
| corteo | 87 |
| veicoli | 17 |
| scontro | 16 |
| biglietti | 15 |
| fumo | 6 |
| nessuno | 83 |

## Cosa ho fatto

- `src/resa/vignette-evento.tsx`, nuovo modulo:
  - `gruppoEvento(m, c)` trova il gruppo degli eventi dei dati sul settore della chiamata, nell'ondata della chiamata. Se sono più d'uno vince il più grave: scontro > fumo > corteo > tifo > veicoli > biglietti > gente;
  - `SagomaEvento` disegna la sagoma in primo piano, solo con forme SVG e classi `v-*` (token).
- Le 7 sagome:
  1. **gente:** fila di omini;
  2. **tifo:** omini a braccia alzate e sciarpa coi colori del club del settore;
  3. **corteo:** striscione su due aste, senza scritte;
  4. **veicoli:** furgone;
  5. **scontro:** SOLO fuori campo, nuvola di polvere e fumetto col «!», senza gesti, armi né sangue;
  6. **biglietti:** sportello con coda;
  7. **fumo:** colonna di fumo.
- Senza evento (o senza settore) la vignetta resta com'era.
- `vignette-chiamata.tsx`: la sagoma sta fra lo sfondo e il riquadro di chi chiama. La vignetta espone `data-evento`, e il titolo accessibile nomina l'evento.
- **Rosso `__NO_C45E01`:** nessuna sagoma, come prima.

## Difetto trovato e corretto: colori del club invisibili nella vignetta (PO-089)

- FATTO, dal codice: la regola `.vignetta .v-linea { stroke: var(--nero); stroke-width: var(--bordo-fine) }` (`stile.css:274`) vince sugli attributi `stroke` e `strokeWidth`.
- Per questo le gradinate della curva nella vignetta della chiamata non hanno mai mostrato i colori del club, e lo stesso valeva per la sciarpa nuova. Nelle foto «prima» le gradinate sono grigie e nere.
- Correzione: classe `.v-club`, senza colore del tratto (`stile-c18.css`). Nelle foto «dopo» le gradinate di e01 sono arancio Cinderwick.
- **Rosso `__NO_C45E02`:** di nuovo `.v-linea`.

## Guardiano

`controllaVignettaEvento` (`tools/foto-c17.mjs`) gira su ogni chiamata del giro foto. Controlla due cose:
- che `data-evento` sia uguale al gruppo dedotto dai dati, ricalcolato in modo indipendente nel guardiano;
- che i tratti col colore del club abbiano davvero quel colore calcolato.

## Misure

- **Nessuno scorrimento in più** (sonda delle foto, prima e dopo): l'altezza della pagina è identica in tutte le 12 schermate (e01 ed e07, ondate 1 e 2, a 360, 375 e 412). Per esempio e01 ondata 1 a 360: 1258 px prima e dopo. La vignetta non cambia misura.
- **Giro foto** (`VALMORA_LARGHEZZE=360 node tools/foto.mjs`): vedi la sezione «Esito dei giri» qui sotto.

## Foto

In `d112-vignette/`, `prima-*` (rosso C45E01, codice di prima) e `dopo-*`:
- prima chiamata delle ondate 1 e 2 di e01 ed e07, a 360, 375 e 412, pagina intera;
- ritaglio della vignetta a 412.

Eventi: e01 ondata 1 corteo, e01 ondata 2 tifo, e07 ondata 1 gente, e07 ondata 2 tifo.

## Esito dei giri (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori.
- Rosso C45E01: 82 righe «la vignetta mostra «nessuno», i dati dicono …». Esempi: «ufficio_insiste» gente, «sciarpe» corteo, «pullman» gente.
- Rosso C45E02: 27 righe «N tratti col colore del club ridipinti da un'altra regola». Esempi: «striscione» 4, «fumogeni» 5, «capo_curva» 5.
