// D-212 (PO-144): controllo dell'AAB di rilascio. Funzioni pure (testate in tests/aab.test.ts) + uso da riga di comando.
// Uso: node tools/aab.mjs <file.aab> <bundletool.jar>   (job «aab» di .github/workflows/catene.yml)
//      node tools/aab.mjs --bracci-rossi                  (ogni controllo deve vedere il suo difetto)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';

// Stessa regola di android/app/build.gradle: maggiore * 1000000 + minore * 1000 + correzione, ognuno 0-999.
export function codiceVersione(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v ?? '');
  if (!m) return null;
  const [maggiore, minore, correzione] = m.slice(1).map(Number);
  if (minore > 999 || correzione > 999) return null;
  return maggiore * 1000000 + minore * 1000 + correzione;
}

// Il versionCode deve crescere: le versioni elencate nei commenti di src/versione.ts («// x.y.z – …») in ordine,
// l'ultima uguale a GAME_VERSION. Il Play Store rifiuta un caricamento con versionCode non più alto del precedente.
export function controllaStoriaVersioni(sorgente) {
  const attuale = /export const GAME_VERSION = '(\d+\.\d+\.\d+)'/.exec(sorgente ?? '')?.[1];
  if (!attuale) return ['src/versione.ts: GAME_VERSION mancante'];
  const elenco = [...sorgente.matchAll(/^\/\/ (\d+\.\d+\.\d+) – /gm)].map((m) => m[1]);
  const problemi = [];
  if (elenco.at(-1) !== attuale) problemi.push(`src/versione.ts: l'ultima versione commentata (${elenco.at(-1)}) non è GAME_VERSION ${attuale}`);
  for (let i = 0; i < elenco.length; i++) {
    const c = codiceVersione(elenco[i]);
    if (c === null) problemi.push(`versione ${elenco[i]}: fuori dalla regola del versionCode (minore e correzione 0-999)`);
    else if (i > 0 && c <= codiceVersione(elenco[i - 1])) problemi.push(`versionCode non crescente: ${elenco[i - 1]} → ${elenco[i]} (${codiceVersione(elenco[i - 1])} → ${c})`);
  }
  return problemi;
}

// Permessi: il gioco è offline. Ammessi senza discussione: il permesso interno che androidx.core aggiunge a ogni app
// (firma dell'app stessa, non chiede nulla all'utente). INTERNET è nel manifest di Capacitor: si segnala, non si boccia,
// finché la principale non decide (opzioni in coordination/handoffs/sviluppatrice/S-21-aab.md).
export const PERMESSI_AMMESSI = [/^[\w.]+\.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION$/];
export const PERMESSI_SEGNALATI = ['android.permission.INTERNET'];

export function leggiManifest(xml) {
  const attr = (nome) => new RegExp(`android:${nome}="([^"]*)"`).exec(xml)?.[1] ?? null;
  const permessi = [...xml.matchAll(/<uses-permission(?:-sdk-23)?\b[^>]*android:name="([^"]+)"/g)].map((m) => m[1]);
  return { versionCode: attr('versionCode'), versionName: attr('versionName'), permessi };
}

export function controllaManifest(xml, versione) {
  const m = leggiManifest(xml);
  const problemi = [];
  if (m.versionName !== versione) problemi.push(`manifest: versionName «${m.versionName}», atteso «${versione}» (GAME_VERSION)`);
  if (Number(m.versionCode) !== codiceVersione(versione)) problemi.push(`manifest: versionCode ${m.versionCode}, atteso ${codiceVersione(versione)}`);
  for (const p of m.permessi) {
    if (PERMESSI_SEGNALATI.includes(p) || PERMESSI_AMMESSI.some((r) => r.test(p))) continue;
    problemi.push(`manifest: permesso non necessario per un gioco offline: ${p}`);
  }
  return problemi;
}

export function segnalazioniManifest(xml) {
  return leggiManifest(xml).permessi.filter((p) => PERMESSI_SEGNALATI.includes(p));
}

export function controllaFileAab(percorso) {
  if (!percorso || !existsSync(percorso)) return [`AAB assente: ${percorso}`];
  const d = statSync(percorso).size;
  // Un AAB è uno zip: inizia con «PK».
  if (d < 1024 || readFileSync(percorso).subarray(0, 2).toString('latin1') !== 'PK') return [`AAB non valido: ${percorso} (${d} byte)`];
  return [];
}

const MANIFEST_PROVA = (codice, nome, permessi) => `<manifest xmlns:android="http://schemas.android.com/apk/res/android" android:versionCode="${codice}" android:versionName="${nome}" package="io.github.antoniovairo.valmora">\n${permessi.map((p) => `  <uses-permission android:name="${p}"/>`).join('\n')}\n</manifest>`;

export function bracciRossi() {
  const ciechi = [];
  const buono = "// 0.45.0 – a\n// 0.46.0 – b\nexport const GAME_VERSION = '0.46.0';";
  if (controllaStoriaVersioni(buono).length) ciechi.push('storia versioni: campione buono bocciato');
  if (!controllaStoriaVersioni("// 0.46.0 – a\n// 0.45.0 – b\nexport const GAME_VERSION = '0.45.0';").length) ciechi.push('storia versioni/decrescente è cieco');
  if (!controllaStoriaVersioni("// 0.46.0 – a\n// 0.46.0 – b\nexport const GAME_VERSION = '0.46.0';").length) ciechi.push('storia versioni/uguale è cieco');
  if (!controllaStoriaVersioni("// 0.46.0 – a\nexport const GAME_VERSION = '0.47.0';").length) ciechi.push('storia versioni/attuale non commentata è cieco');
  const perm = ['android.permission.INTERNET', 'io.github.antoniovairo.valmora.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'];
  if (controllaManifest(MANIFEST_PROVA(46000, '0.46.0', perm), '0.46.0').length) ciechi.push('manifest: campione buono bocciato');
  if (!controllaManifest(MANIFEST_PROVA(1, '1.0', perm), '0.46.0').length) ciechi.push('manifest/versione è cieco');
  if (!controllaManifest(MANIFEST_PROVA(46000, '0.46.0', [...perm, 'android.permission.ACCESS_NETWORK_STATE']), '0.46.0').length) ciechi.push('manifest/permesso di rete è cieco');
  if (!controllaManifest(MANIFEST_PROVA(46000, '0.46.0', [...perm, 'android.permission.CAMERA']), '0.46.0').length) ciechi.push('manifest/permesso estraneo è cieco');
  if (!controllaFileAab('/percorso/che/non/esiste.aab').length) ciechi.push('file AAB/assente è cieco');
  if (!controllaFileAab('package.json').length) ciechi.push('file AAB/non zip è cieco');
  return ciechi;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [aab, bundletool] = process.argv.slice(2);
  let problemi;
  if (aab === '--bracci-rossi') problemi = bracciRossi();
  else {
    const sorgente = readFileSync('src/versione.ts', 'utf8');
    const versione = /export const GAME_VERSION = '(\d+\.\d+\.\d+)'/.exec(sorgente)?.[1];
    problemi = [...controllaFileAab(aab), ...controllaStoriaVersioni(sorgente), ...bracciRossi()];
    if (!problemi.length) {
      const xml = execFileSync('java', ['-jar', bundletool, 'dump', 'manifest', `--bundle=${aab}`], { encoding: 'utf8' });
      const m = leggiManifest(xml);
      console.log(`AAB ${aab}: versionName ${m.versionName}, versionCode ${m.versionCode}; permessi: ${m.permessi.join(', ') || 'nessuno'}`);
      for (const p of segnalazioniManifest(xml)) console.log(`SEGNALATO (da decidere, non bocciato): ${p}`);
      problemi.push(...controllaManifest(xml, versione));
    }
  }
  for (const p of problemi) console.log(`✘ ${p}`);
  console.log(problemi.length ? `${problemi.length} problemi` : '✔ controllo AAB verde');
  process.exit(problemi.length ? 1 : 0);
}
