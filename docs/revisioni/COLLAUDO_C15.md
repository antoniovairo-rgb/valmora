# Collaudo C-015 (PO-070) · Valmora – Cortina di fumo

- **Build collaudata:** `ad70fcb` (main), `GAME_VERSION = '0.7.0'` (src/versione.ts:51), `SAVE_VERSION = 2`.
- **Data:** 2026-10-12. **Ruolo:** collaudatrice, sola lettura sul gioco.
- **Sonde (ramo `claude/valmora-collaudo-c15`):** `coordination/sonde/c15-storia.mjs` (dati), `c15-logica.mjs` (motore), `c15-resa.mjs` (Chromium, parti `fiducia · schieramento · verbale · perso · home · vecchi · genera · etichette · misure`).
- **Preparazione:** `npm ci`, `npx vite build`; `npx vitest run` → 19 file, 147 test verdi (FATTO MISURATO, 2026-10-12 07:37 UTC).
- **Non rifatto (già in COLLAUDI.md):** C-014.7 (300 campagne e01→e36, nessun soft-lock, riprese identiche, memoria); C14-01 pagina bianca offline (→ S-22); C14-05 tasti Indietro (→ S-21). Comportamenti decisi non trattati come difetti: D-055, D-097, D-101…D-108. **Nota:** il prompt cita D-109, ma in `docs/governo/DECISIONI.md` su `ad70fcb` l'ultima decisione è D-108 (`grep -n "D-109"` → nessuna riga).

## Riepilogo

| id | gravità | area | sintesi |
|----|---------|------|---------|
| C15-01 | media | verbale | Episodio perso: all'ultimo passo del verbale non c'è modo di rigiocare; «Rigioca l'episodio» sta solo nel passo 1 |
| C15-02 | media | verbale | «Riparti dall'ondata N» non esiste nella resa (logica pronta, resa PO-060 ancora IN CODA) |
| C15-03 | media | storia | e18: testimone portato via «e nessuno saprà dove» diventa «esposto» se poi confermi alla stampa; e19 dice «la sua faccia l'hanno vista in tanti» |
| C15-04 | bassa | usabilità | Nomi dei settori sovrapposti sulla mappa: e25 e e31 a 360 px, e21 e e32 a 375 px |
| C15-05 | bassa | testi | «Ti restano 1 Squadre» (plurale fisso nel riepilogo dello schieramento) |
| C15-06 | bassa | schieramento | Col riepilogo aperto la mappa resta toccabile: un tocco aggiunge un'unità senza tornare allo schieramento |
| C15-07 | bassa | fiducia | Barra della fiducia assente in sala operativa, briefing e verbale |
| C15-08 | bassa | home | Importazione: messaggio tecnico «save_version non valida: undefined» |
| C15-09 | bassa | home | Salvataggio e copia di riserva entrambi rovinati: la home riparte vuota senza dire che la partita è andata persa |
| C15-10 | bassa | realismo | Gli steward «sequestrano» oggetti (e03, e15, e23): il DM 8 agosto 2007 esclude pubbliche funzioni per gli steward |
| C15-11 | bassa (da decidere) | storia | «Ferrigno» compare in 17 battute di dialogo; D-102 dice «soprannome nei dialoghi» |

**Conteggio: 0 bloccanti · 0 alte · 3 medie · 8 basse.**

---

## Rilievi

### C15-01 · media · Verbale di un episodio perso: l'azione per rigiocare è nascosta
**FATTO MISURATO.** `node coordination/sonde/c15-resa.mjs . perso <foto>` (360×760, e01 giocato dall'interfaccia col bot `peggiore`, esito motore `degenerato fallita=true`):
- pulsanti presenti nel verbale: `condividi(nascosto),rigioca(nascosto),indietro,citta`; «Rigioca» visibile all'ultimo passo → `false`;
- all'ultimo passo (5/5, «Le fonti») si vedono solo «Indietro» e «Alla mappa della città», quest'ultimo in stile secondario (bianco), su 4 righe.
- Codice: «Rigioca» è nel primo passo (src/resa/schermate/Verbale.tsx:38), il pulsante finale a episodio fallito è solo la mappa (Verbale.tsx:62, `p.risultato.fallita ? mappa`, con classe `secondario` a Verbale.tsx:61).
- Dalla città si rigioca: scheda «Fallito: va rigiocato per andare avanti» + «Rigioca l'episodio» → sala (stessa sonda).

**Passi:** nuova partita → e01 → perdi l'episodio (es. tutte le unità in un settore, risposte che alzano la tensione) → scorri il verbale fino all'ultimo passo.
**Schermo:** ultimo passo con «Indietro» e «Alla mappa della città», nessuna azione primaria.
**IPOTESI:** è lo stesso dubbio di PO-072 («non si capisce come andare avanti») nel caso perso: il giocatore deve tornare indietro di 4 passi o passare dalla città.

### C15-02 · media · «Riparti dall'ondata N» assente
**FATTO MISURATO.** Stessa sonda: nel testo del verbale perso nessuna occorrenza di «Riparti» o «ondata N» (`nessun «Riparti dall'ondata N»`); «Rigioca» dalla città porta alla sala (dall'inizio). `grep -rn "riprendiDallOndata\|ondataDaRiprendere" src tests tools` → solo src/logica/missione.ts:196 e :204 e tests/ripartenza.test.ts: la resa non le usa.
**Contesto:** docs/governo/BACKLOG.md:66, PO-060 «IN CODA – logica: principale …; resa: sviluppatrice». Non è una regressione: la funzione elencata fra le novità da collaudare non è ancora nella 0.7.0.

### C15-03 · media · Storia: il testimone protetto diventa «esposto» e il testo lo contraddice
**FATTO MISURATO.** `node coordination/sonde/c15-logica.mjs` (blocco finale, bot `attenta` con due scelte forzate in e18):
`o4.con_o_senza=auto_scorta→testimone protetto · o4.qualcuno_ha_parlato=conferma18→testimone esposto · esito contenuto · testimone a fine episodio: esposto`; poi e19 mostra `testimone_esposto`.
- Dati: data/missioni/e18.json:659-665 (`con_o_senza`/`auto_scorta`, imposta `protetto`) e :747-753 (`qualcuno_ha_parlato`/`conferma18`, imposta `esposto`), nella stessa ondata 4, in quest'ordine.
- Testi: e18.op.auto_scorta.r (data/testi/it/e18.json:100) «L'auto parte dal retro a sirene spente. Il testimone avrà un posto sicuro, e nessuno saprà dove.» · e19.ch.testimone_esposto.vice (data/testi/it/e19.json:146) «La sua faccia l'hanno vista in tanti. Qualcuno è andato a trovarlo.» · e24.ch.testimone_ritratta.vice: «Ritratta chi ha paura. E ha paura chi è stato visto.»

**Passi:** e18, ondata 4: «Auto con scorta», poi alla stampa «Conferma» → e19 ondata 3: chiamata sul tipografo «esposto».
**IPOTESI:** che «sanno che esiste» basti a renderlo esposto è una scelta possibile, ma allora il commento «la sua faccia l'hanno vista in tanti» va bene solo per chi l'ha fatto uscire con la folla. Le altre cinque variabili di D-100 sono coerenti (vedi «Verificato»).

### C15-04 · bassa · Nomi dei settori sovrapposti sulla mappa tattica
**FATTO MISURATO.** `node coordination/sonde/c15-resa.mjs . etichette <foto>` (sala operativa di ognuno dei 36 episodi, rettangoli di `.settore-nome`):
- 360×760: 3/36 — e25 «Curva Cinderwick»×«Zona rossa del vertice» 172 px², «Piazzale dello stadio»×«Zona rossa del vertice» 172 px²; e31 «Piazzale dello stadio»×«Tribuna delle autorità» 71 px², «Curva ospiti»×«Tribuna delle autorità» 46 px²; e34 due etichette che si toccano (0 px²);
- 375×812: 2/36 — e21 «Curva Cinderwick»×«Piazza delle fonderie» 71 px²; e32 «Piazzale dello stadio»×«Strada da Cinderwick/Larkspire» 23 px²;
- 412×915: 0/36.
**Schermo:** e25 a 360: di «Piazzale dello stadio» si legge «…ELLO STADIO» (foto `etichette-360-e25.png` rigenerabile con la sonda).

### C15-05 · bassa · «Ti restano 1 Squadre»
**FATTO MISURATO.** Parte `schieramento`: dopo un tocco sulla mappa col riepilogo aperto l'avviso dice «Ti restano 1 Squadre, 6 Steward e 1 Mediatore: confermi lo stesso?». Codice: src/resa/schermate/Schieramento.tsx:119 (e :114 per l'elenco «n nome») compone `${n} ${t('risorsa.r')}` e i nomi sono fissi (data/testi/it/comune.json:9-11: «Squadre», «Steward», «Mediatore»). Con 2 mediatori uscirebbe «2 Mediatore» (IPOTESI: dipende dalle missioni con più di un mediatore, non contate).

### C15-06 · bassa · Riepilogo aperto, mappa ancora attiva
**FATTO MISURATO.** Parte `schieramento`: riepilogo aperto con 2 squadre; tocco su «Curva Larkspire» → il riepilogo passa a 3 unità e l'avviso a «Ti restano 1 Squadre…». Codice: `onSettore` resta collegato durante il riepilogo (src/resa/App.tsx:181; il riepilogo è solo un ramo di Schieramento.tsx:60). Il riepilogo si aggiorna, quindi ciò che si conferma è quello che si vede.
**IPOTESI:** un tocco involontario sulla mappa cambia lo schieramento proprio nel passo che serve a ricontrollarlo.

### C15-07 · bassa · Fiducia non visibile in sala, briefing e verbale
**FATTO MISURATO.** Parte `fiducia` (e01 a 360×760): `sala:NO briefing:NO schieramento:5 … rapporto:0 verbale:NO`. Codice: la barra si disegna solo con `schermata === 'gioco' || schermata === 'rapporto'` (src/resa/App.tsx:213).
**IPOTESI:** D-097 dice «sempre visibile durante l'episodio»; sala e briefing vengono prima che l'episodio sia avviato nel salvataggio, quindi può essere una scelta. Nel verbale manca il valore finale, che decide le stelle (stelle.tre usa `credito`).
Valori misurati corretti: D-105 rispettata (credito salvato 0/1/2/7 → barra a inizio e02: 2/2/2/7, uguale a `in_corso.variabili.credito`).

### C15-08 · bassa · Importazione: messaggio tecnico
**FATTO MISURATO.** Parte `home`: file `{"ciao": 1}` → «File non valido: save_version non valida: undefined. La partita non è cambiata.»; file con save_version 99 → «…salvataggio di una versione futura (99 > 2)…». Fonte del testo: src/salvataggi/salvataggio.ts:112-113, girato così com'è da src/resa/schermate/Archivio.tsx:14. La partita resta invariata (corretto).

### C15-09 · bassa · Principale e riserva rovinati: nessun avviso
**FATTO MISURATO.** Parte `home`: `valmora-salvataggio = "{rotto"` e `valmora-salvataggio-riserva = "{rotta"` → home senza «Riprendi», 279 caratteri, 0 errori in console, nessun avviso. Codice: src/resa/archivio.ts:64-66 (`console.warn` e `return null`).
**IPOTESI:** il giocatore crede di non aver mai giocato; la prima «Nuova partita» sovrascrive i dati senza le tre conferme (che partono solo con una partita caricata, src/resa/App.tsx:104).

### C15-10 · bassa · Realismo: steward che «sequestrano»
**FATTO MISURATO.** Testi: e03.op.steward_laser.r (data/testi/it/e03.json:38) «Gli steward trovano tre laser … Lo sequestrano lo stesso.»; e15.op.steward_sotto.r (e15.json:72) «…riemerge con due torce sequestrate»; e23.op.sirena_via (e23.json:55) «Steward a sequestrare la sirena».
**Fonte:** DM 8 agosto 2007 (steward negli impianti sportivi), testo della Prefettura: le norme «non consentono al personale addetto ai predetti servizi di portare armi o altri oggetti atti ad offendere, nè di esercitare pubbliche funzioni, riservate agli organi di polizia dello Stato» — https://prefettura.interno.gov.it/sites/default/files/57/2024-01/d.m._del_8.8.2007.pdf (testo estratto dal PDF, lettera b; numero dell'articolo: Non posso confermarlo).
**IPOTESI:** «sequestro» è un atto di polizia giudiziaria; per lo steward suonerebbe giusto «ritirare» o «far consegnare». Gli altri «sequestri» (e06 pass falsi, e13, e18, e27, cantiere di e36) non dicono chi agisce: non valutati.
Altri termini procedurali nuovi trovati (grep su tutti i testi non abbozzo): «la procura ha iscritto Tullio Varrone fra gli indagati» (e36.ch.conti_procura), «Il magistrato di turno firma la ricevuta» (e31.op.a_procura.r), «nulla osta, modulo B», «articolo dodici» (e25, struttura inventata del vertice). Per questi: Non posso confermarlo che corrispondano a procedure reali; e25 appartiene a una struttura dichiaratamente inventata (D-091).

### C15-11 · bassa, da decidere · «Ferrigno» nei dialoghi
**FATTO MISURATO.** `node coordination/sonde/c15-storia.mjs`: «Ferrigno» dentro le virgolette di un dialogo in 17 testi, es. e08.ch.dessi_chiama «Sono Ferrigno, la curva la rappresento io…», e10.ch.rispetto_trasferta «Ferrigno. Siamo in trasferta…», e12.ch.chiudiamo_citta «Ferrigno. Altro che stadio…».
**Contesto:** D-102 «Tano Ferrigno, detto il Fabbro (nome nei rapporti e nei verbali, soprannome nei dialoghi)».
**IPOTESI:** sono telefonate in cui il personaggio si presenta col cognome: può essere voluto. Lo segnalo perché la regola letterale dice il contrario; decide il PO.

---

## Verificato senza difetti (FATTO MISURATO)

1. **Storia (c15-storia.mjs):**
   - Variabili D-100: `rapporto_dessi` scritta in e08 (3 valori), letta in e10, e12, e20, e29 (10 condizioni, tutti e 3 i valori); `testimone` e18 → e19, e24, e31; `busta` e24 → e25, e31, e33; `pista_cattura` e28 → e29 (3 valori); `fascicolo` e31 (4 valori) → e34, e36 (20 condizioni); `sospetti_talpa` e01, e16, e19, e23 (+1 ciascuno) → e33 (≥2). Nessuna lettura prima della prima scrittura. Coincide con D-100 e con le descrizioni di data/stato.json.
   - Nomi: «Dessì/Dessi» 0 testi; «Sorbello» 0; «credito» 0 (D-097); Ferrigno 50, Fabbro 118, Malvasi 187, Lavezzari 63, Varrone 61 testi; nessuna variante a una lettera dei nomi (unica segnalazione «Tanto» per «Tano»: parola comune, falso positivo). Restano «Dessì» solo nelle `descrizione` interne di data/stato.json:46 e :79, che la resa non mostra (`grep -rn descrizione src/resa` → nessun uso).
   - Lunghezze D-101: 0 testi oltre 140 (introduzioni, informazioni, chiamate, commenti, opzioni, accenni, risposte, titoli d'ondata, anche le varianti @f), 0 verbali oltre 220, 36/36 introduzioni di 2 battute; 4602 chiavi citate, 0 mancanti, 0 varianti @f orfane.
2. **Finale e36 (c15-logica.mjs):** 8932 partite (4 fascicoli × fiducia d'ingresso 0…10 × bot attenta/equilibrata/peggiore + 200 semi del casuale): tutti i 12 esiti raggiunti (confermato×4: stelle 1,3; prorogato×4: 1,2,3; sostituito×4: 1,2) più degenerato (0★). Tono del titolo: confermato_* «bene», prorogato_* «medio», sostituito_* «medio», degenerato «male»; fiducia minima a inizio e36: 2. (Domanda per il PO, non difetto: «Sostituito» ha lo stesso colore di «Ancora ad interim»; nessuna decisione ne fissa il colore.)
3. **Fiducia:** barra presente in schieramento, riepilogo, chiamata, risposta, chiusura, rapporto; D-105 vedi C15-07. 3★ possibili in 36/36: lo verifica il guardiano `controllaFiduciaMinima` (tools/bot.mjs:112, catena verde in STABILITA.json su d1ada8b), non rifatto per i 36.
4. **Schieramento:** 3 tocchi → libere 4→1; «Annulla» toglie l'ultima; tocco sul segnalino (44×44 px) ritira una sola unità; «Annulla» dopo il ritiro la rimette; prima «Conferma» con unità libere → riepilogo + «Ti restano …: confermi lo stesso?», disposizione non salvata; «Torna allo schieramento» conserva lo schieramento; «Ritira tutte»; con tutte le unità usate niente avviso.
5. **Verbale vinto:** «Condividi» con Web Share → `{title:"Valmora", text:"Valmora · Ep. 01 «Primo giorno, primo derby»: Contenuto a fatica ★★☆. Ce la fai meglio di me?", url:"https://antoniovairo-rgb.github.io/valmora/"}`; senza Web Share copia testo + link e dice «Copiato: incollalo dove vuoi.»; ultimo passo: Indietro 44×44, mappa a icona 44×44 («Mappa della città»), «Prossimo episodio» 220/235/272×51 a 360/375/412, riga «Mappa: rigioca gli episodi passati.»; «Prossimo episodio» apre e02.
6. **Home:** «Esporta» → `valmora-2026-10-12.json`, JSON valido; importati sopra una partita 5 file non validi (rotto, vuoto, estraneo, versione futura, binario) → errore e salvataggio invariato; file valido: due conferme («Sostituire…?» / «Sicuro? …si perde.»), «No» al secondo passo lascia invariato, due «Sì» → «Partita importata.», persiste dopo ricarica; senza partita si importa subito; principale rovinato + riserva buona → avviso «Il salvataggio era rovinato: ho ripreso la partita dalla copia di riserva.» e principale ripristinato; «Nuova partita» con partita: 3 passi con testo crescente, «No» al terzo → titolo, partita tenuta.
7. **Salvataggi vecchi aperti con 0.7.0 (parte `vecchi`):** v1 nuova partita, v1 dopo ondata 1, v2 0.4.0 e02 in corso (tests/salvataggi-reali/), più due salvataggi **scritti dalla build 0.5.0** (2459e64, ricostruita in una cartella di lavoro, parte `genera`): e02 a metà ondata 1 (partita reale dall'interfaccia) ed e36 all'ondata 2 (registro e01…e35 iniettato, e36 avviato e giocato dall'interfaccia 0.5.0). Tutti: nessuna pagina bianca, 0 errori; e36 0.5.0 ripreso e giocato fino al verbale con esito nuovo «sostituito». Incompatibilità (salvataggio 0.5.0 modificato: risposta inesistente / missione e99) → «Il gioco è stato aggiornato: l'episodio riparte dall'inizio.» (riparte a fiducia 2) / «…l'episodio interrotto non c'è più, si riparte dalla città.». Osservazione: un episodio in corso iniziato in 0.5.0 conserva la sua fiducia (misurato 0 in e02): D-105 vale a inizio episodio, quindi coerente con la decisione.
8. **Usabilità (parte `misure`, e01 completo a 360×760, 375×812, 412×915):** 0 scorrimenti orizzontali, 0 tocchi sotto 44 px, 0 testi tagliati, 0 elementi fuori schermo, carattere minimo 12 px; scorrimento verticale massimo nelle chiamate (421 px a 360, 368 a 375, 147 a 412), con l'indicatore «Rispondi» già esistente (C09-03).

## Cosa non ho potuto verificare

- Telefono vero e app Android (Capacitor): pannello di condivisione reale, selettore di file per «Importa», download di «Esporta» su Android. Tutto misurato in Chromium headless.
- Campagna intera e01→e36 giocata dall'interfaccia: non rifatta (C-014.7 l'ha fatta sul motore); qui solo e01, e02, e36 e la sala dei 36 episodi.
- Lettura integrale della coerenza dei 4602 testi: ho letto i punti in cui si scrivono e si leggono le sei variabili e il finale; il resto non è verificato frase per frase.
- Salvataggio 0.5.0 con e36 già concluso (esito «contenuto», id che nella 0.7.0 non esiste più): non provato nell'interfaccia.
- Le procedure di C15-10 diverse dagli steward: Non posso confermarlo.
- Fuori ambito per istruzione: offline (S-22), tasti Indietro (S-21).
