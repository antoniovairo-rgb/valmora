# S-21 · AAB di rilascio e docs/RILASCIO.md (PO-144, D-212, D-213, D-214)

Ramo `claude/valmora-aab`, base `claude/valmora-l1-setup-schema-xdrbx7` 67eb117 (successivo a 9fd56ca6). Commit: 4de02bd (prima versione, con firma da segreti), c4d2243 (D-213 in RILASCIO.md), poi il commit D-214 con questo rapporto (hash nel messaggio alla principale).
Gioco, testi e dati non toccati (`git diff --stat 67eb117 -- src data` vuoto).

## Cosa è cambiato

1. **android/app/build.gradle**
   - :3-13: versione da GAME_VERSION in src/versione.ts. Regola: `versionCode = maggiore*1000000 + minore*1000 + correzione` (ognuno 0-999); 0.46.0 → 46000. Ho scelto ×1000 invece dell'esempio ×100 (4600) perché il minore è già 46 e con ×100 supererebbe 99 in circa 54 rilasci. Massimo 999999999, sotto il limite Google di 2100000000 (https://developer.android.com/studio/publish/versioning).
   - :14-15: D-214, nessuna firma e nessuna lettura di segreti. La signingConfig da variabili d'ambiente di 4de02bd è stata tolta. :51-55: il log della build di rilascio stampa «VALMORA rilascio: versionName …, versionCode …».
   - :41-48: la versione derivata vale solo per il rilascio (`androidComponents.onVariants`, `withBuildType('release')`). Debug e job «apk» restano a versionCode 1 / "1.0". Fonte: codice. Non ho estratto il manifest dell'APK di debug: **non verificato su file**.
2. **.github/workflows/catene.yml:118-146**: nuovo job «aab», senza `needs`; i 9 job attuali non sono toccati. Passi: vite build, cap sync, `bundleRelease`, `tools/aab.mjs` con bundletool 1.18.1, controllo della firma (avviso «AAB NON FIRMATO (atteso, D-214)»), artifact `valmora-release-aab-non-firmato`. Nessun segreto (D-214).
3. **tools/aab.mjs** (+ tools/aab.d.mts) e **tests/aab.test.ts**. Controllano che:
   - l'AAB esista e sia uno zip;
   - le versioni commentate in src/versione.ts abbiano versionCode strettamente crescente e che l'ultima sia GAME_VERSION;
   - il manifest finale dell'AAB (`bundletool dump manifest`) abbia versionName = GAME_VERSION e versionCode secondo la regola;
   - nel manifest non ci siano permessi oltre quelli ammessi.
   I bracci rossi stanno in `bracciRossi()`, esposti anche dal test vitest e quindi dalla catena «logica».
4. **docs/RILASCIO.md**: contiene:
   - 12 requisiti con URL, data di lettura (2026-10-20), citazione e stato;
   - Play App Signing e cosa succede se si perde la chiave;
   - la strada D-214 per prima: Android Studio, con i requisiti verificati, i comandi locali verificati in una cartella pulita, i passi della procedura guidata e l'allineamento di versionCode/versionName;
   - le alternative in breve;
   - test chiuso, IARC, Data safety, scheda;
   - la verifica sul codice e la bozza della privacy policy.

## Misure

- **Bracci rossi, verde**: `node tools/aab.mjs --bracci-rossi` → «✔ controllo AAB verde».
- **Bracci rossi, rosso**: con `codiceVersione` forzata a `return 1` → «✘ storia versioni: campione buono bocciato», «✘ manifest: campione buono bocciato», 2 problemi. Nello stesso stato `npx vitest run tests/aab.test.ts` dà 3 test falliti su 3. Ripristinato il file, 3 test su 3 passano.
- **Comandi locali in cartella pulita** (clone di c4d2243, Node 22.22.0, npm 10.9.4): `git pull && npm ci && npx vite build && npx cap sync android` → exit 0 in 7,9 s; dopo, `git status` vuoto.
- **CI run 39512760208 su 4de02bd**, prima versione con la firma da segreti (https://github.com/antoniovairo-rgb/valmora/actions/runs/39512760208), job «aab» verde. Dal log:
  - `BUILD SUCCESSFUL in 1m 51s`;
  - `AAB …app-release.aab: versionName 0.46.0, versionCode 46000; permessi: android.permission.INTERNET, io.github.antoniovairo.valmora.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`;
  - `✔ controllo AAB verde`, `##[warning]AAB NON FIRMATO`;
  - artifact `valmora-release-aab` di 3991645 byte.
- **Esito dei 9 job attuali su 4de02bd**: 8 verdi. «grafica (360 schieramenti)» è **rosso** al passo «altezze», 3 tentativi uguali: `360x760: mediana degli imprevisti 286 px (soglia 285, D-207)`.
  **Non dipende da S-21.** Stesso rosso, stesso valore, sulla base: run 39510656888 su 950a2fb, job 118930663361. `git diff --stat 67eb117 HEAD -- src data public index.html vite.config.ts package.json` è vuoto. I commit successivi della base (9fd56ca, 67eb117, 6750817) toccano solo documenti, quindi la grafica non è rigirata. La correzione non esiste ancora e non spetta a S-21: soglie e gioco sono fuori dal compito. Da assegnare.
- **CI sul commit D-214**: ESITO_D214
- **Giri locali governo+logica**: ESITO_GIRI

## Ricerca sul Play Store

Pagine lette con curl il 2026-10-20 (HTTP 200). Tutte le voci e citazioni sono in docs/RILASCIO.md §1. Nessuna pagina bloccata. Dati chiave:
- 12 tester per 14 giorni consecutivi (answer 14151465);
- target API 36 dal 31/08/2026, già soddisfatto in android/variables.gradle:4;
- Data safety e privacy policy obbligatorie anche se l'app non raccoglie dati (answer 10787469 e 10144311).

**Correzione alla strada (b) di D-213**: la pagina https://developer.android.com/build/building-cmdline dice «You cannot use apksigner to sign your app bundle». L'AAB si firma con `jarsigner`.

## Trovato, da decidere (opzioni per la principale)

1. **Permesso INTERNET** (android/app/src/main/AndroidManifest.xml:40, dal modello di Capacitor). Il guardiano lo segnala e non lo boccia.
   - (a) **Consigliata**: lasciarlo per il test chiuso e misurare su telefono se il gioco funziona senza. Costo: zero adesso.
   - (b) Toglierlo subito, una riga nel manifest. Che il gioco funzioni senza rete è un'IPOTESI non misurata su telefono (i file sono locali, i caratteri vengono da @fontsource). Costo: una prova su dispositivo.
   - (c) Lasciarlo e dichiararlo. Non cambia la risposta «No» di Data safety.
2. **Privacy policy dentro l'app**: answer 10144311 la chiede («link or text within the app itself»). Oggi non c'è e aggiungerla tocca il gioco.
   - (a) **Consigliata**: una voce «Privacy» in home che apre il testo, con un compito separato.
   - (b) Solo un link esterno. Serve comunque una pagina pubblicata.
3. **Pubblicazione della privacy policy su un URL pubblico** (non PDF). Ipotesi: una pagina sul sito GitHub Pages esistente. Da decidere il PO.
4. **allowBackup="true"** (AndroidManifest.xml:5): se il backup Google conti come «raccolta» per Data safety, non posso confermarlo.

## Sicurezza

- Non ho generato né letto nessuna chiave.
- Nessun keystore nel repository: il passo «segreti» della catena governo è verde.
- Dopo D-214 nessun file del repository legge segreti: `grep -n "VALMORA_KEY\|secrets" android/app/build.gradle .github/workflows/catene.yml` è vuoto.
- La chiave usa e getta per le prove locali non è servita: in questo contenitore manca l'Android SDK e la build l'ha provata solo la CI. Non c'è niente da cancellare.
