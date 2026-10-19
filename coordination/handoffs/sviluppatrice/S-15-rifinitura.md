# S-15 · Rifinitura e25–e36 (D-189, PO-141, PO-039)

Partenza: `claude/valmora-l1-setup-schema-xdrbx7` @ 4f09545. Ramo: `claude/valmora-rifinitura-s3`.
File di dati toccati: solo e25–e36 (missioni e testi), `data/stato.json`, `data/testi/it/epilogo.json`,
`data/testi/it/cons_s3.json` (titoli dei 3 esiti nuovi di e33). Nessun file di e10–e24 (blocco di S-13).

## 1. La regola 1 contro D-160: misura, e applicazione di D-190

**FATTO MISURATO.** Delle opzioni dove il testo promette protesta/costo/apprezzamento non applicato, tutte quelle
delle schede e25–e36 (43, elenco sotto) sono fra le 224 risposte da cui D-160/D-169 ha **tolto** la fiducia
(`tests/dati/fiducia-d160.json`). Rimettere ±1 su quelle opzioni:
- fa rosso il guardiano statico `tests/fiducia-verso.test.ts:29-32` («le 224 risposte corrette non toccano la fiducia»);
- porta le opzioni nel verso sbagliato da **12 a 33** con soglia **30** (`tests/fiducia-verso.test.ts:14`, 200 partite
  per episodio, `perverseRapide`): rosso;
- porta Δ fiducia media nelle fallite di e35 a **+0,15** (> 0, guardiano D-180): rosso.

Comando: `node tools/misura-s15-conflitto.mjs` (variante solo in memoria: le 43 opzioni con l'effetto promesso, stessi semi
di `tools/misura-fiducia.mjs`). Delle 43, 21 diventano «perverse» da sole:
e25 percorso_corto (z −2,08), steward_sedie (−2,98), trattieni_treno (−3,13); e27 steward_rovers (−2,58), lascia_video (−4,42);
e28 smentisci (−3,85), fonti_protette (−3,60); e29 niente_annuncio (−3,59), sospendi_partita (−2,28);
e30 parla_club (−2,33), corsia_auto (−2,54), accetta_incontro (−3,92), niente_sanzioni (−2,43);
e31 copia_prima (−3,55), manda_vice (−3,04); e32 sospendi (−2,34); e33 steward_fumo_ospiti (−4,13), chiudi_occhio (−2,28);
e34 uscita_laterale (−2,61), ignora_coro (−2,26); e36 comando_conti/frase_dura (−3,44).
Le altre 22 (non perverse da sole): e26 corridoio +1, ingresso_laterale, sposta_ospite, premiazione_tribuna, niente_foto,
spegni_schermo; e27 sala_attesa; e28 chiedi_club, niente_settore; e29 in_fondo; e31 dai_cronista, a_stampa;
e32 ferma_larkspire, luci, nessun_nome; e35 ferma_uomo +1, lascia_partire, ferma_barca +1; e36 portavoce_smentisce,
procura/stampa/comando_frase_dura.
Nota: anche due patti della regola 2 sono fra le 224 (e30 parla_club, accetta_incontro) e la frase dura di e36.

**Esito (D-190, scelta del PO trasmessa dalla principale il 2026-10-19):** dove la risposta è nell'elenco D-160 non si
mette il ±1, si corregge il testo del costo perché non prometta più un prezzo in fiducia; dove non è nell'elenco il ±1 si
applica. Fatto:
- **50 righe di costo riscritte** (e25 3, e26 10, e27 3, e28 4, e29 3, e30 5, e31 6, e32 3, e33 1, e34 3, e35 7, e36 2),
  tutte su risposte dell'elenco D-160; la protesta resta racconto («protesta a voce, e finisce lì») o il testo dice cosa
  succede. Ricerca: `node tools/misura-s15-promesse.mjs` (regex su fiducia/apprezza/gradisce/protesta/perdona/offende/annota/
  conto/favore/ricorda nelle righe di costo di risposte senza effetto sulla fiducia): restano solo testi dove la
  conseguenza è la pressione o tensione («si offende e sale») o dove il conto arriva davvero più avanti (e31 a_stampa →
  e36 conto_stampa −1).
- e35 ferma_uomo / lascia_partire: il costo non promette più l'apprezzamento del comando; il seguito vero è in e36
  (faldoni_fermati +1, faldoni_persi −1).
- Fuori dall'elenco D-160 il ±1 si applica: e29 parola_fabbro e e34 accetta_steward (−1, §2). Altre risposte fuori
  dall'elenco con un prezzo promesso e non applicato in e25–e36: nessuna trovata dalla ricerca sopra.

## 2. Modifiche fatte (file:riga prima → dopo)

| Caso | Prima | Dopo |
|---|---|---|
| e25 raccordo con e24 + Struttura chiusa | T e25:4 «…Scommetto che resta anche dopo.» | T e25:4 «Il titolo è andato, la busta pesa ancora: la posta l'ho alzata. … Per tre giorni, la Struttura decide.» |
| e25 verbali | T e25:115-117 («le regole restano anche dopo», «chiede più poteri…») | T e25:115-117: la Struttura smonta le transenne, il vertice è finito |
| e26 cravatta (regola 3, neutro) | T e26:3 «Non l'ha mai avuta» | T e26:3 «di nuovo la cravatta, come all'ultima giornata» |
| e27 biglietto del porto (neutro) | T e27:122 «il biglietto del porto in un cassetto a parte» | T e27:122 «segna l'indirizzo del porto sulla cartina» |
| e29 briefing falso di Lavezzari (doppione) | M e29 briefing `vera: false`, T e29:8 «Garantisco io» | M e29:41 `vera: true`, T e29:8 informazione vera («In curva sanno già che stasera succede qualcosa», cfr. T e29:57) |
| e29 patto col Fabbro (regola 2) | M e29:861 parola_fabbro −3 P, «senza costi» | M e29:861 −3 P, **−1 fiducia**; T e29:158 «patto col Fabbro… costa fiducia» |
| e29 «non è uscita» (neutro) | T e29:135 | T e29:135 «ma la città ha tenuto» |
| e33 nome solo con prova | M e33:441 nome_talpa senza condizioni | M e33:441 `dopo.mai ordini_puliti`; M e33:485 nome_busta (busta tenuta, senza trappola); M e33:529 sospetto_talpa (senza prova); M e33:685/742 la fuga solo con la prova; M e33:876 3 esiti «_sospetto» (stessi `se` + busta non tenuta + `dopo.gia ordini_puliti`) |
| e33 treno di mezzanotte (doppione di e31) | M e33:714 treno_mezzanotte | M e33:839 varchi_stazione: gli steward dell'agenzia del Kiln lasciano i varchi; stessi effetti (−2/+2 P stazione); ondata 4 «La fuga» |
| e34 steward della commissione (regola 2) | M e34:285 accetta_steward +2 steward | M e34:285 +2 steward, **−1 fiducia**; T e34:39 |
| e35 variabile «carte» | — | `data/stato.json:102` enum nessuna/fermate/perse; M e35:684 ferma_uomo → fermate, M e35:704 lascia_partire → perse |
| e36 fili sulla carriera | M e36: varianti su Varrone con effetti identici | M e36:843 conto_procura (+1 testimoniando, 0 lasciando le carte: con +1 su tutte e due «sostituito_procura» non era più raggiungibile dai bot, rosso del passo «bot» al pre-push), :879 conto_stampa (−1, il «conto» promesso da T e31:130), :915 faldoni_fermati (+1), :951 faldoni_persi (−1); solo fiducia, nessuna pressione |
| e36 busta | T e36:119 la risposta rivela «Non dura» | T e36:119 «Te lo dico a verbale»; 13 verbali (T e36:123-135) svelano «Non dura» con la battuta (perde e paga / vince e paga lo stesso / degenerato senza «resta chiusa») |
| Epilogo | `src/logica/epilogo.ts:11-13` sei scelte | + `carte` (FILI, EPILOGO); testi `epilogo.json:54-57` |

Scelte tecniche dichiarate:
- Le varianti su Varrone pesano con chiamate nuove di sola fiducia, non sulle opzioni frase_dura/frase_neutra: quelle sono
  fra le 224 di D-160 (vedi §1). Le opzioni senza pressione non possono essere «perverse» (z ≈ 0).
- `carte` non cambia SAVE_VERSION: il completamento C14-03 (`src/logica/aggiornamento.ts:1-4`) dà il valore iniziale
  ai salvataggi vecchi; provato sui salvataggi reali v2-0.38.0 e v2-0.4.0 (test sotto).
- e33 treno: gli id cambiano (varchi_stazione/copri_varchi); la voce `e33/treno_mezzanotte/trattieni_mezzanotte` del
  registro D-160 è rinominata in `e33/varchi_stazione/copri_varchi` (stesso numero di voci, 224; nessuna soglia toccata).
- `mostra_busta` di e25 resta gratis (premio di una scelta precedente, regola 1).
- Testo di e35 ferma_uomo («Il comando apprezza») ora ha un seguito in e36 (faldoni_fermati +1).

## 3. Guardiani

- `tests/coerenza-d153.test.ts`: REGISTRO + nome_talpa, sospetto_talpa, talpa_scappa; TESTI + e27 verbale, e29 verbale,
  e26 intro, e36 apri_ora.r. Braccio rosso esistente (__NO_C153D01).
- `tests/rifinitura-s15.test.ts` (nuovo): e33 nome solo con prova (verde: smentite 0; rosso __NO_S15T01 > 10);
  carte impostata/letta/epilogo; salvataggi reali completati (rosso __NO_C14V01); fiducia di e36 spostata dai fili di
  ±2 con l'attenta (rosso __NO_S15C01: uguale); busta solo nei verbali; patti e29/e34 a pagamento.
- `tests/epilogo.test.ts:51`: la partita A-Z vera ora mostra anche `['carte', 'nessuna']`.
- `src/logica/confronti.json` rigenerato (`node tools/confronti.mjs`, D-174).

## 4. Misure col bot (`node tools/misura-s15.mjs 1000 300`, prima su 4f09545, dopo su questo ramo)

Fallite del casuale (%, 1000 partite), e25→e36:
- prima: 60,9 61,5 67,4 67,2 67,3 67,0 66,5 66,5 **69,6** 70,5 74,0 76,5
- dopo:  60,9 61,5 67,4 67,2 67,3 67,0 66,5 66,5 **68,1** 70,5 74,0 76,5 — curva D-154/D-108: **verde** prima e dopo.

Esiti/stelle per strategia: invariati in e25–e32, e34–e36 (le modifiche lì toccano fiducia in rami che il bot isolato
non vede, o testi). e33 casuale prima: degenerato 696, a fatica 288, contenuto 16; dopo: degenerato 376 + 305 «sospetto»,
a fatica 120 + 182 «sospetto», contenuto 7 + 10 «sospetto»; stelle 0/1/2/3 prima 696/288/13/3, dopo 681/302/15/2.
Attenta, equilibrata, peggiore: invariate in tutti e 12 (attenta e33 contenuto 2★; equilibrata 3★; peggiore degenerato).
Stelle D-181: 3★ dell'attenta invariate negli episodi e25–e36.

Fiducia D-160: opzioni nel verso sbagliato 12 → 12 (soglia 30); Δ fallite > 0: nessun episodio prima e dopo;
correlazione fiducia/fallita ≥ 0: nessun episodio prima e dopo.

Carriere (campagna e01→e36, 300 campagne per strategia, episodio fallito rigiocato fino a 5 volte):
| strategia | prima | dopo |
|---|---|---|
| casuale | confermato 208, ad interim 11, sostituito 0, degenerato 81 | confermato 204, ad interim 21, sostituito 1, degenerato 74 |
| attenta | confermato 300 | confermato 300 |
| equilibrata | confermato 300 | confermato 300 |
| peggiore | degenerato 300 | degenerato 300 |
Ripartizione per fili in `dopo.json` (campo `carriere.*.perFili`). IPOTESI: le strategie deterministiche arrivano a e36
con fiducia alta (≥ 8), quindi ±2 dei fili non le sposta; il peso dei fili si vede sul casuale.

## 5. Non verificato

- Resa a schermo dei testi nuovi (e33 chiamate nuove, e36 quattro chiamate, epilogo «carte») a 360/375/412 px: non fotografata.
- `finale.talpa.*` dice «Lavezzari è caduto» anche quando in e33 resta un sospetto: la caduta può venire dopo (inchiesta
  di e35–e36), ma nessun testo lo dice. Non corretto (fuori dalle schede).
- e28 «quattro voci» contro tre chiamate (nota minore della scheda): non toccato.
- Corteo di ritorno di e33 (M e33 viale_ritorno), simile a e31: la scheda lo cita, D-189 nomina solo il treno; non toccato.
- La ricerca delle promesse è per parole chiave: una promessa scritta con altre parole può essere sfuggita.
