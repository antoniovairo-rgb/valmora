# Progetto della nuova e01 a scene (PO-022…PO-025, D-048…D-052)

Approvato dal PO il 2026-10-11 (D-053) con 4-5 chiamate per ondata; consigliere = il vice disilluso (D-054); tensione mostrata a colori (D-055); stanchezza = unità a riposo (D-056).
Nasce dal collaudo C-001: «niente tensione, passività, ondate scollegate, plancia a crocette, briefing scollegato, troppo corta, testi piatti».

## Come scorre una missione (wizard a scene)

1. **Sala operativa.** Il consigliere ti accoglie e presenta la giornata in tre battute. Sulla mappa tattica (PixiJS) si accendono i settori.
2. **Briefing sulla mappa.** Ogni fonte arriva come messaggio (radio, telefono, rete) e accende sulla mappa il settore di cui parla. La fonte dichiara la sua affidabilità, il consigliere dice la sua. *(risponde a «briefing scollegato»)*
3. **Per ogni ondata (tre in e01):**
   - **Schieramento:** trascini le unità sui settori. Le unità stanche dell'ondata prima valgono meno, e si vedono stanche. *(risorse che si consumano)*
   - **Chiamate:** durante l'ondata arrivano 4-5 chiamate, una alla volta. Ognuna è una scelta con un prezzo, per esempio «il corteo chiede di passare dalla strada di Larkspire: concedi / blocca / mandi il mediatore». Le scelte cambiano la tensione dei settori, la stanchezza delle unità e le variabili della storia. *(decisioni con un prezzo, informazioni nuove durante la missione)*
   - **Rapporto:** la mappa mostra dove la tensione è salita. **La tensione non si azzera:** passa all'ondata dopo e si riduce di metà se il settore resta coperto. *(conseguenze che si trascinano, legame fra le ondate)*
4. **Verbale.** Racconta l'esito, rivela le fonti vere e false e ricorda le due o tre scelte che hanno pesato di più.

Durata obiettivo: 10-12 minuti (IPOTESI, da misurare col bot in passi di gioco e col collaudo del PO).

## Regole nuove del motore (src/logica, pure e deterministiche)

- **Tensione per settore** (0-10), che resta da un'ondata all'altra: dopo ogni ondata il residuo si dimezza (per difetto) se il settore è coperto, altrimenti resta intero.
- **Stanchezza (D-056):** le unità rimaste in un settore scoperto vanno a riposo per l'ondata dopo, poi rientrano.
- **Chiamate:** nuovo tipo di dato `chiamate` in ogni ondata (4-5), con 2-3 opzioni, ciascuna con effetti su tensione dei settori, stanchezza e variabili. Le condizioni e gli effetti usano lo stesso linguaggio dello schema attuale.
- **Esito:** dipende dalla tensione massima raggiunta e dalle scelte (variabili della storia).
- **Bot e catene:** il bot gioca anche le chiamate (casuale, attento, peggiore). Il guardiano chiede 0 blocchi e ogni esito raggiungibile; uno nuovo misura che **le scelte contano**, cioè che esiti diversi nascono da scelte diverse a parità di schieramento.

## Resa

Stile sala operativa (D-049): fondo scuro, mappa tattica stilizzata in PixiJS, messaggi radio con transizioni (motion), icone lucide e game-icons (con «Crediti»).

## Fuori ambito per questa versione

Tempo reale con orologio (D-048: dopo), audio, illustrazioni dei personaggi.
