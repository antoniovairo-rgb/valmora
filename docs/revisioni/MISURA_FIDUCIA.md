# MISURA S-04 · La fiducia segue le scelte? (D-155)

Sessione di misura S-04, ramo `claude/valmora-misura-fiducia`, partito da `ab5f05f` (ramo `claude/valmora-l1-setup-schema-xdrbx7`). Sola misura: `data/`, `src/` e i test esistenti non sono stati toccati. Strumento nuovo: `tools/misura-fiducia.mjs` (logica pura, casualità solo da `creaCaso`, nessun `Math.random`).

**Comando:** `node tools/misura-fiducia.mjs 1000 coordination/sonde/uscite-s04/misura-fiducia.json` → uscita 0, 7 min 50 s; uscita completa in `coordination/sonde/uscite-s04/misura-fiducia.json` (per ogni episodio, bot, opzione e variante) e `misura-fiducia.log`.
**Controllo incrociato:** le fallite del bot casuale coincidono con `node tools/bot.mjs 1000` (e01 543/1000 = 54,3 %, e02 549 = 54,9 %, e03 548 = 54,8 %, e21 597 = 59,7 %, e28 627 = 62,7 %): stessi semi `${id}:casuale:${seme}`, quindi le stesse partite su cui lavora `controllaDifficolta` (`tools/passi-logica.mjs:26`).

# 0. In breve (FATTO MISURATO)

- **La fiducia finale non dice se hai vinto o perso.** Bot casuale, 36 episodi × 1000 partite: la correlazione fra fiducia finale e «episodio fallito» ha mediana **−0,011** (da −0,18 a +0,136; positiva, cioè più fiducia quando perdi, in **15/36** episodi). In **15/36** episodi le partite fallite finiscono con una variazione di fiducia media **uguale o migliore** delle riuscite; in **12/36** le fallite in media **guadagnano** fiducia (e35 +1,46; e26 +1,73; e15 +1,61).
- **Le risposte spingono quasi sempre dalla parte sbagliata.** Delle 521 opzioni che muovono la fiducia, 182 hanno un effetto misurabile sull'esito (criterio al § 3). Di queste, **155 (85 %) muovono la fiducia nel verso opposto al risultato** (71 la danno a scelte che fanno perdere più spesso, 84 la tolgono a scelte che fanno perdere meno); solo **27** vanno nel verso giusto. Sono in 113 chiamate su 361, in 27 episodi su 36.
- **Chi gioca meglio sul campo ha meno fiducia.** Bot deterministici, fiducia finale media sui 36 episodi: attenta (migliore sul campo, ignora la fiducia) **4,44**, peggiore (perde sempre) **3,39**, equilibrata **8,53**. La peggiore finisce con fiducia **≥ attenta in 12/36** episodi; l'attenta vince con fiducia **< 3** in 6 episodi e quindi non può avere l'esito «contenuto» (es. e03: tensione minima, fiducia 1, «contenuto a fatica»).
- **Il premio d'ondata (D-113) va nel verso giusto ma è più piccolo delle risposte.** Casuale: le risposte spostano in media da −2,29 (e06) a +2,75 (e35) punti, le ondate da −1,15 a +0,06. Peggiore: risposte da +1 a **+10** (e22), ondate da −4 a −10.
- **I due casi del collaudo si riproducono** (§ 2): e28 5 → **9** con l'episodio perso (+6 da quattro risposte, −2 dalle ondate); e03 −2 per i rinforzi, che nella misura non cambiano l'esito.
- **Nessuna delle tre correzioni misurate peggiora la curva di difficoltà** oltre quello che è già rotto oggi (6 cadute oltre 1 punto, tutte nelle stagioni 2-3, già note per D-154), tranne la C che ne aggiunge una (e33). Raccomandazione al § 4: **A**.

# 1. Dove nasce e dove cambia la fiducia (FATTO, codice)

| Cosa | Dove |
|---|---|
| Variabile `credito` (nei testi «fiducia», D-097): int 0-10, iniziale 5 | `data/stato.json:12-18` |
| Nome nel motore `VAR_FIDUCIA = 'credito'`; minimo a inizio episodio `FIDUCIA_MIN = 3` (D-105, D-110) | `src/logica/missione.ts:23-24`, applicato da `fiduciaMinima` `src/logica/missione.ts:57-61` in `iniziaMissione` `:69` |
| Effetto delle risposte (`aggiungi: credito`) | `rispondi` `src/logica/missione.ts:168` → `applicaEffetto` `:154-166` → `applica` `src/logica/condizioni.ts:17-24` (taglio a 0-10) |
| Premio dell'ondata (D-113): +1 se nessun settore scoperto, −1 per ogni settore scoperto con tensione ≥ 7 (`DEGENERA`, `:20`) | `src/logica/missione.ts:213-217`, applicato a `:225`; rosso `__NO_PO094` |
| Effetti degli esiti | `concludiMissione` `src/logica/missione.ts:265-273`: **nessun esito dei 36 episodi tocca la fiducia** (misura: «da esito» = 0 in tutte le partite) |
| Dove la fiducia conta | stelle: `stelle.tre` = tensione ≤ 3 **e** fiducia ≥ 5 (36/36 episodi); esito `contenuto` richiede fiducia ≥ 3 (e01-e35), e36 ≥ 6 per «confermato»; chiamate con condizione: e33 `parcheggio_vuoto` (≥ 5), e34 `fiducia_comando` (≥ 7) e `osservatore` (≤ 3). **L'esito «degenerato» (fallito) dipende solo dalla tensione** (> 6), mai dalla fiducia |
| Bot che la pesa | `equilibrata`, `PESO_CREDITO = 60` `src/logica/bot.ts:20-28` |

**Opzioni che la muovono, per episodio:** 610 effetti in tutto nei dati (comando nel § 6), elenco completo per episodio in `coordination/sonde/uscite-s04/opzioni-fiducia.txt` (formato `ondata chiamata/opzione ±valore`). Nessun esito ha effetti sulla fiducia; i ±2 sono 56.

# 2. I due casi del collaudo C-036

Scelte vere dal giornale del collaudo (`origin/claude/valmora-collaudo-c36:coordination/sonde/uscite-c36/giocatore/giornale.jsonl`, tocchi `data-opzione` fra un `avvia-episodio` e il successivo), rigiocate con lo schieramento del bot attento (lo schieramento vero non è ricostruito, vedi «Non verificato»): `rigioca()` in `tools/misura-fiducia.mjs`. Tutte le 12 risposte di ciascun episodio sono state usate (nessun ripiego).

**e28 (sbagliato apposta) · FATTO MISURATO: 5 → 9, episodio perso** (`collaudo.e28` nel JSON):

| Passo | Fiducia | Effetto misurato dell'opzione (attento + scelte a caso, 1000 partite) |
|---|---|---|
| o1 `ospiti_in_auto/lascia_auto` | **+2** (anche +3 pressione su strada) | fallite 22,7 % se scelta contro 24,9 % (z −0,78): **nessun effetto misurabile** |
| o2 `mossgarth_rumore/apri_settore` | **+1** (+2 pressione piazzale) | fallite **29,2 %** contro 19,9 % (z 3,44): **premia una scelta cattiva** |
| o3 `cronista_voci/lascia_intendere` | **+1** (+2 pressione banchine) | fallite **36,7 %** contro 17,5 % (z 6,74): **premia una scelta cattiva** |
| o3 ondata: banchine degenerate | −1 | (nel collaudo vero −2, due settori degenerati) |
| o4 `rapporto_comando/nomi_fonti` | **+2** (+2 pressione banchine) | fallite **32,4 %** contro 15,8 % (z 6,14): **premia una scelta cattiva** |
| o4 ondata: un settore degenerato | −1 | |
| **Totale** | **+6 dalle risposte, −2 dalle ondate = 9** | il collaudo dice 9/10 al fallimento: **riprodotto** |

Da dove viene: in e28 le risposte «politiche» danno fiducia e **insieme** alzano la pressione di un settore. È un baratto voluto nei dati (fiducia contro campo), ma i numeri dicono che il baratto non si paga: il premio d'ondata toglie al massimo 1 punto per settore degenerato, le risposte ne danno fino a 6.

**e03 (giocato bene) · FATTO MISURATO** (`collaudo.e03`): risposte −1 `torcia_casa/steward_torcia`, **−2 `supplementari/rinforzi_notte`**, −1 `rigori_curve/cordone_curve`, +1 `troupe_notte/commento_tv` = **−3**. Il salvataggio finale del collaudo dice fiducia **2** dopo e03 (`salvataggio-finale.json`, `episodi.e03.variabili_dopo.credito`), cioè 5 − 3 con nessun premio d'ondata (il collaudo ha avuto un settore scoperto in tutte e quattro le ondate). Il rapporto del collaudo scrive «5 → 1»: **Non posso confermarlo**, il salvataggio dice 2. Nel rigioco con lo schieramento attento l'ondata 2 è senza scoperti (+1) e si arriva a 3.
- `rinforzi_notte` (+2 squadre per il resto della missione, −2 fiducia): con lo schieramento attento le fallite sono **0 % in entrambi i casi** (e03 non si perde mai con l'attento) e la tensione finale media è **3,38 contro 3,41**: i rinforzi **non cambiano il risultato misurabile** ma costano il massimo che un'opzione può togliere. Non è «punire una scelta buona» secondo il criterio del § 3 (manca l'effetto sull'esito), è **un costo senza contropartita misurabile**.
- `cordone_curve` −1: tensione 3,22 contro 3,57; `steward_torcia` −1: 3,05 contro 3,72. Sono le due risposte che abbassano di più la tensione nella loro chiamata, e costano fiducia.

# 3. Dove la fiducia premia le scelte cattive o punisce le buone (FATTO MISURATO)

**Criterio (dichiarato, scelto da me):** bot «schieramento attento + risposte a caso» (lo schieramento non dipende dalle risposte, quindi la differenza viene dalle risposte; stesso disegno di `sceltePesano`, `tools/bot.mjs`), 1000 partite per episodio. Per ogni opzione: fallite quando la scegli contro fallite quando nella stessa chiamata scegli un'altra opzione. «Effetto misurabile»: almeno 50 partite per lato, differenza ≥ 5 punti e |z| ≥ 2 (test di due proporzioni). «Perversa»: la fiducia sale con un'opzione che fa perdere di più, o scende con una che fa perdere di meno.

| | Opzioni |
|---|---|
| Opzioni con effetto sulla fiducia misurate | 521 (le altre 89 non sono mai comparse con questo bot o hanno una sola alternativa offerta) |
| Senza effetto misurabile sull'esito | 339 |
| Coerenti (fiducia nel verso del risultato) | **27** |
| **Perverse** | **155**: 71 «+ a scelta cattiva», 84 «− a scelta buona» (in 113 chiamate, 27 episodi) |

Nelle chiamate a due opzioni le perverse vengono a coppie (es. `e12/salvezza`: `fiducia12` +1 con fallite 31,6 % contro `cordone12` −1 con 2,4 %). Le più forti (tutte le 155 sono nella tabella dell'appendice A e nel JSON, campo `perverse`):

| Opzione | Fiducia | Fallite se scelta | Fallite con le altre | z |
|---|---|---|---|---|
| e05 `torce5/lascia_torce` | +1 | 46,7 % | 4,8 % | 6,13 |
| e02 `fumogeni_ospiti/lascia_fumo2` | +1 | 36,6 % | 3,6 % | 13,92 |
| e15 `fumo_verde/lascia_verdi` | +1 | 33,4 % | 1,0 % | 14,97 |
| e12 `salvezza/fiducia12` / `cordone12` | +1 / −1 | 31,6 % / 2,4 % | | ±12,38 |
| e36 `cantiere_notte/muri_liberi` | +1 | 30,7 % | 6,4 % | 9,80 |
| e31 `comando_vuole/consegna_comando` / `copia_prima` | +1 / −1 | 25,1 % / 4,2 % | | ±9,38 |
| e34 `uscita_commissione/accompagna_commissione` | **+2** | 13,9 % | 0 % | 8,78 |
| e13 `patto_dessi/accetta_dessi` | **−2** | 3,7 % | 20,0 % | −8,00 |
| e01 `rinforzi/chiedi` | **−2** | 3,7 % | 15,9 % | −6,37 |
| e02 `fumogeni_ospiti/sospendi2` | **−2** | 3,7 % | 20,1 % | −6,89 |
| e15 `fumo_verde/pausa15` | **−2** | 1,2 % | 17,1 % | −7,43 |

Casi di episodio intero (appendice B, C, D):
- **Fallite che guadagnano fiducia in media (casuale):** e09 +1,02, e13 +1,18, e14 +0,96, e15 +1,61, e16 +1,28, e17 +0,09, e18 +1,23, e21 +0,83, e26 +1,73, e28 +0,51, e30 +0,02, e35 +1,46 (12/36). Con «attento + scelte a caso» sono 31/36.
- **Fallite con Δ fiducia ≥ riuscite:** casuale 15/36; attento + scelte a caso 21/36 (es. e34: fallite +3,43 contro riuscite +1,86; e23 +2,38 contro +0,84).
- **Peggiore con fiducia ≥ attenta:** e01 4≥2, e04 6≥4, e07 3≥2, e08 4≥1, e12 4≥2, e14 5≥2, e17 5≥5, e20 4≥3, e23 5≥3, e25 6≥4, e26 7≥4, e33 4≥3.
- **Attenta che vince ma non può avere «contenuto» (fiducia < 3):** e01 2, e03 1, e07 2, e08 1, e12 2, e14 2.

**IPOTESI (non misurata):** «scelta buona» qui vuol dire «fa perdere meno spesso sul campo». Una parte delle opzioni perverse è un baratto narrativo voluto (il comando o il club ti apprezzano per una scelta rischiosa); la misura non dice se il baratto è giusto per la storia, dice solo che oggi la fiducia non lo fa pagare.

# 4. Correzioni possibili (simulate in memoria, stessi semi, 1000 partite per episodio)

Ogni variante cambia i dati o il premio solo in memoria dentro `tools/misura-fiducia.mjs` (`VARIANTI`); nulla su disco.

| Variante | Cadute D-108/D-154 (casuale, > 1 punto) | r(fiducia, fallita) casuale, mediana | Episodi con fallite ≥ riuscite (casuale) | Fiducia media attenta / equilibrata / peggiore | 3★ equilibrata / attenta | 3★ attento + scelte a caso (media %) |
|---|---|---|---|---|---|---|
| **oggi** | 6 | −0,011 | 15 | 4,44 / 8,53 / 3,39 | 30 / 14 | 26,7 |
| **A** azzerare la fiducia delle 155 opzioni perverse | 6 (le stesse) | **−0,200** | **4** | **6,03** / 8,94 / **2,08** | **35** / **28** | 30,8 |
| **B** risposte al massimo ±1 (i 56 ±2 diventano ±1) | 6 (le stesse) | −0,045 | 10 | 4,89 / 8,39 / 3,17 | 32 / 19 | 29,2 |
| **C** premio d'ondata più forte: +1 senza scoperti, −1 per scoperto, −2 per degenerato | **7** (in più e33 65,4 % < e32 66,8 %) | −0,127 | **0** | 3,14 / 6,14 / **0,00** | 25 / 9 | 14,1 |

Le 6 cadute di oggi sono e16 < e15, e20 < e19, e21 < e20, e23 < e22, e28 < e27, e30 < e29 (tutte stagioni 2-3, già aperte per D-154); A e B lasciano tutte le fallite del casuale invariate tranne e33 (+0,7 / +0,3 punti) ed e34 (+0,5), gli unici episodi con chiamate legate alla fiducia. Motivo (FATTO, § 1): il fallimento dipende solo dalla tensione, la fiducia la tocca solo attraverso quelle chiamate.

**A · Azzerare la fiducia delle opzioni perverse (dati).**
- Costi: 155 opzioni in 27 episodi di `data/missioni` (zona delle sessioni dati) e i loro testi «costo» in `data/testi` che oggi annunciano la fiducia; da rifare la taratura delle 3★ (attenta da 14 a 28/36, equilibrata 35/36: le 3★ diventano molto più facili, quindi forse `stelle.tre` con fiducia ≥ 6, da misurare); la lista dipende dai dati di oggi e va ricalcolata se cambiano (lo strumento la produce).
- Effetto: la fiducia comincia a seguire il risultato (correlazione da −0,011 a −0,200; la peggiore scende a 2,08, l'attenta sale a 6,03); difficoltà invariata.
- Limite: le 155 sono state scelte con lo stesso bot che poi misura le «residue» (0, circolare); i numeri indipendenti sono quelli del casuale e dei deterministici.

**B · Risposte al massimo ±1 (dati, meccanica).**
- Costi: 56 effetti, una regola sola, i testi «costo» dei ±2 da rileggere; si può proteggere con un guardiano di schema.
- Effetto: piccolo (correlazione −0,045, fallite ≥ riuscite da 15 a 10 episodi). Risolve la misura di e03 (rinforzi −1) ma non il verso: e28 farebbe 5 → 7 invece di 9 (IPOTESI, conto a mano: +1 +1 +1 +1 −2).

**C · Premio d'ondata più forte (motore, rivede D-113).**
- Costi: una riga in `src/logica/missione.ts:217` più il suo rosso, il testo del rapporto dell'ondata, il guardiano `tests/fiducia-risultato.test.ts`; la regola D-113 è del PO.
- Effetto: nessun episodio con fallite ≥ riuscite, ma schiaccia: la peggiore finisce a 0, le 3★ crollano (attenta 9/36, equilibrata 25/36) e aggiunge una caduta D-108 (e33). Per contro non tocca nessuna risposta.

**Raccomandazione: A**, perché è l'unica che corregge le risposte stesse (la causa misurata di e28) senza toccare la curva di difficoltà, a patto di ritarare le 3★ nella stessa consegna. B è la scelta da prendere se il PO vuole un intervento piccolo subito, sapendo che il verso resta sbagliato. C la sconsiglio così com'è: ferma i casi «perdo con la barra piena» ma rende la fiducia quasi solo un conto dei settori scoperti. Una via di mezzo fra A e C (es. −1 per scoperto senza −2 per degenerato) **non è misurata**.

# 5. Non verificato

- **Schieramento vero del collaudo:** non ricostruito dai tocchi (`data-risorsa`/`data-settore` non dicono le rimozioni); nel rigioco c'è lo schieramento attento. Le risposte sono le stesse, i premi d'ondata no (e28 −2 in entrambi i casi, e03 +1 nel rigioco contro 0 del collaudo).
- **«Fiducia 5 → 1» in e03** (rapporto C-036): il salvataggio dice 2. Non posso confermarlo.
- **Campagna:** ogni episodio parte dalle variabili iniziali (fiducia 5), come `tools/bot.mjs`; le combinazioni di storia di D-106 (es. `fascicolo` in e36) non sono rigiocate. Con la fiducia portata da un episodio all'altro (minimo 3) i numeri possono cambiare.
- **Bot contro persone:** «scelta buona» = fa perdere meno spesso con questi bot. Come giudica una persona, no.
- **Varianti:** solo simulate; nessuna catena sui dati cambiati, nessun testo «costo» riletto, nessuna foto.
- **Soglie del criterio** (≥ 5 punti, |z| ≥ 2, ≥ 50 partite): scelte da me; con 521 confronti alcuni falsi positivi a |z| ≈ 2 sono attesi (circa 5 %, IPOTESI statistica standard). Delle 155, 75 hanno |z| ≥ 5 e 17 hanno |z| < 3.

# 6. Come rifare la misura

```
node tools/misura-fiducia.mjs 1000 coordination/sonde/uscite-s04/misura-fiducia.json   # 7 min 50 s
node tools/bot.mjs 1000                                                                  # controllo delle fallite del casuale
```
Elenco delle opzioni con fiducia: `coordination/sonde/uscite-s04/opzioni-fiducia.txt` (comando in testa al file).

# Appendici

## A. Le 155 opzioni perverse (attento + scelte a caso, 1000 partite per episodio; ordinate per differenza di fallite)

| opzione | fiducia | n (altre) | fallite se scelta | fallite altre | z | tensione se / altre |
|---|---|---|---|---|---|---|
| e05/torce5/lascia_torce | +1 | 75 (84) | 46.7 | 4.8 | 6.13 | 6.28 / 4.65 |
| e02/fumogeni_ospiti/lascia_fumo2 | +1 | 336 (664) | 36.6 | 3.6 | 13.92 | 5.9 / 4.29 |
| e15/fumo_verde/lascia_verdi | +1 | 329 (671) | 33.4 | 1 | 14.97 | 5.83 / 4.05 |
| e12/salvezza/fiducia12 | +1 | 491 (509) | 31.6 | 2.4 | 12.38 | 5.74 / 3.76 |
| e12/salvezza/cordone12 | -1 | 509 (491) | 2.4 | 31.6 | -12.38 | 3.76 / 5.74 |
| e36/cantiere_notte/muri_liberi | +1 | 515 (485) | 30.7 | 6.4 | 9.8 | 5.55 / 4.28 |
| e12/salvi/festa_pista | +1 | 504 (496) | 27.4 | 5.8 | 9.13 | 5.3 / 4.16 |
| e31/comando_vuole/copia_prima | -1 | 505 (495) | 4.2 | 25.1 | -9.38 | 3.97 / 5.34 |
| e31/comando_vuole/consegna_comando | +1 | 495 (505) | 25.1 | 4.2 | 9.38 | 5.34 / 3.97 |
| e28/cronista_voci/lascia_intendere | +1 | 349 (651) | 36.7 | 17.5 | 6.74 | 5.79 / 4.97 |
| e28/due_fonti/due_piste | -1 | 328 (672) | 12.5 | 29.9 | -6.04 | 4.68 / 5.54 |
| e07/coro_imparato/spiega_coro | -1 | 507 (493) | 3.9 | 21.1 | -8.23 | 4.37 / 5.46 |
| e36/cantiere_festa/cartellone_regalo | +1 | 325 (675) | 30.5 | 13.3 | 6.48 | 5.57 / 4.63 |
| e02/fumogeni_ospiti/steward_fumo | -1 | 336 (664) | 3.6 | 20.3 | -7.07 | 4.36 / 5.07 |
| e28/rapporto_comando/nomi_fonti | +2 | 506 (494) | 32.4 | 15.8 | 6.14 | 5.81 / 4.68 |
| e28/rapporto_comando/fonti_protette | -1 | 494 (506) | 15.8 | 32.4 | -6.14 | 4.68 / 5.81 |
| e31/treni_tardi/trattieni_treno | -1 | 505 (495) | 6.3 | 22.8 | -7.41 | 4.01 / 5.3 |
| e02/fumogeni_ospiti/sospendi2 | -2 | 328 (672) | 3.7 | 20.1 | -6.89 | 4.22 / 5.13 |
| e15/salutarli/fidati15 | +1 | 504 (496) | 19.8 | 3.4 | 8.07 | 4.87 / 4.4 |
| e15/salutarli/chiudi_settore | -1 | 496 (504) | 3.4 | 19.8 | -8.07 | 4.4 / 4.87 |
| e13/patto_dessi/accetta_dessi | -2 | 510 (490) | 3.7 | 20 | -8 | 3.97 / 5.01 |
| e13/patto_dessi/rifiuta_dessi | +1 | 490 (510) | 20 | 3.7 | 8 | 5.01 / 3.97 |
| e15/fumo_verde/pausa15 | -2 | 340 (660) | 1.2 | 17.1 | -7.43 | 4 / 4.96 |
| e32/giornalisti_derby/lasciali_piazzale | +1 | 479 (521) | 21.7 | 6 | 7.29 | 5.32 / 4.25 |
| e07/pareggio_casa/squadra_larkspire7 | -1 | 500 (500) | 4.8 | 20 | -7.29 | 4.34 / 5.47 |
| e01/troupe/niente | -1 | 525 (475) | 3.2 | 17.9 | -7.65 | 3.99 / 4.94 |
| e01/troupe/intervista | +1 | 475 (525) | 17.9 | 3.2 | 7.65 | 4.94 / 3.99 |
| e29/speaker_partita/niente_annuncio | -1 | 492 (508) | 2.8 | 17.3 | -7.56 | 4.05 / 4.79 |
| e29/speaker_partita/annuncio_generico | +1 | 508 (492) | 17.3 | 2.8 | 7.56 | 4.79 / 4.05 |
| e36/busta/ultimo_giro | -1 | 511 (489) | 11.9 | 26.2 | -5.75 | 4.32 / 5.58 |
| e07/pupazzo/lascia_pupazzo | +1 | 528 (472) | 19.1 | 4.9 | 6.83 | 5.35 / 4.41 |
| e28/cronista_voci/smentisci | -1 | 331 (669) | 14.8 | 28.8 | -4.88 | 4.68 / 5.54 |
| e34/uscita_commissione/uscita_laterale | -1 | 518 (482) | 0 | 13.9 | -8.78 | 3.36 / 4.27 |
| e34/uscita_commissione/accompagna_commissione | +2 | 482 (518) | 13.9 | 0 | 8.78 | 4.27 / 3.36 |
| e04/verdura/rassicura | +1 | 318 (330) | 21.7 | 7.9 | 4.97 | 4.99 / 4.26 |
| e33/mossgarth_fumo/steward_fumo_ospiti | -1 | 511 (489) | 5.7 | 19.2 | -6.52 | 3.52 / 4.83 |
| e33/mossgarth_fumo/lascia_fumo_ospiti | +1 | 489 (511) | 19.2 | 5.7 | 6.52 | 4.83 / 3.52 |
| e34/ultimo_coro/saluta_curva | -1 | 498 (502) | 0 | 13.3 | -8.44 | 2.94 / 4.66 |
| e04/fumo_arancio/steward_fumo4 | -1 | 483 (517) | 4.1 | 17.2 | -6.63 | 3.8 / 4.71 |
| e04/varchi_falsi/occhio_chiuso | -2 | 311 (689) | 1.9 | 14.9 | -6.12 | 3.54 / 4.6 |
| e12/entro_le_dieci/sgombera12 | +1 | 509 (491) | 22.8 | 10.4 | 5.26 | 5.17 / 4.28 |
| e12/entro_le_dieci/ordine_scritto | -1 | 491 (509) | 10.4 | 22.8 | -5.26 | 4.28 / 5.17 |
| e01/rinforzi/chiedi | -2 | 465 (535) | 3.7 | 15.9 | -6.37 | 4.06 / 4.77 |
| e01/ufficio_insiste/asseconda | +1 | 509 (491) | 16.1 | 4.1 | 6.29 | 4.91 / 3.96 |
| e01/ufficio_insiste/ignora | -1 | 491 (509) | 4.1 | 16.1 | -6.29 | 3.96 / 4.91 |
| e31/segreteria_chiede/mostra_indice | +1 | 503 (497) | 20.3 | 8.7 | 5.22 | 5.04 / 4.25 |
| e31/segreteria_chiede/rifiuta_segreteria | -1 | 497 (503) | 8.7 | 20.3 | -5.22 | 4.25 / 5.04 |
| e27/messaggio_dessi/acquisisci_video | +1 | 487 (513) | 14.4 | 2.9 | 6.49 | 4.91 / 3.69 |
| e27/messaggio_dessi/lascia_video | -1 | 513 (487) | 2.9 | 14.4 | -6.49 | 3.69 / 4.91 |
| e29/ospiti_tranquilli/rassicura | -1 | 311 (689) | 2.3 | 13.8 | -5.58 | 3.42 / 4.88 |
| e12/rinforzi/chiudi_cancelli | -1 | 511 (489) | 11.2 | 22.5 | -4.81 | 4.54 / 4.94 |
| e29/notizia_in_curva/sospendi_partita | -2 | 328 (672) | 2.7 | 13.8 | -5.44 | 3.8 / 4.73 |
| e05/laser_q/ammonisci | +1 | 327 (673) | 11.9 | 1 | 7.71 | 4.8 / 3.64 |
| e33/ordini_segnati/ordini_puliti | -1 | 506 (494) | 6.9 | 17.8 | -5.25 | 3.88 / 4.44 |
| e33/ordini_segnati/ordini_veri | +1 | 494 (506) | 17.8 | 6.9 | 5.25 | 4.44 / 3.88 |
| e04/arance/chiudi_mercato | -1 | 352 (648) | 4 | 14.7 | -5.18 | 3.62 / 4.62 |
| e30/saluto_larkspire/percorso_fermo | +1 | 497 (503) | 12.9 | 2.4 | 6.26 | 4.56 / 3.73 |
| e34/gol_quillhaven/squadra_tribuna | +1 | 335 (665) | 13.7 | 3.2 | 6.31 | 4.46 / 3.47 |
| e12/portone/chiudi_portone | -1 | 329 (671) | 9.7 | 20.1 | -4.14 | 4.31 / 4.94 |
| e02/responsabile/non_fidarti | -1 | 491 (509) | 9.4 | 19.8 | -4.68 | 4.5 / 5.15 |
| e02/responsabile/fidati | +1 | 509 (491) | 19.8 | 9.4 | 4.68 | 5.15 / 4.5 |
| e27/lettera_gemellati/consegna_comando | -1 | 514 (486) | 3.5 | 13.8 | -5.83 | 3.88 / 4.71 |
| e27/lettera_gemellati/tieni_busta | +1 | 486 (514) | 13.8 | 3.5 | 5.83 | 4.71 / 3.88 |
| e33/tornelli_falsi/chiudi_occhio | -2 | 354 (646) | 5.6 | 15.9 | -4.74 | 3.6 / 4.47 |
| e25/ispettore/spiega_ispettore | -1 | 503 (497) | 1.8 | 11.9 | -6.33 | 4.1 / 4.9 |
| e25/ispettore/mostra_regole | +1 | 497 (503) | 11.9 | 1.8 | 6.33 | 4.9 / 4.1 |
| e33/treno_mezzanotte/trattieni_mezzanotte | -1 | 502 (498) | 7.4 | 17.3 | -4.77 | 3.53 / 4.79 |
| e30/fiaccolata/vieta_fiaccolata | +1 | 341 (659) | 14.1 | 4.2 | 5.56 | 4.5 / 3.96 |
| e07/quaranta_pulmini/indicazioni_rete | +1 | 326 (674) | 19 | 9.2 | 4.42 | 5.27 / 4.73 |
| e33/parcheggio_vuoto/annota_targa | -1 | 401 (393) | 9.5 | 19.3 | -3.96 | 4.01 / 4.76 |
| e07/primo_gol/lascia_festa7 | +1 | 389 (611) | 18.3 | 8.7 | 4.48 | 5.51 / 4.52 |
| e26/fumogeni_finale/lascia_fumo | +2 | 346 (654) | 13.6 | 4.1 | 5.43 | 4.78 / 3.71 |
| e35/curiosi_notte/lascia_guardare | +1 | 380 (620) | 12.1 | 2.6 | 6.06 | 4.78 / 4.43 |
| e36/comando_conti/frase_dura | -1 | 517 (483) | 14.3 | 23.8 | -3.83 | 4.61 / 5.28 |
| e36/comando_conti/frase_neutra | +1 | 483 (517) | 23.8 | 14.3 | 3.83 | 5.28 / 4.61 |
| e04/coro_fonderie/permetti_coro | +1 | 500 (500) | 15.6 | 6.2 | 4.77 | 4.64 / 3.9 |
| e27/rovers_provocati/steward_rovers | -1 | 483 (517) | 3.7 | 13 | -5.23 | 4 / 4.55 |
| e28/mossgarth_rumore/niente_settore | -1 | 534 (466) | 19.9 | 29.2 | -3.44 | 5.02 / 5.53 |
| e28/mossgarth_rumore/apri_settore | +1 | 466 (534) | 29.2 | 19.9 | 3.44 | 5.53 / 5.02 |
| e32/verbale_derby/nome_larkspire | +1 | 346 (654) | 19.4 | 10.4 | 3.95 | 4.88 / 4.7 |
| e30/lettera_curva/accetta_incontro | -1 | 504 (496) | 3.2 | 12.1 | -5.32 | 3.84 / 4.45 |
| e30/lettera_curva/rifiuta_incontro | +1 | 496 (504) | 12.1 | 3.2 | 5.32 | 4.45 / 3.84 |
| e25/permesso_mediatore/mediatore_subito | -1 | 222 (778) | 0 | 8.7 | -4.56 | 3.84 / 4.68 |
| e36/ritorno_collina/lascia_insieme | +1 | 332 (668) | 24.7 | 16 | 3.3 | 5.39 / 4.71 |
| e26/carosello/blocca_carosello | +1 | 335 (665) | 13.1 | 4.5 | 4.92 | 4.54 / 3.84 |
| e32/fumogeni_cinderwick/sospendi | -2 | 330 (670) | 7.9 | 16.3 | -3.65 | 4.23 / 5.03 |
| e01/fumogeni/sospendi | -2 | 320 (680) | 4.7 | 12.8 | -3.95 | 4.03 / 4.64 |
| e12/lavagna/tutto_rapporto | +1 | 466 (534) | 21 | 12.9 | 3.43 | 5.11 / 4.4 |
| e30/sotto_il_municipio/sanziona | +1 | 363 (637) | 12.7 | 4.7 | 4.57 | 4.66 / 3.85 |
| e11/non_di_qui/posti_blocco | -1 | 461 (539) | 0.9 | 8.7 | -5.63 | 3.63 / 4.99 |
| e13/video/comunicato13 | +1 | 488 (512) | 15.6 | 8 | 3.72 | 4.76 / 4.21 |
| e13/video/silenzio | -1 | 512 (488) | 8 | 15.6 | -3.72 | 4.21 / 4.76 |
| e30/silenzio_totale/parla_club | -1 | 319 (681) | 2.5 | 10 | -4.16 | 3.49 / 4.45 |
| e32/verbale_derby/nessun_nome | -1 | 329 (671) | 8.5 | 15.9 | -3.23 | 4.47 / 4.91 |
| e01/corteo_partito/ferma | +1 | 330 (670) | 15.2 | 7.8 | 3.63 | 4.74 / 4.3 |
| e14/fila_rimborsi/rimborsa_ora | -1 | 490 (510) | 1.2 | 8.6 | -5.37 | 3.69 / 4.57 |
| e14/fila_rimborsi/dopo_partita | +1 | 510 (490) | 8.6 | 1.2 | 5.37 | 4.57 / 3.69 |
| e35/corso_chiuso/radio_centro | -1 | 322 (678) | 1.2 | 8.6 | -4.48 | 4.07 / 4.8 |
| e02/striscione_ospiti/chiedi | +1 | 334 (666) | 19.5 | 12.3 | 3.01 | 4.93 / 4.78 |
| e25/treno_orario/trattieni_treno | -1 | 480 (520) | 3.1 | 10.2 | -4.44 | 4.16 / 4.8 |
| e31/consegna_fascicolo/a_stampa | -2 | 243 (757) | 9.1 | 16.2 | -2.77 | 4.28 / 4.77 |
| e02/tornelli_falsi/chiudi_occhio | -2 | 329 (671) | 10 | 17 | -2.92 | 4.57 / 4.96 |
| e30/clacson/corsia_auto | -1 | 480 (520) | 4 | 11 | -4.18 | 3.89 / 4.37 |
| e32/incrocio/luci | -1 | 301 (699) | 8.6 | 15.6 | -2.95 | 4.36 / 4.93 |
| e05/sindacato/impegno_firmato | -2 | 332 (668) | 0 | 6.9 | -4.9 | 3.08 / 4.49 |
| e07/primo_gol/cordone_campo | -1 | 390 (610) | 8.2 | 15.1 | -3.22 | 4.44 / 5.21 |
| e11/chi_paga/paga_comune | -1 | 497 (503) | 1.6 | 8.5 | -4.99 | 4.1 / 4.62 |
| e19/piano/due_squadre | +1 | 328 (672) | 7.6 | 0.7 | 5.99 | 3.98 / 3.23 |
| e14/fumo_viola/lascia_fumo14 | +1 | 485 (515) | 8.5 | 1.7 | 4.86 | 4.87 / 3.45 |
| e25/rigore_ospiti/lascia_festeggiare | +1 | 532 (468) | 10 | 3.2 | 4.24 | 4.83 / 4.12 |
| e25/rigore_ospiti/steward_sedie | -1 | 468 (532) | 3.2 | 10 | -4.24 | 4.12 / 4.83 |
| e13/spintoni/sospendi13 | -2 | 333 (667) | 7.2 | 13.9 | -3.12 | 3.95 / 4.74 |
| e27/binario/sala_attesa | -1 | 325 (675) | 4 | 10.7 | -3.54 | 3.82 / 4.51 |
| e06/sponsor/chiama_impresa | -1 | 498 (502) | 1.2 | 7.8 | -5.01 | 3.11 / 4 |
| e36/messaggio_carcere/portavoce_smentisce | -1 | 494 (506) | 15.6 | 22.1 | -2.64 | 4.6 / 5.26 |
| e15/accompagnarli/corteo_stazione | +1 | 525 (475) | 14.7 | 8.4 | 3.07 | 4.84 / 4.4 |
| e15/accompagnarli/navette15 | -1 | 475 (525) | 8.4 | 14.7 | -3.07 | 4.4 / 4.84 |
| e33/frequenza/cambia_ora | +1 | 483 (517) | 15.5 | 9.3 | 3 | 4.38 / 3.95 |
| e33/frequenza/cambia_dopo | -1 | 517 (483) | 9.3 | 15.5 | -3 | 3.95 / 4.38 |
| e01/presidente/aspetti | -1 | 327 (673) | 6.1 | 12.2 | -2.97 | 4.13 / 4.6 |
| e20/ogni_minuto/agente_dessi | +1 | 508 (492) | 6.3 | 0.2 | 5.39 | 4.27 / 3.34 |
| e20/ogni_minuto/telecamere20 | -1 | 492 (508) | 0.2 | 6.3 | -5.39 | 3.34 / 4.27 |
| e28/ospiti_partono/ospiti_dopo | +1 | 534 (466) | 27 | 21 | 2.19 | 5.39 / 5.1 |
| e16/annunci16/oscura | -1 | 521 (479) | 0.8 | 6.7 | -5.01 | 3.49 / 4.57 |
| e16/annunci16/avvisa_ospiti | +1 | 479 (521) | 6.7 | 0.8 | 5.01 | 4.57 / 3.49 |
| e25/corteo_ritorno/percorso_corto | -1 | 344 (656) | 2.9 | 8.8 | -3.54 | 4.3 / 4.6 |
| e31/cronista_cartella/dai_cronista | -2 | 473 (527) | 11.4 | 17.3 | -2.62 | 4.32 / 4.94 |
| e31/cronista_cartella/niente_cronista | +1 | 527 (473) | 17.3 | 11.4 | 2.62 | 4.94 / 4.32 |
| e11/non_centro/rifiuta_dessi11 | +1 | 495 (505) | 8.1 | 2.2 | 4.24 | 4.62 / 4.11 |
| e11/non_centro/accetta_dessi11 | -2 | 505 (495) | 2.2 | 8.1 | -4.24 | 4.11 / 4.62 |
| e31/consegna_fascicolo/tieni_fascicolo | -1 | 255 (745) | 10.2 | 16 | -2.26 | 4.43 / 4.73 |
| e32/striscione_dessi/speaker_rispetto | -1 | 333 (667) | 9.6 | 15.4 | -2.54 | 4.63 / 4.83 |
| e26/invasione/speaker | -1 | 334 (666) | 3.6 | 9.3 | -3.26 | 3.48 / 4.38 |
| e11/dirette/comunicato11 | +1 | 523 (477) | 7.8 | 2.1 | 4.12 | 4.88 / 3.8 |
| e11/dirette/allontana_curiosi | -1 | 477 (523) | 2.1 | 7.8 | -4.12 | 3.8 / 4.88 |
| e15/mille/mediatore15 | +1 | 337 (663) | 15.4 | 9.8 | 2.62 | 4.64 / 4.63 |
| e20/viso_scoperto/libero20 | +1 | 350 (650) | 6.9 | 1.4 | 4.62 | 3.96 / 3.73 |
| e27/gol_ospiti/annuncio | +1 | 338 (662) | 12.1 | 6.6 | 2.94 | 4.59 / 4.13 |
| e26/fumogeni_finale/steward_fumogeni | -1 | 328 (672) | 3.7 | 9.2 | -3.16 | 3.7 / 4.26 |
| e29/radio_operazione/una_squadra | -1 | 359 (641) | 6.7 | 12.2 | -2.75 | 3.95 / 4.7 |
| e01/striscione/rimuovi | +1 | 316 (684) | 13.9 | 8.5 | 2.64 | 4.73 / 4.31 |
| e29/conferenza/prima_fila | +2 | 505 (495) | 12.9 | 7.5 | 2.82 | 4.63 / 4.22 |
| e29/conferenza/in_fondo | -1 | 495 (505) | 7.5 | 12.9 | -2.82 | 4.22 / 4.63 |
| e06/ospiti_concerto/salto_concerto | +1 | 523 (477) | 7.1 | 1.7 | 4.11 | 3.6 / 3.51 |
| e21/residenti_divisi/rassicura21 | -1 | 494 (506) | 0 | 5.3 | -5.2 | 2.99 / 4.28 |
| e20/fumo_arancio/lascia_fumo20 | +1 | 305 (695) | 6.9 | 1.7 | 4.2 | 4.38 / 3.56 |
| e05/coro_steward/risposta_rete | +1 | 480 (520) | 7.3 | 2.1 | 3.9 | 3.87 / 4.15 |
| e31/rovers_tribuna/responsabile_rovers | -2 | 327 (673) | 11 | 16.2 | -2.19 | 4.26 / 4.84 |
| e26/premiazione/premiazione_campo | +2 | 530 (470) | 9.8 | 4.7 | 3.09 | 4.31 / 3.82 |
| e26/premiazione/premiazione_tribuna | -1 | 470 (530) | 4.7 | 9.8 | -3.09 | 3.82 / 4.31 |
| e34/curva_ti_canta/ferma_coro | +1 | 482 (518) | 9.3 | 4.2 | 3.22 | 4.01 / 3.6 |
| e34/curva_ti_canta/ignora_coro | -1 | 518 (482) | 4.2 | 9.3 | -3.22 | 3.6 / 4.01 |
| e16/senza_dessi/chiedi_curva | +1 | 480 (520) | 6.3 | 1.2 | 4.32 | 4.13 / 3.89 |
| e21/curva_debole/ignora_comune | -1 | 503 (497) | 0.2 | 5.2 | -4.91 | 3.32 / 3.96 |
| e21/curva_debole/ascolta21 | +1 | 497 (503) | 5.2 | 0.2 | 4.91 | 3.96 / 3.32 |

## B. Episodi, bot casuale (Δ fiducia = finale − iniziale; media / mediana / deviazione standard / numero di partite; r = correlazione di Pearson con la fiducia finale)

| ep | fallite % | Δ riuscite media/med/ds/n | Δ fallite media/med/ds/n | da scelte (media) | da ondate (media) | r(fid,fallita) | r(fid,degenerati) | r(fid,tensione) |
|---|---|---|---|---|---|---|---|---|
| e01 | 54.3 | -1.96 / -2 / 2.21 / 457 | -1.86 / -2 / 2.25 / 543 | -1.42 | -0.48 | 0.021 | -0.024 | 0.064 |
| e02 | 54.9 | -0.25 / 0 / 2.59 / 451 | -0.06 / 0 / 2.51 / 549 | 0.1 | -0.25 | 0.038 | -0.066 | 0.063 |
| e03 | 54.8 | -0.98 / -1 / 2.16 / 452 | -1.4 / -2 / 2.05 / 548 | -0.81 | -0.4 | -0.097 | -0.124 | -0.046 |
| e04 | 55.2 | 0.01 / 0 / 1.85 / 448 | -0.03 / 0 / 1.74 / 552 | 0.52 | -0.53 | -0.011 | -0.045 | 0.073 |
| e05 | 60.4 | -0.81 / -1 / 2.27 / 396 | -0.24 / 0 / 2.1 / 604 | -0.05 | -0.42 | 0.127 | 0.093 | 0.184 |
| e06 | 61.7 | -2.7 / -3 / 1.64 / 383 | -3.04 / -3 / 1.66 / 617 | -2.29 | -0.62 | -0.098 | -0.187 | -0.039 |
| e07 | 62.2 | -0.34 / 0 / 1.86 / 378 | -0.39 / 0 / 1.71 / 622 | 0.32 | -0.69 | -0.012 | -0.035 | 0.075 |
| e08 | 63.8 | -1.34 / -1 / 2.39 / 362 | -1.24 / -1 / 2.25 / 638 | -0.94 | -0.34 | 0.019 | 0.038 | 0.107 |
| e09 | 64.7 | 1.57 / 2 / 1.46 / 353 | 1.02 / 1 / 1.48 / 647 | 1.64 | -0.42 | -0.176 | -0.345 | -0.167 |
| e10 | 67.8 | -0.86 / -1 / 1.65 / 322 | -0.6 / -1 / 1.78 / 678 | 0.08 | -0.77 | 0.07 | -0.055 | 0.13 |
| e11 | 71 | -1.76 / -2 / 2.24 / 290 | -1.89 / -2 / 1.99 / 710 | -0.93 | -0.92 | -0.028 | -0.051 | 0.045 |
| e12 | 72.9 | -1.26 / -1 / 2.08 / 271 | -1.06 / -1 / 2.13 / 729 | -0.07 | -1.05 | 0.043 | 0.046 | 0.12 |
| e13 | 51.3 | 1.06 / 1 / 2.33 / 487 | 1.18 / 1 / 2.2 / 513 | 1.06 | 0.06 | 0.026 | -0.021 | 0.063 |
| e14 | 58.9 | 0.85 / 1 / 2.35 / 411 | 0.96 / 1 / 2.13 / 589 | 1.14 | -0.23 | 0.026 | 0.024 | 0.086 |
| e15 | 59.3 | 1.27 / 1 / 1.99 / 407 | 1.61 / 2 / 1.71 / 593 | 1.99 | -0.52 | 0.09 | -0.005 | 0.104 |
| e16 | 56.1 | 1.21 / 1 / 2.08 / 439 | 1.28 / 1 / 1.79 / 561 | 1.63 | -0.38 | 0.017 | 0.003 | 0.073 |
| e17 | 58.1 | 0.12 / 0 / 2.42 / 419 | 0.09 / 0 / 2.38 / 581 | 0.74 | -0.64 | -0.006 | -0.055 | 0.053 |
| e18 | 66.6 | 1.93 / 2 / 1.97 / 334 | 1.23 / 1 / 1.95 / 666 | 1.96 | -0.49 | -0.167 | -0.307 | -0.134 |
| e19 | 68.4 | -1.93 / -2 / 2.31 / 316 | -1.63 / -2 / 2.27 / 684 | -1.29 | -0.44 | 0.06 | 0.05 | 0.144 |
| e20 | 67.2 | -1.75 / -2 / 2.49 / 328 | -1.83 / -2 / 2.34 / 672 | -1.32 | -0.49 | -0.016 | -0.012 | 0.075 |
| e21 | 59.7 | 1.39 / 1 / 1.97 / 403 | 0.83 / 1 / 1.96 / 597 | 1.37 | -0.32 | -0.138 | -0.165 | -0.07 |
| e22 | 69.6 | -1.37 / -2 / 2.45 / 304 | -1.04 / -1 / 2.52 / 696 | -0.21 | -0.93 | 0.062 | 0.065 | 0.085 |
| e23 | 68 | -0.77 / -1 / 2.34 / 320 | -0.9 / -1 / 2.22 / 680 | -0.42 | -0.44 | -0.027 | -0.03 | 0.064 |
| e24 | 70.4 | -0.44 / 0 / 2.57 / 296 | -1.28 / -1 / 2.56 / 704 | -0.03 | -1 | -0.147 | -0.204 | -0.138 |
| e25 | 60 | -1.27 / -1 / 2.34 / 400 | -1.47 / -1 / 2.12 / 600 | -0.97 | -0.42 | -0.045 | -0.038 | 0.029 |
| e26 | 59.7 | 1.16 / 1 / 2.58 / 403 | 1.73 / 2 / 2.56 / 597 | 1.9 | -0.39 | 0.108 | -0.001 | 0.167 |
| e27 | 68.4 | -0.66 / -1 / 2.2 / 316 | -0.67 / -1 / 2.16 / 684 | -0.13 | -0.54 | -0.004 | -0.055 | 0.02 |
| e28 | 62.7 | 0.86 / 1 / 2.37 / 373 | 0.51 / 1 / 2.29 / 627 | 1.25 | -0.62 | -0.074 | -0.109 | -0.021 |
| e29 | 64.8 | -0.57 / -1 / 2.61 / 352 | -1.52 / -2 / 2.57 / 648 | -0.65 | -0.53 | -0.174 | -0.337 | -0.136 |
| e30 | 62.5 | 0.7 / 1 / 1.98 / 375 | 0.02 / 0 / 1.92 / 625 | 0.71 | -0.43 | -0.168 | -0.181 | -0.086 |
| e31 | 65 | -2.32 / -3 / 2.2 / 350 | -1.66 / -2 / 2.35 / 650 | -1.29 | -0.59 | 0.136 | 0.157 | 0.23 |
| e32 | 66.8 | -0.32 / 0 / 2.45 / 332 | -0.83 / -1 / 2.39 / 668 | 0.04 | -0.7 | -0.099 | -0.139 | -0.04 |
| e33 | 66.5 | -1.38 / -1 / 2.42 / 335 | -1.09 / -1 / 2.37 / 665 | -0.58 | -0.61 | 0.057 | 0.042 | 0.153 |
| e34 | 68.6 | 0.22 / 0 / 2.44 / 314 | -0.06 / 0 / 2.47 / 686 | 0.81 | -0.79 | -0.053 | -0.033 | 0.029 |
| e35 | 72.6 | 2.26 / 2 / 1.95 / 274 | 1.46 / 2 / 1.96 / 726 | 2.75 | -1.06 | -0.18 | -0.26 | -0.152 |
| e36 | 74.2 | 0.01 / 0 / 1.96 / 258 | -0.53 / 0 / 1.83 / 742 | 0.76 | -1.15 | -0.125 | -0.161 | -0.069 |

## C. Episodi, schieramento attento + scelte a caso

| ep | fallite % | 3★ % | Δ riuscite | Δ fallite | da scelte | da ondate | r(fid,fallita) | r(fid,tensione) |
|---|---|---|---|---|---|---|---|---|
| e01 | 10.2 | 11.5 | -0.97 / -1 / 2.43 / 898 | 0.41 / 0 / 2.02 / 102 | -1.41 | 0.58 | 0.173 | 0.247 |
| e02 | 14.7 | 8.8 | 2.22 / 2 / 2.28 / 853 | 1.89 / 2 / 2.29 / 147 | 0.35 | 1.82 | -0.051 | 0.112 |
| e03 | 0 | 34.9 | 0.37 / 0 / 2.04 / 1000 | — / — / — / 0 | -0.8 | 1.17 | null | 0.406 |
| e04 | 10.9 | 32.8 | 2 / 2 / 1.76 / 891 | 1.56 / 2 / 1.74 / 109 | 0.53 | 1.42 | -0.077 | -0.029 |
| e05 | 4.6 | 20.1 | 1.23 / 1 / 2.01 / 954 | 2.76 / 3 / 1.62 / 46 | -0.12 | 1.42 | 0.16 | 0.385 |
| e06 | 4.5 | 23.6 | -0.87 / -1 / 1.84 / 955 | -1.47 / -2 / 1.59 / 45 | -2.24 | 1.35 | -0.068 | -0.044 |
| e07 | 12.4 | 13.7 | 0.88 / 1 / 1.75 / 876 | 0.62 / 1 / 1.79 / 124 | 0.48 | 0.37 | -0.049 | 0.132 |
| e08 | 0.3 | 46.7 | 1.3 / 1 / 2.48 / 997 | 0.67 / 2 / 2.31 / 3 | -1.19 | 2.49 | -0.014 | 0.38 |
| e09 | 0.3 | 60.6 | 3.55 / 4 / 1.19 / 997 | 5 / 5 / 0 / 3 | 1.66 | 1.9 | 0.067 | -0.046 |
| e10 | 1.3 | 41.6 | 1.47 / 2 / 1.83 / 987 | 1.62 / 1 / 1.19 / 13 | -0.02 | 1.48 | 0.009 | -0.003 |
| e11 | 5.1 | 9.8 | 0.11 / 0 / 2.28 / 949 | 0.88 / 1 / 2.29 / 51 | -0.86 | 1.01 | 0.074 | 0.245 |
| e12 | 16.7 | 15.5 | 0.6 / 1 / 2.06 / 833 | 1.35 / 2 / 1.73 / 167 | -0.04 | 0.76 | 0.139 | 0.256 |
| e13 | 11.7 | 25.6 | 2.51 / 3 / 2.24 / 883 | 2.84 / 3 / 1.74 / 117 | 0.8 | 1.75 | 0.049 | 0.155 |
| e14 | 5 | 21.8 | 2.28 / 3 / 2.07 / 950 | 2.74 / 3 / 1.17 / 50 | 0.97 | 1.33 | 0.049 | 0.298 |
| e15 | 11.7 | 20.2 | 3.23 / 4 / 1.55 / 883 | 3.46 / 4 / 0.82 / 117 | 1.84 | 1.41 | 0.05 | 0.15 |
| e16 | 3.6 | 20.8 | 2.37 / 3 / 2.02 / 964 | 2.36 / 2 / 1.57 / 36 | 1.36 | 1.01 | -0.001 | 0.133 |
| e17 | 1.2 | 31.6 | 1.83 / 2 / 2.4 / 988 | 1.83 / 1.5 / 2.17 / 12 | 0.48 | 1.35 | 0 | 0.138 |
| e18 | 0.2 | 43.8 | 3.56 / 4 / 1.48 / 998 | 3 / 3 / 1.41 / 2 | 1.34 | 2.22 | -0.017 | 0.259 |
| e19 | 3 | 37.8 | 0.13 / 0 / 2.34 / 970 | 0.83 / 1 / 1.7 / 30 | -1.56 | 1.71 | 0.052 | 0.199 |
| e20 | 3.3 | 19.7 | 0.19 / 0 / 2.45 / 967 | 1.42 / 1 / 1.92 / 33 | -1.33 | 1.56 | 0.09 | 0.377 |
| e21 | 2.7 | 53.1 | 2.57 / 3 / 1.62 / 973 | 2.33 / 2 / 1.52 / 27 | 1.32 | 1.24 | -0.024 | 0.125 |
| e22 | 0.4 | 46.3 | 1.06 / 1 / 2.65 / 996 | 0.5 / 0 / 1.73 / 4 | -0.47 | 1.53 | -0.013 | 0.216 |
| e23 | 0.8 | 28.1 | 0.84 / 1 / 2.37 / 992 | 2.38 / 3 / 1.51 / 8 | -0.44 | 1.3 | 0.058 | 0.281 |
| e24 | 0.1 | 56.9 | 1.46 / 2 / 2.36 / 999 | -1 / -1 / 0 / 1 | -0.08 | 1.54 | -0.033 | 0.059 |
| e25 | 6.8 | 9.3 | -0.14 / 0 / 2.29 / 932 | 1.15 / 1 / 2.03 / 68 | -1.1 | 1.04 | 0.141 | 0.428 |
| e26 | 7.4 | 33.7 | 2.57 / 3 / 2.32 / 926 | 2.12 / 2 / 2.33 / 74 | 1.68 | 0.86 | -0.05 | 0.038 |
| e27 | 8.5 | 25.7 | 0.88 / 1 / 2.34 / 915 | 1.74 / 2 / 1.74 / 85 | -0.23 | 1.18 | 0.105 | 0.165 |
| e28 | 24.2 | 13.7 | 1.45 / 1 / 2.19 / 758 | 1.4 / 1.5 / 1.96 / 242 | 1.25 | 0.19 | -0.009 | 0.086 |
| e29 | 10.2 | 17.7 | -0.19 / 0 / 2.54 / 898 | -0.11 / 0 / 2.74 / 102 | -0.65 | 0.47 | 0.01 | 0.05 |
| e30 | 7.6 | 27.4 | 1.52 / 2 / 1.74 / 924 | 2.79 / 3 / 1.47 / 76 | 0.58 | 1.03 | 0.192 | 0.31 |
| e31 | 14.5 | 6.7 | -0.86 / -1 / 2.61 / 855 | -0.43 / 0 / 2.13 / 145 | -1.31 | 0.51 | 0.06 | 0.25 |
| e32 | 13.5 | 9.3 | 0.5 / 1 / 2.6 / 865 | 0.33 / 0 / 2.44 / 135 | -0.01 | 0.49 | -0.023 | 0.096 |
| e33 | 12.3 | 24.5 | 0.18 / 0 / 2.4 / 877 | 0.43 / 0 / 2.2 / 123 | -0.99 | 1.2 | 0.034 | 0.137 |
| e34 | 6.7 | 35.9 | 1.86 / 2 / 2.22 / 933 | 3.43 / 4 / 1.03 / 67 | 0.5 | 1.46 | 0.179 | 0.325 |
| e35 | 6.2 | 17.9 | 3.15 / 4 / 1.73 / 938 | 2.23 / 2.5 / 1.3 / 62 | 2.65 | 0.45 | -0.13 | -0.155 |
| e36 | 18.9 | 14.6 | 0.89 / 1 / 1.88 / 811 | 1.06 / 1 / 1.66 / 189 | 0.61 | 0.31 | 0.037 | 0.27 |

## D. Bot deterministici (esito, stelle, fiducia finale; fra parentesi i punti dalle risposte e dalle ondate)

| ep | attenta esito/★/fid (scelte, ondate) | equilibrata | peggiore |
|---|---|---|---|
| e01 | contenuto_a_fatica 2★ 2 (-6, +3) | contenuto 3★ 8 (+0, +3) | degenerato 0★ 4 (+5, -6) |
| e02 | contenuto 2★ 3 (-5, +3) | contenuto 2★ 4 (-2, +1) | degenerato 0★ 2 (+7, -10) |
| e03 | contenuto_a_fatica 2★ 1 (-7, +3) | contenuto 3★ 9 (+1, +3) | degenerato 0★ 0 (+1, -6) |
| e04 | contenuto 2★ 4 (-3, +2) | contenuto 3★ 10 (+4, +1) | degenerato 0★ 6 (+5, -4) |
| e05 | contenuto 3★ 5 (-4, +4) | contenuto_a_fatica 1★ 7 (+1, +1) | degenerato 0★ 3 (+4, -6) |
| e06 | contenuto 2★ 3 (-6, +4) | contenuto 3★ 10 (+1, +4) | degenerato 0★ 0 (+1, -6) |
| e07 | contenuto_a_fatica 2★ 2 (-5, +2) | contenuto 2★ 4 (-3, +2) | degenerato 0★ 3 (+6, -8) |
| e08 | contenuto_a_fatica 2★ 1 (-7, +3) | contenuto 3★ 10 (+2, +3) | degenerato 0★ 4 (+6, -7) |
| e09 | contenuto 3★ 9 (+0, +4) | contenuto 3★ 10 (+3, +2) | degenerato 0★ 1 (+3, -7) |
| e10 | contenuto 3★ 6 (-3, +4) | contenuto 3★ 10 (+2, +3) | degenerato 0★ 3 (+3, -5) |
| e11 | contenuto 2★ 3 (-5, +3) | contenuto 3★ 7 (+1, +1) | degenerato 0★ 0 (+3, -8) |
| e12 | contenuto_a_fatica 2★ 2 (-6, +3) | contenuto 3★ 8 (-1, +4) | degenerato 0★ 4 (+6, -7) |
| e13 | contenuto 3★ 8 (+0, +3) | contenuto 3★ 10 (+4, +1) | degenerato 0★ 7 (+8, -6) |
| e14 | contenuto_a_fatica 2★ 2 (-7, +4) | contenuto 3★ 7 (+0, +2) | degenerato 0★ 5 (+8, -8) |
| e15 | contenuto 3★ 6 (-1, +2) | contenuto 3★ 9 (+2, +2) | degenerato 0★ 4 (+5, -6) |
| e16 | contenuto 3★ 6 (-2, +3) | contenuto_a_fatica 1★ 10 (+4, +1) | degenerato 0★ 3 (+5, -7) |
| e17 | contenuto_a_fatica 1★ 5 (-3, +3) | contenuto 3★ 10 (+3, +2) | degenerato 0★ 5 (+7, -7) |
| e18 | contenuto 3★ 6 (-2, +3) | contenuto 3★ 10 (+2, +3) | degenerato 0★ 5 (+8, -8) |
| e19 | contenuto 2★ 4 (-2, +1) | contenuto 3★ 10 (+3, +2) | degenerato 0★ 3 (+3, -5) |
| e20 | contenuto 2★ 3 (-4, +2) | contenuto 3★ 10 (+3, +2) | degenerato 0★ 4 (+7, -8) |
| e21 | contenuto 3★ 6 (-1, +2) | contenuto 3★ 9 (+2, +2) | degenerato 0★ 5 (+6, -6) |
| e22 | contenuto 3★ 7 (-1, +3) | contenuto 3★ 9 (+1, +3) | degenerato 0★ 5 (+10, -10) |
| e23 | contenuto 2★ 3 (-4, +2) | contenuto 3★ 7 (+0, +2) | degenerato 0★ 5 (+6, -6) |
| e24 | contenuto 3★ 6 (-1, +2) | contenuto 3★ 9 (+2, +2) | degenerato 0★ 3 (+6, -8) |
| e25 | contenuto 2★ 4 (-4, +3) | contenuto 3★ 7 (-1, +3) | degenerato 0★ 6 (+6, -5) |
| e26 | contenuto 2★ 4 (-5, +4) | contenuto 3★ 9 (+2, +2) | degenerato 0★ 7 (+9, -7) |
| e27 | contenuto 3★ 5 (-4, +4) | contenuto 3★ 7 (+1, +1) | degenerato 0★ 4 (+6, -7) |
| e28 | contenuto 2★ 4 (-3, +2) | contenuto_a_fatica 1★ 4 (-2, +1) | degenerato 0★ 2 (+5, -8) |
| e29 | contenuto 2★ 4 (-3, +2) | contenuto_a_fatica 1★ 10 (+4, +1) | degenerato 0★ 0 (+3, -8) |
| e30 | contenuto 2★ 4 (-4, +3) | contenuto 3★ 8 (+0, +3) | degenerato 0★ 3 (+7, -9) |
| e31 | contenuto 2★ 4 (-5, +4) | contenuto 3★ 9 (+1, +3) | degenerato 0★ 0 (+2, -7) |
| e32 | contenuto 3★ 7 (+0, +2) | contenuto 3★ 10 (+3, +2) | degenerato 0★ 3 (+5, -7) |
| e33 | contenuto 2★ 3 (-5, +3) | contenuto 3★ 8 (+2, +1) | degenerato 0★ 4 (+7, -8) |
| e34 | contenuto 3★ 7 (-2, +4) | contenuto 3★ 9 (+0, +4) | degenerato 0★ 4 (+7, -8) |
| e35 | contenuto 3★ 8 (+1, +2) | contenuto 3★ 10 (+3, +2) | degenerato 0★ 3 (+5, -7) |
| e36 | prorogato 2★ 3 (-5, +3) | confermato 3★ 9 (+2, +2) | degenerato 0★ 2 (+6, -9) |

## E. Catena

`node tools/catena.mjs logica` sul ramo con lo strumento nuovo (prima del commit): tipi, confini, schema, test, bot, storia, salvataggi-reali, bracci-rossi-logica **tutti verdi**, «Catena «logica» su ab5f05f (con modifiche non committate): VERDE», uscita 0 (`STABILITA.json`).
