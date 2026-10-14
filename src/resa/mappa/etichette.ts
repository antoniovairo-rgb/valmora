// Disposizione dei nomi e delle unità sulla mappa (C-008, N01 di C-007): per ogni settore si provano le
// posizioni possibili, misurate nel DOM, e si tiene la prima che non tocca niente. Ostacoli: i punti dei
// settori (44×44), i nomi già messi, le aree di tocco delle unità già messe e i bordi della mappa (margine 5 px).
// Nessun numero di pixel scritto qui: le posizioni stanno in stile.css ([data-nome], [data-unita]).

import { spento } from '../../interruttori.ts';

type Rett = { left: number; top: number; right: number; bottom: number };
const MARGINE = 5; // distanza minima dal bordo della mappa (controllo R06 di tools/foto.mjs)
const STACCO = 6;  // distacco minimo fra due nomi: attaccati sembrerebbero un nome solo
const largo = (r: Rett, d: number): Rett => ({ left: r.left - d, top: r.top - d, right: r.right + d, bottom: r.bottom + d });
const VERA = 100; // una sovrapposizione vera pesa molto più di un distacco mancante fra due nomi
const NOMI = ['sotto', 'sopra', 'destra', 'sinistra', 'sotto-sx', 'sotto-dx', 'sopra-sx', 'sopra-dx'] as const;
const UNITA = ['sopra', 'destra', 'sinistra', 'destra-alto', 'sinistra-alto', 'sotto'] as const;

const area = (a: Rett, b: Rett) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
const fuori = (r: Rett, m: Rett) => {
  const dentro = { left: m.left + MARGINE, top: m.top + MARGINE, right: m.right - MARGINE, bottom: m.bottom - MARGINE };
  return (r.right - r.left) * (r.bottom - r.top) - area(r, dentro);
};
const unione = (els: Element[]): Rett | null => {
  const rs = els.map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height);
  if (!rs.length) return null;
  return { left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)), right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)) };
};

/** Sceglie fra i posti possibili quello con meno sovrapposizioni (i bordi pesano di più); a parità, il primo. */
type Ostacolo = { vero: Rett; largo: Rett };
const ostacolo = (r: Rett, d = 0): Ostacolo => ({ vero: r, largo: largo(r, d) });

function piazza(el: HTMLElement, attributo: string, posti: readonly string[], misura: () => Rett | null, ostacoli: Ostacolo[], mappa: Rett): Rett | null {
  let migliore = { posto: posti[0]!, costo: Infinity };
  for (const posto of posti) {
    el.setAttribute(attributo, posto);
    const r = misura();
    if (!r) return null;
    const costo = ostacoli.reduce((a, o) => a + VERA * area(r, o.vero) + area(r, o.largo) - area(r, o.vero), 0) + VERA * 10 * fuori(r, mappa);
    if (costo < migliore.costo) migliore = { posto, costo };
    if (costo === 0) break;
  }
  el.setAttribute(attributo, migliore.posto);
  return misura();
}

export function disponiEtichette(contenitore: HTMLElement) {
  const mappa = contenitore.getBoundingClientRect();
  const settori = [...contenitore.querySelectorAll<HTMLElement>('[data-settore]')];
  const punti = settori.map((s) => s.querySelector('.settore-punto')!.getBoundingClientRect() as Rett);
  const nomeDi = (s: HTMLElement) => s.querySelector('.settore-nome')?.getBoundingClientRect() ?? null;
  const unitaDi = (s: HTMLElement) => { const g = s.querySelector('.settore-unita'); return g ? unione([...g.children]) : null; };
  // 1) i nomi da soli, evitando i punti degli altri settori e i nomi già messi
  const nomi: Rett[] = [];
  for (const s of settori) {
    const nome = s.querySelector('.settore-nome');
    if (!nome) continue;
    const r = piazza(s, 'data-nome', NOMI, () => nome.getBoundingClientRect(), [...punti.filter((_, j) => settori[j] !== s).map((r) => ostacolo(r)), ...nomi.map((n) => ostacolo(n, STACCO))], mappa);
    if (r) nomi.push(r);
  }
  // 1b) C15-04: i nomi insieme, cercando la combinazione migliore fra tutte (la ricerca uno alla volta si ferma
  //     in un minimo locale, e25 a 360). Rosso C34N01: niente, come prima.
  if (!spento('C34N01')) migliorCombinazione(settori, punti, mappa);
  // con nessuna unità sulla mappa (sala, briefing) la combinazione migliore è già quella finale
  if (!contenitore.querySelector('.settore-unita') && !spento('C34N01')) return;
  // 2) nome e unità insieme (6 × 6 combinazioni; solo il nome per i settori senza unità), si tiene quella che costa meno
  //    (due passate, così anche i primi settori vedono dove sono finiti gli ultimi).
  //    Nome contro: punti, nomi e unità degli altri settori. Unità contro: tutti i punti (anche il proprio),
  //    nomi e unità degli altri, il proprio nome. I bordi pesano 10 volte.
  for (let passata = 0; passata < 2; passata++) for (const [i, s] of settori.entries()) {
    if (!s.querySelector('.settore-nome')) continue;
    const conUnita = !!s.querySelector('.settore-unita');
    const altri = settori.filter((x) => x !== s);
    const presenti = (rs: (Rett | null)[]) => rs.filter((r): r is Rett => !!r);
    const perNome = [...punti.filter((_, j) => j !== i).map((r) => ostacolo(r)), ...presenti(altri.map(nomeDi)).map((n) => ostacolo(n, STACCO)), ...presenti(altri.map(unitaDi)).map((r) => ostacolo(r))];
    const perUnita = [...punti, ...presenti(altri.map(nomeDi)), ...presenti(altri.map(unitaDi))].map((r) => ostacolo(r));
    const costoDi = (r: Rett, os: Ostacolo[]) => os.reduce((a, o) => a + VERA * area(r, o.vero) + area(r, o.largo) - area(r, o.vero), 0);
    let migliore = { nome: NOMI[0] as string, unita: UNITA[0] as string, costo: Infinity };
    cerca: for (const nome of NOMI) for (const unita of conUnita ? UNITA : [UNITA[0]]) {
      s.setAttribute('data-nome', nome); s.setAttribute('data-unita', unita);
      const n = nomeDi(s), u = conUnita ? unitaDi(s) : null;
      if (!n || (conUnita && !u)) continue;
      const costo = costoDi(n, perNome) + VERA * 10 * fuori(n, mappa)
        + (u ? costoDi(u, perUnita) + VERA * area(n, u) + VERA * 10 * fuori(u, mappa) : 0);
      if (costo < migliore.costo) migliore = { nome, unita, costo };
      if (costo === 0) break cerca;
    }
    s.setAttribute('data-nome', migliore.nome); s.setAttribute('data-unita', migliore.unita);
  }
}

/** C17-12: nella città il nome dell'episodio scelto va al posto che non copre gli altri dischi né le loro stelle.
 *  Vicino al bordo nessun posto sta dentro la mappa (e01 in alto a sinistra): il nome si sposta verso l'interno
 *  quanto basta (--nome-dx/--nome-dy, misurati qui, non scritti a mano) e il costo si conta già spostato.
 *  C20-03: con tutti gli episodi conclusi a 360/375 nessuno degli 8 posti è libero; si provano anche piccoli
 *  spostamenti (griglia di passo pari a un ottavo del disco, fino a un disco) e vince il posto libero col minimo
 *  spostamento. Rosso C44N01: solo gli 8 posti, come prima. */
export function disponiNomeCitta(contenitore: HTMLElement) {
  const s = contenitore.querySelector<HTMLElement>('[data-episodio].acceso'), nome = s?.querySelector<HTMLElement>('.settore-nome');
  if (!s || !nome) return;
  const m = contenitore.getBoundingClientRect();
  // i dischi pesano dieci volte le stelline: se proprio non c'è un posto libero, il nome copre stelline, non dischi
  const altri = [...contenitore.querySelectorAll('[data-episodio]')].filter((x) => x !== s)
    .flatMap((x) => [...x.querySelectorAll('.settore-punto, .settore-unita')]).map((e) => ({ ...ostacolo(e.getBoundingClientRect(), STACCO), peso: e.classList.contains('settore-punto') && !spento('C44N01') ? 10 : 1 }));
  const sposta = (dx: number, dy: number) => { nome.style.setProperty('--nome-dx', `${dx}px`); nome.style.setProperty('--nome-dy', `${dy}px`); };
  const dentro = (a: number, b: number, min: number, max: number) => (a < min ? min - a : b > max ? max - b : 0);
  const disco = s.querySelector('.settore-punto')?.getBoundingClientRect().width ?? 0;
  const passo = disco / 8, giri = spento('C44N01') || !passo ? 0 : 8;
  const scarti = Array.from({ length: 2 * giri + 1 }, (_, k) => (k - giri) * passo).sort((a, b) => Math.abs(a) - Math.abs(b));
  // anche più stretto (va a capo su più righe): larghezza massima intera, 80% e 65% di --nome-max
  const larghezze = spento('C44N01') ? [''] : ['', 'calc(var(--nome-max) * 0.8)', 'calc(var(--nome-max) * 0.65)', 'calc(var(--nome-max) * 0.5)'];
  let migliore = { posto: NOMI[0] as string, dx: 0, dy: 0, costo: Infinity, largo: '' };
  sposta(0, 0);
  for (const largo of larghezze) for (const posto of NOMI) {
    nome.style.maxWidth = largo;
    s.setAttribute('data-nome', posto);
    const r = nome.getBoundingClientRect();
    for (const ox of scarti) for (const oy of scarti) {
      const a = { left: r.left + ox, right: r.right + ox, top: r.top + oy, bottom: r.bottom + oy };
      const dx = ox + dentro(a.left, a.right, m.left + MARGINE, m.right - MARGINE), dy = oy + dentro(a.top, a.bottom, m.top + MARGINE, m.bottom - MARGINE);
      const q = { left: r.left + dx, right: r.right + dx, top: r.top + dy, bottom: r.bottom + dy };
      const costo = altri.reduce((c, o) => c + o.peso * VERA * area(q, o.vero) + area(q, o.largo) - area(q, o.vero), 0) + Math.abs(dx) + Math.abs(dy);
      if (costo < migliore.costo) migliore = { posto, dx, dy, costo, largo };
    }
  }
  nome.style.maxWidth = migliore.largo; s.setAttribute('data-nome', migliore.posto); sposta(migliore.dx, migliore.dy);
}

/** Costo di una disposizione dei soli nomi: sovrapposizioni con nomi (col distacco) e punti degli altri, bordi. */
export function costoNomi(r: Rett[], punti: Rett[], mappa: Rett): number {
  let c = 0;
  for (let i = 0; i < r.length; i++) {
    c += VERA * 10 * fuori(r[i]!, mappa);
    for (let j = 0; j < punti.length; j++) if (j !== i) c += VERA * area(r[i]!, punti[j]!);
    for (let j = 0; j < i; j++) { const v = area(r[i]!, r[j]!); c += VERA * v + area(r[i]!, largo(r[j]!, STACCO)) - v; }
  }
  return c;
}

/** Ricerca con taglio (al più 200 000 nodi): per ogni settore la posizione del nome, misurata una volta nel DOM. */
function migliorCombinazione(settori: HTMLElement[], punti: Rett[], mappa: Rett) {
  const conNome = settori.map((s, i) => [s, i] as const).filter(([s]) => s.querySelector('.settore-nome'));
  const rett = conNome.map(([s]) => { const prima = s.getAttribute('data-nome'); const rs = NOMI.map((n) => { s.setAttribute('data-nome', n); return s.querySelector('.settore-nome')!.getBoundingClientRect() as Rett; }); if (prima) s.setAttribute('data-nome', prima); return rs; });
  const solo = conNome.map(([, i], a) => rett[a]!.map((r) => VERA * 10 * fuori(r, mappa) + punti.reduce((c, p, j) => c + (j === i ? 0 : VERA * area(r, p)), 0)));
  const attuale = conNome.map(([s]) => Math.max(0, NOMI.indexOf(s.getAttribute('data-nome') as typeof NOMI[number])));
  const costoDi = (sc: number[]) => sc.reduce((c, k, a) => c + solo[a]![k]! + sc.slice(0, a).reduce((d, kk, b) => { const x = rett[a]![k]!, y = rett[b]![kk]!, v = area(x, y); return d + VERA * v + area(x, largo(y, STACCO)) - v; }, 0), 0);
  let migliore = { c: costoDi(attuale), s: attuale }, nodi = 0;
  const scelta: number[] = [];
  const giu = (a: number, c: number) => {
    if (c >= migliore.c || ++nodi > 200000) return;
    if (a === conNome.length) { migliore = { c, s: [...scelta] }; return; }
    for (let k = 0; k < NOMI.length; k++) {
      let d = solo[a]![k]!;
      for (let b = 0; b < a; b++) { const x = rett[a]![k]!, y = rett[b]![scelta[b]!]!, v = area(x, y); d += VERA * v + area(x, largo(y, STACCO)) - v; }
      scelta[a] = k; giu(a + 1, c + d);
    }
  };
  giu(0, 0);
  conNome.forEach(([s], a) => s.setAttribute('data-nome', NOMI[migliore.s[a]!]!));
}
