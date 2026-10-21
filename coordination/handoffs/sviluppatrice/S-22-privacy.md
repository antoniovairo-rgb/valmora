# S-22 · Privacy in home e su GitHub Pages (PO-145, D-217)

Ramo `claude/valmora-privacy`, partito da `f24df327`. Commit del codice: **a579527**. GAME_VERSION non toccato (0.47.0).

## Cosa c'è

- **Sorgente unica**: `data/testi/it/privacy.json` (7 paragrafi `privacy.pNN_…`, titolo, sottotitolo). La valida lo schema dei testi (`src/dati/schemi.ts:15`, `schema/testi.schema.json`), come gli altri testi.
- **Ordine e pagina web**: `src/dati/privacy.ts` (puro). `testoPrivacy` ordina i paragrafi, `paginaPrivacy` scrive l'HTML autonomo, senza script, link, immagini o indirizzi esterni.
- **Nel gioco**: `src/resa/schermate/Privacy.tsx` mostra i paragrafi con «Torna al titolo». La voce «Privacy» è nel menu «Altro» della home (`src/resa/schermate/Titolo.tsx:31-32`), vicino a «Crediti». Il collegamento è in `src/resa/App.tsx:49,172,174`.
  - Scelta tecnica dichiarata: la voce sta nel menu «Altro» e non tra i pulsanti grandi, così la home non torna a scorrere (guardiano PO-140/C43-07 a 0 px).
- **Sul web**: il plugin `pianoPrivacy` (`tools/privacy-pagina.mjs`, agganciato in `vite.config.ts:39`) aggiunge `dist/privacy/index.html` alla build. Lo stile viene da `src/resa/token.css` più `src/resa/privacy-pagina.css`, che usa solo token. Il workflow `pagine.yml:38-40` non pubblica il sito se la pagina manca.
- **Segnaposto del contatto**: il testo è `[[CONTATTO DA CONFERMARE]]` in `privacy.p07_contatto`.
  - `tools/aab.mjs` lo segnala sempre.
  - Lo boccia quando `VALMORA_RILASCIO=1`, cioè nel job «aab» su main (`.github/workflows/catene.yml:138-140`).

## Misure (FATTO MISURATO)

### Richieste di rete durante una partita
Comando: `node tools/misura-rete.mjs <build> 360`. Il giro è quello completo di `tools/foto.mjs` a 360 px:
- home e crediti;
- nuova partita, guida e città;
- e01-e03 giocati fino al verbale;
- ricarica e ripresa, archivio;
- guardiano della home.

Le richieste si registrano con `page.on('request')` su ogni pagina di Playwright.

| build | richieste | host | esterne |
|---|---|---|---|
| prima (f24df32) | 3148 | solo 127.0.0.1 | **0** |
| dopo (a579527) | 3152 | solo 127.0.0.1 | **0** |

Campione: 1 giro per build (il giro è deterministico, seme fisso). Durata del giro prima: 16 min 35 s di tempo reale, in parallelo con altro lavoro. Il tempo serve solo come informazione, non è una misura del gioco.

### Schermata Privacy e home
Comando: `node tools/foto-privacy.mjs <build> <cartella>`.

| | prima | dopo |
|---|---|---|
| home 360/375/412 × 760: «scorre» (fondo dei comandi principali rispetto alla finestra) | −105/−105/−105 px | −105/−105/−105 px |
| home 360/375/412 × 760: pagina che scorre | 0/0/0 | 0/0/0 |
| home × 640: pagina che scorre (già dichiarato, D-187/C43-07) | 29/10/10 | 29/10/10 |
| voce «Privacy» nel menu «Altro» | assente (3/3) | presente (3/3) |
| schermata Privacy: paragrafi, scorrimento laterale, ritorno alla home | – | 7, 0 px, sì (3/3) |
| richieste esterne aprendo la Privacy | – | 0 (3/3) |
| pagina web `privacy/index.html` a 360/375/412: paragrafi, scorrimento laterale, richieste esterne | assente | 7, 0 px, 0 |
| testo del gioco e della pagina web nel browser (dist a579527) | – | identici, 7 su 7 |

La foto della home a 360×760 è identica byte per byte prima e dopo (`cmp`).

## Guardiani e bracci rossi

| guardiano | dove | rosso (difetto) | verde (rimedio) |
|---|---|---|---|
| voce in home | `tests/privacy.test.ts` (render di Titolo); `tools/foto-home.mjs`, menu «Altro» con 5 voci (catena grafica); `tools/foto-privacy.mjs` | `__NO_C145H01`: test rosso. `VALMORA_ROSSI=C145H01 node tools/foto-privacy.mjs` → 6 problemi, 2 per larghezza (foto-home + foto-privacy), uscita 1 | uscita 0, nessun problema |
| testo del gioco = testo della pagina web | `tests/privacy.test.ts` | `__NO_C145T01` (la pagina perde l'ultimo paragrafo): i testi diversi vengono visti | uguali, 7 paragrafi |
| pagina …/privacy nella build di Pages | `tests/privacy.test.ts` (plugin e `vite.config.ts`); `pagine.yml` `test -s` | `__NO_C145W01` nel test: nessun file. `VALMORA_ROSSI=C145W01 npx vite build --outDir …` → `privacy/` assente | `dist/privacy/index.html`, 11326 byte |
| segnaposto del contatto assente nel rilascio | `tools/aab.mjs` (`controllaPrivacy`, bracci rossi), `tests/privacy.test.ts` | `VALMORA_RILASCIO=1 node tools/aab.mjs --privacy` → «1 problemi», uscita 1 (oggi, col segnaposto) | con il contatto al posto del segnaposto (test): 0 problemi. Sui rami (`VALMORA_RILASCIO` ≠ 1): uscita 0 e riga «SEGNALATO» |

`node tools/aab.mjs --bracci-rossi` → «✔ controllo AAB verde» (comprende i due nuovi campioni sulla privacy).

## Catene (stesso hash a579527, albero pulito)

`set -o pipefail; node tools/catena.mjs governo && node tools/catena.mjs logica`, 3 giri:

| giro | governo | logica | passi rilanciati |
|---|---|---|---|
| 1 | VERDE | VERDE | nessuno |
| 2 | VERDE | VERDE | nessuno |
| 3 | VERDE | VERDE | nessuno |

Tutti e 6 i giri sono registrati in STABILITA.json con `commit: a579527` e `modifiche_non_committate: false`.

Il primo tentativo (interrotto) risultava «con modifiche non committate» per la cartella foto non tracciata. L'ho fermato, ho spostato le foto fuori e ho rifatto i 3 giri da capo.

## CI «catene» su a579527

Run 39562375189: 10 job su 10 «success».
- governo, cambi, logica;
- grafica (360 foto), grafica (360 bracci), grafica (360 schieramenti), grafica (375), grafica (412);
- apk;
- aab: su un ramo `VALMORA_RILASCIO=0`, il segnaposto è solo segnalato.

Fonte: GitHub Actions, `list_workflow_jobs` del run.

## Foto (`coordination/handoffs/sviluppatrice/s22-privacy/`)

- `prima-home-<w>x760.png`, `prima-altro-<w>.png`: home e menu «Altro» su f24df32;
- `dopo-home-<w>x760.png`, `dopo-altro-<w>.png`, `dopo-privacy-<w>.png`, `dopo-web-<w>.png`: su a579527.

Larghezze 360, 375 e 412.

## ⚠ Da confermare (per il PO, tramite la principale)

1. **Contatto dello sviluppatore**: manca. Nel testo c'è il segnaposto `[[CONTATTO DA CONFERMARE]]` (`data/testi/it/privacy.json`, `privacy.p07_contatto`).
   - **Effetto**: appena il ramo va su main, il job «aab» diventa rosso finché il PO non dà il contatto.
2. **Backup di Android** (`android:allowBackup="true"`, `android/app/src/main/AndroidManifest.xml:5`): con questa impostazione Android può copiare i dati dell'app, salvataggio compreso, nel backup di Google.
   - Non l'ho misurato, quindi nel testo non c'è.
   - Se conti come «raccolta» per Data safety: non posso confermarlo.
3. **Permesso INTERNET** (`AndroidManifest.xml:40`, D-216): c'è nel manifest. Nel testo scrivo solo che il gioco non fa richieste esterne durante la partita, come misurato. Non scrivo che l'app non ha accesso alla rete.
4. **Indirizzo senza barra finale**: GitHub Pages serve `privacy/index.html` all'indirizzo `…/valmora/privacy/`. Se `…/valmora/privacy` (senza barra) reindirizzi lì, non posso confermarlo prima della pubblicazione: va provato con `curl -I` dopo il deploy da main.
5. Il paragrafo su «Sostieni» nomina «una pagina di donazione esterna». Il link (`src/resa/collegamenti.ts`, `URL_DONAZIONE`) c'è solo nel browser, non nell'app Android (`Titolo.tsx`, `Capacitor.isNativePlatform`).

## Non verificato

- **Rete su telefono**: le richieste sono misurate in Chromium headless sulla build web (`dist`), non nell'APK/AAB su un dispositivo Android.
- **Traffico del browser**: durante la misura il proxy del contenitore ha registrato 4 connessioni fallite a `mtalk.google.com:5228`. `page.on('request')` non le vede: sono del processo Chromium, non della pagina del gioco.
  - **IPOTESI**: è il servizio di messaggi di Chromium, non il gioco.
- **Offline nell'app Android**: che la schermata Privacy si apra offline lo deduco dal testo dentro il bundle. Non l'ho provato su telefono.
- **Catena grafica completa** (foto di tutte le scene, altezze, schieramenti): non l'ho eseguita in locale. Il guardiano della home con la privacy l'ho girato con `tools/foto-privacy.mjs`. La catena grafica è verde in CI su a579527 (5 job, vedi sopra).

## Dati salvati e dove (dal codice)

- `localStorage`, chiave `valmora-salvataggio`: la partita (`src/resa/archivio.ts:9,76`).
- `localStorage`, chiave `valmora-salvataggio-riserva`: la copia di riserva (`src/resa/archivio.ts:10,77`).
- `localStorage`, chiave `valmora-guida-vista`: indica se la guida è stata vista (`src/resa/archivio.ts:103,105`).
- «Esporta» scrive un file `.json` sul dispositivo con un link di download su un Blob (`src/resa/archivio.ts:84-89`).
- Cache del service worker: contiene solo i file della build (`public/sw.js:17,40`), non dati del giocatore.
- Nessun `fetch`, XHR, WebSocket o `sendBeacon` in `src/` (comando: `grep -rn "fetch(\|XMLHttpRequest\|sendBeacon\|WebSocket" src` → nessun risultato). L'unico `fetch` della build è nel service worker, verso i file del gioco (`public/sw.js:20,35`).
