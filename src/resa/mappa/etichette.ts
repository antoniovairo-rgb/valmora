// Disposizione dei nomi e delle unità sulla mappa (C-008, N01 di C-007): per ogni settore si provano le
// posizioni possibili, misurate nel DOM, e si tiene la prima che non tocca niente. Ostacoli: i punti dei
// settori (44×44), i nomi già messi, le aree di tocco delle unità già messe e i bordi della mappa (margine 5 px).
// Nessun numero di pixel scritto qui: le posizioni stanno in stile.css ([data-nome], [data-unita]).

type Rett = { left: number; top: number; right: number; bottom: number };
const MARGINE = 5; // distanza minima dal bordo della mappa (controllo R06 di tools/foto.mjs)
const STACCO = 6;  // distacco minimo fra due nomi: attaccati sembrerebbero un nome solo
const largo = (r: Rett, d: number): Rett => ({ left: r.left - d, top: r.top - d, right: r.right + d, bottom: r.bottom + d });
const VERA = 100; // una sovrapposizione vera pesa molto più di un distacco mancante fra due nomi
const NOMI = ['sotto', 'sopra', 'destra', 'sinistra', 'sotto-sx', 'sotto-dx'] as const;
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
