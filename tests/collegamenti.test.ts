// PO-050: il link «Idee e segnalazioni» porta all'indirizzo giusto, con la versione nel testo.
import { describe, expect, it } from 'vitest';
import { mailIdee, URL_DONAZIONE } from '../src/resa/collegamenti.ts';

describe('sostieni il progetto (PO-050)', () => {
  it('mailto verso l\'indirizzo del team, con oggetto e versione', () => {
    const m = mailIdee('9.9.9');
    expect(m.startsWith('mailto:korward.devteam@gmail.com?subject=')).toBe(true);
    expect(decodeURIComponent(m)).toContain('Versione 9.9.9');
  });
  it('donazione: il link PayPal del PO', () => expect(URL_DONAZIONE).toBe('https://paypal.me/elevoraCPM'));
});
