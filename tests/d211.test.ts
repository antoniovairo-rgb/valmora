// C-046 (D-211): guardiani dei rilievi C46-01, C46-02 e C46-05 (solo testi).
// D211-01 rosso __NO_D21101: i testi di prima di e36 imp_cassa offrono di nuovo «chiudi la festa» e «canta senza musica» dopo
//   chiudi_festa (C4504 esteso alle etichette), e imp_rotolo lascia «srotolato» il rotolo che la chiamata dopo porta «arrotolato».
// D211-02 rosso __NO_D21102: la Segreteria di e36 chiede di ricordare un'ordinanza mai nominata («Te la ricordi?»).
// D211-05 rosso __NO_D21105: in e05 più etichette «dallo speaker» nella stessa ondata.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { for (const k of ['D21101', 'D21102', 'D21105']) delete g[`__NO_${k}`]; });
const d = leggiDati() as Record<string, unknown>;
const ms = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione);
const prima = JSON.parse(readFileSync('tests/dati/d211-prima.json', 'utf8')) as Record<string, Record<string, Record<string, string>>>;
const testi = (f: string, rosso: string) => ({ ...(d[`testi/it/${f}.json`] as Record<string, string>), ...(g[`__NO_${rosso.replace('-', '')}`] ? prima[rosso]![f] ?? {} : {}) });
const tx = (t: Record<string, string>, k?: string) => t[(k ?? '').replace(/^testi:/, '')] ?? '';

describe('D211-01 un imprevisto non ripete l\'azione di una risposta data prima nella stessa ondata (C4504 esteso, C46-01)', () => {
  // radici (5 lettere) delle parole di almeno 4 lettere, tolte le parole di servizio e gli strumenti («speaker»): un'etichetta
  // d'imprevisto che ne condivide almeno 2 con l'etichetta di un'opzione precedente, o almeno 3 con etichetta + risposta,
  // ripete la stessa azione; l'imprevisto arriva sempre (imprevisti.ts:60), quindi deve reggere anche dopo quella scelta
  const VUOTE = new Set(['fai', 'fare', 'lascia', 'della', 'delle', 'dello', 'dalla', 'dallo', 'nella', 'nelle', 'sulla', 'sulle', 'sotto', 'senza', 'tutti', 'tutto', 'loro', 'dove', 'come', 'solo', 'ancora', 'prima', 'dopo', 'alla', 'alle', 'agli', 'degli', 'quella', 'quello', 'questa', 'questo', 'subito', 'resta', 'resto', 'correre', 'dell', 'speaker']);
  const radici = (s: string) => new Set((s.toLowerCase().match(/\p{L}+/gu) ?? []).filter((w) => w.length >= 4 && !VUOTE.has(w)).map((w) => w.slice(0, 5)));
  const ripetute = () => {
    const out: string[] = [];
    for (const m of ms) { const t = testi(m.id, 'D211-01');
      for (const o of m.ondate) { const ch = o.chiamate ?? []; ch.forEach((c, i) => { if (!c.imprevisto) return;
        for (const io of c.opzioni) { const ri = [...radici(tx(t, io.testo))];
          for (const p of ch.slice(0, i)) for (const op of p.opzioni) {
            const et = radici(tx(t, op.testo)), tutto = radici(`${tx(t, op.testo)} ${tx(t, op.risposta)}`);
            const a = ri.filter((r) => et.has(r)), b = ri.filter((r) => tutto.has(r));
            if (a.length >= 2 || b.length >= 3) out.push(`${m.id} ${c.id}/${io.id} ← ${p.id}/${op.id}: ${(a.length >= 2 ? a : b).join(',')}`);
          } }
      }); } }
    return out;
  };
  it('verde: 0 etichette d\'imprevisto che ripetono una risposta precedente in 36 episodi', () => { expect(ms.length).toBe(36); expect(ripetute()).toEqual([]); });
  it('rosso __NO_D21101: i testi di prima di e36 imp_cassa ripetono chiudi_festa', () => {
    g.__NO_D21101 = true;
    expect(ripetute()).toEqual(['e36 imp_cassa/chiudi_festa ← piazzale_ultimo/chiudi_festa: chiud,festa', 'e36 imp_cassa/a_cappella ← piazzale_ultimo/chiudi_festa: canta,piazz,music']);
  });
  // un imprevisto che viene prima di una chiamata non lascia un oggetto nello stato opposto a quello che la chiamata gli dà
  // (e36: il rotolo «srotolato» sotto l'arco, poi «coreografia arrotolata» giù dalla collina); conta lo stato finale della risposta
  const COPPIE: [string, string][] = [['arrotol', 'srotol'], ['chius', 'apert'], ['spent', 'acces'], ['fermat', 'ripart']];
  const fam = (w: string) => { const v = w.replace(/^ri/, ''); for (const [i, [a, b]] of COPPIE.entries()) { if (v.startsWith(a)) return `${i}a`; if (v.startsWith(b)) return `${i}b`; } return null; };
  const stati = (s: string) => (s.toLowerCase().match(/\p{L}+/gu) ?? []).map(fam).filter((x): x is string => !!x);
  const contrari = () => {
    const out: string[] = [];
    for (const m of ms) { const t = testi(m.id, 'D211-01');
      for (const o of m.ondate) { const ch = o.chiamate ?? []; ch.forEach((c, i) => { if (!c.imprevisto) return;
        for (const io of c.opzioni) { const fin = stati(tx(t, io.risposta)).pop(); if (!fin) continue; const opp = fin.slice(0, -1) + (fin.endsWith('a') ? 'b' : 'a');
          for (const p of ch.slice(i + 1)) { const sp = stati(tx(t, p.testo)); if (!p.imprevisto && sp.includes(opp) && !sp.includes(fin)) out.push(`${m.id} ${c.id}/${io.id} → ${p.id}`); } }
      }); } }
    return out;
  };
  it('verde: 0 imprevisti che smentiscono una chiamata successiva in 36 episodi', () => expect(contrari()).toEqual([]));
  it('rosso __NO_D21101: e36 imp_rotolo di prima lascia il rotolo srotolato', () => { g.__NO_D21101 = true; expect(contrari()).toEqual(['e36 imp_rotolo/srotola → coreografia_collina']); });
});

describe('D211-02 la Segreteria di e36 non chiede di ricordare un\'ordinanza mai nominata (C46-02)', () => {
  // il briefing (info falsa) e l'ondata 1 dicono «nessuna festa autorizzata»: l'ordinanza dell'ondata 4 è una rettifica, non un ricordo
  const ricordi = () => { const t = testi('e36', 'D211-02');
    return Object.entries(t).filter(([k, v]) => /^e36\.ch\./.test(k) && /ordinanza/i.test(`${v} ${t[k.replace(/\.vice$/, '')] ?? ''} ${t[`${k}.vice`] ?? ''}`) && /ricord/i.test(v)).map(([k]) => k);
  };
  it('verde: nessuna chiamata di e36 sull\'ordinanza fa appello al ricordo', () => expect(ricordi()).toEqual([]));
  it('rosso __NO_D21102: il testo di prima chiede «Te la ricordi?»', () => { g.__NO_D21102 = true; expect(ricordi()).toEqual(['e36.ch.piazzale_ultimo.vice']); });
});

describe('D211-05 nella stessa ondata al massimo un\'etichetta passa «dallo speaker» (C46-05)', () => {
  const gemelle = () => { const out: string[] = [];
    for (const m of ms) { const t = testi(m.id, 'D211-05');
      for (const o of m.ondate) { const n = (o.chiamate ?? []).flatMap((c) => c.opzioni).filter((op) => /dallo speaker/i.test(tx(t, op.testo))).length; if (n > 1) out.push(`${m.id} ondata ${o.n}: ${n}`); } }
    return out;
  };
  it('verde: 0 ondate con due etichette «dallo speaker» in 36 episodi', () => expect(gemelle()).toEqual([]));
  it('rosso __NO_D21105: in e05 ondata 2 i testi di prima ne hanno tre', () => { g.__NO_D21105 = true; expect(gemelle()).toEqual(['e05 ondata 2: 3']); });
});
