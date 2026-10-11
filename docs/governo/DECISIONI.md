# Decisioni

Ogni decisione: data, domanda, risposta, conseguenze. «PO» = decisa dal PO; «tecnica» = default dichiarato dalla sessione principale.

## Zone congelate
Nessuna.

## Registro

| id | data | chi | domanda | risposta | conseguenze |
|----|------|-----|---------|----------|-------------|
| D-001 | 2026-10-11 | tecnica | Dove creare il progetto? | `C:\Users\a.vairo\Documents\valmora` | La cartella «New project» contiene file di sistema estranei e resta fuori |
| D-002 | 2026-10-11 | PO | Lavoro in cloud? | «In caso non affermativo scegli 1»: si lavora in locale finché non c'è un repo GitHub | SUPERATA da D-011 |
| D-003 | 2026-10-11 | PO | Regole di governo | Adottate (docs/governo/ISTRUZIONI_PO.md) | CLAUDE.md riscritto come elenco di regole |
| D-004 | 2026-10-11 | tecnica | Con cosa scrivere le catene di prova? | Node.js senza dipendenze (`tools/catena.mjs`) | Node c'è già (v24) e serve in tutte e tre le opzioni di stack |
| D-005 | 2026-10-11 | tecnica | Commit iniziale con identificativo del modello | Messaggio del commit iniziale riscritto (repo solo locale, mai pubblicato) | Il guardiano «modello» controlla file e messaggi di commit |
| D-006 | 2026-10-11 | PO | Stack | A: TypeScript + Vite + Capacitor | Vale docs/governo/ARCHITETTURA.md; rischio fluidità mappa da misurare in L1 |
| D-007 | 2026-10-11 | PO | Schema dei dati | Approvato; la sessione principale lo rifinisce e dichiara le modifiche | Base: docs/FASE0_PROPOSTA.md §F0-2 |
| D-008 | 2026-10-11 | PO | Repo GitHub (nome, visibilità) | antoniovairo-rgb/valmora, pubblico | Creato il 2026-10-11; bibbia e trama saranno leggibili da chiunque |
| D-009 | 2026-10-11 | PO | Lotti L1-L3, ambito e data | Lotti approvati; prima pubblicazione = triade intera (36 missioni); data 2026-11-30, ferma; stima misurata a fine L1 con eventuali tagli proposti | Congelamento ambito 2026-11-20; se serve il test chiuso Play (Non posso confermarlo), deve partire entro il 2026-11-09 |
| D-010 | 2026-10-11 | PO | Visione e pubblico | Approvata (docs/governo/VISIONE.md) | Riferimento per ogni lotto |
| D-011 | 2026-10-11 | PO | Dove lavora il progetto? | In cloud, non in locale (PO-008) | Serve il repo GitHub (D-008); AVVIO.md con 5 terminali locali va riscritto per il cloud |
| D-012 | 2026-10-11 | PO | Come arriva la bibbia? | Non esiste ancora: si scrive insieme | Ogni scelta di storia va al PO con questionario; e01 di L1 è provvisoria finché la bibbia non la conferma |
