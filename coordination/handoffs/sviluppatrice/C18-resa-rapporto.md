# C18 resa (C18-05/C17-15, C17-05, C17-12, C17-22, C18-07, C18-08, C18-09) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Commit b1570b0 e 8fc5282.

## Cosa ho cambiato, rosso e guardiano

| Voce | Correzione | Rosso | Guardiano |
|---|---|---|---|
| C18-05 / C17-15 | «Rispondi» dentro il fumetto della chiamata, sotto il mittente; una volta comparso resta, così il testo non salta scorrendo (`src/resa/schermate/Ondata.tsx`) | `__NO_C42R01`: fisso in basso, come prima | `controllaRispondi` (`tools/foto-c17.mjs`): a inizio pagina «Rispondi» non copre testi né comandi; dopo il tocco la prima opzione è intera |
| C17-05 | Settore coperto ma a tensione ≥ DEGENERA: «sotto controllo / ma ancora caldo», testo nero con la striscia del colore della tensione alta, niente verde, niente numeri (`statoSettore` in `src/resa/partita.ts`, `Rapporto.tsx`) | `__NO_C42C01`: solo «scoperto» o «sotto controllo» | `tests/rapporto-caldo.test.ts`: partite dei bot (peggiore e 20 semi casuali) su e01-e12 |
| C17-12 | Nome dell'episodio scelto nella città al posto che non copre altri dischi; vicino al bordo si sposta verso l'interno quanto basta (`disponiNomeCitta` in `src/resa/mappa/etichette.ts`) | `__NO_C42N01`: sempre sotto il disco | `controllaCitta`: area del nome sui dischi degli altri episodi = 0 |
| C17-22 | All'ultimo passo del verbale i pulsanti stanno sotto il testo, non fissi (`Passi.tsx` `data-ultimo`, `stile.css`) | `__NO_C42V01` (classe CSS) | `controllaVerbaleBasso` (`tools/foto-verbale.mjs`): verbale perso, ultimo passo a 667 px di altezza, nessun testo sotto i pulsanti |
| C18-07 | Aiuto dello schieramento sotto la riga del «?» e portato in vista sopra la barra «Conferma» | `__NO_C42A01`: sopra le unità | `tools/foto-schieramenti.mjs`: a 375×667, «?» aperto, unità, «?» e aiuto nella finestra e non sotto la barra |
| C18-08 | Nel verbale la sfida sta sulla riga delle stelle, a soli stemmi (il nome del club resta nell'etichetta dello stemma) | `__NO_C42S01`: sopra la vignetta | `controllaSfidaBusti`: la sfida non sta sopra la vignetta |
| C18-09 | Riga «Fiducia ±N» prima dei settori del rapporto | `__NO_C42F01`: in fondo | `controllaFiduciaRapporto`: a inizio pagina intera e non coperta dal pulsante fisso |

## Misure (FATTO MISURATO)

Comando: `VALMORA_LARGHEZZE=360 node tools/foto.mjs`; i rossi con `VALMORA_ROSSI=<id>`, uno per volta, sulla stessa build.

- Verde: 0 errori.
- Rosso C42R01: «Rispondi» copre il testo in 8 chiamate distinte (per esempio «palco»: copre «Il club presenta la…» e il commento del vice).
- Rosso C42N01: «il nome dell'episodio scelto copre altri dischi per 2070 px²» (città 360×760).
- Rosso C42V01: «verbale perso 360×667: pulsanti sopra In rete: la curva de…».
- Rosso C42F01: riga della fiducia fuori dalla finestra o coperta (10783 px²) in 9 rapporti di e01-e03.
- Rosso C42A01: «schieramento e01 375×667 col «?» aperto: fuori vista o sotto la barra squadre, steward, mediatore, aiuto».
- Rosso C42S01: «la sfida sta sopra i busti della vignetta per 13914 px²» in e01, e02, e03, e07; 9971 px² in e13 ed e25.
- C17-05, vitest: verde 3/3; nel campione ci sono 31 settori coperti a tensione ≥ 7; col rosso tutti e 31 tornano «sotto controllo» e il guardiano fallisce.
- Città a 360×760, misura con la sonda: prima della correzione il nome copriva altri dischi per 1996 px²; ora sopra il disco, spostato verso l'interno; 0 px² sui dischi degli altri.

## Scelte e limiti dichiarati

- **C18-08:** la prima prova metteva la sfida intera sotto la vignetta. La pagina del verbale saliva a 780-796 px, oltre 760 (PO-045). Ho tenuto la variante senza altezza in più: stemmi e «contro» accanto alle stelle, nomi dei club solo nell'etichetta accessibile dello stemma. Nel verbale quindi **non si leggono più i nomi dei club**, che restano in sala e in città. Se la principale o il PO preferiscono i nomi, serve spazio altrove.
- **C17-22:** i pulsanti finali del verbale non sono più fissi all'ultimo passo. Su uno schermo basso si raggiungono scorrendo; a 760 px la pagina sta nella finestra e il controllo C09-03 (pulsante principale visibile) resta verde.
- **C18-07:** l'aiuto aperto porta la pagina in giù quanto basta per mostrarlo sopra la barra. La mappa esce in parte dall'alto della finestra.
- **C18-05:** «Rispondi» appare solo se la prima opzione non è intera nella finestra; una volta comparso, resta nel fumetto di quella chiamata.
