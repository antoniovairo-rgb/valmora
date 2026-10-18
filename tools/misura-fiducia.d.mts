export interface Opzione { chiave: string; n: number; nAltre: number; nominale: number; deltaMedio: number; falliteSe: number; falliteAltre: number; z: number; tensioneSe: number; tensioneAltre: number }
export function perverseRapide(dati: Record<string, unknown>, semi?: number): Opzione[];
export function datiD160(dati: Record<string, unknown>, tolte: Record<string, number>): Record<string, unknown>;
export function correlazioniCasuale(dati: Record<string, unknown>, semi?: number): Record<string, number | null>;
export function deltaFallite(dati: Record<string, unknown>, semi?: number): Record<string, number | null>;
