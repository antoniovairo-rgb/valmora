# Collaudo C-016 (PO-070) · novità di 0.8.0

- **Build collaudata:** `061839a` (main, «STABILITA: completa 3/3 verde su e3fd857 per il rilascio 0.8.0»), `GAME_VERSION = '0.8.0'` (src/versione.ts:59).
- **Data:** 2026-10-12. **Ruolo:** collaudatrice, sola lettura sul gioco. Nessun file di src/, data/, tools/ toccato.
- **Due build dello stesso commit** (per l'aggiornamento): A costruita alle 11:40 UTC, `sw.js` VERSIONE `a3dd791946cc`; B alle 11:41 UTC, VERSIONE `6543ef3803fa` (6 file con impronta diversa: index, StratoCitta, StratoPixi, browserAll, sfondo, webworkerAll). Servite da `http://localhost` (contesto sicuro per il service worker).
- **Sonde** (in coordination/sonde/): `c16-comune.mjs` (aiuti), `c16-ripartenza.mjs` (logica di «Riparti»), `c16-offline.mjs` (S-22), `c16-resa.mjs` (guida, «Riparti» nel gioco vero, salvataggi senza `partenze`, fiducia minima, foto e misure a tre larghezze). Chromium `/opt/pw-browsers/chromium` con playwright-core 1.64.0. Le foto sono state scritte nella cartella di lavoro della sessione (non committate): le sonde le rifanno.
- Già registrato e non rifatto: C-014 e C-015 (docs/governo/COLLAUDI.md:71-82). Già noto e assegnato, non riaperto: S-21 (Indietro), S-23 (fumetti), C15-04…C15-09, C14-11.

## Rilievi

| id | gravità | area | in breve |
|----|---------|------|----------|
| C16-01 | **alta** | «Riparti dall'ondata N» (S-17) | in 1646 sconfitte su 6783 (24,3 %) l'ondata proposta parte da uno stato in cui la sconfitta è già certa; il testo dice «dove si è deciso», ma si era deciso un'ondata prima |
| C16-02 | bassa | schieramento, 360 e 375 px | la barra «Annulla / Ritira tutte / Conferma» (fissa in basso) copre la terza unità del vassoio e le righe «a riposo» finché non si scorre |
| C16-03 | bassa | aggiornamento con la scheda aperta (S-22) | online, dopo un rilascio con la scheda vecchia aperta, «Nuova partita» dà «Qualcosa non si è caricato. Forse manca la rete»: il modulo vecchio è in cache ma il service worker restituisce il 404 del server |
| C16-04 | bassa | guida (S-18) | la guida si segna «vista» prima di mostrarla: se l'app si chiude a metà, la guida introduttiva non torna più |
| C16-05 | bassa | storia, testimone | ramo «esposto»: il testimone ritratta tutto in e24, ma in e28 ed e35 torna fonte attiva e «vera» senza condizioni |
| C16-06 | bassa | verbale fallito, 360 px | «Riparti dall'ondata 3» va a capo lasciando il «3» da solo sulla seconda riga |

Nessun bloccante. Totale: 0 bloccanti, 1 alta, 0 medie, 5 basse.

---

### C16-01 · alta · «Riparti dall'ondata N» propone spesso un'ondata da cui non si può più vincere

**FATTO MISURATO (logica).** `node coordination/sonde/c16-ripartenza.mjs 300`: 36 episodi × 300 partite del giocatore casuale (semi `c16:<id>:1…300`); per ogni partita persa (6783) si prende `n = ondataDaRiprendere(esito)` e lo stato `riprendiDallOndata(s, n)`, cioè esattamente ciò che fa la resa (src/resa/App.tsx:110-115).
- In **1646 su 6783** (24,3 %) lo stato ripreso ha già `tensione_max` = 7 o più. In tutti i 36 episodi ogni esito non fallito chiede `tensione_max ≤ 6` (es. data/missioni/e01.json:807; e36 uguale) e `tensione_max` non scende mai (chiudiOndata prende il massimo con il valore precedente, src/logica/missione.ts:180; nessun effetto nei dati la imposta o la somma — `grep` di `"imposta": "tensione_max"`/`"aggiungi": "tensione_max"` su data/: 0 righe). Quindi da quello stato **la sconfitta è certa, qualunque cosa faccia il giocatore**.
- La colonna «n ≠ ondata decisiva» (prima ondata in cui la tensione supera 6) vale anch'essa 1646: ogni volta che l'ondata proposta non è quella in cui la soglia è stata superata, lo stato è perso. Ripartendo dall'ondata decisiva il giocatore attento salva **6191** partite su 6783; ripartendo dall'ondata proposta oggi, **4581**.
- Presente in tutti gli episodi: da 11 (e25) a 79 (e24) casi su 300 partite.

**Causa (dal codice).** `ondataDaRiprendere` (src/logica/missione.ts:196-201) cerca la prima ondata il cui picco raggiunge il **massimo finale** (`>= max`, riga 199). Ma l'esito si decide al **primo superamento di 6**: se la tensione arriva a 7 nell'ondata 2 e a 8 nell'ondata 3, la funzione propone l'ondata 3, il cui stato iniziale ha già `tensione_max = 7`. Esempio (seme `c16:e01:8`): picchi per ondata 6 → 7 → 8, proposta l'ondata 3, nello stato ripreso `tensione_max = 7`.

**FATTO MISURATO (nel gioco vero).** `node coordination/sonde/c16-resa.mjs <buildA> <foto> riparti`, 360×760, partita nuova, piano del giocatore casuale eseguito dall'interfaccia, poi «Riparti» e il seguito giocato dal giocatore attento:

| episodio | seme | proposta | `tensione_max` nello stato ripreso | esito dopo «Riparti» |
|---|---|---|---|---|
| e01 | c16:e01:8 | ondata 3 | 7 | degenerato (perso) |
| e13 (concertone, dalla città) | c16:e13:1 | ondata 3 | 7 | degenerato |
| e36 | c16:e36:1 | ondata 4 | 8 | degenerato |
| e03 (con transenne) | c16:e03:1 | ondata 4 | 7 | degenerato |

Quattro casi su cinque presi «al primo seme che perde con n > 1» erano già persi. In tutti: avviso «Episodio fallito: riparti dall'ondata N, dove si è deciso, o da capo.» (src/resa/schermate/Verbale.tsx:34). Dopo la seconda sconfitta il gioco propone un'ondata **precedente** (e01: 3 → 2; e13: 3 → 2; e36: 4 → 3): il giocatore viene portato indietro un passo alla volta.

**Passi per riprodurre.** Nuova partita → e01 → giocare le scelte del seme `c16:e01:8` (la sonda le esegue) → verbale «Degenerato fuori campo» → «Riparti dall'ondata 3» → qualunque schieramento e risposta → di nuovo «Degenerato».

**Schermo.** Verbale fallito con «Riparti dall'ondata 3» e «Ricomincia» (foto `r-e01-verbale-fallito-360.png`).

**IPOTESI (non verificata).** Usare la prima ondata il cui picco supera la soglia degli esiti (o, più in generale, l'ultima ondata dal cui inizio esiste ancora un esito non fallito) risolverebbe; la scelta della soglia spetta alla sviluppatrice. Non è un soft-lock: «Ricomincia» resta sempre lì.

### C16-02 · bassa · La barra delle azioni copre l'ultima unità del vassoio a 360 e 375 px

**FATTO MISURATO.** `c16-resa.mjs … foto`, schieramento dell'ondata 3 di e01 dopo «Riparti» (con unità a riposo): a 360×760 «Mediatore» × «Annulla» 891 px² sovrapposti, «1 a riposo» × «Annulla» 1760 px², «0» × «Ritira tutte» 576 px²; a 375×812 «1 a riposo» × «Annulla» 1846 px²; a 412×915 nessuna sovrapposizione. La pagina scorre di 106 px (360) e 69 px (375): scorrendo il mediatore torna visibile. Causa dal codice: `.scena .azioni { position: sticky; bottom: … }` (src/resa/stile.css:172) applicato alla riga di Schieramento.tsx:94; le righe «a riposo» (Schieramento.tsx:88) allungano il vassoio.

**Passi.** 360×760, un'ondata con unità a riposo (dalla 2 in poi, o dopo «Riparti»): la terza scheda del vassoio è sotto i pulsanti.

**Schermo.** `360-schieramento-dopo-riparti.png`: si vede il bordo della scheda «Mediatore» dietro «Annulla».

**IPOTESI.** Non è una novità di 0.8.0 (la barra fissa esiste da C09-03); con «Riparti» si atterra direttamente su questa schermata. Non posso confermare se C15-04…09 la coprano: lì sono descritti nomi sovrapposti sulla mappa, non il vassoio.

### C16-03 · bassa · Online, con la scheda vecchia aperta durante un rilascio: «Forse manca la rete»

**FATTO MISURATO.** `node coordination/sonde/c16-offline.mjs <A> <B> <foto>`, passaggi O3/O4: home di A aperta online, il server passa a B, poi «Nuova partita».
- O3 online: il modulo `StratoCitta-DqFEofEp.js` di A **è nella cache** `valmora-a3dd791946cc`, ma la città non si apre: contenitore «Qualcosa non si è caricato · Forse manca la rete…» con «Riprova», 3 errori 404 in console. «Riprova» → home della build B, salvataggio presente.
- O4 offline, stesso caso: la città si apre dalla cache (mappa pronta, 0 errori).
- Causa dal codice: public/sw.js:36-37 restituisce la risposta della rete anche quando non è `ok` (404); la cache si legge solo se la rete fallisce del tutto (riga 39).

**Passi.** Aprire la home, pubblicare una build nuova, senza ricaricare toccare «Nuova partita» con la rete attiva.

**Schermo.** `o3-scheda-vecchia-online-360.png`.

**IPOTESI.** Effetto pratico piccolo (si risolve con «Riprova», niente va perso), ma online il gioco fa peggio che offline, e il testo dà la colpa alla rete.

### C16-04 · bassa · La guida introduttiva si segna «vista» prima di essere vista

**FATTO MISURATO.** `c16-resa.mjs … guida`, G3: partita nuova, guida al passo 3 di 6, ricarica (come chiudere l'app) → `localStorage['valmora-guida-vista'] = 'si'`; «Riprendi» → città; una nuova «Nuova partita» → città, senza guida. Dal codice: `segnaGuidaVista()` è chiamato prima di mostrare la guida (src/resa/App.tsx:86).

**Passi.** Telefono pulito → Nuova partita → genere → guida → chiudere l'app al passo 2-5 → riaprire.

**IPOTESI.** La guida resta raggiungibile dalla home («La città e il gioco», verificato in G4), quindi l'effetto è piccolo.

### C16-05 · bassa · Testimone «esposto»: ritratta in e24 ma resta fonte affidabile in e28 ed e35

**FATTO MISURATO (lettura dei dati).** La variabile `testimone` (data/stato.json, valori nessuno/protetto/esposto) dopo e18 vale sempre «protetto» o «esposto» (la chiamata `con_o_senza` dell'ondata 4 di e18 non ha condizioni). Nel ramo «esposto»:
- e19 ondata 3 `testimone_esposto`: «il tipografo che ha parlato con voi ha cambiato casa. E idea.» (data/testi/it/e19.json:139);
- e24 ondata 3 `testimone_ritratta`: «il tipografo che vi ha parlato ritratta tutto. Dice di essersi inventato ogni nome.» (data/testi/it/e24.json:135);
- ma e28 ha la fonte «testimone» nel briefing con `"vera": true` e senza condizione (data/missioni/e28.json:16-22, testo «Il testimone: «Il Fabbro dorme alle banchine del porto…»») e la chiamata `testimone_chiama` senza condizione (data/missioni/e28.json:241, «Sono io. Il container ha una luce accesa…»); e35 ha briefing (data/missioni/e35.json:31) e chiamate `barca_porto` (riga 199) e `barca_ritorno` (riga 589) del testimone, senza condizione.

**IPOTESI.** Per chi ha esposto il testimone, ritrovarlo in e28 ed e35 come informatore attivo e attendibile contraddice e19/e24. Non è una regressione della correzione C15-03 (che riguarda e18→e19 ed è a posto, sotto), ma è lo stesso filo narrativo. Il rapporto C-015 non lo citava (cercato «testimone», «e28», «e35» nel rapporto sul ramo claude/valmora-collaudo-c15).

### C16-06 · bassa · «Riparti dall'ondata 3» va a capo con il numero isolato

**FATTO MISURATO.** Foto `r-e01-verbale-fallito-360.png` (360×760): il pulsante mostra «RIPARTI DALL'ONDATA» sulla prima riga e «3» da solo sulla seconda; accanto «Ricomincia». A 375 e 412 px la sonda non misura tagli né sovrapposizioni nel verbale (a parte la sovrapposizione fra l'etichetta «Verbale» e il titolo della testata, 179-252 px², che non ho confrontato con altri verbali).

---

## Verificato senza difetti

1. **Offline e installazione (S-22)** — `c16-offline.mjs`, 360×760:
   - O1: sola home di A online (cache `valmora-a3dd791946cc`), poi rete spenta (server che chiude le connessioni + `setOffline`): Nuova partita → guida (6 passi) → città con mappa pronta → **e01 intero fino al verbale** (esito contenuto_a_fatica), 0 errori.
   - O2: aggiornamento A → B ricaricando online: la prima ricarica mostra già «build 061839a · 2026-10-12 11:41 UTC» (B), la cache di A sparisce (resta solo `valmora-6543ef3803fa`) entro 10 s, nessuna pagina bianca; poi offline città + e01 intero, 0 errori.
   - O4: scheda A aperta, rilascio B, offline → la città si apre dalla cache.
   - Il contenitore «Riprova» compare quando un pezzo manca (O3) e riporta alla home col salvataggio intatto.
2. **Guida (S-18)** — `c16-resa.mjs … guida`: alla prima partita compare dopo il genere; 6 passi; «Salta» al passo 1, «Indietro» dal 2 al 6 (dal 6 torna al 5), «Iniziamo» al 6 → città (G1). Alla seconda partita sullo stesso telefono non torna (G2, come vuole archivio.ts:98-101). Dalla home resta raggiungibile con «Chiudi» (G4). A 360/375/412 px tutti e 6 i passi: nessuno scorrimento, nessun taglio, nessuna sovrapposizione, nessun tocco sotto 44 px, corpo minimo 12 px. «Salta» c'è solo al passo 1 (al passo 2: 0 pulsanti «Salta»): per uscire dopo si torna indietro (scelta di progetto, non la segno come difetto).
3. **«Riparti dall'ondata N» (S-17), parte meccanica** — nei 5 casi del gioco vero (e01 ×2, e13, e36, e03 con transenne):
   - l'ondata sul pulsante coincide con `ondataDaRiprendere` (è il valore che C16-01 contesta, non il collegamento);
   - lo stato salvato dopo «Riparti» è identico a `riprendiDallOndata` in missione, ondata, tensione, riserva, riposo, fisse, variabili, scelte, rapporti;
   - **tentativi**: 1 dopo la sconfitta, ancora 1 dopo «Riparti», 2 dopo aver finito la ripartenza: «Riparti» non conta un tentativo in più;
   - le variabili della storia del salvataggio restano quelle di prima dopo la sconfitta;
   - ricaricando a metà della ripartenza, «Riprendi» torna allo schieramento della stessa ondata; la barra della fiducia mostra il valore dello stato ripreso.
4. **Salvataggi senza `partenze`** — salvataggio 0.8.0 vero di e01 a inizio ondata 3 con il campo `partenze` tolto (come lo scriveva la 0.7.0), perso con `ondataDaRiprendere = 3`: solo «Ricomincia l'episodio», avviso «Episodio fallito: va rigiocato…» (sezione `vecchio2`). Con il salvataggio vero 0.4.0 (tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json, e02 ondata 2, senza `partenze`) nessun seguito perso porta a n ≤ 2 in 3000 semi; perdendo con n = 4 compare «Riparti dall'ondata 4», perché le copie si creano per le ondate giocate dopo la ripresa (missione.ts, chiudiOndata): coerente col codice.
5. **Fiducia minima 3 (D-110)** — salvataggio con fiducia 0: e02 parte con la barra a 3 (in_corso `credito` 3); perso con n = 1, il registro conserva `variabili_prima.credito = 0` e «Ricomincia l'episodio» riparte con la barra a 3 (src/logica/missione.ts:22, 65).
   - Dopo «Riparti» da un'ondata > 1 la fiducia è quella di quel momento dell'episodio: nella misura logica sotto 3 in 449 riprese su 6783. D-110 dice «a inizio episodio», quindi **non** lo segno come difetto. Se il minimo debba valere anche qui lo decide il PO.
6. **Testi**:
   - C15-03: e18 `conferma18` solo se il testimone non è protetto, `conferma18p` (senza effetti) se è protetto (data/missioni/e18.json); `npx vitest run tests/testimone.test.ts tests/ripartenza.test.ts` → 6/6 verdi.
   - C15-10: le frasi degli steward dicono «trovano… segnalano: gli agenti ritirano» (e03.op.steward_laser.r, e15.op.steward_sotto.r, e23.op.sirena_via.r); «sequestra» resta solo negli ordini del protagonista (e13, e18, e27) e nel cantiere di e36, mai agli steward.
   - C15-11 / D-102 / D-110: nei dialoghi c'è «il Fabbro»; «Tano Ferrigno» compare in verbali, informazioni del briefing e nella presentazione «Tano Ferrigno, il Fabbro» (e08.intro1, e29.verbale_contenuto); appunto di Malvasi (e08.op.annota8.r) e titolo di giornale (e20.ch.sotto_gli_occhi) con «il Fabbro». Lette tutte le 162 righe con Ferrigno/Fabbro (`grep -o` su data/testi/it/*.json); «Ferrigno» fuori da verbali, informazioni, presentazione (e08.intro1) e fonte: 0 righe. Nessuna regressione di senso trovata.
7. **Usabilità** a 360×760, 375×812, 412×915: home, guida 1-6 e verbale fallito senza scorrimento orizzontale né tocchi sotto 44 px. Nella città le sovrapposizioni dei nomi sulla mappa sono C15-04 (non riaperto).

## Cosa non ho potuto verificare

- Il **service worker nell'app Android** (Capacitor) e su un telefono vero: solo Chromium headless su localhost.
- Il contenitore «Riprova» a 375 e 412 px: il blocco del modulo con `page.route` dopo aver tolto il service worker non ha impedito il caricamento della città (scena città), quindi la foto c'è solo a 360 px (O3).
- La **prima visita interrotta prima della fine della precache** (utente che chiude in meno di un secondo): non provata.
- Il seguito perso con n ≤ 2 dal salvataggio vero 0.4.0: non esiste nei 3000 semi provati; il caso «solo Ricomincia» l'ho misurato sul salvataggio 0.8.0 con `partenze` tolto.
- Chi capisce la guida «al primo uso»: misurabile solo con persone vere. IPOTESI: la guida è solo testo (2/3 dello schermo vuoto a 360 px, foto `360-guida-4.png`) e dice cosa si fa, non come (il come lo spiega la riga sopra il vassoio dello schieramento).
- Le catene (`node tools/catena.mjs`) non le ho girate: non è compito della collaudatrice.
