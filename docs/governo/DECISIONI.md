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
| D-013 | 2026-10-11 | tecnica | Versioni e strumenti dello stack A | Versioni esatte: vite 8.3.4, vitest 5.0.3, typescript 7.0.2, @types/node 24, ajv 8.20.0 (JSON Schema 2020-12). Moduli TS eseguiti da Node togliendo i tipi (Node ≥ 22.18; CI su 24), quindi niente passo di compilazione per le catene | Import con estensione `.ts`, solo sintassi cancellabile (`erasableSyntaxOnly`); la catena «governo» resta senza dipendenze (carica i passi «logica» solo se servono) |
| D-014 | 2026-10-11 | tecnica | Rifiniture dello schema F0-2 (D-007) | (1) stato.json = `{ "variabili": [...] }`; (2) `{}` = condizione sempre vera; (3) risorse della mappa = mappa libera nome→intero, valida sia per categorie fisse sia per missione (domanda F0-2 n.1 lasciata aperta senza bloccare); (4) `vera` del briefing facoltativo (n.2); (5) `se` dei soprannomi facoltativo (n.3); (6) testi = mappe piatte con chiave completa (`e01.titolo` ↔ `testi:e01.titolo`), chiave doppia = errore; (7) club e personaggi minimi (id, nome) finché la bibbia non dice i campi; (8) ondate numerate 1…n ed eventi solo su settori della mappa; (9) l'id coincide col nome del file | Tappe e indizi possono citare episodi non ancora scritti: l'esistenza, la raggiungibilità da e01 e la lista vietata si controllano in L2 (grafo narrativo) |
| D-015 | 2026-10-11 | tecnica | Versione dell'impianto | GAME_VERSION 0.1.0, SAVE_VERSION 1, non pubblicato: nessun rilascio finché e01 non è giocabile | Il rituale in 10 passi si applica dalla prima versione giocabile; nessuna riga nel registro delle release |
| D-016 | 2026-10-11 | PO | Bibbia · cosa fa avanzare la triade? | Rete a strati: S1 i disordini in superficie, S2 chi li organizza (fuga di Dessì in e20), S3 chi li protegge (cattura in e29, resa dei conti) | Indizi seminati dalla S1; più lavoro sul grafo narrativo in L2 |
| D-017 | 2026-10-11 | PO | Bibbia · chi è Dessì? | Capo di una curva inventata che usa la curva come copertura per affari illeciti | Massima attenzione a REGOLE_PLAY §2: niente simboli, ideologie o riferimenti reali |
| D-018 | 2026-10-11 | PO | Bibbia · perché «ad interim»? | Predecessore rimosso in fretta dopo una gestione contestata; nessuno voleva il posto | e01 evoca il fatto senza ricalcare tragedie reali (REGOLE_PLAY §4) |
| D-019 | 2026-10-11 | PO | Bibbia · situazione di e01 | Derby cittadino al primo giorno, con fonti in contraddizione | e01 insegna briefing, plancia e ondate; il climax delle stagioni dovrà salire oltre il derby |
| D-020 | 2026-10-11 | PO | Portare l'impianto di L1 su main? | Sì, subito, avanzando main fino al ramo senza riscrivere nulla (fast-forward) | main = ramo claude/valmora-l1-setup-schema-xdrbx7; non è un rilascio (D-015) |
| D-021 | 2026-10-11 | PO | e01 · cosa rende teso il derby? | Quartieri rivali: ogni club è il simbolo di un quartiere inventato | La mappa di e01 include strade dei quartieri oltre allo stadio: più settori |
| D-022 | 2026-10-11 | PO | e01 · su cosa si contraddicono le fonti? | Il corteo: una fonte lo annuncia non autorizzato, l'altra lo smentisce | Servono almeno due settori d'arrivo; le risorse si dividono fra due ipotesi |
| D-023 | 2026-10-11 | PO | Risorse sulla mappa (§F0-2 n.1) | Diverse per missione | Lo schema già le ammette (mappa libera nome→intero, D-014); ogni risorsa nuova va spiegata al giocatore e insegnata al bot |
| D-024 | 2026-10-11 | PO | Il verbale rivela le informazioni false? (§F0-2 n.2) | Sì, sempre | Campo «vera» del briefing reso obbligatorio nello schema (rivede D-014 punto 4) |
| D-025 | 2026-10-11 | PO | e01 · risorse | Tre: squadre, steward, mediatore (tratta con il corteo) | e01 più ricca; rischio di superare i 7 minuti da misurare col bot |
| D-026 | 2026-10-11 | PO | e01 · esiti | Tre: contenuto, contenuto a fatica, degenerato fuori campo (ultimo senza condizione) | Tre verbali e tre varianti del seguito |
| D-027 | 2026-10-11 | PO | e01 · ondate | Tre: arrivo delle tifoserie, partita, deflusso | Una pressione da bilanciare per ondata |
| D-028 | 2026-10-11 | PO | e01 · fonti del briefing | Entrambe le coppie proposte («1 e 2»): informatore di strada (bassa), ufficio sicurezza di un club (media), voce dalla centrale radio, voci in rete | Quattro fonti; le voci in rete richiedono attenzione a tono e policy Play; affidabilità di radio e rete DA DECIDERE |
| D-029 | 2026-10-11 | PO | Nomi di club e quartieri: chi li propone? | Li propone la sessione principale, il PO sceglie | Ogni nome proposto è cercato sul web; nessuna ricerca prova l'inesistenza: resta rischio dichiarato fino alla lista vietata (L2) |
| D-030 | 2026-10-11 | PO | e01 · affidabilità di radio e rete | Radio alta, rete media | Due fonti «affidabili» su quattro |
| D-031 | 2026-10-11 | PO | e01 · il corteo c'è davvero? | Sì: lo annuncia l'informatore di strada (affidabilità bassa) | Lezione: affidabilità ≠ verità; «contenuto a fatica» deve restare raggiungibile anche per chi si fida della fonte migliore |
