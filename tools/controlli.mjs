// Controlli della catena «governo». Ogni controllo è una funzione pura che riceve
// il materiale da esaminare e restituisce l'elenco dei problemi (vuoto = verde).
// Così ogni guardiano si può provare anche su materiale difettoso (braccio rosso).

export const DOCUMENTI_OBBLIGATORI = {
  'CLAUDE.md': ['## Verità', '## Governo'],
  'docs/governo/ROADMAP.md': ['# Roadmap', '## Registro delle release'],
  'docs/governo/BACKLOG.md': ['# Backlog', '| id | data | testo del PO | tipo | stato e prova | lotto | versione | guardiano | fonte |'],
  'docs/governo/DECISIONI.md': ['# Decisioni', '## Zone congelate', '## Registro'],
  'docs/governo/COLLAUDI.md': ['# Collaudi'],
  'docs/RELEASE_HISTORY.md': ['# Storia delle release'],
};

// file: { percorso: testo | null }
export function controllaDocumenti(file) {
  const problemi = [];
  for (const [percorso, intestazioni] of Object.entries(DOCUMENTI_OBBLIGATORI)) {
    const testo = file[percorso];
    if (testo == null) { problemi.push(`${percorso}: manca`); continue; }
    for (const i of intestazioni) if (!testo.includes(i)) problemi.push(`${percorso}: manca «${i}»`);
  }
  return problemi;
}

const TIPI = ['difetto', 'miglioramento', 'nuova funzione', 'processo', 'debito tecnico'];
const STATI = ['IN CODA', 'IN CORSO', 'PARZIALE', 'ATTENDE IL PO', 'FATTO', 'REGOLA', 'DOPPIONE', 'REVOCATA']; // PO-138: REGOLA = direttiva sempre attiva; ATTENDE IL PO = aperta, ferma su una prova o scelta del PO

export function righeBacklog(testo) {
  return testo.split('\n')
    .filter((r) => /^\|\s*PO-/.test(r))
    .map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
}

export function controllaBacklog(testo) {
  const problemi = [];
  const visti = new Set();
  for (const c of righeBacklog(testo)) {
    const id = c[0];
    if (c.length !== 9) { problemi.push(`${id}: ${c.length} colonne invece di 9`); continue; }
    if (!/^PO-\d{3}$/.test(id)) problemi.push(`${id}: id non nel formato PO-000`);
    if (visti.has(id)) problemi.push(`${id}: id doppio`);
    visti.add(id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c[1])) problemi.push(`${id}: data non nel formato AAAA-MM-GG`);
    if (!TIPI.includes(c[3])) problemi.push(`${id}: tipo «${c[3]}» non ammesso`);
    if (!STATI.some((s) => c[4].startsWith(s))) problemi.push(`${id}: stato «${c[4]}» non ammesso`);
    if (c[4].startsWith('FATTO') && !c[4].includes('–')) problemi.push(`${id}: FATTO senza prova`);
  }
  return problemi;
}

const SEGRETI = [/\.jks$/i, /\.keystore$/i, /keystore\.properties$/i, /google-services.*\.json$/i,
  /play-service-account.*\.json$/i, /(^|\/)\.env(\..*)?$/i];

// percorsi: elenco dei file tracciati da git
export function controllaSegreti(percorsi) {
  return percorsi.filter((p) => SEGRETI.some((re) => re.test(p))).map((p) => `${p}: file segreto nel repository`);
}

// Identificativi del modello: nomi con numero di versione, id tecnici, righe di coautore.
// «Claude Code» (il nome dello strumento) è ammesso.
const MODELLO = /Co-Authored-By:\s*Claude|claude-(opus|sonnet|haiku|fable)|\b(Opus|Sonnet|Haiku|Fable) \d/i;

// testi: { origine: testo }
export function controllaModello(testi) {
  const problemi = [];
  for (const [origine, testo] of Object.entries(testi)) {
    testo.split('\n').forEach((riga, n) => {
      if (MODELLO.test(riga)) problemi.push(`${origine}:${n + 1}: identificativo del modello`);
    });
  }
  return problemi;
}

// Versione (PO-032): GAME_VERSION è a tre numeri e ha la sua riga di commento «// x.y.z – …» (causa, misura, guardiano).
export function controllaVersione(sorgente) {
  const v = /export const GAME_VERSION = '(\d+\.\d+\.\d+)'/.exec(sorgente ?? '')?.[1];
  if (!v) return ['src/versione.ts: GAME_VERSION mancante o non a tre numeri'];
  return sorgente.includes(`// ${v} – `) ? [] : [`src/versione.ts: la versione ${v} non ha la sua riga di commento (causa, misura, guardiano)`];
}
