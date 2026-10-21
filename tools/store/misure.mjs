// PO-144 (S-23): guardiano della scheda Play Store. Legge le immagini dai byte (intestazioni PNG e JPEG, nessuna
// dipendenza npm, così gira nella catena «governo») e i testi da store/it-IT/testi.json.
// Requisiti letti il 2026-10-21 (curl, HTTP 200, ?hl=en):
// - https://support.google.com/googleplay/android-developer/answer/9866151: icona «32-bit PNG (with alpha)»,
//   «512px by 512px», «Maximum file size: 1024KB»; grafica «JPEG or 24-bit PNG (no alpha)», «1024px by 500px»;
//   schermate «JPEG or 24-bit PNG (no alpha)», lato fra 320 e 3840 px, il lato lungo al massimo il doppio del corto;
//   per i giochi «three 9:16 portrait screenshots (minimum 1080x1920px)»; descrizione breve «80 character limit»,
//   senza emoji, simboli (★ ☆) né punteggiatura ripetuta.
// - https://support.google.com/googleplay/android-developer/answer/9859152: nome «30 character limit»,
//   descrizione completa «4000 character limit».
// - Peso massimo delle schermate: 8 MB lo dice la pagina solo per Android Automotive OS («up to 8 MB each»): per il
//   telefono Non posso confermarlo; la soglia qui sotto (8 MB) è una scelta prudente, dichiarata.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const CARTELLA_STORE = 'store/it-IT';
export const LIMITI = { nome: 30, breve: 80, completa: 4000 };
export const ICONA = { lato: 512, kb: 1024 };
export const GRAFICA = { larghezza: 1024, altezza: 500 };
export const SCHERMATE = { minimo: 3, larghezza: 1080, altezza: 1920, kb: 8192 };
const SIMBOLI_VIETATI = /[\u{1F000}-\u{1FAFF}☀-➿★☆…]|!!|\?!|!\?|--|\*\*\*|~~|\n/u;

/** Intestazione di un PNG o JPEG: { tipo, larghezza, altezza, alfa, bit } oppure { errore }. */
export function leggiImmagine(b) {
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47 && b.toString('ascii', 12, 16) === 'IHDR') {
    const bit = b[24], colore = b[25]; // colore 6 = RGBA, 2 = RGB, 4 = grigio + alfa
    return { tipo: 'png', larghezza: b.readUInt32BE(16), altezza: b.readUInt32BE(20), alfa: colore === 6 || colore === 4, bit: bit * ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colore] ?? 0) };
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length;) {
      if (b[i] !== 0xff) return { errore: 'JPEG malformato' };
      const mk = b[i + 1], lun = b.readUInt16BE(i + 2);
      if (mk >= 0xc0 && mk <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(mk)) return { tipo: 'jpeg', altezza: b.readUInt16BE(i + 5), larghezza: b.readUInt16BE(i + 7), alfa: false, bit: b[i + 4] * b[i + 9] };
      i += 2 + lun;
    }
    return { errore: 'JPEG senza SOF' };
  }
  return { errore: 'né PNG né JPEG' };
}

const caratteri = (s) => [...(s ?? '')].length;

/** Problemi dei testi della scheda. */
export function controllaTesti(t) {
  const p = [];
  if (!t || typeof t !== 'object') return ['testi.json mancante o non è un oggetto'];
  for (const [k, max] of Object.entries(LIMITI)) {
    const n = caratteri(t[k]);
    if (!n) p.push(`testo «${k}» vuoto`);
    else if (n > max) p.push(`testo «${k}»: ${n} caratteri, limite ${max}`);
  }
  if (SIMBOLI_VIETATI.test(t.breve ?? '')) p.push('descrizione breve con emoji, simboli, a capo o punteggiatura ripetuta (answer 9866151)');
  if (SIMBOLI_VIETATI.test(t.nome ?? '')) p.push('nome con emoji, simboli o punteggiatura ripetuta');
  return p;
}

/** Problemi delle immagini: file = { nome: Buffer }. */
export function controllaImmagini(file) {
  const p = [], kb = (b) => Math.ceil(b.length / 1024);
  const icona = file['icona.png'];
  if (!icona) p.push('manca icona.png');
  else {
    const i = leggiImmagine(icona);
    if (i.errore || i.tipo !== 'png' || !i.alfa || i.bit !== 32) p.push(`icona.png: serve PNG a 32 bit con alfa, è ${i.errore ?? `${i.tipo} a ${i.bit} bit${i.alfa ? ' con alfa' : ' senza alfa'}`}`);
    if (i.larghezza !== ICONA.lato || i.altezza !== ICONA.lato) p.push(`icona.png: ${i.larghezza}×${i.altezza}, serve ${ICONA.lato}×${ICONA.lato}`);
    if (kb(icona) > ICONA.kb) p.push(`icona.png: ${kb(icona)} KB, massimo ${ICONA.kb}`);
  }
  const graf = Object.keys(file).filter((n) => /^grafica\./.test(n));
  if (graf.length !== 1) p.push(`grafica in evidenza: ${graf.length} file, ne serve 1`);
  for (const n of graf) {
    const i = leggiImmagine(file[n]);
    if (i.errore || i.alfa || i.bit !== 24) p.push(`${n}: serve JPEG o PNG a 24 bit senza alfa, è ${i.errore ?? `${i.tipo} a ${i.bit} bit${i.alfa ? ' con alfa' : ''}`}`);
    if (i.larghezza !== GRAFICA.larghezza || i.altezza !== GRAFICA.altezza) p.push(`${n}: ${i.larghezza}×${i.altezza}, serve ${GRAFICA.larghezza}×${GRAFICA.altezza}`);
  }
  const sch = Object.keys(file).filter((n) => /^schermata-\d+\./.test(n));
  if (sch.length < SCHERMATE.minimo) p.push(`schermate: ${sch.length}, ne servono almeno ${SCHERMATE.minimo}`);
  for (const n of sch) {
    const i = leggiImmagine(file[n]);
    if (i.errore || i.alfa || i.bit !== 24) p.push(`${n}: serve JPEG o PNG a 24 bit senza alfa, è ${i.errore ?? `${i.tipo} a ${i.bit} bit${i.alfa ? ' con alfa' : ''}`}`);
    if (i.larghezza !== SCHERMATE.larghezza || i.altezza !== SCHERMATE.altezza) p.push(`${n}: ${i.larghezza}×${i.altezza}, serve ${SCHERMATE.larghezza}×${SCHERMATE.altezza} (9:16 verticale)`);
    if (kb(file[n]) > SCHERMATE.kb) p.push(`${n}: ${kb(file[n])} KB, soglia ${SCHERMATE.kb}`);
  }
  return p;
}

const NOMI = ['icona.png', 'grafica.jpg', 'grafica.png', 'schermata-1.jpg', 'schermata-2.jpg', 'schermata-3.jpg', 'schermata-4.jpg', 'schermata-5.jpg'];

/** Il passo della catena: immagini e testi in CARTELLA_STORE. */
export function controllaStore(dir = CARTELLA_STORE) {
  const file = Object.fromEntries(NOMI.filter((n) => existsSync(join(dir, n))).map((n) => [n, readFileSync(join(dir, n))]));
  let testi = null;
  try { testi = JSON.parse(readFileSync(join(dir, 'testi.json'), 'utf8')); } catch { /* controllaTesti lo segnala */ }
  return [...controllaImmagini(file), ...controllaTesti(testi)];
}

/** Bracci rossi: campioni difettosi ricavati da quelli veri; ogni guardiano deve vederli. */
export function storeCiechi(dir = CARTELLA_STORE) {
  const ciechi = [], f = (n) => readFileSync(join(dir, n));
  const vero = { 'icona.png': f('icona.png'), 'grafica.jpg': f('grafica.jpg'), ...Object.fromEntries([1, 2, 3, 4].map((k) => [`schermata-${k}.jpg`, f(`schermata-${k}.jpg`)])) };
  const conIcona = (b) => ({ ...vero, 'icona.png': b });
  const largo = Buffer.from(vero['icona.png']); largo.writeUInt32BE(1024, 16);
  const senzaAlfa = Buffer.from(vero['icona.png']); senzaAlfa[25] = 2;
  const pesante = Buffer.concat([vero['icona.png'], Buffer.alloc(1025 * 1024)]);
  if (!controllaImmagini(conIcona(largo)).length) ciechi.push('store: icona 1024 px non vista');
  if (!controllaImmagini(conIcona(senzaAlfa)).length) ciechi.push('store: icona senza alfa non vista');
  if (!controllaImmagini(conIcona(pesante)).length) ciechi.push('store: icona oltre 1024 KB non vista');
  const { 'grafica.jpg': _g, ...senzaGrafica } = vero;
  if (!controllaImmagini({ ...senzaGrafica, 'grafica.png': vero['icona.png'] }).length) ciechi.push('store: grafica con alfa e misura sbagliata non vista');
  const bassa = Buffer.from(vero['schermata-1.jpg']), i = leggiImmagine(bassa);
  for (let k = 2; k + 9 < bassa.length; k += 2 + bassa.readUInt16BE(k + 2)) if (bassa[k + 1] >= 0xc0 && bassa[k + 1] <= 0xc3) { bassa.writeUInt16BE(i.altezza / 3, k + 5); break; }
  if (!controllaImmagini({ ...vero, 'schermata-1.jpg': bassa }).length) ciechi.push('store: schermata 1080×640 non vista');
  const { 'schermata-4.jpg': _s, 'schermata-3.jpg': _t, ...due } = vero;
  if (!controllaImmagini(due).length) ciechi.push('store: solo 2 schermate non viste');
  const t = JSON.parse(readFileSync(join(dir, 'testi.json'), 'utf8'));
  if (!controllaTesti({ ...t, breve: 'x'.repeat(81) }).length) ciechi.push('store: descrizione breve di 81 caratteri non vista');
  if (!controllaTesti({ ...t, nome: 'x'.repeat(31) }).length) ciechi.push('store: nome di 31 caratteri non visto');
  if (!controllaTesti({ ...t, completa: 'x'.repeat(4001) }).length) ciechi.push('store: descrizione completa di 4001 caratteri non vista');
  if (!controllaTesti({ ...t, breve: 'Gioco ★ offline' }).length) ciechi.push('store: simbolo nella descrizione breve non visto');
  return ciechi;
}

// Da solo: node tools/store/misure.mjs [cartella] → tabella delle misure e problemi.
if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2] ?? CARTELLA_STORE;
  for (const n of NOMI.filter((x) => existsSync(join(dir, x)))) {
    const b = readFileSync(join(dir, n)), i = leggiImmagine(b);
    console.log(`${n}\t${i.tipo}\t${i.larghezza}×${i.altezza}\t${i.bit} bit\talfa ${i.alfa ? 'sì' : 'no'}\t${b.length} B (${Math.ceil(b.length / 1024)} KB)`);
  }
  try { const t = JSON.parse(readFileSync(join(dir, 'testi.json'), 'utf8')); for (const k of Object.keys(LIMITI)) console.log(`testo ${k}\t${caratteri(t[k])}/${LIMITI[k]} caratteri`); } catch { console.log('testi.json assente'); }
  const p = controllaStore(dir);
  console.log(p.length ? p.map((x) => `✘ ${x}`).join('\n') : '✔ nessun problema');
  process.exit(p.length ? 1 : 0);
}
