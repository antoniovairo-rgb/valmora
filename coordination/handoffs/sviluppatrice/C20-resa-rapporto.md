# C-020 resa (C20-04, C20-03, C20-06, C20-07, e C20-08 trovato qui) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`.

## C20-04 – aiuto «?» sotto la barra a 360×760

- **Guardiano prima della correzione.** Il controllo C18-07 (`tools/foto-schieramenti.mjs`) girava solo a 375×667 su un episodio. Ora gira su e01 ed e06, ondata 1, a 375×667 e a 360×760.
  - Sul codice di prima scatta in 2 casi su 2 a 360: «aiuto» sotto la barra in e01 ed e06.
  - Col rosso C42A01 vede anche il difetto originale di C18-07: a 375 «squadre, steward, mediatore, aiuto» fuori vista o sotto la barra, in e01 ed e06.
  - La cecità segnalata dalla collaudatrice riguarda la sua sonda c20-grafica, non questo guardiano.
- **Correzione** (`Schieramento.tsx`): dopo `scrollIntoView`, se il riquadro resta sotto la barra fissa, la pagina scorre quanto serve, più lo stacco di `--spazio-2`.
- **Rosso `__NO_C44A01`:** solo `scrollIntoView`, come prima.
- **Misure** (runner del solo controllaSchieramenti): verde 0; rosso C44A01: 2 casi (e01 ed e06 a 360×760).

## C20-06 – zona di tocco della «i»

- L'`::after` partiva dal riquadro interno: 32 − 2 × 3 di bordo = 26 px, più 2 × 6 px = 38 px.
- Ora sottrae anche il bordo: `inset: calc(var(--spazio-3) / -2 - var(--bordo))`, cioè 26 + 2 × 9 = 44 px.
- **Rosso `__NO_C44I02`:** 38 px (classe CSS).
- **Guardiano** nel blocco PO-101 di `foto-schieramenti.mjs`: 8 punti a ±21 px dal centro devono colpire la «i». Verde 0; rosso 8 punti su 8 fuori, a 360, 375 e 412.

## C20-03 – nome dell'episodio scelto nella città, episodi conclusi

- **Correzione** (`disponiNomeCitta`, `src/resa/mappa/etichette.ts`). Oltre agli 8 posti, prova:
  - spostamenti a griglia (passo 1/8 di disco, fino a 1 disco);
  - tre larghezze più strette del nome (80%, 65% e 50% di `--nome-max`; il nome va a capo).
- Vince il posto col costo minimo. I dischi pesano 10 volte le stelline; a parità vince lo spostamento minore.
- **Rosso `__NO_C44N01`:** solo gli 8 posti.
- **Misura con la sonda della collaudatrice** (`coordination/sonde/c20-citta.mjs`, dischi e stelline):

  | Larghezza | Prima (C-020) | Dopo |
  |---|---|---|
  | 360 | 15/36, max 1451 px² | 2/36, max 49 px² |
  | 375 | 13/36, max 1304 px² | 2/36, max 27 px² |
  | 412 | 0 | 0 |

  Rosso C42N01: 29/36, 29/36 e 18/36 (come nel C-020).
- **Restano** e05 «Sciopero degli steward» ed e06 «Due eventi, una città» a 360 e 375. Coprono qualche px² di **stelline** e gli angoli del riquadro dei dischi di e01, e09, e05 ed e07. Il **cerchio** dei dischi non è toccato in nessun caso.
  - FATTO MISURATO: con la sola sovrapposizione col riquadro dei dischi, e05 tocca 6 px² a 360 e 4 px² a 375, solo negli angoli.
  - IPOTESI: a 360/375 la griglia della città (dischi da 44 px, file di stelline, nome di 3-5 righe) non lascia nessun posto libero entro un disco per questi due nomi.
- **Guardiano nuovo** `controllaNomiCittaTutti` (`tools/foto-c17.mjs`, chiamato da `apriTutte` a 360). Usa un salvataggio con tutti gli episodi conclusi e sceglie a turno ogni episodio di ogni stagione. Controlla che il nome non tocchi il cerchio di nessun altro disco. Le stelline sono decorazione e non ricevono tocchi.
  - Verde: 0.
  - Rosso C44N01: 9 casi (e05, e06, e07, e08, e18, e19, e30, e31, e32).
- **Proposta, non fatta.** Per arrivare a zero anche sulle stelline: a 360/375 non mostrare il nome sulla mappa, perché la scheda sotto la mappa mostra già il titolo in grande, e lasciare solo l'anello sul disco scelto. Tocca PO-044 (il nome sull'episodio scelto): la decisione è vostra.

## C20-07 – segni della conseguenza (PO-085)

- **Niente segno se lo stato non cambia.** `segniDi(c, o, prima, dopo)` salta tensione e riserva rimaste uguali (già a 0 o a 10, oppure riserva al tetto). La pressione cambia sempre. Rosso `__NO_C44E01`.
- **Chiamate senza settore.** Il segno delle squadre compare al centro in basso della mappa (`.segni-effetto.centrale`, settore «»), dove parte il volo dalla centrale. Rosso `__NO_C44E02`.
- **Andata e ritorno distinti.** «+⚑» per le squadre in arrivo, «−⚑» per quelle richiamate (`simboloSegno`). Rosso `__NO_C44E03`.
- **Segni fuori dalla finestra.** Se la mappa è scorsa via quando si mostrano i segni, torna in vista (`mostraSegni` in `App.tsx`; niente animazione con movimento ridotto). Rosso `__NO_C44E04`.
- **Non toccato:** e02 «Presidio nel quartiere» con l'icona «Curva Larkspire». Dipende dai dati: l'effetto è su curva_larkspire.
- **Guardiani:**
  - `tests/segni-cambio.test.ts`, partite dei bot su e01-e12 (peggiore, attenta, 20 semi casuali). FATTO MISURATO:
    - 18 effetti di tensione su uno stato fermo (nessuna riserva al tetto in questo campione): verde 0 segni; rosso C44E01 18 segni;
    - 22 riserve cambiate in chiamate senza settore: verde 22 segni; rosso C44E02 22 senza segno;
    - simboli: verde diversi, rosso C44E03 uguali.
  - `controllaSegni` (`tools/foto-c17.mjs`) nel giro foto:
    - legge lo stato prima e dopo dal salvataggio e vuole i segni solo sugli effetti che cambiano;
    - controlla il simbolo delle squadre;
    - controlla che ogni segno stia nella finestra.
  - Misure a 360:
    - verde 0;
    - rosso C44E01: «devia» segna curva_larkspire, che non cambia;
    - rosso C44E02: «chiedi» e «prima_ospiti» senza «−⚑» / «+⚑»;
    - rosso C44E03: «⚑» invece di «+⚑» o «−⚑» in 4 risposte.
  - Misure a 375 (`VALMORA_LARGHEZZE=375`):
    - verde 0;
    - rosso C44E04: segni fuori dalla finestra in 5 risposte («accetta», «chiudi_occhio», «ferma», «lascia_fumo», «prima_ospiti»).

## C20-08 (trovato qui) – sfida «Calderholt contro Calderholt contro Larkspire»

- Con i club aggiunti alle strade per PO-102 (ab36fbc), la sfida elencava ogni settore con un club.
  - e02: «Calderholt Rovers contro Calderholt Rovers contro Larkspire Athletic».
  - Dal codice (non fotografato): e04, senza partita, avrebbe mostrato una sfida fra Cinderwick e Calderholt (le sue due strade).
  - Dal codice (non fotografato): e11 avrebbe mostrato lo stemma di un solo club.
  - Due sale del giro foto salivano a 792 px a 360×760 (PO-045).
- **Correzione** (`stemma.tsx`): la sfida usa solo i club delle **curve**, ognuno una volta.
- **Rosso `__NO_C44S03`:** tutti i settori, come prima.
- **Guardiano:** `controllaSfida` (`foto-club.mjs`) ora vuole i club delle curve una volta sola (D-086: «club della curva»). Prima contava ogni settore con un club, quindi i doppioni sarebbero passati.
- **Misure a 360:**
  - verde 0;
  - rosso C44S03: «sala 1/3: 792 px di pagina» (2 volte), stemmi doppi in e07 sala e verbale e in e03 verbale.
