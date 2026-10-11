// Validazione di SIGNIFICATO (docs/FASE0_PROPOSTA.md §F0-2, «Controlli automatici»): ciò che uno
// schema JSON da solo non può vedere. Si esegue solo su file già validi nella struttura.
// Fuori da qui, perché servono la simulazione o dati che non esistono ancora (L2):
// raggiungibilità da e01, tappe garantite in tutti i percorsi, lista delle parole vietate.

type Obj = Record<string, any>; // forma già garantita dallo schema
interface Variabile { id: string; tipo: 'bool' | 'int' | 'enum'; min?: number; max?: number; valori?: string[]; iniziale: unknown }

const tipoCompatibile = (v: Variabile, x: unknown): string | null => {
  if (v.tipo === 'bool') return typeof x === 'boolean' ? null : 'serve un booleano';
  if (v.tipo === 'int') {
    if (!Number.isInteger(x)) return 'serve un intero';
    return (x as number) < v.min! || (x as number) > v.max! ? `fuori da [${v.min}, ${v.max}]` : null;
  }
  return typeof x === 'string' && v.valori!.includes(x) ? null : `serve uno di ${v.valori!.join('/')}`;
};

export function validaSemantica(file: Record<string, unknown>): string[] {
  const p: string[] = [];
  const voci = (prefisso: string) => Object.entries(file).filter(([k]) => k.startsWith(prefisso)) as [string, Obj][];

  // Variabili dichiarate
  const variabili = new Map<string, Variabile>();
  for (const v of ((file['stato.json'] as Obj | undefined)?.variabili ?? []) as Variabile[]) {
    if (variabili.has(v.id)) p.push(`stato.json: variabile «${v.id}» dichiarata due volte`);
    variabili.set(v.id, v);
    if (v.tipo === 'int' && v.min! > v.max!) p.push(`stato.json: «${v.id}» ha min > max`);
    else if (v.tipo === 'enum' && !v.valori!.includes(v.iniziale as string)) p.push(`stato.json: «${v.id}» iniziale fuori da valori`);
    else if (v.tipo === 'int' && tipoCompatibile(v, v.iniziale)) p.push(`stato.json: «${v.id}» iniziale ${tipoCompatibile(v, v.iniziale)}`);
  }

  const condizione = (dove: string, c: Obj): void => {
    if (c.tutte) return c.tutte.forEach((x: Obj, i: number) => condizione(`${dove}.tutte[${i}]`, x));
    if (c.almeno_una) return c.almeno_una.forEach((x: Obj, i: number) => condizione(`${dove}.almeno_una[${i}]`, x));
    if (c.non) return condizione(`${dove}.non`, c.non);
    if (!('var' in c)) return; // {} = sempre vera
    const v = variabili.get(c.var);
    if (!v) return void p.push(`${dove}: variabile «${c.var}» non dichiarata in stato.json`);
    if ('uguale' in c) {
      const e = v.tipo === 'int' && Number.isInteger(c.uguale) ? null : tipoCompatibile(v, c.uguale);
      if (e) p.push(`${dove}: «${c.var}» uguale ${JSON.stringify(c.uguale)}: ${e}`);
    } else if (v.tipo !== 'int') p.push(`${dove}: almeno/al_massimo su «${c.var}», che non è int`);
  };
  const effetto = (dove: string, e: Obj): void => {
    const id = e.imposta ?? e.aggiungi;
    const v = variabili.get(id);
    if (!v) return void p.push(`${dove}: variabile «${id}» non dichiarata in stato.json`);
    if ('aggiungi' in e && v.tipo !== 'int') p.push(`${dove}: aggiungi su «${id}», che non è int`);
    if ('imposta' in e) { const err = tipoCompatibile(v, e.valore); if (err) p.push(`${dove}: imposta «${id}»: ${err}`); }
  };
  const sempreVera = (c: Obj | undefined) => !c || Object.keys(c).length === 0;

  // Testi
  const testi = new Set<string>();
  for (const [k, t] of voci('testi/it/')) for (const chiave of Object.keys(t)) {
    if (testi.has(chiave)) p.push(`${k}: chiave «${chiave}» già definita in un altro file`);
    testi.add(chiave);
  }
  const testo = (dove: string, rif: string) => {
    if (!testi.has(rif.replace(/^testi:/, ''))) p.push(`${dove}: testo «${rif}» non esiste in data/testi/it/`);
  };

  // Missioni
  const fili = new Set(voci('fili/').map(([, f]) => f.id as string));
  const missioni = voci('missioni/');
  const episodi = new Map<number, string>();
  for (const [k, m] of missioni) {
    if (episodi.has(m.episodio)) p.push(`${k}: episodio ${m.episodio} già usato da ${episodi.get(m.episodio)}`);
    episodi.set(m.episodio, k);
    testo(`${k}.titolo`, m.titolo);
    condizione(`${k}.disponibile_se`, m.disponibile_se);
    m.briefing.forEach((b: Obj, i: number) => testo(`${k}.briefing[${i}]`, b.testo));
    const settori = m.mappa.settori.map((s: Obj) => s.id as string);
    if (new Set(settori).size !== settori.length) p.push(`${k}.mappa.settori: id di settore ripetuto`);
    // Etichette per convenzione: settore.<id>, risorsa.<id>, fonte.<id> (D-041)
    for (const id of settori) testo(`${k}.mappa.settori`, `testi:settore.${id}`);
    for (const id of Object.keys(m.mappa.risorse)) testo(`${k}.mappa.risorse`, `testi:risorsa.${id}`);
    for (const b of m.briefing) testo(`${k}.briefing`, `testi:fonte.${b.fonte}`);
    for (const e of m.esiti) testo(`${k}.esiti`, `testi:esito.${e.id}`);
    m.ondate.forEach((o: Obj, i: number) => {
      if (o.titolo) testo(`${k}.ondate[${i}].titolo`, o.titolo);
      if (o.n !== i + 1) p.push(`${k}.ondate[${i}]: n=${o.n}, attesa ${i + 1}`);
      o.eventi.forEach((ev: Obj, j: number) => {
        if (!settori.includes(ev.settore)) p.push(`${k}.ondate[${i}].eventi[${j}]: settore «${ev.settore}» non è nella mappa`);
        if (ev.se) condizione(`${k}.ondate[${i}].eventi[${j}].se`, ev.se);
      });
    });
    m.esiti.forEach((e: Obj, i: number) => {
      condizione(`${k}.esiti[${i}].se`, e.se);
      e.effetti.forEach((x: Obj, j: number) => effetto(`${k}.esiti[${i}].effetti[${j}]`, x));
      testo(`${k}.esiti[${i}].verbale`, e.verbale);
    });
    if (!sempreVera(m.esiti.at(-1)?.se)) p.push(`${k}: l'ultimo esito non ha condizione vuota (missione senza uscita garantita)`);
    for (const f of m.fili) if (!fili.has(f)) p.push(`${k}: filo «${f}» non esiste in data/fili/`);
  }

  // Fili. Tappe e indizi possono citare episodi non ancora scritti: l'esistenza si controlla nel
  // grafo narrativo (L2). «compare_in» con almeno 2 episodi diversi lo garantisce già lo schema.
  for (const [k, f] of voci('fili/')) {
    f.tappe.forEach((t: Obj, i: number) => {
      t.forme?.forEach((x: Obj, j: number) => condizione(`${k}.tappe[${i}].forme[${j}].se`, x.se));
      if (t.garantita && t.forme && !sempreVera(t.forme.at(-1).se)) p.push(`${k}.tappe[${i}]: tappa garantita senza forma finale a condizione vuota`);
    });
  }

  // Club, personaggi, soprannomi
  for (const [k, x] of [...voci('club/'), ...voci('personaggi/')]) testo(`${k}.nome`, x.nome);
  ((file['soprannomi.json'] as Obj | undefined)?.soprannomi ?? []).forEach((s: Obj, i: number) => {
    testo(`soprannomi.json[${i}]`, s.testo);
    if (s.se) condizione(`soprannomi.json[${i}].se`, s.se);
  });
  return p;
}
