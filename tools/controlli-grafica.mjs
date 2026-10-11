// Controlli puri della catena «grafica».

const senzaCommenti = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const VIETATI = [
  [/#[0-9a-fA-F]{3,8}\b/, 'colore esadecimale'],
  [/\b(rgb|rgba|hsl|hsla)\(/, 'colore scritto a mano'],
  [/\b\d+(\.\d+)?(px|rem|em|vh|vw)\b/, 'misura scritta a mano'],
  [/\bstyle=\{/, 'stile in linea'],
];

// Colori, raggi e spaziature solo da src/resa/token.css (ISTRUZIONI_PO §8).
export function controllaToken(file) {
  const p = [];
  for (const [percorso, testo] of Object.entries(file)) {
    if (!percorso.startsWith('src/resa/') || percorso === 'src/resa/token.css' || !/\.(css|tsx|ts)$/.test(percorso)) continue;
    senzaCommenti(testo).split('\n').forEach((riga, i) => {
      for (const [re, cosa] of VIETATI) if (re.test(riga)) p.push(`${percorso}:${i + 1}: ${cosa} fuori dai token («${riga.trim().slice(0, 60)}»)`);
    });
  }
  return p;
}

// Misure raccolte dal browser per una larghezza: { larghezza, errori[], scorrimento[], passi[] }
export function controllaGiro(g) {
  const p = [];
  for (const e of g.errori) p.push(`${g.larghezza}px: errore di console: ${e}`);
  for (const s of g.scorrimento) p.push(`${g.larghezza}px: scorrimento orizzontale su «${s.schermata}» (${s.contenuto} > ${s.finestra})`);
  for (const x of g.attesi) if (!x.ok) p.push(`${g.larghezza}px: ${x.cosa}`);
  return p;
}

// PO-050: nessun indirizzo email in chiaro nel gioco pubblicato (dist/): si ricompone solo al tocco (src/resa/collegamenti.ts).
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
export function controllaEmail(file) {
  return Object.entries(file).filter(([, t]) => EMAIL.test(t)).map(([p, t]) => `${p}: indirizzo email in chiaro («${t.match(EMAIL)[0]}»)`);
}

