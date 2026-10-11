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
La più recente in alto.

Nessuna release.
