// PO-086 / C-017: «se il mercato lo chiudo dopo non mi puoi dire che la bancarella ha subito danni». Le chiamate e le
// opzioni possono dipendere dalle scelte già fatte («dopo»: mai/gia «chiamata/opzione»); un'unità già tutta impegnata non
// si offre di nuovo (C17-03). Rossi __NO_PO086 e __NO_C17R03.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../src/logica/missione.ts';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_PO086; delete g.__NO_C17R03; });

// [episodio, scelta forzata «chiamata/opzione», chiamata o «chiamata/opzione» che dopo quella scelta non deve comparire, variabili]
const CASI: [string, string, string, Record<string, string>?][] = [
  ['e04', 'arance/chiudi_mercato', 'verdura'], ['e04', 'arance/chiudi_mercato', 'casalinghi'], ['e04', 'verdura/sgombera', 'casalinghi'],
  ['e04', 'arance/chiudi_mercato', 'risultato'], ['e06', 'bis/niente_bis', 'risultato'], ['e06', 'bis/bis_lungo', 'risultato'],
  ['e09', 'pullman_fermi/scarica_pullman', 'rigore9'], ['e09', 'pullman_fermi/scarica_pullman', 'contro_tutti'],
  ['e10', 'patto_trasferta/fidati10', 'fumo_pareggio', { rapporto_dessi: 'rispetto' }], ['e03', 'cartelloni/promessa', 'silenzio_np'],
  ['e02', 'corteo_viale/mediatore_corteo', 'caldo_casa/mediatore_casa'], ['e07', 'banda/mediatore_banda', 'primo_gol/mediatore_festa'],
  // C-018: bancarella dopo il mercato chiuso, lite in coda dopo lo scarico, favore all'impresa dopo il bis deciso.
  ['e04', 'arance/chiudi_mercato', 'banco_calzini'], ['e09', 'pullman_fermi/scarica_pullman', 'lite_coda'],
  ['e06', 'bis/niente_bis', 'favore_impresa'], ['e06', 'bis/bis_lungo', 'favore_impresa'],
];

const contraddizioni = (n = 40) => {
  let fatte = 0, viste = 0;
  for (const [ep, scelta, vietata, extra] of CASI) {
    const m = d[`missioni/${ep}.json`] as Missione; const [sc, so] = scelta.split('/'); const [vc, vo] = vietata.split('/');
    for (let k = 0; k < n; k++) {
      const caso = creaCaso(`po086:${ep}:${k}`); const att = attenta(caso, dich); let fatta = false;
      let s = iniziaMissione(m, { ...v0, ...(extra ?? {}) }, dich);
      while (!missioneFinita(m, s)) {
        s = schiera(m, s, att.schiera(m, s));
        for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
          const ops = opzioniValide(c, s, m);
          if (fatta && c.id === vc && (!vo || ops.some((o) => o.id === vo))) viste++;
          const o = c.id === sc ? ops.find((x) => x.id === so) : undefined;
          if (o) { fatta = true; fatte++; }
          s = rispondi(m, s, c.id, (o ?? caso.scegli(ops)).id, dich);
        }
        s = chiudiOndata(m, s, dich);
      }
    }
  }
  return { fatte, viste };
};

describe('le scelte fatte cambiano ciò che succede dopo (PO-086)', () => {
  it('dopo la scelta, nessuna chiamata o opzione che la contraddice', () => {
    const x = contraddizioni(); console.log(`PO-086: scelte forzate ${x.fatte}, contraddizioni viste dopo ${x.viste}`);
    expect(x.fatte).toBeGreaterThan(300); expect(x.viste).toBe(0);
  });
  it('braccio rosso __NO_PO086 + __NO_C17R03: tornano le contraddizioni', () => {
    g.__NO_PO086 = true; g.__NO_C17R03 = true; expect(contraddizioni(10).viste).toBeGreaterThan(50);
  });
  it('ogni «dopo» punta a una chiamata e un\'opzione che esistono in un\'ondata precedente o nella stessa', () => {
    const rotti: string[] = [];
    for (const m of ms) for (const [i, o] of m.ondate.entries()) for (const c of o.chiamate ?? []) for (const x of [c.dopo, ...c.opzioni.map((y) => y.dopo)]) for (const k of [...(x?.mai ?? []), ...(x?.gia ?? [])]) {
      const [kc, ko] = k.split('/');
      const ok = m.ondate.slice(0, i + 1).some((oo) => (oo.chiamate ?? []).some((cc) => cc.id === kc && cc.opzioni.some((y) => y.id === ko)));
      if (!ok) rotti.push(`${m.id}/${c.id}: ${k}`);
    }
    expect(rotti).toEqual([]);
  });
});
