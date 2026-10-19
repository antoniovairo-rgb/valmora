# Roadmap

Data di pubblicazione: **da rifissare a fine L1** (D-050: le 36 missioni restano, la data del 2026-11-30 di D-009 slitta in base alla misura). Congelamento dell'ambito: dieci giorni prima della nuova data. Test chiuso Play, se richiesto: avvio entro il 2026-11-09 (Non posso confermarlo che sia richiesto).
Ambito della prima pubblicazione: triade intera, 36 missioni.
Stati dei lotti: PROPOSTO / IN CORSO / CHIUSO.

## L0 – Impianto del governo
- Stato: CHIUSO (2026-10-11: catena governo verde 3/3 giri locali su 7a884b9 + CI GitHub verde su 80a3deb; D-006…D-012 chiuse)
- Obiettivo: documenti di governo, regole, prima catena di prova funzionante, decisioni di partenza.
- Voci: PO-001, PO-002, PO-003, PO-004, PO-005, PO-006, PO-007
- Criterio d'uscita: catena «governo» verde per 3 giri consecutivi sullo stesso commit; D-006…D-010 chiuse; repo GitHub con CI che esegue la stessa catena.

## L1 – Fetta verticale: episodio 1
- Stato: IN CORSO
- Obiettivo: e01 giocabile da capo a fondo (briefing, plancia, ondate, verbale) nel browser e come APK di debug sul telefono del PO.
- Voci: PO-009, PO-010, PO-011, PO-012, PO-013, PO-015, PO-016, PO-017, PO-018, PO-019, PO-020, PO-022, PO-023, PO-024, PO-025
- Collaudo PO C-001 (2026-10-11): e01 0.1.0 senza tensione e passiva; si rifà a scene guidate con conseguenze (D-048, D-049).
- Ore di lavoro (misura del 2026-10-11 11:02 UTC, da `git log`, metodo: somma degli intervalli fra commit consecutivi sotto i 30 minuti): sessione principale 68 commit di L1, 3,5 h attive su 10,6 h di calendario (00:27 → 11:02 UTC, 2 pause lunghe). Sviluppatrice e collaudatrice attive dalle 09:30 UTC: le loro ore non sono separabili dai commit della principale che hanno integrato. LIMITE: misura indiretta, non conta il tempo senza commit (letture, attese delle catene, questionari).
- Avanzamento: impianto Vite + TS + Vitest, schema, validatore e catena «logica» fatti (PO-010…012, sul ramo claude/valmora-l1-setup-schema-xdrbx7); bibbia in scrittura col PO (PO-009: e01 decisa in D-019…D-039); motore della plancia, bot e dati di e01 fatti, bot 0 blocchi su 1000 semi (PO-016). Resa di e01 nel browser con salvataggio e ripresa fatta (PO-017): catena grafica verde a 360/375/412 px. Testi approvati per ora (D-043). APK di debug costruito dalla CI (D-044). Manca: prova dell'APK sul telefono del PO, ore di lavoro misurate.
- Criterio d'uscita: bibbia con indice della triade ed e01 approvati dal PO, con un collaudo del PO che giudica e01 tesa e coinvolgente (C-001 non lo è); e01 completata dal bot con 1000 semi (1…1000), 0 blocchi; catena «logica» verde 3 giri; 0 errori di console sulle schermate di e01 a 360/375/412 px; salvataggio e ripresa provati; ore reali di lavoro misurate e scritte qui.

## L2 – Strumenti e stagione 1
- Stato: PROPOSTO
- Obiettivo: validatore dello schema, controllo del grafo narrativo, bot di partite; 12 missioni della stagione 1.
- Voci: –
- Criterio d'uscita: 12 missioni valide allo schema; bot con 1000 semi × strategie «casuale» e «peggiore» arriva sempre alla fine della stagione; 0 soft-lock e 0 fili orfani; un rapporto di collaudo per missione in COLLAUDI.md senza difetti critici aperti.

## L3 – Prima pubblicazione
- Stato: PROPOSTO
- Obiettivo: triade intera (36 missioni, D-009), test chiuso su Play, richiesta di produzione.
- Voci: –
- Criterio d'uscita: controllo copyright a 0; build offline verificata; 0 errori di console nelle schermate principali; AAB caricato dal PO nel test chiuso; requisiti Play letti e datati in docs/RILASCIO.md.

---

## Registro delle release
La più recente in alto. Hash = commit di main dopo la promozione (catena completa 3/3 + CI «catene» verde, D-115). Dettaglio di causa/misura/guardiano nel commento di GAME_VERSION (src/versione.ts).

| Versione | Data (UTC) | Hash main | Contenuto | Misura principale | Stato |
|---|---|---|---|---|---|
| 0.42.0 | 19/10 | 7286c6c1 | Correzioni del collaudo C-041: bilancio del verbale («penalizzato» e «aiutato» coerenti con la partita, niente righe vuote), costo delle unità dichiarato «dalla prossima ondata» (D-183), testi coerenti con lo schieramento | governo+logica 3/3 verde su 39b2b686 (D-177); CI «catene» 7/7 verde su 39b2b686; pesi su settori sotto controllo 222 → 0, righe vuote 199 → 0, costo dichiarato 230/230 | Pubblicata (rilascio delle 13:30 uscito alle 14:50: sessione riavviata). C41-05…08 (S-09) non inclusi: CI rossa |
| 0.41.0 | 19/10 | 0674567a | Protagonisti della quarta prova in tutto il gioco (D-176: figura femminile, braccia), braccio della mano alla nuca (PO-136, C117B01), braccia smussate (PO-137, D-178), correzioni del collaudo C-040 (confronto e fiducia D-180, «le tue risposte», mediatore, busta consegnata), terza stella con fiducia ≥ 8 in cinque episodi (D-181) | governo+logica 3/3 verde su 22a0f553 (D-177; giro 3 rifatto da capo dopo un'interruzione del processo, non un rosso); CI «catene» 7/7 verde su 22a0f553; fiducia nelle fallite 13 → 0 episodi, voci contraddette 598 → 0 | Pubblicata. Home (PO-140) in attesa dell'ok del PO |
| 0.40.0 | 18/10 | e1c0d73a | Correzioni dei collaudi C-038/C-039 (mediatore D-173, unità impegnate C39-02, «giallo» C38-02, furgone, settore degenerato, squadra sul nastro), fiducia terzo giro (6 episodi → 0 contro il risultato), verbale che confronta le risposte (366 → 0 voci contraddette), scena del tono, seconda bozza dei protagonisti | governo+logica 3/3 verde su 769f927b (D-177); CI 7/7 verde su ed68c824 | Pubblicata. Prima versione con la verifica veloce di D-177 |
| 0.39.0 | 18/10 | 89bfbd9d | Finale in tre tempi ed epilogo (D-161, D-164, D-165, D-171: tavole coi busti della seconda bozza), annullamento delle risposte entro 5 s (PO-121), fiducia coerente secondo giro (D-169, D-170), versione nel margine sinistro (D-168), C37-01/03/08 | catena completa 3/3 verde su 1517c083; CI verde su 1517c083 | Pubblicata. PO-131/PO-132 (braccia, figura femminile) restano alla terza prova dei protagonisti |
| 0.38.0 | 18/10 | 1188bcc | Nomi sulla mappa (C33-01 / D-145), settori copribili e dati C35 (D-146, D-150), finale di e14 (D-158); coerenza delle scelte (D-153/D-159), curva D-154, fiducia coerente col risultato (D-160/D-163, primo giro), testi generici D-162, stabilità CI (PO-128: C128-01 città, C128-02 e14 o1, D-169) | catena completa 3/3 verde su 0975f18; CI 7/7 verde su 0975f18 (grafica 360/375/412) | Pubblicata. Due verifiche precedenti fermate per la CI rossa su e14 o1: la causa vera (nomi 1-2 px più larghi in Chrome 156) l'ha misurata S-08; quella del carattere di riserva è ritirata |
| 0.37.0 | 2026-10-17 14:46 | d2fdf88 | Tastiera nei riepiloghi e fra le scene (C34-01, C34-08 / D-142), fiaccolata e30 (C33-02 / D-141), etichette mappa (C33-03…05) | riepilogo 6/6 col fuoco sul titolo; Tab stagione 1 da 10 a 2; e30 o4 69/69 lontano dal municipio | pubblicata; collaudo C-037 |
| 0.36.0 | 2026-10-17 08:43 | fdad627 | C35-01: salvataggio vecchio in e35 non riapre la chiamata opposta sulla barca | c34-dati 12/12 (11/12 senza correzione) | pubblicata; collaudo C-036 |
| 0.35.0 | 2026-10-17 05:21 | e7f00cc | Dati e testi coerenti con le scelte (C34-02/03/06/09/10) | c34-dati 11/11 (8/11 coi dati 0.34.0) | pubblicata; collaudo C-035 |
| 0.34.0 | 2026-10-16 21:51 | acf1151 | «?» nella barra (D-139), fuoco tastiera (C32-01), versione tablet/PC (C32-06), e17 (C32-02) | «Conferma» ≥ 44 px a 360…1366; e17 28-29 via / 10-11 verso | pubblicata; collaudo C-034 |
| 0.33.0 | 2026-10-16 17:52 | 57229a4 | Espressioni dalla tensione (PO-059, D-133) | rosso C96P01: 29 righe | pubblicata; collaudo C-033 |
| 0.32.0 | 2026-10-16 16:10 | c15c617 | Pastiglie a tetto 0 (D-136), corteo e30 (C31-02), C32-03/05 | pastiglie sopra i nomi 0/142 (rosso 7) | pubblicata; collaudo C-032 |
| 0.31.0 | 2026-10-16 13:55 | 8eb495e | Corteo e04 dal bordo giusto (C29-02), «Urgente!» nella guida (C29-04) | catena 3/3 su 7e28ab4 | pubblicata |
| 0.30.0 | 2026-10-16 11:58 | 98f6109 | C31-01 guardiano fase e21, C31-03 «familiari» in e35 | meta-fase verde, rosso senza fase | pubblicata |

Le release precedenti alla 0.30.0 sono registrate nei commit «STABILITA: … (rilascio x.y.z)» di main e in docs/RELEASE_HISTORY.md.
