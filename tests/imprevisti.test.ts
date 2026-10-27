// PO-022 (D-190): imprevisti. Uno per ondata, fuori ordine, senza tempo; innestati da data/imprevisti/ (src/dati/imprevisti.ts).
// Guardiani: innesto e rosso __NO_S14I01, controlli di significato (ciechi se rotti), nessuna fiducia, determinismo col seme,
// nessun soft-lock con ogni risposta, salvataggi veri di prima che proseguono con gli imprevisti.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { controllaImprevisti, innesta, type FileImprevisti, type Imprevisto } from '../src/dati/imprevisti.ts';
import { chiamateDellaPartita, semeDa } from '../src/logica/partita.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, giocaMissione, missioneFinita, opzioniValide, rispondi, schiera, type InCorso } from '../src/logica/missione.ts';
import type { Chiamata, Dichiarazione, Missione } from '../src/logica/tipi.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { migra } from '../src/salvataggi/salvataggio.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_S14I01; });
const d = leggiDati() as Record<string, unknown>;
const grezza = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;
const files = Object.entries(d).filter(([k]) => k.startsWith('imprevisti/')).map(([, v]) => v as FileImprevisti);
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());

describe('imprevisti (PO-022, D-190)', () => {
  it('ci sono: un mazzo per ondata (D-241), la carta classica nella posizione dei dati, le altre in coda', () => {
    expect(files.length).toBeGreaterThanOrEqual(6);
    for (const f of files) {
      const m = d[`missioni/${f.id}.json`] as Missione, prima = grezza(f.id);
      const classiche = f.imprevisti.filter((x, i) => f.imprevisti.findIndex((y) => y.ondata === x.ondata) === i);
      expect(classiche.length, f.id).toBe(m.ondate.length);
      for (const x of classiche) {
        const cs = m.ondate[x.ondata - 1]!.chiamate!, altre = f.imprevisti.filter((y) => y.ondata === x.ondata).length - 1;
        const varianti = (f.varianti ?? []).filter((y) => y.ondata === x.ondata).length;
        expect(cs[x.dopo!]!.id, `${f.id} ondata ${x.ondata}`).toBe(x.chiamata.id);
        expect(cs[x.dopo!]!.imprevisto).toBe(true);
        expect(cs.length).toBe((prima.ondate[x.ondata - 1]!.chiamate ?? []).length + 1 + altre + varianti);
      }
    }
  });
  it('innesto idempotente; braccio rosso __NO_S14I01: nessun imprevisto, missioni identiche ai file', () => {
    expect(innesta(d)).toEqual(d);
    g.__NO_S14I01 = true;
    const rosso = leggiDati() as Record<string, unknown>;
    for (const f of files) expect(rosso[`missioni/${f.id}.json`]).toEqual(grezza(f.id));
  });
  it('controlli di significato: verdi sui dati, rossi su ogni regola rotta (guardiano non cieco)', () => {
    expect(controllaImprevisti(d)).toEqual([]);
    const f = structuredClone(files[0]!), x = f.imprevisti[0]!;
    const rotto = (cambia: (y: FileImprevisti) => void) => { const y = structuredClone(f); cambia(y); return controllaImprevisti({ ...d, [`imprevisti/${f.id}.json`]: y }); };
    expect(rotto((y) => { y.imprevisti[0]!.chiamata.opzioni[0]!.effetti.push({ aggiungi: 'credito', valore: 1 }); }).join()).toMatch(/fiducia/);
    expect(rotto((y) => { y.imprevisti[0]!.chiamata.opzioni[0]!.effetti.push({ aggiungi: 'credito', valore: -1 }); })).toEqual([]); // toglierla si può
    expect(rotto((y) => { for (let i = 0; i < 3; i++) y.imprevisti.push({ ...structuredClone(y.imprevisti[0]!), chiamata: { ...structuredClone(y.imprevisti[0]!.chiamata), id: `imp_altra${i}` } }); }).join()).toMatch(/al massimo 3/);
    expect(rotto((y) => { y.imprevisti[0]!.dopo = 99; }).join()).toMatch(/interrompere/);
    expect(rotto((y) => { const u = y.imprevisti.at(-1)!; u.chiamata.opzioni[0]!.effetti.push({ riserva: 'steward', valore: -1 }); }).join()).toMatch(/ultima ondata/);
    expect(rotto((y) => { y.imprevisti[0]!.chiamata.id = grezza(f.id).ondate[0]!.chiamate![0]!.id; }).join()).toMatch(/già usato/);
    expect(rotto((y) => { y.imprevisti[0]!.chiamata.opzioni[0]!.se = {}; }).join()).toMatch(/condizioni/);
    expect(x.ondata).toBe(1);
  });
  it('deterministici col seme: la stessa partita due volte, e il bot risponde a un imprevisto per ondata (D-241: uno del mazzo)', () => {
    for (const f of files) for (const seme of [0, 1, 2, 3]) {
      const m = d[`missioni/${f.id}.json`] as Missione;
      const giro = () => giocaMissione(m, v0, dich, casuale(creaCaso(`${f.id}:${seme}`), dich), seme && semeDa(`${f.id}:${seme}`));
      const a = giro();
      expect(giro()).toEqual(a);
      expect(a.scelte.filter((s) => s.chiamata.startsWith('imp_')).length, f.id).toBe(m.ondate.length);
    }
  });
  it('nessun soft-lock: ogni risposta a ogni imprevisto porta a un esito', () => {
    const spente: string[] = [];
    for (const f of files) {
      const m = d[`missioni/${f.id}.json`] as Missione;
      // D-241: un seme di partita in cui arriva proprio questa carta del mazzo (la classica: seme 0)
      const semeCon = (x: Imprevisto) => { for (let i = 0; ; i++) { const s = i && semeDa(`softlock:${f.id}:${i}`); if (chiamateDellaPartita(m, m.ondate[x.ondata - 1]!, s).some((c) => c.id === x.chiamata.id)) return s; } };
      for (const x of f.imprevisti) for (const o of x.chiamata.opzioni) {
        const bot = attenta(creaCaso(1), dich);
        // se l'unità che l'opzione impegna è finita (D-153) l'opzione è spenta: resta sempre almeno un'opzione libera
        let spenta = false;
        const forza = { ...bot, scegli: (mm: Missione, s: InCorso, c: Chiamata) => {
          if (c.id !== x.chiamata.id) return bot.scegli(mm, s, c);
          const valide = opzioniValide(c, s, mm);
          expect(valide.length).toBeGreaterThan(0);
          if (valide.some((y) => y.id === o.id)) return o.id;
          spenta = true; return valide[0]!.id;
        } };
        const e = giocaMissione(m, v0, dich, forza, semeCon(x));
        expect(e.esito.id, `${f.id} ${x.chiamata.id}/${o.id}`).toBeTruthy();
        if (!spenta) expect(e.scelte.some((y) => y.chiamata === x.chiamata.id && y.opzione === o.id), `${f.id} ${x.chiamata.id}/${o.id}`).toBe(true);
        else spente.push(`${f.id} ${x.chiamata.id}/${o.id}`);
      }
    }
    console.log(`imprevisti: opzioni spente (unità finita, D-153) col bot attento: ${spente.length} — ${spente.join(', ')}`);
  });
  it('salvataggio vero della 0.4.0 (e02 a metà ondata 2): si migra e prosegue fino all\'esito, con l\'imprevisto', () => {
    const s = migra(JSON.parse(readFileSync('tests/salvataggi-reali/v2-0.4.0-e02-in-corso.json', 'utf8')));
    const m = d['missioni/e02.json'] as Missione;
    let ic = s.in_corso as InCorso; const bot = attenta(creaCaso(1), dich);
    expect(chiamateAperte(m, ic).map((c) => c.id)).toContain('imp_sciarpa');
    while (!missioneFinita(m, ic)) {
      if (!ic.disposizione) ic = schiera(m, ic, bot.schiera(m, ic));
      for (let c = chiamateAperte(m, ic)[0]; c; c = chiamateAperte(m, ic)[0]) ic = rispondi(m, ic, c.id, bot.scegli(m, ic, c), dich);
      ic = chiudiOndata(m, ic, dich);
    }
    expect(ic.scelte.some((x) => x.chiamata === 'imp_sciarpa')).toBe(true);
    expect(concludiMissione(m, ic, dich).esito.id).toBeTruthy();
  });
});
