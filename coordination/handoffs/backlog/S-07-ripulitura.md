# S-07 – Ripulitura del backlog (PO-127) · rapporto

Ramo `claude/valmora-backlog-pulito`, partito da `claude/valmora-l1-setup-schema-xdrbx7` (2314252). Toccata solo la colonna «stato e prova» di docs/governo/BACKLOG.md (più governo.html e STABILITA.json rigenerati dalla catena). Voci PO-110…PO-127 non toccate.

## Conteggi (FATTO MISURATO, script sulle righe `| PO-` del backlog, colonna 5)

| | prima (2314252) | dopo |
|---|---|---|
| voci totali | 126 | 126 |
| aperte (non FATTO/REVOCATA/DOPPIONE) | 48 | 27 |
| aperte di L1 rilette (PO-009…PO-106) | 35 | 14 |
| chiuse | 78 | 99 |

21 voci passate a FATTO, 0 a REVOCATA; 8 voci aperte riscritte con «resta: …» più preciso; 6 invariate.

Fonti delle prove: commenti di GAME_VERSION in src/versione.ts (registro di ogni release 0.1.0…0.38.0), docs/governo/DECISIONI.md, docs/governo/COLLAUDI.md, docs/governo/ROADMAP.md (registro 0.30.0…0.38.0), coordination/BOARD.md e il codice citato con file:riga. docs/RELEASE_HISTORY.md non serve: dice «Nessuna release».

## Voce per voce

| voce | prima | dopo | prova / cosa resta |
|---|---|---|---|
| PO-009 | PARZIALE | PARZIALE | (invariata) PARZIALE – primo questionario risposto (D-016…D-019), secondo e terzo questionario risposti (D-021…D-039), scritto in docs/BIBBIA.md; indice della triade approvato (D-068…D-070), e01 v2 scritta; resta l'approvazione di e01 giocata dal PO |
| PO-017 | PARZIALE | PARZIALE | PARZIALE – resa di e01 con salvataggio e ripresa e APK di debug dalla CI fatti (0.1.0, run 38111969997); resta: prova dell'APK sul telefono del PO, fissata a fine lotto «tutto il backlog» con 10 controlli (D-134) |
| PO-020 | IN | IN | IN CODA – principale e PO: prova sul telefono Android vero a fine lotto «tutto il backlog» (D-047, D-134); file verificato integro lato server (curl 2026-10-11 08:57 UTC: 200, application/vnd.android.package-archive, 4.207.819 B); IPOTESI: blocco lato telefono |
| PO-022 | PARZIALE | PARZIALE | PARZIALE – fatto: tensione che passa fra le ondate, unità a riposo e avviso unità finite (0.4.0), fiducia che sale e scende col risultato (0.11.0, D-113), scelte che cambiano il seguito (0.12.0, campo «dopo»), riga «i» con informazioni nuove a ogni ondata (0.15.0, PO-101) (prova: src/versione.ts:21-23, :73-76, :81-82, :105); resta: eventi in tempo reale, rinviati «dopo» da D-048 e non presenti in nessuna release |
| PO-023 | PARZIALE | FATTO | FATTO – sala, briefing e verbale a scene una alla volta (Passi.tsx, S-10, 0.5.0 PO-045), il vice che presenta la giornata (src/resa/schermate/Sala.tsx:17), schieramento toccando la mappa (0.9.0 S-24) (prova: src/versione.ts:29, :60) |
| PO-024 | PARZIALE | FATTO | FATTO – fonti del briefing legate al settore (campo briefing.settore, P-02; src/resa/schermate/Briefing.tsx:19), informazioni durante la missione con la riga «i» di ogni ondata (0.15.0 PO-101, guardiano tests/ondata-info.test.ts), e01 a 3 ondate × 4-5 chiamate (D-053) (prova: src/versione.ts:105-110) |
| PO-025 | IN | PARZIALE | PARZIALE – resa scura «sala operativa» superata dallo stile C graphic novel (D-066, approvato D-077, su main c1333cb); testi riscritti e brevi con voci proprie (vice, «il Fabbro» D-102; 0.6.0, src/versione.ts:36-37); resta: giudizio del PO su voci e ironia, che avviene episodio per episodio nella rifinitura PO-039 (D-135; e04–e09 fatti, D-137 «tono di Malvasi invariato») |
| PO-027 | IN | FATTO | FATTO – sessioni parallele attive e coordinate dalla principale: lavagna coordination/BOARD.md (17/10: S-01…S-06 su rami propri), collaudatrici C-002…C-037 (docs/governo/COLLAUDI.md), routine oraria (D-057, D-058) |
| PO-029 | PARZIALE | FATTO | FATTO – logica in src/logica/episodi.ts (0.3.0); resa: città degli episodi con stelle e «Rigioca» con triplice conferma (src/resa/schermate/Citta.tsx:27, :57), verbale con stelle e «Rigioca» (S-10, 0.5.0), registro degli episodi nel salvataggio (src/salvataggi/salvataggio.ts:29) (prova: src/versione.ts:29-32) |
| PO-030 | PARZIALE | FATTO | FATTO – stile C graphic novel (D-066) integrato e approvato dal PO (D-077); R01-R07 corretti e collaudati (C-06, COLLAUDI C-007), pubblicato su main c1333cb il 2026-10-11; primo rilascio numerato 0.2.0 (src/versione.ts:8) |
| PO-035 | PARZIALE | PARZIALE | PARZIALE – e03 «Notte di coppa» giocabile con quartiere e transenne fisse sulla mappa (0.3.0, src/versione.ts:14-19, guardiani tests/transenne.test.ts, tools/fisse.mjs); resta: giudizio del PO sui testi di e03 (la rifinitura di D-135 è partita da e04) |
| PO-039 | PARZIALE | PARZIALE | (invariata) PARZIALE – rifinitura col PO a 3 episodi al giorno (D-135): e04–e06 (D-137, nessuna modifica), e07–e09 (D-138: rigori in e08, presidente tolto da e07/e08); prossimi e10, e11, e12 |
| PO-040 | PARZIALE | FATTO | FATTO – colori e stemmi dei club nella resa (0.5.0, src/versione.ts:30 «PO-038/040»), poi 12 stemmi nuovi (0.20.0) e simboli rifatti (0.25.0, D-128, rosso C83S01) |
| PO-041 | PARZIALE | PARZIALE | PARZIALE – sette abbozzi integrati nei 36 episodi consolidati (0.4.0 e 0.6.0, src/versione.ts:24, :36); e09 rifinito col PO (D-138); resta: rifinitura col PO di e13, e17, e21, e25, e30, e35 dentro PO-039 (D-135) |
| PO-042 | PARZIALE | FATTO | FATTO – D-092: e04, e07, e13, e21, e25, e28, e31 trasformati in episodi di città nel consolidamento (0.6.0, src/versione.ts:36-38 «ritmo città/stadio»); guardiano controllaRitmo nel passo «storia» della catena logica con braccio cieco controllato (tools/passi-logica.mjs:12, :61, :80); riserva in docs/RISERVA_EVENTI.md |
| PO-049 | PARZIALE | PARZIALE | PARZIALE – installabile e offline dal browser, APK servito dal sito (0.4.0, src/versione.ts:21-26), spiegazione dell'installazione su Android e nei browser interni (0.9.0, PO-082); resta: prova sul telefono del PO a fine lotto (D-134) |
| PO-051 | PARZIALE | FATTO | FATTO – rilascio 0.4.0 di giorno in deroga a D-093, completa 3/3 sulla build del rilascio (src/versione.ts:21-27) |
| PO-052 | PARZIALE | PARZIALE | (invariata) PARZIALE – città: la mappa si stringe in base all'altezza dello schermo (token --citta-riserva/--citta-larghezza-min); eccedenza misurata prima → dopo: 360×640 256→106, 360×760 136→0, 412×830 131→0, 412×915 46→0. Le altre schermate: sviluppatrice (S-10, con controllo in foto.mjs) |
| PO-053 | PARZIALE | PARZIALE | (invariata) PARZIALE – revisione misurata di 12 tipi di schermata a 360×760 e 412×830 (docs/revisioni/REVISIONE_SCHERMATE_2026-10-11.md): orizzontale/caratteri/tocchi/tagli a posto; scorrimento su 8 schermate, pulsante fisso sopra il testo, nomi impilati in e01, home a 360. Correzioni assegnate alla sviluppatrice dentro S-10; revisione da ripetere dopo |
| PO-054 | PARZIALE | FATTO | FATTO – «Annulla l'ultima» (C17C02) e ritiro di una sola unità (0.17.0, src/resa/App.tsx:237, rosso C46R01); collaudo C-023: «PO-054 48/48» (prova: src/versione.ts:118-123, COLLAUDI C-023) |
| PO-055 | IN | FATTO | FATTO – D-101: battute, chiamate e risposte ≤ 140 caratteri, introduzione di 2 battute (0.6.0); fonti ≤ 80 e chiamate ≤ 100 in e01–e36 (0.14.0 e 0.26.0) (prova: src/versione.ts:36, :97, :184; guardiano tests/brevita.test.ts) |
| PO-056 | IN | FATTO | FATTO – guida «La città e il gioco» a passi: Valmora, chi sei e come sei arrivato all'incarico, cosa gestisci, come si gioca, il verdetto (data/testi/it/comune.json:95-108, src/resa/schermate/Guida.tsx; 0.5.0 PO-063/065, guida alla prima partita 0.8.0 S-18) (prova: src/versione.ts:31, :52) |
| PO-058 | PARZIALE | PARZIALE | (invariata) PARZIALE – wizard S-10 (passi ≤ 760 px a 360); resto e mappa dimensionata sull'uso: sviluppatrice, misura con coordination/sonde/rev-schermate.mjs |
| PO-059 | IN | FATTO | FATTO – protagonista e vice con espressione dalla tensione nel rapporto di fine ondata e festa nel verbale, uomo e donna (0.33.0, D-133, commit f0d6257; src/resa/schermate/Rapporto.tsx:37, rosso C96P01; guardiano tests/espressioni.test.ts) (prova: src/versione.ts:226-232, ROADMAP registro 0.33.0 57229a4) |
| PO-060 | IN | FATTO | FATTO – ripartenza dall'ondata persa nella logica (0.5.0) e «Riparti dall'ondata N» a schermo (0.8.0, S-17), solo da un'ondata da cui si può vincere (0.9.0, PO-083) (prova: src/versione.ts:32, :53, :61; guardiani tests/ripartenza.test.ts, tests/ripartenza-po083.test.ts) |
| PO-062 | IN | FATTO | FATTO – D-096: vignetta d'apertura disegnata dai dati della missione (ora, dettagli, curve e club) nel passo «Stasera» della sala (src/resa/vignette-gioco.tsx:41-46, src/resa/schermate/Sala.tsx:21) e breve racconto del vice dal campo «introduzione» (Sala.tsx:17); vignette in sala 0.9.0 (S-23), stile pop retinato 0.13.0 (D-114) |
| PO-067 | PARZIALE | FATTO | FATTO – «fiducia» al posto di «credito» con validatore (0.5.0, D-097) e barra della fiducia sempre visibile (0.7.0, S-19; guardiano controllaFiducia) (prova: src/versione.ts:31, :44, :49) |
| PO-070 | PARZIALE | FATTO | FATTO – collaudi continui da sessioni collaudatrici su logica, usabilità, realismo e regressioni: C-014…C-037 (docs/governo/COLLAUDI.md), un collaudo approfondito dopo ogni rilascio (D-121) con partita da giocatore (PO-120) |
| PO-078 | PARZIALE | FATTO | FATTO – vignette in guida, sala, verbale e chiamate (0.9.0 S-23, 0.13.0 D-114, rosso C26V01) e nel rapporto d'ondata con le espressioni (0.33.0, src/resa/schermate/Rapporto.tsx:37); briefing: vignetta 42×42 uscita nella 0.18.0 e poi tolta per scelta del PO (D-126 b, illeggibile; src/resa/schermate/Briefing.tsx:17); schieramento e città senza vignetta (D-118) |
| PO-081 | PARZIALE | PARZIALE | (invariata) PARZIALE – ricognizione 14/10: ridisegno a visibilità e a contesto ripristinato (ridisegno.ts:5-13), rossi C31W01/C31W02; il difetto non si riproduce in headless, serve la prova del PO sul telefono |
| PO-086 | PARZIALE | PARZIALE | PARZIALE – campo «dopo» e casi corretti (0.12.0, 0.14.0, 0.15.0), dati coerenti con le scelte (0.35.0, 0.36.0; guardiani tests/dopo-scelte.test.ts, tests/c34-dati.test.ts) (prova: src/versione.ts:81-88, :240-250); resta: scansione di tutti i 36 episodi con guardiano (D-153), sessione S-03 in corso (coordination/BOARD.md) |
| PO-089 | PARZIALE | FATTO | FATTO – corteo e folla dove parla la chiamata, squadre in movimento, vignetta nella chiamata (0.11.0, parte A, src/versione.ts:74-75); stile delle vignette e scorrimento decisi dal PO (D-114) e usciti nella 0.13.0 (src/versione.ts:90-95) |
| PO-090 | IN | FATTO | FATTO – collaudo C-017 su 0.11.0 per PO-090: credibilità, affidabilità, grafica (COLLAUDI C-017.1/.2/.3, docs/revisioni/COLLAUDO_C17.md), rilievi riprodotti dalla principale e corretti nelle 0.12.0–0.15.0 (src/versione.ts:86, :94, :101, :109) |
| PO-102 | PARZIALE | FATTO | FATTO – cortei coi colori dei tifosi presenti, neutri se i dati non lo dicono (0.16.0, f9f527a, ab36fbc), neutro grigio e club sul singolo evento (0.17.0, C21-01/02/03), corteo della chiamata col club dell'evento (0.18.0, C23-01); collaudo C-024: C23-01 chiuso 106/106 sui pixel (prova: src/versione.ts:112, :120-121, :129; guardiani tests/corteo-club.test.ts, controllaColoriCortei) |
| PO-106 | IN | FATTO | FATTO – collaudo C-022 (1c7d048); C22-01/02 corretti nella 0.19.0, C22-03…10 nella 0.20.0, C22-08 e C22-11 senza azione (COLLAUDI C-022); verifica C-025: icona di chi chiama 20 px 18,9:1, sagome 0/5218 sotto 3:1 (prova: src/versione.ts:135, :142) |

## Voci di L1 rimaste aperte (cosa vedrà il PO)

| voce | cosa manca |
|---|---|
| PO-009 | approvazione di e01 giocata dal PO (D-043: testi «approvati per ora», da rivedere dopo la prova sul telefono) |
| PO-017 | prova dell'APK sul telefono del PO, a fine lotto con 10 controlli (D-134) |
| PO-020 | stessa prova sul telefono vero (D-047, D-134): download APK da ritentare |
| PO-022 | eventi in tempo reale (D-048 li rinvia «dopo»; nessuna release li contiene) |
| PO-025 | giudizio del PO su voci e ironia dei testi, dentro la rifinitura PO-039 |
| PO-035 | giudizio del PO sui testi di e03 (la rifinitura D-135 parte da e04) |
| PO-039 | rifinitura col PO da e10 in poi (e04–e09 fatti, D-137, D-138) |
| PO-041 | rifinitura col PO di e13, e17, e21, e25, e30, e35 (dentro PO-039) |
| PO-049 | prova dell'installazione sul telefono del PO (D-134) |
| PO-052 | overflow delle schermate diverse dalla città: nessuna misura successiva trovata |
| PO-053 | seconda revisione di tutte le schermate: non trovata |
| PO-058 | scorrimento ridotto e mappa dimensionata sull'uso: nessuna misura conclusiva trovata (D-114 accetta lo scorrimento della chiamata) |
| PO-081 | prova del PO sul telefono (il difetto non si riproduce in headless) |
| PO-086 | scansione di tutti i 36 episodi con guardiano (D-153), S-03 in corso |

## Non verificato

- PO-009, PO-052, PO-053, PO-058, PO-081 (e PO-039 lasciata com'era): **Non posso confermarlo** che siano state soddisfatte; stato lasciato invariato. Per PO-052/053/058 servirebbe rimisurare con coordination/sonde/rev-schermate.mjs (non fatto: compito solo sul backlog).
- PO-051: la 0.4.0 è registrata in src/versione.ts:21-27, ma l'hash di main della 0.4.0 non è verificabile da questo clone (storia troncata, `git rev-parse --is-shallow-repository` = true).
- PO-070: l'esito di «C-014b» citato nella vecchia riga non è in COLLAUDI.md: Non posso confermarlo. La voce è chiusa sulla base di C-014…C-037 e D-121.
- PO-025: «ironia» dei testi è un giudizio, non una misura: per questo resta PARZIALE.
- PO-022/023/024: chiuse sulla base di quanto implementato e rilasciato; un nuovo collaudo del PO che giudichi e01 «tesa» (criterio d'uscita di L1 in ROADMAP.md) non è registrato.
- Le prove sono letture di documenti e codice; nessun test o sonda è stato eseguito oltre alla catena governo.

## Voci PO-110…PO-127 (solo segnalazione, non toccate)

Nessuna anomalia vista nella lettura; restano alla principale.

## Verifica

`set -o pipefail; node tools/catena.mjs governo` → VERDE (documenti, backlog, segreti, versione, modello, bracci-rossi, governo.html), su 2314252 con le modifiche; rieseguita sul commit finale (vedi sotto).

## Commit
