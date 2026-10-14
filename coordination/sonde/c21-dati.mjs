// C-021 (sola lettura): elenchi per la lettura di PO-102 (colori dei cortei per strada) e D-112 p.5 (gruppo della
// vignetta di ogni chiamata). Ricalcola dai dati, senza la resa, la stessa regola del codice:
// colori: src/resa/mappa/sfondo.ts:121 (club della strada, altrimenti curva omonima, altrimenti neutro);
// cortei: src/resa/mappa/folla.ts (IN_STRADA, ondata di partita senza cortei);
// gruppo: src/resa/vignette-evento.tsx:10-27 (GRUPPI, GRAVITA, eventi del settore nell'ondata, «se» ignorato).
// Uso: node coordination/sonde/c21-dati.mjs colori|vignette|json
import fs from 'node:fs';
const T = {}; for (const f of fs.readdirSync('data/testi/it')) Object.assign(T, JSON.parse(fs.readFileSync('data/testi/it/' + f)));
const tx = (k) => (k ? (k.startsWith('testi:') ? T[k.slice(6)] ?? `?${k}` : k) : '');
const M = fs.readdirSync('data/missioni').sort().map((f) => JSON.parse(fs.readFileSync('data/missioni/' + f)));
const GRUPPI = { folla: 'gente', raduno: 'gente', assembramento: 'gente', movimento: 'gente', arrivo: 'gente', deflusso: 'gente', fuga: 'gente',
  curva: 'tifo', festa: 'tifo', cerimonia: 'tifo', corteo: 'corteo', protesta: 'corteo', picchetto: 'corteo', presidio: 'corteo',
  furgone: 'veicoli', sosta: 'veicoli', traffico: 'veicoli', retata: 'veicoli', rissa: 'scontro', lite: 'scontro', faida: 'scontro', minaccia: 'scontro',
  biglietti: 'biglietti', incendio: 'fumo' };
const GRAVITA = ['scontro', 'fumo', 'corteo', 'tifo', 'veicoli', 'biglietti', 'gente'];
const IN_STRADA = new Set(['corteo', 'arrivo', 'deflusso', 'folla', 'raduno', 'movimento', 'fuga']);
const modo = process.argv[2] ?? 'colori';
const out = [];
for (const m of M) {
  const settori = m.mappa.settori, curve = settori.filter((s) => s.tipo === 'curva'), strade = settori.filter((s) => s.tipo === 'strada');
  if (modo === 'colori') {
    for (const s of strade) {
      const omonima = curve.find((c) => c.id === `curva_${s.id.replace(/^[a-z]+_/, '')}`);
      const origine = s.club ? `${s.club} (club della strada)` : omonima ? `${omonima.club} (curva omonima)` : 'neutro';
      const cortei = m.ondate.map((o, k) => {
        const partita = o.eventi.some((e) => e.tipo === 'curva');
        const ev = o.eventi.filter((e) => e.settore === s.id && IN_STRADA.has(e.tipo));
        return !partita && ev.length ? `o${o.n}:${ev.map((e) => e.tipo + (e.se ? '(se)' : '')).join('+')}` : null;
      }).filter(Boolean);
      console.log(`\n## ${m.id} ${s.id} → ${origine} · cortei ${cortei.join(' ') || 'nessuno'}`);
      for (const b of m.briefing) if (b.settore === s.id) console.log(`  B[${b.fonte}${b.vera ? '' : ',falsa'}] ${tx(b.testo)}`);
      for (const o of m.ondate) for (const c of o.chiamate ?? []) if (c.settore === s.id) console.log(`  o${o.n} ${c.id}[${c.fonte}] ${tx(c.testo)}`);
    }
  } else {
    for (const o of m.ondate) for (const c of o.chiamate ?? []) {
      const ev = c.settore ? o.eventi.filter((e) => e.settore === c.settore) : [];
      const g = GRAVITA.find((x) => ev.some((e) => GRUPPI[e.tipo] === x)) ?? null;
      const gSenzaSe = GRAVITA.find((x) => ev.some((e) => !e.se && GRUPPI[e.tipo] === x)) ?? null;
      const tipo = settori.find((s) => s.id === c.settore)?.tipo ?? '-';
      const r = { ep: m.id, n: o.n, id: c.id, settore: c.settore ?? '-', tipo, eventi: ev.map((e) => e.tipo + (e.se ? '(se)' : '')).join('+'), gruppo: g, gSenzaSe, testo: tx(c.testo) };
      out.push(r);
      if (modo === 'vignette') console.log(`${r.ep} o${r.n} ${r.id} ${r.settore}:${r.tipo} [${r.eventi}] → ${g ?? '—'}${g !== gSenzaSe ? ` (senza «se»: ${gSenzaSe ?? '—'})` : ''} | ${r.testo}`);
    }
  }
}
if (modo === 'json') console.log(JSON.stringify(out));
