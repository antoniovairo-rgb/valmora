# S-22 – Pagina bianca offline (C14-01, difetto ALTO) · rapporto della sviluppatrice

Ramo `claude/valmora-resa-v2`. Stato: **consegnata**.

## Causa (FATTO MISURATO, letto in `public/sw.js` prima della correzione)

- All'installazione il service worker metteva in cache solo i file citati da `index.html`. I moduli caricati a richiesta (StratoCitta, StratoPixi, pixi…) entravano in cache solo dopo essere stati usati online.
- Quando la rete mancava, a qualunque richiesta non in cache rispondeva con `./`, cioè con la pagina HTML, anche al posto di uno script. L'import dinamico falliva («Failed to fetch dynamically imported module …StratoCitta») e React smontava tutto: pagina bianca.

## Correzioni

- **(a)** `vite.config.ts`, plugin `precache`: a fine build scrive in `dist/sw.js`:
  - l'elenco di TUTTI i file della build, moduli a richiesta compresi;
  - una VERSIONE, che è l'impronta dell'elenco.

  All'installazione il service worker mette in cache tutto l'elenco. Il modello resta `public/sw.js`, con i segnaposto `/*FILE*/` e `/*VERSIONE*/`.
- **(b)** Senza rete, la pagina si dà solo alle navigazioni. Uno script che manca riceve un errore, mai `index.html`.
- **(c)** `src/resa/errore.tsx`: contenitore d'errore attorno all'App. Se un pezzo non si carica compare «Qualcosa non si è caricato … La partita è salvata» con «Riprova», che ricarica la pagina, invece della pagina bianca.
- **(d)** La cache si chiama `valmora-<VERSIONE>`. All'attivazione il service worker toglie le cache `valmora-*` delle build vecchie, compresa la `valmora-v1` di prima.
  - Il worker vecchio non ricrea la sua cache mentre arriva il nuovo: scrive in cache solo se la sua cache esiste ancora. Senza questo controllo, il guardiano ha visto la cache vecchia ricomparire.
- **Rossi**:
  - `__NO_C14O01`: in cache solo i file citati dalla pagina, come prima;
  - `__NO_C14O02`: pagina HTML per ogni richiesta fallita e cache vecchie tenute, come prima;
  - `__NO_C14O03`: niente contenitore d'errore.

  I primi due arrivano al worker come parametro `?rossi=` della registrazione (`installa.ts`), perché il `globalThis` della pagina lì non arriva.

## Guardiano (catena grafica, passo nuovo «offline»: `tools/offline.mjs`)

Gira su http://localhost, l'unico indirizzo non https dove il service worker si registra:
- **O1**: sola home visitata online, poi offline: «Nuova partita» → genere → (guida) → città con la mappa pronta, nessun errore;
- **O2**: offline, uno script che non esiste non riceve HTML;
- **O3**: offline, modulo StratoCitta tolto dalla cache → «Riprova», non la pagina bianca;
- **O4**: rilascio nuovo (sw.js con un'altra versione) → resta solo la cache nuova.

Anche il passo «bracci-rossi-grafica» lancia il guardiano con ciascun rosso C14O01/02/03 e deve vederlo rosso.

## Misure

| comando | campione | esito |
|---|---|---|
| `node tools/offline.mjs` | O1-O4, 3 volte | verde 3 su 3 |
| `VALMORA_ROSSI=C14O01 node tools/offline.mjs` | O1-O4 | ROSSO: O1 «città sì, mappa no» (con il contenitore il giocatore vede «Riprova») |
| `VALMORA_ROSSI=C14O02 …` | O1-O4 | ROSSO: O2 «script mancante riceve text/html»; O4 «la cache vecchia doveva sparire» |
| `VALMORA_ROSSI=C14O03 …` | O1-O4 | ROSSO: O3 «niente Riprova, pagina bianca» |
| `node tools/catena.mjs completa` | vedi sotto | |

Nota sul guardiano: la prima versione falliva per difetti suoi, che ho riparato.
- O1: guardava la città prima che comparisse la guida introduttiva.
- O4: `waitForFunction` con una promessa non aspettava; ora c'è un ciclo d'attesa esplicito.

**Non verificato**: sul telefono del PO (Chrome Android, gioco installato). La prova è sul Chromium del container, alla larghezza di 360 px.
