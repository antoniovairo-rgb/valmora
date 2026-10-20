# Rilascio sul Play Store · requisiti e guida per il PO

Voce: PO-144 · Decisione: D-212 · Preparato da S-21 · Pagine lette il **2026-10-20** con `curl` (HTTP 200, versione inglese `?hl=en`).
Le citazioni sono testuali. Le regole di Google cambiano: prima di ogni passo rileggi la pagina indicata.

Legenda dello stato: **fatto** · **da fare dal PO** · **da fare da noi** (sessioni) · **decisione PO**.

## 1. Requisiti

| # | Requisito | Fonte ufficiale (letta il 2026-10-20) | Cosa dice | Stato per Valmora |
|---|---|---|---|---|
| 1 | Account sviluppatore | https://support.google.com/googleplay/android-developer/answer/6112435 · https://support.google.com/googleplay/android-developer/answer/13628312 | «There is a US$25 one-time registration fee»; «You must be at least 18 years of age»; account «Personal» o «Organization»; l'account personale chiede nome e indirizzo legali, documento e verifica di un dispositivo Android con l'app Play Console. | **da fare dal PO** (Non posso confermare se esiste già un account) |
| 2 | Test chiuso prima della produzione (account personali) | https://support.google.com/googleplay/android-developer/answer/14151465 | «Developers with personal accounts created after November 13, 2023, must run a closed test for their app with a minimum of 12 testers who have been opted in continuously for at least 14 days.» «Open testing becomes available after you gain production access.» | **da fare dal PO**: 12 tester per 14 giorni consecutivi, poi richiesta di accesso alla produzione dalla Dashboard |
| 3 | Target API level | https://developer.android.com/google/play/requirements/target-sdk · https://support.google.com/googleplay/android-developer/answer/11926878 | «Starting August 31, 2026: New apps and app updates must target Android 16 (API level 36) or higher». Proroga su richiesta fino al 1/11/2026. | **fatto**: `targetSdkVersion = 36` (android/variables.gradle:4) |
| 4 | Formato AAB | https://developer.android.com/guide/app-bundle | «From August 2021, new apps are required to publish with the Android App Bundle on Google Play.» | **fatto da noi**: job CI «aab» (.github/workflows/catene.yml:121), `bundleRelease` |
| 5 | Play App Signing e chiave di caricamento | https://developer.android.com/studio/publish/app-signing · https://support.google.com/googleplay/android-developer/answer/9842756 | «Play App Signing is required to sign your app for distribution through Google Play»; «Your key should be valid for at least 25 years»; «your upload key and app signing key should be different»; chiave persa: «Request upload key reset». | Firma da segreti: **fatto da noi** (android/app/build.gradle:16-17, 47). Chiave e segreti: **da fare dal PO** (§2.1, §2.2) |
| 6 | Classificazione dei contenuti (IARC) | https://support.google.com/googleplay/android-developer/answer/9898843 | «All apps must have a content rating from the IARC to be on Google Play.» «Apps without a content rating will be removed». Va rifatto se il contenuto cambia. | **da fare dal PO** (§2.5). Il rating lo decide solo il questionario (CLAUDE.md) |
| 7 | Sicurezza dei dati | https://support.google.com/googleplay/android-developer/answer/10787469 | «All developers … must complete the Data safety form, including apps on closed, open, or production testing tracks.» «Even developers with apps that do not collect any user data must complete this form and provide a link to their privacy policy.» | **da fare dal PO** (§2.5); risposte suggerite in §3 |
| 8 | Privacy policy | https://support.google.com/googleplay/android-developer/answer/10144311 | «All apps must post a privacy policy link in the designated field within Play Console, and a privacy policy link or text within the app itself.» «Apps that do not access any personal and sensitive user data must still submit a privacy policy.» URL pubblico, «no PDFs». | Bozza: **fatto da noi** (§4). Pubblicarla su un URL: **decisione PO**. Link o testo **dentro il gioco**: **da fare da noi** dopo la decisione (oggi assente; tocca il gioco, fuori dal compito S-21) |
| 9 | Scheda dello store | https://support.google.com/googleplay/android-developer/answer/9866151 | Icona «512px by 512px», «32-bit PNG (with alpha)», max 1024 KB; grafica in evidenza «1024px by 500px», «JPEG or 24-bit PNG (no alpha)»; «a minimum of two screenshots», lato tra 320 e 3840 px; per i giochi consigliati «three 9:16 portrait screenshots (minimum 1080x1920px)». | Immagini: **da fare da noi** (icona sorgente in tools/icona; grafica 1024×500 e screenshot da produrre). Testi e caricamento: **da fare dal PO** |
| 10 | Pubblico destinatario e contenuti | https://support.google.com/googleplay/android-developer/answer/9867159 | «you'll be required to declare your app's target age group. Any apps that include children in their target audience must comply with Google Play's Families Policy Requirements». Prima servono dichiarazione pubblicità e privacy policy. | **decisione PO**: fascia d'età (se include minori si applica la politica Famiglie) |
| 11 | Pubblicità | https://support.google.com/googleplay/android-developer/answer/9859455 | «You must declare whether or not your app contains ads.» | **da fare dal PO**: risposta «No» (verifica in §3: nessun SDK pubblicitario in package.json:26-38) |
| 12 | versionCode crescente | https://developer.android.com/studio/publish/versioning | «each successive release of your app uses a greater value»; «The greatest value Google Play allows for versionCode is 2100000000.» | **fatto da noi**: regola in android/app/build.gradle:4-12, guardiano tools/aab.mjs e tests/aab.test.ts |

### Regola della versione (D-212)

`versionCode = maggiore × 1 000 000 + minore × 1 000 + correzione` (ognuno 0-999), `versionName = GAME_VERSION`.
0.46.0 → 46000 · 0.47.0 → 47000 · 1.0.0 → 1000000. Cresce sempre se GAME_VERSION cresce; il massimo (999.999.999 → 999999999) resta sotto 2100000000.
Vale solo per il rilascio: l'APK di debug del job «apk» resta `versionCode 1`, `versionName "1.0"` (android/app/build.gradle:54-61).

## 2. Guida passo passo per il PO

### 2.0 Firma: Play App Signing e tre strade (D-213, decide il PO)

**Come funziona** (https://support.google.com/googleplay/android-developer/answer/9842756 e https://developer.android.com/studio/publish/app-signing, lette il 2026-10-20): con Play App Signing «Google manages and protects your app's signing key»; tu firmi ogni AAB solo con la tua **chiave di caricamento** e Google rifirma l'app per gli utenti. «When you use Play App Signing, if you lose your upload key, or if it is compromised, you can request an upload key reset in the Play Console» (Play Console: sezione «Upload key certificate» → «Request upload key reset»). Quindi perdere la chiave di caricamento **non** fa perdere l'app, ma blocca i caricamenti finché Google non accetta la nuova chiave (tempi: **Non posso confermarlo**, la pagina non li indica).

| Strada | Passi | Costi e rischi |
|---|---|---|
| **(a) Segreti GitHub, firma la CI** (pronta: android/app/build.gradle:16-17, 47; catene.yml:136-156) | §2.1 chiave sul tuo computer → §2.2 quattro segreti → ogni push produce `valmora-release-aab` già firmato | Una volta sola ~15 min. La chiave sta anche nei segreti di GitHub (cifrati, mai stampati dal job); chi ha accesso in scrittura alle Actions del repository potrebbe in teoria usarla in un job: controlla chi ha accesso in Settings → Collaborators (Non verificato da S-21). Rimedio se trapela: «Request upload key reset». |
| **(b) Firmi tu sul computer l'AAB non firmato della CI** | §2.1 chiave → §2.3 scarichi `app-release.aab` (non firmato) → `jarsigner -keystore valmora-upload.jks app-release.aab valmora-upload` (comando da https://developer.android.com/build/building-cmdline: «you can use jarsigner to sign your app bundle»; **«You cannot use apksigner to sign your app bundle»**) → carichi. In alternativa Android Studio, «Build > Generate Signed Bundle/APK», che però ricostruisce dal sorgente sul tuo computer (serve il progetto installato). | La chiave non lascia mai il tuo computer. Costo: ~5 min a ogni rilascio e Java installato (jarsigner è nel JDK). Nessun segreto in GitHub. |
| **(c) Chiave creata da un job CI e consegnata a te come file** | Un job manuale genera il .jks, lo carica come artifact; tu lo scarichi, cancelli subito l'artifact, poi (a) o (b) | **Non implementata.** Rischio: per il tempo in cui l'artifact esiste, la chiave privata e la sua password stanno sui server di GitHub e nei log/artefatti del run; chiunque possa leggere le Actions del repository può scaricarla. Il compito S-21 vieta alle sessioni di generare una chiave vera: servirebbe un tuo via esplicito. Risparmia solo l'installazione di Java per §2.1. |

### 2.1 Creare la chiave di caricamento (sul tuo computer, una volta sola)

Serve Java (il comando `keytool` è incluso). Il comando viene da https://developer.android.com/build/building-cmdline (letta il 2026-10-20); qui la validità è portata a 10 000 giorni come nella pagina, oltre i 25 anni richiesti (25 anni ≈ 9 132 giorni):

```
keytool -genkey -v -keystore valmora-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias valmora-upload
```

- Ti chiede una password del keystore, i tuoi dati e la password della chiave: annotale in un gestore di password.
- Conserva `valmora-upload.jks` fuori dal repository, con una copia di riserva. **Non** metterlo mai in git e non mandarlo in chat.
- Se la perdi, Google permette di chiedere la reimpostazione («Request upload key reset», answer 9842756).

### 2.2 Inserire i 4 segreti in GitHub

GitHub → repository `valmora` → **Settings → Secrets and variables → Actions → New repository secret**. Crea:

| Nome del segreto | Valore |
|---|---|
| `VALMORA_KEYSTORE_BASE64` | il file .jks in base64: su Mac/Linux `base64 -i valmora-upload.jks` (Linux: `base64 -w0 valmora-upload.jks`); su Windows PowerShell `[Convert]::ToBase64String([IO.File]::ReadAllBytes("valmora-upload.jks"))` |
| `VALMORA_KEY_ALIAS` | `valmora-upload` (l'alias del comando sopra) |
| `VALMORA_KEY_PASSWORD` | la password della chiave |
| `VALMORA_STORE_PASSWORD` | la password del keystore |

Il job «aab» decodifica il keystore in un file temporaneo del runner e lo cancella a fine job (.github/workflows/catene.yml:136-156); non stampa mai i segreti. Senza segreti l'AAB esce **non firmato** con un avviso nel log: il Play Store non lo accetta.

### 2.3 Scaricare l'AAB dalla CI

GitHub → **Actions** → run «catene» del commit voluto → in fondo, **Artifacts** → `valmora-release-aab` (zip con `app-release.aab`). Nel log del job «aab» controlla le righe `VALMORA rilascio: versionName …, versionCode …` e `AAB FIRMATO`.

### 2.4 Creare il test chiuso

Fonte: https://support.google.com/googleplay/android-developer/answer/9845334 (letta il 2026-10-20).
1. Play Console → crea l'app (nome, lingua predefinita italiano, «Gioco», «Gratuita»).
2. **Test and release → Testing → Closed testing** → **Manage track** → scheda **Testers** → **Create email list** (o un Google Group) con almeno 12 tester.
3. Indica un indirizzo o URL per i commenti, poi **Create a release**: carica `app-release.aab`. Al primo caricamento accetti Play App Signing.
4. **Share your app with testers**: copia il link di adesione (compare solo quando lo stato dell'app è «Published»).
5. I 12 tester devono restare iscritti **14 giorni consecutivi**; poi dalla Dashboard chiedi l'accesso alla produzione (answer 14151465).
Attenzione (answer 9845334): chi è iscritto al test interno non riceve il test chiuso.

### 2.5 Compilare IARC, sicurezza dei dati, pubblico e scheda

- **App content → Content rating**: questionario IARC. Rispondi in base ai contenuti reali (violenza solo raccontata in rapporti, radio e verbali: docs/BIBBIA.md). Il risultato è quello del questionario.
- **App content → Ads**: «No».
- **App content → Data safety**: vedi §3.
- **App content → Privacy policy**: URL pubblico della pagina (§4).
- **App content → Target audience and content**: fascia d'età (decisione tua).
- **Store listing**: nome, descrizione breve e completa, icona 512×512, grafica 1024×500, almeno 2 screenshot (consigliati 3 verticali 1080×1920).

## 3. Verifica sul codice: dati, rete, permessi

Comandi eseguiti il 2026-10-20 sul commit di questo documento:

- `grep -rnE "fetch\(|XMLHttpRequest|sendBeacon|WebSocket|analytics|gtag|firebase|navigator\.geolocation" src` → **nessun risultato** nel codice del gioco.
- Salvataggio solo nel telefono: `localStorage` in src/resa/archivio.ts:52-77.
- `public/sw.js:20,35`: `fetch` del service worker della **versione web** (cache per l'uso offline del sito); nell'app Android il gioco è servito dai file locali di Capacitor. IPOTESI non misurata sul telefono.
- Dipendenze (package.json:26-38): Capacitor, React, PixiJS, Motion, Lucide, Ajv, caratteri Fontsource. **Nessun SDK di analisi, pubblicità o crash report**.
- Collegamenti esterni aperti solo su azione del giocatore: condivisione del verbale (Web Share / appunti, src/resa/collegamenti.ts:12-17), email «Idee» (`mailto:`, src/resa/collegamenti.ts:26-27, src/resa/schermate/Titolo.tsx:34). «Sostieni» è nascosto nell'app Android (src/resa/schermate/Titolo.tsx:32, `!Capacitor.isNativePlatform()`).
- Permessi nel manifest: solo `android.permission.INTERNET` (android/app/src/main/AndroidManifest.xml:40, messo dal modello di Capacitor). Non serve ai file locali del gioco (IPOTESI, non misurata su telefono): toglierlo è una **decisione** (opzioni nel rapporto S-21). Il guardiano tools/aab.mjs lo segnala e boccia qualunque altro permesso nel manifest finale dell'AAB.
- `android:allowBackup="true"` (AndroidManifest.xml:5): il salvataggio può finire nel backup Google del telefono dell'utente. Se questo conti come «raccolta» ai fini del modulo: **Non posso confermarlo**; leggere la parte sulla raccolta dei dati di answer 10787469 prima di rispondere.

Risposte suggerite per **Data safety** (da confermare dal PO sulla pagina 10787469): «Does your app collect or share any of the required user data types?» → **No**.

## 4. Bozza di privacy policy (da pubblicare su un URL pubblico, non PDF)

> **Valmora – Cortina di fumo · Informativa sulla privacy**
> Ultimo aggiornamento: [data di pubblicazione]
>
> Valmora è un gioco che funziona offline. Il gioco non raccoglie, non trasmette e non condivide dati personali.
> - **Dati salvati**: i progressi della partita restano solo sul tuo dispositivo, nella memoria dell'app. Non vengono inviati a noi né a terzi. Disinstallando il gioco o cancellandone i dati vengono eliminati.
> - **Nessuna analisi, pubblicità o tracciamento**: il gioco non contiene strumenti di statistica, pubblicità o profilazione.
> - **Azioni che fai tu**: se scegli di condividere il verbale di una partita o di scriverci un'email, il testo passa all'app che scegli (per esempio la posta); i dati che invii così sono trattati da quell'app e, per le email, da noi solo per risponderti.
> - **Minori**: il gioco non raccoglie dati di nessun utente, minori compresi.
> - **Contatti**: [indirizzo email del PO].
> - **Modifiche**: eventuali modifiche saranno pubblicate in questa pagina con la nuova data.

Da completare dal PO: data, indirizzo di contatto, URL di pubblicazione. Il testo non è stato rivisto da un legale: **Non posso confermare** che basti per ogni legge applicabile.
