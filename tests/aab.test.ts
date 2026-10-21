// D-212 (PO-144): regola del versionCode di rilascio e bracci rossi del controllo dell'AAB (tools/aab.mjs).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bracciRossi, codiceVersione, controllaStoriaVersioni } from '../tools/aab.mjs';
import { GAME_VERSION } from '../src/versione.ts';

describe('AAB di rilascio (D-212)', () => {
  it('versionCode dalla regola maggiore*1000000 + minore*1000 + correzione', () => {
    expect(codiceVersione('0.46.0')).toBe(46000);
    expect(codiceVersione('1.0.0')).toBe(1000000);
    expect(codiceVersione('0.1000.0')).toBeNull();
    expect(codiceVersione(GAME_VERSION)).toBeGreaterThan(0);
  });
  it('le versioni di src/versione.ts hanno versionCode crescente', () => {
    expect(controllaStoriaVersioni(readFileSync('src/versione.ts', 'utf8'))).toEqual([]);
  });
  it('ogni controllo vede il suo difetto (bracci rossi)', () => {
    expect(bracciRossi()).toEqual([]);
  });
});
