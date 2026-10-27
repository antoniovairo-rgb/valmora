export interface Diversita { missione: string; coppie: number; diverse: number; quota: number }
export function sequenza(m: unknown, dich: unknown, iniziali: unknown, seme: number): string;
export function diversita(dati: Record<string, unknown>, coppie?: number): Diversita[];
export function partite(dati: Record<string, unknown>, semi?: number): { missione: string; stagione: number; blocchi: string[]; prima: Record<string, number>; dopo: Record<string, number> }[];
