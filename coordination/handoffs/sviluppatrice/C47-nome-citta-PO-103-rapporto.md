# Strumento instabile del nome in città (C47) e PO-103 (persone a pallini) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`.

## 1. Strumento instabile: nome dell'episodio in città sul bordo (CI della principale, 412)

**Segnalazione.** Lo stesso commit d597e3c era VERDE sul ramo della sviluppatrice (run 38496368215) e ROSSO sulla principale (run 38498176323, 3 tentativi su 3). Messaggio: «412px: citta: nome «Il mercato del sabato» tocca il bordo della mappa» (`tools/foto.mjs:126`, margine 5 px).

**Misura** (sonda `bordo.mjs`: salvataggio con e01-e03 conclusi, e04 scelto, 412×800, ricarica a ogni giro, lettura a 0, 300 e 1500 ms), FATTO MISURATO:
- a 0 ms il nome di e04 è largo 90,4-91 px, senza larghezza ridotta, a **3,25-3,40 px dal bordo destro**: tocca il bordo;
- a 300 e 1500 ms è largo 72 px (80% di `--nome-max`), a 21,2 px dal bordo, in tutti i giri (anche con la CPU rallentata 4×, 6 giri).
- Quindi il posto finale dipende da quando e su cosa viene calcolato.

**Sorgenti trovate:**
1. `disponiNomeCitta` misurava con `getBoundingClientRect`, che include le trasformazioni. Se gira mentre la scena entra con l'animazione (scala in corso), sceglie posto, spostamento e larghezza su misure in scala. Poi non si rifà: il ResizeObserver della mappa non vede le trasformazioni e `fonts.ready` è già risolto.
   - IPOTESI sul rosso in CI: lì la città arriva dal verbale (caratteri già caricati) e il calcolo resta quello fatto durante l'animazione. Non posso confermarlo sulla macchina della CI.
2. Se il carattere del nome arriva dopo il calcolo, il nome cambia misura. `fonts.ready` può essersi già risolto prima che quel carattere inizi a caricarsi, e il calcolo non si rifà.

**Correzione:**
- `src/resa/mappa/etichette.ts`: si lavora in **coordinate di impaginazione**, cioè rettangoli relativi alla mappa divisi per la scala attuale (`larghezza a schermo / offsetWidth`), con mezzo pixel in più di margine contro gli arrotondamenti. Rosso `__NO_C47N01`: misure trasformate, come prima.
- `src/resa/mappa/MappaCitta.tsx`: il calcolo si rifà a ogni `loadingdone` dei caratteri e quando cambia la misura del nome scelto (ResizeObserver sul nome). Rosso `__NO_C47N02`.

**Guardiani deterministici** (in `controllaNomiCittaTutti`, `tools/foto-c17.mjs`), tutti gli episodi della stagione mostrata:
- il nome scelto con la pagina in scala 0,85 deve avere lo stesso posto, spostamento (entro 1 px) e larghezza che senza scala;
- dopo un cambio di misura del nome (spaziatura allargata) il posto deve essere quello di un calcolo da capo.

**Misure** (`VALMORA_LARGHEZZE=360 node tools/foto.mjs`):
- verde 0;
- rosso C47N01: posto diverso in 5 casi (e27, e29, e30, e31, e32; per esempio e32 «sotto», −44,0/44,0 → −37,4/37,4);
- rosso C47N02: posto non rifatto in 3 casi (e29, e30, e33).

**Legame con C20-03.** Stessa funzione: il residuo di e05 ed e06 a 360/375 (stelline e angoli dei dischi, nessun cerchio toccato) resta com'era. La proposta di non mostrare il nome a 360/375 è dal PO.

## 2. PO-103 – persone a pallini piatti nelle vignette delle chiamate

Il PO: «le sagome sembrano insetti, meglio solo i pallini 2D».

- **Correzione** (`src/resa/vignette-evento.tsx`): ogni persona delle sagome (gente, tifo, corteo, biglietti) è un pallino piatto, come la folla dello sfondo della strada. Nel tifo un pallino su due ha il colore del club.
- Restano lo striscione, la sciarpa coi colori del club e gli elementi che non sono persone: furgone, sportello, fumo, nuvola col «!».
- **Rosso `__NO_C48P01`:** gli omini di prima.
- **Guardiano** (`controllaVignettaEvento`, adattato senza abbassarlo): oltre a `data-evento` e ai colori del club, nella vignetta 0 omini (`data-figura="omino"`); i gruppi con persone devono avere almeno un pallino (`data-figura="pallino"`).
- **Foto** in `po103/`: `prima-*` (rosso C48P01) e `dopo-*`, prima chiamata delle ondate 1 e 2 di e01 ed e07, a 360/375/412, pagina intera; ritaglio della vignetta a 412.
- **Misure:** vedi «Esito dei giri».

## Esito dei giri (FATTO MISURATO, `VALMORA_LARGHEZZE=360 node tools/foto.mjs`)

- Verde: 0 errori.
- Rosso C48P01: 77 righe. Esempi: «ufficio_insiste» 7 omini e 0 pallini (gente), «troupe» 7 omini (gente), «sciarpe» 4 omini (corteo).
- Rossi C47N01 e C47N02: vedi sopra (5 e 3 casi).
