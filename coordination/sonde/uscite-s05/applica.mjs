import fs from 'node:fs';
const S = process.argv[2];
const L = new Set(JSON.parse(fs.readFileSync(`${S}/lista.json`, 'utf8')));
// regola 2: gemelle di e36 che condividono testo ed effetti del costo
for (const x of ['conti_procura/procura_frase_dura', 'conti_procura/procura_frase_neutra', 'conti_stampa/stampa_frase_dura', 'conti_stampa/stampa_frase_neutra', 'conti_comando/comando_frase_dura', 'conti_comando/comando_frase_neutra']) L.add(`e36/${x}`);
const nuovi = JSON.parse(fs.readFileSync(`${S}/nuovi.json`, 'utf8'));
let tolti = 0;
for (const f of fs.readdirSync('data/missioni').sort()) {
  const p = `data/missioni/${f}`; let s = fs.readFileSync(p, 'utf8'); const atteso = JSON.parse(s);
  for (const o of atteso.ondate) for (const c of o.chiamate ?? []) for (const op of c.opzioni) {
    if (!L.has(`${atteso.id}/${c.id}/${op.id}`)) continue;
    op.effetti = op.effetti.filter((e) => e.aggiungi !== 'credito');
    const ic = s.indexOf(`"id": "${c.id}"`); const io = s.indexOf(`"id": "${op.id}"`, ic);
    if (ic < 0 || io < 0) throw new Error(`non trovo ${c.id}/${op.id}`);
    const ie = s.indexOf('"effetti"', io); const ia = s.indexOf('"aggiungi": "credito"', ie);
    const a = s.lastIndexOf('{', ia); const b = s.indexOf('}', ia) + 1;
    // togli l'oggetto e una virgola adiacente (dopo, se c'è; altrimenti prima)
    let x = a, y = b; const dopo = s.slice(b).match(/^\s*,\s*/); 
    if (dopo) y = b + dopo[0].length; else { const prima = s.slice(0, a).match(/,\s*$/); if (prima) x = a - prima[0].length; }
    s = s.slice(0, x) + s.slice(y); tolti++;
  }
  if (JSON.stringify(JSON.parse(s)) !== JSON.stringify(atteso)) throw new Error(`${p}: risultato diverso dall'atteso`);
  fs.writeFileSync(p, s);
  const pt = `data/testi/it/${f}`; let t = fs.readFileSync(pt, 'utf8'); const tj = JSON.parse(t);
  for (const [k, v] of Object.entries(nuovi)) if (k.startsWith(atteso.id + '.')) { const vec = JSON.stringify(tj[k]); if (!t.includes(`${JSON.stringify(k)}: ${vec}`)) throw new Error(`testo ${k}`); t = t.replace(`${JSON.stringify(k)}: ${vec}`, `${JSON.stringify(k)}: ${JSON.stringify(v)}`); tj[k] = v; }
  if (JSON.stringify(JSON.parse(t)) !== JSON.stringify(tj)) throw new Error(pt); fs.writeFileSync(pt, t);
}
console.log('effetti tolti', tolti);
