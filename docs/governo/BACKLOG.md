# Backlog

Una riga per richiesta del PO. Stati: IN CODA / PARZIALE / FATTO / DOPPIONE (unita a…) / REVOCATA (perché).

| id | data | testo del PO | tipo | stato e prova | lotto | versione | guardiano | fonte |
|----|------|--------------|------|---------------|-------|----------|-----------|-------|
| PO-001 | 2026-10-11 | Preparare il repository dal pacchetto «Valmora – Prompt per il team Claude Code» | processo | FATTO – commit iniziale, file in CLAUDE.md, docs/, coordination/ | L0 | – | catena governo: documenti | chat |
| PO-002 | 2026-10-11 | Rivedere il pacchetto di prompt | processo | FATTO – correzioni elencate in AVVIO.md | L0 | – | – | chat |
| PO-003 | 2026-10-11 | Fare da Team Leader e partire dalla Fase 0 | processo | FATTO – D-006 e D-007 decise dal PO | L0 | – | – | chat |
| PO-004 | 2026-10-11 | «Non puoi lavorare in cloud?» | processo | DOPPIONE (unita a PO-008) | L0 | – | – | chat |
| PO-005 | 2026-10-11 | Adottare il governo del progetto (istruzioni permanenti) | processo | FATTO – docs/governo/ISTRUZIONI_PO.md, CLAUDE.md riscritto, guardiano «modello» verde | L0 | – | catena governo: modello, backlog | chat |
| PO-006 | 2026-10-11 | Primo passo: visione, stack, lotti L1-L3 con data, documenti di governo, prima catena funzionante | processo | FATTO – D-006, D-009, D-010 decise; catena governo verde 3 giri su 0a6eab1 (STABILITA.json) | L0 | – | catena governo | chat |
| PO-007 | 2026-10-11 | Fammi tutte le domande sempre in questionario wizard | processo | FATTO – regola in CLAUDE.md | L0 | – | – | chat |
| PO-008 | 2026-10-11 | Il progetto deve lavorare in cloud e non in locale come gli altri giochi | processo | FATTO – sessione principale su claude.ai/code: clone di github.com/antoniovairo-rgb/valmora (main 2419251), lavoro sul ramo claude/valmora-l1-setup-schema-xdrbx7, catene eseguite in cloud (STABILITA.json) | L0 | – | – | chat |
| PO-009 | 2026-10-11 | La bibbia non esiste ancora: scriviamola insieme | nuova funzione | PARZIALE – primo questionario risposto (D-016…D-019), secondo e terzo questionario risposti (D-021…D-039), scritto in docs/BIBBIA.md; mancano indice episodio per episodio ed e01 dettagliata | L1 | – | – | questionario D-012 |
| PO-010 | 2026-10-11 | Impostare Vite + TypeScript + Vitest secondo ARCHITETTURA.md (src/logica con generatore a seme, src/dati, src/salvataggi con SAVE_VERSION, src/versione.ts, src/interruttori.ts) | debito tecnico | FATTO – catena logica verde (tipi, test 41/41), vite build verde; D-013 | L1 | 0.1.0 | catena logica: tipi, confini, test | chat |
| PO-011 | 2026-10-11 | Schema JSON in schema/ e validatore, partendo da FASE0_PROPOSTA §F0-2 | nuova funzione | FATTO – 8 schemi, validatore struttura + significato, 26 bracci rossi in tests/dati/valida.test.ts; rifiniture in D-014 | L1 | 0.1.0 | catena logica: schema, test | chat |
| PO-012 | 2026-10-11 | Aggiungere la catena «logica» a tools/catena.mjs e alla CI | processo | FATTO – catena logica 6 passi, job «logica» in .github/workflows/catene.yml, completa = governo + logica + build | L1 | 0.1.0 | catena logica: bracci-rossi-logica | chat |
| PO-013 | 2026-10-11 | «Devi lavorare su questo repo antoniovairo-rgb/valmora, mi raccomando!» | processo | FATTO – tutti i commit di L1 sono su github.com/antoniovairo-rgb/valmora (ramo claude/valmora-l1-setup-schema-xdrbx7); nessuna modifica al repo Carrier-manager- | L1 | – | – | questionario |
| PO-014 | 2026-10-11 | «Devi lavorare sul repo valmora» | processo | DOPPIONE (unita a PO-013) | L1 | – | – | chat |
| PO-015 | 2026-10-11 | Nomi dei quartieri «più in inglese» | miglioramento | FATTO – D-032, D-033; nomi cercati sul web e i quattro troppo vicini al reale scartati | L1 | – | – | questionario |
| PO-016 | 2026-10-11 | «Proseguiamo» (dopo i questionari di e01): motore della plancia, bot e dati di e01 | nuova funzione | FATTO – motore (src/logica/plancia.ts) + bot 3 strategie + data/missioni/e01.json; bot 1000 semi × 3 strategie: 0 blocchi, tre esiti raggiunti | L1 | 0.1.0 | catena logica: bot | chat |
| PO-017 | 2026-10-11 | «Prosegui senza fermarti»: schermate di e01 nel browser, salvataggio e ripresa | nuova funzione | PARZIALE – resa React (titolo, briefing, plancia, rapporto d'ondata, verbale con fonti vere/false), salvataggio in localStorage dopo ogni passo; catena grafica verde a 360/375/412 px: 0 errori di console, 0 scorrimento orizzontale, ripresa dopo ricarica all'ondata 2, giocatore attento → «Contenuto»; testi di e01 in bozza da approvare; manca APK | L1 | 0.1.0 | catena grafica: foto, token | chat |
