// Controlli puri della catena «logica» (come controlli.mjs: materiale in ingresso → elenco problemi).

export const RIGHE_MAX = 400;
const CODICE = /\.(ts|tsx|mjs|js)$/;
const senzaCommenti = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

// file: { percorso: testo } – percorsi relativi alla radice del repo
export function controllaConfini(file) {
  const p = [];
  for (const [percorso, testo] of Object.entries(file)) {
    if (!CODICE.test(percorso)) continue;
    const righe = testo.split('\n').length - (testo.endsWith('\n') ? 1 : 0);
    if (righe > RIGHE_MAX) p.push(`${percorso}: ${righe} righe (massimo ${RIGHE_MAX})`);
    if (!percorso.startsWith('src/')) continue;
    const codice = senzaCommenti(testo);
    if (!percorso.startsWith('src/resa/') && /\bfrom\s+['"][^'"]*\/resa(\/|['"])/.test(codice)) p.push(`${percorso}: importa da src/resa (vietato fuori dalla resa)`);
    if (percorso.startsWith('src/logica/') && /\bMath\.random\b/.test(codice)) p.push(`${percorso}: Math.random nel percorso deterministico (usa src/logica/caso.ts)`);
  }
  return p;
}

// Ogni versione vecchia (1…SAVE_VERSION-1) ha almeno un salvataggio vero; tutti si migrano.
// salvataggi: { nomeFile: contenuto }; migra: funzione di src/salvataggi
export function controllaSalvataggiReali(saveVersion, salvataggi, migra) {
  const p = [];
  for (let v = 1; v < saveVersion; v++) {
    if (!Object.keys(salvataggi).some((n) => n.startsWith(`v${v}-`))) p.push(`manca un salvataggio reale v${v} in tests/salvataggi-reali/`);
  }
  for (const [nome, s] of Object.entries(salvataggi)) {
    try { migra(s); } catch (e) { p.push(`${nome}: ${e.message}`); }
  }
  return p;
}
