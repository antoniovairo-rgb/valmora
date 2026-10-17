// PO-121 (D-148): la risposta in sospeso. Annullata non lascia traccia (stato identico, chiamata ancora aperta con le
// stesse opzioni); confermata è identica a rispondi; non vale più se nel frattempo lo stato è cambiato. Per ogni chiamata
// di ogni episodio, giocando col bot attento.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../src/logica/missione.ts';
import { decidi, sospendi, valida } from '../src/logica/sospesa.ts';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);

describe('PO-121: risposta in sospeso, annullabile', () => {
  it('su ogni chiamata di ogni episodio: annullata = niente, confermata = rispondi', () => {
    let provate = 0;
    for (const m of ms) {
      const g = attenta(creaCaso(1), dich);
      let s = iniziaMissione(m, v0, dich);
      while (!missioneFinita(m, s)) {
        if (!s.disposizione) { s = schiera(m, s, g.schiera(m, s)); continue; }
        const c = chiamateAperte(m, s)[0];
        if (!c) { s = chiudiOndata(m, s, dich); continue; }
        const o = g.scegli(m, s, c);
        const prima = structuredClone(s), opzioni = opzioniValide(c, s, m).map((x) => x.id);
        const p = sospendi(m, s, c.id, o);
        // annullata: lo stesso oggetto, nessun campo toccato (riserve, variabili, scelte, risposte), la chiamata è ancora lì
        const a = decidi(m, s, p, 'annullata', dich);
        expect(a).toBe(s); expect(a).toEqual(prima);
        expect(chiamateAperte(m, a).map((x) => x.id)).toContain(c.id);
        expect(opzioniValide(c, a, m).map((x) => x.id)).toEqual(opzioni);
        // confermata: identica a rispondi
        const conf = decidi(m, s, p, 'confermata', dich);
        expect(conf).toEqual(rispondi(m, structuredClone(prima), c.id, o, dich));
        // dopo la conferma la stessa scelta in sospeso non vale più (niente doppia conferma)
        expect(valida(conf, p)).toBe(false);
        expect(() => decidi(m, conf, p, 'confermata', dich)).toThrow();
        s = conf; provate++;
      }
    }
    expect(provate).toBeGreaterThan(400);
  });

  it('non si sospende una chiamata chiusa o un\'opzione che non c\'è', () => {
    const m = ms.find((x) => x.id === 'e01')!, g = attenta(creaCaso(1), dich), s0 = iniziaMissione(m, v0, dich);
    const s = schiera(m, s0, g.schiera(m, s0));
    const c = chiamateAperte(m, s)[0]!;
    expect(() => sospendi(m, s, 'non_esiste', 'x')).toThrow();
    expect(() => sospendi(m, s, c.id, 'non_esiste')).toThrow();
  });
});
